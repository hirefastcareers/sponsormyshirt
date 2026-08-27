/**
 * Dodo Payments server SDK singleton.
 * Docs: https://docs.dodopayments.com/developer-resources/checkout-session
 */
import DodoPayments from "dodopayments";

export type DodoEnvironment = "test_mode" | "live_mode";

let dodoClient: DodoPayments | null = null;

/** Normalize env to SDK-accepted values (`live_mode` | `test_mode`). */
export function resolveDodoEnvironment(): DodoEnvironment {
  const raw = process.env.DODO_PAYMENTS_ENVIRONMENT?.trim();
  if (raw === "live_mode" || raw === "live") return "live_mode";
  return "test_mode";
}

/** Returns trimmed API key or throws before the SDK can fail opaquely. */
export function requireDodoApiKey(): string {
  const apiKey = process.env.DODO_PAYMENTS_API_KEY?.trim();
  if (!apiKey) {
    throw new Error(
      "DODO_PAYMENTS_API_KEY is not configured. Add it to your server environment.",
    );
  }
  return apiKey;
}

/** Fail fast when Dodo is not configured (use in API routes before side effects). */
export function assertDodoPaymentsConfigured(): void {
  requireDodoApiKey();
}

export function getDodoClient(): DodoPayments {
  if (dodoClient) return dodoClient;

  const bearerToken = requireDodoApiKey();
  const environment = resolveDodoEnvironment();

  dodoClient = new DodoPayments({
    bearerToken,
    environment,
  });

  return dodoClient;
}
