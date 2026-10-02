#!/usr/bin/env node
/**
 * Renders docs/BACKLOG.md into the backlog page Claude republishes to the owner after every successful production
 * promotion (G3, CLAUDE.md "Branches and review gates"). The Markdown file stays the single place the backlog is
 * edited; this page is a view of it and keeps no history of its own (git log docs/BACKLOG.md does).
 *
 *   npm run backlog:html -- --out <file.html> [--release "<what just went live>"] [--deployment dpl_…] [--sha <commit>]
 *
 * Expects the shape docs/BACKLOG.md documents: "## P<n> · <title>" sections holding a table with the columns
 * ID | Item | Category | Owner | Effort | Blocker, then "## Notes on sequencing" (paragraphs) and "## Recently done" (bullets).
 */
import fs from "node:fs";
import { execSync } from "node:child_process";

const REPO = "https://github.com/mronan83/TAB-Wellness-Collective";
const args = Object.fromEntries(process.argv.slice(2).reduce((acc, a, i, all) => (a.startsWith("--") ? [...acc, [a.slice(2), all[i + 1]]] : acc), []));
if (!args.out) { console.error("Usage: npm run backlog:html -- --out <file.html> [--release text] [--deployment id] [--sha commit]"); process.exit(1); }
const sha = args.sha ?? execSync("git rev-parse --short HEAD").toString().trim();

const src = fs.readFileSync(new URL("../docs/BACKLOG.md", import.meta.url), "utf8");
const lines = src.split("\n");

// ---- Parse ----------------------------------------------------------------------------------------------------------
const updated = (src.match(/^_Last updated: (.+)_$/m) ?? [])[1] ?? "";
const sections = []; // { level, title, rows }
const notes = [];
const done = [];
let current = null;
let mode = null;
for (const line of lines) {
  const h = line.match(/^## (.+)$/);
  if (h) {
    const p = h[1].match(/^(P\d) · (.+)$/);
    mode = p ? "table" : /^Notes on sequencing/.test(h[1]) ? "notes" : /^Recently done/.test(h[1]) ? "done" : null;
    if (p) sections.push((current = { level: p[1], title: p[2], rows: [] }));
    continue;
  }
  if (mode === "table" && line.startsWith("|") && !/^\|\s*(ID|---)/.test(line)) {
    const cells = line.split("|").slice(1, -1).map((c) => c.trim());
    if (cells.length < 6) throw new Error(`Backlog row needs 6 columns (ID | Item | Category | Owner | Effort | Blocker): ${line}`);
    const [id, item, category, owner, effort, blocker] = cells;
    current.rows.push({ id, item, category, owner, effort, blocker, level: current.level });
  } else if (mode === "notes" && line.trim()) notes.push(line.trim());
  else if (mode === "done" && line.startsWith("- ")) {
    const m = line.match(/^- \*\*(.+?)\*\* \(([^)]+)\): (.+)$/);
    if (m) done.push({ label: m[1], date: m[2], text: m[3] });
  }
}
const items = sections.flatMap((s) => s.rows);
const ids = new Set(items.map((r) => r.id));

// ---- Inline Markdown ------------------------------------------------------------------------------------------------
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const idLinks = (s) => s.replace(/\b([AC]\d+[a-z]?)\b/g, (m) => (ids.has(m) ? `<a class="ref" href="#item-${m}">${m}</a>` : m));
function md(text) {
  return text.split(/(`[^`]+`)/).map((part) => {
    if (part.startsWith("`") && part.endsWith("`")) return `<code>${esc(part.slice(1, -1))}</code>`;
    let s = esc(part);
    s = s.replace(/\[([^\]]+)\]\((https?:[^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
    s = s.replace(/\[([^\]]+)\]/g, '<span class="reg" title="Requirements register">$1</span>');
    s = s.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
    s = s.replace(/(^|[\s(])#(\d+)\b/g, `$1<a href="${REPO}/pull/$2" target="_blank" rel="noopener">#$2</a>`);
    return idLinks(s);
  }).join("");
}

// ---- Derived ---------------------------------------------------------------------------------------------------------
const who = (owner) => (/Claude/.test(owner) && /Owner/.test(owner) ? "both" : /^Owner/.test(owner) ? "owner" : "claude");
const ready = (r) => /^none$/i.test(r.blocker);
const effortKey = (e) => (e.includes("L") ? "L" : e.includes("M") ? "M" : "S");
const count = (f) => items.filter(f).length;
const stats = [
  [items.length, "open items"],
  [count((r) => who(r.owner) !== "claude"), "yours (A)"],
  [count((r) => who(r.owner) !== "owner"), "Claude's (C)"],
  [count(ready), "can start now"],
  [count((r) => !ready(r)), "waiting on something"],
];
const levels = sections.map((s) => s.level);
const LEVEL_HINT = { P0: "now", P1: "public launch", P2: "My TAB go-live", P3: "later" };
const EFFORT = [["S", "hours"], ["M", "about a day"], ["L", "days, or waiting on others"]];

const chip = (r) => {
  const tip = `${r.id} ${r.item.replace(/\[[^\]]*\]|`|\*\*/g, "").slice(0, 110)} · ${r.owner}${ready(r) ? "" : ` · waiting on ${r.blocker}`}`;
  return `<a class="mx-chip w-${who(r.owner)}${ready(r) ? "" : " blocked"}" href="#item-${r.id}" title="${esc(tip)}">${r.id}</a>`;
};
const matrix = `<figure class="matrix"><div class="mx" role="table" aria-label="Open items by priority and effort">
<div class="mx-corner" role="presentation"></div>${EFFORT.map(([k, d]) => `<div class="mx-col" role="columnheader"><b>${k}</b> <span>${d}</span></div>`).join("")}
${levels.map((lv) => `<div class="mx-row-h" role="rowheader"><b>${lv}</b> <span>${LEVEL_HINT[lv] ?? ""}</span></div>${EFFORT.map(([k]) => {
  const cell = items.filter((r) => r.level === lv && effortKey(r.effort) === k);
  return `<div class="mx-cell" role="cell" aria-label="${lv}, effort ${k}: ${cell.length} item${cell.length === 1 ? "" : "s"}">${cell.map(chip).join("") || '<span class="mx-empty" aria-hidden="true">·</span>'}</div>`;
}).join("")}`).join("\n")}
</div><figcaption><span class="key"><i class="mx-chip w-owner"></i>Yours</span><span class="key"><i class="mx-chip w-claude"></i>Claude's</span><span class="key"><i class="mx-chip w-both"></i>Shared</span><span class="key"><i class="mx-chip blocked"></i>Dashed: waiting on something</span><span>Each ID links to its item.</span></figcaption></figure>`;

const OWNER_LABEL = { owner: "Yours", claude: "Claude", both: "Shared" };
const row = (r) => `<tr id="item-${r.id}" data-priority="${r.level}" data-who="${who(r.owner)}" data-ready="${ready(r)}">
<td class="num">${r.id}</td>
<td class="item"><p class="item-text">${md(r.item)}</p><span class="type">${esc(r.category)}</span></td>
<td data-label="Who"><span class="pill w-${who(r.owner)}">${OWNER_LABEL[who(r.owner)]}</span>${r.owner !== "Owner" && r.owner !== "Claude" ? `<span class="sub">${esc(r.owner)}</span>` : ""}</td>
<td data-label="Effort" class="effort">${esc(r.effort)}</td>
<td data-label="Blocker" class="blocker${ready(r) ? " ready" : ""}">${ready(r) ? "None" : md(r.blocker)}</td></tr>`;

const sectionHtml = sections.map((s) => `<section id="${s.level.toLowerCase()}" class="level" aria-labelledby="h-${s.level}">
<h2 id="h-${s.level}"><span class="lv">${s.level}</span> ${md(s.title)} <span class="n-items">${s.rows.length}</span></h2>
<div class="table-wrap"><table class="backlog"><thead><tr><th scope="col">ID</th><th scope="col">Item</th><th scope="col">Who</th><th scope="col">Effort</th><th scope="col">Blocker</th></tr></thead>
<tbody>${s.rows.map(row).join("\n")}</tbody></table></div></section>`).join("\n");

const doneHtml = done.map((d) => {
  const pr = d.label.match(/^#(\d+)$/);
  const label = pr ? `<a href="${REPO}/pull/${pr[1]}" target="_blank" rel="noopener">#${pr[1]}</a>` : esc(d.label);
  return `<li><span class="done-label">${label}</span><span class="done-date">${esc(d.date)}</span><p>${md(d.text)}</p></li>`;
}).join("\n");

const release = args.release
  ? `<div class="release" role="status"><p class="eyebrow">This release</p><p>${md(args.release)}</p>${args.deployment ? `<p class="note">Live at <code>tab-wellness-collective.vercel.app</code> · deployment <code>${esc(args.deployment)}</code></p>` : ""}</div>`
  : "";

// ---- Page -------------------------------------------------------------------------------------------------------------
const html = `<title>TAB Wellness Collective Backlog</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600&family=Manrope:wght@400;600;700&family=IBM+Plex+Mono:wght@500&display=swap">
<style>
/* Layout: a contents rail beside one reading column; the priority-by-effort grid first, then one table per priority.
   Palette: TAB Design Tokens v1.0 (app/globals.css). Yours = Deep Terracotta, Claude's = Olive. */
:root {
  --bg: #F8F5EF; --surface: #FFFFFF; --surface-2: #EDE7DC; --ink: #252724; --muted: #575B53;
  --line: #DCD4C6; --line-strong: #A99D8C; --brand: #5A6046; --on-brand: #F8F5EF; --focus: #A65E39;
  --owner: #A65E39; --owner-bg: #F1DED2; --claude: #5A6046; --claude-bg: #E4E7D9; --both: #575B53; --both-bg: #EDE7DC;
  --good: #4F6B4A; --good-bg: #E4EBDD; --warn: #96672E;
  --font-display: 'Cormorant Garamond', Georgia, 'Times New Roman', serif;
  --font-ui: 'Manrope', 'Helvetica Neue', Arial, sans-serif;
  --font-mono: 'IBM Plex Mono', ui-monospace, Menlo, Consolas, monospace;
}
@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) {
  --bg: #1C1E1B; --surface: #252824; --surface-2: #2F332D; --ink: #EFEAE0; --muted: #B5B2A7;
  --line: #3A3E37; --line-strong: #6E6F63; --brand: #C5CBA8; --on-brand: #1C1E1B; --focus: #E8A57F;
  --owner: #E8A57F; --owner-bg: #46301F; --claude: #C5CBA8; --claude-bg: #343A2B; --both: #CFCBC0; --both-bg: #33362F;
  --good: #A9C99F; --good-bg: #2B3A28; --warn: #E2B676; color-scheme: dark; } }
:root[data-theme="dark"] {
  --bg: #1C1E1B; --surface: #252824; --surface-2: #2F332D; --ink: #EFEAE0; --muted: #B5B2A7;
  --line: #3A3E37; --line-strong: #6E6F63; --brand: #C5CBA8; --on-brand: #1C1E1B; --focus: #E8A57F;
  --owner: #E8A57F; --owner-bg: #46301F; --claude: #C5CBA8; --claude-bg: #343A2B; --both: #CFCBC0; --both-bg: #33362F;
  --good: #A9C99F; --good-bg: #2B3A28; --warn: #E2B676; color-scheme: dark; }
*, *::before, *::after { box-sizing: border-box; }
body { background: var(--bg); color: var(--ink); font-family: var(--font-ui); font-size: 15.5px; line-height: 1.55; -webkit-font-smoothing: antialiased; }
.page { max-width: 1220px; margin: 0 auto; padding-inline: 20px; padding-block: 36px 64px; display: grid; gap: 32px; }
a { color: var(--brand); text-underline-offset: 3px; }
a:focus-visible, button:focus-visible, input:focus-visible { outline: 3px solid var(--focus); outline-offset: 3px; border-radius: 3px; }
code { font-family: var(--font-mono); font-size: 0.82em; background: var(--surface-2); padding: 0.05em 0.35em; border-radius: 3px; overflow-wrap: anywhere; }
h1, h2 { font-family: var(--font-display); font-weight: 600; color: var(--ink); text-wrap: balance; margin: 0; }
h1 { font-size: clamp(2.2rem, 5vw, 3.2rem); line-height: 1.02; letter-spacing: -0.01em; }
h2 { font-size: 1.65rem; line-height: 1.15; display: flex; flex-wrap: wrap; align-items: baseline; gap: 4px 10px; }
p { margin: 0; max-width: 72ch; }
.eyebrow { font-size: 0.74rem; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: var(--muted); }
.hero { display: grid; gap: 12px; }
.meta, .note, .source { color: var(--muted); font-size: 0.9rem; }
.stats { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 6px; }
.stat { background: var(--surface); border: 1px solid var(--line); border-radius: 10px; padding: 10px 16px; display: grid; min-width: 128px; }
.stat .n { font-family: var(--font-display); font-size: 2rem; font-weight: 600; line-height: 1; font-variant-numeric: tabular-nums; }
.stat .l { font-size: 0.82rem; color: var(--muted); }
.release { background: var(--surface); border: 1px solid var(--line); border-radius: 10px; padding: 12px 16px; display: grid; gap: 4px; max-width: 80ch; }
.layout { display: grid; grid-template-columns: 200px minmax(0, 1fr); gap: 36px; align-items: start; }
.toc { position: sticky; top: calc(env(safe-area-inset-top, 0px) + 16px); display: grid; gap: 8px; }
.toc ol { list-style: none; margin: 0; padding: 0; display: grid; gap: 2px; border-left: 2px solid var(--line); }
.toc a { display: block; padding: 3px 0 3px 12px; color: var(--ink); text-decoration: none; font-size: 0.92rem; }
.toc a:hover { color: var(--owner); }
main { display: grid; gap: 30px; min-width: 0; }
section { display: grid; gap: 12px; min-width: 0; scroll-margin-top: 80px; }
.filterbar { position: sticky; top: env(safe-area-inset-top, 0px); z-index: 2; background: var(--bg); padding-block: 10px; border-bottom: 1px solid var(--line); display: flex; flex-wrap: wrap; gap: 8px 12px; align-items: center; }
.filterbar input { flex: 1 1 240px; min-width: 0; font: inherit; font-size: 0.95rem; padding: 8px 12px; border: 1px solid var(--line-strong); border-radius: 8px; background: var(--surface); color: var(--ink); }
.chips { display: flex; flex-wrap: wrap; gap: 6px; }
.chip { font: inherit; font-size: 0.84rem; font-weight: 600; padding: 5px 12px; border-radius: 999px; border: 1px solid var(--line-strong); background: var(--surface); color: var(--ink); cursor: pointer; }
.chip[aria-pressed="true"] { background: var(--brand); color: var(--on-brand); border-color: var(--brand); }
#count { flex-basis: 100%; }
.sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
.lv { font-family: var(--font-mono); font-size: 0.9rem; font-weight: 500; background: var(--brand); color: var(--on-brand); border-radius: 6px; padding: 2px 8px; align-self: center; }
.n-items { font-family: var(--font-ui); font-size: 0.85rem; color: var(--muted); font-weight: 600; }
.table-wrap { overflow-x: auto; border: 1px solid var(--line); border-radius: 10px; background: var(--surface); }
table { width: 100%; border-collapse: collapse; font-size: 0.92rem; }
th, td { text-align: left; vertical-align: top; padding: 10px 12px; border-bottom: 1px solid var(--line); }
tbody tr:last-child td { border-bottom: 0; }
th { font-size: 0.7rem; font-weight: 700; letter-spacing: 0.09em; text-transform: uppercase; color: var(--muted); background: var(--surface-2); white-space: nowrap; }
tr[id] { scroll-margin-top: 120px; }
tr:target td { background: var(--owner-bg); }
td.num { font-family: var(--font-mono); font-weight: 500; white-space: nowrap; }
td.item { min-width: 20rem; }
.item-text { max-width: none; }
.type { display: inline-block; margin-top: 4px; font-size: 0.7rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: var(--muted); }
.reg { font-family: var(--font-mono); font-size: 0.78em; color: var(--muted); white-space: nowrap; }
.reg::before { content: "["; } .reg::after { content: "]"; }
a.ref { font-family: var(--font-mono); font-size: 0.88em; text-decoration: none; border-bottom: 1px dotted currentColor; }
td[data-label] { width: 1%; white-space: nowrap; }
td.effort { font-family: var(--font-mono); font-weight: 500; }
td.blocker { white-space: normal; min-width: 9rem; font-size: 0.88rem; }
td.blocker.ready { color: var(--good); font-weight: 700; }
.sub { display: block; font-size: 0.78rem; color: var(--muted); margin-top: 3px; }
.pill { display: inline-block; font-size: 0.74rem; font-weight: 700; padding: 2px 9px; border-radius: 999px; }
.pill.w-owner, .mx-chip.w-owner { background: var(--owner-bg); color: var(--owner); }
.pill.w-claude, .mx-chip.w-claude { background: var(--claude-bg); color: var(--claude); }
.pill.w-both, .mx-chip.w-both { background: var(--both-bg); color: var(--both); }
.matrix { margin: 0; display: grid; gap: 10px; }
.mx { display: grid; grid-template-columns: minmax(84px, 0.55fr) repeat(3, minmax(0, 1fr)); gap: 6px; }
.mx-col, .mx-row-h { font-size: 0.82rem; color: var(--muted); display: grid; align-content: center; }
.mx-col { padding: 0 10px; }
.mx-col b, .mx-row-h b { font-family: var(--font-display); font-size: 1.25rem; color: var(--ink); }
.mx-cell { background: var(--surface); border: 1px solid var(--line); border-radius: 10px; padding: 10px; min-height: 60px; display: flex; flex-wrap: wrap; gap: 6px; align-content: flex-start; }
.mx-empty { color: var(--line-strong); }
.mx-chip { display: inline-grid; place-items: center; min-width: 2.6em; height: 1.95em; padding: 0 7px; border-radius: 6px; font-family: var(--font-mono); font-size: 0.84rem; font-weight: 500; font-style: normal; text-decoration: none; border: 1.5px solid transparent; }
.mx-chip.blocked { border: 1.5px dashed var(--line-strong); }
a.mx-chip:hover { border-color: var(--focus); }
.matrix figcaption { display: flex; flex-wrap: wrap; gap: 6px 16px; align-items: center; color: var(--muted); font-size: 0.84rem; }
.key { display: inline-flex; align-items: center; gap: 6px; }
.key .mx-chip { min-width: 1.4em; height: 1.2em; padding: 0; }
.notes { display: grid; gap: 12px; }
.done { list-style: none; margin: 0; padding: 0; display: grid; gap: 10px; }
.done li { display: grid; grid-template-columns: 7.5rem minmax(0, 1fr); gap: 2px 14px; padding-bottom: 10px; border-bottom: 1px solid var(--line); }
.done li:last-child { border-bottom: 0; }
.done-label { font-family: var(--font-mono); font-weight: 500; }
.done-date { grid-column: 1; font-size: 0.82rem; color: var(--muted); }
.done li p { grid-column: 2; grid-row: 1 / span 2; font-size: 0.92rem; }
.columns { display: grid; gap: 8px; max-width: 76ch; }
.columns dt { font-weight: 700; } .columns dd { margin: 0 0 6px; color: var(--muted); }
.foot { border-top: 1px solid var(--line); padding-top: 16px; color: var(--muted); font-size: 0.86rem; }
@media (max-width: 880px) {
  .layout { grid-template-columns: minmax(0, 1fr); }
  .toc { position: static; }
  .toc ol { grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); border-left: 0; }
  .toc a { padding-left: 0; }
}
@media (max-width: 700px) {
  .page { padding-inline: 16px; padding-block: 24px 48px; }
  .mx { grid-template-columns: 44px repeat(3, minmax(0, 1fr)); gap: 4px; }
  .mx-col span, .mx-row-h span { display: none; }
  .mx-col { padding: 0 4px; }
  .mx-cell { padding: 6px; gap: 4px; min-height: 44px; }
  table.backlog thead { display: none; }
  table.backlog, table.backlog tbody, table.backlog tr { display: block; }
  table.backlog tr { display: grid; grid-template-columns: auto 1fr; gap: 6px 10px; padding: 12px; border-bottom: 1px solid var(--line); }
  table.backlog tr:last-child { border-bottom: 0; }
  table.backlog td { border: 0; padding: 0; }
  table.backlog td.item { min-width: 0; grid-column: 2; }
  table.backlog td[data-label] { grid-column: 2; display: flex; gap: 8px; align-items: baseline; width: auto; white-space: normal; min-width: 0; }
  table.backlog td[data-label]::before { content: attr(data-label); font-size: 0.7rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: var(--muted); min-width: 4.5em; }
  .sub { display: inline; margin: 0 0 0 4px; }
  .done li { grid-template-columns: minmax(0, 1fr); }
  .done li p { grid-column: 1; grid-row: auto; }
}
@media (prefers-reduced-motion: reduce) { * { scroll-behavior: auto !important; } }
</style>
<div class="page">
<header class="hero">
  <p class="eyebrow">TAB Wellness Collective · Backlog</p>
  <h1>What's left before launch</h1>
  <p class="meta">From <code>docs/BACKLOG.md</code> at <a href="${REPO}/commit/${esc(sha)}" target="_blank" rel="noopener"><code>${esc(sha)}</code></a>${updated ? ` · last updated ${md(updated)}` : ""}</p>
  <div class="stats">${stats.map(([n, l]) => `<div class="stat"><span class="n">${n}</span><span class="l">${l}</span></div>`).join("")}</div>
  ${release}
</header>
<div class="layout">
<nav class="toc" aria-label="Contents"><p class="eyebrow">Contents</p><ol>
<li><a href="#grid">Priority and effort</a></li>
${sections.map((s) => `<li><a href="#${s.level.toLowerCase()}">${s.level} · ${esc(s.title.replace(/\s*\(.*\)$/, ""))}</a></li>`).join("\n")}
${notes.length ? '<li><a href="#notes">Notes on sequencing</a></li>' : ""}
<li><a href="#done">Recently done</a></li>
<li><a href="#columns">Reading the page</a></li>
</ol></nav>
<main>
<div class="filterbar" role="search">
  <label for="q" class="sr">Filter items</label>
  <input id="q" type="search" placeholder="Filter: an ID such as A7, or a word…" autocomplete="off">
  <div class="chips" role="group" aria-label="Show items">${["All", ...levels, "Yours", "Claude's", "Can start now"].map((f, i) => `<button type="button" class="chip" data-filter="${esc(f)}" aria-pressed="${i === 0}">${esc(f)}</button>`).join("")}</div>
  <p id="count" class="note" aria-live="polite"></p>
</div>
<section id="grid" aria-labelledby="h-grid"><h2 id="h-grid">Priority and effort</h2>
<p class="note">Every open item, placed by when it matters and how big it is. Terracotta items are yours; olive ones are Claude's. Dashed items are waiting on something.</p>
${matrix}</section>
${sectionHtml}
${notes.length ? `<section id="notes" class="notes" aria-labelledby="h-notes"><h2 id="h-notes">Notes on sequencing</h2>${notes.map((n) => `<p>${md(n)}</p>`).join("\n")}</section>` : ""}
<section id="done" aria-labelledby="h-done"><h2 id="h-done">Recently done</h2><ul class="done">${doneHtml}</ul></section>
<section id="columns" aria-labelledby="h-columns"><h2 id="h-columns">Reading the page</h2>
<dl class="columns">
<dt>Priority</dt><dd><strong>P0</strong> now: a risk, or it blocks most other work. <strong>P1</strong> before the public site launches. <strong>P2</strong> before My TAB holds real client data. <strong>P3</strong> later or optional.</dd>
<dt>Who</dt><dd><strong>Yours</strong> (IDs starting A): accounts, content, decisions and approvals only you can give. <strong>Claude's</strong> (IDs starting C): engineering. <strong>Shared</strong>: needs both.</dd>
<dt>Effort</dt><dd><strong>S</strong> hours. <strong>M</strong> about a day. <strong>L</strong> several days, or mostly waiting on someone else (counsel, a designer, clients). Claude's estimate; correct it when you know better.</dd>
<dt>Blocker</dt><dd><strong>None</strong> means it can start now. Otherwise it names what has to happen first, usually another item on this page.</dd>
</dl></section>
<footer class="foot">Generated from <code>docs/BACKLOG.md</code> at <code>${esc(sha)}</code> by <code>scripts/render-backlog.mjs</code>, and republished after every production promotion. The backlog is edited in that file; <code>git log docs/BACKLOG.md</code> is its history.</footer>
</main>
</div>
</div>
<script>
(() => {
  const q = document.getElementById('q');
  const chips = [...document.querySelectorAll('.chip')];
  const count = document.getElementById('count');
  const rows = [...document.querySelectorAll('table.backlog tbody tr')];
  const levels = [...document.querySelectorAll('section.level')];
  let filter = 'All';
  function apply() {
    const term = q.value.trim().toLowerCase();
    const isId = /^[ac]\\d+[a-z]?$/.test(term); // an ID matches whole: A1 finds A1, not A10
    let shown = 0;
    for (const r of rows) {
      const okText = !term || (isId ? r.id === 'item-' + term.toUpperCase() : r.textContent.toLowerCase().includes(term));
      const d = r.dataset;
      const okFilter = filter === 'All' || filter === d.priority
        || (filter === 'Yours' && d.who !== 'claude') || (filter === "Claude's" && d.who !== 'owner')
        || (filter === 'Can start now' && d.ready === 'true');
      r.hidden = !(okText && okFilter);
      if (!r.hidden) shown++;
    }
    for (const s of levels) s.hidden = !s.querySelector('tbody tr:not([hidden])');
    count.textContent = term || filter !== 'All' ? 'Showing ' + shown + ' of ' + rows.length + ' open items' : '';
  }
  q.addEventListener('input', apply);
  for (const c of chips) c.addEventListener('click', () => {
    filter = c.dataset.filter;
    for (const o of chips) o.setAttribute('aria-pressed', String(o === c));
    apply();
  });
})();
</script>
`;
fs.writeFileSync(args.out, html);
console.log(`Backlog page: ${items.length} open items, ${done.length} done → ${args.out}`);
