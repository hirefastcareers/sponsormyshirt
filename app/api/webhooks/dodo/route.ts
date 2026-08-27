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
  fulfilSponsorship,
  type PaymentMetadata,
} from "@/lib/fulfil-sponsorship";

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
        { status: 503 },
      );
  }

  return Webhooks({
    webhookKey: secret,
    onPaymentSucceeded: async (payload) => {
      const metadata = (payload.data as { metadata?: PaymentMetadata }).metadata;
      const result = await fulfilSponsorship(metadata);
      if (result.ok) revalidatePath("/");
    },
  });
}

export async function POST(request: NextRequest) {
  const handler = createWebhookHandler();
  return handler(request);
}
