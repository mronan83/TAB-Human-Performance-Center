import fs from "node:fs";
import path from "node:path";
import { createHmac, timingSafeEqual } from "node:crypto";
import {
  MAX_DOCUMENT_BYTES, RESOURCE_SLUG, parseContent, resourceSchema, resourceTopicSchema,
  type ResourceContent, type ResourceTopicContent,
} from "@/content/schema";

/**
 * The resource library (C35, owner requests 2026-10-07 and 2026-10-08). Entries are JSON files the content editor writes
 * (keystatic.config.ts: `resources` and `resourceTopics`); uploaded PDFs live in content/resource-files, outside
 * public/, so a document that asks for an email address can only be fetched with a signed link (/resources/download).
 * Every file is checked here, and the Resources page is built from this at build time, so a broken entry fails CI.
 */

/**
 * Where the library is read from: the repository, or (tests only, never on Vercel) a fixture copy with one of each kind
 * of entry, e2e/fixtures/resource-library, so the checks can exercise links, open documents and email-gated ones
 * before the owner has published any. e2e/content.spec.ts checks the real library on every run.
 */
const fixtureRoot = process.env.VERCEL ? undefined : process.env.RESOURCE_LIBRARY_ROOT;
const ROOT = fixtureRoot ? path.resolve(process.cwd(), fixtureRoot) : process.cwd();
export const TOPICS_DIR = "content/resource-topics";
export const RESOURCES_DIR = "content/resources";
/** Where the editor stores uploads, and the path it writes into the entry (keystatic.config.ts uses both). */
export const FILES_DIR = "content/resource-files";
export const FILES_PUBLIC_PATH = "/resource-files/";
/** How long an emailed download link works. */
export const LINK_DAYS = 14;

export type ResourceTopic = ResourceTopicContent & { slug: string };
export type Resource = ResourceContent & { slug: string; draft: boolean; document?: { path: string; bytes?: number; requireEmail: boolean } };

const readJsonDir = (root: string, dir: string) => {
  const abs = path.join(root, dir);
  if (!fs.existsSync(abs)) return [];
  return fs.readdirSync(abs).filter((f) => f.endsWith(".json")).sort().map((f) => {
    const slug = f.replace(/\.json$/, "");
    const file = `${dir}/${f}`;
    if (!RESOURCE_SLUG.test(slug)) throw new Error(`${file}: the file name must be lowercase words joined by hyphens.`);
    return { slug, file, data: JSON.parse(fs.readFileSync(path.join(root, file), "utf8")) as unknown };
  });
};

let cache: { topics: ResourceTopic[]; resources: Resource[] } | null = null;

/**
 * Uploaded files are checked where all of them are present: while the site is built (a broken upload fails the build)
 * and in the checks. A deployed function carries only the files it needs (next.config.ts), so the Website stats page,
 * say, has the entries but not the PDFs; there a missing file isn't an error and its size is left out. Without this, a
 * page that only lists titles failed once the first PDF was uploaded (2026-10-09).
 */
const checkFilesByDefault = () => process.env.NEXT_PHASE === "phase-production-build" || !process.env.VERCEL;

/** Every topic and resource, checked. Throws, naming the file and field, if anything breaks the rules. */
export function loadLibrary(root = ROOT, opts: { checkFiles?: boolean } = {}): { topics: ResourceTopic[]; resources: Resource[] } {
  const checkFiles = opts.checkFiles ?? checkFilesByDefault();
  if (root === ROOT && opts.checkFiles === undefined && cache && process.env.NODE_ENV === "production") return cache;
  const topics = readJsonDir(root, TOPICS_DIR)
    .map(({ slug, file, data }) => ({ slug, ...parseContent(resourceTopicSchema, data, file) }))
    .sort((a, b) => a.order - b.order || a.title.localeCompare(b.title));
  const topicSlugs = new Set(topics.map((t) => t.slug));
  const resources = readJsonDir(root, RESOURCES_DIR).map(({ slug, file, data }): Resource => {
    const r = parseContent(resourceSchema, data, file);
    if (!topicSlugs.has(r.topic)) throw new Error(`${file}: topic "${r.topic}" doesn't exist. Choose one of: ${[...topicSlugs].join(", ")}.`);
    const base = { ...r, slug, draft: r.status !== "published" };
    if (r.kind.discriminant !== "document") return base;
    const { file: stored, requireEmail } = r.kind.value;
    if (!stored.startsWith(FILES_PUBLIC_PATH)) throw new Error(`${file}: the document path must start with ${FILES_PUBLIC_PATH}.`);
    const rel = path.posix.normalize(`${FILES_DIR}/${stored.slice(FILES_PUBLIC_PATH.length)}`);
    if (!rel.startsWith(`${FILES_DIR}/`) || !rel.toLowerCase().endsWith(".pdf")) throw new Error(`${file}: documents must be PDF files.`);
    const abs = path.join(root, rel);
    if (!fs.existsSync(abs)) {
      if (checkFiles) throw new Error(`${file}: the uploaded file ${rel} is missing.`);
      return { ...base, document: { path: rel, requireEmail } };
    }
    const bytes = fs.statSync(abs).size;
    if (bytes > MAX_DOCUMENT_BYTES) throw new Error(`${file}: ${rel} is ${(bytes / 1048576).toFixed(1)} MB; the limit is ${MAX_DOCUMENT_BYTES / 1048576} MB.`);
    const head = Buffer.alloc(5);
    const fd = fs.openSync(abs, "r");
    try { fs.readSync(fd, head, 0, 5, 0); } finally { fs.closeSync(fd); }
    if (head.toString("latin1") !== "%PDF-") throw new Error(`${file}: ${rel} isn't a PDF. Export it as a PDF and upload it again.`);
    return { ...base, document: { path: rel, bytes, requireEmail } };
  });
  // A subject opens one resource of its own topic, and a resource sits under at most one subject.
  const bySlug = new Map(resources.map((r) => [r.slug, r]));
  const claimed = new Map<string, string>();
  for (const t of topics) {
    for (const sj of t.subjects) {
      if (!sj.resource) continue;
      const where = `${TOPICS_DIR}/${t.slug}.json, subject "${sj.title}"`;
      const r = bySlug.get(sj.resource);
      if (!r) throw new Error(`${where}: resource "${sj.resource}" doesn't exist.`);
      if (r.topic !== t.slug) throw new Error(`${where}: "${r.title}" is filed under another topic. Choose the same topic on the resource, or link it from that topic.`);
      if (claimed.has(r.slug)) throw new Error(`${where}: "${r.title}" is already linked from the subject "${claimed.get(r.slug)}".`);
      claimed.set(r.slug, sj.title);
    }
  }
  if (root !== ROOT || opts.checkFiles !== undefined) return { topics, resources };
  cache = { topics, resources };
  return cache;
}

/** Drafts show only where draft copy is shown (previews, NEXT_PUBLIC_SHOW_DRAFTS); production lists published ones. */
export const showDrafts = () => process.env.NEXT_PUBLIC_SHOW_DRAFTS === "true";
export function visibleResources(): Resource[] {
  return loadLibrary().resources.filter((r) => !r.draft || showDrafts()).sort((a, b) => b.added.localeCompare(a.added) || a.title.localeCompare(b.title));
}
export const findResource = (slug: string) => visibleResources().find((r) => r.slug === slug);
/** One line in a topic's list: a resource people can open, or a subject still to come. */
export type TopicRow = { kind: "resource"; title: string; resource: Resource } | { kind: "planned"; title: string };

/**
 * Each topic's list for the Resources page: its subjects in order, a subject linked to a visible resource becoming that
 * resource (a draft one stays "coming soon" on the live site), then the topic's other visible resources, newest first.
 * Topics with nothing to list are left out.
 */
export function topicLists(): (ResourceTopic & { rows: TopicRow[] })[] {
  const { topics } = loadLibrary();
  const visible = visibleResources();
  const bySlug = new Map(visible.map((r) => [r.slug, r]));
  return topics
    .map((t) => {
      const linked = new Set(t.subjects.map((sj) => sj.resource).filter(Boolean));
      const rows: TopicRow[] = [
        ...t.subjects.map((sj): TopicRow => {
          const r = sj.resource ? bySlug.get(sj.resource) : undefined;
          return r ? { kind: "resource", title: sj.title, resource: r } : { kind: "planned", title: sj.title };
        }),
        ...visible.filter((r) => r.topic === t.slug && !linked.has(r.slug)).map((r): TopicRow => ({ kind: "resource", title: r.title, resource: r })),
      ];
      return { ...t, rows };
    })
    .filter((t) => t.rows.length > 0);
}

/** Where a resource opens: a link's page, a document's download, or (email-first) its place on the Resources page. */
export const resourceHref = (r: Resource) =>
  r.kind.discriminant === "link" ? r.kind.value.url : r.document?.requireEmail ? `/resources#${r.slug}` : `/resources/download/${r.slug}`;

/** The file on disk for a document. */
export const documentFile = (r: Resource) => (r.document ? path.join(ROOT, r.document.path) : null);

/** "PDF · 1.2 MB", so people know what they're opening ("PDF" where the file isn't at hand to measure). */
export const documentLabel = (bytes?: number) =>
  bytes === undefined ? "PDF" : `PDF · ${bytes < 1048576 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / 1048576).toFixed(1)} MB`}`;

/**
 * Signed download links for documents that ask for an email address. The link names the resource and an expiry, and
 * nothing about the person, so it carries no personal details. Signed with RESOURCE_LINK_SECRET (Vercel, Sensitive);
 * development and tests use a fixed local key, and a deployment without the secret refuses to sign.
 */
function linkKey(): string | null {
  const s = process.env.RESOURCE_LINK_SECRET?.trim();
  if (s) return s;
  return process.env.VERCEL ? null : "local-development-only";
}
const sign = (key: string, slug: string, exp: number) => createHmac("sha256", key).update(`${slug}.${exp}`).digest("base64url");

export function signedDownloadPath(slug: string, now = Date.now()): string | null {
  const key = linkKey();
  if (!key) return null;
  const exp = Math.floor(now / 1000) + LINK_DAYS * 86_400;
  return `/resources/download/${slug}?e=${exp}&s=${sign(key, slug, exp)}`;
}

export function validDownloadSignature(slug: string, e: string | null, s: string | null, now = Date.now()): boolean {
  const key = linkKey();
  const exp = Number(e);
  if (!key || !s || !Number.isInteger(exp) || exp < now / 1000) return false;
  const want = Buffer.from(sign(key, slug, exp));
  const got = Buffer.from(s);
  return want.length === got.length && timingSafeEqual(want, got);
}

/**
 * Quick picks for sharing with a client in TAB Practice (C4): each topic's list, in the same order as the Resources
 * page. A subject still to come points to the Resources page; a document that asks for an email address points to its
 * place there, so the client asks for it like anyone else.
 */
export function resourcePicks(): { title: string; group: string; href: string }[] {
  try {
    return topicLists().flatMap((t) => t.rows.map((row) => ({ title: row.title, group: t.title, href: row.kind === "resource" ? resourceHref(row.resource) : "/resources" })));
  } catch (e) {
    // Sharing still works by typing a link; a library problem mustn't take the client's page down.
    console.error("[resources] quick picks unavailable", e instanceof Error ? e.message : e);
    return [];
  }
}
