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
insert into session_notes (client_id, practitioner_id, body, visibility) values
 ('${DANA}','${P}','internal note','internal'),('${DANA}','${P}','shared summary','shared');
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
const DENIED = /row-level security|Nutrition plans need|A service plan must|permission denied|Only the owner can change|Clients may only update|You can change only your name|Clients can only save or submit|was not assigned to you|belongs to another client|Consent records are kept|Submitted answers cannot be changed|kept indefinitely/i;
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
await as(P, `insert into plan_private_details (plan_id, client_id, details) values ('${MASSAGE}','${DANA}','{"contraindications":"practitioner-only note"}')`);
check('client reads shared plan sections', (await as(C1, `select details->>'focus_areas' f from wellness_plans where id='${MASSAGE}'`)).map(r=>r.f), ['upper back']);
check('client cannot read practitioner-only sections', (await as(C1, 'select details from plan_private_details')).length, 0);
check('care team reads practitioner-only sections', (await as(P, 'select details->>\'contraindications\' c from plan_private_details')).map(r=>r.c), ['practitioner-only note']);
check('unassigned practitioner cannot read them', (await as(P2, 'select 1 from plan_private_details')).length, 0);
check('other client sees none of it', (await as(C2, `select 1 from wellness_plans where id='${MASSAGE}'`)).length, 0);
await expectDenied('client cannot write practitioner-only sections', () => as(C1, `insert into plan_private_details (plan_id, client_id) values ('${ANCHOR}','${DANA}')`));
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
await expectDenied('nor practitioner-only nutrition sections', () => as(P, `insert into plan_private_details (plan_id, client_id) values ('${NUTRITION}','${DANA}')`));
await expectDenied('practitioner-only sections cannot be truncated', () => as(O, 'truncate plan_private_details'));
check('plan log and private sections are audited', (await superuser(`select count(distinct table_name)::int n from audit_events where table_name in ('plan_entries','plan_private_details')`))[0].n, 2);

console.log(`\n${failures === 0 ? "OK" : "FAILED"}: ${failures} failure(s); ${openGaps} known gap(s) open (must be 0 before Phase 2 go-live)`);
process.exit(failures ? 1 : 0);
