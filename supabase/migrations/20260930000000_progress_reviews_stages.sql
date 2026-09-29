-- ---------------------------------------------------------------------------
-- C4a: Progress Reviews and TAB Method stage changes (docs/design/plans-programs-stages.md §5, G1 approved 2026-09-29).
--
-- A stage change is the practitioner's decision, made with the client and recorded in a Progress Review
-- (Step 14 §14.4.5). record_progress_review() saves the review and, when the stage changes, updates the client in
-- the same transaction. Every change to clients.method_stage, however it is made, lands in stage_changes via a
-- trigger, so the history can't be skipped or edited from the app.
-- ---------------------------------------------------------------------------

create type review_outcome as enum ('continue', 'adjust', 'increase_support', 'reduce_frequency', 'maintenance');

-- Step 14.4.5 answers (what changed, what remains difficult, what was learned, circumstances) and the fit decision.
alter table progress_reviews
  add column outcome review_outcome,
  add column reflections jsonb not null default '{}';

create table stage_changes (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients (id) on delete cascade,
  from_stage method_stage,
  to_stage method_stage not null,
  review_id uuid references progress_reviews (id) on delete set null,
  changed_by uuid references profiles (id),
  created_at timestamptz not null default now()
);
create index stage_changes_client on stage_changes (client_id, created_at desc);

alter table stage_changes enable row level security;
-- Readable by the client and their care team. No write policies: rows come only from the trigger below.
create policy stage_changes_read on stage_changes for select using (can_access_client(client_id));
revoke insert, update, delete, truncate on stage_changes from authenticated, anon;
create trigger stage_changes_audit after insert or update or delete on stage_changes for each row execute function audit_row();

create or replace function record_stage_change() returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.method_stage is distinct from old.method_stage then
    insert into stage_changes (client_id, from_stage, to_stage, review_id, changed_by)
    values (new.id, old.method_stage, new.method_stage, nullif(current_setting('tab.review_id', true), '')::uuid, auth.uid());
  end if;
  return null;
end $$;
create trigger clients_stage_history after update of method_stage on clients for each row execute function record_stage_change();

-- Runs as the caller (security invoker), so row-level security decides: only staff on the client's care team can
-- write a review (reviews_staff) or change the stage (clients_staff_update, guard_client_update).
-- Returns true when the stage changed, so the app knows to email the client.
create or replace function record_progress_review(
  p_client uuid, p_outcome review_outcome, p_reflections jsonb, p_summary text, p_next_steps text, p_shared boolean,
  p_stage method_stage default null
) returns boolean language plpgsql security invoker set search_path = public as $$
declare
  v_current method_stage;
  v_review uuid;
begin
  select method_stage into v_current from clients where id = p_client;
  insert into progress_reviews (client_id, plan_id, review_date, summary_for_client, next_steps, method_stage, shared, outcome, reflections)
  values (p_client,
          (select id from wellness_plans where client_id = p_client and status = 'active' order by created_at desc limit 1),
          current_date, p_summary, p_next_steps, coalesce(p_stage, v_current), coalesce(p_shared, false), p_outcome,
          coalesce(p_reflections, '{}'))
  returning id into v_review;
  if p_stage is null or p_stage = v_current then
    return false;
  end if;
  perform set_config('tab.review_id', v_review::text, true);
  update clients set method_stage = p_stage where id = p_client;
  if not found then
    raise exception 'row-level security: this client is not on your care team';
  end if;
  perform set_config('tab.review_id', '', true);
  return true;
end $$;
