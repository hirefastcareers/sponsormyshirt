/**
 * POST /api/upload
 *
 * Accepts a multipart logo file and stores it in the `sponsor-logos` bucket.
 * Returns { path, publicUrl } for the checkout flow metadata.
 */
import { NextResponse } from "next/server";
import {
  getSponsorLogoPublicUrl,
  getSupabaseAdmin,
} from "@/lib/supabase-admin";

const ALLOWED_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/svg+xml",
]);

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json(
        {
          error:
            "Unsupported file type. Use PNG, JPEG, WebP, or SVG.",
        },
        { status: 400 }
      );
    }

    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        { error: "File too large (max 5 MB)" },
        { status: 400 }
      );
    }

    const ext =
      file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") ||
      "png";
    const path = `${Date.now()}-${crypto.randomUUID()}.${ext}`;

    const admin = getSupabaseAdmin();
    const buffer = Buffer.from(await file.arrayBuffer());

    const { error } = await admin.storage
      .from("sponsor-logos")
      .upload(path, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (error) {
      console.error("[upload] Storage error:", error.message);
      return NextResponse.json(
        { error: "Failed to upload logo" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      path,
      publicUrl: getSponsorLogoPublicUrl(path),
    });
  } catch (err) {
    console.error("[upload] Unexpected error:", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
