-- ---------------------------------------------------------------------------
-- C4c: assigning and personalizing programs (docs/design/plans-programs-stages.md §2.4 step 3 and §3,
-- G1 approved 2026-09-29).
--
-- A practitioner assigns a published program template to a client, optionally links it to one of the client's
-- plans, and personalizes it: skip activities, adjust prescriptions, add notes. The template itself never changes
-- for one client; the overrides live in client_programs.personalization:
--   { "note": "...", "activities": { "<activity id>": { "skip": true, "note": "...", "prescription": { "reps": "6" } } } }
-- The assignment pins the template's version, so later edits to the template (C7) never change a client's program
-- silently. Access is the existing client-data policy on client_programs: the client reads, their care team writes.
-- ---------------------------------------------------------------------------

alter table client_programs
  add column assigned_by uuid references profiles (id),
  add constraint client_programs_personalization_object check (jsonb_typeof(personalization) = 'object');

create trigger client_programs_author before insert or update on client_programs
  for each row execute function stamp_author('assigned_by');

-- Only published programs are assigned; the version is pinned by the database, not the caller; an assignment keeps
-- its client and template; completed_at follows the status.
create or replace function guard_client_program() returns trigger language plpgsql security definer set search_path = public as $$
declare
  tpl program_templates%rowtype;
begin
  if tg_op = 'INSERT' then
    select * into tpl from program_templates where id = new.template_id;
    if tpl.status is distinct from 'published' then
      raise exception 'Only published programs can be assigned';
    end if;
    new.template_version := tpl.version;
  elsif new.client_id is distinct from old.client_id or new.template_id is distinct from old.template_id
     or new.template_version is distinct from old.template_version then
    raise exception 'An assigned program keeps its client, program and version';
  end if;
  if new.status = 'completed' then
    new.completed_at := coalesce(new.completed_at, current_date);
  else
    new.completed_at := null;
  end if;
  return new;
end $$;
create trigger client_programs_guard before insert or update on client_programs
  for each row execute function guard_client_program();

-- A client logs only activities that are part of their program and not skipped for them.
create or replace function guard_activity_log() returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.activity_id is null then return new; end if;
  if new.client_program_id is null or not exists (
    select 1
    from client_programs cp
    join program_modules m on m.template_id = cp.template_id
    join program_activities a on a.module_id = m.id
    where cp.id = new.client_program_id and a.id = new.activity_id
      and coalesce(cp.personalization -> 'activities' -> (new.activity_id::text) ->> 'skip', 'false') <> 'true'
  ) then
    raise exception 'That activity is not part of this program';
  end if;
  return new;
end $$;
create trigger activity_logs_activity before insert or update on activity_logs
  for each row execute function guard_activity_log();
