-- ---------------------------------------------------------------------------
-- C3b: portal security hardening, part 2 (SEC-019, SEC-020, INT-004). Owner rulings 2026-10-03:
--   * Internal session notes and practitioner-only plan details move to a `private` schema that the Data API
--     doesn't expose and signed-in roles can't use. Staff reach them only through the functions below, which check
--     the care team and write an audit row for every read as well as every change.
--   * The audit log is append-only. A read-only `audit_reader` role lets the nightly GitHub export
--     (.github/workflows/audit-export.yml) copy it off Supabase; the role gets a login password only at go-live.
--   * Stripe events apply in one transaction (apply_stripe_event): a failure rolls everything back, including the
--     "already handled" marker, so Stripe retries. Unpaid checkouts wait for payment, past-due subscriptions pause
--     access, full refunds end it, and partial refunds keep access but flag the purchase for the owner to decide.
-- ---------------------------------------------------------------------------

create schema private;
revoke all on schema private from public;
do $$
declare r text;
begin
  foreach r in array array['anon', 'authenticated'] loop
    if exists (select 1 from pg_roles where rolname = r) then
      execute format('revoke all on schema private from %I', r);
      execute format('alter default privileges in schema private revoke all on tables from %I', r);
    end if;
  end loop;
end $$;

-- ---- Internal session notes -------------------------------------------------------------------------------------------
create table private.internal_notes (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients (id) on delete cascade,
  practitioner_id uuid not null references public.practitioners (id),
  service service_slug,
  session_date date not null default current_date,
  appointment_ref text,
  body text not null check (char_length(body) between 1 and 8000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index internal_notes_client on private.internal_notes (client_id, session_date desc);
-- No policies: only the functions below (running as the table owner) reach it. RLS on is a second lock.
alter table private.internal_notes enable row level security;
create trigger internal_notes_audit after insert or update or delete on private.internal_notes for each row execute function public.audit_row();
create trigger internal_notes_updated_at before update on private.internal_notes for each row execute function public.set_updated_at();
create trigger internal_notes_author before insert or update on private.internal_notes for each row execute function public.stamp_author('practitioner_id');

insert into private.internal_notes (id, client_id, practitioner_id, service, session_date, appointment_ref, body, created_at, updated_at)
  select id, client_id, practitioner_id, service, session_date, appointment_ref, body, created_at, updated_at
  from session_notes where visibility = 'internal';
delete from session_notes where visibility = 'internal';
alter table session_notes alter column visibility set default 'shared';
alter table session_notes add constraint session_notes_shared_only check (visibility = 'shared');

-- ---- Practitioner-only plan details: the table moves whole, with its guards ----------------------------------------------
alter table plan_private_details set schema private;
drop policy if exists plan_private_staff on private.plan_private_details;

-- ---- Functions: the only way in for staff ------------------------------------------------------------------------------
create or replace function private.require_care_team(p_client uuid) returns void language plpgsql stable security definer set search_path = public as $$
begin
  if not (is_staff() and can_access_client(p_client)) then
    raise exception 'Only the client''s care team can use internal notes';
  end if;
end $$;

create or replace function internal_notes(p_client uuid)
returns table (id uuid, practitioner_id uuid, author text, service service_slug, session_date date, body text, created_at timestamptz)
language plpgsql security definer set search_path = public, private as $$
begin
  perform private.require_care_team(p_client);
  insert into audit_events (actor_id, action, table_name, client_id) values (auth.uid(), 'read', 'internal_notes', p_client);
  return query
    select n.id, n.practitioner_id, p.display_name, n.service, n.session_date, n.body, n.created_at
    from private.internal_notes n left join practitioners p on p.id = n.practitioner_id
    where n.client_id = p_client order by n.session_date desc, n.created_at desc;
end $$;

create or replace function add_internal_note(p_client uuid, p_body text, p_service service_slug default null, p_session_date date default current_date)
returns uuid language plpgsql security definer set search_path = public, private as $$
declare new_id uuid;
begin
  perform private.require_care_team(p_client);
  insert into private.internal_notes (client_id, practitioner_id, service, session_date, body)
    values (p_client, auth.uid(), p_service, coalesce(p_session_date, current_date), p_body) returning id into new_id;
  return new_id;
end $$;

create or replace function plan_private_details(p_client uuid)
returns table (plan_id uuid, details jsonb)
language plpgsql security definer set search_path = public, private as $$
begin
  perform private.require_care_team(p_client);
  insert into audit_events (actor_id, action, table_name, client_id) values (auth.uid(), 'read', 'plan_private_details', p_client);
  return query select d.plan_id, d.details from private.plan_private_details d where d.client_id = p_client;
end $$;

create or replace function save_plan_private_details(p_plan uuid, p_client uuid, p_details jsonb)
returns void language plpgsql security definer set search_path = public, private as $$
begin
  perform private.require_care_team(p_client);
  insert into private.plan_private_details (plan_id, client_id, details) values (p_plan, p_client, coalesce(p_details, '{}'))
    on conflict (plan_id) do update set details = excluded.details;
end $$;

-- Signed-in staff call these; nobody else can (the function checks the care team again).
do $$
declare f text;
begin
  foreach f in array array['internal_notes(uuid)', 'add_internal_note(uuid, text, service_slug, date)', 'plan_private_details(uuid)', 'save_plan_private_details(uuid, uuid, jsonb)', 'private.require_care_team(uuid)'] loop
    execute format('revoke all on function %s from public', f);
    if exists (select 1 from pg_roles where rolname = 'anon') then execute format('revoke all on function %s from anon', f); end if;
    if exists (select 1 from pg_roles where rolname = 'authenticated') then execute format('grant execute on function %s to authenticated', f); end if;
  end loop;
end $$;

-- ---- Audit log: append-only, and readable by the export role -----------------------------------------------------------
create or replace function forbid_audit_change() returns trigger language plpgsql as $$
begin
  raise exception 'The audit log is append-only';
end $$;
create trigger audit_events_append_only before update or delete on audit_events for each row execute function forbid_audit_change();
create trigger audit_events_no_truncate before truncate on audit_events for each statement execute function forbid_audit_change();

do $$
begin
  if not exists (select 1 from pg_roles where rolname = 'audit_reader') then
    create role audit_reader nologin; -- login and password are set at go-live (backlog A26), never in a migration
  end if;
end $$;
grant usage on schema public to audit_reader;
grant select on audit_events to audit_reader;

-- ---- Stripe: one transaction per event ---------------------------------------------------------------------------------
alter type entitlement_status add value if not exists 'pending';
alter type entitlement_status add value if not exists 'past_due';
alter table entitlements
  add column refunded_cents integer,
  add column needs_review boolean not null default false,
  add column reviewed_by uuid references profiles (id),
  add column reviewed_at timestamptz;

create or replace function grant_stripe_purchase(p_session jsonb) returns void language plpgsql security definer set search_path = public as $$
declare
  client uuid := (p_session #>> '{metadata,client_id}')::uuid;
  product uuid := (p_session #>> '{metadata,product_id}')::uuid;
  template uuid;
begin
  if client is null or product is null then
    raise exception 'Stripe checkout % has no client_id or product_id in its metadata', p_session ->> 'id';
  end if;
  if p_session ->> 'customer' is not null then
    update clients set stripe_customer_id = p_session ->> 'customer' where id = client and stripe_customer_id is null;
  end if;
  insert into entitlements (client_id, product_id, source, stripe_checkout_session_id, stripe_subscription_id, status)
    values (client, product, 'stripe', p_session ->> 'id', p_session ->> 'subscription', 'active')
    on conflict (stripe_checkout_session_id) do update set status = 'active', ends_at = null;
  select program_template_id into template from products where id = product;
  if template is not null and not exists (select 1 from client_programs where client_id = client and template_id = template and status <> 'completed') then
    insert into client_programs (client_id, template_id, source) values (client, template, 'purchased');
  end if;
end $$;

/**
 * Applies one Stripe event. p_session_id is the checkout session a refunded charge belongs to (the route looks it up,
 * since a charge doesn't carry it). Returns 'applied', 'duplicate' or 'ignored'; raises on anything it can't apply.
 */
create or replace function apply_stripe_event(p_id text, p_type text, p_object jsonb, p_session_id text default null)
returns text language plpgsql security definer set search_path = public as $$
declare
  st text;
  refunded int;
  amount int;
begin
  insert into stripe_events (id, type) values (p_id, p_type) on conflict (id) do nothing;
  if not found then return 'duplicate'; end if;

  if p_type in ('checkout.session.completed', 'checkout.session.async_payment_succeeded') then
    if p_object ->> 'payment_status' in ('paid', 'no_payment_required') then
      perform grant_stripe_purchase(p_object);
    elsif p_type = 'checkout.session.completed' then
      if (p_object #>> '{metadata,client_id}') is null or (p_object #>> '{metadata,product_id}') is null then
        raise exception 'Stripe checkout % has no client_id or product_id in its metadata', p_object ->> 'id';
      end if;
      insert into entitlements (client_id, product_id, source, stripe_checkout_session_id, status)
        values ((p_object #>> '{metadata,client_id}')::uuid, (p_object #>> '{metadata,product_id}')::uuid, 'stripe', p_object ->> 'id', 'pending')
        on conflict (stripe_checkout_session_id) do nothing;
    else
      raise exception 'Stripe reported payment succeeded for checkout % but it is %', p_object ->> 'id', p_object ->> 'payment_status';
    end if;
  elsif p_type = 'checkout.session.async_payment_failed' then
    update entitlements set status = 'cancelled', ends_at = now() where stripe_checkout_session_id = p_object ->> 'id';
  elsif p_type in ('customer.subscription.updated', 'customer.subscription.deleted') then
    st := case when p_type = 'customer.subscription.deleted' then 'canceled' else p_object ->> 'status' end;
    update entitlements set
      status = case when st in ('active', 'trialing') then 'active'
                    when st in ('past_due', 'unpaid', 'incomplete') then 'past_due'
                    else 'cancelled' end::entitlement_status,
      ends_at = case when st in ('canceled', 'incomplete_expired') then now() else null end
    where stripe_subscription_id = p_object ->> 'id';
  elsif p_type = 'charge.refunded' then
    if p_session_id is null then
      raise exception 'Refunded charge % has no checkout session', p_object ->> 'id';
    end if;
    refunded := (p_object ->> 'amount_refunded')::int;
    amount := (p_object ->> 'amount')::int;
    if refunded >= amount then
      update entitlements set status = 'refunded', ends_at = now(), refunded_cents = refunded, needs_review = false
        where stripe_checkout_session_id = p_session_id;
    else
      -- Owner ruling 2026-10-03: a partial refund keeps access and asks the owner to decide.
      update entitlements set refunded_cents = refunded, needs_review = true where stripe_checkout_session_id = p_session_id;
    end if;
    if not found then raise exception 'No purchase found for checkout session %', p_session_id; end if;
  else
    return 'ignored';
  end if;
  return 'applied';
end $$;

-- The owner's decision on a flagged purchase: end access, or keep it.
create or replace function resolve_purchase_review(p_entitlement uuid, p_end_access boolean) returns void language plpgsql security definer set search_path = public as $$
begin
  if current_app_role() is distinct from 'owner' then raise exception 'Only the owner can decide on a refunded purchase'; end if;
  update entitlements set needs_review = false, reviewed_by = auth.uid(), reviewed_at = now(),
    status = case when p_end_access then 'refunded'::entitlement_status else status end,
    ends_at = case when p_end_access then now() else ends_at end
  where id = p_entitlement and needs_review;
  if not found then raise exception 'That purchase is not waiting for a decision'; end if;
end $$;

do $$
declare f text;
begin
  foreach f in array array['apply_stripe_event(text, text, jsonb, text)', 'grant_stripe_purchase(jsonb)', 'resolve_purchase_review(uuid, boolean)'] loop
    execute format('revoke all on function %s from public', f);
    if exists (select 1 from pg_roles where rolname = 'anon') then execute format('revoke all on function %s from anon', f); end if;
  end loop;
  if exists (select 1 from pg_roles where rolname = 'authenticated') then
    grant execute on function resolve_purchase_review(uuid, boolean) to authenticated;
  end if;
  if exists (select 1 from pg_roles where rolname = 'service_role') then
    grant execute on function apply_stripe_event(text, text, jsonb, text) to service_role;
  end if;
end $$;
