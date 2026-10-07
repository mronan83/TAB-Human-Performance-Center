import fs from "node:fs";
import path from "node:path";
import { expect, test } from "@playwright/test";
import { createReader } from "@keystatic/core/reader";
import keystaticConfig from "../keystatic.config";
import { services } from "../content/services";
import { techniques } from "../content/massage-techniques";
import { parseContent, serviceContentSchema, techniquesContentSchema } from "../content/schema";

/**
 * The content editor and the site read the same files the same way (proposed D-069, backlog C31). If keystatic.config.ts
 * and content/schema.ts drift apart, an edit could save a shape the site can't build, or the editor could rewrite
 * content it can't show; these checks fail first. Plus guardrail 8 on every editable word.
 */
const root = path.resolve(__dirname, "..");
const singletons = Object.entries(keystaticConfig.singletons ?? {}) as [string, { path?: string }][];

/** What the editor writes on save: an empty text field's key is left out of the file (Keystatic's text serializer). */
const asEditorSaves = (v: unknown): unknown =>
  Array.isArray(v) ? v.map(asEditorSaves)
  : v && typeof v === "object" ? Object.fromEntries(Object.entries(v).filter(([, x]) => x !== "").map(([k, x]) => [k, asEditorSaves(x)]))
  : v;

test("the content editor reads every content file as the site does, and what it saves builds", async () => {
  const reader = createReader(root, keystaticConfig);
  expect(singletons.length).toBe(6);
  for (const [key, s] of singletons) {
    const file = `${s.path}.json`;
    const onDisk = JSON.parse(fs.readFileSync(path.join(root, file), "utf8"));
    const viaEditor = await (reader.singletons as Record<string, { read: () => Promise<unknown> }>)[key].read();
    // Saving without changes rewrites nothing, so an editor's first save shows only their own edit.
    expect(asEditorSaves(viaEditor), `${key} (${file})`).toEqual(onDisk);
    // A save that empties every optional text field still meets the site's rules (the 2026-10-07 save broke the build).
    const saved = asEditorSaves(blankOptional(viaEditor));
    expect(() => file.startsWith("content/services/") ? parseContent(serviceContentSchema, saved, file) : parseContent(techniquesContentSchema, saved, file), file).not.toThrow();
  }
});

/** Empties every optional text field (the ones whose limit starts at 0 in content/schema.ts), the way an editor clearing them would. */
const OPTIONAL_TEXT: Record<string, string[]> = { textPhoto: ["lead"], cards: ["heading", "intro"], technique: ["aka", "goodToKnow", "reviewNote"] };
function blankOptional(v: unknown): unknown {
  if (Array.isArray(v)) return v.map(blankOptional);
  if (!v || typeof v !== "object") return v;
  const o = v as Record<string, unknown>;
  if (typeof o.discriminant === "string") {
    const value = blankOptional(o.value) as Record<string, unknown>;
    for (const k of OPTIONAL_TEXT[o.discriminant] ?? []) value[k] = "";
    return { ...o, value };
  }
  const out = Object.fromEntries(Object.entries(o).map(([k, x]) => [k, blankOptional(x)]));
  if (typeof o.slug === "string") for (const k of OPTIONAL_TEXT.technique) out[k] = "";
  return out;
}

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
