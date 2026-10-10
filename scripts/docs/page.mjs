/**
 * Shared renderer for the living documentation pages: technical architecture, data model, requirements & traceability,
 * user stories, backlog and the website content guide. Each page has a Markdown source in docs/ that is the only place
 * its written content is edited; this module turns a source into one self-contained HTML page in TAB Human Performance
 * Center's palette (scripts/docs/styles.mjs) with the behaviour in scripts/docs/client.js.
 *
 * The pages are one set: every ID (a requirement, feature, backlog item, story, decision, risk, table…) has one home
 * page and anchor in the shared registry (scripts/docs/model.mjs). Wherever an ID appears on any page it links to that
 * home, and hovering or focusing it shows a card with its title, status and kind, read from an index embedded in the page.
 *
 * Markdown supported: front matter (key: value between --- lines), ## sections (the contents rail), ### headings,
 * paragraphs, "- " lists, "1. " numbered steps (with "   - " sub-points), tables, and directives on a line of their own:
 * <!-- name args -->, which the page's renderer expands (diagrams, charts, generated lists). {{name}} in text is replaced
 * by a value the renderer computes, so a count in a sentence can't disagree with what it counts; an unknown name fails.
 */
import fs from "node:fs";
import { execSync } from "node:child_process";
import { CSS } from "./styles.mjs";

export const REPO = "https://github.com/mronan83/TAB-Human-Performance-Center";
export const root = new URL("../../", import.meta.url).pathname;
export const read = (p) => fs.readFileSync(root + p, "utf8");
export const exists = (p) => fs.existsSync(root + p);
export const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
export const slug = (s) => s.toLowerCase().replace(/<[^>]+>|`/g, "").replace(/&[a-z]+;/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
export const sha = () => { try { return execSync("git rev-parse --short HEAD", { cwd: root }).toString().trim(); } catch { return "unknown"; } };
export const args = () => Object.fromEntries(process.argv.slice(2).reduce((acc, a, i, all) => (a.startsWith("--") ? [...acc, [a.slice(2), all[i + 1] && !all[i + 1].startsWith("--") ? all[i + 1] : true]] : acc), []));
export const today = () => new Date().toISOString().slice(0, 10);
export const fmtDate = (d) => { const t = new Date(d + "T12:00:00Z"); return isNaN(t) ? d : t.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" }); };

/** The published pages, in masthead order; their addresses live in docs/living-docs.json. */
export const PAGES = [
  ["architecture", "Architecture", "docs/ARCHITECTURE.md"],
  ["dataModel", "Data model", "docs/DATA-MODEL.md"],
  ["traceability", "Requirements", "docs/TRACEABILITY.md"],
  ["stories", "User stories", "docs/USER-STORIES.md"],
  ["backlog", "Backlog", "docs/BACKLOG.md"],
  ["contentGuide", "Content guide", "docs/CONTENT-GUIDE.md"],
];
export const pageName = (key) => PAGES.find(([k]) => k === key)?.[1] ?? key;
// DOCS_LINKS points at another map, e.g. relative file names for a preview that bundles every page in one artifact.
let LINKS = null;
export const links = () => (LINKS ??= (() => { try { return JSON.parse(process.env.DOCS_LINKS ? fs.readFileSync(process.env.DOCS_LINKS, "utf8") : read("docs/living-docs.json")); } catch { return {}; } })());

// ---- Statuses: one vocabulary for every page (icon, word and tint together) -------------------------------------------
export const STATUS = {
  done: ["Done", "st-done", "check"], verified: ["Verified", "st-done", "check"], accepted: ["Accepted", "st-done", "check"], closed: ["Closed", "st-done", "check"],
  review: ["In review", "st-progress", "progress"], progress: ["In progress", "st-progress", "progress"], partial: ["Partial", "st-progress", "progress"],
  mitigating: ["Mitigating", "st-progress", "progress"], proposed: ["Proposed", "st-progress", "proposed"],
  ready: ["Ready", "st-ready", "ready"], built: ["Built", "st-ready", "built"],
  queued: ["Queued", "st-queued", "queued"], planned: ["Planned", "st-queued", "planned"],
  blocked: ["Blocked", "st-blocked", "blocked"], open: ["Open", "st-blocked", "alert"],
  you: ["Waiting on you", "st-you", "you"],
  dropped: ["Dropped", "st-muted", "dropped"], deferred: ["Deferred", "st-muted", "pause"], superseded: ["Superseded", "st-muted", "superseded"],
};
const ICONS = {
  check: '<circle cx="12" cy="12" r="9"/><path d="m8 12.5 2.6 2.6L16.2 9.5"/>',
  progress: '<circle cx="12" cy="12" r="9"/><path d="M12 3a9 9 0 0 1 0 18z" fill="currentColor" stroke="none"/>',
  ready: '<circle cx="12" cy="12" r="9"/>',
  built: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3.2" fill="currentColor" stroke="none"/>',
  queued: '<path d="M6.5 3h11M6.5 21h11M8 3c0 5 8 4.5 8 9s-8 4-8 9M16 3c0 5-8 4.5-8 9s8 4 8 9"/>',
  planned: '<circle cx="12" cy="12" r="9" stroke-dasharray="3.4 3"/>',
  blocked: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7.5a4 4 0 0 1 8 0V11"/>',
  alert: '<path d="M12 3.5 2.5 20h19z"/><path d="M12 10v4.5M12 17.5h.01"/>',
  you: '<circle cx="12" cy="8" r="4"/><path d="M4.5 21a7.5 7.5 0 0 1 15 0"/>',
  dropped: '<circle cx="12" cy="12" r="9"/><path d="m9 9 6 6m0-6-6 6"/>',
  pause: '<circle cx="12" cy="12" r="9"/><path d="M10 9v6M14 9v6"/>',
  proposed: '<circle cx="12" cy="12" r="9"/><path d="M9.6 9.4a2.5 2.5 0 1 1 3.4 2.4c-.6.3-1 .8-1 1.5v.5M12 17h.01"/>',
  superseded: '<circle cx="12" cy="12" r="9"/><path d="M8 12h8m-3-3 3 3-3 3"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.6-3.6"/>',
  chev: '<path d="m6 9 6 6 6-6"/>',
  filter: '<path d="M4 5h16l-6 7.5V18l-4 2v-7.5z"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5h.01"/>',
  arrow: '<path d="M5 12h14m-5-5 5 5-5 5"/>',
};
const SPRITE = `<svg xmlns="http://www.w3.org/2000/svg" style="display:none">${Object.entries(ICONS).map(([k, d]) => `<symbol id="i-${k}" viewBox="0 0 24 24">${d}</symbol>`).join("")}</svg>`;
export const icon = (name) => `<svg class="i" aria-hidden="true"><use href="#i-${name}"/></svg>`;
export const stCls = (st) => STATUS[st]?.[1] ?? "";
export const stLabel = (st) => STATUS[st]?.[0] ?? st;
export const pill = (st, word, extra = "") => (STATUS[st] ? `<span class="pill ${STATUS[st][1]}">${icon(STATUS[st][2])}${esc(word ?? STATUS[st][0])}${extra}</span>` : "");

// ---- The shared ID registry --------------------------------------------------------------------------------------------
// Set by each renderer from model(): id → { id, title, status, kind, page, anchor }. `here` is the page being built.
let REG = new Map();
let HERE = "";
export function useRegistry(reg, here) { REG = reg; HERE = here; }
export const known = (id) => REG.has(id);
export const entry = (id) => REG.get(id);
/** The address of an ID's home: an in-page anchor, or the other page's artifact plus the anchor. */
export function hrefFor(id) {
  const e = REG.get(id);
  if (!e) return null;
  if (e.page === HERE) return { href: `#${e.anchor}`, ext: false };
  const url = links()[e.page];
  return url ? { href: `${url}#${e.anchor}`, ext: true } : null;
}
const extAttr = (h) => (h.ext ? ' target="_blank" rel="noopener"' : "");
/** An inline reference: the ID as a dotted link with a hover card. Unknown IDs stay plain text. */
export function ref(id, label = id) {
  const h = hrefFor(id);
  return h ? `<a class="ref" data-id="${esc(id)}" href="${h.href}"${extAttr(h)}>${esc(label)}</a>` : esc(label);
}
/** A status-tinted chip for an ID. */
export function tag(id) {
  const e = REG.get(id);
  const h = hrefFor(id);
  const st = e?.status && STATUS[e.status];
  const inner = `${st ? icon(st[2]) : ""}<span>${esc(id)}</span>`;
  const cls = `tag${st ? " " + st[1] : ""}`;
  return h ? `<a class="${cls}" data-id="${esc(id)}" href="${h.href}"${extAttr(h)}>${inner}</a>` : `<span class="${cls}">${inner}</span>`;
}
export const tags = (ids) => (ids.length ? `<span class="tags">${ids.map(tag).join("")}</span>` : '<span class="none">—</span>');
/** A list of IDs with their titles, for a row's detail. */
export const traceList = (ids) => (ids.length ? `<ul class="trace-list">${ids.map((id) => `<li>${tag(id)}<span class="t">${esc(REG.get(id)?.title ?? "")}</span></li>`).join("")}</ul>` : '<span class="none">—</span>');
/** The index each page embeds for its hover cards: every ID with its title, status, kind and home page. */
export function indexJson() {
  const o = {};
  for (const [id, e] of REG) o[id] = [e.title.length > 260 ? e.title.slice(0, 257) + "…" : e.title, e.status ?? "", e.kind, pageName(e.page)];
  return JSON.stringify(o).replace(/</g, "\\u003c");
}

// ---- Parse -----------------------------------------------------------------------------------------------------------
export function parse(src) {
  const front = {};
  let lines = src.replace(/\r/g, "").split("\n");
  if (lines[0] === "---") {
    const end = lines.indexOf("---", 1);
    for (const l of lines.slice(1, end)) { const m = l.match(/^(\w[\w-]*):\s*(.*)$/); if (m) front[m[1]] = m[2]; }
    lines = lines.slice(end + 1);
  }
  const blocks = [];
  let para = [];
  const flush = () => { if (para.length) blocks.push({ type: "p", text: para.join(" ") }); para = []; };
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i];
    if (!l.trim()) { flush(); continue; }
    let m;
    if ((m = l.match(/^(#{1,4}) (.+)$/))) { flush(); blocks.push({ type: "h" + m[1].length, text: m[2] }); continue; }
    if ((m = l.match(/^<!--\s*([\w:-]+)\s*(.*?)\s*-->$/))) { flush(); blocks.push({ type: "directive", name: m[1], args: m[2] }); continue; }
    if (l.startsWith("<!--")) { flush(); while (i < lines.length && !lines[i].includes("-->")) i++; continue; } // comments for editors
    if (l.startsWith("|")) {
      flush();
      const rows = [];
      while (i < lines.length && lines[i].startsWith("|")) { rows.push(lines[i]); i++; }
      i--;
      const cells = (r) => r.replace(/^\||\|$/g, "").split(/(?<!\\)\|/).map((c) => c.trim().replace(/\\\|/g, "|"));
      blocks.push({ type: "table", head: cells(rows[0]), rows: rows.slice(2).map(cells) });
      continue;
    }
    if (/^\d+\. /.test(l)) {
      flush();
      const items = [];
      while (i < lines.length && /^(\d+\. |\s{2,}\S)/.test(lines[i])) {
        const line = lines[i];
        if (/^\d+\. /.test(line)) items.push({ text: line.replace(/^\d+\. /, ""), sub: [] });
        else if (/^\s{2,}- /.test(line)) items[items.length - 1].sub.push(line.trim().slice(2));
        else { const it = items[items.length - 1]; if (it.sub.length) it.sub[it.sub.length - 1] += " " + line.trim(); else it.text += " " + line.trim(); }
        i++;
      }
      i--;
      blocks.push({ type: "ol", items });
      continue;
    }
    if (/^- /.test(l)) {
      flush();
      const items = [];
      while (i < lines.length && /^(- |  \S)/.test(lines[i])) {
        if (lines[i].startsWith("- ")) items.push(lines[i].slice(2)); else items[items.length - 1] += " " + lines[i].trim();
        i++;
      }
      i--;
      blocks.push({ type: "ul", items });
      continue;
    }
    if (l.startsWith("> ")) { flush(); blocks.push({ type: "quote", text: l.slice(2) }); continue; }
    para.push(l.trim());
  }
  flush();
  return { front, blocks };
}

/** Rows of every table, each with the section and sub-heading it sits under. */
export function tables(doc) {
  const out = [];
  let h2 = "", h3 = "";
  for (const b of doc.blocks) {
    if (b.type === "h2") { h2 = b.text; h3 = ""; }
    if (b.type === "h3") h3 = b.text;
    if (b.type === "table") out.push({ section: h2, sub: h3, head: b.head, rows: b.rows.map((r) => Object.fromEntries(b.head.map((h, i) => [h, r[i] ?? ""]))) });
  }
  return out;
}

// ---- Inline ----------------------------------------------------------------------------------------------------------
/** Every ID shape the registry can hold. Only IDs the registry knows become links. */
export const ID_RE = /\b((?:WEB|GS|PORTAL|STAFF|CMS|INT|SEC|NFR|DS)-\d{3}|F-\d{2}|TG-\d+|Q-\d+|BO-\d+|RSK-\d{3}|R-\d{3}|DEC-\d{3}|D-\d{3}|US-\d{3,4}|P-[A-Z]{3}|E\d{1,2}|[AC]\d{1,2}[a-z]?)\b/g;
const ANY_ID = new RegExp(`(<a [^>]*>.*?<\\/a>)|${ID_RE.source}`, "g");
export const idsIn = (text) => [...new Set([...(text ?? "").matchAll(ID_RE)].map((m) => m[1]))];
/** Expands "WEB-004 to WEB-007" and "WEB-004 to 007" into every ID in the range, plus every single ID mentioned. */
export const expandIds = (text) => {
  const out = new Set();
  for (const m of (text ?? "").matchAll(/\b([A-Z]+)-(\d+) to (?:\1-)?(\d+)\b/g)) for (let i = +m[2]; i <= +m[3]; i++) out.add(`${m[1]}-${String(i).padStart(m[2].length, "0")}`);
  for (const id of idsIn(text)) out.add(id);
  return [...out];
};
export function inline(text, ctx = {}) {
  const vars = ctx.vars ?? {};
  text = String(text ?? "").replace(/\{\{([\w.-]+)\}\}/g, (_, k) => {
    if (!(k in vars)) throw new Error(`Unknown value {{${k}}} in ${ctx.file ?? "page"}`);
    return String(vars[k]);
  });
  return text.split(/(`[^`]+`)/).map((part) => {
    if (part.startsWith("`") && part.endsWith("`") && part.length > 1) {
      const code = part.slice(1, -1);
      const table = REG.get(code);
      if (table?.kind === "Table") { const h = hrefFor(code); if (h) return `<code><a class="ref" data-id="${esc(code)}" href="${h.href}"${extAttr(h)}>${esc(code)}</a></code>`; }
      const file = code.replace(/^\//, "");
      const href = ctx.codeLinks !== false && /^[\w./()[\]@-]+\.(?:tsx?|mjs|js|sql|ya?ml|json|md|css|sh)$/.test(file) && fs.existsSync(root + file) ? `${REPO}/blob/main/${file}` : null;
      return href ? `<a class="code" href="${href}" target="_blank" rel="noopener"><code>${esc(code)}</code></a>` : `<code>${esc(code)}</code>`;
    }
    let s = esc(part);
    s = s.replace(/\[([^\]]+)\]\(((?:https?:|#)[^)\s]+)\)/g, (_, t, u) => `<a href="${u}"${u.startsWith("#") ? "" : ' target="_blank" rel="noopener"'}>${t}</a>`);
    s = s.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
    s = s.replace(/(^|[\s(“"])\*([^*\s][^*]*?)\*(?=[\s.,;:)”"]|$)/g, "$1<em>$2</em>");
    s = s.replace(/(^|[\s(])_([^_\s][^_]*?)_(?=[\s.,;:)]|$)/g, "$1<em>$2</em>");
    s = s.replace(/(^|[\s(])#(\d{1,4})\b/g, `$1<a href="${REPO}/pull/$2" target="_blank" rel="noopener">#$2</a>`);
    s = s.replace(ANY_ID, (m, a, id) => (a ? a : id === ctx.self || !REG.has(id) ? m : ref(id)));
    return s;
  }).join("");
}

// ---- Tables ----------------------------------------------------------------------------------------------------------
export const statusOf = (s) => (String(s ?? "").match(/^\s*(Verified|Built|Partial|Planned|Deferred)/i)?.[1] ?? "").toLowerCase();
/** A status cell such as "Partial: footer facts (A6)" → the pill and the reason under it. */
export function statusCell(value, ctx) {
  const st = statusOf(value);
  if (!st) return inline(value, ctx);
  const word = value.match(/^\s*(\w+)/)[1];
  const qual = value.match(/^\s*\w+\s*\(([^)]*)\)/)?.[1] ?? "";
  const rest = value.replace(/^\s*\w+(\s*\([^)]*\))?\s*:?\s*/, "");
  return `${pill(st, word, qual ? ` <small>${esc(qual)}</small>` : "")}${rest ? `<span class="why">${inline(rest, ctx)}</span>` : ""}`;
}
function cell(head, value, ctx) {
  const h = head.toLowerCase();
  const label = ` data-label="${esc(head)}"`;
  if (h === "id") return `<td${label} class="nowrap">${REG.has(value) ? `<span class="id">${esc(value)}</span>` : `<span class="id">${esc(value)}</span>`}</td>`;
  if (h === "status" && statusOf(value)) return `<td${label}>${statusCell(value, ctx)}</td>`;
  if (h === "priority" && /^(Must|Should|Could|Won't)$/.test(value)) return `<td${label}><span class="pr${value === "Must" ? " must" : ""}">${value}</span></td>`;
  const narrow = /^(phase|priority|checks|verified by|decided in|when|date|version|type|null|default|rls|kind|prefix|size|effort)$/.test(h);
  return `<td${label}${narrow ? ' class="nowrap"' : ""}>${inline(value, ctx)}</td>`;
}
export function table(head, rows, ctx = {}, opts = {}) {
  const idCol = head.findIndex((h) => h.toLowerCase() === "id");
  return `<div class="table-wrap${opts.wrap ? " " + opts.wrap : ""}"><table class="md${opts.cls ? " " + opts.cls : ""}"><thead><tr>${head.map((h) => `<th scope="col">${esc(h)}</th>`).join("")}</tr></thead><tbody>
${rows.map((r) => {
    const id = idCol >= 0 ? r[idCol] : "";
    const rowCtx = { ...ctx, self: id };
    const cells = head.map((h, i) => cell(h, r[i] ?? "", rowCtx));
    if (idCol === 0 && cells[1]) cells[1] = cells[1].replace(/^<td([^>]*?)(?: class="([^"]*)")?>/, (m, attrs, c) => `<td${attrs} class="${c ? c + " " : ""}main">`);
    const anchor = id && /^[\w-]+$/.test(id) ? (REG.get(id)?.page === HERE ? REG.get(id).anchor : id.toLowerCase()) : "";
    return `<tr${anchor && !opts.noAnchors ? ` id="${anchor}"` : ""}>${cells.join("")}</tr>`;
  }).join("\n")}</tbody></table></div>`;
}

// ---- Components --------------------------------------------------------------------------------------------------------
/** A section with its heading bar; `tools` sits at the right of the heading. */
export const section = (id, title, body, opts = {}) =>
  `<section class="sec" id="${id}">${opts.anchors ?? ""}<div class="sec-head"><h2>${title}</h2>${opts.tools ? `<span class="tools">${opts.tools}</span>` : ""}</div>${opts.note ? `<p class="sec-note">${opts.note}</p>` : ""}${body}</section>`;
export const expandButton = (scopeId) => `<button type="button" class="btn" data-expand="${scopeId}" aria-pressed="false">Expand all</button>`;
/**
 * A filter bar: a search box and chip groups. facets: [{ key, label, values: [{ value, label, count, status }] }].
 * Items it filters carry data-item, data-search (optional) and data-f-<key>="v1 v2".
 */
export function filters({ noun, placeholder, facets = [], total }) {
  const fid = `q-${Math.random().toString(36).slice(2, 8)}`;
  return `<div class="filters" data-noun="${esc(noun)}">
<div class="filter-top"><label class="search" for="${fid}">${icon("search")}<span class="sr">Search ${esc(noun)}</span><input id="${fid}" type="search" placeholder="${esc(placeholder ?? "Search")}" autocomplete="off"><kbd>/</kbd></label>${facets.length ? `<button type="button" class="btn facet-toggle" aria-expanded="false">${icon("filter")}Filters<span class="n" hidden></span></button>` : ""}</div>
${facets.length ? `<div class="facets">${facets.map((f) => `<div class="facet" role="group" aria-label="${esc(f.label)}"><span class="facet-l">${esc(f.label)}</span>${f.values.filter((v) => v.count !== 0).map((v) => `<button type="button" class="chip" data-facet="${f.key}" data-value="${esc(v.value)}" aria-pressed="false">${v.status && STATUS[v.status] ? icon(STATUS[v.status][2]) : ""}${esc(v.label)}${v.count != null ? `<span class="n">${v.count}</span>` : ""}</button>`).join("")}</div>`).join("")}</div>` : ""}
<p class="count"><span class="count-text" aria-live="polite"></span><span class="temp-filter" hidden></span><button type="button" class="reset" hidden>Clear filters</button></p>
</div><p class="empty" data-empty hidden>Nothing matches. Clear the filters to see all ${total ?? ""} ${esc(noun)}.</p>`;
}
/** Facet values with counts, from a list of items and a function giving each item's value(s). */
export function facet(key, label, items, valueOf, order, labelOf = (v) => v, statusOf_ = null) {
  const counts = new Map();
  for (const it of items) for (const v of [valueOf(it)].flat().filter(Boolean)) counts.set(v, (counts.get(v) ?? 0) + 1);
  const values = (order ?? [...counts.keys()].sort()).filter((v) => counts.has(v)).map((v) => ({ value: v, label: labelOf(v), count: counts.get(v), status: statusOf_ ? statusOf_(v) : null }));
  return { key, label, values };
}
/**
 * An expandable row. id → anchor; title (HTML); facts: HTML pieces under the title; side: HTML (a pill); body: HTML;
 * data: { key: value } written as data-f-<key>; search: extra text to match.
 */
const inert = (html) => html.replace(/<a ([^>]*?)>/g, (m, at) => `<span ${at.replace(/\s(?:href|target|rel)="[^"]*"/g, "")}>`).replace(/<\/a>/g, "</span>");
export function row({ id, anchor, title, long = false, facts = [], side = "", body = "", data = {}, search = "", item = true }) {
  // Inside a <summary> a link would be a control nested in a control (WCAG 4.1.2), so IDs there are plain text with a
  // hover card; the open row lists them again as links.
  if (body) { title = inert(title); facts = facts.map((f) => inert(f ?? "")); }
  const attrs = Object.entries(data).map(([k, v]) => ` data-f-${k}="${esc([v].flat().filter(Boolean).join(" "))}"`).join("");
  const sum = `<span class="id">${esc(id)}</span><span class="what"><span class="title${long ? " long" : ""}">${title}</span>${facts.length ? `<span class="facts">${facts.filter(Boolean).map((f) => `<span>${f}</span>`).join("")}</span>` : ""}</span><span class="side">${side}${body ? `<svg class="i chev" aria-hidden="true"><use href="#i-chev"/></svg>` : ""}</span>`;
  const common = `${anchor ? ` id="${anchor}"` : ""}${item ? " data-item" : ""}${attrs}${search ? ` data-search="${esc(search)}"` : ""}`;
  return body ? `<details class="row"${common}><summary>${sum}</summary><div class="row-body">${body}</div></details>` : `<div class="row row-static"${common}>${sum}</div>`;
}
/** A definition list for a row's detail; pairs with an empty value are left out. */
export const kv = (pairs) => {
  const p = pairs.filter(([, v]) => v && v !== '<span class="none">—</span>');
  return p.length ? `<dl class="kv">${p.map(([k, v]) => `<dt>${esc(k)}</dt><dd>${v}</dd>`).join("")}</dl>` : "";
};
/** A stacked bar of statuses: parts = [[status, n]]. */
export function stack(parts, label, small = false) {
  const total = parts.reduce((s, [, n]) => s + n, 0);
  if (!total) return `<span class="stack${small ? " small" : ""}" role="img" aria-label="${esc(label)}: none"></span>`;
  return `<span class="stack${small ? " small" : ""}" role="img" aria-label="${esc(label)}">${parts.filter(([, n]) => n).map(([st, n]) => `<span class="seg ${stCls(st)}" style="flex-grow:${n}" title="${n} ${esc(stLabel(st))}"></span>`).join("")}</span>`;
}
export const legend = (keys, lead = "") => `<div class="legend">${lead ? `<p>${lead}</p>` : ""}<p class="tags">${keys.map((k) => pill(k)).join("")}</p></div>`;

/** Renders a parsed doc's body into sections; returns the HTML and the ## sections for the contents rail. */
export function render(doc, ctx) {
  const sections = [];
  let html = "", open = false;
  const h3s = new Set();
  for (const b of doc.blocks) {
    if (b.type === "h1") continue;
    if (b.type === "h2") {
      if (open) html += "</section>\n";
      const [title, sub] = b.text.split(/\s+\|\s+/);
      const id = slug(title);
      sections.push({ id, title: title.replace(/`/g, ""), children: [] });
      html += `<section class="sec" id="${id}"><div class="sec-head"><h2>${inline(title, ctx)}</h2></div>${sub ? `<p class="sec-note">${inline(sub, ctx)}</p>` : ""}\n`;
      open = true;
      continue;
    }
    if (b.type === "h3" || b.type === "h4") {
      let id = slug(b.text); while (h3s.has(id) || sections.some((s) => s.id === id)) id += "-2"; h3s.add(id);
      if (b.type === "h3") sections.at(-1)?.children.push({ id, title: b.text.replace(/`/g, "") });
      html += `<${b.type} id="${id}" class="sub-h">${inline(b.text, ctx)}</${b.type}>\n`;
      continue;
    }
    if (b.type === "p") {
      const note = /^_.*_$/.test(b.text);
      html += `<p class="${note ? "note " : ""}para">${inline(note ? b.text.slice(1, -1) : b.text, ctx)}</p>\n`;
      continue;
    }
    if (b.type === "quote") { html += `<blockquote>${inline(b.text, ctx)}</blockquote>\n`; continue; }
    if (b.type === "ul") { html += `<ul class="bullets">${b.items.map((it) => `<li>${inline(it, ctx)}</li>`).join("")}</ul>\n`; continue; }
    if (b.type === "ol") {
      html += `<ol class="bullets steps">${b.items.map((it) => `<li>${inline(it.text, ctx)}${it.sub.length ? `<ul>${it.sub.map((x) => `<li>${inline(x, ctx)}</li>`).join("")}</ul>` : ""}</li>`).join("")}</ol>\n`;
      continue;
    }
    if (b.type === "table") { html += (ctx.tableHook?.(b, sections.at(-1), sections.at(-1)?.children.at(-1)) ?? table(b.head, b.rows, ctx)) + "\n"; continue; }
    if (b.type === "directive") {
      const fn = ctx.directives?.[b.name];
      if (!fn) throw new Error(`Unknown directive <!-- ${b.name} --> in ${ctx.file}`);
      html += fn(b.args, { ...ctx, section: sections.at(-1)?.title ?? "" }) + "\n";
    }
  }
  if (open) html += "</section>\n";
  return { html, sections };
}

// ---- Drawing helpers (diagrams are plain SVG styled by the page's tokens) -------------------------------------------
// A diagram whose boxes are links is a group of links, not a single image (role="img" would hide them).
export const svg = (w, h, label, body) => `<svg viewBox="0 0 ${w} ${h}" role="${/<a /.test(body) ? "group" : "img"}" aria-label="${esc(label)}" style="min-width:${Math.min(w, 680)}px">
<defs><marker id="ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" class="arrowhead"/></marker></defs>
${body}</svg>`;
/** A box with a bold name and up to a few quiet lines under it. */
export function box(x, y, w, h, name, lines = [], opts = {}) {
  const cx = x + w / 2;
  const top = y + h / 2 - ((lines.length + 1) * 15) / 2 + 11;
  return `<g class="${opts.cls ?? ""}"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="8" class="node${opts.accent ? " accent" : ""}${opts.muted ? " muted" : ""}"/>
<text x="${cx}" y="${top}" text-anchor="middle" class="t-name">${esc(name)}</text>${lines.map((l, i) => `<text x="${cx}" y="${top + 15 * (i + 1)}" text-anchor="middle" class="t-quiet">${esc(l)}</text>`).join("")}</g>`;
}
export const zone = (x, y, w, h, label) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="12" class="zone"/><text x="${x + 14}" y="${y + 20}" class="t-zone">${esc(label.toUpperCase())}</text>`;
export function arrow(pts, label, opts = {}) {
  const d = pts.map(([x, y], i) => `${i ? "L" : "M"}${x},${y}`).join(" ");
  const [lx, ly] = opts.at ?? [(pts[0][0] + pts.at(-1)[0]) / 2, (pts[0][1] + pts.at(-1)[1]) / 2 - 6];
  return `<path d="${d}" class="edge${opts.dashed ? " dashed" : ""}" marker-end="${opts.none ? "" : "url(#ah)"}"${opts.both ? ' marker-start="url(#ah)"' : ""}/>${label ? `<text x="${lx}" y="${ly}" text-anchor="${opts.anchor ?? "middle"}" class="t-edge">${esc(label)}</text>` : ""}`;
}
export const figure = (svgHtml, caption) => `<figure class="chart"><div class="scroll" tabindex="0" role="region" aria-label="Diagram; scroll sideways on small screens">${svgHtml}</div>${caption ? `<figcaption>${caption}</figcaption>` : ""}</figure>`;

// ---- Page ------------------------------------------------------------------------------------------------------------
const LOGO = `data:image/svg+xml;base64,${fs.readFileSync(root + "public/brand/logo-horizontal-compact-white.svg").toString("base64")}`;
const SCRIPT = fs.readFileSync(new URL("./client.js", import.meta.url), "utf8");
const tocList = (sections) => `<ol>${sections.map((s) => `<li><a href="#${s.id}">${esc(s.title)}</a>${s.children?.length ? `<ol>${s.children.map((c) => `<li><a href="#${c.id}">${esc(c.title)}</a></li>`).join("")}</ol>` : ""}</li>`).join("")}</ol>`;

/**
 * The page shell. o: { key, title, eyebrow, heading, file, version, commit, date, lede (HTML), stats: [{ n, label, small,
 * tone }], latest: { label, html }, sections, body, key: statuses shown in the rail's key, foot (HTML) }.
 */
export function page(o) {
  const L = links();
  const nav = PAGES.filter(([k]) => k === o.key || L[k]).map(([k, t]) => {
    const no = String(PAGES.findIndex(([x]) => x === k) + 1).padStart(2, "0");
    return k === o.key ? `<li><a href="#top" aria-current="page"><span class="no">${no}</span>${t}</a></li>` : `<li><a href="${L[k]}#top" target="_blank" rel="noopener"><span class="no">${no}</span>${t}</a></li>`;
  }).join("");
  const commit = o.commit ?? sha();
  const meta = `Generated from <a class="code" href="${REPO}/blob/${esc(commit)}/${o.file}" target="_blank" rel="noopener"><code>${esc(o.file.replace(/^docs\//, ""))}</code></a>${o.version ? ` v${esc(o.version)}` : ""} at <a href="${REPO}/commit/${esc(commit)}" target="_blank" rel="noopener"><code>${esc(commit)}</code></a> · ${esc(fmtDate(o.date ?? today()))}${o.metaExtra ? ` · ${o.metaExtra}` : ""}`;
  const keyRail = o.statusKey?.length ? `<div class="key"><p class="eyebrow">Status key</p>${o.statusKey.map((k) => pill(k)).join("")}</div>` : "";
  const statuses = JSON.stringify(Object.fromEntries(Object.entries(STATUS).map(([k, [l, c]]) => [k, [l, c]])));
  // A fragment, not a whole document: the artifact host wraps the page in its own document skeleton.
  return `<title>${esc(o.title)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&family=Spectral:ital,wght@0,400;1,400&family=IBM+Plex+Mono:wght@400;500;600&display=swap">
<style>${CSS}${o.css ?? ""}</style>
${SPRITE}
<div class="page" id="top">
<header class="mast">
  <a class="brand" href="${L.architecture ? `${L.architecture}#top` : "#top"}"${L.architecture && o.key !== "architecture" ? ' target="_blank" rel="noopener"' : ""}><img src="${LOGO}" alt="TAB Human Performance Center" width="143" height="28"><span class="brand-sub">Build docs</span></a>
  <nav aria-label="Build documents"><ul>${nav}</ul></nav>
</header>
<header class="hero">
  <p class="eyebrow">${esc(o.eyebrow)}</p>
  <h1>${esc(o.heading)}</h1>
  <p class="meta">${meta}</p>
  ${o.lede ? `<p class="lede">${o.lede}</p>` : ""}
  ${o.stats?.length ? `<dl class="stats">${o.stats.map((s) => `<div class="stat${s.tone ? " " + s.tone : ""}"><dt>${esc(s.label)}</dt><dd>${s.n}${s.small ? ` <small>${esc(s.small)}</small>` : ""}</dd></div>`).join("")}</dl>` : ""}
  ${o.latest ? `<aside class="latest" aria-label="Latest change"><p class="eyebrow">${esc(o.latest.label)}</p><p>${o.latest.html}</p></aside>` : ""}
</header>
<details class="toc-m"><summary>Contents</summary><nav aria-label="Contents">${tocList(o.sections)}</nav></details>
<div class="layout">
  <aside class="toc"><nav aria-label="Contents"><p class="eyebrow">On this page</p>${tocList(o.sections)}${keyRail}</nav></aside>
  <main>
${o.body}
<footer class="foot">${o.foot ?? ""}<p>Every ID links to its home page; hover or focus one to see its title and status. Press <kbd>/</kbd> to search a list.</p></footer>
  </main>
</div>
</div>
<script type="application/json" id="tab-index">${indexJson()}</script>
<script type="application/json" id="tab-statuses">${statuses}</script>
<script>${SCRIPT}</script>
`;
}

export function write(out, html, summary) {
  fs.writeFileSync(out, html);
  console.log(`${summary} → ${out} (${Math.round(html.length / 1024)} KB)`);
}
