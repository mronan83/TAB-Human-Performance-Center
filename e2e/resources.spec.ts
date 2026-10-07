import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { signedDownloadPath, validDownloadSignature } from "../lib/resources";
import { MIN_FILL_MS } from "../lib/spam";

/**
 * The resource library (C35, owner request 2026-10-07), against its fixture copy (e2e/fixtures/resource-library; the
 * build and server read it through RESOURCE_LIBRARY_ROOT): a link, an open PDF, a PDF that asks for an email address
 * first, a draft, and a topic with nothing published yet.
 */
const WCAG = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];
// The form route allows five submissions per address per ten minutes (lib/spam.ts); these requests come from their own
// test address (TEST-NET-3), so the rest of the suite's form tests keep theirs. Vercel sets this header itself.
test.use({ extraHTTPHeaders: { "x-forwarded-for": "203.0.113.35" } });

test("the Resources page lists published entries by topic, hides drafts and shows planned topics", async ({ page }) => {
  await page.goto("/resources");
  const topic = page.getByRole("region", { name: "Recovery" });
  await expect(topic.getByRole("heading", { level: 3 })).toHaveText(["Your recovery week", "Sleep basics", "An outside guide"]); // newest first
  await expect(page.getByText("An unfinished draft")).toHaveCount(0);
  await expect(topic.getByText("Guide · PDF · 1 KB")).toHaveCount(2);
  await expect(topic.getByRole("link", { name: /Visit example\.org/ })).toHaveAttribute("href", "/resources/go/outside-guide");
  await expect(topic.getByRole("link", { name: /Download the PDF: Sleep basics/ })).toHaveAttribute("href", "/resources/download/sleep-basics");
  await expect(page.getByRole("heading", { name: "Coming soon" })).toBeVisible();
  await expect(page.getByText("A planned subject")).toBeVisible();
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
  await card.getByRole("button", { name: /Email me the PDF/ }).click();
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
});
