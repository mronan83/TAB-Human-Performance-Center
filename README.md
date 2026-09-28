# TAB Wellness Collective — website and My TAB portal

**Transform. Align. Become.** Next.js 15 (App Router) · TypeScript · Tailwind CSS v4 · Supabase · Stripe · Resend · Vercel.

| Area | Status |
|---|---|
| Phase 1 public website | Built. Temporary content and placeholders, all driven by config. |
| Legacy redirects | Built. All 64 tabmassage.com URLs map in one 308 hop. |
| Start Where You Are form | Built. Emails info@tabwellnesscollective.com via Resend. |
| Phase 2 My TAB portal | UI complete on demo data. Supabase schema, security policies, and repository built; not yet connected to a live project. |
| Payments (digital products) | Stripe Checkout, customer portal, and webhook built; needs keys and prices. |

## Run it

```bash
npm install
cp .env.example .env.local   # fill in what you have; everything is optional for local review
npm run dev                  # http://localhost:3000
```

- Website: `/`
- Client portal demo: `/my-tab` (fictional client "Dana"; switch to the practitioner view from the dark banner)
- Practitioner workspace demo: `/practice`
- Launch readiness: `/launch-checklist` (lists every open placeholder; not indexed)

## Checks

```bash
npm run typecheck   # TypeScript
npm run build       # production build
npm run test:rls    # 16 row-level security tests against the database migration (in-process Postgres)
```

## Where things live

```
config/        site.ts (business details, links, features, portal mode) · navigation.ts · redirects.ts
content/       services.ts (four pillars) · pages.ts (home, method, about, FAQ, resources, legal)
app/(site)/    public pages
app/(portal)/  My TAB (/my-tab) and practice workspace (/practice), plus server actions
app/api/       inquiry email, Stripe checkout / billing portal / webhook
components/    site components; components/portal/ for the portal
lib/portal/    domain types, repository interface, demo and Supabase implementations
supabase/      migrations (schema + RLS + audit), seed data, RLS tests
public/brand/  logos and service icons (PNG placeholders until vector files arrive)
docs/          CONFIGURATION.md, PHASE2.md
```

See `CLAUDE.md` for decisions, guardrails, and next steps.

## Program documentation

| Document | Purpose |
|---|---|
| [`docs/requirements-register.md`](docs/requirements-register.md) | Requirements with stable IDs, traceability to source documents, conflicts, gaps and risks |
| [`docs/source/`](docs/source/) | Brand Foundation, Steps 13–19, design tokens, master decision record, architecture (as received) |
| [`docs/legacy/tabmassage-inventory.md`](docs/legacy/tabmassage-inventory.md) | Legacy site facts and draft redirect map |

## Accounts and deployment

Hosting is the dedicated Vercel team `tab-wellness-collective`; data is the dedicated Supabase org
`TAB Wellness Collective`. `main` is the production branch; every PR gets a Vercel preview. See
`CLAUDE.md` for account guardrails and review gates (G1 design, G2 PR, G3 release).
