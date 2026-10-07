import fs from "node:fs";
import path from "node:path";
import { expect, test } from "@playwright/test";
import { createReader } from "@keystatic/core/reader";
import keystaticConfig from "../keystatic.config";
import { services } from "../content/services";
import { techniques } from "../content/massage-techniques";

/**
 * The content editor and the site read the same files the same way (proposed D-069, backlog C31). If keystatic.config.ts
 * and content/schema.ts drift apart, an edit could save a shape the site can't build, or the editor could rewrite
 * content it can't show; these checks fail first. Plus guardrail 8 on every editable word.
 */
const root = path.resolve(__dirname, "..");
const singletons = Object.entries(keystaticConfig.singletons ?? {}) as [string, { path?: string }][];

test("the content editor reads every content file exactly as the site does", async () => {
  const reader = createReader(root, keystaticConfig);
  expect(singletons.length).toBe(6);
  for (const [key, s] of singletons) {
    const file = `${s.path}.json`;
    const onDisk = JSON.parse(fs.readFileSync(path.join(root, file), "utf8"));
    const viaEditor = await (reader.singletons as Record<string, { read: () => Promise<unknown> }>)[key].read();
    expect(viaEditor, `${key} (${file})`).toEqual(onDisk);
  }
});

test("every service page file is wired into the site, and only Massage & Bodywork has a techniques index", () => {
  const files = fs.readdirSync(path.join(root, "content/services")).filter((f) => f.endsWith(".json")).map((f) => f.replace(/\.json$/, "")).sort();
  expect(files).toEqual(services.map((s) => s.slug).sort());
  expect(services.filter((s) => s.techniques).map((s) => s.slug)).toEqual(["massage-bodywork"]);
  for (const s of services) expect(s.sections.filter((b) => b.discriminant === "method"), s.slug).toHaveLength(1);
});

test("editable words make no diagnosis or treatment claims (guardrail 8)", () => {
  // "Fully healed scars" describes a client's state, so "healed" is allowed; "heals" and "healing" claim an effect.
  const CLAIM = /\b(cure[sd]?|curing|heal(s|ing)?|treat(s|ed|ing|ment)? (your|the|a|chronic|pain|injur|disease|condition|illness)|diagnos(e|es|ed|ing)|detox(es|ify)?|fix(es)? (your|the) (pain|back|injury))\b/i;
  const files = ["content/massage-techniques.json", ...services.map((s) => `content/services/${s.slug}.json`)];
  for (const f of files) {
    const words: string[] = [];
    JSON.parse(fs.readFileSync(path.join(root, f), "utf8"), (_k, v) => (typeof v === "string" && words.push(v), v));
    // Scope notes say what a service is not, so "doesn't diagnose or replace medical care" is allowed there.
    const claims = words.filter((w) => CLAIM.test(w) && !/\b(not|n’t|n't|never|doesn|don)\b[^.]*\b(diagnos|treat|replace)/i.test(w));
    expect(claims, f).toEqual([]);
  }
  expect(techniques.length).toBeGreaterThan(0);
});

test("the content editor page: closed until connected, never writes files on a deployment, editor hosts allowed only there", async ({ page, request }) => {
  const res = await page.goto("/keystatic");
  expect(res?.status()).toBe(200);
  await expect(page.getByRole("heading", { name: "The content editor isn’t connected yet" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Go to Website changes" })).toHaveAttribute("href", "/practice/website");
  expect(res?.headers()["content-security-policy"]).toContain("https://api.keystatic.cloud");
  expect((await request.get("/")).headers()["content-security-policy"]).not.toContain("keystatic");
  // Local mode (file writes) exists on a developer's machine only; the production build answers 404.
  for (const p of ["/api/keystatic/tree", "/api/keystatic/update"]) expect((await request.post(p, { data: "{}" })).status(), p).toBe(404);
  expect(await page.locator('meta[name="robots"]').getAttribute("content")).toContain("noindex");
});
