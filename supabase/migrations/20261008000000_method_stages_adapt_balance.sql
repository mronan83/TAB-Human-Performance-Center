-- ---------------------------------------------------------------------------
-- Rebrand to TAB Human Performance Center (owner ruling 2026-10-05: "This needs to be Transform, Adapt, Balance"):
-- the TAB Method stages become Start Where You Are, Transform, Adapt, Balance, Evolve (proposed D-064). Renaming the
-- enum values keeps every client's stage and stage history; no client data exists on a real database yet.
-- ---------------------------------------------------------------------------

alter type method_stage rename value 'align' to 'adapt';
alter type method_stage rename value 'become' to 'balance';
