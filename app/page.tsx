/**
 * Great North Run — Kit Sponsorship Landing Page
 *
 * Server Component: fetches live slot inventory from Supabase,
 * then hydrates the split-screen sponsorship experience.
 */
import PaymentSuccessBanner from "@/components/PaymentSuccessBanner";
import SiteHeader from "@/components/SiteHeader";
import SponsorExperience from "@/components/SponsorExperience";
import TakenBanner from "@/components/TakenBanner";
import VisitorCounter from "@/components/VisitorCounter";
import {
  applyCanonicalPrices,
  getKitPositions,
  POSITION_META,
  POSITION_PRICES,
  TITLE_TAKEOVER,
  type PositionId,
} from "@/lib/positions";
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
  },
  ...(Object.keys(POSITION_PRICES) as PositionId[]).map((id) => ({
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
  const slots = applyCanonicalPrices(
    fetched.length > 0 ? fetched : FALLBACK_SLOTS,
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
    <main className="min-h-screen bg-[#F9F9FB]">
      <PaymentSuccessBanner slot={successSlot} />
      <TakenBanner taken={taken} />
      <SiteHeader />

      <section className="mx-auto w-full max-w-7xl px-6 pb-6 pt-8 lg:px-12 lg:pt-10">
        <div className="grid grid-cols-1 items-end gap-6 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <p className="flex items-center gap-2 font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-zinc-400">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-600" />
              Printed kit • Artwork deadline closes September 1st.
            </p>
            <h1 className="mt-3 text-3xl font-medium tracking-tight text-zinc-900 sm:text-4xl lg:text-[2.75rem] lg:leading-[1.1]">
              Your brand, on my Great North Run kit.
            </h1>
            <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-zinc-500 sm:text-base">
              11 placements across shirt, shorts, cap, and socks. Tyne Bridge to
              South Shields — 13.1 miles, aiming for 2:05.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-zinc-500 lg:col-span-4 lg:justify-end">
            <VisitorCounter />
            <span>
              <span className="font-medium text-zinc-800">
                {kitPositions.length}
              </span>{" "}
              placements
            </span>
            <span className="h-3 w-px bg-zinc-200" aria-hidden />
            <span>
              <span className="font-medium text-zinc-800">{claimed}</span>{" "}
              claimed
            </span>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-6 pb-20 lg:px-12 lg:pb-24">
        <SponsorExperience slots={slots} />
      </section>

      <footer className="border-t border-[#E4E4E7] bg-zinc-900 text-zinc-100">
        <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-3 px-6 py-8 lg:px-12">
          <span className="text-sm font-semibold">GNR Kit Sponsorships</span>
          <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-zinc-500">
            Newcastle → South Shields · 13.1 miles
          </span>
        </div>
      </footer>
    </main>
  );
}
