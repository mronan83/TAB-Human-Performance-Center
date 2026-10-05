-- ---------------------------------------------------------------------------
-- Rebrand to TAB Human Performance Center (owner rulings 2026-10-05): the fifth service pillar, Integrated Nutrition
-- (proposed D-065). Additive only: the existing service keys stay as they are, because clients' plans, appointments,
-- programs and notes reference them; the renamed pillars (Functional Strength, Women's Wellness) change only their
-- public names and URLs. Plans already have a `nutrition` plan type (C4a).
-- ---------------------------------------------------------------------------

alter type service_slug add value if not exists 'integrated-nutrition' before 'holistic-life-coaching';
