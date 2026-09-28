# TAB Wellness Collective — Requirements Register

Living register. Every requirement has a stable ID and a source reference. Conflicts, gaps and
assumptions are logged here and never resolved silently. IDs are never reused; retired items are
struck through, not deleted.

**Last updated:** 2026-09-28 · **Intake status:** complete (13 of 13 documents, 3 batches)

> **Governance (D-041).** The owner's *Decision & Risk Register* (IDs `D-###`, `R-###`, `A-##`,
> `X-##`, consolidated in [MDR](source/batch-3/TAB_Wellness_Collective_Master_Decision_Risk_Architecture_Record.md))
> is the system of record for **decisions and risks**. This file is the **requirements and
> traceability layer** beneath it. `DEC-###` rows restate decisions at requirement level and cite the
> governing `D-###`. New decisions or risks raised here are marked *proposed register entry* until
> the owner logs them. Where this file and the MDR disagree, the MDR governs, and the gap is listed in
> §7 until reconciled (R-028, documentation drift).

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
| DEC-001 | Brand name **TAB Wellness Collective**; philosophy **Transform. Align. Become.** (conditional, see DEC-013) | BF, S17 |
| DEC-002 | Four service pillars with fixed descriptive names: Massage & Bodywork; Personal Strength Training; Women's Wellness Coaching; Holistic Life Coaching. No branded program names yet. | BF §10, S13 |
| DEC-003 | Master brand is gender-neutral; Women's Wellness Coaching is a specialised pillar with targeted messaging. | BF §01 |
| DEC-004 | Homepage H1 "Whole-person wellness, built around you."; primary CTA **Start Where You Are**. | S15 §15.2, §15.7 |
| DEC-005 | Primary tagline is a *working* tagline with four alternatives still in final review. | BF §09 |
| DEC-006 | **Timely** is the scheduling system of record; **Stripe** is the payments system of record. My TAB must not replace either. | S16 §16.1 |
| DEC-007 | Public site shows only Start Where You Are → Transform → Align → Become. The eight-stage journey is internal. | S14 §14.2, S16 §16.3 |
| DEC-008 | Mobile-first responsive web app / PWA; native apps only when justified by evidence. | S16 §16.5 |
| DEC-009 | WCAG 2.2 AA is the accessibility baseline for the public site and My TAB. | S16 §16.8 |
| DEC-010 | The platform is designed as a sensitive-data application from day one. | S16 §16.1 |
| DEC-011 | Delivery is phased: public rebrand site first, portal second, without a later replatform. | S16 §16.9 |
| DEC-012 | Journey governance / KPI layer is not required for launch. | S14 §14.0, §14.5 |
| DEC-013 | Proceed with **TAB Wellness Collective** as the working, preferred name — status *conditional* until trademark counsel and the Michigan entity/assumed-name filing are complete. | S17 §17.11 |
| DEC-014 | Naming architecture: official **TAB Wellness Collective**; shorthand **TAB**; **My TAB**, **The TAB Method**, **TAB Wellness Plan**, **TAB Resources**. Never use "TAB Wellness" as public shorthand. Full name in all titles, structured data and listings. | S17 §17.6, §17.9 |
| DEC-015 | Canonical domain `tabwellnesscollective.com`; `tabmassage.com` retained indefinitely with per-URL 301/308 redirects (no blanket homepage redirect); My TAB stays under the primary domain (`/my-tab` or `my.` subdomain). | S17 §17.7, S19 §19.3 |
| DEC-016 | Visual identity locked: Concept 2 rooted-growth symbol + Concept 3 TAB wordmark; logo family = stacked, horizontal, wordmark-only, symbol badge, reversed. Full lockup at first impression; reduced marks only once the brand is established. | S18 §18.1–18.2 |
| DEC-017 | Design tokens v1.0.0 are canonical: palette, Cormorant Garamond (display) + Manrope (sans), type scale, 4px spacing, radii, shadows, layout, breakpoints, motion. The logo is custom artwork and must not be recreated from the fonts. | TOK |
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
| WEB-001 | Primary nav: Home, Services, The TAB Method, About, Resources. Persistent actions: Start Where You Are (primary), Book, My TAB. | S16 §16.2 | P1 |
| WEB-002 | Sitemap and URLs as specified (19 routes: `/`, `/services` + 4 service pages, `/tab-method`, `/about`, `/about/our-story`, `/about/team`, `/resources`, `/resources/articles`, `/resources/guides`, `/events`, `/faq`, `/start`, `/book`, `/contact`, `/my-tab`). | S16 §16.2 | P1 |
| WEB-003 | Homepage follows the approved nine-section sequence: Hero → Core idea → Four pillars → TAB Method → Personalization → Guided conversion → Proof/trust → Resources → Closing invitation. | S16 §16.3 | P1 |
| WEB-004 | Services landing page headed "Support for how you feel, move, live, and grow." presenting pillars as independently valuable and optionally connected. | S16 §16.2 | P1 |
| WEB-005 | One reusable service-page template (10-part anatomy) with service-specific modules per pillar. | S16 §16.4, S15 §15.6 | P1 |
| WEB-006 | Every service page offers a direct CTA **and** a "not sure?" path to `/start`. | S16 §16.4 | P1 |
| WEB-007 | Related services appear only where the relationship is genuine; no cross-sell carousels. | S16 §16.4, S14 §6 | P1 |
| WEB-008 | TAB Method page with Start Where You Are / Transform / Align / Become sections. | S16 §16.2 | P1 |
| WEB-009 | About (core narrative, structure Belief → Client → Method → Differentiation → Ownership → Invitation), Our Story (kept separate), Team. | S15 §15.5, S16 §16.2 | P1 |
| WEB-010 | Resources hub: articles, guides, events/workshops, FAQ. | S16 §16.2, §16.7 | P1 |
| WEB-011 | `/book` offers two paths: "I know what I want" → Timely booking; "Help me find my starting point" → `/start`. | S16 §16.2 | P1 |
| WEB-012 | Footer: Explore, Services, Get Started, TAB links, legal/accessibility (Privacy, Terms, Accessibility, client policies, cancellation policy, service disclaimers), location, hours, contact, social. | S16 §16.2 | P1 |
| WEB-013 | Trust content: testimonials with consent metadata, practitioner credentials, years serving the community, partnerships, reviews only when strong and current, no dramatic before/after claims. | S16 §16.3 | P1 |
| WEB-014 | All public copy follows S15 voice rules and avoid-lists (hype, fitness culture, wellness guilt, "woo", clinical). | S15 §15.8 | P1 |
| WEB-015 | Temporary site-wide announcement bar ("TAB Massage & Fitness is now TAB Wellness Collective…"), editable in the CMS with a start and end date so it cannot linger. | S19 App. B, §19.17 | P1 |
| WEB-016 | Organization structured data uses "TAB Wellness Collective" as the name and "TAB Massage & Fitness" as a former/alternate name during the transition. *(Derived.)* | S17 §17.9, S19 §19.1 | P1 |
| WEB-017 | Our Story tells the evolution from TAB Massage & Fitness (launched December 2008) to TAB Wellness Collective. | S15 §15.5, S17 §17.12 | P1 |
| WEB-018 | Service icons act as light navigational differentiators on service cards and pages (artwork subject to CON-006). | S18 §18.7 | P1 |
| WEB-019 | Icon set from the symbol: favicon 16/32, Apple touch icon, PWA icons (192/512 + maskable), social avatar 1080, OG/share images. Light and dark variants. | S18 §18.8, DEC-008 | P1 |
| WEB-020 | "Client Login" in the header routes to Timely Client Login until My TAB launches; it becomes "My TAB" at P2. | S19 §19.14 | P1 |

### 2.2 Start Where You Are / Get Started (GS)

| ID | Requirement | Source | Phase |
|---|---|---|---|
| GS-001 | Guided entry form at `/start` with the S14 §14.4.1 fields: name, email, phone, preferred contact method, "What brings you to TAB?", "What would you most like help with?" (14 options, multi-select), service interest (4 pillars + "not sure"), "If things improved…", immediate considerations. | S14 §14.4.1, S16 §16.2 | P1 |
| GS-002 | Capture "How did you find TAB?". | S14 §14.3 Connect | P1 |
| GS-003 | Short and progressively disclosed; the confirmation explains what happens next. | S16 §16.8 | P1 |
| GS-004 | Every submission ends with exactly one next step: direct booking, discovery conversation, service-specific intake, more information, or outside referral. | S14 §14.3, §14.4.1 | P1 |
| GS-005 | Staff can review submissions and record the routing outcome. *(Derived from GS-004: needs a minimal staff view in P1.)* | Derived | P1 |
| GS-006 | Discovery is never a mandatory gate; clients with straightforward needs can book immediately. | S14 §2, S16 §16.8 | P1 |

### 2.3 My TAB client portal (PORTAL)

| ID | Requirement | Source | Phase |
|---|---|---|---|
| PORTAL-001 | Secure login with strong authentication / MFA available to clients. | S16 §16.5, §16.6 | P2 |
| PORTAL-002 | Home dashboard: welcome + current focus, next appointment, TAB Method stage indicator (lightweight, not gamified), plan summary, current program / next activity, next review, assigned resources, quick actions. | S16 §16.5 | P2 |
| PORTAL-003 | My Plan shows the TAB Wellness Plan (S14 §14.4.4 fields), framed as "the plan we created together". | S14 §14.4.4, S16 §16.5 | P2 |
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
| STAFF-003 | Service-specific intakes for all four pillars with field-level specs from S14 §14.4.3, each with consent / scope acknowledgement. (See CON-002.) | S14 §14.4.3 | P2 |
| STAFF-004 | Session documentation pattern: Current status → Intervention/experience → Client response → Next step. Internal notes are separate from shared summaries. | S14 §14.3, S16 §16.5 | P2 |
| STAFF-005 | Author the Wellness Plan together with the client. | S14 §14.4.4 | P2 |
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

### 2.8 Accessibility, SEO, analytics (NFR)

| ID | Requirement | Source | Phase |
|---|---|---|---|
| NFR-001 | WCAG 2.2 AA: keyboard access, visible focus, contrast, no colour-only state, semantic landmarks, labelled forms with error recovery, alt text, captions, touch targets, zoom/reflow, reduced motion, accessible downloads. | S16 §16.8 | P1 |
| NFR-002 | Technical SEO: XML sitemap, robots.txt, canonicals, Core Web Vitals, image optimisation, HTTPS, clean 404, redirect monitoring. | S16 §16.8 | P1 |
| NFR-003 | Page metadata pattern: title `[Service] in [Location] \| TAB Wellness Collective`, human meta descriptions, outcome-led H1; Organization / LocalBusiness / Service structured data; FAQ markup only where visible. | S16 §16.4, §16.8 | P1 |
| NFR-004 | Redirect map from legacy tabmassage.com URLs completed before launch. | S16 §16.8, §16.9 | P0/P1 |
| NFR-005 | Privacy-aware public analytics; portal analytics kept separate; no sensitive data in event names or properties. | S16 §16.8 | P1 |
| NFR-006 | Public events: `start_where_you_are_open/submit`, `service_view`, `book_click`, `timely_booking_outbound`, `my_tab_login_click`, `method_view`, `resource_view/download`, `contact_submit/consultation_request`. | S16 §16.8 | P1 |
| NFR-007 | The S19 §19.15 critical smoke tests are automated as end-to-end tests and run against every preview and against production after cutover. | S19 §19.15 | P1 |
| NFR-008 | Redirects are server-side 301/308, per URL, with no chains or loops; the full map is tested automatically before launch and monitored afterwards. | S19 §19.3 | P1 |
| NFR-009 | Pre-production and preview deployments are `noindex` and not publicly discoverable; noindex is removed only on the production domain at launch. | S19 §19.3 | P1 |
| NFR-010 | 30-day post-launch monitoring: 404s and redirect failures, form submissions, booking-link behaviour, with alerts. | S19 §19.16 | P1 |

### 2.9 Design system (DS)

| ID | Requirement | Source | Phase |
|---|---|---|---|
| DS-001 | TOK JSON is the single source of truth; CSS variables and the styling theme are generated from it, never hand-copied. | TOK, CON-009 | P1 |
| DS-002 | Cormorant Garamond for display/headlines only; Manrope for body, navigation, UI, forms and portal text. Both self-hosted (no third-party font requests). | TOK, S18 §18.5 | P1 |
| DS-003 | Letterspaced uppercase `label` style used sparingly for eyebrows, navigation labels and section markers. | TOK, S18 §18.5 | P1 |
| DS-004 | Primary button = olive pill; secondary button = terracotta-deep pill; terracotta used as an accent, "never everywhere". | TOKCSS, S18 §18.4 | P1 |
| DS-005 | Every text/background and UI-boundary pairing in use meets WCAG 2.2 AA (see CON-011); an automated contrast check runs in CI against the token set. | DEC-009 | P1 |
| DS-006 | Production logo files (SVG) for every lockup, in light and reversed versions, plus a simplified small-size symbol for 16–32px. | S18 §18.11 | P1 |
| DS-007 | Imagery: real people and environments, natural light, warm tones; no before/after, hyper-posed fitness or sterile clinical imagery. | S18 §18.6 | P1 |

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
| GAP-003 | Location: Michigan (S17). **Remaining:** street address, city, hours, service area, single vs multiple locations. | P1 | Owner |
| GAP-004 | Team roster: practitioners, services each provides, credentials, bios, photos. | P1 | Maybe |
| GAP-005 | Legacy inventory: **public part done** (LEG: 36 pages, 28 posts, hosting, DNS, email). **Remaining:** Search Console, analytics, backlinks, category/tag archives. The live site is WordPress on shared hosting, so the old Vercel project `tab-wellness-collective` is *not* the live site — is anything in it worth reusing? | P1 launch | Owner |
| GAP-006 | Timely plan (Innovate?), current booking URLs, whether Timely Consult forms are in use. | P1 | Owner |
| GAP-007 | Stripe products in use (POS, Checkout, Billing, subscriptions, portal). Does Timely also take payments (double-charge risk)? | P2 | Owner |
| GAP-008 | Legal determination of HIPAA / state health-privacy obligations, and which vendors (Timely, email/SMS, hosting) need signed agreements (BAAs). | P2 schema; P1 privacy policy | Owner + counsel |
| GAP-009 | Staff roles and which records each role needs. | P2 | Maybe |
| GAP-010 | Policy content: privacy, terms, accessibility statement, cancellation policy, service disclaimers. | P1 launch | Owner |
| GAP-011 | Offer details: pricing display, session lengths, virtual vs in-person coaching, gift cards, memberships/packages. | P1 | Maybe |
| GAP-012 | Launch content: testimonials (with consent), initial articles/guides, photography. | P1 launch | Owner |
| GAP-013 | Transactional email / SMS provider for notifications and Get Started alerts. | P1 | Engineering proposal |
| GAP-014 | Named product owner and content owners (S16 §16.9 ownership table). | P1 | Owner |
| GAP-015 | Analytics tool: Plausible vs Matomo vs GA4. | P1 | Engineering proposal |
| GAP-016 | Where client records and session notes live today (Timely, paper, other) and what, if anything, migrates. | P2 | Owner |
| GAP-017 | Target launch date. S19 plans relative to T-8 weeks but sets no date. | Planning | Owner |
| GAP-018 | Legacy offerings outside the four pillars: yoga, nutrition, sports injury rehab, small-group training / LifeQuest, chair/corporate massage, cupping, youth programs, remote training. Which continue? This drives redirect destinations and service-page content. | P1 | Owner |
| GAP-019 | Access for cutover: host DNS panel for tabmassage.com (nameservers at `SUPERCP.COM`), GoDaddy registrar, Google Workspace admin (to add the new domain and aliases), Search Console. | P1 launch | Owner |
| GAP-020 | Gift cards: the legacy site sells them. Will they continue, and through what (Timely vouchers, Stripe, other)? S16 lists "Gift Cards if offered". | P1 | Owner |
| GAP-021 | URLs for the legal pages are not defined in S16. Proposed: `/privacy`, `/terms`, `/accessibility`, `/policies/cancellation`. | P1 | Engineering proposal |

## 5. Assumptions (ASM)

| ID | Assumption | Confirm by |
|---|---|---|
| ASM-001 | One brand site on one domain; name held in configuration until Step 17 closes. | G1 |
| ASM-002 | Vercel (app) and Supabase (data) are the managed platforms, consistent with S16's managed-hosting recommendation. | G1 |
| ASM-003 | English only at launch. | G1 |
| ASM-004 | Single physical location in Michigan (state confirmed by S17; site count unconfirmed, see GAP-003). | G1 |
| ASM-005 | Until vector logos exist (DS-006), high-resolution raster exports of the S18 artwork can serve development and previews, but not the production launch. | G1 |

## 6. Engineering risks and recommendations (RSK)

Raised by Claude as principal engineer; each is resolved at G1 or on the named trigger.

| ID | Risk | Recommendation |
|---|---|---|
| RSK-001 | Phase 1 already collects health information: the Get Started form's free-text fields ("What brings you to TAB?", "anything we should know") will receive details like surgery, pregnancy or cancer history. | Treat P1 as a sensitive-data release. Store submissions in Supabase behind RLS; staff alert emails carry no content, only a link to a secure view. No third-party form SaaS and no emailing form contents. |
| RSK-002 | The practitioner workspace is listed last in the P2 MVP but is its critical path: plans, programs, summaries and reviews only exist if practitioners create them. | Sequence P2 staff-first; validate practitioner workflows before client screens. |
| RSK-003 | The programs engine (templates → modules → activities → assignments → responses → feedback) is the heaviest P2 component, and adoption depends on practitioners authoring content. | Split P2: P2a = profile, plan, shared summaries, resources, check-ins; P2b = programs engine after authoring demand is confirmed. |
| RSK-004 | Payload + Supabase means two auth systems and a privileged database connection that bypasses RLS. | One Supabase Postgres. Payload in its own schema, with a DB role that has no grants on client-data tables. Payload auth for content editors only; clients and practitioners on Supabase Auth with MFA. |
| RSK-005 | Current plans (Supabase Free, Vercel Hobby) cannot hold real client data: Free has no backups (breaks SEC-009) and Hobby is non-commercial. | Upgrade both before the first real submission reaches production (a G3 prerequisite). |
| RSK-006 | The legal determination (GAP-008) changes vendor choices and data design. | P1 can proceed on the RSK-001 controls; the P2 schema is gated on GAP-008. |
| RSK-007 | `tabwellnesscollective.com` (and `.net`) were **unregistered** on 2026-09-28. Anyone can take them, and losing the exact-match domain is irreversible. | Register now (roughly $10–25 a year); S17 §17.7 already calls for this. Registering doesn't commit to the name legally. Turn on auto-renew and registrar lock. |
| RSK-008 | The legacy site runs WordPress 5.2 (2019) on PHP 7.4 (end-of-life since Nov 2022) with 2017-era slider plugins, and stays live until cutover. Unpatched WordPress is a common small-business breach path. | Outside this build's scope, but the owner should have the host update or lock it down now, or treat the cutover date as the fix. |
| RSK-009 | The cutover DNS change could break email and verification. tabmassage.com mail is Google Workspace, DNS lives at the web host, and there's a Google verification TXT record. | Change only the web records (apex/`www`) to Vercel; copy MX, TXT (SPF/DKIM/verification) exactly if the zone moves; export the zone before any change. Step in the runbook. |
| RSK-010 | The S18 logo artwork is raster with painterly texture. It won't reduce cleanly to 16px favicons or a crisp SVG header. | Commission the vector production round S18 §18.11 anticipates before the P1 launch; develop against raster placeholders (ASM-005). |

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

### 7.2 Mapping of this register to the MDR

| This register | MDR | Status after reconciliation |
|---|---|---|
| DEC-001, DEC-013 name | D-020, D-038 | Consistent |
| DEC-002 pillars | D-021, D-028 | Consistent |
| DEC-006 Timely / Stripe | D-001, D-003, D-004, **D-052** (split: Timely = appointments + packages; Stripe = digital products + subscriptions; one Stripe customer per client) | Consistent; D-052 adds detail |
| DEC-008, DEC-009 | D-037 | Consistent |
| DEC-010 sensitive data | **D-042** (HIPAA-eligible infrastructure; supersedes D-002) | Consistent |
| DEC-016, DEC-017 identity and tokens | D-039, D-047, D-053 (pending entry) | Consistent; D-056 proposed to amend D-053 |
| DEC-020 portal later | D-034 | Consistent |
| REC-001–REC-003 stack | D-005, D-036 | **Decided** |
| REC-004 analytics | **D-046**: Plausible on public pages; ad pixels only once ads start; never in My TAB or on health forms | **Decided**; GAP-015 closed |
| REC-005 managed hosting | D-005, D-006, ARCH §1.6 | **Decided** |
| REC-006 Timely Zapier | D-015 (baselined): Innovate + ads start together, after launch | Deferred |
| GAP-006 Timely plan | ARCH §3: Timely **Elevate** today | Partly closed (booking URLs still needed) |
| GAP-007 Stripe / Timely payments | D-052 | **Closed** |
| GAP-009 staff roles | **D-045**: model for a team, build for one (owner-practitioner + client) | **Closed** for MVP |
| GAP-013 transactional email | D-005: **Resend** | **Closed** |
| GAP-003 location | Codebase context: Brighton/Howell area, Michigan; one owner-practitioner, 20+ years | Partly closed (address, hours, phone still placeholders) |
| RSK-003 programs engine | D-044, R-009, R-024 (validate with the pilot cohort) | Consistent |
| RSK-004 Payload + Supabase | A-02 (wire Payload **after** P1; same Postgres, separate schema or own DB) | Aligned; P1 needs no CMS |
| RSK-005 paid tiers | D-006, **A-01**, **R-025** (≈$1,300/month HIPAA tier gated on legal review) | Consistent |
| RSK-007 domain | MDR open item: "Register tabwellnesscollective.com once clearance passes" vs S17 §17.7 "secure immediately" | **Divergence**, see 7.3 |
| RSK-001 Start form stores health free text | **D-054** (pending entry) + A-04: email to `info@` via Resend, not stored; form asks for no medical details; R-027 tracks the residual risk | **Divergence**, see 7.3 |

### 7.3 Open divergences (need an owner ruling or a register entry)

| ID | Divergence | Claude's recommendation |
|---|---|---|
| DIV-01 | **Start form handling.** D-054 emails submissions (via Resend, then the Google Workspace inbox); RSK-001 proposed storing them in Supabase. Both lack a BAA in Phase 1, but email copies free text to a third-party relay and an inbox with no retention or access control. | Keep D-054 for Phase 1: it's the owner's call and costs nothing. Harden it: no free text in subjects (already a rule); plain-text body; a "don't include medical details" hint beside *each* free-text field; an inbox retention rule. Revisit at A-04 when My TAB launches. |
| DIV-02 | **Domain timing.** MDR: register after clearance. S17 §17.7 and RSK-007: register now. | Register now. It's reversible and costs about $20 a year; losing the exact-match domain can't be undone. |
| DIV-03 | **Documentation drift in the handoff.** ARCH cites `supabase/migrations/0001_my_tab.sql` (18 tables) and `docs/ARCHITECTURE.md` / `docs/HANDOFF.md`. The codebase has `20260927000000_my_tab_core.sql`, `docs/PHASE2.md` says 30 tables, and ARCHITECTURE.md / HANDOFF.md aren't in the zip. | Treat the code as the truth and correct the docs in the repo (R-028). |

### 7.4 Deliverables added by these rulings

- **Cutover runbook** (from S19 §19.15 + RSK-009): new-domain email in Google Workspace; forward legacy `@tabmassage.com`; DNS change sequence that preserves MX/TXT; redirect verification; rollback. Due before the launch date is set.
- **Token amendment** (D-056): implemented in code and CI contrast check (DS-005).
