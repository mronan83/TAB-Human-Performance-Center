# Codebase review — 2026-09-28

Review of the handed-off `tab-wellness-collective` codebase before adopting it as the build baseline.

**Method:** two independent static reviews (security and data architecture; requirements traceability and
accessibility), followed by verification: clean install, typecheck, RLS suite, production build, dependency
audit, WCAG contrast computation for every token pairing, exploit probes against the migration in PGlite, a
mutation test of the RLS harness, and a negative test of the launch gate.

**Verdict:** adopt. The architecture is sound and matches the MDR. The security core holds: RLS on all 30
tables, clients isolated from each other, internal notes and hidden plans unreachable by clients, no role
escalation, service-role key confined to the Stripe webhook. The main weaknesses: the demo portal was
production-reachable, test and CI results could not fail, several colour pairings failed WCAG AA, and the
Phase 2 data layer needs hardening before any real client data.

## 1. Fixed in this change

| Finding | Severity | Fix | Register |
|---|---|---|---|
| Demo portal (no login, one in-memory store shared by every visitor) enabled on production | High | `portal.enabled` is false on production deployments unless the data source is Supabase; runtime guard in `lib/portal/index.ts`; header shows **Client Login** → Timely until the portal is live; interim page no longer says "coming soon" | WEB-020, DEC-020 |
| `*.vercel.app` production alias indexable before launch | High | `NEXT_PUBLIC_ALLOW_INDEXING` gate in robots.txt, metadata and `X-Robots-Tag` | NFR-009 |
| RLS test harness always exited 0; "blocked" checks passed on any error | Medium | Failures now exit 1; denials must be RLS or guard-trigger errors; mutation-tested (a broken notes policy fails the run) | NFR-007, R-026 |
| No CI | Medium | GitHub Actions: typecheck, RLS, contrast, build, dependency audit | DS-005, NFR-007 |
| Colour pairings failing WCAG 2.2 AA (form borders, eyebrows on sand, badges, focus ring on dark fields) | Medium | Owner-approved token amendments (proposed D-056) plus usage fixes; `on-dark` focus ring; contrast check 38/38 | CON-011, DS-005 |
| Analytics exclusion defeated by client-side navigation | Medium | Plausible `data-exclude`; pixel page views sent per route with `disablePushState`; analytics only in the public layout | NFR-005, D-046 |
| Possible open redirect for `//host` paths in middleware | Low–Medium | Reject `//` and `\` paths; redirects set only the path on a known origin | — |
| Personal name in email subjects; honeypot failed validation (revealing the trap); unbounded rate-limit map; name not stripped of line breaks | Medium/Low | Subjects carry a reference only; honeypot fails quietly; bounded map; CR/LF stripped | D-054, R-027 |
| HSTS `includeSubDomains; preload` before the legacy host is understood | Low | `max-age` only until the cutover runbook | RSK-009 |
| `/launch-checklist` public in production | Low | 404 unless draft markers are on (previews) | — |
| Placeholder copy could reach the live site | High (launch) | **Launch gate:** a build with indexing on fails while required checklist items are open (verified: 15 open today) | NFR-009, WEB-013 |
| PostCSS advisory in Next's bundled copy | Low (build-time) | `overrides: postcss ^8.5.28`; audit clean | — |

## 2. Phase 2 security gate — must close before any real client data

Tracked as SEC-014 to SEC-021 in the register. Executable where PGlite allows: `npm run test:rls` prints each
open item as `GAP`; Phase 2 go-live requires zero.

| ID | Finding | Required fix |
|---|---|---|
| SEC-014 | Open self-signup plus email-matching link on insert enables pre-account takeover | Disable public signup; owner-invite only with `client_id` in `app_metadata`; link on `email_confirmed_at` |
| SEC-015 | Staff MFA not enforced anywhere; users can clear their own `mfa_required` *(GAP test)* | Require `aal2` in staff RLS branches and `requireStaff`; column-restricted profile updates |
| SEC-016 | Clients can over-write rows: `resource_assignments`, `referrals`, `form_submissions` status/reviewer, consents (backdating, `source`), `clients.email`; cross-client FK references *(GAP tests)* | Column-level grants or allow-list triggers; insert-only server-stamped consents; assignment-gated submissions; same-client FK checks |
| SEC-017 | Any signed-in user reads all program modules/activities (drafts, paid content) and cohort meeting URLs *(GAP test)* | Gate on published + staff / enrolment / entitlement; meeting URLs to members only |
| SEC-018 | Practitioners reach beyond their care team: all profile emails, cohort membership, `profile_id` and `stripe_customer_id` changes, authorship spoofing, access retained after deactivation *(GAP test)* | Scope by assignment; pin authorship to `auth.uid()`; owner/service-role only for identity and billing links; check `practitioners.active` |
| SEC-019 | Internal notes are separated only by a visibility filter; sensitive reads not audited; audit gaps (role changes, several tables, storage); `TRUNCATE` granted on the audit table | Private-schema notes via audited SECURITY DEFINER functions; add triggers; revoke all but SELECT on audit; ship audit to an append-only drain (A-05) |
| SEC-020 | Session cookies readable by JavaScript, 400-day lifetime; Stripe webhook swallows errors, ignores `payment_status`, past-due and partial refunds | `httpOnly`/`secure` cookies, time-boxed sessions; transactional webhook RPC that fails loudly |
| SEC-021 | PGlite can't test JWT claims, AAL, signup or grants; helper functions executable by `anon`; storage bucket has no limits | `supabase start` + pgTAP suite in CI; revoke EXECUTE from PUBLIC; bucket size/MIME limits |

## 3. Phase 1 backlog — before public launch

| Area | Item | Register |
|---|---|---|
| Start form | Add the S14 §14.4.1 fields: 14-option "help with", separate service interest, "What brings you to TAB?". The "immediate considerations" field invites health details and conflicts with D-054; **owner decision** | GS-001, DIV-01 |
| Forms | Bot protection and shared rate limit (Turnstile, Vercel BotID or WAF) | SEC-013 |
| Security | Content-Security-Policy (nonce-based, `frame-ancestors 'none'`) | SEC-013 |
| Navigation | Home item and an "All services" link; Escape returns focus; menu closes on tab-out | WEB-001 |
| Routes | `/resources/articles`, `/resources/guides`; `/events` currently 404 (feature off) | WEB-002, WEB-010 |
| Service pages | Practitioner module, related resources, Holistic focus areas; related services only where genuine | WEB-005, WEB-007 |
| Footer | Hours, cancellation-policy and service-disclaimer links | WEB-012 |
| SEO | Root `not-found`; canonicals and descriptions on every page; location in service titles; Service JSON-LD; FAQ markup excludes drafts | NFR-002, NFR-003 |
| Accessibility | Form errors wired with `aria-describedby`, focus to first invalid field and to success heading; heading order on `/tab-method`, `/services`; portal skip link; decorative photo placeholder hidden from screen readers | NFR-001 |
| Content | Unverified trust stats ("20+ years", "In person & virtual") need owner confirmation; approved CTA labels | WEB-013, CMS-005 |
| Transition banner | Evaluated at build time; add revalidation so it expires on its date | WEB-015 |
| Icons | 16px favicon, web manifest, 192/512/maskable icons, OG image, dark variants (with the vector files) | WEB-019, DS-006 |
| Redirects | `/employee-login` → `/my-tab` sends a staff link to the client portal; `/about-us` and `/blog` targets differ from the inventory proposal; decision rows settled silently (owner has tabled legacy offerings) | NFR-004, GAP-018 |
| Testing | Playwright smoke tests for the S19 §19.15 list against every preview; automated redirect-map test; post-launch 404 monitoring | NFR-007, NFR-008, NFR-010 |
| Design system | Generate CSS tokens from the JSON rather than hand-copying | DS-001 |
