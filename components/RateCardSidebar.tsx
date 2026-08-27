"use client";

/**
 * Right-rail selection / rate card: totals, inventory list, claim CTA.
 */
import type { SponsorshipSlot } from "@/types/sponsorship";
import { orderSlots } from "@/lib/zones";

interface RateCardSidebarProps {
  slots: SponsorshipSlot[];
  selectedIds: Set<string>;
  hoveredId: string | null;
  onToggle: (slot: SponsorshipSlot) => void;
  onHover: (id: string | null) => void;
  onClear: () => void;
  onClaim: () => void;
}

export default function RateCardSidebar({
  slots,
  selectedIds,
  hoveredId,
  onToggle,
  onHover,
  onClear,
  onClaim,
}: RateCardSidebarProps) {
  const ordered = orderSlots(slots);
  const selected = ordered
    .map((r) => r.slot)
    .filter((s) => selectedIds.has(s.id) && s.status === "available");
  const total = selected.reduce((sum, s) => sum + s.price_gbp, 0);
  const count = selected.length;

  return (
    <aside className="flex h-full flex-col overflow-hidden rounded-xl border border-[#E4E4E7] bg-white">
      <div className="border-b border-zinc-100 px-5 py-5 sm:px-6">
        <p className="font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-zinc-400">
          Your selection
        </p>
        <div className="mt-2 flex items-baseline justify-between gap-3">
          <span className="text-3xl font-medium tracking-tight text-zinc-900 tabular-nums">
            £{total}
          </span>
          <span className="text-sm text-zinc-500">
            {count === 1 ? "1 placement" : `${count} placements`}
          </span>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {ordered.map(({ zone, slot }) => {
          const available = slot.status === "available";
          const selected = selectedIds.has(slot.id);
          const hovered = hoveredId === slot.id;
          const sold = slot.status === "sold";
          const pending = slot.status === "pending";

          return (
            <div
              key={slot.id}
              role={available ? "button" : undefined}
              tabIndex={available ? 0 : undefined}
              onClick={() => available && onToggle(slot)}
              onKeyDown={(e) => {
                if (!available) return;
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onToggle(slot);
                }
              }}
              onMouseEnter={() => onHover(slot.id)}
              onMouseLeave={() => onHover(null)}
              className={`grid grid-cols-[28px_1fr_auto] items-center gap-3 border-b border-zinc-50 px-5 py-3.5 text-sm transition-colors sm:px-6 ${
                available ? "cursor-pointer" : "cursor-default opacity-60"
              } ${
                selected
                  ? "bg-emerald-50"
                  : hovered
                    ? "bg-zinc-50"
                    : "bg-transparent"
              }`}
            >
              <span className="font-mono text-[10px] text-zinc-400">
                {zone.num}
              </span>
              <span className="truncate text-zinc-800">{slot.slot_name}</span>
              <span
                className={`font-mono text-[13px] tabular-nums ${
                  selected
                    ? "font-medium text-emerald-700"
                    : sold || pending
                      ? "text-zinc-400"
                      : "text-zinc-900"
                }`}
              >
                {available
                  ? `£${slot.price_gbp}`
                  : sold
                    ? "Sold"
                    : "Pending"}
              </span>
            </div>
          );
        })}
      </div>

      <div className="border-t border-zinc-100 px-5 py-5 sm:px-6">
        <button
          type="button"
          onClick={onClear}
          className="mb-3 block w-full text-center text-xs text-zinc-400 transition hover:text-zinc-600"
        >
          Clear selection
        </button>
        <button
          type="button"
          onClick={onClaim}
          className="w-full rounded-full bg-zinc-900 px-5 py-3.5 text-sm font-medium text-white transition hover:bg-zinc-800"
        >
          Claim your spot
        </button>
      </div>
    </aside>
  );
}
