#!/usr/bin/env node
/**
 * Create / refresh the £2 Micro-Sponsor Wall Dodo product and write ID to .env.local.
 *
 * Usage:
 *   npm run sync:dodo-micro
 *
 * Requires in .env.local:
 *   DODO_PAYMENTS_API_KEY
 *   DODO_PAYMENTS_ENVIRONMENT=live_mode   (for production products)
 */

const fs = require("node:fs");
const path = require("node:path");
const DodoPayments = require("dodopayments");

/** Keep in sync with lib/micro-sponsors.ts */
const MICRO_SPONSOR = {
  envKey: "DODO_PRODUCT_MICRO_SPONSOR",
  name: "Micro-Sponsor Wall Placement",
  description:
    "£2 logo placement on the Micro-Sponsor Wall — visible in page gutters (desktop) and marquee (mobile).",
  price_gbp: 2,
};

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

async function ensureProduct(dodo, existingId) {
  const pricePence = toPence(MICRO_SPONSOR.price_gbp);

  if (existingId) {
    process.stdout.write(
      `  → micro_sponsor: checking ${existingId} @ £${MICRO_SPONSOR.price_gbp}… `,
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
        name: MICRO_SPONSOR.name,
        description: MICRO_SPONSOR.description,
        price: oneTimePrice(pricePence),
        metadata: { checkout_type: "micro_sponsor" },
      });
      console.log(
        `updated £${existingPence == null ? "?" : existingPence / 100} → £${MICRO_SPONSOR.price_gbp}`,
      );
      return { productId: existingId, created: false };
    } catch (err) {
      if (!isMissingProductError(err)) throw err;
      console.log("missing in Dodo — creating…");
    }
  } else {
    process.stdout.write(
      `  → micro_sponsor: creating @ £${MICRO_SPONSOR.price_gbp}… `,
    );
  }

  const product = await dodo.products.create({
    name: MICRO_SPONSOR.name,
    description: MICRO_SPONSOR.description,
    tax_category: "digital_products",
    price: oneTimePrice(pricePence),
    metadata: { checkout_type: "micro_sponsor" },
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
  console.log("Syncing Micro-Sponsor Wall product…\n");

  const existingId = process.env[MICRO_SPONSOR.envKey]?.trim() || null;
  const { productId, created } = await ensureProduct(dodo, existingId);

  updateEnvLocal({ [MICRO_SPONSOR.envKey]: productId });

  console.log(`\n${MICRO_SPONSOR.envKey}=${productId}`);
  console.log(`Updated ${ENV_PATH}`);
  console.log(`Done. ${created ? "Created new product." : "Product unchanged/updated."}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
