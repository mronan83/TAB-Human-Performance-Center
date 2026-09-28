**TAB**

**WELLNESS COLLECTIVE**

**STEP 16**

Website & Digital Experience

Public website architecture, homepage story, service pages, My TAB client portal, technology and integrations, content system, conversion, SEO, accessibility, analytics, and implementation roadmap

## TRANSFORM. ALIGN. BECOME.

Comprehensive recommended digital-experience architecture • September 2026

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr>
<th><p><strong>CORE DIGITAL PRINCIPLE</strong></p>
<p><em>The public website explains TAB. My TAB helps each client experience TAB.</em></p></th>
</tr>
</thead>
<tbody>
</tbody>
</table>

# 16.0 Executive Overview

Step 16 translates the TAB brand, service architecture, customer journey, and messaging system into a practical digital experience. It defines how prospective clients discover TAB, understand the whole-person model, choose a starting point, book services, and continue their relationship through a secure client portal.

The recommended architecture deliberately separates the responsibilities of the public website, My TAB, Timely, and Stripe so that TAB can create a differentiated client experience without unnecessarily rebuilding mature scheduling and payment capabilities.

## Recommended digital model

| **Experience / system** | **Primary responsibility** | **Recommended role** |
|----|----|----|
| Public website | Brand, discovery, education, services, trust, conversion | Explain TAB and help people find a starting point |
| My TAB | Profile, plans, programs, progress, resources, forms, connected experience | System of engagement for the ongoing client relationship |
| Timely | Appointments, booking, appointment history, consult forms where appropriate | Scheduling system of record |
| Stripe | Payments, billing, subscriptions, invoices | Financial system of record |

## Step 16 at a glance

| **Section** | **Decision / recommendation** |
|----|----|
| 16.1 Digital Experience Architecture | Two connected experiences: public TAB + authenticated My TAB; do not replace Timely or Stripe unnecessarily. |
| 16.2 Sitemap & Navigation | Home, Services, TAB Method, About, Resources + persistent Start Where You Are, Book, My TAB actions. |
| 16.3 Homepage Story | Sell the approach before the appointment type: Brand → belief → services → method → personalization → conversion → trust → resources. |
| 16.4 Service Pages | Use one reusable outcome-led page template across all four pillars, with service-specific content and appropriate scope language. |
| 16.5 My TAB Portal | Purpose-built whole-person engagement layer with plans, programs, progress, resources, appointments, forms, billing, and profile. |
| 16.6 Technology & Integrations | Next.js + Payload + Supabase/Postgres recommended; Timely and Stripe remain systems of record; integrate through supported links/APIs/Zapier/webhooks. |
| 16.7 Content & Resources | One governed content model serving public resources, service education, assigned My TAB resources, programs, and workshops. |
| 16.8 Conversion / SEO / Accessibility / Measurement | Low-pressure conversion model, local/service SEO, WCAG 2.2 AA target, privacy-aware analytics, and journey-based measurement. |

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr>
<th><p><strong>ARCHITECTURE RULE</strong></p>
<p><em>Do not build My TAB to replace Timely or Stripe. Build My TAB to provide the connected wellness experience neither system is designed to provide.</em></p></th>
</tr>
</thead>
<tbody>
</tbody>
</table>

# Contents

**16.1 Digital Experience Architecture**

**16.2 Public Website Sitemap & Navigation**

**16.3 Homepage Story**

**16.4 Service Page Architecture**

**16.5 My TAB Client Portal**

**16.6 Technology & Integration Architecture**

**16.7 Content, Resources & Education**

**16.8 Conversion, SEO, Accessibility & Measurement**

**16.9 Implementation Roadmap & MVP**

Appendix A Recommended Data Model

Appendix B Current Platform Validation Notes

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr>
<th><p><strong>USE THIS DOCUMENT WITH</strong></p>
<p>Step 13 - Service Pillars; Step 14 - TAB Method &amp; Customer Journey; Step 15 - Messaging Architecture. Step 16 is the digital implementation layer that operationalizes those prior decisions.</p></th>
</tr>
</thead>
<tbody>
</tbody>
</table>

# 16.1 Digital Experience Architecture

The recommended model is two connected experiences: a public TAB website for discovery and conversion, and an authenticated My TAB experience for the ongoing client relationship. The two should feel like one product even when specialized systems operate behind them.

## Public TAB vs. My TAB

| **Public TAB experience** | **My TAB experience**                  |
|---------------------------|----------------------------------------|
| Understand TAB            | Understand my TAB relationship         |
| Explore services          | View my plan / current focus           |
| Learn the TAB Method      | Track my progress                      |
| Meet the team             | View / manage appointment access       |
| Read public resources     | Access assigned resources and programs |
| Find a starting point     | Complete check-ins and forms           |
| Book services             | Manage profile and preferences         |
| Contact TAB               | Access billing / membership            |

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr>
<th><p><strong>EXPERIENCE DISTINCTION</strong></p>
<p><em>The public website explains TAB. My TAB helps me experience TAB.</em></p></th>
</tr>
</thead>
<tbody>
</tbody>
</table>

## My TAB working portal concept

- **My TAB Home —** personalized dashboard, current focus, next appointment, plan, active program, and upcoming review.

- **My Plan —** client-facing TAB Wellness Plan and Transform / Align / Become journey.

- **My Programs —** strength programs, exercises, coaching activities, habits, worksheets, videos, milestones, and practitioner guidance.

- **My Progress —** client-defined goals, reflections, milestones, measurements where useful, and progress reviews.

- **My Appointments —** initially route to Timely Client Login rather than rebuilding scheduling.

- **My Resources —** assigned content plus access to the broader TAB resource library.

- **Forms & Documents —** client profile, intakes, consents, check-ins, uploads, and shared documents.

- **Billing & Membership —** secure entry to Stripe-managed billing/subscription functionality plus summarized status in My TAB when useful.

- **My Profile —** contact information, preferences, goals, accessibility needs, and relevant client-controlled context.

## Recommended system responsibilities

| **System** | **System-of-record responsibility** | **Do not duplicate unnecessarily** |
|----|----|----|
| My TAB | Whole-person relationship, plan, program, progress, resources, shared summaries, portal preferences | Payment card handling; core calendar scheduling |
| Timely | Appointment booking, booking history, online booking operations, Timely Consult where chosen | TAB program/progress model |
| Stripe | Payments, invoices, subscriptions/memberships, payment-method management | Client wellness records |
| CMS | Public content, services, team, resources, FAQs, program templates/content | Transactional appointment/payment state |

## Sensitive-data principle

Because TAB may handle information about pregnancy, surgery, chronic illness, medications, mobility, contraindications, life circumstances, and practitioner notes, the digital platform should be designed as a sensitive-data application from the beginning. Legal counsel should determine which federal and state privacy or health-information requirements apply to TAB’s specific services and provider relationships; the technical architecture should not assume that a wellness business is automatically outside those obligations.

- Use least-privilege access and role-based permissions.

- Separate client-visible summaries from internal practitioner notes.

- Use MFA for staff and make strong authentication available to clients.

- Encrypt data in transit and at rest; keep secrets and service keys server-side.

- Maintain auditability for sensitive record access and administrative changes.

- Do not store card data in TAB systems; rely on Stripe for payment-card handling.

- Define data-retention, deletion, backup, and recovery policies before launch.

# 16.2 Public Website Sitemap & Navigation

The website should help a visitor answer three questions quickly: “Is TAB for me?”, “How can TAB help me?”, and “What should I do next?” The information architecture therefore follows visitor intent rather than TAB’s internal organization.

## Primary navigation

| **Primary navigation** | **Persistent actions**            |
|------------------------|-----------------------------------|
| Home                   | Start Where You Are — primary CTA |
| Services               | Book — direct booking path        |
| The TAB Method         | My TAB — client login / portal    |
| About                  |                                   |
| Resources              |                                   |

## Recommended sitemap

- Home

- Services → Massage & Bodywork; Personal Strength Training; Women’s Wellness Coaching; Holistic Life Coaching

- The TAB Method → Start Where You Are; Transform; Align; Become

- About → About TAB; Our Story; Our Team

- Resources → Wellness Articles; Guides & Resources; Events / Workshops; FAQ

- Start Where You Are

- Book

- My TAB

## Top-level visitor journey

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr>
<th><p><strong>NAVIGATION MODEL</strong></p>
<p><em>Understand TAB → Explore how TAB can help → Find your starting point → Experience TAB → Continue through My TAB.</em></p></th>
</tr>
</thead>
<tbody>
</tbody>
</table>

## Services landing page

Recommended headline: “Support for how you feel, move, live, and grow.” The page introduces all four services as independently valuable and optionally connected.

| **Service** | **Approved headline** |
|----|----|
| Massage & Bodywork | Care for how your body feels, moves, and recovers. |
| Personal Strength Training | Build strength for the way you want to live. |
| Women’s Wellness Coaching | Wellness that adapts to your life. |
| Holistic Life Coaching | Bring the way you live closer to what matters most. |

## Start Where You Are page

This page should function as both a brand expression and a guided entry point. Visitors who do not know which service fits can describe what they are experiencing, what they want to change, and what they hope to do differently. The page uses the Step 14.4 Get Started form and routes the visitor to direct booking, a brief discovery conversation, a service-specific intake, additional information, or an outside referral when TAB is not the right resource.

## Book experience

The Book action should immediately support two pathways:

- **I know what I want —** go directly to Timely online booking.

- **Help me find my starting point —** go to Start Where You Are.

## Footer / utility navigation

- Explore: Home, Services, TAB Method, About, Resources

- Services: all four service pillars

- Get Started: Start Where You Are, Book, My TAB, Contact

- TAB: Our Story, Our Team, FAQ, Events & Workshops, Gift Cards if offered

- Legal / accessibility: Privacy, Terms, Accessibility, client policies, cancellation policy, appropriate service disclaimers

- Location, hours, contact information, social links

## Recommended URLs

| **Page**                   | **URL**                              |
|----------------------------|--------------------------------------|
| Home                       | /                                    |
| Services                   | /services                            |
| Massage & Bodywork         | /services/massage-bodywork           |
| Personal Strength Training | /services/personal-strength-training |
| Women’s Wellness Coaching  | /services/womens-wellness-coaching   |
| Holistic Life Coaching     | /services/holistic-life-coaching     |
| The TAB Method             | /tab-method                          |
| About                      | /about                               |
| Our Story                  | /about/our-story                     |
| Team                       | /about/team                          |
| Resources                  | /resources                           |
| Articles                   | /resources/articles                  |
| Guides                     | /resources/guides                    |
| Events                     | /events                              |
| FAQ                        | /faq                                 |
| Start Where You Are        | /start                               |
| Book                       | /book                                |
| Contact                    | /contact                             |
| My TAB                     | /my-tab                              |

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr>
<th><p><strong>NAVIGATION RULE</strong></p>
<p><em>Organize the website around what the visitor is trying to understand or do — not around TAB’s internal organization.</em></p></th>
</tr>
</thead>
<tbody>
</tbody>
</table>

# 16.3 Homepage Story

The homepage should move someone from “What is TAB?” to “This feels like it could fit me.” to “I know what to do next.” It should sell the approach before the appointment type.

| **Section** | **Headline / purpose** | **Primary action** |
|----|----|----|
| 1\. Hero | Whole-person wellness, built around you. | Start Where You Are |
| 2\. Core idea | Your wellbeing doesn’t happen in pieces. Neither should your care. | Continue into services / method |
| 3\. Four pillars | Support for how you feel, move, live, and grow. | Explore each service |
| 4\. TAB Method | Start where you are. Transform. Align. Become. | Learn About the TAB Method |
| 5\. Personalization | Built around people, not programs. | Reinforce differentiation |
| 6\. Guided conversion | You don’t need to know exactly where to start. | Tell Us What You Need |
| 7\. Proof / trust | Real people. Personal progress. | Testimonials / team / credentials |
| 8\. Resources | Wellness shouldn’t stop when your appointment ends. | Explore TAB Resources |
| 9\. Closing invitation | Start where you are. | Start Where You Are |

## Hero

Headline: “Whole-person wellness, built around you.”

Support: “TAB brings massage, strength, wellness, and coaching together in one personalized approach to help you feel better, move better, live stronger, and grow with intention.”

- Primary CTA: Start Where You Are

- Secondary CTA: Explore Our Services

- Utility CTA: Book an Appointment

## Core idea / differentiation

Use the belief that physical comfort, movement, confidence, independence, stress, recovery, habits, responsibilities, and major life changes influence one another. This section establishes why TAB is a Collective rather than four unrelated services.

## Four connected ways TAB can help

Use the approved service headlines and concise descriptions. Close with the cross-service standard: “Start with the service that fits what you need today. As your needs evolve, TAB can help connect other areas of support when they genuinely make sense for your goals.”

## TAB Method

Use a simple visual: Start Where You Are → Transform → Align → Become. Keep the public explanation simple; do not expose the full internal eight-stage journey on the homepage.

## Personalization

- **We listen first.** Understand before recommending.

- **We personalize.** Your plan should fit your life.

- **We adapt.** When your needs change, the approach can change too.

## Guided conversion

Headline: “You don’t need to know exactly where to start.” Supporting copy should invite visitors to describe what they are experiencing, what they want to change, or what they hope to be able to do. Primary CTA: Tell Us What You Need. Secondary CTA: I Know What I Want — Book a Session.

## Proof / trust

- Client testimonials focused on feeling understood, supported, and more capable

- Years serving the community

- Practitioner credentials and specialized training

- Referral relationships and community partnerships

- Review ratings when strong and current

- Client stories without dramatic before/after claims

## Homepage hierarchy rule

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr>
<th><p><strong>APPROVED SEQUENCE</strong></p>
<p><em>Brand → Problem / belief → Services → Method → Personalization → Conversion → Trust → Resources → Invitation.</em></p></th>
</tr>
</thead>
<tbody>
</tbody>
</table>

# 16.4 Service Page Architecture

Each service page should feel unmistakably part of TAB while giving the visitor enough detail to decide whether the service fits. Use one reusable structure across all four pillars; vary depth, examples, safety information, and conversion path by service.

## Standard service page anatomy

1\. Outcome-led hero headline + service label

2\. Short client-facing description

3\. Who this is for / common reasons people come to TAB

4\. What clients may gain

5\. How TAB approaches the service differently

6\. What the experience looks like / what to expect

7\. Transform. Align. Become. service connection

8\. Specialized areas / programs / focus areas

9\. Practitioner(s), credentials, and appropriate scope information

10\. FAQ + related resources + next-step CTA

## Hero standard

| **Service** | **Primary headline** | **Recommended CTA** |
|----|----|----|
| Massage & Bodywork | Care for how your body feels, moves, and recovers. | Book Massage & Bodywork |
| Personal Strength Training | Build strength for the way you want to live. | Explore Personal Strength Training / Schedule a Strength Consultation |
| Women’s Wellness Coaching | Wellness that adapts to your life. | Schedule a Wellness Conversation |
| Holistic Life Coaching | Bring the way you live closer to what matters most. | Schedule a Coaching Conversation / Start with What Matters |

## Service-page content rules

- Lead with what the client wants to experience; name the service second.

- Use “who it’s for” recognition language so visitors can see themselves without diagnosing themselves.

- Describe outcomes as support / potential benefits rather than guarantees.

- Make service scope and referral boundaries easy to understand without making the page feel legalistic.

- Use the approved anchor principle as a memorable point of view.

- Show related services only when the relationship is genuine; do not create forced cross-sell carousels.

- Every page should offer both a direct CTA and a “not sure?” pathway to Start Where You Are.

## Massage & Bodywork page — additional modules

- Specialized support cards: relaxation / everyday tension, training recovery, prenatal / postpartum, post-surgical support where appropriate and cleared, manual lymphatic drainage, chronic-illness comfort, mobility / movement support.

- What to expect before, during, and after a session.

- Contraindication / clearance language written clearly and non-alarmingly.

- Preferences and comfort: pressure, positioning, areas to avoid, communication, draping.

- FAQ examples: first massage, pregnancy, after surgery, lymphatic drainage, chronic illness, what to wear, frequency, when medical clearance may be needed.

## Personal Strength Training page — additional modules

- Who it serves: new to strength, returning after time away, healthy aging, balance/stability, recreational goals, return to activity, capability and independence.

- What a personalized plan may include: resistance, functional movement, mobility, stability, balance, conditioning, recovery.

- How starting ability is assessed and how progression is adjusted.

- Non-intimidating environment and support for people who do not identify as “gym people.”

- FAQ examples: experience required, session format, frequency, injuries/surgery, independent exercise, equipment, age / ability level.

## Women’s Wellness Coaching page — additional modules

- Life-stage support: pregnancy/postpartum lifestyle support, perimenopause, menopause, caregiving, career/life transitions, aging.

- Domains: energy, sleep, stress, movement, recovery, nourishment habits, boundaries, routines, self-care, health advocacy.

- Explicit distinction between coaching and medical diagnosis/treatment.

- FAQ examples: who coaching is for, how sessions work, what coaching can/cannot do, coordination with healthcare professionals, cadence, virtual/in-person availability if offered.

## Holistic Life Coaching page — additional modules

- Domains: work/career, relationships, time, habits, family, purpose, boundaries, personal growth, life transitions.

- Explain collaborative coaching, accountability, and the difference between coaching and therapy.

- Show example outcomes such as clarity, priorities, stronger boundaries, follow-through, intentional routines, and reduced overwhelm without promising mental-health outcomes.

- FAQ examples: coaching vs therapy, session cadence, goal setting, accountability, confidentiality / documentation, virtual options if offered.

## Service-page SEO / metadata pattern

| **Element** | **Pattern** |
|----|----|
| Title tag | \[Service\] in \[Location\] \| TAB Wellness Collective |
| Meta description | Human summary of the service, who it helps, and the grounded TAB approach; avoid keyword stuffing. |
| H1 | Outcome-led approved headline |
| Primary service label | Use as H2 / eyebrow near the hero |
| Internal links | TAB Method, relevant team member(s), Start, Resources, related service only where relevant |
| Structured data | Organization / LocalBusiness + Service; FAQ only when visible and eligible |

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr>
<th><p><strong>SERVICE-PAGE RULE</strong></p>
<p><em>Lead with what the client wants to experience. Explain the service. Show how TAB approaches it differently. Then invite the next step.</em></p></th>
</tr>
</thead>
<tbody>
</tbody>
</table>

# 16.5 My TAB Client Portal

My TAB should be the client-facing expression of the TAB Method: a secure place where a person can understand their current focus, access programs and resources, reflect on progress, and move between services without feeling like they are starting over.

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr>
<th><p><strong>PORTAL PROMISE</strong></p>
<p><em>My TAB should help the client answer: What matters now? What am I working on? What comes next? What have I learned?</em></p></th>
</tr>
</thead>
<tbody>
</tbody>
</table>

## Recommended My TAB information architecture

| **Area** | **Client experience** | **Primary data / action** |
|----|----|----|
| Home | Personalized dashboard | Current focus, next appointment, active program, next review, quick actions |
| My Plan | Shared whole-person plan | Goal, current focus, Transform/Align/Become, services involved, progress definition, review date |
| My Programs | Assigned structured work | Exercises, sessions, habits, coaching activities, worksheets, videos, milestones |
| My Progress | Reflection + meaningful progress | Reviews, milestones, client reflections, measurements where appropriate, next focus |
| My Appointments | Scheduling access | Link/deep-link/embed Timely Client Login; native summary later if supported |
| My Resources | Personal learning library | Assigned resources + saved/public content |
| Forms & Documents | Client-controlled forms | Intakes, consents, check-ins, uploads, shared documents |
| Billing & Membership | Financial self-service | Stripe portal launch + membership/package summary when available |
| My Profile | Client-controlled context | Contact, preferences, accessibility, goals, relevant personal context |

## My TAB Home — recommended dashboard

- Welcome + current focus statement

- Next appointment / booking action

- TAB Method stage / visual progress indicator (lightweight, not gamified)

- Active plan summary

- Current program / next activity

- Next progress review or check-in

- Assigned resource(s)

- Quick actions: Book, Message / Contact, Complete Form, View Program, Billing

## My Plan

Use the Step 14.4 TAB Wellness Plan as the underlying object. The client sees the version created together: what matters most, primary goal, current focus, services involved, client actions, TAB actions, how progress will be recognized, and when the plan will be reviewed.

## My Programs

Programs should be reusable templates that practitioners can personalize. A single program engine can support strength training and coaching without forcing both into the same content style.

| **Program component** | **Examples** |
|----|----|
| Program template | Foundational Strength - 8 weeks; Return to Movement; Menopause Wellness Foundations; Life Alignment |
| Modules / weeks | Week 1 Foundations; Recovery Basics; Clarify Priorities |
| Activities | Exercise, habit, worksheet, reflection, video, reading, check-in |
| Assignment | Due / recommended date, frequency, optional/required flag, practitioner note |
| Client response | Complete, skipped, rating, reflection, pain/effort note where appropriate |
| Practitioner response | Feedback, modification, progression, next assignment |

## My Progress

- Original client-defined goal and current goal

- Progress-review responses from Step 14.4

- Milestones and qualitative wins

- Strength / mobility / habit measures only where useful and appropriate

- “What I have learned” reflections

- Changes in circumstances or priorities

- Next focus and review date

Do not turn the portal into a scoreboard. TAB’s progress model must support qualitative outcomes such as confidence, comfort, consistency, clarity, independence, and reduced overwhelm alongside measurable physical performance.

## Appointments: Timely-first strategy

At launch, My Appointments should use Timely Client Login rather than recreate calendar management. Timely currently supports client login for booking, future and historic appointment access, consultation forms, and client-detail management; Timely also provides custom login links/buttons and website booking connection options. Native appointment cards can be added later if supported integration data is reliable enough.

## Billing: Stripe-first strategy

Billing & Membership should launch a secure Stripe customer portal for supported billing functions rather than collecting card details in My TAB. My TAB may display a summary such as membership name, renewal date, package balance, or billing status when data is available, while payment methods, invoices, subscriptions, and payment history remain with Stripe.

## Client-visible vs. internal notes

| **Client-visible / shared** | **Internal practitioner / operational** |
|----|----|
| Shared session summary / next steps | Raw session notes |
| TAB Wellness Plan | Internal practitioner observations |
| Assigned program and resources | Risk / scope / escalation notes |
| Client-entered check-ins / reflections | Internal handoff details not intended for client display |
| Progress review summary | Audit / administrative metadata |

The system should support explicit “shared with client” content rather than assuming all notes are client-facing.

## Roles and permissions

| **Role** | **Access principle** |
|----|----|
| Client | Only own shared/profile/program/progress data; client-editable fields explicitly defined |
| Practitioner | Clients assigned to them or explicitly shared; service-specific records within role/scope |
| Lead / clinical or practice supervisor if applicable | Approved supervisory access; auditable |
| Front desk / operations | Scheduling/contact/admin data only; no broad access to sensitive coaching or practitioner notes unless necessary |
| Owner / administrator | System administration; sensitive-data access should still be role-limited and audited rather than automatically universal |

## Portal notification principles

- Notify only when there is a meaningful action: new program, check-in due, new shared summary, appointment reminder, billing action, plan review.

- Do not expose sensitive health/coaching content in email/SMS notification previews.

- Let clients choose preferred notification channels where practical.

- Avoid engagement tactics that conflict with the “build ownership, not dependence” principle.

## Mobile strategy

Build My TAB mobile-first as a responsive web application / PWA before investing in native iOS/Android applications. A PWA can provide a home-screen presence and a strong mobile experience while keeping one codebase. Native apps should be considered only when there is a validated need for device capabilities, app-store presence, or high-frequency engagement that materially improves the client experience.

## My TAB MVP

1\. Secure login

2\. Client profile

3\. TAB Wellness Plan

4\. My Programs

5\. Assigned resources

6\. Progress / check-ins

7\. My Appointments → Timely

8\. Billing & Membership → Stripe

9\. Forms / documents

10\. Shared session summaries / next steps

## Future portal capabilities

- Practitioner secure messaging

- Native appointment summaries / synchronization

- Automated plan-review workflows

- Membership / package entitlements

- Push notifications

- Deeper exercise tracking and media

- Group programs / cohorts

- Workshop registration

- Digital-only paid programs

- Referral-partner coordination with explicit client consent

- Native mobile application if justified

# 16.6 Technology & Integration Architecture

The recommended approach is a purpose-built TAB website and My TAB portal using open-source infrastructure, while preserving Timely and Stripe as specialist systems of record. This gives TAB ownership of its experience and client model without creating unnecessary scheduling or payment risk.

## Recommended stack

| **Layer** | **Recommended technology** | **Reason** |
|----|----|----|
| Web / portal frontend | Next.js / React | One modern responsive application for public site + My TAB; strong ecosystem and server-side rendering. |
| Content / admin CMS | Payload CMS | Open source, Next.js-native, admin UI, auth/access controls, file/content management, flexible program/resource content. |
| Client data / relational backend | Supabase / PostgreSQL | Relational data model, auth, Postgres, storage, row-level security, MFA support, self-host option. |
| Scheduling | Timely | Keep appointment booking/history/operations in existing scheduling platform. |
| Payments | Stripe | Keep payments, invoices, subscriptions, and payment methods in existing financial platform. |
| Automation / bridge | Server-side integrations + Zapier where needed | Use supported vendor interfaces; minimize brittle scraping or duplicate data entry. |
| Analytics | Matomo or Plausible; optional GA4 if business needs it | Privacy-aware website measurement; do not send sensitive portal data into marketing analytics. |

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr>
<th><p><strong>RECOMMENDED BUILD PATTERN</strong></p>
<p><em>Custom TAB experience on open-source building blocks — not a generic membership plugin and not a total replacement of Timely / Stripe.</em></p></th>
</tr>
</thead>
<tbody>
</tbody>
</table>

## System-of-record matrix

| **Data domain** | **System of record** | **My TAB behavior** |
|----|----|----|
| Identity / portal account | Supabase Auth (recommended) | Authenticate My TAB; map external Timely / Stripe identifiers |
| Client whole-person profile | My TAB / Postgres | Authoritative TAB profile except fields intentionally mastered in Timely |
| Appointments | Timely | Link / synchronize selected summary fields only |
| Consult forms used for scheduling/service safety | Timely where retained | Do not blindly duplicate; reference/sync only if needed |
| TAB Wellness Plan | My TAB | Authoritative |
| Programs / activities | My TAB + CMS templates | Authoritative |
| Progress reviews / check-ins | My TAB | Authoritative |
| Public resources / service info / team | Payload CMS | Render public and member experiences |
| Assigned resources | My TAB relationship to CMS content | Client-specific assignment |
| Payments / subscriptions / invoices | Stripe | Show safe summary; launch Stripe portal for sensitive billing actions |
| Raw practitioner notes | My TAB secure internal data if moved there | Never expose by default |

## Integration identifiers

Create a single internal client UUID in My TAB and map external platform identifiers rather than using email address as the permanent key. Suggested fields:

- tab_client_id (internal UUID)

- timely_client_id or stable external mapping when available

- stripe_customer_id

- portal_user_id

- primary_practitioner_id

- consent / sharing flags

- last synchronization timestamps

## Timely integration strategy

- Phase 1: use Timely booking widget/link and Client Login directly from the TAB site / My TAB.

- If TAB is on Timely Innovate, use Timely’s documented Zapier connection for supported client fields and next-appointment information rather than screen-scraping.

- Use Timely as the appointment authority; avoid two-way calendar logic unless a supported API contract makes it reliable.

- Use Timely Consult for forms that are tightly coupled to booking/service workflows where it remains operationally useful; use My TAB forms for whole-person plans, progress, programs, and portal-native check-ins.

- Reconcile duplicate-client handling before syncing data; external identifiers should be established after confident matching.

## Stripe integration strategy

- Use Stripe Checkout / Payment Links or existing POS flows for transactions as appropriate.

- Use Stripe Billing + Customer Portal for subscription/payment-method/invoice self-service when the account and product plan support it.

- Store only Stripe customer/subscription/product/price identifiers and safe status metadata in My TAB; never store raw card numbers.

- Use Stripe webhooks to update membership/package status and renewal information in My TAB.

- Define ownership carefully if Timely also participates in payment flows so duplicate charging or conflicting subscription states cannot occur.

## Open-source platform options

| **Tool** | **Best fit for TAB** | **Strengths** | **Recommendation** |
|----|----|----|----|
| Supabase | Client data + auth + secure portal backend | Postgres, Auth, RLS, MFA, storage, self-host option | Preferred backend |
| Payload CMS | Public content + resource/program templates + admin | Open-source, Next.js-native, access control, flexible schema/admin | Preferred CMS |
| Appwrite | Alternative integrated backend | Open-source/self-host, auth, database, storage, functions | Strong alternative to Supabase |
| Directus | Low-code data/admin layer | Granular roles, generated REST/GraphQL APIs, database-centric admin | Consider if TAB values low-code back-office editing over code-first schema |
| Strapi | Alternative content CMS | Open-source/self-host, established content management / APIs | Strong alternative to Payload, less tightly Next.js-native |
| Formbricks | Optional forms / experience surveys | Open-source/self-host, branded surveys, APIs, feedback workflows | Useful optional layer for feedback; do not replace core service intake blindly |
| Matomo / Plausible | Public-site analytics | Open-source/self-host options; privacy-oriented | Recommended over sending portal/sensitive data to ad-tech analytics |

## Why not use one generic open-source portal?

Generic membership/CRM portals can handle accounts, subscriptions, and simple content, but TAB’s differentiator is the relationship between client goals, TAB Method stage, service records, wellness plans, custom programs, assigned activities, progress reviews, and cross-service handoffs. A small purpose-built domain model on open-source infrastructure is likely simpler and more durable than forcing those concepts into a generic association/membership product.

## Recommended logical architecture

| **Layer** | **Components** |
|----|----|
| Experience | Public TAB website + My TAB portal (Next.js) |
| Content | Payload CMS: services, team, resources, FAQs, program templates, content modules |
| Client domain | Supabase/Postgres: profiles, plans, programs, activities, progress, assignments, notes, consent |
| External systems | Timely scheduling + Stripe payments/billing |
| Integration | Server-side API routes, webhooks, scheduled reconciliation, Zapier for supported Timely flows |
| Observability/security | Audit logs, app monitoring, backups, alerts, access reviews, secrets management |

## Security baseline

- MFA mandatory for staff; support MFA / strong auth for clients.

- RLS / object-level authorization so clients can access only their own data and practitioners only assigned/authorized records.

- Separate application roles from database superuser/admin privileges.

- Audit sensitive record reads/changes where practical.

- Encrypt storage and backups; secure file upload/download URLs; malware scanning for uploaded files if accepted.

- No sensitive data in client-side logs, analytics events, URLs, email subject lines, or SMS previews.

- Environment separation: dev/test/prod with synthetic data outside production.

- Dependency patching, vulnerability scanning, incident-response contact and playbook.

- Document backup restoration and test it, not just backups themselves.

## Hosting recommendation

For an initial build, prefer managed infrastructure for the application/database/storage unless TAB has dedicated operational engineering capacity. Open source does not require self-hosting. Self-host only when data-residency, contractual, cost, or control requirements justify taking responsibility for patching, monitoring, scaling, backups, and recovery.

# 16.7 Content, Resources & Education

TAB’s content system should reinforce the brand principle that support extends beyond an appointment while avoiding the trap of becoming a generic wellness blog. Content should help clients understand, prepare, practice, reflect, or decide.

## Content purposes

| **Purpose** | **Examples** |
|----|----|
| Understand | What is lymphatic drainage? What does strength training look like for a beginner? |
| Prepare | Preparing for prenatal massage; what to expect from first training session |
| Practice | Mobility video; coaching worksheet; strength technique guide |
| Reflect | Progress check-in; values/priorities worksheet; habit reflection |
| Decide | Which service might fit? When should I talk to another professional? |
| Continue | Maintenance guidance; independent plan; next-stage learning |

## Recommended content taxonomy

| **Dimension** | **Values / examples** |
|----|----|
| Service pillar | Massage & Bodywork; Personal Strength Training; Women’s Wellness Coaching; Holistic Life Coaching |
| TAB Method | Start Where You Are; Transform; Align; Become; Evolve |
| Client goal / need | Comfort; recovery; strength; mobility; confidence; habits; balance; clarity; stress support |
| Life stage / context | Pregnancy; postpartum; perimenopause; menopause; healthy aging; return after surgery/rehab; caregiving; life transition |
| Format | Article; guide; video; checklist; worksheet; FAQ; workshop; program activity; downloadable PDF |
| Audience access | Public; client-only; program-assigned; practitioner-only template |

## CMS content types

- Service

- Practitioner / team profile

- Article

- Guide / downloadable resource

- Video / media resource

- FAQ item

- Workshop / event

- Program template

- Program module / activity template

- CTA / reusable content block

- Testimonial / story with consent metadata

## Public vs. member-only resources

| **Public resources** | **My TAB resources** |
|----|----|
| Education and SEO discovery | Personalized assigned content |
| General preparation / expectations | Program-specific activities and worksheets |
| FAQs and foundational guides | Practitioner-curated follow-up |
| Community workshops / events | Client check-ins / reflections |
| Shareable content | Sensitive or individualized guidance |

## Editorial guardrails

- Follow Step 15 voice and medical/scope language guardrails.

- Distinguish general education from individualized advice.

- Cite reputable evidence for substantive health claims; date-review clinical or health-adjacent content.

- Identify author / reviewer credentials when material is specialized.

- Avoid detox, cure, hormone-balancing, trauma-treatment, or other unsupported / out-of-scope claims.

- Use plain language; define technical terms when they add value.

- Every resource should answer what the reader should understand or do next.

## Content governance workflow

1\. Idea / need identified from client questions, search data, programs, or practitioner experience

2\. Owner assigned

3\. Draft using TAB messaging standards

4\. Technical / scope review where appropriate

5\. Accessibility review for media/downloads

6\. Publish with date, owner, taxonomy, and next review date

7\. Measure usefulness and update / retire when stale

## Resource-to-portal connection

The same canonical resource should be publishable publicly and assignable inside My TAB where appropriate. Do not create duplicate “website” and “portal” copies unless the client-specific version truly differs. My TAB should store the assignment relationship, not a second copy of the content.

## Initial content clusters

| **Cluster** | **Starter topics** |
|----|----|
| Massage & recovery | First massage, training recovery, prenatal comfort, post-surgical considerations, lymphatic drainage basics, chronic-illness comfort |
| Strength & capability | Beginner strength, healthy aging, balance/stability, return to activity, recovery, building confidence in the gym |
| Women’s wellness | Sustainable routines, sleep/recovery, pregnancy/postpartum lifestyle, perimenopause/menopause, caregiving and self-care, health advocacy |
| Life & alignment | Priorities, boundaries, routines, change, accountability, overwhelm, values and decision-making |
| TAB Method | Start Where You Are, personalization, defining progress, integrating services, maintenance / independence |

# 16.8 Conversion, SEO, Accessibility & Measurement

The digital experience should make it easy to take the next meaningful step without introducing pressure, inaccessible design, or measurement practices that conflict with TAB’s trust-based brand.

## Conversion architecture

| **Visitor state** | **Primary CTA** | **Secondary path** |
|----|----|----|
| Exploring / unsure | Start Where You Are | Explore Services |
| Knows service | Book / service-specific CTA | Start Where You Are |
| Evaluating fit | Meet the Team / TAB Method / FAQ | Schedule a Conversation |
| Existing client | My TAB | Book / Timely |
| Returning inactive client | My TAB / Start Where You Are | Book |

## Conversion principles

- Every CTA should clarify the next meaningful step without pressure, judgment, or hype.

- Do not require a discovery call when a straightforward client simply wants to book an appropriate service.

- Do not force unsure visitors into Timely before they understand which service fits.

- Keep forms progressively disclosed and as short as the decision requires.

- Use confirmation pages/messages to explain what happens next.

- Measure qualified actions, not just raw button clicks.

## SEO strategy

- Preserve and redirect valuable legacy tabmassage.com URLs during rebrand; create a redirect map before launch.

- Create one canonical page for each core service and location served; avoid thin duplicate city/service pages.

- Optimize for local intent through clear NAP/location information, Google Business Profile, service categories, booking links, reviews, and locally relevant content.

- Use service pages for commercial intent and Resources for educational intent; interlink them naturally.

- Use Organization / LocalBusiness / Service structured data where accurate; avoid unsupported medical schema or review markup.

- Write unique title tags, meta descriptions, H1s, and descriptive URLs.

- Publish practitioner credentials and service scope transparently for trust.

- Technical baseline: XML sitemap, robots.txt, canonical tags, fast Core Web Vitals, image optimization, HTTPS, no broken links, clean 404, redirect monitoring.

## Accessibility standard

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr>
<th><p><strong>TARGET</strong></p>
<p><em>Design and test the public site and My TAB to WCAG 2.2 AA as the practical baseline.</em></p></th>
</tr>
</thead>
<tbody>
</tbody>
</table>

- Keyboard-accessible navigation, dialogs, forms, booking choices, and portal interactions.

- Visible focus states and logical focus order.

- Sufficient color contrast; never use color alone to communicate state.

- Semantic headings and landmarks; meaningful page titles.

- Explicit labels, instructions, validation, and error recovery for forms.

- Alt text for meaningful images; decorative imagery ignored by assistive technology.

- Captions/transcripts for useful video/audio content.

- Touch targets sized for mobile use; no hover-only essential interactions.

- Support zoom/reflow and reduced motion preferences.

- Plain language and readable content widths / typography.

- Accessible PDFs/downloadables, or preferably HTML equivalents for essential information.

## Analytics recommendation

Use privacy-aware analytics on the public website. Matomo and Plausible both offer open-source/self-host options; either can support a lower-ad-tech posture than defaulting every experience to advertising-oriented analytics. Keep authenticated portal analytics separate from public marketing analytics and never include sensitive client details in event names/properties.

## Recommended public-site events

| **Event** | **Purpose** |
|----|----|
| start_where_you_are_open / submit | Guided-entry demand and completion |
| service_view | Service interest |
| book_click | Direct booking intent |
| timely_booking_outbound | Handoff to scheduling |
| my_tab_login_click | Existing-client portal demand |
| method_view | Engagement with differentiated approach |
| resource_view / download | Education usefulness |
| contact_submit / consultation_request | Qualified lead action |

## Journey KPIs

| **Journey area** | **Useful measures** |
|----|----|
| Discover | Organic/local traffic quality, service-page engagement, branded search, GBP actions |
| Connect | Start form completion, booking handoff, contact completion, abandonment by step |
| Understand / Personalize | Intake completion, time-to-first-service, plan creation where appropriate |
| Experience | Attendance / no-show, rebooking where appropriate, client feedback |
| Integrate | Cross-service introductions accepted/declined; avoid treating higher rate as automatically better |
| Reflect & Adjust | Progress-review completion, client-reported progress, plan changes |
| Become & Continue | Continue / maintain / independent / pause / shift outcomes; healthy graduation |
| Evolve | Return when a new need emerges, resource engagement, workshop/community participation |

Avoid using retention alone as the primary success metric. TAB explicitly values independence, maintenance, and healthy pauses as legitimate positive outcomes.

## Experience feedback

Use short, purposeful feedback instead of constant surveys. Optional open-source Formbricks could support targeted surveys, but the content and timing should follow the TAB journey: first-experience feedback, periodic progress reflection, service closeout, and occasional site/portal usability checks.

## Measurement guardrail

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr>
<th><p><strong>MEASURE WHAT MATTERS</strong></p>
<p><em>Use analytics to improve clarity, access, and client outcomes — not to create manipulative engagement loops or maximize dependence.</em></p></th>
</tr>
</thead>
<tbody>
</tbody>
</table>

# 16.9 Implementation Roadmap & MVP

The recommended path is to launch the rebrand and digital foundation without waiting for the entire future-state portal. Build the architecture so the experience can mature without needing another replatform.

## Phase 0 — Validate before build

- Complete Step 17 naming validation before committing to final domains, marks, and large build costs.

- Inventory existing tabmassage.com pages, rankings, backlinks, forms, Timely booking URLs, Google Business Profile, and analytics.

- Confirm current Timely plan/features; evaluate Innovate if Zapier / enhanced web integration is needed.

- Confirm Stripe products currently used: POS, Checkout, Billing, subscriptions, customer portal eligibility.

- Confirm privacy / recordkeeping / consent requirements with appropriate legal/professional advice.

- Define staff roles and which service records each role truly needs.

## Phase 1 — Public rebrand website MVP

1\. New information architecture and responsive website

2\. Homepage story

3\. Four service pages

4\. TAB Method page

5\. About / Our Story / Team

6\. Start Where You Are flow

7\. Timely booking integration and Client Login links

8\. Resources / FAQ foundation

9\. SEO redirect plan and local-search updates

10\. Accessibility and analytics baseline

## Phase 2 — My TAB MVP

1\. Secure portal authentication

2\. Client profile

3\. TAB Wellness Plan

4\. Programs / assignments

5\. Resources

6\. Progress check-ins / reviews

7\. Shared summaries

8\. Timely appointment handoff

9\. Stripe billing handoff

10\. Basic practitioner/admin workspace

## Phase 3 — Integration maturity

- Timely supported synchronization / Zapier bridge for appropriate client/appointment summary fields

- Stripe webhooks for membership/package state

- Automated plan-review / check-in workflows

- Role-specific practitioner dashboards

- Audit and operational reporting

- Form / document workflow refinement

## Phase 4 — Experience expansion

- Digital programs / paid content

- Group programs and workshops

- Secure messaging if justified

- Deeper strength-program logging

- PWA enhancements / push notifications

- Native app only if evidence supports it

- Referral-partner workflows with consent

- Membership experience if business model matures

## MVP decision rule

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr>
<th><p><strong>BUILD ONLY WHAT STRENGTHENS THE RELATIONSHIP</strong></p>
<p><em>Does this help us understand the client better, personalize their experience, connect the pieces of their wellbeing, or help them take greater ownership? If not — and it only creates administrative friction — it probably does not belong in the initial TAB experience.</em></p></th>
</tr>
</thead>
<tbody>
</tbody>
</table>

## Recommended ownership

| **Capability** | **Business owner** |
|----|----|
| Brand / messaging / content standards | TAB owner / brand lead |
| Service accuracy / scope | Service practitioner / qualified reviewer |
| Website product ownership | Named TAB product owner |
| Portal workflow | Practice operations + practitioners + product owner |
| Security / infrastructure | Technical owner / managed provider |
| SEO / analytics | Marketing / digital owner |
| Privacy / legal requirements | Business owner with qualified legal/professional advice |

## Definition of done for Step 16

- Public site has a clear information architecture and homepage narrative.

- Every service has a repeatable page pattern and direct/guided next step.

- My TAB has a defined purpose, IA, MVP, data boundaries, and maturity path.

- Timely and Stripe responsibilities are explicit; unnecessary duplication is avoided.

- A recommended open-source/custom architecture is defined with alternatives.

- Resources/content are governed as reusable assets across public and portal experiences.

- SEO, accessibility, measurement, and privacy are part of the architecture — not launch-day afterthoughts.

# Appendix A Recommended Data Model

The following is a conceptual model for My TAB. It is intentionally technology-neutral enough to evolve, but maps naturally to PostgreSQL.

| **Entity** | **Purpose / key relationships** |
|----|----|
| User | Portal identity; links to one client/person or staff account; role memberships |
| Client | Core person record and TAB client UUID; external Timely/Stripe IDs |
| Client Profile | Goals, preferences, contextual information, communication/accessibility preferences |
| Practitioner | Staff profile, service roles, credentials, active/inactive status |
| Service | Four service pillars and future services; content relationship |
| Client-Service Relationship | Which services are active/historic; practitioner assignment; start/end/status |
| Wellness Plan | Primary goal, current focus, services involved, review date, progress definition |
| Plan Goal | Goal statement, status, priority, start/end, client-defined success |
| Program Template | Reusable program definition |
| Client Program | Personalized assignment of a template or custom program |
| Program Module | Week/stage/group of activities |
| Activity | Exercise, habit, worksheet, reading, reflection, video, check-in |
| Activity Assignment | Client-specific instructions, cadence, dates, practitioner note |
| Activity Response | Completion, client response, optional metrics/reflection |
| Progress Review | Step 14.4 review questions + decisions / next focus |
| Resource | Canonical CMS content item |
| Resource Assignment | Client/program-specific relationship to resource |
| Shared Summary | Client-visible session summary / next steps |
| Internal Note | Restricted practitioner/operational record; separate visibility model |
| Cross-Service Referral | Context, goal, progress, next, consent, status |
| Consent | Purpose, version, accepted date, sharing flags, withdrawal where applicable |
| Document | Metadata for secure uploaded/generated files |
| Appointment Reference | External Timely appointment identifier / safe summary if synchronized |
| Billing Reference | Stripe customer/subscription/product identifiers / safe state |
| Audit Event | Actor, action, object, timestamp, security-relevant context |

## Relationship principles

- The client is the stable center of the model; services and practitioners may change over time.

- A Wellness Plan may span more than one service.

- Programs may be service-specific or cross-service but should always belong to a client goal/context.

- Resources are canonical content objects; assignments reference them rather than duplicating content.

- Shared summaries and internal notes are separate entities / visibility modes.

- External system IDs are mappings, never the primary business identity.

# Appendix B Current Platform Validation Notes

Platform capabilities change. The points below were validated against vendor documentation available in September 2026 and should be rechecked during implementation.

## Timely

- Client Login supports clients signing in, booking, checking future appointments, viewing historic appointments, and accessing consultation workflows; Timely documents custom Client Login links/buttons for external websites.

- Timely documents website connection options including booking buttons, direct booking links, and an embeddable booking widget.

- Timely’s Zapier connection is documented for Innovate plan businesses and can transfer supported customer fields including contact information, marketing preferences, balances, VIP status, and next appointment date/time/location.

- Timely Consult can update client-record fields from consultation forms and can automate consultation-form workflows on eligible plans.

## Stripe

- Stripe Billing provides a hosted customer portal that can allow customers to manage payment methods, invoices, billing history, and subscriptions depending on configuration and Billing access.

- Use Stripe-hosted payment/billing surfaces for sensitive payment actions rather than rebuilding card management in My TAB.

## Open-source stack candidates

- Supabase documentation supports Auth tied to Postgres, Row Level Security, and MFA; RLS is appropriate for per-client data isolation when configured correctly.

- Payload is open source, Next.js-native, and supports authentication/access control and production self-hosting or managed deployment patterns.

- Appwrite is open source and self-hostable, with database/auth/storage capabilities; it is a viable integrated-backend alternative.

- Directus provides a database-centered admin/data layer with generated REST/GraphQL APIs and granular user/role/permission concepts; it is useful when a low-code data-admin experience is a priority.

- Strapi remains an open-source/self-hostable headless CMS alternative.

- Formbricks provides open-source/self-hosted forms/survey capabilities and APIs; it is optional for experience feedback rather than a required portal dependency.

- Matomo and Plausible both provide open-source/self-hosted analytics options and can support a privacy-oriented public-site measurement approach.

## Reference URLs

Timely Client Login FAQ: https://help.gettimely.com/hc/en-gb/articles/1500002157141-Frequently-asked-questions-FAQs-Client-login

Timely custom Client Login links/buttons: https://help.gettimely.com/hc/en-gb/articles/1500002268502-How-to-use-custom-Client-Login-links-and-buttons

Timely website integration: https://help.gettimely.com/hc/en-gb/articles/33972391414039-Introduction-Connecting-Timely-to-your-website

Timely Zapier: https://help.gettimely.com/hc/en-gb/articles/1500002512181-How-to-connect-Zapier-with-Timely

Stripe Billing features / customer portal: https://stripe.com/billing/features

Supabase Auth: https://supabase.com/docs/guides/auth

Supabase Row Level Security: https://supabase.com/docs/guides/database/postgres/row-level-security

Payload deployment: https://payloadcms.com/docs/production/deployment

Appwrite self-hosting: https://appwrite.io/docs/advanced/self-hosting

Directus API: https://docs.directus.io/reference/introduction

Strapi self-hosting: https://strapi.io/hosting

Formbricks: https://formbricks.com/open-source-form-builder

Matomo self-hosting/privacy: https://matomo.org/matomo-on-premise/

Plausible open-source analytics: https://plausible.io/open-source-website-analytics

# Step 16 Closeout

Step 16 defines a digital experience that can support the rebrand immediately while also creating a path toward a much richer whole-person client relationship. The public website explains the brand and helps people choose a starting point. My TAB operationalizes the TAB Method. Timely and Stripe continue doing the specialized work they already perform well. Open-source application and content infrastructure gives TAB room to own the differentiated parts of the experience.

<table>
<colgroup>
<col style="width: 100%" />
</colgroup>
<thead>
<tr>
<th><p><strong>FINAL DIGITAL PRINCIPLE</strong></p>
<p><em>One TAB relationship. Four connected service pillars. A public experience that helps people start — and a private experience that helps them keep moving forward.</em></p></th>
</tr>
</thead>
<tbody>
</tbody>
</table>
