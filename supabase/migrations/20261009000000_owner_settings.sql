-- ---------------------------------------------------------------------------
-- Owner settings (C23, proposed D-067; owner request 2026-10-06: "an admin portal … that has a toggle to turn the
-- client portal on and off … other settings and configurable feature settings"). One row per setting.
--
-- Settings are public site configuration with no personal data, so anyone may read them (the site reads them on every
-- request, signed in or not). Only the owner, in a two-step-verified session (current_app_role()), may change them;
-- nobody may delete them; every change is stamped and audited.
--
-- Guardrail 4 is not a setting: 'live' only takes effect in a build whose portal data source is Supabase, which is a
-- reviewed code change behind the go-live gate. The database records the owner's intent; the app decides what runs.
-- ---------------------------------------------------------------------------

create table app_settings (
  key text primary key check (key in ('portal_mode', 'transition_banner', 'start_form_open')),
  value jsonb not null,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users (id) on delete set null,
  constraint app_settings_value_shape check (
    case key
      when 'portal_mode' then jsonb_typeof(value) = 'string' and value #>> '{}' in ('off', 'live')
      else jsonb_typeof(value) = 'boolean'
    end)
);

comment on table app_settings is 'Owner-controlled site settings (C23). Public to read; owner-only to change; audited.';

create or replace function stamp_setting() returns trigger language plpgsql security definer set search_path = public as $$
begin
  new.updated_at := now();
  new.updated_by := auth.uid();
  return new;
end $$;

create trigger app_settings_stamp before insert or update on app_settings for each row execute function stamp_setting();
create trigger app_settings_audit after insert or update or delete on app_settings for each row execute function audit_row();

alter table app_settings enable row level security;
create policy app_settings_read on app_settings for select using (true);
create policy app_settings_insert on app_settings for insert with check (current_app_role() = 'owner');
create policy app_settings_update on app_settings for update using (current_app_role() = 'owner') with check (current_app_role() = 'owner');
-- No delete policy: a setting is changed, never removed.

do $$
declare r text;
begin
  foreach r in array array['anon', 'authenticated'] loop
    if exists (select 1 from pg_roles where rolname = r) then
      execute format('revoke truncate, delete on app_settings from %I', r);
    end if;
  end loop;
end $$;

-- Defaults: the client portal stays off; the transition banner shows; the Start form is open.
insert into app_settings (key, value) values
  ('portal_mode', '"off"'),
  ('transition_banner', 'true'),
  ('start_form_open', 'true');
