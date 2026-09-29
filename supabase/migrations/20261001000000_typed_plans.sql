-- ---------------------------------------------------------------------------
-- C4b: typed plans (docs/design/plans-programs-stages.md §2, G1 approved 2026-09-29).
--
-- One Wellness Plan per client is the anchor; service plans (strength, massage & bodywork, women's wellness, life
-- coaching, nutrition) sit under it. Type sections live in `details` (shared with the client when the plan is
-- visible) and in plan_private_details (practitioner-only, never readable by the client). The plan log
-- (plan_entries) records dated entries, each shared or internal, like session notes (PORTAL-011).
-- Nutrition plans are nutrition coaching within an IIN health-coach scope and only practitioners with the
-- `nutrition` capability may create or change them or their entries (owner ruling 2026-09-29).
-- ---------------------------------------------------------------------------

create type plan_type as enum (
  'wellness', 'personal-strength-training', 'massage-bodywork', 'womens-wellness-coaching', 'holistic-life-coaching', 'nutrition'
);

alter table wellness_plans
  add column plan_type plan_type not null default 'wellness',
  add column parent_plan_id uuid references wellness_plans (id) on delete set null,
  add column practitioner_id uuid references practitioners (id),
  add column details jsonb not null default '{}';
create unique index wellness_plans_one_active_anchor on wellness_plans (client_id) where plan_type = 'wellness' and status = 'active';
create index wellness_plans_parent on wellness_plans (parent_plan_id);

-- Credentials that unlock gated plan types. Set by the owner (practitioners_owner policy).
alter table practitioners add column capabilities text[] not null default '{}';

create or replace function has_capability(cap text) returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from practitioners where id = auth.uid() and active and cap = any (capabilities))
$$;

-- Service plans sit under the same client's Wellness Plan; the anchor has no parent.
create trigger wellness_plans_same_client before insert or update on wellness_plans
  for each row execute function guard_same_client('parent_plan_id', 'wellness_plans');
create or replace function guard_plan_shape() returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.plan_type = 'wellness' and new.parent_plan_id is not null then
    raise exception 'A Wellness Plan is the anchor and has no parent plan';
  end if;
  if new.parent_plan_id is not null and not exists (select 1 from wellness_plans where id = new.parent_plan_id and plan_type = 'wellness') then
    raise exception 'A service plan must sit under a Wellness Plan';
  end if;
  -- The owning practitioner defaults to the author when a practitioner writes it.
  if new.practitioner_id is null and exists (select 1 from practitioners where id = auth.uid()) then
    new.practitioner_id := auth.uid();
  end if;
  return new;
end $$;
create trigger wellness_plans_shape before insert or update on wellness_plans for each row execute function guard_plan_shape();

-- Nutrition gate: on the plan itself and on anything attached to a nutrition plan.
create or replace function guard_nutrition_plan() returns trigger language plpgsql security definer set search_path = public as $$
declare
  touches_nutrition boolean;
begin
  if auth.uid() is null then return coalesce(new, old); end if; -- service role (server-side jobs)
  if tg_table_name = 'wellness_plans' then
    touches_nutrition := (tg_op <> 'DELETE' and new.plan_type = 'nutrition') or (tg_op <> 'INSERT' and old.plan_type = 'nutrition');
  else
    touches_nutrition := exists (
      select 1 from wellness_plans p
      where p.plan_type = 'nutrition'
        and p.id in (case when tg_op <> 'DELETE' then new.plan_id end, case when tg_op <> 'INSERT' then old.plan_id end));
  end if;
  if touches_nutrition and not has_capability('nutrition') then
    raise exception 'Nutrition plans need the nutrition coaching credential';
  end if;
  return coalesce(new, old);
end $$;
create trigger wellness_plans_nutrition before insert or update or delete on wellness_plans for each row execute function guard_nutrition_plan();

-- Practitioner-only sections (e.g. movement notes, contraindication notes). Staff on the care team only.
create table plan_private_details (
  plan_id uuid primary key references wellness_plans (id) on delete cascade,
  client_id uuid not null references clients (id) on delete cascade,
  details jsonb not null default '{}',
  updated_by uuid references profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- The plan log.
create table plan_entries (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid not null references wellness_plans (id) on delete cascade,
  client_id uuid not null references clients (id) on delete cascade,
  entry_date date not null default current_date,
  body text not null check (char_length(body) between 1 and 4000),
  visibility note_visibility not null default 'internal',
  practitioner_id uuid references profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index plan_entries_plan on plan_entries (plan_id, entry_date desc);

alter table plan_private_details enable row level security;
alter table plan_entries enable row level security;
create policy plan_private_staff on plan_private_details for all
  using (is_staff() and can_access_client(client_id)) with check (is_staff() and can_access_client(client_id));
-- A client reads a shared entry only when its plan is visible to them.
create policy plan_entries_read on plan_entries for select using (
  can_access_client(client_id) and (is_staff() or (visibility = 'shared'
    and exists (select 1 from wellness_plans p where p.id = plan_id and p.visible_to_client))));
create policy plan_entries_staff on plan_entries for all
  using (is_staff() and can_access_client(client_id)) with check (is_staff() and can_access_client(client_id));

do $$
declare t text;
begin
  foreach t in array array['plan_private_details', 'plan_entries'] loop
    execute format('create trigger %I_same_client before insert or update on %I for each row execute function guard_same_client(%L, %L)', t, t, 'plan_id', 'wellness_plans');
    execute format('create trigger %I_nutrition before insert or update or delete on %I for each row execute function guard_nutrition_plan()', t, t);
    execute format('create trigger %I_updated_at before update on %I for each row execute function set_updated_at()', t, t);
    execute format('create trigger %I_audit after insert or update or delete on %I for each row execute function audit_row()', t, t);
  end loop;
end $$;
create trigger plan_private_details_author before insert or update on plan_private_details for each row execute function stamp_author('updated_by', 'always');
create trigger plan_entries_author before insert or update on plan_entries for each row execute function stamp_author('practitioner_id');
