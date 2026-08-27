/**
 * GET /api/vemetric/stats — public-facing Vemetric totals for the stats bar.
 */
import { NextResponse } from "next/server";
import { fetchVemetricPublicStats } from "@/lib/vemetric-stats";

export const dynamic = "force-dynamic";

export async function GET() {
  const stats = await fetchVemetricPublicStats();

  if (!stats) {
    return NextResponse.json(
      { error: "Vemetric stats unavailable" },
      { status: 503 },
    );
  }

  return NextResponse.json(stats, {
    headers: {
      "Cache-Control": "no-store",
    },
  });
}
