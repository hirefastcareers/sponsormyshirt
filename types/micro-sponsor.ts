/**
 * Domain types for the £5 Micro-Sponsor Wall.
 * Mirrors the Supabase `micro_sponsors` table schema.
 */

export interface MicroSponsor {
  id: string;
  name: string;
  logo_url: string;
  link_url: string;
  amount_paid: number;
  created_at: string;
}

/** Payload from MicroSponsorModal → /api/checkout/micro */
export interface MicroCheckoutRequestBody {
  sponsorName: string;
  sponsorUrl: string;
  logoPath: string;
}

export interface MicroCheckoutResponse {
  checkout_url: string;
  order_total_gbp: number;
}
