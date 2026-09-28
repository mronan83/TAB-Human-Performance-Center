-- =============================================================================
-- My TAB client portal — core schema (Phase 2)
-- Decisions: D-034 (portal scope), D-035 (systems of record), D-042 (sensitive-data
-- system), D-043 (programs and cohorts in Phase 2), D-044 (templates + products),
-- D-045 (model for a team, build for one), D-052 (payment ownership).
--
-- IMPORTANT (D-042 as amended, CLAUDE.md guardrail 4): do not load real client
-- health information until the portal security gate is met, Supabase is on a paid
-- plan with a tested restore, and the privacy policy covers My TAB. Columns holding
-- sensitive data are tagged `-- SENSITIVE` and every change to them is written to
-- audit_events.
-- =============================================================================

-- gen_random_uuid() is built into Postgres 13+ (Supabase), no extension required.

-- ---------------------------------------------------------------------------
-- Enumerations
-- ---------------------------------------------------------------------------
create type app_role as enum ('owner', 'practitioner', 'client');
create type client_status as enum ('prospect', 'active', 'paused', 'alumni');
create type service_slug as enum ('massage-bodywork', 'personal-strength-training', 'womens-wellness-coaching', 'holistic-life-coaching');
create type method_stage as enum ('start', 'transform', 'align', 'become', 'evolve');
create type plan_status as enum ('draft', 'active', 'completed', 'archived');
create type goal_status as enum ('active', 'achieved', 'paused', 'dropped');
create type publish_status as enum ('draft', 'published', 'retired');
create type activity_kind as enum ('exercise', 'habit', 'reflection', 'reading', 'video', 'check_in');
create type client_program_source as enum ('assigned', 'purchased', 'cohort');
create type client_program_status as enum ('active', 'paused', 'completed', 'cancelled');
create type entry_source as enum ('client', 'practitioner');
create type metric_category as enum ('physical', 'habit', 'wellbeing', 'health');
create type note_visibility as enum ('internal', 'shared');
create type form_sensitivity as enum ('general', 'sensitive');
create type submission_status as enum ('draft', 'submitted', 'reviewed');
create type consent_type as enum ('terms', 'privacy', 'health_info_collection', 'care_coordination', 'marketing_email', 'marketing_sms', 'photo_testimonial');
create type referral_target as enum ('internal_service', 'external_professional');
create type referral_status as enum ('suggested', 'accepted', 'declined', 'completed');
create type product_kind as enum ('program', 'cohort', 'membership', 'package');
create type entitlement_source as enum ('stripe', 'manual', 'timely');
create type entitlement_status as enum ('active', 'expired', 'cancelled', 'refunded');
create type cohort_status as enum ('planned', 'enrolling', 'running', 'completed', 'cancelled');

-- ---------------------------------------------------------------------------
-- Utility: updated_at maintenance
-- ---------------------------------------------------------------------------
create or replace function set_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

-- ---------------------------------------------------------------------------
-- People and access (D-045: roles and practitioners are entities from day one)
-- ---------------------------------------------------------------------------
create table profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role app_role not null default 'client',
  full_name text,
  preferred_name text,
  email text,
  timezone text not null default 'America/Detroit',
  mfa_required boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table practitioners (
  id uuid primary key references profiles (id) on delete cascade,
  display_name text not null,
  credentials text,
  bio text,
  services service_slug[] not null default '{}',
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table clients (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid unique references profiles (id) on delete set null, -- null until the client activates My TAB
  full_name text not null,
  preferred_name text,
  email text,
  phone text,
  date_of_birth date, -- SENSITIVE
  status client_status not null default 'prospect',
  method_stage method_stage not null default 'start',
  primary_practitioner_id uuid references practitioners (id),
  timely_client_ref text,          -- Timely remains system of record for scheduling (D-003)
  stripe_customer_id text unique,  -- one Stripe customer per client (D-052)
  source text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table practitioner_assignments (
  client_id uuid not null references clients (id) on delete cascade,
  practitioner_id uuid not null references practitioners (id) on delete cascade,
  service service_slug,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  primary key (client_id, practitioner_id)
);

-- ---------------------------------------------------------------------------
-- Whole-person profile (Step 16 My TAB "Profile")
-- ---------------------------------------------------------------------------
create table client_wellness_profiles (
  client_id uuid primary key references clients (id) on delete cascade,
  goals text,
  priorities text,
  motivations text,
  life_stage text,
  routines text,
  preferences jsonb not null default '{}',          -- pressure, training preferences, delivery (in person/virtual)
  communication_prefs jsonb not null default '{}',
  health_summary jsonb not null default '{}',       -- SENSITIVE: conditions, medications, clearances
  contraindications text,                           -- SENSITIVE
  updated_by uuid references profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table consents (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients (id) on delete cascade,
  type consent_type not null,
  version text not null,
  granted boolean not null,
  granted_at timestamptz not null default now(),
  revoked_at timestamptz,
  source text not null default 'portal',
  unique (client_id, type, version)
);

-- ---------------------------------------------------------------------------
-- Forms and intake
-- ---------------------------------------------------------------------------
create table form_templates (
  id uuid primary key default gen_random_uuid(),
  slug text not null,
  version int not null default 1,
  title text not null,
  description text,
  service service_slug,
  sensitivity form_sensitivity not null default 'general',
  schema jsonb not null,   -- field definitions rendered by the portal form engine
  status publish_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (slug, version)
);

create table form_assignments (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients (id) on delete cascade,
  template_id uuid not null references form_templates (id),
  due_on date,
  assigned_by uuid references profiles (id),
  created_at timestamptz not null default now()
);

create table form_submissions (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients (id) on delete cascade,
  template_id uuid not null references form_templates (id),
  assignment_id uuid references form_assignments (id) on delete set null,
  answers jsonb not null default '{}',   -- SENSITIVE when template sensitivity = 'sensitive'
  status submission_status not null default 'draft',
  submitted_at timestamptz,
  reviewed_by uuid references profiles (id),
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Plans and goals
-- ---------------------------------------------------------------------------
create table wellness_plans (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients (id) on delete cascade,
  title text not null,
  focus text,
  services service_slug[] not null default '{}',
  status plan_status not null default 'draft',
  visible_to_client boolean not null default false,
  start_date date,
  review_date date,
  created_by uuid references profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table plan_goals (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid not null references wellness_plans (id) on delete cascade,
  title text not null,
  why_it_matters text,
  measure text,          -- "what progress looks like to you" (experience principle 6)
  metric_key text,       -- optional link to metric_definitions
  target text,
  status goal_status not null default 'active',
  sort int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Programs: reusable templates, optionally sold as products (D-044)
-- ---------------------------------------------------------------------------
create table program_templates (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  summary text,
  service service_slug not null,
  audience text,
  duration_weeks int,
  delivery text[] not null default '{in-person,virtual}',
  status publish_status not null default 'draft',
  version int not null default 1,
  created_by uuid references profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table program_modules (
  id uuid primary key default gen_random_uuid(),
  template_id uuid not null references program_templates (id) on delete cascade,
  week int not null default 1,
  sort int not null default 0,
  title text not null,
  body_md text,
  resource_ref text,   -- Payload CMS document id (D-036)
  video_ref text,      -- Bunny Stream video id (D-005)
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table program_activities (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references program_modules (id) on delete cascade,
  kind activity_kind not null,
  title text not null,
  instructions text,
  prescription jsonb not null default '{}',  -- e.g. {"sets":3,"reps":"8-10","frequency":"3x/week"}
  sort int not null default 0,
  created_at timestamptz not null default now()
);

create table client_programs (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients (id) on delete cascade,
  template_id uuid not null references program_templates (id),
  template_version int not null default 1,
  plan_id uuid references wellness_plans (id) on delete set null,
  source client_program_source not null default 'assigned',
  status client_program_status not null default 'active',
  personalization jsonb not null default '{}', -- per-client overrides of activities/prescriptions
  started_at date not null default current_date,
  completed_at date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Self-tracking and progress (D-019, resolved by D-042)
-- ---------------------------------------------------------------------------
create table metric_definitions (
  key text primary key,
  label text not null,
  unit text,
  category metric_category not null,
  sensitive boolean not null default false,
  higher_is_better boolean,
  scale_min numeric,
  scale_max numeric,
  active boolean not null default true
);

create table activity_logs (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients (id) on delete cascade,
  client_program_id uuid references client_programs (id) on delete cascade,
  activity_id uuid references program_activities (id) on delete set null,
  logged_on date not null default current_date,
  completed boolean not null default true,
  values jsonb not null default '{}',
  note text,
  created_at timestamptz not null default now()
);

create table progress_entries (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients (id) on delete cascade,
  metric_key text not null references metric_definitions (key),
  value numeric not null,
  recorded_on date not null default current_date,
  source entry_source not null default 'client',
  note text,  -- SENSITIVE when metric is sensitive
  created_by uuid references profiles (id),
  created_at timestamptz not null default now()
);

create table check_ins (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients (id) on delete cascade,
  week_of date not null,
  energy smallint check (energy between 1 and 5),
  sleep_quality smallint check (sleep_quality between 1 and 5),
  stress smallint check (stress between 1 and 5),
  wins text,
  challenges text,
  support_needed text,
  submitted_at timestamptz not null default now(),
  unique (client_id, week_of)
);

create table progress_reviews (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients (id) on delete cascade,
  plan_id uuid references wellness_plans (id) on delete set null,
  practitioner_id uuid references practitioners (id),
  review_date date not null,
  summary_for_client text,
  next_steps text,
  method_stage method_stage,
  shared boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Notes, appointments, resources, referrals
-- ---------------------------------------------------------------------------
create table session_notes (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients (id) on delete cascade,
  practitioner_id uuid not null references practitioners (id),
  service service_slug,
  session_date date not null default current_date,
  appointment_ref text,                       -- Timely appointment reference, entered manually
  visibility note_visibility not null default 'internal',
  body text not null,                          -- SENSITIVE
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Timely has no customer API (verified); references are recorded manually or later via Zapier (Innovate).
create table appointment_refs (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients (id) on delete cascade,
  timely_ref text,
  service service_slug,
  starts_at timestamptz not null,
  location text,           -- "In person" or "Virtual"
  status text not null default 'booked',
  created_at timestamptz not null default now()
);

create table resource_assignments (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients (id) on delete cascade,
  resource_ref text not null,   -- Payload CMS resource id or slug
  title text not null,
  kind text,
  note text,
  assigned_by uuid references profiles (id),
  assigned_at timestamptz not null default now(),
  viewed_at timestamptz
);

create table referrals (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients (id) on delete cascade,
  target referral_target not null,
  to_service service_slug,
  to_name text,
  reason text,
  status referral_status not null default 'suggested',
  created_by uuid references profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Commerce: products, entitlements, cohorts (D-043, D-044, D-052)
-- ---------------------------------------------------------------------------
create table products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text,
  kind product_kind not null,
  service service_slug,
  program_template_id uuid references program_templates (id),
  stripe_price_id text unique,
  price_cents int,
  currency text not null default 'usd',
  active boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table cohorts (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references products (id),
  program_template_id uuid references program_templates (id),
  title text not null,
  starts_on date,
  ends_on date,
  capacity int,
  status cohort_status not null default 'planned',
  meeting_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table cohort_members (
  cohort_id uuid not null references cohorts (id) on delete cascade,
  client_id uuid not null references clients (id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (cohort_id, client_id)
);

create table entitlements (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients (id) on delete cascade,
  product_id uuid not null references products (id),
  source entitlement_source not null,
  stripe_checkout_session_id text unique,
  stripe_subscription_id text,
  status entitlement_status not null default 'active',
  starts_at timestamptz not null default now(),
  ends_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table stripe_events (  -- idempotency for webhooks
  id text primary key,
  type text not null,
  received_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Audit log (D-042): every change to client data is recorded
-- ---------------------------------------------------------------------------
create table audit_events (
  id bigserial primary key,
  occurred_at timestamptz not null default now(),
  actor_id uuid,
  action text not null,
  table_name text not null,
  record_id text,
  client_id uuid,
  changed_columns text[]
);

create or replace function audit_row() returns trigger language plpgsql security definer set search_path = public as $$
declare
  rec jsonb := case when tg_op = 'DELETE' then to_jsonb(old) else to_jsonb(new) end;
  cols text[];
begin
  if tg_op = 'UPDATE' then
    select array_agg(key) into cols from jsonb_each(to_jsonb(new)) n
    where n.value is distinct from (to_jsonb(old) -> n.key) and n.key not in ('updated_at');
  end if;
  insert into audit_events (actor_id, action, table_name, record_id, client_id, changed_columns)
  values (auth.uid(), lower(tg_op), tg_table_name, rec ->> 'id',
          coalesce((rec ->> 'client_id')::uuid, case when tg_table_name = 'clients' then (rec ->> 'id')::uuid end), cols);
  return null;
end $$;

-- ---------------------------------------------------------------------------
-- Access helpers
-- ---------------------------------------------------------------------------
create or replace function current_app_role() returns app_role language sql stable security definer set search_path = public as $$
  select role from profiles where id = auth.uid()
$$;

create or replace function is_staff() returns boolean language sql stable security definer set search_path = public as $$
  select coalesce(current_app_role() in ('owner', 'practitioner'), false)
$$;

-- Owner sees all clients; practitioners see assigned clients; clients see only themselves.
create or replace function can_access_client(target uuid) returns boolean language sql stable security definer set search_path = public as $$
  select case current_app_role()
    when 'owner' then true
    when 'practitioner' then exists (
      select 1 from practitioner_assignments a where a.client_id = target and a.practitioner_id = auth.uid() and a.active)
    when 'client' then exists (select 1 from clients c where c.id = target and c.profile_id = auth.uid())
    else false end
$$;

create or replace function my_client_id() returns uuid language sql stable security definer set search_path = public as $$
  select id from clients where profile_id = auth.uid()
$$;

-- New auth users get a client profile by default; staff roles are granted by the owner.
create or replace function handle_new_user() returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into profiles (id, email, full_name) values (new.id, new.email, new.raw_user_meta_data ->> 'full_name');
  update clients set profile_id = new.id where profile_id is null and lower(email) = lower(new.email);
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function handle_new_user();

-- ---------------------------------------------------------------------------
-- Triggers: updated_at and audit
-- ---------------------------------------------------------------------------
do $$
declare t text;
begin
  foreach t in array array['profiles','practitioners','clients','client_wellness_profiles','form_templates','form_submissions',
    'wellness_plans','plan_goals','program_templates','program_modules','client_programs','progress_reviews','session_notes',
    'referrals','products','cohorts','entitlements']
  loop
    execute format('create trigger %I_updated_at before update on %I for each row execute function set_updated_at()', t, t);
  end loop;
  foreach t in array array['clients','client_wellness_profiles','consents','form_submissions','wellness_plans','plan_goals',
    'client_programs','activity_logs','progress_entries','check_ins','progress_reviews','session_notes','appointment_refs',
    'resource_assignments','referrals','entitlements','practitioner_assignments']
  loop
    execute format('create trigger %I_audit after insert or update or delete on %I for each row execute function audit_row()', t, t);
  end loop;
end $$;

-- ---------------------------------------------------------------------------
-- Row-level security
-- ---------------------------------------------------------------------------
do $$
declare t text;
begin
  foreach t in array array['profiles','practitioners','clients','practitioner_assignments','client_wellness_profiles','consents',
    'form_templates','form_assignments','form_submissions','wellness_plans','plan_goals','program_templates','program_modules',
    'program_activities','client_programs','metric_definitions','activity_logs','progress_entries','check_ins','progress_reviews',
    'session_notes','appointment_refs','resource_assignments','referrals','products','cohorts','cohort_members','entitlements',
    'stripe_events','audit_events']
  loop
    execute format('alter table %I enable row level security', t);
  end loop;
end $$;

-- Profiles
create policy profiles_self_read on profiles for select using (id = auth.uid() or is_staff());
create policy profiles_self_update on profiles for update using (id = auth.uid()) with check (id = auth.uid());
create policy profiles_owner_all on profiles for all using (current_app_role() = 'owner') with check (current_app_role() = 'owner');

-- Practitioners: readable by signed-in users (names on plans); owner manages
create policy practitioners_read on practitioners for select using (auth.uid() is not null);
create policy practitioners_owner on practitioners for all using (current_app_role() = 'owner') with check (current_app_role() = 'owner');

-- Clients
create policy clients_read on clients for select using (can_access_client(id));
create policy clients_staff_write on clients for insert with check (is_staff());
create policy clients_staff_update on clients for update using (is_staff() and can_access_client(id));
create policy clients_self_update on clients for update using (profile_id = auth.uid()) with check (profile_id = auth.uid());

-- Guard triggers: non-staff users may edit only their own contact details, never roles or care fields.
create or replace function guard_profile_update() returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.role is distinct from old.role and coalesce(current_app_role() <> 'owner', true) and auth.uid() is not null then
    raise exception 'Only the owner can change roles';
  end if;
  return new;
end $$;
create trigger profiles_guard before update on profiles for each row execute function guard_profile_update();

create or replace function guard_client_update() returns trigger language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is not null and not is_staff() then
    if new.status is distinct from old.status or new.method_stage is distinct from old.method_stage
       or new.primary_practitioner_id is distinct from old.primary_practitioner_id or new.profile_id is distinct from old.profile_id
       or new.stripe_customer_id is distinct from old.stripe_customer_id or new.timely_client_ref is distinct from old.timely_client_ref then
      raise exception 'Clients may only update their own contact details';
    end if;
  end if;
  return new;
end $$;
create trigger clients_guard before update on clients for each row execute function guard_client_update();

create policy assignments_read on practitioner_assignments for select using (can_access_client(client_id));
create policy assignments_owner on practitioner_assignments for all using (current_app_role() = 'owner') with check (current_app_role() = 'owner');

-- Client-owned data: readable by the client and their practitioners; written by staff
do $$
declare t text;
begin
  foreach t in array array['client_wellness_profiles','consents','form_assignments','form_submissions','client_programs',
    'activity_logs','progress_entries','check_ins','resource_assignments','referrals','entitlements','appointment_refs']
  loop
    execute format('create policy %I_read on %I for select using (can_access_client(client_id))', t, t);
    execute format('create policy %I_staff on %I for all using (is_staff() and can_access_client(client_id)) with check (is_staff() and can_access_client(client_id))', t, t);
  end loop;
end $$;

-- Client self-service writes
create policy wellness_profile_client_upsert on client_wellness_profiles for insert with check (client_id = my_client_id());
create policy wellness_profile_client_update on client_wellness_profiles for update using (client_id = my_client_id()) with check (client_id = my_client_id());
create policy consents_client_write on consents for insert with check (client_id = my_client_id());
create policy consents_client_update on consents for update using (client_id = my_client_id()) with check (client_id = my_client_id());
create policy submissions_client_insert on form_submissions for insert with check (client_id = my_client_id());
create policy submissions_client_update on form_submissions for update using (client_id = my_client_id() and status = 'draft') with check (client_id = my_client_id());
create policy activity_logs_client on activity_logs for insert with check (client_id = my_client_id());
create policy activity_logs_client_delete on activity_logs for delete using (client_id = my_client_id());
create policy progress_client on progress_entries for insert with check (client_id = my_client_id() and source = 'client');
create policy check_ins_client on check_ins for insert with check (client_id = my_client_id());
create policy check_ins_client_update on check_ins for update using (client_id = my_client_id()) with check (client_id = my_client_id());
create policy resources_client_viewed on resource_assignments for update using (client_id = my_client_id()) with check (client_id = my_client_id());
create policy referrals_client_respond on referrals for update using (client_id = my_client_id()) with check (client_id = my_client_id());

-- Plans: clients see plans marked visible; staff manage
create policy plans_read on wellness_plans for select using (can_access_client(client_id) and (is_staff() or visible_to_client));
create policy plans_staff on wellness_plans for all using (is_staff() and can_access_client(client_id)) with check (is_staff() and can_access_client(client_id));
create policy goals_read on plan_goals for select using (exists (select 1 from wellness_plans p where p.id = plan_id and can_access_client(p.client_id) and (is_staff() or p.visible_to_client)));
create policy goals_staff on plan_goals for all using (exists (select 1 from wellness_plans p where p.id = plan_id and is_staff() and can_access_client(p.client_id)))
  with check (exists (select 1 from wellness_plans p where p.id = plan_id and is_staff() and can_access_client(p.client_id)));

-- Reviews and notes: clients see only what is shared
create policy reviews_read on progress_reviews for select using (can_access_client(client_id) and (is_staff() or shared));
create policy reviews_staff on progress_reviews for all using (is_staff() and can_access_client(client_id)) with check (is_staff() and can_access_client(client_id));
create policy notes_read on session_notes for select using (can_access_client(client_id) and (is_staff() or visibility = 'shared'));
create policy notes_staff on session_notes for all using (is_staff() and can_access_client(client_id)) with check (is_staff() and can_access_client(client_id));

-- Catalog: published content is readable by signed-in users; staff manage
create policy templates_read on program_templates for select using (auth.uid() is not null and (status = 'published' or is_staff()));
create policy templates_staff on program_templates for all using (is_staff()) with check (is_staff());
create policy modules_read on program_modules for select using (auth.uid() is not null);
create policy modules_staff on program_modules for all using (is_staff()) with check (is_staff());
create policy activities_read on program_activities for select using (auth.uid() is not null);
create policy activities_staff on program_activities for all using (is_staff()) with check (is_staff());
create policy forms_read on form_templates for select using (auth.uid() is not null and (status = 'published' or is_staff()));
create policy forms_staff on form_templates for all using (is_staff()) with check (is_staff());
create policy metrics_read on metric_definitions for select using (auth.uid() is not null);
create policy metrics_staff on metric_definitions for all using (is_staff()) with check (is_staff());
create policy products_read on products for select using (active or is_staff());
create policy products_staff on products for all using (is_staff()) with check (is_staff());
create policy cohorts_read on cohorts for select using (auth.uid() is not null);
create policy cohorts_staff on cohorts for all using (is_staff()) with check (is_staff());
create policy cohort_members_read on cohort_members for select using (can_access_client(client_id));
create policy cohort_members_staff on cohort_members for all using (is_staff()) with check (is_staff());

-- Audit and webhook tables: owner read only; writes happen via triggers / service role
create policy audit_owner_read on audit_events for select using (current_app_role() = 'owner');

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------
create index on clients (primary_practitioner_id);
create index on practitioner_assignments (practitioner_id) where active;
create index on wellness_plans (client_id, status);
create index on client_programs (client_id, status);
create index on activity_logs (client_id, logged_on desc);
create index on progress_entries (client_id, metric_key, recorded_on desc);
create index on check_ins (client_id, week_of desc);
create index on session_notes (client_id, session_date desc);
create index on appointment_refs (client_id, starts_at);
create index on entitlements (client_id, status);
create index on audit_events (client_id, occurred_at desc);

-- ---------------------------------------------------------------------------
-- Private storage for client documents (clearances, intake attachments)
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public) values ('client-documents', 'client-documents', false) on conflict do nothing;
-- Objects are stored under "<client_id>/<filename>"
create policy client_docs_read on storage.objects for select
  using (bucket_id = 'client-documents' and can_access_client((storage.foldername(name))[1]::uuid));
create policy client_docs_write on storage.objects for insert
  with check (bucket_id = 'client-documents' and can_access_client((storage.foldername(name))[1]::uuid));
