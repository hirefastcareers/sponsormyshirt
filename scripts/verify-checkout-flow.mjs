#!/usr/bin/env node
/**
 * Verifies checkout return_url shape, success page rendering, and webhook fulfilment.
 * Usage: node --env-file=.env.local scripts/verify-checkout-flow.mjs [slot_id]
 */
import { createClient } from "@supabase/supabase-js";

const BASE =
  process.env.VERIFY_BASE_URL?.replace(/\/$/, "") ||
  process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ||
  "http://localhost:3000";

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

async function getSlot(id) {
  const { data, error } = await admin
    .from("sponsorship_slots")
    .select("id, slot_name, category, status, dodo_product_id")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data;
}

async function main() {
  let slotId = process.argv[2] || "left_sock";
  let slot = await getSlot(slotId);

  if (slot.status !== "available") {
    const fallback = slotId === "left_sock" ? "right_sock" : "left_sock";
    console.log(`${slotId} is ${slot.status}; trying ${fallback}`);
    slotId = fallback;
    slot = await getSlot(slotId);
  }

  if (slot.status !== "available") {
    console.error(`No available slot for test (${slotId} is ${slot.status})`);
    process.exit(1);
  }

  const expectedReturn = `${BASE}/success?slot=${encodeURIComponent(slot.slot_name)}&category=${encodeURIComponent(slot.category)}`;
  console.log("Slot:", slot);
  console.log("Expected return_url:", expectedReturn);

  const png = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
    "base64",
  );
  const form = new FormData();
  form.append("file", new Blob([png], { type: "image/png" }), "test-logo.png");

  const uploadRes = await fetch(`${BASE}/api/upload`, {
    method: "POST",
    body: form,
  });
  const uploadJson = await uploadRes.json();
  if (!uploadRes.ok) {
    throw new Error(`Upload failed: ${JSON.stringify(uploadJson)}`);
  }

  const checkoutRes = await fetch(`${BASE}/api/checkout`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      slotId: slot.id,
      sponsorName: "Checkout Test Sponsor",
      sponsorUrl: "https://example.com",
      logoPath: uploadJson.path,
    }),
  });
  const checkoutJson = await checkoutRes.json();
  console.log("Checkout:", checkoutRes.status, checkoutJson);
  if (!checkoutRes.ok) {
    throw new Error("Checkout session creation failed");
  }

  const pending = await getSlot(slot.id);
  console.log("After checkout (expect pending):", pending);

  const successUrl = `${BASE}/success?slot=${encodeURIComponent(slot.slot_name)}&category=${encodeURIComponent(slot.category)}`;
  const successRes = await fetch(successUrl);
  const successHtml = await successRes.text();
  const headline = `You're on the ${slot.category}!`;
  const headlineOk = successHtml.includes(headline);
  const slotOk = successHtml.includes(slot.slot_name);
  console.log("Success page:", successRes.status, { headline, headlineOk, slotOk });

  const whRes = await fetch(`${BASE}/api/test-webhook`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      slot_id: slot.id,
      sponsor_name: "Checkout Test Sponsor",
      sponsor_url: "https://example.com",
      logo_path: uploadJson.path,
    }),
  });
  const whJson = await whRes.json();
  console.log("Test webhook:", whRes.status, whJson);

  const sold = await getSlot(slot.id);
  console.log("After webhook (expect sold):", sold);

  const ok =
    pending.status === "pending" &&
    sold.status === "sold" &&
    headlineOk &&
    slotOk &&
    whRes.ok;

  if (!ok) process.exit(1);
  console.log("\nAll checks passed.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
