# Backlog and actions

The single list of remaining work. Every PR updates it; after every approved merge Claude posts it to the owner
(`CLAUDE.md`, Branches and review gates). IDs are stable: **A** = owner actions, **C** = Claude's engineering work.
Register IDs in brackets link to `docs/requirements-register.md`.

**Priority:** P0 now (risk or blocks most other work) · P1 public-site launch · P2 My TAB go-live · P3 later or optional.

_Last updated: 2026-09-29, Wellness Plan goals up to 100._

## P0 · Now

| ID | Item | Category | Owner | Unblocks |
|---|---|---|---|---|
| A1 | Register `tabwellnesscollective.com` and `.net` once the name is officially approved (owner, 2026-09-28). Still unregistered at the registry on 2026-09-28 [RSK-007] | Accounts | Owner | A2, A3, C1, C5, launch |


## P1 · Public-site launch

| ID | Item | Category | Owner | Depends on |
|---|---|---|---|---|
| A2 | Resend account and its DNS records. Until then the forms can't send [D-005] | Accounts | Owner | A1 |
| A3 | Turnstile keys: real keys for Production, test keys for Preview [SEC-013] | Accounts | Owner | A1 |
| A4 | Plausible account for the domain (Start funnel counts) [GAP-015, D-057] | Accounts | Owner | A1 |
| A5 | Timely Client Login link [WEB-020] | Content | Owner | |
| A6 | Business facts: address, phone, hours, map link, gift cards link (15 placeholders in `config/site.ts`) [GAP-003, GAP-020] | Content | Owner | |
| A7 | Legal pages with counsel: privacy (Plausible, forms, My TAB), terms, cancellation. Also confirm the duties that remain without HIPAA: breach notification, record retention [GAP-010] | Legal | Owner + counsel | |
| A8 | Content: founder story, bio, photos, the 14 draft service FAQs [GAP-012] | Content | Owner | |
| A9 | Designer fix: horizontal-lockup descriptor legibility (launch-blocking) [DS-006] | Brand | Owner (designer) | |
| A10 | Switch-over access: web host DNS panel, GoDaddy, Google Workspace admin, Search Console [GAP-019] | Accounts | Owner | |
| A11 | Vercel Pro at launch; the Hobby plan doesn't allow business use [RSK-005] | Accounts | Owner | |
| A12 | Confirm the service-area wording "Brighton & Howell, MI" [ASM-006] | Content | Owner | |
| A13 | Set a target launch date; recommended once email sends [GAP-017] | Decision | Owner | A2 |
| C1 | Switch-over runbook (first step: set `portalDemoOnProduction` to false before the custom domain is attached): DNS order that keeps Google Workspace email, legacy email forwarding, redirect checks on the live domain, rollback [§7.4, RSK-009] | Launch | Claude | A1, A10 |
| C2 | Launch day: indexing on, Search Console and sitemap, e2e run against the live domain, HSTS for subdomains after the switch-over [NFR-009] (G3) | Launch | Claude | A1–A11 |

## P2 · My TAB go-live (`CLAUDE.md` guardrail 4)

| ID | Item | Category | Owner | Depends on |
|---|---|---|---|---|
| C3b | Portal security hardening, part 2: internal notes in a private schema behind audited functions, audit drain [SEC-019]; secure session cookies, transactional Stripe webhook [SEC-020] | Security | Claude | |
| C4 | **G1 approved; building in slices. C4a done (#22), C4b done (#23); Wellness Plan goals up to 100 on `claude/zealous-davinci-64dima`; C4c program assignment next.** Design: `docs/design/plans-programs-stages.md`. Admin tools in TAB Practice: typed plans (Wellness Plan + service plans), plan log, assign and personalize programs, Progress Review and stage change (dashboard + email). Also: invite to My TAB, write and edit the plan, progress reviews, assign resources and forms, shared summaries [GAP-023, STAFF-005/006/010, PORTAL-011] | Portal | Claude | |
| C5 | Sign-in plumbing: invite confirmation route, Site URL and redirects, sign-in email through Resend, staff MFA enrolment (staff can't use TAB Practice on Supabase until this exists) [SEC-014, SEC-015] | Portal | Claude | A1, A2 |
| C6 | Tests against a real Supabase stack in CI [SEC-021] | Security | Claude | |
| A14 | Supabase Pro, for daily backups ("later") [SEC-009] | Accounts | Owner | |
| A15 | G3: approve the production database setup; owner account with MFA; tested backup restore [SEC-009] | Release | Owner + Claude | C3–C6, C3b, A7, A14 |
| A16 | Pilot with 3–5 existing clients, then open My TAB to everyone | Operations | Owner | A15 |

## P3 · Later or optional

| ID | Item | Category | Owner |
|---|---|---|---|
| C7 | Program editor with versioning (design §3, G1 pending); any practitioner edits | Portal | Claude |
| C8 | Payload CMS, after Phase 1 [A-02] | Platform | Claude |
| C9 | Major upgrades: Next 16, zod 4, TypeScript 7 [UPG-01 to UPG-03] | Platform | Claude |
| C10 | Correct handoff-document references [DIV-03] | Docs | Claude |
| C13 | AI program drafting, templates only, no client data (design §4) | Portal | Claude |
| C14 | Rule-based stage-readiness prompts in TAB Practice (design §5.1) | Portal | Claude |
| A24 | Anthropic API account and key for AI program drafting (Vercel Sensitive var `ANTHROPIC_API_KEY`) | Accounts | Owner |
| C11 | Before paid ads: keep the Meta pixel off `/start` and `/contact` after in-site navigation [GAP-022] | Analytics | Claude |
| C12 | Pin Node to `22.x` in `package.json` `engines`; `>=22` lets Vercel move to each new major on its own (builds run on 24 today) | Platform | Claude |
| A17 | Stripe account, when programs are sold online [D-052] | Accounts | Owner |
| A18 | Optional: Vercel Protection Bypass secret (automated preview tests); Vercel Firewall rate limit (declined for now) | Accounts | Owner |
| A21 | Optional: delete the five blank Sensitive `NEXT_PUBLIC_*` variables in Vercel (site URL, indexing, Turnstile site key, Supabase URL and anon key) so they can be re-added as Config when they get values | Accounts | Owner |
| A19 | Designer extras: service-icon vectors, print cleanup [DS-006] | Brand | Owner (designer) |

## Recently done

- **#23** (2026-09-29): C4b typed plans (Wellness Plan + service plans), practitioner-only sections, plan log, nutrition gate.
- **#22** (2026-09-29): C4a Progress Reviews and practitioner-confirmed stage changes (dashboard notice, stage email, tamper-proof stage history).
- **Vercel settings** (2026-09-28): staged production for G3 (merges build but don't go live until promoted; A22 closed); Vercel login extended to every URL after `tab-wellness-collective.vercel.app` was found public.
- **#19** (2026-09-28): Demo My TAB and TAB Practice on the production URL, guarded by the launch gate.
- **#18** (2026-09-28): Demo sign-in (client or practitioner), Practitioner login link, sign-out; fonts self-hosted (Google Fonts broke CI).
- **#16** (2026-09-28): Vercel builds fixed (a blank `NEXT_PUBLIC_SITE_URL` broke every deploy); first production deploy ready; `CLAUDE.md` Vercel rules corrected to the owner's personal team. After merge: `NEXT_PUBLIC_SHOW_DRAFTS=true` on Preview; Claude authorized to manage Vercel env vars. A20 (revoke the Vercel token pasted in chat) declined by the owner.
- **#13** (2026-09-28): Portal security hardening, part 1: SEC-015 to SEC-018, the 5 known gaps closed (71 checks, 0 gaps); audit log read-only.
- **#12** (2026-09-28): Client Login fix and Timely booking link; Content Security Policy; sign-in spam protection; banner expiry; rulings recorded (GAP-008 closed, HIPAA does not apply).
