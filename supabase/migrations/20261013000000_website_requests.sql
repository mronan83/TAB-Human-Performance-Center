-- ---------------------------------------------------------------------------
-- Website change requests in TAB Practice (owner ruling 2026-10-07, proposed D-071; replaces the GitHub issue forms
-- of C30). Owner, practitioners and admins ask for content or design changes and follow each request's status;
-- Claude reads them (service role), replies in the request's notes and moves its status. docs/CONTENT-GUIDE.md
-- describes the workflow.
--
-- Requests describe website copy and design, never a client: the form says so, and no column links to a client
-- record, so these tables sit outside guardrail 4's client-data gate. Rows are never deleted (a request is declined,
-- not removed); every change is audited.
--
-- Access (all through current_app_role(), so only in two-step-verified sessions):
--   read and add requests and notes  owner, admin, practitioner (is_website_staff())
--   change a request's status/links  owner (and Claude through the service role)
--   website counts (site_stats)      owner and admin (was owner only)
-- An admin gets nothing else: can_access_client() and is_staff() stay false for the role, so no client data.
-- ---------------------------------------------------------------------------

create or replace function is_website_staff() returns boolean language sql stable security definer set search_path = public as $$
  select coalesce(current_app_role() in ('owner', 'admin', 'practitioner'), false)
$$;

-- Website counts: the admin role reads them too ("Website stats" in TAB Practice).
drop policy site_stats_owner_read on site_stats;
create policy site_stats_read on site_stats for select using (current_app_role() in ('owner', 'admin'));

create table website_requests (
  id uuid primary key default gen_random_uuid(),
  -- The number people use: "request #12".
  number integer generated always as identity unique,
  lane text not null check (lane in ('content', 'design')),
  pages text[] not null check (cardinality(pages) between 1 and 25),
  kind text not null check (char_length(kind) between 1 and 80),
  title text not null check (char_length(title) between 3 and 120),
  details text not null check (char_length(details) between 1 and 4000),
  reason text check (char_length(reason) <= 2000),
  priority text not null default 'whenever' check (priority in ('whenever', 'soon', 'urgent')),
  deadline date,
  status text not null default 'new'
    check (status in ('new', 'questions', 'waiting_owner', 'in_progress', 'in_review', 'live', 'declined')),
  -- Set by Claude: the preview to check, and the change (pull request) that carries the work.
  preview_url text check (char_length(preview_url) <= 500 and preview_url ~ '^https://\S+$'),
  change_url text check (char_length(change_url) <= 500 and change_url ~ '^https://\S+$'),
  requested_by uuid references auth.users (id) on delete set null,
  requested_by_name text not null default 'TAB',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  closed_at timestamptz
);

comment on table website_requests is 'Website change requests (proposed D-071): content or design, with status. Never about a client; never deleted; audited.';

create table website_request_notes (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references website_requests (id) on delete restrict,
  author_id uuid references auth.users (id) on delete set null,
  -- Notes written through the service role (Claude's questions, options and updates) keep the default.
  author_name text not null default 'Claude',
  body text not null check (char_length(body) between 1 and 4000),
  created_at timestamptz not null default now()
);

create index website_request_notes_request on website_request_notes (request_id, created_at);
comment on table website_request_notes is 'The conversation on a website request: questions, options, answers and updates.';

create or replace function staff_display_name(uid uuid) returns text language sql stable security definer set search_path = public as $$
  select coalesce(nullif(preferred_name, ''), nullif(full_name, ''), split_part(email, '@', 1), 'TAB') from profiles where id = uid
$$;

-- Who asked and when come from the session, not the form; a new request always starts as new, without links.
-- Afterwards only the owner (or the service role) changes it, and never who asked, its number or when.
create or replace function stamp_website_request() returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' then
    new.created_at := now();
    if auth.uid() is not null then
      new.requested_by := auth.uid();
      new.requested_by_name := coalesce(staff_display_name(auth.uid()), 'TAB');
      new.status := 'new'; new.preview_url := null; new.change_url := null; new.closed_at := null;
    end if;
  else
    if auth.uid() is not null and current_app_role() is distinct from 'owner' then
      raise exception 'Only the owner can change a website request';
    end if;
    new.requested_by := old.requested_by; new.requested_by_name := old.requested_by_name; new.created_at := old.created_at;
    if new.status in ('live', 'declined') and old.status not in ('live', 'declined') then new.closed_at := now();
    elsif new.status not in ('live', 'declined') then new.closed_at := null;
    end if;
  end if;
  new.updated_at := now();
  return new;
end $$;

create trigger website_requests_stamp before insert or update on website_requests for each row execute function stamp_website_request();
create trigger website_requests_audit after insert or update or delete on website_requests for each row execute function audit_row();

create or replace function stamp_website_request_note() returns trigger language plpgsql security definer set search_path = public as $$
begin
  new.created_at := now();
  if auth.uid() is not null then
    new.author_id := auth.uid();
    new.author_name := coalesce(staff_display_name(auth.uid()), 'TAB');
  end if;
  return new;
end $$;

create trigger website_request_notes_stamp before insert on website_request_notes for each row execute function stamp_website_request_note();
create trigger website_request_notes_audit after insert or update or delete on website_request_notes for each row execute function audit_row();

create or replace function forbid_note_change() returns trigger language plpgsql as $$
begin
  raise exception 'Website request notes are kept as written';
end $$;
create trigger website_request_notes_keep before update or delete on website_request_notes for each row execute function forbid_note_change();

alter table website_requests enable row level security;
alter table website_request_notes enable row level security;
create policy website_requests_read on website_requests for select using (is_website_staff());
create policy website_requests_insert on website_requests for insert with check (is_website_staff());
create policy website_requests_owner_update on website_requests for update
  using (current_app_role() = 'owner') with check (current_app_role() = 'owner');
create policy website_request_notes_read on website_request_notes for select using (is_website_staff());
create policy website_request_notes_insert on website_request_notes for insert with check (is_website_staff());
-- No delete policies: a request is declined, never removed; notes are kept as written.

do $$
declare r text;
begin
  foreach r in array array['anon', 'authenticated'] loop
    if exists (select 1 from pg_roles where rolname = r) then
      execute format('revoke truncate, delete on website_requests from %I', r);
      execute format('revoke truncate, delete, update on website_request_notes from %I', r);
      execute format('revoke all on website_requests, website_request_notes from %I', 'anon');
    end if;
  end loop;
end $$;
