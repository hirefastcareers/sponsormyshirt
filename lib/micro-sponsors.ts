/**
 * Server-side data access and constants for the Micro-Sponsor Wall.
 */
import { supabase } from "@/lib/supabase";
import type { MicroSponsor } from "@/types/micro-sponsor";

/** Fixed price for a micro-sponsor placement (GBP). */
export const MICRO_SPONSOR_PRICE_GBP = 5;

/** Dodo product env var for the £5 micro-sponsor checkout. */
export const MICRO_SPONSOR_PRODUCT_ENV = "DODO_PRODUCT_MICRO_SPONSOR";

/** Metadata flag written to Dodo checkout sessions for webhook routing. */
export const MICRO_SPONSOR_CHECKOUT_TYPE = "micro_sponsor";

export function getMicroSponsorProductId(): string | null {
  return process.env[MICRO_SPONSOR_PRODUCT_ENV]?.trim() || null;
}

/** Fetch all micro sponsors, newest first. */
export async function getMicroSponsors(): Promise<MicroSponsor[]> {
  const { data, error } = await supabase
    .from("micro_sponsors")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[micro-sponsors] Failed to fetch:", error.message);
    return [];
  }

  return (data ?? []) as MicroSponsor[];
}
