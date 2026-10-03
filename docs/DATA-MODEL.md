---
title: TAB Wellness Collective Data Model
eyebrow: TAB Wellness Collective · Data model
heading: Data model
owner: Matthew Ronan
updated: 2026-10-03
lede: My TAB and TAB Practice keep their data in Postgres on Supabase. Everything about a client hangs off one clients row, and row-level security decides who sees it: the client, the practitioners on their care team, and the owner. Each table below is read from docs/schema.json, which CI keeps identical to what the migrations build. No migration has been applied to a real database yet; the portal runs on demo data until the go-live gate (A15).
---

<!-- Edit this file, not the page. scripts/docs/render-data-model.mjs builds the page (npm run docs:html) from this
     file and docs/schema.json (npm run docs:schema). `npm run docs:check` fails CI when the snapshot is stale, or when
     a table or function exists that this file doesn't describe. -->

## The model in one picture

<!-- diagram:domains -->

Every client-data table carries `client_id`, which is what row-level security checks. Programs are a library of versions, weeks and activities; a client's assignment points at one version, and what is personal to the client lives on the assignment. Website submissions, products and the audit log stand apart from any one client until they are linked.

## Domains | Each table belongs to one domain. The table cards further down are grouped the same way.

### People and access

| Table | What it holds | Who reads and writes |
| --- | --- | --- |
| `profiles` | One row per sign-in account (Supabase Auth user): role, name, email, whether MFA is required | The person themselves; the owner. Created by `handle_new_user` |
| `practitioners` | A staff member's public details, services, credentials (`capabilities`) and the publishing permission (`can_publish`) | Everyone signed in reads; the owner writes |
| `clients` | The client record: contact details, status, TAB Method stage, primary practitioner, Timely and Stripe references, invitation and first sign-in | The client (own contact details only); the care team; the owner |
| `practitioner_assignments` | Which practitioner works with which client, per service. This is the care team | The owner writes; the care team and the client read |
| `consents` | Consent history by type and version: granted, revoked, source. Insert-only | The client and the care team add; nobody edits or deletes |
| `client_wellness_profiles` | Goals, priorities, motivations, routines, preferences, and the sensitive health summary and contraindications | The client reads and updates their own; the care team |

### Care record

| Table | What it holds | Who reads and writes |
| --- | --- | --- |
| `wellness_plans` | Plans: the client's TAB Wellness Plan and service plans under it (`plan_type`, `parent_plan_id`), with status and review date | The care team; the client sees plans marked visible |
| `plan_goals` | A plan's goals: why it matters, measure, target, status | As its plan |
| `plan_entries` | The plan log: dated entries, shared or internal | The care team; the client sees shared entries |
| `session_notes` | Session notes shared with the client. Internal notes live in `private.internal_notes` | The care team writes; the client reads their own |
| `progress_reviews` | Progress Reviews: outcome, reflections, summary and next steps for the client, stage | The care team; the client sees shared reviews |
| `stage_changes` | Every change of TAB Method stage, who made it and from which review. Written by `record_stage_change` only | The care team and the client read |
| `referrals` | Referrals to another TAB service or outside, with reason and status | The care team; the client reads theirs and accepts or declines |

### Programs

| Table | What it holds | Who reads and writes |
| --- | --- | --- |
| `program_templates` | The program library, one row per version (`family_id`, `version`): draft, published or retired | Staff write, and publishing needs `can_publish_programs()`; signed-in people read published versions |
| `program_modules` | A version's weeks, in order | Staff write while the version is a draft; clients read only programs they are entitled to (`can_read_program`) |
| `program_activities` | A week's activities, with prescription and `source_activity_id` back to the previous version | As its week |
| `client_programs` | A program assigned to a client: version, linked plan, personalization (skips, prescriptions, notes), status | The care team; the client reads their own |
| `client_program_activities` | Activities added for one client only, outside the library program | The care team; the client reads their own |
| `activity_logs` | The client's check-offs and values per activity | The client logs their own; the care team reads |

### Progress and check-ins

| Table | What it holds | Who reads and writes |
| --- | --- | --- |
| `metric_definitions` | The measures progress can be recorded in, with unit, scale and whether a measure is sensitive | Everyone signed in reads; staff write |
| `progress_entries` | Recorded values for a metric | The client and the care team add; the care team reads all |
| `check_ins` | Weekly check-ins: energy, sleep, stress, wins, challenges, support needed | The client writes their own; the care team reads |

### Forms and resources

| Table | What it holds | Who reads and writes |
| --- | --- | --- |
| `form_templates` | Form definitions (JSON schema), with sensitivity, service and status | Staff write; signed-in people read published forms |
| `form_assignments` | A form assigned to a client, with a due date. Only published forms; a started form can't be withdrawn | The care team assigns; the client reads their own |
| `form_submissions` | A client's answers, draft or submitted, and staff review stamps | The client answers assigned forms; the care team reviews |
| `resource_assignments` | A resource shared with a client: link, title, note, when they opened it | The care team shares and removes; the client marks viewed |

### Commerce and cohorts

| Table | What it holds | Who reads and writes |
| --- | --- | --- |
| `products` | What can be bought online: programs, cohorts, memberships, with Stripe price | Everyone reads active products; staff write |
| `entitlements` | What a client has bought or been granted, from Stripe or by staff; partial refunds flag a purchase for the owner (`needs_review`) | The client reads their own; written by the Stripe webhook (service role) and staff |
| `cohorts` | A group run of a program with dates and capacity | Everyone signed in reads; staff write |
| `cohort_members` | Who is in a cohort | The care team; the client reads their own membership |
| `cohort_meetings` | A cohort's meeting link, kept apart so only members see it | Staff; members only |
| `stripe_events` | Stripe event IDs already handled, so a repeated webhook does nothing. Written in the same transaction as the event's changes | Service role only (no policies) |

### Website and integrations

| Table | What it holds | Who reads and writes |
| --- | --- | --- |
| `inquiries` | Start Where You Are and contact submissions: the whole form, flags, the linked client and the routing outcome. Never deleted | Written by the website with the service role. The owner reads all and records routing; a practitioner reads only those linked to their clients |
| `appointment_refs` | References to Timely appointments, for display in My TAB | The client reads their own; staff write |

### Private

| Table | What it holds | Who reads and writes |
| --- | --- | --- |
| `private.internal_notes` | Internal session notes, never shown to the client (SEC-019) | The care team, only through `internal_notes()` and `add_internal_note()`; every read is audited |
| `private.plan_private_details` | Practitioner-only plan details kept apart from the plan the client can see | The care team, only through `plan_private_details()` and `save_plan_private_details()`; every read is audited |

### Audit

| Table | What it holds | Who reads and writes |
| --- | --- | --- |
| `audit_events` | Who changed which row of a client-data table, when, and which columns, plus every read of private notes. Written by the `audit_row` trigger and the private-notes functions. Append-only | The owner and the `audit_reader` export role read; nobody can change or delete it |

## Tables | Read from docs/schema.json. Open a card's details for its policies, triggers and keys.

<!-- generated:tables -->

## Functions | What each database function is for. The data model check fails if one exists that isn't listed here.

| Function | What it does |
| --- | --- |
| `current_app_role` | The caller's role, counting a staff role only in a two-step-verified session and only while the practitioner is active (SEC-015, SEC-018). Every policy reads the role through it |
| `is_staff` | True for an owner or practitioner, through `current_app_role` |
| `my_client_id` | The client record linked to the signed-in account |
| `can_access_client` | The care-team rule: the owner sees every client, a practitioner only assigned clients, a client only themselves |
| `can_read_program` | Whether the caller may read a program: staff, or a client entitled to it through a purchase, an assignment or a cohort |
| `can_publish_programs` | The owner, or a practitioner with the publishing permission |
| `has_capability` | Whether the caller holds a credential such as nutrition, which unlocks gated plan types |
| `handle_new_user` | Creates the profile for a new account and links it to a client record once the email is confirmed (SEC-014) |
| `handle_user_confirmed` | Makes the same link when an existing account confirms its email |
| `record_my_tab_sign_in` | Stamps a client's first sign-in, called by the sign-in callback |
| `record_progress_review` | Saves a Progress Review and, if the stage changes, the client's new stage, in one transaction as the caller |
| `record_stage_change` | Trigger: writes `stage_changes` whenever a client's stage changes |
| `new_program_version` | Starts the next draft version of a program, copying the latest version's details and content |
| `save_program_draft` | Saves a draft's details and its whole week-and-activity content in one transaction |
| `program_activity_map` | Which activity in one version became which in another, following `source_activity_id` |
| `move_client_program` | Moves a client's assignment to a newer published version, carrying progress and personalization across |
| `save_client_activities` | Saves the full list of a program's client-only activities in one transaction |
| `audit_row` | Trigger: writes `audit_events` for every change to a client-data table |
| `set_updated_at` | Trigger: maintains `updated_at` |
| `stamp_author` | Trigger: authorship is the signed-in user, never a value the caller sends (SEC-018) |
| `stamp_consent` | Trigger: server time and caller on new consents |
| `stamp_client_invite` | Trigger: stamps the time and the inviter when a client is invited |
| `forbid_consent_change` | Trigger: consents are insert-only |
| `forbid_inquiry_delete` | Trigger: submissions are never deleted |
| `guard_client_update` | Trigger: clients may change only their own contact details; only the owner changes account or billing links |
| `guard_client_columns` | Trigger: the columns a client may change on a row staff assigned to them (SEC-016) |
| `guard_profile_update` | Trigger: nobody changes their own role or MFA requirement |
| `guard_same_client` | Trigger: a record links only to records of the same client (SEC-016) |
| `guard_form_assignment` | Trigger: only published forms can be assigned; a started form stays assigned |
| `guard_form_submission` | Trigger: clients answer only assigned forms and never review; submit time is the server's |
| `guard_inquiry_update` | Trigger: only routing fields change on a submission, stamped with who and when |
| `guard_activity_log` | Trigger: a client logs only activities in their own program that weren't skipped for them |
| `guard_client_program` | Trigger: an assignment keeps its client and moves only to a newer published version of the same program |
| `guard_program_template` | Trigger: published versions are immutable; publishing needs the permission; versions stay in one family |
| `guard_program_content` | Trigger: weeks and activities change only while their version is a draft |
| `guard_plan_shape` | Trigger: service plans sit under the same client's Wellness Plan |
| `guard_nutrition_plan` | Trigger: nutrition plans and anything attached to them need the nutrition credential |
| `internal_notes` | The client's internal session notes, for their care team only; writes an audit row for the read |
| `add_internal_note` | Adds an internal session note, stamped with its author |
| `plan_private_details` | The client's practitioner-only plan details, for their care team only; writes an audit row for the read |
| `save_plan_private_details` | Saves a plan's practitioner-only details; the plan's guards (same client, nutrition credential) still apply |
| `private.require_care_team` | The check the private-notes functions share: staff on the client's care team, in a two-step-verified session |
| `forbid_audit_change` | Trigger: the audit log is append-only; updates, deletes and truncation fail |
| `apply_stripe_event` | Applies one Stripe event in one transaction: grants, pauses, cancels or refunds a purchase, or flags a partial refund. Service role only |
| `grant_stripe_purchase` | Grants a paid checkout: the purchase, the Stripe customer link and, for a program, its assignment (once) |
| `resolve_purchase_review` | The owner's decision on a flagged purchase: keep access or end it, stamped with who and when |

## Enums

<!-- generated:enums -->

## Business rules | The rules the database enforces, whatever the app does.

- **The care team.** A practitioner reads and writes only clients assigned to them in `practitioner_assignments`; the owner sees every client (D-045; see Q-3 on the traceability page).
- **Two-step verification.** A staff role counts only in an `aal2` session; without it, a practitioner is treated as no role at all.
- **Clients change little.** A client may change their contact details and wellness profile, answer their own forms, log their own activities and check-ins, add progress values and consents, answer a referral and mark a resource viewed. Nothing else, and only the listed columns (`guard_client_columns`).
- **Shared or internal.** Session notes, plan entries and progress reviews are internal unless marked shared; clients see shared ones only. `plan_private_details` never reaches the client.
- **Published programs don't change.** Editing a published program means a new draft version; clients move to it only when their practitioner moves them.
- **Authorship can't be forged.** Who wrote, assigned, invited or reviewed is stamped from the session.
- **History is kept.** Consents are insert-only, submissions are never deleted, stage changes are recorded, every change to client data is audited, and so is every read of internal notes. The audit log is append-only and copied off Supabase nightly once A26 is done.
- **Purchases follow Stripe in one step.** Each Stripe event applies whole or not at all, and an event that can't be applied fails loudly so Stripe retries it. A partial refund keeps access until the owner decides (owner ruling 2026-10-03).
- **Links stay within one client.** A plan, review, form submission or activity log can only point to records of the same client.

## Security model

<!-- generated:security -->

Row-level security is on for every table. A table with no policy for a role refuses that role entirely; `stripe_events` has no policies, so only the server's service role can use it. The `private` schema goes further: signed-in roles have no access to the schema at all, so its tables are reachable only through the functions listed above. Supabase's default grants give `anon` and `authenticated` table access, which is why every rule above lives in a policy or trigger, not in grants. The policies are tested as owner, practitioner, client and signed-out in `supabase/tests/rls.test.mjs`; testing against a real Supabase stack is C6.

## Local verification

- `npm run test:rls` applies every migration to PGlite and runs the database checks.
- `npm run docs:schema` rewrites `docs/schema.json` after a migration changes; `npm run docs:check` fails if it wasn't rewritten, or if a new table or function isn't described here.
- Production migrations need G3 approval and run through the Supabase CLI against project `vpaaeblqndcenftrfrms` only.
