import { test, expect, type Page, type ConsoleMessage } from "@playwright/test";
import path from "node:path";
import fs from "node:fs";

const SCREENSHOT_DIR = path.join(__dirname, "screenshots");

const VIEWPORTS = [
  { name: "desktop", width: 1920, height: 1080 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "mobile", width: 375, height: 667 },
] as const;

const NAV_LINKS = [
  { label: "Positions", hash: "#positions" },
  { label: "How It Works", hash: "#how-it-works" },
  { label: "The Race", hash: "#the-race" },
  { label: "FAQ", hash: "#faq" },
] as const;

function attachConsoleCollector(page: Page) {
  const errors: string[] = [];
  const onConsole = (msg: ConsoleMessage) => {
    if (msg.type() === "error") {
      errors.push(msg.text());
    }
  };
  const onPageError = (err: Error) => {
    errors.push(err.message);
  };
  page.on("console", onConsole);
  page.on("pageerror", onPageError);
  return {
    errors,
    detach() {
      page.off("console", onConsole);
      page.off("pageerror", onPageError);
    },
  };
}

test.describe("GNR site audit", () => {
  test.beforeAll(() => {
    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
  });

  test("visual & layout audit across viewports", async ({ page }) => {
    for (const vp of VIEWPORTS) {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto("/", { waitUntil: "networkidle" });

      await expect(page.getByRole("heading", { name: /Your brand/i })).toBeVisible();
      await expect(page.locator("#kit-viewer")).toBeVisible();

      await page.screenshot({
        path: path.join(SCREENSHOT_DIR, `full-page-${vp.name}.png`),
        fullPage: true,
      });
    }
  });

  test("interactive kit viewer opens checkout modal", async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto("/", { waitUntil: "networkidle" });

    const kitViewer = page.locator("#kit-viewer");
    await expect(kitViewer).toBeVisible();

    // Prefer a numbered placement node over the title-takeover package
    const availableNode = kitViewer
      .locator('button:not([disabled])[aria-label]')
      .filter({ hasNotText: /Title Sponsor/i })
      .first();

    await expect(availableNode).toBeVisible({ timeout: 15_000 });
    const ariaLabel = (await availableNode.getAttribute("aria-label")) ?? "";
    // aria-label is like "1 Chest Center" — drop the leading number for the title
    const expectedTitle = ariaLabel.replace(/^\d+\s+/, "").trim();
    expect(expectedTitle.length).toBeGreaterThan(0);

    await availableNode.click();

    const modal = page.getByRole("dialog");
    await expect(modal).toBeVisible();
    await expect(modal.getByText("Claim placement")).toBeVisible();
    await expect(modal.getByRole("heading", { level: 2 })).toHaveText(
      expectedTitle,
    );

    // GBP price line (e.g. £1200 · one-time · GBP)
    await expect(
      modal.getByText(/£[\d,]+\s*·\s*one-time\s*·\s*GBP/),
    ).toBeVisible();

    await expect(modal.getByText(/Company \/ Sponsor Name/i)).toBeVisible();
    await expect(modal.getByPlaceholder("Acme Athletics")).toBeVisible();

    await expect(modal.getByText(/Destination URL/i)).toBeVisible();
    await expect(modal.getByPlaceholder("https://yourbrand.com")).toBeVisible();

    await expect(modal.getByText(/Logo \(PNG \/ SVG \/ WebP\)/i)).toBeVisible();
    await expect(modal.locator('input[type="file"]')).toBeVisible();

    await expect(modal.getByRole("button", { name: /Pay £.*via Dodo/i })).toBeVisible();
  });

  test("top navigation smooth-scroll anchors & Claim a Slot", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto("/", { waitUntil: "networkidle" });

    const collector = attachConsoleCollector(page);
    // <header> is nested under <main>, so it is not a banner landmark
    const nav = page.getByRole("navigation", { name: "Page sections" });

    for (const link of NAV_LINKS) {
      await nav.getByRole("link", { name: link.label, exact: true }).click();
      await expect(page.locator(link.hash)).toBeInViewport({ timeout: 10_000 });
      await expect
        .poll(() => page.evaluate(() => window.location.hash), { timeout: 5_000 })
        .toBe(link.hash);
    }

    await nav.getByRole("link", { name: "Claim a Slot", exact: true }).click();
    await expect(page.locator("#kit-viewer")).toBeInViewport({ timeout: 10_000 });
    await expect
      .poll(() => page.evaluate(() => window.location.hash), { timeout: 5_000 })
      .toBe("#kit-viewer");

    collector.detach();
    expect(
      collector.errors,
      `Unexpected console errors:\n${collector.errors.join("\n")}`,
    ).toEqual([]);
  });
});
