# TAB Human Performance Center: website and My TAB portal

**Transform. Adapt. Balance.** Next.js 15 (App Router) · TypeScript · Tailwind CSS v4 · Supabase · Stripe · Resend · Vercel.

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
- Launch readiness: `/launch-checklist` on previews (lists every open placeholder). Setting `NEXT_PUBLIC_ALLOW_INDEXING=true` is the launch switch; the build fails while required items are open.
- The demo portal runs only on previews and locally; production shows Client Login → Timely until Phase 2.

## Checks

```bash
npm run check          # everything below, as CI runs it on every PR
npm run typecheck      # TypeScript
npm run test:rls       # row-level security suite (in-process Postgres); also lists open Phase 2 security gaps
npm run test:contrast  # WCAG 2.2 AA contrast for every permitted design-token pairing
npm run build          # production build
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

Hosting is the Vercel project `tab-human-performance-center` (formerly `tab-wellness-collective`; production address `tab-wellness-collective.vercel.app` until the domain is chosen) in the owner's personal team; data is the Supabase org
`TAB Wellness Collective` (account, repository and project names were kept through the rebrand). `main` is the production branch; every PR gets a Vercel preview. See
`CLAUDE.md` for account guardrails and review gates (G1 design, G2 PR, G3 release).
