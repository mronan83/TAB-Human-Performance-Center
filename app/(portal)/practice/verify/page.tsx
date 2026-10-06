import { redirect } from "next/navigation";
import { getViewer, isDemoSignIn } from "@/lib/portal";
import { SignInFrame } from "@/components/portal/SignInFrame";
import { MfaForm } from "@/components/portal/MfaForm";
import { SecondStep } from "@/components/portal/StaffAuth";
import { PASSKEYS_AVAILABLE } from "@/lib/staff-auth";

export const metadata = { title: "Two-step verification", robots: { index: false, follow: false } };

/**
 * SEC-015: staff work only in two-step-verified sessions. First visit: set up an authenticator app (QR code). After
 * that: a passkey if one is set up (proposed D-068), or the app's 6-digit code. The database enforces the same rule in
 * current_app_role().
 */
export default async function VerifyPage() {
  if (isDemoSignIn()) redirect("/my-tab/login");
  const viewer = await getViewer();
  if (!viewer) redirect("/practice/login");
  if (viewer.role === "client") redirect("/practice/login?e=staff");
  if (viewer.staffVerified) redirect("/practice");
  const { createSupabaseServerClient } = await import("@/lib/supabase/server");
  const { data } = await (await createSupabaseServerClient()).auth.mfa.listFactors();
  const factor = data?.totp?.find((f) => f.status === "verified");
  // Passkeys come after the authenticator app, which stays as the backup.
  const passkeys = factor && PASSKEYS_AVAILABLE ? (data?.webauthn ?? []).filter((f) => f.status === "verified").map((f) => ({ id: f.id, name: f.friendly_name || "Passkey" })) : [];
  return (
    <SignInFrame>
      <h1 className="text-h2 mt-8 text-center lg:mt-0 lg:text-left">Two-step verification</h1>
      <p className="mb-8 mt-2 text-center text-text-secondary lg:text-left">
        {factor && passkeys.length
          ? "Confirm it’s you with your passkey (Face ID, Touch ID or Windows Hello), or the 6-digit code from your authenticator app."
          : factor
          ? "Enter the 6-digit code from your authenticator app."
          : "TAB Practice protects client information with a second step. Set up an authenticator app once, such as Google Authenticator, Microsoft Authenticator or 1Password."}
      </p>
      <SecondStep passkeys={passkeys} codeForm={<MfaForm factorId={factor?.id} />} />
    </SignInFrame>
  );
}
