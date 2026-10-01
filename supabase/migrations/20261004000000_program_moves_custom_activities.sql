-- ---------------------------------------------------------------------------
-- C7b: program editor, part 2 (docs/design/plans-programs-stages.md §3.1, G1 approved 2026-09-29).
--
-- 1. Moving a client to a newer version. A practitioner moves an assigned program to a newer published version of the
--    same program (§3.1 "Clients on the old version keep it until a practitioner moves them"). Progress and
--    personalization follow each activity through source_activity_id (set when a version is copied, C7).
-- 2. Client-only activities. A practitioner adds activities for one client to an assigned program, in a given week.
--    They live in client_program_activities, so the library program never changes, and the client can log them.
-- ---------------------------------------------------------------------------

-- An assignment keeps its client; it may change program only to a newer published version of the same program.
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
  elsif new.client_id is distinct from old.client_id then
    raise exception 'An assigned program keeps its client, program and version';
  elsif new.template_id is distinct from old.template_id then
    select * into tpl from program_templates where id = new.template_id;
    if tpl.status is distinct from 'published' or tpl.version <= old.template_version
       or tpl.family_id is distinct from (select family_id from program_templates where id = old.template_id) then
      raise exception 'A program can only move to a newer published version of itself';
    end if;
    new.template_version := tpl.version;
  elsif new.template_version is distinct from old.template_version then
    raise exception 'An assigned program keeps its client, program and version';
  end if;
  if new.status = 'completed' then
    new.completed_at := coalesce(new.completed_at, current_date);
  else
    new.completed_at := null;
  end if;
  return new;
end $$;

-- Which activity in `to_template` each activity in `from_template` became, following source_activity_id back through
-- the versions in between. Activities added or removed along the way have no match. Depth-limited, so a hand-edited
-- source chain can never loop.
create or replace function program_activity_map(from_template uuid, to_template uuid)
returns table (old_id uuid, new_id uuid) language sql stable security invoker set search_path = public as $$
  with recursive chain (new_id, ancestor, depth) as (
    select a.id, a.source_activity_id, 1
    from program_activities a join program_modules m on m.id = a.module_id
    where m.template_id = to_template and a.source_activity_id is not null
    union all
    select c.new_id, a.source_activity_id, c.depth + 1
    from chain c join program_activities a on a.id = c.ancestor
    where a.source_activity_id is not null and c.depth < 100
  )
  select c.ancestor, c.new_id
  from chain c join program_activities a on a.id = c.ancestor join program_modules m on m.id = a.module_id
  where m.template_id = from_template
$$;

-- Moves an assigned program to a newer published version. Runs as the caller, so only the client's care team can
-- (RLS on client_programs and activity_logs). Returns how many completed activities carried over.
create or replace function move_client_program(program uuid, target uuid) returns int language plpgsql security invoker set search_path = public as $$
declare
  cp client_programs%rowtype;
  carried int;
begin
  if not is_staff() then raise exception 'Only practitioners can move a client''s program'; end if;
  select * into cp from client_programs where id = program;
  if cp.id is null then raise exception 'Program not found'; end if;
  update client_programs set template_id = target,
    personalization = jsonb_strip_nulls(jsonb_build_object(
      'note', cp.personalization -> 'note',
      'activities', (select jsonb_object_agg(m.new_id::text, cp.personalization -> 'activities' -> (m.old_id::text))
                     from program_activity_map(cp.template_id, target) m
                     where cp.personalization -> 'activities' ? (m.old_id::text))))
  where id = program;
  update activity_logs l set activity_id = m.new_id
  from program_activity_map(cp.template_id, target) m, client_programs moved
  where moved.id = program and l.client_program_id = program and l.activity_id = m.old_id
    and coalesce(moved.personalization -> 'activities' -> (m.new_id::text) ->> 'skip', 'false') <> 'true';
  get diagnostics carried = row_count;
  return carried;
end $$;

-- Client-only activities ------------------------------------------------------------------------------------------
create table client_program_activities (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients (id) on delete cascade,
  client_program_id uuid not null references client_programs (id) on delete cascade,
  week int not null check (week between 1 and 52),
  kind activity_kind not null,
  title text not null check (length(title) between 1 and 120),
  instructions text check (length(instructions) <= 1000),
  sort int not null default 0,
  created_by uuid references profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index on client_program_activities (client_program_id, week, sort);
alter table client_program_activities enable row level security;
create policy client_program_activities_read on client_program_activities for select using (can_access_client(client_id));
create policy client_program_activities_staff on client_program_activities for all
  using (is_staff() and can_access_client(client_id)) with check (is_staff() and can_access_client(client_id));
create trigger client_program_activities_same_client before insert or update on client_program_activities
  for each row execute function guard_same_client('client_program_id', 'client_programs');
create trigger client_program_activities_author before insert or update on client_program_activities
  for each row execute function stamp_author('created_by');
create trigger client_program_activities_updated_at before update on client_program_activities
  for each row execute function set_updated_at();
create trigger client_program_activities_audit after insert or update or delete on client_program_activities
  for each row execute function audit_row();

alter table activity_logs
  add column client_activity_id uuid references client_program_activities (id) on delete cascade,
  add constraint activity_logs_one_activity check (activity_id is null or client_activity_id is null);

-- A client logs only activities in their program: a program activity not skipped for them, or one added for them.
create or replace function guard_activity_log() returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.client_activity_id is not null then
    if not exists (select 1 from client_program_activities where id = new.client_activity_id and client_program_id = new.client_program_id) then
      raise exception 'That activity is not part of this program';
    end if;
    return new;
  end if;
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

-- Saves the full list of a program's client-only activities in one transaction: rows with an id from this program are
-- updated, others added, and rows left out removed (with their logs). Runs as the caller (care team only, by RLS).
create or replace function save_client_activities(program uuid, items jsonb) returns void language plpgsql security invoker set search_path = public as $$
declare
  cp client_programs%rowtype;
  it jsonb; aid uuid; n int := 0; keep uuid[] := '{}';
  uuid_re constant text := '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';
begin
  if not is_staff() then raise exception 'Only practitioners can change a client''s program'; end if;
  select * into cp from client_programs where id = program;
  if cp.id is null then raise exception 'Program not found'; end if;
  for it in select value from jsonb_array_elements(items) loop
    aid := case when it ->> 'id' ~ uuid_re then (it ->> 'id')::uuid end;
    if aid is not null and exists (select 1 from client_program_activities where id = aid and client_program_id = program) then
      update client_program_activities set week = (it ->> 'week')::int, kind = (it ->> 'kind')::activity_kind, title = it ->> 'title',
        instructions = nullif(it ->> 'instructions', ''), sort = n where id = aid;
    else
      insert into client_program_activities (client_id, client_program_id, week, kind, title, instructions, sort)
        values (cp.client_id, program, (it ->> 'week')::int, (it ->> 'kind')::activity_kind, it ->> 'title', nullif(it ->> 'instructions', ''), n)
        returning id into aid;
    end if;
    keep := keep || aid; n := n + 1;
  end loop;
  delete from client_program_activities where client_program_id = program and id <> all (keep);
end $$;
