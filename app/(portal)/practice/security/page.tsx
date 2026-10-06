import { requireStaffViewer, isDemoSignIn } from "@/lib/portal";
import { PageTitle, Panel } from "@/components/portal/ui";
import { PasskeyManager, SetPasswordForm } from "@/components/portal/StaffAuth";
import { STAFF_SESSION_MAX_DAYS, sessionStartedAt } from "@/lib/staff-auth";
import { SESSION_MAX_AGE_SECONDS } from "@/lib/supabase/cookies";

export const metadata = { title: "Sign-in & security" };

const day = (d: string | number | Date) => new Date(d).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "America/Detroit" });
const IDLE_DAYS = Math.round(SESSION_MAX_AGE_SECONDS / 86400);

/**
 * Every staff member's own sign-in settings (proposed D-068): a password for step 1, passkeys for step 2 (the
 * authenticator app stays as the backup), and how long a session lasts.
 */
export default async function SecurityPage() {
  await requireStaffViewer();
  const lead = `Sign in with your email and password, then confirm it’s you with a passkey or your authenticator app. Sessions end after ${IDLE_DAYS} days without use, and ${STAFF_SESSION_MAX_DAYS} days after signing in at the most.`;
  if (isDemoSignIn()) {
    return (
      <>
        <PageTitle eyebrow="TAB Practice" title="Sign-in & security" lead={lead} />
        <Panel><p>Demo: passwords and passkeys apply to real TAB Practice accounts only, so there’s nothing to set here.</p></Panel>
      </>
    );
  }
  const { createSupabaseServerClient } = await import("@/lib/supabase/server");
  const sb = await createSupabaseServerClient();
  const [{ data: { user } }, { data: factors }, { data: claims }] = await Promise.all([sb.auth.getUser(), sb.auth.mfa.listFactors(), sb.auth.getClaims()]);
  const setAt = typeof user?.user_metadata?.password_set_at === "string" ? user.user_metadata.password_set_at : null;
  const totp = factors?.totp?.find((f) => f.status === "verified");
  const passkeys = (factors?.webauthn ?? []).filter((f) => f.status === "verified").map((f) => ({ id: f.id, name: f.friendly_name || "Passkey", added: day(f.created_at) }));
  const started = sessionStartedAt(claims?.claims?.amr);
  return (
    <>
      <PageTitle eyebrow="TAB Practice" title="Sign-in & security" lead={lead} />
      <div className="grid gap-6">
        <Panel title="Password">
          <p className="mb-5 text-text-secondary">
            {setAt ? `Last changed ${day(setAt)}.` : "No password yet. Set one to sign in without waiting for an emailed link."}
          </p>
          <SetPasswordForm hasPassword={!!setAt} email={user?.email ?? ""} />
        </Panel>
        <Panel title="Passkeys">
          <p className="mb-5 text-text-secondary">
            A passkey confirms it’s you with Face ID, Touch ID, Windows Hello or your phone, instead of typing the 6-digit code. Add one on each computer or phone you use for TAB Practice.
          </p>
          <PasskeyManager passkeys={passkeys} />
        </Panel>
        <Panel title="Authenticator app">
          <p>{totp ? `Set up ${day(totp.created_at)}. It’s your backup when a passkey isn’t available, and it confirms password changes.` : "Not set up yet. You’ll be asked to set it up at your next sign-in."}</p>
        </Panel>
        <Panel title="This session">
          <p>{started ? `Signed in ${day(started * 1000)}. You’ll be asked to sign in again by ${day((started + STAFF_SESSION_MAX_DAYS * 86400) * 1000)}, or sooner after ${IDLE_DAYS} days without use.` : "Signed in."}</p>
        </Panel>
      </div>
    </>
  );
}
