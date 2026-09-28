# Phase 2: My TAB client portal

## What exists
- **Client portal** (`/my-tab`): home dashboard, plan and goals with trends, programs with weekly modules and activity tracking, weekly check-ins, progress charts, appointments (Timely links), assigned resources, schema-driven forms with save-and-resume, billing (Stripe + Timely), profile with consent controls.
- **Practice workspace** (`/practice`): client list with status filters and follow-up flags, client record (stage, plan, programs, trends, check-ins, appointments, forms), internal vs. shared session notes, program library.
- **Database** (`supabase/migrations`): 30 tables covering people and roles, whole-person profile, consents, forms, plans and goals, program templates and client programs, metrics and progress, check-ins, reviews, notes, appointment references, resources, referrals, products, cohorts, entitlements, Stripe idempotency, and an audit log.
- **Security**: row-level security on every table; guard triggers stop clients changing roles or care fields; audit triggers on all client data; private document storage bucket. Verified by `npm run test:rls` (16 tests).
- **Payments**: Stripe Checkout, customer portal, and webhook that grants and revokes entitlements.

## Go-live gates (in order)
1. **Legal review** of health-data obligations (Step 16 defers these to counsel). Its outcome decides the hosting tier.
2. **HIPAA-eligible hosting** if required: Supabase Team + HIPAA add-on with BAA; Vercel BAA if server functions process health data (R-025, about $1,300/month).
3. Create the Supabase project, run the migration and `seed.sql`, set env vars, switch `portal.dataSource` to `"supabase"`.
4. Create the owner account, set `profiles.role = 'owner'`, enable MFA for staff.
5. Publish the health history form (`form_templates.status`) only after steps 1–2.
6. Stripe: create prices, set `products.stripe_price_id`, activate products, add webhook for `checkout.session.completed`, `customer.subscription.deleted`, `charge.refunded`.

## Extending
- New client data: table → RLS policies → audit trigger → test → repository method in both implementations → page.
- New form: insert a `form_templates` row with a JSON `schema` (field types: text, textarea, scale, choice, multi). No code needed.
- New metric: insert into `metric_definitions`; it appears in progress charts once entries exist.
- New program: insert a template, modules, and activities; assign via `client_programs` (editor UI is next, after the program architecture decision).
