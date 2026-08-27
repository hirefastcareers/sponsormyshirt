/**
 * POST /api/visits
 *
 * Atomically increments the site view counter in Supabase and returns
 * { totalViews }. Used by the header VisitorCounter on page mount.
 */
import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export async function POST() {
  try {
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

    return NextResponse.json({ totalViews });
  } catch (err) {
    console.error("[visits] Unexpected error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
