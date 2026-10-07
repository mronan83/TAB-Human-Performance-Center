---
title: Website content guide
version: 1.0
updated: 2026-10-07
owner: Matthew Ronan
---

# Website content guide

<!-- How TAB Human Performance Center's website content is changed: who does what, step by step, what can and can't be
edited, and the names of every part of a page. Rendered by scripts/docs/render-content-guide.mjs; `npm run docs:check`
fails if a public page is missing from "Pages and where their content lives". Update this file in the same PR as any
change to what is editable, the block library or the workflow. -->

## At a glance | Two lanes, one set of checks

Every change to the website travels one of two lanes. Both end at the same automated checks and the same publish step, so nothing reaches the live site without passing the rules that keep it on-brand, accessible and safe.

| Lane | For | Who does it | How long |
|---|---|---|---|
| **Content lane** | Words, FAQs, cards, techniques, photos, the order of sections built from approved blocks | You or another admin, in the content editor | About 10 minutes from saving to live |
| **Design lane** | New kinds of section, layout changes, new pages, menus, forms, anything that changes how the site looks or works | You request it; Claude designs and builds it; you approve | Small: same session. Larger: a few days |

<!-- lanes -->

_Status, 7 October 2026: the request forms and this guide are live. The content editor (Keystatic) arrives with the next release, starting with the service pages; until then, use the content request form for content changes too. The automatic "fast lane" publish follows in the release after that._

## Roles

| Role | Can | Can't |
|---|---|---|
| **Owner** | Edit content; approve design changes; publish; roll back; add or remove admins | Bypass the automated checks |
| **Admin** | Edit content in the content editor; submit content and design requests | Approve design changes or production releases |
| **Claude** | Build design-lane changes; maintain the block library, the checks and this guide; publish approved releases | Publish a design change without the owner's approval |
| **Automated checks** | Block any change that breaks a rule (see "Rules every change must pass") | Be skipped |

## Which lane is my change in?

| I want to… | Lane |
|---|---|
| Fix a typo, reword a paragraph, update a headline | Content |
| Add, remove or reorder FAQs | Content |
| Add, remove, edit or reorder cards (focus areas, techniques) | Content |
| Swap a photo for another from the library, or upload a new one | Content |
| Move a section up or down, hide one, or add another section of an existing type | Content |
| Change a section's background between the approved tones | Content |
| Change a page's search title or description | Content |
| Change booking links, the banner, page switches or whether Start takes submissions | Content, in **TAB Practice → Settings** (already live) |
| Add a kind of section the site doesn't have yet (a timeline, a pricing table, a video) | Design |
| Change how a section looks or behaves (spacing, columns, mobile layout, colours) | Design |
| Add a new page or change the menus | Design |
| Change a form (Start Where You Are, contact) or anything in My TAB or TAB Practice | Design |
| Change the logo, brand colours, fonts or the business name | Locked (brand standards) |

_Not sure? Use the design request form. Claude will move it to the content lane if it fits there._

## Content lane | Step by step

<!-- content-flow -->

1. **Open the content editor** at `/keystatic` on the website and sign in with GitHub. The first time, the owner adds you as an editor.
2. **Choose what to edit**: a page, a service, a technique or an FAQ. Everything appears as labelled fields and blocks (see the glossary).
3. **Make your change.** Fields show their limits as you type (for example, a search description must be 40 to 160 characters). Required fields such as photo descriptions can't be left empty.
4. **Save.** Your change is kept as a draft and doesn't touch the live site. You can come back to it later.
5. **Preview.** The editor gives a preview link. Check the page on your phone and on a computer.
6. **Submit for publishing.** The automated checks run (about 5 minutes).
   - **All checks pass:** an owner-made content change goes live automatically (the fast lane). An admin's change waits for the owner's approval.
   - **A check fails:** you get a plain message saying which rule and where (for example, "Use 'TAB Human Performance Center' in full"). Fix it and submit again.
7. **Live.** The change appears on the website. If something looks wrong, the owner can roll back to the previous version in one step.

## Design lane | Step by step

<!-- design-flow -->

1. **Submit a request** with the **Design change** form (link in TAB Practice → Settings → Website changes), or describe it to Claude in a session. Say what you want to achieve and why, which pages, what's wrong today, and any examples or screenshots. Mark the priority and any deadline.
2. **Triage.** Claude reads it and replies with questions if anything is unclear, then options with trade-offs, effort and any risk (to accessibility, phones, brand rules or search).
3. **Choose an approach.** You pick an option. Nothing is built before this.
4. **Build.** Claude builds it on its own branch, with tests, and sends a preview link plus screenshots on a phone and a computer.
5. **Review.** You check the preview. Ask for changes, or say "approved".
6. **Release.** Claude merges it and sends the production build. You say "promote" and it goes live. Rolling back is one step.
7. **Hand-off.** New section types are added to the block library, so they become available in the content lane, and this guide is updated in the same release.

_Telling Claude a request is waiting: start a session and say "pick up request #12" (the number is on the request). A daily check for new requests can be switched on if you want one._

## What you can and can't edit

| Area | Content lane (self-serve) | Design lane (request) | Locked |
|---|---|---|---|
| Page text: headlines, leads, paragraphs | Yes, within each field's length limit | — | — |
| FAQs | Add, edit, remove, reorder | — | — |
| Cards: focus areas, techniques | Add, edit, remove, reorder | A new kind of card | — |
| Photos | Choose from the library or upload, with a description (alt text) | Hero image style, cropping rules | — |
| Sections on a page | Reorder, hide, add another of an existing type, choose an approved background tone | A new section type; how a section looks | — |
| Buttons | The label | Where a button goes (booking and Start links come from Settings) | Every call to action uses the shared button component |
| Search title and description | Yes, within limits | — | Page titles always end with the full business name |
| Settings: booking links, banner, page switches, Start form open | Yes, in TAB Practice → Settings | — | — |
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

## Writing guidelines

- **Plain and warm.** Short sentences, second person ("you"), everyday words. Explain a technical term the first time it appears.
- **Support, not treatment.** Say what something is "often chosen for" or "can support". Never "treats", "cures", "fixes" or "detoxes" (scope of practice).
- **Truthful.** Only credentials, prices and services TAB actually holds or offers. No testimonials until real, consented ones exist.
- **No health details by email.** Don't ask visitors to send health information through any form or email.
- **The name.** "TAB Human Performance Center" in full in titles and formal text; "TAB" alone is fine in conversation-style copy.
- **Photos.** Every photo needs a short description of what it shows, for people using screen readers. Decorative photos are marked as such.

## Glossary | Key terms for page elements

<!-- anatomy -->

| Term | Meaning |
|---|---|
| **Page** | One address on the website, for example `/services/massage-bodywork`. |
| **Template** | The fixed structure a kind of page follows. All five service pages share one template. Templates change only through the design lane. |
| **Section** (or **band**) | A full-width horizontal strip of a page: the hero, How we help, the TAB Method band, the FAQ. |
| **Block** | A type of section admins can add, remove or reorder in the content lane: hero, text, card grid, image and text, FAQ, call-to-action band and so on. The list of blocks is the **block library**. |
| **Band tone** | A section's background, chosen from the approved tones: **Bone** (off-white page background), **Linen** (warm beige), **Olive** (deep green, white text) and **Graphite** (charcoal, white text). |
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
| **Content editor (Keystatic)** | The editing screens at `/keystatic`. Edits are saved as reviewable changes to the website's own files, so every edit has a history and can be undone. |
| **Change request (PR)** | A proposed change, with its preview and check results, waiting to be published. |
| **Request form** | The two forms for asking for help: **Content help** and **Design change** (TAB Practice → Settings → Website changes). |

## Pages and where their content lives

| Page | Address | Content source | Lane |
|---|---|---|---|
| Home | `/` | `content/pages.ts` (home) | Content |
| Services overview | `/services` | `content/services.ts` | Content |
| Service pages (five) | `/services/[slug]` | `content/services.ts` | Content |
| Massage techniques | `/services/[slug]/techniques` | `content/massage-techniques.ts` | Content |
| The TAB Method | `/tab-method` | `content/pages.ts` (method) | Content |
| About | `/about` | `content/pages.ts` (about) | Content |
| Our Story | `/about/our-story` | `content/pages.ts` (about.story) | Content |
| Our Team | `/about/team` | `content/pages.ts` (about.team) | Content |
| Resources | `/resources` | `content/pages.ts` (resourceClusters) | Content |
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

_Content sources move into the content editor's format with the Keystatic release; this table changes with them._

## Changing this guide

This guide is a living document. Claude updates it in the same release as any change to the block library, what is editable, the checks or the workflow, and republishes this page. To suggest a change, use either request form.

| Version | Date | Change | Reason |
|---|---|---|---|
| 1.0 | 2026-10-07 | First version: lanes, roles, step-by-step workflows, what is editable, rules, writing guidelines, glossary, page inventory | Owner request 2026-10-07; decisions D-069 (Keystatic) and D-070 (fast lane) |
