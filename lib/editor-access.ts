import type { Viewer } from "@/lib/portal/types";

/**
 * The content editor's front door (C38, owner ruling 2026-10-10, proposed D-077). /keystatic opens only for someone signed
 * in to TAB Practice as the owner or a website admin, in a two-step-verified session (SEC-015). Keystatic Cloud still
 * signs each editor in for saving with their own Keystatic account, and stamps every save with who made it (the fast
 * lane, C32, relies on that stamp); this gate decides who reaches the editor at all.
 */
export const EDITOR_PATH = "/keystatic";

/** The owner and website admins (proposed D-071). Practitioners ask for website changes in TAB Practice instead. */
export const canEditWebsite = (viewer: Pick<Viewer, "role"> | null | undefined): boolean => viewer?.role === "owner" || viewer?.role === "admin";

/** Where signing in may send someone afterwards: a fixed list, so the address can't be pointed anywhere else. */
const AFTER_SIGN_IN: Record<string, string> = { editor: EDITOR_PATH };
/** The `next` value to carry through sign-in, or undefined when it isn't one we know. */
export const nextParam = (next: unknown): string | undefined => (typeof next === "string" && Object.hasOwn(AFTER_SIGN_IN, next) ? next : undefined);
/** Where to go once signed in and verified. */
export const afterSignIn = (next: unknown): string => AFTER_SIGN_IN[nextParam(next) ?? ""] ?? "/practice";
/** `?next=…` for the sign-in and verify pages, or nothing. */
export const nextQuery = (next: unknown): string => (nextParam(next) ? `?next=${nextParam(next)}` : "");

/**
 * Who may open the editor, and where everyone else goes. `demo` is the preview and test sign-in (the chooser on
 * /my-tab/login). Returns null to let the viewer in, or the address to send them to.
 */
export function editorGate(viewer: Viewer | null, demo: boolean): string | null {
  if (!viewer) return demo ? "/my-tab/login" : "/practice/login?next=editor";
  if (viewer.role === "client") return demo ? "/my-tab/login" : "/practice/login?e=staff&next=editor";
  if (viewer.staffVerified === false) return "/practice/verify?next=editor";
  if (!canEditWebsite(viewer)) return "/practice/website?e=editor";
  return null;
}
