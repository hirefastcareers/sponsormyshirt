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
      <div
        id="kit-viewer"
        className="grid scroll-mt-24 grid-cols-1 items-start gap-5 lg:grid-cols-12 lg:gap-6"
      >
        <div className="min-w-0 lg:col-span-8">
          <KitVisualizer
            slots={slots}
            selectedIds={selectedIds}
            hoveredId={hoveredId}
            onToggle={claimSlot}
            onHover={setHoveredId}
          />
        </div>
        <div className="min-w-0 lg:col-span-4">
          <div className="lg:sticky lg:top-24">
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
        </div>
      </div>

      <div className="mx-auto mt-16 w-full max-w-7xl border-t border-[#E4E4E7] pt-16 sm:mt-20 sm:pt-20">
        <LandingSections onClaim={claim} />
      </div>

      <SponsorshipModal
        slot={checkoutSlot}
        open={!!checkoutSlot}
        onClose={() => {
          setCheckoutSlot(null);
          setSelectedIds(new Set());
        }}
        onCheckoutError={() => setSelectedIds(new Set())}
      />
    </>
  );
}
