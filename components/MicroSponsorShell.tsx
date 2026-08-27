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

/** Mobile marquee block — placed below the kit viewer on page layout. */
export function MicroSponsorMarqueeBlock() {
  const { sponsors, openModal } = useMicroSponsor();
  return (
    <MicroSponsorMarquee sponsors={sponsors} onSponsorClick={openModal} />
  );
}

/** Hero primary + secondary CTAs with Supporter Wall micro-copy under £5. */
export function MicroSponsorHeroCTA() {
  const { openModal } = useMicroSponsor();

  return (
    <div className="mt-6 flex flex-col items-center gap-3">
      <div className="flex flex-wrap items-start justify-center gap-3 sm:gap-4">
        <a
          href="#kit-viewer"
          className="rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-zinc-800"
        >
          Claim a Kit Slot
        </a>
        <div className="flex flex-col items-center gap-1.5">
          <button
            type="button"
            onClick={openModal}
            className="rounded-full border border-zinc-300 bg-white px-5 py-2.5 text-sm font-medium text-zinc-700 transition hover:border-zinc-400 hover:bg-zinc-50"
          >
            Sponsor for £{MICRO_SPONSOR_PRICE_GBP}
          </button>
          <p className="max-w-[14rem] text-center text-[11px] leading-snug text-muted-foreground sm:max-w-none">
            (£{MICRO_SPONSOR_PRICE_GBP} gets your logo &amp; backlink on our
            website Supporter Wall)
          </p>
        </div>
      </div>
    </div>
  );
}
