import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { signedDownloadPath, validDownloadSignature } from "../lib/resources";
import { MIN_FILL_MS } from "../lib/spam";

/**
 * The resource library (C35, owner requests 2026-10-07 and 2026-10-08), against its fixture copy
 * (e2e/fixtures/resource-library; the build and server read it through RESOURCE_LIBRARY_ROOT). The "Recovery" topic lists
 * a subject linked to an email-first PDF, one linked to an open PDF, one still to come, one linked to a draft, then two
 * published resources no subject names (a page on this site and another website); "Planned topic" has nothing yet.
 */
const WCAG = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];
// The form route allows five submissions per address per ten minutes (lib/spam.ts); these requests come from their own
// test address (TEST-NET-3), so the rest of the suite's form tests keep theirs. Vercel sets this header itself.
test.use({ extraHTTPHeaders: { "x-forwarded-for": "203.0.113.35" } });

test("each topic lists its subjects: ready ones are clickable, the rest say coming soon", async ({ page }) => {
  await page.goto("/resources");
  const topic = page.getByRole("region", { name: "Recovery" });
  const rows = topic.getByRole("listitem");
  await expect(rows).toHaveCount(6);
  // Subjects in the topic's order, then the topic's other published resources, newest first.
  await expect(rows.nth(0).getByRole("button", { name: "Your recovery week: PDF · 1 KB, we’ll email you the link" })).toHaveAttribute("aria-expanded", "false");
  await expect(rows.nth(1).getByRole("link", { name: "Sleep basics: PDF · 1 KB" })).toHaveAttribute("href", "/resources/download/sleep-basics");
  await expect(rows.nth(2)).toHaveText(/Stretching after training\s*Coming soon/);
  await expect(rows.nth(3)).toHaveText(/An unfinished draft\s*Coming soon/); // its resource is still a draft
  await expect(rows.nth(3).getByRole("link")).toHaveCount(0);
  await expect(rows.nth(4).getByRole("link", { name: "The TAB Method page: Page on our website" })).toHaveAttribute("href", "/resources/go/site-page");
  await expect(rows.nth(5).getByRole("link", { name: "An outside guide: Link · example.org, another website" })).toHaveAttribute("href", "/resources/go/outside-guide");
  await expect(page.getByRole("region", { name: "Planned topic" })).toHaveText(/A planned subject\s*Coming soon/);
  const { violations } = await new AxeBuilder({ page }).withTags(WCAG).analyze();
  expect(violations.map((v) => v.id)).toEqual([]);
});

test("an open document downloads; a link goes to the other site; drafts and unknown entries don't exist", async ({ request }) => {
  const pdf = await request.get("/resources/download/sleep-basics");
  expect(pdf.status()).toBe(200);
  expect(pdf.headers()["content-type"]).toBe("application/pdf");
  expect((await pdf.body()).subarray(0, 5).toString()).toBe("%PDF-");
  const go = await request.get("/resources/go/outside-guide", { maxRedirects: 0 });
  expect(go.status()).toBe(307);
  expect(go.headers()["location"]).toBe("https://example.org/guide");
  const onSite = await request.get("/resources/go/site-page", { maxRedirects: 0 });
  expect(onSite.status()).toBe(307);
  expect(new URL(onSite.headers()["location"]).pathname).toBe("/tab-method");
  for (const p of ["/resources/go/unfinished", "/resources/go/sleep-basics", "/resources/download/outside-guide", "/resources/download/nothing-here"]) {
    expect((await request.get(p, { maxRedirects: 0 })).status(), p).toBe(404);
  }
});

test("a document that asks for an email address needs a valid, unexpired signed link", async ({ request }) => {
  const bare = await request.get("/resources/download/recovery-week", { maxRedirects: 0 });
  expect(bare.status()).toBe(303);
  expect(bare.headers()["location"]).toContain("/resources?link=expired&r=recovery-week#recovery-week");
  const good = signedDownloadPath("recovery-week")!;
  const ok = await request.get(good);
  expect(ok.status()).toBe(200);
  expect(ok.headers()["cache-control"]).toBe("private, no-store");
  expect(ok.headers()["x-robots-tag"]).toContain("noindex");
  // A link for one guide doesn't open another, can't be altered, and stops working when it expires.
  const g = new URL(good, "http://x");
  expect(validDownloadSignature("another-guide", g.searchParams.get("e"), g.searchParams.get("s"))).toBe(false);
  const forged = good.replace(/s=[^&]+$/, "s=AAAA");
  expect((await request.get(forged, { maxRedirects: 0 })).status()).toBe(303);
  const old = signedDownloadPath("recovery-week", Date.now() - 15 * 86_400_000)!;
  const u = new URL(old, "http://x");
  expect(validDownloadSignature("recovery-week", u.searchParams.get("e"), u.searchParams.get("s"))).toBe(false);
  expect((await request.get(old, { maxRedirects: 0 })).status()).toBe(303);
});

test("asking for a guide: name and email only, the spam layers apply, and it says to check your inbox", async ({ page, request }) => {
  await page.goto("/resources");
  const card = page.locator("#recovery-week");
  await card.getByRole("button", { name: /^Your recovery week/ }).click();
  await expect(card.getByRole("button", { name: /^Your recovery week/ })).toHaveAttribute("aria-expanded", "true");
  await expect(card.getByLabel("Your name")).toBeFocused();
  await card.getByRole("button", { name: "Send me the link" }).click();
  await expect(card.getByRole("alert")).toBeVisible();
  const { violations } = await new AxeBuilder({ page }).include("#recovery-week").withTags(WCAG).analyze();
  expect(violations.map((v) => v.id)).toEqual([]);
  await card.getByLabel("Your name").fill("Avery Example");
  await card.getByLabel("Email", { exact: true }).fill("avery@example.com");
  await card.getByLabel(/Email me the link/).check();
  await page.waitForTimeout(MIN_FILL_MS + 100); // faster than a person can fill it is dropped as a bot (lib/spam.ts)
  await card.getByRole("button", { name: "Send me the link" }).click();
  await expect(card.getByRole("status")).toHaveText("Check your inbox: we’ve emailed you the link.");

  // Only a document that asks for an email address can be requested, and a message can't ride along.
  const origin = { headers: { origin: new URL(page.url()).origin } };
  const base = { kind: "resource", name: "Avery Example", email: "avery2@example.com", consentContact: true, elapsedMs: 5_000 };
  expect((await request.post("/api/inquiry", { ...origin, data: { ...base, resource: "sleep-basics" } })).status()).toBe(404);
  expect((await request.post("/api/inquiry", { ...origin, data: { ...base, resource: "unfinished" } })).status()).toBe(404);
  expect((await request.post("/api/inquiry", { ...origin, data: { ...base } })).status()).toBe(422);
});

test("an expired link brings people back to the guide with a note", async ({ page }) => {
  await page.goto("/resources/download/recovery-week");
  await expect(page).toHaveURL(/\/resources\?link=expired&r=recovery-week#recovery-week$/);
  await expect(page.getByRole("status").filter({ hasText: "That download link has expired." })).toBeVisible();
  await expect(page.locator("#recovery-week").getByLabel("Your name")).toBeVisible(); // its form is already open
});
