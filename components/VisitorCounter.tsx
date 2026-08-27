"use client";

/**
 * Live visitor badge for the header stats bar.
 * Records a view on mount via POST /api/visits; renders nothing on failure.
 */
import { useEffect, useState } from "react";

export default function VisitorCounter() {
  const [totalViews, setTotalViews] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function recordVisit() {
      try {
        const res = await fetch("/api/visits", { method: "POST" });
        if (!res.ok) return;

        const json = (await res.json()) as { totalViews?: unknown };
        const n = Number(json.totalViews);

        if (!cancelled && Number.isFinite(n) && n >= 0) {
          setTotalViews(n);
        }
      } catch {
        // Fail closed — no fake numbers
      }
    }

    void recordVisit();
    return () => {
      cancelled = true;
    };
  }, []);

  if (totalViews === null) return null;

  const formatted = totalViews.toLocaleString("en-GB");

  return (
    <>
      <span
        className="inline-flex items-center gap-1.5 text-xs text-zinc-500"
        title="Total board views"
      >
        <span aria-hidden className="text-[10px] leading-none">
          🟢
        </span>
        <span>
          <span className="font-medium text-zinc-800">{formatted}</span> people
          viewed this board
        </span>
      </span>
      <span className="h-3 w-px bg-zinc-200" aria-hidden />
    </>
  );
}
