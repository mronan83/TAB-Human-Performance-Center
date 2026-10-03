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
// The stub mimics what the policies read from Supabase: auth.uid(), auth.jwt() (with the session's MFA level, `aal`)
// and Supabase's default table grants (ALL, including TRUNCATE, to anon and authenticated). Real JWT verification,
// signup and grants still need a `supabase start` + pgTAP run before Phase 2 (SEC-021).
import { PGlite } from "@electric-sql/pglite";
import fs from "fs";
const db = new PGlite();
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
alter default privileges in schema public grant all on tables to authenticated, anon;
alter default privileges in schema public grant all on sequences to authenticated, anon;
`;
await db.exec(stub);
for (const file of process.argv.slice(2)) await db.exec(fs.readFileSync(file, "utf8"));
// Seed: owner, practitioner, two clients (one assigned)
const O='00000000-0000-0000-0000-00000000000a', P='00000000-0000-0000-0000-00000000000b', C1='00000000-0000-0000-0000-00000000000c', C2='00000000-0000-0000-0000-00000000000d';
const P2='00000000-0000-0000-0000-00000000000f';
const DANA='11111111-1111-1111-1111-111111111111', SAM='22222222-2222-2222-2222-222222222222';
const T_DRAFT='33333333-3333-3333-3333-333333333333', T_PUB='77777777-7777-7777-7777-777777777777';
const F_ASSIGNED='88888888-8888-8888-8888-888888888881', F_OTHER='88888888-8888-8888-8888-888888888882';
const CP_SAM='99999999-9999-9999-9999-999999999999', COHORT='aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
await db.exec(`
insert into clients (id, full_name, email) values ('${DANA}','Dana','dana@example.com'),('${SAM}','Sam','sam@example.com');
insert into auth.users (id,email,email_confirmed_at) values ('${O}','owner@x.com',now()),('${P}','prac@x.com',now()),('${C1}','dana@example.com',now()),('${C2}','sam@example.com',now()),('${P2}','prac2@x.com',now());
update profiles set role='owner' where id='${O}'; update profiles set role='practitioner' where id in ('${P}','${P2}');
insert into practitioners (id, display_name) values ('${P}','Pat'),('${P2}','Quinn');
insert into practitioner_assignments (client_id, practitioner_id) values ('${DANA}','${P}');
insert into session_notes (client_id, practitioner_id, body, visibility) values ('${DANA}','${P}','shared summary','shared');
insert into private.internal_notes (client_id, practitioner_id, body) values ('${DANA}','${P}','internal note');
insert into wellness_plans (client_id, title, visible_to_client) values ('${DANA}','Visible plan',true),('${DANA}','Draft plan',false);
insert into resource_assignments (client_id, resource_ref, title) values ('${DANA}','free-guide','Free guide');
insert into program_templates (id, slug, title, service, status) values ('${T_DRAFT}','draft-course','Draft course','personal-strength-training','draft'),
 ('${T_PUB}','published-course','Published course','personal-strength-training','published');
insert into program_modules (template_id, title, body_md) values ('${T_DRAFT}','Week 1','Paid content'),('${T_PUB}','Week 1 published','Program content');
insert into client_programs (client_id, template_id) values ('${DANA}','${T_PUB}');
insert into client_programs (id, client_id, template_id) values ('${CP_SAM}','${SAM}','${T_PUB}');
insert into form_templates (id, slug, title, schema, status) values ('${F_ASSIGNED}','intake','Intake','{}','published'),('${F_OTHER}','other','Other','{}','published');
insert into form_assignments (client_id, template_id) values ('${DANA}','${F_ASSIGNED}');
insert into referrals (client_id, target, reason) values ('${DANA}','internal_service','Try strength training');
insert into cohorts (id, title, program_template_id) values ('${COHORT}','Autumn cohort','${T_PUB}');
insert into cohort_meetings (cohort_id, meeting_url) values ('${COHORT}','https://meet.example.com/secret');
insert into cohort_members (cohort_id, client_id) values ('${COHORT}','${DANA}');
`);
// A signed-in user. `aal` is the session's MFA level (Supabase JWT claim); staff access needs aal2 (SEC-015).
const as = async (uid, sql, aal = 'aal2') => {
  await db.exec(`set role authenticated; select set_config('test.uid','${uid}',false), set_config('test.jwt','{"aal":"${aal}"}',false);`);
  try { return (await db.query(sql)).rows; } finally { await db.exec(`reset role;`); }
};
// The service role: no signed-in user, row-level security bypassed.
const superuser = async (sql) => { await db.exec(`select set_config('test.uid','',false), set_config('test.jwt','',false);`); return (await db.query(sql)).rows; };

let failures = 0;
const check = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  if (!ok) failures++;
  console.log(ok ? "PASS" : "FAIL", label, JSON.stringify(got));
};
// A blocked write must fail for an authorization reason (RLS or a guard trigger), not for any error at all.
const DENIED = /row-level security|Nutrition plans need|A service plan must|Only published programs can be assigned|keeps its client, program and version|not part of this program|Publishing needs the publishing permission|can't be edited; start a new version|New programs start as drafts|Published programs are kept|keeps its program and number|Only practitioners can edit programs|can only move to a newer published version|Only practitioners can move|Only practitioners can change a client's program|Program not found|A form the client has started stays assigned|Only published forms can be assigned|A form assignment keeps its client|permission denied|Only the owner can change|Clients may only update|You can change only your name|Clients can only save or submit|was not assigned to you|belongs to another client|Consent records are kept|Submitted answers cannot be changed|kept indefinitely|care team can use internal notes|append-only|Only the owner can decide/i;
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
await superuser(`insert into inquiries (id, reference, kind, name, email, help, topic, message, consent_contact_at, client_id) values
 ('${I_DANA}','R1','start','Dana','dana@example.com','{stronger}',null,null,now(),'${DANA}'),
 ('${I_NEW}','R2','start','Casey','casey@example.com','{not-sure}',null,null,now(),null),
 ('${I_SAM}','R3','contact','Sam','sam@example.com','{}','gift-cards','gift card question',now(),'${SAM}')`);
check('owner reads every submission', (await as(O,'select reference from inquiries order by reference')).map(r=>r.reference), ['R1','R2','R3']);
check('practitioner reads only submissions linked to assigned clients', (await as(P,'select reference from inquiries')).map(r=>r.reference), ['R1']);
check('client cannot read submissions, even their own', (await as(C1,'select reference from inquiries')).map(r=>r.reference), []);
await expectDenied('signed-in client cannot insert a submission', () => as(C1, `insert into inquiries (reference, kind, name, email, consent_contact_at) values ('X1','start','x','x@x.com',now())`));
await expectDenied('owner cannot insert a submission (server only)', () => as(O, `insert into inquiries (reference, kind, name, email, consent_contact_at) values ('X2','start','x','x@x.com',now())`));
check('database rejects free text on a Start submission', await attempt(() => superuser(`insert into inquiries (reference, kind, name, email, message, consent_contact_at) values ('X4','start','x','x@x.com','typed text',now())`)), false);
check('database rejects an over-long name', await attempt(() => superuser(`insert into inquiries (reference, kind, name, email, consent_contact_at) values ('X3','start','${'n'.repeat(81)}','x@x.com',now())`)), false);
await as(O, `update inquiries set routing_outcome='discovery', routing_note='call first' where id='${I_NEW}'`);
check('owner records routing, stamped with who and when', (await superuser(`select routing_outcome, routed_by, routed_at is not null as stamped from inquiries where id='${I_NEW}'`))[0], { routing_outcome: 'discovery', routed_by: O, stamped: true });
await expectDenied('owner cannot alter submitted answers', () => as(O, `update inquiries set help='{other}' where id='${I_NEW}'`));
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

// Portal security gate, part 1 (SEC-015 to SEC-018; 2026-09-28 security review). The five former known gaps are
// the first check in each group.

// SEC-015: staff MFA
await expectDenied('staff cannot switch off their own MFA requirement', () => as(P, `update profiles set mfa_required=false where id='${P}'`));
check('MFA requirement unchanged', (await superuser(`select mfa_required from profiles where id='${P}'`))[0].mfa_required, true);
check('practitioner without MFA sees no client records', (await as(P, 'select full_name from clients', 'aal1')).map(r=>r.full_name), []);
check('owner without MFA sees no submissions', (await as(O, 'select reference from inquiries', 'aal1')).map(r=>r.reference), []);
check('clients do not need MFA', (await as(C1, 'select full_name from clients', 'aal1')).map(r=>r.full_name), ['Dana']);
await expectDenied('client cannot change their profile email', () => as(C1, `update profiles set email='x@evil.com' where id='${C1}'`));
await as(C1, `update profiles set preferred_name='D' where id='${C1}'`);
check('client can change their preferred name', (await superuser(`select preferred_name from profiles where id='${C1}'`))[0].preferred_name, 'D');

// SEC-016: clients change only what is theirs to change
await expectDenied('client cannot rewrite resource_ref on an assigned resource', () => as(C1, `update resource_assignments set resource_ref='paid-course' where client_id='${DANA}'`));
check('resource_ref unchanged', (await superuser(`select resource_ref from resource_assignments where client_id='${DANA}'`))[0].resource_ref, 'free-guide');
await as(C1, `update resource_assignments set viewed_at=now() where client_id='${DANA}'`);
check('client can mark a resource viewed', (await superuser(`select viewed_at is not null v from resource_assignments where client_id='${DANA}'`))[0].v, true);
await as(C1, `insert into consents (client_id, type, version, granted, granted_at, source) values ('${DANA}','privacy','v1',true,'2000-01-01','staff')`);
check('consent is stamped by the server: no backdating, no forged source', (await superuser(`select granted_at > now() - interval '1 minute' as recent, source from consents where client_id='${DANA}' and type='privacy'`))[0], { recent: true, source: 'portal' });
await as(C1, `insert into consents (client_id, type, version, granted) values ('${DANA}','privacy','v1',false)`);
check('withdrawing consent adds a stamped row; history kept', (await superuser(`select granted, revoked_at is not null as revoked from consents where client_id='${DANA}' and type='privacy' order by granted desc`)), [{ granted: true, revoked: false }, { granted: false, revoked: true }]);
await as(C1, `update consents set granted=true, granted_at='2000-01-01' where client_id='${DANA}'`);
await as(O, `delete from consents where client_id='${DANA}'`);
check('nobody edits or deletes a consent record', (await superuser(`select count(*)::int n, min(granted_at) > '2001-01-01' as untouched from consents where client_id='${DANA}'`))[0], { n: 2, untouched: true });
await expectDenied('client cannot change their own email on the client record', () => as(C1, `update clients set email='x@evil.com' where id='${DANA}'`));
await expectDenied('client cannot answer a form that was not assigned', () => as(C1, `insert into form_submissions (client_id, template_id, answers, status) values ('${DANA}','${F_OTHER}','{}','submitted')`));
await as(C1, `insert into form_submissions (client_id, template_id, answers, status, submitted_at) values ('${DANA}','${F_ASSIGNED}','{"a":1}','submitted','2000-01-01')`);
check('submit time is the server\'s', (await superuser(`select submitted_at > now() - interval '1 minute' as recent from form_submissions where client_id='${DANA}'`))[0].recent, true);
await expectDenied('client cannot mark their own submission reviewed', () => as(C1, `insert into form_submissions (client_id, template_id, status) values ('${DANA}','${F_ASSIGNED}','reviewed')`));
await as(P, `update form_submissions set status='reviewed', reviewed_by='${P2}', reviewed_at='2000-01-01' where client_id='${DANA}'`);
check('a review is stamped with who and when', (await superuser(`select reviewed_by, reviewed_at > '2001-01-01' as recent from form_submissions where client_id='${DANA}'`))[0], { reviewed_by: P, recent: true });
await as(C1, `update referrals set status='accepted' where client_id='${DANA}'`);
check('client can accept a referral', (await superuser(`select status from referrals where client_id='${DANA}'`))[0].status, 'accepted');
await expectDenied('client cannot rewrite a referral', () => as(C1, `update referrals set reason='something else' where client_id='${DANA}'`));
await expectDenied('client cannot mark a referral completed', () => as(C1, `update referrals set status='completed' where client_id='${DANA}'`));
await expectDenied("client cannot log activity against another client's program", () => as(C1, `insert into activity_logs (client_id, client_program_id) values ('${DANA}','${CP_SAM}')`));

// SEC-017: program content and cohort links
check('clients cannot read draft program modules', (await as(C2, `select title from program_modules where template_id='${T_DRAFT}'`)).map(r=>r.title), []);
check('enrolled client reads their published program only', (await as(C1, 'select title from program_modules order by title')).map(r=>r.title), ['Week 1 published']);
await superuser(`delete from client_programs where id='${CP_SAM}'`);
check('client not enrolled or entitled reads no program content', (await as(C2, 'select title from program_modules')).map(r=>r.title), []);
check('staff read all program content', (await as(P, 'select title from program_modules order by title')).map(r=>r.title), ['Week 1', 'Week 1 published']);
check('cohort member reads the meeting link', (await as(C1, 'select meeting_url from cohort_meetings')).length, 1);
check('non-member cannot read the meeting link', (await as(C2, 'select meeting_url from cohort_meetings')).length, 0);

// SEC-018: practitioners stay within their care team
check("practitioner cannot read an unassigned client's profile", (await as(P, `select email from profiles where id='${C2}'`)).length, 0);
check("practitioner reads their own client's profile", (await as(P, `select email from profiles where id='${C1}'`)).length, 1);
await expectDenied("practitioner cannot change a client's account link", () => as(P, `update clients set profile_id=null where id='${DANA}'`));
await expectDenied("practitioner cannot change a client's billing link", () => as(P, `update clients set stripe_customer_id='cus_x' where id='${DANA}'`));
await as(P, `insert into session_notes (client_id, practitioner_id, body) values ('${DANA}','${P2}','note claiming another author')`);
check('note author is the signed-in practitioner', (await superuser(`select practitioner_id from session_notes where body='note claiming another author'`))[0].practitioner_id, P);
await expectDenied('practitioner cannot add an unassigned client to a cohort', () => as(P, `insert into cohort_members (cohort_id, client_id) values ('${COHORT}','${SAM}')`));
await superuser(`update practitioners set active=false where id='${P}'`);
check('deactivated practitioner loses access', (await as(P, 'select full_name from clients')).map(r=>r.full_name), []);
await superuser(`update practitioners set active=true where id='${P}'`);

// SEC-019 (part): the audit log is read-only for signed-in users, and role changes are recorded
await expectDenied('signed-in users cannot truncate the audit log', () => as(O, 'truncate audit_events'));
await expectDenied('signed-in users cannot delete audit rows', () => as(O, 'delete from audit_events'));
await as(O, `update profiles set role='practitioner' where id='${P2}'`);
check('profile changes are audited', (await superuser(`select count(*)::int n from audit_events where table_name='profiles'`))[0].n > 0, true);

// C4a: Progress Reviews and TAB Method stage changes (practitioner decides; history can't be skipped or edited)
const stageOf = async () => (await superuser(`select method_stage from clients where id='${DANA}'`))[0].method_stage;
const review = (stage) => `select record_progress_review('${DANA}','adjust','{"changed":"more energy"}','Summary','Next steps',true${stage ? `,'${stage}'` : ''}) as changed`;
check('practitioner records a review without a stage change', (await as(P, review()))[0].changed, false);
check('stage unchanged by that review', await stageOf(), 'start');
check('practitioner records a review that changes the stage', (await as(P, review('transform')))[0].changed, true);
check('client stage updated', await stageOf(), 'transform');
check('stage history links the review and the practitioner',
  await superuser(`select from_stage, to_stage, changed_by, review_id is not null as linked from stage_changes where client_id='${DANA}'`),
  [{ from_stage: 'start', to_stage: 'transform', changed_by: P, linked: true }]);
check('review author is the signed-in practitioner', (await superuser(`select distinct practitioner_id from progress_reviews where client_id='${DANA}'`)).map(r=>r.practitioner_id), [P]);
check('client sees own stage history', (await as(C1, 'select to_stage from stage_changes')).map(r=>r.to_stage), ['transform']);
check('other client sees no stage history', (await as(C2, 'select to_stage from stage_changes')).length, 0);
await expectDenied('client cannot record a review or change their own stage', () => as(C1, review('evolve')));
await expectDenied('unassigned practitioner cannot record a review', () => as(P2, review('align')));
await expectDenied('staff without two-step verification cannot record a review', () => as(P, review('align'), 'aal1'));
await expectDenied('nobody writes stage history directly', () => as(O, `insert into stage_changes (client_id, to_stage) values ('${DANA}','evolve')`));
await expectDenied('stage history cannot be edited', () => as(O, `update stage_changes set to_stage='evolve'`));
await expectDenied('stage history cannot be deleted', () => as(O, 'delete from stage_changes'));
check('stage unchanged by denied attempts', await stageOf(), 'transform');
await as(O, `update clients set method_stage='align' where id='${DANA}'`);
check('a direct stage edit is still recorded', await superuser(`select from_stage, to_stage, review_id from stage_changes where client_id='${DANA}' order by created_at, to_stage desc`),
  [{ from_stage: 'start', to_stage: 'transform', review_id: (await superuser(`select review_id from stage_changes where to_stage='transform'`))[0].review_id }, { from_stage: 'transform', to_stage: 'align', review_id: null }]);
check('stage changes are audited', (await superuser(`select count(*)::int n from audit_events where table_name='stage_changes'`))[0].n, 2);

// C4b: typed plans. Practitioner-only sections and internal log entries never reach the client; nutrition is gated.
const one = async (uid, sql) => (await as(uid, sql))[0];
const ANCHOR = (await one(P, `insert into wellness_plans (client_id, title, status, visible_to_client) values ('${DANA}','Dana anchor','active',true) returning id`)).id;
check('only one active Wellness Plan per client', await attempt(() => as(P, `insert into wellness_plans (client_id, title, status) values ('${DANA}','Second anchor','active')`)), false);
const MASSAGE = (await one(P, `insert into wellness_plans (client_id, title, plan_type, parent_plan_id, status, visible_to_client, details)
  values ('${DANA}','Massage plan','massage-bodywork','${ANCHOR}','active',true,'{"focus_areas":"upper back"}') returning id`)).id;
check('service plan owner defaults to the author', (await superuser(`select practitioner_id from wellness_plans where id='${MASSAGE}'`))[0].practitioner_id, P);
await as(P, `select save_plan_private_details('${MASSAGE}','${DANA}','{"contraindications":"practitioner-only note"}')`);
check('client reads shared plan sections', (await as(C1, `select details->>'focus_areas' f from wellness_plans where id='${MASSAGE}'`)).map(r=>r.f), ['upper back']);
await expectDenied('client cannot read practitioner-only sections', () => as(C1, `select * from plan_private_details('${DANA}')`));
await expectDenied('nor reach the private table directly', () => as(C1, 'select details from private.plan_private_details'));
check('care team reads practitioner-only sections', (await as(P, `select details->>'contraindications' c from plan_private_details('${DANA}')`)).map(r=>r.c), ['practitioner-only note']);
await expectDenied('unassigned practitioner cannot read them', () => as(P2, `select 1 from plan_private_details('${DANA}')`));
check('other client sees none of it', (await as(C2, `select 1 from wellness_plans where id='${MASSAGE}'`)).length, 0);
await expectDenied('client cannot write practitioner-only sections', () => as(C1, `select save_plan_private_details('${ANCHOR}','${DANA}','{}')`));
await expectDenied('client cannot create a plan', () => as(C1, `insert into wellness_plans (client_id, title) values ('${DANA}','Self-made plan')`));
const SAM_ANCHOR = (await one(O, `insert into wellness_plans (client_id, title) values ('${SAM}','Sam anchor') returning id`)).id;
await expectDenied("a service plan cannot sit under another client's plan", () => as(O, `insert into wellness_plans (client_id, title, plan_type, parent_plan_id) values ('${DANA}','Crossed','personal-strength-training','${SAM_ANCHOR}')`));
await expectDenied('a service plan cannot sit under another service plan', () => as(P, `insert into wellness_plans (client_id, title, plan_type, parent_plan_id) values ('${DANA}','Nested','personal-strength-training','${MASSAGE}')`));
// Plan log
await as(P, `insert into plan_entries (plan_id, client_id, body, visibility, practitioner_id) values ('${MASSAGE}','${DANA}','Shared entry','shared','${P2}'),('${MASSAGE}','${DANA}','Internal entry','internal',null)`);
check('client reads shared log entries only', (await as(C1, 'select body from plan_entries')).map(r=>r.body), ['Shared entry']);
check('care team reads every log entry', (await as(P, 'select body from plan_entries order by body')).map(r=>r.body), ['Internal entry','Shared entry']);
check('log entry author is the signed-in practitioner', (await superuser(`select distinct practitioner_id from plan_entries`)).map(r=>r.practitioner_id), [P]);
const DRAFT_PLAN = (await one(P, `insert into wellness_plans (client_id, title, plan_type, parent_plan_id) values ('${DANA}','Draft strength plan','personal-strength-training','${ANCHOR}') returning id`)).id;
await as(P, `insert into plan_entries (plan_id, client_id, body, visibility) values ('${DRAFT_PLAN}','${DANA}','Shared but plan hidden','shared')`);
check('shared entries on a hidden plan stay hidden', (await as(C1, `select 1 from plan_entries where plan_id='${DRAFT_PLAN}'`)).length, 0);
await expectDenied('client cannot write log entries', () => as(C1, `insert into plan_entries (plan_id, client_id, body, visibility) values ('${MASSAGE}','${DANA}','x','shared')`));
await expectDenied("a log entry cannot point at another client's plan", () => as(O, `insert into plan_entries (plan_id, client_id, body) values ('${SAM_ANCHOR}','${DANA}','x')`));
// Nutrition gate
await expectDenied('practitioner without the credential cannot create a nutrition plan', () => as(P, `insert into wellness_plans (client_id, title, plan_type, parent_plan_id) values ('${DANA}','Nutrition','nutrition','${ANCHOR}')`));
await expectDenied('owner without the credential cannot either', () => as(O, `insert into wellness_plans (client_id, title, plan_type, parent_plan_id) values ('${DANA}','Nutrition','nutrition','${ANCHOR}')`));
await expectDenied('a plan cannot be switched to nutrition without the credential', () => as(P, `update wellness_plans set plan_type='nutrition' where id='${MASSAGE}'`));
await superuser(`update practitioners set capabilities='{nutrition}' where id='${P}'`);
const NUTRITION = (await one(P, `insert into wellness_plans (client_id, title, plan_type, parent_plan_id) values ('${DANA}','Nutrition coaching','nutrition','${ANCHOR}') returning id`)).id;
await as(P, `insert into plan_entries (plan_id, client_id, body) values ('${NUTRITION}','${DANA}','Habit check-in')`);
check('credentialed practitioner writes nutrition plans and entries', (await superuser(`select count(*)::int n from plan_entries where plan_id='${NUTRITION}'`))[0].n, 1);
await superuser(`update practitioners set capabilities='{}' where id='${P}'`);
await expectDenied('without the credential a nutrition plan cannot be edited', () => as(P, `update wellness_plans set title='Changed' where id='${NUTRITION}'`));
await expectDenied('without the credential no nutrition log entries', () => as(P, `insert into plan_entries (plan_id, client_id, body) values ('${NUTRITION}','${DANA}','x')`));
await expectDenied('nor practitioner-only nutrition sections', () => as(P, `select save_plan_private_details('${NUTRITION}','${DANA}','{}')`));
await expectDenied('practitioner-only sections cannot be truncated', () => as(O, 'truncate private.plan_private_details'));
check('plan log and private sections are audited', (await superuser(`select count(distinct table_name)::int n from audit_events where table_name in ('plan_entries','plan_private_details')`))[0].n, 2);

// C4c: assigning and personalizing programs. Published templates only, version pinned by the database,
// personalization written by the care team only, and clients log only activities still in their program.
await superuser(`update program_templates set version=2 where id='${T_PUB}'`);
const MOD_PUB = (await superuser(`select id from program_modules where template_id='${T_PUB}'`))[0].id;
const MOD_DRAFT = (await superuser(`select id from program_modules where template_id='${T_DRAFT}'`))[0].id;
const [ACT_KEEP, ACT_SKIP] = (await superuser(`insert into program_activities (module_id, kind, title, sort) values ('${MOD_PUB}','exercise','Sit-to-stand',0),('${MOD_PUB}','exercise','Step-up',1) returning id`)).map(r=>r.id);
const ACT_DRAFT = (await superuser(`insert into program_activities (module_id, kind, title) values ('${MOD_DRAFT}','exercise','Draft only') returning id`))[0].id;
const CP_NEW = (await one(P, `insert into client_programs (client_id, template_id, template_version, plan_id, personalization)
  values ('${DANA}','${T_PUB}',9,'${MASSAGE}','{"note":"Go gently","activities":{"${ACT_SKIP}":{"skip":true}}}') returning id`)).id;
check('assignment pins the template version and records who assigned it', (await superuser(`select template_version, assigned_by from client_programs where id='${CP_NEW}'`))[0], { template_version: 2, assigned_by: P });
await expectDenied('a draft program cannot be assigned', () => as(P, `insert into client_programs (client_id, template_id) values ('${DANA}','${T_DRAFT}')`));
await expectDenied('unassigned practitioner cannot assign a program', () => as(P2, `insert into client_programs (client_id, template_id) values ('${DANA}','${T_PUB}')`));
await expectDenied('client cannot assign themselves a program', () => as(C1, `insert into client_programs (client_id, template_id) values ('${DANA}','${T_PUB}')`));
await expectDenied("a program cannot link to another client's plan", () => as(O, `insert into client_programs (client_id, template_id, plan_id) values ('${DANA}','${T_PUB}','${SAM_ANCHOR}')`));
await as(C1, `update client_programs set personalization='{}' where id='${CP_NEW}'`);
check('client cannot change their personalization', (await superuser(`select personalization->>'note' n from client_programs where id='${CP_NEW}'`))[0].n, 'Go gently');
check('client reads their personalization', (await as(C1, `select personalization->>'note' n from client_programs where id='${CP_NEW}'`)).map(r=>r.n), ['Go gently']);
check('unassigned practitioner cannot read it', (await as(P2, `select 1 from client_programs where client_id='${DANA}'`)).length, 0);
await expectDenied('an assignment keeps its program', () => as(P, `update client_programs set template_id='${T_DRAFT}' where id='${CP_NEW}'`));
await expectDenied('an assignment keeps its pinned version', () => as(P, `update client_programs set template_version=1 where id='${CP_NEW}'`));
check('personalization must be an object', await attempt(() => as(P, `update client_programs set personalization='[]' where id='${CP_NEW}'`)), false);
await as(P, `update client_programs set status='completed' where id='${CP_NEW}'`);
check('completing a program stamps the date', (await superuser(`select completed_at = current_date as today from client_programs where id='${CP_NEW}'`))[0].today, true);
await as(P, `update client_programs set status='active' where id='${CP_NEW}'`);
check('reopening clears it', (await superuser(`select completed_at from client_programs where id='${CP_NEW}'`))[0].completed_at, null);
await as(C1, `insert into activity_logs (client_id, client_program_id, activity_id) values ('${DANA}','${CP_NEW}','${ACT_KEEP}')`);
check('client logs an activity in their program', (await superuser(`select count(*)::int n from activity_logs where client_program_id='${CP_NEW}'`))[0].n, 1);
await expectDenied('client cannot log an activity skipped for them', () => as(C1, `insert into activity_logs (client_id, client_program_id, activity_id) values ('${DANA}','${CP_NEW}','${ACT_SKIP}')`));
await expectDenied('client cannot log an activity from another program', () => as(C1, `insert into activity_logs (client_id, client_program_id, activity_id) values ('${DANA}','${CP_NEW}','${ACT_DRAFT}')`));
check('assignments are audited', (await superuser(`select count(*)::int n from audit_events where table_name='client_programs' and record_id='${CP_NEW}'`))[0].n, 3);

// C7: program editor with versioning. Drafts by any practitioner, publishing by permission, published versions
// read-only, a new version copies the content, and publishing it retires the old one without moving its clients.
const draftId = (await one(P, `insert into program_templates (slug, title, service, status) values ('desk-reset','Desk Reset','personal-strength-training','draft') returning id`)).id;
check('a practitioner starts a draft program (version 1, its own family)', (await superuser(`select version, family_id = id as root, created_by from program_templates where id='${draftId}'`))[0], { version: 1, root: true, created_by: P });
await expectDenied('a new program cannot start published', () => as(P, `insert into program_templates (slug, title, service, status) values ('sneaky','Sneaky','personal-strength-training','published')`));
await expectDenied('a client cannot create a program', () => as(C1, `insert into program_templates (slug, title, service) values ('mine','Mine','personal-strength-training')`));
const DR_MOD = (await one(P, `insert into program_modules (template_id, week, title) values ('${draftId}',1,'Week 1') returning id`)).id;
const DR_ACT = (await one(P2, `insert into program_activities (module_id, kind, title, prescription) values ('${DR_MOD}','exercise','Chin tucks','{"reps":"10"}') returning id`)).id;
await as(P, `update program_templates set summary='Five minutes between meetings.', submitted_at=now() where id='${draftId}'`);
check('any practitioner edits a draft and its content', (await superuser(`select summary, submitted_at is not null as submitted from program_templates where id='${draftId}'`))[0], { summary: 'Five minutes between meetings.', submitted: true });
await expectDenied('a practitioner without the publishing permission cannot publish', () => as(P, `update program_templates set status='published' where id='${draftId}'`));
await as(O, `update program_templates set status='published' where id='${draftId}'`, 'aal1');
check('publishing needs a two-step-verified session', (await superuser(`select status from program_templates where id='${draftId}'`))[0].status, 'draft');
await superuser(`update practitioners set can_publish=true where id='${P2}'`);
await as(P2, `update program_templates set status='published' where id='${draftId}'`);
check('a practitioner with the permission publishes', (await superuser(`select status, published_by, submitted_at from program_templates where id='${draftId}'`))[0], { status: 'published', published_by: P2, submitted_at: null });
await superuser(`update practitioners set can_publish=false where id='${P2}'`);
await expectDenied('a published version cannot be edited', () => as(O, `update program_templates set title='Changed' where id='${draftId}'`));
await expectDenied('its weeks cannot change', () => as(O, `insert into program_modules (template_id, week, title) values ('${draftId}',2,'Week 2')`));
await expectDenied('nor its activities', () => as(O, `update program_activities set title='Changed' where id='${DR_ACT}'`));
await expectDenied('nor can they be deleted', () => as(O, `delete from program_activities where id='${DR_ACT}'`));
await expectDenied('a published version cannot be deleted', () => as(O, `delete from program_templates where id='${draftId}'`));
await expectDenied('a version keeps its number', () => as(O, `update program_templates set version=7 where id='${draftId}'`));
const CP_V1 = (await one(P, `insert into client_programs (client_id, template_id) values ('${DANA}','${draftId}') returning id`)).id;
const V2 = (await one(P, `select new_program_version('${draftId}') as id`)).id;
check('a new version is a draft copy, numbered 2, same program', (await superuser(`select status, version, family_id='${draftId}' as same, slug, title from program_templates where id='${V2}'`))[0], { status: 'draft', version: 2, same: true, slug: 'desk-reset', title: 'Desk Reset' });
check('content is copied and remembers its source', (await superuser(`select a.title, a.source_activity_id from program_activities a join program_modules m on m.id=a.module_id where m.template_id='${V2}'`)), [{ title: 'Chin tucks', source_activity_id: DR_ACT }]);
check('asking again returns the same draft', (await one(P2, `select new_program_version('${draftId}') as id`)).id, V2);
await expectDenied('a client cannot start a new version', () => as(C1, `select new_program_version('${draftId}')`));
await as(P, `update program_activities set prescription='{"reps":"12"}' where module_id in (select id from program_modules where template_id='${V2}')`);
await as(O, `update program_templates set status='published' where id='${V2}'`);
check('publishing version 2 retires version 1', (await superuser(`select version, status from program_templates where family_id='${draftId}' order by version`)), [{ version: 1, status: 'retired' }, { version: 2, status: 'published' }]);
check('clients on version 1 keep it', (await superuser(`select template_id, template_version from client_programs where id='${CP_V1}'`))[0], { template_id: draftId, template_version: 1 });
check('and still read it after it is retired', (await as(C1, `select t.title, a.prescription->>'reps' reps from program_templates t join program_modules m on m.template_id=t.id join program_activities a on a.module_id=m.id where t.id='${draftId}'`)), [{ title: 'Desk Reset', reps: '10' }]);
check('other clients cannot read it', (await as(C2, `select 1 from program_modules where template_id='${draftId}'`)).length, 0);
await expectDenied('a retired version cannot be republished', () => as(O, `update program_templates set status='published' where id='${draftId}'`));
await expectDenied('a retired version cannot be assigned', () => as(P, `insert into client_programs (client_id, template_id) values ('${DANA}','${draftId}')`));
await expectDenied('a practitioner without the permission cannot retire a program', () => as(P, `update program_templates set status='retired' where id='${V2}'`));
const V3 = (await one(P, `select new_program_version('${V2}') as id`)).id;
await as(P, `delete from program_templates where id='${V3}'`);
check('a draft version can be discarded', (await superuser(`select count(*)::int n from program_templates where family_id='${draftId}'`))[0].n, 2);
const V4 = (await one(P2, `select new_program_version('${V2}') as id`)).id;
const V4_ACT = (await superuser(`select a.id from program_activities a join program_modules m on m.id=a.module_id where m.template_id='${V4}'`))[0].id;
await as(P2, `select save_program_draft('${V4}', '{"title":"Desk Reset","summary":"Two weeks","service":"personal-strength-training","duration_weeks":"2"}',
  '[{"week":1,"title":"Week 1","activities":[{"id":"${V4_ACT}","kind":"exercise","title":"Chin tucks","prescription":{"reps":"12"}},{"kind":"habit","title":"Stand every hour","prescription":{}}]},
    {"week":2,"title":"Week 2","activities":[{"id":"${DR_ACT}","kind":"exercise","title":"Hijacked","prescription":{}}]}]')`);
check('a draft saves its details and content in one go', (await superuser(`select m.week, a.title, a.source_activity_id is not null as kept from program_activities a join program_modules m on m.id=a.module_id where m.template_id='${V4}' order by m.week, a.sort`)),
  [{ week: 1, title: 'Chin tucks', kept: true }, { week: 1, title: 'Stand every hour', kept: false }, { week: 2, title: 'Hijacked', kept: false }]);
check("an activity id from another version is added as new, not moved", (await superuser(`select title from program_activities where id='${DR_ACT}'`))[0].title, 'Chin tucks');
await expectDenied('a client cannot save a draft', () => as(C1, `select save_program_draft('${V4}', '{"title":"x","service":"personal-strength-training"}', '[]')`));
await expectDenied('a published version cannot be saved as a draft', () => as(O, `select save_program_draft('${V2}', '{"title":"x","service":"personal-strength-training"}', '[]')`));
await as(P2, `select save_program_draft('${V4}', '{"title":"Desk Reset","service":"personal-strength-training"}', '[]')`);
check('content left out is removed', (await superuser(`select count(*)::int n from program_modules where template_id='${V4}'`))[0].n, 0);
check('program changes are audited', (await superuser(`select count(*)::int n from audit_events where table_name='program_templates' and record_id='${V2}'`))[0].n > 0, true);

// C7b: moving a client to a newer version (progress and personalization follow each activity), client-only activities,
// and the publishing permission, which only the owner grants.
await as(P, `update client_programs set personalization='{"note":"Go gently","activities":{"${DR_ACT}":{"note":"Keep it slow"}}}' where id='${CP_V1}'`);
await as(C1, `insert into activity_logs (client_id, client_program_id, activity_id) values ('${DANA}','${CP_V1}','${DR_ACT}')`);
const V2_ACT = (await superuser(`select a.id from program_activities a join program_modules m on m.id=a.module_id where m.template_id='${V2}'`))[0].id;
await expectDenied('an unassigned practitioner cannot move a client', () => as(P2, `select move_client_program('${CP_V1}','${V2}')`));
await expectDenied('a client cannot move their own program', () => as(C1, `select move_client_program('${CP_V1}','${V2}')`));
await expectDenied("a program cannot move to a different program", () => as(P, `select move_client_program('${CP_V1}','${T_PUB}')`));
check('moving to the newer version carries completed activities over', (await one(P, `select move_client_program('${CP_V1}','${V2}') as n`)).n, 1);
check('the assignment now pins version 2', (await superuser(`select template_id, template_version from client_programs where id='${CP_V1}'`))[0], { template_id: V2, template_version: 2 });
check('personalization follows the activity', (await superuser(`select personalization from client_programs where id='${CP_V1}'`))[0].personalization, { note: 'Go gently', activities: { [V2_ACT]: { note: 'Keep it slow' } } });
check('progress follows the activity', (await superuser(`select activity_id from activity_logs where client_program_id='${CP_V1}'`)).map(r=>r.activity_id), [V2_ACT]);
check('the client reads the new version', (await as(C1, `select a.prescription->>'reps' reps from program_activities a join program_modules m on m.id=a.module_id where m.template_id='${V2}'`)).map(r=>r.reps), ['12']);
await expectDenied('a program cannot move back to an older version', () => as(P, `update client_programs set template_id='${draftId}' where id='${CP_V1}'`));
// Client-only activities
await as(P, `select save_client_activities('${CP_V1}', '[{"week":1,"kind":"habit","title":"Walk the dog after lunch","instructions":"Ten minutes is plenty."}]')`);
const CUSTOM = (await superuser(`select id, created_by from client_program_activities where client_program_id='${CP_V1}'`))[0];
check('a practitioner adds an activity for one client', CUSTOM.created_by, P);
check('the client reads it', (await as(C1, `select title from client_program_activities`)).map(r=>r.title), ['Walk the dog after lunch']);
check('an unassigned practitioner cannot', (await as(P2, `select 1 from client_program_activities`)).length, 0);
check('another client cannot', (await as(C2, `select 1 from client_program_activities`)).length, 0);
await expectDenied('a client cannot add activities to their program', () => as(C1, `insert into client_program_activities (client_id, client_program_id, week, kind, title) values ('${DANA}','${CP_V1}',1,'habit','Self-made')`));
await expectDenied('nor through the save function', () => as(C1, `select save_client_activities('${CP_V1}', '[]')`));
await as(C1, `insert into activity_logs (client_id, client_program_id, client_activity_id) values ('${DANA}','${CP_V1}','${CUSTOM.id}')`);
check('the client logs an activity added for them', (await superuser(`select count(*)::int n from activity_logs where client_activity_id='${CUSTOM.id}'`))[0].n, 1);
await expectDenied("it can't be logged against another program", () => as(C1, `insert into activity_logs (client_id, client_program_id, client_activity_id) values ('${DANA}','${CP_NEW}','${CUSTOM.id}')`));
check('a log names one activity, not two', await attempt(() => as(C1, `insert into activity_logs (client_id, client_program_id, activity_id, client_activity_id) values ('${DANA}','${CP_V1}','${V2_ACT}','${CUSTOM.id}')`)), false);
await expectDenied("an activity can't be added to another client's program", () => as(O, `insert into client_program_activities (client_id, client_program_id, week, kind, title) values ('${SAM}','${CP_V1}',1,'habit','Crossed')`));
check('client-only activities are audited', (await superuser(`select count(*)::int n from audit_events where table_name='client_program_activities'`))[0].n > 0, true);
await as(P, `select save_client_activities('${CP_V1}', '[]')`);
check('removing it removes its log', (await superuser(`select count(*)::int n from activity_logs where client_program_id='${CP_V1}' and client_activity_id is not null`))[0].n, 0);
// Publishing permission: only the owner grants it
await as(P, `update practitioners set can_publish=true where id='${P}'`);
check('a practitioner cannot grant themselves the publishing permission', (await superuser(`select can_publish from practitioners where id='${P}'`))[0].can_publish, false);
await as(O, `update practitioners set can_publish=true where id='${P}'`);
check('the owner grants it', (await superuser(`select can_publish from practitioners where id='${P}'`))[0].can_publish, true);
await as(O, `update practitioners set can_publish=false where id='${P}'`);

// C4: inviting a client to My TAB, and assigning resources and forms from TAB Practice.
await as(P, `update clients set invited_at='2000-01-01' where id='${DANA}'`);
check('the care team invites a client; time and inviter are stamped', (await superuser(`select invited_at > now() - interval '1 minute' as recent, invited_by from clients where id='${DANA}'`))[0], { recent: true, invited_by: P });
await as(P2, `update clients set invited_at=now() where id='${DANA}'`);
check('an unassigned practitioner cannot invite', (await superuser(`select invited_by from clients where id='${DANA}'`))[0].invited_by, P);
await expectDenied('a client cannot mark themselves invited', () => as(C1, `update clients set invited_at=now() where id='${DANA}'`));
await expectDenied('nor change who invited them', () => as(C1, `update clients set invited_by='${C1}' where id='${DANA}'`));
await as(P, `update clients set phone='555-0100' where id='${DANA}'`);
check('other edits keep the inviter', (await superuser(`select invited_by from clients where id='${DANA}'`))[0].invited_by, P);
check('a linked account is not yet a sign-in', (await superuser(`select activated_at from clients where id='${DANA}'`))[0].activated_at, null);
await as(C1, `select record_my_tab_sign_in()`);
const firstSignIn = (await superuser(`select activated_at from clients where id='${DANA}'`))[0].activated_at;
check('the first sign-in is recorded', firstSignIn !== null, true);
await as(C1, `select record_my_tab_sign_in()`);
check('later sign-ins keep the first', (await superuser(`select activated_at from clients where id='${DANA}'`))[0].activated_at.getTime(), firstSignIn.getTime());
await expectDenied('a client cannot set their sign-in date directly', () => as(C1, `update clients set activated_at='2020-01-01' where id='${DANA}'`));
await as(C2, `select record_my_tab_sign_in()`);
check("signing in records only the client's own record", (await superuser(`select activated_at from clients where id='${DANA}'`))[0].activated_at.getTime(), firstSignIn.getTime());
const F_DRAFT = '88888888-8888-8888-8888-888888888883';
await superuser(`insert into form_templates (id, slug, title, schema, status) values ('${F_DRAFT}','draft-form','Draft form','{}','draft')`);
await expectDenied('a draft form cannot be assigned', () => as(P, `insert into form_assignments (client_id, template_id) values ('${DANA}','${F_DRAFT}')`));
const FA = (await one(P, `insert into form_assignments (client_id, template_id, due_on) values ('${DANA}','${F_OTHER}','2026-11-01') returning id`)).id;
check('the care team assigns a published form, stamped with who', (await superuser(`select assigned_by from form_assignments where id='${FA}'`))[0].assigned_by, P);
await expectDenied('a client cannot assign themselves a form', () => as(C1, `insert into form_assignments (client_id, template_id) values ('${DANA}','${F_OTHER}')`));
await expectDenied('an assignment cannot move to another client', () => as(O, `update form_assignments set client_id='${SAM}' where id='${FA}'`));
await as(P, `delete from form_assignments where id='${FA}'`);
check('a form not yet started can be withdrawn', (await superuser(`select count(*)::int n from form_assignments where id='${FA}'`))[0].n, 0);
await expectDenied('a form the client has answered cannot be withdrawn', () => as(P, `delete from form_assignments where client_id='${DANA}' and template_id='${F_ASSIGNED}'`));
const RA = (await one(P, `insert into resource_assignments (client_id, resource_ref, title, kind, note) values ('${DANA}','/resources','Sleep and recovery','Guide','Read before Thursday') returning id`)).id;
check('the care team shares a resource, stamped with who', (await superuser(`select assigned_by from resource_assignments where id='${RA}'`))[0].assigned_by, P);
check('the client sees it', (await as(C1, `select title from resource_assignments where id='${RA}'`)).map(r=>r.title), ['Sleep and recovery']);
check('other clients do not', (await as(C2, `select 1 from resource_assignments where id='${RA}'`)).length, 0);
await expectDenied('a client cannot share resources with themselves', () => as(C1, `insert into resource_assignments (client_id, resource_ref, title) values ('${DANA}','/x','Self-assigned')`));
await as(P, `delete from resource_assignments where id='${RA}'`);
check('the care team removes a shared resource', (await superuser(`select count(*)::int n from resource_assignments where id='${RA}'`))[0].n, 0);

// C3b (SEC-019): internal notes and practitioner-only plan details live in the private schema; staff reach them only
// through functions that check the care team and audit every read.
check('the care team reads internal notes through the function', (await as(P, `select body from internal_notes('${DANA}')`)).map(r=>r.body), ['internal note']);
check('the owner reads them too', (await as(O, `select body from internal_notes('${DANA}')`)).map(r=>r.body), ['internal note']);
check('reading internal notes is audited', (await superuser(`select count(*)::int n from audit_events where action='read' and table_name='internal_notes' and actor_id='${P}'`))[0].n, 1);
await expectDenied('a client cannot read internal notes', () => as(C1, `select * from internal_notes('${DANA}')`));
await expectDenied('nor the private table directly', () => as(C1, 'select body from private.internal_notes'));
await expectDenied('staff cannot bypass the functions either', () => as(P, 'select body from private.internal_notes'));
await expectDenied('an unassigned practitioner cannot read them', () => as(P2, `select * from internal_notes('${DANA}')`));
await expectDenied('staff without two-step verification cannot read them', () => as(P, `select * from internal_notes('${DANA}')`, 'aal1'));
await expectDenied('nobody signed out can read them', async () => { await db.exec(`set role anon; select set_config('test.uid','',false)`); try { await db.query(`select * from internal_notes('${DANA}')`); } finally { await db.exec('reset role'); } });
const NOTE = (await one(P, `select add_internal_note('${DANA}', 'second internal note') id`)).id;
check('a new internal note is stamped with its author', (await superuser(`select practitioner_id from private.internal_notes where id='${NOTE}'`))[0].practitioner_id, P);
check('and audited', (await superuser(`select count(*)::int n from audit_events where table_name='internal_notes' and action='insert' and record_id='${NOTE}'`))[0].n, 1);
await expectDenied('a client cannot add internal notes', () => as(C1, `select add_internal_note('${DANA}', 'x')`));
check('internal notes can no longer go in the shared table', await attempt(() => as(P, `insert into session_notes (client_id, practitioner_id, body, visibility) values ('${DANA}','${P}','x','internal')`)), false);
check('notes written there are shared by default', (await one(P, `insert into session_notes (client_id, practitioner_id, body) values ('${DANA}','${P}','default note') returning visibility`)).visibility, 'shared');
check('reading practitioner-only plan details is audited', (await superuser(`select count(*)::int n from audit_events where action='read' and table_name='plan_private_details'`))[0].n > 0, true);

// SEC-019: the audit log is append-only, even for the database owner, and the export role can only read it.
await expectDenied('the audit log cannot be changed', () => superuser(`update audit_events set action='x' where id=(select min(id) from audit_events)`));
await expectDenied('or deleted from', () => superuser(`delete from audit_events where id=(select min(id) from audit_events)`));
await expectDenied('or truncated', () => superuser(`truncate audit_events`));
await db.exec('set role audit_reader');
check('the export role reads the audit log', (await attempt(() => db.query('select count(*) from audit_events'))), true);
check('and nothing else', (await attempt(() => db.query('select count(*) from clients'))), false);
await db.exec('reset role');

// SEC-020, INT-004: Stripe events apply in one transaction. Owner ruling 2026-10-03: a partial refund keeps access and
// flags the purchase for the owner.
const PRODUCT = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
await superuser(`insert into products (id, slug, title, kind, program_template_id, price_cents, currency) values ('${PRODUCT}','course','Course','program','${T_PUB}',9900,'usd')`);
const stripe = (id, type, obj, session = null) => superuser(`select apply_stripe_event('${id}','${type}','${JSON.stringify(obj)}'::jsonb, ${session ? `'${session}'` : 'null'}) r`).then((r) => r[0].r);
const ent = async (session) => (await superuser(`select status, needs_review, refunded_cents from entitlements where stripe_checkout_session_id='${session}'`))[0];
const meta = { client_id: SAM, product_id: PRODUCT };
await superuser(`delete from client_programs where client_id='${SAM}'`);
check('a paid checkout grants access', await stripe('evt_1', 'checkout.session.completed', { id: 'cs_1', payment_status: 'paid', customer: 'cus_sam', metadata: meta }), 'applied');
check('the purchase is active', (await ent('cs_1')).status, 'active');
check('and the program is assigned', (await superuser(`select source from client_programs where client_id='${SAM}' and template_id='${T_PUB}'`)).map(r=>r.source), ['purchased']);
check('and the Stripe customer is linked', (await superuser(`select stripe_customer_id from clients where id='${SAM}'`))[0].stripe_customer_id, 'cus_sam');
check('a repeated event does nothing', await stripe('evt_1', 'checkout.session.completed', { id: 'cs_1', payment_status: 'paid', customer: 'cus_sam', metadata: meta }), 'duplicate');
check('an unpaid checkout waits', (await stripe('evt_2', 'checkout.session.completed', { id: 'cs_2', payment_status: 'unpaid', metadata: meta }), (await ent('cs_2')).status), 'pending');
check('until the payment succeeds', (await stripe('evt_3', 'checkout.session.async_payment_succeeded', { id: 'cs_2', payment_status: 'paid', metadata: meta }), (await ent('cs_2')).status), 'active');
check('a purchased program is assigned once', (await superuser(`select count(*)::int n from client_programs where client_id='${SAM}' and template_id='${T_PUB}'`))[0].n, 1);
check('an event it cannot apply fails loudly', await attempt(() => stripe('evt_bad', 'checkout.session.completed', { id: 'cs_bad', payment_status: 'paid', metadata: {} })), false);
check('and is not marked handled, so Stripe retries it', (await superuser(`select count(*)::int n from stripe_events where id='evt_bad'`))[0].n, 0);
await superuser(`update entitlements set stripe_subscription_id='sub_1' where stripe_checkout_session_id='cs_2'`);
check('a past-due subscription pauses access', (await stripe('evt_4', 'customer.subscription.updated', { id: 'sub_1', status: 'past_due' }), (await ent('cs_2')).status), 'past_due');
check('paying resumes it', (await stripe('evt_5', 'customer.subscription.updated', { id: 'sub_1', status: 'active' }), (await ent('cs_2')).status), 'active');
check('a cancelled subscription ends it', (await stripe('evt_6', 'customer.subscription.deleted', { id: 'sub_1', status: 'canceled' }), (await ent('cs_2')).status), 'cancelled');
await stripe('evt_7', 'charge.refunded', { id: 'ch_1', amount: 9900, amount_refunded: 2000 }, 'cs_1');
check('a partial refund keeps access and flags the purchase', await ent('cs_1'), { status: 'active', needs_review: true, refunded_cents: 2000 });
const FLAGGED = (await superuser(`select id from entitlements where stripe_checkout_session_id='cs_1'`))[0].id;
await expectDenied('only the owner decides on it', () => as(P, `select resolve_purchase_review('${FLAGGED}', true)`));
await as(O, `select resolve_purchase_review('${FLAGGED}', false)`);
check('the owner can keep access', await ent('cs_1'), { status: 'active', needs_review: false, refunded_cents: 2000 });
check('the decision is stamped', (await superuser(`select reviewed_by from entitlements where id='${FLAGGED}'`))[0].reviewed_by, O);
await stripe('evt_8', 'charge.refunded', { id: 'ch_1', amount: 9900, amount_refunded: 9900 }, 'cs_1');
check('a full refund ends access', (await ent('cs_1')).status, 'refunded');
check('a refund for an unknown purchase fails loudly', await attempt(() => stripe('evt_9', 'charge.refunded', { id: 'ch_2', amount: 100, amount_refunded: 100 }, 'cs_unknown')), false);
await expectDenied('signed-in people cannot apply Stripe events', () => as(O, `select apply_stripe_event('evt_x','charge.refunded','{}'::jsonb,'cs_1')`));

console.log(`\n${failures === 0 ? "OK" : "FAILED"}: ${failures} failure(s); ${openGaps} known gap(s) open (must be 0 before Phase 2 go-live)`);
process.exit(failures ? 1 : 0);
