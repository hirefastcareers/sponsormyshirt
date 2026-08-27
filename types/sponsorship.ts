/**
 * Shared domain types for Great North Run kit sponsorship slots.
 * Mirrors the Supabase `sponsorship_slots` table schema.
 */

export type SlotStatus = "available" | "pending" | "sold";

export type SlotCategory =
  | "shirt"
  | "shorts"
  | "socks"
  | "headwear"
  | "takeover";

export interface SponsorshipSlot {
  id: string;
  slot_name: string;
  category: SlotCategory;
  price_gbp: number;
  status: SlotStatus;
  sponsor_name: string | null;
  sponsor_url: string | null;
  sponsor_logo_url: string | null;
  destination_url?: string | null;
  x_position: number;
  y_position: number;
  dodo_product_id: string | null;
  has_social_post?: boolean;
  has_dofollow_link?: boolean;
  has_backlink?: boolean;
  x_handle?: string | null;
  /** When false, slot is hidden from UI and excluded from Title Sponsor totals. */
  active?: boolean;
}

/** Payload from the sponsorship modal → /api/checkout */
export interface CheckoutRequestBody {
  /**
   * Permanent sponsorship_slots.id (e.g. "shorts_left", "chest_center").
   * Never the UI display badge ("01"–"09") — those are view-only.
   */
  slotId: string;
  sponsorName: string;
  sponsorUrl: string;
  logoPath: string;
  xHandle?: string;
  hasSocialPost?: boolean;
  hasDofollowLink?: boolean;
}

export interface CheckoutResponse {
  checkout_url: string;
  order_total_gbp?: number;
}

export interface UploadResponse {
  path: string;
  publicUrl: string;
}
