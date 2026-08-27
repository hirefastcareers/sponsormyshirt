/**
 * Fallback fulfilment when the buyer lands on /success after Dodo redirect.
 * Ensures pending rows flip to sold even if the webhook is delayed or missed.
 */
import { isTitleTakeover, TITLE_TAKEOVER } from "@/lib/positions";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

function isSucceededStatus(statusParam: string | null): boolean {
  return statusParam?.trim().toLowerCase() === "succeeded";
}

async function markPendingSoldById(
  slotId: string,
): Promise<{ updated: boolean; slotIds: string[] }> {
  const admin = getSupabaseAdmin();

  if (isTitleTakeover(slotId)) {
    const { data, error } = await admin
      .from("sponsorship_slots")
      .update({ status: "sold" })
      .eq("status", "pending")
      .select("id");

    if (error) {
      console.error("[success] Title takeover confirm failed:", error.message);
      return { updated: false, slotIds: [] };
    }

    return {
      updated: (data?.length ?? 0) > 0,
      slotIds: (data ?? []).map((row) => row.id as string),
    };
  }

  const { data, error } = await admin
    .from("sponsorship_slots")
    .update({ status: "sold" })
    .eq("id", slotId)
    .eq("status", "pending")
    .select("id");

  if (error) {
    console.error(`[success] Confirm sold failed for id ${slotId}:`, error.message);
    return { updated: false, slotIds: [] };
  }

  return {
    updated: (data?.length ?? 0) > 0,
    slotIds: (data ?? []).map((row) => row.id as string),
  };
}

async function markPendingSoldByName(
  slotName: string,
): Promise<{ updated: boolean; slotIds: string[] }> {
  const trimmed = slotName.trim();
  if (!trimmed) return { updated: false, slotIds: [] };

  if (trimmed.toLowerCase() === TITLE_TAKEOVER.slot_name.toLowerCase()) {
    return markPendingSoldById(TITLE_TAKEOVER.id);
  }

  const admin = getSupabaseAdmin();
  const { data, error } = await admin
    .from("sponsorship_slots")
    .update({ status: "sold" })
    .eq("slot_name", trimmed)
    .eq("status", "pending")
    .select("id");

  if (error) {
    console.error(`[success] Confirm sold failed for name ${trimmed}:`, error.message);
    return { updated: false, slotIds: [] };
  }

  return {
    updated: (data?.length ?? 0) > 0,
    slotIds: (data ?? []).map((row) => row.id as string),
  };
}

/**
 * When Dodo redirects with ?status=succeeded&slot=..., mark matching pending rows sold.
 */
export async function confirmSlotSoldFromSuccessRedirect(
  statusParam: string | null,
  slotParam: string | null,
  resolvedSlotId: string | null,
): Promise<{ updated: boolean; slotIds: string[] }> {
  if (!isSucceededStatus(statusParam)) {
    return { updated: false, slotIds: [] };
  }

  if (!slotParam?.trim() && !resolvedSlotId) {
    return { updated: false, slotIds: [] };
  }

  if (resolvedSlotId) {
    const byId = await markPendingSoldById(resolvedSlotId);
    if (byId.updated) {
      console.log("[success] Confirmed sold by id:", resolvedSlotId);
      return byId;
    }
  }

  if (slotParam?.trim()) {
    const byName = await markPendingSoldByName(slotParam);
    if (byName.updated) {
      console.log("[success] Confirmed sold by slot_name:", slotParam.trim());
      return byName;
    }
  }

  console.log("[success] No pending row matched for confirm", {
    slotParam,
    resolvedSlotId,
  });
  return { updated: false, slotIds: [] };
}
