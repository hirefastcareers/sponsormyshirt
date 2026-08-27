"use client";

/**
 * Client shell for the landing page interaction layer.
 * Server Component passes hydrated slots; this owns modal state.
 */
import { useState } from "react";
import KitVisualizer from "@/components/KitVisualizer";
import SponsorshipModal from "@/components/SponsorshipModal";
import type { SponsorshipSlot } from "@/types/sponsorship";

interface SponsorExperienceProps {
  slots: SponsorshipSlot[];
}

export default function SponsorExperience({ slots }: SponsorExperienceProps) {
  const [selected, setSelected] = useState<SponsorshipSlot | null>(null);

  return (
    <>
      <KitVisualizer
        slots={slots}
        onSelectSlot={(slot) => setSelected(slot)}
      />
      <SponsorshipModal
        slot={selected}
        open={!!selected}
        onClose={() => setSelected(null)}
      />
    </>
  );
}
