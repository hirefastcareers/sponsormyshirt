"use client";

/**
 * Thin stats strip under the main nav — live Vemetric visitors and 24h totals.
 */
import { useEffect, useState } from "react";

type VemetricStats = {
  liveUsers: number;
  visitors24h: number;
  pageviews24h: number;
};

const POLL_MS = 30_000;

function formatCount(value: number): string {
  return value.toLocaleString("en-GB");
}

function Dot() {
  return (
    <span aria-hidden className="text-zinc-300">
      ·
    </span>
  );
}

export default function VemetricStatsBar() {
  const [stats, setStats] = useState<VemetricStats | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadStats() {
      try {
        const res = await fetch("/api/vemetric/stats", { cache: "no-store" });
        if (!res.ok) return;

        const json = (await res.json()) as VemetricStats;
        if (
          !cancelled &&
          Number.isFinite(json.liveUsers) &&
          Number.isFinite(json.visitors24h) &&
          Number.isFinite(json.pageviews24h)
        ) {
          setStats(json);
        }
      } catch {
        // Fail closed — no placeholder numbers
      }
    }

    void loadStats();
    const interval = window.setInterval(() => {
      void loadStats();
    }, POLL_MS);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, []);

  if (!stats) return null;

  return (
    <div className="border-t border-zinc-100 bg-zinc-50/60 px-4 py-2.5 text-center">
      <p
        className="flex flex-wrap items-center justify-center gap-x-2.5 gap-y-1 text-xs text-muted-foreground"
        aria-label="Live site analytics"
      >
        <span className="inline-flex items-center gap-1.5">
          <span
            aria-hidden
            className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500"
          />
          {formatCount(stats.liveUsers)} live
        </span>
        <Dot />
        <span>
          {formatCount(stats.visitors24h)} visitors (24h)
        </span>
        <Dot />
        <span>
          {formatCount(stats.pageviews24h)} pageviews (24h)
        </span>
      </p>
    </div>
  );
}
