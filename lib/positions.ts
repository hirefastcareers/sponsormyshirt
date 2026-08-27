/**
 * Canonical kit placements, premium GBP pricing, and title-takeover helpers.
 * Prices here are the source of truth for the rate card UI.
 *
 * Flip `active` on a POSITION_META entry to temporarily hide a placement
 * from the kit UI, rate card, and Title Sponsor sum (set back to `true` to restore).
 */
import type { SponsorshipSlot, SlotCategory } from "@/types/sponsorship";

/** Whole-kit title sponsorship — sells every placement in one purchase. */
export const TITLE_TAKEOVER_ID = "title_takeover" as const;

/** Premium rate card — individual placement prices (GBP). */
export const POSITION_PRICES = {
  chest_center: 1200,
  upper_back: 500,
  lower_back: 350,
  cap_front: 300,
  shorts_left: 250,
  shorts_right: 250,
  right_sleeve: 200,
  left_sleeve: 200,
  left_sock: 100,
  right_sock: 100,
} as const;

export type PositionId = keyof typeof POSITION_PRICES;

/**
 * Optional fixed Title Sponsor price (GBP).
 * When unset, the master package price is the sum of all ACTIVE placement prices.
 */
export const TITLE_SPONSOR_PRICE: number | undefined = undefined;

export const POSITION_META: Record<
  PositionId,
  { slot_name: string; category: SlotCategory; active: boolean }
> = {
  chest_center: {
    slot_name: "Chest Center (High / Bib)",
    category: "shirt",
    active: true,
  },
  upper_back: { slot_name: "Upper Back", category: "shirt", active: true },
  lower_back: { slot_name: "Lower Back", category: "shirt", active: true },
  // Temporarily unavailable — flip `active` to true to restore
  cap_front: { slot_name: "Cap Front", category: "headwear", active: false },
  shorts_left: {
    slot_name: "Shorts Left Leg",
    category: "shorts",
    active: true,
  },
  shorts_right: {
    slot_name: "Shorts Right Leg",
    category: "shorts",
    active: true,
  },
  right_sleeve: { slot_name: "Right Sleeve", category: "shirt", active: true },
  left_sleeve: { slot_name: "Left Sleeve", category: "shirt", active: true },
  left_sock: { slot_name: "Left Sock", category: "socks", active: true },
  right_sock: { slot_name: "Right Sock", category: "socks", active: true },
};

export function isPositionActive(slotId: string): boolean {
  if (!(slotId in POSITION_META)) return false;
  return POSITION_META[slotId as PositionId].active !== false;
}

/** Active kit placement ids (excludes temporarily disabled slots). */
export function getActivePositionIds(): PositionId[] {
  return (Object.keys(POSITION_PRICES) as PositionId[]).filter((id) =>
    isPositionActive(id),
  );
}

/** Sum of every ACTIVE individual kit placement on the rate card. */
export function sumPlacementPrices(): number {
  return getActivePositionIds().reduce(
    (sum, id) => sum + POSITION_PRICES[id],
    0,
  );
}

/** Resolved Title Sponsor / Whole Kit price in GBP. */
export function getTitleSponsorPrice(): number {
  return TITLE_SPONSOR_PRICE ?? sumPlacementPrices();
}

export const TITLE_TAKEOVER = {
  id: TITLE_TAKEOVER_ID,
  slot_name: "Title Sponsor / Whole Kit Takeover",
  category: "takeover" as const,
  get price_gbp() {
    return getTitleSponsorPrice();
  },
} as const;

export function getPositionPrice(slotId: string): number | undefined {
  if (isTitleTakeover(slotId)) return getTitleSponsorPrice();
  if (slotId in POSITION_PRICES) {
    return POSITION_PRICES[slotId as PositionId];
  }
  return undefined;
}

/**
 * Overlay canonical GBP prices + `active` flags from this module onto live
 * slot rows so the rate card / kit UI always show the current rate card.
 */
export function applyCanonicalPrices(
  slots: SponsorshipSlot[],
): SponsorshipSlot[] {
  return slots.map((slot) => {
    const price = getPositionPrice(slot.id);
    const active = isTitleTakeover(slot.id)
      ? true
      : isPositionActive(slot.id);
    return {
      ...slot,
      ...(price !== undefined ? { price_gbp: price } : {}),
      active,
    };
  });
}

/** Drop inactive placements from UI inventory and price totals. */
export function filterActiveSlots(
  slots: SponsorshipSlot[],
): SponsorshipSlot[] {
  return slots.filter((slot) => slot.active !== false);
}

export function isTitleTakeover(slotId: string): boolean {
  return slotId === TITLE_TAKEOVER_ID;
}

/** Active individual kit placements only (excludes title takeover + inactive). */
export function getKitPositions(slots: SponsorshipSlot[]): SponsorshipSlot[] {
  return slots.filter(
    (slot) => !isTitleTakeover(slot.id) && slot.active !== false,
  );
}

/**
 * Title Sponsor is only purchasable when every ACTIVE kit position is still
 * available (and the takeover row itself is available). Any sold/pending
 * active slot blocks it. Inactive placements are ignored.
 */
export function isTitleTakeoverPurchasable(slots: SponsorshipSlot[]): boolean {
  const positions = getKitPositions(slots);
  if (positions.length === 0) return false;

  const allPositionsOpen = positions.every((s) => s.status === "available");
  const takeover = slots.find((s) => isTitleTakeover(s.id));
  const takeoverOpen = !takeover || takeover.status === "available";

  return allPositionsOpen && takeoverOpen;
}

/** True when any ACTIVE kit position has already been sold. */
export function hasAnySoldPosition(slots: SponsorshipSlot[]): boolean {
  return getKitPositions(slots).some((s) => s.status === "sold");
}
