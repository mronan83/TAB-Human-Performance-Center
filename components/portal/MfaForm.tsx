"use client";

import { useActionState, useState } from "react";
import { startTotpEnrollmentAction, verifyTotpAction } from "@/app/(portal)/actions";

/** Sets up an authenticator app (QR code + code) or, once set up, asks for its current code. */
export function MfaForm({ factorId }: { factorId?: string }) {
  const [setup, setSetup] = useState<{ factorId: string; qr: string; secret: string } | null>(null);
  const [setupError, setSetupError] = useState("");
  const [starting, setStarting] = useState(false);
  const [state, action, pending] = useActionState(verifyTotpAction, undefined);
  const id = factorId ?? setup?.factorId;

  if (!id) {
    return (
      <div>
        {setupError && <p role="alert" className="mb-4 rounded-xl bg-accent-soft p-3 text-sm">{setupError}</p>}
        <button
          className="btn btn-primary w-full"
          disabled={starting}
          onClick={async () => {
            setStarting(true);
            const r = await startTotpEnrollmentAction();
            setStarting(false);
            if ("error" in r) setSetupError(r.error);
            else setSetup(r);
          }}
        >
          {starting ? "Starting…" : "Set up my authenticator app"}
        </button>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-5">
      {setup && (
        <div className="rounded-[20px] border border-border bg-white p-5">
          <p className="font-semibold">1. Scan this code with your authenticator app</p>
          {/* eslint-disable-next-line @next/next/no-img-element -- a data: URL Supabase generates; next/image adds nothing */}
          <img src={setup.qr} alt="QR code to add TAB Practice to your authenticator app" width={180} height={180} className="mx-auto mt-4" />
          <p className="mt-4 text-sm text-text-secondary">Can’t scan? Enter this key instead:</p>
          <p className="mt-1 break-all font-mono text-sm">{setup.secret}</p>
          <p className="mt-5 font-semibold">2. Enter the 6-digit code it shows</p>
        </div>
      )}
      <input type="hidden" name="factorId" value={id} />
      <div>
        <label htmlFor="code" className="field-label">6-digit code</label>
        <input id="code" name="code" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9 ]{6,7}" maxLength={7} className="field-input text-lg tracking-[0.3em]" required />
      </div>
      {state?.error && <p role="alert" className="rounded-xl bg-accent-soft p-3 text-sm">{state.error}</p>}
      <button className="btn btn-primary w-full" disabled={pending}>{pending ? "Checking…" : "Verify and continue"}</button>
    </form>
  );
}
