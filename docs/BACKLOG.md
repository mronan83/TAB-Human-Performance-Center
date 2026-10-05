# Backlog and actions

The single list of remaining work. Every PR updates it. After every successful production promotion (G3) Claude
renders this file into the backlog page (`npm run backlog:html`) and republishes it to the owner (`CLAUDE.md`, Branches
and review gates). IDs are stable: **A** = owner actions, **C** = Claude's engineering work. Register IDs in brackets
refer to `docs/requirements-register.md`.

**Priority:** P0 now (risk or blocks most other work) · P1 public-site launch · P2 My TAB go-live · P3 later or optional.
**Effort:** S hours · M about a day · L several days, or waiting on someone else. **Blocker:** `None` means it can start now.

_Last updated: 2026-10-05, rebrand PR 2: public copy in the new voice and an automated brand-consistency check._

## P0 · Now

| ID | Item | Category | Owner | Effort | Blocker |
|---|---|---|---|---|---|
| A1 | Choose and register the domain for TAB Human Performance Center (name approved 2026-10-05; `tabwellnesscollective.com` is no longer needed). Email addresses and the canonical URL in `config/site.ts` still use the old domain as placeholders until then [RSK-007] | Accounts | Owner | S | None |

## P1 · Public-site launch

| ID | Item | Category | Owner | Effort | Blocker |
|---|---|---|---|---|---|
| A2 | Resend account and its DNS records. Until then the forms can't send [D-005] | Accounts | Owner | S | A1 |
| A3 | Turnstile keys: real keys for Production, test keys for Preview [SEC-013] | Accounts | Owner | S | A1 |
| A4 | Plausible account for the domain (Start funnel counts) [GAP-015, D-057] | Accounts | Owner | S | A1 |
| A5 | Timely Client Login link [WEB-020] | Content | Owner | S | None |
| A6 | Business facts: address, phone, hours, map link, gift cards link (15 placeholders in `config/site.ts`) [GAP-003, GAP-020] | Content | Owner | S | None |
| A7 | Legal pages with counsel: privacy (Plausible, forms, My TAB), terms, cancellation. Also confirm the duties that remain without HIPAA: breach notification, record retention [GAP-010] | Legal | Owner + counsel | L | None |
| A8 | Content: founder story, bio, photos, the 14 draft service FAQs [GAP-012] | Content | Owner | M | None |
| A10 | Switch-over access: web host DNS panel, GoDaddy, Google Workspace admin, Search Console [GAP-019] | Accounts | Owner | S | None |
| A11 | Vercel Pro at launch; the Hobby plan doesn't allow business use [RSK-005] | Accounts | Owner | S | Launch date |
| A12 | Confirm the service-area wording "Brighton & Howell, MI" [ASM-006] | Content | Owner | S | None |
| C21 | Rebrand PR 3, image library: the 30 stock images from the Step 18 image plan, licensed and optimised, placed by page [DS-007] | Brand | Claude | M | None |
| C22 | Rebrand PR 4, My TAB and TAB Practice restyle to the new identity; no behaviour changes [D-062] | Brand | Claude | M | None |
| A27 | Decide whether the practitioner workspace keeps the name "TAB Practice" now that "Practice" is retired from the brand name | Decision | Owner | S | None |
| A28 | Decide whether the client plan keeps the name "TAB Wellness Plan" (DEC-014) now that wellness is no longer the master category; "TAB Plan" would avoid it | Decision | Owner | S | None |
| A13 | Set a target launch date; recommended once email sends [GAP-017] | Decision | Owner | S | A2 |
| A25 | Rulings from the traceability page: success measures per objective (Q-1); owner access to every client (Q-3, SEC-012); Step 14's six review outcomes (Q-5, TG-1); WEB-002 at 17 routes for Phase 1 (Q-6, TG-2); whether the pilot needs activity responses (Q-2, TG-4); whether clients may change their own contraindications (Q-7) | Decision | Owner | S | None |
| C15 | Checks for guardrails that only code review protects today: analytics never loads on `/my-tab`, `/practice` or `/contact` (NFR-005); emails and subjects carry no personal or health details (TG-3); a Start submission gets one next step and shows in TAB Practice (TG-8); every service page keeps its CTA, "not sure?" link and related services (WEB-004 to WEB-007) | Quality | Claude | M | None |
| C18 | Count the remaining public events, `service_view` and `book_click`, property-less (NFR-006, TG-7) | Analytics | Claude | S | A4 |
| C1 | Switch-over runbook (first step: set `portalDemoOnProduction` to false before the custom domain is attached): DNS order that keeps Google Workspace email, legacy email forwarding, redirect checks on the live domain, rollback [§7.4, RSK-009] | Launch | Claude | M | A1, A10 |
| C2 | Launch day: indexing on, Search Console and sitemap, e2e run against the live domain, HSTS for subdomains after the switch-over [NFR-009] (G3) | Launch | Claude | M | A1–A11 |

## P2 · My TAB go-live (`CLAUDE.md` guardrail 4)

| ID | Item | Category | Owner | Effort | Blocker |
|---|---|---|---|---|---|
| C5 | Sign-in plumbing: Site URL and redirects; sign-in and invitation emails through Resend, with Supabase's invite template worded like ours (no personal details, guardrail 5); confirm invitation links land on `/my-tab/auth/callback` and record the first sign-in; staff MFA enrolment (staff can't use TAB Practice on Supabase until this exists) [SEC-014, SEC-015] | Portal | Claude | M | A1, A2 |
| C6 | Tests against a real Supabase stack in CI [SEC-021] | Security | Claude | L | None |
| C16 | My TAB profile: accessibility needs and goals, client-editable (PORTAL-010, TG-5) | Portal | Claude | S | None |
| C19 | Incident-response runbook: who to call, revoking keys, telling clients; paired with counsel's breach duties (SEC-011, TG-9) | Security | Claude | S | A7 |
| A26 | At go-live: give the `audit_reader` role a login password, then add the GitHub secrets `SUPABASE_AUDIT_DB_URL` and `AUDIT_EXPORT_PASSPHRASE` (keep the passphrase somewhere safe: it opens the exports) [SEC-019] | Accounts | Owner + Claude | S | A14 |
| A14 | Supabase Pro, for daily backups ("later") [SEC-009] | Accounts | Owner | S | None |
| A15 | G3: approve the production database setup; owner account with MFA; tested backup restore [SEC-009] | Release | Owner + Claude | M | C5, C6, A7, A14, A26 |
| A16 | Pilot with 3–5 existing clients, then open My TAB to everyone | Operations | Owner | L | A15 |

## P3 · Later or optional

| ID | Item | Category | Owner | Effort | Blocker |
|---|---|---|---|---|---|
| C14 | Rule-based stage-readiness prompts in TAB Practice (design §5.1) | Portal | Claude | M | None |
| C13 | AI program drafting, templates only, no client data (design §4) | Portal | Claude | M | A24 |
| A24 | Anthropic API account and key for AI program drafting (Vercel Sensitive var `ANTHROPIC_API_KEY`) | Accounts | Owner | S | None |
| C8 | Payload CMS, after Phase 1 [A-02] | Platform | Claude | L | Phase 1 launch |
| C9 | Major upgrades: Next 16, zod 4, TypeScript 7 [UPG-01 to UPG-03] | Platform | Claude | L | None |
| C10 | Correct handoff-document references [DIV-03] | Docs | Claude | S | None |
| C11 | Before paid ads: keep the Meta pixel off `/start` and `/contact` after in-site navigation [GAP-022] | Analytics | Claude | S | Paid ads start |
| C17 | Generate the CSS tokens from the Design Tokens JSON instead of copying them by hand, keeping the contrast check (DS-001, TG-6) | Design | Claude | S | None |
| C12 | Pin Node to `22.x` in `package.json` `engines`; `>=22` lets Vercel move to each new major on its own (builds run on 24 today) | Platform | Claude | S | None |
| A17 | Stripe account, when programs are sold online [D-052] | Accounts | Owner | S | Online sales |
| A18 | Optional: Vercel Protection Bypass secret (automated preview tests); Vercel Firewall rate limit (declined for now) | Accounts | Owner | S | None |
| A21 | Optional: delete the five blank Sensitive `NEXT_PUBLIC_*` variables in Vercel (site URL, indexing, Turnstile site key, Supabase URL and anon key) so they can be re-added as Config when they get values | Accounts | Owner | S | None |

## Notes on sequencing

**A1 gates the launch path.** A2, A3, A4, C1, C2 and C5 all wait on the domain. The name was approved on 2026-10-05, so the domain can be chosen now. Nothing else on this page unblocks as much.

**A7 and A8 don't need the domain.** Legal review with counsel is usually the longest lead time before launch, and the content is yours to write. Both can start now, in parallel with the name approval.

**The pilot's practitioner tools are done.** With C4, a practitioner can invite a client, assign plans, programs, forms and resources, and record progress reviews. What stands between the demo and A16 is plumbing and paperwork, not features: C5 and C6 on my side, A7, A14 and A26 on yours. C14 and C13 are improvements, not pilot needs.

**A15 is the real go-live gate for My TAB.** It needs C5, C6, A7, A14 and A26 together: no production client data until the security gate, backups with a tested restore, and a privacy policy that covers My TAB are all in place (`CLAUDE.md` guardrail 4).

## Recently done

- **Rebrand PR 2** (2026-10-05, in review): public copy rewritten in the Brand Foundation v2 voice (homepage, services, About, Our Story, FAQ, resources, metadata); service summaries, descriptions and lists from Step 13 and BF §11; pillar count derived from the services; `npm run test:brand` in CI blocks retired names, the old philosophy, old service names and wrong pillar counts. Closes C20.

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
