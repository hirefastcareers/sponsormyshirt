/**
 * Shared sponsorship fulfilment used by the Dodo webhook and local test helpers.
 * Marks a slot (or all slots for title takeover) as sold with sponsor details.
 */
import { assertDodoPaymentsConfigured, getDodoClient } from "@/lib/dodo";
import { normalizeXHandle } from "@/lib/format-x-handle";
import { isTitleTakeover } from "@/lib/positions";
import {
  getSponsorLogoPublicUrl,
  getSupabaseAdmin,
} from "@/lib/supabase-admin";

export type PaymentMetadata = {
  checkout_type?: string;
  slot_id?: string;
  slotId?: string;
  slot_ids?: string | string[];
  slotIds?: string | string[];
  product_id?: string;
  sponsor_name?: string;
  sponsor_url?: string;
  customer_url?: string;
  logo_path?: string;
  has_social_post?: boolean | string;
  has_dofollow_link?: boolean | string;
  has_backlink?: boolean | string;
  x_handle?: string;
  order_total_gbp?: number | string;
};

export function extractXHandle(
  metadata: PaymentMetadata | null | undefined,
): string | null {
  const raw = metadata?.x_handle;
  if (typeof raw !== "string" || !raw.trim()) return null;
  return raw.trim();
}

export function asBool(value: boolean | string | undefined): boolean {
  return value === true || value === "true";
}

/** Sponsor destination URL from checkout / payment metadata. */
export function extractCustomerUrl(
  metadata: PaymentMetadata | null | undefined,
): string | null {
  const raw = metadata?.customer_url ?? metadata?.sponsor_url;
  return typeof raw === "string" && raw.trim() ? raw.trim() : null;
}

/** Dofollow backlink add-on flag from metadata (supports legacy keys). */
export function extractHasBacklink(
  metadata: PaymentMetadata | null | undefined,
): boolean {
  return asBool(metadata?.has_backlink) || asBool(metadata?.has_dofollow_link);
}

type PaymentLineItem = { product_id: string; quantity?: number };

type PaymentDataForMetadata = {
  metadata?: PaymentMetadata | Record<string, unknown> | null;
  product_cart?: PaymentLineItem[] | null;
  payment_id?: string | null;
};

function addonProductIds(): Set<string> {
  return new Set(
    [
      process.env.DODO_PRODUCT_SOCIAL_POST,
      process.env.DODO_PRODUCT_DOFOLLOW_LINK,
      process.env.DODO_PRODUCT_MICRO_SPONSOR,
    ].filter((id): id is string => Boolean(id?.trim())),
  );
}

/** Parse permanent slot id(s) from Dodo payment metadata (never UI badge numbers). */
export function extractSlotIds(
  metadata: PaymentMetadata | null | undefined,
): string[] {
  if (!metadata) return [];

  const arrayCandidate = metadata.slot_ids ?? metadata.slotIds;
  if (Array.isArray(arrayCandidate)) {
    return arrayCandidate.filter(
      (id): id is string => typeof id === "string" && id.trim().length > 0,
    );
  }
  if (typeof arrayCandidate === "string" && arrayCandidate.trim()) {
    return arrayCandidate
      .split(",")
      .map((id) => id.trim())
      .filter(Boolean);
  }

  const single = metadata.slot_id ?? metadata.slotId;
  if (typeof single === "string" && single.trim()) {
    return [single.trim()];
  }

  return [];
}

/**
 * Build fulfilment metadata from a payment.succeeded payload.
 * Prefers checkout metadata.slot_id; falls back to product_id in metadata or
 * line items (product_cart), resolving via sponsorship_slots.dodo_product_id.
 */
export async function resolvePaymentMetadata(
  data: PaymentDataForMetadata,
): Promise<PaymentMetadata> {
  const metadata = (data.metadata ?? {}) as PaymentMetadata;

  if (extractSlotIds(metadata).length > 0) {
    return metadata;
  }

  const paymentId =
    typeof data.payment_id === "string" && data.payment_id.trim()
      ? data.payment_id.trim()
      : null;

  if (paymentId) {
    try {
      assertDodoPaymentsConfigured();
      const payment = await getDodoClient().payments.retrieve(paymentId);
      const paymentMetadata = payment.metadata as PaymentMetadata;
      if (extractSlotIds(paymentMetadata).length > 0) {
        return { ...metadata, ...paymentMetadata };
      }
      return resolvePaymentMetadata({
        metadata: paymentMetadata,
        product_cart: payment.product_cart ?? null,
      });
    } catch (err) {
      console.error("[fulfil] Failed to load payment metadata:", err);
    }
  }

  const productIds: string[] = [];
  const metaProductId = metadata.product_id;
  if (typeof metaProductId === "string" && metaProductId.trim()) {
    productIds.push(metaProductId.trim());
  }

  for (const item of data.product_cart ?? []) {
    if (item.product_id && !productIds.includes(item.product_id)) {
      productIds.push(item.product_id);
    }
  }

  const slotProductIds = productIds.filter((id) => !addonProductIds().has(id));
  if (slotProductIds.length === 0) {
    return metadata;
  }

  const admin = getSupabaseAdmin();
  for (const productId of slotProductIds) {
    const { data: slot, error } = await admin
      .from("sponsorship_slots")
      .select("id")
      .eq("dodo_product_id", productId)
      .maybeSingle();

    if (error) {
      console.error(
        `[fulfil] product_id lookup failed for ${productId}:`,
        error.message,
      );
      continue;
    }

    if (slot?.id) {
      console.log(
        `[fulfil] Resolved slot_id "${slot.id}" from product_id "${productId}"`,
      );
      return { ...metadata, slot_id: slot.id };
    }
  }

  return metadata;
}

export type FulfilResult =
  | { ok: true; mode: "title_takeover"; slot_ids: string[]; sponsor_name: string | null }
  | { ok: true; mode: "single"; slot_ids: string[]; sponsor_name: string | null }
  | { ok: true; mode: "batch"; slot_ids: string[]; sponsor_name: string | null }
  | { ok: false; reason: "missing_slot_id" | "db_error"; message?: string };

type SoldUpdate = {
  status: "sold";
  sponsor_name: string | null;
  sponsor_url: string | null;
  destination_url: string | null;
  sponsor_logo_url: string | null;
  has_social_post: boolean;
  has_dofollow_link: boolean;
  has_backlink: boolean;
  x_handle: string | null;
};

/**
 * Apply the same DB updates as a successful `payment.succeeded` webhook.
 * Callers that run inside Next.js should revalidatePath("/") after success.
 */
export async function fulfilSponsorship(
  metadata: PaymentMetadata | null | undefined,
): Promise<FulfilResult> {
  const slotIds = extractSlotIds(metadata);
  if (slotIds.length === 0) {
    console.warn("[fulfil] payment metadata missing slot_id / slotIds");
    return { ok: false, reason: "missing_slot_id" };
  }

  const sponsor_name = metadata?.sponsor_name ?? null;
  const customerUrl = extractCustomerUrl(metadata);
  const logo_path = metadata?.logo_path ?? null;
  const hasSocialPost = asBool(metadata?.has_social_post);
  const hasBacklink = extractHasBacklink(metadata);
  const x_handle = normalizeXHandle(extractXHandle(metadata));
  const logoUrl = logo_path ? getSponsorLogoPublicUrl(logo_path) : null;
  const admin = getSupabaseAdmin();

  const soldPatch: SoldUpdate = {
    status: "sold",
    sponsor_name,
    sponsor_url: customerUrl,
    destination_url: customerUrl,
    sponsor_logo_url: logoUrl,
    has_social_post: hasSocialPost,
    has_dofollow_link: hasBacklink,
    has_backlink: hasBacklink,
    x_handle,
  };

  // Title Sponsor / whole-kit purchase — mark every row sold in one transaction.
  if (slotIds.some((id) => isTitleTakeover(id))) {
    const { error } = await admin.rpc("sell_title_takeover", {
      p_sponsor_name: sponsor_name,
      p_sponsor_url: customerUrl,
      p_sponsor_logo_url: logoUrl,
      p_has_social_post: hasSocialPost,
      p_has_dofollow_link: hasBacklink,
      p_x_handle: x_handle,
    });

    if (error) {
      console.error("[fulfil] Failed to fulfil title takeover:", error.message);
      return { ok: false, reason: "db_error", message: error.message };
    }

    console.log(
      `[fulfil] Title takeover fulfilled — all slots sold for ${sponsor_name}`,
    );
    return {
      ok: true,
      mode: "title_takeover",
      slot_ids: slotIds,
      sponsor_name,
    };
  }

  const uniqueIds = [...new Set(slotIds)];

  const { error } = await admin
    .from("sponsorship_slots")
    .update(soldPatch)
    .in("id", uniqueIds)
    .in("status", ["pending", "available"]);

  if (error) {
    console.error(
      `[fulfil] Failed to mark slot(s) sold (${uniqueIds.join(", ")}):`,
      error.message,
    );
    return { ok: false, reason: "db_error", message: error.message };
  }

  const mode = uniqueIds.length === 1 ? "single" : "batch";
  console.log(
    `[fulfil] Slot(s) ${uniqueIds.join(", ")} marked sold for ${sponsor_name}`,
  );
  return { ok: true, mode, slot_ids: uniqueIds, sponsor_name };
}
