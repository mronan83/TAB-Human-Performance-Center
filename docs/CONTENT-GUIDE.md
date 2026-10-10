---
title: Website content guide
version: 2.1
updated: 2026-10-10
owner: Matthew Ronan
---

# Website content guide

<!-- How TAB Human Performance Center's website content is changed: who does what, step by step, what can and can't be
edited, and the names of every part of a page. Rendered by scripts/docs/render-content-guide.mjs; `npm run docs:check`
fails if a public page is missing from "Pages and where their content lives". Update this file in the same PR as any
change to what is editable, the block library, the request workflow or who may do what. -->

## At a glance | Two lanes, one set of checks

**New here? Start with "Edit the website" below:** it walks through a change from opening the editor to seeing it live. Every change to the website travels one of two lanes. Both end at the same automated checks and the same publish step, so nothing reaches the live site without passing the rules that keep it on-brand, accessible and safe.

| Lane | For | Who does it | How long |
|---|---|---|---|
| **Content lane** | Words, FAQs, cards, techniques, photos, resources, the order of sections built from approved blocks | You or a website admin, in the content editor (see "Edit the website"); or anyone on staff asks with a **Content help** request | About 10 minutes from your last save to live, for the owner's own changes |
| **Design lane** | New kinds of section, layout changes, new pages, menus, forms, anything that changes how the site looks or works | Anyone on staff asks for it with a **Design change** request; Claude designs and builds it; you approve | Small: same session. Larger: a few days |

<!-- lanes -->

_Status, 10 October 2026: the content editor (`/keystatic`, opened from TAB Practice → **Edit the website**) covers the **five service pages**, the **massage techniques guide**, **Home**, **The TAB Method**, **About**, **Our Story**, **Our Team** and the **resource library**. The **fast lane** is on: the owner's own content changes go live by themselves once the checks pass. Requests for anything else go to **TAB Practice → Website changes**. Until the public launch the whole site sits behind Vercel's login. The FAQ, Start and the policies move into the editor later; for those, file a **Content help** request._

## Edit the website | Step by step, from opening the editor to live

This is the whole journey for a change you make yourself in the content editor. You never need to touch GitHub: you **save**, then you **watch**. The owner's own changes go live by themselves about ten minutes after the last save.

### The five rules

1. **Start in TAB Practice → Edit the website.** It's the one way in, and it checks who you are before the editor opens.
2. **New branch first.** The editor opens on `main`, the live website, where saving is turned off. One change, one branch.
3. **Save, then hands off.** Don't merge, approve, close or update the change request in GitHub. Once the checks pass, the fast lane merges your change and puts it live. If you merge it by hand, the fast lane stands down, and nothing goes live until the next release is promoted.
4. **Watch for "Live".** The editor's **⋯** menu → **Pull request #…** opens your change request: the checks, a preview and, at the end, a comment saying **Live**.
5. **New change, new branch.** Once a change is live, its branch is deleted automatically: start a fresh one for the next change.

<!-- content-flow -->

### Before you start (once)

- **A TAB Practice account with two-step sign-in**, as the owner or a website admin. Practitioners don't have the editor; they ask for changes in **Website changes** instead.
- **A Keystatic account.** The owner invites each editor from Keystatic Cloud (project `tab-hpc/website`); up to three editors are free. You don't need a GitHub account to edit.
- **A computer** is the most comfortable place to edit. Uploading a PDF or dragging sections into order is fiddly on a phone.
- **Until the public launch**, the whole website sits behind Vercel's login. If Vercel asks you to sign in, do that first.

### 1. Open the editor

1. Sign in to **TAB Practice** (`/practice`): your email and password, then the 6-digit code from your authenticator app.
2. Choose **Edit the website** in TAB Practice's menu. On a phone it's under **More**, or the **Edit site** tab. It's also a button on the **Website changes** page.
3. The first time on a device, and whenever Keystatic's own session has run out, the editor shows **Log in with Keystatic Cloud**. Press it and sign in with your Keystatic account; you come straight back.
4. You land on the editor's **Dashboard**, on the branch `main`, with a dark green notice at the bottom: "You're looking at main, the live website".

_Went straight to `/keystatic` instead? It sends you to TAB Practice's sign-in first ("Sign in to open the content editor"), then brings you back to the editor._

<!-- editor-map -->

### 2. Start a branch

1. At the top of the editor's left-hand menu is the **branch box**, showing `main`, and beside it a **⋯** button. Press **⋯** and choose **New branch…**. (The Dashboard's **Current branch** panel has the same **New branch…** button.)
2. In **Branch name**, type a short name for this one change: lowercase words joined by hyphens, such as `lymphatic-guide` or `parking-faq`. The editor shows `content/` in front; you don't type that part.
3. If you start it from another branch rather than `main`, the dialog also asks what it's **Based on**. Choose **main** ("The default branch in your repository"), so your change starts from the live website.
4. Press **Create**. The branch box now shows your branch, for example `content/lymphatic-guide`, and the notice about `main` goes away.

_To come back to a branch you started earlier, open the branch box and choose it. It's there until its change goes live; then GitHub deletes it automatically, so the box lists only work in progress._

### 3. Find what you want to change

The left-hand menu lists everything the editor can change.

| Menu group | Entries | Page on the website |
|---|---|---|
| **Service pages** | Massage & Bodywork, Functional Strength, Women's Wellness, Integrated Nutrition, Holistic Life Coaching | `/services/…` |
| **Guides** | Massage techniques | `/services/massage-bodywork/techniques` |
| **Resources** | **Resources** (each link or PDF) and **Resource topics** (the topic cards and their subjects) | `/resources` |
| **Pages** | Home, The TAB Method, About, Our Story, Our Team | `/`, `/tab-method`, `/about`, `/about/our-story`, `/about/team` |

_Not in the menu (the FAQ page, Start Where You Are, the policies, menus and anything about layout)? File a request in TAB Practice → **Website changes** (see "Asking for a change")._

### 4. Make your change

- **Fields** marked with a red **\*** are required. Under each field the editor gives its limits (for example "3 to 90 characters."), and says so when you go past them.
- **Lists** (sections, cards, questions, subjects, people) have an **Add** button. Select an item to open and edit it, drag it by its handle (**⠿**) to move it, and use its bin icon to remove it.
- **Several pages, one change.** Edits that belong together, such as a new resource and the topic that lists it, go on the same branch. Anything unrelated gets its own branch.
- **Changed your mind?** **Reset**, the first of the small icons at the top right (a clock with an arrow), throws away this page's unsaved edits.
- While you have edits that aren't saved yet, the page shows **Unsaved**.

### 5. Save

1. Press the blue **Save** button at the top right. The **Unsaved** badge goes away, and the page shows **Changed** in the left-hand menu: it now differs from the live website.
2. **The first save opens a change request** on GitHub by itself, within about a minute. The **⋯** menu then offers **Pull request #…** (for example **Pull request #65**), which opens it in a new tab. If it still says **Create pull request**, reload the editor; don't create one yourself.
3. **Saving again** on the same branch updates the same change request and starts the checks again. Finish every edit for this change before you leave it alone: the fast lane acts on your latest save once its checks pass.

### 6. Watch the change request

<!-- timeline -->

The change request's page shows its description ("What happens next"), Vercel's comment with the **preview** link, the fast lane's comment when it acts, and at the foot the checks. You don't need to do anything there unless it says so.

| On the change request | What it means | What you do |
|---|---|---|
| A yellow dot: "Some checks haven't completed yet" | The checks are running (about 5 minutes) | Wait. The preview link usually appears first |
| Vercel's comment, with **Visit Preview** | A private copy of the website with your change | Look at your page on a phone and a computer (sign in to Vercel if asked) |
| A red ✗: "Some checks were not successful" | Your change breaks a rule; nothing was merged or published | Open **Details** next to the failed check, or ask Claude what failed. Fix it in the editor on the same branch and **Save** again |
| Fast lane: **Live.** Merged and promoted… | Your change is on the live website | Reload the page to see it. To undo it, see "Undo a change" |
| Fast lane: Merged. **Not live yet:** other changes on main are waiting for release… | Your change is merged, but a release from Claude is waiting for your "promote", and yours joins it | Ask Claude for the release, check it, and say "promote" |
| Fast lane: Merged. **Not live yet:** main moved while this was merging… | Something else reached `main` at the same moment | The same: it goes live with the next release you promote |
| Fast lane: This change needs the owner's approval as usual, with the reasons | It isn't the owner's own content change: an admin made it, it touches a file outside the content, or a merge commit is in it | The owner checks the preview and tells Claude "approve" with the number; Claude merges it and sends the release |
| **Merged**, with no fast-lane comment | Someone merged it by hand | Nothing is live yet: ask Claude to send the release, then say "promote" |

### 7. Check the live site

- Open the page on **www.tabhumanperformance.com** (for example `/resources`) and reload it. Until the public launch, Vercel asks you to sign in first.
- Still the old version? Reload once more, skipping the browser's copy (**Ctrl+Shift+R**, or **Cmd+Shift+R** on a Mac). If it's still not there, see "Troubleshooting".

### Undo a change

- **Quickest:** tell Claude "roll back". Claude promotes the build that was live before (the fast lane's **Live** comment names it), and the site switches back within a minute.
- **Or fix it forward:** start a new branch, correct it and save; the fix goes live the same way.
- _After a rollback, the live site no longer matches `main`, so the fast lane holds new changes ("Not live yet") until the next release you promote._

### What not to do

- **Don't press Merge, Approve, Close or Update branch** on a change request. Merging doesn't publish anything, and it stops the fast lane. **Update branch** adds a merge commit, which the fast lane won't accept.
- **Don't edit files on github.com.** Change content in the editor, where the limits and checks apply as you type.
- **Don't use ⋯ → Delete branch** on a change you still want: it throws the change away.
- **Never upload or type anything about a client.** Everything on the website is public.

## Worked examples | Common changes, click by click

Each example assumes you've opened the editor (step 1) and will watch the change request afterwards (steps 6 and 7).

### Change a sentence on a service page

1. **⋯ → New branch…**, name it `massage-wording`, press **Create**.
2. In the menu, **Service pages → Massage & Bodywork**.
3. Find the words. The hero's are at the top (**Hero headline**, **Hero description**). Words further down the page are inside **Sections**: select a section to open it.
4. Change them within the limits shown, and press **Save**.
5. **⋯ → Pull request #…**: wait for **Live**, then reload `/services/massage-bodywork`.

### Add a PDF guide to the Resources page

Example: "Lymphatic drainage basics", under the topic "Massage and recovery".

<!-- shot editor-resource "The Resources entry for Lymphatic drainage basics in the editor: Title, Slug, One-line summary, Topic, Related service, Kind with its PDF and the email choice, Status and Date added, with Save at the top right." -->

1. **⋯ → New branch…**, name it `lymphatic-guide`, press **Create**.
2. **Resources → Add** (top right of the list).
3. Fill in the form:
   - **Title:** `Lymphatic drainage basics`. If the topic already lists a subject for it ("Coming soon" on the page), use exactly the same words: the subject then opens your guide by itself.
   - **Slug:** filled in from the title. Leave it; it's the guide's address, and it stays the same if you rename the guide later.
   - **One-line summary:** what it is and who it's for, 10 to 220 characters. No diagnosis or treatment claims.
   - **Topic:** choose `massage-and-recovery` (topics are listed by their address).
   - **Related service:** Massage & Bodywork, or **None (general)**.
   - **Kind:** **Document TAB wrote (PDF upload)**. Then, under **PDF**, press **Choose file** and pick the PDF: up to 10 MB, exported as an accessible ("tagged") PDF. **Remove** clears it; **Download** shows you the file that's there.
   - **Ask for an email address first:** on (the default) means visitors give their name and email and the download link is emailed to them; off means anyone can download it straight away.
   - **Status:** **Published**. A **Draft** shows on previews only.
   - **Date added:** today, filled in for you.
4. Press **Save**. The PDF and the entry are saved together on your branch.
5. If the topic's subject is worded differently, link them: see the next example.
6. **⋯ → Pull request #…**: wait for **Live**, then open `/resources`. Under "Massage and recovery", the subject now opens your PDF (or, with email first, a short form).

### Make a "Coming soon" subject open a resource

<!-- shot editor-subject "A subject opened in the editor: its Subject wording and Opens this resource, where you choose the resource it opens." -->

1. On your branch, **Resource topics** → the topic, for example `massage-and-recovery`.
2. Under **Subjects**, each line says **→ linked** or **(not linked)**. Select the subject.
3. In **Opens this resource**, choose the resource (it must be filed under the same topic), then **Done**, then **Save**.
4. A subject left **(not linked)** still opens a published resource of its topic whose title is exactly the same, ignoring capitals. Otherwise it says "Coming soon".

_Also under Resource topics: **Add** a subject (3 to 90 characters, up to 12 per topic), drag subjects into order, or **Add** a whole topic (its name, an optional **Introduction** of up to 240 characters, and **Order on the page**, where 1 comes first)._

### Add a person to Our Team

1. **⋯ → New branch…**, name it `team-jane`, press **Create**.
2. **Pages → Our Team → People → Add.**
3. Fill in **Name**, **Role**, **Short bio** and **Services**. Type **Credentials and certifications** exactly as held, and tick **Credentials confirmed** only once you've checked them: until then they stay off the page.
4. **Photo:** a JPEG, PNG or WebP up to 5 MB, only with the person's permission, and a **Photo description** of what it shows.
5. Untick **Draft: not yet approved** when the page is ready to be public, then **Save**.

### Add, move or remove a section on a service page

1. On a branch, **Service pages** → the page → **Sections**.
2. **Add** offers the blocks: **Text and photo**, **Card grid**, **Techniques index** (Massage & Bodywork only), **TAB Method band**, **Numbered steps** and **Questions (FAQ)**. See "The block library" for what each shows.
3. Drag a section by its handle to move it; use its bin icon to remove it. Choose each section's **Background** (Bone or Linen) inside it.
4. **Save.** The checks keep one TAB Method band and one Questions section per page.

## Troubleshooting | When something doesn't look right

| What you see | Why | What to do |
|---|---|---|
| "Not saved: you're on main" at the bottom of the editor | Saving on `main`, the live website, is turned off | **⋯ → New branch…**, then **Save** again. Copy anything long you've typed first, in case the page reloads |
| A page or list in the editor won't open, or shows an error | Until 10 October 2026 the editor couldn't read a file it hadn't opened before on that device (the resource topics) | Fixed. If it happens again, reload the editor; if it persists, send Claude a screenshot |
| "Branch not found" in the editor | The change on that branch went live, and its branch was deleted automatically | Open the branch box, choose **main**, then **⋯ → New branch…** for your next change. Anything you hadn't saved there needs typing again |
| No **Edit the website** in TAB Practice | Only the owner and website admins have the editor | Practitioners ask in **Website changes** |
| The editor asks you to sign in again | TAB Practice signs staff out after 30 days, or on a new device; Keystatic's own session runs out on its own schedule | Sign in; you come back to the editor |
| No change request yet | It opens with the first save on a branch | Save, wait a minute, and reload the editor to see **Pull request #…** |
| A check failed | The change breaks a rule (see "Rules every change must pass"); the error names the file and the field | Fix it in the editor, on the same branch, and save again |
| The fast lane says it needs approval | It isn't the owner's own content change | The owner checks the preview and tells Claude "approve" with the number |
| "Not live yet" | Other changes are waiting for release | Ask Claude for the release and say "promote" |
| You merged a change request yourself | A merge adds it to `main` but publishes nothing, and the fast lane no longer sees it | Ask Claude to send the release, then say "promote" |
| The change is live, but the page looks the same | The browser kept its copy | **Ctrl+Shift+R** (**Cmd+Shift+R** on a Mac) |
| A guide listed twice under its topic, as "Coming soon" and as the PDF | Before 10 October 2026, a subject had to be linked by hand | Fixed: a subject opens the topic's resource with the same title. If the wording differs, link them (see "Make a 'Coming soon' subject open a resource") |
| A failed "Content change request" run on GitHub right after creating a branch | Before 10 October 2026, the change request tried to open before anything was saved | Fixed: it now waits for the first save |
| Vercel asks you to log in | The whole website is private until the public launch | Sign in to Vercel |

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

## Roles

| Role | Can | Can't |
|---|---|---|
| **Owner** | Edit content; file and follow requests; change a request's status; choose between options; approve design changes; publish; roll back; invite and remove website admins (TAB Practice → Settings) | Bypass the automated checks |
| **Website admin** | Sign in to TAB Practice (password and 6-digit code); file and follow requests and add notes; see the website stats; edit content in the content editor (reachable once the site is past Vercel login, or as a Vercel team member) | See client records, Settings or Team; change a request's status; approve design changes or releases |
| **Practitioner** | File and follow requests and add notes, alongside their client work | Change a request's status; approve design changes or releases |
| **Claude** | Read requests; reply in their notes with questions, options, effort and risks; keep each status current; build design-lane changes; maintain the block library, the checks and this guide; publish approved releases | Build a design change before the owner chooses an option, or publish one without the owner's approval |
| **Automated checks** | Block any change that breaks a rule (see "Rules every change must pass") | Be skipped |

## Website admins | Accounts for the website only

A **website admin** is a TAB Practice account for someone who helps with the website but doesn't work with clients.

1. **The owner invites them** in **TAB Practice → Settings → Website admins**: their name and a work email (not an address on a client record).
2. **They get an email** with a single-use link, valid for 24 hours.
3. **They set up two-step sign-in:** the link signs them in once, then they add an authenticator app for the 6-digit code.
4. **They choose a password** under **Sign-in & security**. From then on they sign in with email, password and code, like all staff.
5. **What they see:** Website changes, Website stats and Sign-in & security; and the content editor once it arrives. Never client records, Settings or Team.
6. **Removing one:** the owner presses **Remove** next to their name in Settings. Access ends straight away; they can be invited again later.

_The content editor is free for up to three editors (you and two admins). A fourth editor needs its paid plan; anyone can still file requests._

## Resources | Links and documents

The Resources page is a library you build in the editor, under **Resources**. Each **topic** (for example "Massage and recovery") is a card listing its **subjects**. A subject linked to a published **resource**, or with exactly the same title as one in its topic, is clickable; the rest say "Coming soon". A resource is either a **link** (another website, or a page on this site) or a **document** (a PDF TAB wrote, uploaded in the editor).

What a visitor gets when they click a subject:

| The resource is | Clicking the subject |
|---|---|
| A document | Downloads and opens the PDF |
| A document that asks for an email address first | Opens a short name-and-email form under the subject; the download link is emailed to them, and TAB gets an email saying who asked |
| A link | Opens that page, on this site or another |

**How to add, link, update or remove one:** see "Worked examples" (Add a PDF guide to the Resources page; Make a "Coming soon" subject open a resource). To replace a PDF, open the resource and upload the new file under **PDF**. To remove one, open it and use the bin icon at the top right (**Delete entry**); unlink it from its subject first, or the checks say so.

_Before you upload a document:_
- _**It becomes public.** Anyone can download a published document, and search engines can find one that doesn't ask for an email. Never upload anything about a client._
- _**TAB wrote it.** For anyone else's material, add a link instead of uploading a copy._
- _**Make it accessible.** In Word, Pages or Canva, export it as a PDF with "Tagged PDF", "Accessible PDF" or "Best for accessibility" turned on, give it a title, and use real headings. The checks can't read inside a PDF, so this one is on you._
- _**Keep it small.** Up to 10 MB each. A deleted PDF still stays in the website's history, so the library suits dozens of guides, not hundreds or videos._

_What gets counted:_ each link followed or document downloaded adds one to that resource's daily total, shown under **Resources opened** in TAB Practice → Website stats. As with the rest of the counts, there are no cookies and nothing identifies the visitor. _Who asked for an emailed guide_ arrives as an email to info@; it isn't stored on the website until My TAB goes live with stored submissions.

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
| **Fast lane** | The owner's own content-only changes, made in the content editor, go live automatically once every check passes, without a separate approval round (D-070). Anyone else's change, or any change to code or rules, keeps the approvals. |
| **Branch** | Your own working copy for one change. The content editor saves to a branch named `content/…`; each branch becomes one change request. |
| **Content editor (Keystatic)** | The editing screens at `/keystatic`, opened from TAB Practice → Edit the website by the owner and website admins, and signed in with a Keystatic Cloud account (no GitHub account). Edits are saved as reviewable changes to the website's own files, so every edit has a history and can be undone. |
| **Change request (PR)** | A proposed change, with its preview and check results, waiting to be published. |
| **main** | The branch the live website is built from. The editor opens on it, and saving there is turned off: start a branch first. |
| **Merge** | Adding a change request's change to `main`. A merge alone doesn't publish anything: a change goes live when its build is promoted (the fast lane does both for the owner's own changes). |
| **Production build** | The version of the whole website Vercel builds from `main` after each merge. It goes live only when promoted. |
| **Website changes** | The page in TAB Practice where every request is filed and followed (`/practice/website`). |
| **Website request** | A numbered ask for a change (for example **#12**): either **Content help** (what a page says) or a **Design change** (how the site looks or works). |
| **Request status** | Where a request stands: New, Questions or options, Waiting on you, In progress, In review, Live or Declined (see "Asking for a change"). |
| **Notes** | The conversation on a request: Claude's questions, options and updates, and your answers. Kept as written. |
| **Website admin** | A TAB Practice account for the website only: requests, website stats and the content editor; never client records. |
| **Website stats** | Our own count of page views, Book clicks, Start forms and resources opened, in TAB Practice. No cookies and nothing that identifies a visitor. |
| **Resource** | An entry on the Resources page: a **link** to another website or a **document** (a PDF TAB wrote). |
| **Topic** | A group on the Resources page, such as "Massage and recovery", shown as a card listing its subjects. |
| **Subject** | A line in a topic's list, such as "Your first massage". Linked to a published resource, or with exactly the same title as a published resource of its topic, it's clickable; otherwise it says "Coming soon". |
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
| 2.1 | 2026-10-10 | Branches are deleted automatically once their change is merged: the rules, coming back to a branch, and "Branch not found" in troubleshooting | Owner turned on GitHub's automatic branch deletion, 2026-10-10 |
| 2.0 | 2026-10-10 | Rebuilt around doing: "Edit the website" step by step with exact button names, a map of the editor and a timeline from save to live; worked examples (a sentence, a PDF guide, a subject, a team member, a section); troubleshooting; the fast lane is on; a subject opens the resource of its topic with the same title | Owner request 2026-10-10: "a user guide and workflow instructions on how to make edits to the website… where to start, what to do, and how to do it", after a merged change didn't go live and the topics wouldn't open |
| 1.8 | 2026-10-10 | The editor opens from TAB Practice → Edit the website, for the owner and website admins; going straight to `/keystatic` signs you in first | Owner ruling 2026-10-10, proposed D-077 (C38) |
| 1.7 | 2026-10-10 | The fast lane: what qualifies, what you see on the change request, what happens when other changes are waiting, rolling back; status line brought up to date | Fast lane built (C32, proposed D-070) |
| 1.6 | 2026-10-08 | Topics list their subjects and a subject opens its resource (a document downloads, an email-first one opens its form, a link opens its page); links can be pages on this site; saving on `main` is turned off, with a safety net that moves anything there into a change request | Owner requests 2026-10-08: "if the artifact is an uploaded document, download it; if it's a hyperlink… it takes them to that link"; "we need a better process to prevent this from being saved to main" |
| 1.5 | 2026-10-07 | Home, The TAB Method, About, Our Story and Our Team in the editor; the resource library (links, PDF documents, email-first downloads, counts); team photos and confirmed credentials; new rules, pages and terms | Owner request, 2026-10-07 (C35): all three in one change, email required for downloads, daily counts, documents stored with the site |
| 1.4 | 2026-10-07 | What happens when a save lands on `main` instead of a branch, and how it's caught before release; empty optional fields | The first editor save (on `main`) broke the build; owner declined GitHub Pro (A34) |
| 1.3 | 2026-10-07 | The content editor: branches, change requests, the block library, the fields and limits for service pages and the techniques guide | Release of C31 (proposed D-069, D-072) |
| 1.2 | 2026-10-07 | Request alerts go to both matthew@ and info@; the daily check for new requests and notes is on | Owner, 2026-10-07: "both"; daily check "yes" |
| 1.1 | 2026-10-07 | Requests move into TAB Practice → Website changes (statuses, notes, owner email); website admin accounts; content editor sign-in through Keystatic Cloud; the GitHub request forms are retired | Owner rulings 2026-10-07: "In app form and admin account", "Website only" (proposed D-071) |
| 1.0 | 2026-10-07 | First version: lanes, roles, step-by-step workflows, what is editable, rules, writing guidelines, glossary, page inventory | Owner request 2026-10-07; decisions D-069 (Keystatic) and D-070 (fast lane) |
