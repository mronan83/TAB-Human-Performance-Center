#!/usr/bin/env node
/**
 * Builds the backlog page from docs/BACKLOG.md. Claude republishes it after every successful production promotion
 * (G3, CLAUDE.md "Branches and review gates"); the Markdown file stays the one place the backlog is edited.
 *
 *   npm run backlog:html -- --out <file.html> [--release "<what just went live>"] [--deployment dpl_…] [--sha <commit>]
 *   node scripts/docs/render-backlog.mjs --check      the structural checks only (CI, through npm run docs:check)
 *
 * Sections: what is waiting on the owner, milestones by size, the longest remaining chain, the status board (filters,
 * one expandable row per item), the dependency map, notes, a size summary, consistency checks and the release notes.
 */
import { page, render, inline, esc, args, write, section, filters, facet, row, kv, tags, tag, traceList, pill, stack, icon, expandButton, useRegistry, svg, figure, fmtDate, stLabel, REPO } from "./page.mjs";
import { model, assertModel, OPEN, SIZE_DAYS, byId } from "./model.mjs";

const a = args();
const m = assertModel(model());
const B = m.backlog;
const items = [...B.items.values()];
const get = (id) => B.items.get(id);
const ORDER = ["you", "progress", "review", "ready", "queued", "blocked", "deferred", "done", "dropped"];
const MS = B.milestones.map((x) => x.id);
const isOpen = (it) => OPEN(it.status);
const open = items.filter(isOpen);
const fin = items.filter((it) => !isOpen(it));
const unblocks = (id) => m.list(m.rel.unblocks, id);
const storiesOf = (id) => m.list(m.rel.storiesFor, id);

// ---- Derived: what each item waits on, transitively; the longest chain ----------------------------------------------------
const waitsOnOwner = new Map();
const ownerWaits = (id, seen = new Set()) => {
  if (waitsOnOwner.has(id)) return waitsOnOwner.get(id);
  const it = get(id);
  const out = new Set();
  if (it && isOpen(it) && it.yours) out.add(id);
  for (const d of it?.deps ?? []) if (!seen.has(d) && isOpen(get(d))) { seen.add(d); for (const x of ownerWaits(d, seen)) out.add(x); }
  waitsOnOwner.set(id, out);
  return out;
};
items.forEach((it) => ownerWaits(it.id));
const downstream = (id, seen = new Set()) => { for (const u of unblocks(id)) if (!seen.has(u) && isOpen(get(u))) { seen.add(u); downstream(u, seen); } return seen; };
const weight = (it) => (isOpen(it) ? SIZE_DAYS[it.size] ?? 1 : 0);
const memo = new Map();
const longest = (id) => {
  if (memo.has(id)) return memo.get(id);
  const it = get(id);
  let best = { days: 0, path: [] };
  for (const d of it.deps) if (isOpen(get(d))) { const c = longest(d); if (c.days > best.days) best = c; }
  const r = { days: best.days + weight(it), path: [...best.path, id] };
  memo.set(id, r);
  return r;
};
const chain = open.map((it) => longest(it.id)).sort((x, y) => y.days - x.days || y.path.length - x.path.length)[0] ?? { days: 0, path: [] };
const totalDays = open.reduce((s, it) => s + weight(it), 0);
const days = (n) => (n < 1 ? `${Math.round(n * 4) / 4 || 0}` : `~${Math.round(n * 10) / 10}`).replace(/\.0$/, "");
const depsDone = (it) => it.deps.every((d) => !isOpen(get(d)));
const startable = open.filter((it) => depsDone(it) && ["ready", "you", "progress"].includes(it.status));

// ---- Consistency checks (warnings on the page; structural errors already failed the build) --------------------------------
const checks = [];
const ok = (text) => checks.push(["ok", text]);
const warn = (text) => checks.push(["warn", text]);
const info = (text) => checks.push(["info", text]);
ok(`Every dependency names a backlog item and none loops back on itself; every requirement an item names is on the requirements page.`);
for (const it of open) {
  const waiting = it.deps.filter((d) => isOpen(get(d)));
  if (["ready", "you"].includes(it.status) && waiting.length) warn(`${tag(it.id)} is marked ${esc(stLabel(it.status))} but waits on ${tags(waiting)}.`);
  if (it.status === "queued" && !waiting.length) info(`${tag(it.id)}: everything it depends on is done; it could say ${it.yours ? "Waiting on you" : "Ready"}.`);
  for (const d of it.deps) if (MS.indexOf(get(d).milestone) > MS.indexOf(it.milestone)) warn(`${tag(it.id)} (${it.milestone}) depends on ${tag(d)} in a later milestone (${get(d).milestone}).`);
  if (it.status === "blocked" && !it.waitsOn) warn(`${tag(it.id)} is Blocked but doesn't say what it waits on.`);
}
for (const it of fin) for (const d of it.deps) if (isOpen(get(d))) warn(`${tag(it.id)} is ${esc(stLabel(it.status))} but depends on ${tag(d)}, which isn't.`);
const noReq = open.filter((it) => !it.yours && !it.requirements.length);
if (noReq.length) info(`Engineering items that name no requirement (operations or housekeeping): ${tags(noReq.map((x) => x.id))}.`);
const noDoneWhen = open.filter((it) => !it.doneWhen && it.status !== "deferred");
if (noDoneWhen.length) warn(`Open items without a "Done when": ${tags(noDoneWhen.map((x) => x.id))}.`);
else ok(`Every open item says when it counts as done.`);
const undelivered = m.trace.reqs.filter((r) => ["planned", "partial"].includes(m.reg.get(r.ID)?.status) && !m.list(m.rel.backlogFor, r.ID).some((id) => isOpen(get(id))));
if (undelivered.length) info(`Planned or partial requirements no open item delivers (a gap, an owner ruling or a decision explains each on the requirements page): ${tags(undelivered.map((r) => r.ID))}.`);
const warnings = checks.filter(([k]) => k === "warn").length;

if (a.check) {
  console.log(`Backlog: ${items.length} items (${open.length} open) in ${MS.length} milestones; dependencies resolve with no loops; ${warnings} consistency warning${warnings === 1 ? "" : "s"} shown on the page.`);
  process.exit(0);
}
if (!a.out) { console.error("Usage: npm run backlog:html -- --out <file.html> [--release text] [--deployment id] [--sha commit] | --check"); process.exit(1); }

useRegistry(m.reg, "backlog");
const ctx = { file: B.file, codeLinks: true };
const md = (t) => inline(t, ctx);

// ---- Waiting on you --------------------------------------------------------------------------------------------------------
const yours = open.filter((it) => it.status === "you").sort((x, y) => MS.indexOf(x.milestone) - MS.indexOf(y.milestone) || downstream(y.id).size - downstream(x.id).size || byId(x.id, y.id));
const yoursQueued = open.filter((it) => it.yours && it.status !== "you");
const yoursDone = fin.filter((it) => it.yours).sort((x, y) => (y.doneDate ?? "").localeCompare(x.doneDate ?? ""));
const waitingSec = section("waiting", "Waiting on you", `<div class="yours"><p class="small">Only you can do these. Each names what it unblocks; everything else on this page is Claude's, or waits on one of these. Secrets go straight into Vercel or GitHub settings, never into chat.</p>
<ol>${yours.map((it) => {
  const down = [...downstream(it.id)].sort(byId);
  return `<li id="y-${it.id.toLowerCase()}"><span class="yid">${esc(it.id)}</span><div><div class="act">${md(it.title)}</div>${it.where ? `<div class="where">Where: ${md(it.where)}</div>` : ""}${it.doneWhen ? `<div class="where">Done when: ${md(it.doneWhen)}</div>` : ""}<div class="unb"><span>${down.length ? "Unblocks:" : "Unblocks nothing else on this list"}</span>${down.length ? tags(down) : ""}${it.requirements.length ? `<span>· delivers</span>${tags(it.requirements)}` : ""}</div></div><button type="button" class="btn" data-set-filter="you:${it.id}" data-filter-target="board" data-filter-label="Waiting on ${esc(it.id)}">Show on board</button></li>`;
}).join("")}</ol>
${yoursQueued.length ? `<p class="small">Also yours, later: ${yoursQueued.map((it) => `${tag(it.id)} ${esc(it.title)} (${esc(stLabel(it.status).toLowerCase())}${it.deps.filter((d) => isOpen(get(d))).length ? `, after ${it.deps.filter((d) => isOpen(get(d))).join(", ")}` : it.waitsOn ? `: ${esc(it.waitsOn)}` : ""})`).join("; ")}.</p>` : ""}
<details class="yours-done"><summary>Done by you (${yoursDone.length})</summary><ul>${yoursDone.map((it) => `<li><span class="yid">${esc(it.id)}</span><span>${esc(it.title)} · ${esc(stLabel(it.status))} ${esc(fmtDate(it.doneDate))}</span></li>`).join("")}</ul></details></div>`);

// ---- Milestones × size ---------------------------------------------------------------------------------------------------
const statusParts = (list) => ORDER.map((st) => [st, list.filter((it) => it.status === st).length]);
const msRows = B.milestones.map((ms) => {
  const list = ms.items.map(get);
  const done = list.filter((it) => it.status === "done").length;
  const left = list.filter(isOpen).reduce((s, it) => s + weight(it), 0);
  const cells = ["S", "M", "L"].map((sz) => {
    const here = list.filter((it) => it.size === sz).sort((x, y) => ORDER.indexOf(x.status) - ORDER.indexOf(y.status) || byId(x.id, y.id));
    return `<td data-label="${sz}">${here.length ? tags(here.map((it) => it.id)) : '<span class="none">—</span>'}</td>`;
  }).join("");
  return `<tr><th scope="row">${esc(ms.id)} ${esc(ms.title)}<small>${list.length} items · ${list.filter(isOpen).length} open · ${days(left)} days of work left</small><span class="prog">${stack(statusParts(list), `${ms.id}: ${done} of ${list.length} done`, true)}<span>${done} of ${list.length} done</span></span></th>${cells}</tr>`;
}).join("");
const msSec = section("milestones", "Milestones", `<div class="matrix"><table class="md"><thead><tr><th scope="col">Milestone</th><th scope="col">S · hours</th><th scope="col">M · about a day</th><th scope="col">L · several days</th></tr></thead><tbody>${msRows}</tbody></table></div>
<details class="more"><summary>What each milestone means</summary><div class="table-wrap"><table class="md"><thead><tr><th scope="col">Milestone</th><th scope="col">Goal and exit</th></tr></thead><tbody>${B.milestones.map((ms) => `<tr><td data-label="Milestone" class="nowrap"><b>${esc(ms.id)}</b> ${esc(ms.title)}</td><td data-label="Goal and exit">${ms.goal.map((g) => md(g.text ?? "")).join(" ")}</td></tr>`).join("")}</tbody></table></div></details>`,
  { note: "Every item by milestone and size, tinted by status. Milestones rank the work; P1 is the public launch, P2 My TAB's go-live." });

// ---- Longest remaining chain and what can start now -------------------------------------------------------------------------
const chainHtml = chain.path.length ? chain.path.map(tag).join(`<span class="arrow" aria-hidden="true">${icon("arrow")}</span>`) : '<span class="none">Nothing open.</span>';
const startList = (list) => (list.length ? `<ul class="trace-list">${list.map((it) => `<li>${tag(it.id)}<span class="t">${esc(it.title)}${it.size ? ` · size ${it.size}` : ""}</span></li>`).join("")}</ul>` : '<p class="none">Nothing right now.</p>');
const chainSec = section("chain", "Longest remaining chain", `<div class="chain">${chainHtml}</div>
<p class="sec-note">${chain.path.length} items, about <b>${days(chain.days)} days of work</b> end to end if each waits for the one before. Sizes count as S ¼, M 1 and L 3 days; finished items count zero. All open work adds up to about ${days(totalDays)} days, yours and Claude's; parallel work shortens the calendar, not the total.</p>
<div class="split"><div class="card"><p class="eyebrow">You can start now</p>${startList(startable.filter((it) => it.yours))}</div><div class="card"><p class="eyebrow">Claude can start now</p>${startList(startable.filter((it) => !it.yours))}</div></div>`,
  { note: "The longest path through the dependencies, weighted by size. A slip anywhere on it moves the launch or the go-live." });

// ---- Status board -----------------------------------------------------------------------------------------------------------
const ownerKey = (it) => (it.yours ? "you" : "claude");
const boardFilters = filters({
  noun: "items", total: items.length, placeholder: "Search items: an ID, a word, a requirement…",
  facets: [
    facet("state", "Show", items, (it) => (isOpen(it) ? "open" : "finished"), ["open", "finished"], (v) => (v === "open" ? "Open" : "Finished")),
    facet("status", "Status", items, (it) => it.status, ORDER, stLabel, (v) => v),
    facet("ms", "Milestone", items, (it) => it.milestone, MS),
    facet("owner", "Owner", items, ownerKey, ["you", "claude"], (v) => (v === "you" ? "Yours" : "Claude's")),
    facet("size", "Size", items, (it) => it.size, ["S", "M", "L"]),
    facet("cat", "Category", items, (it) => it.category),
  ],
});
const itemRow = (it) => {
  const waiting = it.deps.filter((d) => isOpen(get(d)));
  const facts = [
    `${it.yours ? "Yours" : "Claude"} · ${esc(it.category)} · size ${esc(it.size)}`,
    it.deps.length ? `Depends on ${tags(it.deps)}` : isOpen(it) ? "No dependencies" : "",
    it.waitsOn ? `Waits on ${md(it.waitsOn)}` : "",
    it.doneDate ? `${esc(stLabel(it.status))} ${esc(fmtDate(it.doneDate))}${it.prs.length ? ` · ${it.prs.map((p) => `<a href="${REPO}/pull/${p}" target="_blank" rel="noopener">PR #${p}</a>`).join(", ")}` : ""}` : "",
  ];
  const desc = it.body.map((b) => (b.type === "li" ? `<li>${md(b.text)}</li>` : b.type === "p" ? `<li>${md(b.text)}</li>` : "")).join("");
  const down = unblocks(it.id);
  const body = [
    desc ? `<ul class="bullets">${desc}</ul>` : "",
    it.doneWhen ? `<p class="done-when"><b>Done when:</b> ${md(it.doneWhen)}</p>` : "",
    kv([
      ["Where", it.where ? md(it.where) : ""],
      ["Waiting on", waiting.length ? traceList(waiting) : ""],
      ["Requirements", it.requirements.length ? traceList(it.requirements) : ""],
      ["User stories", storiesOf(it.id).length ? tags(storiesOf(it.id)) : ""],
      ["Unblocks", down.length ? traceList(down) : ""],
    ]),
  ].join("");
  return row({
    id: it.id, anchor: it.id.toLowerCase(), title: md(it.title), facts, side: pill(it.status), body,
    data: { state: isOpen(it) ? "open" : "finished", status: it.status, ms: it.milestone, owner: ownerKey(it), size: it.size, cat: it.category, you: [...(waitsOnOwner.get(it.id) ?? [])] },
    search: `${it.id} ${it.title} ${it.category} ${it.owner} ${it.requirements.join(" ")} ${it.body.map((b) => b.text ?? "").join(" ")} ${it.doneWhen ?? ""}`,
  });
};
const groups = B.milestones.map((ms) => {
  const list = ms.items.map(get).sort((x, y) => ORDER.indexOf(x.status) - ORDER.indexOf(y.status) || (y.doneDate ?? "").localeCompare(x.doneDate ?? "") || byId(x.id, y.id));
  return `<div class="sub" data-group id="ms-${ms.id.toLowerCase()}"><div class="group-h"><h3>${esc(ms.id)} · ${esc(ms.title)}</h3><span class="muted small">${list.filter(isOpen).length} open · ${list.length - list.filter(isOpen).length} finished</span></div>${list.length ? `<div class="rows">${list.map(itemRow).join("\n")}</div>` : '<p class="none">Nothing here.</p>'}</div>`;
}).join("\n");
const boardSec = section("board", "Status board", `${boardFilters}${groups}`, {
  tools: expandButton("board"),
  note: `<strong>Waiting on you</strong>: an owner action nothing else holds up · <strong>In progress</strong> or <strong>In review</strong>: being built, or its pull request is open · <strong>Ready</strong>: everything it depends on is done · <strong>Queued</strong>: waits on another item · <strong>Blocked</strong>: waits on something outside this list · <strong>Deferred</strong>: optional, or waits on a decision · <strong>Done</strong> and <strong>Dropped</strong>: finished.`,
});

// ---- Dependency map (layered SVG: each column waits on the ones to its left) --------------------------------------------------
const mapIds = new Set();
for (const it of open) for (const d of it.deps) if (isOpen(get(d))) { mapIds.add(it.id); mapIds.add(d); }
const depth = new Map();
const depthOf = (id) => { if (depth.has(id)) return depth.get(id); const d = Math.max(-1, ...get(id).deps.filter((x) => mapIds.has(x)).map(depthOf)) + 1; depth.set(id, d); return d; };
[...mapIds].forEach(depthOf);
// Then pull each item as far right as what waits on it allows, so a long arrow doesn't run behind other boxes.
for (const id of [...mapIds].sort((x, y) => depth.get(y) - depth.get(x))) {
  const after = [...mapIds].filter((u) => get(u).deps.includes(id)).map((u) => depth.get(u));
  if (after.length) depth.set(id, Math.max(depth.get(id), Math.min(...after) - 1));
}
const cols = [];
for (const id of [...mapIds].sort((x, y) => MS.indexOf(get(x).milestone) - MS.indexOf(get(y).milestone) || byId(x, y))) (cols[depth.get(id)] ||= []).push(id);
// Order each column by the average position of what it depends on, so edges cross less.
const pos = new Map();
cols.forEach((col, c) => {
  if (c) col.sort((x, y) => { const av = (id) => { const p = get(id).deps.filter((d) => pos.has(d)).map((d) => pos.get(d)); return p.length ? p.reduce((s, v) => s + v, 0) / p.length : 99; }; return av(x) - av(y); });
  col.forEach((id, i) => pos.set(id, i));
});
const NW = 168, NH = 46, GX = 74, GY = 16, PAD = 16;
const rowsN = Math.max(1, ...cols.map((c) => c.length));
const W = PAD * 2 + cols.length * NW + (cols.length - 1) * GX, H = PAD * 2 + rowsN * NH + (rowsN - 1) * GY;
const at = (id) => { const c = depth.get(id), r = pos.get(id); const off = ((rowsN - cols[c].length) * (NH + GY)) / 2; return [PAD + c * (NW + GX), PAD + off + r * (NH + GY)]; };
const edges = [], nodes = [];
for (const id of mapIds) for (const d of get(id).deps) if (mapIds.has(d)) {
  const [x1, y1] = at(d), [x2, y2] = at(id);
  const sx = x1 + NW, sy = y1 + NH / 2, ex = x2 - 2, ey = y2 + NH / 2, mx = (sx + ex) / 2;
  edges.push(`<path d="M${sx},${sy} C${mx},${sy} ${mx},${ey} ${ex},${ey}" class="edge" marker-end="url(#ah)"/>`);
}
for (const id of mapIds) {
  const it = get(id), [x, y] = at(id);
  const t = it.title.length > 24 ? it.title.slice(0, 23).replace(/\s+\S*$/, "") + "…" : it.title;
  nodes.push(`<a href="#${id.toLowerCase()}" data-id="${id}" class="${pill(it.status).match(/st-\w+/)?.[0] ?? ""}"><rect x="${x}" y="${y}" width="${NW}" height="${NH}" rx="8" class="dnode"/><text x="${x + 10}" y="${y + 18}" class="t-id dtext">${esc(id)} · ${esc(stLabel(it.status))}</text><text x="${x + 10}" y="${y + 35}" class="t-quiet dtext">${esc(t)}</text></a>`);
}
const loose = open.filter((it) => !mapIds.has(it.id));
const mapSec = section("map", "Dependency map", mapIds.size ? `${figure(svg(W, H, "Open items and what each waits on; arrows point from a dependency to the item waiting on it", edges.join("") + nodes.join("")), `Open items only, left to right: each column waits on the columns to its left. Select a box to open its row. Finished dependencies are left out.`)}
<p class="small muted">No open dependencies either way: ${tags(loose.map((it) => it.id))}</p>` : '<p class="none">No open item waits on another.</p>');

// ---- Notes, sizes, checks, release notes, how it works -------------------------------------------------------------------------
const blocksHtml = (blocks) => render({ blocks: [{ type: "h2", text: "x" }, ...blocks] }, ctx).html.replace(/^<section[^>]*><div class="sec-head"><h2>x<\/h2><\/div>/, "").replace(/<\/section>\s*$/, "");
const notesSec = section("sequencing", "Notes on sequencing", blocksHtml(B.sections["Notes on sequencing"] ?? []));
const sizeRows = B.milestones.map((ms) => {
  const list = ms.items.map(get), op = list.filter(isOpen);
  const by = (sz) => op.filter((it) => it.size === sz).length;
  return `<tr><td data-label="Milestone" class="nowrap"><b>${esc(ms.id)}</b> ${esc(ms.title)}</td><td data-label="Open">${op.length}</td><td data-label="S · M · L">${by("S")} · ${by("M")} · ${by("L")}</td><td data-label="Yours · Claude's">${op.filter((it) => it.yours).length} · ${op.filter((it) => !it.yours).length}</td><td data-label="Days of work">${days(op.reduce((s, it) => s + weight(it), 0))}</td><td data-label="Finished">${list.length - op.length}</td></tr>`;
}).join("");
const sizeSec = section("sizes", "Size summary", `<div class="table-wrap"><table class="md"><thead><tr><th scope="col">Milestone</th><th scope="col">Open</th><th scope="col">S · M · L</th><th scope="col">Yours · Claude's</th><th scope="col">Days of work</th><th scope="col">Finished</th></tr></thead><tbody>${sizeRows}</tbody></table></div>`);
const checkSec = section("checks", "Consistency checks", `<ul class="checks">${checks.map(([k, t]) => `<li class="${k}">${icon(k === "ok" ? "check" : k === "warn" ? "alert" : "info")} <span>${t}</span></li>`).join("")}</ul>`,
  { note: "Worked out from the items each time the page is built. A broken reference or a loop fails CI instead of showing here." });
const relItem = (r) => `<li><strong>${md(r.label)}</strong>${r.when ? ` <span class="muted">(${md(r.when)})</span>` : ""}: ${md(r.text)}</li>`;
const releaseSec = section("releases", "Release notes", `<ul class="bullets">${B.releases.slice(0, 10).map(relItem).join("")}</ul>${B.releases.length > 10 ? `<details class="more"><summary>Earlier releases (${B.releases.length - 10})</summary><ul class="bullets">${B.releases.slice(10).map(relItem).join("")}</ul></details>` : ""}`,
  { note: "What changed for the owner, newest first. The full history is in git." });
const howSec = section("how", "How this backlog works", blocksHtml(B.sections["How this backlog works"] ?? []));

// ---- Page -------------------------------------------------------------------------------------------------------------------------
const count = (st) => items.filter((it) => it.status === st).length;
const latest = a.release
  ? { label: `Latest release${a.deployment ? ` · ${a.deployment}` : ""}`, html: md(a.release) }
  : B.releases[0] ? { label: `Latest change · ${B.releases[0].when}`, html: `${md(B.releases[0].label)}: ${md(B.releases[0].text)}` } : null;
const out = page({
  key: "backlog", title: B.front.title, eyebrow: B.front.eyebrow, heading: B.front.heading, file: B.file, version: B.front.version, commit: a.sha, date: B.front.updated,
  lede: md(`Every owner action and every piece of engineering work, with its status, what it waits on and what it unblocks. ${count("you")} things are waiting on you; the public launch is targeted for 1 November 2026, and My TAB's go-live waits on its gate (A15).`),
  stats: [
    { n: items.length, label: "items, A and C" },
    { n: count("done"), label: "done" },
    { n: count("progress") + count("review"), label: "in progress or review" },
    { n: count("ready"), label: "ready for Claude" },
    { n: count("you"), label: "waiting on you", tone: "st-you" },
    { n: count("queued") + count("blocked"), label: "queued or blocked" },
    { n: days(totalDays), label: "days of work left" },
  ],
  latest,
  sections: [
    { id: "waiting", title: "Waiting on you" }, { id: "milestones", title: "Milestones" }, { id: "chain", title: "Longest remaining chain" },
    { id: "board", title: "Status board", children: B.milestones.map((ms) => ({ id: `ms-${ms.id.toLowerCase()}`, title: `${ms.id} ${ms.title}` })) },
    { id: "map", title: "Dependency map" }, { id: "sequencing", title: "Notes on sequencing" }, { id: "sizes", title: "Size summary" },
    { id: "checks", title: "Consistency checks" }, { id: "releases", title: "Release notes" }, { id: "how", title: "How this backlog works" },
  ],
  statusKey: ORDER,
  body: [waitingSec, msSec, chainSec, boardSec, mapSec, notesSec, sizeSec, checkSec, releaseSec, howSec].join("\n"),
  foot: `<p>Generated from <code>${esc(B.file)}</code> by <code>scripts/docs/render-backlog.mjs</code>. Its history is <code>git log ${esc(B.file)}</code>.</p>`,
});
write(a.out, out, `Backlog page: ${items.length} items, ${open.length} open, ${count("you")} waiting on you, ${warnings} warnings`);
