/**
 * Canonical placement order, display numbers, and garment labels
 * shared by KitVisualizer + RateCardSidebar.
 */
import type { SponsorshipSlot } from "@/types/sponsorship";

export const ZONE_META = [
  { id: "chest_center", num: "01", garment: "Shirt" },
  { id: "left_chest", num: "02", garment: "Shirt" },
  { id: "upper_back", num: "03", garment: "Shirt" },
  { id: "lower_back", num: "04", garment: "Shirt" },
  { id: "cap_front", num: "05", garment: "Cap" },
  { id: "shorts_left", num: "06", garment: "Shorts" },
  { id: "right_sleeve", num: "07", garment: "Shirt" },
  { id: "left_sleeve", num: "08", garment: "Shirt" },
  { id: "left_sock", num: "09", garment: "Socks" },
  { id: "right_sock", num: "10", garment: "Socks" },
] as const;

export type ZoneId = (typeof ZONE_META)[number]["id"];

/** Marker positions as % of each garment panel. */
export const MARKER_POS: Record<
  ZoneId,
  { left: string; top: string; size: number }
> = {
  chest_center: { left: "50%", top: "52%", size: 34 },
  left_chest: { left: "32%", top: "40%", size: 30 },
  // Wearer's right sleeve = left side of front graphic
  right_sleeve: { left: "14%", top: "28%", size: 28 },
  // Wearer's left sleeve = right side of front graphic
  left_sleeve: { left: "86%", top: "28%", size: 28 },
  upper_back: { left: "50%", top: "34%", size: 34 },
  lower_back: { left: "50%", top: "62%", size: 32 },
  // Front crown panel of the cap (above the brim seam)
  cap_front: { left: "48%", top: "38%", size: 30 },
  shorts_left: { left: "36%", top: "48%", size: 28 },
  left_sock: { left: "26%", top: "36%", size: 26 },
  right_sock: { left: "74%", top: "36%", size: 26 },
};

export function orderSlots(slots: SponsorshipSlot[]) {
  const byId = new Map(slots.map((s) => [s.id, s]));
  return ZONE_META.map((zone) => {
    const slot = byId.get(zone.id);
    return slot ? { zone, slot } : null;
  }).filter(
    (row): row is { zone: (typeof ZONE_META)[number]; slot: SponsorshipSlot } =>
      row !== null,
  );
}
