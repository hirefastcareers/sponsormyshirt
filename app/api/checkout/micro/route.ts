/**
 * POST /api/checkout/micro
 *
 * Streamlined £5 Micro-Sponsor Wall checkout:
 *  1. Validate sponsor name, URL, and logo path
 *  2. Create a Dodo Payments checkout session
 *  3. Return { checkout_url } for client redirect
 *
 * On payment success the webhook inserts into micro_sponsors.
 */
import { NextResponse } from "next/server";
import { assertDodoPaymentsConfigured, getDodoClient } from "@/lib/dodo";
import {
  getMicroSponsorProductId,
  MICRO_SPONSOR_CHECKOUT_TYPE,
  MICRO_SPONSOR_PRICE_GBP,
} from "@/lib/micro-sponsors";
import type {
  MicroCheckoutRequestBody,
  MicroCheckoutResponse,
} from "@/types/micro-sponsor";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<MicroCheckoutRequestBody>;
    const { sponsorName, sponsorUrl, logoPath } = body;

    if (!sponsorName?.trim() || !sponsorUrl?.trim() || !logoPath) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: sponsorName, sponsorUrl, logoPath",
        },
        { status: 400 },
      );
    }

    try {
      assertDodoPaymentsConfigured();
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Dodo Payments is not configured on the server.";
      return NextResponse.json({ error: message }, { status: 503 });
    }

    const productId = getMicroSponsorProductId();
    if (!productId) {
      return NextResponse.json(
        {
          error:
            "Micro-sponsor product is not configured. Set DODO_PRODUCT_MICRO_SPONSOR in the server environment (run npm run sync:dodo-micro).",
        },
        { status: 422 },
      );
    }

    try {
      new URL(sponsorUrl);
    } catch {
      return NextResponse.json(
        { error: "sponsorUrl must be a valid URL (include https://)" },
        { status: 400 },
      );
    }

    const name = sponsorName.trim();
    const url = sponsorUrl.trim();

    const metadata = {
      checkout_type: MICRO_SPONSOR_CHECKOUT_TYPE,
      sponsor_name: name,
      sponsor_url: url,
      customer_url: url,
      logo_path: logoPath,
      order_total_gbp: MICRO_SPONSOR_PRICE_GBP,
    };

    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ??
      "http://localhost:3000";
    const returnUrl = `${appUrl}/success?status=succeeded&type=micro`;

    const dodo = getDodoClient();
    let session;
    try {
      session = await dodo.checkoutSessions.create({
        product_cart: [{ product_id: productId, quantity: 1 }],
        metadata,
        return_url: returnUrl,
      });
    } catch (err) {
      console.error("[checkout/micro] Dodo session creation failed:", err);
      const message = err instanceof Error ? err.message : String(err);
      return NextResponse.json(
        { error: message || "Could not start checkout session" },
        { status: 502 },
      );
    }

    if (!session.checkout_url) {
      return NextResponse.json(
        { error: "Dodo Payments did not return a checkout_url" },
        { status: 502 },
      );
    }

    const response: MicroCheckoutResponse = {
      checkout_url: session.checkout_url,
      order_total_gbp: MICRO_SPONSOR_PRICE_GBP,
    };

    return NextResponse.json(response);
  } catch (err) {
    console.error("[checkout/micro] Unexpected error:", err);
    const message = err instanceof Error ? err.message : String(err);
    const isConfig =
      message.includes("DODO_PAYMENTS_API_KEY") ||
      message.includes("not configured");
    return NextResponse.json(
      {
        error: isConfig
          ? message
          : "Internal server error creating checkout session",
      },
      { status: isConfig ? 503 : 500 },
    );
  }
}
