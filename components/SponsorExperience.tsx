"use client";

/**
 * Client shell for the landing page interaction layer.
 * Owns modal state + Live Kit Summary chrome around the visualizer.
 */
import { useMemo, useState } from "react";
import KitVisualizer from "@/components/KitVisualizer";
import SponsorshipModal from "@/components/SponsorshipModal";
import type { SponsorshipSlot } from "@/types/sponsorship";

interface SponsorExperienceProps {
  slots: SponsorshipSlot[];
}

function formatGbp(amount: number) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    maximumFractionDigits: 0,
  }).format(amount);
}

function summarizeSlots(slots: SponsorshipSlot[]) {
  const total = slots.length;
  const sold = slots.filter((s) => s.status === "sold").length;
  const pending = slots.filter((s) => s.status === "pending").length;
  const revenueGbp = slots
    .filter((s) => s.status === "sold")
    .reduce((sum, s) => sum + s.price_gbp, 0);
  return { total, sold, pending, revenueGbp };
}

export default function SponsorExperience({ slots }: SponsorExperienceProps) {
  const [selected, setSelected] = useState<SponsorshipSlot | null>(null);
  const metrics = useMemo(() => summarizeSlots(slots), [slots]);
  const claimed = metrics.sold + metrics.pending;
  const progress =
    metrics.total > 0 ? Math.round((claimed / metrics.total) * 100) : 0;

  const firstAvailable = slots.find((s) => s.status === "available") ?? null;

  return (
    <>
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-xl sm:p-8">
        <div className="flex flex-col gap-8 lg:flex-row lg:gap-10">
          {/* Live Kit Summary — header on mobile, sidebar on desktop */}
          <aside className="flex w-full shrink-0 flex-col gap-5 lg:w-64 xl:w-72">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                Live Kit Summary
              </p>
              <h3 className="mt-1.5 font-display text-xl font-bold tracking-tight text-slate-900">
                Race-day inventory
              </h3>
            </div>

            <button
              type="button"
              onClick={() => firstAvailable && setSelected(firstAvailable)}
              disabled={!firstAvailable}
              className="inline-flex w-full items-center justify-center rounded-xl bg-slate-900 px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              Claim Your Spot on Race Day
            </button>

            <div className="space-y-3 rounded-xl border border-slate-100 bg-slate-50/80 p-4">
              <div className="flex items-baseline justify-between gap-2">
                <p className="text-sm font-medium text-slate-700">
                  {claimed} of {metrics.total} slots claimed
                </p>
                <p className="text-xs font-medium text-slate-400">{progress}%</p>
              </div>
              <div
                className="h-2 overflow-hidden rounded-full bg-slate-200"
                role="progressbar"
                aria-valuenow={claimed}
                aria-valuemin={0}
                aria-valuemax={metrics.total}
                aria-label="Slots claimed"
              >
                <div
                  className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="flex items-center justify-between border-t border-slate-200/80 pt-3">
                <span className="text-sm text-slate-500">Total Raised</span>
                <span className="text-base font-bold tabular-nums text-slate-900">
                  {formatGbp(metrics.revenueGbp)}
                </span>
              </div>
            </div>

            <ul className="hidden space-y-2 lg:block">
              {slots.map((slot) => {
                const available = slot.status === "available";
                return (
                  <li key={slot.id}>
                    <button
                      type="button"
                      disabled={!available}
                      onClick={() => available && setSelected(slot)}
                      className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition ${
                        available
                          ? "text-slate-700 hover:bg-emerald-50 hover:text-emerald-800"
                          : "cursor-not-allowed text-slate-400"
                      }`}
                    >
                      <span className="truncate font-medium">
                        {slot.slot_name}
                      </span>
                      <span className="ml-2 shrink-0 tabular-nums">
                        {available
                          ? formatGbp(slot.price_gbp)
                          : slot.status === "sold"
                            ? "Sold"
                            : "Pending"}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </aside>

          <div className="min-w-0 flex-1 border-t border-slate-100 pt-6 lg:border-l lg:border-t-0 lg:pl-10 lg:pt-0">
            <KitVisualizer
              slots={slots}
              onSelectSlot={(slot) => setSelected(slot)}
            />
          </div>
        </div>
      </div>

      <SponsorshipModal
        slot={selected}
        open={!!selected}
        onClose={() => setSelected(null)}
      />
    </>
  );
}
