"use client";

import { useEffect, useState } from "react";
import { BLOCKED_MESSAGE, guardFetch, onProtectedBranch } from "@/lib/keystatic-guard";

const BLOCKED_EVENT = "tab:keystatic-main-blocked";

/** Installs the save guard once, before Keystatic sends anything (lib/keystatic-guard.ts). */
export function installMainGuard() {
  const w = window as typeof window & { __tabMainGuard?: boolean };
  if (w.__tabMainGuard) return;
  w.__tabMainGuard = true;
  window.fetch = guardFetch(window.fetch.bind(window), () => window.dispatchEvent(new Event(BLOCKED_EVENT)));
}

/**
 * A notice at the foot of the editor while it shows `main`: what to do instead, before anyone types. It turns into an
 * alert if a save there is refused. It sits at the bottom so the branch menu and the save button stay reachable.
 */
export function MainBranchNotice() {
  const [onMain, setOnMain] = useState(false);
  const [blocked, setBlocked] = useState(false);
  useEffect(() => {
    // Keystatic moves between branches without a page load, so check the address as it changes.
    const check = () => setOnMain(onProtectedBranch(window.location.pathname));
    check();
    const timer = window.setInterval(check, 400);
    const onBlocked = () => setBlocked(true);
    window.addEventListener(BLOCKED_EVENT, onBlocked);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener(BLOCKED_EVENT, onBlocked);
    };
  }, []);
  useEffect(() => {
    if (!onMain) setBlocked(false);
  }, [onMain]);
  if (!onMain) return null;
  return (
    <div
      role={blocked ? "alert" : "status"}
      className="on-dark fixed inset-x-3 bottom-3 z-[1000] mx-auto max-w-2xl rounded-2xl bg-olive p-4 text-sm text-white shadow-[var(--shadow-md)] sm:p-5"
    >
      <p className="font-semibold">{blocked ? "Not saved: you’re on main" : "You’re looking at main, the live website"}</p>
      <p className="mt-1">{blocked ? BLOCKED_MESSAGE : "Saving here is turned off. To make a change: open the branch menu, choose New branch, give it a short name (e.g. first-massage-guide), then edit and save."}</p>
    </div>
  );
}
