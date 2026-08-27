/**
 * Server-side data access for sponsorship slots.
 */
import { supabase } from "@/lib/supabase";
import type { SponsorshipSlot } from "@/types/sponsorship";

/** Fetch all slots ordered by price (premium placements first). */
export async function getSponsorshipSlots(): Promise<SponsorshipSlot[]> {
  const { data, error } = await supabase
    .from("sponsorship_slots")
    .select("*")
    .order("price_gbp", { ascending: false });

  if (error) {
    console.error("[slots] Failed to fetch sponsorship_slots:", error.message);
    return [];
  }

  return (data ?? []) as SponsorshipSlot[];
}

export function getSlotMetrics(slots: SponsorshipSlot[]) {
  const total = slots.length;
  const sold = slots.filter((s) => s.status === "sold").length;
  const available = slots.filter((s) => s.status === "available").length;
  const pending = slots.filter((s) => s.status === "pending").length;
  const revenueGbp = slots
    .filter((s) => s.status === "sold")
    .reduce((sum, s) => sum + s.price_gbp, 0);

  return { total, sold, available, pending, revenueGbp };
}
