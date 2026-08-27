/**
 * POST /api/checkout
 *
 * Flow:
 *  1. Validate body + load slot by permanent DB id (`slotId`, e.g. "shorts_left");
 *     UI display badges ("01"–"09") are never used for lookup or Dodo metadata
 *  2. Title takeover: require 100% of active positions still available (read-only)
 *  3. Create a Dodo Payments checkout session (no DB writes yet)
 *  4. On successful session + checkout_url, mark slot(s) as `pending` in Supabase
 *  5. Return { checkout_url } for client redirect
 *
 * On payment success the webhook flips status → `sold`
 * (title_takeover marks every row sold in one transaction).
 * If the buyer abandons checkout, re-open the slot manually or via a TTL job.
 */
import { NextResponse } from "next/server";
import {
  calculateOrderTotalGbp,
  parseAddonFlags,
  resolveAddonProductIds,
} from "@/lib/addons";
import { assertDodoPaymentsConfigured, getDodoClient } from "@/lib/dodo";
import {
  getPositionPrice,
  hasAnySoldPosition,
  isPositionActive,
  isTitleTakeover,
  isTitleTakeoverPurchasable,
} from "@/lib/positions";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import type { CheckoutRequestBody, SponsorshipSlot } from "@/types/sponsorship";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<CheckoutRequestBody>;
    const { slotId, sponsorName, sponsorUrl, logoPath } = body;
    const addons = parseAddonFlags(body);

    if (!slotId || !sponsorName?.trim() || !sponsorUrl?.trim() || !logoPath) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: slotId, sponsorName, sponsorUrl, logoPath",
        },
        { status: 400 }
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

    // Load by permanent sponsorship_slots.id — not the remapped UI badge number
    const { data: slot, error: fetchError } = await admin
      .from("sponsorship_slots")
      .select("*")
      .eq("id", slotId)
      .single();

    if (fetchError || !slot) {
      return NextResponse.json({ error: "Slot not found" }, { status: 404 });
    }

    // Temporarily disabled placements (e.g. cap) must not reach Dodo
    if (!isTitleTakeover(slotId) && !isPositionActive(slotId)) {
      return NextResponse.json(
        { error: "This placement is not currently available." },
        { status: 404 },
      );
    }

    // Sold slots must never reach Dodo — send buyer back to pick another
    if (slot.status === "sold") {
      return NextResponse.json(
        {
          error: "Sorry! Someone just claimed that slot.",
          code: "slot_taken",
          redirect: `/?taken=${encodeURIComponent(slotId)}`,
        },
        { status: 400 }
      );
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

    const { productIds: addonProductIds, missing } =
      resolveAddonProductIds(addons);
    if (missing.length > 0) {
      return NextResponse.json(
        {
          error: `Add-on products are not configured. Set ${missing.join(" and ")} in the server environment.`,
        },
        { status: 422 }
      );
    }

    const name = sponsorName.trim();
    const url = sponsorUrl.trim();
    // Server-authoritative total — never trust a client-sent price
    const basePriceGbp = getPositionPrice(slotId) ?? slot.price_gbp;
    const orderTotalGbp = calculateOrderTotalGbp(basePriceGbp, addons);

    const productCart = [
      { product_id: slot.dodo_product_id as string, quantity: 1 },
      ...addonProductIds.map((product_id) => ({ product_id, quantity: 1 })),
    ];

    const metadata = {
      slot_id: slotId,
      sponsor_name: name,
      sponsor_url: url,
      customer_url: url,
      logo_path: logoPath,
      has_social_post: addons.hasSocialPost,
      has_dofollow_link: addons.hasDofollowLink,
      has_backlink: addons.hasDofollowLink,
      order_total_gbp: orderTotalGbp,
    };

    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ??
      "http://localhost:3000";
    const sponsorshipSlot = slot as SponsorshipSlot;
    const returnUrl = `${appUrl}/success?status=succeeded&slot=${encodeURIComponent(sponsorshipSlot.slot_name)}&category=${encodeURIComponent(sponsorshipSlot.category)}`;

    // ── Title Sponsor / Whole Kit Takeover ────────────────────────────────
    if (isTitleTakeover(slotId)) {
      const { data: allSlots, error: inventoryError } = await admin
        .from("sponsorship_slots")
        .select("*");

      if (inventoryError || !allSlots) {
        return NextResponse.json(
          { error: "Could not verify kit inventory" },
          { status: 500 }
        );
      }

      const inventory = allSlots as SponsorshipSlot[];

      if (
        hasAnySoldPosition(inventory) ||
        !isTitleTakeoverPurchasable(inventory)
      ) {
        return NextResponse.json(
          {
            error:
              "Title Sponsor is only available when every kit position is still open.",
            code: "title_takeover_blocked",
          },
          { status: 409 }
        );
      }

      const dodo = getDodoClient();
      let session;
      try {
        session = await dodo.checkoutSessions.create({
          product_cart: productCart,
          metadata,
          return_url: returnUrl,
        });
      } catch (err) {
        console.error("[checkout] Dodo session creation failed:", err);
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

      const { data: held, error: holdError } = await admin.rpc(
        "hold_title_takeover",
        {
          p_sponsor_name: name,
          p_sponsor_url: url,
          p_logo_path: logoPath,
          p_has_social_post: addons.hasSocialPost,
          p_has_dofollow_link: addons.hasDofollowLink,
        },
      );

      if (holdError) {
        console.error(
          "[checkout] title_takeover hold failed after Dodo session:",
          holdError.message,
        );
        return NextResponse.json(
          { error: "Could not reserve the kit. Please try again." },
          { status: 500 },
        );
      }

      if (!held) {
        return NextResponse.json(
          {
            error:
              "Title Sponsor is no longer available — a placement was just claimed.",
            code: "title_takeover_blocked",
          },
          { status: 409 },
        );
      }

      return NextResponse.json({
        checkout_url: session.checkout_url,
        order_total_gbp: orderTotalGbp,
      });
    }

    // ── Single placement ──────────────────────────────────────────────────
    const dodo = getDodoClient();
    let session;
    try {
      session = await dodo.checkoutSessions.create({
        product_cart: productCart,
        metadata,
        return_url: returnUrl,
      });
    } catch (err) {
      console.error("[checkout] Dodo session creation failed:", err);
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

    const { data: held, error: holdError } = await admin
      .from("sponsorship_slots")
      .update({
        status: "pending",
        sponsor_name: name,
        sponsor_url: url,
        destination_url: url,
        sponsor_logo_url: logoPath,
        has_social_post: addons.hasSocialPost,
        has_dofollow_link: addons.hasDofollowLink,
        has_backlink: addons.hasDofollowLink,
      })
      .eq("id", slotId)
      .eq("status", "available")
      .select("id")
      .maybeSingle();

    if (holdError) {
      console.error(
        "[checkout] Failed to hold slot after Dodo session:",
        holdError.message,
      );
      return NextResponse.json(
        { error: "Could not reserve slot. Please try again." },
        { status: 500 },
      );
    }

    if (!held) {
      return NextResponse.json(
        {
          error: "Sorry! Someone just claimed that slot.",
          code: "slot_taken",
          redirect: `/?taken=${encodeURIComponent(slotId)}`,
        },
        { status: 400 },
      );
    }

    return NextResponse.json({
      checkout_url: session.checkout_url,
      order_total_gbp: orderTotalGbp,
    });
  } catch (err) {
    console.error("[checkout] Unexpected error:", err);
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
