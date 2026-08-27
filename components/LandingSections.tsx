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
    perk: "High on the chest, above and around the race bib. Every finish-chute photo, crowd selfie, and front-facing gantry shot.",
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
    title: "Prime real estate.",
    body: "Front and back spots are kept separate so your logo gets maximum, uncluttered visibility. No tiny, hidden side marks or crowded placements.",
  },
  {
    num: "02",
    title: "Premium performance kit.",
    body: "Every logo is printed directly onto lightweight, high-performance gear—including the running shirt, shorts, cap, and socks. Built to look crisp, vibrant, and sharp over all 13.1 miles.",
  },
  {
    num: "03",
    title: "Hard deadline: September 1st.",
    body: "With the race on September 13th, artwork locks on September 1st to guarantee print production, delivery, and a trial run. Once a slot sells or the deadline hits, it's gone.",
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

const RACE_SPECS = [
  { label: "Event", value: "Great North Run", highlight: true },
  { label: "Date", value: "September 13, 2026", highlight: false },
  { label: "Route", value: "Newcastle → South Shields", highlight: false },
  { label: "Distance", value: "13.1 Miles", highlight: true },
  { label: "Field", value: "60,000+ runners", highlight: false },
  { label: "Target Time", value: "~2:05:00", highlight: false },
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
          Ten placements. One kit. Every spot priced for what cameras and
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
        className="relative scroll-mt-24 overflow-hidden rounded-2xl px-4 py-12 sm:px-8 sm:py-16"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(#d1d5db_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_at_center,black_45%,transparent_78%)] [-webkit-mask-image:radial-gradient(ellipse_at_center,black_45%,transparent_78%)]"
        />

        <div className="relative mx-auto max-w-2xl text-center">
          <p className="font-mono text-xs uppercase tracking-widest text-zinc-500">
            Event
          </p>
          <h2
            id="race-heading"
            className="mt-3 text-4xl font-extrabold tracking-tight text-zinc-900 md:text-5xl"
          >
            The race.
          </h2>
          <p className="mt-3 text-base font-medium text-zinc-600 md:text-lg">
            What the money buys and where it goes.
          </p>
        </div>

        <dl className="relative mx-auto mt-10 w-full max-w-2xl divide-y divide-zinc-100 overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-sm">
          {RACE_SPECS.map((row) => (
            <div
              key={row.label}
              className="flex items-baseline justify-between gap-6 px-6 py-4 md:px-8"
            >
              <dt className="shrink-0 font-mono text-xs uppercase tracking-wider text-zinc-500 md:text-sm">
                {row.label}
              </dt>
              <dd
                className={`text-right text-base font-bold tracking-tight md:text-lg ${
                  row.highlight ? "text-zinc-950" : "text-zinc-900"
                }`}
              >
                {row.value}
              </dd>
            </div>
          ))}
        </dl>
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
                  <p className="w-full max-w-none pr-12 text-sm leading-relaxed text-zinc-600 md:text-base">
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
