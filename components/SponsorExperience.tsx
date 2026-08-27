"use client";

/**
 * Split-screen sponsorship experience:
 * 65% kit blueprint · 35% rate card / cart
 */
import { useState } from "react";
import KitVisualizer from "@/components/KitVisualizer";
import RateCardSidebar from "@/components/RateCardSidebar";
import SponsorshipModal from "@/components/SponsorshipModal";
import {
  isTitleTakeover,
  isTitleTakeoverPurchasable,
  TITLE_TAKEOVER_ID,
} from "@/lib/positions";
import type { SponsorshipSlot } from "@/types/sponsorship";

interface SponsorExperienceProps {
  slots: SponsorshipSlot[];
}

export default function SponsorExperience({ slots }: SponsorExperienceProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [checkoutSlot, setCheckoutSlot] = useState<SponsorshipSlot | null>(
    null,
  );

  function toggle(slot: SponsorshipSlot) {
    if (slot.status !== "available") return;

    // Title takeover requires a fully open kit
    if (
      isTitleTakeover(slot.id) &&
      !isTitleTakeoverPurchasable(slots)
    ) {
      return;
    }

    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(slot.id)) {
        next.delete(slot.id);
        return next;
      }

      // Title takeover is exclusive — clears individual picks, and vice versa
      if (isTitleTakeover(slot.id)) {
        return new Set([TITLE_TAKEOVER_ID]);
      }

      next.delete(TITLE_TAKEOVER_ID);
      next.add(slot.id);
      return next;
    });
  }

  function claim() {
    const available = slots.filter(
      (s) => selectedIds.has(s.id) && s.status === "available",
    );
    if (available.length > 0) {
      // Prefer title takeover if selected; otherwise highest-priced pick
      const takeover = available.find((s) => isTitleTakeover(s.id));
      if (takeover && isTitleTakeoverPurchasable(slots)) {
        setCheckoutSlot(takeover);
        return;
      }
      const next = [...available]
        .filter((s) => !isTitleTakeover(s.id))
        .sort((a, b) => b.price_gbp - a.price_gbp)[0];
      if (next) {
        setCheckoutSlot(next);
        return;
      }
    }
    const first = slots.find(
      (s) => s.status === "available" && !isTitleTakeover(s.id),
    );
    if (first) setCheckoutSlot(first);
  }

  return (
    <>
      <div className="grid min-h-[calc(100vh-7.5rem)] grid-cols-1 gap-5 lg:grid-cols-[minmax(0,65fr)_minmax(300px,35fr)] lg:gap-6">
        <KitVisualizer
          slots={slots}
          selectedIds={selectedIds}
          hoveredId={hoveredId}
          onToggle={toggle}
          onHover={setHoveredId}
        />
        <RateCardSidebar
          slots={slots}
          selectedIds={selectedIds}
          hoveredId={hoveredId}
          onToggle={toggle}
          onHover={setHoveredId}
          onClear={() => setSelectedIds(new Set())}
          onClaim={claim}
        />
      </div>

      <SponsorshipModal
        slot={checkoutSlot}
        open={!!checkoutSlot}
        onClose={() => setCheckoutSlot(null)}
      />
    </>
  );
}
