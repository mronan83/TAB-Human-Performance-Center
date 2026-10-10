---
title: TAB Human Performance Center User Stories
eyebrow: TAB Human Performance Center · User stories
heading: User stories
version: 1.0
updated: 2026-10-10
owner: Matthew Ronan
---


<!-- Edit this file, not the page. scripts/docs/render-stories.mjs builds the user stories page from it, and `npm run
     docs:check` fails CI when a story names a persona, epic, requirement, feature or backlog item that doesn't exist. -->

What each person needs from TAB Human Performance Center's public website, My TAB and TAB Practice, written as user stories with testable acceptance criteria for the owner to review. Every story traces to requirements in the register and names the features that deliver it, or the backlog items still to do; its status rolls up from them.

## Personas

| ID | Persona | Who they are | What they need from TAB |
|---|---|---|---|
| P-VIS | Visitor | A prospective client of any adult age, including older adults, in Livingston County (Brighton and Howell, Michigan) or anywhere online for virtual sessions, browsing the public website to understand TAB and find a starting point. | A clear, low-pressure picture of the five services and the TAB Method, one obvious next step (Start Where You Are or Book), and confidence that their health details stay out of forms and email. |
| P-CLI | Client | An existing TAB client invited by their practitioner to My TAB, the client portal, where their plan, programs, progress, resources and forms live; appointments and packages stay in Timely, and online programs and memberships in Stripe. | One private place for their ongoing relationship with TAB, in plain language, that only they and their care team can see. |
| P-PRA | Practitioner | Staff delivering one or more of the five pillars, working in TAB Practice with only their assigned clients (D-045) and signing in with a password and two-step verification. | Quick ways to keep each client's record, plans, programs, progress reviews and notes current, with internal notes kept apart from what the client sees. |
| P-OWN | Owner | Matthew Ronan, owner of TAB (in business as TAB Massage & Fitness since December 2008). He approves every merge and production release, controls Settings and team permissions, routes website submissions and can see every client (D-045). | Control over what goes live and when, a clear view of submissions and website use, and assurance that client data stays protected. |
| P-ADM | Website admin | A TAB Practice account for someone who helps with the website but doesn't work with clients (proposed D-071): invited by the owner, signs in with a password and two-step verification, and sees website requests, website stats and the content editor, never client records, Settings or Team. | A safe, self-serve way to edit content within the rules, file and follow change requests, and see how the site is used. |

## Epics

| ID | Epic | What it covers |
|---|---|---|
| E1 | Understand TAB and what it offers | The public pages that explain TAB: navigation, the homepage, the five services and their pages, the massage techniques guide, the TAB Method, About, Our Story, Our Team, the footer, trust content, voice and visual identity. |
| E2 | Find TAB through the rebrand | Recognizing TAB Massage & Fitness under its new name: the transition banner, legacy redirects, search titles and structured data, and the not-found page. |
| E3 | Find the right starting point | Start Where You Are, the contact form, the emailed copies, and the owner's routing of each submission to one next step. |
| E4 | Book and pay | Booking in Timely, per-service booking links, the account link, appointments and billing in My TAB, Stripe purchases and refunds, and a later Timely sync. |
| E5 | Learn from TAB's resources | The public resource library, email-first guides, the FAQ, and resources shared with clients in My TAB. |
| E6 | Get into My TAB safely | Invitations, sign-in, private records, consents and the client's own details. |
| E7 | Follow my progress in My TAB | The dashboard, the Performance Plan, programs, check-ins, progress, shared notes, notifications, forms and uploads. |
| E8 | Run my client work | TAB Practice: client records and profiles, intakes, session notes, plans, progress reviews and stages, continuation outcomes, referrals, the program library and practitioner permissions. |
| E9 | Keep the website current | The content editor and block library, website change requests, the content guide, website admins, the fast lane and the owner's website settings. |
| E10 | Release and run the site with confidence | Previews, approvals and promotion, launch readiness and monitoring, website stats and the My TAB go-live gate. |
| E11 | Trust, privacy and access | Accessibility, colour contrast, analytics without tracking, form spam protection, staff two-step sign-in and the audit trail. |

## Stories

### US-101 · Find my way around the site
- **As a** visitor **I want** a clear menu and the same main actions on every page **so that** I can reach any part of the site and always see how to start or book
- **Persona:** P-VIS
- **Epic:** E1
- **Priority:** Must
- **Phase:** P1
- **Requirements:** WEB-001, WEB-002
- **Delivered by:** F-01, F-02, F-03, F-04, F-05, F-06, A25
- **Draft:** yes

1. **Given** any public page **when** it loads **then** the header shows Home, Services, The TAB Method, About and, while it is switched on in Settings, Resources, with Start Where You Are as the primary action and Book beside it.
2. **Given** the Services or About menu is open **when** the visitor presses Escape or moves focus out of it **then** the menu closes, **and** Escape returns focus to the button that opened it.
3. **Given** a window narrower than 80rem (1280px at default text size) or a larger default text size **when** the header renders **then** a Menu button replaces the full navigation and no header item wraps.
4. **Given** the About menu **when** it opens **then** it lists About TAB, Our Story, Our Team (while switched on) and Contact.
5. **Given** the link crawl in CI **when** it follows every internal link on the public site **then** none leads to a missing page.

### US-102 · Understand TAB from the homepage
- **As a** visitor **I want** the homepage to explain TAB step by step **so that** I understand the approach before I decide what to do next
- **Persona:** P-VIS
- **Epic:** E1
- **Priority:** Must
- **Phase:** P1
- **Requirements:** WEB-003
- **Delivered by:** F-02, F-58, A8
- **Draft:** yes

1. **Given** the homepage **when** it loads **then** its sections run in the approved order: hero, core idea, the five pillars, the TAB Method, personalization, guided conversion, proof and trust, resources, closing invitation.
2. **Given** the hero **when** it renders **then** the headline reads "More capacity for what matters." and its buttons offer Start Where You Are and Explore Services.
3. **Given** the pillars section **when** it renders **then** Massage & Bodywork, Functional Strength, Women's Wellness, Integrated Nutrition and Holistic Life Coaching appear with equal weight.
4. **Given** Resources is switched off in Settings **when** the homepage renders **then** its resources section is hidden.

### US-103 · Compare the five services
- **As a** visitor **I want** to see all five services side by side **so that** I can choose one on its own or see how they connect
- **Persona:** P-VIS
- **Epic:** E1
- **Priority:** Must
- **Phase:** P1
- **Requirements:** WEB-004, WEB-018
- **Delivered by:** F-03, F-17
- **Draft:** yes

1. **Given** /services **when** it loads **then** all five pillars are listed, each linking to its own service page.
2. **Given** the page introduction **when** a visitor reads it **then** it presents each service as standing on its own and the five together as one integrated approach, with no need to combine them.
3. **Given** a service icon on a card or page **when** it renders **then** it sits beside the service name as a light visual marker, never on its own.
4. **Given** a visitor who isn't sure which service fits **when** they choose "Help me choose" **then** they reach /start.

### US-104 · Understand a service on its own page
- **As a** visitor **I want** every service page to follow the same clear pattern **so that** I can quickly see what the service is, how it helps and what to expect
- **Persona:** P-VIS
- **Epic:** E1
- **Priority:** Must
- **Phase:** P1
- **Requirements:** WEB-005
- **Delivered by:** F-03, F-57, A8
- **Draft:** yes

1. **Given** any of the five service pages **when** it loads **then** it follows the shared template: a hero, sections from the block library (such as How we help with focus-area cards, the TAB Method band, What to expect and Questions), related services and a closing call to action.
2. **Given** any service page **when** it renders **then** its scope note ("Scope of care") is shown, **and** no editor can remove it.
3. **Given** a question whose answer is marked as a draft **when** the site is previewed **then** it carries a draft flag and appears on the launch checklist, **and** the answer is left out of the FAQ data search engines read.
4. **Given** the page copy **when** the automated checks run **then** no wording claims that a service diagnoses, treats or cures.

### US-105 · Take the next step from any service page
- **As a** visitor **I want** a direct way to book and a way to get help choosing on every service page **so that** I can act whether or not I'm sure
- **Persona:** P-VIS
- **Epic:** E1
- **Priority:** Must
- **Phase:** P1
- **Requirements:** WEB-006, WEB-007
- **Delivered by:** F-03, F-53
- **Draft:** yes

1. **Given** any service page **when** it loads **then** it offers a Book button for that service and a "not sure?" link to /start.
2. **Given** the owner has set a Timely link for the service in Settings **when** the visitor presses Book **then** that link opens; with none set, the main booking page opens.
3. **Given** the "Connected support" section **when** it renders **then** it links only to other TAB service pages chosen for that service, never to the page itself.
4. **Given** any service page **when** it renders **then** it shows no cross-sell carousel.

### US-106 · Explore the massage techniques
- **As a** visitor **I want** to read about each massage technique TAB offers **so that** I can choose the kind of session that suits me
- **Persona:** P-VIS
- **Epic:** E1
- **Priority:** Must
- **Phase:** P1
- **Requirements:** WEB-005
- **Delivered by:** F-03, F-57
- **Draft:** yes

1. **Given** /services/massage-bodywork/techniques **when** it loads **then** it describes eleven techniques, grouped by what people come in for, each with what it is, how it feels, what it is often chosen for, good-to-know notes and a pressure scale.
2. **Given** the at-a-glance comparison **when** it renders on a computer **then** it is a table, **and** on a 320px phone it is a stacked list with no sideways scrolling.
3. **Given** the Massage & Bodywork page **when** it renders **then** its techniques section links into the guide, **and** the old Introduction to Massage address redirects to the guide.
4. **Given** the guide's wording **when** it is reviewed **then** it says what each technique is often chosen for and never claims to treat a condition, **and** Swedish and relaxation massage aren't listed as offerings.

### US-107 · Learn how the TAB Method works
- **As a** visitor **I want** the TAB Method explained in plain steps **so that** I know how TAB will work with me
- **Persona:** P-VIS
- **Epic:** E1
- **Priority:** Must
- **Phase:** P1
- **Requirements:** WEB-008
- **Delivered by:** F-04, F-58
- **Draft:** yes

1. **Given** /tab-method **when** it loads **then** it explains Start Where You Are, Transform, Adapt and Balance, each with a short description.
2. **Given** the page **when** a visitor reaches its top or its end **then** each offers Start Where You Are.
3. **Given** an editor changes the page in the content editor **when** they save **then** the words can change but the stage names stay fixed in code.

### US-108 · Get to know TAB on About and Our Story
- **As a** visitor **I want** to read who TAB is and how it grew **so that** I can decide whether TAB is right for me
- **Persona:** P-VIS
- **Epic:** E1
- **Priority:** Must
- **Phase:** P1
- **Requirements:** WEB-009, WEB-017
- **Delivered by:** F-04, F-58, A8
- **Draft:** yes

1. **Given** /about **when** it loads **then** it tells TAB's core narrative in sections, **and** Our Story is a separate page.
2. **Given** /about/our-story **when** it loads **then** it tells the evolution from TAB Massage & Fitness, launched in December 2008, to TAB Human Performance Center.
3. **Given** Our Story is still marked as a draft **when** the site is previewed **then** it carries a draft flag and appears on the launch checklist.

### US-109 · Meet the team
- **As a** visitor **I want** to see who the practitioners are and what they offer **so that** I know who I would be working with
- **Persona:** P-VIS
- **Epic:** E1
- **Priority:** Must
- **Phase:** P1
- **Requirements:** WEB-009, CMS-001
- **Delivered by:** F-04, F-58, A8
- **Draft:** yes

1. **Given** Our Team is switched on in Settings **when** a visitor opens /about/team **then** each person shows their name, role, short bio and the services they offer.
2. **Given** a person's credentials haven't been confirmed by the owner **when** the live page renders **then** the credentials don't appear, **and** the launch checklist lists them.
3. **Given** a team photo **when** it renders **then** it has a description for screen-reader users.
4. **Given** Our Team is switched off in Settings **when** any page renders **then** the team page and its menu entries are hidden.

### US-110 · Find practical details in the footer
- **As a** visitor **I want** TAB's address, hours, contact details and policies at the foot of every page **so that** I can plan a visit and know the terms before I book
- **Persona:** P-VIS
- **Epic:** E1
- **Priority:** Must
- **Phase:** P1
- **Requirements:** WEB-012
- **Delivered by:** F-01, A6
- **Draft:** yes

1. **Given** any public page **when** the visitor reaches the footer **then** it shows the address (7487 Grand River Ave, Brighton, MI 48114), "Serving Livingston County", the phone number, the email address and the opening hours grouped by day.
2. **Given** the footer's legal links **when** each is followed **then** Privacy, Terms, Accessibility, Client policies, Cancellation policy and Service disclaimers open real content, the last two at their sections of the policies page.
3. **Given** the footer **when** it renders **then** it carries the Explore, Services, Get started and TAB link groups.
4. **Given** the owner has supplied the gift cards link (A6) **when** the footer renders **then** the TAB group includes Gift cards.

### US-111 · Trust TAB through honest proof and imagery
- **As a** visitor **I want** proof and photos I can believe **so that** I can trust what TAB says about itself
- **Persona:** P-VIS
- **Epic:** E1
- **Priority:** Should
- **Phase:** P1
- **Requirements:** WEB-013, DS-007
- **Delivered by:** F-02, F-53, A8
- **Draft:** yes

1. **Given** no real testimonial with the client's written permission exists **when** any page renders **then** no testimonial appears, **and** the Testimonials switch in Settings stays locked.
2. **Given** the homepage proof section **when** it renders **then** it states only facts the owner has confirmed, such as 20+ years serving the community and sessions in person and virtual.
3. **Given** a stock photograph from the image library **when** it appears on a page **then** it is decorative, hidden from screen readers, and never presented as TAB's people, clients or studio.
4. **Given** any image on the site **when** it is chosen **then** it is never a before-and-after image.

### US-112 · Read copy that speaks plainly and stays in scope
- **As a** visitor **I want** warm, plain language that doesn't oversell **so that** I feel welcome rather than pressured
- **Persona:** P-VIS
- **Epic:** E1
- **Priority:** Must
- **Phase:** P1
- **Requirements:** WEB-014
- **Delivered by:** F-02, F-03, F-04, F-05
- **Draft:** yes

1. **Given** any change to the site's pages, content or emails **when** the brand check runs in CI **then** it fails on a retired name, the old philosophy or stage names, an old service name or a wrong pillar count.
2. **Given** page titles, metadata, listings or legal text **when** they name the business **then** they use "TAB Human Performance Center" in full.
3. **Given** massage, strength, nutrition or coaching copy **when** it describes a benefit **then** it says what a service can support or is often chosen for, and never implies diagnosis or treatment.
4. **Given** any public copy **when** the owner reviews it against the Brand Foundation v2 voice **then** it avoids hype, fitness-culture language, wellness guilt and clinical framing.

### US-113 · Recognize TAB's identity everywhere
- **As a** visitor **I want** TAB's logo, type, colours and icons to look the same wherever I meet them **so that** I know I'm in the right place
- **Persona:** P-VIS
- **Epic:** E1
- **Priority:** Must
- **Phase:** P1
- **Requirements:** DS-006, DS-002, DS-003, DS-004, WEB-019
- **Delivered by:** F-16, F-17
- **Draft:** yes

1. **Given** any page or email **when** the logo appears **then** it comes from the approved artwork files and is never set in live type, with the white version on dark backgrounds.
2. **Given** any page **when** text renders **then** headings, body and controls use Montserrat and editorial accents use Spectral, both served by the site itself with no third-party font request.
3. **Given** a primary action **when** it renders **then** it is a Deep Olive pill, **and** a secondary action is a Clay Dark pill.
4. **Given** an eyebrow or section marker **when** it renders **then** it uses the uppercase letterspaced label style, kept for those places only.
5. **Given** a browser tab, a phone home screen or a shared link **when** TAB's site appears there **then** it shows TAB's favicon (16 and 32px, light and dark), touch and app icons (192 and 512px, with a maskable version) or share image.

### US-201 · See the name-change announcement while it's relevant
- **As a** visitor **I want** a short notice that TAB Massage & Fitness is becoming TAB Human Performance Center **so that** I know I've found the same business under its new name
- **Persona:** P-VIS
- **Epic:** E2
- **Priority:** Must
- **Phase:** P1
- **Requirements:** WEB-015
- **Delivered by:** F-01, F-53
- **Draft:** yes

1. **Given** the banner is switched on in Settings and its end date (30 June 2027) hasn't passed **when** a visitor opens any public page **then** a strip across the top reads "TAB Massage & Fitness is becoming TAB Human Performance Center."
2. **Given** the end date has passed **when** any page renders **then** the banner no longer shows, whatever the setting.
3. **Given** the owner switches the banner off in Settings **when** the change is saved **then** the banner leaves the site within a few seconds.

### US-202 · Follow an old tabmassage.com link to the right page
- **As a** visitor **I want** my old bookmarks and links to tabmassage.com to keep working **so that** I land on the matching page of the new site
- **Persona:** P-VIS
- **Epic:** E2
- **Priority:** Must
- **Phase:** P1
- **Requirements:** NFR-004, NFR-008
- **Delivered by:** F-12
- **Draft:** yes

1. **Given** a mapped legacy tabmassage.com address **when** a visitor opens it **then** they arrive at the matching new page in one 308 redirect, with no chain or loop.
2. **Given** the same legacy path with or without a trailing slash **when** it is opened **then** both reach the same page in one hop.
3. **Given** the old address of a renamed pillar or a replaced page (such as the former strength training, nutrition or Introduction to Massage pages) **when** it is opened **then** it redirects to the current page.
4. **Given** any change to the site **when** CI runs **then** every mapped legacy path is tested, **and** a broken redirect blocks the change.

### US-203 · Find TAB under its new name in search
- **As a** visitor **I want** search results and shared links to show TAB's new name and an accurate description **so that** I can recognize TAB and choose the right page
- **Persona:** P-VIS
- **Epic:** E2
- **Priority:** Must
- **Phase:** P1
- **Requirements:** WEB-016, NFR-003, NFR-002
- **Delivered by:** F-13
- **Draft:** yes

1. **Given** any public page **when** a search engine reads it **then** its title is "[Page] | TAB Human Performance Center" with no location, **and** its description is hand-written, unique and 40 to 160 characters long.
2. **Given** the site's structured data **when** it is read **then** it names the business TAB Human Performance Center with TAB Massage & Fitness as an alternate name, and the service area as Livingston County, MI plus Brighton and Howell.
3. **Given** FAQ answers **when** structured data is built **then** FAQ markup covers only answers that are visible and not drafts.
4. **Given** any public page **when** it loads **then** it carries a canonical URL and share tags, **and** the site publishes an XML sitemap and robots.txt.

### US-204 · Land somewhere helpful from a broken link
- **As a** visitor **I want** a helpful page when an address doesn't exist **so that** I can find my way back instead of hitting a dead end
- **Persona:** P-VIS
- **Epic:** E2
- **Priority:** Must
- **Phase:** P1
- **Requirements:** NFR-002
- **Delivered by:** F-13
- **Draft:** yes

1. **Given** an address that doesn't exist on the site **when** a visitor opens it **then** they see a branded not-found page with the header and footer, **and** the response status is 404.
2. **Given** the not-found page **when** the visitor looks for a way on **then** the header menu, Start Where You Are and Book are all available.

### US-301 · Tell TAB where I'm starting from by choosing options
- **As a** visitor **I want** to describe what I'm looking for by choosing from options **so that** I can get a recommendation without writing anything personal
- **Persona:** P-VIS
- **Epic:** E3
- **Priority:** Must
- **Phase:** P1
- **Requirements:** GS-001, GS-002
- **Delivered by:** F-07, F-53
- **Draft:** yes

1. **Given** /start **when** a visitor fills in the form **then**, apart from name, email and phone, every question is answered by choosing options: where they're starting from, what they'd most like help with (14 options, at least one required), which service interests them (the five pillars or "I'm not sure"), what they'd like to feel, do or experience differently, anything TAB should know first, and how they found TAB.
2. **Given** a name containing digits or links, or a phone number containing letters, **when** the form is sent **then** it is refused with a plain message beside the field.
3. **Given** a Start submission that carries free text **when** the server receives it **then** the text is dropped and is never emailed or stored.
4. **Given** the visitor hasn't agreed that TAB may contact them **when** they send the form **then** it asks them to confirm, **and** news by email stays a separate, optional tick.
5. **Given** the owner has paused online Start submissions in Settings **when** a visitor opens /start **then** they see "Let's talk instead" with TAB's email and phone, **and** Book directly stays available.

### US-302 · Keep the form short and know what happens next
- **As a** visitor **I want** a short form and a clear confirmation **so that** I'm not put off and I know what TAB will do with my answers
- **Persona:** P-VIS
- **Epic:** E3
- **Priority:** Must
- **Phase:** P1
- **Requirements:** GS-003
- **Delivered by:** F-07
- **Draft:** yes

1. **Given** /start **when** it loads **then** the practical questions (in person, virtual or either; days or times that usually work; how they found TAB) sit under "Practical details (optional)", closed by default.
2. **Given** a field with a mistake **when** the visitor sends the form **then** the first invalid field receives focus, any closed section holding it opens, **and** the error is explained in text.
3. **Given** the server accepts the submission **when** the confirmation appears **then** it says "Thank you. We've got it." and explains that TAB will reply with a suggested starting point: booking directly, a short conversation, the right intake, or another resource if TAB isn't the best fit.

### US-303 · Flag something health-related without writing it down
- **As a** visitor **I want** to say there's something health-related to discuss without describing it **so that** my health details stay out of forms and email
- **Persona:** P-VIS
- **Epic:** E3
- **Priority:** Must
- **Phase:** P1
- **Requirements:** GS-001, SEC-006
- **Delivered by:** F-07, F-10, F-11
- **Draft:** yes

1. **Given** /start **when** the visitor wants to raise a health matter **then** the only way is the option "There's something health-related I'd like to discuss privately first", with no box for details.
2. **Given** a submission with that option **when** staff open it in TAB Practice **then** a notice says the person would like to discuss something health-related privately and to follow up before anything is booked.
3. **Given** the emails TAB sends about that submission **when** they are built **then** they show the flag only as the option's label, never health details.

### US-304 · Receive a copy of my answers that stays private
- **As a** visitor **I want** an emailed copy of what I sent **so that** I have a record without my details being exposed
- **Persona:** P-VIS
- **Epic:** E3
- **Priority:** Must
- **Phase:** P1
- **Requirements:** SEC-006, GS-003
- **Delivered by:** F-10
- **Draft:** yes

1. **Given** an accepted Start submission **when** TAB emails the submitter's copy **then** it lists only their name and the options they chose, under the neutral subject "We've received your message – TAB Human Performance Center".
2. **Given** an accepted contact message **when** the submitter's copy is sent **then** it confirms receipt and the topic, **and** says that, for privacy, the message isn't repeated.
3. **Given** a submission flagged as possible spam **when** it is accepted **then** no copy is emailed to the address given.
4. **Given** one email address **when** copies to it reach three in a day **then** no further copies are sent to it that day.
5. **Given** any copy **when** it is read **then** it says what to do if the person didn't send it and asks them not to reply with medical details.

### US-305 · Send TAB a general question
- **As a** visitor **I want** to send TAB a short message **so that** I can ask about booking, pricing, gift cards or anything else
- **Persona:** P-VIS
- **Epic:** E3
- **Priority:** Must
- **Phase:** P1
- **Requirements:** WEB-002, SEC-006, SEC-013
- **Delivered by:** F-08, F-09
- **Draft:** yes

1. **Given** /contact **when** a visitor writes to TAB **then** they choose what it's about (booking or scheduling, services and pricing, gift cards, an existing appointment, billing or payments, partnerships, press or community events, or something else) and write a message of up to 3,000 characters beside a note asking for no medical details.
2. **Given** a message containing markup or links **when** it is received **then** the markup is dropped, links are flagged for staff, **and** no copy is emailed to the submitter.
3. **Given** /contact **when** it loads **then** it shows TAB's address, phone and hours, **and** nothing on the page is counted by the site's analytics.

### US-306 · Give every Start submission exactly one next step
- **As a** business owner **I want** to record one next step for each Start submission **so that** nobody who asks for help is left without a clear answer
- **Persona:** P-OWN
- **Epic:** E3
- **Priority:** Must
- **Phase:** P1
- **Requirements:** GS-004, GS-005
- **Delivered by:** F-10, F-11, A15
- **Draft:** yes

1. **Given** a Start submission **when** the owner opens it in TAB Practice → Submissions **then** they see every answer by its label, the contact and practical details, and a reference.
2. **Given** the owner chooses one of the five next steps (direct booking, brief discovery conversation, service-specific intake, more information needed, outside referral) **when** they save **then** exactly one outcome is recorded with who chose it and when, plus an optional internal note only staff see.
3. **Given** the Submissions list **when** the owner filters "Needs a next step" **then** it shows every Start submission without an outcome.
4. **Given** a practitioner **when** they open Submissions **then** they see only submissions linked to their assigned clients and can't record a next step.
5. **Given** guardrail 4's conditions aren't yet met **when** a Start form is submitted **then** it is emailed to TAB and the submitter but not saved in the database.

### US-307 · Link a submission to the person's client record
- **As a** business owner **I want** to link submissions to the right client record **so that** a person's history with TAB stays in one place
- **Persona:** P-OWN
- **Epic:** E3
- **Priority:** Must
- **Phase:** P1
- **Requirements:** GS-005, INT-006, SEC-014
- **Delivered by:** F-11, A15
- **Draft:** yes

1. **Given** an unlinked submission **when** the owner opens it **then** existing client records with the same email address are offered before a new one is created.
2. **Given** the owner links a submission to a client record **when** it is saved **then** every unlinked submission from the same email address joins that record.
3. **Given** the person later activates My TAB with that email address **when** they confirm the address **then** their account links to the same record, **and** an unconfirmed address never links.

### US-401 · Book a service straight away in Timely
- **As a** visitor **I want** to book the service I already know I want without filling in a form first **so that** I can get on the schedule quickly
- **Persona:** P-VIS
- **Epic:** E4
- **Priority:** Must
- **Phase:** P1
- **Requirements:** WEB-011, GS-006, INT-001
- **Delivered by:** F-06, F-07
- **Draft:** yes

1. **Given** /book **when** it loads **then** it offers two paths: each of the five services with its own Book button, and "Help me choose", which opens /start.
2. **Given** a visitor presses Book for a service **when** the link opens **then** it goes to Timely (the service's own page if the owner set one, otherwise the main booking page), **and** TAB's site never takes the booking itself.
3. **Given** /start **when** it loads **then** "Book directly" sits beside the form, so no one has to complete the form or a discovery conversation before booking.
4. **Given** online booking isn't connected **when** /book renders **then** each service offers a Request button that opens an email to TAB, with a note that online booking is being connected.

### US-402 · Point each service's Book buttons at the right Timely page
- **As a** business owner **I want** to set a Timely link for each service **so that** people land on the right booking page without a code change
- **Persona:** P-OWN
- **Epic:** E4
- **Priority:** Must
- **Phase:** P1
- **Requirements:** INT-001
- **Delivered by:** F-53
- **Draft:** yes

1. **Given** TAB Practice → Settings **when** the owner enters a Timely link for a service **then** it must start with https:// or it is refused.
2. **Given** a saved link **when** the site updates within a few seconds **then** that service's Book buttons on its page and on /book use it, **and** a blank field means the main booking page.
3. **Given** any settings change **when** it is saved **then** it is recorded with who made it and when.

### US-403 · See My TAB on the site only once it's open
- **As a** client **I want** the site to offer a My TAB sign-in only when My TAB is actually open **so that** I'm never sent to a login that doesn't work yet
- **Persona:** P-CLI
- **Epic:** E4
- **Priority:** Must
- **Phase:** P1
- **Requirements:** WEB-020
- **Delivered by:** F-01, F-19, F-53, A15
- **Draft:** yes

1. **Given** the client portal is Off in Settings **when** anyone views the header or footer **then** no Client Login or My TAB link appears, **and** Book stays the way into Timely.
2. **Given** the owner sets the client portal to Live in a build whose portal data is real **when** the site updates **then** "My TAB" appears in the header and footer.
3. **Given** an old bookmark to /my-tab while the portal is off **when** it opens **then** the page offers a link to Timely to manage appointments.

### US-404 · Manage my appointments from My TAB
- **As a** client **I want** My TAB to take me to my appointments in Timely **so that** I can book, reschedule or cancel in one familiar place
- **Persona:** P-CLI
- **Epic:** E4
- **Priority:** Must
- **Phase:** P2
- **Requirements:** PORTAL-006, INT-001
- **Delivered by:** F-26, A5
- **Draft:** yes

1. **Given** a signed-in client **when** they open Appointments **then** "Reschedule or cancel" opens Timely, **and** My TAB doesn't rebuild scheduling.
2. **Given** the Timely Client Login link hasn't been supplied (A5) **when** the client follows it **then** it opens the main booking page instead.
3. **Given** the appointments page **when** it renders **then** it explains that appointments, packages and gift cards are managed in the booking system and that changes there can take a little while to appear.

### US-405 · Manage payments and memberships through Stripe
- **As a** client **I want** to manage my payment methods and receipts for online programs and memberships **so that** I can keep my billing up to date myself
- **Persona:** P-CLI
- **Epic:** E4
- **Priority:** Must
- **Phase:** P2
- **Requirements:** PORTAL-009, INT-003
- **Delivered by:** F-29, A17
- **Draft:** yes

1. **Given** a client with an online program or membership **when** they choose "Manage payment methods and receipts" **then** the server creates a Stripe customer portal session and opens it.
2. **Given** any payment **when** TAB records it **then** only Stripe IDs and a safe status are stored, never card details.
3. **Given** appointments, packages and gift cards **when** the client looks for them in Billing **then** they're told these are handled in the booking system, with "Open booking account".
4. **Given** a client who buys anything online **when** Stripe records it **then** all their purchases sit under one Stripe customer.

### US-406 · Keep access to what I bought in step with Stripe
- **As a** client **I want** my access to a program or membership to follow what I've paid **so that** I can use what I bought without chasing anyone
- **Persona:** P-CLI
- **Epic:** E4
- **Priority:** Must
- **Phase:** P2
- **Requirements:** SEC-020, INT-004
- **Delivered by:** F-29, A17
- **Draft:** yes

1. **Given** a client completes Stripe Checkout for a program or membership **when** Stripe confirms payment **then** access is granted, **and** until then Billing shows "Awaiting payment".
2. **Given** a subscription goes past due **when** Stripe reports it **then** access pauses, **and** a full refund ends it.
3. **Given** a Stripe event that fails part-way **when** it is applied **then** nothing is half-changed: the change rolls back and Stripe retries.
4. **Given** a partial refund **when** Stripe reports it **then** the client keeps access and the purchase is flagged for the owner.

### US-407 · Decide what happens after a partial refund
- **As a** business owner **I want** partly refunded purchases brought to me **so that** I decide whether the client keeps access
- **Persona:** P-OWN
- **Epic:** E4
- **Priority:** Must
- **Phase:** P2
- **Requirements:** SEC-020, INT-004
- **Delivered by:** F-29
- **Draft:** yes

1. **Given** Stripe refunded part of a purchase **when** the owner opens TAB Practice **then** "Purchases to review" lists it and explains that the client keeps access until the owner decides.
2. **Given** the owner chooses "Keep access" or "End access" **when** it is saved **then** the client's access follows that choice.

### US-408 · See my Timely appointments in My TAB automatically
- **As a** client **I want** upcoming appointments from Timely to show in My TAB **so that** I can see my schedule alongside my plan
- **Persona:** P-CLI
- **Epic:** E4
- **Priority:** Should
- **Phase:** P3
- **Requirements:** INT-005, INT-006
- **Delivered by:** F-50
- **Draft:** yes

1. **Given** an appointment is booked, changed or cancelled in Timely **when** the one-way sync runs **then** My TAB shows the supported fields **and** never writes back to Timely.
2. **Given** an appointment whose details differ between the two systems **when** My TAB shows it **then** Timely's version stands, with no two-way calendar logic.
3. **Given** duplicate client records **when** the sync is due to start **then** it isn't switched on until they are reconciled, **and** external IDs are set only after a confident match.

### US-501 · Browse resources by topic and open what I need
- **As a** visitor **I want** guides and links grouped by topic **so that** I can find something useful on my own time
- **Persona:** P-VIS
- **Epic:** E5
- **Priority:** Should
- **Phase:** P1
- **Requirements:** WEB-010, CMS-002
- **Delivered by:** F-05, F-58, A35
- **Draft:** yes

1. **Given** Resources is switched on **when** a visitor opens /resources **then** each topic is a card listing its subjects, **and** resources are tagged by pillar where they relate to one.
2. **Given** a subject linked to a published resource **when** the visitor clicks it **then** a document downloads as a PDF, or a link opens its page on this site or another, **and** a subject without one says "Coming soon".
3. **Given** a subject left unlinked and a published resource of the same topic with the same title (ignoring capitals and spacing) **when** the page is built **then** the subject opens that resource in its own place, **and** the resource isn't listed a second time.
4. **Given** a resource is opened **when** the open is counted **then** one is added to that resource's daily total, with no cookie and nothing that identifies the visitor.
5. **Given** Events & Workshops has no real events **when** the site renders **then** it stays switched off, with no Events link in the menus, footer or sitemap.

### US-502 · Get an email-first guide sent to me
- **As a** visitor **I want** to request a guide by email **so that** I get the download without creating an account
- **Persona:** P-VIS
- **Epic:** E5
- **Priority:** Must
- **Phase:** P1
- **Requirements:** WEB-010, SEC-006
- **Delivered by:** F-58, C36
- **Draft:** yes

1. **Given** a document that asks for an email address first **when** the visitor clicks its subject **then** a short form asking only for name and email opens under it.
2. **Given** the request passes the spam checks **when** it is sent **then** the visitor is emailed a signed download link that works for 14 days and names only the guide, **and** TAB gets an email saying who asked.
3. **Given** an expired or altered link **when** it is opened **then** the visitor is returned to the Resources page to ask again.
4. **Given** guardrail 4's conditions aren't met **when** a request arrives **then** it isn't stored anywhere on the website, **and** a request flagged as spam gets no automatic email.

### US-503 · Find answers in the FAQ
- **As a** visitor **I want** common questions answered in one place **so that** I can decide without having to ask
- **Persona:** P-VIS
- **Epic:** E5
- **Priority:** Must
- **Phase:** P1
- **Requirements:** WEB-010, NFR-003
- **Delivered by:** F-05, F-03, C35b, A8
- **Draft:** yes

1. **Given** /faq **when** it loads **then** each question opens to show its answer.
2. **Given** an answer still marked as a draft **when** the site is previewed **then** it carries a draft flag and appears on the launch checklist, **and** it is left out of the FAQ markup search engines read.
3. **Given** the owner wants to change an FAQ **when** the FAQ has moved into the content editor (C35b) **then** they edit it there, **and** until then they file a Content help request.

### US-504 · See resources my practitioner picked for me
- **As a** client **I want** the resources my practitioner shared in one list **so that** I can find what they recommended
- **Persona:** P-CLI
- **Epic:** E5
- **Priority:** Should
- **Phase:** P2
- **Requirements:** PORTAL-007
- **Delivered by:** F-28
- **Draft:** yes

1. **Given** a signed-in client **when** they open Resources in My TAB **then** "Picked for you" lists the resources their practitioner shared, or says "Nothing here yet." when there are none.
2. **Given** the client opens a shared resource **when** the practitioner next views the client's record **then** that resource shows as viewed.
3. **Given** the client wants more **when** they look beyond their picks **then** My TAB links to the wider library (today the public topic list, TG-2).

### US-505 · Share a resource with a client
- **As a** practitioner **I want** to share resources with a client **so that** they have the right reading or guide between sessions
- **Persona:** P-PRA
- **Epic:** E5
- **Priority:** Must
- **Phase:** P2
- **Requirements:** STAFF-010, CMS-003
- **Delivered by:** F-39, F-44
- **Draft:** yes

1. **Given** a client in my care team **when** I share a resource from the library's quick picks or by link **then** it appears in their My TAB under "Picked for you".
2. **Given** a resource I shared **when** I remove it **then** it disappears from the client's My TAB.
3. **Given** a library resource is updated **when** the client opens it from My TAB **then** they see the updated version, because the assignment points to the resource rather than a copy.
4. **Given** a client outside my care team **when** I try to share with them **then** the database refuses.

### US-601 · Invite a client to My TAB
- **As a** practitioner **I want** to invite a client to My TAB from their record **so that** only people TAB knows can have an account
- **Persona:** P-PRA
- **Epic:** E6
- **Priority:** Must
- **Phase:** P2
- **Requirements:** SEC-014
- **Delivered by:** F-39, F-45, A15
- **Draft:** yes

1. **Given** a client in my care team with an email address **when** I choose Invite to My TAB **then** the invitation is sent **and** the database records who invited them and when.
2. **Given** the invitation email can't be sent **when** I invite **then** I'm told to let the client know directly, **and** in demo mode I'm told that no email was sent.
3. **Given** the client signs in for the first time **when** I next view their record **then** their My TAB access shows as active.
4. **Given** a client who hasn't been invited **when** I view their record **then** it says they can't sign in to My TAB until invited.

### US-602 · Sign in to My TAB securely
- **As a** client **I want** to sign in with a link sent to my email **so that** I can get into My TAB safely without remembering a password
- **Persona:** P-CLI
- **Epic:** E6
- **Priority:** Must
- **Phase:** P2
- **Requirements:** PORTAL-001, SEC-014, SEC-020
- **Delivered by:** F-19, F-45, C37, A15
- **Draft:** yes

1. **Given** an invited client **when** they enter their email on the My TAB sign-in page **then** they are emailed a one-time sign-in link that works in whichever browser opens it, with no password needed.
2. **Given** an email address with no account **when** it is entered **then** no account is created, because there is no public sign-up.
3. **Given** a signed-in account not yet linked to a client record **when** My TAB opens **then** it says so and asks them to contact TAB.
4. **Given** a signed-in client **when** the session is stored **then** it lives in cookies only the server can read, **and** an idle session ends after 7 days.
5. **Given** a client who wants stronger protection **when** they choose to add two-step verification **then** later sign-ins ask for the second step.

### US-603 · See only my own information
- **As a** client **I want** My TAB to show me only my own records **so that** my information stays private from other clients
- **Persona:** P-CLI
- **Epic:** E6
- **Priority:** Must
- **Phase:** P2
- **Requirements:** SEC-002, SEC-016
- **Delivered by:** F-21
- **Draft:** yes

1. **Given** a signed-in client **when** My TAB reads any record **then** only their own records are returned, **and** another client's plan, notes or forms are never readable.
2. **Given** a client changes something on their record **when** it is saved **then** only the columns clients may change are written, **and** anything else is refused by the database.
3. **Given** a client **when** they try to change their programs or log an activity removed from their program **then** the database refuses.

### US-604 · Choose what I consent to and change my mind
- **As a** client **I want** to see and change my permissions **so that** I stay in control of how TAB uses my information
- **Persona:** P-CLI
- **Epic:** E6
- **Priority:** Must
- **Phase:** P2
- **Requirements:** SEC-010, PORTAL-010
- **Delivered by:** F-30, F-21
- **Draft:** yes

1. **Given** Profile → Privacy and permissions **when** a client turns an optional permission on or off **then** the change is saved straight away.
2. **Given** a consent that is required to use My TAB **when** the client views it **then** it says "Required to use My TAB" and can't be switched off there.
3. **Given** any consent change **when** it is saved **then** it is added to a history with its purpose, version and date, stamped by the server, **and** earlier entries are never edited or deleted, so a withdrawal is a new entry.
4. **Given** a client who wants a copy of their information or its deletion **when** they look in Profile **then** it tells them to email TAB.

### US-605 · Keep my details and preferences current
- **As a** client **I want** to update my own details, accessibility needs and goals **so that** TAB works with up-to-date information about me
- **Persona:** P-CLI
- **Epic:** E6
- **Priority:** Should
- **Phase:** P2
- **Requirements:** PORTAL-010
- **Delivered by:** F-30, C16
- **Draft:** yes

1. **Given** Profile **when** a client changes their preferred name or phone number **then** the change is saved to their record.
2. **Given** Profile **when** the client records their accessibility needs or their own goals **then** they are saved as fields the client controls.

### US-701 · See where I am at a glance
- **As a** client **I want** a dashboard that shows what matters this week **so that** I know what to focus on without searching
- **Persona:** P-CLI
- **Epic:** E7
- **Priority:** Must
- **Phase:** P2
- **Requirements:** PORTAL-002
- **Delivered by:** F-22
- **Draft:** yes

1. **Given** a signed-in client **when** they open My TAB **then** the dashboard shows this week's activities (or "You're all caught up this week."), their next appointment, their TAB Method stage, their plan and next progress review date, their programs, resources picked for them and the latest review their practitioner shared.
2. **Given** the stage indicator **when** it renders **then** it shows where they are among the TAB Method stages, with no points, badges or rankings.
3. **Given** this week's check-in isn't done **when** the dashboard loads **then** it invites them to it.
4. **Given** their practitioner changed their stage in the last 30 days **when** the dashboard loads **then** it says to which stage and on what date.

### US-702 · Read my plan and the notes shared with me
- **As a** client **I want** to read the TAB Performance Plan we created together and what my practitioner shared after sessions **so that** I know what we're working on and what comes next
- **Persona:** P-CLI
- **Epic:** E7
- **Priority:** Must
- **Phase:** P2
- **Requirements:** PORTAL-003, PORTAL-011
- **Delivered by:** F-23, F-32, F-34
- **Draft:** yes

1. **Given** the practitioner has made the Performance Plan visible **when** the client opens My plan **then** they see its focus, goals and how progress will be known, with any service plans shared with them.
2. **Given** no plan is visible yet **when** the client opens My plan **then** it says "Your plan is being prepared." and that their practitioner will share it after the first conversation.
3. **Given** session notes and plan-log entries **when** the client views them **then** only those marked "Shared with client" appear, **and** internal notes and practitioner-only plan sections never do.

### US-703 · Work through my program week by week
- **As a** client **I want** my program laid out week by week, adjusted for me **so that** I know exactly what to do between sessions
- **Persona:** P-CLI
- **Epic:** E7
- **Priority:** Must
- **Phase:** P2
- **Requirements:** PORTAL-004, SEC-017
- **Delivered by:** F-24, F-35, F-37
- **Draft:** yes

1. **Given** an assigned program **when** the client opens it **then** they see the current week's activities with their practitioner's personalization (adjusted prescriptions and notes, skipped activities left out) and can tick each one off.
2. **Given** an activity added only for them **when** the week renders **then** it appears at the end of the week marked "added for you".
3. **Given** a paused program **when** the client opens it **then** it says the program is paused for now, **and** a completed one says "You've completed this program."
4. **Given** a program that isn't published, or that the client isn't enrolled in, entitled to or in a cohort for, **when** the client tries to read it **then** its content and any cohort meeting links stay hidden.

### US-704 · Respond to an activity and get feedback
- **As a** client **I want** to reply to an activity and hear back from my practitioner **so that** my work between sessions becomes a conversation
- **Persona:** P-CLI
- **Epic:** E7
- **Priority:** Must
- **Phase:** P2
- **Requirements:** PORTAL-004
- **Delivered by:** F-24, A25
- **Draft:** yes

1. **Given** an activity such as a worksheet, reflection or check-in **when** the client writes a response **then** it is saved with the activity for their practitioner to read.
2. **Given** a client response **when** the practitioner replies **then** the feedback appears with the activity in My TAB.

### US-705 · Check in weekly and see progress my way
- **As a** client **I want** a quick weekly check-in and a view of my progress that isn't a scoreboard **so that** I can see how far I've come on my own terms
- **Persona:** P-CLI
- **Epic:** E7
- **Priority:** Should
- **Phase:** P2
- **Requirements:** PORTAL-005
- **Delivered by:** F-25
- **Draft:** yes

1. **Given** the weekly check-in **when** the client rates energy, sleep and stress and notes wins, challenges and the support they need **then** it saves with "Saved. Thank you for checking in." and can be updated during the same week.
2. **Given** Progress **when** the client opens it **then** it shows their goals, progress reviews, past check-ins and trends, introduced as progress measured by what matters to them, not only by numbers.
3. **Given** progress measures **when** the page renders **then** they are optional, **and** nothing ranks or scores the client against anyone else.

### US-706 · Hear about meaningful changes without sensitive details
- **As a** client **I want** to be told when something important changes, without private details in my inbox **so that** I stay informed and my information stays protected
- **Persona:** P-CLI
- **Epic:** E7
- **Priority:** Must
- **Phase:** P2
- **Requirements:** PORTAL-012
- **Delivered by:** F-33, F-10
- **Draft:** yes

1. **Given** the practitioner changes the client's stage **when** the email is sent **then** its subject is "Your My TAB Stage Has Been Updated" **and** the body asks them to sign in to My TAB, naming no stage, review text or health details.
2. **Given** any email TAB sends **when** CI renders it with sample data **then** its subject and preview carry no personal or health details.
3. **Given** a client who has chosen how to hear from TAB **when** a meaningful update happens **then** the notice uses that channel where practical.

### US-707 · Complete my forms and pick up where I left off
- **As a** client **I want** to fill in my forms in My TAB at my own pace **so that** I can give TAB what it needs without rushing
- **Persona:** P-CLI
- **Epic:** E7
- **Priority:** Must
- **Phase:** P2
- **Requirements:** PORTAL-008, SEC-016
- **Delivered by:** F-27
- **Draft:** yes

1. **Given** a form assigned to the client **when** they open Forms **then** it is listed, **and** with none the page says "No forms right now."
2. **Given** a partly completed form **when** the client chooses "Save and finish later" **then** their answers are kept for next time.
3. **Given** the client submits a form **when** the database receives it **then** it is accepted only for a form assigned to them, **and** the submit time is stamped by the server.
4. **Given** the practitioner withdraws a form **when** the client next opens Forms **then** it no longer appears.

### US-708 · Upload a document safely
- **As a** client **I want** to attach a document to a form securely **so that** I can share what my practitioner needs without email
- **Persona:** P-CLI
- **Epic:** E7
- **Priority:** Must
- **Phase:** P2
- **Requirements:** PORTAL-008, SEC-007
- **Draft:** yes

1. **Given** a form that asks for an attachment **when** the client uploads a file **then** it is scanned for malware before anyone can open it.
2. **Given** an uploaded or shared document **when** it is opened **then** it is served through a short-lived signed link.
3. **Given** a file over the size limit or of a type that isn't allowed **when** it is uploaded **then** it is refused.

### US-801 · See my clients and open one connected record
- **As a** practitioner **I want** my client list and one connected record per client **so that** I can prepare for sessions without hunting across systems
- **Persona:** P-PRA
- **Epic:** E8
- **Priority:** Must
- **Phase:** P2
- **Requirements:** STAFF-001, SEC-002
- **Delivered by:** F-31, F-21
- **Draft:** yes

1. **Given** a practitioner signed in to TAB Practice **when** they open Clients **then** they see only their assigned clients, filterable by Active, Prospects, Paused and Alumni, with counts of who checked in this week and who needs follow-up.
2. **Given** a client record **when** it opens **then** it brings together the client profile, the service record (notes, forms, appointments) and the TAB journey (stage, plans, programs, progress reviews, check-ins).
3. **Given** a client outside their care team **when** the practitioner tries to open that record by its address **then** nothing is shown.

### US-802 · Record the whole-person client profile
- **As a** practitioner **I want** a shared profile of who the client is and what matters to them **so that** every practitioner starts from the same understanding
- **Persona:** P-PRA
- **Epic:** E8
- **Priority:** Should
- **Phase:** P2
- **Requirements:** STAFF-002
- **Delivered by:** F-31
- **Draft:** yes

1. **Given** a client record **when** the practitioner edits the profile **then** they can record where the client is now, what meaningful progress would look like, what their life looks like (work, caregiving, activity, recreation, stress, sleep, time) and their preferences, including accessibility considerations.
2. **Given** the internal current-relationship section **when** it is saved **then** it holds the primary service, other active services, primary goal, current stage, current practitioners and next meaningful review, **and** the client never sees it.

### US-803 · Capture a service-specific intake for each pillar
- **As a** practitioner **I want** an intake for the service a client is starting **so that** I know what I need to provide that service appropriately
- **Persona:** P-PRA
- **Epic:** E8
- **Priority:** Should
- **Phase:** P2
- **Requirements:** STAFF-003
- **Delivered by:** F-48
- **Draft:** yes

1. **Given** a client starting a service **when** the practitioner assigns that pillar's intake **then** it asks what that service needs to know, such as areas of concern, desired session outcome and preferences for Massage & Bodywork.
2. **Given** any of the five intakes **when** the client completes it **then** it includes a consent and scope-of-practice acknowledgement they accept before submitting.
3. **Given** health details in an intake **when** they are collected **then** they are collected in My TAB only, never by email.

### US-804 · Write session notes, keeping internal notes apart
- **As a** practitioner **I want** to write session notes and choose what the client sees **so that** I can be candid in my notes while sharing a clear summary
- **Persona:** P-PRA
- **Epic:** E8
- **Priority:** Must
- **Phase:** P2
- **Requirements:** STAFF-004, PORTAL-011, SEC-019
- **Delivered by:** F-32
- **Draft:** yes

1. **Given** a client record **when** a practitioner adds a note **then** it is "Internal only" by default, **and** the client sees it only if "Share with client" is chosen.
2. **Given** an internal note **when** anyone reads or changes it **then** it is reached only through audited functions in a schema the client-facing API doesn't expose, **and** each read and change is logged.
3. **Given** a new note **when** the practitioner writes it **then** the form follows Current status, Intervention or experience, Client response and Next step.

### US-805 · Write the Performance Plan with my client
- **As a** practitioner **I want** to write the client's Performance Plan and any service plans with them **so that** we share one clear picture of goals and next steps
- **Persona:** P-PRA
- **Epic:** E8
- **Priority:** Must
- **Phase:** P2
- **Requirements:** STAFF-005
- **Delivered by:** F-34
- **Draft:** yes

1. **Given** a client with no active Performance Plan **when** the practitioner creates one with focus, goals and a review date **then** it stays hidden from the client until it is marked visible.
2. **Given** a client **when** plans are added **then** there is at most one active Performance Plan, **and** service plans (massage & bodywork, strength, women's wellness, life coaching, nutrition) sit under it with their type's sections.
3. **Given** a plan section or plan-log entry marked practitioner-only or internal **when** the client views the plan **then** it never appears.
4. **Given** a nutrition plan **when** anyone creates or edits it **then** only a practitioner holding the nutrition coaching credential can, owners included, **and** its content stays within health-coaching scope (habits and eating patterns, never meal plans for medical conditions).

### US-806 · Record a progress review with the client
- **As a** practitioner **I want** a guided progress review **so that** we reflect together on what changed and whether the approach still fits
- **Persona:** P-PRA
- **Epic:** E8
- **Priority:** Must
- **Phase:** P2
- **Requirements:** STAFF-006
- **Delivered by:** F-33
- **Draft:** yes

1. **Given** Progress review on a client record **when** the practitioner works through it **then** it asks what has changed, what remains difficult, what has been learned, whether anything in their circumstances has changed, and whether the current approach still fits, which is required.
2. **Given** the summary and next steps **when** "Share the summary and next steps" is ticked **then** they appear in the client's My TAB, **and** unticked they stay in TAB Practice.
3. **Given** a saved review **when** the practitioner returns to the client record **then** it is listed under Progress reviews.

### US-807 · Change a client's stage only after we've discussed it
- **As a** practitioner **I want** stage changes to happen only through a review I confirm **so that** a client's TAB Method stage always reflects a conversation we've had
- **Persona:** P-PRA
- **Epic:** E8
- **Priority:** Must
- **Phase:** P2
- **Requirements:** STAFF-006, PORTAL-012
- **Delivered by:** F-33
- **Draft:** yes

1. **Given** a progress review with a different TAB Method stage chosen, in either direction, **when** the practitioner saves **then** they must first confirm they've discussed the stage change with the client.
2. **Given** a confirmed stage change **when** it is saved **then** the review and the new stage are saved together, **and** the change joins a stage history (from, to, review, who, when) that no one can edit or delete.
3. **Given** the change **when** it is saved **then** the client sees it on their dashboard and is emailed that their stage has been updated.

### US-808 · Record the continuation outcome
- **As a** practitioner **I want** to record what happens at the end of a service period **so that** the team knows whether a client continues, maintains, moves on or pauses
- **Persona:** P-PRA
- **Epic:** E8
- **Priority:** Should
- **Phase:** P2
- **Requirements:** STAFF-008
- **Delivered by:** F-33, A25
- **Draft:** yes

1. **Given** the end of a meaningful service period **when** the practitioner records the continuation conversation **then** they choose one of Continue, Maintain, Independent, Shift, Pause or Return.
2. **Given** a recorded outcome **when** the client record is opened **then** it shows the outcome with its date and who recorded it.

### US-809 · Get a prompt when a client may be ready for a review
- **As a** practitioner **I want** TAB Practice to point out clients who may be ready for a progress review **so that** no one stays in a stage longer than they need to
- **Persona:** P-PRA
- **Epic:** E8
- **Priority:** Must
- **Phase:** P3
- **Requirements:** STAFF-006
- **Delivered by:** F-46, C14
- **Draft:** yes

1. **Given** a plan review date reached, most active goals achieved, a program completed, several weeks of steady or improving check-ins, or a long time in one stage without a review **when** the practitioner opens TAB Practice **then** a prompt says the client may be ready for a progress review and lists the reasons.
2. **Given** a prompt **when** it appears **then** it is shown only in TAB Practice, never to the client, **and** it never changes a stage by itself.

### US-810 · Hand a client to another service with their consent
- **As a** practitioner **I want** to refer a client to another pillar with a short handoff summary **so that** the next practitioner picks up the thread without the client repeating themselves
- **Persona:** P-PRA
- **Epic:** E8
- **Priority:** Should
- **Phase:** P2
- **Requirements:** STAFF-007
- **Delivered by:** F-49
- **Draft:** yes

1. **Given** a practitioner refers a client to another pillar **when** they write the referral **then** it carries the four-box summary: Context, Goal, Progress, Next.
2. **Given** the referral **when** it is saved **then** it records the client's consent to explore the other service, be contacted and have relevant information shared internally.
3. **Given** the receiving practitioner **when** they open the referral **then** they can review it, connect with the client, run the service intake and decide with the client whether the service fits.

### US-811 · Build and publish programs in the library
- **As a** practitioner **I want** to write reusable programs and have them reviewed before they're used **so that** clients only ever receive finished, approved programs
- **Persona:** P-PRA
- **Epic:** E8
- **Priority:** Must
- **Phase:** P2
- **Requirements:** STAFF-009, SEC-017
- **Delivered by:** F-36, F-38
- **Draft:** yes

1. **Given** TAB Practice → Programs **when** any practitioner creates a program **then** they write weeks and activities (type, instructions and prescription fields such as sets, reps, load and duration), saved as one draft they can submit for review.
2. **Given** the owner or a practitioner with the publishing permission publishes a version **when** it goes out **then** it can be assigned, the previous published version is retired, **and** clients who have that version keep it.
3. **Given** a published or retired version **when** anyone tries to edit it **then** the change is refused, **and** "Edit as a new version" starts a new draft instead.
4. **Given** a retired program **when** a practitioner tries to assign it **then** it isn't available.

### US-812 · Assign and personalize a program for a client
- **As a** practitioner **I want** to assign a program and adjust it for one client **so that** it fits them without changing the program for everyone else
- **Persona:** P-PRA
- **Epic:** E8
- **Priority:** Must
- **Phase:** P2
- **Requirements:** STAFF-009
- **Delivered by:** F-35, F-37
- **Draft:** yes

1. **Given** a published program **when** the practitioner assigns it with a start date, status and, optionally, the plan it supports **then** the version is pinned to that assignment **and** the program appears in the client's My TAB.
2. **Given** personalization (a note to the client, skipping an activity, adjusting its prescription values, an activity note) **when** it is saved **then** it changes this client's program only, never the library template.
3. **Given** a newer published version **when** the practitioner moves the client to it **then** completed activities and personalization carry over in one step.
4. **Given** an activity added only for this client **when** they move to a newer version **then** it stays with them.

### US-813 · Control what each practitioner can do
- **As a** business owner **I want** to decide who publishes programs and who holds the nutrition credential, and to keep each practitioner to their own clients **so that** the team grows without anyone seeing or doing more than their role allows
- **Persona:** P-OWN
- **Epic:** E8
- **Priority:** Must
- **Phase:** P2
- **Requirements:** SEC-001, SEC-018, STAFF-009
- **Delivered by:** F-38, F-21
- **Draft:** yes

1. **Given** TAB Practice → Team **when** the owner grants or removes a practitioner's publishing permission or nutrition coaching credential **then** it applies at once, **and** no one else can change it.
2. **Given** a practitioner has been deactivated **when** they next try to read client records **then** access is refused.
3. **Given** a practitioner **when** they work in TAB Practice **then** they see only staff profiles and their own clients, **and** account and billing links stay owner-only.
4. **Given** any record a practitioner writes **when** it is saved **then** its author is stamped from the signed-in person, whatever the form sends.

### US-814 · Draft a program template with AI help
- **As a** practitioner **I want** AI to draft a program template from my description **so that** I spend my time refining programs rather than typing them out
- **Persona:** P-PRA
- **Epic:** E8
- **Priority:** Must
- **Phase:** P3
- **Requirements:** STAFF-009
- **Delivered by:** F-47, C13, A24
- **Draft:** yes

1. **Given** the program editor **when** a practitioner describes a program (pillar, audience, length, goal, constraints) and chooses "Draft with AI" **then** a structured draft opens for them to edit.
2. **Given** a drafting request **when** it is sent to the AI provider **then** it contains only what the practitioner typed, never client names, plans, check-ins, notes or forms.
3. **Given** an AI draft **when** it is saved **then** it stays a draft until a person publishes it, **and** it makes no diagnosis, treatment or outcome claims.
4. **Given** no API key is configured **when** the editor opens **then** the "Draft with AI" button is hidden.

### US-815 · Keep one identity per client across systems
- **As a** business owner **I want** each client to have one lasting identity that links their Timely, Stripe and My TAB accounts **so that** records never split or merge by accident
- **Persona:** P-OWN
- **Epic:** E8
- **Priority:** Must
- **Phase:** P2
- **Requirements:** INT-002
- **Delivered by:** F-20
- **Draft:** yes

1. **Given** a client record **when** it is created **then** its permanent identity is an internal ID, with Timely, Stripe and My TAB account IDs stored as separate mapped fields.
2. **Given** a client's email address changes **when** their record is updated **then** their plans, programs and history stay on the same record, because email is never the permanent key.

### US-901 · Edit website pages in the content editor
- **As a** website admin **I want** to edit page content myself in a guided editor **so that** small changes don't wait for a developer
- **Persona:** P-ADM
- **Epic:** E9
- **Priority:** Must
- **Phase:** P1
- **Requirements:** CMS-005, CMS-001
- **Delivered by:** F-57, F-58, A31
- **Draft:** yes

1. **Given** an invited editor **when** they open /keystatic **then** they sign in with a Keystatic Cloud account and need no GitHub account.
2. **Given** the editor **when** they look for what to change **then** the five service pages, the massage techniques guide, Home, The TAB Method, About, Our Story, Our Team and the resource library are available.
3. **Given** a field with limits **when** the editor types **then** the limit shows (a search description must be 40 to 160 characters, for example), **and** the build applies the same rules.
4. **Given** Home or The TAB Method **when** the editor changes it **then** every word can change, but the section order, stage names and business figures cannot.

### US-902 · Make changes on a branch, checked and previewed
- **As a** website admin **I want** every change I make checked and previewed before anyone can publish it **so that** I can't break the live site by mistake
- **Persona:** P-ADM
- **Epic:** E9
- **Priority:** Could
- **Phase:** P1
- **Requirements:** CMS-004
- **Delivered by:** F-57, F-59, F-44
- **Draft:** yes

1. **Given** the editor is on main **when** the editor tries to save **then** the save is refused with instructions to start a new branch, **and** nothing is saved.
2. **Given** the first save on a content/… branch **when** it is made **then** a change request opens by itself, **and** every save runs the full checks and builds a private preview.
3. **Given** a check fails **when** the editor opens the change request **then** it names the rule and the place, **and** they fix it on the same branch.
4. **Given** an editor commit reaches main some other way **when** the safety net runs **then** within a minute it is moved to content/saved-on-main with a change request and taken back out of main.
5. **Given** a published page **when** its record is opened **then** it shows its content owner, scope review, accessibility review, published date and next review date.

### US-903 · Build a service page from approved blocks
- **As a** website admin **I want** to arrange a service page from a set of approved section types **so that** I can improve a page without breaking its design
- **Persona:** P-ADM
- **Epic:** E9
- **Priority:** Must
- **Phase:** P1
- **Requirements:** WEB-005, CMS-001
- **Delivered by:** F-57
- **Draft:** yes

1. **Given** a service page in the editor **when** the editor adds, removes or reorders sections **then** they choose from the block library: text and photo, card grid, techniques index, TAB Method band, numbered steps and questions.
2. **Given** a service page **when** it is saved **then** it has at most one TAB Method band and one Questions section, **and** the scope note always shows.
3. **Given** a section **when** the editor sets its background **then** they choose Bone or Linen, **and** the TAB Method band and the closing call to action keep their fixed tones.
4. **Given** a kind of section the library doesn't have **when** someone wants it **then** it is requested as a Design change, not built in the editor.

### US-904 · Change headlines, taglines and button labels without code
- **As a** business owner **I want** the words that carry the brand to be content I can edit **so that** the tagline, headlines and calls to action can evolve without a code change
- **Persona:** P-OWN
- **Epic:** E9
- **Priority:** Must
- **Phase:** P1
- **Requirements:** CMS-005
- **Delivered by:** F-57, F-58, F-44, C35b
- **Draft:** yes

1. **Given** a page in the content editor **when** the owner changes a headline, tagline or button label **then** the change goes live through the normal review with no code change.
2. **Given** a button **when** the owner edits it **then** they can change its label and whether it books or goes to Start Where You Are, **and** the booking links themselves come from Settings.
3. **Given** the FAQ, Start's text or the client policies **when** C35b has shipped **then** they can be edited the same way, **and** until then they change through a Content help request.

### US-905 · Add a team member with confirmed credentials
- **As a** website admin **I want** to add and update people on Our Team **so that** the page stays current without inventing anything
- **Persona:** P-ADM
- **Epic:** E9
- **Priority:** Must
- **Phase:** P1
- **Requirements:** WEB-009, CMS-001
- **Delivered by:** F-58
- **Draft:** yes

1. **Given** Pages → Our Team **when** the editor adds a person **then** they enter the name, role, short bio and the services the person offers.
2. **Given** a photo **when** it is uploaded **then** it must be a JPEG, PNG or WebP of at most 5 MB with a photo description, or the checks fail.
3. **Given** credentials **when** they are entered **then** they show on the live site only once "Credentials confirmed" is ticked.

### US-906 · Add a guide or link to the resource library
- **As a** website admin **I want** to add TAB's guides and useful links to the library **so that** visitors and clients can find them by topic
- **Persona:** P-ADM
- **Epic:** E9
- **Priority:** Should
- **Phase:** P1
- **Requirements:** WEB-010, CMS-001, CMS-002
- **Delivered by:** F-58, A35
- **Draft:** yes

1. **Given** Resources → Add **when** the editor creates a resource **then** it needs a title, a one-line summary, an existing topic and, optionally, the related service.
2. **Given** a link **when** it is saved **then** it must start with https:// or /, **and** a document must be a real PDF of at most 10 MB, with "ask for an email address first" on unless turned off.
3. **Given** a resource marked Draft **when** the site builds **then** it shows on previews only, **and** once Published it shows on the live site after the change is released.
4. **Given** a subject set to open a resource **when** the checks run **then** the resource must exist in the same topic and sit under only one subject, or the checks fail.

### US-907 · Ask for a website change in TAB Practice
- **As a** practitioner **I want** to ask for a website change without a GitHub account **so that** I can flag what needs fixing alongside my client work
- **Persona:** P-PRA
- **Epic:** E9
- **Priority:** Must
- **Phase:** P1
- **Requirements:** CMS-007
- **Delivered by:** F-55
- **Draft:** yes

1. **Given** any staff member signed in to TAB Practice **when** they choose Website changes → New request **then** they pick Content help or Design change, tick the pages it affects, choose the kind of change, and give a title, description, reason, priority and any deadline.
2. **Given** the request is sent **when** it is saved **then** it gets a number (for example #12) and the status New.
3. **Given** someone other than the owner filed it **when** it is saved **then** matthew@ and info@tabhumanperformance.com receive an email naming only the request number.
4. **Given** the request form or a note **when** staff write in it **then** they are reminded never to include a client's name or health details.

### US-908 · Follow my request through to the live site
- **As a** website admin **I want** to see where my request stands and answer questions on it **so that** I know when my change will be live
- **Persona:** P-ADM
- **Epic:** E9
- **Priority:** Must
- **Phase:** P1
- **Requirements:** CMS-007
- **Delivered by:** F-55
- **Draft:** yes

1. **Given** a request **when** the website admin opens it **then** they see its status, what that status means, the notes thread and, once one exists, a link to the preview.
2. **Given** a question from Claude **when** the admin answers in a note **then** the note is kept on the request as written.
3. **Given** the admin **when** they look for a way to change the request's status **then** there is none: only the owner changes a status, and Claude keeps it current.
4. **Given** a new request or staff note **when** the daily check runs each morning (07:52 Detroit time) **then** Claude replies in the notes and moves the status, without building or releasing anything.

### US-909 · Choose a design option before anything is built
- **As a** business owner **I want** design requests to come back to me as options with effort and risks **so that** nothing changes how the site looks or works until I've chosen
- **Persona:** P-OWN
- **Epic:** E9
- **Priority:** Must
- **Phase:** P1
- **Requirements:** CMS-007, CMS-006
- **Delivered by:** F-55
- **Draft:** yes

1. **Given** a Design change request **when** Claude triages it **then** the notes carry questions and then options with effort and risks (to accessibility, phones, brand rules or search), **and** the status moves to Questions or options, then Waiting on you.
2. **Given** no option has been chosen **when** Claude has replied **then** nothing is built.
3. **Given** the owner chooses an option **when** building starts **then** the status becomes In progress, **and** In review with the preview link once a preview is ready.
4. **Given** the owner approves and promotes the release **when** it is live **then** the request becomes Live, **and** the owner can also decline a request with the reason in its notes, or reopen it.

### US-910 · Know what I can edit and how
- **As a** website admin **I want** one guide to the editing process, what's editable and what each part of a page is called **so that** I can make changes confidently and ask for the rest in the right way
- **Persona:** P-ADM
- **Epic:** E9
- **Priority:** Must
- **Phase:** P1
- **Requirements:** CMS-006
- **Delivered by:** F-55, C39
- **Draft:** yes

1. **Given** the Website content guide **when** an editor opens it **then** it starts with a step-by-step walkthrough of a change, from opening the editor to seeing it live, using the editor's own button names, with a map of the editor, a timeline, screenshots, worked examples and what to do when something looks wrong.
2. **Given** the Website content guide **when** an editor reads on **then** it explains the two lanes, who can do what, each step of each lane, what is and isn't editable, the checks every change passes and a glossary naming every part of a page.
3. **Given** a new public page **when** CI runs **then** the documentation check fails until the guide lists the page.
4. **Given** a change to the block library, what is editable, the checks or the request workflow **when** it is released **then** the guide is updated in the same release.

### US-911 · Give a helper website-only access
- **As a** business owner **I want** to invite someone to help with the website without giving them client data **so that** I can share the website work safely
- **Persona:** P-OWN
- **Epic:** E9
- **Priority:** Must
- **Phase:** P1
- **Requirements:** STAFF-011, SEC-001
- **Delivered by:** F-56
- **Draft:** yes

1. **Given** Settings → Website admins **when** the owner invites someone by name and work email **then** they receive a single-use link valid for 24 hours, **and** an address that belongs to a client record is refused.
2. **Given** the invited admin **when** they first sign in **then** they set up an authenticator app and a password, and from then on sign in like all staff.
3. **Given** an admin **when** they sign in to TAB Practice **then** they see Website changes, Website stats and Sign-in & security only, **and** client records, Settings and Team are refused.
4. **Given** the owner presses Remove next to an admin **when** it is confirmed **then** their staff access ends straight away, **and** they can be invited again later.

### US-912 · Publish my own content changes through the fast lane
- **As a** business owner **I want** my own content-only changes to go live once every check passes **so that** small updates don't need a separate approval round
- **Persona:** P-OWN
- **Epic:** E9
- **Priority:** Could
- **Phase:** P1
- **Requirements:** CMS-004
- **Delivered by:** F-60, C32, A32, C39
- **Draft:** yes

1. **Given** a change request authored by the owner that touches only content files and passes every check **when** CI finishes **then** it is squash-merged **and** that exact production build is promoted without a separate approval.
2. **Given** a change request by an admin or Claude, or one touching anything outside the content files, **when** it is green **then** it still waits for the owner's approval (G2) and promotion (G3).
3. **Given** a Keystatic Cloud edit can't be traced to the owner **when** the fast lane is built **then** it covers only the owner's direct edits.
4. **Given** the owner's change request **when** it opens **then** its description says what happens next and not to merge it by hand, **and** a change request merged by hand before the checks finish goes live only with the next promotion.

### US-913 · Switch the banner and optional pages from Settings
- **As a** business owner **I want** to switch site-wide features on and off myself **so that** I don't need to ask for a release to change them
- **Persona:** P-OWN
- **Epic:** E9
- **Priority:** Must
- **Phase:** P1
- **Requirements:** WEB-015, WEB-009, WEB-010
- **Delivered by:** F-53
- **Draft:** yes

1. **Given** Settings **when** the owner switches the name-change banner, the Start Where You Are form, Resources or Our Team on or off and saves **then** the site follows within a few seconds, including menus, pages, the homepage and the sitemap.
2. **Given** Events & Workshops and Testimonials **when** the owner views Settings **then** their switches are shown but locked until there is real content.
3. **Given** anyone other than the owner **when** they open Settings **then** they can't change anything, **and** every change is recorded with who made it and when.

### US-914 · Open the content editor from TAB Practice
- **As a** website admin **I want** to open the content editor from TAB Practice once I'm signed in **so that** I use one front door for the website and nobody without a website role can reach the editor
- **Persona:** P-ADM
- **Epic:** E9
- **Priority:** Must
- **Phase:** P1
- **Requirements:** STAFF-011, SEC-001, SEC-015
- **Delivered by:** F-61, C38
- **Draft:** yes

1. **Given** the owner or a website admin signed in to TAB Practice with two-step verification **when** they choose Edit the website **then** the content editor opens, **and** Keystatic asks for its own sign-in only when its session on that device has lapsed.
2. **Given** someone who isn't signed in **when** they open `/keystatic` **then** they are sent to TAB Practice sign-in, **and** after the password and two-step steps they return to the editor.
3. **Given** a practitioner **when** they open `/keystatic` **then** they are sent to Website changes with a note that the editor is for the owner and website admins.
4. **Given** a client signed in to My TAB **when** they open `/keystatic` **then** they are sent to staff sign-in and never see the editor.
5. **Given** a sign-in address whose return place isn't on TAB's fixed list **when** sign-in completes **then** it goes to TAB Practice, never to another address.

### US-1001 · Review every change on a private preview
- **As a** business owner **I want** to check each change on a private preview with its checks passed before I approve it **so that** nothing reaches the live site unreviewed
- **Persona:** P-OWN
- **Epic:** E10
- **Priority:** Must
- **Phase:** P1
- **Requirements:** SEC-008, NFR-007, NFR-009
- **Delivered by:** F-40, F-41, A18
- **Draft:** yes

1. **Given** a pull request **when** it opens or changes **then** CI runs the full checks (typecheck, brand and contrast checks, database security tests, the documentation check, a production build and the end-to-end smoke, redirect, link, search, header, CSP and accessibility scans) with no retries, **and** Vercel builds a preview.
2. **Given** the preview **when** the owner opens it **then** it sits behind Vercel login, runs on demo data only and can't be indexed.
3. **Given** the owner approves that specific pull request and CI is green on its latest commit **when** Claude merges it **then** it is a squash merge, approval never carries to another pull request, **and** a push after approval needs approval again unless it only fixes CI.

### US-1002 · Promote exactly the build I checked
- **As a** business owner **I want** each release to go live only when I say "promote", exactly as I checked it **so that** I stay in control of the live site and can undo a release quickly
- **Persona:** P-OWN
- **Epic:** E10
- **Priority:** Must
- **Phase:** P1
- **Requirements:** SEC-008, CMS-004
- **Delivered by:** F-41
- **Draft:** yes

1. **Given** a merge to main **when** Vercel builds it **then** the production deployment isn't live yet, **and** Claude sends its address.
2. **Given** the owner checks it and says "promote" **when** Claude acts **then** that exact deployment goes live without a rebuild, **and** Claude confirms.
3. **Given** commits that reached main without a merged pull request since the live deployment **when** Claude asks for promotion **then** each is listed for the owner to confirm.
4. **Given** something looks wrong after a release **when** the owner asks to roll back **then** the previous deployment is promoted in one step.
5. **Given** a database migration for production **when** it is ready **then** it needs its own G3 approval.

### US-1003 · Go public only when the site is ready, and watch it afterwards
- **As a** business owner **I want** the site hidden from search until launch and watched closely after it **so that** nobody finds an unfinished site and problems after launch are caught early
- **Persona:** P-OWN
- **Epic:** E10
- **Priority:** Must
- **Phase:** P1
- **Requirements:** NFR-009, NFR-007, NFR-002, NFR-010
- **Delivered by:** F-13, F-18, F-51, C1, C2
- **Draft:** yes

1. **Given** any deployment before launch **when** a search engine reaches it **then** its pages are marked noindex and sit behind Vercel login, **and** My TAB and TAB Practice are never indexable.
2. **Given** a build with search indexing switched on **when** any required launch-checklist item is still open **then** the build fails and names the open items.
3. **Given** launch day **when** the switch-over completes **then** indexing is on only on the production domain, the sitemap is submitted to Search Console **and** the end-to-end checks run against the live domain.
4. **Given** the 30 days after launch **when** a page returns 404, a redirect fails, a form stops sending or a booking link breaks **then** the owner is alerted.

### US-1004 · See how the website is used without tracking anyone
- **As a** business owner **I want** simple counts of how the website is used **so that** I can see what works without tracking visitors
- **Persona:** P-OWN
- **Epic:** E10
- **Priority:** Must
- **Phase:** P1
- **Requirements:** NFR-006, NFR-005
- **Delivered by:** F-14
- **Draft:** yes

1. **Given** TAB Practice → Website stats **when** the owner opens it **then** they see page views per day, the most viewed pages, the sites that sent visitors, Start forms begun and sent, Book clicks and resources opened.
2. **Given** the counts **when** they are recorded **then** they are daily totals with no cookies, IP addresses, user agents or visitor identifiers, so there is no unique-visitor count.
3. **Given** a practitioner **when** they look for Website stats **then** it isn't available to them, **and** only the owner and website admins can see it.

### US-1005 · Open My TAB to clients only when it's safe
- **As a** business owner **I want** to switch My TAB on myself, but only once the go-live conditions are met **so that** no real client data is used before it is protected
- **Persona:** P-OWN
- **Epic:** E10
- **Priority:** Must
- **Phase:** P2
- **Requirements:** SEC-009, SEC-015, SEC-021, WEB-020
- **Delivered by:** F-53, A14, A15, A26, C6
- **Draft:** yes

1. **Given** Settings → Client portal **when** the owner views it **then** they can choose Off or Live, **and** Live stays unavailable until the go-live checklist is complete.
2. **Given** the go-live checklist **when** it is shown **then** it covers client data on the secure database (not demo data), two-step verification for every staff account, security checks passing with no known gaps, a paid database plan with daily backups and a tested restore, and a privacy policy approved and covering My TAB.
3. **Given** the portal is set to Live **when** the site updates **then** "My TAB" appears in the header and footer and clients can sign in, **and** set to Off the site shows no client sign-in and Book covers Timely.
4. **Given** production **when** the portal setting is read **then** demo mode is never available there, **and** it runs only on previews and in tests.

### US-1101 · Use the site with a keyboard or screen reader
- **As a** visitor **I want** the site to work with a keyboard and assistive technology **so that** I can use every page however I browse
- **Persona:** P-VIS
- **Epic:** E11
- **Priority:** Must
- **Phase:** P1
- **Requirements:** NFR-001
- **Delivered by:** F-01, F-16, F-40
- **Draft:** yes

1. **Given** any interactive element **when** it receives keyboard focus **then** a visible 3px focus ring with a 3px offset shows, in cream on dark sections.
2. **Given** any form **when** a visitor uses it **then** every input has a label, **and** errors are explained in text so they can correct them.
3. **Given** decorative artwork and stock photos **when** a screen reader reaches them **then** they are skipped, **and** meaningful images have alt text.
4. **Given** every public page **when** the automated WCAG 2.2 AA scan runs in CI **then** it reports no violations.

### US-1102 · Use the site on a small screen, zoomed in or with less motion
- **As a** visitor **I want** the site to adapt to my phone, my text size and my motion settings **so that** I can read and use it comfortably
- **Persona:** P-VIS
- **Epic:** E11
- **Priority:** Must
- **Phase:** P1
- **Requirements:** NFR-001
- **Delivered by:** F-01, F-16
- **Draft:** yes

1. **Given** a 320px or 390px wide screen **when** any public page loads **then** it fits with no sideways scrolling.
2. **Given** a default text size of 20px or 24px **when** the header renders **then** it uses the Menu button rather than crowding or wrapping.
3. **Given** the visitor's device asks for reduced motion **when** the site would animate **then** motion is reduced.
4. **Given** buttons, links and form controls **when** they are tapped **then** they meet the WCAG 2.2 AA target size.

### US-1103 · Read text with enough contrast
- **As a** visitor **I want** text and controls that stand out clearly from their background **so that** I can read everything without strain
- **Persona:** P-VIS
- **Epic:** E11
- **Priority:** Must
- **Phase:** P1
- **Requirements:** DS-005, NFR-001
- **Delivered by:** F-16
- **Draft:** yes

1. **Given** every text and background pairing and every input border in use **when** the contrast check runs in CI **then** each meets WCAG 2.2 AA, or the check fails.
2. **Given** white text **when** it appears **then** it sits only on Deep Olive, Clay Dark or Graphite.
3. **Given** Clay, Sage and Ochre **when** they appear **then** they are decoration only, never text and never behind white text.
4. **Given** a state such as an error or a selected option **when** it is shown **then** it isn't conveyed by colour alone.

### US-1104 · Use My TAB comfortably with assistive technology
- **As a** client **I want** My TAB to work with a keyboard and assistive technology **so that** I can manage my plan and forms independently
- **Persona:** P-CLI
- **Epic:** E11
- **Priority:** Must
- **Phase:** P2
- **Requirements:** NFR-001
- **Delivered by:** F-22, F-40
- **Draft:** yes

1. **Given** any My TAB page **when** a keyboard user arrives **then** a skip link takes them straight to the main content.
2. **Given** the main My TAB pages **when** the WCAG 2.2 AA scan runs in CI **then** they report no violations.
3. **Given** a My TAB form (check-in, profile or an assigned form) **when** the client fills it in **then** every field has a label **and** errors are explained in text.

### US-1105 · Browse without being tracked
- **As a** visitor **I want** to browse without cookies or anything that identifies me **so that** my visit stays private
- **Persona:** P-VIS
- **Epic:** E11
- **Priority:** Must
- **Phase:** P1
- **Requirements:** NFR-005, SEC-006
- **Delivered by:** F-14
- **Draft:** yes

1. **Given** a visitor on a public page **when** the page view is counted **then** it adds to a daily total with no cookie, IP address, user agent or visitor identifier, **and** any referring site is reduced to its hostname.
2. **Given** a browser sending Global Privacy Control or Do Not Track **when** a page loads **then** nothing is counted.
3. **Given** /my-tab, /practice or /contact **when** a page there loads **then** nothing is counted, by the page, the reporter or the counting route.
4. **Given** a counted event (Start form started or submitted, service viewed, Book clicked, resource opened) **when** it is recorded **then** it carries no properties or personal details.

### US-1106 · Send a form without puzzles while bots are kept out
- **As a** visitor **I want** forms that just work for me while stopping spam **so that** I'm not slowed down and TAB's inbox stays usable
- **Persona:** P-VIS
- **Epic:** E11
- **Priority:** Must
- **Phase:** P1
- **Requirements:** SEC-013
- **Delivered by:** F-09, F-15
- **Draft:** yes

1. **Given** a person using the Start, contact or guide request form or the My TAB sign-in **when** they send it **then** Cloudflare Turnstile checks them, invisibly for most people.
2. **Given** a submission that fills the hidden honeypot field, arrives faster than a person could fill the form in, or repeats a recent submission **when** it is received **then** it is dropped.
3. **Given** many submissions from one connection or for one email address **when** the limit is reached **then** further attempts are refused.
4. **Given** a form posted from another site **when** it reaches TAB **then** it is refused, **and** no other site can show TAB's pages in a frame.

### US-1107 · Sign in to TAB Practice with two-step verification
- **As a** practitioner **I want** a sign-in that always needs a second step **so that** client records stay protected even if my password leaks
- **Persona:** P-PRA
- **Epic:** E11
- **Priority:** Must
- **Phase:** P2
- **Requirements:** SEC-015, SEC-003, SEC-020
- **Delivered by:** F-53, F-54
- **Draft:** yes

1. **Given** /practice/login **when** a practitioner signs in with email and password **then** they must enter the 6-digit code from their authenticator app before seeing anything, setting the app up the first time.
2. **Given** a staff session without two-step verification **when** it reaches TAB Practice **then** it is sent back to verification, **and** the database grants it no staff access.
3. **Given** a forgotten or first password **when** the practitioner asks for it **then** an emailed link signs them in once, **and** a new password needs at least 12 characters, is checked against known breaches and needs a fresh authenticator code to change.
4. **Given** a staff session **when** it has been idle for 7 days, or 30 days have passed since sign-in however active, **then** it ends.
5. **Given** a staff member **when** they try to remove their own two-step requirement **then** it is refused.

### US-1108 · Use a passkey as my second step
- **As a** practitioner **I want** to confirm my sign-in with Face ID, Touch ID or Windows Hello **so that** the second step is quicker without being weaker
- **Persona:** P-PRA
- **Epic:** E11
- **Priority:** Must
- **Phase:** P3
- **Requirements:** SEC-015
- **Delivered by:** F-54, C28
- **Draft:** yes

1. **Given** a passkey added under Sign-in & security **when** the staff member signs in with their password **then** they can confirm with Face ID, Touch ID or Windows Hello instead of the code.
2. **Given** a passkey **when** it is set up **then** the authenticator code stays available as the backup.
3. **Given** a site address other than tabhumanperformance.com or the production address **when** a passkey sign-in is attempted **then** it is refused.

### US-1109 · Know that access to sensitive records is recorded
- **As a** business owner **I want** every read and change of sensitive records logged where no one can alter it **so that** I can show who saw or changed client information
- **Persona:** P-OWN
- **Epic:** E11
- **Priority:** Must
- **Phase:** P2
- **Requirements:** SEC-005, SEC-012, SEC-019
- **Delivered by:** F-21, A26
- **Draft:** yes

1. **Given** a change to any client table, role or staff record **when** it is saved **then** an audit row records who made it and when.
2. **Given** a read or change of internal notes or practitioner-only plan details **when** it happens **then** an audit row is written.
3. **Given** the audit log **when** a signed-in user tries to edit or delete it **then** it is refused, **and** a nightly encrypted copy is kept off the platform once its secrets are added (A26).
4. **Given** the owner, who can see every client (D-045), **when** they read a client's records **then** that access is audited like anyone else's.
