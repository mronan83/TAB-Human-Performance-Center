/**
 * The model behind the living documents: every source read once, every ID given one home, and every link between them
 * worked out in both directions. Each page renderer builds from model(), so the pages can't disagree about an ID's
 * title, status or relations, and `npm run docs:check` checks the whole set in one place.
 *
 * Sources: docs/TRACEABILITY.md (objectives, requirements, features, gaps, questions), docs/BACKLOG.md (owner actions
 * and engineering work), docs/USER-STORIES.md (personas, epics, stories), docs/DATA-MODEL.md with docs/schema.json
 * (tables), docs/requirements-register.md (DEC decisions, RSK risks, proposed D- decisions) and the master decision
 * record in docs/source/batch-3 (D- decisions, R- risks).
 */
import { parse, tables, read, exists, expandIds, idsIn, statusOf } from "./page.mjs";

export const REQ_RE = /^(WEB|GS|PORTAL|STAFF|CMS|INT|SEC|NFR|DS)-\d{3}$/;
export const AREAS = { WEB: "Public website", GS: "Start Where You Are", PORTAL: "My TAB", STAFF: "TAB Practice", CMS: "Content", INT: "Integrations", SEC: "Security and privacy", NFR: "Quality and launch", DS: "Design system" };
export const FUNCTIONAL = ["WEB", "GS", "PORTAL", "STAFF", "CMS", "INT"];
export const BACKLOG_STATUS = { "Done": "done", "Dropped": "dropped", "In review": "review", "In progress": "progress", "Ready": "ready", "Queued": "queued", "Blocked": "blocked", "Waiting on you": "you", "Deferred": "deferred" };
export const OPEN = (st) => !["done", "dropped"].includes(st);
export const SIZE_DAYS = { S: 0.25, M: 1, L: 3 };
const FIELDS = ["Status", "Owner", "Category", "Size", "Depends on", "Waits on", "Where", "Requirements", "Done when", "Done"];
const MASTER = "docs/source/batch-3/TAB_Wellness_Collective_Master_Decision_Risk_Architecture_Record.md";
const strip = (s) => String(s ?? "").replace(/`/g, "").trim();
const plain = (s) => String(s ?? "").replace(/\*\*?|`/g, "").replace(/\[([^\]]+)\]\([^)]+\)/g, "$1").replace(/\s+/g, " ").trim();
const short = (s, n = 200) => { const p = plain(s); return p.length > n ? p.slice(0, n - 1).replace(/\s+\S*$/, "") + "…" : p; };
const ids = (s) => expandIds(s).sort();

/** "- **Status:** Done · **Owner:** Claude" → [["Status","Done"],["Owner","Claude"]], or null when the line isn't fields. */
export function fieldLine(text) {
  const parts = text.split(/\s+·\s+(?=\*\*)/);
  const out = [];
  for (const p of parts) { const m = p.match(/^\*\*([^*]+?):\*\*\s*(.*)$/); if (!m) return null; out.push([m[1].trim(), m[2].trim()]); }
  return out;
}

// ---- Backlog -------------------------------------------------------------------------------------------------------------
export function loadBacklog(errors) {
  const FILE = "docs/BACKLOG.md";
  const doc = parse(read(FILE));
  const milestones = [], items = new Map(), sections = {};
  let ms = null, item = null, named = null;
  for (const b of doc.blocks) {
    if (b.type === "h2") {
      item = null; named = null;
      const m = b.text.match(/^(P\d) · (.+)$/);
      if (m) { ms = { id: m[1], title: m[2], goal: [], items: [] }; milestones.push(ms); }
      else { ms = null; named = b.text; sections[named] = []; }
      continue;
    }
    if (b.type === "h3") {
      const m = b.text.match(/^([AC]\d+[a-z]?) · (.+)$/);
      if (!m || !ms) { errors.push(`${FILE}: "### ${b.text}" isn't an item heading ("### C12 · Title") inside a milestone`); continue; }
      if (items.has(m[1])) errors.push(`${FILE}: ${m[1]} appears twice`);
      item = { id: m[1], title: m[2], milestone: ms.id, deps: [], requirements: [], body: [], prs: [] };
      items.set(item.id, item);
      ms.items.push(item.id);
      continue;
    }
    if (named) { sections[named].push(b); continue; }
    if (!item) { if (ms) ms.goal.push(b); continue; }
    if (b.type === "ul") {
      for (const text of b.items) {
        const f = fieldLine(text);
        if (!f) { item.body.push({ type: "li", text }); continue; }
        for (const [k, v] of f) {
          if (!FIELDS.includes(k)) { errors.push(`${FILE}: ${item.id} has an unknown field "${k}"`); continue; }
          if (k === "Status") { item.statusWord = v; item.status = BACKLOG_STATUS[v]; if (!item.status) errors.push(`${FILE}: ${item.id} has status "${v}"; use one of ${Object.keys(BACKLOG_STATUS).join(", ")}`); }
          else if (k === "Owner") item.owner = v;
          else if (k === "Category") item.category = v;
          else if (k === "Size") { item.size = v; if (!SIZE_DAYS[v]) errors.push(`${FILE}: ${item.id} has size "${v}"; use S, M or L`); }
          else if (k === "Depends on") item.deps = v.split(/,\s*/).map((x) => x.trim()).filter(Boolean);
          else if (k === "Waits on") item.waitsOn = v;
          else if (k === "Where") item.where = v;
          else if (k === "Requirements") item.requirements = ids(v);
          else if (k === "Done when") item.doneWhen = v;
          else if (k === "Done") { const [d, ...rest] = v.split(/\s+·\s+/); item.doneDate = d; item.prs = rest.join(" ").match(/#\d+/g)?.map((x) => x.slice(1)) ?? []; }
        }
      }
      continue;
    }
    item.body.push({ type: b.type, text: b.text, items: b.items });
  }
  for (const it of items.values()) {
    for (const k of ["status", "owner", "category", "size"]) if (!it[k]) errors.push(`${FILE}: ${it.id} has no ${k[0].toUpperCase() + k.slice(1)}`);
    if (!OPEN(it.status) && !it.doneDate) errors.push(`${FILE}: ${it.id} is ${it.statusWord} but has no "Done:" date`);
    it.yours = /^Owner/.test(it.owner ?? "");
  }
  const releases = (sections["Release notes"] ?? []).flatMap((b) => b.items ?? []).map((t) => {
    const m = t.match(/^\*\*(.+?)\*\* \(([^)]+)\): (.+)$/);
    return m ? { label: m[1], when: m[2], text: m[3] } : { label: "", when: "", text: t };
  });
  return { file: FILE, doc, front: doc.front, milestones, items, sections, releases };
}

// ---- Stories -----------------------------------------------------------------------------------------------------------
export function loadStories(errors) {
  const FILE = "docs/USER-STORIES.md";
  if (!exists(FILE)) return { file: FILE, front: {}, personas: [], epics: [], stories: [], intro: [] };
  const doc = parse(read(FILE));
  const all = tables(doc);
  const personas = (all.find((t) => t.section === "Personas")?.rows ?? []).map((r) => ({ id: r.ID, name: r.Persona, who: r["Who they are"], needs: r["What they need from TAB"] }));
  const epics = (all.find((t) => t.section === "Epics")?.rows ?? []).map((r) => ({ id: r.ID, name: r.Epic, covers: r["What it covers"] }));
  const stories = [];
  let st = null, section = "";
  const intro = [];
  for (const b of doc.blocks) {
    if (b.type === "h2") { section = b.text; st = null; continue; }
    if (section === "" && b.type === "p") intro.push(b);
    if (section !== "Stories") continue;
    if (b.type === "h3") {
      const m = b.text.match(/^(US-\d{3,4}) · (.+)$/);
      if (!m) { errors.push(`${FILE}: "### ${b.text}" isn't a story heading ("### US-101 · Title")`); continue; }
      st = { id: m[1], title: m[2], requirements: [], deliveredBy: [], criteria: [], notes: [] };
      stories.push(st);
      continue;
    }
    if (!st) continue;
    if (b.type === "ul") {
      for (const text of b.items) {
        const as = text.match(/^\*\*As an?\*\*\s+(.+?)\s+\*\*I want\*\*\s+(.+?)\s+\*\*so that\*\*\s+(.+)$/i);
        if (as) { st.as = as[1]; st.want = as[2]; st.soThat = as[3]; continue; }
        const f = fieldLine(text);
        if (!f) { st.notes.push(text); continue; }
        for (const [k, v] of f) {
          if (k === "Persona") st.persona = v.trim();
          else if (k === "Epic") st.epic = v.trim();
          else if (k === "Priority") st.priority = v.trim();
          else if (k === "Phase") st.phase = v.trim();
          else if (k === "Requirements") st.requirements = ids(v);
          else if (k === "Delivered by") st.deliveredBy = v.split(/,\s*/).map((x) => x.trim()).filter(Boolean);
          else if (k === "Draft") st.draft = /^yes/i.test(v);
          else errors.push(`${FILE}: ${st.id} has an unknown field "${k}"`);
        }
      }
      continue;
    }
    if (b.type === "ol") { st.criteria.push(...b.items.map((i) => i.text)); continue; }
    if (b.type === "p") st.notes.push(b.text);
  }
  for (const s of stories) {
    if (!s.as) errors.push(`${FILE}: ${s.id} has no "**As a** … **I want** … **so that** …" line`);
    if (!s.persona || !s.epic) errors.push(`${FILE}: ${s.id} needs a Persona and an Epic`);
    if (!s.criteria.length) errors.push(`${FILE}: ${s.id} has no acceptance criteria`);
  }
  return { file: FILE, doc, front: doc.front, personas, epics, stories, intro };
}

// ---- Decisions and risks -----------------------------------------------------------------------------------------------
function loadDecisions() {
  const out = [];
  const master = tables(parse(read(MASTER)));
  for (const r of master.find((t) => t.section === "Decision register")?.rows ?? []) {
    if (!/^D-\d{3}$/.test(r.ID)) continue;
    const st = /superseded/i.test(r.Status) ? "superseded" : /accepted|baselined/i.test(r.Status) ? "accepted" : "proposed";
    out.push({ id: r.ID, title: plain(r.Decision), status: st, statusWord: r.Status, area: r.Workstream, date: r.Decided, source: "Master decision record" });
  }
  const reg = tables(parse(read("docs/requirements-register.md")));
  for (const r of reg.find((t) => /Proposed decisions at a glance/.test(t.sub))?.rows ?? []) {
    out.push({ id: r.ID, title: plain(r.Decision), status: "proposed", statusWord: "Proposed", area: r.Area, date: r.Raised, changes: r.Changes, source: `Requirements register ${r.Where}` });
  }
  for (const r of reg.find((t) => /^1\. Decisions/.test(t.section))?.rows ?? []) {
    if (!/^DEC-\d{3}$/.test(r.ID)) continue;
    const superseded = /\(Superseded/i.test(r.Decision);
    out.push({ id: r.ID, title: short(r.Decision.replace(/\s*\*\(Superseded[^)]*\)\*?/i, "").replace(/\s*\*\([^)]*\)\*/g, ""), 220), full: r.Decision, status: superseded ? "superseded" : "accepted", statusWord: superseded ? "Superseded" : "Accepted", area: "Source documents", date: "", source: `Requirements register §1 (${r.Source})` });
  }
  return out;
}
function loadRisks() {
  const out = [];
  const master = tables(parse(read(MASTER)));
  for (const r of master.find((t) => t.section === "Risk register")?.rows ?? []) {
    if (!/^R-\d{3}$/.test(r.ID)) continue;
    const st = /closed|retired|resolved/i.test(r.Status) ? "closed" : /mitigat/i.test(r.Status) ? "mitigating" : "open";
    out.push({ id: r.ID, title: plain(r.Risk), status: st, statusWord: r.Status, likelihood: r.Likelihood, impact: r.Impact, mitigation: r.Mitigation, related: r.Related, source: "Master decision record" });
  }
  const reg = tables(parse(read("docs/requirements-register.md")));
  for (const r of reg.find((t) => /^6\. Engineering risks/.test(t.section))?.rows ?? []) {
    if (!/^RSK-\d{3}$/.test(r.ID)) continue;
    out.push({ id: r.ID, title: short(r.Risk, 220), full: r.Risk, recommendation: r.Recommendation, status: "", source: "Requirements register §6" });
  }
  return out;
}

// ---- Traceability --------------------------------------------------------------------------------------------------------
function loadTrace() {
  const FILE = "docs/TRACEABILITY.md";
  const doc = parse(read(FILE));
  const all = tables(doc);
  const reqs = all.filter((t) => /requirements$/i.test(t.section)).flatMap((t) => t.rows.map((r) => ({ ...r, _sub: t.sub }))).filter((r) => REQ_RE.test(r.ID));
  const features = all.filter((t) => t.section === "Feature inventory").flatMap((t) => t.rows.map((r) => ({ ...r, _sub: t.sub }))).filter((r) => /^F-\d{2}$/.test(r.ID));
  const rowsOf = (re) => all.flatMap((t) => t.rows).filter((r) => re.test(r.ID ?? ""));
  return { file: FILE, doc, all, reqs, features, objectives: rowsOf(/^BO-\d+$/), gaps: rowsOf(/^TG-\d+$/), questions: rowsOf(/^Q-\d+$/) };
}

// ---- Data model --------------------------------------------------------------------------------------------------------
function loadTables() {
  const doc = parse(read("docs/DATA-MODEL.md"));
  const schema = JSON.parse(read("docs/schema.json"));
  const rows = {};
  for (const t of tables(doc).filter((t) => t.section.startsWith("Domains"))) for (const r of t.rows) rows[strip(r.Table)] = { domain: t.sub, about: r["What it holds"], access: r["Who reads and writes"], requirements: ids(r.Requirements ?? "") };
  return { doc, schema, rows };
}

// ---- The whole model ---------------------------------------------------------------------------------------------------
let cached = null;
export function model() {
  if (cached) return cached;
  const errors = [];
  const backlog = loadBacklog(errors);
  const stories = loadStories(errors);
  const trace = loadTrace();
  const decisions = loadDecisions();
  const risks = loadRisks();
  const data = loadTables();
  const reg = new Map();
  const add = (id, e) => { if (reg.has(id)) errors.push(`${id} is defined twice (${reg.get(id).kind} and ${e.kind})`); reg.set(id, { id, ...e }); };
  const low = (id) => id.toLowerCase();

  for (const r of trace.objectives) add(r.ID, { title: plain(r.Objective), kind: "Business objective", page: "traceability", anchor: low(r.ID) });
  for (const r of trace.reqs) add(r.ID, { title: plain(r.Requirement), status: statusOf(r.Status) || null, kind: `Requirement · ${AREAS[r.ID.split("-")[0]]}`, page: "traceability", anchor: low(r.ID) });
  for (const r of trace.features) add(r.ID, { title: plain(r.Feature), status: statusOf(r.Status) || null, kind: "Feature", page: "traceability", anchor: low(r.ID) });
  for (const r of trace.gaps) add(r.ID, { title: plain(r.Gap), status: /\*\*Closed/.test(r.Gap) || /^Closed/i.test(r.Status ?? "") ? "closed" : "open", kind: "Gap found while tracing", page: "traceability", anchor: low(r.ID) });
  for (const r of trace.questions) add(r.ID, { title: plain(r.Question), status: /^Answered/i.test(r.Answer ?? "") ? "closed" : "open", kind: "Open question", page: "traceability", anchor: low(r.ID) });
  for (const r of risks) add(r.id, { title: r.title, status: r.status || null, kind: r.id.startsWith("RSK") ? "Engineering risk" : "Risk", page: "traceability", anchor: low(r.id) });
  for (const d of decisions) add(d.id, { title: d.title, status: d.status, kind: d.id.startsWith("DEC") ? "Decision · source documents" : "Decision", page: "architecture", anchor: low(d.id) });
  for (const it of backlog.items.values()) add(it.id, { title: plain(it.title), status: it.status, kind: `${it.yours ? "Owner action" : "Engineering work"} · ${it.milestone}`, page: "backlog", anchor: low(it.id) });
  for (const p of stories.personas) add(p.id, { title: `${p.name}: ${plain(p.who)}`, kind: "Persona", page: "stories", anchor: low(p.id) });
  for (const e of stories.epics) add(e.id, { title: `${e.name}: ${plain(e.covers)}`, kind: "Epic", page: "stories", anchor: low(e.id) });
  for (const t of data.schema.tables) add(t.name, { title: plain(data.rows[t.name]?.about ?? ""), kind: "Table", page: "dataModel", anchor: `t-${t.name}` });

  // Relations, in both directions.
  const rel = (map, k, v) => { if (!map.has(k)) map.set(k, new Set()); map.get(k).add(v); };
  const backlogFor = new Map(), storiesFor = new Map(), tablesFor = new Map(), featuresFor = new Map(), citedBy = new Map(), unblocks = new Map();
  for (const it of backlog.items.values()) {
    for (const r of it.requirements) rel(backlogFor, r, it.id);
    for (const d of it.deps) rel(unblocks, d, it.id);
    const text = [it.title, it.doneWhen, it.waitsOn, ...it.body.map((b) => b.text ?? (b.items ?? []).join(" "))].join(" ");
    for (const id of idsIn(text)) if (/^(D|DEC)-/.test(id)) rel(citedBy, id, it.id);
  }
  for (const f of trace.features) {
    for (const r of expandIds(f.Requirements)) rel(featuresFor, r, f.ID);
    for (const id of idsIn(`${f.Decisions ?? ""} ${f.Feature} ${f.Status}`)) if (/^(D|DEC)-/.test(id)) rel(citedBy, id, f.ID);
  }
  for (const r of trace.reqs) for (const id of idsIn(Object.values(r).join(" "))) if (/^(D|DEC)-/.test(id)) rel(citedBy, id, r.ID);
  for (const [name, t] of Object.entries(data.rows)) for (const r of t.requirements) rel(tablesFor, r, name);
  const storyStatus = new Map();
  for (const s of stories.stories) {
    for (const r of s.requirements) rel(storiesFor, r, s.id);
    for (const d of s.deliveredBy) rel(storiesFor, d, s.id);
    // A story is done when everything that delivers it is; in progress when some of it is.
    const parts = s.deliveredBy.map((d) => reg.get(d)?.status).filter(Boolean);
    const doneish = (st) => ["done", "verified", "built", "closed"].includes(st);
    s.status = !parts.length ? "planned" : parts.every(doneish) ? "done" : parts.some((st) => doneish(st) || ["partial", "review", "progress"].includes(st)) ? "progress" : "planned";
    storyStatus.set(s.id, s.status);
    add(s.id, { title: `${s.title}. As ${/^an? /i.test(s.as ?? "") ? "" : "a "}${plain(s.as ?? "")}, I want ${plain(s.want ?? "")}`, status: s.status, kind: `User story · ${s.epic ?? ""}`, page: "stories", anchor: low(s.id) });
    for (const id of idsIn([s.title, s.want, s.soThat, ...s.criteria, ...s.notes].join(" "))) if (/^(D|DEC)-/.test(id)) rel(citedBy, id, s.id);
  }
  const list = (map, k) => [...(map.get(k) ?? [])].sort(byId);

  // Structural checks: every structured reference resolves; no dependency loops.
  for (const it of backlog.items.values()) {
    for (const d of it.deps) if (!backlog.items.has(d)) errors.push(`docs/BACKLOG.md: ${it.id} depends on ${d}, which isn't a backlog item`);
    for (const r of it.requirements) if (!reg.has(r) || !REQ_RE.test(r)) errors.push(`docs/BACKLOG.md: ${it.id} names requirement ${r}, which isn't on the requirements page`);
  }
  for (const s of stories.stories) {
    if (s.persona && !reg.has(s.persona)) errors.push(`${stories.file}: ${s.id} names persona ${s.persona}, which isn't in the Personas table`);
    if (s.epic && !reg.has(s.epic)) errors.push(`${stories.file}: ${s.id} names epic ${s.epic}, which isn't in the Epics table`);
    for (const r of s.requirements) if (!REQ_RE.test(r) || !reg.has(r)) errors.push(`${stories.file}: ${s.id} names requirement ${r}, which isn't on the requirements page`);
    for (const d of s.deliveredBy) if (!reg.has(d) || !/^(F-\d{2}|[AC]\d+[a-z]?)$/.test(d)) errors.push(`${stories.file}: ${s.id} is delivered by ${d}, which isn't a feature or backlog item`);
  }
  for (const [name, t] of Object.entries(data.rows)) for (const r of t.requirements) if (!REQ_RE.test(r) || !reg.has(r)) errors.push(`docs/DATA-MODEL.md: table ${name} names requirement ${r}, which isn't on the requirements page`);
  const cycle = findCycle(backlog.items);
  if (cycle) errors.push(`docs/BACKLOG.md: dependencies loop: ${cycle.join(" → ")}`);

  cached = { errors, reg, backlog, stories, trace, decisions, risks, data, rel: { backlogFor, storiesFor, tablesFor, featuresFor, citedBy, unblocks }, list };
  return cached;
}

export const byId = (a, b) => {
  const pa = String(a).match(/^([A-Za-z_-]*?)(\d+)(.*)$/), pb = String(b).match(/^([A-Za-z_-]*?)(\d+)(.*)$/);
  if (!pa || !pb) return String(a).localeCompare(String(b));
  return pa[1].localeCompare(pb[1]) || +pa[2] - +pb[2] || pa[3].localeCompare(pb[3]);
};

function findCycle(items) {
  const state = new Map();
  const stack = [];
  const visit = (id) => {
    if (state.get(id) === 2) return null;
    if (state.get(id) === 1) return [...stack.slice(stack.indexOf(id)), id];
    state.set(id, 1); stack.push(id);
    for (const d of items.get(id)?.deps ?? []) { const c = visit(d); if (c) return c; }
    stack.pop(); state.set(id, 2);
    return null;
  };
  for (const id of items.keys()) { const c = visit(id); if (c) return c; }
  return null;
}

/** Fails the run when the sources don't hold together; every renderer calls it before building. */
export function assertModel(m = model()) {
  if (m.errors.length) {
    console.error(`The living documents don't hold together (${m.errors.length}):\n- ${[...new Set(m.errors)].join("\n- ")}`);
    process.exit(1);
  }
  return m;
}
