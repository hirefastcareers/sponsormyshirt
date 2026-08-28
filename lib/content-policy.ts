/**
 * Acceptable Use / Content Policy copy for FAQ, checkout, and footer.
 * Required for payment-processor compliance.
 */

export const CONTENT_POLICY_FAQ = {
  q: "What content or websites are allowed on the kit and Supporter Wall?",
  a: "All submissions must be brand-appropriate and suitable for a public sporting event. We strictly prohibit any adult, explicit, or sexually suggestive content, as well as links to illegal websites, pirated material, or gambling platforms. Any submission violating these guidelines will be rejected and refunded.",
} as const;

export const CONTENT_POLICY_AGREEMENT =
  "By sponsoring, you agree that your logo and link contain no adult, explicit, or illegal content.";

export const CONTENT_POLICY_FOOTER_LABEL =
  "Content Policy: No adult or illegal content permitted.";

export const CONTENT_POLICY_MODAL_TITLE = "Acceptable Use Policy";

export const CONTENT_POLICY_MODAL_BODY = [
  CONTENT_POLICY_FAQ.a,
  "To keep everything compliant with race regulations and family-friendly event guidelines, we cannot accept sponsorships from adult content, gambling, illegal substances, or hate speech brands. If a purchase is made that violates these terms, the order will be canceled and fully refunded immediately.",
] as const;
