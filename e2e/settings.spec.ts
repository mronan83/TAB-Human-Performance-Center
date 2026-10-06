import { expect, test, type Page } from "@playwright/test";
import { bookingHref } from "../lib/links";

/**
 * Owner settings (C23, C23b). These change the whole demo site, so they run in their own Playwright project after
 * every other test (playwright.config.ts), one at a time, and put each setting back.
 */
test.describe.configure({ mode: "serial" });

const save = async (page: Page) => {
  await page.getByRole("button", { name: "Save settings" }).click();
  await expect(page.getByText("Saved. The website updates within a few seconds.")).toBeVisible();
};

test("owner settings: the banner switch reaches the site; Live waits for the go-live checklist (C23)", async ({ page, context, baseURL }) => {
  await context.addCookies([{ name: "tab_demo_role", value: "owner", url: baseURL! }]);
  await page.goto("/practice/settings");
  await expect(page.locator("main h1")).toHaveText("Settings");
  await expect(page.getByRole("radio", { name: /Live/ })).toBeDisabled();
  await expect(page.getByText("Go-live checklist")).toBeVisible();
  const banner = page.getByText("TAB Massage & Fitness is becoming TAB Human Performance Center.");

  await page.getByLabel(/Name-change banner/).uncheck();
  await page.getByRole("button", { name: "Save settings" }).click();
  await expect(page.getByText("Saved. The website updates within a few seconds.")).toBeVisible();
  await page.goto("/about");
  await expect(banner).toHaveCount(0);

  await page.goto("/practice/settings");
  await page.getByLabel(/Name-change banner/).check();
  await page.getByRole("button", { name: "Save settings" }).click();
  await expect(page.getByText("Saved. The website updates within a few seconds.")).toBeVisible();
  await page.goto("/about");
  await expect(banner).toBeVisible();
});

test("owner settings: a per-service Book link and the page switches reach the site (C23b)", async ({ page, context, baseURL }) => {
  await context.addCookies([{ name: "tab_demo_role", value: "owner", url: baseURL! }]);
  const link = "https://bookings.gettimely.com/tabmassageandfitness/book?category=massage";

  await page.goto("/practice/settings");
  // Events and Testimonials stay locked until there's real content for them.
  await expect(page.getByLabel(/Events & Workshops/)).toBeDisabled();
  await expect(page.getByLabel(/Testimonials/)).toBeDisabled();
  // A non-https link is refused before anything is saved.
  await page.getByLabel("Massage & Bodywork").fill("javascript:alert(1)");
  await page.getByRole("button", { name: "Save settings" }).click();
  await expect(page.getByText("Saved. The website updates within a few seconds.")).toHaveCount(0);

  await page.getByLabel("Massage & Bodywork").fill(link);
  await page.getByLabel(/^Our Team/).uncheck();
  await save(page);

  await page.goto("/services/massage-bodywork");
  await expect(page.locator('main a[data-event="Booking: Clicked"]').first()).toHaveAttribute("href", link);
  await page.goto("/services/functional-strength"); // other services keep the main booking page
  await expect(page.locator('main a[data-event="Booking: Clicked"]').first()).toHaveAttribute("href", bookingHref("personal-strength-training").href);
  await expect(page.locator('header a[href="/about/team"], footer a[href="/about/team"]')).toHaveCount(0); // menus included, even closed ones
  expect((await page.goto("/about/team"))?.status()).toBe(404);

  await page.goto("/practice/settings");
  await page.getByLabel("Massage & Bodywork").fill("");
  await page.getByLabel(/^Our Team/).check();
  await save(page);
  await page.goto("/about/team");
  await expect(page.locator("main h1")).toBeVisible();
  await expect(page.locator('footer a[href="/about/team"]')).toHaveCount(1);
  await page.goto("/services/massage-bodywork");
  await expect(page.locator('main a[data-event="Booking: Clicked"]').first()).toHaveAttribute("href", bookingHref("massage-bodywork").href);
});
