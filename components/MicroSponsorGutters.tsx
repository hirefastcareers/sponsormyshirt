"use client";

/**
 * Desktop sticky left/right Supporter Wall panels (xl+).
 */
import MicroSponsorLogo from "@/components/MicroSponsorLogo";
import { MICRO_SPONSOR_PRICE_GBP } from "@/lib/micro-sponsors";
import type { MicroSponsor } from "@/types/micro-sponsor";

const MIN_VISIBLE_SLOTS = 4;

interface MicroSponsorGuttersProps {
  sponsors: MicroSponsor[];
  onSponsorClick: () => void;
}

function InfoIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="currentColor"
      aria-hidden
      className={className}
    >
      <path
        fillRule="evenodd"
        d="M8 1.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13ZM7 7.25V11h2V7.25H7Zm0-2.5V6h2V4.75H7Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function EmptySlotButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-14 w-full items-center justify-center rounded-lg border border-dashed border-zinc-200 bg-zinc-50/60 px-2 text-center text-[10px] font-medium leading-snug text-zinc-500 transition hover:border-emerald-300 hover:bg-emerald-50/80 hover:text-emerald-700"
    >
      + Add your logo for £{MICRO_SPONSOR_PRICE_GBP}
    </button>
  );
}

function PanelHeader() {
  return (
    <header className="border-b border-zinc-100 px-3 py-2.5">
      <div className="flex items-center gap-1.5">
        <p className="text-xs font-semibold leading-tight text-zinc-800">
          Supporter Wall (£{MICRO_SPONSOR_PRICE_GBP})
        </p>
        <span
          className="text-zinc-400"
          title="Get your logo & link featured on the site sidebars."
        >
          <InfoIcon className="h-3.5 w-3.5 shrink-0" />
        </span>
      </div>
      <p className="mt-1 text-[10px] leading-snug text-muted-foreground">
        Get your logo & link featured on the site sidebars.
      </p>
    </header>
  );
}

function GutterPanel({
  side,
  sponsors,
  onSponsorClick,
}: {
  side: "left" | "right";
  sponsors: MicroSponsor[];
  onSponsorClick: () => void;
}) {
  const emptySlotCount = Math.max(1, MIN_VISIBLE_SLOTS - sponsors.length);

  return (
    <aside
      className={`pointer-events-none fixed top-32 z-30 hidden w-40 xl:block 2xl:w-44 ${
        side === "left" ? "left-4" : "right-4"
      }`}
      aria-label={`Supporter Wall — ${side} panel`}
    >
      <div
        className="pointer-events-auto max-h-[calc(100vh-10rem)] overflow-hidden rounded-xl border border-[#E4E4E7] bg-white/95 shadow-sm backdrop-blur-sm"
      >
        <PanelHeader />
        <div className="flex max-h-[calc(100vh-14rem)] flex-col gap-2 overflow-y-auto p-3">
          {sponsors.map((sponsor) => (
            <div
              key={sponsor.id}
              className="flex items-center justify-center rounded-lg border border-zinc-100 bg-zinc-50/40 p-1.5 transition hover:border-zinc-200 hover:bg-white"
            >
              <MicroSponsorLogo sponsor={sponsor} />
            </div>
          ))}
          {Array.from({ length: emptySlotCount }, (_, i) => (
            <EmptySlotButton key={`empty-${i}`} onClick={onSponsorClick} />
          ))}
        </div>
      </div>
    </aside>
  );
}

export default function MicroSponsorGutters({
  sponsors,
  onSponsorClick,
}: MicroSponsorGuttersProps) {
  const leftSponsors = sponsors.filter((_, i) => i % 2 === 0);
  const rightSponsors = sponsors.filter((_, i) => i % 2 === 1);

  return (
    <>
      <GutterPanel
        side="left"
        sponsors={leftSponsors}
        onSponsorClick={onSponsorClick}
      />
      <GutterPanel
        side="right"
        sponsors={rightSponsors}
        onSponsorClick={onSponsorClick}
      />
    </>
  );
}
