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

test("portal: demo sign-in and progress review meet WCAG 2.2 AA", async ({ page, context, baseURL }) => {
  await page.goto("/my-tab/login");
  await scan(page, "/my-tab/login (demo)");
  await context.addCookies([{ name: "tab_demo_role", value: "owner", url: baseURL! }]);
  await page.goto("/practice/clients/demo-client-ruth/review");
  await page.getByLabel("TAB Method stage", { exact: true }).selectOption("transform"); // shows the stage-change confirmation
  await scan(page, "/practice/clients/…/review (stage change)");
  await page.goto("/practice/clients/demo-client-dana/plans/plan-dana-massage");
  await scan(page, "/practice/clients/…/plans/… (service plan editor)");
  await page.goto("/practice/clients/demo-client-dana/plans/plan-dana");
  await scan(page, "/practice/clients/…/plans/… (Performance Plan editor)");
  await page.goto("/practice/clients/demo-client-dana/programs/new");
  await scan(page, "/practice/clients/…/programs/new (choose a program)");
  await page.goto("/practice/clients/demo-client-dana/programs/cp-strength");
  await scan(page, "/practice/clients/…/programs/… (personalize a program)");
  await page.goto("/practice/programs");
  await scan(page, "/practice/programs (library)");
  await page.goto("/practice/programs/tpl-desk-reset");
  await scan(page, "/practice/programs/… (program editor)");
  await page.goto("/practice/programs/tpl-strength-foundations");
  await scan(page, "/practice/programs/… (published version)");
  await page.goto("/practice/team");
  await scan(page, "/practice/team");
  await page.goto("/practice/settings");
  await scan(page, "/practice/settings (owner settings)");
  await page.goto("/practice/clients/demo-client-dana");
  await scan(page, "/practice/clients/… (client page: access, forms, resources)");
  await context.addCookies([{ name: "tab_demo_role", value: "client", url: baseURL! }]);
  await page.goto("/my-tab/resources");
  await scan(page, "/my-tab/resources");
});
