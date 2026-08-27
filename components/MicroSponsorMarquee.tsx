"use client";

/**
 * Mobile/tablet horizontal marquee of micro-sponsor logos (hidden on xl+).
 */
import MicroSponsorLogo from "@/components/MicroSponsorLogo";
import type { MicroSponsor } from "@/types/micro-sponsor";

interface MicroSponsorMarqueeProps {
  sponsors: MicroSponsor[];
  onSponsorClick: () => void;
}

export default function MicroSponsorMarquee({
  sponsors,
  onSponsorClick,
}: MicroSponsorMarqueeProps) {
  const hasSponsors = sponsors.length > 0;
  const track = hasSponsors ? [...sponsors, ...sponsors] : [];

  return (
    <section
      className="xl:hidden"
      aria-label="Micro sponsor wall"
    >
      <div className="mb-3 flex items-center justify-between gap-3 px-1">
        <div>
          <p className="font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-zinc-400">
            Supporter Wall (£2)
          </p>
          <p className="text-sm text-zinc-500">
            {hasSponsors
              ? `${sponsors.length} brand${sponsors.length === 1 ? "" : "s"} supporting the run`
              : "Be the first £2 micro-sponsor"}
          </p>
        </div>
        <button
          type="button"
          onClick={onSponsorClick}
          className="shrink-0 rounded-full bg-emerald-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-emerald-700"
        >
          Sponsor for £2
        </button>
      </div>

      {hasSponsors ? (
        <div className="relative overflow-hidden rounded-xl border border-[#E4E4E7] bg-white py-3">
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-8 bg-gradient-to-r from-white to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-8 bg-gradient-to-l from-white to-transparent" />
          <div className="micro-marquee-track flex w-max items-center gap-4 px-4">
            {track.map((sponsor, index) => (
              <MicroSponsorLogo
                key={`${sponsor.id}-${index}`}
                sponsor={sponsor}
                size="sm"
              />
            ))}
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={onSponsorClick}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-emerald-200 bg-emerald-50/50 px-4 py-6 text-sm font-medium text-emerald-700 transition hover:border-emerald-300 hover:bg-emerald-50"
        >
          <span className="text-lg" aria-hidden>
            +
          </span>
          Add your logo for £2
        </button>
      )}
    </section>
  );
}
