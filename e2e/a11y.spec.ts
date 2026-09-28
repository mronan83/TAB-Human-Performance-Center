import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { extraPages, sitemapPaths } from "./helpers";

/**
 * Automated WCAG 2.2 AA scan (D-037, NFR-001) of every public page, the 404 and both forms' error states.
 * Automation catches roughly a third of issues; keyboard and screen-reader checks stay manual.
 */
const WCAG = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

const scan = async (page: import("@playwright/test").Page, label: string) => {
  const { violations } = await new AxeBuilder({ page }).withTags(WCAG).analyze();
  const summary = violations.map((v) => `${label}: ${v.id} (${v.impact}) × ${v.nodes.length}: ${v.nodes[0]?.target.join(" ")}`);
  expect(summary, summary.join("\n")).toEqual([]);
};

test("public pages meet WCAG 2.2 AA (automated rules)", async ({ page, request }) => {
  test.setTimeout(120_000);
  for (const path of [...(await sitemapPaths(request)), ...extraPages]) {
    await page.goto(path);
    await scan(page, path);
  }
});

test("mobile layout and open menu meet WCAG 2.2 AA", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.getByRole("button", { name: "Menu" }).click();
  await scan(page, "/ (mobile menu open)");
});

test("form error states meet WCAG 2.2 AA", async ({ page }) => {
  for (const [path, button] of [["/start", "Send and find my starting point"], ["/contact", "Send message"]] as const) {
    await page.goto(path);
    await page.getByRole("button", { name: button }).click();
    await expect(page.locator("#form-error")).toBeVisible();
    await scan(page, `${path} (errors shown)`);
  }
});
