/**
 * POST /api/upload
 *
 * Accepts a multipart logo file and stores it in the `sponsor-logos` bucket
 * using the Supabase service role (bypasses Storage RLS).
 * Returns { path, publicUrl } for the checkout flow metadata.
 */
import { NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  getSponsorLogoPublicUrl,
  getSupabaseAdmin,
} from "@/lib/supabase-admin";

export const runtime = "nodejs";

const ALLOWED_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/svg+xml",
]);

const EXT_TO_TYPE: Record<string, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  webp: "image/webp",
  svg: "image/svg+xml",
};

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB
const BUCKET = "sponsor-logos";

function fileExtension(name: string): string {
  return (
    name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "png"
  );
}

/** Prefer browser MIME; fall back to extension (Windows often sends empty type). */
function resolveContentType(file: File): string | null {
  if (file.type && ALLOWED_TYPES.has(file.type)) return file.type;
  const fromExt = EXT_TO_TYPE[fileExtension(file.name)];
  return fromExt ?? null;
}

async function ensureSponsorLogosBucket(admin: SupabaseClient) {
  const { data: buckets, error: listError } = await admin.storage.listBuckets();
  if (listError) {
    console.warn("[upload] listBuckets:", listError.message);
    return;
  }

  if (buckets?.some((b) => b.name === BUCKET)) return;

  const { error } = await admin.storage.createBucket(BUCKET, {
    public: true,
    fileSizeLimit: MAX_BYTES,
    allowedMimeTypes: [...ALLOWED_TYPES],
  });

  if (error && !/already exists/i.test(error.message)) {
    console.warn("[upload] createBucket:", error.message);
  }
}

export async function POST(request: Request) {
  try {
    if (
      !process.env.NEXT_PUBLIC_SUPABASE_URL ||
      !process.env.SUPABASE_SERVICE_ROLE_KEY
    ) {
      console.error(
        "[upload] Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY",
      );
      return NextResponse.json(
        {
          error:
            "Server misconfigured: Supabase service credentials are missing. Check .env.local and restart next dev.",
        },
        { status: 503 },
      );
    }

    const formData = await request.formData();
    const entry = formData.get("file");

    if (!(entry instanceof Blob) || entry.size === 0) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Next.js gives File; treat as File when available for .name / .type
    const file = entry as File;
    const contentType = resolveContentType(file);

    if (!contentType) {
      return NextResponse.json(
        {
          error: "Unsupported file type. Use PNG, JPEG, WebP, or SVG.",
        },
        { status: 400 },
      );
    }

    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        { error: "File too large (max 5 MB)" },
        { status: 400 },
      );
    }

    const ext = fileExtension(file.name || `logo.${contentType.split("/")[1]}`);
    const path = `${Date.now()}-${crypto.randomUUID()}.${ext}`;

    const admin = getSupabaseAdmin();
    await ensureSponsorLogosBucket(admin);

    const buffer = Buffer.from(await file.arrayBuffer());

    const { error } = await admin.storage.from(BUCKET).upload(path, buffer, {
      contentType,
      upsert: false,
    });

    if (error) {
      console.error("[upload] Storage error:", error.message);
      return NextResponse.json(
        { error: `Failed to upload logo: ${error.message}` },
        { status: 500 },
      );
    }

    return NextResponse.json({
      path,
      publicUrl: getSponsorLogoPublicUrl(path),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Upload failed";
    console.error("[upload] Unexpected error:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
