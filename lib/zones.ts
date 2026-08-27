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

/** Marker positions as % of each garment panel (tuned to SVG viewBoxes). */
export const MARKER_POS: Record<
  ZoneId,
  { left: string; top: string; size: number }
> = {
  // Tuned to Lucide shirt silhouette (viewBox 240×240)
  chest_center: { left: "50%", top: "54%", size: 34 },
  // Wearer's left chest (heart) = viewer's right
  left_chest: { left: "65%", top: "46%", size: 28 },
  // Wearer's right sleeve = left of graphic
  right_sleeve: { left: "16%", top: "28%", size: 28 },
  left_sleeve: { left: "84%", top: "28%", size: 28 },
  upper_back: { left: "50%", top: "42%", size: 32 },
  lower_back: { left: "50%", top: "66%", size: 32 },
  // Cap crown panel (above brim)
  cap_front: { left: "50%", top: "36%", size: 30 },
  shorts_left: { left: "33%", top: "52%", size: 28 },
  left_sock: { left: "25%", top: "32%", size: 26 },
  right_sock: { left: "75%", top: "32%", size: 26 },
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
