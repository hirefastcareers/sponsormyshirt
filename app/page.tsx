/**
 * Great North Run — Kit Sponsorship Landing Page
 *
 * Server Component: fetches live slot inventory from Supabase,
 * then hydrates the split-screen sponsorship experience.
 */
import BrandMark from "@/components/BrandMark";
import CharityPledgeCallout from "@/components/CharityPledgeCallout";
import CharityTransparency from "@/components/CharityTransparency";
import MicroSponsorShell, {
  MicroSponsorHeroCTA,
  MicroSponsorMarqueeBlock,
} from "@/components/MicroSponsorShell";
import PaymentSuccessBanner from "@/components/PaymentSuccessBanner";
import SiteHeader from "@/components/SiteHeader";
import SponsorExperience from "@/components/SponsorExperience";
import TakenBanner from "@/components/TakenBanner";
import {
  applyCanonicalPrices,
  filterActiveSlots,
  getActivePositionIds,
  getKitPositions,
  POSITION_META,
  POSITION_PRICES,
  TITLE_TAKEOVER,
  type PositionId,
} from "@/lib/positions";
import { getMicroSponsors } from "@/lib/micro-sponsors";
import { getSponsorshipSlots } from "@/lib/slots";
import type { SponsorshipSlot } from "@/types/sponsorship";

/** Demo inventory used when Supabase is not yet configured. */
const FALLBACK_SLOTS: SponsorshipSlot[] = [
  {
    id: TITLE_TAKEOVER.id,
    slot_name: TITLE_TAKEOVER.slot_name,
    category: TITLE_TAKEOVER.category,
    price_gbp: TITLE_TAKEOVER.price_gbp,
    status: "available",
    sponsor_name: null,
    sponsor_url: null,
    sponsor_logo_url: null,
    x_position: 50,
    y_position: 50,
    dodo_product_id: null,
    active: true,
  },
  ...getActivePositionIds().map((id: PositionId) => ({
    id,
    slot_name: POSITION_META[id].slot_name,
    category: POSITION_META[id].category,
    price_gbp: POSITION_PRICES[id],
    status: "available" as const,
    sponsor_name: null,
    sponsor_url: null,
    sponsor_logo_url: null,
    x_position: 50,
    y_position: 50,
    dodo_product_id: null,
    active: POSITION_META[id].active,
  })),
];

export const dynamic = "force-dynamic";

function firstParam(
  value: string | string[] | undefined,
): string | null {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value[0] ?? null;
  return null;
}

export default async function HomePage({
  searchParams,
}: PageProps<"/">) {
  const params = await searchParams;
  const taken = firstParam(params.taken);
  const payment = firstParam(params.payment);
  const successSlotId = firstParam(params.slot);

  const fetched = await getSponsorshipSlots();
  const microSponsors = await getMicroSponsors();
  const slots = filterActiveSlots(
    applyCanonicalPrices(fetched.length > 0 ? fetched : FALLBACK_SLOTS),
  );
  const kitPositions = getKitPositions(slots);
  const claimed = kitPositions.filter(
    (s) => s.status === "sold" || s.status === "pending",
  ).length;

  const successSlot =
    payment === "success" && successSlotId
      ? slots.find((s) => s.id === successSlotId) ?? null
      : null;

  return (
    <MicroSponsorShell sponsors={microSponsors}>
      <main className="min-h-screen bg-[#F9F9FB]">
        <PaymentSuccessBanner slot={successSlot} />
        <TakenBanner taken={taken} />
        <SiteHeader />

        <section
          id="hero-section"
          className="mx-auto w-full max-w-7xl px-6 pb-6 pt-8 lg:px-12 lg:pt-10"
        >
          <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
            <p className="font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-zinc-400">
              PRINTED KIT • Artwork deadline closes September 3rd
            </p>
            <h1 className="mt-3 text-3xl font-medium tracking-tight text-zinc-900 sm:text-4xl lg:text-[2.75rem] lg:leading-[1.1]">
              Your brand, on my Great North Run kit.
            </h1>
            <p className="mt-3 text-[15px] leading-relaxed text-zinc-500 sm:text-base">
              {kitPositions.length} logo placements across shirt, shorts, and
              socks. 13.1 miles from Tyne Bridge to South Shields—aiming for
              2:05.
            </p>
            <CharityPledgeCallout />
            <MicroSponsorHeroCTA />
          </div>
          <p className="mt-6 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
            <span>
              <span className="font-medium text-zinc-700">
                {kitPositions.length}
              </span>{" "}
              placements
            </span>
            <span aria-hidden className="text-zinc-300">·</span>
            <span>
              <span className="font-medium text-zinc-700">{claimed}</span>{" "}
              claimed
            </span>
          </p>
        </section>

        <section className="mx-auto w-full max-w-7xl px-6 pb-20 lg:px-12 lg:pb-24">
          <SponsorExperience slots={slots} />
          <div className="mx-auto mt-12 max-w-3xl border-t border-[#E4E4E7] pt-10">
            <MicroSponsorMarqueeBlock />
          </div>
        </section>

        <footer className="border-t border-[#E4E4E7] bg-zinc-900 text-zinc-100">
          <div className="mx-auto w-full max-w-7xl px-6 py-10 lg:px-12">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between sm:gap-10">
              <div className="space-y-3">
                <BrandMark variant="dark" href="#" />
                <p className="text-sm text-zinc-400">Independent project.</p>
              </div>
              <div className="max-w-md space-y-3 sm:text-right">
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm sm:justify-end">
                  <a
                    href="mailto:tomford61@gmail.com"
                    className="text-zinc-100 underline-offset-4 transition hover:underline"
                  >
                    tomford61@gmail.com
                  </a>
                  <a
                    href="https://x.com/sponsormyshirt"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-zinc-100 underline-offset-4 transition hover:underline"
                  >
                    X
                  </a>
                </div>
                <p className="text-xs leading-relaxed text-zinc-500">
                  Not affiliated with or endorsed by the Great North Run or its
                  official organizers.
                </p>
              </div>
            </div>
            <CharityTransparency slots={slots} />
          </div>
        </footer>
      </main>
    </MicroSponsorShell>
  );
}
