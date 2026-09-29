# Plans, programs and TAB Method stages: G1 design

_Status: **approved (G1), 2026-09-29.** Covers backlog C4 (built in three slices: C4a reviews and stages, C4b plans, C4c program assignment), C7, C13 and C14._

Owner inputs this design is built on (2026-09-28/29, recorded in `requirements-register.md` §7.1):

- A client may need several kinds of plan: strength, massage & bodywork, women's wellness, life coaching, nutrition.
  **Plan type is an attribute chosen when the plan is designed**; the whole-person Wellness Plan stays the anchor.
- **Any practitioner** can build program templates (not only the owner).
- **AI helps practitioners design programs, templates only for now.** No client data goes to an AI provider.
- **Stage changes are the practitioner's decision**, reached in conversation with the client and confirmed by the
  practitioner. The client sees the new stage on the My TAB dashboard and gets an email:
  subject **"Your My TAB Stage Has Been Updated"**, body pointing them to My TAB for details.
- **Tricia Ronan** (owner and practitioner) holds the Integrative Nutrition Health Coach certificate (IIN), so
  **nutrition** is a plan type, built as nutrition *coaching* and gated to her (see §2.3).
- Publishing program templates needs a **publishing permission** (owner ruling 2026-09-29), not a separate role (see §3.1).

## 1. Model at a glance

```
Client ─ stage (Start · Transform · Align · Become · Evolve) ─ stage history
 └─ TAB Wellness Plan              one active per client: whole-person goals, focus, review date
     ├─ Service plan · type = massage-bodywork | strength | womens-wellness | life-coaching | nutrition
     │    ├─ shared core: title, goals (linked to Wellness Plan goals), status, review date, author, visibility
     │    ├─ type sections: fields defined per type (details), each marked shared or practitioner-only
     │    └─ plan log: dated entries (session, response, adjustments), shared or practitioner-only
     ├─ Assigned programs          template (pinned version) + per-client personalization
     └─ Progress reviews           the Reflect & Adjust record; the only place a stage change is made
```

Programs are the **library** (reusable, versioned). Plans are **per client**. A plan can use programs; a program never
contains client data.

## 2. Plans

### 2.1 One table, typed

Extend the existing `wellness_plans` table rather than adding one table per type:

| Column (new) | Purpose |
|---|---|
| `plan_type` | `wellness` (the anchor) or a service type. One active `wellness` plan per client (partial unique index). |
| `parent_plan_id` | Service plans point at the client's Wellness Plan. |
| `practitioner_id` | The practitioner who owns this plan (defaults to the author). |
| `details jsonb` | Type-specific sections, validated against the type's schema (zod) on every write. |

`plan_goals` keeps working for every type; a service-plan goal can reference the Wellness Plan goal it serves.

**Why one table:** reviews, the client dashboard, RLS, audit and stage prompts treat every plan the same. A new type is
a new schema entry in `lib/portal/plan-types.ts`, not a migration. Trade-off: per-type fields live in `details`, so
reporting across a type's fields is looser than dedicated columns. Acceptable for a practice of this size (D-045).

### 2.2 Type sections (first cut, for owner and practitioner review)

| Type | Sections (shared with client unless marked *practitioner-only*) |
|---|---|
| Strength | Training focus; weekly structure; current blocks and loads; movement notes (*practitioner-only*); progress measures |
| Massage & Bodywork | Focus areas; session frequency; techniques and pressure preferences; response and aftercare; contraindication notes (*practitioner-only*) |
| Women's Wellness | Coaching focus; habits; life-stage context (client-described, not diagnostic); resources |
| Life Coaching | Goals and commitments; values; reflections; accountability rhythm |
| Nutrition | Habit targets; eating pattern preferences; practitioner guidance; notes (*practitioner-only*) |

**Plan log** (new `plan_entries` table): dated entries per plan: session held, what was done, how the client
responded, adjustments. Each entry is `shared` or `internal`, the same rule as session notes (PORTAL-011: raw notes
never shown by default). This is what makes a massage plan track progress over time.

### 2.3 Guardrails

- **Scope of practice (Step 15 §15.8):** copy and AI output never imply diagnosis or treatment. Type sections use
  client-described language ("areas you'd like us to focus on"), not clinical terms.
- **Nutrition is gated:** only practitioners whose profile carries the nutrition credential can create or edit a
  nutrition plan (new `practitioners.capabilities text[]`, value `nutrition`, enforced in RLS and the UI).
  The credential is IIN's Integrative Nutrition Health Coach: a health-coaching certificate, not a dietetics
  license. Nutrition plans therefore cover habits, eating patterns, general guidance and accountability, never
  individualized meal plans for medical conditions or anything resembling medical nutrition therapy. Counsel confirms
  the Michigan boundary as part of A7.
- **Sensitive data (guardrail 4):** plans are client records. RLS, audit trigger and `rls.test.mjs` tests are required
  before the Supabase version ships; demo mode uses the mock repository.

### 2.4 Authoring flow (TAB Practice → client page)

1. **Wellness Plan:** write or edit focus, goals, review date; mark visible to the client when ready.
2. **Add a service plan:** choose the type → the type's sections appear → save as draft → share when ready.
3. **Assign a program:** pick a published template → personalize (swap activities, adjust prescriptions) →
   optionally link it to a service plan → it appears in the client's My TAB.
4. **Log entries** against any plan after sessions.

Practitioners see only their assigned clients (D-045); the owner sees all.

## 3. Programs (library)

Existing tables stay: `program_templates` → `program_modules` (by week) → `program_activities` (typed, with a
`prescription`). Assigned programs pin `template_version`, and per-client changes live in `personalization`.

### 3.1 Program editor (C7): architecture decisions for approval

| Decision | Proposal |
|---|---|
| Who edits | Any practitioner creates and edits drafts. |
| Who publishes | Owners, and practitioners the owner grants a **publishing permission** (`practitioners.can_publish`; owner ruling 2026-09-29: "publishing permission", not a director role). Others submit drafts for review. |
| Versioning | Editing a published template creates a new draft version; publishing bumps `version`. Clients on the old version keep it until a practitioner moves them. No silent changes to a client's program. |
| Structure | Weeks → modules → activities (exercise, habit, reflection, reading, video). Unchanged. |
| Products | A published template can be packaged as a product (D-044, D-052); pricing stays in Stripe. Separate step, owner-only. |
| Retiring | `retired` hides a template from assignment; existing clients keep it. |

## 4. AI program drafting (templates only)

- **What it does:** in the program editor, "Draft with AI": the practitioner describes the program (pillar, audience,
  length, goal, constraints) → the AI returns a structured draft (weeks, modules, activities, prescriptions) →
  it opens as a **draft** for the practitioner to edit. Nothing is published or assigned without a person.
- **What it never receives:** client names, plans, check-ins, notes, forms, or anything from My TAB. The request is
  built only from what the practitioner types into the drafting form. A test asserts the request payload has no
  client fields.
- **Guardrails in the instructions:** no diagnosis or treatment claims, no promised outcomes, no invented credentials;
  flag anything that should be cleared by the practitioner (e.g. load progressions for older adults, D-049).
- **Provider:** Anthropic's Claude API, called server-side from a server action (`requireStaff()`), so no CSP change.
  Model chosen at build time. Key in a Sensitive Vercel variable `ANTHROPIC_API_KEY`. Per-practitioner rate limit.
- **Owner action:** an Anthropic API account and key (new backlog A item). Until then the button is hidden.
- **Later (not approved now):** AI on client data (plan drafting, stage-readiness analysis) needs the privacy policy
  to cover it, the provider's no-training terms and client opt-in consent. Revisit after A7.

## 5. Stages and Progress Reviews

### 5.1 Readiness prompts (system suggests, never decides)

Because AI stays on templates, prompts are **rule-based** at first and computed inside the app:

| Signal | Example rule |
|---|---|
| Review due | Plan review date reached or passed |
| Goals | Most active goals marked achieved |
| Programs | An assigned program completed |
| Check-ins | Several weeks of steady or improving check-ins |
| Time in stage | Long time in the current stage with no review |

Prompts appear only in TAB Practice ("Dana may be ready for a progress review: 2 goals achieved, program complete"),
with the reasons listed. They are hints for the conversation, not recommendations to the client.

### 5.2 Recording the decision

1. Practitioner opens **Progress Review** (Step 14.4.5 questions: original goal, what changed, what remains
   difficult, what was learned, does the approach still fit).
2. Outcome: continue, adjust, increase support, reduce frequency, move toward maintenance, **and optionally a new
   stage** (any direction; stages can move back).
3. Practitioner confirms ("I've discussed this stage change with the client") → in one transaction
   (`record_progress_review()`): review saved, `clients.method_stage` updated. A trigger on `clients` writes every
   stage change to `stage_changes` (from, to, review, who, when), whatever made it, and no one can write, edit or
   delete that history directly. *(Built in C4a.)*
4. **Client:** dashboard shows the new stage and the shared review summary (if the practitioner shared it).
5. **Email** to the client via Resend (backlog A2):
   - Subject: **Your My TAB Stage Has Been Updated** (owner-approved; no personal details in the subject, guardrail 5).
   - Body: a short note that their stage has been updated and a link to sign in to My TAB for the details.
     No stage name, review text or health details in the body.
   - Until Resend is configured the email is logged, not sent; the stage change still happens.

## 6. Build order

| Step | Backlog | Contents | Depends on |
|---|---|---|---|
| 1 | C4 | Plan types, authoring, plan log, program assignment and personalization; Progress Review and stage change with dashboard; stage email | This design (G1) |
| 2 | C14 | Rule-based readiness prompts in TAB Practice | C4 |
| 3 | C7 | Program editor with versioning | This design (G1) |
| 4 | C13 | AI program drafting (templates only) | C7, Anthropic key (owner) |

Each step: mock and Supabase repositories (both), RLS policies, audit trigger and `rls.test.mjs` tests, e2e tests,
demo data so it can be shown on the demo portal.

## 7. Decisions needed from the owner

1. Approve this design (G1). *(Approved 2026-09-29.)*
2. Confirm or adjust the type sections in §2.2. *(Confirmed 2026-09-29.)*
3. Nutrition: which credential, and who holds it. *(IIN, Tricia Ronan, 2026-09-29.)*
4. Publishing: owners and practitioners with the publishing permission. *(Decided 2026-09-29.)*
