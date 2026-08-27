/**
 * POST /api/webhooks/dodo
 *
 * Verifies Dodo Payments webhook signatures (Standard Webhooks:
 * `webhook-id`, `webhook-signature`, `webhook-timestamp`) using
 * DODO_PAYMENTS_WEBHOOK_SECRET, then fulfils sold sponsorship slots on
 * payment.succeeded.
 *
 * Configure this URL in the Dodo dashboard:
 *   https://<your-domain>/api/webhooks/dodo
 */
import { revalidatePath } from "next/cache";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import {
  handleWebhookPayload,
  verifyWebhookPayload,
} from "@dodopayments/core";
import {
  fulfilSponsorship,
  resolvePaymentMetadata,
} from "@/lib/fulfil-sponsorship";

function getWebhookSecret(): string | undefined {
  return (
    process.env.DODO_PAYMENTS_WEBHOOK_SECRET?.trim() ??
    process.env.DODO_WEBHOOK_SECRET?.trim() ??
    process.env.DODO_PAYMENTS_WEBHOOK_KEY?.trim()
  );
}

export async function POST(request: NextRequest) {
  const secret = getWebhookSecret();
  if (!secret) {
    console.error(
      "[webhook] DODO_PAYMENTS_WEBHOOK_SECRET is not configured",
    );
    return NextResponse.json(
      {
        error:
          "Webhook secret is not configured (set DODO_PAYMENTS_WEBHOOK_SECRET)",
      },
      { status: 503 },
    );
  }

  const headers = {
    "webhook-id": request.headers.get("webhook-id") ?? "",
    "webhook-timestamp": request.headers.get("webhook-timestamp") ?? "",
    "webhook-signature": request.headers.get("webhook-signature") ?? "",
  };

  const rawBody = await request.text();

  let payload;
  try {
    console.log("[webhook] Verifying signature", {
      webhook_id: headers["webhook-id"] || "(missing)",
    });
    payload = await verifyWebhookPayload({
      webhookKey: secret,
      headers,
      body: rawBody,
    });
  } catch (err) {
    const reason = err instanceof Error ? err.message : String(err);
    console.error("[webhook] Signature verification failed:", reason, {
      webhook_id: headers["webhook-id"] || "(missing)",
      has_signature: Boolean(headers["webhook-signature"]),
      has_timestamp: Boolean(headers["webhook-timestamp"]),
    });
    return NextResponse.json(
      { error: "Webhook signature verification failed", reason },
      { status: 400 },
    );
  }

  console.log("[webhook] Verified event:", payload.type);

  try {
    await handleWebhookPayload(payload, {
      webhookKey: secret,
      onPaymentSucceeded: async (event) => {
        console.log("[webhook] payment.succeeded received", {
          payment_id: event.data.payment_id,
          checkout_session_id: event.data.checkout_session_id ?? null,
        });

        const metadata = await resolvePaymentMetadata(event.data);
        console.log("[webhook] Resolved metadata slot_id:", metadata.slot_id ?? null);

        const result = await fulfilSponsorship(metadata);

        if (!result.ok) {
          const message =
            result.reason === "missing_slot_id"
              ? "payment.succeeded metadata missing slot_id"
              : (result.message ?? "Failed to update sponsorship_slots");
          console.error("[webhook] Fulfilment failed:", message);
          throw new Error(message);
        }

        console.log("[webhook] Fulfilment complete", {
          mode: result.mode,
          slot_ids: result.slot_ids,
          sponsor_name: result.sponsor_name,
        });

        revalidatePath("/");
      },
    });

    console.log("[webhook] Event handled:", payload.type);
    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Webhook handler error";
    console.error("[webhook] Handler error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
