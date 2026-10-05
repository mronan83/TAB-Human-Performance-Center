#!/usr/bin/env node
/**
 * Builds the Requirements & Feature Traceability page from docs/TRACEABILITY.md.
 *
 *   node scripts/docs/render-traceability.mjs --out <file.html>   write the page
 *   node scripts/docs/render-traceability.mjs --check             verify the trace only (CI)
 *
 * The check fails when the trace is broken: a register requirement missing here (or one here that the register lacks),
 * a feature, gap or question referenced but not defined, or a requirement whose Features column disagrees with the
 * Requirements column of the features it names.
 */
import { parse, tables, render, page, inline, esc, read, sha, args, write, svg, box, arrow, figure, statusOf, REPO, ID_RE } from "./page.mjs";

const FILE = "docs/TRACEABILITY.md";
const a = args();
const doc = parse(read(FILE));
const all = tables(doc);
const REQ = /^(WEB|GS|PORTAL|STAFF|CMS|INT|SEC|NFR|DS)-\d{3}$/;
const FUNCTIONAL = ["WEB", "GS", "PORTAL", "STAFF", "CMS", "INT"];
const AREA_NAMES = { WEB: "Public website", GS: "Start Where You Are", PORTAL: "My TAB", STAFF: "TAB Practice", CMS: "Content (CMS)", INT: "Integrations", SEC: "Security and privacy", NFR: "Quality and launch", DS: "Design system" };

const reqs = all.filter((t) => /requirements$/i.test(t.section)).flatMap((t) => t.rows).filter((r) => REQ.test(r.ID));
const features = all.filter((t) => t.section === "Feature inventory").flatMap((t) => t.rows).filter((r) => /^F-\d{2}$/.test(r.ID));
const gaps = all.flatMap((t) => t.rows).filter((r) => /^TG-\d+$/.test(r.ID ?? ""));
const questions = all.flatMap((t) => t.rows).filter((r) => /^Q-\d+$/.test(r.ID ?? ""));
const anchors = new Set(all.flatMap((t) => t.rows.map((r) => r.ID)).filter(Boolean));

// ---- Counts ------------------------------------------------------------------------------------------------------------
const area = (id) => id.split("-")[0];
const count = (rows, st) => rows.filter((r) => statusOf(r.Status) === st).length;
const block = (rows) => ({ total: rows.length, verified: count(rows, "verified"), built: count(rows, "built"), partial: count(rows, "partial"), planned: count(rows, "planned"), deferred: count(rows, "deferred") });
const fr = block(reqs.filter((r) => FUNCTIONAL.includes(area(r.ID))));
const nfr = block(reqs.filter((r) => !FUNCTIONAL.includes(area(r.ID))));
const req = block(reqs);
const fb = block(features);
const pct = (n, d) => `${Math.round((n / d) * 100)}%`;
const vars = {};
for (const [k, v] of Object.entries({ fr, nfr, req, f: fb })) for (const [kk, vv] of Object.entries(v)) vars[`${k}.${kk}`] = vv;
vars["f.builtAny"] = fb.total - fb.planned - fb.deferred;
vars["req.verifiedPct"] = pct(req.verified, req.total);
vars["gaps"] = gaps.length;
vars["questions"] = questions.length;

// ---- Trace checks --------------------------------------------------------------------------------------------------------
const expand = (text) => {
  const out = new Set();
  for (const m of (text ?? "").matchAll(/\b([A-Z]+)-(\d+) to (?:\1-)?(\d+)\b/g)) for (let i = +m[2]; i <= +m[3]; i++) out.add(`${m[1]}-${String(i).padStart(m[2].length, "0")}`);
  for (const m of (text ?? "").matchAll(ID_RE)) out.add(m[1]);
  return out;
};
const errors = [];
const register = new Set([...read("docs/requirements-register.md").matchAll(/^\| ((?:WEB|GS|PORTAL|STAFF|CMS|INT|SEC|NFR|DS)-\d{3}) \|/gm)].map((m) => m[1]));
const here = new Set(reqs.map((r) => r.ID));
for (const id of register) if (!here.has(id)) errors.push(`${id} is in the requirements register but not in ${FILE}`);
for (const id of here) if (!register.has(id)) errors.push(`${id} is in ${FILE} but not in the requirements register`);
const fById = Object.fromEntries(features.map((f) => [f.ID, f]));
for (const r of reqs.filter((r) => r.Features !== undefined)) for (const f of expand(r.Features)) {
  if (!f.startsWith("F-")) continue;
  if (!fById[f]) errors.push(`${r.ID} names ${f}, which the feature inventory doesn't define`);
  else if (!expand(fById[f].Requirements).has(r.ID)) errors.push(`${r.ID} names ${f}, but ${f}'s Requirements column doesn't list ${r.ID}`);
}
for (const f of features) for (const id of expand(f.Requirements)) {
  if (!REQ.test(id)) continue;
  if (!here.has(id)) errors.push(`${f.ID} lists ${id}, which isn't a requirement here`);
  const r = reqs.find((x) => x.ID === id);
  if (r && r.Features !== undefined && FUNCTIONAL.includes(area(id)) && !expand(r.Features).has(f.ID)) errors.push(`${f.ID} lists ${id}, but ${id}'s Features column doesn't name ${f.ID}`);
}
const text = doc.blocks.map((b) => b.text ?? (b.items ?? []).join(" ") ?? "").join(" ") + all.flatMap((t) => t.rows.map((r) => Object.values(r).join(" "))).join(" ");
for (const m of text.matchAll(/\b(F-\d{2}|TG-\d+|Q-\d+|BO-\d+)\b/g)) if (!anchors.has(m[1])) errors.push(`${m[1]} is referenced but not defined in ${FILE}`);
const unique = [...new Set(errors)];
if (unique.length) { console.error(`Traceability check failed (${unique.length}):\n- ${unique.join("\n- ")}`); process.exit(1); }
if (a.check) { console.log(`Traceability: ${req.total} requirements match the register; ${features.length} features, ${gaps.length} gaps, ${questions.length} questions all resolve.`); process.exit(0); }
if (!a.out) { console.error("Usage: node scripts/docs/render-traceability.mjs --out <file.html> | --check"); process.exit(1); }

// ---- Diagram: the trace model ------------------------------------------------------------------------------------------
const traceModel = () => {
  const xs = [20, 172, 324, 476, 628], w = 132, y = 120, h = 84;
  const chain = [
    ["Objective", ["BO-n", `${anchors.size && [...anchors].filter((x) => x.startsWith("BO-")).length} in this page`]],
    ["Requirement", ["WEB, GS, SEC…", `${req.total}, as in the register`]],
    ["Feature", ["F-nn", `${features.length} in this page`]],
    ["Code", ["app, lib, components,", "supabase/migrations"]],
    ["Check", ["e2e, rls, contrast", "run on every PR"]],
  ];
  const body = [
    box(172, 30, 284, 46, "Decisions and owner rulings", ["D-###, DEC-###, register §7.1"], {}),
    arrow([[230, 76], [230, y]], "", { dashed: true }), arrow([[390, 76], [390, y]], "", { dashed: true }),
    ...chain.map(([n, l], i) => box(xs[i], y, w, h, n, l, { accent: i === 1 || i === 2 })),
    ...xs.slice(0, 4).map((x) => arrow([[x + w, y + h / 2], [x + w + 20, y + h / 2]], "")),
    box(172, 250, 436, 46, "Backlog items (A, C), gaps (TG-n), questions (Q-n)", ["explain every status short of Verified"], {}),
    arrow([[230, 250], [230, y + h]], "", { dashed: true }), arrow([[390, 250], [390, y + h]], "", { dashed: true }),
  ];
  return figure(svg(780, 310, "Every requirement traces from an objective down to the check that proves it", body.join("\n")),
    "Requirements and features are this page's own levels. Decisions shape them; open work explains anything short of Verified.");
};

// ---- Chart: status by area -------------------------------------------------------------------------------------------
const statusByArea = () => {
  const order = Object.keys(AREA_NAMES);
  const ST = ["verified", "built", "partial", "planned", "deferred"];
  const left = 190, W = 420, top = 64, rh = 30;
  const rows = order.map((ar) => ({ ar, rows: reqs.filter((r) => area(r.ID) === ar) })).filter((x) => x.rows.length);
  const overall = req.verified / req.total;
  const refX = left + overall * W;
  const bars = rows.map(({ ar, rows: rs }, i) => {
    const yy = top + i * rh;
    let x = left;
    const segs = ST.map((st) => {
      const n = rs.filter((r) => statusOf(r.Status) === st).length;
      if (!n) return "";
      const wd = (n / rs.length) * W;
      const s = `<rect x="${x.toFixed(1)}" y="${yy}" width="${wd.toFixed(1)}" height="20" class="seg-${st}"><title>${AREA_NAMES[ar]}: ${n} of ${rs.length} ${st}</title></rect>`;
      x += wd;
      return s;
    }).join("");
    const v = rs.filter((r) => statusOf(r.Status) === "verified").length;
    return `<text x="${left - 10}" y="${yy + 14}" text-anchor="end" class="t-label">${AREA_NAMES[ar]} (${rs.length})</text>${segs}<text x="${left + W + 10}" y="${yy + 14}" class="${v / rs.length >= overall ? "t-name" : "t-quiet"}">${pct(v, rs.length)} verified</text>`;
  }).join("\n");
  const legend = ST.filter((st) => reqs.some((r) => statusOf(r.Status) === st)).map((st, i) => `<rect x="${left + i * 92}" y="30" width="12" height="12" class="seg-${st}"/><text x="${left + i * 92 + 18}" y="40" class="t-quiet">${st[0].toUpperCase() + st.slice(1)}</text>`).join("");
  const yEnd = top + rows.length * rh;
  const body = `<text x="20" y="18" class="t-title">${req.verified} of ${req.total} requirements have a check that fails if they break</text>${legend}${bars}
<line x1="${refX}" x2="${refX}" y1="${top - 8}" y2="${yEnd}" class="ref-line"/><text x="${refX}" y="${yEnd + 16}" text-anchor="middle" class="t-quiet">All requirements: ${pct(req.verified, req.total)} verified</text>`;
  return figure(svg(760, yEnd + 28, `${req.verified} of ${req.total} requirements are verified`, body),
    "Share of each area's requirements by status, counted from the tables on this page. Portal rows are verified against the demo build.");
};

// ---- Page ----------------------------------------------------------------------------------------------------------------
const ctx = { file: FILE, vars, anchors, codeLinks: true, directives: { "diagram:trace-model": traceModel, "chart:status-by-area": statusByArea } };
const { html, sections } = render(doc, ctx);
const commit = a.sha ?? sha();
const openGaps = gaps.length;
const out = page({
  key: "traceability",
  title: doc.front.title,
  eyebrow: doc.front.eyebrow,
  heading: doc.front.heading,
  meta: `As of ${esc(doc.front.updated)} · ${esc(doc.front.owner)} · from <code>${FILE}</code> at <a href="${REPO}/commit/${esc(commit)}" target="_blank" rel="noopener"><code>${esc(commit)}</code></a>`,
  lede: inline(`TAB Human Performance Center's ${req.total} requirements trace to ${features.length} features, the decisions behind them, and the checks that prove them. ${req.verified} (${pct(req.verified, req.total)}) are verified by a check that fails if they break; ${req.built} more are built with nothing to catch a regression. My TAB and TAB Practice are verified against the demo build only, until the go-live gate (A15). Start with the open questions and the gaps found while tracing.`, ctx),
  stats: [[req.total, "requirements"], [req.verified, "verified by a check", pct(req.verified, req.total)], [features.length, "features"], [openGaps, "gaps found"], [questions.length, "open questions"]],
  note: `This page is generated from <code>${FILE}</code>, which is where requirements are edited and versioned. CI fails if it falls out of step with the requirements register.`,
  sections,
  body: html,
  filter: [["verified", "Verified"], ["built", "Built, no check"], ["partial", "Partial"], ["planned", "Planned"], ["deferred", "Deferred"]],
  foot: `<p>Generated from <code>${FILE}</code> at <code>${esc(commit)}</code> by <code>scripts/docs/render-traceability.mjs</code>. Its history is <code>git log ${FILE}</code>; the change log above summarizes it.</p>`,
});
write(a.out, out, `Traceability page: ${req.total} requirements, ${features.length} features`);
