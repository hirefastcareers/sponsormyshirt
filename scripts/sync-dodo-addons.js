#!/usr/bin/env node
/**
 * Create / refresh Dodo checkout upsell products and write IDs to .env.local.
 *
 * Mirrors lib/addons.ts (Social Post £100, Dofollow Link £50).
 *
 * Usage:
 *   npm run sync:dodo-addons
 *
 * Requires in .env.local:
 *   DODO_PAYMENTS_API_KEY
 *   DODO_PAYMENTS_ENVIRONMENT=live_mode   (for production products)
 */

const fs = require("node:fs");
const path = require("node:path");
const DodoPayments = require("dodopayments");

/** Keep in sync with lib/addons.ts */
const ADDONS = [
  {
    envKey: "DODO_PRODUCT_SOCIAL_POST",
    addonId: "social_post",
    name: "Social Announcement Post Add-on",
    description:
      "Dedicated thread on X & LinkedIn tagging your brand after sponsorship purchase.",
    price_gbp: 100,
  },
  {
    envKey: "DODO_PRODUCT_DOFOLLOW_LINK",
    addonId: "dofollow_link",
    name: "Dofollow SEO Backlink Add-on",
    description:
      "Permanent clickable dofollow link on sponsormyshirt.app for your brand.",
    price_gbp: 50,
  },
];

const ENV_PATH = path.join(process.cwd(), ".env.local");

function toPence(gbp) {
  return Math.round(Number(gbp) * 100);
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

function isMissingProductError(err) {
  const message = err?.message || String(err);
  return (
    message.includes("404") || message.toLowerCase().includes("not be found")
  );
}

function updateEnvLocal(updates) {
  if (!fs.existsSync(ENV_PATH)) {
    throw new Error(`.env.local not found at ${ENV_PATH}`);
  }

  let content = fs.readFileSync(ENV_PATH, "utf8");
  for (const [key, value] of Object.entries(updates)) {
    const pattern = new RegExp(`^${key}=.*$`, "m");
    if (pattern.test(content)) {
      content = content.replace(pattern, `${key}=${value}`);
    } else {
      content = `${content.trimEnd()}\n${key}=${value}\n`;
    }
  }
  fs.writeFileSync(ENV_PATH, content);
}

async function ensureAddonProduct(dodo, addon, existingId) {
  const pricePence = toPence(addon.price_gbp);

  if (existingId) {
    process.stdout.write(
      `  → ${addon.addonId}: checking ${existingId} @ £${addon.price_gbp}… `,
    );
    try {
      const product = await dodo.products.retrieve(existingId);
      const existingPence = currentProductPence(product);
      const taxInclusive = product.price?.tax_inclusive === true;

      if (existingPence === pricePence && taxInclusive) {
        console.log("unchanged");
        return { productId: existingId, created: false };
      }

      await dodo.products.update(existingId, {
        name: addon.name,
        description: addon.description,
        price: oneTimePrice(pricePence),
        metadata: { addon_id: addon.addonId },
      });
      console.log(
        `updated £${existingPence == null ? "?" : existingPence / 100} → £${addon.price_gbp}`,
      );
      return { productId: existingId, created: false };
    } catch (err) {
      if (!isMissingProductError(err)) throw err;
      console.log("missing in Dodo — creating…");
    }
  } else {
    process.stdout.write(
      `  → ${addon.addonId}: creating @ £${addon.price_gbp}… `,
    );
  }

  const product = await dodo.products.create({
    name: addon.name,
    description: addon.description,
    tax_category: "digital_products",
    price: oneTimePrice(pricePence),
    metadata: { addon_id: addon.addonId },
  });

  const productId = product.product_id;
  if (!productId) {
    throw new Error("Dodo response missing product_id");
  }

  console.log(`ok → ${productId}`);
  return { productId, created: true };
}

async function main() {
  const apiKey = process.env.DODO_PAYMENTS_API_KEY;
  const environment =
    process.env.DODO_PAYMENTS_ENVIRONMENT === "live_mode"
      ? "live_mode"
      : "test_mode";

  if (!apiKey) {
    console.error("Missing DODO_PAYMENTS_API_KEY");
    process.exit(1);
  }

  const dodo = new DodoPayments({
    bearerToken: apiKey,
    environment,
  });

  console.log(`Dodo environment: ${environment}`);
  console.log("Syncing checkout upsell products…\n");

  const envUpdates = {};
  let created = 0;
  let unchanged = 0;

  for (const addon of ADDONS) {
    const existingId = process.env[addon.envKey]?.trim() || null;
    try {
      const { productId, created: wasCreated } = await ensureAddonProduct(
        dodo,
        addon,
        existingId,
      );
      envUpdates[addon.envKey] = productId;
      if (wasCreated) created++;
      else unchanged++;
    } catch (err) {
      console.log("FAILED");
      console.error(`    ${err.message || err}`);
      process.exit(1);
    }
  }

  updateEnvLocal(envUpdates);

  console.log("\nLive product IDs:");
  for (const addon of ADDONS) {
    console.log(`  ${addon.envKey}=${envUpdates[addon.envKey]}`);
  }
  console.log(`\nUpdated ${ENV_PATH}`);
  console.log(
    `Done. Created: ${created}, unchanged/updated in place: ${unchanged}.`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
