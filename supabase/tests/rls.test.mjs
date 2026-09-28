// Row-level security test suite. Runs the migration in PGlite (in-process Postgres) with stub auth/storage schemas.
// Usage: npm run test:rls
import { PGlite } from "@electric-sql/pglite";
import fs from "fs";
const db = new PGlite();
const stub = `
create schema auth; create schema storage;
create table auth.users (id uuid primary key, email text, raw_user_meta_data jsonb default '{}');
create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('test.uid', true),'')::uuid $$;
create table storage.buckets (id text primary key, name text, public boolean);
create table storage.objects (id uuid primary key default gen_random_uuid(), bucket_id text, name text);
alter table storage.objects enable row level security;
create function storage.foldername(name text) returns text[] language sql as $$ select string_to_array(name,'/') $$;
create role authenticated;
`;
await db.exec(stub);
await db.exec(fs.readFileSync(process.argv[2], "utf8"));
await db.exec(`grant usage on schema public, auth to authenticated; grant all on all tables in schema public to authenticated; grant all on all sequences in schema public to authenticated;`);
// Seed: owner, practitioner, two clients (one assigned)
const O='00000000-0000-0000-0000-00000000000a', P='00000000-0000-0000-0000-00000000000b', C1='00000000-0000-0000-0000-00000000000c', C2='00000000-0000-0000-0000-00000000000d';
await db.exec(`
insert into clients (id, full_name, email) values ('11111111-1111-1111-1111-111111111111','Dana','dana@example.com'),('22222222-2222-2222-2222-222222222222','Sam','sam@example.com');
insert into auth.users (id,email) values ('${O}','owner@x.com'),('${P}','prac@x.com'),('${C1}','dana@example.com'),('${C2}','sam@example.com');
update profiles set role='owner' where id='${O}'; update profiles set role='practitioner' where id='${P}';
insert into practitioners (id, display_name) values ('${P}','Pat');
insert into practitioner_assignments (client_id, practitioner_id) values ('11111111-1111-1111-1111-111111111111','${P}');
insert into session_notes (client_id, practitioner_id, body, visibility) values
 ('11111111-1111-1111-1111-111111111111','${P}','internal note','internal'),('11111111-1111-1111-1111-111111111111','${P}','shared summary','shared');
insert into wellness_plans (client_id, title, visible_to_client) values ('11111111-1111-1111-1111-111111111111','Visible plan',true),('11111111-1111-1111-1111-111111111111','Draft plan',false);
`);
const as = async (uid, sql) => { await db.exec(`set role authenticated; select set_config('test.uid','${uid}',false);`); try { return (await db.query(sql)).rows; } finally { await db.exec(`reset role;`); } };
const check = (label, got, want) => console.log((JSON.stringify(got)===JSON.stringify(want)?'PASS':'FAIL'), label, JSON.stringify(got));
check('client auto-linked on signup', (await db.query(`select full_name from clients where profile_id='${C1}'`)).rows.map(r=>r.full_name), ['Dana']);
check('owner sees all clients', (await as(O,'select full_name from clients order by full_name')).map(r=>r.full_name), ['Dana','Sam']);
check('practitioner sees only assigned', (await as(P,'select full_name from clients')).map(r=>r.full_name), ['Dana']);
check('client sees only self', (await as(C1,'select full_name from clients')).map(r=>r.full_name), ['Dana']);
check('client sees only shared notes', (await as(C1,'select body from session_notes')).map(r=>r.body), ['shared summary']);
check('other client sees no notes', (await as(C2,'select body from session_notes')).map(r=>r.body), []);
check('client sees only visible plans', (await as(C1,'select title from wellness_plans')).map(r=>r.title), ['Visible plan']);
check('practitioner sees all plans for assigned', (await as(P,'select title from wellness_plans order by title')).map(r=>r.title), ['Draft plan','Visible plan']);
await as(C1, `insert into check_ins (client_id, week_of, energy) values ('11111111-1111-1111-1111-111111111111','2026-09-21',4)`);
check('client can write own check-in', (await as(P,'select energy from check_ins')).map(r=>r.energy), [4]);
let blocked=false; try { await as(C1, `insert into check_ins (client_id, week_of, energy) values ('22222222-2222-2222-2222-222222222222','2026-09-21',4)`);} catch { blocked=true; }
check('client cannot write for another client', blocked, true);
blocked=false; try { await as(C1, `update profiles set role='owner' where id='${C1}'`);} catch { blocked=true; }
check('client cannot escalate role', blocked, true);
blocked=false; try { await as(C1, `update clients set status='alumni' where id='11111111-1111-1111-1111-111111111111'`);} catch { blocked=true; }
check('client cannot change care fields', blocked, true);
await as(C1, `update clients set phone='555' where id='11111111-1111-1111-1111-111111111111'`);
check('client can update own contact', (await db.query(`select phone from clients where full_name='Dana'`)).rows.map(r=>r.phone), ['555']);
check('audit captured events', (await db.query(`select count(*)::int n from audit_events`)).rows[0].n > 5, true);
check('client cannot read audit log', (await as(C1,'select count(*)::int n from audit_events'))[0].n, 0);
check('owner reads audit log', (await as(O,'select count(*)::int n from audit_events'))[0].n > 5, true);
