"use client";

/**
 * Below-the-fold landing content: positions, division, process,
 * race context, FAQ, and claim CTA.
 */
import { useId, useState, type ReactNode } from "react";
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
    perk: "Prime broadcast real estate. Every finish-chute photo, crowd selfie, and front-facing gantry shot.",
    tier: "primary",
  },
  left_chest: {
    dimensions: "80 × 80 mm",
    perk: "Heart-side placement. In frame for close-ups and race-day portraits.",
    tier: "primary",
  },
  upper_back: {
    dimensions: "180 × 100 mm",
    perk: "13.1 miles of continuous tracking. Seen by every runner and follow-cam behind me for two hours.",
    tier: "primary",
  },
  lower_back: {
    dimensions: "150 × 80 mm",
    perk: "Follow-cam real estate. Stays locked in frame whenever the pack trails.",
    tier: "secondary",
  },
  cap_front: {
    dimensions: "80 × 50 mm",
    perk: "Eye-level brand placement. Straight down the line of every gantry camera.",
    tier: "primary",
  },
  shorts_left: {
    dimensions: "100 × 60 mm",
    perk: "Dynamic stride action. In shot for 13.1 miles of leg work.",
    tier: "secondary",
  },
  shorts_right: {
    dimensions: "100 × 60 mm",
    perk: "Dynamic stride action. In shot for 13.1 miles of leg work.",
    tier: "secondary",
  },
  right_sleeve: {
    dimensions: "80 × 60 mm",
    perk: "Side-profile visibility. Arms swinging through every lateral photo angle.",
    tier: "secondary",
  },
  left_sleeve: {
    dimensions: "80 × 60 mm",
    perk: "Side-profile visibility. Arms swinging through every lateral photo angle.",
    tier: "secondary",
  },
  left_sock: {
    dimensions: "60 × 40 mm",
    perk: "Low-angle action detail. Low-stride cuts and finish-chute moments.",
    tier: "secondary",
  },
  right_sock: {
    dimensions: "60 × 40 mm",
    perk: "Low-angle action detail. Low-stride cuts and finish-chute moments.",
    tier: "secondary",
  },
};

const DIVISION_RULES = [
  {
    num: "01",
    title: "Front and back are separate brands.",
    body: "The shirt carries clear front and back real estate. Nobody is buying a wrap that repeats the same mark, because nobody ever sees both at once.",
  },
  {
    num: "02",
    title: "Printed once, zero cheap vinyl.",
    body: "Every placement is sublimated directly into the fabric of a high-performance custom race suit—no peeling stickers or heavy patches.",
  },
  {
    num: "03",
    title: "Fast-turnaround kit printing.",
    body: "With race day on September 13th, kit artwork locks on September 1st to allow express printing and a quick test run. Once inventory is gone or September 1st hits, the board locks.",
  },
] as const;

const STEPS = [
  {
    num: "01",
    title: "Pick a spot & pay.",
    body: "Card checkout via Dodo, instant confirmation. The spot is marked sold the moment it clears.",
  },
  {
    num: "02",
    title: "Send artwork immediately.",
    body: "PNG, SVG, or WebP. Transparent backgrounds preferred. You'll get a digital proof to approve before the file goes to the printer on September 1st.",
  },
  {
    num: "03",
    title: "Race day & visibility.",
    body: "Your brand runs past 60,000+ runners and hundreds of thousands of spectators lining the course from Newcastle to South Shields on September 13th.",
  },
] as const;

const RACE_STATS = [
  { label: "Field", value: "60,000+ runners" },
  { label: "Route", value: "Newcastle → South Shields" },
  { label: "Distance", value: "13.1 Miles" },
  { label: "Target", value: "~2:05" },
] as const;

const FAQ_ITEMS = [
  {
    q: "What do I actually get?",
    a: "Your logo printed onto my race-day kit, digital proof sign-off before printing, and direct exposure in front of 60,000+ runners and dense crowd coverage on September 13th.",
  },
  {
    q: "When is the printing deadline?",
    a: "Artwork closes strict on September 1st so the suit can be express printed, shipped, and tested before race morning.",
  },
  {
    q: "What if I hate the proof?",
    a: "Kit proofs are signed off by you in writing before the file goes to the printer. If the digital proof isn't right, we fix the layout before printing.",
  },
  {
    q: "Who can’t buy?",
    a: "No adult content, no gambling, no illegal products, and no medical/supplement claims. The test is simple: if I wouldn't post it from my personal account, it doesn't go on my kit.",
  },
  {
    q: "Can I buy more than one slot?",
    a: "Yes. Buy them one by one. Nothing stops one brand from taking multiple slots (e.g., matching both sleeves or both socks).",
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
    document
      .getElementById("kit-viewer")
      ?.scrollIntoView({ behavior: "smooth" });
    onClaim();
  }

  return (
    <div className="space-y-16 sm:space-y-20">
      {/* Positions */}
      <section
        id="positions"
        aria-labelledby="positions-heading"
        className="scroll-mt-24"
      >
        <SectionLabel>Inventory</SectionLabel>
        <SectionHeading>
          <span id="positions-heading">Positions</span>
        </SectionHeading>
        <p className="mt-2 w-full text-[15px] leading-relaxed text-zinc-500">
          Eleven placements. One kit. Every spot priced for what cameras and
          crowds actually see.
        </p>

        <div className="mt-8 overflow-hidden rounded-xl border border-[#E4E4E7] bg-white">
          <div className="hidden grid-cols-12 gap-4 border-b border-zinc-100 px-5 py-3 font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-zinc-400 sm:grid sm:px-6 lg:px-8">
            <span className="col-span-1">#</span>
            <span className="col-span-4">Placement</span>
            <span className="col-span-2">Size</span>
            <span className="col-span-5">Visibility</span>
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
                  className="grid gap-2 px-5 py-4 sm:grid-cols-12 sm:items-center sm:gap-4 sm:px-6 lg:px-8"
                >
                  <span className="font-mono text-xs tabular-nums text-zinc-400 sm:col-span-1">
                    {zone.num}
                  </span>
                  <div className="sm:col-span-4">
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
                  <p className="font-mono text-xs tabular-nums text-zinc-600 sm:col-span-2">
                    {detail.dimensions}
                  </p>
                  <p className="text-sm leading-snug text-zinc-500 sm:col-span-5">
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
        <p className="mt-2 w-full text-[15px] leading-relaxed text-zinc-500">
          Three rules. No partnership fog. No soft inventory.
        </p>

        <ol className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
          {DIVISION_RULES.map((rule) => (
            <li
              key={rule.num}
              className="rounded-xl border border-[#E4E4E7] bg-white px-5 py-6 sm:px-6 lg:px-8"
            >
              <span className="font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-zinc-900">
                Rule {rule.num}
              </span>
              <h3 className="mt-4 text-lg font-medium tracking-tight text-zinc-900">
                {rule.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-zinc-500">
                {rule.body}
              </p>
            </li>
          ))}
        </ol>
      </section>

      {/* How it works */}
      <section
        id="how-it-works"
        aria-labelledby="works-heading"
        className="scroll-mt-24"
      >
        <SectionLabel>Process</SectionLabel>
        <SectionHeading>
          <span id="works-heading">How it works</span>
        </SectionHeading>
        <p className="mt-2 w-full text-[15px] leading-relaxed text-zinc-500">
          Pick a spot. Pay. Send artwork. Done before September 1st.
        </p>

        <ol className="mt-8 grid gap-4 sm:grid-cols-3 lg:grid-cols-12">
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
      <section
        id="the-race"
        aria-labelledby="race-heading"
        className="scroll-mt-24"
      >
        <SectionLabel>Event</SectionLabel>
        <SectionHeading>
          <span id="race-heading">The race</span>
        </SectionHeading>
        <div className="mt-8 grid grid-cols-1 items-center gap-8 lg:grid-cols-2">
          <p className="max-w-xl text-[15px] leading-relaxed text-zinc-700 sm:text-base">
            I&apos;m running the Great North Run on September 13th — the
            world&apos;s largest half marathon. Newcastle to South Shields,
            13.1 miles, targeting ~2:05. Your logo runs the full course in front
            of a 60,000+ field and televised coverage.
          </p>
          <dl className="divide-y divide-zinc-100 overflow-hidden rounded-xl border border-zinc-200 bg-white">
            {[0, 2].map((start) => (
              <div
                key={start}
                className="grid grid-cols-2 divide-x divide-zinc-100"
              >
                {RACE_STATS.slice(start, start + 2).map((stat) => (
                  <div
                    key={stat.label}
                    className="px-5 py-6 sm:px-6 sm:py-8"
                  >
                    <dt className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                      {stat.label}
                    </dt>
                    <dd className="mt-2 text-xl font-bold tracking-tight text-zinc-900">
                      {stat.value}
                    </dd>
                  </div>
                ))}
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* FAQ */}
      <section
        id="faq"
        aria-labelledby="faq-heading"
        className="scroll-mt-24"
      >
        <SectionLabel>Support</SectionLabel>
        <SectionHeading>
          <span id="faq-heading">FAQ</span>
        </SectionHeading>
        <p className="mt-2 w-full text-[15px] leading-relaxed text-zinc-500">
          Direct answers. No soft language.
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
                    className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition hover:bg-zinc-50/80 sm:px-6 lg:px-8"
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
                  className="px-5 pb-5 sm:px-6 lg:px-8"
                >
                  <p className="max-w-3xl text-sm leading-relaxed text-zinc-500">
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
        <h2
          id="claim-cta-heading"
          className="text-2xl font-medium tracking-tight text-white sm:text-3xl"
        >
          Claim a position
        </h2>
        <p className="mx-auto mt-3 max-w-md text-[15px] leading-relaxed text-zinc-400">
          Direct physical logo placement on race day. Pick a spot, upload
          artwork before September 1st, lock it in.
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
