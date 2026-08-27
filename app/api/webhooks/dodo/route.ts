/**
 * POST /api/webhooks/dodo
 *
 * Verifies Dodo Payments webhook signatures via @dodopayments/nextjs (Standard
 * Webhooks: `webhook-id`, `webhook-signature`, `webhook-timestamp`), then
 * fulfils sold sponsorship slots on payment.succeeded.
 *
 * Configure this URL in the Dodo dashboard:
 *   https://<your-domain>/api/webhooks/dodo
 */
import { revalidatePath } from "next/cache";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { Webhooks } from "@dodopayments/nextjs";
import {
  fulfilSponsorship,
  type PaymentMetadata,
} from "@/lib/fulfil-sponsorship";

function getWebhookSecret(): string | undefined {
  return (
    process.env.DODO_WEBHOOK_SECRET ??
    process.env.DODO_PAYMENTS_WEBHOOK_SECRET ??
    process.env.DODO_PAYMENTS_WEBHOOK_KEY
  );
}

/**
 * Lazy factory so `next build` succeeds without secrets present.
 * At runtime, DODO_WEBHOOK_SECRET (or DODO_PAYMENTS_WEBHOOK_SECRET) must be set.
 */
function createWebhookHandler() {
  const secret = getWebhookSecret();
  if (!secret) {
    return async () =>
      NextResponse.json(
        {
          error:
            "Webhook secret is not configured (set DODO_WEBHOOK_SECRET or DODO_PAYMENTS_WEBHOOK_SECRET)",
        },
        { status: 503 },
      );
  }

  return Webhooks({
    webhookKey: secret,
    onPaymentSucceeded: async (payload) => {
      const metadata = (payload.data as { metadata?: PaymentMetadata })
        .metadata;
      const result = await fulfilSponsorship(metadata);

      if (!result.ok) {
        const message =
          result.reason === "missing_slot_id"
            ? "payment.succeeded metadata missing slot_id"
            : result.message ?? "Failed to update sponsorship_slots";
        console.error("[webhook] fulfilment failed:", message);
        throw new Error(message);
      }

      revalidatePath("/");
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    const handler = createWebhookHandler();
    return await handler(request);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Webhook handler error";
    console.error("[webhook] unhandled error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
