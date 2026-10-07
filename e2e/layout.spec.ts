import { expect, test } from "@playwright/test";
import { extraPages, sitemapPaths } from "./helpers";

/**
 * No page is wider than a phone screen (WCAG 2.2 SC 1.4.10 Reflow; NFR-001). Found on the massage techniques page on
 * 2026-10-07: a 640px table stretched its grid column and the whole page scrolled sideways. Scroll regions that are
 * meant to scroll (role="region", e.g. a wide table) may be wider inside; the page itself may not.
 */
for (const width of [320, 390]) {
  test(`every page fits a ${width}px-wide phone screen without sideways scrolling`, async ({ page, request }) => {
    test.setTimeout(120_000);
    await page.setViewportSize({ width, height: 800 });
    const failures: string[] = [];
    for (const path of [...(await sitemapPaths(request)), ...extraPages]) {
      await page.goto(path);
      const r = await page.evaluate(() => {
        const vw = document.documentElement.clientWidth;
        const culprit = [...document.querySelectorAll("body *")].find((e) => {
          if (e.closest('[role="region"]') && !e.matches('[role="region"]')) return false;
          const box = e.getBoundingClientRect();
          return box.width > 0 && box.right > vw + 1 && getComputedStyle(e).position !== "fixed";
        });
        return { scroll: document.documentElement.scrollWidth, vw, culprit: culprit ? `${culprit.tagName.toLowerCase()}.${String(culprit.className).slice(0, 60)}` : "" };
      });
      if (r.scroll > r.vw) failures.push(`${path}: page is ${r.scroll}px wide (screen ${r.vw}px); first too-wide element: ${r.culprit}`);
    }
    expect(failures, failures.join("\n")).toEqual([]);
  });
}
