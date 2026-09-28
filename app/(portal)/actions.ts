"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireClient, requireStaff, isMock } from "@/lib/portal";
import { siteUrl } from "@/config/site";
import type { Consent } from "@/lib/portal/types";
import type { ServiceSlug } from "@/content/services";
import { routingOptions, type RoutingOutcome } from "@/lib/inquiry";

export async function toggleActivityAction(programId: string, activityId: string, done: boolean) {
  const { clientId, repo } = await requireClient();
  await repo.toggleActivity(clientId, programId, activityId, done);
  revalidatePath("/my-tab", "layout");
}

export async function saveCheckInAction(_prev: unknown, fd: FormData) {
  const { clientId, repo } = await requireClient();
  const num = (k: string) => { const v = Number(fd.get(k)); return Number.isFinite(v) && v > 0 ? v : undefined; };
  const str = (k: string) => (String(fd.get(k) ?? "").trim() || undefined);
  await repo.saveCheckIn(clientId, { weekOf: String(fd.get("weekOf")), energy: num("energy"), sleepQuality: num("sleepQuality"), stress: num("stress"), wins: str("wins"), challenges: str("challenges"), supportNeeded: str("supportNeeded") });
  revalidatePath("/my-tab", "layout");
  return { ok: true };
}

export async function submitFormAction(slug: string, answers: Record<string, unknown>, final: boolean) {
  const { clientId, repo } = await requireClient();
  await repo.submitForm(clientId, slug, answers, final);
  revalidatePath("/my-tab", "layout");
  return { ok: true };
}

export async function setConsentAction(type: Consent["type"], granted: boolean) {
  const { clientId, repo } = await requireClient();
  await repo.setConsent(clientId, type, granted);
  revalidatePath("/my-tab/profile");
}

export async function updateContactAction(_prev: unknown, fd: FormData) {
  const { clientId, repo } = await requireClient();
  await repo.updateContact(clientId, { preferredName: String(fd.get("preferredName") ?? "").trim(), phone: String(fd.get("phone") ?? "").trim() });
  revalidatePath("/my-tab", "layout");
  return { ok: true };
}

export async function addNoteAction(clientId: string, _prev: unknown, fd: FormData) {
  const { viewer, repo } = await requireStaff();
  const body = String(fd.get("body") ?? "").trim();
  if (!body) return { ok: false, error: "Write a note first." };
  await repo.addNote(clientId, viewer, { body, visibility: fd.get("visibility") === "shared" ? "shared" : "internal", service: (fd.get("service") || undefined) as ServiceSlug | undefined });
  revalidatePath(`/practice/clients/${clientId}`);
  return { ok: true };
}

/** Start and contact submissions: only the owner records the next step and links client records (RLS enforces the same). */
async function requireOwner() {
  const staff = await requireStaff();
  if (staff.viewer.role !== "owner") throw new Error("Only the owner can manage submissions.");
  return staff;
}
const revalidateInquiry = (id: string) => { revalidatePath("/practice/inquiries"); revalidatePath(`/practice/inquiries/${id}`); };

export async function routeInquiryAction(id: string, fd: FormData) {
  const { repo } = await requireOwner();
  const raw = String(fd.get("outcome") ?? "");
  const outcome = routingOptions.some((o) => o.value === raw) ? (raw as RoutingOutcome) : null;
  const note = String(fd.get("note") ?? "").trim().slice(0, 2000) || undefined;
  await repo.routeInquiry(id, outcome, note);
  revalidateInquiry(id);
}

export async function linkInquiryAction(id: string, clientId: string) {
  const { repo } = await requireOwner();
  await repo.linkInquiries(id, clientId);
  revalidateInquiry(id);
  revalidatePath("/practice");
}

export async function createClientFromInquiryAction(id: string) {
  const { repo } = await requireOwner();
  await repo.createClientFromInquiry(id);
  revalidateInquiry(id);
  revalidatePath("/practice");
}

/** Demo only: switch between the client and practitioner views. */
export async function setDemoRoleAction(role: "client" | "owner") {
  if (!isMock()) return;
  (await cookies()).set("tab_demo_role", role, { path: "/", sameSite: "lax" });
  redirect(role === "owner" ? "/practice" : "/my-tab");
}

/** Passwordless sign-in (email link). MFA enrollment is enforced for staff per D-042 infrastructure plan. */
export async function sendMagicLinkAction(_prev: unknown, fd: FormData) {
  const email = String(fd.get("email") ?? "").trim();
  if (!/^\S+@\S+\.\S+$/.test(email)) return { ok: false, error: "Enter a valid email address." };
  const { createSupabaseServerClient } = await import("@/lib/supabase/server");
  const sb = await createSupabaseServerClient();
  const { error } = await sb.auth.signInWithOtp({ email, options: { shouldCreateUser: false, emailRedirectTo: `${siteUrl}/my-tab/auth/callback` } });
  // Same response whether or not the account exists, to avoid revealing who is a client.
  if (error && !/not found|signups not allowed/i.test(error.message)) console.error("[auth]", error.message);
  return { ok: true };
}

export async function signOutAction() {
  if (!isMock()) {
    const { createSupabaseServerClient } = await import("@/lib/supabase/server");
    await (await createSupabaseServerClient()).auth.signOut();
  }
  redirect("/");
}
