# TAB Human Performance Center: operating rules for Claude

Public website, My TAB client portal and practitioner workspace for TAB Human Performance Center.
Claude acts as principal engineer, tester and deployment manager; the owner (Matthew Ronan)
approves at review gates.

## Business context
- TAB Massage & Fitness (since December 2008, Brighton/Howell area, Michigan; one owner-practitioner,
  20+ years) is becoming **TAB Human Performance Center** (rebrand 2026-10-05, `docs/source/batch-5/`; it replaces the
  earlier "TAB Wellness Collective" name, and "Practice" from the HPP documents is not used).
- Five equally weighted service pillars (proposed D-065, replaces D-050): Massage & Bodywork, Functional Strength,
  Women's Wellness, Integrated Nutrition, Holistic Life Coaching.
- Philosophy: **Transform. Adapt. Balance.** Purpose line: "Build the capacity to live fully." Category line: "Human
  performance for real life." Primary CTA: **Start Where You Are**. TAB Method stages: Start Where You Are, Transform, Adapt, Balance, Evolve.
- Growth is both local and virtual (D-043), for all adult segments including older adults (D-049).

## Sources of truth
- **Decisions and risks:** the owner's Decision & Risk Register (IDs `D-###`, `R-###`, `A-##`),
  consolidated in `docs/source/batch-3/…Master_Decision_Risk_Architecture_Record.md` (D-041).
  Code comments cite these IDs.
- **Build architecture:** `docs/source/batch-3/ARCHITECTURE.pdf` (governs the build; Step 16 is strategy).
- **Requirements and traceability:** `docs/requirements-register.md` (WEB/GS/PORTAL/STAFF/CMS/INT/SEC/NFR/DS IDs).
  New decisions raised in a session are recorded there as *proposed register entries* for the owner.
- **Living documents** (owner requests 2026-10-02 and 2026-10-03): `docs/TRACEABILITY.md` (requirements → features →
  code → checks), `docs/ARCHITECTURE.md` and `docs/DATA-MODEL.md` (with `docs/schema.json`, built from the migrations by
  `npm run docs:schema`). `scripts/docs/` renders each into an HTML page in TAB's design tokens. See "Living documents" below.
- **Source strategy documents:** `docs/source/batch-N/` (Brand Foundation, Steps 13–19, design tokens). Batch 5 (TAB Human
  Performance Center) supersedes the brand, naming, pillar, identity and transition content of batches 1–4.
- Where docs and code disagree, fix the drift in the same PR (R-028); never leave it silent.

## Cloud accounts — hard rules

Only these accounts may be used for this project:

| Service  | Allowed                                                                 |
|----------|-------------------------------------------------------------------------|
| Vercel   | Team `mronan83's projects` (`team_A8TfHlLyTc2toipq0WsMVKvK`), **only** project `tab-human-performance-center` (`prj_djrXZfNVt5JmpqUK7w4CjegZSwmf`; renamed from `tab-wellness-collective` by the owner on 2026-10-05, same ID) |
| Supabase | Org `TAB Wellness Collective` (`zkzjplwevlkpufogkdmh`)                  |
|          | Project `vpaaeblqndcenftrfrms` ("TAB Wellness Collective Website", us-east-1) |

Owner correction 2026-09-28: the project lives in the owner's personal Vercel team. An earlier version of this
file named a separate `tab-wellness-collective` team (`team_5I53XjJhXpJmwzAyhKU7I7Fi`) and treated the personal
team as forbidden; that team is not reachable from the owner's login and the ID was wrong or obsolete (R-028).

Never create, modify, deploy to or read data from these:

- Any other project in the Vercel personal team `team_A8TfHlLyTc2toipq0WsMVKvK`. Always pass the team ID and
  project ID explicitly; never act on a project found by name alone.
- Supabase org `ezvgbzioftldoydozvfd` ("MOO") and its projects `fxaixvudbwlgocqpyhqz`,
  `mhlacualaabkvdelsfmr` (WayPoint).

**Vercel:** use the claude.ai Vercel MCP connector (it is signed in to the owner's account above) or the REST API.
The `VERCEL_TOKEN` environment variable was removed by the owner; if it returns, it must be scoped to the same team.
**Vercel environment variables:** the owner has authorized Claude to create and edit this project's environment
variables as the work needs them (owner ruling 2026-09-28); report each change. `NEXT_PUBLIC_*` values ship to the
browser, so create them as plain (Config); server secrets are Sensitive and never carry the `NEXT_PUBLIC_` prefix.
A Sensitive variable's type can't be changed: narrow its target (or have it deleted) and add a new one.
**Supabase:** the claude.ai Supabase MCP connector is signed in to the forbidden org. Do not use it. Use the REST API
or CLI with `SUPABASE_ACCESS_TOKEN` (allowed org) and always pass the project ref explicitly.
Never print, log or commit token values.

## Branches and review gates

- `main` is the default branch. Work happens on `claude/*` branches and lands via PR.
- GitHub does not enforce branch protection on this private repo on the free plan. For Claude
  sessions the rule is enforced by the PreToolUse hook `.claude/hooks/guard-main.mjs`
  (blocks pushes and file writes to `main`, auto-merge, and any merge that isn't a squash merge).
  Do not disable or work around it. Revisit GitHub-side protection when paid plans are bought for go-live.
- G1 Design — architecture, data model and plan approved before build.
- G2 Pull request — owner reviews each PR on its Vercel preview URL; CI must be green. **Claude merges**
  (squash only) once CI is green on the head commit **and** the owner has approved that specific PR in
  the session ("approved", "ship it", or similar). Approval of one PR never carries to another, and a
  push after approval needs the approval re-confirmed unless it only fixes CI (owner ruling 2026-09-28).
  After a merge, restart the working branch from `main`.
- **Backlog (owner request 2026-09-28):** `docs/BACKLOG.md` is the single list of remaining work, prioritized
  (P0 now, P1 public launch, P2 My TAB go-live, P3 later) and categorized, with owner actions (A) and Claude's work (C).
  Every PR updates it, including each item's effort and blocker. Don't post the backlog after a merge. After every
  successful production promotion (owner ruling 2026-10-02), render it with `npm run backlog:html -- --out <file>
  --release "<what went live>" --deployment <dpl_id>` and republish it to the same backlog
  artifact (https://claude.ai/artifact/71B4CYEb4dHdHa71fVwAgg; pass it as `url` from a new session), then send the owner
  its link.
- **Living documents (owner request 2026-10-03):** the traceability, technical architecture and data model pages, and
  the website content guide (owner request 2026-10-07), are Claude's to keep accurate and complete. Every PR assesses
  all four against its change and updates their sources (`docs/TRACEABILITY.md`, `docs/ARCHITECTURE.md`,
  `docs/DATA-MODEL.md`, `docs/schema.json`, `docs/CONTENT-GUIDE.md`) in the same PR; its
  description carries a "Living documents" line naming what changed in each, or why nothing needed to. `npm run
  docs:check` (in CI) fails when the schema snapshot is stale, a requirement, table, function, environment variable,
  dependency, API route or `lib/` module isn't described, a feature, gap or question reference doesn't resolve, or a
  public page is missing from the content guide. The guide changes with anything that changes what is editable, the
  block library, the checks or the request workflow.
  After every merge, render them with `npm run docs:html -- --out-dir <folder>` and republish each to its artifact
  (addresses in `docs/living-docs.json`; pass them as `url` from a new session), then confirm to the owner which pages
  were revised and how, or that each was assessed and needed nothing.
- **Website change requests (owner requests 2026-10-07, proposed D-069 to D-071):** content help and design changes are
  filed in TAB Practice → Website changes (`website_requests`, `website_request_notes`) by the owner, practitioners or
  admins, or raised in a session ("pick up website request #12"). Read them with the service role (Supabase REST, project
  ref passed explicitly); reply in the request's notes (no client details, ever) and keep its status current: Questions
  or options → Waiting on you → In progress → In review (set `preview_url` and `change_url`) → Live, or Declined with the
  reason. Design-lane requests: questions, then options with effort and risks; build nothing until the owner chooses
  one; then the normal G2 and G3 gates. A request that fits the content lane can be moved there. A daily routine
  ("Website request check", 07:52 Detroit time, C33) does the triage step only; it never builds or releases.
  **Fast lane (in force once C32 ships the automation):** a PR authored by the owner that changes only content files
  and is green is merged and promoted by the workflow without a separate approval. It never covers Claude's PRs, an
  admin's PR, or any change outside the content files; those keep G2 and G3.
- G3 Release — owner approves every production promotion and every production migration.
  Staged production (owner ruling 2026-09-28): Vercel does not auto-assign production domains, so a merge to `main`
  builds a production deployment that is not live. Claude sends its URL; after the owner checks it and says "promote",
  Claude promotes that exact deployment (no rebuild) and confirms. Rollback is promoting the previous one.
  Vercel's automatic aliases (`…-mronan83s-projects.vercel.app`, `…-git-main-…`) always follow the newest build;
  only `tab-human-performance-center.vercel.app` (the old `tab-wellness-collective.vercel.app` redirects to it since the
  project rename) and the custom domains (proposed D-066; `docs/runbooks/switch-over.md`) are held until promotion.
- Vercel login (SSO) protects every deployment URL, including `tab-human-performance-center.vercel.app` and the custom
  domains (set to "all" 2026-09-28, after the default left that address public). It changes to Standard only at public
  launch (switch-over Phase B, G3); the demo portal is off on production from 2026-10-06.
- Never push directly to `main` or run a production migration without G3 approval.

## Non-negotiable product guardrails
1. **Name:** always "TAB Human Performance Center" in full in metadata, listings and legal text (proposed D-063).
   `npm run test:brand` (CI) fails on retired names, the old philosophy or stage names, old service names and wrong
   pillar counts; fix the copy, never the check, unless the check is wrong. Never
   "TAB Wellness Collective", "TAB Human Performance Practice" or "TAB HPC" in public copy. "TAB" alone is fine
   conversationally.
2. **Logo is artwork.** Never recreate it in live type. Use the approved files in `public/brand/` (proposed D-061; the
   owner-approved redraw, sources in `design/logo-redraw/`). Flat colour is the master; the sheen versions are for large
   digital uses only.
3. **Design tokens** in `app/globals.css` follow the approved TAB Human Performance Center palette (proposed D-062):
   Graphite, Deep Olive, Sage, Clay, Clay Dark, Ochre, Linen, Bone. Don't invent colors. White text only on Deep Olive,
   Clay Dark or Graphite. Clay `#C46A4A`, Sage `#A7B39F` and Ochre `#D4A574` are decorative only: never text, never
   behind white text. A colour a component needs (a status tint, say) becomes a token there first, with its pairing in
   `scripts/check-contrast.mjs`; `npm run test:brand` fails on a hex colour written into a class. Montserrat for headings, body and UI; Spectral for editorial accents.
4. **Health data (D-042, amended by the owner's ruling of 2026-09-28 that HIPAA does not apply; proposed D-060):**
   My TAB is still a sensitive-data system. Do not connect production client data until the portal security gate
   is met (SEC-015–SEC-021: 0 known gaps in `npm run test:rls`, staff MFA enforced), Supabase is on a paid plan with
   backups and a tested restore (SEC-009), and the privacy policy covers My TAB. No HIPAA tier or BAA is required.
   Until then the portal runs on demo data (`portal.dataSource = "mock"`).
5. **No health details by email (D-054, R-027).** The Start form collects no free text: apart from name, email
   and phone (character-restricted), every answer is a predefined option (proposed D-059). The contact form keeps
   a message box with a "no medical details" note, and the submitter's copy never repeats the message. Email
   subjects never carry personal details. Detailed health intake belongs in My TAB only. Start and contact submissions are
   emailed to TAB and to the submitter, and saved in the `inquiries` table (whole form, never deleted) only once
   guardrail 4's conditions are met (proposed D-058).
6. **Analytics (D-046, amended by the owner's DIV-04 ruling, proposed D-057, and A4 2026-10-06):** our own first-party
   counter (`/api/stats` → daily totals in `site_stats`; no cookies, no visitor identifiers, no third party, no paid
   add-on) on public pages only,
   including `/start`, where it counts the funnel with fixed, property-less events (`lib/analytics.ts`); never
   on `/my-tab`, `/practice` or `/contact`. Ad pixels only when paid ads start, and never on `/my-tab`,
   `/practice`, `/start` or `/contact`.
7. **Scheduling stays in Timely (D-003).** Timely has no public API; link out. Payments: Timely for
   appointments and packages; Stripe for digital programs, cohorts and memberships; one Stripe
   customer per client (D-052).
8. **Scope of practice:** coaching copy never implies diagnosis or treatment (Step 15 §15.8).
9. **Accessibility:** WCAG 2.2 AA (D-037). Visible focus (3px, 3px offset; cream on dark sections),
   labels on every input, reduced-motion support.
10. **Temporary content** is flagged `draft: true` or `PLACEHOLDER` and appears on `/launch-checklist`.
    Never invent testimonials, credentials, prices or outcomes.

## Architecture conventions
- Business settings live in `config/site.ts`; copy lives in `content/*.ts`. Pages read from these;
  don't hardcode business facts in components.
- **Content editor (Keystatic, proposed D-069, D-071, D-072):** the service pages and the techniques guide are JSON
  files (`content/services/*.json`, `content/massage-techniques.json`) edited at `/keystatic` (Keystatic Cloud sign-in)
  on `content/…` branches; `content-pr.yml` opens a PR per branch and CI runs on every save. `content/schema.ts` is the
  one set of rules: `keystatic.config.ts` takes its limits from it and the build parses every file with it. A field or
  block change touches all three (schema, editor config, renderer in `components/blocks/`) plus `e2e/content.spec.ts`
  and the guide. The other pages move in next (C35); until then their copy stays in `content/*.ts`. A new block type is
  a design-lane change, and `docs/CONTENT-GUIDE.md` lists what is and isn't editable. Treat a content PR like any
  other: review its checks and preview, and it needs the owner's approval (until the fast lane, C32).
- Every CTA goes through `components/Cta.tsx` so booking and Start destinations stay config-driven.
- Portal data access goes through `PortalRepository` (`lib/portal/types.ts`). Add a method to the
  interface, then implement it in **both** `mock-repository.ts` and `supabase-repository.ts`.
- Mutations are server actions in `app/(portal)/actions.ts`; each calls `requireClient()` or
  `requireStaff()`.
- Public forms post to `/api/inquiry`, which applies the spam layers in `lib/spam.ts` (SEC-013). New public
  forms use the same route and layers; the My TAB sign-in action applies them too. Turnstile goes through
  `useTurnstile` (`components/Turnstile.tsx`).
- The Content-Security-Policy lives in `lib/csp.ts` and is set by `middleware.ts` (per-request nonce on `/my-tab` and
  `/practice`). A new third-party script, frame, image, font or API host must be added there;
  `e2e/security.spec.ts` fails on any violation.
- Row-level security is the access control. Any new client-data table needs RLS policies, an audit
  trigger and a test in `supabase/tests/rls.test.mjs`. Reuse the security-gate helpers
  (`supabase/migrations/20260929000000_portal_security_gate.sql`): `guard_client_columns` for what a client may
  change, `stamp_author` for who wrote a row, `guard_same_client` for links between client records. Staff access
  counts only in two-step-verified sessions (`current_app_role()`).
- Model for a team, build for one (D-045): roles `owner | practitioner | admin | client`; practitioners see
  only assigned clients; an admin (proposed D-071) is website-only: requests, website stats and the content editor,
  never client data (`requireStaff()` and `is_staff()` exclude the role).

## Checks before every push
`npm run typecheck`, `npm run test:brand`, `npm run build`, `npm run test:rls`, then `npm run test:e2e` (Playwright smoke, redirect-map,
link-crawl, SEO, header-fit, CSP and WCAG 2.2 AA scans against the production build; no retries). CI runs the same on every PR.

## Secrets
Never commit `.env*` files, keys, tokens or database passwords. Local values go in `.env.local`
(git-ignored); deployed values live in Vercel / Supabase / GitHub secrets. `.env.example` lists names only.
