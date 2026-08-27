/**
 * POST /api/test-webhook
 *
 * Dev-only helper that simulates a successful Dodo `payment.succeeded`
 * fulfilment without signature verification or ngrok.
 *
 * Body (JSON) — same metadata shape as checkout → webhook:
 *   {
 *     "slot_id": "chest_center",
 *     "sponsor_name": "Acme Corp",
 *     "sponsor_url": "https://example.com",
 *     "logo_path": optional storage path,
 *     "has_social_post": false,
 *     "has_dofollow_link": false
 *   }
 *
 * Or run: npm run test:webhook -- chest_center
 */
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import {
  fulfilSponsorship,
  type PaymentMetadata,
} from "@/lib/fulfil-sponsorship";
import { normalizeXHandle } from "@/lib/format-x-handle";

function isLocalTestAllowed(): boolean {
  if (process.env.NODE_ENV === "development") return true;
  // Explicit opt-in for staging / local production builds
  return process.env.ALLOW_TEST_WEBHOOK === "true";
}

export async function POST(request: Request) {
  if (!isLocalTestAllowed()) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  let body: PaymentMetadata;
  try {
    body = (await request.json()) as PaymentMetadata;
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 },
    );
  }

  if (!body.slot_id) {
    return NextResponse.json(
      {
        error: "slot_id is required",
        example: {
          slot_id: "chest_center",
          sponsor_name: "Test Sponsor",
          sponsor_url: "https://example.com",
          has_social_post: false,
          has_dofollow_link: false,
        },
      },
      { status: 400 },
    );
  }

  // Defaults so a minimal { slot_id } body still writes useful test rows
  const xHandle = normalizeXHandle(body.x_handle);
  const metadata: PaymentMetadata = {
    slot_id: body.slot_id,
    sponsor_name: body.sponsor_name ?? "Test Sponsor",
    sponsor_url: body.sponsor_url ?? "https://example.com",
    customer_url: body.customer_url ?? body.sponsor_url ?? "https://example.com",
    logo_path: body.logo_path,
    has_social_post: body.has_social_post ?? false,
    has_dofollow_link: body.has_dofollow_link ?? false,
    has_backlink: body.has_backlink ?? body.has_dofollow_link ?? false,
    ...(xHandle ? { x_handle: xHandle } : {}),
  };

  try {
    const result = await fulfilSponsorship(metadata);

    if (!result.ok) {
      return NextResponse.json(
        { error: "Fulfilment skipped", reason: result.reason },
        { status: 400 },
      );
    }

    revalidatePath("/");

    return NextResponse.json({
      ...result,
      simulated_event: "payment.succeeded",
      metadata,
      message:
        result.mode === "title_takeover"
          ? "All kit slots marked sold (title takeover)."
          : `Slot(s) ${result.slot_ids.join(", ")} marked sold.`,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[test-webhook]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
