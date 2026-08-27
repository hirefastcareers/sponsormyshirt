"use client";

/**
 * Desktop sticky left/right gutter panels (xl+) showing micro-sponsor logos.
 */
import MicroSponsorLogo from "@/components/MicroSponsorLogo";
import type { MicroSponsor } from "@/types/micro-sponsor";

interface MicroSponsorGuttersProps {
  sponsors: MicroSponsor[];
  onSponsorClick: () => void;
}

function GutterColumn({
  side,
  sponsors,
  onSponsorClick,
}: {
  side: "left" | "right";
  sponsors: MicroSponsor[];
  onSponsorClick: () => void;
}) {
  return (
    <aside
      className={`pointer-events-none fixed top-32 z-30 hidden w-[4.5rem] xl:block ${
        side === "left" ? "left-3 2xl:left-6" : "right-3 2xl:right-6"
      }`}
      aria-label={`Micro sponsors — ${side} column`}
    >
      <div className="pointer-events-auto sticky top-32 flex flex-col items-center gap-3">
        <p className="mb-1 text-center font-mono text-[9px] font-medium uppercase tracking-[0.14em] text-zinc-400">
          £2 Wall
        </p>
        <div className="flex flex-col items-center gap-2.5">
          {sponsors.map((sponsor) => (
            <MicroSponsorLogo key={sponsor.id} sponsor={sponsor} />
          ))}
        </div>
        <button
          type="button"
          onClick={onSponsorClick}
          className="mt-1 w-full rounded-lg border border-dashed border-emerald-300 bg-emerald-50/80 px-1 py-2 text-center text-[10px] font-semibold leading-tight text-emerald-700 transition hover:border-emerald-400 hover:bg-emerald-50"
        >
          + Sponsor £2
        </button>
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
      <GutterColumn
        side="left"
        sponsors={leftSponsors}
        onSponsorClick={onSponsorClick}
      />
      <GutterColumn
        side="right"
        sponsors={rightSponsors}
        onSponsorClick={onSponsorClick}
      />
    </>
  );
}
