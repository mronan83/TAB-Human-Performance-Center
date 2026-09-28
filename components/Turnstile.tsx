"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Script from "next/script";

type TurnstileApi = {
  render: (el: HTMLElement, opts: Record<string, unknown>) => string;
  reset: (id: string) => void;
  remove: (id: string) => void;
};

/** Cloudflare Turnstile site key (SEC-013). Without it the human check is off; the other spam layers still apply. */
const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
const api = () => (window as unknown as { turnstile?: TurnstileApi }).turnstile;

/**
 * Cloudflare Turnstile for the public forms and the My TAB sign-in form. Invisible for most people; shows a one-click
 * check only when Cloudflare needs one. `action` must match the action the server passes to verifyHuman (lib/spam.ts).
 * Tokens are single-use: call reset() after every submit attempt. Render `widget` inside the form.
 */
export function useTurnstile(action: string) {
  const box = useRef<HTMLDivElement>(null);
  const id = useRef<string | null>(null);
  const [token, setToken] = useState("");
  const [blocked, setBlocked] = useState(false);

  useEffect(() => () => {
    const ts = api();
    if (ts && id.current) ts.remove(id.current);
  }, []);

  const render = () => {
    const ts = api();
    if (!ts || !box.current || id.current) return;
    id.current = ts.render(box.current, {
      sitekey: SITE_KEY,
      action,
      appearance: "interaction-only",
      callback: (t: string) => setToken(t),
      "expired-callback": () => setToken(""),
      "error-callback": () => {
        setToken("");
        setBlocked(true);
      },
    });
  };

  const reset = useCallback(() => {
    const ts = api();
    if (ts && id.current) ts.reset(id.current);
    setToken("");
  }, []);

  const widget = SITE_KEY ? (
    <>
      <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit" strategy="afterInteractive" onReady={render} onError={() => setBlocked(true)} />
      <div ref={box} />
    </>
  ) : null;

  return { enabled: !!SITE_KEY, token, blocked, reset, widget };
}
