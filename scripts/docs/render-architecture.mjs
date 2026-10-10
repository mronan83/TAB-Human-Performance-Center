#!/usr/bin/env node
/**
 * Builds the Technical architecture page from docs/ARCHITECTURE.md plus an inventory read from the repository.
 *
 *   node scripts/docs/render-architecture.mjs --out <file.html>   write the page
 *   node scripts/docs/render-architecture.mjs --check             completeness check only (CI)
 *
 * The check fails when the repository has an environment variable, runtime dependency, API route or lib/ module that
 * docs/ARCHITECTURE.md doesn't mention, so a new component can't arrive without being described.
 *
 * The page also carries the decision log: every D- and DEC- decision, with what on the other pages cites it.
 */
import fs from "node:fs";
import path from "node:path";
import { parse, render, page, esc, read, root, args, write, svg, box, zone, arrow, figure, inline, useRegistry, filters, facet, row, kv, pill, tags, traceList, stLabel, REPO } from "./page.mjs";
import { model, assertModel, byId } from "./model.mjs";

const FILE = "docs/ARCHITECTURE.md";
const a = args();
const src = read(FILE);
const doc = parse(src);

// ---- Read the repository ---------------------------------------------------------------------------------------------
const walk = (dir) => fs.readdirSync(root + dir, { withFileTypes: true }).flatMap((d) => (d.isDirectory() ? walk(`${dir}/${d.name}`) : [`${dir}/${d.name}`]));
const appFiles = walk("app");
const toRoute = (f) => "/" + f.replace(/^app\//, "").replace(/\/(page|route)\.tsx?$/, "").split("/").filter((s) => !/^\(.*\)$/.test(s)).join("/");
const group = (f) => (f.includes("(site)") ? "Public website" : f.includes("/my-tab/") ? "My TAB" : f.includes("/practice/") ? "TAB Practice" : f.startsWith("app/api/") ? "API" : "Site-wide");
const pages = appFiles.filter((f) => /\/page\.tsx$/.test(f)).map((f) => ({ route: toRoute(f).replace(/\/$/, "") || "/", file: f, group: group(f) })).sort((x, y) => x.route.localeCompare(y.route));
const routes = appFiles.filter((f) => /\/route\.ts$/.test(f)).map((f) => {
  const code = read(f);
  return { route: toRoute(f), file: f, methods: [...code.matchAll(/export async function (GET|POST|PUT|PATCH|DELETE)/g)].map((m) => m[1]).join(", "), group: group(f) };
});
const pkg = JSON.parse(read("package.json"));
const envVars = [...read(".env.example").matchAll(/^([A-Z][A-Z0-9_]+)=/gm)].map((m) => m[1]);
const libModules = walk("lib").filter((f) => /\.tsx?$/.test(f));
const actionsSrc = read("app/(portal)/actions.ts");
const actions = [...actionsSrc.matchAll(/export async function (\w+)\(/g)].map((m) => m[1]);
const migrations = fs.readdirSync(root + "supabase/migrations").filter((f) => f.endsWith(".sql")).sort().map((f) => {
  const body = read(`supabase/migrations/${f}`);
  const first = body.split("\n").map((l) => l.replace(/^--\s?/, "").trim()).find((l) => l && !/^-+$/.test(l)) ?? "";
  return { file: f, about: first.replace(/\s+/g, " ").slice(0, 170), lines: body.split("\n").length };
});
const specs = fs.readdirSync(root + "e2e").filter((f) => f.endsWith(".spec.ts")).map((f) => {
  const body = read(`e2e/${f}`);
  const head = body.match(/^\/\*\*?\s*\n?\s*\*?\s*(.+)$/m)?.[1] ?? body.match(/^\/\/\s*(.+)$/m)?.[1] ?? "";
  return { file: `e2e/${f}`, tests: (body.match(/\btest\(/g) ?? []).length, about: head.replace(/\*\/$/, "").trim() };
});
const rlsChecks = (read("supabase/tests/rls.test.mjs").match(/^\s*(?:await\s+)?(?:check|expectDenied|knownGap)\(/gm) ?? []).length;
const ci = read(".github/workflows/ci.yml");
const ciSteps = [...ci.matchAll(/^\s*- name: (.+)$/gm)].map((m) => m[1]);

// ---- Completeness check ----------------------------------------------------------------------------------------------
const DEP_WORDS = { next: "Next.js", react: "React", "react-dom": "React", "@supabase/ssr": "@supabase/ssr", "@supabase/supabase-js": "@supabase/supabase-js", resend: "Resend", stripe: "Stripe", zod: "zod", clsx: "clsx" };
const missing = [];
for (const v of envVars) if (!src.includes(v)) missing.push(`environment variable ${v}`);
for (const d of Object.keys(pkg.dependencies)) if (!src.includes(DEP_WORDS[d] ?? d)) missing.push(`runtime dependency ${d}${DEP_WORDS[d] ? ` (as "${DEP_WORDS[d]}")` : ""}`);
for (const r of routes.filter((r) => r.group === "API" || r.route.includes("callback"))) {
  const short = r.route.replace(/^\/api\//, "app/api/");
  if (!src.includes(r.route) && !src.includes(short)) missing.push(`route ${r.route}`);
}
for (const m of libModules) {
  const rel = m.replace(/\.tsx?$/, "");
  const base = path.basename(rel);
  if (!src.includes(m) && !src.includes(`${base}.ts`) && !src.includes(rel)) missing.push(`module ${m}`);
}
const m = assertModel(model());
if (missing.length) { console.error(`${FILE} doesn't describe:\n- ${missing.join("\n- ")}\nDescribe each one, then run npm run docs:check again.`); process.exit(1); }
if (a.check) { console.log(`Architecture: ${envVars.length} environment variables, ${Object.keys(pkg.dependencies).length} runtime dependencies, ${routes.length} route handlers and ${libModules.length} lib modules are all described.`); process.exit(0); }
if (!a.out) { console.error("Usage: node scripts/docs/render-architecture.mjs --out <file.html> | --check"); process.exit(1); }

// ---- Diagrams ----------------------------------------------------------------------------------------------------------
const context = () => {
  const b = [
    box(20, 70, 130, 56, "Visitors", ["prospective clients"]),
    box(20, 150, 130, 56, "Clients", ["My TAB"]),
    box(20, 230, 130, 56, "Practitioners", ["TAB Practice"]),
    zone(190, 30, 330, 300, "Vercel project tab-human-performance-center"),
    box(210, 62, 290, 66, "Public website", ["prebuilt pages, edge cache", "app/(site)"], { accent: true }),
    box(210, 150, 290, 66, "My TAB and TAB Practice", ["server components and actions", "app/(portal), lib/portal"], { accent: true }),
    box(210, 240, 140, 70, "Middleware", ["redirects, CSP,", "session refresh"]),
    box(360, 240, 140, 70, "API routes", ["/api/inquiry,", "/api/stripe/…"]),
    zone(560, 30, 200, 300, "Services"),
    box(575, 58, 170, 44, "Timely", ["booking (links only)"], { muted: true }),
    box(575, 112, 170, 44, "Supabase", ["Auth and Postgres + RLS"]),
    box(575, 166, 170, 44, "Resend", ["email"]),
    box(575, 220, 170, 44, "Cloudflare Turnstile", ["human check"]),
    box(575, 274, 170, 44, "Stripe", ["checkout, billing"]),
    arrow([[150, 98], [210, 95]], ""), arrow([[150, 178], [210, 183]], ""), arrow([[150, 258], [210, 200]], ""),
    arrow([[500, 90], [575, 80]], "link", { dashed: true, at: [537, 78] }),
    arrow([[500, 175], [575, 134]], "session", { at: [530, 146] }),
    arrow([[500, 258], [575, 190]], ""), arrow([[500, 268], [575, 242]], ""),
    arrow([[575, 300], [500, 288]], "webhook", { at: [537, 310] }),
  ];
  return figure(svg(780, 345, "System context: one Vercel project and five services", b.join("\n")),
    "Shaded boxes are the application's two faces; middleware and the API routes serve both. Timely is dashed: the site only links to it (D-003).");
};
const flow = (label, steps, caption) => {
  const w = 138, gap = 18, y = 30;
  const b = steps.map(([n, l], i) => box(10 + i * (w + gap), y, w, 76, n, l, { accent: i === 0 })).join("\n")
    + steps.slice(1).map((_, i) => arrow([[10 + i * (w + gap) + w, y + 38], [10 + (i + 1) * (w + gap), y + 38]], "")).join("\n");
  return figure(svg(10 + steps.length * (w + gap), 120, label, b), caption);
};
const directives = {
  "diagram:context": context,
  "diagram:flow-start": () => flow("Start Where You Are submission", [
    ["Visitor", ["answers predefined", "questions at /start"]], ["/api/inquiry", ["origin, rate limits,", "honeypot, Turnstile"]],
    ["Validate", ["zod schema in", "lib/inquiry.ts"]], ["Resend", ["to TAB and to the", "submitter; no details"]],
    ["inquiries table", ["after the go-live gate", "(storeSubmissions)"]]], "Spam is answered exactly like success, so bots learn nothing (lib/spam.ts)."),
  "diagram:flow-invite": () => flow("Invitation and first sign-in", [
    ["Practitioner", ["Invite to My TAB", "on the client page"]], ["clients row", ["invited_at stamped", "under RLS"]],
    ["Supabase Auth", ["sends the invitation", "(service role)"]], ["Client's link", ["/my-tab/auth/", "callback"]],
    ["First sign-in", ["activated_at recorded;", "shown as active"]]], "Sending waits until the row-level-security-checked update succeeds, so only the care team can invite."),
  "diagram:flow-release": () => flow("From pull request to production", [
    ["Pull request", ["claude/* branch"]], ["CI", ["typecheck, RLS, docs,", "build, e2e, audit"]],
    ["Owner approves", ["on the Vercel", "preview (G2)"]], ["Squash merge", ["production build,", "not yet live"]],
    ["Promote (G3)", ["that exact build;", "rollback = previous"]]], "Database migrations need their own G3 approval before they run on production."),
  "generated:inventory": () => {
    const L = (f) => `<a class="code" href="${REPO}/blob/main/${f}" target="_blank" rel="noopener"><code>${esc(f)}</code></a>`;
    const byGroup = ["Public website", "My TAB", "TAB Practice"].map((g) => `<h3 id="routes-${g.toLowerCase().replace(/\W+/g, "-")}">${g} pages (${pages.filter((p) => p.group === g).length})</h3>
<div class="table-wrap"><table class="md"><thead><tr><th scope="col">Path</th><th scope="col">File</th></tr></thead><tbody>${pages.filter((p) => p.group === g).map((p) => `<tr><td class="nowrap"><code>${esc(p.route)}</code></td><td>${L(p.file)}</td></tr>`).join("")}</tbody></table></div>`).join("\n");
    const deps = (o, kind) => Object.entries(o).map(([n, v]) => `<tr><td><code>${esc(n)}</code></td><td class="nowrap">${esc(v)}</td><td>${kind}</td></tr>`).join("");
    return `${byGroup}
<h3 id="route-handlers">Route handlers (${routes.length})</h3>
<div class="table-wrap"><table class="md"><thead><tr><th scope="col">Path</th><th scope="col">Methods</th><th scope="col">File</th></tr></thead><tbody>${routes.map((r) => `<tr><td class="nowrap"><code>${esc(r.route)}</code></td><td>${r.methods}</td><td>${L(r.file)}</td></tr>`).join("")}</tbody></table></div>
<h3 id="server-actions">Server actions (${actions.length})</h3>
<p class="note">Exported from <code>app/(portal)/actions.ts</code>. Every one calls <code>requireClient()</code> or <code>requireStaff()</code> before it touches data.</p>
<div class="table-wrap"><table class="md"><thead><tr><th scope="col">Action</th><th scope="col">Guard</th></tr></thead><tbody>${actions.map((n) => {
      const body = actionsSrc.split(`export async function ${n}(`)[1]?.split(/\nexport /)[0] ?? "";
      const guard = /requireStaff\(/.test(body) ? "requireStaff" : /requireClient\(/.test(body) ? "requireClient" : /Demo|demo|signIn|signOut|login/i.test(n) ? "sign-in flow" : "—";
      return `<tr><td><code>${esc(n)}</code></td><td>${guard}</td></tr>`;
    }).join("")}</tbody></table></div>
<h3 id="dependencies">Dependencies</h3>
<div class="table-wrap"><table class="md"><thead><tr><th scope="col">Package</th><th scope="col">Version</th><th scope="col">Kind</th></tr></thead><tbody>${deps(pkg.dependencies, "Runtime")}${deps(pkg.devDependencies, "Build and test")}</tbody></table></div>
<h3 id="environment-variables">Environment variables (${envVars.length})</h3>
<p class="note">Names from <code>.env.example</code>; values live in Vercel and never in git.</p>
<div class="table-wrap"><table class="md"><thead><tr><th scope="col">Name</th><th scope="col">Exposed to the browser</th></tr></thead><tbody>${envVars.map((v) => `<tr><td><code>${v}</code></td><td>${v.startsWith("NEXT_PUBLIC_") ? "Yes" : "No, server only"}</td></tr>`).join("")}</tbody></table></div>
<h3 id="database">Database and tests</h3>
<p>${migrations.length} migrations, from <code>${migrations[0].file}</code> to <code>${migrations.at(-1).file}</code>. The schema they build is on the data model page. <code>supabase/tests/rls.test.mjs</code> holds ${rlsChecks} database checks; ${specs.length} end-to-end spec files hold ${specs.reduce((s, x) => s + x.tests, 0)} test blocks (some run once per page).</p>
<div class="table-wrap"><table class="md"><thead><tr><th scope="col">Migration</th><th scope="col">What it does</th><th scope="col">Lines</th></tr></thead><tbody>${migrations.map((m) => `<tr><td class="nowrap">${L(`supabase/migrations/${m.file}`)}</td><td>${esc(m.about)}</td><td class="nowrap">${m.lines}</td></tr>`).join("")}</tbody></table></div>
<div class="table-wrap"><table class="md"><thead><tr><th scope="col">Spec</th><th scope="col">Test blocks</th></tr></thead><tbody>${specs.map((s) => `<tr><td>${L(s.file)}</td><td>${s.tests}</td></tr>`).join("")}</tbody></table></div>
<h3 id="workflow">Workflow and scripts</h3>
<p><code>.github/workflows/ci.yml</code> runs these steps on every pull request and on <code>main</code>: ${ciSteps.map((s) => esc(s)).join(" · ")}.</p>
<div class="table-wrap"><table class="md"><thead><tr><th scope="col">npm script</th><th scope="col">Runs</th></tr></thead><tbody>${Object.entries(pkg.scripts).map(([k, v]) => `<tr><td class="nowrap"><code>${esc(k)}</code></td><td><code>${esc(v)}</code></td></tr>`).join("")}</tbody></table></div>`;
  },
};

// ---- Decision log -------------------------------------------------------------------------------------------------------
directives["generated:decisions"] = () => {
  const D = [...m.decisions].sort((x, y) => byId(x.id, y.id));
  const ST = ["accepted", "proposed", "superseded"];
  const areaOf = (d) => d.area || "Other";
  const bar = filters({
    noun: "decisions", total: D.length, placeholder: "Search decisions: an ID, a word…",
    facets: [
      facet("status", "Status", D, (d) => d.status, ST, stLabel, (v) => v),
      facet("kind", "Record", D, (d) => (d.id.startsWith("DEC") ? "dec" : +d.id.slice(2) > 55 ? "register" : "master"), ["master", "register", "dec"], (v) => ({ master: "Master record (D-001 to D-055)", register: "Proposed in the register", dec: "Source documents (DEC)" })[v]),
      facet("area", "Area", D, areaOf),
    ],
  });
  const rows = D.map((d) => {
    const cited = m.list(m.rel.citedBy, d.id);
    const changes = d.changes && d.changes !== "—" ? inline(d.changes, ctx) : "";
    const supersededBy = d.statusWord && /superseded by/i.test(d.title) ? "" : "";
    const body = kv([
      ["Decision", d.full ? inline(d.full, ctx) : ""],
      ["Changes", changes],
      ["Source", inline(d.source + (d.date ? `, ${d.date}` : ""), ctx)],
      ["Cited by", cited.length ? traceList(cited) : ""],
    ]) + supersededBy;
    return row({
      id: d.id, anchor: d.id.toLowerCase(), title: inline(d.title, { ...ctx, self: d.id }), long: d.title.length > 120,
      facts: [[areaOf(d), d.date].filter(Boolean).map(esc).join(" · "), cited.length ? `Cited by ${cited.length}` : ""],
      side: pill(d.status, d.statusWord), body: body || `<p class="none">Nothing on the other pages cites it yet.</p>`,
      data: { status: d.status, kind: d.id.startsWith("DEC") ? "dec" : +d.id.slice(2) > 55 ? "register" : "master", area: areaOf(d) },
      search: `${d.id} ${d.title} ${d.full ?? ""} ${d.area ?? ""} ${cited.join(" ")}`,
    });
  }).join("\n");
  return `${bar}<div class="rows">${rows}</div>`;
};

useRegistry(m.reg, "architecture");
const ctx = { file: FILE, vars: {}, codeLinks: true, directives };
const { html, sections } = render(doc, ctx);
const proposed = m.decisions.filter((d) => d.status === "proposed").length;
const out = page({
  key: "architecture", title: doc.front.title, eyebrow: doc.front.eyebrow, heading: doc.front.heading, file: FILE, version: doc.front.version, commit: a.sha, date: doc.front.updated,
  lede: inline(doc.front.lede, ctx),
  stats: [
    { n: pages.length, label: "pages" }, { n: routes.length, label: "route handlers" }, { n: actions.length, label: "server actions" },
    { n: migrations.length, label: "migrations" }, { n: rlsChecks, label: "database checks" }, { n: specs.reduce((s, x) => s + x.tests, 0), label: "e2e test blocks" },
    { n: m.decisions.length, label: "decisions on record" }, { n: proposed, label: "proposed, awaiting the master record", tone: proposed ? "st-you" : "" },
  ],
  sections,
  statusKey: ["accepted", "proposed", "superseded"],
  body: html.replace(/<td>/g, "<td data-label>"),
  foot: `<p>Generated from <code>${FILE}</code> and the repository by <code>scripts/docs/render-architecture.mjs</code>. CI fails if a new environment variable, dependency, API route or lib/ module isn't described here, or a decision is cited that the record doesn't hold.</p>`,
});
write(a.out, out, `Architecture page: ${pages.length} pages, ${routes.length} route handlers, ${actions.length} actions`);
