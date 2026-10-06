-- ---------------------------------------------------------------------------
-- Owner settings, part 2 (C23b, proposed D-067): a booking link per service and switches for optional site pages.
--
-- booking_<service>: a Timely link for that service's Book buttons; JSON null means "use the main booking page".
--   Links must be https and at most 500 characters (no spaces), so a typo can't produce a javascript: or http link.
-- feature_resources, feature_team: show or hide those pages and their menu entries.
-- feature_events: stored for later; the Settings page keeps it locked until there's events content to show (the page
--   is an empty shell today, and a switch shouldn't publish a blank page).
-- Testimonials are deliberately not a setting: they stay off in code until real, consented testimonials exist
-- (CLAUDE.md guardrail 10).
--
-- Same rules as part 1: anyone reads; only the two-step-verified owner changes; nothing is deleted; all audited.
-- ---------------------------------------------------------------------------

alter table app_settings drop constraint app_settings_key_check;
alter table app_settings add constraint app_settings_key_check check (key in (
  'portal_mode', 'transition_banner', 'start_form_open',
  'booking_massage-bodywork', 'booking_personal-strength-training', 'booking_womens-wellness-coaching',
  'booking_integrated-nutrition', 'booking_holistic-life-coaching',
  'feature_resources', 'feature_team', 'feature_events'));

alter table app_settings drop constraint app_settings_value_shape;
alter table app_settings add constraint app_settings_value_shape check (
  case
    when key = 'portal_mode' then jsonb_typeof(value) = 'string' and value #>> '{}' in ('off', 'live')
    when key like 'booking\_%' then jsonb_typeof(value) = 'null'
      or (jsonb_typeof(value) = 'string' and length(value #>> '{}') <= 500 and value #>> '{}' ~ '^https://[^[:space:]]+$')
    else jsonb_typeof(value) = 'boolean'
  end);

-- Defaults match today's site: every Book button uses the main booking page; Resources and Our Team are shown.
insert into app_settings (key, value) values
  ('booking_massage-bodywork', 'null'),
  ('booking_personal-strength-training', 'null'),
  ('booking_womens-wellness-coaching', 'null'),
  ('booking_integrated-nutrition', 'null'),
  ('booking_holistic-life-coaching', 'null'),
  ('feature_resources', 'true'),
  ('feature_team', 'true'),
  ('feature_events', 'false')
on conflict (key) do nothing;
