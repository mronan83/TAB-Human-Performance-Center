---
title: Website content guide
version: 1.6
updated: 2026-10-07
owner: Matthew Ronan
---

# Website content guide

<!-- How TAB Human Performance Center's website content is changed: who does what, step by step, what can and can't be
edited, and the names of every part of a page. Rendered by scripts/docs/render-content-guide.mjs; `npm run docs:check`
fails if a public page is missing from "Pages and where their content lives". Update this file in the same PR as any
change to what is editable, the block library, the request workflow or who may do what. -->

## At a glance | Two lanes, one set of checks

Every change to the website travels one of two lanes. Both end at the same automated checks and the same publish step, so nothing reaches the live site without passing the rules that keep it on-brand, accessible and safe.

| Lane | For | Who does it | How long |
|---|---|---|---|
| **Content lane** | Words, FAQs, cards, techniques, photos, the order of sections built from approved blocks | You or a website admin, in the content editor; or anyone on staff asks for it with a **Content help** request | About 10 minutes from saving to live |
| **Design lane** | New kinds of section, layout changes, new pages, menus, forms, anything that changes how the site looks or works | Anyone on staff asks for it with a **Design change** request; Claude designs and builds it; you approve | Small: same session. Larger: a few days |

<!-- lanes -->

_Status, 7 October 2026: website requests live in **TAB Practice → Website changes**, with website admin accounts. The content editor (`/keystatic`) is live for the **five service pages** and the **massage techniques guide**, signed in through Keystatic Cloud. Until the public launch, the whole site sits behind Vercel's login, so only people with access to the Vercel project can reach the editor and TAB Practice. Other pages move into the editor next; until then, and for anything else, file a **Content help** request. The automatic "fast lane" publish comes next (C32)._

## Roles

| Role | Can | Can't |
|---|---|---|
| **Owner** | Edit content; file and follow requests; change a request's status; choose between options; approve design changes; publish; roll back; invite and remove website admins (TAB Practice → Settings) | Bypass the automated checks |
| **Website admin** | Sign in to TAB Practice (password and 6-digit code); file and follow requests and add notes; see the website stats; edit content in the content editor (reachable once the site is past Vercel login, or as a Vercel team member) | See client records, Settings or Team; change a request's status; approve design changes or releases |
| **Practitioner** | File and follow requests and add notes, alongside their client work | Change a request's status; approve design changes or releases |
| **Claude** | Read requests; reply in their notes with questions, options, effort and risks; keep each status current; build design-lane changes; maintain the block library, the checks and this guide; publish approved releases | Build a design change before the owner chooses an option, or publish one without the owner's approval |
| **Automated checks** | Block any change that breaks a rule (see "Rules every change must pass") | Be skipped |

## Which lane is my change in?

| I want to… | Lane |
|---|---|
| Fix a typo, reword a paragraph, update a headline | Content |
| Add, remove or reorder FAQs | Content |
| Add, remove, edit or reorder cards (focus areas, techniques) | Content |
| Swap a photo for another from the library | Content |
| Add a new photo to the library | Design |
| Move a section up or down, hide one, or add another section of an existing type | Content |
| Change a section's background between the approved tones | Content |
| Change a page's search title or description | Content |
| Change booking links, the banner, page switches or whether Start takes submissions | The owner, in **TAB Practice → Settings** (already live) |
| Add a kind of section the site doesn't have yet (a timeline, a pricing table, a video) | Design |
| Change how a section looks or behaves (spacing, columns, mobile layout, colours) | Design |
| Add a new page or change the menus | Design |
| Change a form (Start Where You Are, contact) or anything in My TAB or TAB Practice | Design |
| Change the logo, brand colours, fonts or the business name | Locked (brand standards) |

_Not sure? File either kind of request. Claude will move it to the other lane if it fits there._

## Asking for a change | Requests in TAB Practice

Every request, in either lane, starts in the same place: **TAB Practice → Website changes**. Anyone on staff can file one; nobody needs a GitHub account.

1. **Sign in to TAB Practice** and open **Website changes**, then **New request**.
2. **Choose the kind:** **Content help** (what a page says) or **Design change** (how the site looks or works).
3. **Answer the form.** Tick every page it affects, choose the kind of change, give it a short title, and describe it: where on the page, what it says now and what it should say (content), or what you want to achieve and what's wrong today (design). Add why, how soon and any deadline.
4. **Send.** The request gets a number, for example **#12**, and its status is **New**. If an admin or practitioner sent it, an email naming the number (never what was asked) goes to matthew@ and info@tabhumanperformance.com.
5. **Claude picks it up** at the daily check each morning, or straight away if you start a session and say "pick up website request #12".
6. **Follow it** on the request's page: its status, where it stands, Claude's notes, and the preview link when there is one. Answer questions or choose an option by adding a note.

_Never put a client's name or health details in a request or a note. Requests are about the website only, and they are kept._

<!-- status-flow -->

| Status | What it means | Who acts next |
|---|---|---|
| **New** | Filed; Claude hasn't read it yet | Claude |
| **Questions or options** | Claude has replied in the notes with questions, or options with effort and trade-offs | Whoever filed it, or the owner |
| **Waiting on you** | Needs the owner: an answer, a choice between options, or an approval | The owner |
| **In progress** | Being built | Claude |
| **In review** | A preview is ready; the request shows its link | The owner checks it and says "approved" |
| **Live** | On the website | — |
| **Declined** | Not going ahead; the notes say why. The owner can reopen it | — |

The owner can change a request's status on its page at any time (for example, to decline one or reopen it). Claude keeps the status current as the work moves.

## Website admins | Accounts for the website only

A **website admin** is a TAB Practice account for someone who helps with the website but doesn't work with clients.

1. **The owner invites them** in **TAB Practice → Settings → Website admins**: their name and a work email (not an address on a client record).
2. **They get an email** with a single-use link, valid for 24 hours.
3. **They set up two-step sign-in:** the link signs them in once, then they add an authenticator app for the 6-digit code.
4. **They choose a password** under **Sign-in & security**. From then on they sign in with email, password and code, like all staff.
5. **What they see:** Website changes, Website stats and Sign-in & security; and the content editor once it arrives. Never client records, Settings or Team.
6. **Removing one:** the owner presses **Remove** next to their name in Settings. Access ends straight away; they can be invited again later.

_The content editor is free for up to three editors (you and two admins). A fourth editor needs its paid plan; anyone can still file requests._

## Content lane | Step by step

<!-- content-flow -->

1. **Open the content editor** at `/keystatic` and sign in with your Keystatic account (no GitHub account needed). The owner invites editors; up to three are free.
2. **Start a branch.** In the editor's branch menu choose **New branch** and give it a short name, such as `parking-faq`. The editor adds `content/` in front. Each branch is one change request, so keep one topic per branch. _The editor opens on `main` (the live website's branch), where saving is turned off: start your branch first (see the note below)._
3. **Choose what to edit**: under **Service pages**, one of the five; under **Guides**, the massage techniques guide; under **Pages**, Home, The TAB Method, About, Our Story or Our Team; under **Resources**, the resource library and its topics.
4. **Make your change.** Fields show their limits as you type (a search description must be 40 to 160 characters, for example). Under **Sections** you can add a section, drag sections into a new order, or remove one; each section's own fields are inside it.
5. **Save.** Each save is kept on your branch. It doesn't touch the live site, and you can come back to it later.
6. **The change request opens by itself.** The first save on a branch opens a change request, and every save runs the automated checks (about 10 minutes) and builds a private preview.
   - **All checks pass:** an admin's change waits for the owner's approval; the owner's own content changes will publish automatically once the fast lane is on (C32).
   - **A check fails:** the change request says which rule and where (for example, "content/services/massage-bodywork.json: sections.5.value.items.2.a: String must contain at most 900 character(s)" or "Use 'TAB Human Performance Center' in full"). Fix it in the editor on the same branch and save again.
7. **Live.** The owner approves, Claude merges it and sends the production build, and the owner promotes it. If something looks wrong, rolling back is one step.

_Saving on `main` is turned off (owner request 2026-10-08). The editor opens on `main`, the branch the live site is built from, and shows a green notice at the bottom while you're there: choose **New branch** first. If you try to save on `main` anyway, the editor refuses with the same instructions, and nothing is saved._

_Safety net: if a change still reaches `main` some other way, an automatic check moves it within a minute onto the branch `content/saved-on-main`, opens a change request for it, and takes it back out of `main`. Nothing goes live either way: every release needs the owner's promotion, and before each one Claude lists anything that reached `main` without a change request._

_Empty optional fields are fine. When you clear an optional field (a card grid's heading, say), the editor leaves it out of the file, and the site treats it as empty._

## Resources | Links and documents

The Resources page is a library you build in the editor, under **Resources**. Each **topic** (for example "Massage and recovery") is a card listing its **subjects**. A subject linked to a published **resource** is clickable; the rest say "Coming soon". A resource is either a **link** (another website, or a page on this site) or a **document** (a PDF TAB wrote, uploaded in the editor).

What a visitor gets when they click a subject:

| The resource is | Clicking the subject |
|---|---|
| A document | Downloads and opens the PDF |
| A document that asks for an email address first | Opens a short name-and-email form under the subject; the download link is emailed to them, and TAB gets an email saying who asked |
| A link | Opens that page, on this site or another |

1. **Start a branch** (see "Content lane"). Saving on `main` is turned off.
2. **Add the resource**: Resources → **Add**. Give it a title (it also sets its address), a one-line summary, its **topic** and, if it relates to one, the service.
3. **Choose the kind.**
   - **Link:** another website's address (starting with `https://`), or a page on this site (starting with `/`, for example `/services/massage-bodywork`). Link to other organisations' material rather than uploading it.
   - **Document:** upload the PDF and choose whether to **ask for an email address first** (on by default). With it off, anyone can download it straight away.
4. **Set the status.** **Draft** shows on previews only; **Published** shows on the live site once the change is published.
5. **Link it to its subject**: Resource topics → open the topic → under **Subjects**, choose the resource in **Opens this resource** next to the subject it fulfils (for example "Your first massage"). A published resource you don't link to a subject still appears, at the end of its topic's list.
6. **Update or remove.** Open a resource to change it, or upload a new PDF to replace the old one. **Delete** removes it; unlink it from its subject first (the checks say so if you forget). To add or reorder subjects, or add a topic, use **Resource topics** (a topic's order number sets where it appears; 1 comes first).

_Before you upload a document:_
- _**It becomes public.** Anyone can download a published document, and search engines can find one that doesn't ask for an email. Never upload anything about a client._
- _**TAB wrote it.** For anyone else's material, add a link instead of uploading a copy._
- _**Make it accessible.** In Word, Pages or Canva, export it as a PDF with "Tagged PDF", "Accessible PDF" or "Best for accessibility" turned on, give it a title, and use real headings. The checks can't read inside a PDF, so this one is on you._
- _**Keep it small.** Up to 10 MB each. A deleted PDF still stays in the website's history, so the library suits dozens of guides, not hundreds or videos._

_What gets counted:_ each link followed or document downloaded adds one to that resource's daily total, shown under **Resources opened** in TAB Practice → Website stats. As with the rest of the counts, there are no cookies and nothing identifies the visitor. _Who asked for an emailed guide_ arrives as an email to info@; it isn't stored on the website until My TAB goes live with stored submissions.

## Our Team | People, photos and credentials

Under **Pages → Our Team**, add a person with their name, role, short bio and the services they offer.

- **Credentials** show on the live site only once you tick **Credentials confirmed**. Until then they stay off the page, and the launch checklist lists them. Enter them exactly as held.
- **Photos**: upload a JPEG, PNG or WebP of up to 5 MB (square works best), only with the person's permission, and describe it in **Photo description** for people who can't see it.
- Untick **Draft** on the page when it's ready; the launch checklist lists it until then.

## Design lane | Step by step

<!-- design-flow -->

1. **Request it** in **TAB Practice → Website changes → New request → Design change**, or describe it to Claude in a session. Say what you want to achieve and why, which pages, and what's wrong today. Mark how soon and any deadline. Screenshots or examples can go in a session with Claude.
2. **Triage.** Claude reads it and replies in the request's notes with questions if anything is unclear, then options with trade-offs, effort and any risk (to accessibility, phones, brand rules or search). The status becomes **Questions or options**, then **Waiting on you**.
3. **Choose an approach.** You pick an option in a note or in a session. Nothing is built before this.
4. **Build.** The status becomes **In progress**. Claude builds it on its own branch, with tests, then adds the preview link to the request and sets it to **In review**.
5. **Review.** You check the preview on a phone and a computer. Ask for changes in a note, or say "approved".
6. **Release.** Claude merges it and sends the production build. You say "promote" and it goes live; the request becomes **Live**. Rolling back is one step.
7. **Hand-off.** New section types are added to the block library, so they become available in the content lane, and this guide is updated in the same release.

_Claude checks for new requests and new notes every morning. For anything sooner, start a session and say "pick up website request #12" (the number is on the request)._

## What you can and can't edit

| Area | Content lane (self-serve) | Design lane (request) | Locked |
|---|---|---|---|
| Page text: headlines, leads, paragraphs | Yes, within each field's length limit, on the service pages, the techniques guide, Home, The TAB Method, About, Our Story and Our Team | Start, FAQ and policy pages (still in code) | — |
| Home and The TAB Method | Every word, the search description, and the photo beside "Human performance for real life" | The order of sections, the hero photo, the closing photo | The stage names (Start Where You Are, Transform, Adapt, Balance, Evolve); the figures in "Real people" (founding year, years of experience, pillar count) come from the business settings |
| About and Our Story | Add, edit, remove and reorder sections and paragraphs; mark Our Story as a draft | How the page looks | — |
| Our Team | Add, edit and remove people; upload their photos; confirm credentials | How the page looks | Credentials show only once confirmed |
| Resources | Add, update and remove links and PDF documents; topics and their subjects, and which resource each subject opens; whether a document asks for an email address; draft or published | How the page looks; gated downloads that ask for more than a name and email | Documents are PDFs up to 10 MB; links are https or a page on this site |
| FAQs (service pages) | Add, edit, remove, reorder; mark an answer as a draft | — | — |
| Cards: focus areas, techniques | Add, edit, remove, reorder (up to 12 cards a section; techniques: up to 20) | A new kind of card | A technique's address (slug) |
| Photos | Choose from the photo library | Adding new photos to the library; hero image style, cropping | Library photos stay decorative (no people's names, no proof) |
| Sections on a service page | Add, remove and reorder sections from the block library; choose Bone or Linen for each | A new section type; how a section looks; other pages | One TAB Method band and one Questions section per page; the scope note always shows |
| Buttons | The label, and whether it books or goes to Start Where You Are | Any other destination (booking links come from Settings) | Every call to action uses the shared button component |
| Search title and description | Yes, within limits | — | Page titles always end with the full business name |
| Settings: booking links, banner, page switches, Start form open | The owner, in TAB Practice → Settings | — | — |
| New pages | — | Yes | — |
| Menus and footer links | — | Yes | — |
| Forms (Start Where You Are, contact) | — | Yes; questions are predefined options by design (no free text, D-059) | No health details by email (guardrail 5) |
| Legal pages: privacy, terms, policies | Wording, marked for legal review | Structure | Changes need the owner's sign-off, and an attorney's where the law applies |
| My TAB and TAB Practice | — | Yes | Client data rules (guardrail 4) |
| Logo, colours, fonts, business name | — | — | Locked: brand standards (D-061 to D-063) |
| Redirects from the old website, analytics, security | — | Yes | — |

## Rules every change must pass

These run automatically on every change, in either lane. A change that breaks one can't be published.

| Rule | What it checks | Source |
|---|---|---|
| Brand language | "TAB Human Performance Center" in full in titles and listings; no retired names, old philosophy or stage names; five pillars | Guardrail 1 |
| Scope of practice | No diagnosis or treatment claims ("treats", "cures", "detox"); massage and coaching support, they don't treat | Guardrail 8 |
| Honest content | No invented testimonials, credentials, prices or outcomes; temporary text is marked as draft | Guardrail 10 |
| Accessibility | WCAG 2.2 AA: descriptions on every photo, heading order, colour contrast, keyboard use | Guardrail 9 |
| Phones | Every page fits a 320px and a 390px screen with no sideways scrolling | NFR-001 |
| Links | Every link on the site works | Launch checks |
| Search | Each page has a unique title and a 40 to 160 character description | NFR-002, NFR-003 |
| Colours | Only the approved palette; white text only on Deep Olive, Clay Dark or Graphite | Guardrail 3 |
| Resources | Every entry has a topic that exists; links start with https:// or /; every document is a real PDF of at most 10 MB; a subject opens an existing resource of its own topic, and a resource sits under one subject | C35 |
| Branches | Saving on `main` is refused in the editor; anything that reaches `main` anyway is moved to a change request | Owner request 2026-10-08 |
| Team photos | A JPEG, PNG or WebP of at most 5 MB, with a description | Guardrail 9 |

## Writing guidelines

- **Plain and warm.** Short sentences, second person ("you"), everyday words. Explain a technical term the first time it appears.
- **Support, not treatment.** Say what something is "often chosen for" or "can support". Never "treats", "cures", "fixes" or "detoxes" (scope of practice).
- **Truthful.** Only credentials, prices and services TAB actually holds or offers. No testimonials until real, consented ones exist.
- **No health details by email.** Don't ask visitors to send health information through any form or email.
- **The name.** "TAB Human Performance Center" in full in titles and formal text; "TAB" alone is fine in conversation-style copy.
- **Photos.** Every photo needs a short description of what it shows, for people using screen readers. Decorative photos are marked as such.

## The block library | Sections you can build a service page from

Each service page has a fixed **hero** at the top and fixed **related services** and **closing call to action** at the bottom. In between, the page is a list of sections chosen from these blocks. A new kind of block is a design-lane request.

| Block | What it shows | Fields | Limits |
|---|---|---|---|
| **Text and photo** | A heading, a larger lead paragraph and up to six paragraphs, beside a library photo (How we help) | Background, heading, lead, paragraphs, photo | Heading 2–60 characters; paragraphs up to 700 each |
| **Card grid** | Small white cards in a grid of three, with an optional heading and introduction (focus areas) | Background, heading, introduction, cards (title and text) | 1–12 cards; title 2–60, text 10–260 characters |
| **Techniques index** | The massage techniques by group, each linked to the techniques guide | Background | Massage & Bodywork only |
| **TAB Method band** | Transform, Adapt and Balance for this service, and a quote, on Deep Olive | Transform, Adapt, Balance, quote | One per page; each 10–160 characters |
| **Numbered steps** | Numbered cards (What to expect), followed by the page's scope note | Background, heading, steps (title and text) | 1–6 steps |
| **Questions** | Questions that open to show their answers | Background, heading, questions (question, answer, draft) | One per page; 1–20 questions; answers up to 900 characters |

_Sections next to each other on the same background read as one band. Draft answers show on previews and the launch checklist, and are left out of the FAQ data search engines read. The **scope note** is a required field of every service page, not a block, so it can't be removed: it follows the numbered steps, or closes the sections if a page has none._

## Glossary | Key terms for page elements

<!-- anatomy -->

| Term | Meaning |
|---|---|
| **Page** | One address on the website, for example `/services/massage-bodywork`. |
| **Template** | The fixed structure a kind of page follows. All five service pages share one template. Templates change only through the design lane. |
| **Section** (or **band**) | A full-width horizontal strip of a page: the hero, How we help, the TAB Method band, the FAQ. |
| **Block** | A type of section an editor can add, remove or reorder on a service page: text and photo, card grid, techniques index, TAB Method band, numbered steps, questions. The list of blocks is the **block library** (see above). |
| **Band tone** | A section's background. Editors choose **Bone** (off-white) or **Linen** (warm beige). **Olive** (deep green, white text) is the TAB Method band and **Graphite** (charcoal, white text) the closing call to action; both are fixed. |
| **Banner** | The thin strip across the very top of every page ("TAB Massage & Fitness is becoming TAB Human Performance Center"). Switched on or off in Settings. |
| **Header** | The logo, menu and buttons at the top of every page. |
| **Breadcrumb** | The small "Services / Massage & Bodywork" trail under the header, showing where a page sits. |
| **Hero** | The first section of a page: eyebrow, headline, lead, buttons and usually a photo. |
| **Eyebrow** | The small uppercase label above a headline, for example "MASSAGE & BODYWORK". |
| **Headline** | The main heading of a page or section. Each page has exactly one top-level headline. |
| **Lead** | The larger introductory paragraph under a headline. |
| **Body text** | Ordinary paragraphs. |
| **Card** | A small white panel with a title and short text. A set of cards is a **card grid**. |
| **Focus area** | A card in a service page's How we help section, describing one kind of need the service supports. |
| **Technique card** | A card on the massage techniques page: what it is, what it feels like, often chosen for, good to know, and a **pressure scale** (very light to firm). |
| **At a glance** | The comparison summary of all techniques: a table on computers, a stacked list on phones. |
| **Call to action (CTA)** | A button that asks the visitor to act: **primary** (filled olive: Book, Start Where You Are), **secondary** or **outline** (a bordered, lighter choice). |
| **Scope note** | The short "Scope of care" box on service pages that says what the service is and isn't. |
| **FAQ** | A question that opens to show its answer. |
| **Footer** | The dark section at the bottom of every page: address, hours, links, legal pages. |
| **Draft flag** | A marker on temporary text. Visible on previews only; the launch checklist lists everything still in draft. |
| **Alt text** | The description of a photo read aloud by screen readers. Required. |
| **Search title / description** | What appears in Google results and link previews. |
| **Slug** | The last part of a page's address, for example `massage-bodywork`. Changing one needs a redirect, so slugs change only through the design lane. |
| **Preview** | A private copy of the website showing your change before it goes live. |
| **Checks** | The automated tests every change must pass (see "Rules every change must pass"). |
| **Publish / promote** | Making a checked change live. Promote is the final step that switches the live site to the new version. |
| **Rollback** | Switching the live site back to the previous version. |
| **Fast lane** | Owner-made content-only changes that pass every check go live without a separate approval round (D-070). |
| **Branch** | Your own working copy for one change. The content editor saves to a branch named `content/…`; each branch becomes one change request. |
| **Content editor (Keystatic)** | The editing screens at `/keystatic`, signed in with a Keystatic Cloud account (no GitHub account). Edits are saved as reviewable changes to the website's own files, so every edit has a history and can be undone. |
| **Change request (PR)** | A proposed change, with its preview and check results, waiting to be published. |
| **Website changes** | The page in TAB Practice where every request is filed and followed (`/practice/website`). |
| **Website request** | A numbered ask for a change (for example **#12**): either **Content help** (what a page says) or a **Design change** (how the site looks or works). |
| **Request status** | Where a request stands: New, Questions or options, Waiting on you, In progress, In review, Live or Declined (see "Asking for a change"). |
| **Notes** | The conversation on a request: Claude's questions, options and updates, and your answers. Kept as written. |
| **Website admin** | A TAB Practice account for the website only: requests, website stats and the content editor; never client records. |
| **Website stats** | Our own count of page views, Book clicks, Start forms and resources opened, in TAB Practice. No cookies and nothing that identifies a visitor. |
| **Resource** | An entry on the Resources page: a **link** to another website or a **document** (a PDF TAB wrote). |
| **Topic** | A group on the Resources page, such as "Massage and recovery", shown as a card listing its subjects. |
| **Subject** | A line in a topic's list, such as "Your first massage". Linked to a published resource it's clickable; otherwise it says "Coming soon". |
| **Email-first document** | A document that asks for a name and email address; the download link is emailed and works for 14 days. |
| **Fixed layout** | A page whose sections stay in a set order (Home, The TAB Method); editors change the words, not the arrangement. |

## Pages and where their content lives

| Page | Address | Content source | Lane |
|---|---|---|---|
| Home | `/` | `content/pages/home.json` (the editor); the layout, hero photo and figures in the page file and `config/site.ts` | Content |
| Services overview | `/services` | `content/services.ts` | Content |
| Service pages (five) | `/services/[slug]` | `content/services/<service>.json` (the editor), with the address and icon in `content/services.ts` | Content |
| Massage techniques | `/services/[slug]/techniques` | `content/massage-techniques.json` (the editor), with the address in `content/massage-techniques.ts` | Content |
| The TAB Method | `/tab-method` | `content/pages/tab-method.json` (the editor); stage names in `content/pages.ts` | Content |
| About | `/about` | `content/pages/about.json` (the editor) | Content |
| Our Story | `/about/our-story` | `content/pages/our-story.json` (the editor) | Content |
| Our Team | `/about/team` | `content/pages/team.json` (the editor), photos in `public/images/team/` | Content |
| Resources | `/resources` | `content/resources/*.json` and `content/resource-topics/*.json` (the editor), PDFs in `content/resource-files/` | Content |
| Events | `/events` | The page file itself; shown only when switched on in Settings | Design |
| FAQ | `/faq` | `content/pages.ts` (faqs) and each service's FAQs in `content/services.ts` | Content |
| Book | `/book` | `config/site.ts`, Settings | Settings |
| Start Where You Are | `/start` | `content/pages.ts` (start) for the text; `lib/inquiry.ts` for the questions | Text: content. Questions: design |
| Contact | `/contact` | `config/site.ts` (address, phone, hours); `lib/inquiry.ts` (form topics) | Settings and design |
| Client policies | `/policies` | `content/pages.ts` (legal) | Content (legal review) |
| Privacy policy | `/privacy` | `content/legal.ts` (privacyPolicy) | Content (legal review) |
| Terms of use | `/terms` | `content/legal.ts` (termsOfUse) | Content (legal review) |
| Accessibility | `/accessibility` | `content/pages.ts` (legal), `config/site.ts` | Content (legal review) |
| Launch checklist | `/launch-checklist` | Generated from draft flags (`lib/placeholders.ts`) | — |

_Start, the FAQ and the policy pages are still in code: ask with a Content help request. This table changes as pages move into the editor._

## Changing this guide

This guide is a living document. Claude updates it in the same release as any change to the block library, what is editable, the checks or the workflow, and republishes this page. To suggest a change, file a Content help request in TAB Practice → Website changes.

| Version | Date | Change | Reason |
|---|---|---|---|
| 1.6 | 2026-10-08 | Topics list their subjects and a subject opens its resource (a document downloads, an email-first one opens its form, a link opens its page); links can be pages on this site; saving on `main` is turned off, with a safety net that moves anything there into a change request | Owner requests 2026-10-08: "if the artifact is an uploaded document, download it; if it's a hyperlink… it takes them to that link"; "we need a better process to prevent this from being saved to main" |
| 1.5 | 2026-10-07 | Home, The TAB Method, About, Our Story and Our Team in the editor; the resource library (links, PDF documents, email-first downloads, counts); team photos and confirmed credentials; new rules, pages and terms | Owner request, 2026-10-07 (C35): all three in one change, email required for downloads, daily counts, documents stored with the site |
| 1.4 | 2026-10-07 | What happens when a save lands on `main` instead of a branch, and how it's caught before release; empty optional fields | The first editor save (on `main`) broke the build; owner declined GitHub Pro (A34) |
| 1.3 | 2026-10-07 | The content editor: branches, change requests, the block library, the fields and limits for service pages and the techniques guide | Release of C31 (proposed D-069, D-072) |
| 1.2 | 2026-10-07 | Request alerts go to both matthew@ and info@; the daily check for new requests and notes is on | Owner, 2026-10-07: "both"; daily check "yes" |
| 1.1 | 2026-10-07 | Requests move into TAB Practice → Website changes (statuses, notes, owner email); website admin accounts; content editor sign-in through Keystatic Cloud; the GitHub request forms are retired | Owner rulings 2026-10-07: "In app form and admin account", "Website only" (proposed D-071) |
| 1.0 | 2026-10-07 | First version: lanes, roles, step-by-step workflows, what is editable, rules, writing guidelines, glossary, page inventory | Owner request 2026-10-07; decisions D-069 (Keystatic) and D-070 (fast lane) |
