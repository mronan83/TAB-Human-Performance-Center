-- Reference data for My TAB. Safe to run in any environment (no client data).

-- Metrics clients can track (D-019 via D-042). `sensitive` metrics are health data.
insert into metric_definitions (key, label, unit, category, sensitive, higher_is_better, scale_min, scale_max) values
  ('strength_sessions', 'Strength sessions', 'per week', 'habit', false, true, 0, 7),
  ('movement_minutes', 'Movement', 'minutes per week', 'habit', false, true, null, null),
  ('sleep_hours', 'Sleep', 'hours per night (avg)', 'wellbeing', false, true, 0, 12),
  ('energy', 'Energy', '1–5', 'wellbeing', false, true, 1, 5),
  ('stress', 'Stress', '1–5', 'wellbeing', false, false, 1, 5),
  ('comfort', 'Physical comfort', '1–5', 'physical', false, true, 1, 5),
  ('confidence', 'Confidence', '1–5', 'wellbeing', false, true, 1, 5),
  ('body_weight', 'Body weight', 'lb', 'health', true, null, null, null),
  ('resting_hr', 'Resting heart rate', 'bpm', 'health', true, false, null, null)
on conflict (key) do nothing;

-- General intake (non-clinical). A clinical health history form is added only after D-042 infrastructure is live.
insert into form_templates (slug, version, title, description, sensitivity, status, schema) values
('welcome-intake', 1, 'Welcome to TAB', 'Tell us about your goals, routines, and preferences.', 'general', 'published', '{
  "sections": [
    {"title": "What brings you to TAB", "fields": [
      {"id": "goals", "type": "textarea", "label": "What would you like to change, or be able to do?", "required": true},
      {"id": "why_now", "type": "textarea", "label": "Why is this important to you now?"}
    ]},
    {"title": "Your life right now", "fields": [
      {"id": "routine", "type": "textarea", "label": "Describe a typical week (work, family, movement, rest)."},
      {"id": "stress", "type": "scale", "label": "How would you rate your stress lately?", "min": 1, "max": 5, "minLabel": "Low", "maxLabel": "High"}
    ]},
    {"title": "Preferences", "fields": [
      {"id": "delivery", "type": "choice", "label": "How would you like to work with us?", "options": ["In person", "Virtual", "Either"]},
      {"id": "communication", "type": "multi", "label": "How should we reach you between sessions?", "options": ["Email", "Text", "Phone"]}
    ]}
  ]}'::jsonb),
('health-history', 1, 'Health history', 'Confidential health information for safe, appropriate care.', 'sensitive', 'draft', '{
  "sections": [
    {"title": "Health history", "fields": [
      {"id": "conditions", "type": "textarea", "label": "Current or past health conditions relevant to your care"},
      {"id": "surgeries", "type": "textarea", "label": "Recent surgeries or injuries (include dates)"},
      {"id": "medications", "type": "textarea", "label": "Medications that may affect exercise or massage"},
      {"id": "clearance", "type": "choice", "label": "Do you have medical clearance for activity?", "options": ["Yes", "No", "Not sure", "Not applicable"]}
    ]}
  ]}'::jsonb)
on conflict (slug, version) do nothing;

-- Products: inactive until program architecture (D-010, D-044) and Stripe prices exist. Prices from D-011 baseline.
insert into products (slug, title, kind, service, price_cents, active) values
  ('midlife-strength-self-paced', 'Midlife strength and energy (self-paced)', 'program', 'womens-wellness-coaching', 14700, false),
  ('midlife-cohort-pilot', 'Midlife pilot cohort (8 weeks)', 'cohort', 'womens-wellness-coaching', 39700, false),
  ('strength-foundations-self-paced', 'Strength foundations (self-paced)', 'program', 'personal-strength-training', 9700, false),
  ('tab-membership', 'TAB membership', 'membership', null, 4900, false)
on conflict (slug) do nothing;
