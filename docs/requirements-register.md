# TAB Wellness Collective — Requirements Register

Living register. Every requirement has a stable ID and a source reference. Conflicts, gaps and
assumptions are logged here and never resolved silently. IDs are never reused; retired items are
struck through, not deleted.

**Last updated:** 2026-09-28 · **Intake status:** batch 1 of 3 received (5 of 13 documents)

## Sources

| Code | Document | Covers | Batch | Status in document |
|---|---|---|---|---|
| BF | [Brand Foundation & Positioning Framework](source/batch-1/TAB_Wellness_Collective_Brand_Foundation.md) | Steps 1–10 | 1 | Approved ("working brand foundation") |
| S13 | [Service Pillars & Offering Architecture](source/batch-1/TAB_Wellness_Collective_Service_Pillars_Step_13.md) | Step 13 | 1 | Approved |
| S14 | [The TAB Method & Customer Journey](source/batch-1/TAB_Wellness_Collective_TAB_Method_Customer_Journey_Step_14.md) | Step 14 | 1 | Approved |
| S15 | [Messaging Architecture](source/batch-1/TAB_Wellness_Collective_Messaging_Architecture_Step_15.md) | Step 15 | 1 | Approved |
| S16 | [Website & Digital Experience](source/batch-1/TAB_Wellness_Collective_Website_Digital_Experience_Step_16.md) | Step 16 | 1 | **Recommended** — technology choices need G1 approval |

Originals (`.docx`) sit beside each Markdown conversion in `docs/source/batch-1/`.

**Phase codes** (from S16 §16.9): **P0** validate before build · **P1** public website MVP ·
**P2** My TAB MVP · **P3** integration maturity · **P4** experience expansion.

---

## 1. Decisions already made in the source documents (DEC)

| ID | Decision | Source |
|---|---|---|
| DEC-001 | Brand name **TAB Wellness Collective**; philosophy **Transform. Align. Become.** (see CON-004 on naming validation) | BF |
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

---

## 3. Conflicts (CON)

| ID | Conflict | Impact | Recommendation | Status |
|---|---|---|---|---|
| CON-001 | Sitemap nests Events and FAQ under Resources, but the URL table puts them at `/events` and `/faq`. | Low | Keep short top-level URLs; show them under Resources in navigation. | Proposed |
| CON-002 | S16 keeps Timely Consult for "booking-coupled" forms, while S14 defines all four service intakes (health history, medications, contraindications) as TAB artifacts and the My TAB MVP includes intakes. It is unclear where the massage intake lives. | **High**: this decides where health data is stored. | Decide at G1 with the owner. | Open |
| CON-003 | Raw practitioner notes live in My TAB only "if moved there" (S16 §16.6). Where notes live today, and whether they move, is undecided. | **High**: this is the largest sensitive dataset and drives migration scope. | Decide at G1 with the owner. | Open |
| CON-004 | The brand documents treat the name as settled, but S16 Phase 0 requires Step 17 naming validation before committing to domains and marks. | Medium | Build with the name as configuration; do not buy domains until Step 17 closes. | Open |
| CON-005 | S14's core principle is "one connected TAB relationship", but the MVP needs two logins (My TAB plus Timely Client Login). | Medium (experience) | Accept for MVP and record it as known experience debt; revisit in P3. | Proposed |

## 4. Gaps and open questions (GAP)

"Batch?" means a later document batch may answer it.

| ID | Gap | Needed by | Batch? |
|---|---|---|---|
| GAP-001 | Visual identity: logo, palette, typography (BF lists visual identity as the next phase). | P1 design | Likely |
| GAP-002 | Step 17 naming validation outcome; final domain(s). | P1 launch | Likely |
| GAP-003 | Location(s), address, hours, service area (for NAP, LocalBusiness, `[Service] in [Location]`). | P1 | Maybe |
| GAP-004 | Team roster: practitioners, services each provides, credentials, bios, photos. | P1 | Maybe |
| GAP-005 | Legacy site inventory (tabmassage.com pages, rankings, backlinks, forms, Google Business Profile, analytics). Is the old Vercel project `tab-wellness-collective` the live tabmassage.com? | P1 launch | Owner |
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

## 5. Assumptions (ASM)

| ID | Assumption | Confirm by |
|---|---|---|
| ASM-001 | One brand site on one domain; name held in configuration until Step 17 closes. | G1 |
| ASM-002 | Vercel (app) and Supabase (data) are the managed platforms, consistent with S16's managed-hosting recommendation. | G1 |
| ASM-003 | English only at launch. | G1 |
| ASM-004 | Single physical location (unconfirmed, see GAP-003). | G1 |

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
