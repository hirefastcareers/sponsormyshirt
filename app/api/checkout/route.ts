/**
 * POST /api/checkout
 *
 * Flow:
 *  1. Validate body + lock the slot as `pending` (optimistic hold)
 *  2. Create a Dodo Payments checkout session with sponsor metadata
 *  3. Return { checkout_url } for client redirect
 *
 * On payment success the webhook flips status → `sold`.
 * If the buyer abandons checkout, re-open the slot manually or via a TTL job.
 */
import { NextResponse } from "next/server";
import { getDodoClient } from "@/lib/dodo";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import type { CheckoutRequestBody } from "@/types/sponsorship";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<CheckoutRequestBody>;
    const { slotId, sponsorName, sponsorUrl, logoPath } = body;

    if (!slotId || !sponsorName?.trim() || !sponsorUrl?.trim() || !logoPath) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: slotId, sponsorName, sponsorUrl, logoPath",
        },
        { status: 400 }
      );
    }

    // Basic URL sanity check
    try {
      new URL(sponsorUrl);
    } catch {
      return NextResponse.json(
        { error: "sponsorUrl must be a valid URL (include https://)" },
        { status: 400 }
      );
    }

    const admin = getSupabaseAdmin();

    // Load slot — must be available and have a configured Dodo product
    const { data: slot, error: fetchError } = await admin
      .from("sponsorship_slots")
      .select("*")
      .eq("id", slotId)
      .single();

    if (fetchError || !slot) {
      return NextResponse.json({ error: "Slot not found" }, { status: 404 });
    }

    if (slot.status !== "available") {
      return NextResponse.json(
        { error: `Slot is no longer available (status: ${slot.status})` },
        { status: 409 }
      );
    }

    if (!slot.dodo_product_id) {
      return NextResponse.json(
        {
          error:
            "This slot has no Dodo product configured. Set dodo_product_id in Supabase after creating the product in the Dodo dashboard.",
        },
        { status: 422 }
      );
    }

    // Hold the slot while the buyer completes payment
    const { error: holdError } = await admin
      .from("sponsorship_slots")
      .update({
        status: "pending",
        sponsor_name: sponsorName.trim(),
        sponsor_url: sponsorUrl.trim(),
        sponsor_logo_url: logoPath,
      })
      .eq("id", slotId)
      .eq("status", "available"); // optimistic lock — race-safe

    if (holdError) {
      console.error("[checkout] Failed to hold slot:", holdError.message);
      return NextResponse.json(
        { error: "Could not reserve slot. Please try again." },
        { status: 500 }
      );
    }

    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ??
      "http://localhost:3000";

    const dodo = getDodoClient();

    const session = await dodo.checkoutSessions.create({
      product_cart: [
        {
          product_id: slot.dodo_product_id,
          quantity: 1,
        },
      ],
      // Metadata is echoed back on webhooks — critical for fulfilment
      metadata: {
        slot_id: slotId,
        sponsor_name: sponsorName.trim(),
        sponsor_url: sponsorUrl.trim(),
        logo_path: logoPath,
      },
      return_url: `${appUrl}/?payment=success&slot=${encodeURIComponent(slotId)}`,
    });

    if (!session.checkout_url) {
      // Release the hold if Dodo didn't return a URL
      await admin
        .from("sponsorship_slots")
        .update({ status: "available" })
        .eq("id", slotId)
        .eq("status", "pending");

      return NextResponse.json(
        { error: "Dodo Payments did not return a checkout_url" },
        { status: 502 }
      );
    }

    return NextResponse.json({ checkout_url: session.checkout_url });
  } catch (err) {
    console.error("[checkout] Unexpected error:", err);
    return NextResponse.json(
      { error: "Internal server error creating checkout session" },
      { status: 500 }
    );
  }
}
