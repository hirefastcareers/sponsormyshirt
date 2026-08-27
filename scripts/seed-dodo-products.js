#!/usr/bin/env node
/**
 * Temporary setup: create Dodo one-time products for sponsorship slots
 * that are missing `dodo_product_id`, then write the IDs back to Supabase.
 *
 * Usage:
 *   npm run seed:dodo
 *
 * Requires in .env.local:
 *   DODO_PAYMENTS_API_KEY
 *   DODO_PAYMENTS_ENVIRONMENT (optional, default test_mode)
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */

const { createClient } = require("@supabase/supabase-js");
const DodoPayments = require("dodopayments");

async function main() {
  const apiKey = process.env.DODO_PAYMENTS_API_KEY;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const environment =
    process.env.DODO_PAYMENTS_ENVIRONMENT === "live_mode"
      ? "live_mode"
      : "test_mode";

  if (!apiKey) {
    console.error("Missing DODO_PAYMENTS_API_KEY");
    process.exit(1);
  }
  if (!supabaseUrl || !serviceKey) {
    console.error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY",
    );
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const dodo = new DodoPayments({
    bearerToken: apiKey,
    environment,
  });

  console.log(`Dodo environment: ${environment}`);
  console.log("Fetching sponsorship_slots…");

  const { data: slots, error } = await supabase
    .from("sponsorship_slots")
    .select("id, slot_name, price_gbp, dodo_product_id")
    .order("price_gbp", { ascending: false });

  if (error) {
    console.error("Failed to load sponsorship_slots:", error.message);
    process.exit(1);
  }

  if (!slots?.length) {
    console.log("No slots found.");
    return;
  }

  const missing = slots.filter((s) => !s.dodo_product_id);
  const already = slots.length - missing.length;

  console.log(
    `Found ${slots.length} slot(s): ${already} already linked, ${missing.length} to create.`,
  );

  if (missing.length === 0) {
    console.log("Nothing to do.");
    return;
  }

  let created = 0;
  let failed = 0;

  for (const slot of missing) {
    const name = `${slot.slot_name} Sponsorship`;
    const pricePence = Math.round(Number(slot.price_gbp) * 100);

    if (!Number.isFinite(pricePence) || pricePence <= 0) {
      console.error(`  ✗ ${slot.id}: invalid price_gbp=${slot.price_gbp}`);
      failed++;
      continue;
    }

    process.stdout.write(
      `  → ${slot.id}: creating "${name}" @ £${slot.price_gbp} (${pricePence}p)… `,
    );

    try {
      const product = await dodo.products.create({
        name,
        description: `Great North Run kit sponsorship — ${slot.slot_name}`,
        tax_category: "digital_products",
        price: {
          type: "one_time_price",
          currency: "GBP",
          price: pricePence,
          discount: 0,
          tax_inclusive: true,
        },
        metadata: {
          slot_id: slot.id,
        },
      });

      const productId = product.product_id;
      if (!productId) {
        throw new Error("Dodo response missing product_id");
      }

      const { error: updateError } = await supabase
        .from("sponsorship_slots")
        .update({ dodo_product_id: productId })
        .eq("id", slot.id);

      if (updateError) {
        throw new Error(
          `Dodo product ${productId} created but Supabase update failed: ${updateError.message}`,
        );
      }

      console.log(`ok → ${productId}`);
      created++;
    } catch (err) {
      console.log("FAILED");
      console.error(`    ${err.message || err}`);
      failed++;
    }
  }

  console.log(`\nDone. Created: ${created}, failed: ${failed}.`);
  if (failed > 0) process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
