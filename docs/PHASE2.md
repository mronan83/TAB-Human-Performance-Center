# Phase 2: My TAB client portal

## What exists
- **Client portal** (`/my-tab`): home dashboard, plan and goals with trends, programs with weekly modules and activity tracking, weekly check-ins, progress charts, appointments (Timely links), assigned resources, schema-driven forms with save-and-resume, billing (Stripe + Timely), profile with consent controls.
- **Practice workspace** (`/practice`): client list with status filters and follow-up flags, client record (stage, plan, programs, trends, check-ins, appointments, forms), internal vs. shared session notes, program library, Start and contact submissions (route, link to a client, create a client). Plans, programs, reviews, resources and forms are **view-only** so far; authoring them is on the build list below.
- **Database** (`supabase/migrations`): 30+ tables covering people and roles, whole-person profile, consents, forms, plans and goals, program templates and client programs, metrics and progress, check-ins, reviews, notes, appointment references, resources, referrals, products, cohorts, entitlements, inquiries, Stripe idempotency, and an audit log.
- **Security**: row-level security on every table; staff access only in two-step-verified sessions; guard triggers limit what clients can change; consents kept as a server-stamped history; program content and cohort links only for enrolled or entitled clients; practitioners confined to their own clients; audit triggers on client data, roles and staff records; audit log read-only; private document storage bucket; per-request nonce CSP on the portal (SEC-013). Verified by `npm run test:rls` (71 enforced checks, **0 known gaps**).
- **Payments**: Stripe Checkout, customer portal, and webhook that grants and revokes entitlements (no Stripe account connected yet).
- **Supabase project** `vpaaeblqndcenftrfrms` (allowed org, us-east-1): public sign-up off; **no schema applied yet**. Applying the migrations there is a production migration (G3).

The portal runs on demo data (`portal.dataSource = "mock"`) on preview deployments only; production shows the Timely Client Login page instead (D-042, `CLAUDE.md` guardrail 4).

## Build before go-live (needs no real data)
Owner rulings, 2026-09-28: GAP-008 closed, **HIPAA does not apply** (proposed D-060 amends D-042: no HIPAA tier or BAA); build now; the Supabase upgrade comes later.
1. **Security hardening**: SEC-015 to SEC-018 done (the 5 known gaps are closed). Remaining: SEC-019 private-schema notes and audit drain, SEC-020 session cookies and a transactional Stripe webhook.
2. **Admin tools in TAB Practice**: invite to My TAB (GAP-023), write and edit the plan, record progress reviews, assign resources and forms, publish shared session summaries. Without these, clients sign in to empty screens (RSK-002). *Built in demo mode (C4a–C4c, C7, C4; 2026-10-02); session summaries are shared session notes and shared plan-log entries.*
3. **Sign-in plumbing**: invite confirmation route (token hash), Site URL and redirect allow list, custom SMTP through Resend (Supabase's built-in email is for testing only), staff MFA enrolment screen.
4. **Supabase-native tests in CI** (SEC-021): JWT, AAL, sign-up and grants against a real Supabase stack.

## Go-live gates (in order)
1. **Portal security gate**: the build list above is done (SEC-015 to SEC-021); `npm run test:rls` shows 0 known gaps; staff MFA enrolled and enforced.
2. **Hosting**: Supabase Pro (daily backups) and Vercel Pro, about $45/month. No HIPAA tier or BAA (owner ruling: HIPAA does not apply). Privacy policy updated to cover My TAB.
3. **Domain and Resend**, so sign-in and invite emails can be sent.
4. **G3**: apply the migrations and `seed.sql` to the project, set env vars, switch `portal.dataSource` to `"supabase"`.
5. Create the owner account, set `profiles.role = 'owner'`, enable MFA for staff; **test a backup restore** (SEC-009).
6. Publish the health history form (`form_templates.status`) only after steps 1–2.
7. **Pilot** with 3–5 existing clients, then open My TAB to every client.
8. Stripe, when programs are sold online: create prices, set `products.stripe_price_id`, activate products, add the webhook for `checkout.session.completed`, `customer.subscription.deleted`, `charge.refunded`.

## Extending
- New client data: table → RLS policies → audit trigger → test → repository method in both implementations → page.
- New form: insert a `form_templates` row with a JSON `schema` (field types: text, textarea, scale, choice, multi). No code needed.
- New metric: insert into `metric_definitions`; it appears in progress charts once entries exist.
- New program: insert a template, modules, and activities; assign via `client_programs` (editor UI is next, after the program architecture decision).
