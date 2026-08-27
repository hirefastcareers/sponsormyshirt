/**
 * Optional checkout upsells — prices are the server-side source of truth.
 */

export const SOCIAL_POST_ADDON = {
  id: "social_post",
  title: "Social Announcement Post",
  subtitle: "Dedicated thread on X & LinkedIn tagging your brand.",
  price_gbp: 100,
  envProductId: "DODO_PRODUCT_SOCIAL_POST",
} as const;

export const DOFOLLOW_LINK_ADDON = {
  id: "dofollow_link",
  title: "Dofollow SEO Backlink",
  subtitle: "Permanent clickable link on sponsormyshirt.app.",
  price_gbp: 50,
  envProductId: "DODO_PRODUCT_DOFOLLOW_LINK",
} as const;

export interface CheckoutAddons {
  hasSocialPost: boolean;
  hasDofollowLink: boolean;
}

/** Server-authoritative order total (base slot + selected add-ons). */
export function calculateOrderTotalGbp(
  basePriceGbp: number,
  addons: CheckoutAddons,
): number {
  let total = basePriceGbp;
  if (addons.hasSocialPost) total += SOCIAL_POST_ADDON.price_gbp;
  if (addons.hasDofollowLink) total += DOFOLLOW_LINK_ADDON.price_gbp;
  return total;
}

export function parseAddonFlags(body: {
  hasSocialPost?: unknown;
  hasDofollowLink?: unknown;
}): CheckoutAddons {
  return {
    hasSocialPost: body.hasSocialPost === true,
    hasDofollowLink: body.hasDofollowLink === true,
  };
}

/** Resolve Dodo product ids for selected add-ons; null if a product is missing. */
export function resolveAddonProductIds(addons: CheckoutAddons): {
  productIds: string[];
  missing: string[];
} {
  const productIds: string[] = [];
  const missing: string[] = [];

  if (addons.hasSocialPost) {
    const id = process.env.DODO_PRODUCT_SOCIAL_POST?.trim();
    if (id) productIds.push(id);
    else missing.push(SOCIAL_POST_ADDON.envProductId);
  }

  if (addons.hasDofollowLink) {
    const id = process.env.DODO_PRODUCT_DOFOLLOW_LINK?.trim();
    if (id) productIds.push(id);
    else missing.push(DOFOLLOW_LINK_ADDON.envProductId);
  }

  return { productIds, missing };
}

export function addonLabels(addons: {
  has_social_post?: boolean | null;
  has_dofollow_link?: boolean | null;
  has_backlink?: boolean | null;
}): string[] {
  const labels: string[] = [];
  if (addons.has_social_post) labels.push(SOCIAL_POST_ADDON.title);
  if (addons.has_dofollow_link || addons.has_backlink) {
    labels.push(DOFOLLOW_LINK_ADDON.title);
  }
  return labels;
}
