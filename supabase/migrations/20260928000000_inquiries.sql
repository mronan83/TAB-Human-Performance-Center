-- Start Where You Are and contact submissions (owner rulings 2026-09-28, DIV-05; proposed D-058, which supersedes
-- D-054 once storage is switched on). The whole form is kept, indefinitely: no role may delete a submission, and
-- the answers are immutable once submitted. The website's server inserts with the service role; the owner reviews,
-- records the routing outcome (S14 §14.4.1, GS-004/005) and links the submission to a client record, which links to
-- the person's My TAB account by confirmed email (SEC-014).
--
-- Start answers are all predefined options (owner rulings 2026-09-28, proposed D-059); the only free text stored
-- is the contact form's message, which the Start form can never carry (checked below). Storage is written only while the portal runs on Supabase
-- (config/site.ts `forms.storeSubmissions`), i.e. after the D-042 infrastructure and the Phase 2 security gate.

create type inquiry_kind as enum ('start', 'contact');
create type routing_outcome as enum ('book', 'discovery', 'intake', 'more_info', 'referral');

create table inquiries (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique,          -- shown in email subjects; carries no personal details (D-054)
  kind inquiry_kind not null,
  name text not null check (char_length(name) <= 80),
  email text not null check (char_length(email) <= 200),
  phone text check (char_length(phone) <= 25),
  contact_preference text,
  -- Start Where You Are: option values from lib/inquiry.ts
  journey text,
  help text[] not null default '{}',
  service_interest text,
  outcomes text[] not null default '{}',
  considerations text[] not null default '{}',  -- may include the 'health-private' flag; never details
  delivery text,
  availability text[] not null default '{}',
  found_via text,
  -- Contact form
  topic text,
  message text check (char_length(message) <= 3000),  -- SENSITIVE: contact message (asks for no medical details)
  consent_contact_at timestamptz not null,
  marketing_opt_in boolean not null default false,
  -- Owner workflow
  client_id uuid references clients (id) on delete set null,
  routing_outcome routing_outcome,
  routing_note text,                       -- internal; never shown to the client
  routed_by uuid references profiles (id),
  routed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table inquiries add constraint inquiries_start_has_no_free_text check (kind = 'contact' or message is null);
create index on inquiries (lower(email));
create index on inquiries (client_id);
create index on inquiries (created_at desc);

-- Only the owner workflow columns can change; routing is stamped with who and when.
create or replace function guard_inquiry_update() returns trigger language plpgsql security definer set search_path = public as $$
declare
  mutable constant text[] := array['client_id', 'routing_outcome', 'routing_note', 'routed_by', 'routed_at', 'updated_at'];
begin
  if (to_jsonb(new) - mutable) is distinct from (to_jsonb(old) - mutable) then
    raise exception 'Submitted answers cannot be changed';
  end if;
  if new.routing_outcome is distinct from old.routing_outcome then
    new.routed_by := auth.uid();
    new.routed_at := case when new.routing_outcome is null then null else now() end;
  else
    new.routed_by := old.routed_by;
    new.routed_at := old.routed_at;
  end if;
  return new;
end $$;
create trigger inquiries_guard before update on inquiries for each row execute function guard_inquiry_update();

create or replace function forbid_inquiry_delete() returns trigger language plpgsql as $$
begin
  raise exception 'Submissions are kept indefinitely and cannot be deleted';
end $$;
create trigger inquiries_no_delete before delete on inquiries for each row execute function forbid_inquiry_delete();

create trigger inquiries_updated_at before update on inquiries for each row execute function set_updated_at();
create trigger inquiries_audit after insert or update or delete on inquiries for each row execute function audit_row();

alter table inquiries enable row level security;
-- Owner: reads every submission and records routing and client links. There is no insert policy (the website's
-- server writes with the service role) and no delete policy (kept indefinitely).
create policy inquiries_owner_read on inquiries for select using (current_app_role() = 'owner');
create policy inquiries_owner_update on inquiries for update
  using (current_app_role() = 'owner') with check (current_app_role() = 'owner');
-- Practitioners: only once the submission is linked to a client assigned to them (D-045).
create policy inquiries_practitioner_read on inquiries for select
  using (current_app_role() = 'practitioner' and client_id is not null and can_access_client(client_id));

-- ---------------------------------------------------------------------------
-- SEC-014: link a client record to a My TAB account only once the person has confirmed they own the email.
-- Previously the link was made when the auth user was created, before confirmation.
-- ---------------------------------------------------------------------------
create or replace function handle_new_user() returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into profiles (id, email, full_name) values (new.id, new.email, new.raw_user_meta_data ->> 'full_name');
  if new.email_confirmed_at is not null then
    update clients set profile_id = new.id where profile_id is null and lower(email) = lower(new.email);
  end if;
  return new;
end $$;

create or replace function handle_user_confirmed() returns trigger language plpgsql security definer set search_path = public as $$
begin
  update clients set profile_id = new.id where profile_id is null and lower(email) = lower(new.email);
  return new;
end $$;
create trigger on_auth_user_confirmed after update of email_confirmed_at on auth.users
  for each row when (old.email_confirmed_at is null and new.email_confirmed_at is not null)
  execute function handle_user_confirmed();
