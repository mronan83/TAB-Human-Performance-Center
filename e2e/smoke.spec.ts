import { expect, test, type Page } from "@playwright/test";
import { accountLink, bookingHref } from "../lib/links";

/** S19 §19.15 critical smoke tests that can run without live third-party services (NFR-007). */

const inquiryOk = async (page: Page) => {
  const sent: Record<string, unknown>[] = [];
  await page.route("**/api/inquiry", async (route) => {
    sent.push(route.request().postDataJSON());
    await route.fulfill({ json: { ok: true, copy: true } });
  });
  return sent;
};

test("homepage → service page → booking", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("h1")).toBeVisible();
  await page.getByRole("link", { name: "Explore Massage & Bodywork" }).click();
  await expect(page).toHaveURL(/\/services\/massage-bodywork$/);
  await expect(page.locator("main h1")).toBeVisible();

  // Booking goes to Timely when configured (D-003), otherwise to /book.
  const book = bookingHref();
  const headerBook = page.locator("header").getByRole("link", { name: "Book", exact: true }).first();
  await expect(headerBook).toHaveAttribute("href", book.href);
  if (!book.external) {
    await headerBook.click();
    await expect(page).toHaveURL(/\/book$/);
    await expect(page.locator("main h1")).toBeVisible();
  }
});

test("account link goes where the configuration says (WEB-020)", async ({ page }) => {
  await page.goto("/");
  const account = accountLink();
  await expect(page.locator("header").getByRole("link", { name: account.label }).first()).toHaveAttribute("href", account.href);
});

test("Start Where You Are: submits choices only (D-059)", async ({ page }) => {
  const sent = await inquiryOk(page);
  await page.goto("/start");
  await page.fill("#name", "Test Person");
  await page.fill("#email", "test@example.com");
  await page.check('input[name="help"][value="stronger"]');
  await page.check('input[name="service"][value="not-sure"]');
  await page.check('input[name="consentContact"]');
  await page.waitForTimeout(2_600); // the minimum fill time (lib/spam.ts)
  await page.getByRole("button", { name: "Send and find my starting point" }).click();
  await expect(page.getByRole("heading", { name: /Thank you/ })).toBeFocused();

  expect(sent).toHaveLength(1);
  const typed = Object.entries(sent[0]).filter(([k, v]) => typeof v === "string" && v && !["kind", "name", "email", "phone", "website", "turnstileToken"].includes(k));
  // Every other string must be one of our option values, never free text.
  for (const [k, v] of typed) expect(String(v), `field ${k}`).toMatch(/^[a-z-]+$/);
  expect(sent[0]).not.toHaveProperty("message");
});

test("Start Where You Are: an empty submit explains and focuses the first problem", async ({ page }) => {
  await page.goto("/start");
  await page.getByRole("button", { name: "Send and find my starting point" }).click();
  await expect(page.locator("#form-error")).toBeVisible();
  await expect(page.locator("#name")).toBeFocused();
});

test("contact form sends a message", async ({ page }) => {
  const sent = await inquiryOk(page);
  await page.goto("/contact");
  await page.fill("#name", "Test Person");
  await page.fill("#email", "test@example.com");
  await page.check('input[name="topic"][value="booking"]');
  await page.fill("#message", "Do you have Saturday times?");
  await page.check('input[name="consentContact"]');
  await page.waitForTimeout(2_600);
  await page.getByRole("button", { name: "Send message" }).click();
  await expect(page.getByRole("heading", { name: /Thank you/ })).toBeFocused();
  expect(sent[0]).toMatchObject({ kind: "contact", topic: "booking", message: "Do you have Saturday times?" });
});

test("inquiry API refuses other sites and bad input (SEC-013)", async ({ request, baseURL }) => {
  expect((await request.post("/api/inquiry", { data: { kind: "contact" } })).status()).toBe(403);
  const invalid = await request.post("/api/inquiry", { data: { kind: "contact" }, headers: { origin: new URL(baseURL!).origin } });
  expect(invalid.status()).toBe(422);
});

test("unknown URLs get the branded 404 with header and footer (NFR-002)", async ({ page }) => {
  const res = await page.goto("/no-such-page-for-tests");
  expect(res?.status()).toBe(404);
  await expect(page.locator("main h1")).toHaveText("This page has moved or no longer exists.");
  await expect(page.locator("header")).toBeVisible();
  await expect(page.locator("footer")).toBeVisible();
});

test("header menus: Escape returns focus, focus-out closes (WEB-001, NFR-001)", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/about");
  const trigger = page.locator('nav[aria-label="Primary"] button', { hasText: "Services" });
  await trigger.focus();
  await page.keyboard.press("Enter");
  await expect(page.locator("#menu-Services")).toBeVisible();
  await page.keyboard.press("Tab");
  await page.keyboard.press("Escape");
  await expect(page.locator("#menu-Services")).toBeHidden();
  await expect(trigger).toBeFocused();
  await page.keyboard.press("Enter");
  for (let i = 0; i < 6; i++) await page.keyboard.press("Tab");
  await expect(page.locator("#menu-Services")).toBeHidden();
});
