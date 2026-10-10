#!/usr/bin/env node
/**
 * Builds the User stories page from docs/USER-STORIES.md: who uses TAB Human Performance Center's website, My TAB and
 * TAB Practice, what each person needs, and how each need is proved.
 *
 *   node scripts/docs/render-stories.mjs --out <file.html>   write the page
 *   node scripts/docs/render-stories.mjs --check             the structural checks only (CI)
 *
 * Every story names its persona, epic, requirements and what delivers it (features, or backlog items still to do); its
 * status rolls up from those. The check fails when a story names something the other pages don't define.
 */
import { page, inline, esc, args, write, section, filters, facet, row, kv, tags, traceList, pill, stack, expandButton, useRegistry, stLabel, render, icon } from "./page.mjs";
import { model, assertModel, byId } from "./model.mjs";

const a = args();
const m = assertModel(model());
const S = m.stories;
if (!S.stories.length) { console.error(`${S.file} has no stories.`); process.exit(1); }
const ST = ["done", "progress", "planned"];
const PHASES = ["P0", "P1", "P2", "P3"];
const count = (list, st) => list.filter((s) => s.status === st).length;
const parts = (list) => ST.map((st) => [st, count(list, st)]);
const reqsCovered = new Set(S.stories.flatMap((s) => s.requirements));
const uncovered = m.trace.reqs.filter((r) => !reqsCovered.has(r.ID)).map((r) => r.ID);
if (a.check) { console.log(`User stories: ${S.stories.length} stories for ${S.personas.length} personas in ${S.epics.length} epics, ${S.stories.reduce((n, s) => n + s.criteria.length, 0)} acceptance criteria; every reference resolves; ${reqsCovered.size} of ${m.trace.reqs.length} requirements have a story.`); process.exit(0); }
if (!a.out) { console.error("Usage: node scripts/docs/render-stories.mjs --out <file.html> | --check"); process.exit(1); }

useRegistry(m.reg, "stories");
const ctx = { file: S.file, codeLinks: true };
const md = (t, self) => inline(t, { ...ctx, self });
const personaOf = (id) => S.personas.find((p) => p.id === id);
const epicOf = (id) => S.epics.find((e) => e.id === id);

// ---- Personas ------------------------------------------------------------------------------------------------------------
const personaSec = section("personas", "Personas", `<div class="cards">${S.personas.map((p) => {
  const mine = S.stories.filter((s) => s.persona === p.id);
  return `<div class="card" id="${p.id.toLowerCase()}"><div class="card-h"><h3>${esc(p.name)}</h3><span class="id">${esc(p.id)}</span></div><p>${md(p.who, p.id)}</p><p><b>Needs:</b> ${md(p.needs, p.id)}</p><div class="prog stack-l">${stack(parts(mine), `${p.name}: ${count(mine, "done")} of ${mine.length} stories done`, true)}<span>${mine.length} stories · ${count(mine, "done")} done</span></div><p><button type="button" class="btn" data-set-filter="persona:${p.id}" data-filter-target="stories" data-filter-label="${esc(p.name)}'s stories">Show ${esc(p.name.toLowerCase())} stories</button></p></div>`;
}).join("")}</div>`, { note: "The people TAB builds for. Each card's button filters the stories below." });

// ---- Story map: epics × phases ---------------------------------------------------------------------------------------------
const mapRows = S.epics.map((e) => {
  const mine = S.stories.filter((s) => s.epic === e.id);
  const cells = PHASES.map((ph) => {
    const here = mine.filter((s) => s.phase === ph).sort((x, y) => byId(x.id, y.id));
    return `<td data-label="${ph}">${here.length ? tags(here.map((s) => s.id)) : '<span class="none">—</span>'}</td>`;
  }).join("");
  return `<tr id="${e.id.toLowerCase()}"><th scope="row">${esc(e.id)} · ${esc(e.name)}<small>${md(e.covers, e.id)}</small><span class="prog">${stack(parts(mine), `${e.name}: ${count(mine, "done")} of ${mine.length} done`, true)}<span>${count(mine, "done")} of ${mine.length} done</span></span><button type="button" class="btn" data-set-filter="epic:${e.id}" data-filter-target="stories" data-filter-label="${esc(e.name)}">Show stories</button></th>${cells}</tr>`;
}).join("");
const mapSec = section("story-map", "Story map", `<div class="matrix"><table class="md"><thead><tr><th scope="col">Epic</th><th scope="col">P0 · Now</th><th scope="col">P1 · Public launch</th><th scope="col">P2 · My TAB go-live</th><th scope="col">P3 · Later</th></tr></thead><tbody>${mapRows}</tbody></table></div>`,
  { note: "Every story by epic and phase, tinted by status. A story is done when everything that delivers it is built and checked; in progress when some of it is." });

// ---- Stories ------------------------------------------------------------------------------------------------------------------
const kwd = (t) => md(t).replace(/<strong>(Given|when|then|and|When|Then|And)<\/strong>/g, '<span class="kw">$1</span>');
const storyRow = (s) => {
  const p = personaOf(s.persona), e = epicOf(s.epic);
  const delivered = s.deliveredBy.filter((d) => m.reg.has(d));
  const body = [
    `<p class="as">As ${/^an? /i.test(s.as) ? "" : "a "}${md(s.as, s.id)}, I want ${md(s.want, s.id)}, so that ${md(s.soThat, s.id)}.</p>`,
    `<ol class="gwt">${s.criteria.map((c) => `<li>${kwd(c)}</li>`).join("")}</ol>`,
    s.notes.length ? `<ul class="bullets small">${s.notes.map((n) => `<li>${md(n, s.id)}</li>`).join("")}</ul>` : "",
    kv([
      ["Persona", p ? `${tags([p.id])} ${esc(p.name)}` : ""],
      ["Epic", e ? `${tags([e.id])} ${esc(e.name)}` : ""],
      ["Requirements", s.requirements.length ? traceList(s.requirements) : ""],
      ["Delivered by", delivered.length ? traceList(delivered) : '<span class="none">Not yet on the backlog</span>'],
    ]),
  ].join("");
  return row({
    id: s.id, anchor: s.id.toLowerCase(), title: md(s.title, s.id),
    facts: [`${esc(p?.name ?? s.persona)} · ${esc(s.phase ?? "")} · <span class="pr${s.priority === "Must" ? " must" : ""}">${esc(s.priority ?? "")}</span>${s.draft ? " · draft for review" : ""}`, s.requirements.length ? `Requirements ${tags(s.requirements)}` : ""],
    side: pill(s.status), body,
    data: { status: s.status, persona: s.persona, epic: s.epic, phase: s.phase, priority: s.priority },
    search: `${s.id} ${s.title} ${s.as} ${s.want} ${s.soThat} ${s.criteria.join(" ")} ${s.requirements.join(" ")} ${s.deliveredBy.join(" ")}`,
  });
};
const bar = filters({
  noun: "stories", total: S.stories.length, placeholder: "Search stories: an ID, a word, a requirement…",
  facets: [
    facet("status", "Status", S.stories, (s) => s.status, ST, stLabel, (v) => v),
    facet("persona", "Persona", S.stories, (s) => s.persona, S.personas.map((p) => p.id), (v) => personaOf(v)?.name ?? v),
    facet("epic", "Epic", S.stories, (s) => s.epic, S.epics.map((e) => e.id), (v) => `${v} ${epicOf(v)?.name ?? ""}`),
    facet("phase", "Phase", S.stories, (s) => s.phase, PHASES),
    facet("priority", "Priority", S.stories, (s) => s.priority, ["Must", "Should", "Could"]),
  ],
});
const groups = S.epics.map((e) => {
  const mine = S.stories.filter((s) => s.epic === e.id);
  return `<div class="sub" data-group id="stories-${e.id.toLowerCase()}"><div class="group-h"><h3>${esc(e.id)} · ${esc(e.name)}</h3><span class="muted small">${mine.length} stories</span></div><div class="rows">${mine.map(storyRow).join("\n")}</div></div>`;
}).join("\n");
const storiesSec = section("stories", "Stories", `${bar}${groups}`, { tools: expandButton("stories"), note: "Open a story for its acceptance criteria, the requirements it traces to and what delivers it." });

// ---- Coverage ------------------------------------------------------------------------------------------------------------------
const noDelivery = S.stories.filter((s) => !s.deliveredBy.length).map((s) => s.id);
const coverageSec = section("coverage", "Coverage", `<ul class="checks">
<li class="ok">${icon("check")} <span>Every story names a persona, an epic and at least one requirement, and everything it names exists on the other pages (CI fails otherwise).</span></li>
<li class="${uncovered.length ? "info" : "ok"}">${icon(uncovered.length ? "info" : "check")} <span>${reqsCovered.size} of ${m.trace.reqs.length} requirements have a story.${uncovered.length ? ` No person meets these directly, so they have none: ${tags(uncovered)}.` : ""}</span></li>
${noDelivery.length ? `<li class="info">${icon("info")} <span>Stories nothing delivers yet (no feature and no backlog item): ${tags(noDelivery)}.</span></li>` : ""}
<li class="info">${icon("info")} <span>All ${S.stories.length} stories are drafts for the owner's review; a story's criteria become the checks that prove it once it is agreed.</span></li></ul>`);

// ---- Page ------------------------------------------------------------------------------------------------------------------------
const intro = render({ blocks: [{ type: "h2", text: "x" }, ...S.intro] }, ctx).html.replace(/^<section[^>]*><div class="sec-head"><h2>x<\/h2><\/div>/, "").replace(/<\/section>\s*$/, "").replace(/<p class="para">|<\/p>/g, "");
const out = page({
  key: "stories", title: S.front.title, eyebrow: S.front.eyebrow, heading: S.front.heading, file: S.file, version: S.front.version, commit: a.sha, date: S.front.updated,
  lede: intro,
  stats: [
    { n: S.stories.length, label: "stories" }, { n: S.personas.length, label: "personas" }, { n: S.epics.length, label: "epics" },
    { n: S.stories.reduce((n, s) => n + s.criteria.length, 0), label: "acceptance criteria" }, { n: count(S.stories, "done"), label: "done" },
    { n: count(S.stories, "progress"), label: "in progress" }, { n: `${reqsCovered.size}`, small: `of ${m.trace.reqs.length}`, label: "requirements with a story" },
  ],
  sections: [{ id: "personas", title: "Personas" }, { id: "story-map", title: "Story map" }, { id: "stories", title: "Stories", children: S.epics.map((e) => ({ id: `stories-${e.id.toLowerCase()}`, title: `${e.id} ${e.name}` })) }, { id: "coverage", title: "Coverage" }],
  statusKey: ST,
  body: [personaSec, mapSec, storiesSec, coverageSec].join("\n"),
  foot: `<p>Generated from <code>${esc(S.file)}</code> by <code>scripts/docs/render-stories.mjs</code>. Statuses roll up from the features and backlog items each story names.</p>`,
});
write(a.out, out, `User stories page: ${S.stories.length} stories`);
