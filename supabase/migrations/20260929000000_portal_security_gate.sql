-- =============================================================================
-- Portal security gate, part 1 (2026-09-28 security review §2): SEC-015 to SEC-018, plus the audit-table
-- privileges from SEC-019. Closes the five known gaps in supabase/tests/rls.test.mjs.
-- Remaining gate items: SEC-019 private-schema notes and audit drain, SEC-020 cookies and Stripe webhook,
-- SEC-021 Supabase-native tests (docs/BACKLOG.md).
-- =============================================================================

-- ---------------------------------------------------------------------------
-- SEC-015 staff MFA and SEC-018 deactivation. Every policy and guard reads the role through
-- current_app_role(), so this one function enforces both everywhere: a staff role counts only in a session
-- verified with MFA (aal2) and, for practitioners, only while their practitioner record is active.
-- ---------------------------------------------------------------------------
create or replace function current_app_role() returns app_role language sql stable security definer set search_path = public as $$
  select case
    when p.role = 'client' then p.role
    when p.mfa_required and coalesce(auth.jwt() ->> 'aal', '') <> 'aal2' then null
    when p.role = 'practitioner' and not exists (select 1 from practitioners x where x.id = p.id and x.active) then null
    else p.role end
  from profiles p where p.id = auth.uid()
$$;

-- ---------------------------------------------------------------------------
-- Profiles. SEC-018: practitioners see staff profiles and those of their own clients, not every client's
-- email. SEC-015: people edit only their name, preferred name and time zone; role and mfa_required are
-- owner-only.
-- ---------------------------------------------------------------------------
drop policy profiles_self_read on profiles;
create policy profiles_read on profiles for select using (
  id = auth.uid()
  or current_app_role() = 'owner'
  or (current_app_role() = 'practitioner' and (
        role in ('owner', 'practitioner')
        or exists (select 1 from clients c where c.profile_id = profiles.id and can_access_client(c.id)))));

create or replace function guard_profile_update() returns trigger language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null or current_app_role() = 'owner' then return new; end if; -- service role, verified owner
  if new.role is distinct from old.role then raise exception 'Only the owner can change roles'; end if;
  if (to_jsonb(new) - 'full_name' - 'preferred_name' - 'timezone' - 'updated_at')
     is distinct from (to_jsonb(old) - 'full_name' - 'preferred_name' - 'timezone' - 'updated_at') then
    raise exception 'You can change only your name, preferred name and time zone';
  end if;
  return new;
end $$;

-- ---------------------------------------------------------------------------
-- Clients. SEC-018: account and billing links (profile_id, stripe_customer_id) are owner or service-role only.
-- SEC-016: clients change only their preferred name and phone (not their email, which links accounts).
-- ---------------------------------------------------------------------------
create or replace function guard_client_update() returns trigger language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null or current_app_role() = 'owner' then return new; end if;
  if new.profile_id is distinct from old.profile_id or new.stripe_customer_id is distinct from old.stripe_customer_id then
    raise exception 'Only the owner can change account or billing links';
  end if;
  if not is_staff()
     and (to_jsonb(new) - 'preferred_name' - 'phone' - 'updated_at') is distinct from (to_jsonb(old) - 'preferred_name' - 'phone' - 'updated_at') then
    raise exception 'Clients may only update their own contact details';
  end if;
  return new;
end $$;

-- ---------------------------------------------------------------------------
-- SEC-016: the columns a client may change on rows staff assigned to them. tg_argv lists them.
-- ---------------------------------------------------------------------------
create or replace function guard_client_columns() returns trigger language plpgsql security definer set search_path = public as $$
declare n jsonb := to_jsonb(new); o jsonb := to_jsonb(old); k text;
begin
  if auth.uid() is null or is_staff() then return new; end if;
  foreach k in array tg_argv loop n := n - k; o := o - k; end loop;
  if n is distinct from o then raise exception 'Clients may only update %', array_to_string(tg_argv, ', '); end if;
  return new;
end $$;
create trigger resource_assignments_client_columns before update on resource_assignments
  for each row execute function guard_client_columns('viewed_at');
create trigger referrals_client_columns before update on referrals
  for each row execute function guard_client_columns('status', 'updated_at');
create trigger check_ins_client_columns before update on check_ins
  for each row execute function guard_client_columns('energy', 'sleep_quality', 'stress', 'wins', 'challenges', 'support_needed', 'submitted_at');

-- A client answers a referral; they don't complete or re-suggest it.
drop policy referrals_client_respond on referrals;
create policy referrals_client_respond on referrals for update using (client_id = my_client_id())
  with check (client_id = my_client_id() and status in ('accepted', 'declined'));

-- ---------------------------------------------------------------------------
-- SEC-016: a record may only link to another record of the same client (tg_argv: column, table pairs).
-- ---------------------------------------------------------------------------
create or replace function guard_same_client() returns trigger language plpgsql security definer set search_path = public as $$
declare i int := 0; ref uuid; ok boolean;
begin
  while i < tg_nargs loop
    ref := (to_jsonb(new) ->> tg_argv[i])::uuid;
    if ref is not null then
      execute format('select exists (select 1 from %I where id = $1 and client_id = $2)', tg_argv[i + 1]) into ok using ref, new.client_id;
      if not ok then raise exception 'That record belongs to another client'; end if;
    end if;
    i := i + 2;
  end loop;
  return new;
end $$;
create trigger activity_logs_same_client before insert or update on activity_logs
  for each row execute function guard_same_client('client_program_id', 'client_programs');
create trigger form_submissions_same_client before insert or update on form_submissions
  for each row execute function guard_same_client('assignment_id', 'form_assignments');
create trigger client_programs_same_client before insert or update on client_programs
  for each row execute function guard_same_client('plan_id', 'wellness_plans');
create trigger progress_reviews_same_client before insert or update on progress_reviews
  for each row execute function guard_same_client('plan_id', 'wellness_plans');

-- ---------------------------------------------------------------------------
-- SEC-016: form submissions. Clients answer only forms assigned to them, only save or submit (never review),
-- and the submit time is the server's. Staff reviews are stamped with who and when.
-- ---------------------------------------------------------------------------
create or replace function guard_form_submission() returns trigger language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then return new; end if;
  if is_staff() then
    if new.status = 'reviewed' and (tg_op = 'INSERT' or old.status is distinct from 'reviewed') then
      new.reviewed_by := auth.uid();
      new.reviewed_at := now();
    end if;
    return new;
  end if;
  if new.status not in ('draft', 'submitted') or new.reviewed_by is not null or new.reviewed_at is not null then
    raise exception 'Clients can only save or submit their own answers';
  end if;
  if tg_op = 'UPDATE' and (new.template_id is distinct from old.template_id or new.client_id is distinct from old.client_id) then
    raise exception 'Clients can only save or submit their own answers';
  end if;
  if not exists (select 1 from form_assignments a where a.client_id = new.client_id and a.template_id = new.template_id
                 and (new.assignment_id is null or a.id = new.assignment_id)) then
    raise exception 'This form was not assigned to you';
  end if;
  new.submitted_at := case when new.status = 'submitted' then now() end;
  return new;
end $$;
create trigger form_submissions_guard before insert or update on form_submissions
  for each row execute function guard_form_submission();

-- ---------------------------------------------------------------------------
-- SEC-016 / SEC-010: consents are a history. Each grant or withdrawal is a new row stamped by the server;
-- nobody edits or deletes one (the service role still can, e.g. for a deletion request).
-- ---------------------------------------------------------------------------
alter table consents drop constraint consents_client_id_type_version_key;
create index on consents (client_id, type, granted_at desc);
drop policy consents_client_update on consents;
drop policy consents_staff on consents;
create policy consents_staff_insert on consents for insert with check (is_staff() and can_access_client(client_id));

create or replace function stamp_consent() returns trigger language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then return new; end if;
  new.granted_at := now();
  new.revoked_at := case when new.granted then null else now() end;
  if not is_staff() then new.source := 'portal'; end if;
  return new;
end $$;
create trigger consents_stamp before insert on consents for each row execute function stamp_consent();

create or replace function forbid_consent_change() returns trigger language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is not null then raise exception 'Consent records are kept as history and cannot be changed'; end if;
  return case when tg_op = 'DELETE' then old else new end;
end $$;
create trigger consents_history before update or delete on consents for each row execute function forbid_consent_change();

-- ---------------------------------------------------------------------------
-- SEC-018: authorship is the signed-in user, never a value the caller sends (tg_argv[0] = column). On update
-- the original author is kept, except for "updated_by" columns (tg_argv[1] = 'always').
-- ---------------------------------------------------------------------------
create or replace function stamp_author() returns trigger language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then return new; end if;
  if tg_op = 'INSERT' or tg_argv[1] = 'always' then
    new := jsonb_populate_record(new, jsonb_build_object(tg_argv[0], auth.uid()));
  else
    new := jsonb_populate_record(new, jsonb_build_object(tg_argv[0], to_jsonb(old) -> tg_argv[0]));
  end if;
  return new;
end $$;
create trigger session_notes_author before insert or update on session_notes for each row execute function stamp_author('practitioner_id');
create trigger progress_reviews_author before insert or update on progress_reviews for each row execute function stamp_author('practitioner_id');
create trigger wellness_plans_author before insert or update on wellness_plans for each row execute function stamp_author('created_by');
create trigger resource_assignments_author before insert or update on resource_assignments for each row execute function stamp_author('assigned_by');
create trigger referrals_author before insert or update on referrals for each row execute function stamp_author('created_by');
create trigger form_assignments_author before insert or update on form_assignments for each row execute function stamp_author('assigned_by');
create trigger program_templates_author before insert or update on program_templates for each row execute function stamp_author('created_by');
create trigger progress_entries_author before insert or update on progress_entries for each row execute function stamp_author('created_by');
create trigger wellness_profiles_author before insert or update on client_wellness_profiles for each row execute function stamp_author('updated_by', 'always');

-- ---------------------------------------------------------------------------
-- SEC-018: practitioners manage cohort membership only for their own clients.
-- ---------------------------------------------------------------------------
drop policy cohort_members_staff on cohort_members;
create policy cohort_members_staff on cohort_members for all
  using (is_staff() and can_access_client(client_id)) with check (is_staff() and can_access_client(client_id));

-- ---------------------------------------------------------------------------
-- SEC-017: program content (modules and activities) is readable by staff, and by clients only for published
-- (or since-retired) programs they are enrolled in, entitled to, or in a cohort for. Drafts and paid content
-- are no longer readable by every signed-in user.
-- ---------------------------------------------------------------------------
create or replace function can_read_program(template uuid) returns boolean language sql stable security definer set search_path = public as $$
  select is_staff() or exists (
    select 1 from program_templates t where t.id = template and t.status <> 'draft' and (
      exists (select 1 from client_programs cp where cp.template_id = t.id and cp.client_id = my_client_id())
      or exists (select 1 from entitlements e join products p on p.id = e.product_id
                 where e.client_id = my_client_id() and e.status = 'active' and p.program_template_id = t.id)
      or exists (select 1 from cohort_members m join cohorts c on c.id = m.cohort_id
                 where m.client_id = my_client_id() and c.program_template_id = t.id)))
$$;
drop policy modules_read on program_modules;
create policy modules_read on program_modules for select using (can_read_program(template_id));
drop policy activities_read on program_activities;
create policy activities_read on program_activities for select
  using (exists (select 1 from program_modules m where m.id = module_id and can_read_program(m.template_id)));

-- SEC-017: cohort meeting links move to their own table, readable by staff and that cohort's members only.
create table cohort_meetings (
  cohort_id uuid primary key references cohorts (id) on delete cascade,
  meeting_url text not null,
  updated_at timestamptz not null default now()
);
insert into cohort_meetings (cohort_id, meeting_url) select id, meeting_url from cohorts where meeting_url is not null;
alter table cohorts drop column meeting_url;
alter table cohort_meetings enable row level security;
create policy cohort_meetings_read on cohort_meetings for select using (
  is_staff() or exists (select 1 from cohort_members m where m.cohort_id = cohort_meetings.cohort_id and m.client_id = my_client_id()));
create policy cohort_meetings_staff on cohort_meetings for all using (is_staff()) with check (is_staff());
create trigger cohort_meetings_updated_at before update on cohort_meetings for each row execute function set_updated_at();

-- ---------------------------------------------------------------------------
-- SEC-019 (part): audit coverage for roles, staff records, assignments and memberships; and signed-in users
-- can only read the audit log (Supabase's default grants include TRUNCATE, which row-level security doesn't
-- cover). TRUNCATE is revoked on every table: nothing in the app needs it.
-- ---------------------------------------------------------------------------
do $$
declare t text;
begin
  foreach t in array array['profiles', 'practitioners', 'form_assignments', 'cohort_members', 'cohort_meetings'] loop
    execute format('create trigger %I_audit after insert or update or delete on %I for each row execute function audit_row()', t, t);
  end loop;
end $$;

do $$
declare r text;
begin
  foreach r in array array['anon', 'authenticated'] loop
    if exists (select 1 from pg_roles where rolname = r) then
      execute format('revoke truncate on all tables in schema public from %I', r);
      execute format('alter default privileges in schema public revoke truncate on tables from %I', r);
      execute format('revoke insert, update, delete on audit_events from %I', r);
    end if;
  end loop;
end $$;
