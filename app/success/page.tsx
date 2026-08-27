/**
 * Post-checkout thank-you page for sponsors.
 * Reads ?slot=, ?category=, or ?session_id= to personalise the confirmation.
 */
import type { Metadata } from "next";
import Link from "next/link";
import BrandMark from "@/components/BrandMark";
import { confirmSlotSoldFromSuccessRedirect } from "@/lib/confirm-slot-sold";
import { resolvePurchasedSlot } from "@/lib/resolve-success-slot";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Payment Received | GNR Kit Sponsorships",
  description:
    "Thank you for sponsoring a placement on Great North Run race-day kit.",
};

function firstParam(value: string | string[] | undefined): string | null {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value[0] ?? null;
  return null;
}

const SPONSOR_EMAIL = "tomford61@gmail.com";

export default async function SuccessPage({
  searchParams,
}: PageProps<"/success">) {
  const params = await searchParams;
  const statusParam = firstParam(params.status);
  const slotParam = firstParam(params.slot);
  const categoryParam = firstParam(params.category);
  const sessionIdParam = firstParam(params.session_id);

  const { slotId, slotName } = await resolvePurchasedSlot(
    slotParam,
    sessionIdParam,
    categoryParam,
  );

  await confirmSlotSoldFromSuccessRedirect(statusParam, slotParam, slotId);

  const kitItem = categoryParam?.trim().toLowerCase() || "kit";
  const headline = `Payment Received — You're on the ${kitItem}!`;

  return (
    <main className="min-h-screen bg-[#F9F9FB]">
      <header className="border-b border-[#E4E4E7] bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-3xl items-center px-6 py-4 lg:px-8">
          <BrandMark href="/" showStatus />
        </div>
      </header>

      <section className="mx-auto w-full max-w-3xl px-6 py-12 lg:px-8 lg:py-16">
        <p className="flex items-center gap-2 font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-emerald-600">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-600" />
          Payment confirmed
        </p>

        <h1 className="mt-4 text-3xl font-medium tracking-tight text-zinc-900 sm:text-4xl">
          {headline}
        </h1>

        <div className="mt-8 rounded-2xl border border-[#E4E4E7] bg-white p-6 shadow-sm sm:p-8">
          <p className="text-[15px] leading-relaxed text-zinc-600 sm:text-base">
            {slotName ? (
              <>
                Thank you for sponsoring the{" "}
                <span className="font-semibold text-zinc-900">{slotName}</span>!
              </>
            ) : (
              <>Thank you for sponsoring a placement on the kit!</>
            )}
          </p>

          <p className="mt-4 text-[15px] leading-relaxed text-zinc-600 sm:text-base">
            Please email your high-res / vector logo (.SVG, .EPS, .AI, or
            high-res .PNG) to{" "}
            <a
              href={`mailto:${SPONSOR_EMAIL}`}
              className="font-semibold text-zinc-900 underline decoration-zinc-300 underline-offset-4 transition hover:decoration-emerald-500"
            >
              {SPONSOR_EMAIL}
            </a>{" "}
            along with your order details.
          </p>
        </div>

        <div className="mt-10">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-full bg-zinc-900 px-6 py-3 text-sm font-medium text-white transition hover:bg-zinc-800"
          >
            Return to Kit Overview
          </Link>
        </div>
      </section>

      <footer className="border-t border-[#E4E4E7] bg-zinc-900 text-zinc-100">
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 px-6 py-8 lg:px-8">
          <BrandMark variant="dark" href="/" />
          <p className="text-xs leading-relaxed text-zinc-500">
            Not affiliated with or endorsed by the Great North Run or its
            official organizers.
          </p>
        </div>
      </footer>
    </main>
  );
}
