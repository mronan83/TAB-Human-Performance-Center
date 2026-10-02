-- ---------------------------------------------------------------------------
-- C4 (remainder): what a practitioner needs for the pilot from the client page in TAB Practice: invite the client to
-- My TAB, and assign resources and forms (backlog C4; STAFF-005/006/010, PORTAL-011).
--
-- * Invitations: clients.invited_at / invited_by record the latest invitation. Only the care team can set it (the
--   existing clients_staff_update policy and guard_client_update); the time and the inviter are stamped by the
--   database. The invitation email itself is sent by Supabase Auth from the server after this update succeeds, so
--   row-level security decides who may invite (lib/portal/supabase-repository.ts inviteClient).
-- * Forms: only published form templates can be assigned, and an assignment the client has started or submitted
--   can't be withdrawn (its answers stay linked to it).
-- * Resources: resource_assignments already allows the care team to assign and remove, and the client to mark one
--   viewed (SEC-016); assigned_by is stamped. No change needed.
-- ---------------------------------------------------------------------------

alter table clients
  add column invited_at timestamptz,
  add column invited_by uuid references profiles (id);

create or replace function stamp_client_invite() returns trigger language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then return new; end if; -- service role
  if new.invited_at is distinct from old.invited_at then
    new.invited_at := case when new.invited_at is null then null else now() end;
    new.invited_by := case when new.invited_at is null then null else auth.uid() end;
  else
    new.invited_by := old.invited_by;
  end if;
  return new;
end $$;
create trigger clients_invite_stamp before update on clients for each row execute function stamp_client_invite();

create or replace function guard_form_assignment() returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'DELETE' then
    if exists (select 1 from form_submissions s where s.assignment_id = old.id
               or (s.client_id = old.client_id and s.template_id = old.template_id)) then
      raise exception 'A form the client has started stays assigned';
    end if;
    return old;
  end if;
  if (tg_op = 'INSERT' or new.template_id is distinct from old.template_id)
     and (select status from form_templates where id = new.template_id) is distinct from 'published' then
    raise exception 'Only published forms can be assigned';
  end if;
  if tg_op = 'UPDATE' and new.client_id is distinct from old.client_id then
    raise exception 'A form assignment keeps its client';
  end if;
  return new;
end $$;
create trigger form_assignments_guard before insert or update or delete on form_assignments
  for each row execute function guard_form_assignment();

-- First sign-in. Supabase creates the login when the invitation is sent (and handle_new_user links it to the client),
-- so a linked account doesn't mean the client has used My TAB. The sign-in callback records the first real sign-in.
alter table clients add column activated_at timestamptz;

create or replace function record_my_tab_sign_in() returns void language sql security definer set search_path = public as $$
  update clients set activated_at = now() where profile_id = auth.uid() and activated_at is null
$$;

-- guard_client_update (SEC-016/018) again, now letting record_my_tab_sign_in() stamp the first sign-in: a client may set
-- activated_at once, and only to the transaction's own time, which a direct API update can't produce.
create or replace function guard_client_update() returns trigger language plpgsql security definer set search_path = public as $$
declare
  ignore text[] := array['preferred_name', 'phone', 'updated_at'];
begin
  if auth.uid() is null or current_app_role() = 'owner' then return new; end if;
  if new.profile_id is distinct from old.profile_id or new.stripe_customer_id is distinct from old.stripe_customer_id then
    raise exception 'Only the owner can change account or billing links';
  end if;
  if old.activated_at is null and new.activated_at = now() then ignore := array_append(ignore, 'activated_at'); end if;
  if not is_staff() and (to_jsonb(new) - ignore) is distinct from (to_jsonb(old) - ignore) then
    raise exception 'Clients may only update their own contact details';
  end if;
  return new;
end $$;
