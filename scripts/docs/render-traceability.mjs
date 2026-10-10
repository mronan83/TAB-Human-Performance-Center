#!/usr/bin/env node
/**
 * Builds the Requirements & traceability page (the hub of the living documents) from docs/TRACEABILITY.md.
 *
 *   node scripts/docs/render-traceability.mjs --out <file.html>   write the page
 *   node scripts/docs/render-traceability.mjs --check             verify the trace only (CI)
 *
 * The check fails when the trace is broken: a register requirement missing here (or one here that the register lacks),
 * a feature, gap or question referenced but not defined, a requirement whose Features column disagrees with the
 * Requirements column of the features it names, or a status the page can't read. Each requirement and feature row also
 * lists, from the other sources, the backlog items, user stories and tables that trace to it.
 */
import { render, page, inline, esc, read, exists, args, write, svg, box, arrow, figure, statusOf, statusCell, useRegistry, filters, facet, row, kv, tags, traceList, pill, stack, stLabel, table, expandIds, REPO } from "./page.mjs";
import { model, assertModel, AREAS, FUNCTIONAL, OPEN, byId } from "./model.mjs";

const a = args();
const m = assertModel(model());
const T = m.trace;
const FILE = T.file;
const { doc, reqs, features, gaps, questions } = T;
const area = (id) => id.split("-")[0];

// ---- Counts ------------------------------------------------------------------------------------------------------------
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
for (const ar of Object.keys(AREAS)) {
  const rs = reqs.filter((r) => area(r.ID) === ar);
  vars[`pct.${ar}`] = pct(count(rs, "verified"), rs.length);
  vars[`built.${ar}`] = count(rs, "built");
  vars[`total.${ar}`] = rs.length;
}

// ---- Trace checks --------------------------------------------------------------------------------------------------------
const errors = [];
const register = new Set([...read("docs/requirements-register.md").matchAll(/^\| ((?:WEB|GS|PORTAL|STAFF|CMS|INT|SEC|NFR|DS)-\d{3}) \|/gm)].map((x) => x[1]));
const here = new Set(reqs.map((r) => r.ID));
for (const id of register) if (!here.has(id)) errors.push(`${id} is in the requirements register but not in ${FILE}`);
for (const id of here) if (!register.has(id)) errors.push(`${id} is in ${FILE} but not in the requirements register`);
const fById = Object.fromEntries(features.map((f) => [f.ID, f]));
for (const r of reqs.filter((r) => r.Features !== undefined)) for (const f of expandIds(r.Features)) {
  if (!f.startsWith("F-")) continue;
  if (!fById[f]) errors.push(`${r.ID} names ${f}, which the feature inventory doesn't define`);
  else if (!expandIds(fById[f].Requirements).includes(r.ID)) errors.push(`${r.ID} names ${f}, but ${f}'s Requirements column doesn't list ${r.ID}`);
}
for (const f of features) for (const id of expandIds(f.Requirements)) {
  if (!/^(WEB|GS|PORTAL|STAFF|CMS|INT|SEC|NFR|DS)-\d{3}$/.test(id)) continue;
  if (!here.has(id)) errors.push(`${f.ID} lists ${id}, which isn't a requirement here`);
  const r = reqs.find((x) => x.ID === id);
  if (r && r.Features !== undefined && FUNCTIONAL.includes(area(id)) && !expandIds(r.Features).includes(f.ID)) errors.push(`${f.ID} lists ${id}, but ${id}'s Features column doesn't name ${f.ID}`);
}
for (const r of [...reqs, ...features]) if (!statusOf(r.Status)) errors.push(`${r.ID}'s status "${r.Status}" doesn't start with Verified, Built, Partial, Planned or Deferred`);
const text = doc.blocks.map((b) => b.text ?? (b.items ?? []).map((i) => i.text ?? i).join(" ") ?? "").join(" ") + T.all.flatMap((t) => t.rows.map((r) => Object.values(r).join(" "))).join(" ");
for (const x of text.matchAll(/\b(F-\d{2}|TG-\d+|Q-\d+|BO-\d+)\b/g)) if (!m.reg.has(x[1])) errors.push(`${x[1]} is referenced but not defined in ${FILE}`);
const unique = [...new Set(errors)];
if (unique.length) { console.error(`Traceability check failed (${unique.length}):\n- ${unique.join("\n- ")}`); process.exit(1); }
if (a.check) { console.log(`Traceability: ${req.total} requirements match the register; ${features.length} features, ${gaps.length} gaps, ${questions.length} questions all resolve; ${m.stories.stories.length} stories and ${m.backlog.items.size} backlog items trace to them.`); process.exit(0); }
if (!a.out) { console.error("Usage: node scripts/docs/render-traceability.mjs --out <file.html> | --check"); process.exit(1); }

useRegistry(m.reg, "traceability");
const ctx = { file: FILE, vars, codeLinks: true };
const md = (t, self) => inline(t, { ...ctx, self });

// ---- Shared pieces -------------------------------------------------------------------------------------------------------
/** "smoke, a11y, rls" → links to the files that hold those checks. */
const CHECK_FILE = { rls: "supabase/tests/rls.test.mjs", contrast: "scripts/check-contrast.mjs", brand: "scripts/check-brand.mjs" };
const checks = (s) => (!s || s === "—" ? "" : s.split(/,\s*/).map((w) => {
  const f = CHECK_FILE[w] ?? (/^[a-z-]+$/.test(w) ? `e2e/${w}.spec.ts` : null);
  return f && exists(f) ? `<a class="code" href="${REPO}/blob/main/${f}" target="_blank" rel="noopener"><code>${esc(w)}</code></a>` : md(w);
}).join(", "));
const statusWord = (s) => s.match(/^\s*(\w+)/)?.[1] ?? "";
const qual = (s) => s.match(/^\s*\w+\s*\(([^)]*)\)/)?.[1] ?? "";
const reason = (s) => s.replace(/^\s*\w+(\s*\([^)]*\))?\s*:?\s*/, "");
const sidePill = (s) => pill(statusOf(s), statusWord(s), qual(s) ? ` <small>${esc(qual(s))}</small>` : "");
const ST = ["verified", "built", "partial", "planned", "deferred"];
const featuresOf = (r) => (r.Features !== undefined ? expandIds(r.Features).filter((x) => x.startsWith("F-")) : m.list(m.rel.featuresFor, r.ID));

function reqRow(r) {
  const feats = featuresOf(r);
  const backlog = m.list(m.rel.backlogFor, r.ID);
  const openBacklog = backlog.filter((id) => OPEN(m.backlog.items.get(id).status));
  const stories = m.list(m.rel.storiesFor, r.ID);
  const tbls = m.list(m.rel.tablesFor, r.ID);
  const why = reason(r.Status);
  const body = kv([
    ["Status", why ? md(why, r.ID) : ""],
    ["How it is enforced", r["How it is enforced"] ? md(r["How it is enforced"], r.ID) : ""],
    ["Features", feats.length ? traceList(feats) : ""],
    ["Verified by", checks(r["Verified by"])],
    ["Backlog", backlog.length ? traceList(backlog) : ""],
    ["User stories", stories.length ? tags(stories) : ""],
    ["Tables", tbls.length ? tags(tbls) : ""],
  ]);
  return row({
    id: r.ID, anchor: r.ID.toLowerCase(), title: md(r.Requirement, r.ID), long: true,
    facts: [`${esc(AREAS[area(r.ID)])} · Phase ${esc(r.Phase)} · <span class="pr${r.Priority === "Must" ? " must" : ""}">${esc(r.Priority)}</span>`, feats.length ? `Features ${tags(feats)}` : "", openBacklog.length ? `Open work ${tags(openBacklog)}` : ""],
    side: sidePill(r.Status), body,
    data: { status: statusOf(r.Status), area: area(r.ID), phase: r.Phase.replace(/\W+/g, ""), priority: r.Priority, stories: stories.length ? "yes" : "no" },
    search: `${r.ID} ${r.Requirement} ${r.Status} ${r["How it is enforced"] ?? ""} ${feats.join(" ")} ${backlog.join(" ")} ${stories.join(" ")} ${r["Verified by"] ?? ""}`,
  });
}
function featureRow(f, group) {
  const rq = expandIds(f.Requirements).filter((x) => m.reg.get(x)?.kind?.startsWith("Requirement"));
  const stories = m.list(m.rel.storiesFor, f.ID);
  const work = [...new Set(expandIds(`${f.Status} ${f.Backlog ?? ""}`).filter((x) => /^[AC]\d/.test(x) && m.backlog.items.has(x)))].sort(byId);
  const why = reason(f.Status);
  const body = kv([
    ["Status", why ? md(why, f.ID) : ""],
    ["Requirements", rq.length ? traceList(rq) : md(f.Requirements, f.ID)],
    ["Decisions", f.Decisions ? md(f.Decisions, f.ID) : ""],
    ["Code", f.Code ? md(f.Code, f.ID) : ""],
    ["Checks", checks(f.Checks)],
    ["Backlog", work.length ? traceList(work) : f.Backlog ? md(f.Backlog, f.ID) : ""],
    ["User stories", stories.length ? tags(stories) : ""],
  ]);
  return row({
    id: f.ID, anchor: f.ID.toLowerCase(), title: md(f.Feature, f.ID), long: f.Feature.length > 90,
    facts: [rq.length ? `Requirements ${tags(rq.slice(0, 6))}${rq.length > 6 ? ` +${rq.length - 6}` : ""}` : "", stories.length ? `${stories.length} user stor${stories.length === 1 ? "y" : "ies"}` : ""],
    side: sidePill(f.Status), body,
    data: { status: statusOf(f.Status), group },
    search: `${f.ID} ${f.Feature} ${f.Status} ${f.Requirements} ${f.Code ?? ""} ${work.join(" ")}`,
  });
}

// ---- Directives ------------------------------------------------------------------------------------------------------------
const directives = {
  "filters:requirements": (_, c) => {
    const nfrSection = /^Non-functional/.test(c.section);
    const list = reqs.filter((r) => FUNCTIONAL.includes(area(r.ID)) !== nfrSection);
    return filters({
      noun: "requirements", total: list.length, placeholder: "Search requirements: an ID, a word, a feature, a check…",
      facets: [
        facet("status", "Status", list, (r) => statusOf(r.Status), ST, stLabel, (v) => v),
        facet("area", "Area", list, (r) => area(r.ID), Object.keys(AREAS), (v) => AREAS[v]),
        facet("priority", "Priority", list, (r) => r.Priority, ["Must", "Should", "Could"]),
        facet("phase", "Phase", list, (r) => r.Phase.replace(/\W+/g, ""), null, (v) => ({ P0P1: "P0/P1", "P1": "P1" })[v] ?? v),
        facet("stories", "User stories", list, (r) => (m.list(m.rel.storiesFor, r.ID).length ? "yes" : "no"), ["yes", "no"], (v) => (v === "yes" ? "Has stories" : "No story")),
      ],
    });
  },
  "filters:features": () => filters({
    noun: "features", total: features.length, placeholder: "Search features: an ID, a word, a file…",
    facets: [
      facet("status", "Status", features, (f) => statusOf(f.Status), ST, stLabel, (v) => v),
      facet("group", "Where", features, (f) => f._sub, ["Public website", "My TAB (client portal)", "TAB Practice (practitioner workspace)", "Delivery and operations", "Planned"], (v) => v.replace(/ \(.*\)/, "")),
    ],
  }),
  "diagram:trace-model": () => {
    const xs = [20, 172, 324, 476, 628], w = 132, y = 120, h = 84;
    const chain = [
      ["Objective", ["BO-n", `${T.objectives.length} on this page`]],
      ["Requirement", ["WEB, GS, SEC…", `${req.total}, as in the register`]],
      ["Feature", ["F-nn", `${features.length} on this page`]],
      ["Code", ["app, lib, components,", "supabase/migrations"]],
      ["Check", ["e2e, rls, contrast", "run on every PR"]],
    ];
    const body = [
      box(20, 22, 284, 54, "User stories (US-nnn)", [`${m.stories.stories.length} stories, ${m.stories.personas.length} personas`], {}),
      box(330, 22, 278, 54, "Decisions (D-, DEC-)", [`${m.decisions.length} on the architecture page`], {}),
      arrow([[160, 76], [230, y]], "", { dashed: true }), arrow([[400, 76], [390, y]], "", { dashed: true }),
      ...chain.map(([n, l], i) => box(xs[i], y, w, h, n, l, { accent: i === 1 || i === 2 })),
      ...xs.slice(0, 4).map((x) => arrow([[x + w, y + h / 2], [x + w + 20, y + h / 2]], "")),
      box(172, 250, 284, 50, "Backlog items (A, C)", [`${[...m.backlog.items.values()].filter((it) => OPEN(it.status)).length} open on the backlog page`], {}),
      box(476, 250, 284, 50, "Tables", [`${m.data.schema.tables.length} on the data model page`], {}),
      arrow([[260, 250], [238, y + h]], "", { dashed: true }), arrow([[560, 250], [540, y + h]], "", { dashed: true }),
    ];
    return figure(svg(780, 314, "Every requirement traces up to an objective and a story, and down to the features, code and checks that prove it", body.join("\n")),
      "Requirements and features are this page's own levels. Stories say who needs each requirement and why; decisions shape them; backlog items deliver what isn't done; tables hold the data.");
  },
  "chart:status-by-area": () => {
    const rows = Object.keys(AREAS).map((ar) => ({ ar, rows: reqs.filter((r) => area(r.ID) === ar) })).filter((x) => x.rows.length);
    const overall = req.verified / req.total;
    return `<div class="bars">${rows.map(({ ar, rows: rs }) => {
      const v = rs.filter((r) => statusOf(r.Status) === "verified").length;
      const parts = [["done", v], ["ready", count(rs, "built")], ["progress", count(rs, "partial")], ["queued", count(rs, "planned")], ["muted", count(rs, "deferred")]];
      return `<div class="bar-row"><span><b>${esc(AREAS[ar])}</b> <span class="muted small">${ar} · ${rs.length}</span></span>${stack(parts, `${AREAS[ar]}: ${v} of ${rs.length} verified`)}<span class="stack-l"${v / rs.length >= overall ? ' style="font-weight:700"' : ""}>${pct(v, rs.length)} verified</span></div>`;
    }).join("")}</div><p class="small muted">${pill("verified")} ${pill("built")} ${pill("partial")} ${pill("planned")} ${pill("deferred")} · all requirements: ${pct(req.verified, req.total)} verified. Portal rows are verified against the demo build.</p>`;
  },
  "generated:holds-back": () => {
    const open = [...m.backlog.items.values()].filter((it) => OPEN(it.status) && it.requirements.length).sort((x, y) => x.milestone.localeCompare(y.milestone) || byId(x.id, y.id));
    return `<div class="table-wrap"><table class="md"><thead><tr><th scope="col">Backlog item</th><th scope="col">Status</th><th scope="col">Requirements it delivers</th></tr></thead><tbody>${open.map((it) => `<tr><td data-label="Backlog item">${tags([it.id])} ${esc(it.title)} <span class="muted small">${it.milestone}</span></td><td data-label="Status">${pill(it.status)}</td><td data-label="Requirements">${tags(it.requirements)}</td></tr>`).join("")}</tbody></table></div>`;
  },
  "generated:risks": () => {
    const R = m.risks.filter((r) => r.id.startsWith("R-"));
    const lv = (s) => (/high/i.test(s) ? 3 : /med/i.test(s) ? 2 : 1);
    const LV = ["", "Low", "Medium", "High"];
    let grid = `<div class="riskgrid" role="group" aria-label="Risks by likelihood (rows, high at the top) and impact (columns)"><span class="ax"></span>${[1, 2, 3].map((i) => `<span class="ax top">Impact ${LV[i]}</span>`).join("")}`;
    for (const l of [3, 2, 1]) {
      grid += `<span class="ax">${LV[l]}</span>`;
      for (const i of [1, 2, 3]) {
        const here = R.filter((r) => lv(r.likelihood) === l && lv(r.impact) === i);
        const heat = l + i >= 5 ? " h3" : l + i === 4 ? " h2" : "";
        grid += `<div class="cell${heat}">${here.length ? here.map((r) => tags([r.id])).join("") : '<span class="none">—</span>'}</div>`;
      }
    }
    grid += `</div><p class="small muted">Rows are likelihood (high at the top), columns impact. Tinted by each risk's status: ${pill("open")} ${pill("mitigating")} ${pill("closed")}</p>`;
    const all = [...m.risks].sort((x, y) => byId(x.id, y.id));
    const bar = filters({
      noun: "risks", total: all.length, placeholder: "Search risks…",
      facets: [
        facet("status", "Status", all, (r) => r.status || "none", ["open", "mitigating", "closed", "none"], (v) => (v === "none" ? "Not rated" : stLabel(v)), (v) => (v === "none" ? null : v)),
        facet("src", "Source", all, (r) => (r.id.startsWith("RSK") ? "rsk" : "mdr"), ["mdr", "rsk"], (v) => (v === "mdr" ? "Master record (R-)" : "Engineering (RSK-)")),
      ],
    });
    const rows = all.map((r) => row({
      id: r.id, anchor: r.id.toLowerCase(), title: md(r.title, r.id), long: true,
      facts: [r.likelihood ? `Likelihood ${esc(r.likelihood)} · impact ${esc(r.impact)}` : "", r.related ? `Related ${md(r.related, r.id)}` : ""],
      side: r.status ? pill(r.status, r.statusWord) : "",
      body: kv([["Risk", r.full ? md(r.full, r.id) : ""], ["Mitigation", r.mitigation ? md(r.mitigation, r.id) : ""], ["Recommendation", r.recommendation ? md(r.recommendation, r.id) : ""], ["Source", esc(r.source)]]),
      data: { status: r.status || "none", src: r.id.startsWith("RSK") ? "rsk" : "mdr" },
      search: `${r.id} ${r.title} ${r.full ?? ""} ${r.mitigation ?? ""} ${r.recommendation ?? ""}`,
    })).join("\n");
    return `${grid}${bar}<div class="rows">${rows}</div>`;
  },
};

// Requirement and feature tables become expandable rows; the change log shows newest first.
ctx.tableHook = (b, sec, sub) => {
  if (b.head[0] !== "ID" && sec?.title !== "Change log") return null;
  const rowsOf = () => b.rows.map((r) => Object.fromEntries(b.head.map((h, i) => [h, r[i] ?? ""])));
  if (/requirements$/i.test(sec?.title ?? "") && b.head.includes("Requirement")) {
    return `<div class="sub" data-group><div class="rows">${rowsOf().map(reqRow).join("\n")}</div></div>`;
  }
  if (sec?.title === "Feature inventory") return `<div class="sub" data-group><div class="rows">${rowsOf().map((f) => featureRow(f, sub?.title ?? "")).join("\n")}</div></div>`;
  if (sec?.title === "Change log") {
    const ver = (v) => v.split(".").map(Number);
    const sorted = [...b.rows].sort((x, y) => { const [a1, a2] = ver(x[1]), [b1, b2] = ver(y[1]); return b1 - a1 || b2 - a2; });
    return table(b.head, sorted, ctx, { noAnchors: true });
  }
  return null;
};
ctx.directives = directives;
const { html, sections } = render(doc, ctx);
const openGaps = gaps.filter((g) => m.reg.get(g.ID)?.status === "open").length;
const openQ = questions.filter((q) => m.reg.get(q.ID)?.status === "open").length;
const out = page({
  key: "traceability", title: doc.front.title, eyebrow: doc.front.eyebrow, heading: doc.front.heading, file: FILE, version: doc.front.version, commit: a.sha, date: doc.front.updated,
  lede: md(`TAB Human Performance Center's ${req.total} requirements trace up to the objectives and user stories behind them, and down to ${features.length} features, the backlog items still to do and the checks that prove them. ${req.verified} (${pct(req.verified, req.total)}) are verified by a check that fails if they break; ${req.built} more are built with nothing to catch a regression. My TAB and TAB Practice are verified against the demo build only, until the go-live gate (A15).`),
  stats: [
    { n: req.total, label: "requirements" }, { n: req.verified, label: "verified by a check", small: pct(req.verified, req.total) }, { n: features.length, label: "features" },
    { n: m.stories.stories.length, label: "user stories" }, { n: openGaps, label: "open gaps", tone: openGaps ? "st-blocked" : "" }, { n: openQ, label: "open questions", tone: openQ ? "st-you" : "" },
    { n: m.risks.filter((r) => r.status === "open").length, label: "open risks (R-)" },
  ],
  sections,
  statusKey: ST,
  body: html,
  foot: `<p>Generated from <code>${FILE}</code> by <code>scripts/docs/render-traceability.mjs</code>, with the backlog, user stories, data model and decision record it links to. CI fails if it falls out of step with the requirements register.</p>`,
});
write(a.out, out, `Requirements page: ${req.total} requirements, ${features.length} features`);
