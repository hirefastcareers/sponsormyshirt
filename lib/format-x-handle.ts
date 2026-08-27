/**
 * Normalize optional X (Twitter) handles to @handle format.
 */
export function normalizeXHandle(
  raw: string | null | undefined,
): string | null {
  if (raw == null) return null;

  let handle = raw.trim();
  if (!handle) return null;

  const urlMatch = handle.match(/(?:https?:\/\/)?(?:www\.)?(?:twitter|x)\.com\/(@?[\w]{1,15})/i);
  if (urlMatch) {
    handle = urlMatch[1];
  }

  handle = handle.replace(/^@+/, "").replace(/[^\w]/g, "").slice(0, 15);
  if (!handle) return null;

  return `@${handle}`;
}
