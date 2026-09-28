# TAB Wellness Collective — Master Decision, Risk & Architecture Record

Sep 27, 2026 · @Matthew Ronan

## How to use this record

This is the consolidated record of every decision, risk, architecture decision, and open question for the TAB Wellness Collective program, as of September 27, 2026. It merges the [TAB Decision and Risk Register](https://claude.ai/code/artifact/5e150ace-5714-4dfa-b1f2-985f69afdd61) (rev 95), the Steps 13 to 19 review, and the build handoff (docs/ARCHITECTURE.md, docs/HANDOFF.md).

The register remains the system of record for decisions. This document is the complete read-through; where the two differ, the register governs until a new entry is made. Items marked *pending register entry* came out of the build sessions and still need to be logged there.

**Decision statuses:** Proposed (on the backlog) → Baselined (working assumption; formal review pending) → Accepted (made) → Superseded (replaced by a later decision, which links back). Rejected options are recorded inside the ADR, not as separate entries.

**Risk statuses:** Open → Mitigating → Closed.

**Governance rules (from the register):**

- IDs are assigned in order and never reused: D-### decisions, R-### risks, X-## discrepancies, A-## open architecture questions.

- Log any choice that is costly to reverse, affects more than one workstream, or spends recurring money.

- An accepted decision is never edited; a new decision supersedes it.

- Each working session ends by updating the register. A workstream closes only when its backlog decisions are Accepted.

- Per D-041, the Playbook (Steps 13 to 19) holds reference content and the register holds decisions. The September 25 Architecture Plan is retired.

## At a glance

Fifty-five decisions and twenty-eight risks are on record; one owner decision (HIPAA spend timing) is blocking Phase 2.

| Item | Count | Detail |
|----|----|----|
| Decisions accepted | 40 | Register D-001 to D-052 |
| Decisions baselined | 5 | D-010, D-011, D-013, D-014, D-015 (formal review pending) |
| Decisions proposed | 1 | D-017 coaching agent data boundary |
| Decisions superseded | 6 | D-002, D-008, D-009, D-012, D-016, D-026 |
| Decisions pending register entry | 3 | D-053 to D-055, from the build sessions |
| Risks open | 20 | Of 25 in the register |
| Risks mitigating | 4 | R-002, R-003, R-011, R-021 |
| Risks closed | 1 | R-015 |
| Risks pending register entry | 3 | R-026 to R-028, from the build sessions |
| Discrepancies (X-01 to X-13) | 13 resolved | All converted to decisions |
| Open architecture questions | 6 | A-01 to A-06 |

**Correction to the last session:** I said Resend had no covering decision. That was wrong. D-005 lists Resend in the core stack, so no D-055 is needed for it. The D-055 below covers a different item.

**Waiting on owner input:** A-01 (gate HIPAA-tier spend on legal review) and A-03 (keep or drop Cloudflare and Bunny Stream, which amends D-005).

## Decision register

All 55 decisions in ID order; superseded entries stay in place and point to their replacement.

| ID | Decision | Workstream | Status | Decided |
|----|----|----|----|----|
| D-001 | Own the experience, rent operations: thin custom portal, Timely kept for operations | Architecture | Accepted | 2026-09-25 |
| D-002 | No health data in owned systems. Superseded by D-042 | Architecture | Superseded | 2026-09-25 |
| D-003 | Integrate Timely by embed and link; no data sync at launch | Architecture | Accepted | 2026-09-25 |
| D-004 | Stripe for digital products, programs, and subscriptions (ownership per D-052) | Architecture | Accepted | 2026-09-25 |
| D-005 | Core stack: Next.js, TypeScript, Tailwind, Supabase, Vercel, Cloudflare, Bunny Stream, Resend, GitHub (Cloudflare and Bunny Stream under review, A-03) | Architecture | Accepted | 2026-09-25 |
| D-006 | Paid hosting tiers from launch (tiers and cost revised by D-042) | Architecture | Accepted | 2026-09-25 |
| D-007 | Defer secure messaging, custom scheduling, and native app | Architecture | Accepted | 2026-09-25 |
| D-008 | Growth focus is scaling virtual coaching and wellness. Superseded by D-043 | Strategy | Superseded | 2026-09-25 |
| D-009 | Segments: midlife women and general adults launch together. Superseded by D-049 | Strategy | Superseded | 2026-09-25 |
| D-010 | Offer ladder: free, digital programs, membership, capped 1:1; launch with free, 1:1, and a pilot cohort. Programs redefined within the pillars per D-044 | Strategy | Baselined | 2026-09-25 |
| D-011 | Pricing: tier price points, bundles, and three-part year-one success measure | Strategy | Baselined | 2026-09-25 |
| D-012 | Brand architecture: branded house, named signature programs, practitioner as the face. Superseded by D-021 | Strategy | Superseded | 2026-09-25 |
| D-013 | Bridge: five-part massage-to-coaching path plus hybrid local bundle concept, governed by D-051 | Strategy | Baselined | 2026-09-25 |
| D-014 | Growth system: Facebook-led, Instagram cross-post, Google Business Profile, weekly email; weighting per D-050, analytics per D-046 | Strategy | Baselined | 2026-09-27 |
| D-015 | Paid ads and Timely Innovate start together after brand launch and a proven lead magnet; \$150 to \$250 per month | Strategy | Baselined | 2026-09-27 |
| D-016 | CMS: Payload or Sanity. Superseded by D-036 | Build | Superseded | 2026-09-27 |
| D-017 | Coaching agent data boundary: any AI processing health data needs a BAA-covered provider (D-042) | Coaching agents | Proposed |  |
| D-018 | Modular catalog: a client can hold any combination of plans and products | Strategy | Accepted | 2026-09-25 |
| D-019 | Client self-tracking, including health measures, permitted within D-042 controls | Experience | Accepted | 2026-09-27 |
| D-020 | Master brand name: TAB Wellness Collective (clearance checks in progress) | Brand | Accepted | 2026-09-27 |
| D-021 | Brand architecture: branded house; four descriptive pillars; branded programs later; practitioner executes the brand but isn't built into it | Brand | Accepted | 2026-09-27 |
| D-022 | Brand philosophy: Transform. Align. Become., as a journey and an interconnected model | Brand | Accepted | 2026-09-27 |
| D-023 | Master brand audience: gender-neutral, whole-person; Women's Wellness Coaching gets targeted messaging | Brand | Accepted | 2026-09-27 |
| D-024 | Brand foundation adopted in full: promise, mission, personality, voice, values, positioning, decision hierarchy | Brand | Accepted | 2026-09-27 |
| D-025 | Primary tagline: "Whole-person wellness for stronger bodies and fuller lives." | Brand | Accepted | 2026-09-27 |
| D-026 | Visual identity guardrails and avoid list. Superseded by D-047 | Brand | Superseded | 2026-09-27 |
| D-027 | Logo and visual identity production outsourced to an external designer (timing per D-048) | Brand | Accepted | 2026-09-27 |
| D-028 | Service pillars and scope, per Step 13 | Brand | Accepted | 2026-09-27 |
| D-029 | TAB Method: Start Where You Are, Transform, Align, Become, Evolve, per Step 14 | Experience | Accepted | 2026-09-27 |
| D-030 | Customer journey (eight stages plus Evolve) and seven experience principles, per Step 14 | Experience | Accepted | 2026-09-27 |
| D-031 | Minimum viable operating system and seven client artifacts, built for one per D-045 | Experience | Accepted | 2026-09-27 |
| D-032 | Messaging architecture, headline, primary CTA, language guardrails, per Step 15 | Brand | Accepted | 2026-09-27 |
| D-033 | Public website architecture: sitemap, navigation, URLs, homepage story, service template, SEO, per Step 16 | Experience | Accepted | 2026-09-27 |
| D-034 | My TAB portal scope and MVP, launched after the public site; programs and cohorts in Phase 2 | Build | Accepted | 2026-09-27 |
| D-035 | System-of-record matrix: Timely, Stripe, Payload, My TAB | Build | Accepted | 2026-09-27 |
| D-036 | CMS: Payload | Build | Accepted | 2026-09-27 |
| D-037 | WCAG 2.2 AA; responsive web app before native apps | Build | Accepted | 2026-09-27 |
| D-038 | Naming rules: never "TAB Wellness" as shorthand; proprietary TAB names; domain and handle hierarchy | Brand | Accepted | 2026-09-27 |
| D-039 | Visual identity direction: hybrid symbol and wordmark, palette, serif and sans pairing, per Step 18 | Brand | Accepted | 2026-09-27 |
| D-040 | Rebrand transition plan: five phases, clearance gate, accounts renamed in place, per Step 19 | Brand | Accepted | 2026-09-27 |
| D-041 | Documentation governance: Playbook for reference, register for decisions; Architecture Plan retired | Program | Accepted | 2026-09-27 |
| D-042 | My TAB is a sensitive-data system on HIPAA-eligible infrastructure (supersedes D-002) | Architecture | Accepted | 2026-09-27 |
| D-043 | Dual growth focus: local practice and virtual; programs and cohorts move into portal Phase 2 (supersedes D-008) | Strategy | Accepted | 2026-09-27 |
| D-044 | Programs are client templates and, selectively, products sold under their pillar | Strategy | Accepted | 2026-09-27 |
| D-045 | Model for a team, build for one: MVP roles are owner-practitioner and client | Build | Accepted | 2026-09-27 |
| D-046 | Analytics: Plausible on public pages; ad pixels only once paid ads start; never in My TAB or on health forms | Build | Accepted | 2026-09-27 |
| D-047 | Visual guardrails amended to permit the Step 18 service icons and symbol (supersedes D-026) | Brand | Accepted | 2026-09-27 |
| D-048 | Visual identity production proceeds in parallel with trademark clearance | Brand | Accepted | 2026-09-27 |
| D-049 | All adult segments in scope, including older adults virtually; youth athletes deferred (supersedes D-009) | Strategy | Accepted | 2026-09-27 |
| D-050 | Marketing weight: four pillars weighted equally (replaces D-014's 70/30) | Strategy | Accepted | 2026-09-27 |
| D-051 | The bridge operates under the Step 14 cross-service protocol | Strategy | Accepted | 2026-09-27 |
| D-052 | Payment ownership: Timely for appointments and packages; Stripe direct for digital products and subscriptions; one Stripe customer per client | Architecture | Accepted | 2026-09-27 |
| D-053 | Canonical design tokens: Cormorant Garamond and Manrope; nine-color palette with hex values; Deep Terracotta for accessible interactive use | Brand | Pending register entry | 2026-09-27 |
| D-054 | Start Where You Are and contact submissions are emailed to info@tabwellnesscollective.com, not stored in the app | Build | Pending register entry | 2026-09-27 |
| D-055 | Build approach: Phase 1 site plus Phase 2 foundation in one config-driven codebase; placeholders for missing assets; development continues in Claude Code | Build | Pending register entry | 2026-09-27 |

## Decision detail

The substance behind each decision, grouped by workstream. Full context and options for D-001 to D-018 are in the architecture decision records below.

### Strategy

- **Growth focus (D-043):** Grow both the integrated local practice and virtual coaching and wellness. Digital programs, cohorts, and paid content move into portal Phase 2.

- **Segments (D-049):** All adult segments are in scope, including older adults for in-person and virtual services, with health screening and clearance. Youth athletes stay deferred.

- **Offer ladder (D-010, baselined):** Free lead magnets, self-paced programs, membership (library plus group), capped premium 1:1. Launch set: one lead magnet per segment; 12-week 1:1 with fixed calls and a defined async response window; a midlife pilot cohort of 8 to 12 clients over 8 weeks, recorded to become the self-paced program.

- **Programs (D-044):** Reusable templates practitioners personalize; selected ones are also sold as products under their pillar, with descriptive names.

- **Pricing (D-011, baselined):** Midlife self-paced \$147, pilot cohort \$397 (founding rate), 12-week 1:1 \$1,800. General adults self-paced \$97, 12-week 1:1 \$900. Membership \$49 per month when launched. 1:1 includes all self-paced programs. Year-one success: about \$25,000 revenue, the pilot cohort run and its self-paced program launched, and an email list of qualified prospects.

- **Catalog (D-018):** Each plan or product is its own Stripe product; bundles are curated combinations; entitlements are many-to-many.

- **Bridge (D-013, baselined; D-051):** Client-led conversation after treatment, never during; checkout card with a QR code to the free guide; Timely post-appointment message to opted-in clients; complimentary 20-minute discovery call; referral program rewarded with massage credit. All of it runs under the Step 14 cross-service protocol: passive prompts are fine, direct recommendations only when a need is visible, bundles offered, never pushed.

- **Growth system (D-014, baselined; D-050):** Google Business Profile for local discovery; Facebook-led with Instagram cross-posts for awareness; lead magnet for capture; weekly email for nurture. One weekly pillar piece cut into three short videos plus photos. All four pillars are weighted equally.

- **Paid ads (D-015, baselined):** Start only when the new brand is live, the lead magnet converts organically, and Timely Innovate is in place. \$150 to \$250 per month on Meta, promoting the lead magnet.

### Brand

- **Name and architecture (D-020, D-021):** TAB Wellness Collective, a branded house. "Collective" means the collection of services, not multiple practitioners. Four pillars: Massage & Bodywork, Personal Strength Training, Women's Wellness Coaching, Holistic Life Coaching. The practitioner executes the brand and may be its public face but isn't built into the identity.

- **Philosophy and method (D-022, D-029):** Transform. Align. Become., extended into the TAB Method: Start Where You Are, Transform, Align, Become, Evolve.

- **Audience (D-023):** Gender-neutral and whole-person; Women's Wellness Coaching carries targeted messaging.

- **Foundation, tagline, messaging (D-024, D-025, D-032):** Brand Foundation adopted in full. Tagline "Whole-person wellness for stronger bodies and fuller lives." Homepage headline "Whole-person wellness, built around you." Primary CTA "Start Where You Are." Language guardrails include careful use of "hormone balance."

- **Naming rules (D-038):** Full name in all listings and metadata; never "TAB Wellness"; tabwellnesscollective.com primary, tabmassage.com kept permanently.

- **Visual identity (D-039, D-047, D-048, D-053, D-027):** Hybrid symbol and wordmark; Step 18 service icons permitted; production proceeds in parallel with clearance; external designer produces the files. Canonical tokens: Cormorant Garamond and Manrope; Sand \#EDE7DC, Linen \#DCCFBD, Sage \#97A07C, Olive \#5A6046, Terracotta \#C0784C, Deep Terracotta \#A85F3A, Charcoal \#252724, Cream \#F8F5EF, White \#FFFFFF.

- **Transition (D-040):** Five phases with a clearance go/no-go gate; accounts, Timely, and Stripe renamed in place; "formerly TAB Massage & Fitness" shown for 90 to 180 days; three client communications.

### Experience

- **Service pillars (D-028):** Definitions, audiences, approach, and anchor principles, each bounded by professional scope of practice.

- **Journey and operating model (D-030, D-031):** Eight internal stages plus Evolve; seven experience principles; success is never measured by maximizing service use. Seven client artifacts: Get Started form, client profile, service intakes, Wellness Plan, progress review, handoff, continuation conversation.

- **Public website (D-033):** Sitemap, URL scheme, homepage sequence, service-page template, local SEO, and redirect plan.

- **Self-tracking (D-019):** Permitted, including health measures, within D-042 controls.

### Build

- **Portal (D-034, D-045):** My TAB launches after the public site; appointments through Timely client login, billing through the Stripe customer portal. MVP roles are owner-practitioner and client; the data model supports a team.

- **Content and accessibility (D-036, D-037):** Payload CMS; WCAG 2.2 AA; responsive web app before any native app.

- **Analytics (D-046):** Plausible on public pages; Meta pixel and Tag Manager only on public pages once ads start; never in My TAB or on health-related forms.

- **Forms (D-054):** Start Where You Are and contact submissions go by email to info@tabwellnesscollective.com; subject lines carry no personal details; the form asks visitors not to include medical details.

- **Build approach (D-055):** One config-driven Next.js codebase covering the public site, My TAB, and the practice workspace. Missing assets and values are placeholders that degrade gracefully. Further development moves to Claude Code.

### Coaching agents

- **Data boundary (D-017, proposed):** Any AI that processes client health data must run through a BAA-covered provider under D-042.

## Architecture decision records

Each record gives context, options considered, the decision, and consequences. D-002 and D-008 are kept for history; their replacements follow.

| ADR | Context | Options | Decision | Consequences |
|----|----|----|----|----|
| D-001 Own the experience, rent operations | Goal was a custom portal with booking, profile, content, products, and messaging to cut cost; Timely Elevate already covers booking, self-service, forms, packages, deposits | \(a\) Build everything custom; (b) buy an all-in-one platform; (c) thin portal, keep Timely and Stripe | \(c\) | Build effort goes to brand, content, programs. Appointment actions stay in Timely. Timely remains a paid dependency |
| D-002 No health data in owned systems (superseded) | Hormone coaching and intake involve health information; a breach would be existential | \(a\) Store in owned database; (b) keep it in Timely only | \(b\) | Removed most compliance burden but limited personalization. Replaced by D-042 |
| D-003 Timely by embed | Timely has no public API; Zapier is Innovate-only and read-only | \(a\) Embed only; (b) upgrade and sync via Zapier; (c) switch platforms | \(a\) at launch; (b) revisited under D-015 | No native appointment view in the portal at launch |
| D-004 Stripe for digital revenue | Stripe already provisioned; course platforms add monthly fees | \(a\) Stripe Checkout and Billing with portal-gated access; (b) Kajabi or similar | \(a\) | Portal must implement entitlements. No new platform fee |
| D-005 Core stack | Need a modern, secure, scalable stack with few vendors | Next.js vs Webflow or Framer; Supabase vs Neon plus Auth.js; Vercel vs Cloudflare | Next.js, TypeScript, Tailwind, Supabase, Vercel, Cloudflare, Bunny Stream, Resend, GitHub | One codebase; developer skills needed to change it. Cloudflare and Bunny Stream unused so far (A-03) |
| D-006 Paid tiers from launch | Free tiers restrict commercial use or pause inactive projects | — | Vercel Pro and Supabase Pro, about \$45 per month | Superseded in cost by D-042: about \$1,300 per month once HIPAA tiers apply (R-025) |
| D-007 Deferred capabilities | Secure messaging, custom scheduling, native apps add cost or duplicate Timely | — | Defer all three; revisit with usage data | Client messaging stays in existing channels; portal uses check-in replies instead |
| D-042 Sensitive-data portal | Step 16 made My TAB hold profiles, progress, intakes, and practitioner notes | Keep D-002 or accept a sensitive-data design | Accept: HIPAA-eligible infrastructure, BAAs, RLS, audit logging, MFA | Cost rises about 26 times (R-025); AI touching this data needs BAA providers (D-017) |
| D-052 Payment ownership | Timely and Stripe could both charge clients | Timely only; Stripe only; split | Split: Timely for appointments and packages, Stripe for digital products and subscriptions | One Stripe customer per client mapped in My TAB; webhooks required |

### Open architecture questions

These need an owner answer before they become decisions; none should be resolved in code.

| ID | Question | Recommendation | Blocks |
|----|----|----|----|
| A-01 | Gate HIPAA-tier spend (about \$1,300 per month) on legal review? | Yes. Keep the design; buy the tier only when counsel confirms and Phase 2 data features go live | Phase 2 |
| A-02 | Wire Payload before or after Phase 1 launch? | After. Launch on content files; wire Payload when a non-developer needs to edit | Content editing |
| A-03 | Keep Cloudflare and Bunny Stream from D-005? | Drop Cloudflare for now; defer Bunny Stream until program video exists | Amends D-005 |
| A-04 | Start form: email only, or persist submissions? | Email only for Phase 1; route intake into My TAB when it launches | D-042 boundary |
| A-05 | Audit sensitive reads, not just writes? | Yes for practitioner notes and plans in Phase 2; confirm with counsel | Phase 2 |
| A-06 | Monitoring and error tracking | Vercel logs plus Sentry with PII scrubbing; never capture portal request bodies | Launch |

## Risk register

Twenty-eight risks; seven are rated high likelihood and high impact: R-002, R-010, R-012, R-016, R-017, R-024, and R-025.

| ID | Risk | Likelihood | Impact | Mitigation | Related | Status |
|----|----|----|----|----|----|----|
| R-001 | Brand work starts before strategy settles, forcing rework | Medium | High | Strategy gate before Brand | D-012 | Open |
| R-002 | TAB Massage name and domain limit a national coaching brand | High | High | Brand architecture decision | D-012, D-021 | Mitigating |
| R-003 | 1:1 coaching becomes the default offer, capping revenue by hours | Medium | High | Offer ladder with group and self-paced tiers | D-010 | Mitigating |
| R-004 | Health data leaks into owned systems or AI prompts; more likely under Step 16's portal design | Medium | High | HIPAA-eligible infrastructure with BAAs; RLS; audit logging; MFA; legal review; agent input limits | D-042, D-017 | Open |
| R-005 | Owned code goes unmaintained, repeating the WordPress outcome | Medium | Medium | Automated updates, managed services, patch routine | D-005 | Open |
| R-006 | Search ranking and local bookings drop at cutover | Medium | High | Redirect map (64 URLs, built); Google Business Profile update; Step 19 SEO checklist | D-040 | Open |
| R-007 | Timely's integration ceiling limits the portal experience | Medium | Medium | Revisit platform with post-launch usage data | D-003 | Open |
| R-008 | Six parallel workstreams cause scope creep and rework | Medium | Medium | Sequenced backlog; register updated every session | Program | Open |
| R-009 | Coaching demand is unproven: under 10 clients and 15% of revenue | Medium | High | Validate with a pilot cohort before building full programs | D-010 | Open |
| R-010 | One practitioner delivers all virtual training and coaching | High | High | Self-service and async tiers; capped 1:1; codified method; coaching agents | D-010, D-017 | Open |
| R-011 | Hormone coaching drifts into medical advice or unsupported claims | Medium | High | Step 15 language guardrails; Step 13 scope boundaries; clinician referral path; content review | D-032, D-017 | Mitigating |
| R-012 | Marketing to several segments at once dilutes focus and budget | High | High | Equal pillar weighting; track results by pillar and rebalance on evidence | D-049, D-050 | Open |
| R-013 | Youth athletes are minors: consent, safeguarding, children's data | Medium | High | Segment deferred; guardian accounts and legal review if pursued | D-049 | Open |
| R-014 | Unsupervised virtual training injures older or at-risk clients | Medium | High | Mandatory screening and medical clearance for virtual clients; waiver; insurance review | D-049 | Open |
| R-015 | Client self-tracking puts health data in owned systems | High | Medium | Closed: D-042 permits self-tracking within sensitive-data controls | D-019, D-042 | Closed |
| R-016 | Content built from scratch by one practitioner puts content on the critical path | High | High | Minimum launch catalog; record the pilot cohort as program content; content agents | D-010 | Open |
| R-017 | Year-one revenue is met through 1:1 alone and scalable tiers never get built | High | High | Year-one success requires cohort and self-paced launch plus list growth | D-011 | Open |
| R-018 | Promoting coaching erodes the massage experience that funds the business | Low | Medium | Client-led conversation after treatment only; no pitching on the table | D-013, D-051 | Open |
| R-019 | About 5 marketing hours a week can't sustain a content cadence | High | Medium | One pillar piece cut into many; batch filming; content agents prioritized | D-014 | Open |
| R-020 | Other businesses use "TAB Wellness"; clearance could force changes | Medium | High | Trademark counsel before major spend; never use "TAB Wellness" as shorthand | D-020, D-038 | Open |
| R-021 | Portal and operating model built for a team the business doesn't have | Medium | Medium | Model for a team, build for one | D-045 | Mitigating |
| R-022 | Visual identity exists only as raster images, not production-ready or registrable | Medium | Medium | Designer produces vector masters | D-027, D-039 | Open |
| R-023 | Identity production spend before clearance is lost if the name must change | Medium | Medium | Start clearance now; limit spend to digital masters before print or signage | D-048, R-020 | Open |
| R-024 | Portal Phase 2 scope delays the pilot cohort and year-one success measures | High | High | Prioritize cohort capability; keep a lightweight interim delivery path | D-042, D-043 | Open |
| R-025 | HIPAA-eligible hosting raises platform cost from about \$50 to \$1,300+ per month, over 60% of year-one revenue | High | High | Legal review first; written quotes; subscribe only when sensitive-data features go live (A-01) | D-042, D-006 | Open |
| R-026 | Row-level security is written but untested; a gap could expose one client's data to another | Medium | High | Automated RLS tests before any real client data: cross-client reads and client access to practitioner notes | D-042, D-045 | Pending register entry |
| R-027 | Start form free text may route health details through email systems without a BAA | Medium | Medium | "No medical details" guidance; no personal data in subjects; move intake into My TAB in Phase 2 (A-04) | D-054, D-042 | Pending register entry |
| R-028 | Documentation drift: Step 16, the register, and the codebase diverge and mislead development | High | Medium | docs/ARCHITECTURE.md governs the build; changes go through the register; reconcile each session | D-041 | Pending register entry |

## Discrepancies from the Steps 13 to 19 review

All thirteen were resolved on 2026-09-27 through the [review page](https://claude.ai/artifact/2qY14n27Mz9iHbNx7g1bU4); each became the decision shown.

| ID | Discrepancy | Priority | Direction | Resolved by |
|----|----|----|----|----|
| X-01 | My TAB stores health data | Critical | Sensitive-data system on HIPAA-eligible infrastructure | D-042 |
| X-02 | Virtual growth focus versus local practice | Critical | Both; digital programs and cohorts in portal Phase 2 | D-043 |
| X-03 | Offer ladder versus practitioner-assigned programs | High | Both templates and packaged products | D-044 |
| X-04 | Operating model built for a team | High | Model for a team, build for one | D-045 |
| X-05 | Privacy-first analytics versus ad tracking | High | Plausible, plus pixels on public pages when ads start | D-046 |
| X-06 | Service icons break the avoid list | High | Avoid list amended | D-047 |
| X-07 | Visual identity before clearance | Medium | Production proceeds now | D-048 |
| X-08 | Brand name status | Medium | Remains Accepted | D-020 |
| X-09 | Older adults in scope | Medium | Fully in scope, virtual included | D-049 |
| X-10 | Marketing weight | Medium | All four pillars equal | D-050 |
| X-11 | Bridge versus cross-service protocol | Low | Bridge under the protocol | D-051 |
| X-12 | Two sources of truth | Low | Playbook for reference, register for decisions | D-041 |
| X-13 | Timely versus direct Stripe payments | Low | Split ownership | D-052 |

The pattern across these answers was scope expansion while constraints held flat: one practitioner, about 5 marketing hours a week, and a \$25,000 year-one target. R-024 and R-025 track the consequences.

## Document and artifact inventory

Every program document, where it lives, and what it's authoritative for.

| Document | Where | Authoritative for | Status |
|----|----|----|----|
| TAB Decision and Risk Register | [Claude Doc](https://claude.ai/code/artifact/5e150ace-5714-4dfa-b1f2-985f69afdd61) | Decisions and risks (system of record) | Active; needs D-053 to D-055 and R-026 to R-028 added |
| This master record | This doc | Consolidated read-through | Active |
| Brand Foundation | Project files | Promise, mission, voice, values, positioning (D-024) | Adopted |
| Step 13 Service Pillars | Project files | Pillar definitions and scope (D-028) | Accepted |
| Step 14 TAB Method and Customer Journey | Project files | Method, journey, operating model (D-029 to D-031) | Accepted |
| Step 15 Messaging Architecture | Project files | Headlines, CTAs, language guardrails (D-032) | Accepted |
| Step 16 Website and Digital Experience | Project files | Strategy for site and My TAB (D-033 to D-035) | Accepted; technical detail superseded by ARCHITECTURE.md |
| Step 17 Naming Validation v2 | Project files | Naming rules, clearance plan (D-038) | Accepted |
| Step 18 Visual Identity | Project files | Identity direction (D-039, D-047) | Accepted |
| Step 19 Rebrand Transition Plan v2 | Project files | Cutover phases and communications (D-040) | Accepted |
| Design Tokens (JSON and CSS) | Project files | Canonical colors, type, spacing (D-053) | Active |
| Steps 13 to 19 review page | [Artifact](https://claude.ai/artifact/2qY14n27Mz9iHbNx7g1bU4) | Owner direction on X-01 to X-13 | Closed |
| Codebase tab-wellness-collective | Zip handoff | Phase 1 site, Phase 2 foundation | Builds clean; not deployed |
| CLAUDE.md | Codebase | Guardrails for Claude Code | Active |
| docs/ARCHITECTURE.md | Codebase | Technical architecture (governs the build) | Active |
| docs/HANDOFF.md | Codebase | Build status, launch checklist, Phase 2 sequence | Active |
| supabase/migrations/0001_my_tab.sql | Codebase | Data model, RLS, audit | Written; untested (R-026) |
| Architecture Plan (September 25) | Claude Doc | Nothing | Retired (D-041) |

## Open items, in order

Two owner decisions come first; everything after them is sequenced so nothing starts before what it depends on.

**Owner decisions**

- [ ] A-01: gate HIPAA-tier spend on legal review (blocks Phase 2)

- [ ] A-03: keep or drop Cloudflare and Bunny Stream (amends D-005)

- [ ] Log D-053 to D-055 and R-026 to R-028 in the register

- [ ] Formal review of baselined decisions D-010, D-011, D-013, D-014, D-015

**Carried over from the register**

- [ ] Clearance for TAB Wellness Collective: USPTO search, Michigan business registry, social handles (R-020, R-023)

- [ ] Register tabwellnesscollective.com once clearance passes

- [ ] Compliance review of consumer health-data obligations (feeds A-01)

- [ ] Ask Timely support about partner API, booking deep links, widget styling, intake data protections

- [ ] Confirm current Vercel, Supabase, and Timely pricing

- [ ] Consent audit: count marketing opt-ins in Timely; start collecting opt-ins at check-in

- [ ] Confirm total active massage clients to size the warm pipeline

- [ ] Hand the logo and visual identity brief to the external designer

**Program backlog (from the register)**

- [ ] Program architecture: redefine the offer ladder within the four pillars (D-010, D-044)

- [ ] Personas for launch segments

- [ ] Photography direction and presence kit (waits on logo files)

- [ ] Coaching agent data boundary (D-017)

**Build, Phase 1 launch**

- [ ] Fill config/site.ts: Timely URLs, phone, address, hours, logo and icon files

- [ ] Replace draft copy (18 items), including bio, story, service FAQs, legal pages

- [ ] Verify the sending domain in Resend; set Plausible; turn draft flags off

- [ ] Add a Content-Security-Policy; run accessibility and Lighthouse passes

- [ ] Cutover per Step 19: DNS to Vercel, confirm redirects, update Google Business Profile

**Build, Phase 2 (after A-01)**

- [ ] Create the Supabase project and write RLS tests before any real data (R-026)

- [ ] Finish Supabase data mappings and server actions

- [ ] Stripe checkout and webhooks for sellable programs

- [ ] Wire Payload CMS (A-02)
