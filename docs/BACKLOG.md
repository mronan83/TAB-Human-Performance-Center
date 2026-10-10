---
title: TAB Human Performance Center Backlog
eyebrow: TAB Human Performance Center · Backlog
heading: Build backlog
owner: Matthew Ronan
version: 3.0
updated: 2026-10-10
---

<!-- Edit this file, not the page. scripts/docs/render-backlog.mjs builds the backlog page from it (npm run
     backlog:html), and `npm run docs:check` fails CI when an item names a dependency, requirement or story that doesn't
     exist, when dependencies form a loop, or when a field holds a value the page doesn't know. Fields are written
     "- **Name:** value", several on one line joined by " · "; any other bullet is the item's description. -->

The single list of remaining work for TAB Human Performance Center, with what each item waits on and what it unblocks. Every pull request updates it. After every successful production promotion (G3) Claude renders it into the backlog page and republishes it (`CLAUDE.md`, Branches and review gates).

## How this backlog works

**IDs are stable.** **A** items are the owner's actions; **C** items are Claude's engineering work. An ID is never reused; a finished item stays on the board as Done so every link to it keeps working.

**Milestones.** P0 now (risk, or blocks most other work) · P1 public-site launch, targeted for 1 November 2026 · P2 My TAB go-live (`CLAUDE.md` guardrail 4) · P3 later or optional. P0 to P3 rank work items; a requirement's MoSCoW priority on the requirements page is a different scale on purpose.

**Statuses.** **Done**: merged and, where it changes the site, promoted. **In review**: a pull request is open. **In progress**: being built. **Ready**: everything it depends on is done. **Queued**: waits on another item here. **Waiting on you**: an owner action nothing else is holding up. **Blocked**: waits on something outside this list (a vendor, an event). **Deferred**: optional, or waits on a decision to start. **Dropped**: replaced or declined.

**Sizes.** S hours · M about a day · L several days, or waiting on someone else. For the longest remaining chain they count as ¼, 1 and 3 builder-days. Sizes are relative effort, not commitments.

**Requirements.** Register IDs (WEB, GS, PORTAL, STAFF, CMS, INT, SEC, NFR, DS) link each item to what it delivers. The requirements page lists, under each requirement, the items that deliver it; the user stories page lists the items under each story.

## P0 · Now

Risk, or work that blocks most of the rest. Nothing is here now.

## P1 · Public-site launch

The public website on `tabhumanperformance.com`, targeted for 1 November 2026 (A13). Done when the switch-over's Phase B is complete (C1), the launch-day checks pass against the live domain (C2), the launch checklist shows no draft content (A8), and email runs on the new domain (A29).

### A6 · Gift cards link
- **Status:** Waiting on you · **Owner:** Owner · **Category:** Content · **Size:** S
- **Where:** Timely, then TAB Practice → Settings
- **Requirements:** WEB-012
- **Done when:** the footer's gift cards link opens TAB's Timely gift card page.
- Address, phone, hours and the map link went live on 2026-10-06; the gift cards link is the last business fact the site is missing [GAP-003, GAP-020].

### A8 · Founder story, bio and service FAQs
- **Status:** Waiting on you · **Owner:** Owner · **Category:** Content · **Size:** M
- **Where:** Content editor (`/keystatic`), on a new branch
- **Requirements:** WEB-009, WEB-010, WEB-013, WEB-017, DS-007
- **Done when:** About, Our Story, Our Team and the five service pages carry no draft flags, and the launch checklist lists no placeholder content.
- The founder story, the owner's bio and the 14 draft service FAQs. Stock photography is fine for launch (owner, 2026-10-06) [GAP-012].

### A10 · Switch-over access
- **Status:** Waiting on you · **Owner:** Owner · **Category:** Accounts · **Size:** S
- **Where:** GoDaddy, the old web host's DNS panel, Google Workspace admin, Google Search Console
- **Requirements:** NFR-004, NFR-008
- **Done when:** Claude can change tabmassage.com's web records at GoDaddy and verify the new domain in Search Console.
- Access to the web host's DNS panel, GoDaddy, the Google Workspace admin console and Search Console, for the switch-over's Phase B [GAP-019].

### A25 · Rulings on the open questions
- **Status:** Waiting on you · **Owner:** Owner · **Category:** Decision · **Size:** S
- **Where:** In a session, or as comments on the requirements page
- **Requirements:** STAFF-008, WEB-002, SEC-012, PORTAL-004, PORTAL-010
- **Done when:** each question has an answer recorded under it and in the register, and the requirements it decides are updated.
- Success measures per objective (Q-1); owner access to every client (Q-3, SEC-012); Step 14's six review outcomes (Q-5, TG-1); WEB-002 at 17 routes for Phase 1 (Q-6, TG-2); whether the pilot needs activity responses (Q-2, TG-4); whether clients may change their own contraindications (Q-7).

### C1 · Switch-over to the new domain
- **Status:** In progress · **Owner:** Claude · **Category:** Launch · **Size:** M
- **Depends on:** A8, A10
- **Requirements:** NFR-004, NFR-008, NFR-009
- **Done when:** the site answers publicly on `www.tabhumanperformance.com` with Vercel protection on Standard, tabmassage.com's web records redirect every legacy path in one hop, and the redirect and SEO checks pass against the live domain (G3).
- Runbook: `docs/runbooks/switch-over.md` [§7.4, RSK-009, proposed D-066].
- Phase A (private attach: demo portal off, new domain in config, domains attached behind Vercel login, Resend DNS) is done.
- Phase B (public launch: protection to Standard, indexing, GoDaddy web records for tabmassage.com, checks) waits on the content (A8) and the access (A10).

### A29 · Email on the new domain
- **Status:** Queued · **Owner:** Owner · **Category:** Accounts · **Size:** S
- **Depends on:** A10
- **Where:** Google Workspace admin; GoDaddy DNS for tabmassage.com
- **Done when:** every mailbox is `@tabhumanperformance.com` with its old address as an alias, mail to any other tabmassage.com address reaches info@, and tabmassage.com publishes SPF, DKIM and DMARC.
- Rename users to `@tabhumanperformance.com` (each old `@tabmassage.com` address stays as an alias on the same mailbox); for any other old address, add a catch-all route for `tabmassage.com` to `info@tabhumanperformance.com`; keep `tabmassage.com` in Workspace.
- At GoDaddy, add SPF, DKIM and DMARC for `tabmassage.com`, which has none today (records in `docs/runbooks/switch-over.md`).

### C24 · Tighten DMARC
- **Status:** Queued · **Owner:** Claude · **Category:** Accounts · **Size:** S
- **Depends on:** A29
- **Done when:** `tabhumanperformance.com` publishes DMARC `p=reject` and a week of reports shows no legitimate mail failing.
- Move DMARC on `tabhumanperformance.com` to `quarantine`, then `reject`, one week after DKIM is authenticating and mail flows.

### C2 · Launch day
- **Status:** Queued · **Owner:** Claude · **Category:** Launch · **Size:** M
- **Depends on:** C1, A6, A29
- **Requirements:** NFR-007, NFR-009, NFR-010
- **Done when:** the site is indexable on the live domain, Search Console has the sitemap, the e2e suite passes against the live domain, and post-launch monitoring is on (G3).
- Indexing on, Search Console and sitemap, an e2e run against the live domain, HSTS for subdomains after the switch-over, and the 30 days of monitoring NFR-010 asks for.

### A31 · Invite content editors
- **Status:** Waiting on you · **Owner:** Owner · **Category:** Accounts · **Size:** S
- **Where:** Keystatic Cloud, project `tab-hpc/website`
- **Requirements:** CMS-006
- **Done when:** each editor you want can sign in at `/keystatic`.
- Up to two editors. They can reach `/keystatic` only once the site is past Vercel login (C1), or as Vercel team members.

### C35b · Content editor, last pages
- **Status:** Ready · **Owner:** Claude · **Category:** Platform · **Size:** M
- **Requirements:** CMS-001, CMS-002, CMS-005
- **Done when:** the FAQ, Start's text and the client policies are edited in `/keystatic`, checked by `content/schema.ts`, and covered by `e2e/content.spec.ts`.
- FAQ, Start's text and the client policies move into the content editor; photos can be added to the image library.

### A35 · Your resources
- **Status:** Waiting on you · **Owner:** Owner · **Category:** Content · **Size:** S
- **Where:** Content editor → Resources → Add, on a new branch
- **Requirements:** WEB-010
- **Done when:** each planned subject on `/resources` opens a guide or link, or is removed.
- Add your guides and links, then link each to its subject (Resource topics → Opens this resource). "Your first massage" is done (2026-10-08).

### A32 · Switch on the fast lane
- **Status:** Waiting on you · **Owner:** Owner · **Category:** Accounts · **Size:** S
- **Depends on:** C32
- **Where:** Vercel → Account Settings → Tokens; GitHub → repository → Settings → Secrets and variables → Actions
- **Requirements:** CMS-004, CMS-006
- **Done when:** a content change you make in the editor goes live on its own after CI, with a comment on its change request.
- In Vercel, create a token named "GitHub fast lane", scope "mronan83's projects", expiry 1 year. In GitHub, add a repository secret named `VERCEL_TOKEN` and paste the token. Until then your content changes wait for approval as now.

### C34 · Website admins and website requests
- **Status:** Done · **Owner:** Claude · **Category:** Platform · **Size:** M
- **Done:** 2026-10-07 · #54
- **Requirements:** STAFF-011, CMS-007
- Website-only admin role; numbered website requests with statuses and notes in TAB Practice → Website changes; the GitHub issue forms retired [proposed D-071]. Migrations `20261012000000` and `20261013000000` applied to production (G3).

### C32 · Content fast lane
- **Status:** In review · **Owner:** Claude · **Category:** Platform · **Size:** M
- **Depends on:** C31
- **Requirements:** CMS-004, CMS-006
- **Done when:** an owner-authored, content-only change from the editor is merged and its exact production build promoted after CI, and anything else gets a comment saying why it waits.
- A GitHub Action runs after CI on each `content/…` branch: if every commit is the owner's, made in the editor, touching only content files, it squash-merges the change and promotes that exact build, but only when nothing else is waiting for release (proposed D-070). Off until A32.

### C35 · Content editor, part 2
- **Status:** Done · **Owner:** Claude · **Category:** Platform · **Size:** M
- **Done:** 2026-10-07 · #58, #59
- **Requirements:** CMS-001, CMS-002, CMS-005, WEB-010
- Home, the TAB Method, About, Our Story, Our Team (photo uploads, confirmed credentials) and the resource library (links, PDFs, email-first downloads, open counts) [proposed D-073 to D-075]. #59 made subjects open their resource and turned off saving on `main` (proposed D-076).

### C31 · Content editor and block library
- **Status:** Done · **Owner:** Claude · **Category:** Platform · **Size:** L
- **Done:** 2026-10-07 · #55, #56
- **Requirements:** CMS-001, CMS-004, CMS-005
- `/keystatic` with Keystatic Cloud sign-in edits the five service pages and the massage techniques guide, on `content/…` branches with a change request and full checks for every save [proposed D-069, D-072].

### C30 · Website change requests and the content guide
- **Status:** Done · **Owner:** Claude · **Category:** Content · **Size:** S
- **Done:** 2026-10-07 · #53
- **Requirements:** CMS-006
- The Website content guide, and change requests as GitHub issue forms, replaced the same day by requests inside TAB Practice (C34).

### C29 · Massage techniques guide
- **Status:** Done · **Owner:** Claude · **Category:** Content · **Size:** M
- **Done:** 2026-10-06 · #50
- **Requirements:** WEB-005
- Eleven techniques at `/services/massage-bodywork/techniques` (the eight tabmassage.com modalities rewritten, plus manual lymphatic drainage, prenatal and sports massage), linked from the Massage page.

### C26 · Our own website counts
- **Status:** Done · **Owner:** Claude · **Category:** Analytics · **Size:** M
- **Done:** 2026-10-06 · #46
- **Requirements:** NFR-005, NFR-006
- First-party, cookieless daily totals in `site_stats` and an owner-only Website stats page; Vercel Web Analytics removed (owner ruling A4).

### C23b · Settings, part 2
- **Status:** Done · **Owner:** Claude · **Category:** Portal · **Size:** S
- **Done:** 2026-10-06 · #43
- **Requirements:** WEB-011
- A Timely link per service for its Book buttons, and switches for Resources and Our Team; Events and Testimonials locked until there is real content.

### C23 · Owner Settings
- **Status:** Done · **Owner:** Claude · **Category:** Portal · **Size:** S
- **Done:** 2026-10-06 · #39
- **Requirements:** SEC-001, SEC-015
- Client portal Off / Live, transition banner and Start form switches in TAB Practice → Settings; real staff sign-in with an authenticator app [proposed D-067].

### C22 · My TAB and TAB Practice restyle
- **Status:** Done · **Owner:** Claude · **Category:** Brand · **Size:** M
- **Done:** 2026-10-05 · #35
- **Requirements:** DS-005
- Rebrand PR 4: the portal in the new identity, with status tints as tokens and contrast checks; no behaviour changes [D-062].

### C21 · Image library
- **Status:** Done · **Owner:** Claude · **Category:** Brand · **Size:** M
- **Done:** 2026-10-05 · #35
- **Requirements:** DS-007
- Rebrand PR 3: the 30 stock images, optimised and catalogued in `content/images.ts`; 17 placed by page.

### C20 · Copy in the new voice
- **Status:** Done · **Owner:** Claude · **Category:** Brand · **Size:** M
- **Done:** 2026-10-05 · #33
- **Requirements:** WEB-014
- Rebrand PR 2: public copy in the Brand Foundation v2 voice, and `npm run test:brand` in CI [D-064, D-065].

### C18 · Service views and Book clicks counted
- **Status:** Done · **Owner:** Claude · **Category:** Analytics · **Size:** S
- **Done:** 2026-10-06 · #42
- **Requirements:** NFR-006
- `Service: Viewed` and `Booking: Clicked`, property-less (TG-7); counted by our own counter since C26.

### C15 · Guardrail checks
- **Status:** Done · **Owner:** Claude · **Category:** Quality · **Size:** M
- **Done:** 2026-10-06 · #42
- **Requirements:** NFR-005, SEC-006, GS-004, GS-005, WEB-004, WEB-005, WEB-006, WEB-007
- Checks for what only code review protected: no analytics on `/my-tab`, `/practice` or `/contact`; no personal or health details in emails or subjects (TG-3); one next step per Start submission (TG-8); every service page keeps its anatomy.

### C25 · Launch communications plan
- **Status:** Done · **Owner:** Claude · **Category:** Launch · **Size:** M
- **Done:** 2026-10-06
- Announcement sequence, channels, assets and the cutover timeline for 1 November, delivered as a shared document for the owner [A13].

### A34 · GitHub Pro for branch protection
- **Status:** Dropped · **Owner:** Owner · **Category:** Accounts · **Size:** S
- **Done:** 2026-10-07
- Declined by the owner. Since the repository went public (2026-10-10), branch protection is free, so this could be revisited at no cost; meanwhile Claude lists any change that reached `main` without a change request before each promotion.

### A33 · Actions may open pull requests
- **Status:** Done · **Owner:** Owner · **Category:** Accounts · **Size:** S
- **Done:** 2026-10-07
- GitHub → Settings → Actions → General: GitHub Actions may create pull requests, so each content branch opens its change request by itself.

### A30 · Client policies
- **Status:** Done · **Owner:** Owner · **Category:** Legal · **Size:** S
- **Done:** 2026-10-06 · #44
- **Requirements:** WEB-012
- The owner's cancellation, arrival and gratuity policies, reworded for the new name and all five pillars, at `/policies`.

### A28 · Name of the client plan
- **Status:** Done · **Owner:** Owner · **Category:** Decision · **Size:** S
- **Done:** 2026-10-05 · #34
- **Requirements:** PORTAL-003, STAFF-005
- Ruled: the client plan is the TAB Performance Plan.

### A27 · Name of the practitioner workspace
- **Status:** Done · **Owner:** Owner · **Category:** Decision · **Size:** S
- **Done:** 2026-10-05 · #34
- Ruled: TAB Practice keeps its name.

### A13 · Launch date
- **Status:** Done · **Owner:** Owner · **Category:** Decision · **Size:** S
- **Done:** 2026-10-06 · #38
- Public launch targeted for 1 November 2026 [GAP-017].

### A12 · Service-area wording
- **Status:** Done · **Owner:** Owner · **Category:** Content · **Size:** S
- **Done:** 2026-10-06 · #42
- **Requirements:** WEB-012
- "Serving Livingston County" in the footer and emails; structured data names the county [ASM-006].

### A11 · Vercel Pro
- **Status:** Done · **Owner:** Owner · **Category:** Accounts · **Size:** S
- **Done:** 2026-10-06 · #42
- Confirmed active; the Hobby plan doesn't allow business use [RSK-005].

### A9 · Logo descriptor legibility
- **Status:** Done · **Owner:** Owner · **Category:** Brand · **Size:** S
- **Done:** 2026-10-05 · #31
- **Requirements:** DS-006
- Met by the approved logo redraw (proposed D-061).

### A7 · Privacy policy and terms
- **Status:** Done · **Owner:** Owner · **Category:** Legal · **Size:** M
- **Done:** 2026-10-06 · #42, #44
- Privacy policy and terms approved by the owner and published as final; retention ruled: website submissions are kept and never deleted (proposed D-058) [GAP-010].

### A4 · Analytics
- **Status:** Done · **Owner:** Owner · **Category:** Accounts · **Size:** S
- **Done:** 2026-10-06 · #46
- **Requirements:** NFR-005, NFR-006
- Ruled "Let's build our own": Plausible and Vercel Web Analytics declined; built as C26 [GAP-015, D-057].

### A3 · Turnstile keys
- **Status:** Done · **Owner:** Owner · **Category:** Accounts · **Size:** S
- **Done:** 2026-10-06 · #44
- **Requirements:** SEC-013
- Real keys in Production, Cloudflare's test keys in Preview; a live contact-form submission confirmed 2026-10-07.

### A2 · Resend
- **Status:** Done · **Owner:** Owner · **Category:** Accounts · **Size:** S
- **Done:** 2026-10-06 · #37
- **Requirements:** GS-004
- Resend verified for `tabhumanperformance.com` and tested end to end [D-005].

### A22 · How G3 applies to Vercel
- **Status:** Done · **Owner:** Owner · **Category:** Decision · **Size:** S
- **Done:** 2026-09-28 · #20
- Ruled: staged production. A merge builds a production deployment that isn't live until the owner says "promote".

## P2 · My TAB go-live

My TAB and TAB Practice for real clients. Done when the go-live gate (A15, `CLAUDE.md` guardrail 4) is met: the portal security gate (0 known gaps, staff MFA), Supabase Pro with backups and a tested restore, and a privacy policy that covers My TAB; then the pilot (A16).

### A5 · Timely Client Login link
- **Status:** Waiting on you · **Owner:** Owner · **Category:** Content · **Size:** S
- **Where:** Timely, then send Claude the link
- **Requirements:** INT-001, PORTAL-006
- **Done when:** My TAB's appointments and billing pages open TAB's Timely client login.
- No longer a public-launch item: the site shows no Client Login until My TAB is live (owner ruling 2026-10-06) [WEB-020].

### A14 · Supabase Pro
- **Status:** Waiting on you · **Owner:** Owner · **Category:** Accounts · **Size:** S
- **Where:** Supabase → organisation billing
- **Requirements:** SEC-009
- **Done when:** the production project is on Pro with daily backups.
- Owner: "later". Needed before A26 and A15.

### C6 · Tests against a real Supabase stack
- **Status:** Ready · **Owner:** Claude · **Category:** Security · **Size:** L
- **Requirements:** SEC-021
- **Done when:** CI runs the RLS suite against the real Supabase stack (Postgres, Auth, PostgREST) on every pull request, as well as the in-process database.

### C16 · Accessibility needs and goals in the profile
- **Status:** Ready · **Owner:** Claude · **Category:** Portal · **Size:** S
- **Requirements:** PORTAL-010
- **Done when:** a client can record accessibility needs and goals in My TAB, limited by `guard_client_columns`, with an RLS test.
- Closes TG-5.

### C19 · Incident-response runbook
- **Status:** Ready · **Owner:** Claude · **Category:** Security · **Size:** S
- **Requirements:** SEC-011
- **Done when:** `docs/runbooks/` has a one-page playbook: who to call, revoking keys, telling clients, paired with counsel's breach duties.
- Closes TG-9.

### C37 · Two-step verification for clients
- **Status:** Ready · **Owner:** Claude · **Category:** Portal · **Size:** M
- **Requirements:** PORTAL-001
- **Done when:** a client can turn on an authenticator app in My TAB's profile and is asked for its code at each sign-in after that, with database and end-to-end tests; it stays optional for clients and staff rules don't change.
- Closes TG-10. Reuses the staff enrolment screen (C23).

### A26 · Audit export secrets
- **Status:** Queued · **Owner:** Owner + Claude · **Category:** Accounts · **Size:** S
- **Depends on:** A14
- **Where:** Supabase (role password); GitHub → Settings → Secrets
- **Requirements:** SEC-019
- **Done when:** the nightly encrypted audit export runs green.
- Give the `audit_reader` role a login password, then add the GitHub secrets `SUPABASE_AUDIT_DB_URL` and `AUDIT_EXPORT_PASSPHRASE` (keep the passphrase somewhere safe: it opens the exports).

### A15 · My TAB go-live gate
- **Status:** Queued · **Owner:** Owner + Claude · **Category:** Release · **Size:** M
- **Depends on:** C6, A14, A26
- **Requirements:** SEC-009, SEC-021, GS-005
- **Done when:** a tested backup restore is recorded, `npm run test:rls` shows 0 known gaps on the real stack, the first real invitation reaches a client, and the owner approves go-live (G3).
- Production database setup and the owner's account with MFA were done on 2026-10-06. The first real invitation doubles as C5's live invitation test.

### A16 · Pilot with existing clients
- **Status:** Queued · **Owner:** Owner · **Category:** Operations · **Size:** L
- **Depends on:** A15
- **Done when:** 3 to 5 existing clients have used My TAB for a review cycle, and the owner decides to open it to everyone.

### C36 · Store resource requests
- **Status:** Queued · **Owner:** Claude · **Category:** Portal · **Size:** S
- **Depends on:** A15
- **Requirements:** GS-005, WEB-010
- **Done when:** TAB Practice lists who asked for which guide, alongside Start and contact submissions, and exports those who ticked news.
- Saved only once guardrail 4's conditions are met (proposed D-058, D-073); until then a request sends its link and is not stored.

### C27 · Staff password and session limits
- **Status:** Done · **Owner:** Claude · **Category:** Security · **Size:** M
- **Done:** 2026-10-06 · #48, #49
- **Requirements:** SEC-015, SEC-020
- Password, then the authenticator code; staff sessions end 30 days after sign-in (idle ones after 7) [proposed D-068]. Passkeys moved to C28.

### C5 · Sign-in links that work in any browser
- **Status:** Done · **Owner:** Claude · **Category:** Portal · **Size:** S
- **Done:** 2026-10-06 · #40, #45
- **Requirements:** PORTAL-001, SEC-014
- One-time `token_hash` links for sign-in and invitations, and branded Supabase emails. The live invitation test moves to A15.

### C4 · Pilot tools in TAB Practice
- **Status:** Done · **Owner:** Claude · **Category:** Portal · **Size:** M
- **Done:** 2026-10-03 · #22, #23, #25, #28
- **Requirements:** STAFF-005, STAFF-006, STAFF-008, STAFF-010, PORTAL-011
- Progress reviews and stage changes (C4a), typed plans (C4b), program assignment (C4c), then invitations, forms and shared resources.

### C3b · Portal security hardening, part 2
- **Status:** Done · **Owner:** Claude · **Category:** Security · **Size:** M
- **Done:** 2026-10-03 · #30
- **Requirements:** SEC-019, SEC-020
- Internal notes in a private schema behind audited functions; append-only audit log and nightly export (waits on A26); transactional Stripe webhook; secure session cookies.

### C3 · Portal security hardening, part 1
- **Status:** Done · **Owner:** Claude · **Category:** Security · **Size:** M
- **Done:** 2026-09-28 · #13
- **Requirements:** SEC-015, SEC-016, SEC-017, SEC-018
- The 5 known gaps closed (71 checks, 0 gaps); the audit log read-only.

## P3 · Later or optional

Improvements and options with no launch or go-live date riding on them.

### C28 · Passkeys for staff
- **Status:** Blocked · **Owner:** Claude · **Category:** Security · **Size:** S
- **Waits on:** Supabase allowing WebAuthn MFA on the hosted service
- **Requirements:** SEC-015
- **Done when:** staff can use Face ID, Touch ID or Windows Hello as the second step on production, tested with the owner's devices (G3).
- Built and tested, hidden until Supabase's hosted service allows WebAuthn MFA (it refused on 2026-10-06). Then: switch on the two Supabase settings and set `PASSKEYS_AVAILABLE`.

### C14 · Stage-readiness prompts
- **Status:** Ready · **Owner:** Claude · **Category:** Portal · **Size:** M
- **Requirements:** STAFF-006
- **Done when:** TAB Practice suggests a stage review when a client's activity meets the rules in design §5.1, and the practitioner confirms any change.

### A24 · Anthropic API key
- **Status:** Deferred · **Owner:** Owner · **Category:** Accounts · **Size:** S
- **Waits on:** your decision to use AI program drafting
- **Where:** Vercel → Environment Variables (`ANTHROPIC_API_KEY`, Sensitive)

### C13 · AI program drafting
- **Status:** Queued · **Owner:** Claude · **Category:** Portal · **Size:** M
- **Depends on:** A24
- **Requirements:** STAFF-009
- **Done when:** a practitioner can draft a program from a template with AI help, sending no client data.
- Design §4.

### C9 · Major upgrades
- **Status:** Ready · **Owner:** Claude · **Category:** Platform · **Size:** L
- **Done when:** the site runs on Next 16, zod 4 and TypeScript 7 with every check green.
- [UPG-01 to UPG-03]

### C10 · Handoff-document references
- **Status:** Ready · **Owner:** Claude · **Category:** Docs · **Size:** S
- **Done when:** the handoff documents' references match the register [DIV-03].

### C11 · Meta pixel off Start and Contact
- **Status:** Deferred · **Owner:** Claude · **Category:** Analytics · **Size:** S
- **Waits on:** paid ads starting
- **Requirements:** NFR-005
- **Done when:** the Meta pixel never fires on `/start` or `/contact`, including after in-site navigation [GAP-022].

### C17 · Tokens generated from the JSON
- **Status:** Ready · **Owner:** Claude · **Category:** Design · **Size:** S
- **Requirements:** DS-001
- **Done when:** the CSS tokens are generated from the Design Tokens JSON in the build, and the contrast check still runs.
- Closes TG-6.

### C12 · Pin Node 22
- **Status:** Ready · **Owner:** Claude · **Category:** Platform · **Size:** S
- **Done when:** `package.json` pins `engines.node` to `22.x`, so Vercel doesn't move to each new major on its own (builds run on 24 today).

### A17 · Stripe account
- **Status:** Deferred · **Owner:** Owner · **Category:** Accounts · **Size:** S
- **Waits on:** selling programs online
- **Requirements:** PORTAL-009, INT-003
- One Stripe customer per client [D-052].

### A18 · Preview test bypass and rate limit
- **Status:** Deferred · **Owner:** Owner · **Category:** Accounts · **Size:** S
- **Waits on:** your decision (optional)
- **Requirements:** NFR-007
- Optional: Vercel's Protection Bypass secret, so automated tests can run against previews; the Vercel Firewall rate limit was declined for now.

### A21 · Tidy blank variables
- **Status:** Deferred · **Owner:** Owner · **Category:** Accounts · **Size:** S
- **Waits on:** your decision (optional)
- Optional: delete the five blank Sensitive `NEXT_PUBLIC_*` variables in Vercel (site URL, indexing, Turnstile site key, Supabase URL and anon key) so they can be re-added as Config when they get values.

### C33 · Daily website request check
- **Status:** Done · **Owner:** Claude · **Category:** Process · **Size:** S
- **Done:** 2026-10-07
- **Requirements:** CMS-007
- A routine runs every morning at 07:52 Detroit time, triages new website requests and replies in their notes. It never builds, merges or releases.

### C8 · Payload CMS
- **Status:** Dropped · **Owner:** Claude · **Category:** Platform · **Size:** L
- **Done:** 2026-10-07
- Replaced by Keystatic (C31, proposed D-069).

### C7b · Program editor, part 2
- **Status:** Done · **Owner:** Claude · **Category:** Portal · **Size:** M
- **Done:** 2026-10-01 · #26
- **Requirements:** STAFF-009
- Move a client to a newer program version, client-only activities, and the Team page for the publishing permission.

### C7 · Program editor
- **Status:** Done · **Owner:** Claude · **Category:** Portal · **Size:** M
- **Done:** 2026-10-01 · #25
- **Requirements:** STAFF-009
- Programs with versions and the publishing permission.

### A19 · Designer extras
- **Status:** Done · **Owner:** Owner · **Category:** Brand · **Size:** M
- **Done:** 2026-10-05 · #31
- **Requirements:** DS-006
- Service-icon vectors and print cleanup, met by the logo redraw.

### C0 · Demo portal on the production URL
- **Status:** Done · **Owner:** Claude · **Category:** Portal · **Size:** S
- **Done:** 2026-09-28 · #19
- Guarded by the launch gate; turned off on production on 2026-10-06 (switch-over Phase A).

### A23 · Where the demo runs
- **Status:** Done · **Owner:** Owner · **Category:** Decision · **Size:** S
- **Done:** 2026-09-28 · #19
- Ruled: on the production URL while it was private (C0).

### A20 · Revoke a pasted token
- **Status:** Dropped · **Owner:** Owner · **Category:** Security · **Size:** S
- **Done:** 2026-09-28
- Declined by the owner (#16).

### A1 · The domain
- **Status:** Done · **Owner:** Owner · **Category:** Accounts · **Size:** S
- **Done:** 2026-10-06 · #36
- `tabhumanperformance.com` plus three defensive domains registered; Google Workspace, SPF, DKIM and DMARC published [RSK-007].

## Notes on sequencing

**C1 is the launch path.** The domain is attached behind Vercel login; what remains is the switch-over's Phase B (public access, indexing, launch day under C2) and the content and access items in front of it (A6, A8, A10, A29).

**The pilot's practitioner tools are done.** With C4, a practitioner can invite a client, assign plans, programs, forms and resources, and record progress reviews. What stands between the demo and A16 is plumbing and paperwork, not features: C6 on Claude's side, A14 and A26 on yours. C14 and C13 are improvements, not pilot needs.

**A15 is the real go-live gate for My TAB.** It needs C6, A14 and A26: no production client data until the security gate, backups with a tested restore, and a privacy policy that covers My TAB are all in place (`CLAUDE.md` guardrail 4).

## Release notes

- **Living documents redesigned** (2026-10-10, PR open): the architecture, data model, requirements, backlog and content guide pages rebuilt as one connected set with a new user stories page; every ID links to its home and shows a hover card; the backlog lists every item with its status, dependencies and what it unblocks.

- **Content fast lane** (built 2026-10-10, C32, PR open): the owner's own content changes from the editor are merged and promoted automatically after CI; anyone else's change, or one touching code, gets a comment and waits for approval. Off until A32 (the Vercel key).

- **Website stats error fixed** (2026-10-10, PR 60): Website stats, the client page's resource picks and guide requests failed on the live site once the first PDF was uploaded, because a deployed page carries only the files traced into it. Uploads are now checked at build time only, every page that reads the library ships it, and a check inspects the build so it can't recur.

- **Resource subjects open their resource; saving on main turned off** (live 2026-10-09): topic cards list their subjects, and a subject opens its PDF, its email-first form or its link (also pages on this site). The editor refuses to save on `main` and says to start a branch; a safety-net Action moves anything that still lands there into a change request. The owner's first guide, "Your first massage" (an 11-page PDF, email first), is linked to its subject.

- **Content editor, part 2** (live 2026-10-07, C35): Home, the TAB Method, About, Our Story, Our Team (photo uploads, confirmed credentials) and the resource library (links, PDFs, email-first downloads, open counts).

- **Editor saves always build** (2026-10-07, C31 follow-up): the first editor save, made on `main`, cleared a card grid's optional heading; the editor leaves an empty field out of the file and the content rules required it, so the production build failed (nothing went live). The rules now accept it, and a test checks what the editor saves. GitHub Pro was declined (A34), so before each promotion Claude lists any change that reached `main` without a change request.

- **Content editor** (live 2026-10-07, C31; Project URLs and A33 set by the owner the same day): `/keystatic` edits the five service pages and the massage techniques guide, on `content/…` branches with a change request and full checks for every save; Keystatic Cloud project `tab-hpc/website` (setting `NEXT_PUBLIC_KEYSTATIC_CLOUD_PROJECT`, production). The GitHub repository was renamed to TAB-Human-Performance-Center by the owner.

- **Daily website request check** (on 2026-10-07, C33): a routine runs every morning at 07:52 (Detroit time), reads new requests and staff replies, answers in the notes with questions or options and moves the status. It never builds, merges or releases. Request alerts go to both matthew@ and info@ (owner: "both").

- **Website change requests and the content guide** (live 2026-10-07, C30): the first version used GitHub issue forms; replaced the same day by requests inside TAB Practice (C34), at the owner's direction.

- **Massage techniques guide** (live, C29): eleven techniques at `/services/massage-bodywork/techniques` (the eight tabmassage.com modalities rewritten, plus manual lymphatic drainage, prenatal and sports massage), linked from the Massage page; the old page redirects there. Other pillars can follow the same pattern when wanted.

- **Payload CMS (C8) replaced** (2026-10-07): the owner chose Keystatic (proposed D-069), now C31.

- **Service pages without the repeated lists** (live 2026-10-07): the "Who it's for" and "What you may gain" bullet lists are gone from all five service pages; How we help carries the same ground in focus-area cards (new cards for Integrated Nutrition and Holistic Life Coaching, two more each for Functional Strength and Women's Wellness). Owner request.

- **Phone layout fix** (live 2026-10-07): the massage techniques page was 666px wide on phones (its comparison table stretched the column), so the whole page scrolled sideways. On phones the comparison is now a stacked list; `/book` and `/accessibility` also fit 320px screens. A new check fails any page wider than the screen. Owner report.

- **Staff sign-in with a password** (live 2026-10-06, C27): email and password, then the authenticator code; the emailed link stays for a forgotten password. TAB Practice sessions end 30 days after sign-in (idle ones after 7); passwords need 12 characters and are checked against known breaches. Passkeys moved to C28: Supabase won't switch them on yet.

- **Sign-in links that work in any browser** (done 2026-10-06, C5): the owner's sign-in at 20:37 used the new one-time link type in production. The invitation test is dropped for now (My TAB is off, so there's nothing real to land on); the first real invitation under A15 covers it. The matthew@tabmassage.com test account was deleted.

- **Contact in the About menu** (live 2026-10-06): the header's About menu now ends with Contact, so the page is one click from every page instead of only the footer. Owner request.

- **Our own website stats** (live 2026-10-06, C26): the site counts its own page views, Start form starts and sends, Book clicks and referring sites as daily totals (no cookies, nothing that identifies a visitor), shown on a new owner-only Website stats page in TAB Practice. Owner ruling A4: "Let's build our own". Migration `20261011000000` applied and the production server key set (G3); first counts confirmed from the owner's browsing.

- **Turnstile and analytics** (live 2026-10-06): Turnstile keys set in Vercel (production: the owner's; previews: Cloudflare's test keys), A3 closed: the owner confirmed a live contact-form submission (2026-10-07). Plausible declined by the owner ("I'm not paying for a bunch of micro services"); Vercel Web Analytics turned out to be a paid add-on, so the site counts its own (C26, A4 closed).

- **Client policies and retention** (live 2026-10-06): `/policies` now carries the owner's cancellation, arrival and gratuity policies, reworded for TAB Human Performance Center (A30). Retention ruled: website submissions are kept and never deleted (A7, proposed D-058 kept); the privacy policy now says so plainly.

- **Settings, part 2** (live 2026-10-06, C23b): set a Timely link for each service's Book buttons and switch Resources and Our Team on or off, from TAB Practice → Settings; menus, pages, the homepage and the sitemap follow within seconds. Events and Testimonials are visible but locked until there's real content for them.

- **Owner rulings and launch checks** (live 2026-10-06): privacy policy and terms approved by the owner and published as final (A7; the cancellation policy is now A30); Vercel Pro confirmed active (A11); service area reads "Serving Livingston County" in the footer and emails, and structured data names the county (A12); owner Settings and staff sign-in shipped (C23, live 2026-10-06). New checks for the analytics exclusion, email privacy, one next step per Start submission, and service-page anatomy (C15); service views and Book clicks counted (C18; by our own counter since C26).

- **No Client Login until My TAB is live** (live 2026-10-06): the header and footer drop Client Login while the portal is off and show "My TAB" once the owner sets it to Live; Book stays the way into Timely. Owner ruling: "The client login CTA button needs to be hidden until the client portal is live". A5 (the Timely Client Login link) moves to P2, where My TAB's appointment pages use it; own photography is now optional on the launch checklist, per the A8 ruling.

- **Branded sign-in emails** (live 2026-10-06): the 13 emails Supabase sends (sign-in link, My TAB invitation, verification code, security notices) now use the website emails' layout and wording; sender name is the full business name. Owner request: "update the email templates that are sent out of supabase with our brand".

- **Production database and owner sign-in** (2026-10-06, G3 approved by the owner): 13 migrations applied to the production database (38 tables, row-level security on all), auth URLs set, sign-ups off; owner account created; Supabase email moved to Resend (owner); owner signed in and enrolled an authenticator app. No client data.

- **Owner Settings** (live 2026-10-06, C23): TAB Practice → Settings, where the owner turns the client portal on or off (Live only once the go-live gate is met), the transition banner and the Start form; staff sign-in with an emailed link and an authenticator app; the settings table lets only the two-step-verified owner change anything and logs every change. Owner request: "I don't have to ask you to turn the portal on or off".

- **Launch date and business facts** (live 2026-10-06): public launch targeted for 1 November 2026 (closes A13); address, phone, hours (grouped in the footer, by day on the contact page, and as opening hours for search engines) and a map link on the site (most of A6); privacy policy and terms drafted from how the site actually works, with review notes for the owner and attorney (A7 now review); stock photography confirmed for launch (A8). Email template no longer requests web fonts from Google.

- **Website email** (live 2026-10-06): Resend verified for `tabhumanperformance.com` and tested end to end (owner received both emails; closes A2). All emails now share a branded layout: logo embedded inline, Bone page and white card, Spectral headline, answers table, olive button and brand footer; the staff copy adds the reference, any follow-up flags, the next-step options and a one-tap reply. Owner feedback: "They are plain text and look unprofessional".

- **Homepage closing band** (live 2026-10-06): the closing call to action now uses the layered-ridges sunrise (library #28) and a Spectral headline, echoing the hero; the scrim is darkest behind the text (white text 4.8:1 or better at every width). Owner feedback: "something that aligns better with the hero image".

- **Domains and email** (2026-10-06): `tabhumanperformance.com` (owner) plus `tabhumanperformancecenter.com`, `tabhpc.com` and `tabhp.com` registered at Vercel; Google Workspace verification, MX, SPF, DKIM and DMARC (monitoring) published for the main domain; the other three locked against mail. Closes A1 and RSK-007.

- **Rebrand PR 3, image library** (live 2026-10-06): the 30 images from the batch-5 stock library, resized, slightly desaturated and saved as WebP (4.6 MB in all), catalogued in `content/images.ts` with source, licence, focal point and placement. 17 placed: a hero and a "How we help" image on every service page, About and TAB Method heroes, a Transform / Adapt / Balance band on the TAB Method page, and the homepage core idea and closing band. 13 held in reserve with a reason each; #10 is not used (a political flag in frame). Closes C21.

- **Rebrand PR 4, My TAB and TAB Practice restyle** (live 2026-10-05): sign-in framed by the homepage mountain and purpose line (Spectral) with the stacked lockup on phones; the client's own words and the TAB Method stage lines set in Spectral; the portal's invented status tints replaced by Sage and Ochre tint tokens with contrast checks; "Practice workspace" renamed TAB Practice (A27); `npm run test:brand` now also blocks hex colours in classes and the old workspace name. No behaviour changes. Closes C22.

- **#34 TAB Performance Plan** (2026-10-05): the client plan renamed from TAB Wellness Plan across My TAB, TAB Practice and the docs (internal keys unchanged); the brand check blocks the old name. Closes A27 (TAB Practice stays) and A28.

- **#33 Rebrand PR 2** (2026-10-05): public copy rewritten in the Brand Foundation v2 voice (homepage, services, About, Our Story, FAQ, resources, metadata); service summaries, descriptions and lists from Step 13 and BF §11; pillar count derived from the services; `npm run test:brand` in CI blocks retired names, the old philosophy, old service names and wrong pillar counts. Closes C20.

- **#31 Rebrand PR 1** (2026-10-05): TAB Human Performance Center name everywhere; approved palette with Clay Dark and AA-checked UI values; Montserrat and Spectral self-hosted; the approved logo redraw, app icons, favicons, sharing image and five vector service icons; register entries D-061 to D-065 proposed; the homepage hero from the board mock-up; the TAB Method stages renamed Transform, Adapt, Balance; the five pillars. Closes A9 and A19. Promoted 2026-10-05 (`dpl_Dj7fA…`).

- **#30** (2026-10-03): internal notes and practitioner-only plan details in a private schema behind audited functions; append-only audit log and a nightly encrypted export (waits on A26); Stripe events in one transaction, with partial refunds flagged for the owner in TAB Practice; `httpOnly`, `secure`, seven-day session cookies. Promoted 2026-10-05 (`dpl_7aWBr…`).

- **#29** (2026-10-03): living documents, the traceability page moved into `docs/TRACEABILITY.md` and published; new technical architecture and data model pages; `npm run docs:check` in CI keeps all three in step with the code. Promoted (`dpl_CDWF4…`).

- **#28** (2026-10-03): C4 invite a client to My TAB (invited and first sign-in tracked), assign and withdraw forms, share and remove resources; clients' opened resources show as viewed. Promoted (`dpl_Hy6P3…`).

- **#26** (2026-10-02): C7b move a client to a newer program version (progress and personalization carried over), client-only activities, Team page for the publishing permission. Promoted (`dpl_8fqGu5…`).

- **#25** (2026-10-01): C4c assign and personalize programs; C7 program editor with versioning and the publishing permission. Promoted (`dpl_Djq3uj…`).

- **#24** (2026-09-30): Wellness Plan goals up to 100; plan editor date fields fixed on iPad. Promoted with C4b (`dpl_9TA6w…`).

- **#23** (2026-09-29): C4b typed plans (Wellness Plan + service plans), practitioner-only sections, plan log, nutrition gate.

- **#22** (2026-09-29): C4a Progress Reviews and practitioner-confirmed stage changes (dashboard notice, stage email, tamper-proof stage history).

- **Vercel settings** (2026-09-28): staged production for G3 (merges build but don't go live until promoted; A22 closed); Vercel login extended to every URL after `tab-wellness-collective.vercel.app` was found public.

- **#19** (2026-09-28): Demo My TAB and TAB Practice on the production URL, guarded by the launch gate.

- **#18** (2026-09-28): Demo sign-in (client or practitioner), Practitioner login link, sign-out; fonts self-hosted (Google Fonts broke CI).

- **#16** (2026-09-28): Vercel builds fixed (a blank `NEXT_PUBLIC_SITE_URL` broke every deploy); first production deploy ready; `CLAUDE.md` Vercel rules corrected to the owner's personal team. After merge: `NEXT_PUBLIC_SHOW_DRAFTS=true` on Preview; Claude authorized to manage Vercel env vars. A20 (revoke the Vercel token pasted in chat) declined by the owner.

- **#13** (2026-09-28): Portal security hardening, part 1: SEC-015 to SEC-018, the 5 known gaps closed (71 checks, 0 gaps); audit log read-only.

- **#12** (2026-09-28): Client Login fix and Timely booking link; Content Security Policy; sign-in spam protection; banner expiry; rulings recorded (GAP-008 closed, HIPAA does not apply).
