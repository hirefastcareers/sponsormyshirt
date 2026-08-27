/**
 * Server-side Vemetric analytics queries for the public stats bar.
 * Requires VEMETRIC_API_KEY (Settings → API Keys in the Vemetric dashboard).
 */

const VEMETRIC_QUERY_URL = "https://api.vemetric.com/v1/analytics/query";

type VemetricDateRange = "live" | "24hrs";

type VemetricMetrics = {
  users: number;
  pageviews: number;
};

type VemetricQueryResponse = {
  data?: Array<{
    metrics?: Partial<VemetricMetrics>;
  }>;
};

function parseMetrics(payload: VemetricQueryResponse): VemetricMetrics {
  const metrics = payload.data?.[0]?.metrics ?? {};
  return {
    users: Number(metrics.users ?? 0),
    pageviews: Number(metrics.pageviews ?? 0),
  };
}

async function queryVemetricMetrics(
  apiKey: string,
  dateRange: VemetricDateRange,
): Promise<VemetricMetrics> {
  const res = await fetch(VEMETRIC_QUERY_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      dateRange,
      metrics: ["users", "pageviews"],
    }),
    cache: "no-store",
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(
      `[vemetric] query failed (${res.status})${detail ? `: ${detail}` : ""}`,
    );
  }

  const json = (await res.json()) as VemetricQueryResponse;
  return parseMetrics(json);
}

export type VemetricPublicStats = {
  liveUsers: number;
  visitors24h: number;
  pageviews24h: number;
};

export async function fetchVemetricPublicStats(): Promise<VemetricPublicStats | null> {
  const apiKey = process.env.VEMETRIC_API_KEY?.trim();
  if (!apiKey) return null;

  try {
    const [live, last24h] = await Promise.all([
      queryVemetricMetrics(apiKey, "live"),
      queryVemetricMetrics(apiKey, "24hrs"),
    ]);

    return {
      liveUsers: live.users,
      visitors24h: last24h.users,
      pageviews24h: last24h.pageviews,
    };
  } catch (err) {
    console.error(err);
    return null;
  }
}
