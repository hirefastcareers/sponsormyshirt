/**
 * POST /api/webhooks/dodo
 *
 * Verifies Dodo Payments webhook signatures (Standard Webhooks:
 * `webhook-id`, `webhook-signature`, `webhook-timestamp`) using
 * DODO_PAYMENTS_WEBHOOK_SECRET, then fulfils sold sponsorship slots on
 * payment.succeeded and checkout.session.completed.
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
  type PaymentMetadata,
} from "@/lib/fulfil-sponsorship";

function getWebhookSecret(): string | undefined {
  return (
    process.env.DODO_PAYMENTS_WEBHOOK_SECRET?.trim() ??
    process.env.DODO_WEBHOOK_SECRET?.trim() ??
    process.env.DODO_PAYMENTS_WEBHOOK_KEY?.trim()
  );
}

const FULFILMENT_EVENT_TYPES = new Set([
  "payment.succeeded",
  "checkout.session.completed",
]);

async function processWebhookFulfilment(
  eventType: string,
  data: {
    metadata?: PaymentMetadata | Record<string, unknown> | null;
    product_cart?: { product_id: string; quantity?: number }[] | null;
    payment_id?: string | null;
  },
): Promise<void> {
  console.log("[webhook] Processing fulfilment", { eventType });

  const metadata = await resolvePaymentMetadata(data);
  console.log("[webhook] Resolved metadata slot_id:", metadata.slot_id ?? null);

  const result = await fulfilSponsorship(metadata);

  if (!result.ok) {
    const message =
      result.reason === "missing_slot_id"
        ? `${eventType} metadata missing slot_id`
        : (result.message ?? "Failed to update sponsorship_slots");
    console.error("[webhook] Fulfilment failed:", message);
    throw new Error(message);
  }

  console.log("[webhook] Fulfilment complete", {
    eventType,
    mode: result.mode,
    slot_ids: result.slot_ids,
    sponsor_name: result.sponsor_name,
  });

  revalidatePath("/");
  revalidatePath("/success");
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

  let parsedBody: unknown;
  try {
    parsedBody = JSON.parse(rawBody);
    console.log("[webhook] Incoming payload", parsedBody);
  } catch (err) {
    const reason = err instanceof Error ? err.message : String(err);
    console.error("[webhook] Invalid JSON body:", reason);
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const incomingType =
    typeof parsedBody === "object" &&
    parsedBody !== null &&
    "type" in parsedBody &&
    typeof parsedBody.type === "string"
      ? parsedBody.type
      : "(unknown)";
  console.log("[webhook] Incoming event type:", incomingType);

  let payload;
  try {
    console.log("[webhook] Verifying signature", {
      webhook_id: headers["webhook-id"] || "(missing)",
      event_type: incomingType,
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
      event_type: incomingType,
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
    let fulfilmentHandled = false;

    await handleWebhookPayload(payload, {
      webhookKey: secret,
      onPayload: async (event) => {
        console.log("[webhook] onPayload event:", event.type);
      },
      onPaymentSucceeded: async (event) => {
        await processWebhookFulfilment(event.type, event.data);
        fulfilmentHandled = true;
      },
    });

    if (
      !fulfilmentHandled &&
      FULFILMENT_EVENT_TYPES.has(payload.type) &&
      payload.type !== "payment.succeeded"
    ) {
      const data = (payload as { data?: Record<string, unknown> }).data ?? {};
      await processWebhookFulfilment(payload.type, {
        metadata: (data.metadata as PaymentMetadata | undefined) ?? null,
        product_cart:
          (data.product_cart as { product_id: string; quantity?: number }[]) ??
          null,
        payment_id:
          typeof data.payment_id === "string" ? data.payment_id : null,
      });
      fulfilmentHandled = true;
    }

    if (!fulfilmentHandled && FULFILMENT_EVENT_TYPES.has(payload.type)) {
      console.warn(
        "[webhook] Fulfilment event received but no handler ran:",
        payload.type,
      );
    }

    console.log("[webhook] Event handled:", payload.type);
    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Webhook handler error";
    console.error("[webhook] Handler error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
