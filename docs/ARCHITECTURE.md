---
title: TAB Human Performance Center Architecture
eyebrow: TAB Human Performance Center · Technical architecture
heading: Technical architecture
owner: Matthew Ronan
updated: 2026-10-07
lede: TAB Human Performance Center is one Next.js application with three faces: the public website, My TAB for clients and TAB Practice for practitioners. The website is prebuilt and served from Vercel's edge; My TAB and TAB Practice render per request on the server and reach Postgres on Supabase with the signed-in person's own session, so row-level security decides what each person sees. Timely keeps scheduling and Stripe keeps payments; the site links to them instead of rebuilding them. Today the portal runs on demo data, behind Vercel login, until the go-live gate (A15).
---

<!-- Edit this file, not the page. scripts/docs/render-architecture.mjs builds the page (npm run docs:html) and adds an
     inventory read from the repository. `npm run docs:check` fails CI when an environment variable, runtime
     dependency, API route or lib/ module exists that this file doesn't mention, so nothing arrives undescribed. -->

## Principles | Each one is a decision on record; together they explain most of what follows.

| Principle | What it means in practice | Decided in |
| --- | --- | --- |
| The database is the authority | Row-level security, guard triggers and checks decide who may read or change what. The app presents the rules; it can't bypass them, because portal reads and writes use the person's own session | D-042, SEC-015 to SEC-018 |
| Systems of record stay where they are | Timely owns scheduling, Stripe owns payments; the site links out and stores only references | D-003, D-052 |
| Nothing sensitive leaves through email | Emails carry no health details and no personal details in subjects; the details stay in My TAB | D-054, R-027 |
| Business facts live in config, copy in content | `config/site.ts` holds settings and placeholders; `content/*.ts` holds copy. The service pages and the techniques guide are JSON files edited in Keystatic (`content/services/*.json`, `content/massage-techniques.json`) and checked against `content/schema.ts` at build time, so an edit passes the same checks as code | D-069 (proposed; replaces D-036's Payload) |
| One repository interface, two implementations | Every portal read and write goes through `PortalRepository`; the demo store and Supabase implement it identically | Phase 2 design |
| Nothing reaches production unreviewed | Pull requests only, CI on every one, owner approval to merge, a second approval to promote a build that is already built | G2, G3, owner ruling 2026-09-28 |
| Model for a team, build for one | Roles are owner, practitioner and client; practitioners see only their assigned clients | D-045 |
| Public pages stay fast and private pages stay private | Public pages are prebuilt and cached; portal pages render per request, are never cached and are never indexed | NFR-009, SEC-013 |

## System context

<!-- diagram:context -->

People reach everything through one Vercel project. The public site needs nothing else at request time. Forms post to `/api/inquiry`, which checks Turnstile and sends email through Resend. My TAB and TAB Practice call Supabase for sign-in and data. Stripe calls back to `/api/stripe/webhook`. Timely is only ever a link.

## Frontend

The application is Next.js 15 (App Router) with React 19, TypeScript and Tailwind CSS 4 (class names joined with `clsx`). Server code validates input with zod; Supabase is reached through `@supabase/ssr` and `@supabase/supabase-js`. Two route groups share one root layout: `app/(site)` for the public website and `app/(portal)` for My TAB (`/my-tab`) and TAB Practice (`/practice`). The routes are listed in the inventory below.

- **Public website.** Static pages built from `content/pages.ts`, `content/services.ts` (Massage & Bodywork also has a techniques guide from `content/massage-techniques.ts`, at `/services/massage-bodywork/techniques`), `content/legal.ts` (privacy policy and terms, with review notes shown on previews while in draft) and `config/site.ts` (business facts: address, phone and hours, which also feed the opening hours in the structured data). Stock photographs come from the library in `content/images.ts` (source, licence, focal point and placement per image; files in `public/images/library/`) and render through `components/Photo.tsx`, always decorative. Every call to action goes through `components/Cta.tsx`, so booking and Start destinations stay config-driven. Navigation lives in `config/navigation.ts`. Each service in `content/services.ts` has an internal key (`slug`: database enums, portal plans, booking links), which never changes, and a public URL segment (`path`); a renamed pillar redirects from its old URL in `config/redirects.ts`. The design tokens in `app/globals.css` carry the approved TAB Human Performance Center palette with AA-checked UI values (proposed D-062; `npm run test:contrast`); Montserrat and Spectral are self-hosted in `app/fonts`. Logo, icon and favicon artwork lives in `public/brand/` and `public/`, drawn through `components/Logo.tsx`; its sources and fitting scripts are in `design/logo-redraw/` (proposed D-061).
- **Forms.** Start Where You Are and Contact share `components/InquiryForm.tsx` and the schema in `lib/inquiry.ts` (zod). Turnstile is wrapped by `components/Turnstile.tsx`.
- **My TAB and TAB Practice.** Server components read through `getRepository()` in `lib/portal/index.ts`; mutations are server actions in `app/(portal)/actions.ts`, called from client components in `components/portal/`. Program logic (current week, personalization, progress) is pure code in `lib/portal/programs.ts`, the program editor's parsing in `lib/portal/program-editor.ts`, plan types in `lib/portal/plan-types.ts`, resource links in `lib/portal/resources.ts`, progress-review options in `lib/portal/review.ts` and display formatting in `lib/portal/format.ts`.
- **Search and sharing.** `lib/seo.ts` builds page metadata, `lib/jsonld.ts` the structured data, `app/sitemap.ts` and `app/robots.ts` the crawl files, `app/manifest.ts` the web app manifest. `lib/links.ts` resolves booking links; the account link (`accountLink()` in `lib/settings.ts`) appears, as "My TAB", only once the client portal is open (WEB-020). `lib/placeholders.ts` lists every placeholder for `/launch-checklist` and refuses a launch build while any remain.
- **Analytics.** `components/Analytics.tsx` reports page views and the fixed events from public pages to our own counter, `/api/stats` (owner ruling A4: "Let's build our own"); `lib/site-stats.ts` turns each report into daily totals in `site_stats` (no cookies, IP address, user agent or visitor identifier is kept; referrers are reduced to a hostname; bots and Global Privacy Control or Do Not Track visitors are skipped) and reads them for the owner's Website stats page (`/practice/stats`); `/my-tab`, `/practice` and `/contact` are refused at every step; `lib/analytics.ts` holds the property-less events (the Start funnel, `Service: Viewed`, and `Booking: Clicked` on any link marked `data-event`) and the excluded paths, which `e2e/guardrails.spec.ts` checks (D-057).

## Identity, roles and authority

Supabase Auth holds identities. There is no public sign-up: a practitioner invites a client from the client page in TAB Practice, which sends Supabase's invitation email, and sign-in is an emailed link (`signInWithOtp` with `shouldCreateUser: false`). Both links land on `/my-tab/auth/callback`, which redeems the link and records the first sign-in (`record_my_tab_sign_in`). Our email templates send a one-time `token_hash` straight to the callback, so a link works in whichever browser opens it, and server-sent invitations arrive intact; `lib/supabase/email-link.ts` reads the link (only the expected kinds per callback) and redeems it, still accepting the older `code` form (C5).

- **Roles.** `profiles.role` is `owner`, `practitioner`, `admin` or `client`. An admin (proposed D-071) is a website-only staff account: website requests, website stats and, with C31, the content editor; `requireStaff()` sends an admin to `/practice/website`, and in the database `is_staff()` and `can_access_client()` stay false for the role, so no client data. The owner invites and removes admins in Settings (`lib/admins.ts`): the invitation is a single-use link from `auth.admin.generateLink`, emailed by Resend, that lands on `/practice/auth/callback` and then two-step verification; the role itself is set under the owner's own session, so row-level security checks it. A staff role counts only in a session verified with two-step verification (`aal2`): `current_app_role()` in the database and `getViewer()` in `lib/portal/index.ts` both apply it (SEC-015).
- **Staff sign-in (C23, proposed D-067; password and passkeys proposed D-068).** `/practice/login` takes an email and password (`signInWithPasswordAction`, behind the same honeypot, rate limits and Turnstile as other public forms), with the emailed link (`/practice/auth/callback`) kept for a forgotten or first password. Either way the person lands on `/practice/verify`. There a staff member enrols an authenticator app the first time (`startTotpEnrollmentAction`), then confirms each sign-in with a passkey (`startPasskeySignInAction` and `finishPasskeySignInAction`: Supabase's WebAuthn MFA factor, so Face ID, Touch ID or Windows Hello) or the six-digit code (`verifyTotpAction`), raising the session to `aal2`. `/practice/security` sets the password (a fresh authenticator code required, at least 12 characters, checked against known breaches through the Pwned Passwords range API: only a 5-character hash prefix leaves the server) and adds or removes passkeys. Passkeys are built but switched off (`PASSKEYS_AVAILABLE` in `lib/staff-auth.ts`): Supabase's hosted service does not yet allow WebAuthn MFA, so the code is the second step until it does. The browser runs the passkey prompt (`lib/passkey-browser.ts`); options and answers travel as JSON through server actions, so there is still no browser Supabase client. Passkeys belong to `tabhumanperformance.com` (or the production `vercel.app` address); `passkeyRelyingParty()` in `lib/staff-auth.ts` refuses any other host. `requireStaffViewer()` sends anyone without `aal2` back to sign-in or verification. Real staff sign-in (`portal.realStaffSignIn`) is on wherever client data is real and on production whenever Supabase is configured, so the owner can reach Settings while client data stays demo-only; previews and tests keep the demo chooser (`isDemoSignIn()`).
- **Owner settings (C23).** `lib/settings.ts` reads the `app_settings` table (public, cached 30 seconds, tagged `settings`; defaults if the database can't be reached) and saves it under the owner's own session, so row-level security decides who may change it. `/practice/settings` sets whether the client portal is open (Off or Live; Live takes effect only in a build whose portal data is real, guardrail 4), the transition banner, whether Start Where You Are takes submissions, a Timely link per service and which optional pages show (C23b). `portalOpen()` applies the portal setting; `TransitionBanner`, the Start page and `/api/inquiry` read the banner and form switches; `serviceBookingHref()` gives service pages and `/book` their Book links; `siteFeatures()` drives the menus (`config/navigation.ts`), the Resources and Our Team pages, the homepage and the sitemap. Events and Testimonials stay locked in code until there's real content for them. On previews the settings live in memory with the demo.
- **Sessions.** Supabase keeps the session in cookies that only the server reads: `httpOnly`, `secure` outside local development, and time-boxed to seven days, renewed as the session is used, so an idle session ends after a week (`lib/supabase/cookies.ts`, used by `lib/supabase/server.ts` and `middleware.ts`; SEC-020). TAB Practice sessions also end 30 days after sign-in however active: `middleware.ts` reads the session's sign-in time from its access token (`amr`) and signs it out (`staffSessionExpired()` in `lib/staff-auth.ts`, proposed D-068).
- **Guards in the app.** Every server action calls `requireClient()` or `requireStaff()`. They redirect anyone who shouldn't be there, but they are a convenience: the database decides.
- **Guards in the database.** Row-level security on every table, using `can_access_client()` (care team only), `my_client_id()`, `is_staff()` and `can_publish_programs()`. Triggers such as `guard_client_update`, `guard_client_columns`, `stamp_author` and `guard_same_client` limit which columns each role may change and pin authorship. The data model page lists every policy.
- **Private schema.** Internal session notes and practitioner-only plan details live in the `private` schema, which the Data API doesn't expose and signed-in roles can't use. Staff reach them only through `internal_notes()`, `add_internal_note()`, `plan_private_details()` and `save_plan_private_details()`, which check the care team and write an audit row for every read as well as every change (SEC-019).
- **Service role.** Used only on the server and only where no signed-in role may act: saving website submissions (`lib/inquiry-store.ts`), applying Stripe events (`apply_stripe_event()`, which only the service role may run), and sending invitations after the row-level-security-checked update has succeeded.
- **Demo mode.** While `portal.dataSource` is `mock`, a demo sign-in sets the `tab_demo_role` cookie (client or practitioner) and every visitor shares one in-memory store (`lib/portal/mock-repository.ts`). Production allows it only while `portalDemoOnProduction` is on and Vercel login protects the site; it is off from the switch-over (2026-10-06, `docs/runbooks/switch-over.md`), so production shows the interim My TAB page and previews keep the demo. The owner Settings page (C23) stores only Off or Live: demo stays a preview-only build mode, never a production setting, because it has no real login.

## Server-side logic

There is no separate application server. Server code runs as Next.js server components, server actions, route handlers and middleware on Vercel.

| Piece | Where | What it does |
| --- | --- | --- |
| Middleware | `middleware.ts` | Legacy-domain and legacy-path redirects in one 308 hop; trailing-slash normalization; the Content-Security-Policy from `lib/csp.ts` (a per-request nonce on portal pages); Supabase session refresh and the sign-in redirect for portal pages; the 30-day ceiling on TAB Practice sessions; on production with the client portal off it still lets `/practice` through for real staff sign-in (C23) |
| Server actions | `app/(portal)/actions.ts` | Every portal mutation, each behind `requireClient()` or `requireStaff()`, validated with zod before it reaches the repository; staff sign-in (emailed link or password), authenticator enrolment and verification, passkeys and passwords; owner settings (`saveSettingsAction`, behind `requireOwner()`) |
| Staff sign-in callback | `app/(portal)/practice/auth/callback/route.ts` | Exchanges the emailed sign-in code for a session, then sends the person to two-step verification (`/practice/verify`) |
| Owner settings | `lib/settings.ts`, `app/(portal)/practice/settings` | Reads `app_settings` for every page (cached, tagged, never throws) and saves the owner's changes under their own session; `portalOpen()` combines the portal setting with what the build allows |
| Portal repository | `lib/portal/types.ts`, `mock-repository.ts`, `supabase-repository.ts` | The one interface for portal data. The Supabase implementation uses the person's session (`lib/supabase/server.ts`), so row-level security applies to every call |
| Website change requests | `lib/website-requests.ts` (rules, labels, form parsing; safe in the browser), `lib/website-requests-store.ts` (storage), `app/(portal)/practice/website` | Any staff member files a content or design request and follows it; notes carry Claude's questions and options and the answers. Stored in `website_requests` and `website_request_notes` under the person's session (row-level security; only the owner changes a status, Claude through the service role); previews keep an in-memory copy. When someone other than the owner files one, matthew@ and info@ get an email naming its number only (proposed D-071). A daily routine (C33, 07:52 Detroit time) reads new requests and staff replies, answers in the notes and moves the status; it never builds or releases |
| Content editor | `keystatic.config.ts`, `app/keystatic`, `app/api/keystatic/[...params]/route.ts`, `content/schema.ts`, `components/blocks/Blocks.tsx` | Keystatic (`@keystatic/core`, `@keystatic/next`) edits the content files in the repository: Keystatic Cloud signs editors in (no GitHub account) and saves each change as a commit on a `content/…` branch (`branchPrefix`). The editor's fields carry the limits from `content/schema.ts`, the same zod schemas `content/services.ts` and `content/massage-techniques.ts` parse at build time. Service pages are built from the block library (text and photo, card grid, techniques index, TAB Method band, numbered steps, questions) in the order the file sets. The API route serves only local mode on a developer's machine and answers 404 elsewhere; until `NEXT_PUBLIC_KEYSTATIC_CLOUD_PROJECT` is set, `/keystatic` explains how to ask for a change instead (proposed D-069, D-071, D-072) |
| Website counts | `app/api/stats/route.ts`, `lib/site-stats.ts` | Receives a page view or fixed event from a public page, checks origin, bots, privacy signals and a rate limit, and adds to daily totals with `record_site_stat()` (service role). Always answers 204 |
| Website submissions | `app/api/inquiry/route.ts` | Spam layers from `lib/spam.ts` (same origin, rate limits, minimum fill time, honeypot, duplicate guard, text screening, Turnstile), then email through Resend and, once storage is on, a row in `inquiries` (in the demo, TAB Practice's demo store). The two emails are built by `lib/inquiry-emails.ts`, a pure function that `e2e/guardrails.spec.ts` checks for personal details in subjects and repeated messages |
| Stripe | `app/api/checkout`, `app/api/billing-portal`, `app/api/stripe/webhook`, `lib/stripe.ts` | Checkout and the customer portal are created server-side; the webhook checks the signature, then applies each event in one database transaction (`apply_stripe_event()`): a failure rolls back and answers 500 so Stripe retries. Unpaid checkouts wait for payment, past-due subscriptions pause access, full refunds end it, and partial refunds keep it and flag the purchase for the owner in TAB Practice |
| Email | `lib/email.ts`, `app/api/inquiry/route.ts`, `content/emails.ts`, `lib/email-template.ts`, `lib/email-logo.ts` | Resend from `no-reply@tabhumanperformance.com` (domain verified on the `send` subdomain). Every email uses one branded layout (`lib/email-template.ts`: table layout, inline styles, the palette, Montserrat and Spectral with fallbacks, an olive button) and embeds the logo inline (CID) from `lib/email-logo.ts`, which `npm run email:logo` renders from the approved SVG. Messages name no health details and subjects stay generic; demo mode and deployments without a key log instead of sending. Supabase Auth's own emails (sign-in links, invitations, security notices) go through Resend SMTP in the same layout: copy in `content/auth-emails.ts`, installed by `npm run emails:supabase -- --push`, with the logo hosted in the public `brand` Storage bucket because Supabase can't attach it |

## Key flows

**Start Where You Are.** The form collects only predefined answers plus name, email and phone. The route checks it, emails TAB and the submitter, and returns a reference. Storage in `inquiries` switches on with the go-live gate.

<!-- diagram:flow-start -->

**Invitation and sign-in.** A practitioner invites a client. The database stamps who invited and when; the server then asks Supabase to send the invitation. The client's link signs them in and records their first sign-in, which TAB Practice shows as active.

<!-- diagram:flow-invite -->

**Change to production.** Every change is a pull request. CI runs the full checks; the owner reviews the Vercel preview and approves; Claude squash-merges. Vercel builds a production deployment that is not yet live; the owner checks it and says "promote", and Claude promotes that exact build. Rollback is promoting the previous one. Database migrations need their own G3 approval.

<!-- diagram:flow-release -->

## Environments and configuration

| Environment | Application | Data | Changes arrive |
| --- | --- | --- | --- |
| Local | `next dev`, or `next build` and `next start` for the e2e checks | Demo store; migrations tested in PGlite by `npm run test:rls` | On save |
| Preview | Vercel preview for each pull request, behind Vercel login, drafts shown | Demo store | When a pull request opens or changes |
| Production | Vercel production, `tab-wellness-collective.vercel.app`, behind Vercel login until launch | Demo store until A15; then Supabase project `vpaaeblqndcenftrfrms` | On merge it builds; it goes live only when promoted (G3) |

| Setting | Kind | Where it is set | Used for |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Public | Vercel | Canonical URLs, sitemap, redirects and auth links (`https://www.tabhumanperformance.com`, proposed D-066) |
| `NEXT_PUBLIC_ALLOW_INDEXING` | Public flag | Vercel | Search indexing; false everywhere until launch (NFR-009) |
| `NEXT_PUBLIC_SHOW_DRAFTS` | Public flag | Vercel | Draft-copy markers on previews |
| `RESEND_API_KEY` | Secret | Vercel | Sending form and portal email |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY` | Public key and secret | Vercel | The human check on public forms and the My TAB sign-in |
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public | Vercel | The portal's connection to Supabase, with the person's session |
| `SUPABASE_SERVICE_ROLE_KEY` | Secret | Vercel | Server-only tasks listed under Identity |
| `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` | Secrets | Vercel | Checkout, the billing portal and the webhook |
| `SUPABASE_AUDIT_DB_URL`, `AUDIT_EXPORT_PASSPHRASE` | Secrets | GitHub Actions | The nightly audit export: a connection as the read-only `audit_reader` role, and the passphrase that encrypts each file. Added at go-live (A26) |
| `portal.dataSource`, `portalDemoOnProduction` | Code settings | `config/site.ts` | Demo or Supabase data; demo allowed on production |
| `NEXT_PUBLIC_KEYSTATIC_CLOUD_PROJECT` | Public | Vercel | The Keystatic Cloud project (`team/project`) the content editor signs in to (backlog A31). Blank: `/keystatic` says the editor isn't connected |
| `forms.storeSubmissions` | Code setting | `config/site.ts` | Saving submissions, on only with Supabase data |

## Delivery, quality and operations

- **Pull requests.** `.github/workflows/ci.yml` runs on every pull request and on `main`: typecheck, the row-level security tests, the contrast check, the brand-consistency check, the documentation check, a production build, the Playwright end-to-end suite and a dependency audit. There are no retries; a failure is a finding.
- **Tests.** `supabase/tests/rls.test.mjs` applies every migration to PGlite (in-process Postgres) with stub auth and checks each policy and guard as owner, practitioner and client. `e2e/` holds smoke, redirect-map, link-crawl, SEO, header-fit, CSP and WCAG 2.2 AA scans against the production build. `scripts/check-contrast.mjs` checks every token pairing. `scripts/check-brand.mjs` fails on retired names (TAB Wellness Collective, Human Performance Practice), the old philosophy and stage names, old service names any pillar count that differs from `content/services.ts`, the retired "Practice workspace" label and any hex colour written into a class instead of a token from `app/globals.css`.
- **Guards on the process.** `.claude/hooks/guard-main.mjs` blocks pushes and writes to `main` and any merge that isn't a squash. Vercel login protects every deployment URL.
- **Living documents.** The backlog page (`scripts/render-backlog.mjs`) is republished after each promotion. This page, the data model page, the traceability page and the website content guide are built by `scripts/docs/` from `docs/ARCHITECTURE.md`, `docs/DATA-MODEL.md`, `docs/schema.json`, `docs/TRACEABILITY.md` and `docs/CONTENT-GUIDE.md`; `npm run docs:check` fails CI when they fall behind the code (for the guide: when a public page is missing from its page inventory).
- **Content edits.** Every save in the content editor lands on a `content/…` branch. `ci.yml` runs the full checks on pushes to those branches, and `.github/workflows/content-pr.yml` opens one pull request per branch (it never merges). The same review and release gates apply (G2, G3); the owner's content-only changes get the fast lane with C32.
- **Website change requests.** Filed and tracked in TAB Practice → Website changes (`/practice/website`, proposed D-071; the GitHub issue forms of C30 are retired). Claude picks a request up when asked in a session ("pick up website request #12"), reads it with the service role, replies in its notes and moves its status. The content and design lanes, and what each may change, are in `docs/CONTENT-GUIDE.md` (proposed D-069 to D-071).
- **Audit log off the platform.** `.github/workflows/audit-export.yml` runs nightly: it reads the last two days of `audit_events` as `audit_reader`, encrypts them with gpg and commits the file to the `audit-archive` branch, so a compromised database can't erase its own trail (SEC-019). Until the secrets exist (A26) it reports that it is waiting and succeeds.
- **Backups and monitoring.** None yet: Supabase is on the free plan and production holds no client data. Daily backups with a tested restore (A14, A15) and post-launch monitoring (C2) come before real data.

## Quality attributes

| Attribute | How the architecture provides it | Where it falls short |
| --- | --- | --- |
| Security | Row-level security and guard triggers on every table; staff roles need two-step verification; nonce CSP on portal pages; no public sign-up; Vercel login | Staff sign-in and MFA enrolment built (C23); the client invitation emails and auth URLs still need C5; tests run against PGlite, not a real Supabase stack (C6); the audit export waits for its secrets (A26) |
| Privacy | No health details by email; analytics off the portal and contact pages; demo data only | No automated check of email content (TG-3); no check that analytics stays off those pages (NFR-005) |
| Accessibility | WCAG 2.2 AA scans of every public page and the main portal pages in CI; tokens contrast-checked | No manual screen-reader pass yet |
| Performance | Public pages prebuilt and cached at the edge; portal pages render only what one person needs | Core Web Vitals not measured (NFR-002) |
| Integrity | Constraints, guard triggers, one-function database operations for version moves, plan saves and Stripe events; an append-only audit log | Plan saves still write the plan and its private details in separate calls |
| Recoverability | Git holds code and schema; Vercel keeps every build for instant rollback | No database backups until Supabase Pro (A14) |
| Maintainability | One repository interface, config and content kept out of components, living documents checked in CI | Only the service pages and the techniques guide are in the content editor so far; the other pages still need a code change (or a Content help request) until they move to it |

## Risks and technical debt

| Risk | Consequence | Backlog |
| --- | --- | --- |
| Demo portal on the production URL | Anyone with Vercel access shares one demo store; unsafe once a custom domain is attached | C1 (turn it off first) |
| Portal security gate not complete | Real client data can't go in until the auth URLs and emails are configured (C5), tests run on a real Supabase stack and the audit export runs | C5, C6, A26, A15 |
| No backups | A database failure after go-live would lose client records | A14, A15 |
| Rate limits are per server instance | A determined spammer spread across instances gets more attempts than the limits suggest | A18 (Vercel Firewall, declined for now) |
| Content lives in code | Every copy change is a pull request | C8 |
| Major upgrades pending | Next 16, zod 4 and TypeScript 7 drift further the longer they wait | C9 |

## Inventory | Read from the repository when this page was built. Nothing here is written by hand.

<!-- generated:inventory -->
