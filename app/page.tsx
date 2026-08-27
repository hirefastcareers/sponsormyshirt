/**
 * Great North Run — Kit Sponsorship Landing Page
 *
 * Server Component: fetches live slot inventory from Supabase,
 * then hydrates the split-screen sponsorship experience.
 */
import SponsorExperience from "@/components/SponsorExperience";
import { getSponsorshipSlots } from "@/lib/slots";
import type { SponsorshipSlot } from "@/types/sponsorship";

/** Demo inventory used when Supabase is not yet configured. */
const FALLBACK_SLOTS: SponsorshipSlot[] = [
  {
    id: "chest_center",
    slot_name: "Chest Center",
    category: "shirt",
    price_gbp: 350,
    status: "available",
    sponsor_name: null,
    sponsor_url: null,
    sponsor_logo_url: null,
    x_position: 50,
    y_position: 52,
    dodo_product_id: null,
  },
  {
    id: "left_chest",
    slot_name: "Left Chest / Heart",
    category: "shirt",
    price_gbp: 250,
    status: "available",
    sponsor_name: null,
    sponsor_url: null,
    sponsor_logo_url: null,
    x_position: 32,
    y_position: 40,
    dodo_product_id: null,
  },
  {
    id: "upper_back",
    slot_name: "Upper Back",
    category: "shirt",
    price_gbp: 200,
    status: "available",
    sponsor_name: null,
    sponsor_url: null,
    sponsor_logo_url: null,
    x_position: 50,
    y_position: 34,
    dodo_product_id: null,
  },
  {
    id: "lower_back",
    slot_name: "Lower Back",
    category: "shirt",
    price_gbp: 150,
    status: "available",
    sponsor_name: null,
    sponsor_url: null,
    sponsor_logo_url: null,
    x_position: 50,
    y_position: 62,
    dodo_product_id: null,
  },
  {
    id: "cap_front",
    slot_name: "Cap Front",
    category: "headwear",
    price_gbp: 100,
    status: "available",
    sponsor_name: null,
    sponsor_url: null,
    sponsor_logo_url: null,
    x_position: 48,
    y_position: 38,
    dodo_product_id: null,
  },
  {
    id: "shorts_left",
    slot_name: "Shorts Left Leg",
    category: "shorts",
    price_gbp: 90,
    status: "available",
    sponsor_name: null,
    sponsor_url: null,
    sponsor_logo_url: null,
    x_position: 36,
    y_position: 48,
    dodo_product_id: null,
  },
  {
    id: "right_sleeve",
    slot_name: "Right Sleeve",
    category: "shirt",
    price_gbp: 75,
    status: "available",
    sponsor_name: null,
    sponsor_url: null,
    sponsor_logo_url: null,
    x_position: 14,
    y_position: 28,
    dodo_product_id: null,
  },
  {
    id: "left_sleeve",
    slot_name: "Left Sleeve",
    category: "shirt",
    price_gbp: 75,
    status: "available",
    sponsor_name: null,
    sponsor_url: null,
    sponsor_logo_url: null,
    x_position: 86,
    y_position: 28,
    dodo_product_id: null,
  },
  {
    id: "left_sock",
    slot_name: "Left Sock",
    category: "socks",
    price_gbp: 50,
    status: "available",
    sponsor_name: null,
    sponsor_url: null,
    sponsor_logo_url: null,
    x_position: 26,
    y_position: 36,
    dodo_product_id: null,
  },
  {
    id: "right_sock",
    slot_name: "Right Sock",
    category: "socks",
    price_gbp: 50,
    status: "available",
    sponsor_name: null,
    sponsor_url: null,
    sponsor_logo_url: null,
    x_position: 74,
    y_position: 36,
    dodo_product_id: null,
  },
];

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const fetched = await getSponsorshipSlots();
  const slots = fetched.length > 0 ? fetched : FALLBACK_SLOTS;
  const claimed = slots.filter(
    (s) => s.status === "sold" || s.status === "pending",
  ).length;

  return (
    <main className="min-h-screen bg-[#F9F9FB]">
      <header className="border-b border-[#E4E4E7] bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
          <div className="flex items-baseline gap-3">
            <span className="text-[17px] font-semibold tracking-tight text-zinc-900">
              Great North Run
            </span>
            <span className="hidden font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-zinc-400 sm:inline">
              Kit Sponsorship
            </span>
          </div>
          <div className="flex items-center gap-6">
            <div className="hidden items-center gap-4 text-xs text-zinc-500 sm:flex">
              <span>
                <span className="font-medium text-zinc-800">{slots.length}</span>{" "}
                placements
              </span>
              <span className="h-3 w-px bg-zinc-200" />
              <span>
                <span className="font-medium text-zinc-800">{claimed}</span>{" "}
                claimed
              </span>
            </div>
            <a
              href="#kit"
              className="rounded-full bg-zinc-900 px-4 py-2 text-xs font-medium text-white transition hover:bg-zinc-800"
            >
              Claim a placement
            </a>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-5 pb-6 pt-8 sm:px-8 sm:pt-10">
        <p className="flex items-center gap-2 font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-zinc-400">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-600" />
          Race-day inventory open
        </p>
        <h1 className="mt-3 max-w-2xl text-3xl font-medium tracking-tight text-zinc-900 sm:text-4xl lg:text-[2.75rem] lg:leading-[1.1]">
          Your brand, on my Great North Run kit.
        </h1>
        <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-zinc-500 sm:text-base">
          Ten placements across shirt, shorts, socks and cap. Tyne Bridge to
          South Shields — 13.1 miles, aiming for 2:05.
        </p>
      </section>

      <section id="kit" className="mx-auto max-w-7xl px-5 pb-16 sm:px-8">
        <SponsorExperience slots={slots} />
      </section>

      <footer className="border-t border-[#E4E4E7] bg-zinc-900 text-zinc-100">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-5 py-8 sm:px-8">
          <span className="text-sm font-semibold">Great North Run</span>
          <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-zinc-500">
            Newcastle → South Shields · 13.1 miles
          </span>
        </div>
      </footer>
    </main>
  );
}
