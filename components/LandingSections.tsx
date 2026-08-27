"use client";

/**
 * Below-the-fold landing content: positions, division, process,
 * race context, FAQ, and claim CTA.
 */
import { useId, useState, type ReactNode } from "react";
import {
  DOFOLLOW_LINK_ADDON,
  SOCIAL_POST_ADDON,
} from "@/lib/addons";
import { POSITION_META, POSITION_PRICES, type PositionId } from "@/lib/positions";
import { ZONE_META } from "@/lib/zones";

interface LandingSectionsProps {
  onClaim: () => void;
}

const POSITION_DETAILS: Record<
  PositionId,
  { dimensions: string; perk: string; tier: "primary" | "secondary" }
> = {
  chest_center: {
    dimensions: "200 × 120 mm",
    perk: "Prime chest real estate — broadcast frames & every front-facing photo",
    tier: "primary",
  },
  left_chest: {
    dimensions: "80 × 80 mm",
    perk: "Heart-side chest hit — finish-line close-ups and selfie range",
    tier: "primary",
  },
  upper_back: {
    dimensions: "180 × 100 mm",
    perk: "Long-duration tracking — chase cams and runners behind you for miles",
    tier: "primary",
  },
  lower_back: {
    dimensions: "150 × 80 mm",
    perk: "Follow-cam real estate — stays in frame whenever the pack trails",
    tier: "secondary",
  },
  cap_front: {
    dimensions: "80 × 50 mm",
    perk: "Eye-level brand hit — gantry cameras and finish-line portraits",
    tier: "primary",
  },
  shorts_left: {
    dimensions: "100 × 60 mm",
    perk: "Dynamic action photos — stride, barriers, and low-angle course shots",
    tier: "secondary",
  },
  shorts_right: {
    dimensions: "100 × 60 mm",
    perk: "Dynamic action photos — stride, barriers, and low-angle course shots",
    tier: "secondary",
  },
  right_sleeve: {
    dimensions: "80 × 60 mm",
    perk: "Side-profile shots — arm swing keeps you in every lateral frame",
    tier: "secondary",
  },
  left_sleeve: {
    dimensions: "80 × 60 mm",
    perk: "Side-profile shots — arm swing keeps you in every lateral frame",
    tier: "secondary",
  },
  left_sock: {
    dimensions: "60 × 40 mm",
    perk: "Action detail — low-angle strides and finish-chute cutaways",
    tier: "secondary",
  },
  right_sock: {
    dimensions: "60 × 40 mm",
    perk: "Action detail — low-angle strides and finish-chute cutaways",
    tier: "secondary",
  },
};

const STEPS = [
  {
    num: "01",
    title: "Pick your spot & upload",
    body: "Choose your exact placement on the interactive kit map and drop in your logo. What you see is what prints on the kit.",
  },
  {
    num: "02",
    title: "Lock it in at checkout",
    body: "Secure payment holds your placement instantly. Add a social announcement or SEO backlink if you want extra reach.",
  },
  {
    num: "03",
    title: "Show up on race day",
    body: "Your logo runs live past 60,000+ runners and spectators along the 13.1-mile Newcastle-to-South-Shields route — targeting a ~2:05 finish.",
  },
] as const;

const FAQ_ITEMS = [
  {
    q: "What logo formats do you need?",
    a: "PNG, SVG, or WebP. SVG or a transparent high-resolution PNG prints sharpest on fabric — no muddy edges, no surprise backgrounds.",
  },
  {
    q: "When is the printing deadline?",
    a: "Artwork locks after payment. Logos are printed onto the race kit in the days before race weekend, with a proof sent once your file is approved for print.",
  },
  {
    q: "Is payment secure?",
    a: "Yes. Checkout runs through a secure payment provider. Your placement is held only after successful payment — no card details are stored on this site.",
  },
  {
    q: "How do add-ons work?",
    a: `Optional at checkout, fulfilled with your placement. ${SOCIAL_POST_ADDON.title} (£${SOCIAL_POST_ADDON.price_gbp}): a dedicated announcement on X & LinkedIn tagging your brand. ${DOFOLLOW_LINK_ADDON.title} (£${DOFOLLOW_LINK_ADDON.price_gbp}): a permanent dofollow link on sponsormyshirt.app.`,
  },
] as const;

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <p className="font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-zinc-400">
      {children}
    </p>
  );
}

function SectionHeading({ children }: { children: ReactNode }) {
  return (
    <h2 className="mt-2 text-2xl font-medium tracking-tight text-zinc-900 sm:text-[1.75rem]">
      {children}
    </h2>
  );
}

export default function LandingSections({ onClaim }: LandingSectionsProps) {
  const faqBaseId = useId();
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  function claimPosition() {
    document.getElementById("kit")?.scrollIntoView({ behavior: "smooth" });
    onClaim();
  }

  return (
    <div className="space-y-16 sm:space-y-20">
      {/* Positions */}
      <section aria-labelledby="positions-heading">
        <SectionLabel>Inventory</SectionLabel>
        <SectionHeading>
          <span id="positions-heading">Positions</span>
        </SectionHeading>
        <p className="mt-2 max-w-xl text-[15px] leading-relaxed text-zinc-500">
          Physical kit visibility, priced so small brands can buy real race-day
          exposure — not a vague “partnership.”
        </p>

        <div className="mt-8 overflow-hidden rounded-xl border border-[#E4E4E7] bg-white">
          <div className="hidden grid-cols-[4rem_1fr_8rem_1fr] gap-4 border-b border-zinc-100 px-5 py-3 font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-zinc-400 sm:grid sm:px-6">
            <span>#</span>
            <span>Placement</span>
            <span>Size</span>
            <span>Visibility</span>
          </div>
          <ul className="divide-y divide-zinc-100">
            {ZONE_META.map((zone) => {
              const id = zone.id as PositionId;
              const meta = POSITION_META[id];
              const detail = POSITION_DETAILS[id];
              const price = POSITION_PRICES[id];
              return (
                <li
                  key={zone.id}
                  className="grid gap-2 px-5 py-4 sm:grid-cols-[4rem_1fr_8rem_1fr] sm:items-center sm:gap-4 sm:px-6"
                >
                  <span className="font-mono text-xs tabular-nums text-zinc-400">
                    {zone.num}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-zinc-900">
                      {meta.slot_name}
                    </p>
                    <p className="mt-0.5 text-xs text-zinc-500">
                      {zone.garment}
                      <span className="mx-1.5 text-zinc-300">·</span>
                      £{price.toLocaleString("en-GB")}
                      <span className="mx-1.5 text-zinc-300">·</span>
                      <span
                        className={
                          detail.tier === "primary"
                            ? "text-emerald-700"
                            : "text-zinc-500"
                        }
                      >
                        {detail.tier === "primary" ? "High visibility" : "Secondary"}
                      </span>
                    </p>
                  </div>
                  <p className="font-mono text-xs tabular-nums text-zinc-600">
                    {detail.dimensions}
                  </p>
                  <p className="text-sm leading-snug text-zinc-500">
                    {detail.perk}
                  </p>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* How it's divided */}
      <section aria-labelledby="divided-heading">
        <SectionLabel>Allocation</SectionLabel>
        <SectionHeading>
          <span id="divided-heading">How it&apos;s divided</span>
        </SectionHeading>
        <p className="mt-2 max-w-xl text-[15px] leading-relaxed text-zinc-500">
          Placements map to how cameras and crowds actually see a runner —
          chest for broadcast, back for tracking, sleeves for profile, lower
          kit for action.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-[#E4E4E7] bg-white px-5 py-6 sm:px-6">
            <p className="flex items-center gap-2 font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-emerald-700">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-600" />
              High visibility
            </p>
            <h3 className="mt-3 text-lg font-medium tracking-tight text-zinc-900">
              Chest, upper back, cap
            </h3>
            <p className="mt-2 text-[15px] leading-relaxed text-zinc-500">
              Prime chest real estate for broadcast and front-facing photos;
              upper back for long-duration runner tracking; cap front for
              eye-level finish shots. The placements that earn the most frames.
            </p>
          </div>
          <div className="rounded-xl border border-[#E4E4E7] bg-white px-5 py-6 sm:px-6">
            <p className="flex items-center gap-2 font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-zinc-400">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-zinc-400" />
              Secondary
            </p>
            <h3 className="mt-3 text-lg font-medium tracking-tight text-zinc-900">
              Sleeves, shorts, socks, lower back
            </h3>
            <p className="mt-2 text-[15px] leading-relaxed text-zinc-500">
              Sleeves catch side-profile shots; shorts and socks own dynamic
              action photos; lower back stays in follow-cam. Affordable entry
              with real course presence for 13.1 miles.
            </p>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section aria-labelledby="works-heading">
        <SectionLabel>Process</SectionLabel>
        <SectionHeading>
          <span id="works-heading">How it works</span>
        </SectionHeading>
        <p className="mt-2 max-w-xl text-[15px] leading-relaxed text-zinc-500">
          Pick a spot, pay once, get your logo printed on the race-day kit —
          built for indie projects and small businesses that want clear,
          physical visibility.
        </p>

        <ol className="mt-8 grid gap-4 sm:grid-cols-3">
          {STEPS.map((step, i) => (
            <li
              key={step.num}
              className="relative rounded-xl border border-[#E4E4E7] bg-white px-5 py-6 sm:px-6 lg:col-span-4 lg:px-8"
            >
              <span className="font-mono text-xs font-medium tabular-nums text-zinc-400">
                {step.num}
              </span>
              <h3 className="mt-3 text-base font-medium tracking-tight text-zinc-900">
                {step.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-500">
                {step.body}
              </p>
              {i < STEPS.length - 1 && (
                <span
                  aria-hidden
                  className="absolute -right-2 top-1/2 hidden h-px w-4 -translate-y-1/2 bg-zinc-200 sm:block"
                />
              )}
            </li>
          ))}
        </ol>
      </section>

      {/* The Race */}
      <section aria-labelledby="race-heading">
        <SectionLabel>Event</SectionLabel>
        <SectionHeading>
          <span id="race-heading">The race</span>
        </SectionHeading>
        <div className="mt-8 rounded-xl border border-[#E4E4E7] bg-white px-5 py-8 sm:px-8 sm:py-10">
          <p className="max-w-2xl text-[15px] leading-relaxed text-zinc-500 sm:text-base">
            The Great North Run is the world’s biggest half marathon —{" "}
            <span className="font-medium text-zinc-800">60,000+ runners</span>,
            televised coverage, and thousands of spectators lining the{" "}
            <span className="font-medium text-zinc-800">13.1-mile</span>{" "}
            Newcastle-to-South-Shields route. Target finish around{" "}
            <span className="font-medium text-zinc-800">~2:05</span> — your logo
            on course for the full broadcast window.
          </p>
          <dl className="mt-8 grid gap-6 sm:grid-cols-3">
            {[
              { label: "Field", value: "60,000+ runners" },
              { label: "Route", value: "Newcastle → South Shields" },
              { label: "Target time", value: "~2:05" },
            ].map((stat) => (
              <div key={stat.label}>
                <dt className="font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-zinc-400">
                  {stat.label}
                </dt>
                <dd className="mt-1.5 text-lg font-medium tracking-tight text-zinc-900">
                  {stat.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* FAQ */}
      <section aria-labelledby="faq-heading">
        <SectionLabel>Support</SectionLabel>
        <SectionHeading>
          <span id="faq-heading">FAQ</span>
        </SectionHeading>
        <p className="mt-2 max-w-xl text-[15px] leading-relaxed text-zinc-500">
          Straight answers on artwork, print deadlines, payment, and add-ons —
          before you spend a pound.
        </p>

        <div className="mt-8 overflow-hidden rounded-xl border border-[#E4E4E7] bg-white">
          {FAQ_ITEMS.map((item, index) => {
            const open = openFaq === index;
            const panelId = `${faqBaseId}-panel-${index}`;
            const buttonId = `${faqBaseId}-button-${index}`;
            return (
              <div
                key={item.q}
                className={
                  index > 0 ? "border-t border-zinc-100" : undefined
                }
              >
                <h3>
                  <button
                    type="button"
                    id={buttonId}
                    aria-expanded={open}
                    aria-controls={panelId}
                    onClick={() => setOpenFaq(open ? null : index)}
                    className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition hover:bg-zinc-50/80 sm:px-6"
                  >
                    <span className="text-sm font-medium text-zinc-900 sm:text-[15px]">
                      {item.q}
                    </span>
                    <span
                      aria-hidden
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-zinc-200 text-zinc-500 transition ${
                        open ? "rotate-45 bg-zinc-900 text-white border-zinc-900" : ""
                      }`}
                    >
                      +
                    </span>
                  </button>
                </h3>
                <div
                  id={panelId}
                  role="region"
                  aria-labelledby={buttonId}
                  hidden={!open}
                  className="px-5 pb-5 sm:px-6"
                >
                  <p className="max-w-2xl text-sm leading-relaxed text-zinc-500">
                    {item.a}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Claim CTA */}
      <section
        aria-labelledby="claim-cta-heading"
        className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900 px-6 py-10 text-center sm:px-10 sm:py-14"
      >
        <p className="font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-zinc-500">
          Limited race-day inventory
        </p>
        <h2
          id="claim-cta-heading"
          className="mt-3 text-2xl font-medium tracking-tight text-white sm:text-3xl"
        >
          Claim a position
        </h2>
        <p className="mx-auto mt-3 max-w-md text-[15px] leading-relaxed text-zinc-400">
          Direct physical logo placement on race-day kit for the Great North
          Run — pick a spot, upload, lock it in.
        </p>
        <button
          type="button"
          onClick={claimPosition}
          className="mt-8 inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-medium text-zinc-900 transition hover:bg-zinc-100"
        >
          View open placements
        </button>
      </section>
    </div>
  );
}
