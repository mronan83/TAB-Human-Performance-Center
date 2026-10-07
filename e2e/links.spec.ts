import { expect, test } from "@playwright/test";
import { sitemapPaths } from "./helpers";

/** S19 §19.15 "final link crawl": every internal link on every public page resolves (S16 §16.8: no broken links). */

test("no broken internal links", async ({ page, request }) => {
  const links = new Map<string, string>(); // href → first page it was found on
  for (const path of await sitemapPaths(request)) {
    await page.goto(path);
    const hrefs = await page.$$eval("a[href^='/']", (as) => as.map((a) => a.getAttribute("href")!));
    for (const href of hrefs) {
      const clean = href.split("#")[0] || "/";
      if (!links.has(clean)) links.set(clean, path);
    }
  }
  const broken: string[] = [];
  for (const [href, foundOn] of links) {
    // The browser pass above can outlast the server's 5 s keep-alive, so the first reuse of the pooled connection may
    // hit a socket the server already closed (ECONNRESET). maxRetries retries only that network error, never a status.
    // maxRedirects 0: a resource link (/resources/go/…) is checked as our redirect, not by fetching the other website.
    const res = await request.get(href, { maxRetries: 2, maxRedirects: 0 });
    if (res.status() >= 400) broken.push(`${href} (${res.status()}) linked from ${foundOn}`);
  }
  expect(broken, broken.join("\n")).toEqual([]);
});

test("in-page anchors used in the footer exist", async ({ page }) => {
  for (const anchor of ["/policies#cancellation", "/policies#scope", "/services/massage-bodywork#faq"]) {
    const [path, id] = anchor.split("#");
    await page.goto(path);
    await expect(page.locator(`#${id}`), anchor).toHaveCount(1);
  }
});
