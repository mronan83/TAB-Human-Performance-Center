# TAB Wellness Collective — operating rules for Claude

Public website, My TAB client portal and practitioner workspace for TAB Wellness Collective.
Claude acts as principal engineer, tester and deployment manager; the owner (Matthew Ronan)
approves at review gates.

## Business context
- TAB Massage & Fitness (since December 2008, Brighton/Howell area, Michigan; one owner-practitioner,
  20+ years) is becoming **TAB Wellness Collective**.
- Four equally weighted service pillars (D-050): Massage & Bodywork, Personal Strength Training,
  Women's Wellness Coaching, Holistic Life Coaching.
- Philosophy: **Transform. Align. Become.** Tagline: "Whole-person wellness for stronger bodies and
  fuller lives." Primary CTA: **Start Where You Are**.
- Growth is both local and virtual (D-043), for all adult segments including older adults (D-049).

## Sources of truth
- **Decisions and risks:** the owner's Decision & Risk Register (IDs `D-###`, `R-###`, `A-##`),
  consolidated in `docs/source/batch-3/…Master_Decision_Risk_Architecture_Record.md` (D-041).
  Code comments cite these IDs.
- **Build architecture:** `docs/source/batch-3/ARCHITECTURE.pdf` (governs the build; Step 16 is strategy).
- **Requirements and traceability:** `docs/requirements-register.md` (WEB/GS/PORTAL/STAFF/CMS/INT/SEC/NFR/DS IDs).
  New decisions raised in a session are recorded there as *proposed register entries* for the owner.
- **Source strategy documents:** `docs/source/batch-N/` (Brand Foundation, Steps 13–19, design tokens).
- Where docs and code disagree, fix the drift in the same PR (R-028); never leave it silent.

## Cloud accounts — hard rules

Only these accounts may be used for this project:

| Service  | Allowed                                                                 |
|----------|-------------------------------------------------------------------------|
| Vercel   | Team `tab-wellness-collective` (`team_5I53XjJhXpJmwzAyhKU7I7Fi`)        |
| Supabase | Org `TAB Wellness Collective` (`zkzjplwevlkpufogkdmh`)                  |
|          | Project `vpaaeblqndcenftrfrms` ("TAB Wellness Collective Website", us-east-1) |

Never create, modify, deploy to or read data from these (the owner's other accounts):

- Vercel team `team_A8TfHlLyTc2toipq0WsMVKvK` ("mronan83's projects"), including its
  unrelated project also named `tab-wellness-collective` (`prj_SqUFclQhmnpWyxLzG2wjAx2wgtz6`).
- Supabase org `ezvgbzioftldoydozvfd` ("MOO") and its projects `fxaixvudbwlgocqpyhqz`,
  `mhlacualaabkvdelsfmr` (WayPoint).

The claude.ai **Vercel and Supabase MCP connectors are signed in to the forbidden accounts**.
Do not use them for this project. Use the REST APIs or CLIs with the environment variables
`VERCEL_TOKEN` and `SUPABASE_ACCESS_TOKEN`, which belong to the allowed accounts, and always
pass the team ID / project ref explicitly. Never print, log or commit token values.

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
- G3 Release — owner approves every production promotion and every production migration.
- Never push directly to `main` or run a production migration without G3 approval.

## Non-negotiable product guardrails
1. **Name:** always "TAB Wellness Collective" in full in metadata, listings and legal text. Never
   "TAB Wellness". "TAB" alone is fine conversationally (D-038).
2. **Logo is artwork.** Never recreate it in fonts. Use files in `public/brand/` (vector masters
   from the external designer replace the PNGs when they arrive, D-027).
3. **Design tokens** in `app/globals.css` mirror Design Tokens v1.0 (D-053) as amended by the
   owner-approved contrast fixes (proposed D-056; see `docs/requirements-register.md` CON-011). Don't
   invent colors. White text only on Olive, Deep Terracotta or Charcoal. Terracotta `#C0784C` and
   Sage `#97A07C` are decorative only: never text, never behind white text.
4. **Health data (D-042):** My TAB is a sensitive-data system. Do not connect production client data
   until the Supabase project is on HIPAA-eligible infrastructure with a signed BAA *and* the legal
   review is complete (A-01, R-025). Until then the portal runs on demo data
   (`portal.dataSource = "mock"`).
5. **No health details by email (D-054, R-027).** The Start form collects no free text: apart from name, email
   and phone (character-restricted), every answer is a predefined option (proposed D-059). The contact form keeps
   a message box with a "no medical details" note, and the submitter's copy never repeats the message. Email
   subjects never carry personal details. Detailed health intake belongs in My TAB only. Start and contact submissions are
   emailed to TAB and to the submitter, and saved in the `inquiries` table (whole form, never deleted) only once
   guardrail 4's conditions are met (proposed D-058).
6. **Analytics (D-046, amended by the owner's DIV-04 ruling, proposed D-057):** Plausible on public pages only,
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
- Content files are shaped for migration to **Payload CMS** (D-036, wired after Phase 1 per A-02):
  `services` → collection, `home`/`about`/`method` → globals, `faqs`/`resourceClusters` → collections.
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
  trigger and a test in `supabase/tests/rls.test.mjs`.
- Model for a team, build for one (D-045): roles `owner | practitioner | client`; practitioners see
  only assigned clients.

## Checks before every push
`npm run typecheck`, `npm run build`, `npm run test:rls`, then `npm run test:e2e` (Playwright smoke, redirect-map,
link-crawl, SEO, header-fit, CSP and WCAG 2.2 AA scans against the production build; no retries). CI runs the same on every PR.

## Secrets
Never commit `.env*` files, keys, tokens or database passwords. Local values go in `.env.local`
(git-ignored); deployed values live in Vercel / Supabase / GitHub secrets. `.env.example` lists names only.
