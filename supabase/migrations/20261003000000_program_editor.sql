-- ---------------------------------------------------------------------------
-- C7: program editor with versioning (docs/design/plans-programs-stages.md §3.1, G1 approved 2026-09-29).
--
-- Each version of a program is its own program_templates row; the versions of one program share a family_id
-- (the first version's id) and a slug. Clients and products keep pointing at the row they were given, so a client's
-- program never changes underneath them (§3.1 "No silent changes").
--
--   draft ──publish──▶ published ──(next version published, or retire)──▶ retired
--
-- * Any practitioner creates and edits drafts; a draft can be submitted for review and discarded.
-- * Publishing needs the publishing permission: owners, or practitioners with practitioners.can_publish
--   (owner ruling 2026-09-29: "publishing permission", not a separate role).
-- * Published and retired versions are read-only, content included. Editing one starts a new draft version
--   (new_program_version), which copies the content and remembers where each activity came from.
-- * Publishing a version retires the family's previous published version; its clients keep it.
-- ---------------------------------------------------------------------------

alter table practitioners add column can_publish boolean not null default false;

alter table program_templates
  add column family_id uuid references program_templates (id),
  add column submitted_at timestamptz,
  add column published_at timestamptz,
  add column published_by uuid references profiles (id);
update program_templates set family_id = id where family_id is null;
alter table program_templates alter column family_id set not null;
alter table program_templates drop constraint program_templates_slug_key;
create unique index program_templates_slug_version on program_templates (slug, version);
create unique index program_templates_family_version on program_templates (family_id, version);
create unique index program_templates_one_draft on program_templates (family_id) where status = 'draft';
create unique index program_templates_one_published on program_templates (family_id) where status = 'published';

-- The activity in the previous version this one was copied from (null for new activities).
alter table program_activities add column source_activity_id uuid references program_activities (id) on delete set null;

create or replace function can_publish_programs() returns boolean language sql stable security definer set search_path = public as $$
  select coalesce(current_app_role() = 'owner', false)
      or (current_app_role() = 'practitioner' and exists (select 1 from practitioners where id = auth.uid() and active and can_publish))
$$;

create or replace function guard_program_template() returns trigger language plpgsql security definer set search_path = public as $$
declare
  service_role boolean := auth.uid() is null;
begin
  if tg_op = 'DELETE' then
    if old.status <> 'draft' and not service_role then
      raise exception 'Published programs are kept; retire them instead';
    end if;
    return old;
  end if;
  if tg_op = 'INSERT' then
    new.family_id := coalesce(new.family_id, new.id);
    if new.family_id <> new.id then
      new.version := coalesce((select max(version) from program_templates where family_id = new.family_id), 0) + 1;
      new.slug := (select slug from program_templates where id = new.family_id);
    else
      new.version := 1;
    end if;
    if not service_role then
      if new.status <> 'draft' then raise exception 'New programs start as drafts'; end if;
      new.submitted_at := null; new.published_at := null; new.published_by := null;
    end if;
    return new;
  end if;
  -- UPDATE
  if service_role then return new; end if;
  if new.id <> old.id or new.family_id <> old.family_id or new.version <> old.version then
    raise exception 'A program version keeps its program and number';
  end if;
  new.slug := case when old.family_id = old.id then new.slug else old.slug end; -- later versions keep the program's slug
  if old.status = 'draft' and new.status = 'draft' then
    new.published_at := null; new.published_by := null;
    return new;
  end if;
  if old.status = 'draft' and new.status = 'published' then
    if not can_publish_programs() then raise exception 'Publishing needs the publishing permission'; end if;
    update program_templates set status = 'retired' where family_id = new.family_id and status = 'published' and id <> new.id;
    new.published_at := now(); new.published_by := auth.uid(); new.submitted_at := null;
    return new;
  end if;
  if old.status = 'published' and new.status = 'retired' then
    if not can_publish_programs() then raise exception 'Publishing needs the publishing permission'; end if;
    if (to_jsonb(new) - 'status' - 'updated_at') is distinct from (to_jsonb(old) - 'status' - 'updated_at') then
      raise exception 'Published programs can''t be edited; start a new version';
    end if;
    return new;
  end if;
  raise exception 'Published programs can''t be edited; start a new version';
end $$;
create trigger program_templates_guard before insert or update or delete on program_templates
  for each row execute function guard_program_template();

-- Content (weeks and activities) changes only while its version is a draft.
create or replace function guard_program_content() returns trigger language plpgsql security definer set search_path = public as $$
declare
  tpl uuid;
  st publish_status;
begin
  if auth.uid() is null then return coalesce(new, old); end if; -- service role (seeding, server jobs)
  if tg_table_name = 'program_modules' then
    tpl := coalesce(new.template_id, old.template_id);
    if tg_op = 'UPDATE' and new.template_id <> old.template_id then raise exception 'A week stays in its program'; end if;
  else
    if tg_op = 'UPDATE' and new.module_id <> old.module_id then
      if (select template_id from program_modules where id = new.module_id) is distinct from (select template_id from program_modules where id = old.module_id) then
        raise exception 'An activity stays in its program';
      end if;
    end if;
    tpl := (select template_id from program_modules where id = coalesce(new.module_id, old.module_id));
  end if;
  select status into st from program_templates where id = tpl;
  -- st is null while a discarded draft is being deleted (cascade); that is allowed.
  if st is not null and st <> 'draft' then
    raise exception 'Published programs can''t be edited; start a new version';
  end if;
  return coalesce(new, old);
end $$;
create trigger program_modules_guard before insert or update or delete on program_modules
  for each row execute function guard_program_content();
create trigger program_activities_guard before insert or update or delete on program_activities
  for each row execute function guard_program_content();

-- Starts the next draft version of a program, copying the latest version's details and content.
-- Returns the existing draft if the program already has one. Runs as the caller (staff only by RLS).
create or replace function new_program_version(template uuid) returns uuid language plpgsql security invoker set search_path = public as $$
declare
  fam uuid;
  src program_templates%rowtype;
  draft uuid;
  m record;
  new_module uuid;
begin
  if not is_staff() then raise exception 'Only practitioners can edit programs'; end if;
  select family_id into fam from program_templates where id = template;
  if fam is null then raise exception 'Program not found'; end if;
  select id into draft from program_templates where family_id = fam and status = 'draft';
  if draft is not null then return draft; end if;
  select * into src from program_templates where family_id = fam order by version desc limit 1;
  insert into program_templates (family_id, slug, title, summary, service, audience, duration_weeks, delivery, status)
    values (fam, src.slug, src.title, src.summary, src.service, src.audience, src.duration_weeks, src.delivery, 'draft')
    returning id into draft;
  for m in select * from program_modules where template_id = src.id order by week, sort loop
    insert into program_modules (template_id, week, sort, title, body_md, resource_ref, video_ref)
      values (draft, m.week, m.sort, m.title, m.body_md, m.resource_ref, m.video_ref) returning id into new_module;
    insert into program_activities (module_id, kind, title, instructions, prescription, sort, source_activity_id)
      select new_module, a.kind, a.title, a.instructions, a.prescription, a.sort, a.id from program_activities a where a.module_id = m.id;
  end loop;
  return draft;
end $$;

-- Saves a draft's details and its whole content in one transaction (the editor sends the full draft).
-- content: [{ id?, week, title, body?, activities: [{ id?, kind, title, instructions?, prescription }] }] in order.
-- Rows with an id from this draft are updated (activities may move between weeks), rows without one are added, and
-- rows left out are removed. Runs as the caller: staff only (RLS), drafts only (guard triggers).
create or replace function save_program_draft(template uuid, details jsonb, content jsonb) returns void language plpgsql security invoker set search_path = public as $$
declare
  m jsonb; a jsonb; mid uuid; aid uuid; ms int := 0; asort int;
  keep_m uuid[] := '{}'; keep_a uuid[] := '{}';
  uuid_re constant text := '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';
begin
  if not is_staff() then raise exception 'Only practitioners can edit programs'; end if;
  if (select status from program_templates where id = template) is distinct from 'draft' then
    raise exception 'Published programs can''t be edited; start a new version';
  end if;
  update program_templates set title = details ->> 'title', summary = nullif(details ->> 'summary', ''),
    service = (details ->> 'service')::service_slug, duration_weeks = nullif(details ->> 'duration_weeks', '')::int
  where id = template;
  for m in select value from jsonb_array_elements(content) loop
    mid := case when m ->> 'id' ~ uuid_re then (m ->> 'id')::uuid end;
    if mid is not null and exists (select 1 from program_modules where id = mid and template_id = template) then
      update program_modules set week = (m ->> 'week')::int, sort = ms, title = m ->> 'title', body_md = nullif(m ->> 'body', '') where id = mid;
    else
      insert into program_modules (template_id, week, sort, title, body_md)
        values (template, (m ->> 'week')::int, ms, m ->> 'title', nullif(m ->> 'body', '')) returning id into mid;
    end if;
    keep_m := keep_m || mid; ms := ms + 1; asort := 0;
    for a in select value from jsonb_array_elements(coalesce(m -> 'activities', '[]')) loop
      aid := case when a ->> 'id' ~ uuid_re then (a ->> 'id')::uuid end;
      if aid is not null and exists (select 1 from program_activities pa join program_modules pm on pm.id = pa.module_id where pa.id = aid and pm.template_id = template) then
        update program_activities set module_id = mid, kind = (a ->> 'kind')::activity_kind, title = a ->> 'title',
          instructions = nullif(a ->> 'instructions', ''), prescription = coalesce(a -> 'prescription', '{}'), sort = asort where id = aid;
      else
        insert into program_activities (module_id, kind, title, instructions, prescription, sort)
          values (mid, (a ->> 'kind')::activity_kind, a ->> 'title', nullif(a ->> 'instructions', ''), coalesce(a -> 'prescription', '{}'), asort)
          returning id into aid;
      end if;
      keep_a := keep_a || aid; asort := asort + 1;
    end loop;
  end loop;
  delete from program_activities where module_id in (select id from program_modules where template_id = template) and id <> all (keep_a);
  delete from program_modules where template_id = template and id <> all (keep_m);
end $$;

-- Clients read their own program's version even after it is retired (a newer version was published).
drop policy templates_read on program_templates;
create policy templates_read on program_templates for select
  using (auth.uid() is not null and (status = 'published' or is_staff() or can_read_program(id)));

-- Products and cohorts name a program; entitlement and cohort access cover every published version of it.
create or replace function can_read_program(template uuid) returns boolean language sql stable security definer set search_path = public as $$
  select is_staff() or exists (
    select 1 from program_templates t where t.id = template and t.status <> 'draft' and (
      exists (select 1 from client_programs cp where cp.template_id = t.id and cp.client_id = my_client_id())
      or exists (select 1 from entitlements e join products p on p.id = e.product_id join program_templates pt on pt.id = p.program_template_id
                 where e.client_id = my_client_id() and e.status = 'active' and pt.family_id = t.family_id)
      or exists (select 1 from cohort_members m join cohorts c on c.id = m.cohort_id join program_templates ct on ct.id = c.program_template_id
                 where m.client_id = my_client_id() and ct.family_id = t.family_id)))
$$;

create trigger program_templates_audit after insert or update or delete on program_templates for each row execute function audit_row();
