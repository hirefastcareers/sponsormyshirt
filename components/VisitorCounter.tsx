"use client";

/**
 * Live visitor badge for the header stats bar.
 * Counts one organic view per browser tab session via sessionStorage;
 * refreshes in the same tab only fetch the current total (GET /api/visits).
 */
import { useEffect, useState } from "react";

const SESSION_VISITED_KEY = "has_visited";

export default function VisitorCounter() {
  const [totalViews, setTotalViews] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadViews() {
      try {
        const hasVisited =
          typeof window !== "undefined" &&
          window.sessionStorage.getItem(SESSION_VISITED_KEY) === "true";

        const res = await fetch("/api/visits", {
          method: hasVisited ? "GET" : "POST",
          credentials: "same-origin",
        });
        if (!res.ok) return;

        const json = (await res.json()) as { totalViews?: unknown };
        const n = Number(json.totalViews);

        if (!cancelled && Number.isFinite(n) && n >= 0) {
          setTotalViews(n);

          if (!hasVisited) {
            window.sessionStorage.setItem(SESSION_VISITED_KEY, "true");
          }
        }
      } catch {
        // Fail closed — no fake numbers
      }
    }

    void loadViews();
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
