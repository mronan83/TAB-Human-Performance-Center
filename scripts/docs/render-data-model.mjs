#!/usr/bin/env node
/**
 * Builds the Data model page from docs/DATA-MODEL.md (the written half) and docs/schema.json (what the migrations
 * build; refresh it with npm run docs:schema).
 *
 *   node scripts/docs/render-data-model.mjs --out <file.html>   write the page
 *   node scripts/docs/render-data-model.mjs --check             completeness check only (CI)
 *
 * The check fails when a table or function in the schema isn't described in docs/DATA-MODEL.md, or the file
 * describes one the schema doesn't have.
 */
import { parse, tables, render, page, esc, read, sha, args, write, svg, zone, arrow, figure, REPO } from "./page.mjs";

const FILE = "docs/DATA-MODEL.md";
const a = args();
const doc = parse(read(FILE));
const schema = JSON.parse(read("docs/schema.json"));
const strip = (s) => s.replace(/`/g, "").trim();

// ---- Written half: domains and functions -------------------------------------------------------------------------------
const domainRows = tables(doc).filter((t) => t.section.startsWith("Domains"));
const domainOf = {}, about = {}, access = {};
const domains = [];
for (const t of domainRows) {
  domains.push(t.sub);
  for (const r of t.rows) { const n = strip(r.Table); domainOf[n] = t.sub; about[n] = r["What it holds"]; access[n] = r["Who reads and writes"]; }
}
const fnRows = tables(doc).find((t) => t.section.startsWith("Functions"))?.rows ?? [];
const fnAbout = Object.fromEntries(fnRows.map((r) => [strip(r.Function), r["What it does"]]));

// ---- Check -------------------------------------------------------------------------------------------------------------
const errors = [];
const tableNames = schema.tables.map((t) => t.name);
const fnNames = [...new Set(schema.functions.map((f) => f.name))];
for (const n of tableNames) if (!domainOf[n]) errors.push(`table ${n} has no row under Domains`);
for (const n of Object.keys(domainOf)) if (!tableNames.includes(n)) errors.push(`Domains describes ${n}, which the migrations don't create`);
for (const n of fnNames) if (!fnAbout[n]) errors.push(`function ${n} has no row under Functions`);
for (const n of Object.keys(fnAbout)) if (!fnNames.includes(n)) errors.push(`Functions describes ${n}, which the migrations don't create`);
for (const t of schema.tables) if (!t.rls) errors.push(`table ${t.name} has row-level security off`);
if (errors.length) { console.error(`${FILE} is out of step with docs/schema.json:\n- ${errors.join("\n- ")}`); process.exit(1); }
if (a.check) { console.log(`Data model: ${tableNames.length} tables in ${domains.length} domains and ${fnNames.length} functions are all described; row-level security is on for every table.`); process.exit(0); }
if (!a.out) { console.error("Usage: node scripts/docs/render-data-model.mjs --out <file.html> | --check"); process.exit(1); }

// ---- Derived -------------------------------------------------------------------------------------------------------------
const fks = schema.tables.flatMap((t) => t.constraints.filter((c) => c.kind === "foreign key").map((c) => ({ from: t.name, def: c.def, to: c.ref_table })));
const policyCount = schema.tables.reduce((s, t) => s + t.policies.length, 0);
const triggerCount = schema.tables.reduce((s, t) => s + t.triggers.length, 0);
const tableAnchor = (n) => `t-${n}`;
const tlink = (n) => (tableNames.includes(n) ? `<a class="ref" href="#${tableAnchor(n)}">${n}</a>` : esc(n === "users" ? "auth.users" : n));

// ---- Diagram: domains around the client -----------------------------------------------------------------------------------
const domainsDiagram = () => {
  const W = 236, H = 186, xs = [12, 272, 532], ys = [36, 246, 456];
  const slots = { "Website and integrations": [0, 0], "Care record": [1, 0], "Programs": [2, 0], "Audit": [0, 1], "People and access": [1, 1], "Progress and check-ins": [2, 1], "Commerce and cohorts": [1, 2], "Forms and resources": [2, 2] };
  const free = [[0, 2], [0, 3]];
  domains.filter((d) => !slots[d]).forEach((d, i) => { if (free[i]) slots[d] = free[i]; });
  const center = slots["People and access"];
  const LINK = { "Care record": "→ clients by client_id", "Programs": "→ clients through client_programs", "Progress and check-ins": "→ clients by client_id", "Forms and resources": "→ clients by client_id", "Commerce and cohorts": "→ clients: entitlements, members", "Website and integrations": "→ clients once a submission is routed", "Audit": "records every change to client data", "Private": "→ clients by client_id; functions only", "People and access": "clients is the hub every domain points to" };
  let body = "";
  for (const d of domains) {
    const s = slots[d]; if (!s) continue;
    const x = xs[s[0]], y = ys[s[1]];
    const names = Object.keys(domainOf).filter((n) => domainOf[n] === d);
    body += zone(x, y, W, H, d) + names.map((n, i) => `<a href="#${tableAnchor(n)}"><text x="${x + 14}" y="${y + 40 + i * 17}" class="${n === "clients" ? "t-name" : "t-label"}" style="font-family:var(--font-mono)">${n}</text></a>`).join("")
      + `<text x="${x + 14}" y="${y + H - 10}" class="t-edge">${esc(LINK[d] ?? "")}</text>`;
    if (d === "People and access") continue;
    const [c0, c1] = center;
    const sx = s[0] < c0 ? x + W : s[0] > c0 ? x : x + W / 2, sy = s[1] < c1 ? y + H : s[1] > c1 ? y : y + H / 2;
    const ex = s[0] < c0 ? xs[c0] : s[0] > c0 ? xs[c0] + W : xs[c0] + W / 2, ey = s[1] < c1 ? ys[c1] : s[1] > c1 ? ys[c1] + H : ys[c1] + H / 2;
    body += arrow([[sx, sy], [ex, ey]], "", { dashed: d === "Audit" || d === "Website and integrations" });
  }
  return figure(svg(780, 656, "Eight domains around the client record", body),
    `Table names link to their cards. Solid arrows are a <code>client_id</code> on every row; dashed ones link only when there is a client to link to.`);
};

// ---- Table cards -------------------------------------------------------------------------------------------------------------
const colNotes = (t, c) => {
  const notes = [];
  for (const k of t.constraints) {
    const cols = (k.def.match(/^(?:PRIMARY KEY|UNIQUE|FOREIGN KEY) \(([^)]+)\)/)?.[1] ?? "").split(", ");
    if (!cols.includes(c.name)) continue;
    if (k.kind === "primary key") notes.push("primary key");
    if (k.kind === "unique") notes.push(cols.length > 1 ? `unique with ${cols.filter((x) => x !== c.name).join(", ")}` : "unique");
    if (k.kind === "foreign key" && cols.length === 1) notes.push(`→ ${tlink(k.ref_table)}${/ON DELETE CASCADE/.test(k.def) ? " (cascade)" : /ON DELETE SET NULL/.test(k.def) ? " (set null)" : ""}`);
  }
  if (c.comment) notes.push(esc(c.comment));
  return notes.join("; ");
};
const card = (t) => {
  const search = [t.name, about[t.name], ...t.columns.map((c) => c.name)].join(" ").toLowerCase().replace(/[`"]/g, "");
  const ctx = { file: FILE, anchors: new Set() };
  const md = (s) => esc(s ?? "").replace(/`([^`]+)`/g, (_, x) => `<code>${x}</code>`);
  const guards = t.triggers.filter((g) => !/audit_row|set_updated_at/.test(g.function));
  return `<article class="tcard" id="${tableAnchor(t.name)}" data-search="${esc(search)}">
<header><h4>${t.name}</h4><span class="badge${t.rls ? "" : " off"}">RLS ${t.rls ? "on" : "off"}</span><span class="badge q">${t.columns.length} columns</span><span class="badge q">${t.policies.length} ${t.policies.length === 1 ? "policy" : "policies"}</span>${t.triggers.some((g) => g.function === "audit_row") ? '<span class="badge q">audited</span>' : ""}</header>
<p class="what">${md(about[t.name])}${/[.!?]$/.test(about[t.name] ?? "") ? "" : "."} <span class="note">${md(access[t.name])}.</span></p>
<div class="table-wrap"><table><thead><tr><th scope="col">Column</th><th scope="col">Type</th><th scope="col">Null</th><th scope="col">Default</th><th scope="col">Notes</th></tr></thead><tbody>
${t.columns.map((c) => `<tr><td class="nowrap"><code>${c.name}</code></td><td class="nowrap">${esc(c.type)}</td><td>${c.nullable ? "yes" : ""}</td><td><code>${esc(c.default ?? "")}</code></td><td>${colNotes(t, c)}</td></tr>`.replace("<td><code></code></td>", "<td></td>")).join("\n")}
</tbody></table></div>
<details><summary>Policies (${t.policies.length}), guards (${guards.length}) and constraints</summary>
<ul>${t.policies.map((p) => `<li><code>${p.name}</code> · ${p.cmd}${p.using ? ` · who: <code>${esc(p.using.replace(/\s+/g, " "))}</code>` : ""}${p.with_check ? ` · writes: <code>${esc(p.with_check.replace(/\s+/g, " "))}</code>` : ""}</li>`).join("") || "<li>No policies: only the service role can use this table.</li>"}
${guards.map((g) => `<li>Trigger <code>${g.name}</code> → <code>${g.function}</code>: ${md(fnAbout[g.function] ?? "")}</li>`).join("")}
${t.constraints.filter((k) => k.kind === "check" || (k.kind === "unique" && /,/.test(k.def)) || (k.kind === "foreign key" && /,/.test(k.def.split(")")[0]))).map((k) => `<li>${k.kind} <code>${k.name}</code>: <code>${esc(k.def)}</code></li>`).join("")}
${t.indexes.map((i) => `<li>Index <code>${i.name}</code>: <code>${esc(i.def.replace(/^CREATE (UNIQUE )?INDEX \S+ ON public\.\S+ USING /, (m, u) => (u ? "unique " : "")))}</code></li>`).join("")}</ul></details>
</article>`;
};
const tablesHtml = () => domains.map((d) => `<h3 id="tables-${d.toLowerCase().replace(/\W+/g, "-")}">${esc(d)}</h3><div class="cards">${schema.tables.filter((t) => domainOf[t.name] === d).map(card).join("\n")}</div>`).join("\n");
const enumsHtml = () => `<div class="table-wrap"><table><thead><tr><th scope="col">Enum</th><th scope="col">Values</th><th scope="col">Used by</th></tr></thead><tbody>${schema.enums.map((e) => {
  const used = schema.tables.filter((t) => t.columns.some((c) => c.type === e.name || c.type === `${e.name}[]`)).map((t) => t.columns.filter((c) => c.type.startsWith(e.name)).map((c) => `${tlink(t.name)}.${c.name}`).join(", "));
  return `<tr><td class="nowrap"><code>${e.name}</code></td><td>${e.values.map((v) => `<code>${esc(v)}</code>`).join(" ")}</td><td>${used.join("; ") || "function arguments"}</td></tr>`;
}).join("")}</tbody></table></div>`;
const securityHtml = () => `<div class="table-wrap"><table><thead><tr><th scope="col">Table</th><th scope="col">RLS</th><th scope="col">Read</th><th scope="col">Insert</th><th scope="col">Update</th><th scope="col">Delete</th><th scope="col">Guards</th><th scope="col">Audited</th></tr></thead><tbody>${schema.tables.map((t) => {
  const who = (cmd) => {
    const ps = t.policies.filter((p) => p.cmd === cmd || p.cmd === "ALL");
    const s = new Set();
    for (const p of ps) {
      const e = ((cmd === "INSERT" ? p.with_check : p.using ?? p.with_check) ?? "").replace(/\s+/g, " ");
      const limited = /shared|visible_to_client|visibility|status = 'draft'/.test(e);
      if (/'owner'::app_role/.test(e)) s.add("owner");
      if (/'practitioner'::app_role/.test(e)) s.add("practitioner, own clients");
      if (/is_staff\(\)/.test(e) && /can_access_client/.test(e)) s.add("care team");
      else if (/is_staff\(\)/.test(e)) s.add("staff");
      if (/can_access_client\((client_)?id\)/.test(e) && !/is_staff\(\) AND/.test(e)) { s.add("care team"); s.add(limited ? "client, shared only" : "client, own"); }
      else if (!/cohort_members/.test(e) && /my_client_id\(\)|profile_id = auth\.uid\(\)|\(id = auth\.uid\(\)\)/.test(e)) s.add(limited ? "client, drafts only" : "client, own");
      if (/auth\.uid\(\) IS NOT NULL/.test(e)) s.add(/published|is_staff/.test(e) ? "signed in, published" : "signed in");
      if (/^\(?active OR is_staff/.test(e.trim())) s.add("anyone, active only");
      if (/can_read_program/.test(e)) s.add("entitled clients");
      if (/cohort_members/.test(e)) s.add("cohort members");
      if (/EXISTS/.test(e) && /wellness_plans p/.test(e)) { s.add("care team"); s.add("client, own"); }
    }
    const order = ["owner", "staff", "care team", "practitioner, own clients", "client, own", "client, shared only", "client, drafts only", "cohort members", "entitled clients", "signed in", "signed in, published", "anyone, active only"];
    return [...s].sort((x, y) => order.indexOf(x) - order.indexOf(y)).join("; ") || "—";
  };
  const guards = [...new Set(t.triggers.map((g) => g.function).filter((f) => /^(guard_|forbid_|stamp_)/.test(f)))];
  return `<tr><td class="nowrap">${tlink(t.name)}</td><td>${t.rls ? "on" : "<strong>off</strong>"}</td><td>${who("SELECT")}</td><td>${who("INSERT")}</td><td>${who("UPDATE")}</td><td>${who("DELETE")}</td><td class="nowrap">${guards.map((g) => `<code>${g}</code>`).join("<br>") || "—"}</td><td>${t.triggers.some((g) => g.function === "audit_row") ? "yes" : ""}</td></tr>`;
}).join("\n")}</tbody></table></div>
<p class="note">Read from the policies in <code>docs/schema.json</code>. "Care team" is staff on the client's care team, and the owner (<code>is_staff()</code> with <code>can_access_client()</code>); "client, own" is the client's own rows; "shared only" means rows marked shared or visible. Open a table's card for the exact expressions.</p>`;

const directives = { "diagram:domains": domainsDiagram, "generated:tables": tablesHtml, "generated:enums": enumsHtml, "generated:security": securityHtml };
const ctx = { file: FILE, vars: {}, anchors: new Set(), codeLinks: true, directives };
const { html, sections } = render(doc, ctx);
const commit = a.sha ?? sha();
const out = page({
  key: "dataModel",
  title: doc.front.title,
  eyebrow: doc.front.eyebrow,
  heading: doc.front.heading,
  meta: `The schema the migrations build, as of ${esc(doc.front.updated)} · ${esc(doc.front.owner)} · at <a href="${REPO}/commit/${esc(commit)}" target="_blank" rel="noopener"><code>${esc(commit)}</code></a>`,
  lede: esc(doc.front.lede).replace("docs/schema.json", "<code>docs/schema.json</code>"),
  stats: [[schema.tables.length, "tables"], [schema.enums.length, "enums"], [fnNames.length, "functions"], [fks.length, "foreign keys"], [policyCount, "security policies"], [triggerCount, "triggers"]],
  note: `Generated from <code>${FILE}</code> and <code>docs/schema.json</code> (${schema.migrations.length} migrations). Git keeps their history.`,
  sections,
  body: html,
  filter: [],
  filterPlaceholder: "Find a table, column or function…",
  foot: `<p>Generated at <code>${esc(commit)}</code> by <code>scripts/docs/render-data-model.mjs</code>. CI fails if <code>docs/schema.json</code> differs from what the migrations build, or if a table or function isn't described in <code>${FILE}</code>.</p>`,
});
write(a.out, out, `Data model page: ${schema.tables.length} tables, ${fnNames.length} functions`);
