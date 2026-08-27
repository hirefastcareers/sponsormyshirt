/**
 * GET  /api/visits — read current totalViews (no increment)
 * POST /api/visits — increment once per session; cookie dedupes rapid repeats
 */
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

const VISIT_COOKIE = "visit_recorded";
/** Short-lived guard against duplicate POSTs from refreshes or retries. */
const VISIT_COOKIE_MAX_AGE = 5 * 60;

async function getSiteViews(): Promise<number | null> {
  const admin = getSupabaseAdmin();

  const { data, error } = await admin
    .from("site_views")
    .select("total_views")
    .eq("id", 1)
    .maybeSingle();

  if (error) {
    console.error("[visits] fetch failed:", error.message);
    return null;
  }

  const totalViews = Number(data?.total_views ?? 0);
  return Number.isFinite(totalViews) && totalViews >= 0 ? totalViews : null;
}

function visitRecordedResponse(totalViews: number) {
  return NextResponse.json({ totalViews, recorded: false });
}

function visitIncrementedResponse(totalViews: number) {
  const res = NextResponse.json({ totalViews, recorded: true });
  res.cookies.set(VISIT_COOKIE, "1", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: VISIT_COOKIE_MAX_AGE,
  });
  return res;
}

export async function GET() {
  try {
    const totalViews = await getSiteViews();

    if (totalViews === null) {
      return NextResponse.json(
        { error: "Could not load view count" },
        { status: 500 }
      );
    }

    return NextResponse.json({ totalViews });
  } catch (err) {
    console.error("[visits] Unexpected GET error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST() {
  try {
    const cookieStore = await cookies();

    if (cookieStore.get(VISIT_COOKIE)?.value) {
      const totalViews = await getSiteViews();

      if (totalViews === null) {
        return NextResponse.json(
          { error: "Could not load view count" },
          { status: 500 }
        );
      }

      return visitRecordedResponse(totalViews);
    }

    const admin = getSupabaseAdmin();
    const { data, error } = await admin.rpc("increment_site_views");

    if (error) {
      console.error("[visits] increment failed:", error.message);
      return NextResponse.json(
        { error: "Could not record visit" },
        { status: 500 }
      );
    }

    const totalViews = typeof data === "number" ? data : Number(data);

    if (!Number.isFinite(totalViews) || totalViews < 0) {
      return NextResponse.json(
        { error: "Invalid view count" },
        { status: 500 }
      );
    }

    return visitIncrementedResponse(totalViews);
  } catch (err) {
    console.error("[visits] Unexpected POST error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
