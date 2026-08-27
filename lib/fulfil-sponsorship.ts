/**
 * Shared sponsorship fulfilment used by the Dodo webhook and local test helpers.
 * Marks a slot (or all slots for title takeover) as sold with sponsor details.
 */
import { isTitleTakeover } from "@/lib/positions";
import {
  getSponsorLogoPublicUrl,
  getSupabaseAdmin,
} from "@/lib/supabase-admin";

export type PaymentMetadata = {
  slot_id?: string;
  slotId?: string;
  slot_ids?: string | string[];
  slotIds?: string | string[];
  sponsor_name?: string;
  sponsor_url?: string;
  logo_path?: string;
  has_social_post?: boolean | string;
  has_dofollow_link?: boolean | string;
  order_total_gbp?: number | string;
};

export function asBool(value: boolean | string | undefined): boolean {
  return value === true || value === "true";
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

export type FulfilResult =
  | { ok: true; mode: "title_takeover"; slot_ids: string[]; sponsor_name: string | null }
  | { ok: true; mode: "single"; slot_ids: string[]; sponsor_name: string | null }
  | { ok: true; mode: "batch"; slot_ids: string[]; sponsor_name: string | null }
  | { ok: false; reason: "missing_slot_id" | "db_error"; message?: string };

type SoldUpdate = {
  status: "sold";
  sponsor_name: string | null;
  sponsor_url: string | null;
  sponsor_logo_url: string | null;
  has_social_post: boolean;
  has_dofollow_link: boolean;
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
  const sponsor_url = metadata?.sponsor_url ?? null;
  const logo_path = metadata?.logo_path ?? null;
  const hasSocialPost = asBool(metadata?.has_social_post);
  const hasDofollowLink = asBool(metadata?.has_dofollow_link);
  const logoUrl = logo_path ? getSponsorLogoPublicUrl(logo_path) : null;
  const admin = getSupabaseAdmin();

  const soldPatch: SoldUpdate = {
    status: "sold",
    sponsor_name,
    sponsor_url,
    sponsor_logo_url: logoUrl,
    has_social_post: hasSocialPost,
    has_dofollow_link: hasDofollowLink,
  };

  // Title Sponsor / whole-kit purchase — mark every row sold in one transaction.
  if (slotIds.some((id) => isTitleTakeover(id))) {
    const { error } = await admin.rpc("sell_title_takeover", {
      p_sponsor_name: sponsor_name,
      p_sponsor_url: sponsor_url,
      p_sponsor_logo_url: logoUrl,
      p_has_social_post: hasSocialPost,
      p_has_dofollow_link: hasDofollowLink,
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
    .in("id", uniqueIds);

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
