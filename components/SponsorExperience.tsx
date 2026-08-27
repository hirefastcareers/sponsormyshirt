"use client";

/**
 * Split-screen sponsorship experience:
 * 65% kit blueprint · 35% rate card / cart
 */
import { useState } from "react";
import KitVisualizer from "@/components/KitVisualizer";
import RateCardSidebar from "@/components/RateCardSidebar";
import SponsorshipModal from "@/components/SponsorshipModal";
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
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(slot.id)) next.delete(slot.id);
      else next.add(slot.id);
      return next;
    });
  }

  function claim() {
    const available = slots.filter(
      (s) => selectedIds.has(s.id) && s.status === "available",
    );
    if (available.length > 0) {
      // Checkout is one slot at a time — highest-priced selection first
      const next = [...available].sort((a, b) => b.price_gbp - a.price_gbp)[0];
      setCheckoutSlot(next);
      return;
    }
    const first = slots.find((s) => s.status === "available");
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
