/**
 * Client-safe helpers for displaying sold/pending sponsor branding.
 */
import type { SponsorshipSlot } from "@/types/sponsorship";

/** Resolve `sponsor_logo_url` (public URL or storage path) to a loadable URL. */
export function resolveSponsorLogoUrl(
  logo: string | null | undefined,
): string | null {
  if (!logo) return null;
  if (/^https?:\/\//i.test(logo)) return logo;
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base) return null;
  return `${base}/storage/v1/object/public/sponsor-logos/${logo}`;
}

export function normalizeSponsorUrl(
  url: string | null | undefined,
): string | null {
  const trimmed = url?.trim();
  if (!trimmed) return null;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

/** Prefer destination_url; fall back to sponsor_url for legacy rows. */
export function resolveDestinationUrl(
  slot: Pick<SponsorshipSlot, "destination_url" | "sponsor_url">,
): string | null {
  return normalizeSponsorUrl(slot.destination_url ?? slot.sponsor_url);
}

/** Dofollow when backlink add-on purchased; otherwise nofollow + sponsored. */
export function getSponsorLinkRel(
  hasBacklink: boolean | null | undefined,
): string {
  if (hasBacklink === true) {
    return "noopener noreferrer";
  }
  return "nofollow sponsored noopener noreferrer";
}

export function getSponsorLinkProps(
  slot: Pick<
    SponsorshipSlot,
    "destination_url" | "sponsor_url" | "has_backlink"
  >,
): { href: string | null; rel: string | null } {
  const href = resolveDestinationUrl(slot);
  if (!href) {
    return { href: null, rel: null };
  }

  return {
    href,
    rel: getSponsorLinkRel(slot.has_backlink),
  };
}
