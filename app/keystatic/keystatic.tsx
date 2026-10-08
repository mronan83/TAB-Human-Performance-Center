"use client";

import { makePage } from "@keystatic/next/ui/app";
import config from "../../keystatic.config";
import { MainBranchNotice, installMainGuard } from "@/components/KeystaticMainGuard";

// Before Keystatic sends anything: commits to main are refused in the browser (lib/keystatic-guard.ts).
if (typeof window !== "undefined") installMainGuard();

const Keystatic = makePage(config);

/** The Keystatic editing app (proposed D-069), rendered in the browser, with saving on main turned off. */
export default function KeystaticApp() {
  return (
    <>
      <Keystatic />
      <MainBranchNotice />
    </>
  );
}
