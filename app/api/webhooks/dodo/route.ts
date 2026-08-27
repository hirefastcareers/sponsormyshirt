/**
 * POST /api/webhooks/dodo
 *
 * Verifies the Dodo Payments webhook signature via @dodopayments/nextjs,
 * then fulfils sold sponsorship slots on payment.succeeded.
 *
 * Configure this URL in the Dodo dashboard:
 *   https://<your-domain>/api/webhooks/dodo
 */
import { revalidatePath } from "next/cache";
import type { NextRequest } from "next/server";
import { Webhooks } from "@dodopayments/nextjs";
import {
  getSponsorLogoPublicUrl,
  getSupabaseAdmin,
} from "@/lib/supabase-admin";

type PaymentMetadata = {
  slot_id?: string;
  sponsor_name?: string;
  sponsor_url?: string;
  logo_path?: string;
};

async function fulfilSponsorship(metadata: PaymentMetadata | null | undefined) {
  if (!metadata?.slot_id) {
    console.warn("[webhook] payment.succeeded missing slot_id metadata");
    return;
  }

  const {
    slot_id,
    sponsor_name = null,
    sponsor_url = null,
    logo_path = null,
  } = metadata;

  const logoUrl = logo_path ? getSponsorLogoPublicUrl(logo_path) : null;
  const admin = getSupabaseAdmin();

  const { error } = await admin
    .from("sponsorship_slots")
    .update({
      status: "sold",
      sponsor_name,
      sponsor_url,
      sponsor_logo_url: logoUrl,
    })
    .eq("id", slot_id);

  if (error) {
    console.error("[webhook] Failed to mark slot sold:", error.message);
    throw error; // let Dodo retry
  }

  // Instantly refresh the landing page kit blueprint
  revalidatePath("/");
  console.log(`[webhook] Slot ${slot_id} marked sold for ${sponsor_name}`);
}

/**
 * Lazy factory so `next build` succeeds without secrets present.
 * At runtime, DODO_PAYMENTS_WEBHOOK_SECRET must be set.
 */
function createWebhookHandler() {
  const secret = process.env.DODO_PAYMENTS_WEBHOOK_SECRET;
  if (!secret) {
    return async () =>
      Response.json(
        { error: "DODO_PAYMENTS_WEBHOOK_SECRET is not configured" },
        { status: 503 }
      );
  }

  return Webhooks({
    webhookKey: secret,
    onPaymentSucceeded: async (payload) => {
      const metadata = (payload.data as { metadata?: PaymentMetadata }).metadata;
      await fulfilSponsorship(metadata);
    },
  });
}

export async function POST(request: NextRequest) {
  const handler = createWebhookHandler();
  return handler(request);
}
