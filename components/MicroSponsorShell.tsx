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

/** Desktop hero CTA (marquee has its own button on smaller screens). */
export function MicroSponsorHeroCTA() {
  const { openModal } = useMicroSponsor();
  return (
    <button
      type="button"
      onClick={openModal}
      className="hidden rounded-full border border-emerald-200 bg-emerald-50 px-5 py-2.5 text-sm font-semibold text-emerald-700 transition hover:border-emerald-300 hover:bg-emerald-100 xl:inline-flex"
    >
      Sponsor for £{MICRO_SPONSOR_PRICE_GBP}
    </button>
  );
}
