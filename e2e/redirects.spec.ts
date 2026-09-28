import { expect, test } from "@playwright/test";
import { legacyPrefixRedirects, legacyRedirects } from "../config/redirects";
import { siteUrl } from "../config/site";

/**
 * S19 §19.15 "final redirect test" and NFR-008: every legacy tabmassage.com URL is one permanent (308) hop to a
 * page that loads, with no chains or loops.
 */

const pathOf = (location: string | undefined, base: string) => new URL(location ?? "", base).pathname;

test("every mapped legacy path is one 308 hop to its target", async ({ request, baseURL }) => {
  const failures: string[] = [];
  for (const [from, to] of Object.entries(legacyRedirects)) {
    const res = await request.get(from, { maxRedirects: 0 });
    const got = pathOf(res.headers()["location"], baseURL!);
    if (res.status() !== 308 || got !== to) failures.push(`${from}: ${res.status()} → ${got} (expected 308 → ${to})`);
  }
  expect(failures, failures.join("\n")).toEqual([]);
});

test("WordPress-style trailing slashes on legacy paths still take one hop", async ({ request, baseURL }) => {
  const failures: string[] = [];
  for (const [from, to] of Object.entries(legacyRedirects)) {
    const res = await request.get(`${from}/`, { maxRedirects: 0 });
    const got = pathOf(res.headers()["location"], baseURL!);
    if (res.status() !== 308 || got !== to) failures.push(`${from}/: ${res.status()} → ${got} (expected 308 → ${to})`);
  }
  expect(failures, failures.join("\n")).toEqual([]);
});

test("prefix rules redirect archives in one hop", async ({ request, baseURL }) => {
  for (const { prefix, to } of legacyPrefixRedirects) {
    const sample = prefix.endsWith("/") ? `${prefix}example-post` : prefix;
    const res = await request.get(sample, { maxRedirects: 0 });
    expect(res.status(), sample).toBe(308);
    expect(pathOf(res.headers()["location"], baseURL!), sample).toBe(to);
  }
});

test("every redirect target loads directly (no chains)", async ({ request }) => {
  const targets = [...new Set([...Object.values(legacyRedirects), ...legacyPrefixRedirects.map((r) => r.to)])];
  for (const target of targets) {
    const res = await request.get(target, { maxRedirects: 0 });
    expect(res.status(), target).toBe(200);
  }
});

test("trailing slashes normalise in one hop, keeping the query", async ({ request, baseURL }) => {
  const res = await request.get("/about/?ref=test", { maxRedirects: 0 });
  expect(res.status()).toBe(308);
  const loc = new URL(res.headers()["location"], baseURL);
  expect(loc.pathname + loc.search).toBe("/about?ref=test");
});

test("the legacy domain redirects to the new domain in one hop", async ({ request }) => {
  const res = await request.get("/about-us", { maxRedirects: 0, headers: { host: "tabmassage.com" } });
  expect(res.status()).toBe(308);
  expect(res.headers()["location"]).toBe(`${siteUrl}/about`);
});
