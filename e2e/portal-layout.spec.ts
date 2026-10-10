import fs from "node:fs";
import path from "node:path";
import { expect, test, type Page } from "@playwright/test";

/**
 * Sign-in pages and portal pages have separate layouts (owner report 2026-10-10: after signing in to TAB Practice the
 * portal showed without its menu, unscaled, until a reload). Next.js keeps a shared layout as it is when moving between
 * its pages in the app, so a single layout choosing by address drew the wrong frame. These checks move in the app (no
 * page load), the way signing in does, and expect the right frame straight away.
 */
const portalMenu = (page: Page) => page.getByRole("navigation", { name: "Portal" });
// The App Router's own navigation, as a link or a sign-in step's redirect does it.
const moveTo = (page: Page, href: string) => page.evaluate((h) => (window as unknown as { next: { router: { push: (h: string) => void } } }).next.router.push(h), href);

test("moving from sign-in into the portal draws its menu without a reload, and back", async ({ page, context, baseURL }) => {
  await page.goto("/my-tab/login");
  await expect(portalMenu(page)).toHaveCount(0);
  await context.addCookies([{ name: "tab_demo_role", value: "client", url: baseURL! }]);
  await moveTo(page, "/my-tab");
  await expect(page).toHaveURL(/\/my-tab$/);
  await expect(portalMenu(page).first()).toBeVisible();

  await context.clearCookies();
  await moveTo(page, "/my-tab/login");
  await expect(page).toHaveURL(/\/my-tab\/login$/);
  await expect(page.getByRole("button", { name: "Client: My TAB" })).toBeVisible();
  await expect(portalMenu(page)).toHaveCount(0);
});

test("every portal page sits in a sign-in group or a portal group, never in a layout that chooses by address", () => {
  const app = path.join(process.cwd(), "app/(portal)");
  const pages = (dir: string): string[] => fs.readdirSync(dir, { withFileTypes: true }).flatMap((d) => {
    const p = path.join(dir, d.name);
    return d.isDirectory() ? pages(p) : d.name === "page.tsx" ? [path.relative(app, p)] : [];
  });
  const groups: Record<string, string[]> = { practice: ["(signin)", "(staff)"], "my-tab": ["(signin)", "(client)"] };
  for (const [area, allowed] of Object.entries(groups)) {
    for (const p of pages(path.join(app, area))) expect(allowed, p).toContain(p.split(path.sep)[1]);
    expect(fs.readdirSync(path.join(app, area, "(signin)")).sort(), area).toEqual(area === "practice" ? ["layout.tsx", "login", "verify"] : ["layout.tsx", "login"]);
  }
  for (const f of ["practice/layout.tsx", "my-tab/layout.tsx", "practice/(staff)/layout.tsx", "my-tab/(client)/layout.tsx"]) {
    expect(fs.readFileSync(path.join(app, f), "utf8"), f).not.toMatch(/x-tab-path|headers\(\)/);
  }
});
