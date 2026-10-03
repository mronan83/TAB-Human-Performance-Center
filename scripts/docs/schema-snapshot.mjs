#!/usr/bin/env node
/**
 * Builds the schema the migrations produce and writes it to docs/schema.json, which the data model page is drawn from.
 * Applies every migration in supabase/migrations in order to an in-process Postgres (PGlite), with the same stub
 * auth/storage schemas the RLS tests use, then reads the catalog: tables, columns, keys, checks, indexes, row-level
 * security policies, triggers, functions and enums.
 *
 *   npm run docs:schema            rewrite docs/schema.json
 *   npm run docs:schema -- --check fail if docs/schema.json differs from what the migrations build (CI)
 */
import { PGlite } from "@electric-sql/pglite";
import fs from "node:fs";
import path from "node:path";

const root = new URL("../../", import.meta.url).pathname;
const migDir = path.join(root, "supabase/migrations");
const out = path.join(root, "docs/schema.json");
const check = process.argv.includes("--check");

// Same stub as supabase/tests/rls.test.mjs: what the migrations expect Supabase to provide.
const stub = `
create schema auth; create schema storage;
create table auth.users (id uuid primary key, email text, email_confirmed_at timestamptz, raw_user_meta_data jsonb default '{}');
create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('test.uid', true),'')::uuid $$;
create function auth.jwt() returns jsonb language sql stable as $$ select coalesce(nullif(current_setting('test.jwt', true),''), '{}')::jsonb $$;
create table storage.buckets (id text primary key, name text, public boolean);
create table storage.objects (id uuid primary key default gen_random_uuid(), bucket_id text, name text);
alter table storage.objects enable row level security;
create function storage.foldername(name text) returns text[] language sql as $$ select string_to_array(name,'/') $$;
create role authenticated; create role anon;
grant usage on schema public, auth to authenticated, anon;
`;

const db = new PGlite();
await db.exec(stub);
const migrations = fs.readdirSync(migDir).filter((f) => f.endsWith(".sql")).sort();
for (const f of migrations) await db.exec(fs.readFileSync(path.join(migDir, f), "utf8"));

const q = async (sql) => (await db.query(sql)).rows;
const tables = await q(`
  select c.relname as name, c.relrowsecurity as rls, c.relforcerowsecurity as force_rls, obj_description(c.oid) as comment
  from pg_class c join pg_namespace n on n.oid = c.relnamespace
  where n.nspname = 'public' and c.relkind = 'r' order by c.relname`);
const columns = await q(`
  select c.table_name as table, c.column_name as name, c.ordinal_position as pos,
         case when c.data_type = 'USER-DEFINED' then c.udt_name when c.data_type = 'ARRAY' then substr(c.udt_name, 2) || '[]' else c.data_type end as type,
         c.is_nullable = 'YES' as nullable, c.column_default as default, col_description(format('public.%I', c.table_name)::regclass, c.ordinal_position) as comment
  from information_schema.columns c join pg_class k on k.relname = c.table_name and k.relkind = 'r'
  join pg_namespace n on n.oid = k.relnamespace and n.nspname = 'public'
  where c.table_schema = 'public' order by c.table_name, c.ordinal_position`);
const constraints = await q(`
  select t.relname as table, con.conname as name, con.contype as kind, pg_get_constraintdef(con.oid) as def,
         ft.relname as ref_table
  from pg_constraint con join pg_class t on t.oid = con.conrelid join pg_namespace n on n.oid = t.relnamespace
  left join pg_class ft on ft.oid = con.confrelid
  where n.nspname = 'public' and con.contype <> 'n' order by t.relname, con.contype, con.conname`);
const indexes = await q(`
  select tablename as table, indexname as name, indexdef as def from pg_indexes i
  where schemaname = 'public' and not exists (select 1 from pg_constraint c where c.conname = i.indexname)
  order by tablename, indexname`);
const policies = await q(`
  select tablename as table, policyname as name, cmd, roles::text as roles, permissive, qual as using, with_check
  from pg_policies where schemaname = 'public' order by tablename, policyname`);
const triggers = await q(`
  select c.relname as table, t.tgname as name, p.proname as function, pg_get_triggerdef(t.oid) as def
  from pg_trigger t join pg_class c on c.oid = t.tgrelid join pg_namespace n on n.oid = c.relnamespace
  join pg_proc p on p.oid = t.tgfoid
  where n.nspname = 'public' and not t.tgisinternal order by c.relname, t.tgname`);
const functions = await q(`
  select p.proname as name, pg_get_function_identity_arguments(p.oid) as args, pg_get_function_result(p.oid) as returns,
         p.prosecdef as security_definer, l.lanname as language, p.provolatile as volatility, obj_description(p.oid) as comment
  from pg_proc p join pg_namespace n on n.oid = p.pronamespace join pg_language l on l.oid = p.prolang
  where n.nspname = 'public' order by p.proname, args`);
const enums = await q(`
  select t.typname as name, array_agg(e.enumlabel order by e.enumsortorder) as values
  from pg_type t join pg_enum e on e.enumtypid = t.oid join pg_namespace n on n.oid = t.typnamespace
  where n.nspname = 'public' group by t.typname order by t.typname`);
const views = await q(`select viewname as name, definition from pg_views where schemaname = 'public' order by viewname`);

const KIND = { p: "primary key", f: "foreign key", u: "unique", c: "check", x: "exclusion" };
const drop = (o, k) => Object.fromEntries(Object.entries(o).filter(([key, v]) => key !== k && v !== null && v !== false));
const schema = {
  generatedBy: "scripts/docs/schema-snapshot.mjs",
  migrations,
  tables: tables.map((t) => ({
    name: t.name,
    rls: t.rls,
    ...(t.force_rls && { forceRls: true }),
    ...(t.comment && { comment: t.comment }),
    columns: columns.filter((c) => c.table === t.name).map((c) => drop({ ...c, pos: undefined }, "table")).map(({ pos, ...c }) => c),
    constraints: constraints.filter((c) => c.table === t.name).map((c) => drop({ ...c, kind: KIND[c.kind] ?? c.kind }, "table")),
    indexes: indexes.filter((i) => i.table === t.name).map((i) => drop(i, "table")),
    policies: policies.filter((p) => p.table === t.name).map((p) => drop({ ...p, permissive: p.permissive === "PERMISSIVE" ? null : p.permissive }, "table")),
    triggers: triggers.filter((g) => g.table === t.name).map((g) => drop(g, "table")),
  })),
  views,
  enums,
  functions: functions.map((f) => drop({ ...f, volatility: { i: "immutable", s: "stable", v: "volatile" }[f.volatility] }, "")),
};
const json = JSON.stringify(schema, null, 1) + "\n";
if (check) {
  const current = fs.existsSync(out) ? fs.readFileSync(out, "utf8") : "";
  if (current !== json) {
    console.error("docs/schema.json is out of date with supabase/migrations. Run: npm run docs:schema, then review the data model page (docs/DATA-MODEL.md).");
    process.exit(1);
  }
  console.log(`docs/schema.json matches the ${migrations.length} migrations.`);
} else {
  fs.writeFileSync(out, json);
  console.log(`docs/schema.json: ${schema.tables.length} tables, ${enums.length} enums, ${functions.length} functions, ${policies.length} policies, ${triggers.length} triggers from ${migrations.length} migrations.`);
}
