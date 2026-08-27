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
    perk: "Highest visibility — front-facing crowd & camera shots",
    tier: "primary",
  },
  left_chest: {
    dimensions: "80 × 80 mm",
    perk: "Heart-side detail — close-ups and finish-line photos",
    tier: "primary",
  },
  upper_back: {
    dimensions: "180 × 100 mm",
    perk: "Chase-cam & pack runners see this for miles",
    tier: "primary",
  },
  lower_back: {
    dimensions: "150 × 80 mm",
    perk: "Secondary back real estate for follow footage",
    tier: "secondary",
  },
  cap_front: {
    dimensions: "80 × 50 mm",
    perk: "Eye-level brand hit at the finish gantry",
    tier: "primary",
  },
  shorts_left: {
    dimensions: "100 × 60 mm",
    perk: "Side-on stride visibility along the barriers",
    tier: "secondary",
  },
  shorts_right: {
    dimensions: "100 × 60 mm",
    perk: "Side-on stride visibility along the barriers",
    tier: "secondary",
  },
  right_sleeve: {
    dimensions: "80 × 60 mm",
    perk: "Arm-swing motion — repeated glimpses on course",
    tier: "secondary",
  },
  left_sleeve: {
    dimensions: "80 × 60 mm",
    perk: "Arm-swing motion — repeated glimpses on course",
    tier: "secondary",
  },
  left_sock: {
    dimensions: "60 × 40 mm",
    perk: "Low-angle & finish-chute detail shots",
    tier: "secondary",
  },
  right_sock: {
    dimensions: "60 × 40 mm",
    perk: "Low-angle & finish-chute detail shots",
    tier: "secondary",
  },
};

const STEPS = [
  {
    num: "01",
    title: "Pick & reserve your slot",
    body: "Choose a placement on the kit map or rate card. Checkout holds it while you pay.",
  },
  {
    num: "02",
    title: "Upload logo & destination link",
    body: "Send a clean PNG, SVG, or WebP plus the URL your placement should point to.",
  },
  {
    num: "03",
    title: "Watch it run live on race day",
    body: "Your brand hits the course from Newcastle to South Shields — then you get high-res race photos afterwards.",
  },
] as const;

const FAQ_ITEMS = [
  {
    q: "What logo formats are accepted?",
    a: "PNG, SVG, and WebP. Vector (SVG) or high-resolution transparent PNGs print cleanest on fabric.",
  },
  {
    q: "When will physical printing happen?",
    a: "Logos are locked after payment and printed onto the race kit in the days before race weekend. You'll get a proof once artwork is approved for print.",
  },
  {
    q: "Will I get high-res race photos showing my brand?",
    a: "Yes. After the event you’ll receive a curated set of high-resolution photos that clearly show your placement on course and at the finish.",
  },
  {
    q: "How do the add-ons (social post & backlink) work?",
    a: `Optional at checkout: ${SOCIAL_POST_ADDON.title} (£${SOCIAL_POST_ADDON.price_gbp}) is a dedicated announcement on X & LinkedIn tagging your brand. ${DOFOLLOW_LINK_ADDON.title} (£${DOFOLLOW_LINK_ADDON.price_gbp}) adds a permanent clickable link on sponsormyshirt.app.`,
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
          Every available kit location, print size, and why it earns attention
          on race day.
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
          Kit real estate is split so every sponsor gets a defined print area —
          no overlaps, no surprise shares.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-[#E4E4E7] bg-white px-5 py-6 sm:px-6">
            <p className="flex items-center gap-2 font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-emerald-700">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-600" />
              High visibility
            </p>
            <h3 className="mt-3 text-lg font-medium tracking-tight text-zinc-900">
              Front of shirt, upper back, cap
            </h3>
            <p className="mt-2 text-[15px] leading-relaxed text-zinc-500">
              Chest center, left chest, upper back, and cap front sit in the
              frame for crowd photos, broadcast angles, and finish-line shots.
              These are the premium placements on the rate card.
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
              Still on the athlete for 13.1 miles — ideal for complementary
              brands, product lines, or a lower entry point while the primary
              zones are claimed.
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
          Three steps from open inventory to your logo on the course.
        </p>

        <ol className="mt-8 grid gap-4 sm:grid-cols-3">
          {STEPS.map((step, i) => (
            <li
              key={step.num}
              className="relative rounded-xl border border-[#E4E4E7] bg-white px-5 py-6 sm:px-6"
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
            The Great North Run is the world’s largest half marathon —{" "}
            <span className="font-medium text-zinc-800">13.1 miles</span> from
            Newcastle upon Tyne to South Shields. Target finish around{" "}
            <span className="font-medium text-zinc-800">2:05</span>, with a
            massive roadside crowd and national television coverage along the
            route.
          </p>
          <dl className="mt-8 grid gap-6 sm:grid-cols-3">
            {[
              { label: "Distance", value: "13.1 miles" },
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
          Common questions before you claim a placement.
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
          Pick your placement on the kit map, upload your logo, and get your
          brand on course for the Great North Run.
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
