/**
 * Resolve or auto-provision the Dodo product for £5 Micro-Sponsor checkout.
 * When DODO_PRODUCT_MICRO_SPONSOR is unset, creates the product via the Dodo API
 * (same behaviour as `npm run sync:dodo-micro`) and caches the id in-process.
 */
import type DodoPayments from "dodopayments";
import { getDodoClient } from "@/lib/dodo";
import {
  getMicroSponsorProductId,
  MICRO_SPONSOR_CHECKOUT_TYPE,
  MICRO_SPONSOR_PRICE_GBP,
  MICRO_SPONSOR_PRODUCT,
  MICRO_SPONSOR_PRODUCT_ENV,
} from "@/lib/micro-sponsors";

function toPence(gbp: number): number {
  return Math.round(gbp * 100);
}

function oneTimePrice(pence: number) {
  return {
    type: "one_time_price" as const,
    currency: "GBP" as const,
    price: pence,
    discount: 0,
    purchasing_power_parity: false,
    tax_inclusive: true,
  };
}

function currentProductPence(product: {
  price?: { type?: string; price?: number };
}): number | null {
  const price = product.price;
  if (!price || price.type !== "one_time_price") return null;
  return typeof price.price === "number" ? price.price : null;
}

function isMissingProductError(err: unknown): boolean {
  const message = err instanceof Error ? err.message : String(err);
  return (
    message.includes("404") || message.toLowerCase().includes("not be found")
  );
}

/** In-process cache when the product id was auto-provisioned or verified. */
let cachedProductId: string | null = null;
let resolvePromise: Promise<string> | null = null;

async function ensureMicroSponsorProduct(
  dodo: DodoPayments,
  existingId: string | null,
): Promise<string> {
  const pricePence = toPence(MICRO_SPONSOR_PRICE_GBP);

  if (existingId) {
    try {
      const product = await dodo.products.retrieve(existingId);
      const existingPence = currentProductPence(product);
      const taxInclusive = product.price?.tax_inclusive === true;

      if (existingPence === pricePence && taxInclusive) {
        return existingId;
      }

      await dodo.products.update(existingId, {
        name: MICRO_SPONSOR_PRODUCT.name,
        description: MICRO_SPONSOR_PRODUCT.description,
        price: oneTimePrice(pricePence),
        metadata: { checkout_type: MICRO_SPONSOR_CHECKOUT_TYPE },
      });
      return existingId;
    } catch (err) {
      if (!isMissingProductError(err)) throw err;
    }
  }

  const product = await dodo.products.create({
    name: MICRO_SPONSOR_PRODUCT.name,
    description: MICRO_SPONSOR_PRODUCT.description,
    tax_category: "digital_products",
    price: oneTimePrice(pricePence),
    metadata: { checkout_type: MICRO_SPONSOR_CHECKOUT_TYPE },
  });

  const productId = product.product_id;
  if (!productId) {
    throw new Error("Dodo Payments did not return a product_id");
  }

  return productId;
}

export class MicroSponsorProductConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MicroSponsorProductConfigError";
  }
}

/**
 * Returns the micro-sponsor Dodo product id, reading process.env first and
 * auto-provisioning via the Dodo API when the env var is missing or stale.
 */
export async function resolveMicroSponsorProductId(): Promise<string> {
  const fromEnv = getMicroSponsorProductId();
  if (fromEnv) return fromEnv;

  if (cachedProductId) return cachedProductId;
  if (resolvePromise) return resolvePromise;

  resolvePromise = (async () => {
    const dodo = getDodoClient();
    const seedId = getMicroSponsorProductId() ?? cachedProductId;
    const productId = await ensureMicroSponsorProduct(dodo, seedId);

    cachedProductId = productId;

    if (!getMicroSponsorProductId()) {
      console.warn(
        `[micro-sponsors] Auto-provisioned Dodo product ${productId}. ` +
          `Set ${MICRO_SPONSOR_PRODUCT_ENV}=${productId} in the server environment ` +
          `(or run npm run sync:dodo-micro) to avoid duplicate products across deploys.`,
      );
    }

    return productId;
  })().finally(() => {
    resolvePromise = null;
  });

  try {
    return await resolvePromise;
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    throw new MicroSponsorProductConfigError(
      `Micro-sponsor checkout is not ready: could not resolve the Dodo product. ` +
        `Set ${MICRO_SPONSOR_PRODUCT_ENV} in the server environment and run ` +
        `npm run sync:dodo-micro, or verify DODO_PAYMENTS_API_KEY permissions. ` +
        `(${detail})`,
    );
  }
}
