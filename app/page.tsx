/**
 * Great North Run — Kit Sponsorship Landing Page
 *
 * Server Component: fetches live slot inventory from Supabase,
 * then hydrates the interactive KitVisualizer client island.
 */
import SponsorExperience from "@/components/SponsorExperience";
import { getSlotMetrics, getSponsorshipSlots } from "@/lib/slots";
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
    x_position: 38,
    y_position: 31,
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
    x_position: 8,
    y_position: 30,
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
    x_position: 90,
    y_position: 28,
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
    x_position: 90,
    y_position: 39,
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
    x_position: 42,
    y_position: 7,
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
    x_position: 24,
    y_position: 66,
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
    x_position: 28,
    y_position: 90,
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
    x_position: 62,
    y_position: 90,
    dodo_product_id: null,
  },
];

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const fetched = await getSponsorshipSlots();
  const slots = fetched.length > 0 ? fetched : FALLBACK_SLOTS;
  const metrics = getSlotMetrics(slots);

  return (
    <main className="relative min-h-screen overflow-x-hidden">
      <div className="pointer-events-none fixed inset-0 light-grid" />

      {/* ——— HERO ——— */}
      <header className="relative mx-auto max-w-6xl px-5 pb-12 pt-8 sm:px-8 lg:px-10 lg:pt-10">
        <nav className="animate-fade-up flex items-center justify-between">
          <div>
            <p className="font-display text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
              GNR<span className="text-emerald-600">.</span>
            </p>
            <p className="mt-0.5 text-xs font-medium uppercase tracking-[0.22em] text-slate-400">
              Great North Run · Kit Inventory
            </p>
          </div>
          <a
            href="#kit"
            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
          >
            View Kit
          </a>
        </nav>

        <div className="animate-fade-up-delay mx-auto mt-14 max-w-2xl text-center sm:mt-20">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600">
            Race Day Inventory · Open
          </p>
          <h1 className="mt-4 font-display text-4xl font-bold leading-[1.08] tracking-tight text-slate-900 sm:text-5xl lg:text-[3.25rem]">
            Your brand, on my Great North Run journey.
          </h1>
          <p className="mx-auto mt-5 max-w-lg text-base leading-relaxed text-slate-500 sm:text-lg">
            Sponsor placements on race-day kit for the Tyne Bridge to South
            Shields — aiming for 2:05, with 200,000+ spectators and BBC coverage.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <a
              href="#kit"
              className="inline-flex items-center rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Claim Your Spot on Race Day
            </a>
            <a
              href="#inventory"
              className="inline-flex items-center rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              View rate card
            </a>
          </div>

          <div className="animate-fade-up-delay-2 mt-12 grid grid-cols-2 gap-6 sm:grid-cols-4 sm:gap-8">
            <MetricCell label="Miles trained" value="420+" />
            <MetricCell label="Goal time" value="2:05" />
            <MetricCell
              label="Available"
              value={`${metrics.available}`}
              hint={`of ${metrics.total}`}
            />
            <MetricCell label="Claimed" value={`${metrics.sold}`} />
          </div>
        </div>
      </header>

      {/* ——— KIT VISUALIZER ——— */}
      <section
        id="kit"
        className="relative mx-auto max-w-6xl px-5 py-10 sm:px-8 lg:px-10 lg:py-14"
      >
        <div className="mb-8 max-w-xl">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
            Interactive kit
          </p>
          <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Pick your placement.
          </h2>
          <p className="mt-3 text-slate-500">
            Emerald badges are live inventory. Sold zones show the sponsor logo
            stamped on the garment.
          </p>
        </div>

        <SponsorExperience slots={slots} />
      </section>

      {/* ——— INVENTORY TABLE ——— */}
      <section
        id="inventory"
        className="relative mx-auto max-w-6xl px-5 pb-24 sm:px-8 lg:px-10"
      >
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
            Full inventory
          </p>
          <h2 className="mt-2 font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Sponsorship rate card
          </h2>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead className="border-b border-slate-100 bg-slate-50/80 text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                <tr>
                  <th className="px-5 py-3.5 font-semibold">Slot</th>
                  <th className="px-5 py-3.5 font-semibold">Category</th>
                  <th className="px-5 py-3.5 font-semibold">Price</th>
                  <th className="px-5 py-3.5 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {slots.map((slot) => (
                  <tr
                    key={slot.id}
                    className="border-b border-slate-100 last:border-0 transition hover:bg-slate-50/80"
                  >
                    <td className="px-5 py-3.5 font-medium text-slate-900">
                      {slot.slot_name}
                    </td>
                    <td className="px-5 py-3.5 capitalize text-slate-500">
                      {slot.category}
                    </td>
                    <td className="px-5 py-3.5 font-semibold tabular-nums text-slate-900">
                      £{slot.price_gbp}
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusPill status={slot.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-white/60 py-10 text-center backdrop-blur-sm">
        <p className="font-display text-lg font-bold text-slate-900">
          GNR<span className="text-emerald-600">.</span>
        </p>
        <p className="mt-2 text-xs font-medium uppercase tracking-[0.2em] text-slate-400">
          Newcastle → South Shields · 13.1 Miles
        </p>
      </footer>
    </main>
  );
}

function MetricCell({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="text-center">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
        {label}
      </p>
      <p className="mt-1.5 font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
        {value}
      </p>
      {hint ? (
        <p className="mt-0.5 text-xs text-slate-400">{hint}</p>
      ) : null}
    </div>
  );
}

function StatusPill({ status }: { status: SponsorshipSlot["status"] }) {
  if (status === "available") {
    return (
      <span className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
        Available
      </span>
    );
  }
  if (status === "pending") {
    return (
      <span className="inline-flex rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
        Pending
      </span>
    );
  }
  return (
    <span className="inline-flex rounded-full border border-slate-200 bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-400">
      Sold
    </span>
  );
}
