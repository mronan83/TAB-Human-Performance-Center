// Row-level security test suite. Runs the migration in PGlite (in-process Postgres) with stub auth/storage schemas.
// Usage: npm run test:rls   (applies every migration in order; exits non-zero on any failure, so CI fails)
//
// Two kinds of test:
//   check / expectDenied  enforced behaviour; any FAIL fails the run.
//   knownGap              a weakness confirmed by the 2026-09-28 security review that the Phase 2 hardening must
//                         close before real client data (docs/requirements-register.md SEC-014..SEC-020). It prints
//                         GAP while still open. When it closes, the run fails until the test is moved into the
//                         enforced checks, so a fix can't go unrecorded. Phase 2 go-live requires zero GAP lines.
//
// PGlite can't reproduce Supabase JWT claims, MFA assurance levels, signup or default grants; those need a
// `supabase start` + pgTAP run before Phase 2 (SEC-021).
import { PGlite } from "@electric-sql/pglite";
import fs from "fs";
const db = new PGlite();
const stub = `
create schema auth; create schema storage;
create table auth.users (id uuid primary key, email text, email_confirmed_at timestamptz, raw_user_meta_data jsonb default '{}');
create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('test.uid', true),'')::uuid $$;
create table storage.buckets (id text primary key, name text, public boolean);
create table storage.objects (id uuid primary key default gen_random_uuid(), bucket_id text, name text);
alter table storage.objects enable row level security;
create function storage.foldername(name text) returns text[] language sql as $$ select string_to_array(name,'/') $$;
create role authenticated;
`;
await db.exec(stub);
for (const file of process.argv.slice(2)) await db.exec(fs.readFileSync(file, "utf8"));
await db.exec(`grant usage on schema public, auth to authenticated; grant all on all tables in schema public to authenticated; grant all on all sequences in schema public to authenticated;`);
// Seed: owner, practitioner, two clients (one assigned)
const O='00000000-0000-0000-0000-00000000000a', P='00000000-0000-0000-0000-00000000000b', C1='00000000-0000-0000-0000-00000000000c', C2='00000000-0000-0000-0000-00000000000d';
const DANA='11111111-1111-1111-1111-111111111111', SAM='22222222-2222-2222-2222-222222222222';
await db.exec(`
insert into clients (id, full_name, email) values ('${DANA}','Dana','dana@example.com'),('${SAM}','Sam','sam@example.com');
insert into auth.users (id,email,email_confirmed_at) values ('${O}','owner@x.com',now()),('${P}','prac@x.com',now()),('${C1}','dana@example.com',now()),('${C2}','sam@example.com',now());
update profiles set role='owner' where id='${O}'; update profiles set role='practitioner' where id='${P}';
insert into practitioners (id, display_name) values ('${P}','Pat');
insert into practitioner_assignments (client_id, practitioner_id) values ('${DANA}','${P}');
insert into session_notes (client_id, practitioner_id, body, visibility) values
 ('${DANA}','${P}','internal note','internal'),('${DANA}','${P}','shared summary','shared');
insert into wellness_plans (client_id, title, visible_to_client) values ('${DANA}','Visible plan',true),('${DANA}','Draft plan',false);
insert into resource_assignments (client_id, resource_ref, title) values ('${DANA}','free-guide','Free guide');
insert into program_templates (id, slug, title, service, status) values ('33333333-3333-3333-3333-333333333333','draft-course','Draft course','personal-strength-training','draft');
insert into program_modules (template_id, title, body_md) values ('33333333-3333-3333-3333-333333333333','Week 1','Paid content');
`);
const as = async (uid, sql) => { await db.exec(`set role authenticated; select set_config('test.uid','${uid}',false);`); try { return (await db.query(sql)).rows; } finally { await db.exec(`reset role;`); } };
const superuser = async (sql) => (await db.query(sql)).rows;

let failures = 0;
const check = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  if (!ok) failures++;
  console.log(ok ? "PASS" : "FAIL", label, JSON.stringify(got));
};
// A blocked write must fail for an authorization reason (RLS or a guard trigger), not for any error at all.
const DENIED = /row-level security|permission denied|Only the owner can change roles|Clients may only update their own contact details|Submitted answers cannot be changed|kept indefinitely/i;
const expectDenied = async (label, fn) => {
  let message = null;
  try { await fn(); } catch (e) { message = e.message; }
  check(label, message === null ? "allowed" : DENIED.test(message) ? "denied" : `other error: ${message}`, "denied");
};
let openGaps = 0;
const knownGap = async (label, isOpen) => {
  const open = await isOpen();
  if (open) { openGaps++; console.log("GAP ", label); }
  else { failures++; console.log("FAIL", label, "— gap is now closed: move this test into the enforced checks"); }
};
const attempt = async (fn) => { try { await fn(); return true; } catch { return false; } };

// Enforced behaviour
check('client auto-linked on signup', (await superuser(`select full_name from clients where profile_id='${C1}'`)).map(r=>r.full_name), ['Dana']);
check('owner sees all clients', (await as(O,'select full_name from clients order by full_name')).map(r=>r.full_name), ['Dana','Sam']);
check('practitioner sees only assigned', (await as(P,'select full_name from clients')).map(r=>r.full_name), ['Dana']);
check('client sees only self', (await as(C1,'select full_name from clients')).map(r=>r.full_name), ['Dana']);
check('client sees only shared notes', (await as(C1,'select body from session_notes')).map(r=>r.body), ['shared summary']);
check('other client sees no notes', (await as(C2,'select body from session_notes')).map(r=>r.body), []);
check('client sees only visible plans', (await as(C1,'select title from wellness_plans')).map(r=>r.title), ['Visible plan']);
check('practitioner sees all plans for assigned', (await as(P,'select title from wellness_plans order by title')).map(r=>r.title), ['Draft plan','Visible plan']);
await as(C1, `insert into check_ins (client_id, week_of, energy) values ('${DANA}','2026-09-21',4)`);
check('client can write own check-in', (await as(P,'select energy from check_ins')).map(r=>r.energy), [4]);
await expectDenied('client cannot write for another client', () => as(C1, `insert into check_ins (client_id, week_of, energy) values ('${SAM}','2026-09-21',4)`));
await expectDenied('client cannot escalate role', () => as(C1, `update profiles set role='owner' where id='${C1}'`));
await expectDenied('client cannot change care fields', () => as(C1, `update clients set status='alumni' where id='${DANA}'`));
await as(C1, `update clients set phone='555' where id='${DANA}'`);
check('client can update own contact', (await superuser(`select phone from clients where full_name='Dana'`)).map(r=>r.phone), ['555']);
await as(C2, `update clients set phone='666' where id='${DANA}'`);
check("client cannot update another client's contact", (await superuser(`select phone from clients where full_name='Dana'`)).map(r=>r.phone), ['555']);
check('audit captured events', (await superuser(`select count(*)::int n from audit_events`))[0].n > 5, true);
check('client cannot read audit log', (await as(C1,'select count(*)::int n from audit_events'))[0].n, 0);
check('owner reads audit log', (await as(O,'select count(*)::int n from audit_events'))[0].n > 5, true);

// Start and contact submissions (DIV-05): owner-only until linked; answers immutable; never deleted
const I_DANA='44444444-4444-4444-4444-444444444444', I_NEW='55555555-5555-5555-5555-555555555555', I_SAM='66666666-6666-6666-6666-666666666666';
await superuser(`insert into inquiries (id, reference, kind, name, email, message, consent_contact_at, client_id) values
 ('${I_DANA}','R1','start','Dana','dana@example.com','dana message',now(),'${DANA}'),
 ('${I_NEW}','R2','start','Casey','casey@example.com','unlinked message',now(),null),
 ('${I_SAM}','R3','contact','Sam','sam@example.com','sam message',now(),'${SAM}')`);
check('owner reads every submission', (await as(O,'select reference from inquiries order by reference')).map(r=>r.reference), ['R1','R2','R3']);
check('practitioner reads only submissions linked to assigned clients', (await as(P,'select message from inquiries')).map(r=>r.message), ['dana message']);
check('client cannot read submissions, even their own', (await as(C1,'select message from inquiries')).map(r=>r.message), []);
await expectDenied('signed-in client cannot insert a submission', () => as(C1, `insert into inquiries (reference, kind, name, email, message, consent_contact_at) values ('X1','start','x','x@x.com','x',now())`));
await expectDenied('owner cannot insert a submission (server only)', () => as(O, `insert into inquiries (reference, kind, name, email, message, consent_contact_at) values ('X2','start','x','x@x.com','x',now())`));
await as(O, `update inquiries set routing_outcome='discovery', routing_note='call first' where id='${I_NEW}'`);
check('owner records routing, stamped with who and when', (await superuser(`select routing_outcome, routed_by, routed_at is not null as stamped from inquiries where id='${I_NEW}'`))[0], { routing_outcome: 'discovery', routed_by: O, stamped: true });
await expectDenied('owner cannot alter submitted answers', () => as(O, `update inquiries set message='edited' where id='${I_NEW}'`));
await as(O, `update inquiries set routed_by='${P}', routed_at='2000-01-01' where id='${I_NEW}'`);
check('routing stamp cannot be forged', (await superuser(`select routed_by, routed_at > '2001-01-01' as recent from inquiries where id='${I_NEW}'`))[0], { routed_by: O, recent: true });
await as(P, `update inquiries set routing_outcome='referral' where id='${I_DANA}'`);
check('practitioner cannot route', (await superuser(`select routing_outcome from inquiries where id='${I_DANA}'`))[0].routing_outcome, null);
await as(O, `delete from inquiries where id='${I_NEW}'`);
check('owner delete removes nothing', (await superuser(`select count(*)::int n from inquiries`))[0].n, 3);
await expectDenied('even the service role cannot delete a submission', () => superuser(`delete from inquiries where id='${I_NEW}'`));
check('submission changes are audited', (await superuser(`select count(*)::int n from audit_events where table_name='inquiries'`))[0].n >= 4, true);
// SEC-014: an account links to a client record only after the email is confirmed
const X='00000000-0000-0000-0000-0000000000e1';
await superuser(`insert into clients (full_name, email) values ('Casey','casey@example.com')`);
await superuser(`insert into auth.users (id,email) values ('${X}','CASEY@example.com')`);
check('unconfirmed account does not claim a client record', (await superuser(`select count(*)::int n from clients where profile_id='${X}'`))[0].n, 0);
await superuser(`update auth.users set email_confirmed_at=now() where id='${X}'`);
check('confirming the email links the client record', (await superuser(`select full_name from clients where profile_id='${X}'`)).map(r=>r.full_name), ['Casey']);

// Known gaps from the 2026-09-28 security review (Phase 2 hardening closes these; see SEC-014..SEC-020)
await knownGap('staff can switch off their own MFA requirement (SEC-015)', async () => {
  await attempt(() => as(P, `update profiles set mfa_required=false where id='${P}'`));
  return (await superuser(`select mfa_required from profiles where id='${P}'`))[0].mfa_required === false;
});
await knownGap('client can rewrite resource_ref on an assigned resource (SEC-016)', async () => {
  await attempt(() => as(C1, `update resource_assignments set resource_ref='paid-course' where client_id='${DANA}'`));
  return (await superuser(`select resource_ref from resource_assignments where client_id='${DANA}'`))[0].resource_ref === 'paid-course';
});
await knownGap('client can backdate a consent and set its source (SEC-016)', async () =>
  attempt(() => as(C1, `insert into consents (client_id, type, version, granted, granted_at, source) values ('${DANA}','privacy','v1',true,'2000-01-01','staff')`)));
await knownGap('any signed-in user can read draft program modules (SEC-017)', async () =>
  (await as(C2, `select title from program_modules`)).length > 0);
await knownGap("practitioner can read an unassigned client's profile email (SEC-018)", async () =>
  (await as(P, `select email from profiles where id='${C2}'`)).length > 0);

console.log(`\n${failures === 0 ? "OK" : "FAILED"}: ${failures} failure(s); ${openGaps} known gap(s) open (must be 0 before Phase 2 go-live)`);
process.exit(failures ? 1 : 0);
