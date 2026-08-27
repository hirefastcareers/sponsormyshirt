/**
 * Charity pledge configuration and donation calculations.
 * Update CHARITY_NAME here to change it site-wide.
 */
import { calculateOrderTotalGbp } from "@/lib/addons";
import type { SponsorshipSlot } from "@/types/sponsorship";

export const CHARITY_NAME = "Dementia UK";

export const CHARITY_URL = "https://www.dementiauk.org/";

export const CHARITY_DONATION_RATE = 0.25;

export const CHARITY_SPLIT_NOTE =
  "25% goes directly to Dementia UK, with the rest covering race entry, custom kit printing, and indie building.";

export function charityDonationFromTotal(totalGbp: number): number {
  return Math.round(totalGbp * CHARITY_DONATION_RATE);
}

export function formatGbp(amount: number): string {
  return `£${amount.toLocaleString("en-GB")}`;
}

export function formatCharityOrderBreakdown(totalGbp: number): string {
  const donation = charityDonationFromTotal(totalGbp);
  return `${formatGbp(totalGbp)} purchase = ${formatGbp(donation)} directly to ${CHARITY_NAME}`;
}

export function soldSlotOrderTotal(slot: SponsorshipSlot): number {
  return calculateOrderTotalGbp(slot.price_gbp, {
    hasSocialPost: slot.has_social_post === true,
    hasDofollowLink:
      slot.has_dofollow_link === true || slot.has_backlink === true,
  });
}

/** 25% of confirmed sales from sold slots (includes add-ons where recorded). */
export function totalCharityRaisedFromSoldSlots(
  slots: SponsorshipSlot[],
): number {
  const revenue = slots
    .filter((s) => s.status === "sold")
    .reduce((sum, s) => sum + soldSlotOrderTotal(s), 0);

  return charityDonationFromTotal(revenue);
}
