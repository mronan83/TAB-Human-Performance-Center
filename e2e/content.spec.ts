import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { expect, test } from "@playwright/test";
import { createReader } from "@keystatic/core/reader";
import keystaticConfig from "../keystatic.config";
import { services } from "../content/services";
import { techniques } from "../content/massage-techniques";
import {
  aboutContentSchema, homeContentSchema, methodContentSchema, parseContent, resourceSchema, resourceTopicSchema, serviceContentSchema,
  storyContentSchema, teamContentSchema, techniquesContentSchema,
} from "../content/schema";
import { loadLibrary } from "../lib/resources";

/**
 * The content editor and the site read the same files the same way (proposed D-069, backlog C31). If keystatic.config.ts
 * and content/schema.ts drift apart, an edit could save a shape the site can't build, or the editor could rewrite
 * content it can't show; these checks fail first. Plus guardrail 8 on every editable word.
 */
const root = path.resolve(__dirname, "..");
const singletons = Object.entries(keystaticConfig.singletons ?? {}) as [string, { path?: string }][];
const collections = Object.entries(keystaticConfig.collections ?? {}) as [string, { path?: string }][];
/** The site's rules for each content file, by the editor's path for it. */
const RULES: [RegExp, Parameters<typeof parseContent>[0]][] = [
  [/^content\/services\//, serviceContentSchema], [/^content\/massage-techniques$/, techniquesContentSchema],
  [/^content\/pages\/home$/, homeContentSchema], [/^content\/pages\/tab-method$/, methodContentSchema],
  [/^content\/pages\/about$/, aboutContentSchema], [/^content\/pages\/our-story$/, storyContentSchema],
  [/^content\/pages\/team$/, teamContentSchema], [/^content\/resources\//, resourceSchema], [/^content\/resource-topics\//, resourceTopicSchema],
];
const rulesFor = (editorPath: string) => {
  const r = RULES.find(([re]) => re.test(editorPath));
  if (!r) throw new Error(`No content rules for ${editorPath}: add them to content/schema.ts and this list.`);
  return r[1];
};

/** What the editor writes on save: an empty text field, image or file is left out of the file (Keystatic's serializers). */
const asEditorSaves = (v: unknown): unknown =>
  Array.isArray(v) ? v.map(asEditorSaves)
  : v && typeof v === "object" ? Object.fromEntries(Object.entries(v).filter(([, x]) => x !== "" && x !== null).map(([k, x]) => [k, asEditorSaves(x)]))
  : v;

test("the content editor reads every content file as the site does, and what it saves builds", async () => {
  const reader = createReader(root, keystaticConfig);
  expect(singletons.length).toBe(11);
  for (const [key, s] of singletons) {
    const file = `${s.path}.json`;
    const onDisk = JSON.parse(fs.readFileSync(path.join(root, file), "utf8"));
    const viaEditor = await (reader.singletons as Record<string, { read: () => Promise<unknown> }>)[key].read();
    // Saving without changes rewrites nothing, so an editor's first save shows only their own edit.
    expect(asEditorSaves(viaEditor), `${key} (${file})`).toEqual(onDisk);
    // A save that empties every optional text field still meets the site's rules (the 2026-10-07 save broke the build).
    const saved = asEditorSaves(blankOptional(viaEditor));
    const schema = rulesFor(s.path ?? "");
    expect(() => parseContent(schema, saved, file), file).not.toThrow();
  }
});

test("the editor's collections (resources and their topics) read as the site reads them, and the library builds", async () => {
  const reader = createReader(root, keystaticConfig);
  expect(collections.map(([k]) => k).sort()).toEqual(["resourceTopics", "resources"]);
  for (const [key, c] of collections) {
    const dir = (c.path ?? "").replace(/\/\*$/, "");
    const schema = rulesFor(`${dir}/`);
    const coll = (reader.collections as Record<string, { list: () => Promise<string[]>; read: (s: string) => Promise<unknown> }>)[key];
    const files = fs.existsSync(path.join(root, dir)) ? fs.readdirSync(path.join(root, dir)).filter((f) => f.endsWith(".json")) : [];
    expect((await coll.list()).sort(), key).toEqual(files.map((f) => f.replace(/\.json$/, "")).sort());
    for (const f of files) {
      const onDisk = JSON.parse(fs.readFileSync(path.join(root, dir, f), "utf8"));
      const viaEditor = await coll.read(f.replace(/\.json$/, ""));
      // The editor hands back an uploaded file's contents; the file stores its path, which the library checks.
      expect(asEditorSaves(stripFiles(viaEditor, onDisk)), `${dir}/${f}`).toEqual(onDisk);
      expect(() => parseContent(schema, onDisk, `${dir}/${f}`)).not.toThrow();
    }
  }
  // Topics exist, every resource names one, and every uploaded document is a real PDF within the size limit.
  const lib = loadLibrary(root);
  expect(lib.topics.length).toBeGreaterThan(0);
});

test("the resource library's own checks catch a broken entry, naming the file", () => {
  const fixtures = path.join(root, "e2e/fixtures/resource-library");
  const lib = loadLibrary(fixtures);
  expect(lib.resources.map((r) => r.slug).sort()).toEqual(["outside-guide", "recovery-week", "sleep-basics", "unfinished"]);
  expect(lib.resources.find((r) => r.slug === "recovery-week")?.document).toMatchObject({ requireEmail: true });
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "library-"));
  fs.cpSync(fixtures, tmp, { recursive: true });
  const entry = path.join(tmp, "content/resources/sleep-basics.json");
  const good = fs.readFileSync(entry, "utf8");
  fs.writeFileSync(path.join(tmp, "content/resource-files/sleep-basics/file.pdf"), "not a pdf");
  expect(() => loadLibrary(tmp)).toThrow(/sleep-basics\.json: .*isn't a PDF/);
  fs.writeFileSync(entry, good.replace('"topic": "recovery"', '"topic": "nowhere"'));
  expect(() => loadLibrary(tmp)).toThrow(/topic "nowhere" doesn't exist/);
  fs.writeFileSync(entry, good.replace('"/resource-files/sleep-basics/file.pdf"', '"/somewhere/else.pdf"'));
  expect(() => loadLibrary(tmp)).toThrow(/must start with \/resource-files\//);
  fs.rmSync(tmp, { recursive: true, force: true });
});

/** Keystatic reads an uploaded file as its bytes; put back the stored path so the two can be compared. */
function stripFiles(viaEditor: unknown, onDisk: unknown): unknown {
  if (viaEditor instanceof Uint8Array || (viaEditor && typeof viaEditor === "object" && "data" in viaEditor && (viaEditor as { data: unknown }).data instanceof Uint8Array)) return onDisk;
  if (Array.isArray(viaEditor)) return viaEditor.map((x, i) => stripFiles(x, (onDisk as unknown[] | undefined)?.[i]));
  if (viaEditor && typeof viaEditor === "object") return Object.fromEntries(Object.entries(viaEditor).map(([k, x]) => [k, stripFiles(x, (onDisk as Record<string, unknown> | undefined)?.[k])]));
  return viaEditor;
}

/** Empties every optional text field (the ones whose limit starts at 0 in content/schema.ts), the way an editor clearing them would. */
const OPTIONAL_TEXT: Record<string, string[]> = { textPhoto: ["lead"], cards: ["heading", "intro"], technique: ["aka", "goodToKnow", "reviewNote"], person: ["credentials", "bio", "photoAlt"] };
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
  if ("credentialsConfirmed" in o) for (const k of OPTIONAL_TEXT.person) out[k] = "";
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
  const dirFiles = (d: string) => (fs.existsSync(path.join(root, d)) ? fs.readdirSync(path.join(root, d)).filter((f) => f.endsWith(".json")).map((f) => `${d}/${f}`) : []);
  const files = ["content/massage-techniques.json", ...services.map((s) => `content/services/${s.slug}.json`), ...dirFiles("content/pages"), ...dirFiles("content/resources"), ...dirFiles("content/resource-topics")];
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
