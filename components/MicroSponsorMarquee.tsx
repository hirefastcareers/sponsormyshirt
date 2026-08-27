"use client";

/**
 * Mobile/tablet horizontal marquee of micro-sponsor logos (hidden on xl+).
 */
import MicroSponsorLogo from "@/components/MicroSponsorLogo";
import { MICRO_SPONSOR_PRICE_GBP } from "@/lib/micro-sponsors";
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
    <section className="xl:hidden" aria-label="Supporter Wall">
      <div className="mb-3 px-1">
        <p className="font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-zinc-400">
          Supporter Wall (£{MICRO_SPONSOR_PRICE_GBP})
        </p>
        <p className="mt-1 text-sm text-zinc-500">
          {hasSponsors
            ? `${sponsors.length} brand${sponsors.length === 1 ? "" : "s"} supporting the run`
            : `Be the first £${MICRO_SPONSOR_PRICE_GBP} supporter`}
        </p>
      </div>

      {hasSponsors ? (
        <div className="space-y-3">
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
          <button
            type="button"
            onClick={onSponsorClick}
            className="flex w-full items-center justify-center rounded-lg border border-dashed border-zinc-200 bg-zinc-50/60 px-4 py-3 text-xs font-medium text-zinc-500 transition hover:border-emerald-300 hover:bg-emerald-50/80 hover:text-emerald-700"
          >
            + Add your logo for £{MICRO_SPONSOR_PRICE_GBP}
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={onSponsorClick}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-zinc-200 bg-zinc-50/60 px-4 py-5 text-sm font-medium text-zinc-500 transition hover:border-emerald-300 hover:bg-emerald-50/80 hover:text-emerald-700"
        >
          <span className="text-lg leading-none" aria-hidden>
            +
          </span>
          Add your logo for £{MICRO_SPONSOR_PRICE_GBP}
        </button>
      )}
    </section>
  );
}
