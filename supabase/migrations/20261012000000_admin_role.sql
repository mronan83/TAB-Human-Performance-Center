-- ---------------------------------------------------------------------------
-- Admin role (owner ruling 2026-10-07, proposed D-071: "In app form and admin account"; "Website only"). A staff
-- account for the website alone: website change requests, website stats and, with C31, the content editor. No client
-- records, no Settings, no Team. Like every staff role it counts only in a two-step-verified session
-- (current_app_role(), SEC-015), and only the owner can grant or remove it (guard_profile_update).
--
-- A new enum value can't be used in the transaction that adds it, so the policies that use it live in the next
-- migration (20261013000000_website_requests.sql).
-- ---------------------------------------------------------------------------
alter type app_role add value if not exists 'admin';
