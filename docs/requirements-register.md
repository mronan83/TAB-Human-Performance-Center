# TAB Human Performance Center: Requirements Register

Living register. Every requirement has a stable ID and a source reference. Conflicts, gaps and
assumptions are logged here and never resolved silently. IDs are never reused; retired items are
struck through, not deleted.

**Last updated:** 2026-09-28 · **Intake status:** complete (13 of 13 documents, 3 batches) + vector logo package (batch 4)

> **Governance (D-041).** The owner's *Decision & Risk Register* (IDs `D-###`, `R-###`, `A-##`,
> `X-##`, consolidated in [MDR](source/batch-3/TAB_Wellness_Collective_Master_Decision_Risk_Architecture_Record.md))
> is the system of record for **decisions and risks**. This file is the **requirements and
> traceability layer** beneath it. `DEC-###` rows restate decisions at requirement level and cite the
> governing `D-###`. New decisions or risks raised here are marked *proposed register entry* until
> the owner logs them. Where this file and the MDR disagree, the MDR governs, and the gap is listed in
> §7 until reconciled (R-028, documentation drift).

> **Traceability (owner request 2026-10-02).** Each requirement here traces to the features, code and checks that
> deliver it in [`TRACEABILITY.md`](TRACEABILITY.md), published as the Requirements & Feature Traceability page with its
> companions [`ARCHITECTURE.md`](ARCHITECTURE.md) and [`DATA-MODEL.md`](DATA-MODEL.md). `npm run docs:check` fails CI
> when a requirement is added here but not there, or the reverse.

## Sources

| Code | Document | Covers | Batch | Status in document |
|---|---|---|---|---|
| BF | [Brand Foundation & Positioning Framework](source/batch-1/TAB_Wellness_Collective_Brand_Foundation.md) | Steps 1–10 | 1 | Approved ("working brand foundation") |
| S13 | [Service Pillars & Offering Architecture](source/batch-1/TAB_Wellness_Collective_Service_Pillars_Step_13.md) | Step 13 | 1 | Approved |
| S14 | [The TAB Method & Customer Journey](source/batch-1/TAB_Wellness_Collective_TAB_Method_Customer_Journey_Step_14.md) | Step 14 | 1 | Approved |
| S15 | [Messaging Architecture](source/batch-1/TAB_Wellness_Collective_Messaging_Architecture_Step_15.md) | Step 15 | 1 | Approved |
| S16 | [Website & Digital Experience](source/batch-1/TAB_Wellness_Collective_Website_Digital_Experience_Step_16.md) | Step 16 | 1 | **Recommended** — technology choices need G1 approval |
| S17 | [Naming Validation v2](source/batch-2/TAB_Wellness_Collective_Step_17_Naming_Validation_v2.md) | Step 17 | 2 | **Conditional** — pending trademark counsel and Michigan filing |
| S18 | [Visual Identity](source/batch-2/TAB_Wellness_Collective_Visual_Identity_Step_18.md) | Step 18 | 2 | Approved ("locked"); vector production round still to come |
| S19 | [Rebrand Transition & Launch Plan v2](source/batch-2/TAB_Step19_Rebrand_Transition_Plan_v2.md) | Step 19 | 2 | Approved plan |
| TOK | [Design tokens (JSON)](source/batch-2/TAB_Wellness_Collective_Design_Tokens.json) | Design system | 2 | "canonical", v1.0.0 |
| TOKCSS | [Design tokens (CSS)](source/batch-2/tab-wellness-tokens.css) | Design system | 2 | Companion to TOK (see CON-009) |
| LEG | [tabmassage.com inventory](legacy/tabmassage-inventory.md) | Legacy site | — | Collected by Claude from public sources |
| LOGO | [Vector logo package v1](source/batch-4/vector-logo-package/README.txt) | Logo family SVGs (colour, white, charcoal) | 4 | Installed in `public/brand/`; designer refinements pending |
| REV | [Codebase review 2026-09-28](reviews/2026-09-28-codebase-review.md) | Security, requirements and accessibility review of CODE | — | Findings, fixes, Phase 2 gate, Phase 1 backlog |
| MDR | [Master Decision, Risk & Architecture Record](source/batch-3/TAB_Wellness_Collective_Master_Decision_Risk_Architecture_Record.md) | D-001–D-055, R-001–R-028, X-01–X-13, A-01–A-06 | 3 | **System of record for decisions** (as of 2026-09-27) |
| ARCH | [Technical Architecture v1.0](source/batch-3/ARCHITECTURE.pdf) ([text](source/batch-3/ARCHITECTURE.txt)) | Build architecture | 3 | "Governs the build"; Step 16 stays the strategy source |
| CODE | Existing codebase `tab-wellness-collective` (zip handoff) | Phase 1 site + Phase 2 foundation | 3 | Builds per MDR; not deployed; imported into this repo |

Originals (`.docx`) sit beside each Markdown conversion in `docs/source/batch-N/`; images embedded
in the Word files are extracted under `docs/source/batch-N/assets/`.

**Phase codes** (from S16 §16.9): **P0** validate before build · **P1** public website MVP ·
**P2** My TAB MVP · **P3** integration maturity · **P4** experience expansion.

---

## 1. Decisions already made in the source documents (DEC)

| ID | Decision | Source |
|---|---|---|
| DEC-001 | Brand name **TAB Wellness Collective**; philosophy **Transform. Align. Become.** (conditional, see DEC-013) *(Superseded 2026-10-05: name TAB Human Performance Center, proposed D-063; philosophy Transform. Adapt. Balance., proposed D-064.)* | BF, S17 |
| DEC-002 | Four service pillars with fixed descriptive names: Massage & Bodywork; Personal Strength Training; Women's Wellness Coaching; Holistic Life Coaching. No branded program names yet. *(Superseded 2026-10-05 by proposed D-065: five pillars, Massage & Bodywork, Functional Strength, Women’s Wellness, Integrated Nutrition, Holistic Life Coaching; built in rebrand PR 2.)* | BF §10, S13 |
| DEC-003 | Master brand is gender-neutral; Women's Wellness Coaching is a specialised pillar with targeted messaging. | BF §01 |
| DEC-004 | Homepage H1 "Whole-person wellness, built around you."; primary CTA **Start Where You Are**. | S15 §15.2, §15.7 |
| DEC-005 | Primary tagline is a *working* tagline with four alternatives still in final review. | BF §09 |
| DEC-006 | **Timely** is the scheduling system of record; **Stripe** is the payments system of record. My TAB must not replace either. | S16 §16.1 |
| DEC-007 | Public site shows only Start Where You Are → Transform → Adapt → Balance. The eight-stage journey is internal. *(2026-10-05: Align and Become renamed Adapt and Balance, proposed D-064.)* | S14 §14.2, S16 §16.3 |
| DEC-008 | Mobile-first responsive web app / PWA; native apps only when justified by evidence. | S16 §16.5 |
| DEC-009 | WCAG 2.2 AA is the accessibility baseline for the public site and My TAB. | S16 §16.8 |
| DEC-010 | The platform is designed as a sensitive-data application from day one. | S16 §16.1 |
| DEC-011 | Delivery is phased: public rebrand site first, portal second, without a later replatform. | S16 §16.9 |
| DEC-012 | Journey governance / KPI layer is not required for launch. | S14 §14.0, §14.5 |
| DEC-013 | Proceed with **TAB Wellness Collective** as the working, preferred name — status *conditional* until trademark counsel and the Michigan entity/assumed-name filing are complete. *(Superseded 2026-10-05 by proposed D-063.)* | S17 §17.11 |
| DEC-014 | Naming architecture: official **TAB Wellness Collective**; shorthand **TAB**; **My TAB**, **The TAB Method**, **TAB Wellness Plan**, **TAB Resources**. Never use "TAB Wellness" as public shorthand. Full name in all titles, structured data and listings. *(2026-10-05: official name is now TAB Human Performance Center, proposed D-063; the other names are unchanged.)* *(2026-10-05: the TAB Wellness Plan is renamed **TAB Performance Plan** (owner ruling, A28); TAB Practice keeps its name (A27).)* | S17 §17.6, §17.9 |
| DEC-015 | *(Domain superseded 2026-10-06 by proposed D-066: `www.tabhumanperformance.com`.)* Canonical domain `tabwellnesscollective.com`; `tabmassage.com` retained indefinitely with per-URL 301/308 redirects (no blanket homepage redirect); My TAB stays under the primary domain (`/my-tab` or `my.` subdomain). | S17 §17.7, S19 §19.3 |
| DEC-016 | Visual identity locked: Concept 2 rooted-growth symbol + Concept 3 TAB wordmark; logo family = stacked, horizontal, wordmark-only, symbol badge, reversed. Full lockup at first impression; reduced marks only once the brand is established. | S18 §18.1–18.2 |
| DEC-017 | Design tokens v1.0.0 are canonical: palette, Cormorant Garamond (display) + Manrope (sans), type scale, 4px spacing, radii, shadows, layout, breakpoints, motion. The logo is custom artwork and must not be recreated from the fonts. *(Superseded 2026-10-05 by proposed D-062: TAB Human Performance Center palette and Montserrat + Spectral.)* | TOK |
| DEC-018 | Site header uses the horizontal lockup with Start Where You Are as the primary action; My TAB uses the symbol + simplified lockup with sans-serif-led UI. | S18 §18.10 |
| DEC-019 | Transition phrase "formerly TAB Massage & Fitness" for ~90–180 days where it reduces confusion; never inside the logo or the official business-name field. | S19 §19.1, §19.4 |
| DEC-020 | My TAB need not launch with the rebrand; until it does, use a plain "Client Login" path into Timely. No lingering "coming soon". | S19 §19.14 |
| DEC-021 | Launch runbook and critical smoke tests as specified (Google → site, service → booking, forms, Timely booking and login, Stripe payment link, email confirmation, legacy URL → new URL, social → site, QR codes). | S19 §19.15 |
| DEC-022 | Stripe statement descriptor: `TABWELLNESSCOLL` (not "TAB Wellness"). | S19 §19.6 |

### Recommendations awaiting G1 approval (REC)

| ID | Recommendation | Source |
|---|---|---|
| REC-001 | Next.js / React for public site and My TAB in one application | S16 §16.6 |
| REC-002 | Payload CMS for content, resources and program templates | S16 §16.6 |
| REC-003 | Supabase (Postgres, Auth, RLS, Storage, MFA) for client data and identity | S16 §16.6 |
| REC-004 | Privacy-aware public analytics (Plausible or Matomo; GA4 only if needed) | S16 §16.6, §16.8 |
| REC-005 | Managed hosting rather than self-hosting | S16 §16.6 |
| REC-006 | Timely → My TAB bridge via Zapier (requires Timely Innovate plan) | S16 §16.6 |

---

## 2. Requirements

### 2.1 Public website (WEB)

| ID | Requirement | Source | Phase |
|---|---|---|---|
| WEB-001 | Primary nav: Home, Services, The TAB Method, About, Resources. Persistent actions: Start Where You Are (primary), Book, My TAB. *(2026-09-28: Home item and an "All services" link added; Escape returns focus, menus close on focus-out; full nav from 80rem (1280px at default text size), Menu button below. Header items never wrap; the row keeps ~57px headroom at default text for Safari/Windows rendering, and larger default text switches to the Menu button. `e2e/header.spec.ts` checks 16/20/24px defaults and fails CI if a new nav item eats the headroom)* | S16 §16.2 | P1 |
| WEB-002 | Sitemap and URLs as specified (19 routes: `/`, `/services` + 4 service pages, `/tab-method`, `/about`, `/about/our-story`, `/about/team`, `/resources`, `/resources/articles`, `/resources/guides`, `/events`, `/faq`, `/start`, `/book`, `/contact`, `/my-tab`). | S16 §16.2 | P1 |
| WEB-003 | Homepage follows the approved nine-section sequence: Hero → Core idea → Four pillars → TAB Method → Personalization → Guided conversion → Proof/trust → Resources → Closing invitation. *(2026-10-05: "Four pillars" is now five, proposed D-065; the hero follows the approved board mock-up.)* | S16 §16.3 | P1 |
| WEB-004 | Services landing page headed "Support for how you feel, move, live, and grow." presenting pillars as independently valuable and optionally connected. | S16 §16.2 | P1 |
| WEB-005 | One reusable service-page template (10-part anatomy) with service-specific modules per pillar. | S16 §16.4, S15 §15.6 | P1 |
| WEB-006 | Every service page offers a direct CTA **and** a "not sure?" path to `/start`. | S16 §16.4 | P1 |
| WEB-007 | Related services appear only where the relationship is genuine; no cross-sell carousels. | S16 §16.4, S14 §6 | P1 |
| WEB-008 | TAB Method page with Start Where You Are / Transform / Adapt / Balance sections. *(Renamed 2026-10-05, proposed D-064.)* | S16 §16.2 | P1 |
| WEB-009 | About (core narrative, structure Belief → Client → Method → Differentiation → Ownership → Invitation), Our Story (kept separate), Team. | S15 §15.5, S16 §16.2 | P1 |
| WEB-010 | Resources hub: articles, guides, events/workshops, FAQ. | S16 §16.2, §16.7 | P1 |
| WEB-011 | `/book` offers two paths: "I know what I want" → Timely booking; "Help me find my starting point" → `/start`. | S16 §16.2 | P1 |
| WEB-012 | Footer: Explore, Services, Get Started, TAB links, legal/accessibility (Privacy, Terms, Accessibility, client policies, cancellation policy, service disclaimers), location, hours, contact, social. *(2026-09-28: hours, service area, cancellation-policy and service-disclaimer links added; policies page has #cancellation and #scope sections; account link matches the header)* | S16 §16.2 | P1 |
| WEB-013 | Trust content: testimonials with consent metadata, practitioner credentials, years serving the community, partnerships, reviews only when strong and current, no dramatic before/after claims. | S16 §16.3 | P1 |
| WEB-014 | All public copy follows S15 voice rules and avoid-lists (hype, fitness culture, wellness guilt, "woo", clinical). *(2026-10-05: the voice is Brand Foundation v2 §7; `npm run test:brand` blocks retired names, the old philosophy and wrong pillar counts.)* | S15 §15.8 | P1 |
| WEB-015 | Temporary site-wide announcement bar ("TAB Massage & Fitness is now TAB Human Performance Center…"), editable in the CMS with a start and end date so it cannot linger. | S19 App. B, §19.17 | P1 |
| WEB-016 | Organization structured data uses "TAB Human Performance Center" as the name and "TAB Massage & Fitness" as a former/alternate name during the transition. *(Derived.)* | S17 §17.9, S19 §19.1 | P1 |
| WEB-017 | Our Story tells the evolution from TAB Massage & Fitness (launched December 2008) to TAB Human Performance Center. | S15 §15.5, S17 §17.12 | P1 |
| WEB-018 | Service icons act as light navigational differentiators on service cards and pages (artwork subject to CON-006). | S18 §18.7 | P1 |
| WEB-019 | Icon set from the symbol: favicon 16/32, Apple touch icon, PWA icons (192/512 + maskable), social avatar 1080, OG/share images. Light and dark variants. | S18 §18.8, DEC-008 | P1 |
| WEB-020 | "Client Login" in the header routes to Timely Client Login until My TAB launches; it becomes "My TAB" at P2. *(2026-09-28: it fell back to /contact because no Timely link was configured, which the owner reported as broken. The booking link `bookings.gettimely.com/tabmassageandfitness/book` was taken from the legacy site's Timely embed; Client Login now opens it until the dedicated Client Login link is supplied, and never opens /contact. 2026-10-06, owner ruling: "The client login CTA button needs to be hidden until the client portal is live. The book now CTA button fulfills the link to the booking site." The header and footer show no account link until the client portal is open (owner Settings → Live, within guardrail 4), then "My TAB". The interim /my-tab page still links to Timely for old bookmarks.)* | S19 §19.14 | P1 |

### 2.2 Start Where You Are / Get Started (GS)

| ID | Requirement | Source | Phase |
|---|---|---|---|
| GS-001 | Guided entry form at `/start` with the S14 §14.4.1 fields: name, email, phone, preferred contact method, "What brings you to TAB?", "What would you most like help with?" (14 options, multi-select), service interest (4 pillars + "not sure"), "If things improved…", immediate considerations. | S14 §14.4.1, S16 §16.2 | P1 |
| GS-002 | Capture "How did you find TAB?". | S14 §14.3 Connect | P1 |
| GS-003 | Short and progressively disclosed; the confirmation explains what happens next. | S16 §16.8 | P1 |
| GS-004 | Every submission ends with exactly one next step: direct booking, discovery conversation, service-specific intake, more information, or outside referral. | S14 §14.3, §14.4.1 | P1 |
| GS-005 | Staff can review submissions and record the routing outcome. *(Derived from GS-004: needs a minimal staff view in P1.)* | Derived | P1 |
| GS-006 | Discovery is never a mandatory gate; clients with straightforward needs can book immediately. | S14 §2, S16 §16.8 | P1 |

**Implementation status (2026-09-28):** GS-001 met, with every S14 §14.4.1 question answered from options we
define (owner ruling, *proposed D-059*; see §7.1). The open questions ("What brings you to TAB?", "If things
improved…", immediate considerations) become multi-select lists, and a "something health-related to discuss
privately" flag keeps the safety screen without details. GS-002 met ("How did you find TAB?", S14 §14.2 channels). GS-003 met (practical details
collapsed by default; the confirmation lists the five routing outcomes). GS-006 met ("Book directly" beside the
form). GS-004 and GS-005 met in code (DIV-05): TAB Practice → Submissions records one next step per Start
submission, stamped with who and when; it goes live when submission storage switches on (see DIV-05).

### 2.3 My TAB client portal (PORTAL)

| ID | Requirement | Source | Phase |
|---|---|---|---|
| PORTAL-001 | Secure login with strong authentication / MFA available to clients. | S16 §16.5, §16.6 | P2 |
| PORTAL-002 | Home dashboard: welcome + current focus, next appointment, TAB Method stage indicator (lightweight, not gamified), plan summary, current program / next activity, next review, assigned resources, quick actions. | S16 §16.5 | P2 |
| PORTAL-003 | My Plan shows the TAB Wellness Plan (S14 §14.4.4 fields), framed as "the plan we created together". *(Renamed TAB Performance Plan, 2026-10-05.)* | S14 §14.4.4, S16 §16.5 | P2 |
| PORTAL-004 | My Programs: assigned activities (exercise, habit, worksheet, reflection, video, reading, check-in) with client responses and practitioner feedback. | S16 §16.5 | P2 |
| PORTAL-005 | My Progress: original and current goal, progress reviews, milestones, qualitative wins, optional measures, reflections. Must not become a scoreboard. | S16 §16.5 | P2 |
| PORTAL-006 | My Appointments links / deep-links to Timely Client Login; no rebuilt scheduling at launch. | S16 §16.5 | P2 |
| PORTAL-007 | My Resources: assigned resources plus the wider library. | S16 §16.5 | P2 |
| PORTAL-008 | Forms & Documents: profile, intakes, consents, check-ins, uploads, shared documents. | S16 §16.1, §16.5 | P2 |
| PORTAL-009 | Billing & Membership launches the Stripe customer portal; optional safe summary (membership, renewal, package balance). | S16 §16.5 | P2 |
| PORTAL-010 | My Profile: contact, preferences, accessibility needs, goals, client-controlled context. | S16 §16.5 | P2 |
| PORTAL-011 | Shared session summaries / next steps, explicitly marked "shared with client". Raw notes are never shown by default. | S16 §16.5 | P2 |
| PORTAL-012 | Notifications only for meaningful actions; no sensitive content in email/SMS previews; client chooses channel where practical. | S16 §16.5 | P2 |

### 2.4 Practitioner & operations workspace (STAFF)

| ID | Requirement | Source | Phase |
|---|---|---|---|
| STAFF-001 | Shared client record in three layers: Client Profile, Service Record, TAB Journey. | S14 §14.3 | P2 |
| STAFF-002 | TAB Client Profile (S14 §14.4.2), including internal "current TAB relationship" fields. | S14 §14.4.2 | P2 |
| STAFF-003 | Service-specific intakes for all four pillars with field-level specs from S14 §14.4.3, each with consent / scope acknowledgement. (See CON-002.) *(2026-10-05: five pillars, adding Integrated Nutrition, proposed D-065.)* | S14 §14.4.3 | P2 |
| STAFF-004 | Session documentation pattern: Current status → Intervention/experience → Client response → Next step. Internal notes are separate from shared summaries. | S14 §14.3, S16 §16.5 | P2 |
| STAFF-005 | Author the Wellness Plan together with the client. *(Now the Performance Plan, 2026-10-05.)* | S14 §14.4.4 | P2 |
| STAFF-006 | Capture progress reviews (S14 §14.4.5) including the "does the approach still fit?" decision. | S14 §14.4.5 | P2 |
| STAFF-007 | Cross-service referral / handoff with the four-box summary (Context, Goal, Progress, Next), recorded client consent, and receiving-practitioner actions. | S14 §14.4.6 | P2 |
| STAFF-008 | Record the continuation outcome: Continue / Maintain / Independent / Shift / Pause / Return. | S14 §14.4.7 | P2 |
| STAFF-009 | Author program templates and assign / personalise them per client. | S16 §16.5 | P2 |
| STAFF-010 | Assign resources to clients or programs. | S16 §16.7 | P2 |

### 2.5 Content & CMS (CMS)

| ID | Requirement | Source | Phase |
|---|---|---|---|
| CMS-001 | Content types: Service, Practitioner, Article, Guide, Video/media, FAQ, Workshop/Event, Program template, Program module/activity template, reusable CTA block, Testimonial (with consent metadata). | S16 §16.7 | P1 (program types P2) |
| CMS-002 | Taxonomy: service pillar, TAB Method stage, client goal/need, life stage, format, audience access (public / client-only / program-assigned / practitioner-only). | S16 §16.7 | P1 |
| CMS-003 | One canonical resource can be published publicly and assigned in My TAB; assignments reference it, never copy it. | S16 §16.7 | P2 |
| CMS-004 | Governance fields and workflow: owner, scope review, accessibility review, published date, next review date. | S16 §16.7 | P1 |
| CMS-005 | Taglines, headlines and CTA labels are editable content, not hard-coded (the tagline and name are not final). | Derived from DEC-005, CON-004 | P1 |

### 2.6 Integrations (INT)

| ID | Requirement | Source | Phase |
|---|---|---|---|
| INT-001 | Timely booking link/widget and Client Login links from the site and My TAB. | S16 §16.6 | P1 |
| INT-002 | Internal client UUID is the identity; Timely, Stripe and portal IDs are mapped fields. Email is never the permanent key. | S16 §16.6 | P2 |
| INT-003 | Stripe customer-portal sessions created server-side; store only Stripe IDs and safe status; never card data. | S16 §16.6 | P2 |
| INT-004 | Stripe webhooks update membership / package state. | S16 §16.6 | P3 |
| INT-005 | Timely → My TAB sync of supported fields via Zapier; Timely stays the appointment authority; no two-way calendar logic. | S16 §16.6 | P3 |
| INT-006 | Reconcile duplicate clients before any sync; establish external IDs only after confident matching. | S16 §16.6 | P3 |

### 2.7 Security & privacy (SEC)

| ID | Requirement | Source | Phase |
|---|---|---|---|
| SEC-001 | Role-based access: Client, Practitioner, Supervisor (if applicable), Front desk/Operations, Owner/Administrator, per the S16 §16.5 access principles. | S16 §16.5 | P2 |
| SEC-002 | Row-level / object-level authorisation: clients see only their own data; practitioners see only assigned or explicitly shared clients. | S16 §16.6 | P1+ |
| SEC-003 | MFA mandatory for all staff. | S16 §16.1, §16.6 | P1+ |
| SEC-004 | Encryption in transit and at rest; secrets and service keys server-side only. | S16 §16.1 | P1 |
| SEC-005 | Audit log of sensitive record reads/changes and administrative actions. | S16 §16.1, §16.6 | P2 |
| SEC-006 | No sensitive data in client-side logs, analytics events, URLs, email subjects or SMS previews. | S16 §16.6 | P1 |
| SEC-007 | Secure uploads/downloads (short-lived signed URLs); malware scanning if uploads are accepted. | S16 §16.6 | P2 |
| SEC-008 | Separate dev / test / prod environments; synthetic data only outside production. | S16 §16.6 | P1 |
| SEC-009 | Retention, deletion, backup and recovery policies defined **and restore tested** before launch. | S16 §16.1, §16.6 | P1 |
| SEC-010 | Consent records: purpose, version, accepted date, sharing flags, withdrawal. | S14 §14.3, S16 App. A | P2 |
| SEC-011 | Dependency patching, vulnerability scanning, incident-response contact and playbook. | S16 §16.6 | P1 |
| SEC-012 | Owner/admin access to sensitive data is role-limited and audited, not automatically universal. | S16 §16.5 | P2 |
| SEC-013 | Public forms have bot protection and a shared rate limit (Turnstile, Vercel BotID or WAF); a nonce-based Content-Security-Policy with `frame-ancestors 'none'` is in place. *(2026-09-28, owner request to harden the forms: built in `lib/spam.ts`: same-origin check, body cap, per-IP and per-address limits, off-screen honeypot, minimum fill time, duplicate suppression, link screening on the contact message (markup dropped, plain links flagged, no submitter copy), and Cloudflare Turnstile (free, invisible for most people; *proposed register entry* for the vendor). Open: Turnstile keys (owner, free account). A shared edge rate limit (Vercel Firewall) was declined by the owner for now, 2026-09-28; it stays optional on the launch checklist. **2026-09-28, launch slice 3:** CSP built (`lib/csp.ts`, set in `middleware.ts`): My TAB and TAB Practice get a per-request nonce with `'strict-dynamic'`; every page gets `frame-ancestors 'none'`, `object-src 'none'`, `base-uri 'self'` and allow-listed `connect-src`, `frame-src` and `form-action`; `X-Frame-Options: DENY` and `Cross-Origin-Opener-Policy: same-origin`. *Proposed register entry:* public pages keep a fixed policy that allows inline scripts from this site instead of a nonce, because a nonce would make all ~30 prebuilt pages render per request, and those pages show no user-supplied content. The My TAB sign-in form now has the honeypot, per-IP and per-address limits and Turnstile. `e2e/security.spec.ts` fails CI on any policy violation.)* | Review 2026-09-28 | P1 launch |
| SEC-014 | No public self-signup: accounts are created by owner invite, and a client record links only after the email is confirmed. *(2026-09-28: confirm-time linking built and tested; public sign-up switched off by the owner and verified through the Management API (`disable_signup = true`). The invite flow itself is not built yet: GAP-023.)* | Review 2026-09-28 §2 | P2 gate |
| SEC-015 | Staff MFA enforced (`aal2`) in RLS staff branches and `requireStaff`; users cannot clear their own MFA requirement. *(2026-09-28, C3: enforced in the database — a staff role counts only in an aal2 session, `current_app_role()` — and in `requireStaff` (staff without two-step verification are sent to sign-in); people can no longer clear `mfa_required`. Open: the MFA enrolment screen, backlog C5. 2026-10-06, C23: enrolment and verification screens built at `/practice/verify`. 2026-10-06, proposed D-068: a passkey can be the second step; the authenticator app stays as the backup.)* | Review 2026-09-28 §2, D-042 | P2 gate |
| SEC-016 | Client writes limited to explicitly allowed columns; consents insert-only and server-stamped; submissions only against assigned forms; same-client foreign keys enforced. *(2026-09-28, C3: done — allow-listed client columns on clients, profiles, resource assignments, referrals and check-ins; consents are an insert-only, server-stamped history; submissions only against assigned forms, server-stamped submit time, reviews stamped with who and when; same-client checks on linked records.)* | Review 2026-09-28 §2 | P2 gate |
| SEC-017 | Program content and cohort meeting links readable only when published and entitled (staff, enrolment or entitlement). *(2026-09-28, C3: done — program modules and activities readable by staff, or by clients enrolled in, entitled to or in a cohort for a published program; cohort meeting links moved to `cohort_meetings`, readable by staff and members only.)* | Review 2026-09-28 §2, D-044 | P2 gate |
| SEC-018 | Practitioner access confined to the care team; identity/billing links owner-only; authorship pinned to the signed-in user; deactivated practitioners lose access. *(2026-09-28, C3: done — practitioners read staff profiles and their own clients' only; account and billing links owner-only; authorship stamped from the signed-in user; cohort membership limited to own clients; deactivated practitioners lose access.)* | Review 2026-09-28 §2, D-045 | P2 gate |
| SEC-019 | Internal notes in a non-exposed schema behind audited functions; audit coverage for roles, all client tables and storage; audit table append-only and drained off-platform. *(2026-09-28, C3 in part: TRUNCATE revoked on every table and the audit log read-only for signed-in users; audit triggers added for profiles, practitioners, form assignments and cohorts. 2026-10-03, C3b: internal notes and practitioner-only plan details in the `private` schema behind audited functions; audit log append-only; nightly encrypted export to the `audit-archive` branch, running once A26 adds its secrets.)* | Review 2026-09-28 §2, A-05 | P2 gate |
| SEC-020 | `httpOnly`/`secure` time-boxed session cookies; Stripe webhook is transactional, fails loudly and handles payment status, past-due and partial refunds. *(2026-10-03, C3b: done. Seven-day cookies (sliding, so idle sessions end after 7 days); staff sessions also end 30 days after sign-in (proposed D-068, `middleware.ts`); `apply_stripe_event()`; owner ruling: a partial refund keeps access and is flagged for the owner.)* | Review 2026-09-28 §2, D-052 | P2 gate |
| SEC-021 | Supabase-native test suite (`supabase start` + pgTAP) in CI covering JWT/AAL/signup/grants; no PUBLIC execute on helpers; storage size/MIME limits. | Review 2026-09-28 §2, R-026 | P2 gate |

### 2.8 Accessibility, SEO, analytics (NFR)

| ID | Requirement | Source | Phase |
|---|---|---|---|
| NFR-001 | WCAG 2.2 AA: keyboard access, visible focus, contrast, no colour-only state, semantic landmarks, labelled forms with error recovery, alt text, captions, touch targets, zoom/reflow, reduced motion, accessible downloads. *(2026-09-28: heading order fixed on /services, /tab-method and service pages; decorative artwork and photo placeholders hidden from screen readers; stats read once; portal skip link; accessibility page links the email address)* | S16 §16.8 | P1 |
| NFR-002 | Technical SEO: XML sitemap, robots.txt, canonicals, Core Web Vitals, image optimisation, HTTPS, clean 404, redirect monitoring. *(2026-09-28: canonical URL and Open Graph/Twitter tags on every public page; branded 404 for any unknown URL, with header and footer)* | S16 §16.8 | P1 |
| NFR-003 | Page metadata pattern: title `[Service] in [Location] \| TAB Human Performance Center`, human meta descriptions, outcome-led H1; Organization / LocalBusiness / Service structured data; FAQ markup only where visible. *(2026-09-28: titles are "[Service] | TAB Human Performance Center": the owner removed the location from titles on 2026-09-28, overriding the S16 pattern; the location stays in descriptions and structured data (ASM-006); hand-written meta descriptions; Service and BreadcrumbList JSON-LD; FAQ markup only for non-draft answers)* | S16 §16.4, §16.8 | P1 |
| NFR-004 | Redirect map from legacy tabmassage.com URLs completed before launch. | S16 §16.8, §16.9 | P0/P1 |
| NFR-005 | Privacy-aware public analytics; portal analytics kept separate; no sensitive data in event names or properties. | S16 §16.8 | P1 |
| NFR-006 | Public events: `start_where_you_are_open/submit`, `service_view`, `book_click`, `timely_booking_outbound`, `my_tab_login_click`, `method_view`, `resource_view/download`, `contact_submit/consultation_request`. *(DIV-04, owner ruling 2026-09-28: `/start` is counted in Plausible as page view → `Start Form: Started` (first interaction) → `Start Form: Submitted` (accepted by the server), with no event properties; `/contact` stays untracked.)* | S16 §16.8 | P1 |
| NFR-007 | The S19 §19.15 critical smoke tests are automated as end-to-end tests and run against every preview and against production after cutover. *(2026-09-28: automated in `e2e/` with Playwright and run in CI against the production build: homepage → service → booking, account link, both forms (mocked delivery), inquiry API refusals, 404, header keyboard. Running against Vercel previews needs a Protection Bypass for Automation secret (owner action). Stripe, Timely and email-confirmation checks stay manual at cutover)* | S19 §19.15 | P1 |
| NFR-008 | Redirects are server-side 301/308, per URL, with no chains or loops; the full map is tested automatically before launch and monitored afterwards. *(2026-09-28: `e2e/redirects.spec.ts` checks all 64 mapped paths, with and without a trailing slash, the prefix rules, the legacy host and direct targets. It found a redirect loop on any URL ending in "/" (all WordPress-style legacy links); fixed in middleware)* | S19 §19.3 | P1 |
| NFR-009 | Pre-production and preview deployments are `noindex` and not publicly discoverable; noindex is removed only on the production domain at launch. | S19 §19.3 | P1 |
| NFR-010 | 30-day post-launch monitoring: 404s and redirect failures, form submissions, booking-link behaviour, with alerts. | S19 §19.16 | P1 |

### 2.9 Design system (DS)

| ID | Requirement | Source | Phase |
|---|---|---|---|
| DS-001 | TOK JSON is the single source of truth; CSS variables and the styling theme are generated from it, never hand-copied. | TOK, CON-009 | P1 |
| DS-002 | Montserrat for headings, body, navigation, UI, forms and portal text; Spectral for editorial accents (subheads, pull quotes). Both self-hosted (no third-party font requests). *(2026-10-05 rebrand, proposed D-062: replaces Cormorant Garamond + Manrope.)* | S18-HPC §18.4 | P1 |
| DS-003 | Letterspaced uppercase `label` style used sparingly for eyebrows, navigation labels and section markers. | TOK, S18 §18.5 | P1 |
| DS-004 | Primary button = Deep Olive pill; secondary button = Clay Dark pill; Clay, Sage and Ochre are decorative accents only, used "selectively for energy". *(2026-10-05 rebrand, proposed D-062.)* | S18-HPC §18.3, §18.7 | P1 |
| DS-005 | Every text/background and UI-boundary pairing in use meets WCAG 2.2 AA (see CON-011); an automated contrast check runs in CI against the token set. | DEC-009 | P1 |
| DS-006 | Production logo files (SVG) for every lockup, in light and reversed versions, plus a simplified small-size symbol for 16–32px. *(2026-10-05: met by the approved redraw of the TAB Human Performance Center board: horizontal, stacked and symbol in colour, graphite, white and sheen; app icons; favicon set; five service icons. Proposed D-061.)* | S18-HPC §18.2 | P1 |
| DS-007 | Imagery: real people and environments, natural light, warm tones; no before/after, hyper-posed fitness or sterile clinical imagery. *(2026-10-06: the batch-5 stock image library (30 Pexels images) is installed; see `content/images.ts` for each image's placement or reason for reserve.)* | S18 §18.6 | P1 |

---

## 3. Conflicts (CON)

| ID | Conflict | Impact | Recommendation | Status |
|---|---|---|---|---|
| CON-001 | Sitemap nests Events and FAQ under Resources, but the URL table puts them at `/events` and `/faq`. | Low | Keep short top-level URLs; show them under Resources in navigation. | Proposed |
| CON-002 | S16 keeps Timely Consult for "booking-coupled" forms, while S14 defines all four service intakes (health history, medications, contraindications) as TAB artifacts and the My TAB MVP includes intakes. It is unclear where the massage intake lives. | **High**: this decides where health data is stored. | Decide at G1 with the owner. | Open |
| CON-003 | Raw practitioner notes live in My TAB only "if moved there" (S16 §16.6). Where notes live today, and whether they move, is undecided. | **High**: this is the largest sensitive dataset and drives migration scope. | Decide at G1 with the owner. | Open |
| CON-004 | The brand documents treat the name as settled, but S16 Phase 0 requires Step 17 naming validation before committing to domains and marks. | Medium | S17 now gives a *conditional* go (DEC-013) and says to secure the domain immediately. Build with the name as configuration; buy the domain now (RSK-007); hold Google Business Profile and signage until counsel clears it. | Partly resolved |
| CON-005 | S14's core principle is "one connected TAB relationship", but the MVP needs two logins (My TAB plus Timely Client Login). | Medium (experience) | Accept for MVP and record it as known experience debt; revisit in P3. | Proposed |
| CON-006 | The BF avoid-list names **lotus flowers, dumbbells and massage hands**, but three of the four S18 service icons are hands (Massage), a dumbbell (Strength; the S18 text says "barbell") and a lotus (Women's Wellness). BF also says creative work must "express the brand foundation—not redefine it." | Medium (brand coherence; icons are swappable assets, so the build is not blocked) | Owner decides: accept S18 as a deliberate override, or redraw three icons within BF guardrails during the vector production round. | **Resolved**: D-047 amends the avoid list; owner 2026-09-28: "move forward with the logo and icons". |
| CON-007 | S17 and S19 say trademark clearance must precede Step 18 and any irreversible spend, but S18 is already "locked". Clearance status is unknown. | Medium | Website work is reversible and can proceed. Domain purchase is cheap and S17 says do it now. Signage, Google Business Profile rename and trademark filing wait for counsel. | **Resolved**: D-048 (identity proceeds in parallel with clearance); owner 2026-09-28: build now, clearance tabled. |
| CON-008 | Redirect examples in S17/S19 use paths that don't exist (`/massage-therapy`, `/personal-training`, `/massage`). The real legacy paths are `/massage_therapy/`, `/personal_training/`, `/about-us/`, `/contact-us/`, `/appointments/`. | Low | Build the map from the real inventory (LEG), not the examples. | Resolved by LEG |
| CON-009 | TOK (JSON, "canonical") and TOKCSS disagree on heading styles: h1 line-height 1.15 vs 1.08; h2 1.15 / −0.02em vs 1.12 / −0.015em; h3 1.15 vs 1.2. TOKCSS adds responsive `clamp()` sizes that TOK lacks; TOK has h4/bodyLG/bodySM and breakpoints that TOKCSS lacks. | Low | TOK wins per its own metadata; adopt TOKCSS's `clamp()` responsive sizing as an addition. Design owner to confirm. | Proposed |
| CON-010 | S18 says Sand and Linen are the main background fields; TOK sets page background = Cream and surfaces = White. | Low | Follow TOK (later and canonical); use Sand/Linen for section bands. | Proposed |
| CON-011 | **The canonical palette breaks DEC-009 (WCAG 2.2 AA) in 12 of 33 pairings tested:** input borders 1.55–1.69:1 (need 3:1); `borderStrong` 2.45–2.66:1; terracotta text on cream 3.20:1; white on terracotta 3.48:1; white on sage 2.75:1; sage on cream 2.53:1; terracotta-deep links on cream 4.42:1; muted text on linen 4.07:1; warning text on cream 4.31:1; terracotta-deep focus ring on olive sections 1.36:1. Body text, primary/secondary buttons, error and success text all pass. | **High**: every form field fails today | Near-invisible adjustments: add `borderInput #8D8375` (3.4–3.7:1); keep terracotta and sage decorative (no text, no white-on); links in olive (6.04:1) or terracotta-deep nudged to `#A65E39` (4.51:1); `textSecondary → #575B53`; `warning → #96672E`; focus ring switches to cream on olive/dark sections (6.04:1). Brand owner approves because the tokens are canonical. | **Resolved**: owner approved the proposed fixes 2026-09-28 (proposed register entry D-056, amends D-053). |
## 4. Gaps and open questions (GAP)

"Batch?" means a later document batch may answer it.

| ID | Gap | Needed by | Batch? |
|---|---|---|---|
| GAP-001 | ~~Visual identity~~ → answered by S18 + TOK. **Remaining:** production SVG logo files for every lockup, a simplified small-size symbol, and vector service icons (DS-006). Current assets are painterly raster working files. | P1 launch | Owner / designer |
| GAP-002 | ~~Step 17 outcome~~ → conditional go (DEC-013). **Remaining:** trademark counsel opinion, Michigan filing, domain registration, social handle reservation. | P1 launch | Owner + counsel |
| GAP-003 | Location: Michigan (S17). *(Closed 2026-10-06: 7487 Grand River Ave, Brighton, MI 48114; (810) 844-1283; hours Mon–Tue 10–4, Wed 11–6, Fri 9–4, Thu and weekends closed; one location.)* | P1 | Owner |
| GAP-004 | Team roster: practitioners, services each provides, credentials, bios, photos. | P1 | Maybe |
| GAP-005 | Legacy inventory: **public part done** (LEG: 36 pages, 28 posts, hosting, DNS, email). **Remaining:** Search Console, analytics, backlinks, category/tag archives. The live site is WordPress on shared hosting, so the old Vercel project `tab-wellness-collective` is *not* the live site — is anything in it worth reusing? | P1 launch | Owner |
| GAP-006 | Timely plan (Innovate?), current booking URLs, whether Timely Consult forms are in use. | P1 | Owner |
| GAP-007 | Stripe products in use (POS, Checkout, Billing, subscriptions, portal). Does Timely also take payments (double-charge risk)? | P2 | Owner |
| GAP-008 | Legal determination of HIPAA / state health-privacy obligations, and which vendors (Timely, email/SMS, hosting) need signed agreements (BAAs). *(Closed 2026-09-28: owner ruling "HIPAA does not apply here"; see §7.1, proposed D-060.)* | P2 schema; P1 privacy policy | Owner + counsel |
| GAP-009 | Staff roles and which records each role needs. | P2 | Maybe |
| GAP-010 | Policy content: privacy, terms, accessibility statement, cancellation policy, service disclaimers. | P1 launch | Owner |
| GAP-011 | Offer details: pricing display, session lengths, virtual vs in-person coaching, gift cards, memberships/packages. | P1 | Maybe |
| GAP-012 | Launch content: testimonials (with consent), initial articles/guides, photography. | P1 launch | Owner |
| GAP-013 | Transactional email / SMS provider for notifications and Get Started alerts. | P1 | Engineering proposal |
| GAP-014 | Named product owner and content owners (S16 §16.9 ownership table). | P1 | Owner |
| GAP-015 | Analytics tool: Plausible vs Matomo vs GA4. | P1 | Engineering proposal |
| GAP-016 | Where client records and session notes live today (Timely, paper, other) and what, if anything, migrates. | P2 | Owner |
| GAP-017 | Target launch date. S19 plans relative to T-8 weeks but sets no date. *(Closed 2026-10-06: public launch 1 November 2026, owner.)* | Planning | Owner |
| GAP-018 | Legacy offerings outside the four pillars: yoga, nutrition, sports injury rehab, small-group training / LifeQuest, chair/corporate massage, cupping, youth programs, remote training. Which continue? This drives redirect destinations and service-page content. *(2026-10-05: nutrition is now a pillar, Integrated Nutrition, proposed D-065; `/nutrition` redirects to its page.)* | P1 | Owner |
| GAP-019 | Access for cutover: host DNS panel for tabmassage.com (nameservers at `SUPERCP.COM`), GoDaddy registrar, Google Workspace admin (to add the new domain and aliases), Search Console. | P1 launch | Owner |
| GAP-020 | Gift cards: the legacy site sells them. Will they continue, and through what (Timely vouchers, Stripe, other)? S16 lists "Gift Cards if offered". | P1 | Owner |
| GAP-021 | URLs for the legal pages are not defined in S16. Proposed: `/privacy`, `/terms`, `/accessibility`, `/policies/cancellation`. | P1 | Engineering proposal |
| GAP-022 | When paid ads start (D-015), a Meta pixel loaded on a public page stays resident after client-side navigation to `/start` or `/contact`, where its automatic events and automatic advanced matching could read form fields. | Before the pixel is switched on: force a full page load into pixel-free paths (or disable `autoConfig` and automatic advanced matching) and verify with a browser test. Blocks D-015 activation, not launch. |
| GAP-023 | My TAB accounts are invite-only (SEC-014), but no invite path is built: no "Invite to My TAB" action in TAB Practice, and no automatic invite when someone buys a program, cohort or membership (D-052), which online growth needs (D-043). Supabase's Site URL is still `http://localhost:3000`, the redirect allow list is empty, and the default invite email needs a token-hash confirm route to work with server-side sign-in. | Build the invite action and confirm route with My TAB (Phase 2); the Stripe webhook sends the invite automatically; set the Site URL and redirect list when the domain is live. **Partly done (C4, 2026-10-02):** "Invite to My TAB" on the client page in TAB Practice (care team only, stamped in the database, first sign-in recorded). The confirm route, invite email wording and Site URL remain with C5; the automatic invite on purchase stays with the Stripe work. |

## 5. Assumptions (ASM)

| ID | Assumption | Confirm by |
|---|---|---|
| ASM-001 | One brand site on one domain; name held in configuration until Step 17 closes. | G1 |
| ASM-002 | Vercel (app) and Supabase (data) are the managed platforms, consistent with S16's managed-hosting recommendation. | G1 |
| ASM-003 | English only at launch. | G1 |
| ASM-004 | Single physical location in Michigan (state confirmed by S17; site count unconfirmed, see GAP-003). | G1 |
| ASM-005 | Until vector logos exist (DS-006), high-resolution raster exports of the S18 artwork can serve development and previews, but not the production launch. | G1 |
| ASM-006 | Descriptions name the service area "Brighton and Howell, MI"; titles carry no location (owner ruling 2026-09-28). *2026-10-06 (A12): the visible wording is "Serving Livingston County" (footer, emails), and structured data names Livingston County, MI plus both towns. The studio address is 7487 Grand River Ave, Brighton.* `config/site.ts → location`. | Confirmed by the owner, 2026-10-06 |

## 6. Engineering risks and recommendations (RSK)

Raised by Claude as principal engineer; each is resolved at G1 or on the named trigger.

| ID | Risk | Recommendation |
|---|---|---|
| RSK-001 | Phase 1 already collects health information: the Get Started form's free-text fields ("What brings you to TAB?", "anything we should know") will receive details like surgery, pregnancy or cancer history. | Treat P1 as a sensitive-data release. Store submissions in Supabase behind RLS; staff alert emails carry no content, only a link to a secure view. No third-party form SaaS and no emailing form contents. |
| RSK-002 | The practitioner workspace is listed last in the P2 MVP but is its critical path: plans, programs, summaries and reviews only exist if practitioners create them. | Sequence P2 staff-first; validate practitioner workflows before client screens. |
| RSK-003 | The programs engine (templates → modules → activities → assignments → responses → feedback) is the heaviest P2 component, and adoption depends on practitioners authoring content. | Split P2: P2a = profile, plan, shared summaries, resources, check-ins; P2b = programs engine after authoring demand is confirmed. |
| RSK-004 | Payload + Supabase means two auth systems and a privileged database connection that bypasses RLS. | One Supabase Postgres. Payload in its own schema, with a DB role that has no grants on client-data tables. Payload auth for content editors only; clients and practitioners on Supabase Auth with MFA. |
| RSK-005 | Current plans (Supabase Free, Vercel Hobby) cannot hold real client data: Free has no backups (breaks SEC-009) and Hobby is non-commercial. | Upgrade both before the first real submission reaches production (a G3 prerequisite). |
| RSK-006 | The legal determination (GAP-008) changes vendor choices and data design. | P1 can proceed on the RSK-001 controls; the P2 schema is gated on GAP-008. *(Resolved 2026-09-28: HIPAA does not apply, owner ruling; the P2 schema is no longer gated on a HIPAA decision.)* |
| RSK-007 | *(Closed 2026-10-06: the new name's domains are registered, proposed D-066.)* `tabwellnesscollective.com` (and `.net`) were **unregistered** on 2026-09-28. Anyone can take them, and losing the exact-match domain is irreversible. | Register now (roughly $10–25 a year); S17 §17.7 already calls for this. Registering doesn't commit to the name legally. Turn on auto-renew and registrar lock. |
| RSK-008 | The legacy site runs WordPress 5.2 (2019) on PHP 7.4 (end-of-life since Nov 2022) with 2017-era slider plugins, and stays live until cutover. Unpatched WordPress is a common small-business breach path. | Outside this build's scope, but the owner should have the host update or lock it down now, or treat the cutover date as the fix. |
| RSK-009 | The cutover DNS change could break email and verification. tabmassage.com mail is Google Workspace, DNS lives at the web host, and there's a Google verification TXT record. | Change only the web records (apex/`www`) to Vercel; copy MX, TXT (SPF/DKIM/verification) exactly if the zone moves; export the zone before any change. Step in the runbook. |
| RSK-010 | The S18 logo artwork is raster with painterly texture. It won't reduce cleanly to 16px favicons or a crisp SVG header. | Commission the vector production round S18 §18.11 anticipates before the P1 launch; develop against raster placeholders (ASM-005). |
| RSK-011 | Emailing the submitter a copy (DIV-05): a mistyped address sends the copy to a stranger, and anyone can make TAB email any address. | **Largely mitigated (proposed D-059):** Start copies hold only option labels and a letters-only name; contact copies confirm receipt and the topic but never repeat the typed message, so the form can't relay text to another address. Also in place: neutral subject, "if you didn't send this" line, three copies per address per day. Residual: the contact message itself still reaches TAB's inbox (R-027, "no medical details" note). SEC-013 bot protection stays launch-blocking. |

---

## 7. Reconciliation with the master record, and owner rulings (2026-09-28)

### 7.1 Owner rulings on batch 1–2 findings

| Item | Ruling | Effect |
|---|---|---|
| CON-011 token contrast fixes | Approved | Implement `borderInput #8D8375`; terracotta and sage decorative only; links olive or `#A65E39`; `textSecondary #575B53`; `warning #96672E`; cream focus ring on dark sections. *Proposed D-056 (amends D-053).* |
| CON-006 service icons | Proceed with S18 logo and icons | Matches D-047. |
| DS-006 / RSK-010 vector logos | Owner will supply SVG/vector files shortly | Build with current PNGs (ASM-005); swap when received. Matches D-027. |
| RSK-008 legacy WordPress | Accepted; legacy site sunsets at go-live | Closed as out of scope. |
| RSK-009 DNS / email cutover | A strategic cutover plan is required; email moves to the new domain with the old domain forwarding | Cutover runbook is a deliverable before launch (§7.4). |
| CON-004 / CON-007 / GAP-002 trademark | Tabled; build the site; handles and business registration in progress | Name stays config-driven; no work blocked. |
| GAP-018 legacy offerings | Tabled; focus on the new site | Draft redirects in LEG / `config/redirects.ts` stand as-is. |
| GAP-017 launch date | Not yet set | Plan by readiness, not date. |
| Merge authority (G2) | Claude merges on the owner's per-PR approval; squash only; auto-merge stays blocked | `CLAUDE.md` G2 and the guard hook updated. PR #1 merged under this rule. |
| DIV-01 Start form scope | "Leave everything in scope": all S14 §14.4.1 fields, including "immediate considerations"; submissions stay email-only per D-054 | GS-001 implemented in full with per-field "no medical details" guidance; residual risk stays with R-027 (owner-accepted). |
| DIV-02 domain | Owner will register `tabwellnesscollective.com` in the near future | RSK-007 stays open until registered. |
| Homepage trust stats | "20+ years" and "In person & virtual" confirmed accurate | WEB-013: stats verified. |
| Dependency majors | Routine Dependabot PRs cover minor/patch only; majors are planned upgrades | Backlog: **UPG-01** Next 16, **UPG-02** zod 4 (Dependabot PR #5 closed), **UPG-03** TypeScript 7 (PR #4 closed). Each gets its own PR with full checks. |
| Vector logos (batch 4) | First vector package delivered 2026-09-28 | Installed (DS-006 partly met). Designer follow-ups: horizontal-lockup descriptor legibility (**launch-blocking**), service-icon vectors and trace cleanup for print (optional). |
| DIV-04 Start funnel events | "Track both points, started and submitted, to understand how many complete the process" | Plausible runs on `/start` with two fixed, property-less events; the Meta pixel stays off `/start` and `/contact`. *Proposed D-057 amends D-046.* Events are dormant until the Plausible domain and its two goals are set up. |
| DIV-05 Start submissions | "Record this information in the database; if they become a client, link the submission to the account they create, by email." Follow-up rulings: save the **entire form**; email it to **both the submitter and info@**; **never delete**; "just build" (A-01 legal review later) | Reverses the Phase 1 answer to A-04 and supersedes D-054 once storage is on (*proposed D-058*). Built: `inquiries` table (whole form, immutable answers, no deletes, audited), owner routing and client linking in TAB Practice, link to My TAB only after the email is confirmed (SEC-014), submitter copy. Storage is written only when the portal runs on Supabase (`forms.storeSubmissions`), so D-042 / guardrail 4 still decide when real submissions land in the database. Deletion for a legal request is possible only outside the app, by deliberately disabling the no-delete trigger. |
| Choices-only forms | "Take out the free-form text fields and have it be all choices provided by us … replace with predefined options"; then: "the contact form should 100% still have a text/message box. That is and should be different than the start form" | *Proposed D-059*: on the **Start** form, apart from name, email and phone (character-restricted), every answer is a predefined option; the database rejects free text on a Start submission. The **contact** form keeps its message box (with the "no medical details" note) plus a topic choice; its message goes to TAB and is stored, but the submitter's copy never repeats it. The S14 open questions keep their wording as option lists; the "health-related, discuss privately" flag keeps S14's safety screen. Trade-off: the person's own words for Start are captured in the discovery conversation or My TAB intake (D-054 already puts detailed intake there). |
| Location in titles | "I don't like the location in the titles... please remove that" | Titles are "[Page] \| TAB Human Performance Center", overriding S16's "[Service] in [Location]" pattern; the location stays in meta descriptions and LocalBusiness/Service data for local search. |
| Sharing the production URL | Shared a `*.vercel.app` link; the recipient hit Vercel login | By design: Standard Protection covers every `*.vercel.app` URL until the custom domain is attached. Share individual views with a Vercel Shareable Link (Hobby: one active link); keep production private until the launch checklist clears (forms, privacy policy, Turnstile keys). |
| GAP-008 legal determination | "GAP-008 is approved. Move forward. Supabase will get upgraded later" (after Claude's portal go-live plan: decide → build → provision → operate); then **"HIPAA does not apply here"** | **GAP-008 closed.** *Proposed D-060 amends D-042:* no HIPAA-eligible tier or BAA is required, so R-025's ≈$1,300/month tier falls away; hosting is Supabase Pro (daily backups) plus Vercel Pro, about $45/month. My TAB stays a sensitive-data system: real client data waits for the portal security gate (SEC-015–SEC-021, 0 known gaps, staff MFA), a paid Supabase plan with a tested restore (SEC-009, RSK-005) and a privacy policy that covers My TAB (`CLAUDE.md` guardrail 4). Build now: hardening, admin tools (GAP-023 invites, plan authoring, reviews, assignments), sign-in plumbing, Supabase-native tests. *Recommendation:* have counsel confirm the duties that remain without HIPAA (breach notification under the FTC Health Breach Notification Rule and Michigan law; how long client records must be kept). |
| Backlog reporting | "Maintain a clear and concise list of actions and backlog items and list them after every approved merge … categorized and prioritized" | `docs/BACKLOG.md` (P0–P3; owner actions A, Claude's work C) is updated in every PR and posted after every approved merge; rule added to `CLAUDE.md`. |
| Vercel account | "Change CLAUDE.md … use the new stuff" (the project lives in the owner's personal Vercel team) | *Proposed register entry:* hosting is Vercel team `team_A8TfHlLyTc2toipq0WsMVKvK`, project `prj_djrXZfNVt5JmpqUK7w4CjegZSwmf` only; the earlier `team_5I53…` entry is withdrawn. `CLAUDE.md` corrected in #16. |
| Vercel environment variables | "Please set whatever variables you need to set moving forward" | *Proposed register entry:* Claude creates and edits this project's Vercel environment variables as the work needs them and reports each change; `NEXT_PUBLIC_*` as plain (Config), secrets as Sensitive. Recorded in `CLAUDE.md`. First change: `NEXT_PUBLIC_SHOW_DRAFTS=true` on Preview. |
| Portal demo | "I need to be able to demo the client login portal as well as the admin practice portal … Client login should not point to gettimely … I do not see a link or button for the practitioner to log into the practice/admin portal" | Built: demo sign-in page (client or practitioner, no password, fictional data), "Practitioner login" in the footer, sign-out. Where the demo portal runs is open (backlog A23): production keeps it off per the 2026-09-28 security review (no real login, one store shared by every visitor), so the demo ran on preview URLs until the owner decided: **"Production URL"** (2026-09-28). *Proposed register entry:* demo mode runs on the production deployment while production is private (Vercel login, no custom domain, indexing off); `portalDemoOnProduction` must be switched off before a custom domain is attached, and the launch gate fails while it is on. Accepted risk: anyone with Vercel access to production shares one demo store with no real login. |
| G3 release routine | "Set it up now" (staged production: a merge builds a production deployment the owner checks before it goes live) | *Proposed register entry:* Vercel stops auto-assigning production domains; Claude promotes a deployment only after the owner's G3 "promote". Closes backlog A22. |
| Production privacy | Found 2026-09-28: Vercel's default protection ("all except custom domains") left `tab-wellness-collective.vercel.app` public, so the demo portal was reachable without login for about 1.5 hours after #19 went live | Vercel login extended to all deployment URLs ("all"). *Proposed register entry:* keep it until launch; the demo portal on production depends on it. |
| Plans, programs, stages | Plan kinds for strength, massage & bodywork, women's wellness, life coaching and nutrition, "type is an attribute chosen during plan design"; programs reusable "as long as the practitioner is able to develop new programs"; AI help "for plans and programs"; stage changes: system prompts, "ultimately a decision the practitioner has to recommend to the client and ultimately do themselves"; any practitioner builds programs; AI "templates for now"; a practitioner holds a nutrition credential; stage email subject "Your My TAB Stage Has Been Updated", body points to My TAB | *Proposed register entries,* designed in `docs/design/plans-programs-stages.md` (G1 approved 2026-09-29; built as C4a–C4c): typed plans under one Wellness Plan; nutrition plans gated to credentialed practitioners; AI drafting of program templates only, no client data; rule-based stage prompts; practitioner-confirmed stage change with dashboard and email (no stage name or health details in the email). |
| Plans design decisions (G1) | "Approved"; plan sections "confirmed"; nutrition certificate "from Integrative Institute of Nutrition (IIN)", held by "Tricia Ronan, owner and practitioner"; publishing by "owner and director", then "yes, publishing permission" | G1 approved. *Proposed register entries:* nutrition plans are nutrition coaching within an IIN health-coach scope, gated to Tricia Ronan (counsel confirms the Michigan boundary, A7); publishing program templates needs the owner or a practitioner with the publishing permission (no separate director role). |
| Domain registration timing | Domains "are coming after official approvals of name" | A1 waits on the official name approval; the P1 chain behind it (Resend, so the forms send; Turnstile; Plausible; switch-over; launch) waits with it. Until Resend is set up, the Start and contact forms return an error on deployed sites. |
| Backlog page after each promotion | "Instead of posting the backlog in this thread, can you generate a backlog html … and post that artifact after a successful promote … we'll need to stop doing that [posting after a merge]" (2026-10-02) | *Proposed register entry,* supersedes the 2026-09-28 "after every approved merge" rule: `docs/BACKLOG.md` stays the one place the backlog is edited, now with effort and blocker per item; after every successful production promotion Claude renders it (`scripts/render-backlog.mjs`) and republishes the backlog page (titled "TAB Human Performance Center Backlog" since the rebrand). `CLAUDE.md` updated. |

### 7.2 Mapping of this register to the MDR

| This register | MDR | Status after reconciliation |
|---|---|---|
| DEC-001, DEC-013 name | D-020, D-038 | Consistent |
| DEC-002 pillars | D-021, D-028 | Consistent |
| DEC-006 Timely / Stripe | D-001, D-003, D-004, **D-052** (split: Timely = appointments + packages; Stripe = digital products + subscriptions; one Stripe customer per client) | Consistent; D-052 adds detail |
| DEC-008, DEC-009 | D-037 | Consistent |
| DEC-010 sensitive data | **D-042** (HIPAA-eligible infrastructure; supersedes D-002) | Amended 2026-09-28: HIPAA does not apply (owner ruling, proposed D-060); the sensitive-data controls stay, the HIPAA tier and BAA go |
| DEC-016, DEC-017 identity and tokens | D-039, D-047, D-053 (pending entry) | Consistent; D-056 proposed to amend D-053 |
| DEC-020 portal later | D-034 | Consistent |
| REC-001–REC-003 stack | D-005, D-036 | **Decided** |
| REC-004 analytics | **D-046**: Plausible on public pages; ad pixels only once ads start; never in My TAB or on health forms | **Decided**; GAP-015 closed |
| REC-005 managed hosting | D-005, D-006, ARCH §1.6 | **Decided** |
| REC-006 Timely Zapier | D-015 (baselined): Innovate + ads start together, after launch | Deferred |
| GAP-006 Timely plan | ARCH §3: Timely **Elevate** today | Partly closed: booking link found on the legacy site (2026-09-28); the Client Login link is still needed |
| GAP-007 Stripe / Timely payments | D-052 | **Closed** |
| GAP-009 staff roles | **D-045**: model for a team, build for one (owner-practitioner + client) | **Closed** for MVP |
| GAP-013 transactional email | D-005: **Resend** | **Closed** |
| GAP-003 location | Codebase context: Brighton/Howell area, Michigan; one owner-practitioner, 20+ years | Partly closed (address, hours, phone still placeholders) |
| RSK-003 programs engine | D-044, R-009, R-024 (validate with the pilot cohort) | Consistent |
| RSK-004 Payload + Supabase | A-02 (wire Payload **after** P1; same Postgres, separate schema or own DB) | Aligned; P1 needs no CMS |
| RSK-005 paid tiers | D-006, **A-01**, **R-025** (≈$1,300/month HIPAA tier gated on legal review) | Updated 2026-09-28: no HIPAA tier (proposed D-060); paid plans are still needed for backups (SEC-009) and commercial use (Vercel Hobby) |
| RSK-007 domain | MDR open item: "Register tabwellnesscollective.com once clearance passes" vs S17 §17.7 "secure immediately" | **Divergence**, see 7.3 |
| RSK-001 Start form stores health free text | **D-054** (pending entry) + A-04: email to `info@` via Resend, not stored; form asks for no medical details; R-027 tracks the residual risk | **Divergence**, see 7.3 |

### 7.3 Open divergences (need an owner ruling or a register entry)

| ID | Divergence | Claude's recommendation |
|---|---|---|
| DIV-01 | **Start form handling.** D-054 emails submissions (via Resend, then the Google Workspace inbox); RSK-001 proposed storing them in Supabase. Both lack a BAA in Phase 1, but email copies free text to a third-party relay and an inbox with no retention or access control. | Keep D-054 for Phase 1: it's the owner's call and costs nothing. Harden it: no free text in subjects (already a rule); plain-text body; a "don't include medical details" hint beside *each* free-text field; an inbox retention rule. Revisit at A-04 when My TAB launches. |
| DIV-02 | **Domain timing.** MDR: register after clearance. S17 §17.7 and RSK-007: register now. | Register now. It's reversible and costs about $20 a year; losing the exact-match domain can't be undone. |
| DIV-03 | **Documentation drift in the handoff.** ARCH cites `supabase/migrations/0001_my_tab.sql` (18 tables) and `docs/ARCHITECTURE.md` / `docs/HANDOFF.md`. The codebase has `20260927000000_my_tab_core.sql`, `docs/PHASE2.md` says 30 tables, and ARCHITECTURE.md / HANDOFF.md aren't in the zip. | Treat the code as the truth and correct the docs in the repo (R-028). |
| DIV-04 | **Resolved 2026-09-28 by owner ruling (§7.1): track started and submitted.** **Start funnel events vs. analytics exclusions.** NFR-006 (S16 §16.8) asks for `start_where_you_are_open/submit` and `contact_submit`; D-046 keeps analytics off `/start` and `/contact`. | D-046 governs. Measure the funnel without tracking the form pages: count `start_where_you_are_open` as the CTA click on public pages, and take submissions from the inbox (or from the Phase 2 intake records). NFR-006 carries this note; *proposed register entry*. |
| DIV-05 | **Resolved 2026-09-28 by owner rulings (§7.1): whole form stored and emailed to both parties, kept indefinitely, linked by confirmed email. Built; storage switches on with the D-042 gate.** **Staff routing record vs. email-only intake.** GS-005 (derived from GS-004) calls for a minimal staff view of submissions in Phase 1; D-054 keeps submissions out of any database until My TAB is on HIPAA-eligible infrastructure (D-042). | Keep D-054: in Phase 1 the reply email **is** the routing record, and a Gmail label per outcome (Book / Discovery / Intake / More info / Referral) gives the owner a free, countable log. Build GS-005 with My TAB intake (A-04). Owner to confirm; *proposed register entry*. |

### 7.4 Deliverables added by these rulings

- **Cutover runbook** (from S19 §19.15 + RSK-009): new-domain email in Google Workspace; forward legacy `@tabmassage.com`; DNS change sequence that preserves MX/TXT; redirect verification; rollback. Due before the launch date is set.
- **Token amendment** (D-056): implemented in code and CI contrast check (DS-005).

### 7.5 Rebrand to TAB Human Performance Center (owner rulings, 2026-10-05)

Source: `docs/source/batch-5/` (Brand Foundation v2, Steps 13, 18, 19, stock image library, approved board and palette).

| Topic | Owner's words | Outcome |
|---|---|---|
| Scope | "This is a brand, color, and logo change. Functionality wise, nothing should change with the website. All features, capabilities, and abilities should remain." | Delivered in four PRs: foundations (tokens, type, logo, name, metadata, governance); public site (mountain hero, five pillars, Integrated Nutrition page, copy, redirects); image library; My TAB and TAB Practice restyle. Every existing e2e check keeps passing; only brand strings change. |
| Name | "All of the strategy documents and other artifacts … will need to be updated with 'Center'. We are not using practice or TAB Wellness Collective any longer" | *Proposed D-063 (replaces D-038 and the D-020 name):* **TAB Human Performance Center**, always in full in metadata, listings and legal text; "TAB" alone conversationally. "Practice" (from the HPP documents) and "TAB Wellness Collective" are retired. |
| Philosophy and messaging | Board and Brand Foundation v2 §10 | *Proposed D-064:* TAB stands for **Transform. Adapt. Balance.** Purpose line "Build the capacity to live fully."; category line "Human performance for real life."; homepage H1 "More capacity for what matters." The primary CTA stays **Start Where You Are**. The five TAB Method stages become Start Where You Are, Transform, **Adapt**, **Balance**, Evolve (owner, 2026-10-05: "This needs to be Transform, Adapt, Balance"; supersedes the earlier "keep the five stages" answer); the `method_stage` enum values are renamed to match. |
| Palette and type | "I'm good with whatever you choose" (palette file vs Step 18) | *Proposed D-062 (replaces D-053 and D-056):* the palette file is final: Graphite #2E2E2E, Deep Olive #4A5A44, Sage #A7B39F, Clay #C46A4A, Ochre #D4A574, Linen #E8E3D9, Bone #FBF6F1, plus Clay Dark #A75436 (Step 18) for accessible accents. Clay, Sage and Ochre are decorative only. Status and note fields use palette tints defined as tokens (Sage at 30% and 15%, Ochre at 25%; C22). Montserrat + Spectral, self-hosted. Derived UI values chosen for WCAG 2.2 AA; `npm run test:contrast` passes 38/38. |
| Logo | "Can you redraw, and hopefully REALLY REALLY accurate to the raster board provided", then "This looks great", "the board was AI generated, so please correct spacing, spelling, and anything else", "set this as baseline" | *Proposed D-061 (replaces D-027 and the batch-4 package):* the approved redraw is the production logo (`public/brand/`, sources in `design/logo-redraw/`): flat colour is the master, the sheen versions are for large digital uses, the stacked lockup is approved, board spacing errors corrected. Designer vector masters, if commissioned, replace the files under the same names. |
| Service pillars | Brand Foundation v2 §11 and Step 13 | *Proposed D-065 (replaces D-050):* five equally weighted pillars: Massage & Bodywork, Functional Strength, Women’s Wellness, Integrated Nutrition, Holistic Life Coaching. Integrated Nutrition is nutrition coaching within the IIN health-coach scope, delivered by Tricia Ronan (see the plans design ruling above; counsel confirms the Michigan boundary, A7). Built in rebrand PR 2. |
| Service icons | "I like both" | Both colourways are approved: the board's colours (Deep Olive, Sage for Women’s Wellness, Ochre for Integrated Nutrition) and graphite. Icons always appear with their service name, so the lighter lines meet WCAG 1.4.11. |
| Board errors | "please correct spacing, spelling, and anything else" | One descriptor tracking value, even line spacing aligned to TAB, centred divider and tagline; the board's "Aiign" caption is "Align" in site copy. |
| Practitioner workspace name (A27) | "leave it as is" | **TAB Practice** keeps its name; "Practice" is retired only from the brand name. |
| Client plan name (A28) | "TAB Performance Plan" | *Proposed register entry (amends DEC-014):* the client plan is the **TAB Performance Plan** ("Performance Plan" for short). Internal keys are unchanged (`plan_type` `wellness`, table `wellness_plans`); `npm run test:brand` blocks the old name. |

### 7.6 Domains, email and owner settings (owner rulings, 2026-10-06)

| Topic | Owner's words | Outcome |
| --- | --- | --- |
| Registrar | "where is the best place to get the domains so you can manage the setup and configuration" | Vercel, team `team_A8TfHlLyTc2toipq0WsMVKvK`, so DNS and project domains are managed in one place (`VERCEL_TOKEN` in the session environment for DNS writes). |
| Domains | "I'll take the first 4"; "I already got tabhumanperformance.com" | *Proposed D-066 (replaces DEC-015's domain):* canonical **`www.tabhumanperformance.com`**; the apex, `tabhumanperformancecenter.com`, `tabhpc.com` and `tabhp.com` redirect to it (308) and are never used in copy. Registrant: TAB Human Performance Center (to update once the Michigan assumed-name or amendment filing is accepted). `tabmassage.com` stays at GoDaddy, retained with per-URL redirects. Closes RSK-007. |
| Email | "I'd like for email to move to the new main domain … Mail from the legacy name and domain will need to be forwarded" | Google Workspace adds `tabhumanperformance.com` as a secondary domain; users are renamed to it and keep `@tabmassage.com` as aliases. Defensive domains send and accept no mail (null MX, SPF `-all`, DMARC `reject`). |
| Website email | "Resend" (after weighing Gmail SMTP and self-hosted options) | D-005 confirmed: Resend sends form mail (and, at My TAB go-live, Supabase Auth sign-in links) from `no-reply@tabhumanperformance.com`. |
| Owner settings | "We will need an admin portal … that has a toggle to turn the client portal on and off"; design "approved" | *Proposed D-067:* an owner-only Settings page in TAB Practice (C23), stored in a settings table with RLS (owner, two-step-verified sessions) and an audit trail. Client portal is **Off / Demo / Live**; Live stays locked until guardrail 4's gate is met; Demo never on the public domain. Starter settings: transition banner, Start form open/closed, per-service booking links, feature flags. Ships after the domain switch-over. |
| Sequencing | "domain first" | The switch-over (C1) uses the existing `portalDemoOnProduction` constant; C23 replaces it. |

### 7.7 Launch facts and content (owner rulings, 2026-10-06)

| Topic | Owner's words | Outcome |
| --- | --- | --- |
| Business facts (A6) | Address, phone and an hours screenshot | 7487 Grand River Ave, Brighton, MI 48114; (810) 844-1283; Monday and Tuesday 10 AM to 4 PM, Wednesday 11 AM to 6 PM, Friday 9 AM to 4 PM, closed Thursday and weekends. Closes GAP-003. |
| Legal pages (A7) | "Can you draft actual privacy policy and terms that I can review" | Drafted in `content/legal.ts` from the site's real data flows, flagged as drafts until the owner and a Michigan attorney approve. Open question for the owner: proposed D-058 (keep submissions indefinitely) versus deletion on request. |
| Photography (A8) | "What you have is fine" | The stock library is accepted for launch; own photography is no longer a launch item. Library image #10 stays unused. |
| Launch date (A13) | "Targeting November 1"; "We will need a communication and announcement hype strategy" | Public launch 1 November 2026 (a Sunday; the plan, C25, proposes the cutover on a quieter weekday before). Closes GAP-017. |
| Legacy email (A29) | "ensure emails to the legacy domain … will be sent to our new domains" | Renamed users keep their `@tabmassage.com` addresses as aliases; a catch-all route sends any other `@tabmassage.com` address to `info@tabhumanperformance.com`; `tabmassage.com` stays in Google Workspace, and gets SPF, DKIM and DMARC at GoDaddy. |
| Owner settings, as built (C23) | Design "approved" (Off / Demo / Live) | *Refines proposed D-067:* the stored setting is **Off / Live**. Demo stays a build mode for previews and tests only, never a production setting, because it has no real login and one store shared by every visitor (the reason the switch-over turned it off). Live is selectable only in a build whose portal data is real, so the guardrail 4 gate stays a reviewed release, not a click. Real staff sign-in with an authenticator app is on for production now, so the owner can reach Settings before any client data exists. Booking links and feature flags move to C23b. |
| Production database and auth emails (G3) | "go ahead"; "update the email templates that are sent out of supabase with our brand" | 13 migrations applied to production on 2026-10-06 (no client data), owner account `matthew@tabhumanperformance.com` with an authenticator app, sign-ups off. Supabase email goes through Resend SMTP; its 13 templates use the branded layout, with the logo in a public `brand` Storage bucket (artwork only, never client files) because the site stays behind Vercel login until launch. |
| Client Login (WEB-020) | "The client login CTA button needs to be hidden until the client portal is live. The book now CTA button fulfills the link to the booking site" | No Client Login in the header or footer while the portal is off; "My TAB" appears when the owner sets the portal to Live (and the build allows it). Book stays the route into Timely. |
| Legal pages approved (A7) | "Done" | Privacy policy and terms published as final, dated October 6, 2026. The cancellation policy (GAP-010) is split out as A30. Open for the owner: the policy honours deletion requests "unless we need to keep it for our records", while the database never deletes a submission (proposed D-058); confirm that stance, or ask for deletion of prospect submissions on request. |
| Vercel Pro (A11) | "I signed up for Vercel Pro for my entire account" | Confirmed active on the team on 2026-10-06; RSK-005's business-use concern is closed. |
| Service area (A12) | "I would go with 'Serving Livingston County'" | Footer and emails read "Serving Livingston County"; structured data names Livingston County, MI plus Brighton and Howell. Page descriptions keep "Brighton and Howell, MI", since people search by town (ASM-006 amended). |
| Settings, part 2 (C23b) | "Address this" | Per-service Book links (https only, blank = main booking page) and switches for Resources and Our Team. Events and Testimonials are shown but locked: an Events switch would publish an empty page, and testimonials need real, consented content (guardrail 10). Refines proposed D-067. Migration `20261010000000` needs G3 before production. |
| Retention (A7 follow-up) | "No" (to deleting a non-client's submission on request) | Proposed D-058 stands: website submissions are kept and never deleted, including for people who don't become clients. The privacy policy now states this in "How long we keep information" and "Your choices". |
| Client policies (A30) | The TAB Massage & Fitness cancellation, arrival and gratuity policies; "feel free to wordsmith this" | Reworded for TAB Human Performance Center with the site's service names (Massage & Bodywork, Functional Strength) and "practitioner"; terms unchanged: 24 hours' notice, the full session price with less notice, a prepaid session may be forfeited, cancel by phone only, arrive 10 minutes early (15 for new clients), gratuity in cash or check with a gift card or the Monthly Massage Program. Open: whether coaching sessions are covered, and no-shows. Closes GAP-010 once confirmed. |
| Client policies, follow-up (A30) | "Yes, extend it to the other service pillars"; "add in no-shows and you're correct about same day" | The policies cover all five pillars, in person or virtual; less than 24 hours' notice, including the same day, is charged in full; a no-show is charged in full; a prepaid session may be forfeited for either. GAP-010 closed. |
| Turnstile keys (A3) | Site key and secret key supplied | Production: plain `NEXT_PUBLIC_TURNSTILE_SITE_KEY` and Sensitive `TURNSTILE_SECRET_KEY`; previews: Cloudflare's always-pass test keys. Closes A3 once a live form submission is verified. |
| Analytics (A4) | "I'm not signing up for plausible… find a free open source solution. I'm not paying for a bunch of micro services" | *Amends proposed D-057:* Vercel Web Analytics replaces Plausible. Its client (`@vercel/analytics`) is open source (MIT); the service is part of the Vercel Pro plan already paid for; cookieless and first-party. Same exclusions (never My TAB, TAB Practice or /contact) and the same four property-less events. |
| Analytics, follow-up (A4) | Vercel Web Analytics turned out to be a paid add-on; owner: "Let's build our own" | *Amends proposed D-057 again:* our own first-party counter. Daily totals per public page, fixed event and referring site's hostname in `site_stats`; no cookies, IP addresses, user agents or visitor identifiers; Global Privacy Control and Do Not Track honoured; bots skipped; My TAB, TAB Practice and /contact never counted. The owner reads them in TAB Practice → Website stats. No unique-visitor count, by design. |
| Staff sign-in (owner, 2026-10-06) | "Why do I have to keep getting email links… that's a cumbersome process"; then "Go ahead with password plus code and session limits and also passkey" | *Proposed D-068, amends C23's link-first staff sign-in:* staff sign in with **email and password**, then a **passkey** (Face ID, Touch ID, Windows Hello) or the authenticator code as the backup; the second step stays mandatory (SEC-015). The emailed link stays for a forgotten or first password. Passwords: at least 12 characters, checked against known breaches (Pwned Passwords range API; only a 5-character hash prefix leaves the server), and changing one needs a fresh authenticator code. **Session limits:** idle sessions end after 7 days (SEC-020's cookie) and staff sessions end 30 days after sign-in. A one-tap passkey with no password is not used: Supabase marks it experimental and its sessions don't reach `aal2`, which `current_app_role()` requires. Clients keep emailed links only. Release needs G3: Supabase settings (WebAuthn MFA on, minimum password length 12). |
| Staff sign-in, release (owner, 2026-10-06) | "Approved, apply the settings and promote" | Live 2026-10-06: password sign-in, the 30-day ceiling and a 12-character minimum (`password_min_length` set on Supabase). **Passkeys could not be switched on:** Supabase's Management API refused ("Enabling of MFA with WebAuthn not currently supported"). Their screens are hidden behind `PASSKEYS_AVAILABLE` in `lib/staff-auth.ts` until Supabase supports WebAuthn MFA (backlog C28); the authenticator code stays the second step. |
| Massage techniques (owner, 2026-10-06) | "We need to enhance the services pages, starting with Massage and body work": the eight modalities on tabmassage.com's Introduction to Massage, plus lymphatic drainage; "feel free to word smith"; presentation left to Claude. Follow-up: training confirmed in "all 9"; keep Myomassology as the name; add "prenatal and sports. We don't do Swedish/relaxation" | Built: a techniques guide at `/services/massage-bodywork/techniques` with eleven techniques (grouped by what people come in for, an at-a-glance table with pressure, a card per technique: what it is, how it feels, often chosen for, good to know) and a "Techniques we draw on" section on the Massage page; the old page redirects to it. Copy rewritten without the original's treatment claims (Step 15 §15.8). Swedish and relaxation massage aren't offered, so the Massage page no longer lists relaxation as an offering. |

