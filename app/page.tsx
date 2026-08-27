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
    x_position: 50,
    y_position: 28,
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
    x_position: 38,
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
    x_position: 72,
    y_position: 26,
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
    x_position: 72,
    y_position: 42,
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
    x_position: 22,
    y_position: 12,
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
    x_position: 42,
    y_position: 62,
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
    x_position: 38,
    y_position: 88,
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
    x_position: 52,
    y_position: 88,
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
      {/* Atmospheric blueprint field */}
      <div className="pointer-events-none fixed inset-0 blueprint-grid opacity-40" />
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(16,185,129,0.12),_transparent_55%)]" />

      {/* ——— HERO ——— */}
      <header className="relative mx-auto flex min-h-[100svh] max-w-6xl flex-col px-5 pb-10 pt-8 sm:px-8 lg:px-10">
        <nav className="animate-fade-up flex items-center justify-between">
          <div>
            <p className="font-display text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
              GNR<span className="text-emerald-400">.</span>
            </p>
            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-slate-500">
              Great North Run · Kit Inventory
            </p>
          </div>
          <a
            href="#kit"
            className="border border-emerald-500/40 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.2em] text-emerald-400 transition hover:bg-emerald-500/10"
          >
            View Kit
          </a>
        </nav>

        <div className="flex flex-1 flex-col justify-center gap-10 py-16 lg:grid lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-12 lg:py-0">
          <div>
            <p className="animate-fade-up font-mono text-[11px] uppercase tracking-[0.35em] text-emerald-400/90">
              Race Day Inventory · Open
            </p>
            <h1 className="animate-fade-up-delay mt-4 max-w-xl font-display text-4xl font-bold leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-6xl">
              Your Brand, on my{" "}
              <span className="text-emerald-400">Great North Run</span> journey.
            </h1>
            <p className="animate-fade-up-delay-2 mt-5 max-w-lg text-base leading-relaxed text-slate-400 sm:text-lg">
              Sponsoring my 21.1km run across the Tyne Bridge to South Shields.
              Aiming for a 2:05 finish. Estimated 200,000+ race day spectators
              and BBC live TV coverage.
            </p>

            <div className="animate-fade-up-delay-2 mt-8 flex flex-wrap gap-3">
              <a
                href="#kit"
                className="inline-flex items-center border border-emerald-400 bg-emerald-500/15 px-5 py-3 font-mono text-xs uppercase tracking-[0.2em] text-emerald-300 transition hover:bg-emerald-500/25"
              >
                Claim a Slot
              </a>
              <a
                href="#inventory"
                className="inline-flex items-center border border-slate-700 px-5 py-3 font-mono text-xs uppercase tracking-[0.2em] text-slate-400 transition hover:border-slate-500 hover:text-slate-200"
              >
                Price List
              </a>
            </div>
          </div>

          {/* Metrics strip — target KPIs */}
          <div className="animate-fade-up-delay-2 grid grid-cols-2 gap-px border border-emerald-500/20 bg-emerald-500/20 sm:grid-cols-2">
            <MetricCell label="Miles Trained" value="420+" hint="YTD volume" />
            <MetricCell label="Goal Time" value="2:05:00" hint="Half marathon" />
            <MetricCell
              label="Slots Available"
              value={`${metrics.available}`}
              hint={`of ${metrics.total} total`}
            />
            <MetricCell
              label="Slots Sold"
              value={`${metrics.sold}`}
              hint={
                metrics.pending > 0
                  ? `${metrics.pending} pending`
                  : "live inventory"
              }
            />
          </div>
        </div>

        <div className="animate-fade-up-delay-2 flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.25em] text-slate-600">
          <span className="h-px flex-1 bg-slate-800" />
          Scroll to interactive kit
          <span className="h-px flex-1 bg-slate-800" />
        </div>
      </header>

      {/* ——— KIT VISUALIZER ——— */}
      <section id="kit" className="relative mx-auto max-w-6xl px-5 py-20 sm:px-8 lg:px-10">
        <div className="mb-8 max-w-2xl">
          <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-emerald-400/80">
            Interactive Blueprint
          </p>
          <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Pick your placement on the kit.
          </h2>
          <p className="mt-3 text-slate-400">
            Emerald pins are live inventory. Sold placements show the sponsor
            logo stamped directly on the blueprint.
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
          <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-emerald-400/80">
            Full Inventory
          </p>
          <h2 className="mt-2 font-display text-2xl font-bold text-white sm:text-3xl">
            Sponsorship rate card
          </h2>
        </div>

        <div className="overflow-x-auto border border-slate-800">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead className="border-b border-slate-800 bg-slate-950/60 font-mono text-[10px] uppercase tracking-[0.2em] text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Slot</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Price</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {slots.map((slot) => (
                <tr
                  key={slot.id}
                  className="border-b border-slate-800/80 transition hover:bg-emerald-500/5"
                >
                  <td className="px-4 py-3 text-slate-200">{slot.slot_name}</td>
                  <td className="px-4 py-3 font-mono text-xs uppercase text-slate-500">
                    {slot.category}
                  </td>
                  <td className="px-4 py-3 font-mono text-emerald-400">
                    £{slot.price_gbp}
                  </td>
                  <td className="px-4 py-3">
                    <StatusPill status={slot.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <footer className="border-t border-slate-800 py-10 text-center">
        <p className="font-display text-lg text-white">
          GNR<span className="text-emerald-400">.</span>
        </p>
        <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.25em] text-slate-600">
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
  hint: string;
}) {
  return (
    <div className="bg-slate-950/90 px-4 py-5 sm:px-5 sm:py-6">
      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-slate-500">
        {label}
      </p>
      <p className="mt-2 font-display text-2xl font-bold tracking-tight text-white sm:text-3xl">
        {value}
      </p>
      <p className="mt-1 font-mono text-[10px] text-emerald-500/70">{hint}</p>
    </div>
  );
}

function StatusPill({ status }: { status: SponsorshipSlot["status"] }) {
  const styles =
    status === "available"
      ? "text-emerald-400"
      : status === "sold"
        ? "text-slate-400"
        : "text-amber-400";

  return (
    <span className={`font-mono text-xs uppercase tracking-wider ${styles}`}>
      {status === "sold" ? "[SOLD]" : status}
    </span>
  );
}
