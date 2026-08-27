#!/usr/bin/env node
/**
 * Local webhook fulfilment tester.
 *
 * Requires `next dev` (or `next start` with ALLOW_TEST_WEBHOOK=true) running.
 *
 * Usage:
 *   npm run test:webhook
 *   npm run test:webhook -- chest_center
 *   npm run test:webhook -- title_takeover --name "Acme" --url https://acme.test
 *   npm run test:webhook -- left_sleeve --social --dofollow
 */

const DEFAULT_BASE =
  process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ||
  "http://localhost:3000";

function printHelp() {
  console.log(`
Simulate a successful Dodo payment.succeeded fulfilment locally.

Usage:
  npm run test:webhook -- <slot_id> [options]

Arguments:
  slot_id              e.g. chest_center, left_sleeve, title_takeover
                       (default: chest_center)

Options:
  --name <name>        Sponsor name (default: Test Sponsor)
  --url <url>          Sponsor URL (default: https://example.com)
  --logo <path>        Storage path in sponsor-logos bucket (optional)
  --social             Set has_social_post = true
  --dofollow           Set has_dofollow_link = true
  --base <url>         App base URL (default: ${DEFAULT_BASE})
  -h, --help           Show this help

Examples:
  npm run test:webhook -- chest_center
  npm run test:webhook -- title_takeover --name "Acme Corp"
  curl -X POST ${DEFAULT_BASE}/api/test-webhook \\
    -H "Content-Type: application/json" \\
    -d "{\\"slot_id\\":\\"chest_center\\",\\"sponsor_name\\":\\"Test Sponsor\\",\\"sponsor_url\\":\\"https://example.com\\"}"
`);
}

function parseArgs(argv) {
  const args = {
    slotId: "chest_center",
    sponsorName: "Test Sponsor",
    sponsorUrl: "https://example.com",
    logoPath: undefined,
    hasSocialPost: false,
    hasDofollowLink: false,
    base: DEFAULT_BASE,
    help: false,
  };

  const positional = [];
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "-h" || a === "--help") {
      args.help = true;
    } else if (a === "--name") {
      args.sponsorName = argv[++i];
    } else if (a === "--url") {
      args.sponsorUrl = argv[++i];
    } else if (a === "--logo") {
      args.logoPath = argv[++i];
    } else if (a === "--social") {
      args.hasSocialPost = true;
    } else if (a === "--dofollow") {
      args.hasDofollowLink = true;
    } else if (a === "--base") {
      args.base = argv[++i]?.replace(/\/$/, "") || args.base;
    } else if (a.startsWith("-")) {
      console.error(`Unknown option: ${a}`);
      args.help = true;
    } else {
      positional.push(a);
    }
  }

  if (positional[0]) args.slotId = positional[0];
  return args;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    printHelp();
    process.exit(0);
  }

  const body = {
    slot_id: args.slotId,
    sponsor_name: args.sponsorName,
    sponsor_url: args.sponsorUrl,
    has_social_post: args.hasSocialPost,
    has_dofollow_link: args.hasDofollowLink,
  };
  if (args.logoPath) body.logo_path = args.logoPath;

  const url = `${args.base}/api/test-webhook`;
  console.log(`POST ${url}`);
  console.log(JSON.stringify(body, null, 2));

  let res;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch (err) {
    console.error(
      `\nFailed to reach ${url}.\nIs next dev running? (${err.message})`,
    );
    process.exit(1);
  }

  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    json = { raw: text };
  }

  if (!res.ok) {
    console.error(`\nHTTP ${res.status}`);
    console.error(json);
    process.exit(1);
  }

  console.log(`\nHTTP ${res.status}`);
  console.log(json);
  console.log("\nDone — check sponsorship_slots in Supabase (status should be sold).");
}

main();
