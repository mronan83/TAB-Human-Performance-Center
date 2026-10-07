# Backlog and actions

The single list of remaining work. Every PR updates it. After every successful production promotion (G3) Claude
renders this file into the backlog page (`npm run backlog:html`) and republishes it to the owner (`CLAUDE.md`, Branches
and review gates). IDs are stable: **A** = owner actions, **C** = Claude's engineering work. Register IDs in brackets
refer to `docs/requirements-register.md`.

**Priority:** P0 now (risk or blocks most other work) · P1 public-site launch · P2 My TAB go-live · P3 later or optional.
**Effort:** S hours · M about a day · L several days, or waiting on someone else. **Blocker:** `None` means it can start now.

_Last updated: 2026-10-07, website admins and requests in TAB Practice (C34); Keystatic Cloud (C31) and the fast lane (C32) next._

## P0 · Now

| ID | Item | Category | Owner | Effort | Blocker |
|---|---|---|---|---|---|

## P1 · Public-site launch

| ID | Item | Category | Owner | Effort | Blocker |
|---|---|---|---|---|---|
| A6 | Business facts: the gift cards link (Timely) is the last one; address, phone, hours and map link were set 2026-10-06 [GAP-003, GAP-020] | Content | Owner | S | None |
| A8 | Content: founder story, bio and the 14 draft service FAQs. Stock photography is fine for launch (owner, 2026-10-06) [GAP-012] | Content | Owner | M | None |
| A10 | Switch-over access: web host DNS panel, GoDaddy, Google Workspace admin, Search Console [GAP-019] | Accounts | Owner | S | None |
| A25 | Rulings from the traceability page: success measures per objective (Q-1); owner access to every client (Q-3, SEC-012); Step 14's six review outcomes (Q-5, TG-1); WEB-002 at 17 routes for Phase 1 (Q-6, TG-2); whether the pilot needs activity responses (Q-2, TG-4); whether clients may change their own contraindications (Q-7) | Decision | Owner | S | None |
| C1 | Switch-over, `docs/runbooks/switch-over.md`. Phase A (private attach: demo portal off, new domain in config, domains attached behind Vercel login, Resend DNS) in progress; Phase B (public launch: protection to Standard, indexing, GoDaddy web records for tabmassage.com, checks) waits on content and A13 [§7.4, RSK-009, proposed D-066] (G3) | Launch | Claude | M | A2, A8, A13 |
| A29 | Google Workspace: rename users to `@tabhumanperformance.com` (each old `@tabmassage.com` address stays as an alias on the same mailbox); for any other old address, add a catch-all route for `tabmassage.com` to `info@tabhumanperformance.com`; keep `tabmassage.com` in Workspace. At GoDaddy, add SPF, DKIM and DMARC for `tabmassage.com`, which has none today (records in `docs/runbooks/switch-over.md`) [runbook, Email] | Accounts | Owner | S | A10 |
| C24 | Tighten DMARC on `tabhumanperformance.com` to `quarantine`, then `reject`, one week after DKIM is authenticating and mail flows | Accounts | Claude | S | A29 |
| C2 | Launch day: indexing on, Search Console and sitemap, e2e run against the live domain, HSTS for subdomains after the switch-over [NFR-009] (G3) | Launch | Claude | M | A1–A11 |
| C25 | Launch communications plan for 1 November: announcement sequence, channels, assets and the cutover timeline (a shared document for the owner) [A13] | Launch | Claude | M | None |
| C34 | **In review.** Website admin role (website only: requests, stats, content editor; never client data) and website requests inside TAB Practice → Website changes: numbered requests, statuses, notes, owner-only status changes, an email to the owner naming the number; admins invited and removed in Settings; GitHub issue forms retired; content guide updated. Needs G3 for migrations `20261012000000` and `20261013000000` [STAFF-011, CMS-007, proposed D-071] | Platform | Claude | M | None |
| A31 | One-time, with C31: create the free Keystatic Cloud team and connect it to the repository (Claude sends the steps); then add up to two admins as editors (3 users free; a fourth needs Keystatic's paid plan) | Accounts | Owner | S | C31 |
| C31 | Keystatic Cloud content editor at `/keystatic` (editors sign in with Keystatic Cloud, no GitHub account; proposed D-071) and the block library: content files move to Keystatic's format, service pages and the massage techniques first, then the home, About, Method, FAQ and Resources pages; field limits match the checks (search descriptions 40–160 characters, required alt text) [CMS-001 to CMS-005, proposed D-069; replaces C8] | Platform | Claude | L | None |
| C32 | Fast lane: a GitHub Action that squash-merges an owner-authored, content-only, green PR and promotes that exact production build through the Vercel API; anything else keeps G2 and G3 First confirm that a Keystatic Cloud edit can still be traced to the owner; if not, the fast lane covers only the owner's direct edits [proposed D-070] | Platform | Claude | M | C31, A32 |
| A32 | Create a Vercel token scoped to the team and add it as the GitHub secret `VERCEL_TOKEN` (Claude sends the steps with C32) | Accounts | Owner | S | C32 |

## P2 · My TAB go-live (`CLAUDE.md` guardrail 4)

| ID | Item | Category | Owner | Effort | Blocker |
|---|---|---|---|---|---|
| A5 | Timely Client Login link, for My TAB's appointments and billing pages (no longer a public-launch item: the site shows no Client Login until My TAB is live, owner ruling 2026-10-06) [WEB-020, PORTAL-006] | Content | Owner | S | None |
| C6 | Tests against a real Supabase stack in CI [SEC-021] | Security | Claude | L | None |
| C16 | My TAB profile: accessibility needs and goals, client-editable (PORTAL-010, TG-5) | Portal | Claude | S | None |
| C19 | Incident-response runbook: who to call, revoking keys, telling clients; paired with counsel's breach duties (SEC-011, TG-9) | Security | Claude | S | A7 |
| A26 | At go-live: give the `audit_reader` role a login password, then add the GitHub secrets `SUPABASE_AUDIT_DB_URL` and `AUDIT_EXPORT_PASSPHRASE` (keep the passphrase somewhere safe: it opens the exports) [SEC-019] | Accounts | Owner + Claude | S | A14 |
| A14 | Supabase Pro, for daily backups ("later") [SEC-009] | Accounts | Owner | S | None |
| A15 | G3: ~~approve the production database setup; owner account with MFA~~ (done 2026-10-06); tested backup restore [SEC-009]; the first real invitation doubles as C5's invitation test (dropped from C5 on 2026-10-06 because My TAB is off) | Release | Owner + Claude | M | C6, A7, A14, A26 |
| A16 | Pilot with 3–5 existing clients, then open My TAB to everyone | Operations | Owner | L | A15 |

## P3 · Later or optional

| ID | Item | Category | Owner | Effort | Blocker |
|---|---|---|---|---|---|
| C28 | Passkeys for staff sign-in (Face ID, Touch ID, Windows Hello instead of the 6-digit code): built and tested, hidden until Supabase's hosted service allows WebAuthn MFA (it refused on 2026-10-06). Then: switch on the two Supabase settings, set `PASSKEYS_AVAILABLE`, test with the owner's devices (G3) [SEC-015] | Security | Claude | S | Supabase support |
| C14 | Rule-based stage-readiness prompts in TAB Practice (design §5.1) | Portal | Claude | M | None |
| C13 | AI program drafting, templates only, no client data (design §4) | Portal | Claude | M | A24 |
| A24 | Anthropic API account and key for AI program drafting (Vercel Sensitive var `ANTHROPIC_API_KEY`) | Accounts | Owner | S | None |
| C33 | Daily check for new website requests in TAB Practice, so a request is triaged without anyone starting a session (a scheduled routine reading `website_requests`). Recommended now that requests no longer arrive as GitHub notifications | Process | Claude | S | Owner opts in |
| C9 | Major upgrades: Next 16, zod 4, TypeScript 7 [UPG-01 to UPG-03] | Platform | Claude | L | None |
| C10 | Correct handoff-document references [DIV-03] | Docs | Claude | S | None |
| C11 | Before paid ads: keep the Meta pixel off `/start` and `/contact` after in-site navigation [GAP-022] | Analytics | Claude | S | Paid ads start |
| C17 | Generate the CSS tokens from the Design Tokens JSON instead of copying them by hand, keeping the contrast check (DS-001, TG-6) | Design | Claude | S | None |
| C12 | Pin Node to `22.x` in `package.json` `engines`; `>=22` lets Vercel move to each new major on its own (builds run on 24 today) | Platform | Claude | S | None |
| A17 | Stripe account, when programs are sold online [D-052] | Accounts | Owner | S | Online sales |
| A18 | Optional: Vercel Protection Bypass secret (automated preview tests); Vercel Firewall rate limit (declined for now) | Accounts | Owner | S | None |
| A21 | Optional: delete the five blank Sensitive `NEXT_PUBLIC_*` variables in Vercel (site URL, indexing, Turnstile site key, Supabase URL and anon key) so they can be re-added as Config when they get values | Accounts | Owner | S | None |

## Notes on sequencing

**C1 is the launch path.** The domain is attached behind Vercel login; what remains is the switch-over's Phase B (public access, indexing, launch day under C2) and the content and access items above it (A6, A8, A10, A29).

**The pilot's practitioner tools are done.** With C4, a practitioner can invite a client, assign plans, programs, forms and resources, and record progress reviews. What stands between the demo and A16 is plumbing and paperwork, not features: C6 on my side, A14 and A26 on yours. C14 and C13 are improvements, not pilot needs.

**A15 is the real go-live gate for My TAB.** It needs C6, A14 and A26: no production client data until the security gate, backups with a tested restore, and a privacy policy that covers My TAB are all in place (`CLAUDE.md` guardrail 4).

## Recently done

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

- **Client policies and retention** (live 2026-10-06): `/policies` now carries the owner's cancellation, arrival and gratuity policies, reworded for TAB Human Performance Center (A30). Retention ruled: website submissions are kept and never deleted (A7, proposed D-058 kept); the privacy policy now says so plainly. A3 and A4 have step-by-step instructions; their old dependency on A1 (done) is cleared.

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

- **#31 Rebrand PR 1** (2026-10-05): TAB Human Performance Center name everywhere; approved palette (palette file) with Clay Dark and AA-checked UI values; Montserrat and Spectral self-hosted; the approved logo redraw (horizontal, stacked, symbol; colour, graphite, white, sheen), app icons, favicons, sharing image and five vector service icons; register entries D-061 to D-065 proposed; the homepage hero from the board mock-up (mountain photograph, "More capacity for what matters.", service icon strip), brought forward from PR 2 at the owner's request; the TAB Method stages renamed Transform, Adapt, Balance (migration renames the enum values); the five pillars (new Integrated Nutrition page within the IIN coaching scope, Functional Strength and Women’s Wellness renamed with 308 redirects, internal service keys unchanged, migration adding `integrated-nutrition` to `service_slug`); CLAUDE.md, strategy documents (batch 5) and living documents updated. Closes A9 and A19. Promoted 2026-10-05 (`dpl_Dj7fA…`).

- **#30** (2026-10-03): internal notes and practitioner-only plan details in a private schema behind audited functions; append-only audit log and a nightly encrypted export (waits on A26); Stripe events in one transaction, with partial refunds flagged for the owner in TAB Practice; `httpOnly`, `secure`, seven-day session cookies. Promoted 2026-10-05 (`dpl_7aWBr…`).
- **#29** (2026-10-03): living documents, the traceability page moved into `docs/TRACEABILITY.md` and published in the requested layout; new technical architecture and data model pages; `npm run docs:check` in CI keeps all three in step with the code. Promoted (`dpl_CDWF4…`).
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
