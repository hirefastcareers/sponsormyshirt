/**
 * Fulfilment for £5 Micro-Sponsor Wall purchases.
 * Inserts a row into micro_sponsors after successful Dodo payment.
 */
import {
  getMicroSponsorProductId,
  MICRO_SPONSOR_CHECKOUT_TYPE,
  MICRO_SPONSOR_PRICE_GBP,
} from "@/lib/micro-sponsors";
import {
  extractCustomerUrl,
  type PaymentMetadata,
} from "@/lib/fulfil-sponsorship";
import { getSponsorLogoPublicUrl, getSupabaseAdmin } from "@/lib/supabase-admin";

export function isMicroSponsorCheckout(
  metadata: PaymentMetadata | null | undefined,
  productCart?: { product_id: string }[] | null,
): boolean {
  if (!metadata) return false;
  if (metadata.checkout_type === MICRO_SPONSOR_CHECKOUT_TYPE) return true;

  const microProductId = getMicroSponsorProductId();
  if (!microProductId) return false;

  if (metadata.product_id === microProductId) return true;

  return (productCart ?? []).some((item) => item.product_id === microProductId);
}

/** Ensure checkout_type is set when the line item is the micro-sponsor product. */
export function enrichMicroSponsorMetadata(
  metadata: PaymentMetadata,
  productCart?: { product_id: string }[] | null,
): PaymentMetadata {
  if (isMicroSponsorCheckout(metadata, productCart)) {
    return { ...metadata, checkout_type: MICRO_SPONSOR_CHECKOUT_TYPE };
  }
  return metadata;
}

export type FulfilMicroResult =
  | { ok: true; sponsor_name: string; micro_sponsor_id: string }
  | { ok: false; reason: "missing_fields" | "db_error"; message?: string };

/**
 * Insert a micro sponsor from payment metadata.
 * Callers inside Next.js should revalidatePath("/") after success.
 */
export async function fulfilMicroSponsor(
  metadata: PaymentMetadata | null | undefined,
): Promise<FulfilMicroResult> {
  const name = metadata?.sponsor_name?.trim();
  const linkUrl = extractCustomerUrl(metadata);
  const logoPath = metadata?.logo_path?.trim();

  if (!name || !linkUrl || !logoPath) {
    console.warn("[fulfil-micro] Missing sponsor_name, link URL, or logo_path");
    return { ok: false, reason: "missing_fields" };
  }

  const logoUrl = getSponsorLogoPublicUrl(logoPath);
  const admin = getSupabaseAdmin();

  const { data, error } = await admin
    .from("micro_sponsors")
    .insert({
      name,
      logo_url: logoUrl,
      link_url: linkUrl,
      amount_paid: MICRO_SPONSOR_PRICE_GBP,
    })
    .select("id")
    .single();

  if (error) {
    console.error("[fulfil-micro] Insert failed:", error.message);
    return { ok: false, reason: "db_error", message: error.message };
  }

  console.log(`[fulfil-micro] Micro sponsor created for ${name} (${data.id})`);
  return { ok: true, sponsor_name: name, micro_sponsor_id: data.id };
}
