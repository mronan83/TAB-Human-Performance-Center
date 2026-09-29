import { expect, test, type Page } from "@playwright/test";
import { accountLink, bookingHref, clientLoginHref } from "../lib/links";

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
  // Production shows "Client Login" until My TAB is live: it must open Timely, never the contact form.
  expect(clientLoginHref().href).not.toBe("/contact");
  if (bookingHref().external) expect(clientLoginHref().external).toBe(true);
});

test("demo portal: sign in as client or practitioner, sign out (owner demo request 2026-09-28)", async ({ page }) => {
  // Local builds are not production deployments, so the portal runs in demo mode here.
  await page.goto("/");
  await page.locator("footer").getByRole("link", { name: "Practitioner login" }).click();
  await expect(page).toHaveURL(/\/my-tab\/login$/);
  await page.getByRole("button", { name: "Practitioner: TAB Practice" }).click();
  await expect(page).toHaveURL(/\/practice$/);

  await page.goto("/my-tab/login");
  await page.getByRole("button", { name: "Client: My TAB" }).click();
  await expect(page).toHaveURL(/\/my-tab$/);
  await expect(page.locator("main h1")).toContainText("Dana");

  await page.getByRole("button", { name: "Sign out" }).first().click();
  await expect(page).toHaveURL(/\/$/);
  await page.goto("/my-tab");
  await expect(page).toHaveURL(/\/my-tab\/login$/);
});

test("progress review: the practitioner confirms a stage change and the client sees it (design §5.2)", async ({ page, context, baseURL }) => {
  await context.addCookies([{ name: "tab_demo_role", value: "owner", url: baseURL! }]);
  await page.goto("/practice/clients/demo-client-dana");
  await page.getByRole("link", { name: "Progress review" }).click();
  await expect(page.locator("main h1")).toHaveText("Progress review");

  await page.getByLabel("What has changed? What feels better or easier?").fill("Three sessions most weeks; stairs feel easier.");
  await page.getByLabel("Adjust approach").check();
  await page.getByLabel("TAB Method stage", { exact: true }).selectOption("align");
  // Changing the stage needs the practitioner to confirm the conversation with the client.
  await page.getByRole("button", { name: "Save review and update stage" }).click();
  await expect(page).toHaveURL(/\/review$/);
  await page.getByLabel(/I’ve discussed this stage change/).check();
  await page.getByLabel("Summary for Dana").fill("You’re ready to bring strength, sleep and recovery together.");
  await page.getByRole("button", { name: "Save review and update stage" }).click();

  await expect(page).toHaveURL(/\/practice\/clients\/demo-client-dana\?review=saved/);
  await expect(page.getByRole("status")).toContainText("Stage updated to Align");
  await expect(page.getByText("You’re ready to bring strength, sleep and recovery together.")).toBeVisible();

  await context.addCookies([{ name: "tab_demo_role", value: "client", url: baseURL! }]);
  await page.goto("/my-tab");
  await expect(page.getByRole("status").filter({ hasText: "Your stage was updated to Align" })).toBeVisible();
  await expect(page.locator('[aria-current="step"]')).toContainText("Align");
});

test("plans: a practitioner creates and shares a service plan; the client sees only what's shared (design §2)", async ({ page, context, baseURL }) => {
  await context.addCookies([{ name: "tab_demo_role", value: "owner", url: baseURL! }]);
  await page.goto("/practice/clients/demo-client-dana");
  await page.getByRole("link", { name: "Life Coaching", exact: true }).click();
  await expect(page.locator("main h1")).toHaveText("New Life Coaching plan");
  await page.getByLabel("Title").fill("Make room for what matters");
  await page.getByLabel("Values").fill("Family time and steady energy.");
  await page.getByLabel("Status").selectOption("active");
  await page.getByLabel(/Share this plan with the client/).check();
  await page.getByRole("button", { name: "Create plan" }).click();
  await expect(page.getByRole("status")).toContainText("Plan saved. It’s shared with the client");

  await page.getByLabel("New log entry").fill("Named two evenings a week as protected family time.");
  await page.getByLabel("Share with client").check();
  await page.getByRole("button", { name: "Add entry" }).click();
  await expect(page.getByText("Entry added.")).toBeVisible();

  await context.addCookies([{ name: "tab_demo_role", value: "client", url: baseURL! }]);
  await page.goto("/my-tab/plan");
  await expect(page.getByRole("heading", { name: "Make room for what matters" })).toBeVisible();
  await expect(page.getByText("Family time and steady energy.")).toBeVisible();
  await expect(page.getByText("Named two evenings a week as protected family time.")).toBeVisible();
  // Shared massage sections and entries show; practitioner-only sections, internal entries and draft plans don't.
  await expect(page.getByText("Upper back, shoulders, and hips.")).toBeVisible();
  await expect(page.getByText("Prefers side-lying for hip work.")).toHaveCount(0);
  await expect(page.getByText("Guarding around the right shoulder")).toHaveCount(0);
  await expect(page.getByText("Strength block 2")).toHaveCount(0);
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
