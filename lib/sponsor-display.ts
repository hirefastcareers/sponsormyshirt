/**
 * Client-safe helpers for displaying sold/pending sponsor branding.
 */

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
