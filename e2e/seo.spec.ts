import { expect, test } from "@playwright/test";
import { indexingAllowed, siteUrl } from "../config/site";
import { sitemapPaths } from "./helpers";

/** NFR-002, NFR-003, NFR-009: every public page is findable and well described; nothing is indexable before launch. */

test("every sitemap page loads with a title, description, canonical and share tags", async ({ page, request }) => {
  const paths = await sitemapPaths(request);
  expect(paths.length).toBeGreaterThan(10);
  for (const path of paths) {
    const res = await page.goto(path);
    expect(res?.status(), path).toBe(200);
    const meta = await page.evaluate(() => ({
      title: document.title,
      description: document.querySelector('meta[name="description"]')?.getAttribute("content") ?? "",
      canonical: document.querySelector('link[rel="canonical"]')?.getAttribute("href") ?? "",
      ogTitle: document.querySelector('meta[property="og:title"]')?.getAttribute("content") ?? "",
      h1s: document.querySelectorAll("main h1").length,
    }));
    expect(meta.title, path).toContain("TAB Human Performance Center");
    expect(meta.description.length, `${path} description`).toBeGreaterThan(40);
    expect(meta.description.length, `${path} description`).toBeLessThanOrEqual(160);
    expect(meta.canonical, path).toBe(path === "/" ? siteUrl : `${siteUrl}${path}`);
    expect(meta.ogTitle, path).not.toBe("");
    expect(meta.h1s, `${path} h1 count`).toBe(1);
  }
});

test("titles are unique across the site (S16 §16.8)", async ({ page, request }) => {
  const titles = new Map<string, string>();
  for (const path of await sitemapPaths(request)) {
    await page.goto(path);
    const title = await page.title();
    expect(titles.get(title), `"${title}" on ${path} and ${titles.get(title)}`).toBeUndefined();
    titles.set(title, path);
  }
});

test("before launch nothing is indexable (NFR-009)", async ({ request }) => {
  test.skip(indexingAllowed, "indexing is switched on");
  expect(await (await request.get("/robots.txt")).text()).toMatch(/Disallow: \/\s*$/m);
  const home = await request.get("/");
  expect(home.headers()["x-robots-tag"]).toContain("noindex");
});

test("the portal is never indexable", async ({ request }) => {
  const res = await request.get("/my-tab", { maxRedirects: 0 });
  expect(res.headers()["x-robots-tag"] ?? "").toContain("noindex");
});
