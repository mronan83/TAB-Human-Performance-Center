# tabmassage.com — Legacy Inventory & Draft Redirect Map

Phase 0 artifact for NFR-004 / NFR-008. Collected 2026-09-28 from public sources only (WordPress
REST API, public DNS, RDAP). **Draft**: destinations marked *Decision* need the owner's input.

## Platform facts

| Item | Finding | Why it matters |
|---|---|---|
| Registrar | GoDaddy — registered 2009-02-07, expires **2027-02-07** | Keep renewed indefinitely (S19 §19.3). Consider auto-renew. |
| DNS host | Nameservers `NS1–4.SUPERCP.COM` (the web host's DNS, not GoDaddy) | Cutover edits happen at the host's DNS panel; need login (GAP-019). |
| Web server | `70.32.23.62`, LiteSpeed, PHP 7.4.33 | PHP 7.4 has been end-of-life since Nov 2022 (RSK-008). |
| CMS | WordPress 5.2.21 (2019), Visual Composer, Slider Revolution 5.4.1, LayerSlider 6.1.6 | Outdated stack stays live until cutover (RSK-008). |
| Email | Google Workspace (`aspmx.l.google.com` MX set) | MX records must survive the DNS change (RSK-009). New domain can be added to the same Workspace. |
| Verification | `google-site-verification` TXT record present | Preserve it, or Search Console loses domain verification at cutover. |
| Sitemaps | `/sitemap_index.xml` and `/sitemap.xml` respond 200 | Re-crawl immediately before launch for the final map. |
| New domain | `tabwellnesscollective.com` and `.net` **not registered** as of 2026-09-28 (`.co` not checked) | S17 §17.7 says secure immediately (RSK-007). |

## Draft redirect map — pages (36)

Legend: **Proposed** = closest equivalent is clear · **Decision** = depends on whether the offering or content survives the rebrand.

| Legacy path | Last edited | Proposed destination | Status |
|---|---|---|---|
| `/` | 2015-01-15 | `/` | Proposed |
| `/about-us/` | 2015-01-26 | `/about/our-story` (history content) | Proposed |
| `/contact-us/` | 2015-01-26 | `/contact` | Proposed |
| `/massage_therapy/` | 2015-01-26 | `/services/massage-bodywork` | Proposed |
| `/personal_training/` | 2015-01-26 | `/services/personal-strength-training` | Proposed |
| `/appointments/` | 2015-08-04 | `/book` | Proposed |
| `/appointments/reviews/` | 2019-07-28 | `/about` (testimonials) | Proposed |
| `/appointments/customer-reviews/` | 2015-12-16 | `/about` (testimonials) | Proposed |
| `/our-team-2/` | 2018-06-09 | `/about/team` | Proposed |
| `/faq/` | 2015-08-04 | `/faq` | Proposed |
| `/massage-therapy-faq/` | 2015-08-12 | `/faq` | Proposed |
| `/prenatal-massage-therapy/` | 2015-08-12 | `/services/massage-bodywork` | Proposed |
| `/introduction-to-massage/` | 2015-08-12 | `/services/massage-bodywork` | Proposed |
| `/massage-benefits/` | 2015-08-12 | `/services/massage-bodywork` | Proposed |
| `/stretching/` | 2015-08-13 | `/services/personal-strength-training` | Proposed |
| `/blog/` | 2015-07-28 | `/resources/articles` | Proposed |
| `/newsletter-archives/` | 2015-08-04 | `/resources` | Proposed |
| `/classes-events/` | 2015-08-04 | `/events` | Proposed |
| `/my-calendar/` | 2015-08-24 | `/events` | Proposed |
| `/privacy-policy/` | 2015-08-04 | `/privacy` *(new URL not yet defined in S16)* | Proposed |
| `/terms-and-conditions/` | 2015-08-04 | `/terms` *(new URL not yet defined in S16)* | Proposed |
| `/cancellation-policy/` | 2015-08-04 | `/policies/cancellation` *(new URL not yet defined in S16)* | Proposed |
| `/sitemap/` | 2015-08-04 | `/` | Proposed |
| `/test/` | 2019-07-27 | `/` | Proposed |
| `/purchase-gift-cards/` | 2015-08-12 | Gift-card destination, if gift cards continue (GAP-020) | Decision |
| `/chair-massage/` | 2015-08-12 | `/services/massage-bodywork` if chair/corporate massage continues | Decision |
| `/massage-therapy-effects-on-adhd/` | 2015-08-13 | `/services/massage-bodywork` (do **not** migrate the claim; see note) | Decision |
| `/sports-injury-rehab/` | 2015-12-11 | Massage or Strength page; "rehab" wording is a scope risk under S15 | Decision |
| `/nutrition/` | 2015-12-08 | Women's Wellness or Holistic Coaching, if nutrition support continues | Decision |
| `/tab-lifequest/` | 2015-12-08 | `/services/personal-strength-training` if LifeQuest continues | Decision |
| `/small-group-training-lifequest/` | 2015-12-08 | `/services/personal-strength-training` | Decision |
| `/yoga-room-tab/` | 2016-09-27 | Depends on whether yoga continues | Decision |
| `/yoga-faq/` | 2016-09-27 | Depends on whether yoga continues | Decision |
| `/yoga-benefits/` | 2015-08-12 | Depends on whether yoga continues | Decision |
| `/hiring-join-our-team/` | 2016-01-11 | `/about/team` or a careers page | Decision |
| `/employee-login/` | 2015-08-04 | What does this link to today? | Decision |

## Draft redirect map — posts (28)

Default: **migrate only evergreen posts that pass the S15 guardrails**; redirect the rest to the
closest hub. Several legacy titles conflict with S15 (medical claims, urgency, guilt framing), so
blind migration would import off-brand and scope-risky copy.

| Legacy path | Date | Proposed handling |
|---|---|---|
| `/why-you-cant-afford-not-to-get-a-massage/` | 2019-02-06 | → `/services/massage-bodywork` (urgency framing conflicts with S15 §15.7) |
| `/skin-and-sun-safety/` | 2018-07-23 | → `/resources/articles` |
| `/common-health-problems-massage-therapy-can-help/` | 2018-04-12 | → `/services/massage-bodywork` (treatment-claim risk, S15 §15.8) |
| `/massage-cupping/` | 2018-02-20 | Decision: is cupping offered? Else → `/services/massage-bodywork` |
| `/working-out-in-moderation/` | 2017-10-24 | Candidate to migrate (strength / sustainable change) |
| `/diet-will-help-restore-stomach-acids-back-health-includes/` | 2017-10-18 | → `/resources/articles` (out-of-scope health claim) |
| `/can-destress-employees-work-office-massages/` | 2017-10-13 | Decision: tied to chair/corporate massage |
| `/7-strange-things-stress-can-do-to-your-body/` | 2017-08-29 | → `/resources/articles` |
| `/massage-for-a-sore-jaw-tmj/` | 2017-08-24 | Candidate to migrate after scope review |
| `/pregnancy-fitness/` | 2016-09-12 | Candidate to migrate after review (avoid "bounce back", S15) |
| `/cancel-massage-im-sick/` | 2016-08-31 | Candidate to migrate (practical; fits "Prepare" purpose) |
| `/often-get-massage/` | 2016-08-16 | Candidate to migrate ("how often" is a real client question) |
| `/body-image-risk-reward-massage/` | 2016-07-01 | → `/resources/articles` |
| `/celebrate-sleep-awareness-month/` | 2016-03-21 | → `/resources/articles` (dated) |
| `/win-a-free-month-tricias-fit-kitchen-menu/` | 2016-03-02 | → `/resources/articles` (expired promotion) |
| `/tricias-fit-kitchen-powered-by-simpled/` + `-2/`, `-3/` | 2016 | → `/resources/articles` (discontinued partnership?) |
| `/tricias-fit-kitchen/` | 2016-01-20 | → `/resources/articles` |
| `/414-2/`, `/402-2/` | 2016-02 | → `/resources/articles` (untitled posts) |
| `/the-importance-of-water/` | 2016-02-05 | → `/resources/articles` |
| `/3-easy-random-acts-kindness/` | 2016-02-03 | → `/resources/articles` |
| `/remote-personal-training/` | 2016-01-26 | Decision: is remote/virtual training offered? |
| `/how-to-meal-prep-and-plan-ahead/` | 2016-01-08 | → `/resources/articles` |
| `/21-days-for-21/` | 2016-01-08 | → `/resources/articles` (dated challenge) |
| `/5-ways-to-celebrate-national-womens-health-and-fitness-day/` | 2016-01-05 | → `/services/womens-wellness-coaching` |
| `/tab-fit-quest-kids-and-teens/` | 2015-01-15 | Decision: are youth programs offered? |

## Not yet inventoried

Category/tag archives, author pages, media attachment URLs, paginated archives, and any URLs that
only appear in backlinks or Search Console. Pull these from Search Console and a full crawl before
launch (S19 §19.3). Requires Search Console access (GAP-005).
