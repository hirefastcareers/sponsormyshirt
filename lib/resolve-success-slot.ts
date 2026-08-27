/**
 * Resolve which kit placement was purchased from success-page query params.
 */
import { assertDodoPaymentsConfigured, getDodoClient } from "@/lib/dodo";
import {
  isTitleTakeover,
  POSITION_META,
  TITLE_TAKEOVER,
  type PositionId,
} from "@/lib/positions";
import { getSponsorshipSlots } from "@/lib/slots";

function metadataSlotId(metadata: Record<string, unknown>): string | null {
  const raw = metadata.slot_id ?? metadata.slotId;
  return typeof raw === "string" && raw.trim() ? raw.trim() : null;
}

/** Human-readable placement label from canonical ids or DB row. */
export function slotDisplayName(
  slotId: string,
  dbName?: string | null,
): string {
  if (dbName?.trim()) return dbName.trim();
  if (isTitleTakeover(slotId)) return TITLE_TAKEOVER.slot_name;
  if (slotId in POSITION_META) {
    return POSITION_META[slotId as PositionId].slot_name;
  }
  return slotId
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

/** Look up slot_id from a Dodo checkout session → payment metadata. */
export async function resolveSlotIdFromSession(
  sessionId: string,
): Promise<string | null> {
  try {
    assertDodoPaymentsConfigured();
  } catch {
    return null;
  }

  try {
    const dodo = getDodoClient();
    const session = await dodo.checkoutSessions.retrieve(sessionId);
    if (!session.payment_id) return null;

    const payment = await dodo.payments.retrieve(session.payment_id);
    return metadataSlotId(payment.metadata as Record<string, unknown>);
  } catch (err) {
    console.error("[success] Failed to resolve session_id:", err);
    return null;
  }
}

function looksLikeSlotId(param: string): boolean {
  return param.includes("_") && !param.includes(" ");
}

function findSlotIdByDisplayName(
  name: string,
  slots: Awaited<ReturnType<typeof getSponsorshipSlots>>,
): string | null {
  const normalized = name.trim().toLowerCase();

  const dbMatch = slots.find((s) => s.slot_name.toLowerCase() === normalized);
  if (dbMatch) return dbMatch.id;

  for (const [id, meta] of Object.entries(POSITION_META)) {
    if (meta.slot_name.toLowerCase() === normalized) return id;
  }

  if (TITLE_TAKEOVER.slot_name.toLowerCase() === normalized) {
    return TITLE_TAKEOVER.id;
  }

  return null;
}

export async function resolvePurchasedSlot(
  slotParam: string | null,
  sessionIdParam: string | null,
  categoryParam: string | null = null,
): Promise<{ slotId: string | null; slotName: string | null; category: string | null }> {
  const slots = await getSponsorshipSlots();
  const trimmedSlot = slotParam?.trim() ?? null;
  const trimmedSession = sessionIdParam?.trim() ?? null;

  let slotId: string | null = trimmedSession
    ? await resolveSlotIdFromSession(trimmedSession)
    : null;
  let slotName: string | null = null;

  if (!slotId && trimmedSlot) {
    if (looksLikeSlotId(trimmedSlot)) {
      slotId = trimmedSlot;
    } else {
      slotId = findSlotIdByDisplayName(trimmedSlot, slots);
      slotName = trimmedSlot;
    }
  }

  if (slotId) {
    const row = slots.find((s) => s.id === slotId);
    slotName = slotName ?? slotDisplayName(slotId, row?.slot_name);
  }

  const category = categoryParam?.trim().toLowerCase() || null;

  return { slotId, slotName, category };
}
