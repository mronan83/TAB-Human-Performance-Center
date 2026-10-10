#!/usr/bin/env node
/**
 * Builds the Website content guide page from docs/CONTENT-GUIDE.md: how website content is changed (the content and
 * design lanes, D-069 and D-070), what is and isn't editable, and the names of every part of a page.
 *
 *   node scripts/docs/render-content-guide.mjs --out <file.html>   write the page
 *   node scripts/docs/render-content-guide.mjs --check             completeness check only (CI)
 *
 * The check fails when a public page (a page.tsx under app/(site)) is missing from the guide's "Pages and where their
 * content lives" table, or when a content file the table names doesn't exist, so the inventory can't drift from the site.
 */
import fs from "node:fs";
import { parse, render, page, tables, esc, read, root, args, write, svg, box, zone, arrow, figure, inline, useRegistry } from "./page.mjs";
import { model, assertModel } from "./model.mjs";

const FILE = "docs/CONTENT-GUIDE.md";
const a = args();
const src = read(FILE);
const doc = parse(src);

// ---- Completeness check ----------------------------------------------------------------------------------------------
const walk = (dir) => fs.readdirSync(root + dir, { withFileTypes: true }).flatMap((d) => (d.isDirectory() ? walk(`${dir}/${d.name}`) : [`${dir}/${d.name}`]));
const routes = walk("app/(site)").filter((f) => /\/page\.tsx$/.test(f))
  .map((f) => "/" + f.replace(/^app\/\(site\)\/?/, "").replace(/\/?page\.tsx$/, "")).map((r) => r.replace(/\/$/, "") || "/").sort();
const inventory = tables(doc).find((t) => t.section.startsWith("Pages and where their content lives"));
const missing = [];
if (!inventory) missing.push('the "Pages and where their content lives" table');
const listed = new Set((inventory?.rows ?? []).map((r) => r.Address.replace(/`/g, "").trim()));
for (const r of routes) if (!listed.has(r)) missing.push(`public page ${r}`);
for (const l of listed) if (!routes.includes(l)) missing.push(`a page at ${l} (listed, but no app/(site) page has that address)`);
for (const row of inventory?.rows ?? []) {
  for (const [, f] of row["Content source"].matchAll(/`([\w./-]+\.tsx?)`/g)) if (!fs.existsSync(root + f)) missing.push(`file ${f} (named for ${row.Address})`);
}
if (missing.length) { console.error(`${FILE} is out of step with the site:\n- ${missing.join("\n- ")}\nUpdate the guide, then run npm run docs:check again.`); process.exit(1); }
const terms = tables(doc).find((t) => t.section.startsWith("Glossary"))?.rows.length ?? 0;
if (a.check) { console.log(`Content guide: all ${routes.length} public pages are listed; ${terms} glossary terms.`); process.exit(0); }
if (!a.out) { console.error("Usage: node scripts/docs/render-content-guide.mjs --out <file.html> | --check"); process.exit(1); }

// ---- Diagrams ----------------------------------------------------------------------------------------------------------
/** A step flow that wraps onto a second row: [[name, lines]], the first row left to right, the second right to left. */
const snake = (label, steps, perRow, caption, opts = {}) => {
  const w = 150, h = 74, gx = 26, gy = 46, x0 = 14, y0 = 14;
  const pos = steps.map((_, i) => {
    const row = Math.floor(i / perRow), col = i % perRow;
    return [x0 + (row % 2 ? perRow - 1 - col : col) * (w + gx), y0 + row * (h + gy)];
  });
  const parts = steps.map(([n, l], i) => box(pos[i][0], pos[i][1], w, h, `${i + 1}. ${n}`, l, { accent: opts.accent?.includes(i), muted: opts.muted?.includes(i) }));
  for (let i = 1; i < steps.length; i++) {
    const [px, py] = pos[i - 1], [x, y] = pos[i];
    if (py === y) parts.push(x > px ? arrow([[px + w, py + h / 2], [x, y + h / 2]], "") : arrow([[px, py + h / 2], [x + w, y + h / 2]], ""));
    else parts.push(arrow([[px + w / 2, py + h], [x + w / 2, y]], ""));
  }
  if (opts.loop) parts.push(opts.loop(pos, w, h));
  const rows = Math.ceil(steps.length / perRow);
  return figure(svg(x0 * 2 + perRow * w + (perRow - 1) * gx, y0 * 2 + rows * h + (rows - 1) * gy + (opts.extraH ?? 0), label, parts.join("\n")), caption);
};

const lanes = () => {
  const b = [
    zone(10, 10, 540, 112, "Content lane: self-serve"),
    box(26, 40, 150, 66, "Owner or admin", ["edits on a branch in", "the content editor"]),
    box(206, 40, 150, 66, "Save", ["the change request", "opens by itself"]),
    box(386, 40, 150, 66, "Preview", ["private link,", "phone and computer"]),
    zone(10, 148, 540, 112, "Design lane: through Claude"),
    box(26, 178, 150, 66, "Request", ["TAB Practice →", "Website changes"]),
    box(206, 178, 150, 66, "Claude designs", ["options, then a build", "on its own branch"]),
    box(386, 178, 150, 66, "Owner approves", ["on the preview", "(review gate G2)"]),
    box(600, 104, 150, 76, "Automated checks", ["brand, scope of practice,", "accessibility, phones,", "links, search"], { accent: true }),
    box(800, 40, 150, 66, "Fast lane", ["owner content change:", "live automatically"]),
    box(800, 178, 150, 66, "Promote", ["owner says \"promote\"", "(release gate G3)"]),
    box(800, 300, 150, 56, "Live website", ["rollback in one step"], { accent: true }),
    arrow([[176, 73], [206, 73]], ""), arrow([[356, 73], [386, 73]], ""), arrow([[536, 73], [600, 125]], ""),
    arrow([[176, 211], [206, 211]], ""), arrow([[356, 211], [386, 211]], ""), arrow([[536, 211], [600, 162]], ""),
    arrow([[750, 125], [800, 80]], "owner", { at: [770, 92] }),
    arrow([[750, 162], [800, 205]], "admin or design", { at: [782, 170], anchor: "start" }),
    arrow([[950, 73], [974, 73], [974, 328], [950, 328]], ""),
    arrow([[875, 244], [875, 300]], ""),
  ];
  return figure(svg(990, 370, "Two lanes, one set of checks: content changes and design changes both pass the automated checks before going live", b.join("\n")),
    "Both lanes end at the same checks. Only the owner's own content-only changes skip the separate approval round (the fast lane, D-070); everything else waits for the owner.");
};

const contentFlow = () => snake("Editing the website, step by step", [
  ["Open the editor", ["TAB Practice →", "Edit the website"]],
  ["New branch…", ["⋯ menu; one change,", "one branch: content/…"]],
  ["Find the page", ["service pages, guides,", "resources, pages"]],
  ["Edit", ["fields and lists,", "limits as you type"]],
  ["Save", ["the change request", "opens by itself"]],
  ["Checks", ["about 5 minutes;", "preview link"]],
  ["Fast lane", ["merges and promotes;", "don't merge by hand"]],
  ["Live", ["comment says Live.;", "reload the page"]],
], 4, "Steps 1 to 5 are yours, in the editor; 6 to 8 happen by themselves for the owner's own changes. If a check fails, the change request names the rule and the field: fix it in the editor on the same branch and save again. Anyone else's change waits for the owner's approval after step 6.", { accent: [4, 7] });

/** From the last save to the live site, in minutes (CI and production build times measured October 2026). */
const timeline = () => {
  const y = 170, xs = { 0: 80, 1: 210, 5: 470, 6: 590, 8: 770, 10: 905 };
  const w = 150, h = 62;
  const p = [
    `<rect x="${xs[1]}" y="${y - 7}" width="${xs[5] - xs[1]}" height="14" rx="7" class="tl-band"/>`,
    `<text x="${(xs[1] + xs[5]) / 2}" y="${y + 26}" text-anchor="middle" class="t-edge">checks run, about 5 minutes</text>`,
    arrow([[40, y], [975, y]], ""),
    ...Object.entries(xs).map(([m, x]) => `<circle cx="${x}" cy="${y}" r="5" class="tl-dot"/><text x="${x}" y="${y - 14}" text-anchor="middle" class="t-quiet">${m === "10" ? "~10 min" : `${m} min`}</text>`),
  ];
  const at = (x, above, name, lines, opts = {}) => {
    const by = above ? y - 40 - h - 22 : y + 44;
    p.push(arrow([[x, above ? by + h : by], [x, above ? y - 24 : y + 30]], "", { none: true, dashed: true }));
    p.push(box(x - w / 2, by, w, h, name, lines, opts));
  };
  at(xs[0], true, "You save", ["in the editor,", "on your branch"], { accent: true });
  at(xs[5], true, "Preview ready", ["Vercel's comment:", "Visit Preview"]);
  at(xs[10], true, "You check the page", ["reload it on the", "live website"], { accent: true });
  at(xs[1], false, "Change request", ["opens by itself", "(first save only)"]);
  at(xs[6], false, "Fast lane merges", ["owner's own content", "change, checks green"]);
  at(xs[8], false, "Build and promote", ["comment on the change", "request: Live."], { accent: true });
  p.push(box(290 - 85, y - 40 - h - 22, 170, h, "Don't merge here", ["a merge by hand stops", "the fast lane"], { muted: true }));
  return figure(svg(990, 330, "Timeline from your last save to the live site: the change request opens within a minute, the checks run for about five minutes and the preview appears, the fast lane merges at about six minutes, the build is promoted at about eight, and you check the page at about ten", p.join("\n")),
    "Typical times for the owner's own change. Everything below the line happens by itself; the change request shows each step. If a release from Claude that changes the website is already waiting for your \"promote\", your change is merged but waits for that release (\"Not live yet\"); documentation waiting doesn't count.");
};

/** A map of the content editor's screen: where the branch box, the ⋯ menu, Save and the badges are. */
const editorMap = () => {
  const p = [];
  const r = (x, y, w, h, cls, rx = 6) => p.push(`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" class="${cls}"/>`);
  const t = (x, y, s, cls = "t-in", anchor = "start") => p.push(`<text x="${x}" y="${y}" text-anchor="${anchor}" class="${cls}">${esc(s)}</text>`);
  const mark = (x, y, n) => p.push(`<circle cx="${x}" cy="${y}" r="11" class="mk"/><text x="${x}" y="${y + 4}" text-anchor="middle" class="mk-t">${n}</text>`);
  r(20, 20, 950, 420, "wf-page", 10);
  // Sidebar
  r(20, 20, 250, 420, "wf-linen", 10);
  t(40, 50, "TAB Human Performance Center", "t-name");
  r(36, 66, 166, 32, "wf-surface"); t(48, 87, "content/lymphatic-guide ⌄", "t-in");
  r(208, 66, 46, 32, "wf-surface"); t(231, 87, "⋯", "t-name", "middle");
  mark(30, 82, 1); mark(262, 72, 2);
  const menu = [["Dashboard", 0], ["SERVICE PAGES", 1], ["Massage & Bodywork …", 0], ["GUIDES", 1], ["Massage techniques", 0], ["RESOURCES", 1], ["Resources", 0], ["Resource topics", 0], ["PAGES", 1], ["Home, The TAB Method …", 0]];
  menu.forEach(([s, head], i) => t(40, 128 + i * 27, s, head ? "t-zone" : "t-in"));
  r(178, 300, 70, 20, "wf-badge", 10); t(213, 314, "Changed", "t-badge", "middle"); mark(258, 310, 3);
  // The ⋯ menu, open
  r(262, 104, 196, 150, "wf-menu", 8);
  t(276, 126, "BRANCHES", "t-zone"); t(276, 146, "New branch…", "t-name"); t(276, 166, "Delete branch", "t-quiet");
  t(276, 192, "PULL REQUESTS", "t-zone"); t(276, 212, "Pull request #65", "t-name");
  t(276, 238, "Github repo", "t-quiet");
  // Main area
  t(300, 52, "Resources  ›  lymphatic-drainage-basics", "t-name");
  r(740, 36, 66, 22, "wf-badge", 11); t(773, 51, "Unsaved", "t-badge", "middle"); mark(728, 47, 4);
  t(824, 52, "↺  🗑  ⧉", "t-quiet");
  r(880, 32, 74, 30, "wf-btn", 15); t(917, 52, "Save", "t-in-on", "middle"); mark(962, 22, 5);
  [["Title *", 80], ["One-line summary *", 150], ["Topic *", 220], ["Kind", 290]].forEach(([l, y]) => { t(480, y, l, "t-name"); r(480, y + 8, 440, 30, "wf-surface"); });
  r(480, 372, 470, 52, "wf-dark-note", 10); t(496, 394, "You’re looking at main, the live website", "t-in-on"); t(496, 412, "Saving here is turned off … choose New branch", "t-in-on"); mark(470, 380, 6);
  return figure(svg(990, 450, "Map of the content editor: 1 the branch box at the top of the left-hand menu, 2 the ⋯ menu beside it with New branch… and Pull request, 3 the Changed badge on entries that differ from the live site, 4 the Unsaved badge, 5 the Save button at the top right, 6 the notice shown only while you're on main", p.join("\n")),
    "<strong>1</strong> Branch box: which branch you're on; open it to switch. <strong>2</strong> ⋯ menu: <strong>New branch…</strong>, and <strong>Pull request #…</strong> once you've saved. <strong>3</strong> <strong>Changed</strong>: differs from the live website. <strong>4</strong> <strong>Unsaved</strong>: edits not saved yet. <strong>5</strong> <strong>Save</strong>. <strong>6</strong> The notice you see only on <code>main</code>. A drawing, not a screenshot: the branch box and ⋯ menu appear in the hosted editor only.");
};

/** A screenshot of the editor, from docs/images/content-guide (taken in the editor's local mode). */
const shot = (args) => {
  const m = String(args).match(/^([\w-]+)\s+"(.+)"$/);
  if (!m) throw new Error(`<!-- shot ${args} -->: expected <!-- shot name "description" -->`);
  const file = `docs/images/content-guide/${m[1]}.png`;
  if (!fs.existsSync(root + file)) throw new Error(`${FILE}: ${file} doesn't exist`);
  const data = fs.readFileSync(root + file).toString("base64");
  return `<figure class="shot"><img src="data:image/png;base64,${data}" alt="${esc(m[2])}"><figcaption aria-hidden="true">${esc(m[2])}</figcaption></figure>`;
};

const designFlow = () => snake("Design lane, step by step", [
  ["Request", ["TAB Practice → Website", "changes, or tell Claude"]],
  ["Triage", ["Claude's notes: questions,", "options and effort"]],
  ["Choose", ["you pick an option;", "nothing built before"]],
  ["Build", ["Claude's branch, tests,", "preview, screenshots"]],
  ["Review", ["ask for changes", "or say \"approved\""]],
  ["Release", ["you say \"promote\";", "rollback is one step"]],
  ["Hand-off", ["new blocks join the", "library; guide updated"]],
], 4, "Steps 3 and 5 are yours: the owner chooses the approach before anything is built, and approves the preview before anything is released.", { accent: [2, 4] });

/** A labelled wireframe of a service page: every part named the way the glossary names it. */
const anatomy = () => {
  const X = 20, W = 400, L = X + W + 24;
  const parts = [];
  const label = (y, text, sub) => {
    parts.push(arrow([[L - 4, y], [X + W - 6, y]], "", { none: true }));
    parts.push(`<text x="${L}" y="${y + 4}" class="t-name">${esc(text)}</text>${sub ? `<text x="${L}" y="${y + 19}" class="t-quiet">${esc(sub)}</text>` : ""}`);
  };
  const r = (x, y, w, h, cls) => parts.push(`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="4" class="${cls}"/>`);
  const t = (x, y, s, cls = "t-in") => parts.push(`<text x="${x}" y="${y}" class="${cls}">${esc(s)}</text>`);

  r(X, 10, W, 610, "wf-page");
  r(X, 10, W, 20, "wf-dark"); t(X + 12, 24, "TAB Massage & Fitness is becoming …", "t-in-on"); label(20, "Banner");
  r(X, 30, W, 36, "wf-surface"); r(X + 12, 39, 64, 18, "wf-mark"); t(X + 100, 52, "Services  About  Resources", "t-quiet"); r(X + W - 92, 39, 80, 18, "wf-btn"); label(48, "Header", "logo, menu, buttons");
  t(X + 12, 84, "Services / Massage & Bodywork", "t-quiet"); label(80, "Breadcrumb");
  r(X, 94, W, 150, "wf-band");
  t(X + 16, 116, "MASSAGE & BODYWORK", "t-quiet"); label(112, "Eyebrow");
  r(X + 16, 124, 210, 14, "wf-ink"); r(X + 16, 142, 160, 14, "wf-ink"); label(140, "Headline", "one per page");
  r(X + 16, 166, 220, 6, "wf-line"); r(X + 16, 176, 200, 6, "wf-line"); r(X + 16, 186, 180, 6, "wf-line"); label(178, "Lead");
  r(X + 16, 204, 90, 22, "wf-btn"); r(X + 114, 204, 100, 22, "wf-outline"); label(215, "Calls to action", "primary, outline");
  r(X + 256, 112, 128, 116, "wf-photo"); t(X + 300, 174, "Photo", "t-quiet");
  parts.push(`<text x="${X + W - 6}" y="104" text-anchor="end" class="t-zone">HERO</text>`);
  r(X, 244, W, 156, "wf-linen");
  r(X + 16, 262, 160, 12, "wf-ink"); label(268, "Section (band)", "tone: Linen");
  for (let i = 0; i < 3; i++) { r(X + 16 + i * 126, 288, 116, 92, "wf-surface"); r(X + 28 + i * 126, 302, 70, 8, "wf-ink"); r(X + 28 + i * 126, 318, 90, 5, "wf-line"); r(X + 28 + i * 126, 328, 80, 5, "wf-line"); }
  label(334, "Card grid", "focus area cards");
  r(X + 16, 412, W - 32, 34, "wf-linen"); t(X + 28, 433, "Scope of care. …", "t-quiet"); label(429, "Scope note");
  for (let i = 0; i < 3; i++) { r(X + 16, 458 + i * 26, W - 32, 20, "wf-surface"); t(X + 28, 472 + i * 26, `Question ${i + 1}?`, "t-quiet"); t(X + W - 30, 472 + i * 26, "+", "t-quiet"); }
  label(482, "FAQ", "opens to show the answer");
  r(X, 540, W, 44, "wf-dark"); r(X + W / 2 - 60, 551, 120, 22, "wf-btn-light"); label(562, "Call-to-action band", "tone: Graphite");
  r(X, 584, W, 36, "wf-graphite"); t(X + 12, 606, "Address · hours · legal pages", "t-in-on"); label(602, "Footer");
  return figure(svg(L + 210, 630, "Anatomy of a service page: banner, header, breadcrumb, hero with eyebrow, headline, lead, calls to action and photo, a section with a card grid, the scope note, FAQs, a call-to-action band and the footer", parts.join("\n")),
    "A service page with its parts named. Every page is built from these parts; the glossary below defines each one.");
};

/** A request's statuses, in order, with who acts at each; Declined leaves from any open step. */
const statusFlow = () => {
  const steps = [["New", ["Claude reads it"]], ["Questions or options", ["notes: questions,", "options, effort"]], ["Waiting on you", ["the owner answers", "or chooses"]],
    ["In progress", ["Claude builds"]], ["In review", ["preview link on", "the request"]], ["Live", ["on the website"]]];
  const w = 142, gap = 16, y = 20, h = 66;
  const b = steps.map(([n, l], i) => box(10 + i * (w + gap), y, w, h, n, l, { accent: i === 2 || i === 4 }));
  for (let i = 1; i < steps.length; i++) b.push(arrow([[10 + (i - 1) * (w + gap) + w, y + h / 2], [10 + i * (w + gap), y + h / 2]], ""));
  const total = 10 + steps.length * (w + gap) - gap;
  b.push(box(total / 2 - 90, 132, 180, 46, "Declined", ["the notes say why"], { muted: true }));
  b.push(arrow([[10 + 2 * (w + gap) + w / 2, y + h], [total / 2 - 30, 132]], "", { dashed: true }));
  b.push(arrow([[10 + 3 * (w + gap) + w / 2, y + h], [total / 2 + 30, 132]], "", { dashed: true }));
  return figure(svg(total + 10, 190, "Request statuses: New, Questions or options, Waiting on you, In progress, In review, Live; or Declined", b.join("\n")),
    "Shaded steps wait on the owner. Claude moves a request along as the work happens; the owner can change its status at any time, including declining or reopening it.");
};

const directives = { lanes, "content-flow": contentFlow, "design-flow": designFlow, "status-flow": statusFlow, anatomy, timeline, "editor-map": editorMap, shot };
const css = `
.wf-page { fill: var(--bg); stroke: var(--line-strong); }
.wf-surface { fill: var(--surface); stroke: var(--line); }
.wf-band { fill: var(--bg); }
.wf-linen { fill: var(--surface-2); }
.wf-dark, .wf-graphite { fill: var(--primary); }
.wf-graphite { fill: var(--text); }
.wf-mark { fill: var(--primary); }
.wf-ink { fill: var(--text); opacity: 0.85; }
.wf-line { fill: var(--line-strong); }
.wf-btn { fill: var(--primary); }
.wf-btn-light { fill: var(--on-primary); }
.wf-outline { fill: none; stroke: var(--primary); stroke-width: 1.5; }
.wf-photo { fill: var(--linen); stroke: var(--line); }
.wf-menu { fill: var(--surface); stroke: var(--line-strong); }
.wf-badge { fill: var(--surface-2); stroke: var(--primary); }
.wf-dark-note { fill: var(--primary); }
.t-badge { fill: var(--text); font-size: 11px; font-weight: 600; }
.t-in-on { font-size: 11px; font-weight: 700; fill: var(--on-primary); }
.mk { fill: var(--text); }
.mk-t { fill: var(--bg); font-size: 12px; font-weight: 700; }
.tl-band { fill: var(--surface-2); stroke: var(--line); }
.tl-dot { fill: var(--primary); }
.shot { margin: 1.25rem 0; }
.shot img { display: block; max-width: 100%; height: auto; border: 1px solid var(--line); border-radius: 10px; }
.shot figcaption { margin-top: .5rem; font-size: .875rem; color: var(--muted-fg); }
`;

const m = assertModel(model());
useRegistry(m.reg, "contentGuide");
const ctx = { file: FILE, vars: {}, codeLinks: true, directives };
const { html, sections } = render(doc, ctx);
const out = page({
  key: "contentGuide", title: doc.front.title, eyebrow: "TAB Human Performance Center · Website content guide", heading: doc.front.title, file: FILE, version: doc.front.version, commit: a.sha, date: doc.front.updated,
  lede: "Start here to change the website: a step-by-step walkthrough of the content editor from opening it to seeing your change live, worked examples, and what to do when something doesn't look right. Then the reference behind it: the two lanes, who does what, what can and can't be edited, the rules, and the names of every part of a page.",
  stats: [{ n: 2, label: "lanes" }, { n: routes.length, label: "public pages" }, { n: terms, label: "glossary terms" }],
  sections,
  body: html.replace(/<td>/g, "<td data-label>"),
  css,
  foot: `<p>Generated from <code>${FILE}</code> by <code>scripts/docs/render-content-guide.mjs</code>. CI fails if a public page is missing from the page inventory.</p>`,
});
write(a.out, out, `Content guide: ${routes.length} pages, ${terms} terms`);
