/**
 * Canonical placement order, display numbers, and garment labels
 * shared by KitVisualizer + RateCardSidebar.
 */
import { isPositionActive } from "@/lib/positions";
import type { SponsorshipSlot } from "@/types/sponsorship";

export const ZONE_META = [
  { id: "chest_center", num: "01", garment: "Shirt" },
  { id: "upper_back", num: "02", garment: "Shirt" },
  { id: "lower_back", num: "03", garment: "Shirt" },
  { id: "cap_front", num: "04", garment: "Cap" },
  { id: "shorts_left", num: "05", garment: "Shorts" },
  { id: "shorts_right", num: "06", garment: "Shorts" },
  { id: "right_sleeve", num: "07", garment: "Shirt" },
  { id: "left_sleeve", num: "08", garment: "Shirt" },
  { id: "left_sock", num: "09", garment: "Socks" },
  { id: "right_sock", num: "10", garment: "Socks" },
] as const;

export type ZoneId = (typeof ZONE_META)[number]["id"];

export type ActiveZone = {
  id: ZoneId;
  /** Contiguous display index among active slots only (01, 02, …). */
  num: string;
  garment: string;
};

/** Zero-based index → padded badge label ("01", "02", …). */
export function formatDisplayIndex(index: number): string {
  return String(index + 1).padStart(2, "0");
}

/**
 * Active zones with contiguous UI numbers (gaps from inactive slots removed).
 * Remaps `num` for badges/labels only — zone `id` stays the permanent key
 * (e.g. shorts_left) used by checkout / Dodo / Supabase.
 * e.g. with cap disabled: shorts_left displays as "04", but id remains "shorts_left".
 */
export function getActiveZones(): ActiveZone[] {
  return ZONE_META.filter((zone) => isPositionActive(zone.id)).map(
    (zone, index) => ({
      id: zone.id,
      garment: zone.garment,
      num: formatDisplayIndex(index),
    }),
  );
}

/** Map of active zone id → contiguous display number. */
export function getActiveDisplayNums(): Record<string, string> {
  return Object.fromEntries(
    getActiveZones().map((zone) => [zone.id, zone.num]),
  );
}

/** Marker positions as % of each garment panel (tuned to SVG viewBoxes). */
export const MARKER_POS: Record<
  ZoneId,
  { left: string; top: string; size: number }
> = {
  // Tuned to Lucide shirt silhouette (viewBox 240×240); sizes ~1.45× prior
  // High chest / race-bib band — centered on the front torso
  chest_center: { left: "50%", top: "42%", size: 50 },
  // Wearer's right sleeve = left of graphic
  right_sleeve: { left: "16%", top: "28%", size: 42 },
  left_sleeve: { left: "84%", top: "28%", size: 42 },
  upper_back: { left: "50%", top: "42%", size: 48 },
  lower_back: { left: "50%", top: "66%", size: 48 },
  // Cap crown panel (above brim)
  cap_front: { left: "50%", top: "36%", size: 44 },
  // Wearer's left leg = viewer's right; right leg = viewer's left
  shorts_left: { left: "67%", top: "52%", size: 42 },
  shorts_right: { left: "33%", top: "52%", size: 42 },
  left_sock: { left: "25%", top: "32%", size: 40 },
  right_sock: { left: "75%", top: "32%", size: 40 },
};

export function orderSlots(slots: SponsorshipSlot[]) {
  const byId = new Map(slots.map((s) => [s.id, s]));
  return getActiveZones()
    .map((zone) => {
      const slot = byId.get(zone.id);
      return slot ? { zone, slot } : null;
    })
    .filter(
      (row): row is { zone: ActiveZone; slot: SponsorshipSlot } =>
        row !== null,
    );
}
