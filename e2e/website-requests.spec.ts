import AxeBuilder from "@axe-core/playwright";
import { expect, test, type BrowserContext, type Page } from "@playwright/test";
import { parseRequest } from "../lib/website-requests";
import { websiteRequestAlertEmail } from "../content/emails";

/**
 * Website change requests and the admin role (owner rulings 2026-10-07, proposed D-071), on the demo portal:
 * an admin is website-only, any staff member files and follows a request, only the owner changes its status.
 */
const as = (context: BrowserContext, baseURL: string, role: "owner" | "admin") => context.addCookies([{ name: "tab_demo_role", value: role, url: baseURL }]);
const WCAG = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];
const scan = async (page: Page, label: string) => {
  const { violations } = await new AxeBuilder({ page }).withTags(WCAG).analyze();
  const summary = violations.map((v) => `${label}: ${v.id} (${v.impact}) × ${v.nodes.length}: ${v.nodes[0]?.target.join(" ")}`);
  expect(summary, summary.join("\n")).toEqual([]);
};

test("an admin sees the website only: requests and stats, never clients or settings", async ({ page, context, baseURL }) => {
  await as(context, baseURL!, "admin");
  await page.goto("/practice");
  await expect(page).toHaveURL(/\/practice\/website$/);
  const nav = page.getByRole("navigation", { name: "Portal" }).first();
  await expect(nav.getByRole("link")).toHaveText(["Website changes", "Website stats", "Sign-in & security"]);
  await page.goto("/practice/clients/demo-client-dana");
  await expect(page).toHaveURL(/\/practice\/website$/);
  await page.goto("/practice/inquiries");
  await expect(page).toHaveURL(/\/practice\/website$/);
  await page.goto("/practice/settings");
  await expect(page.getByText("Only the owner can change TAB’s settings.")).toBeVisible();
  await expect(page.getByLabel("Name-change banner")).toHaveCount(0);
  await page.goto("/practice/stats");
  await expect(page.getByText("Page views per day")).toBeVisible();
});

test("a request is filed, discussed and moved to live; only the owner changes its status", async ({ page, context, baseURL }) => {
  await as(context, baseURL!, "admin");
  await page.goto("/practice/website/new");
  await scan(page, "/practice/website/new");
  await page.getByRole("button", { name: "Send request" }).click();
  await expect(page.locator("#title:invalid")).toHaveCount(1); // the browser asks for the required fields first
  await page.getByLabel("Massage & Bodywork").check();
  await page.getByLabel("What kind of change?").selectOption("Update existing text");
  await page.getByLabel("Short title").fill("Update the deep tissue wording");
  await page.getByLabel("The change").fill("In the techniques guide, deep tissue: say “firm, never forced”.");
  await page.getByRole("button", { name: "Send request" }).click();
  await expect(page.getByText(/Request #\d+ sent\./)).toBeVisible();
  const number = Number(new URL(page.url()).pathname.split("/").pop());
  await expect(page.locator("main h1")).toHaveText("Update the deep tissue wording");
  await expect(page.getByText("New", { exact: true }).first()).toBeVisible();
  await expect(page.getByLabel("Status")).toHaveCount(0); // admins don't change status
  await page.getByLabel("Add a note").fill("The owner prefers “firm but never forced”.");
  await page.getByRole("button", { name: "Add note" }).click();
  await expect(page.getByText("The owner prefers “firm but never forced”.")).toBeVisible();
  await scan(page, "/practice/website/[number]");

  await as(context, baseURL!, "owner");
  await page.goto(`/practice/website/${number}`);
  await page.getByLabel("Status").selectOption("live");
  await page.getByRole("button", { name: "Update status" }).click();
  await expect(page.getByRole("status").filter({ hasText: "Updated." })).toBeVisible();
  await page.goto("/practice/website");
  await scan(page, "/practice/website");
  await expect(page.getByRole("link", { name: new RegExp(`#${number} Update the deep tissue wording`) })).toBeVisible();
  await expect(page.getByRole("heading", { name: /Done or declined/ })).toBeVisible();
});

test("the owner invites and removes website admins in Settings", async ({ page, context, baseURL }) => {
  await as(context, baseURL!, "owner");
  await page.goto("/practice/settings");
  await expect(page.getByRole("heading", { name: "Website admins" })).toBeVisible();
  await page.getByLabel("Name", { exact: true }).fill("Jordan Lee");
  await page.getByLabel("Work email").fill("jordan@example.com");
  await page.getByRole("button", { name: "Invite admin" }).click();
  await expect(page.getByText(/Jordan Lee is listed as an admin/)).toBeVisible();
  await page.reload();
  await expect(page.getByText("jordan@example.com")).toBeVisible();
  page.once("dialog", (d) => d.accept());
  await page.getByRole("button", { name: "Remove Jordan Lee" }).click();
  await expect(page.getByText("jordan@example.com")).toHaveCount(0);
});

test("request rules: a complete form only, and the owner's alert names a number, never the request", () => {
  const fd = (o: Record<string, string | string[]>) => {
    const f = new FormData();
    for (const [k, v] of Object.entries(o)) for (const x of [v].flat()) f.append(k, x);
    return f;
  };
  const good = { lane: "content", pages: ["FAQ"], kind: "Remove something", title: "Remove the old FAQ", details: "The parking one", priority: "whenever" };
  expect(parseRequest(fd(good)).ok).toBe(true);
  expect(parseRequest(fd({ ...good, pages: [] }))).toEqual({ ok: false, error: "Choose at least one page." });
  expect(parseRequest(fd({ ...good, pages: ["Somewhere made up"] })).ok).toBe(false);
  expect(parseRequest(fd({ ...good, kind: "A new page" })).ok).toBe(false); // a design kind in the content lane
  expect(parseRequest(fd({ ...good, lane: "other" })).ok).toBe(false);
  expect(parseRequest(fd({ ...good, details: "x".repeat(4001) })).ok).toBe(false);
  expect(parseRequest(fd({ ...good, priority: "yesterday" })).ok).toBe(false);
  expect(websiteRequestAlertEmail.subject(12)).toBe("New website request #12");
  expect(websiteRequestAlertEmail.body("Alex", "Design change")).not.toMatch(/FAQ|parking/);
});
