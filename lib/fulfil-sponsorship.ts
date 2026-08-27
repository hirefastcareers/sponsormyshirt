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

export type FulfilResult =
  | { ok: true; mode: "title_takeover"; slot_id: string; sponsor_name: string | null }
  | { ok: true; mode: "single"; slot_id: string; sponsor_name: string | null }
  | { ok: false; reason: "missing_slot_id" };

/**
 * Apply the same DB updates as a successful `payment.succeeded` webhook.
 * Callers that run inside Next.js should revalidatePath("/") after success.
 */
export async function fulfilSponsorship(
  metadata: PaymentMetadata | null | undefined,
): Promise<FulfilResult> {
  if (!metadata?.slot_id) {
    console.warn("[fulfil] payment metadata missing slot_id");
    return { ok: false, reason: "missing_slot_id" };
  }

  const {
    slot_id,
    sponsor_name = null,
    sponsor_url = null,
    logo_path = null,
  } = metadata;

  const hasSocialPost = asBool(metadata.has_social_post);
  const hasDofollowLink = asBool(metadata.has_dofollow_link);

  const logoUrl = logo_path ? getSponsorLogoPublicUrl(logo_path) : null;
  const admin = getSupabaseAdmin();

  if (isTitleTakeover(slot_id)) {
    const { error } = await admin.rpc("sell_title_takeover", {
      p_sponsor_name: sponsor_name,
      p_sponsor_url: sponsor_url,
      p_sponsor_logo_url: logoUrl,
      p_has_social_post: hasSocialPost,
      p_has_dofollow_link: hasDofollowLink,
    });

    if (error) {
      console.error("[fulfil] Failed to fulfil title takeover:", error.message);
      throw error;
    }

    console.log(
      `[fulfil] Title takeover fulfilled — all slots sold for ${sponsor_name}`,
    );
    return {
      ok: true,
      mode: "title_takeover",
      slot_id,
      sponsor_name,
    };
  }

  const { error } = await admin
    .from("sponsorship_slots")
    .update({
      status: "sold",
      sponsor_name,
      sponsor_url,
      sponsor_logo_url: logoUrl,
      has_social_post: hasSocialPost,
      has_dofollow_link: hasDofollowLink,
    })
    .eq("id", slot_id);

  if (error) {
    console.error("[fulfil] Failed to mark slot sold:", error.message);
    throw error;
  }

  console.log(`[fulfil] Slot ${slot_id} marked sold for ${sponsor_name}`);
  return { ok: true, mode: "single", slot_id, sponsor_name };
}
