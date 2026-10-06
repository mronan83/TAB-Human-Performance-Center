-- ---------------------------------------------------------------------------
-- First-party website counts (owner ruling 2026-10-06, A4: "Let's build our own"; replaces Plausible, then Vercel Web
-- Analytics). Daily totals only: one row per day, kind and key, and a count. No cookies, no IP address, no visitor or
-- session identifier, no user agent, no query string is ever stored, so no row can describe a person (guardrail 6,
-- NFR-005). My TAB, TAB Practice and /contact are never counted (the API route refuses them).
--
-- kind 'pageview'  key = a public path (normalized, known routes only; anything else counts as '/other')
-- kind 'event'     key = one of the fixed, property-less event names (lib/analytics.ts)
-- kind 'referrer'  key = the hostname of an external site that sent a visitor (no path, no query)
--
-- Only the server writes, through record_site_stat() with the service role. Only the two-step-verified owner reads.
-- ---------------------------------------------------------------------------

create table site_stats (
  day date not null,
  kind text not null check (kind in ('pageview', 'event', 'referrer')),
  key text not null check (char_length(key) between 1 and 120),
  count integer not null default 0 check (count >= 0),
  primary key (day, kind, key)
);

comment on table site_stats is 'Aggregate website counts (A4): daily totals per page, event and referring site; nothing that identifies a visitor.';

alter table site_stats enable row level security;
create policy site_stats_owner_read on site_stats for select using (current_app_role() = 'owner');
-- No insert, update or delete policy: rows change only through record_site_stat().

do $$
declare r text;
begin
  foreach r in array array['anon', 'authenticated'] loop
    if exists (select 1 from pg_roles where rolname = r) then
      execute format('revoke insert, update, delete, truncate on site_stats from %I', r);
    end if;
  end loop;
end $$;

-- Adds one to today's total (the studio's day, America/Detroit). Server only.
create or replace function record_site_stat(p_kind text, p_key text) returns void
language sql security definer set search_path = public as $$
  insert into site_stats (day, kind, key, count)
  values ((now() at time zone 'America/Detroit')::date, p_kind, p_key, 1)
  on conflict (day, kind, key) do update set count = site_stats.count + 1;
$$;

revoke execute on function record_site_stat(text, text) from public;
do $$
declare r text;
begin
  foreach r in array array['anon', 'authenticated'] loop
    if exists (select 1 from pg_roles where rolname = r) then
      execute format('revoke execute on function record_site_stat(text, text) from %I', r);
    end if;
  end loop;
  if exists (select 1 from pg_roles where rolname = 'service_role') then
    execute 'grant execute on function record_site_stat(text, text) to service_role';
  end if;
end $$;
