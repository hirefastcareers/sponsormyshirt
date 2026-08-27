#!/usr/bin/env node
/**
 * Sync sponsorship slot catalogue → Dodo Payments products.
 *
 * - Creates one-time GBP (tax-inclusive) products for slots missing `dodo_product_id`
 * - Updates Dodo product prices when the local/Supabase catalogue price changes
 * - Writes new `dodo_product_id` values back to Supabase
 *
 * Usage:
 *   npm run sync:dodo
 *
 * Requires in .env.local:
 *   DODO_PAYMENTS_API_KEY
 *   DODO_PAYMENTS_ENVIRONMENT (optional, default test_mode)
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *
 * Local prices mirror `lib/positions.ts` (canonical rate card). When a slot id
 * appears here, that GBP amount is preferred over the DB value for the sync.
 */

const { createClient } = require("@supabase/supabase-js");
const DodoPayments = require("dodopayments");

/** Keep in sync with lib/positions.ts */
const LOCAL_PRICES = {
  title_takeover: 1200,
  chest_center: 1200,
  left_chest: 650,
  upper_back: 500,
  lower_back: 350,
  cap_front: 300,
  shorts_left: 250,
  shorts_right: 250,
  right_sleeve: 200,
  left_sleeve: 200,
  left_sock: 100,
  right_sock: 100,
};

function resolvePriceGbp(slot) {
  if (Object.prototype.hasOwnProperty.call(LOCAL_PRICES, slot.id)) {
    return LOCAL_PRICES[slot.id];
  }
  return Number(slot.price_gbp);
}

function toPence(gbp) {
  return Math.round(Number(gbp) * 100);
}

function productName(slot) {
  return `${slot.slot_name} Sponsorship`;
}

function oneTimePrice(pence) {
  return {
    type: "one_time_price",
    currency: "GBP",
    price: pence,
    discount: 0,
    purchasing_power_parity: false,
    tax_inclusive: true,
  };
}

function currentProductPence(product) {
  const price = product?.price;
  if (!price || price.type !== "one_time_price") return null;
  return typeof price.price === "number" ? price.price : null;
}

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

  const linked = slots.filter((s) => s.dodo_product_id);
  const missing = slots.filter((s) => !s.dodo_product_id);

  console.log(
    `Found ${slots.length} slot(s): ${linked.length} linked, ${missing.length} without product.`,
  );

  let created = 0;
  let updated = 0;
  let unchanged = 0;
  let failed = 0;

  for (const slot of slots) {
    const priceGbp = resolvePriceGbp(slot);
    const pricePence = toPence(priceGbp);

    if (!Number.isFinite(pricePence) || pricePence <= 0) {
      console.error(`  ✗ ${slot.id}: invalid price_gbp=${priceGbp}`);
      failed++;
      continue;
    }

    // Keep Supabase price aligned with local catalogue when they differ
    if (
      Object.prototype.hasOwnProperty.call(LOCAL_PRICES, slot.id) &&
      Number(slot.price_gbp) !== priceGbp
    ) {
      const { error: priceError } = await supabase
        .from("sponsorship_slots")
        .update({ price_gbp: priceGbp })
        .eq("id", slot.id);
      if (priceError) {
        console.error(
          `  ✗ ${slot.id}: failed to sync price_gbp in Supabase: ${priceError.message}`,
        );
        failed++;
        continue;
      }
      console.log(
        `  · ${slot.id}: Supabase price_gbp ${slot.price_gbp} → ${priceGbp}`,
      );
    }

    const name = productName(slot);

    if (!slot.dodo_product_id) {
      process.stdout.write(
        `  → ${slot.id}: creating "${name}" @ £${priceGbp} (${pricePence}p)… `,
      );
      try {
        const product = await dodo.products.create({
          name,
          description: `Great North Run kit sponsorship — ${slot.slot_name}`,
          tax_category: "digital_products",
          price: oneTimePrice(pricePence),
          metadata: { slot_id: slot.id },
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
      continue;
    }

    process.stdout.write(
      `  → ${slot.id}: checking ${slot.dodo_product_id} @ £${priceGbp}… `,
    );

    try {
      const product = await dodo.products.retrieve(slot.dodo_product_id);
      const existingPence = currentProductPence(product);
      const taxInclusive = product.price?.tax_inclusive === true;

      if (existingPence === pricePence && taxInclusive) {
        console.log("unchanged");
        unchanged++;
        continue;
      }

      await dodo.products.update(slot.dodo_product_id, {
        name,
        description: `Great North Run kit sponsorship — ${slot.slot_name}`,
        price: oneTimePrice(pricePence),
        metadata: { slot_id: slot.id },
      });

      const before =
        existingPence == null ? "?" : `£${(existingPence / 100).toFixed(0)}`;
      console.log(`updated ${before} → £${priceGbp}`);
      updated++;
    } catch (err) {
      console.log("FAILED");
      console.error(`    ${err.message || err}`);
      failed++;
    }
  }

  console.log(
    `\nDone. Created: ${created}, updated: ${updated}, unchanged: ${unchanged}, failed: ${failed}.`,
  );
  if (failed > 0) process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
