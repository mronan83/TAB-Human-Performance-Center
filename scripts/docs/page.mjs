/**
 * Shared renderer for the living documentation pages (traceability, technical architecture, data model, content guide).
 * Each page has a Markdown source in docs/ that is the only place its written content is edited; this module turns
 * that source into one self-contained HTML page in TAB Human Performance Center's design tokens (app/globals.css).
 *
 * Markdown supported: front matter (key: value between --- lines), ## sections (become the contents rail), ### headings,
 * paragraphs, "- " lists, "1. " numbered steps (with "   - " sub-points), tables, and directives on a line of their own: <!-- name args -->, which the page script
 * expands (diagrams, charts, generated inventories). {{name}} in text is replaced by a value the page computes, so a
 * count in a sentence can never disagree with the tables it counts; an unknown name fails the build.
 *
 * Tables: a column headed ID marks its cells as anchors (#WEB-001); Status, Priority and Severity cells become pills.
 */
import fs from "node:fs";
import { execSync } from "node:child_process";

export const REPO = "https://github.com/mronan83/TAB-Wellness-Collective";
export const root = new URL("../../", import.meta.url).pathname;
export const read = (p) => fs.readFileSync(root + p, "utf8");
export const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
export const slug = (s) => s.toLowerCase().replace(/<[^>]+>|`/g, "").replace(/&[a-z]+;/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
export const sha = () => { try { return execSync("git rev-parse --short HEAD", { cwd: root }).toString().trim(); } catch { return "unknown"; } };
export const args = () => Object.fromEntries(process.argv.slice(2).reduce((acc, a, i, all) => (a.startsWith("--") ? [...acc, [a.slice(2), all[i + 1] && !all[i + 1].startsWith("--") ? all[i + 1] : true]] : acc), []));

/** The published pages link to each other; their addresses live in docs/living-docs.json. */
export const links = () => { try { return JSON.parse(read("docs/living-docs.json")); } catch { return {}; } };

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
    if ((m = l.match(/^(#{1,3}) (.+)$/))) { flush(); blocks.push({ type: "h" + m[1].length, text: m[2] }); continue; }
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
      // Numbered steps; "   - " lines under a step become its sub-points.
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
export const ID_RE = /\b((?:WEB|GS|PORTAL|STAFF|CMS|INT|SEC|NFR|DS)-\d{3}|F-\d{2}|TG-\d+|Q-\d+|BO-\d+)\b/g;
export function inline(text, ctx = {}) {
  const vars = ctx.vars ?? {};
  text = text.replace(/\{\{([\w.-]+)\}\}/g, (_, k) => {
    if (!(k in vars)) throw new Error(`Unknown value {{${k}}} in ${ctx.file ?? "page"}`);
    return String(vars[k]);
  });
  return text.split(/(`[^`]+`)/).map((part) => {
    if (part.startsWith("`") && part.endsWith("`") && part.length > 1) {
      const code = part.slice(1, -1);
      const href = ctx.codeLinks && /^[\w./()[\]-]+\.(?:tsx?|mjs|js|sql|ya?ml|json|md|css)$/.test(code) && fs.existsSync(root + code.replace(/^\//, ""))
        ? `${REPO}/blob/main/${code}` : null;
      return href ? `<a class="code" href="${href}" target="_blank" rel="noopener"><code>${esc(code)}</code></a>` : `<code>${esc(code)}</code>`;
    }
    let s = esc(part);
    s = s.replace(/\[([^\]]+)\]\(((?:https?:|#)[^)\s]+)\)/g, (_, t, u) => `<a href="${u}"${u.startsWith("#") ? "" : ' target="_blank" rel="noopener"'}>${t}</a>`);
    s = s.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
    s = s.replace(/(^|[\s(])\*([^*\s][^*]*?)\*(?=[\s.,;:)]|$)/g, "$1<em>$2</em>");
    s = s.replace(/(^|[\s(])#(\d{1,4})\b/g, `$1<a href="${REPO}/pull/$2" target="_blank" rel="noopener">#$2</a>`);
    if (ctx.anchors) s = s.replace(/(<a [^>]*>.*?<\/a>)|\b((?:WEB|GS|PORTAL|STAFF|CMS|INT|SEC|NFR|DS)-\d{3}|F-\d{2}|TG-\d+|Q-\d+|BO-\d+)\b/g,
      (m, a, id) => (a ? a : ctx.anchors.has(id) && id !== ctx.self ? `<a class="ref" href="#${id}">${id}</a>` : id));
    return s;
  }).join("");
}

// ---- Blocks ----------------------------------------------------------------------------------------------------------
const STATUS = ["verified", "built", "partial", "planned", "deferred"];
export const statusOf = (s) => (s.match(/^\s*(Verified|Built|Partial|Planned|Deferred)/i)?.[1] ?? "").toLowerCase();
function cell(head, value, ctx, row) {
  const h = head.toLowerCase();
  if (h === "id") return `<td class="id">${esc(value)}</td>`;
  if (h === "status") {
    const st = statusOf(value);
    if (!st) return `<td>${inline(value, ctx)}</td>`;
    const rest = value.replace(/^\s*\w+(\s*\([^)]*\))?\s*:?\s*/, "");
    const qual = value.match(/^\s*\w+\s*(\([^)]*\))/)?.[1] ?? "";
    return `<td class="status"><span class="pill st-${st}">${esc(value.match(/^\s*(\w+)/)[1])}${qual ? ` <small>${esc(qual.slice(1, -1))}</small>` : ""}</span>${rest ? `<span class="why">${inline(rest, ctx)}</span>` : ""}</td>`;
  }
  if (h === "priority" && /^(Must|Should|Could|Won't)$/.test(value)) return `<td><span class="pill pr-${value.toLowerCase().replace("'", "")}">${value}</span></td>`;
  if ((h === "severity" || h === "size") && /^(High|Medium|Low|S|M|L)\b/.test(value)) {
    const k = { High: "high", Medium: "medium", Low: "low", S: "low", M: "medium", L: "high" }[value.match(/^(\w+)/)[1]];
    return `<td class="nowrap"><span class="pill sv-${k}">${inline(value, ctx)}</span></td>`;
  }
  const narrow = /^(phase|priority|checks|verified by|decided in|when|date|version|type|null|default|rls|kind|prefix)$/.test(h);
  return `<td${narrow ? ' class="nowrap"' : ""}>${inline(value, ctx)}</td>`;
}
export function table(head, rows, ctx = {}, opts = {}) {
  const idCol = head.findIndex((h) => h.toLowerCase() === "id");
  const stCol = head.findIndex((h) => h.toLowerCase() === "status");
  return `<div class="table-wrap"><table${opts.cls ? ` class="${opts.cls}"` : ""}><thead><tr>${head.map((h) => `<th scope="col">${esc(h)}</th>`).join("")}</tr></thead><tbody>
${rows.map((r) => {
    const id = idCol >= 0 ? r[idCol] : "";
    const st = stCol >= 0 ? statusOf(r[stCol]) : "";
    const rowCtx = { ...ctx, self: id };
    const cells = head.map((h, i) => cell(h, r[i] ?? "", rowCtx, r));
    if (idCol === 0 && cells[1]) cells[1] = cells[1].replace(/^<td(?: class="([^"]*)")?/, (m, c) => `<td class="${c ? c + " " : ""}main"`);
    return `<tr${id && /^[\w-]+$/.test(id) ? ` id="${id}"` : ""}${st ? ` data-status="${st}"` : ""}>${cells.join("")}</tr>`;
  }).join("\n")}</tbody></table></div>`;
}

/** Renders the body; returns the HTML and the ## sections for the contents rail. */
export function render(doc, ctx) {
  const sections = [];
  let html = "", open = false, h3s = new Set();
  for (const b of doc.blocks) {
    if (b.type === "h1") continue;
    if (b.type === "h2") {
      if (open) html += "</section>\n";
      const [title, sub] = b.text.split(/\s+\|\s+/);
      const id = slug(title);
      sections.push({ id, title });
      html += `<section id="${id}" aria-labelledby="h-${id}"><h2 id="h-${id}">${inline(title, ctx)}</h2>${sub ? `<p class="sub">${inline(sub, ctx)}</p>` : ""}\n`;
      open = true;
      continue;
    }
    if (b.type === "h3") { let id = slug(b.text); while (h3s.has(id)) id += "-2"; h3s.add(id); html += `<h3 id="${id}">${inline(b.text, ctx)}</h3>\n`; continue; }
    if (b.type === "p") {
      const note = /^_.*_$/.test(b.text);
      html += `<p${note ? ' class="note"' : ""}>${inline(note ? b.text.slice(1, -1) : b.text, ctx)}</p>\n`;
      continue;
    }
    if (b.type === "ul") { html += `<ul>${b.items.map((it) => `<li>${inline(it, ctx)}</li>`).join("")}</ul>\n`; continue; }
    if (b.type === "ol") {
      html += `<ol class="steps">${b.items.map((it) => `<li>${inline(it.text, ctx)}${it.sub.length ? `<ul>${it.sub.map((x) => `<li>${inline(x, ctx)}</li>`).join("")}</ul>` : ""}</li>`).join("")}</ol>\n`;
      continue;
    }
    if (b.type === "table") { html += table(b.head, b.rows, ctx) + "\n"; continue; }
    if (b.type === "directive") {
      const fn = ctx.directives?.[b.name];
      if (!fn) throw new Error(`Unknown directive <!-- ${b.name} --> in ${ctx.file}`);
      html += fn(b.args, ctx) + "\n";
    }
  }
  if (open) html += "</section>\n";
  return { html, sections };
}

// ---- Drawing helpers (diagrams are plain SVG styled by the page's tokens) -------------------------------------------
export const svg = (w, h, label, body) => `<svg viewBox="0 0 ${w} ${h}" role="img" aria-label="${esc(label)}" style="min-width:${Math.min(w, 680)}px">
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
  return `<path d="${d}" class="edge${opts.dashed ? " dashed" : ""}" marker-end="${opts.both ? "url(#ah)" : opts.none ? "" : "url(#ah)"}"${opts.both ? ' marker-start="url(#ah)"' : ""}/>${label ? `<text x="${lx}" y="${ly}" text-anchor="${opts.anchor ?? "middle"}" class="t-edge">${esc(label)}</text>` : ""}`;
}
export const figure = (svgHtml, caption) => `<figure class="chart"><div class="scroll">${svgHtml}</div>${caption ? `<figcaption>${caption}</figcaption>` : ""}</figure>`;

// ---- Page ------------------------------------------------------------------------------------------------------------
const CSS = `
/* Layout: a contents rail beside one reading column, as in the backlog page; tables and diagrams scroll inside the column.
   Palette: TAB Design Tokens v1.0 with the D-056 contrast fixes (app/globals.css). Olive leads; Deep Terracotta marks
   what needs attention. Montserrat for headings and text, IBM Plex Mono for IDs and code. */
:root {
  --bg: #FBF6F1; --surface: #FFFFFF; --surface-2: #E8E3D9; --ink: #2E2E2E; --muted: #5A5953;
  --line: #D8D2C6; --line-strong: #ABA597; --brand: #4A5A44; --on-brand: #FBF6F1; --accent: #A75436; --accent-bg: #F5E4DB;
  --good: #46623F; --good-bg: #E2EADA; --warn: #85561B; --warn-bg: #F5E6CC; --plan: #4C5A66; --plan-bg: #E3E8EB;
  --quiet-bg: #ECE8E0; --zone: #F1ECE3;
  --seg-v: #4A5A44; --seg-b: #A7B39F; --seg-p: #D4A574; --seg-pl: #ECE8E0;
  --font-display: 'Montserrat', 'Helvetica Neue', Arial, sans-serif;
  --font-ui: 'Montserrat', 'Helvetica Neue', Arial, sans-serif;
  --font-mono: 'IBM Plex Mono', ui-monospace, Menlo, Consolas, monospace;
}
@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) {
  --bg: #1C1E1B; --surface: #252824; --surface-2: #2F332D; --ink: #EFEAE0; --muted: #B5B2A7;
  --line: #3A3E37; --line-strong: #6E6F63; --brand: #C5CBA8; --on-brand: #1C1E1B; --accent: #E8A57F; --accent-bg: #46301F;
  --good: #A9C99F; --good-bg: #2B3A28; --warn: #E2B676; --warn-bg: #3D3020; --plan: #B4C3CF; --plan-bg: #2B343B;
  --quiet-bg: #31342F; --zone: #222521;
  --seg-v: #C5CBA8; --seg-b: #7E8768; --seg-p: #8A7448; --seg-pl: #3A3E37; color-scheme: dark; } }
:root[data-theme="dark"] {
  --bg: #1C1E1B; --surface: #252824; --surface-2: #2F332D; --ink: #EFEAE0; --muted: #B5B2A7;
  --line: #3A3E37; --line-strong: #6E6F63; --brand: #C5CBA8; --on-brand: #1C1E1B; --accent: #E8A57F; --accent-bg: #46301F;
  --good: #A9C99F; --good-bg: #2B3A28; --warn: #E2B676; --warn-bg: #3D3020; --plan: #B4C3CF; --plan-bg: #2B343B;
  --quiet-bg: #31342F; --zone: #222521;
  --seg-v: #C5CBA8; --seg-b: #7E8768; --seg-p: #8A7448; --seg-pl: #3A3E37; color-scheme: dark; }
*, *::before, *::after { box-sizing: border-box; }
body { background: var(--bg); color: var(--ink); font-family: var(--font-ui); font-size: 15.5px; line-height: 1.6; -webkit-font-smoothing: antialiased; }
.page { max-width: 1240px; margin: 0 auto; padding-inline: 20px; padding-block: 36px 64px; display: grid; gap: 32px; }
a { color: var(--brand); text-underline-offset: 3px; }
a:focus-visible, button:focus-visible, input:focus-visible, select:focus-visible { outline: 3px solid var(--accent); outline-offset: 3px; border-radius: 3px; }
code { font-family: var(--font-mono); font-size: 0.82em; background: var(--surface-2); padding: 0.05em 0.35em; border-radius: 3px; overflow-wrap: anywhere; }
a.code { text-decoration: none; } a.code code { border-bottom: 1px dotted var(--line-strong); }
h1, h2, h3 { font-family: var(--font-display); font-weight: 600; color: var(--ink); text-wrap: balance; margin: 0; }
h1 { font-size: clamp(1.9rem, 4vw, 2.6rem); line-height: 1.08; letter-spacing: -0.02em; font-weight: 700; }
h2 { font-size: 1.45rem; line-height: 1.2; padding-top: 10px; font-weight: 700; letter-spacing: -0.01em; }
h3 { font-size: 1.32rem; line-height: 1.2; margin-top: 10px; }
p { margin: 0; max-width: 74ch; }
section > ul { margin: 0; padding-left: 1.2em; display: grid; gap: 6px; max-width: 78ch; }
section > ol.steps { margin: 0; padding-left: 1.4em; display: grid; gap: 10px; max-width: 78ch; }
ol.steps li::marker { font-weight: 700; color: var(--brand); }
ol.steps ul { margin: 6px 0 0; padding-left: 1.1em; display: grid; gap: 4px; }
.eyebrow { font-size: 0.74rem; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: var(--muted); margin: 0; }
.hero { display: grid; gap: 12px; }
.meta, .note, .source, .sub { color: var(--muted); font-size: 0.92rem; }
.sub { margin-top: -6px; }
.lede { font-size: 1.1rem; max-width: 72ch; }
.stats { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 6px; }
.stat { background: var(--surface); border: 1px solid var(--line); border-radius: 10px; padding: 10px 16px; display: grid; min-width: 128px; }
.stat .n { font-family: var(--font-display); font-size: 1.7rem; font-weight: 700; line-height: 1; font-variant-numeric: tabular-nums; }
.stat .n small { font-family: var(--font-ui); font-size: 0.85rem; color: var(--muted); font-weight: 600; }
.stat .l { font-size: 0.82rem; color: var(--muted); }
.siblings { display: flex; flex-wrap: wrap; gap: 6px 14px; font-size: 0.9rem; }
.siblings span { color: var(--muted); }
.layout { display: grid; grid-template-columns: 210px minmax(0, 1fr); gap: 36px; align-items: start; }
.toc { position: sticky; top: calc(env(safe-area-inset-top, 0px) + 16px); display: grid; gap: 8px; max-height: calc(100vh - 32px); overflow-y: auto; }
.toc ol { list-style: none; margin: 0; padding: 0; display: grid; gap: 2px; border-left: 2px solid var(--line); }
.toc a { display: block; padding: 3px 0 3px 12px; color: var(--ink); text-decoration: none; font-size: 0.92rem; }
.toc a:hover { color: var(--accent); }
main { display: grid; gap: 30px; min-width: 0; }
section { display: grid; gap: 14px; min-width: 0; scroll-margin-top: 80px; }
.filterbar { position: sticky; top: env(safe-area-inset-top, 0px); z-index: 2; background: var(--bg); padding-block: 10px; border-bottom: 1px solid var(--line); display: flex; flex-wrap: wrap; gap: 8px 12px; align-items: center; }
.filterbar input { flex: 1 1 240px; min-width: 0; font: inherit; font-size: 0.95rem; padding: 8px 12px; border: 1px solid var(--line-strong); border-radius: 8px; background: var(--surface); color: var(--ink); }
.chips { display: flex; flex-wrap: wrap; gap: 6px; }
.chip { font: inherit; font-size: 0.84rem; font-weight: 600; padding: 5px 12px; border-radius: 999px; border: 1px solid var(--line-strong); background: var(--surface); color: var(--ink); cursor: pointer; }
.chip[aria-pressed="true"] { background: var(--brand); color: var(--on-brand); border-color: var(--brand); }
#count { flex-basis: 100%; }
.sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
.table-wrap { overflow-x: auto; border: 1px solid var(--line); border-radius: 10px; background: var(--surface); }
table { width: 100%; border-collapse: collapse; font-size: 0.9rem; }
th, td { text-align: left; vertical-align: top; padding: 9px 12px; border-bottom: 1px solid var(--line); }
tbody tr:last-child td { border-bottom: 0; }
th { font-size: 0.7rem; font-weight: 700; letter-spacing: 0.09em; text-transform: uppercase; color: var(--muted); background: var(--surface-2); white-space: nowrap; }
td.id { font-family: var(--font-mono); font-size: 0.82rem; font-weight: 500; white-space: nowrap; color: var(--brand); }
td.nowrap { white-space: nowrap; }
td.status { min-width: 9rem; }
td.main { min-width: 15rem; }
td.status .why { display: block; margin-top: 4px; font-size: 0.84rem; color: var(--muted); }
tr[id] { scroll-margin-top: 120px; }
tr:target td { background: var(--accent-bg); }
tr[hidden] { display: none; }
a.ref { font-family: var(--font-mono); font-size: 0.86em; text-decoration: none; border-bottom: 1px dotted currentColor; white-space: nowrap; }
.pill { display: inline-block; font-size: 0.74rem; font-weight: 700; padding: 2px 9px; border-radius: 999px; letter-spacing: 0.02em; white-space: nowrap; }
.pill small { font-weight: 600; opacity: 0.85; }
.st-verified { background: var(--good-bg); color: var(--good); }
.st-built { background: var(--quiet-bg); color: var(--muted); }
.st-partial { background: var(--warn-bg); color: var(--warn); }
.st-planned { background: var(--plan-bg); color: var(--plan); }
.st-deferred { background: transparent; color: var(--muted); border: 1px dashed var(--line-strong); }
.pr-must { background: var(--brand); color: var(--on-brand); }
.pr-should { background: var(--surface-2); color: var(--ink); border: 1px solid var(--line-strong); }
.pr-could, .pr-wont { background: transparent; color: var(--muted); border: 1px solid var(--line); }
.sv-high { background: var(--accent-bg); color: var(--accent); }
.sv-medium { background: var(--warn-bg); color: var(--warn); }
.sv-low { background: var(--quiet-bg); color: var(--muted); }
.chart { margin: 0; display: grid; gap: 8px; }
.chart .scroll { overflow-x: auto; background: var(--surface); border: 1px solid var(--line); border-radius: 10px; padding: 16px; }
.chart svg { display: block; width: 100%; height: auto; font-family: var(--font-ui); }
.chart figcaption { color: var(--muted); font-size: 0.88rem; max-width: 80ch; }
.t-title { font-size: 15px; font-weight: 700; fill: var(--ink); }
.t-name { font-size: 13px; font-weight: 700; fill: var(--ink); }
.t-label { font-size: 12.5px; fill: var(--ink); }
.t-quiet { font-size: 11.5px; fill: var(--muted); }
.t-edge { font-size: 11px; fill: var(--muted); }
.t-zone { font-size: 10.5px; font-weight: 700; letter-spacing: 0.1em; fill: var(--muted); }
.t-in { font-size: 11px; font-weight: 700; fill: var(--ink); }
.t-in-on { font-size: 11px; font-weight: 700; fill: var(--on-brand); }
.node { fill: var(--surface); stroke: var(--line-strong); stroke-width: 1.2; }
.node.accent { fill: var(--accent-bg); stroke: var(--accent); stroke-width: 1.8; }
.node.muted { fill: var(--surface-2); stroke-dasharray: 4 3; }
.zone { fill: var(--zone); stroke: var(--line); }
.edge { fill: none; stroke: var(--line-strong); stroke-width: 1.4; }
.edge.dashed { stroke-dasharray: 5 4; }
.arrowhead { fill: var(--line-strong); }
.grid-line { stroke: var(--line); stroke-width: 1; }
.ref-line { stroke: var(--accent); stroke-width: 1.5; stroke-dasharray: 5 4; }
.seg-verified { fill: var(--seg-v); } .seg-built { fill: var(--seg-b); } .seg-partial { fill: var(--seg-p); }
.seg-planned { fill: var(--seg-pl); stroke: var(--line-strong); stroke-width: 1; } .seg-deferred { fill: var(--surface); stroke: var(--line-strong); stroke-dasharray: 3 2; }
.cards { display: grid; gap: 14px; }
.tcard { background: var(--surface); border: 1px solid var(--line); border-radius: 10px; display: grid; min-width: 0; scroll-margin-top: 90px; }
.tcard:target { outline: 3px solid var(--accent); outline-offset: 2px; }
.tcard > header { display: flex; flex-wrap: wrap; align-items: baseline; gap: 6px 12px; padding: 12px 14px 4px; }
.tcard > header h4 { margin: 0; font-family: var(--font-mono); font-size: 1rem; font-weight: 500; }
.tcard .what { padding: 0 14px 10px; font-size: 0.92rem; max-width: none; }
.tcard .table-wrap { border-width: 1px 0 0; border-radius: 0 0 10px 10px; }
.tcard details { border-top: 1px solid var(--line); padding: 8px 14px; font-size: 0.86rem; }
.tcard details summary { cursor: pointer; color: var(--muted); font-weight: 600; }
.tcard details ul { margin: 8px 0 0; padding-left: 1.1em; display: grid; gap: 6px; }
.badge { font-size: 0.72rem; font-weight: 700; padding: 1px 8px; border-radius: 999px; background: var(--good-bg); color: var(--good); }
.badge.off { background: var(--accent-bg); color: var(--accent); }
.badge.q { background: var(--quiet-bg); color: var(--muted); }
pre.code { margin: 0; overflow-x: auto; background: var(--surface-2); border: 1px solid var(--line); border-radius: 8px; padding: 12px 14px; font-family: var(--font-mono); font-size: 0.8rem; line-height: 1.5; white-space: pre-wrap; }
pre.code code { background: none; padding: 0; }
.foot { border-top: 1px solid var(--line); padding-top: 16px; color: var(--muted); font-size: 0.86rem; display: grid; gap: 6px; }
@media (max-width: 880px) {
  .layout { grid-template-columns: minmax(0, 1fr); }
  .toc { position: static; max-height: none; }
  .toc ol { grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); border-left: 0; }
  .toc a { padding-left: 0; }
}
@media (max-width: 560px) { .page { padding-inline: 16px; padding-block: 24px 48px; } th, td { padding: 8px 10px; } .stat { min-width: 110px; } }
@media (prefers-reduced-motion: reduce) { * { scroll-behavior: auto !important; } }
`;

const FILTER_SCRIPT = `
(() => {
  const q = document.getElementById('q'); if (!q) return;
  const chips = [...document.querySelectorAll('.chip')];
  const count = document.getElementById('count');
  const rows = [...document.querySelectorAll('main tbody tr')];
  const cards = [...document.querySelectorAll('.tcard')];
  let filter = 'all';
  function apply() {
    const term = q.value.trim().toLowerCase();
    let shown = 0, total = 0;
    for (const r of rows) {
      if (r.closest('.tcard') && cards.length) continue;
      const okText = !term || r.textContent.toLowerCase().includes(term);
      const okFilter = filter === 'all' || r.dataset.status === filter;
      const filterable = filter === 'all' || r.dataset.status;
      r.hidden = !(okText && okFilter && filterable);
      total++; if (!r.hidden) shown++;
    }
    for (const c of cards) { const ok = !term || c.dataset.search.includes(term); c.hidden = !ok; total++; if (ok) shown++; }
    count.textContent = term || filter !== 'all' ? 'Showing ' + shown + ' of ' + total + ' rows' : '';
  }
  q.addEventListener('input', apply);
  for (const c of chips) c.addEventListener('click', () => {
    filter = c.dataset.filter;
    for (const o of chips) o.setAttribute('aria-pressed', String(o === c));
    apply();
  });
})();`;

/**
 * page({ title, eyebrow, heading, meta, lede, stats: [[n, label, small?]], note, sections, body, filter: [[key,label]], foot })
 */
export function page(o) {
  const L = links();
  const sib = [["traceability", "Requirements & traceability"], ["architecture", "Technical architecture"], ["dataModel", "Data model"], ["contentGuide", "Content guide"], ["backlog", "Backlog"]]
    .filter(([k]) => L[k] && k !== o.key).map(([k, t]) => `<a href="${L[k]}" target="_blank" rel="noopener">${t}</a>`);
  return `<title>${esc(o.title)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&family=IBM+Plex+Mono:wght@400;500&display=swap">
<style>${CSS}${o.css ?? ""}</style>
<div class="page">
<header class="hero">
  <p class="eyebrow">${esc(o.eyebrow)}</p>
  <h1>${esc(o.heading)}</h1>
  <p class="meta">${o.meta}</p>
  ${o.lede ? `<p class="lede">${o.lede}</p>` : ""}
  ${o.stats?.length ? `<div class="stats">${o.stats.map(([n, l, small]) => `<div class="stat"><span class="n">${n}${small ? ` <small>${small}</small>` : ""}</span><span class="l">${esc(l)}</span></div>`).join("")}</div>` : ""}
  ${o.note ? `<p class="note">${o.note}</p>` : ""}
  ${sib.length ? `<p class="siblings"><span>Also:</span>${sib.join("")}</p>` : ""}
</header>
<div class="layout">
<nav class="toc" aria-label="Contents"><p class="eyebrow">Contents</p><ol>
${o.sections.map((s) => `<li><a href="#${s.id}">${esc(s.title.replace(/`/g, ""))}</a></li>`).join("\n")}
</ol></nav>
<main>
${o.filter ? `<div class="filterbar" role="search">
  <label for="q" class="sr">Filter</label>
  <input id="q" type="search" placeholder="${esc(o.filterPlaceholder ?? "Filter rows: an ID, a word, a file…")}" autocomplete="off">
  ${o.filter.length ? `<div class="chips" role="group" aria-label="Show rows by status">${[["all", "All"], ...o.filter].map(([k, l], i) => `<button type="button" class="chip" data-filter="${k}" aria-pressed="${i === 0}">${esc(l)}</button>`).join("")}</div>` : ""}
  <p id="count" class="note" aria-live="polite"></p>
</div>` : ""}
${o.body}
<footer class="foot">${o.foot}</footer>
</main>
</div>
</div>
${o.filter ? `<script>${FILTER_SCRIPT}</script>` : ""}
`;
}

export function write(out, html, summary) {
  fs.writeFileSync(out, html);
  console.log(`${summary} → ${out}`);
}
