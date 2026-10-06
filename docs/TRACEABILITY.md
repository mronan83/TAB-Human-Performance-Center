---
title: TAB Human Performance Center Traceability
eyebrow: TAB Human Performance Center · Requirements
heading: Requirements & Feature Traceability
owner: Matthew Ronan
updated: 2026-10-06
---

<!-- Edit this file, not the page. scripts/docs/render-traceability.mjs builds the page from it (npm run docs:html), and
     `npm run docs:check` fails CI when a feature, gap or ID reference here doesn't resolve. Counts written as {{name}}
     are computed from the tables, so they can't drift. -->

## How this document works

Every requirement traces down to the features that deliver it, and every feature to the decision, code and check that prove it. Requirements keep the IDs and wording of the requirements register (`docs/requirements-register.md`), which took them from the owner's strategy documents. This doc adds what the register doesn't hold: business objectives, the feature inventory, status, evidence, gaps and open questions. Everything was derived from the repository, first on 2 Oct 2026 at `f43beba` plus PR #28 (C4), and is kept current with every change since. Treat the priorities and objectives as proposals to confirm, reword or reject.

| Level | ID form | Lives in | Example |
| --- | --- | --- | --- |
| Business objective | BO-n | this doc | BO-2 Turn first contact into the right next step |
| Requirement | WEB, GS, PORTAL, STAFF, CMS, INT, SEC, NFR, DS -nnn | requirements register | GS-004 One next step per Start submission |
| Decision | D-nnn, DEC-nnn, owner ruling | master decision record, register §1 and §7.1 | D-054 No health details by email |
| Feature | F-nn | this doc; built in `app/`, `components/`, `lib/`, `supabase/` | F-33 Progress reviews and stage changes |
| Verification | test or check file | `e2e/`, `supabase/tests/rls.test.mjs`, `scripts/check-contrast.mjs` | `e2e/redirects.spec.ts` |
| Open work | backlog ID | `docs/BACKLOG.md` | C5 Sign-in plumbing |
| Gap found while tracing | TG-n | this doc, then the backlog | TG-3 |
| Open question | Q-n | this doc | Q-1 |

**Status** (requirements and features):

- **Verified**: built, and an automated check fails if it breaks.
- **Built**: built, but nothing automated proves it.
- **Partial**: built with a known shortfall, named by a backlog item or a gap.
- **Planned**: agreed, not built.
- **Deferred**: set aside by decision.

**Demo, not live.** My TAB and TAB Practice run on demo data (`portal.dataSource = "mock"`, guardrail 4). Their rows are verified against the demo build and the in-process database tests. No portal migration is applied to a real database until A15 (G3), so no portal requirement is met for real clients yet.

**Priority** is MoSCoW (Must, Should, Could), proposed by Claude for the launch each requirement belongs to. The backlog's P0–P3 ranks work items, so the two scales differ on purpose. **Phase** is the register's: P1 public site, P2 My TAB, P3 integration maturity.

**Keeping it current** (Claude's job, as the owner directed on 2 and 3 Oct). This page is built from `docs/TRACEABILITY.md`; the technical architecture and data model pages, linked at the top, are its companions, and all three are assessed on every change:

- **A merge that changes behaviour**: Claude updates the affected rows and adds a change-log entry in the same session.
- **A new or changed requirement**: Claude adds it to the register first (a *proposed register entry*), then here as Planned, with the features and checks it needs.
- **A backlog item opened or closed**: linked from the requirement it affects, here and in `docs/BACKLOG.md` in the same pull request.
- **A gap found or closed**: a gap here gets a backlog item in the next pull request; closing one updates both together.
- **A question answered in a comment**: Claude records the answer under the question, changes the requirements it decides, and adds a change-log entry.
- **Where code and this doc disagree**, the disagreement is logged in Coverage and gaps, never fixed silently in either (R-028).
- **Every pull request** says in its description what it changed here and in the other two pages, or why nothing needed to change. After it merges, Claude republishes the pages and confirms to the owner which were revised.

## Trace model

<!-- diagram:trace-model -->

The chain is only as strong as its last link: a requirement counts as Verified when a check exists that fails if it breaks, not when the code exists. Anything short of that names the backlog item, gap or question that holds it back, so no shortfall is silent (R-028).

## Business objectives

The public site explains TAB and helps people find a starting point; My TAB carries the ongoing client relationship (Step 16 §16.1). Seven objectives follow from the strategy documents and the master decision record. None has a success measure recorded yet (Q-1).

| ID | Objective | Where it is stated | Served by |
| --- | --- | --- | --- |
| BO-1 | Complete the rebrand from TAB Massage & Fitness to TAB Human Performance Center without losing existing clients, search ranking or bookings | Step 17, Step 19, DEC-015, DEC-019 | WEB, NFR, DS |
| BO-2 | Help a prospective client understand TAB and choose the right starting point, with low pressure and one clear next step | Step 14, Step 16 §16.0, DEC-004 | WEB, GS |
| BO-3 | Grow locally and virtually, across all adult segments including older adults | D-043, D-049, Step 16 §16.8 | WEB, NFR, CMS |
| BO-4 | Give each client one place for their TAB relationship: plan, programs, progress, resources, forms, appointments, billing | Step 16 §16.5 | PORTAL |
| BO-5 | Let practitioners deliver the TAB Method across the five pillars as one care team, modelled for a team and built for one | Step 14, D-045, D-065 (proposed) | STAFF |
| BO-6 | Earn and keep trust: sensitive data protected, scope of practice respected, no health details by email | DEC-010, D-042, D-054, Step 15 §15.8 | SEC, NFR, PORTAL |
| BO-7 | Keep Timely and Stripe as the systems of record for scheduling and payments; link to them, don't rebuild them | DEC-006, D-003, D-052 | INT, PORTAL |

**Requirement areas.** Functional: WEB public website · GS Start Where You Are · PORTAL My TAB · STAFF TAB Practice · CMS content · INT integrations. Non-functional: SEC security and privacy · NFR accessibility, SEO, analytics and launch · DS design system.

## Functional requirements

{{fr.total}} functional requirements in six areas: {{fr.verified}} verified, {{fr.built}} built without a check, {{fr.partial}} partial, {{fr.planned}} planned. The public site is mostly built and waits on content; My TAB and TAB Practice are built in demo mode and wait on the go-live gate (A15). Requirement text is shortened here; the register holds the full wording.

**Reading the columns.** *Verified by* names the check that fails if the requirement breaks: `smoke`, `a11y`, `seo`, `links`, `redirects`, `security`, `header` are `e2e/<name>.spec.ts`; `rls` is `supabase/tests/rls.test.mjs`; `contrast` is `scripts/check-contrast.mjs`. In *Status*, an A or C ID is a backlog item and TG-n is a gap found while tracing.

### Public website (WEB)

| ID | Requirement | Phase | Priority | Status | Features | Verified by |
| --- | --- | --- | --- | --- | --- | --- |
| WEB-001 | Primary nav plus persistent Start Where You Are, Book and My TAB actions | P1 | Must | Verified | F-01 | header, smoke, a11y |
| WEB-002 | Sitemap and the 19 specified URLs | P1 | Must | Partial: 17 of 19 routes; `/resources/articles` and `/resources/guides` missing (TG-2) | F-02 to F-06 | links, seo |
| WEB-003 | Homepage in the approved nine-section order | P1 | Must | Built | F-02 | — |
| WEB-004 | Services landing page, pillars independent and optionally connected | P1 | Must | Verified | F-03 | guardrails |
| WEB-005 | One reusable 10-part service-page template | P1 | Must | Verified | F-03 | guardrails |
| WEB-006 | Every service page offers a direct CTA and a "not sure?" path to `/start` | P1 | Must | Verified | F-03 | guardrails |
| WEB-007 | Related services only where the link is genuine | P1 | Should | Verified | F-03 | guardrails |
| WEB-008 | TAB Method page: Start Where You Are, Transform, Adapt, Balance | P1 | Must | Built | F-04 | — |
| WEB-009 | About, Our Story and Team pages | P1 | Must | Partial: founder story, bio and photos are placeholders (A8) | F-04 | — |
| WEB-010 | Resources hub: articles, guides, events, FAQ | P1 | Should | Partial: topic list and FAQ only; events switched off (TG-2, A8) | F-05 | — |
| WEB-011 | `/book` offers two paths: Timely booking or `/start` | P1 | Must | Verified | F-06 | smoke |
| WEB-012 | Footer with legal, accessibility, policies, location, hours, contact | P1 | Must | Built: address, phone, hours (grouped) and map link set 2026-10-06; gift cards link still open (A6) | F-01 | links |
| WEB-013 | Trust content with consent metadata; no invented testimonials | P1 | Should | Partial: waits on real content (A8) | F-02 | — |
| WEB-014 | Public copy follows the Brand Foundation v2 voice and the Step 15 avoid-lists | P1 | Must | Built | F-02 to F-05 | brand |
| WEB-015 | Transition announcement with a start and end date | P1 | Must | Partial: dated expiry in config; editable once the CMS lands (C8) | F-01 | — |
| WEB-016 | Organization structured data names the former name during transition | P1 | Must | Built | F-13 | — |
| WEB-017 | Our Story: TAB Massage & Fitness (2008) to TAB Human Performance Center | P1 | Should | Partial: placeholder copy (A8) | F-04 | — |
| WEB-018 | Service icons as light navigational markers | P1 | Could | Built: vector icons in the board colours and graphite | F-03, F-17 | — |
| WEB-019 | Favicons, touch, PWA and share icons, light and dark | P1 | Should | Built | F-17 | — |
| WEB-020 | No Client Login until My TAB is live, then "My TAB" (owner ruling 2026-10-06; Book covers Timely) | P1 | Must | Verified | F-01, F-19 | smoke |

### Start Where You Are (GS)

| ID | Requirement | Phase | Priority | Status | Features | Verified by |
| --- | --- | --- | --- | --- | --- | --- |
| GS-001 | Guided form at `/start`, every answer a predefined option (D-059) | P1 | Must | Verified | F-07 | smoke, a11y |
| GS-002 | Ask "How did you find TAB?" | P1 | Should | Verified | F-07 | smoke |
| GS-003 | Short, progressively disclosed, confirmation says what happens next | P1 | Must | Verified | F-07 | smoke, a11y |
| GS-004 | Each submission ends with exactly one next step | P1 | Must | Verified in the demo; live once storage switches on (guardrail 4, A15) | F-10, F-11 | guardrails |
| GS-005 | Staff review submissions and record the routing outcome | P1 | Must | Verified in the demo (TG-8 closed); live once storage switches on | F-11 | guardrails, rls |
| GS-006 | Discovery is never a mandatory gate | P1 | Must | Built | F-06, F-07 | — |

### My TAB client portal (PORTAL)

| ID | Requirement | Phase | Priority | Status | Features | Verified by |
| --- | --- | --- | --- | --- | --- | --- |
| PORTAL-001 | Secure sign-in, MFA available to clients | P2 | Must | Partial: email-link sign-in, sign-up off; client MFA and invitation links wait on C5 | F-19, F-45 | smoke |
| PORTAL-002 | Home dashboard: focus, next appointment, stage, plan, program, resources | P2 | Must | Verified | F-22 | smoke, a11y |
| PORTAL-003 | My Plan shows the TAB Performance Plan "we created together" | P2 | Must | Verified | F-23 | smoke, rls |
| PORTAL-004 | My Programs: activities with client responses and practitioner feedback | P2 | Must | Partial: personalized activities and check-off verified; responses and feedback not built (TG-4) | F-24 | smoke, rls |
| PORTAL-005 | My Progress: goals, reviews, wins, optional measures; never a scoreboard | P2 | Should | Built | F-25 | — |
| PORTAL-006 | Appointments link to Timely Client Login | P2 | Must | Partial: the Client Login link isn't supplied yet (A5) | F-26 | — |
| PORTAL-007 | My Resources: assigned resources plus the wider library | P2 | Should | Partial: assigned resources verified; the library is the public topic list (TG-2) | F-28 | smoke, rls |
| PORTAL-008 | Forms and documents: intakes, consents, check-ins, uploads | P2 | Must | Partial: assigned forms and consents built; uploads not built (SEC-007) | F-27, F-30, F-39 | rls |
| PORTAL-009 | Billing opens the Stripe customer portal | P2 | Could | Partial: built server-side; no Stripe account yet (A17) | F-29 | — |
| PORTAL-010 | Profile: contact, preferences, accessibility needs, goals | P2 | Should | Partial: contact and consents only (TG-5) | F-30 | rls |
| PORTAL-011 | Shared summaries marked "shared"; raw notes never shown | P2 | Must | Verified | F-32, F-34 | smoke, rls |
| PORTAL-012 | Notifications only for meaningful actions; nothing sensitive in previews | P2 | Must | Partial: one email, no details; no channel choice; no check on email content (TG-3) | F-33 | — |

### TAB Practice (STAFF)

| ID | Requirement | Phase | Priority | Status | Features | Verified by |
| --- | --- | --- | --- | --- | --- | --- |
| STAFF-001 | One client record in three layers: profile, service record, TAB journey | P2 | Must | Built | F-31 | — |
| STAFF-002 | TAB Client Profile with the Step 14 fields | P2 | Should | Partial: basic fields only | F-31 | — |
| STAFF-003 | Service-specific intakes for all five pillars | P2 | Should | Planned (CON-002) | F-48 | — |
| STAFF-004 | Session notes: status, intervention, response, next step; internal apart from shared | P2 | Must | Partial: internal and shared verified; the four-part pattern isn't structured | F-32 | rls |
| STAFF-005 | Author the Performance Plan with the client | P2 | Must | Verified | F-34 | smoke, rls |
| STAFF-006 | Progress reviews with the "does the approach still fit?" decision | P2 | Must | Verified | F-33, F-46 | smoke, rls |
| STAFF-007 | Cross-service referral and handoff with consent | P2 | Should | Planned: table exists, no screens | F-49 | rls |
| STAFF-008 | Record the continuation outcome (Continue, Maintain, Independent, Shift, Pause, Return) | P2 | Should | Partial: review outcomes use a different set (TG-1) | F-33 | — |
| STAFF-009 | Author program templates; assign and personalize per client | P2 | Must | Verified | F-35, F-36, F-37, F-38, F-47 | smoke, rls |
| STAFF-010 | Assign resources to clients or programs | P2 | Must | Verified for clients; programs reach resources through activities | F-39 | smoke, rls |

### Content and CMS (CMS)

| ID | Requirement | Phase | Priority | Status | Features | Verified by |
| --- | --- | --- | --- | --- | --- | --- |
| CMS-001 | Content types for services, practitioners, articles, programs and more | P1 | Should | Partial: shaped in `content/*.ts` for Payload; Payload waits on C8 | F-44 | — |
| CMS-002 | Taxonomy by pillar, stage, need, format and audience | P1 | Could | Planned (C8) | F-44 | — |
| CMS-003 | One canonical resource, assigned by reference, never copied | P2 | Should | Partial: assignments hold a link, not a CMS reference | F-39, F-44 | — |
| CMS-004 | Governance fields: owner, scope and accessibility review, review dates | P1 | Could | Planned (C8) | F-44 | — |
| CMS-005 | Taglines, headlines and CTA labels are content, not code | P1 | Must | Partial: in content files, not yet owner-editable (C8) | F-02, F-44 | — |

### Integrations (INT)

| ID | Requirement | Phase | Priority | Status | Features | Verified by |
| --- | --- | --- | --- | --- | --- | --- |
| INT-001 | Timely booking and Client Login links from the site and My TAB | P1 | Must | Verified for booking; Client Login link pending (A5) | F-06, F-26 | smoke |
| INT-002 | Internal UUID is the identity; Timely, Stripe and portal IDs are mapped fields | P2 | Must | Built | F-20 | — |
| INT-003 | Stripe portal sessions created server-side; no card data stored | P2 | Must | Partial: built; no Stripe account (A17) | F-29 | — |
| INT-004 | Stripe webhooks update memberships and packages | P3 | Should | Verified: each event applies in one transaction; past-due, refunds and unpaid checkouts handled (C3b) | F-29 | rls |
| INT-005 | Timely to My TAB sync through Zapier, one way | P3 | Could | Planned | F-50 | — |
| INT-006 | Reconcile duplicate clients before any sync | P3 | Should | Partial: submissions match by email and link on purpose; no Timely or Stripe matching | F-11 | rls |

## Non-functional requirements

{{nfr.total}} non-functional requirements in three areas: {{nfr.verified}} verified, {{nfr.built}} built without a check, {{nfr.partial}} partial, {{nfr.planned}} planned. The database security gate is the best-proved part of the system: every SEC-016 to SEC-018 rule has a test that fails if it breaks. Since C3b, internal notes sit in a private schema behind audited functions and Stripe events apply in one transaction. What's left is mostly the go-live plumbing in C5 and C6, the audit export's secrets (A26) and backups (A14).

### Security and privacy (SEC)

| ID | Requirement | How it is enforced | Phase | Priority | Status | Verified by |
| --- | --- | --- | --- | --- | --- | --- |
| SEC-001 | Role-based access for client, practitioner, operations and owner | Roles `owner`, `practitioner`, `client` (D-045); front desk and supervisor not modelled | P2 | Must | Partial | rls |
| SEC-002 | Clients see only their own data; practitioners only their assigned clients | Row-level security on every client table; `can_access_client()` | P1+ | Must | Verified | rls |
| SEC-003 | MFA mandatory for all staff | Staff role counts only in an `aal2` session; enrolment screen waits on C5 | P1+ | Must | Partial | rls |
| SEC-004 | Encryption in transit and at rest; secrets server-side only | Vercel and Supabase defaults; service role used only in server code | P1 | Must | Built | — |
| SEC-005 | Audit log of sensitive changes and admin actions | `audit_row()` trigger on every client table; log read-only to signed-in users | P2 | Must | Verified | rls |
| SEC-006 | Nothing sensitive in logs, analytics, URLs, email subjects or SMS | Property-less analytics events; fixed email subjects, checked with sample data (TG-3 closed) | P1 | Must | Verified | guardrails |
| SEC-007 | Secure uploads with short-lived links and malware scanning | No uploads yet | P2 | Should | Planned | — |
| SEC-008 | Separate environments; synthetic data outside production | Preview and production both run demo data; one Supabase project, no separate test database | P1 | Must | Partial | — |
| SEC-009 | Retention, backup and recovery defined, and a restore tested, before launch | Supabase Pro and a tested restore (A14, A15) | P1 | Must | Planned | — |
| SEC-010 | Consent records with purpose, version, date and withdrawal | Insert-only, server-stamped consent history | P2 | Must | Verified | rls |
| SEC-011 | Dependency patching, vulnerability scanning, incident playbook | Weekly Dependabot PRs; `npm audit` in CI; no incident playbook yet (TG-9) | P1 | Must | Partial | CI |
| SEC-012 | Owner access to sensitive data is limited and audited, not automatically universal | Owner sees every client by design (D-045); access is audited | P2 | Should | Partial (Q-3) | rls |
| SEC-013 | Bot protection and rate limits on forms; nonce-based CSP with `frame-ancestors 'none'` | `lib/spam.ts` layers; Turnstile once keys exist (A3); `lib/csp.ts` | P1 | Must | Verified | security, smoke |
| SEC-014 | No public sign-up; accounts by invitation | Sign-up off; Invite to My TAB built (C4); invitation confirm route waits on C5 | P2 | Must | Partial | rls, smoke |
| SEC-015 | Staff MFA enforced; nobody clears their own requirement | `current_app_role()` and `requireStaff`; enrolment and verification screens built (F-53) | P2 | Must | Partial | rls |
| SEC-016 | Client writes limited to allowed columns; consents insert-only | `guard_client_columns`, `guard_client_update`, form submission guards | P2 | Must | Verified | rls |
| SEC-017 | Program content readable only when published and entitled | `can_read_program()` on modules and activities | P2 | Must | Verified | rls |
| SEC-018 | Practitioners confined to their care team; authorship pinned | `can_access_client()`, `stamp_author()`, `guard_same_client()` | P2 | Must | Verified | rls |
| SEC-019 | Internal notes behind audited functions; audit log drained off-platform | Private schema reached only through audited functions; append-only audit log; nightly encrypted export built (`.github/workflows/audit-export.yml`) | P2 | Must | Partial: the export runs once its secrets exist (A26) | rls |
| SEC-020 | Secure session cookies; transactional Stripe webhook | `apply_stripe_event()` in one transaction; `httpOnly`, `secure`, seven-day cookies (`lib/supabase/cookies.ts`) | P2 | Must | Partial: webhook verified; cookie settings have no automated check until C6 | rls |
| SEC-021 | Supabase-native tests in CI (JWT, MFA level, sign-up, grants) | Today's tests run in an in-process Postgres with stubbed auth; real stack waits on C6 | P2 | Must | Planned | — |

### Accessibility, SEO, analytics and launch (NFR)

| ID | Requirement | How it is enforced | Phase | Priority | Status | Verified by |
| --- | --- | --- | --- | --- | --- | --- |
| NFR-001 | WCAG 2.2 AA across the site and My TAB | axe scans of every public page, menus, form errors and portal pages; no manual screen-reader pass yet | P1 | Must | Verified (automated rules) | a11y, header |
| NFR-002 | Technical SEO: sitemap, robots, canonicals, 404, Core Web Vitals | Sitemap, canonicals and branded 404 checked; Core Web Vitals not measured | P1 | Must | Partial | seo, smoke |
| NFR-003 | Titles, descriptions and structured data follow the pattern | Unique titles, descriptions and share tags on every sitemap page | P1 | Must | Verified | seo |
| NFR-004 | Legacy redirect map complete before launch | `config/redirects.ts`, 64 mapped paths | P0/P1 | Must | Verified | redirects |
| NFR-005 | Privacy-aware analytics; none on My TAB, TAB Practice or `/contact` | Vercel Web Analytics drops those paths in the tracker (D-057, A4), checked in `e2e/guardrails.spec.ts` | P1 | Must | Verified | guardrails |
| NFR-006 | The named public events are counted | Start funnel, `Service: Viewed` and `Booking: Clicked` (TG-7 closed); counted by Vercel Web Analytics once it's switched on in the project (A4) | P1 | Should | Built | guardrails |
| NFR-007 | Launch smoke tests automated and run on previews and production | Run in CI on the production build; previews need A18; production after cutover (C2) | P1 | Must | Partial | smoke |
| NFR-008 | Redirects are single-hop 301/308, no chains or loops | Middleware; trailing slashes and legacy host covered | P1 | Must | Verified | redirects |
| NFR-009 | Nothing indexable before launch | `noindex` until the production domain; portal never indexable | P1 | Must | Verified | seo |
| NFR-010 | 30 days of post-launch monitoring with alerts | Waits on launch (C2) | P1 | Should | Planned | — |

### Design system (DS)

| ID | Requirement | How it is enforced | Phase | Priority | Status | Verified by |
| --- | --- | --- | --- | --- | --- | --- |
| DS-001 | Token JSON is the single source; CSS generated from it, never hand-copied | Tokens are hand-copied into `app/globals.css`, with the D-056 contrast fixes (TG-6) | P1 | Should | Partial | contrast |
| DS-002 | Montserrat for headings and UI, Spectral for editorial accents, both self-hosted | `next/font/local` in `app/fonts`; the CSP blocks third-party fonts | P1 | Must | Verified | security |
| DS-003 | Uppercase label style used sparingly | `.text-label` | P1 | Could | Built | — |
| DS-004 | Deep Olive primary button, Clay Dark secondary | `.btn-primary`, `.btn-secondary` | P1 | Must | Built | — |
| DS-005 | Every colour pairing in use meets WCAG 2.2 AA, checked in CI | Contrast check over the token pairings | P1 | Must | Verified | contrast |
| DS-006 | Production SVG logos for every lockup, light and reversed, plus a small symbol | Approved redraw installed: horizontal, stacked and symbol in colour, graphite, white and sheen; favicon set and app icons | P1 | Must | Built | — |
| DS-007 | Real people and places, natural light; no before-and-after imagery | Stock library (C21): the 30 curated Pexels images in `content/images.ts`, 17 placed (homepage, About, TAB Method, every service page), all decorative and never shown as TAB's people or facility; TAB's own team, facility and proof photography still to come (A8) | P1 | Should | Partial | a11y |

## Feature inventory

{{f.total}} features: {{f.builtAny}} built (the portal ones in demo mode) and {{f.planned}} planned. A feature is a unit someone can see or use, built in one place in the code. Each names the requirements it serves, so the trace runs both ways: requirement down to feature, feature up to the reason it exists. The *Requirements* column is the exact inverse of the *Features* column in the requirement tables above, plus the non-functional requirements each feature carries. *Checks* lists checks that test the feature's behaviour; the CSP scan (`security`) loads every portal page but is not counted here.

### Public website

| ID | Feature | Status | Requirements | Decisions | Code | Checks |
| --- | --- | --- | --- | --- | --- | --- |
| F-01 | Site header, footer, transition banner | Partial: footer facts (A6) | WEB-001, WEB-012, WEB-015, WEB-020, NFR-001 | D-063, D-065 (proposed) | `components/SiteHeader.tsx`, `SiteFooter.tsx`, `TransitionBanner.tsx`, `config/navigation.ts` | header, smoke, a11y |
| F-02 | Homepage | Partial: trust content and photos (A8) | WEB-002, WEB-003, WEB-013, WEB-014, CMS-005, DS-007 | D-064, D-065 (proposed) | `app/(site)/page.tsx`, `content/pages.ts` | links, a11y |
| F-03 | Services landing and service pages | Partial: 14 draft FAQs (A8) | WEB-002, WEB-004 to WEB-007, WEB-014, WEB-018 | D-065 (proposed), Step 15 §15.8 | `app/(site)/services/`, `content/services.ts` | links, seo, a11y |
| F-04 | TAB Method, About, Our Story, Team | Partial: founder story, bio, photos (A8) | WEB-002, WEB-008, WEB-009, WEB-014, WEB-017 | D-027 | `app/(site)/tab-method/`, `about/` | links, a11y |
| F-05 | Resources, FAQ, Events | Partial: topic list only (TG-2) | WEB-002, WEB-010, WEB-014 | D-036 | `app/(site)/resources/`, `faq/`, `events/` | links, a11y |
| F-06 | Book page | Verified | WEB-002, WEB-011, GS-006, INT-001 | D-003 | `app/(site)/book/`, `components/Cta.tsx` | smoke, links |
| F-07 | Start Where You Are form | Verified | GS-001, GS-002, GS-003, GS-006, SEC-006 | D-054, D-059 | `app/(site)/start/`, `components/InquiryForm.tsx`, `lib/inquiry.ts` | smoke, a11y |
| F-08 | Contact form | Verified | SEC-006, SEC-013 | D-054 | `app/(site)/contact/`, `components/InquiryForm.tsx` | smoke, a11y |
| F-09 | Form spam protection | Partial: Turnstile keys (A3) | SEC-013 | — | `lib/spam.ts`, `components/Turnstile.tsx` | smoke |
| F-10 | Submission email and storage | Partial: email live through Resend in a branded layout (A2 done 2026-10-06); storage waits on A15 | GS-004, SEC-006 | D-054, D-058 | `app/api/inquiry/`, `lib/email.ts`, `lib/email-template.ts`, `lib/inquiry-store.ts`, `content/emails.ts` | — (TG-3, TG-8) |
| F-11 | Submissions in TAB Practice | Built (demo) | GS-004, GS-005, INT-006 | D-058 | `app/(portal)/practice/inquiries/` | rls |
| F-12 | Legacy redirects | Verified | NFR-004, NFR-008 | RSK-009 | `config/redirects.ts`, `middleware.ts` | redirects |
| F-13 | SEO metadata, sitemap, robots, structured data | Verified | WEB-016, NFR-002, NFR-003, NFR-009 | D-038 | `lib/seo.ts`, `lib/jsonld.ts`, `app/sitemap.ts`, `app/robots.ts` | seo |
| F-14 | Privacy-friendly analytics (Vercel Web Analytics) | Built; counting starts when the site is public | NFR-005, NFR-006 | D-046, D-057 (amended, A4) | `components/Analytics.tsx`, `lib/analytics.ts` | guardrails |
| F-15 | Content-Security-Policy and headers | Verified | SEC-004, SEC-013 | — | `lib/csp.ts`, `middleware.ts`, `next.config.ts` | security |
| F-16 | Design tokens, fonts and contrast check | Partial: hand-copied tokens (TG-6); the portal's status tints are tokens too, and `npm run test:brand` blocks hex colours in classes | DS-001 to DS-005, NFR-001 | D-062 (proposed; replaces D-053, D-056) | `app/globals.css`, `app/fonts/`, `scripts/check-contrast.mjs` | contrast, a11y |
| F-17 | Logo, icons, manifest | Built | WEB-018, WEB-019, DS-006 | D-061 (proposed; replaces D-027) | `public/brand/`, `components/Logo.tsx`, `app/manifest.ts` | smoke |
| F-18 | Launch checklist and draft markers | Verified | — (guardrail 10) | CLAUDE.md guardrail 10 | `app/(site)/launch-checklist/`, `lib/placeholders.ts`, `components/DraftFlag.tsx` | smoke |

### My TAB (client portal)

| ID | Feature | Status | Requirements | Decisions | Code | Checks |
| --- | --- | --- | --- | --- | --- | --- |
| F-19 | My TAB sign-in and demo sign-in | Partial: real sign-in needs C5 | WEB-020, PORTAL-001, SEC-014, SEC-020 | D-042 | `app/(portal)/my-tab/login/`, `my-tab/auth/callback/route.ts` | smoke |
| F-20 | Portal data layer and demo mode | Verified | INT-002, SEC-008 | D-042, D-045 | `lib/portal/types.ts`, `mock-repository.ts`, `supabase-repository.ts` | smoke |
| F-21 | Database security gate (RLS, guards, audit) | Partial: C6, A26 | SEC-001 to SEC-003, SEC-005, SEC-010, SEC-012, SEC-015 to SEC-019 | D-042, D-060 | `supabase/migrations/` | rls |
| F-22 | Dashboard | Verified (demo) | PORTAL-002 | — | `app/(portal)/my-tab/page.tsx` | smoke |
| F-23 | My plan | Verified (demo) | PORTAL-003 | — | `my-tab/plan/` | smoke, rls |
| F-24 | My programs | Partial: no responses or feedback (TG-4) | PORTAL-004 | — | `my-tab/programs/`, `lib/portal/programs.ts` | smoke, rls |
| F-25 | My progress and check-in | Built (demo) | PORTAL-005 | — | `my-tab/progress/`, `components/portal/TrendChart.tsx` | — |
| F-26 | Appointments | Partial: Client Login link (A5) | PORTAL-006, INT-001 | D-003 | `my-tab/appointments/` | — |
| F-27 | Forms | Partial: no uploads (SEC-007) | PORTAL-008 | D-054 | `my-tab/forms/` | smoke, rls |
| F-28 | Resources | Partial: library is the topic list (TG-2) | PORTAL-007 | — | `my-tab/resources/`, `lib/portal/resources.ts` | smoke, a11y, rls |
| F-29 | Billing (Stripe) and purchase reviews | Partial: Stripe account (A17) | PORTAL-009, INT-003, INT-004, SEC-020 | D-052, owner ruling 2026-10-03 | `my-tab/billing/`, `app/api/checkout/`, `billing-portal/`, `stripe/`, `practice/page.tsx` | smoke, rls |
| F-30 | Profile and consents | Partial: no accessibility needs or goals (TG-5) | PORTAL-008, PORTAL-010, SEC-010 | — | `my-tab/profile/` | rls |

### TAB Practice (practitioner workspace)

| ID | Feature | Status | Requirements | Decisions | Code | Checks |
| --- | --- | --- | --- | --- | --- | --- |
| F-31 | Client list and client page | Partial: basic profile fields (STAFF-002) | STAFF-001, STAFF-002 | D-045 | `app/(portal)/practice/page.tsx`, `practice/clients/[id]/page.tsx` | smoke, a11y, rls |
| F-32 | Session notes, internal and shared | Partial: the four-part pattern isn't structured | PORTAL-011, STAFF-004, SEC-019 | D-042 | `practice/clients/[id]/page.tsx` | smoke, rls |
| F-33 | Progress reviews and stage changes | Partial: outcome set differs (TG-1) | PORTAL-012, STAFF-006, STAFF-008 | Step 14 | `practice/clients/[id]/review/` | smoke, a11y, rls |
| F-34 | Typed plans and plan log | Verified (demo) | PORTAL-011, STAFF-005 | — | `practice/clients/[id]/plans/` | smoke, a11y, rls |
| F-35 | Program assignment and personalization | Verified (demo) | STAFF-009 | — | `practice/clients/[id]/programs/` | smoke, a11y, rls |
| F-36 | Program editor with versions | Verified (demo) | STAFF-009 | — | `practice/programs/`, `components/portal/ProgramEditor.tsx`, `lib/portal/program-editor.ts` | smoke, a11y, rls |
| F-37 | Version moves and client-only activities | Verified (demo) | STAFF-009 | — | `practice/clients/[id]/programs/`, `components/portal/interactive.tsx` | smoke, rls |
| F-38 | Team page (publishing permission) | Verified (demo) | STAFF-009, SEC-001 | D-045 | `practice/team/` | smoke, a11y, rls |
| F-39 | Invite to My TAB, assign forms, share resources | Partial: invite email needs C5 | STAFF-010, PORTAL-008, CMS-003, SEC-014 | D-054 | `practice/clients/[id]/page.tsx`, migration `20261005000000` | smoke, a11y, rls |
| F-53 | Owner settings and staff sign-in with two-step verification | Live 2026-10-06; part 2 (booking links, page switches, C23b) in review, its migration needs G3 | SEC-001, SEC-015 | D-067 (proposed) | `practice/settings/`, `practice/login/`, `practice/verify/`, `practice/auth/callback/route.ts`, `lib/settings.ts`, `config/navigation.ts`, migrations `20261009000000` and `20261010000000` | settings, a11y, rls |

### Delivery and operations

| ID | Feature | Status | Requirements | Decisions | Code | Checks |
| --- | --- | --- | --- | --- | --- | --- |
| F-40 | CI checks on every PR | Verified | NFR-001, NFR-007, SEC-011 | R-028 | `.github/workflows/ci.yml`, `playwright.config.ts` | CI |
| F-41 | Staged production and Vercel login | Built (Vercel settings) | NFR-009, SEC-008 | Owner rulings 2026-09-28 | Vercel project settings, `CLAUDE.md` | — |
| F-42 | Main-branch guard | Built | — (owner ruling) | Owner ruling 2026-09-28 | `.claude/hooks/guard-main.mjs` | — |
| F-43 | Backlog page | Built | — (owner ruling) | Owner ruling 2026-10-02 | `scripts/render-backlog.mjs`, `docs/BACKLOG.md` | — |
| F-52 | Living traceability, architecture and data model pages | Verified | — (owner ruling) | Owner requests 2026-10-02 and 2026-10-03 | `scripts/docs/`, `docs/TRACEABILITY.md`, `docs/ARCHITECTURE.md`, `docs/DATA-MODEL.md`, `docs/schema.json` | CI (`npm run docs:check`) |

### Planned

| ID | Feature | Status | Requirements | Backlog |
| --- | --- | --- | --- | --- |
| F-44 | Payload CMS | Planned | CMS-001 to CMS-005 | C8 (after Phase 1, A-02) |
| F-45 | Sign-in plumbing: invitation-link check left (auth URLs, Resend email and branded templates done 2026-10-06; staff MFA in F-53) | Planned | PORTAL-001, SEC-003, SEC-014, SEC-015 | C5 |
| F-46 | Stage-readiness prompts | Planned | STAFF-006 | C14 |
| F-47 | AI program drafting (templates only) | Planned | STAFF-009 | C13, A24 |
| F-48 | Service intakes for the five pillars | Planned | STAFF-003 | not yet on the backlog |
| F-49 | Referrals and handoffs | Planned | STAFF-007 | not yet on the backlog |
| F-50 | Timely sync | Planned | INT-005 | not scheduled; Timely has no public API (D-003) |
| F-51 | Post-launch monitoring | Planned | NFR-010 | C2 |

## Coverage and gaps

<!-- chart:status-by-area -->

The weak spot is not security, it is everything nobody wrote a check for. Start and routing, quality and TAB Practice lead, because their checks were written with the code. Security is at 33%, and most of its partial rows wait on C5, C6 and A26. The public website is the opposite: 9 of its 20 requirements are built and look right, but nothing fails if a later change breaks them. Content (CMS) has no verified requirement because Payload waits until after Phase 1 (A-02).

### Gaps found while tracing

{{gaps}} gaps found while tracing. Each now has a backlog item (C15 to C19) or waits on an owner ruling (A25); a gap closes here and on the backlog in the same pull request.

| ID | Gap | Requirements | Proposed resolution | Size | Backlog |
| --- | --- | --- | --- | --- | --- |
| TG-1 | Progress-review outcomes in TAB Practice use a different set from Step 14's six continuation outcomes (Continue, Maintain, Independent, Shift, Pause, Return) | STAFF-008 | Owner ruling: adopt Step 14's six, or record ours as an amendment. Recommend Step 14's: it is the documented model and reporting will need it | S | A25 (Q-5) |
| TG-2 | `/resources/articles` and `/resources/guides` don't exist; the library is a topic list | WEB-002, WEB-010, PORTAL-007 | Defer to Payload (C8) and amend WEB-002 to 17 routes for Phase 1, rather than build pages with nothing in them | S (ruling) | A25 (Q-6) |
| TG-3 | No automated check that emails, subjects and previews carry no personal or health details | **Closed 2026-10-06 (C15):** `e2e/guardrails.spec.ts`. SEC-006, PORTAL-012, guardrail 5 | A unit test over `content/emails.ts` that renders every template with sample data and fails on name, message or answer text in a subject | S | C15 |
| TG-4 | Clients can't respond to an activity and practitioners can't give feedback | PORTAL-004 | New backlog item: activity responses and feedback, with RLS and tests. Needed before the pilot only if programs are central to it | M | A25 (Q-2) |
| TG-5 | Profile has no accessibility needs or goals | PORTAL-010 | Add both fields, client-editable through `guard_client_columns` | S | C16 |
| TG-6 | Tokens are hand-copied into `app/globals.css`, not generated from the token JSON | DS-001 | Generate the CSS variables from the JSON in the build, and keep the contrast check | S | C17 |
| TG-7 | Only the Start funnel events are counted | **Closed 2026-10-06 (C18).** NFR-006 | Add `service_view` and `book_click` (property-less) once Plausible exists (A4) | S | C18 |
| TG-8 | No end-to-end test that a submission gets exactly one next step and shows in TAB Practice | **Closed 2026-10-06 (C15):** an e2e test through the Start form and TAB Practice in the demo. GS-004, GS-005 | An e2e test through `/api/inquiry` in demo mode | S | C15 |
| TG-9 | No incident-response playbook | SEC-011 | A one-page runbook: who to call, how to revoke keys, how to tell clients. Pair it with counsel's breach duties (A7) | S | C19 |

### Requirements no feature delivers

Three requirements have no feature, because each is an operation, not a screen:

- **SEC-007** secure uploads: no uploads exist. Keep it planned; build it only when a form needs an attachment.
- **SEC-009** backups and a tested restore: A14, then A15.
- **SEC-021** Supabase-native tests in CI: C6.

### Features no requirement asks for

F-18 (launch checklist), F-42 (main-branch guard), F-43 (backlog page) and F-52 (these living pages) come from `CLAUDE.md` guardrails and owner rulings, not the register. That is fine, but it means the register is not the whole scope. Proposed: add them to the register as NFR entries so the scope has one home.

### Built but unchecked

{{req.built}} requirements are built with no check: WEB-003, WEB-008, WEB-016, WEB-018, WEB-019, GS-006, INT-002, PORTAL-005, STAFF-001, SEC-004, DS-003, DS-004 and DS-006. C15 added checks for the analytics exclusion (NFR-005), email privacy (SEC-006) and the service-page anatomy (WEB-004 to WEB-007) on 2026-10-06.

### What each open backlog item holds back

| Backlog | Unblocks |
| --- | --- |
| A1 domain (done 2026-10-06) | Now unblocks A2, A3, A4, C1, C2 and C5 |
| A2 Resend (done 2026-10-06) | GS-004 (emails send), PORTAL-012 |
| A3 Turnstile | SEC-013 in full |
| A4 analytics (Vercel Web Analytics, ruled 2026-10-06) | NFR-006 |
| A5 Timely Client Login | INT-001, PORTAL-006 |
| A6 business facts (gift cards link left) | WEB-012 (gift cards) |
| A7 legal review (approved 2026-10-06; retention ruled) | guardrail 4 privacy condition met, so A15 |
| A8 content | WEB-009, WEB-010, WEB-013, WEB-017, DS-007 |
| A14 Supabase Pro | SEC-009 |
| A17 Stripe | PORTAL-009, INT-003 |
| C2 launch day | NFR-007, NFR-010 |
| A26 audit export secrets | SEC-019 |
| C5 sign-in plumbing | PORTAL-001, SEC-003, SEC-014, SEC-015 |
| C6 real-stack tests | SEC-021 |
| C8 Payload CMS | CMS-001 to CMS-005, WEB-015 |
| A15 go-live gate | GS-004 and GS-005 storage, and every portal requirement for real clients |
| A25 owner rulings | Q-1, Q-2, Q-3, Q-5, Q-6; STAFF-008 (TG-1), WEB-002 (TG-2), SEC-012 |
| C15 guardrail checks | NFR-005, SEC-006, PORTAL-012, GS-004, GS-005, WEB-004 to WEB-007 move from Built or Partial to Verified |
| C16 profile fields | PORTAL-010 |
| C17 generated tokens | DS-001 |
| C18 public events | NFR-006 |
| C19 incident runbook | SEC-011 |

## Open questions

Questions for the owner. Each answer becomes a register entry or a backlog item, and the question closes here with a link to where it went.

| ID | Question | Why it matters | Claude's recommendation |
| --- | --- | --- | --- |
| Q-1 | What does success look like for each business objective (BO-1 to BO-7)? | Without a measure, "done" means "shipped", not "worked". Nothing in the strategy documents sets a number | Pick one measure per objective before launch, such as Start submissions per month or pilot clients active after 30 days. Plausible (A4) and the `inquiries` table can count most of them |
| Q-2 | Does the My TAB pilot (A16) need clients to respond to activities (TG-4)? | It is the largest open portal feature, and it changes what the pilot can teach | Not for the first pilot. Run it with check-offs and session notes, and ask the pilot clients whether they want to reply in My TAB before building it |
| Q-3 | SEC-012 says owner access should be "not automatically universal"; D-045 lets the owner see every client. Which wins? | With one practitioner the difference is invisible; with a second practitioner it decides who reads whose notes | Keep D-045 for now (audited), and record SEC-012 as amended until a second practitioner joins |
| Q-4 | Are the MoSCoW priorities in this doc right? | Claude proposed them; they decide what is cut if launch slips | Review the Must rows only; Should and Could can wait |
| Q-5 | TG-1: adopt Step 14's six continuation outcomes in progress reviews? | Reviews written now will use whichever set is live | Yes, before the pilot, so no reviews need migrating |
| Q-6 | TG-2: amend WEB-002 to 17 routes for Phase 1, with articles and guides arriving with Payload? | Empty pages hurt more than missing ones | Yes |
| Q-7 | Should clients be able to change the health summary and contraindications in their wellness profile? Today they can read and update the whole row (`client_wellness_profiles`), unlike other tables where `guard_client_columns` limits them | A contraindication a practitioner recorded could be edited away by the client, and the next session would rely on it | Clients keep reading both and add their own notes; only the care team changes contraindications. One guard trigger, plus a database test |

## Change log

Claude adds a row for every change to this doc: what changed and which merge, ruling or finding caused it.

| Date | Version | Change | Cause |
| --- | --- | --- | --- |
| 2026-10-02 | 1.0 | Created: 7 objectives, 97 requirements, 51 features, 9 gaps, 6 questions | Owner request, 2 Oct 2026. Traced from the repository at `f43beba` plus PR #28 (C4, not yet merged) |
| 2026-10-03 | 1.1 | Moved from a Claude Doc into `docs/TRACEABILITY.md`, published as an HTML page in the layout the owner asked for; counts now computed from the tables; companion architecture and data model pages added; four one-way feature links fixed; Q-7 raised from the data model review | Owner request, 3 Oct 2026 |
| 2026-10-03 | 1.2 | C3b: SEC-019 and SEC-020 partial, INT-004 verified; F-21, F-29 and F-32 updated; A26 added | C3b build, owner rulings 2026-10-03 (refunds, audit export, private notes) |
| 2026-10-05 | 1.3 | Rebrand to TAB Human Performance Center: name throughout; homepage hero from the board mock-up; TAB Method stages renamed Adapt and Balance (enum values renamed); five pillars (Integrated Nutrition page; Functional Strength and Women’s Wellness renamed, old URLs redirect; `service_slug` gains `integrated-nutrition`); DS-002, DS-004 and DS-006 restated for the new identity; WEB-018 and DS-006 built; F-16 and F-17 point at proposed D-061 and D-062; A9 and A19 closed | Owner rulings 2026-10-05 (rebrand baseline), rebrand PR 1 |
| 2026-10-05 | 1.4 | Rebrand PR 2: public copy rewritten in the Brand Foundation v2 voice (pillar counts, FAQ, About, Our Story, service lists from Step 13); WEB-014 now checked by `npm run test:brand` | Owner, 2026-10-05: "We can’t have misaligned verbiage and content" |
| 2026-10-05 | 1.5 | TAB Wellness Plan renamed TAB Performance Plan (PORTAL-003, STAFF-005); TAB Practice keeps its name | Owner rulings A27, A28 |
| 2026-10-05 | 1.6 | Rebrand PR 4: My TAB and TAB Practice restyled to the new identity (C22); F-16 updated for the portal tint tokens and the colour rule in `npm run test:brand` | Owner request, 2026-10-05 |
| 2026-10-06 | 1.7 | Rebrand PR 3: stock image library placed by page (C21); DS-007 updated | Owner request, 2026-10-05 |
| 2026-10-06 | 1.8 | Domains registered and email set up (proposed D-066); switch-over Phase A: demo portal off on production, site URL and form addresses on `tabhumanperformance.com`; A1 closed; owner Settings page approved (proposed D-067, C23) | Owner rulings 2026-10-06 |
| 2026-10-06 | 1.9 | Homepage closing band re-imaged to echo the hero (DS-007); no requirement changes | Owner feedback, 2026-10-06 |
| 2026-10-06 | 1.10 | Branded email layout for Start, contact and My TAB emails (GS-004 emails now send; A2 closed) | Owner feedback, 2026-10-06 |
| 2026-10-06 | 1.11 | Business facts on the site (WEB-012 built, gift cards aside); privacy policy and terms drafted for review (A7); launch targeted 1 November (GAP-017); stock photography confirmed for launch | Owner rulings 2026-10-06 |
| 2026-10-06 | 1.12 | C23: owner Settings page and real staff sign-in with two-step verification (F-53); SEC-015's enrolment screen built; F-45 narrowed to auth URLs and invitation emails; `app_settings` added to the data model | Owner request and design approval, 2026-10-06 (proposed D-067) |
| 2026-10-06 | 1.13 | Production database set up and owner signed in with two-step verification (G3); Supabase sign-in, invitation and security emails branded (`content/auth-emails.ts`); F-45 narrowed to the invitation-link check | Owner approvals and request, 2026-10-06 |
| 2026-10-06 | 1.14 | WEB-020 restated: header and footer hide the account link until the client portal is open, then show "My TAB" | Owner ruling, 2026-10-06 |
| 2026-10-06 | 1.15 | C15 checks (`e2e/guardrails.spec.ts`): NFR-005, SEC-006, GS-004/005 and WEB-004 to 007 verified; TG-3 and TG-8 closed. C18 events (NFR-006 built, TG-7 closed). A7 legal pages approved; A12 service-area wording | Owner rulings and requests, 2026-10-06 |
| 2026-10-06 | 1.16 | C23b: per-service Book links and page switches in Settings (F-53); Events and Testimonials locked until real content exists; settings checks run in their own e2e project | Owner request, 2026-10-06 |
| 2026-10-06 | 1.17 | Client policies written from the owner's policies (A30, WEB-012 footer links now resolve to real content); retention ruled: submissions never deleted (A7, proposed D-058), privacy policy updated to match | Owner rulings, 2026-10-06 |
| 2026-10-06 | 1.18 | Analytics: Plausible replaced by Vercel Web Analytics (owner ruling A4; F-14, NFR-005, NFR-006); client policies cover all five pillars and no-shows (A30); Turnstile keys set (A3, SEC-013) | Owner rulings, 2026-10-06 |

## Sources

- **Requirements register:** `docs/requirements-register.md` (requirement IDs and full wording, decisions, gaps, risks).
- **Decision record:** `docs/source/batch-3/TAB_Wellness_Collective_Master_Decision_Risk_Architecture_Record.md` (D-, R-, A- IDs).
- **Build architecture:** `docs/source/batch-3/ARCHITECTURE.pdf`.
- **Strategy documents:** `docs/source/batch-1/` to `batch-3/` (Brand Foundation, Steps 13 to 19, Design Tokens v1.0), superseded for brand, naming, pillars, identity and transition by `batch-5/` (TAB Human Performance Center).
- **Portal design:** `docs/PHASE2.md` and `docs/design/plans-programs-stages.md`, including the as-built sections.
- **Backlog:** `docs/BACKLOG.md`, published as the TAB Human Performance Center Backlog page after each promotion.
- **Operating rules and guardrails:** `CLAUDE.md`.
- **Checks:** `e2e/*.spec.ts`, `supabase/tests/rls.test.mjs`, `scripts/check-contrast.mjs`, `.github/workflows/ci.yml`.
- **Code:** `app/`, `components/`, `lib/`, `config/`, `content/`, `supabase/migrations/`.
- **Companion pages:** technical architecture (`docs/ARCHITECTURE.md`) and data model (`docs/DATA-MODEL.md`, `docs/schema.json`).
