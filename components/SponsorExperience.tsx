"use client";

/**
 * Split-screen sponsorship experience:
 * 65% kit blueprint · 35% rate card / cart
 */
import { useState } from "react";
import KitVisualizer from "@/components/KitVisualizer";
import LandingSections from "@/components/LandingSections";
import RateCardSidebar from "@/components/RateCardSidebar";
import SponsorshipModal from "@/components/SponsorshipModal";
import {
  isTitleTakeover,
  isTitleTakeoverPurchasable,
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

  /** Click kit node or rate-card row → highlight + open Claim Placement modal. */
  function claimSlot(slot: SponsorshipSlot) {
    if (slot.status !== "available") return;

    if (
      isTitleTakeover(slot.id) &&
      !isTitleTakeoverPurchasable(slots)
    ) {
      return;
    }

    setSelectedIds(new Set([slot.id]));
    setCheckoutSlot(slot);
  }

  /** Footer CTA: reopen checkout for the current highlight, or first open slot. */
  function claim() {
    const selected = slots.find(
      (s) => selectedIds.has(s.id) && s.status === "available",
    );
    if (selected) {
      if (
        isTitleTakeover(selected.id) &&
        !isTitleTakeoverPurchasable(slots)
      ) {
        return;
      }
      setCheckoutSlot(selected);
      return;
    }
    const first = slots.find(
      (s) => s.status === "available" && !isTitleTakeover(s.id),
    );
    if (first) {
      setSelectedIds(new Set([first.id]));
      setCheckoutSlot(first);
    }
  }

  return (
    <>
      <div className="grid min-h-[calc(100vh-7.5rem)] grid-cols-1 gap-5 lg:grid-cols-[minmax(0,65fr)_minmax(300px,35fr)] lg:gap-6">
        <KitVisualizer
          slots={slots}
          selectedIds={selectedIds}
          hoveredId={hoveredId}
          onToggle={claimSlot}
          onHover={setHoveredId}
        />
        <RateCardSidebar
          slots={slots}
          selectedIds={selectedIds}
          hoveredId={hoveredId}
          onToggle={claimSlot}
          onHover={setHoveredId}
          onClear={() => setSelectedIds(new Set())}
          onClaim={claim}
        />
      </div>

      <div className="mt-16 border-t border-[#E4E4E7] pt-16 sm:mt-20 sm:pt-20">
        <LandingSections onClaim={claim} />
      </div>

      <SponsorshipModal
        slot={checkoutSlot}
        open={!!checkoutSlot}
        onClose={() => setCheckoutSlot(null)}
      />
    </>
  );
}
