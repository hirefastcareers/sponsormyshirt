"use client";

/**
 * Right-rail selection / rate card: totals, inventory list, claim CTA.
 */
import CharityOrderBreakdown from "@/components/CharityOrderBreakdown";
import { ContentPolicyNotice } from "@/components/ContentPolicy";
import { addonLabels } from "@/lib/addons";
import type { SponsorshipSlot } from "@/types/sponsorship";
import {
  isTitleTakeoverPurchasable,
  TITLE_TAKEOVER_ID,
} from "@/lib/positions";
import { getSponsorLinkProps } from "@/lib/sponsor-display";
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
  const titleSlot = slots.find((s) => s.id === TITLE_TAKEOVER_ID);
  const takeoverOpen = isTitleTakeoverPurchasable(slots);
  const titleSelected = selectedIds.has(TITLE_TAKEOVER_ID);

  const selected = [
    ...(titleSelected && titleSlot?.status === "available" ? [titleSlot] : []),
    ...ordered
      .map((r) => r.slot)
      .filter((s) => selectedIds.has(s.id) && s.status === "available"),
  ];
  const total = selected.reduce((sum, s) => sum + s.price_gbp, 0);
  const count = selected.length;

  return (
    <aside className="flex max-h-[calc(100vh-8rem)] flex-col overflow-hidden rounded-xl border border-[#E4E4E7] bg-white lg:max-h-[calc(100vh-7.5rem)]">
      <div className="border-b border-zinc-100 px-5 py-5 sm:px-6">
        <p className="font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-zinc-400">
          Your selection
        </p>
        <div className="mt-2 flex items-baseline justify-between gap-3">
          <span className="text-3xl font-medium tracking-tight text-zinc-900 tabular-nums">
            £{total.toLocaleString("en-GB")}
          </span>
          <span className="text-sm text-zinc-500">
            {titleSelected
              ? "Whole kit"
              : count === 1
                ? "1 placement"
                : `${count} placements`}
          </span>
        </div>
        <CharityOrderBreakdown
          totalGbp={total}
          className="mt-2 rounded-lg border border-emerald-100 bg-emerald-50/60 px-2.5 py-2"
        />
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {titleSlot && (
          <div
            role={takeoverOpen ? "button" : undefined}
            tabIndex={takeoverOpen ? 0 : undefined}
            onClick={() => takeoverOpen && onToggle(titleSlot)}
            onKeyDown={(e) => {
              if (!takeoverOpen) return;
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onToggle(titleSlot);
              }
            }}
            onMouseEnter={() => onHover(TITLE_TAKEOVER_ID)}
            onMouseLeave={() => onHover(null)}
            className={`grid grid-cols-[28px_1fr_auto] items-center gap-3 border-b border-zinc-100 px-5 py-3.5 text-sm transition-colors sm:px-6 ${
              takeoverOpen ? "cursor-pointer" : "cursor-default opacity-60"
            } ${
              titleSelected
                ? "bg-emerald-50"
                : hoveredId === TITLE_TAKEOVER_ID
                  ? "bg-zinc-50"
                  : "bg-transparent"
            }`}
          >
            <span className="font-mono text-[10px] text-zinc-400">TS</span>
            <span className="min-w-0">
              <span className="block truncate text-zinc-800">
                Title Sponsor / Whole Shirt
              </span>
              <SoldAddonHints slot={titleSlot} />
            </span>
            <span
              className={`font-mono text-[13px] tabular-nums ${
                titleSelected
                  ? "font-medium text-emerald-700"
                  : takeoverOpen
                    ? "text-zinc-900"
                    : "text-zinc-400"
              }`}
            >
              <SlotStatusValue
                slot={titleSlot}
                available={takeoverOpen}
                availableLabel={`£${titleSlot.price_gbp.toLocaleString("en-GB")}`}
                unavailableFallback="Locked"
              />
            </span>
          </div>
        )}
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
              <span className="min-w-0">
                <span className="block truncate text-zinc-800">
                  {slot.slot_name}
                </span>
                <SoldAddonHints slot={slot} />
              </span>
              <span
                className={`font-mono text-[13px] tabular-nums ${
                  selected
                    ? "font-medium text-emerald-700"
                    : sold || pending
                      ? "text-zinc-400"
                      : "text-zinc-900"
                }`}
              >
                <SlotStatusValue
                  slot={slot}
                  available={available}
                  availableLabel={`£${slot.price_gbp.toLocaleString("en-GB")}`}
                  unavailableFallback={sold ? "Sold" : "Pending"}
                />
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
        <ContentPolicyNotice className="mt-3 text-center text-[11px] leading-relaxed text-zinc-400" />
      </div>
    </aside>
  );
}

function SlotStatusValue({
  slot,
  available,
  availableLabel,
  unavailableFallback,
}: {
  slot: SponsorshipSlot;
  available: boolean;
  availableLabel: string;
  unavailableFallback: string;
}) {
  if (available) return availableLabel;

  const name = slot.sponsor_name?.trim();
  const { href, rel } = getSponsorLinkProps(slot);

  if (name && href && rel) {
    return (
      <a
        href={href}
        target="_blank"
        rel={rel}
        onClick={(e) => e.stopPropagation()}
        className="max-w-[9rem] truncate font-sans text-[13px] text-zinc-700 underline-offset-2 hover:text-zinc-900 hover:underline"
        title={name}
      >
        {name}
      </a>
    );
  }

  if (name) {
    return (
      <span className="max-w-[9rem] truncate font-sans text-[13px] text-zinc-500">
        {name}
      </span>
    );
  }

  return unavailableFallback;
}

function SoldAddonHints({ slot }: { slot: SponsorshipSlot }) {
  if (slot.status !== "sold" && slot.status !== "pending") return null;
  const labels = addonLabels(slot);
  if (labels.length === 0) return null;

  return (
    <span className="mt-0.5 block truncate font-mono text-[10px] text-emerald-700">
      {labels.join(" · ")}
    </span>
  );
}
