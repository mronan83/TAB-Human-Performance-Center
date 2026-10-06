# Switch-over runbook (C1)

How TAB Human Performance Center moves onto its own domain without losing email, search history or the legacy
tabmassage.com links (RSK-009, register §7.4). Domain decisions: proposed D-066. Every production step here is a G3
step: the owner approves it in the session first.

## Domains (registered 2026-10-06, Vercel, team `team_A8TfHlLyTc2toipq0WsMVKvK`)

| Domain | Role | Email |
| --- | --- | --- |
| `www.tabhumanperformance.com` | Canonical site (`NEXT_PUBLIC_SITE_URL`) | Google Workspace (secondary domain); website mail via Resend |
| `tabhumanperformance.com` | 308 → `www` | (same zone) |
| `tabhumanperformancecenter.com`, `tabhpc.com`, `tabhp.com` | 308 → `www` (defensive; never used in copy) | None: null MX, SPF `-all`, DMARC `reject` |
| `tabmassage.com`, `www.tabmassage.com` (GoDaddy) | Legacy; per-URL 308s from `middleware.ts` and `config/redirects.ts` | Google Workspace, **unchanged** (MX and TXT stay at GoDaddy) |

## Email (done 2026-10-06)

`tabhumanperformance.com` DNS at Vercel: Google verification TXT and CNAME, MX `1 smtp.google.com`, SPF
`v=spf1 include:_spf.google.com ~all`, DKIM at `google._domainkey` (2048-bit), DMARC `p=none` (monitoring).

1. Owner: verify the domain in Google Workspace, then **Start authentication** (DKIM). Done 2026-10-06 (verify).
2. Owner: rename each user to `@tabhumanperformance.com`; the `@tabmassage.com` address stays as an alias, so mail to
   it keeps arriving. Add `info@tabhumanperformance.com` (alias or group) for the website forms.
3. Claude, one week after DKIM shows "authenticating" and mail flows: DMARC `p=quarantine`, then `p=reject`.
4. Owner: keep `tabmassage.com` in Google Workspace with its GoDaddy MX untouched; removing it ends the aliases.

### Legacy `@tabmassage.com` mail (A29)

Mail for `tabmassage.com` is delivered by Google Workspace (its MX records point at Google), so it keeps working through
the switch-over and after.

1. Owner: after renaming a user, check **Users → (user) → Alternate email addresses** lists the old `@tabmassage.com`
   address. Mail sent to it lands in the same mailbox.
2. Owner, for old addresses that aren't users (for example a former info@ or bookings@): **Apps → Google Workspace →
   Gmail → Default routing → Configure**. Under **Specified envelope recipients**, choose **Pattern match** with
   `^.*@tabmassage\.com$`; under **Envelope recipient**, choose **Change envelope recipient** and **Replace recipient**
   with `info@tabhumanperformance.com`; under **Options**, tick **Perform this action on non-recognized addresses** only.
   That catches any old address without affecting renamed users.
3. Owner at GoDaddy (Claude on the call): `tabmassage.com` has no SPF or DMARC record today, so anyone can send mail
   that claims to be from it and real mail is more likely to be filtered. Add:

   | Type | Name | Value |
   | --- | --- | --- |
   | TXT | `@` | `v=spf1 include:_spf.google.com ~all` |
   | TXT | `google._domainkey` | the key from **Gmail → Authenticate email**, with `tabmassage.com` selected |
   | TXT | `_dmarc` | `v=DMARC1; p=none; adkim=r; aspf=r` (tightened with C24, a week after DKIM authenticates) |

   Then click **Start authentication** for `tabmassage.com` in the Workspace admin console.

## Phase A: private attach (no visitor sees anything)

1. Merge the PR that turns `portalDemoOnProduction` off and moves `config/site.ts` to the new domain; promote it (G3).
   Check `/my-tab` on production shows the interim page, not the demo.
2. Set `NEXT_PUBLIC_SITE_URL=https://www.tabhumanperformance.com` for Production in Vercel; the next production build
   uses it (canonical URLs, sitemap, auth links).
3. Attach `www.tabhumanperformance.com` to the project as the production domain; attach the apex and the three
   defensive domains as 308 redirects to it. Vercel login (SSO, "all") still covers them, so they stay private.
4. Resend (A2): the owner creates the account and adds `tabhumanperformance.com`; Claude publishes the records Resend
   lists (its own `send` subdomain MX and SPF and a `resend._domainkey` DKIM; they don't touch Google's root MX). The owner
   adds `RESEND_API_KEY` (Sensitive, Production) in Vercel. Test: a Start submission reaches `info@` and the submitter.

## Phase B: public launch (waits on content and the owner's launch date)

Preconditions: `/launch-checklist` has no open placeholders that show in public (privacy, terms, hours, contact
details), the owner has reviewed the production build, and a launch date is set (A13).

1. Vercel Deployment Protection → **Standard** (previews stay behind login; production domains become public).
2. `NEXT_PUBLIC_ALLOW_INDEXING=true` for Production; rebuild; promote (G3).
3. GoDaddy, `tabmassage.com` **web records only** (owner, with Claude on the call): apex A and `www` CNAME to the values
   Vercel shows when the two hosts are added to the project. Do not touch MX, SPF, DKIM or other TXT records.
4. Checks: `E2E_BASE_URL=https://www.tabhumanperformance.com npm run test:e2e`; spot-check 10 legacy URLs from
   `config/redirects.ts` on `tabmassage.com` for one 308 hop each; send and receive a test mail on both domains.
5. Search Console: add `tabhumanperformance.com` (DNS TXT), submit `/sitemap.xml`, file a change of address from
   `tabmassage.com` once the redirects are live (C2).
6. After two stable weeks: HSTS `includeSubDomains` (next.config.ts) once every subdomain serves HTTPS.

## Rollback

- Site: promote the previous production deployment (no rebuild).
- Legacy domain: restore the GoDaddy A and CNAME records to the old host (note the old values before step B3).
- Email: no step in this runbook changes Google Workspace mail routing for `tabmassage.com`.
