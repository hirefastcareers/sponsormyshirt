#!/usr/bin/env node
/**
 * Temporary: inspect sponsorship_slots columns and reset slot 03 (Upper Back)
 * to available with cleared sponsor fields.
 *
 * Usage:
 *   node --env-file=.env.local scripts/reset-slot.js
 *
 * Requires in .env.local:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */

const { createClient } = require("@supabase/supabase-js");

const SLOT_ID = "upper_back"; // zone num "03" — Upper Back

async function main() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    console.error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY",
    );
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  console.log("Inspecting sponsorship_slots columns…");

  const { data: sample, error: sampleError } = await supabase
    .from("sponsorship_slots")
    .select("*")
    .limit(1)
    .maybeSingle();

  if (sampleError) {
    console.error("Failed to inspect columns:", sampleError.message);
    process.exit(1);
  }

  if (!sample) {
    console.error("sponsorship_slots is empty — cannot inspect columns.");
    process.exit(1);
  }

  const columns = Object.keys(sample).sort();
  console.log(`Columns (${columns.length}):`);
  for (const col of columns) {
    console.log(`  - ${col}`);
  }

  console.log(`\nFetching slot ${SLOT_ID} (03 Upper Back) before reset…`);
  const { data: before, error: beforeError } = await supabase
    .from("sponsorship_slots")
    .select("*")
    .eq("id", SLOT_ID)
    .maybeSingle();

  if (beforeError) {
    console.error("Failed to load slot:", beforeError.message);
    process.exit(1);
  }
  if (!before) {
    console.error(`Slot ${SLOT_ID} not found.`);
    process.exit(1);
  }

  console.log("Before:", {
    id: before.id,
    slot_name: before.slot_name,
    status: before.status,
    sponsor_name: before.sponsor_name,
    sponsor_url: before.sponsor_url,
    sponsor_logo_url: before.sponsor_logo_url,
  });

  console.log("\nResetting slot…");
  const { data: after, error: updateError } = await supabase
    .from("sponsorship_slots")
    .update({
      status: "available",
      sponsor_name: null,
      sponsor_url: null,
      sponsor_logo_url: null,
    })
    .eq("id", SLOT_ID)
    .select("*")
    .maybeSingle();

  if (updateError) {
    console.error("Failed to reset slot:", updateError.message);
    process.exit(1);
  }

  console.log("After:", {
    id: after.id,
    slot_name: after.slot_name,
    status: after.status,
    sponsor_name: after.sponsor_name,
    sponsor_url: after.sponsor_url,
    sponsor_logo_url: after.sponsor_logo_url,
  });
  console.log("\nDone.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
