/**
 * Shared domain types for Great North Run kit sponsorship slots.
 * Mirrors the Supabase `sponsorship_slots` table schema.
 */

export type SlotStatus = "available" | "pending" | "sold";

export type SlotCategory = "shirt" | "shorts" | "socks" | "headwear";

export interface SponsorshipSlot {
  id: string;
  slot_name: string;
  category: SlotCategory;
  price_gbp: number;
  status: SlotStatus;
  sponsor_name: string | null;
  sponsor_url: string | null;
  sponsor_logo_url: string | null;
  x_position: number;
  y_position: number;
  dodo_product_id: string | null;
}

/** Payload from the sponsorship modal → /api/checkout */
export interface CheckoutRequestBody {
  slotId: string;
  sponsorName: string;
  sponsorUrl: string;
  logoPath: string;
}

export interface CheckoutResponse {
  checkout_url: string;
}

export interface UploadResponse {
  path: string;
  publicUrl: string;
}
