"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  finishPasskeyRegistrationAction, finishPasskeySignInAction, removePasskeyAction, setPasswordAction, signInWithPasswordAction,
  startPasskeyRegistrationAction, startPasskeySignInAction,
} from "@/app/(portal)/actions";
import { useTurnstile } from "@/components/Turnstile";
import { passkeysSupported, runPasskey } from "@/lib/passkey-browser";
import { PASSWORD_MIN } from "@/lib/staff-auth";
import { siteConfig } from "@/config/site";

/** Which passkey this browser made, so the second step offers it first. Holds a factor id only, nothing secret. */
const DEVICE_KEY = "tab-passkey-factor";
const readDevicePasskey = () => { try { return localStorage.getItem(DEVICE_KEY); } catch { return null; } };
const rememberDevicePasskey = (id: string | null) => { try { if (id) localStorage.setItem(DEVICE_KEY, id); else localStorage.removeItem(DEVICE_KEY); } catch { /* private mode */ } };

/** TAB Practice sign-in, step 1 (proposed D-068): email and password, with the public-form defenses (SEC-013). */
export function PasswordSignInForm() {
  const [state, action, pending] = useActionState(signInWithPasswordAction, undefined);
  const turnstile = useTurnstile("login");
  const [waitMessage, setWaitMessage] = useState("");
  const { reset } = turnstile;
  useEffect(() => { if (state) reset(); }, [state, reset]); // tokens are single-use
  const error = waitMessage || state?.error;
  return (
    <form
      action={action}
      className="space-y-4"
      onSubmit={(e) => {
        if (!turnstile.enabled || turnstile.token) return setWaitMessage("");
        e.preventDefault();
        setWaitMessage(turnstile.blocked
          ? `Our spam check couldn’t load (a browser extension may be blocking it). Please email ${siteConfig.contact.email} for help.`
          : "Just a moment: we’re checking this is a real browser. Please try again in a few seconds.");
      }}
    >
      <div><label htmlFor="pwEmail" className="field-label">Email</label><input id="pwEmail" name="email" type="email" className="field-input" autoComplete="username" required /></div>
      <div><label htmlFor="pwPassword" className="field-label">Password</label><input id="pwPassword" name="password" type="password" className="field-input" autoComplete="current-password" required /></div>
      {/* Honeypot: off-screen, hidden from assistive technology and skipped by keyboard. */}
      <div aria-hidden="true" className="absolute -left-[10000px] h-px w-px overflow-hidden">
        <label htmlFor="pwWebsite">Leave this field empty</label>
        <input id="pwWebsite" type="text" name="website" tabIndex={-1} autoComplete="off" />
      </div>
      <input type="hidden" name="turnstileToken" value={turnstile.token} />
      {turnstile.widget}
      {error && <p role="alert" className="text-sm font-semibold text-danger">{error}</p>}
      <button className="btn btn-primary w-full" disabled={pending}>{pending ? "Signing in…" : "Sign in"}</button>
    </form>
  );
}

type Passkey = { id: string; name: string };

/** Step 2 with a passkey. The one this browser made comes first; others (a phone, say) are listed by name. */
export function PasskeyVerify({ passkeys, onUseCode }: { passkeys: Passkey[]; onUseCode?: () => void }) {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [supported, setSupported] = useState(true);
  const [mine, setMine] = useState<string | null>(null);
  useEffect(() => { setSupported(passkeysSupported()); setMine(readDevicePasskey()); }, []);
  if (!supported) return null;
  const ordered = [...passkeys].sort((a, b) => Number(b.id === mine) - Number(a.id === mine));

  async function use(id: string) {
    setBusy(true);
    setError("");
    const start = await startPasskeySignInAction(id);
    if ("error" in start) { setBusy(false); return setError(start.error); }
    const r = await runPasskey("request", start.options);
    if ("error" in r) { setBusy(false); return setError(r.error === "cancelled" ? "" : r.error); }
    const done = await finishPasskeySignInAction(start.factorId, start.challengeId, r.credential); // redirects on success
    setBusy(false);
    if (done?.error) setError(done.error);
  }

  return (
    <div className="space-y-3">
      {ordered.map((p, i) => (
        <button key={p.id} type="button" className={i === 0 ? "btn btn-primary w-full" : "btn btn-outline w-full"} disabled={busy} onClick={() => use(p.id)}>
          {busy ? "Waiting for your passkey…" : ordered.length === 1 ? "Use my passkey" : `Use passkey: ${p.name}`}
        </button>
      ))}
      {error && <p role="alert" className="rounded-xl bg-accent-soft p-3 text-sm">{error}</p>}
      {onUseCode && <button type="button" className="text-sm font-semibold underline" onClick={onUseCode}>Use the 6-digit code instead</button>}
    </div>
  );
}

/** Passkeys on the account: add one for this device, or remove a lost or replaced one. */
export function PasskeyManager({ passkeys }: { passkeys: (Passkey & { added: string })[] }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [message, setMessage] = useState<{ tone: "ok" | "error"; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [supported, setSupported] = useState(true);
  const [mine, setMine] = useState<string | null>(null);
  useEffect(() => { setSupported(passkeysSupported()); setMine(readDevicePasskey()); }, []);

  async function add() {
    setBusy(true);
    setMessage(null);
    const start = await startPasskeyRegistrationAction(name || "This device");
    if ("error" in start) { setBusy(false); return setMessage({ tone: "error", text: start.error }); }
    const r = await runPasskey("create", start.options);
    if ("error" in r) { setBusy(false); return setMessage(r.error === "cancelled" ? null : { tone: "error", text: r.error }); }
    const done = await finishPasskeyRegistrationAction(start.factorId, start.challengeId, r.credential);
    setBusy(false);
    if ("error" in done) return setMessage({ tone: "error", text: done.error });
    rememberDevicePasskey(start.factorId);
    setName("");
    setMessage({ tone: "ok", text: "Passkey added. Next time, confirm your sign-in with it instead of the code." });
    router.refresh();
  }

  async function remove(id: string) {
    setBusy(true);
    const done = await removePasskeyAction(id);
    setBusy(false);
    if ("error" in done) return setMessage({ tone: "error", text: done.error });
    if (id === mine) { rememberDevicePasskey(null); setMine(null); }
    setMessage({ tone: "ok", text: "Passkey removed." });
    router.refresh();
  }

  return (
    <div className="space-y-5">
      {passkeys.length > 0 ? (
        <ul className="divide-y divide-border rounded-[20px] border border-border">
          {passkeys.map((p) => (
            <li key={p.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
              <div>
                <p className="font-semibold">{p.name}{p.id === mine && <span className="ml-2 text-sm font-normal text-text-secondary">(this device)</span>}</p>
                <p className="text-sm text-text-secondary">Added {p.added}</p>
              </div>
              <button type="button" className="btn btn-outline" disabled={busy} onClick={() => remove(p.id)} aria-label={`Remove passkey ${p.name}`}>Remove</button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-text-secondary">No passkeys yet.</p>
      )}
      {supported ? (
        <div className="flex flex-wrap items-end gap-3">
          <div className="min-w-[220px] flex-1">
            <label htmlFor="passkeyName" className="field-label">Name for this device</label>
            <input id="passkeyName" className="field-input" placeholder="e.g. MacBook or iPhone" maxLength={40} value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <button type="button" className="btn btn-primary" disabled={busy} onClick={add}>{busy ? "Waiting for your device…" : "Add a passkey on this device"}</button>
        </div>
      ) : (
        <p className="text-sm text-text-secondary">This browser can’t create passkeys. Try Safari, Chrome or Edge on a current device.</p>
      )}
      {message && <p role={message.tone === "error" ? "alert" : "status"} className={message.tone === "error" ? "rounded-xl bg-accent-soft p-3 text-sm" : "rounded-xl bg-success-soft p-3 text-sm font-medium text-success"}>{message.text}</p>}
    </div>
  );
}

/** Sets or changes the password, confirmed with a fresh authenticator code. */
export function SetPasswordForm({ hasPassword, email }: { hasPassword: boolean; email: string }) {
  const [state, action, pending] = useActionState(setPasswordAction, undefined);
  if (state?.ok) return <p role="status" className="rounded-xl bg-success-soft p-4 font-medium text-success">Password saved. Use it with your email next time you sign in. We’ve emailed you a security notice.</p>;
  return (
    <form action={action} className="space-y-4">
      {/* Lets password managers file the new password under the right account. */}
      <input type="email" name="username" autoComplete="username" value={email} hidden readOnly />
      <div>
        <label htmlFor="newPassword" className="field-label">{hasPassword ? "New password" : "Password"}</label>
        <input id="newPassword" name="password" type="password" className="field-input" autoComplete="new-password" minLength={PASSWORD_MIN} required aria-describedby="passwordHint" />
        <p id="passwordHint" className="mt-1 text-sm text-text-secondary">At least {PASSWORD_MIN} characters. A short phrase works well; let your password manager save it.</p>
      </div>
      <div><label htmlFor="confirmPassword" className="field-label">Type it again</label><input id="confirmPassword" name="confirm" type="password" className="field-input" autoComplete="new-password" required /></div>
      <div>
        <label htmlFor="passwordCode" className="field-label">6-digit code from your authenticator app</label>
        <input id="passwordCode" name="code" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9 ]{6,7}" maxLength={7} className="field-input tracking-[0.3em]" required />
      </div>
      {state?.error && <p role="alert" className="rounded-xl bg-accent-soft p-3 text-sm">{state.error}</p>}
      <button className="btn btn-primary" disabled={pending}>{pending ? "Saving…" : hasPassword ? "Change password" : "Set password"}</button>
    </form>
  );
}

/** Step 2: the passkey when there is one (the 6-digit code one click away), otherwise the code. */
export function SecondStep({ passkeys, codeForm }: { passkeys: Passkey[]; codeForm: React.ReactNode }) {
  const [useCode, setUseCode] = useState(passkeys.length === 0);
  const [supported, setSupported] = useState(true);
  useEffect(() => setSupported(passkeysSupported()), []);
  if (useCode || !supported) return <>{codeForm}</>;
  return <PasskeyVerify passkeys={passkeys} onUseCode={() => setUseCode(true)} />;
}
