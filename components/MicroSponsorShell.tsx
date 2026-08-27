"use client";

/**
 * Client shell for the Micro-Sponsor Wall: context, gutters, and modal.
 */
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import MicroSponsorGutters from "@/components/MicroSponsorGutters";
import MicroSponsorMarquee from "@/components/MicroSponsorMarquee";
import MicroSponsorModal from "@/components/MicroSponsorModal";
import { MICRO_SPONSOR_PRICE_GBP } from "@/lib/micro-sponsors";
import type { MicroSponsor } from "@/types/micro-sponsor";

type MicroSponsorContextValue = {
  sponsors: MicroSponsor[];
  openModal: () => void;
};

const MicroSponsorContext = createContext<MicroSponsorContextValue | null>(
  null,
);

export function useMicroSponsor() {
  const ctx = useContext(MicroSponsorContext);
  if (!ctx) {
    throw new Error("useMicroSponsor must be used within MicroSponsorShell");
  }
  return ctx;
}

interface MicroSponsorShellProps {
  sponsors: MicroSponsor[];
  children: ReactNode;
}

export default function MicroSponsorShell({
  sponsors,
  children,
}: MicroSponsorShellProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const openModal = useCallback(() => setModalOpen(true), []);
  const closeModal = useCallback(() => setModalOpen(false), []);

  const value = useMemo(
    () => ({ sponsors, openModal }),
    [sponsors, openModal],
  );

  return (
    <MicroSponsorContext.Provider value={value}>
      <div className="relative">
        <MicroSponsorGutters sponsors={sponsors} onSponsorClick={openModal} />
        {children}
        <MicroSponsorModal open={modalOpen} onClose={closeModal} />
      </div>
    </MicroSponsorContext.Provider>
  );
}

/** Mobile marquee block — place below hero in page layout. */
export function MicroSponsorMarqueeBlock() {
  const { sponsors, openModal } = useMicroSponsor();
  return (
    <MicroSponsorMarquee sponsors={sponsors} onSponsorClick={openModal} />
  );
}

/** Hero micro-copy for the Supporter Wall (CTA lives in sidebars / mobile marquee). */
export function MicroSponsorHeroCTA() {
  return (
    <p className="max-w-md text-center text-xs leading-relaxed text-muted-foreground">
      £{MICRO_SPONSOR_PRICE_GBP} Supporters get their logo and backlink featured
      on our website&apos;s Supporter Wall (desktop sidebars &amp; mobile
      marquee).
    </p>
  );
}
