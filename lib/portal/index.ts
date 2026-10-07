import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { isProductionDeployment, siteConfig } from "@/config/site";
import { portalOpen } from "@/lib/settings";
import type { PortalRepository, Viewer } from "./types";
import { DEMO_CLIENT_ID, DEMO_PRACTITIONER_ID, mockRepository } from "./mock-repository";

export const isMock = () => siteConfig.portal.dataSource === "mock";
/** Demo sign-in (the chooser on /my-tab/login) instead of real accounts. Production uses real staff sign-in (C23). */
export const isDemoSignIn = () => !siteConfig.portal.realStaffSignIn;
/** TAB Practice's client screens: where client data is real, or in the demo. Production with demo data shows Settings only. */
export const clientScreensAvailable = () => !isMock() || isDemoSignIn();

/** Demo data is shared by every visitor: allowed on production only while `portal.demoOnProduction` is set. */
function assertDemoAllowed() {
  if (isProductionDeployment && !siteConfig.portal.demoOnProduction) throw new Error("My TAB demo data is disabled on production deployments.");
}

export async function getRepository(): Promise<PortalRepository> {
  if (isMock()) {
    assertDemoAllowed();
    return mockRepository;
  }
  return (await import("./supabase-repository")).supabaseRepository;
}

/** The signed-in viewer. In the demo, the sign-in chooser sets a cookie: demo client, demo practitioner, or signed out. */
export async function getViewer(): Promise<Viewer | null> {
  if (isDemoSignIn()) {
    assertDemoAllowed();
    const role = (await cookies()).get("tab_demo_role")?.value;
    if (role === "admin") return { userId: "demo-admin", role: "admin", name: "Website admin" };
    if (role !== "owner" && role !== "client") return null;
    return role === "owner"
      ? { userId: "demo-owner", role: "owner", name: "Your TAB practitioner", practitionerId: DEMO_PRACTITIONER_ID, capabilities: ["nutrition"], canPublish: true }
      : { userId: "demo-user", role: "client", name: "Dana", clientId: DEMO_CLIENT_ID };
  }
  const { createSupabaseServerClient } = await import("@/lib/supabase/server");
  const sb = await createSupabaseServerClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return null;
  const { data: profile } = await sb.from("profiles").select("role, full_name, preferred_name, mfa_required").eq("id", user.id).maybeSingle();
  const { data: client } = await sb.from("clients").select("id, preferred_name, full_name").eq("profile_id", user.id).maybeSingle();
  const role = (profile?.role ?? "client") as Viewer["role"];
  // SEC-015: staff roles count only in a session verified with two-step verification (aal2), as in current_app_role().
  let staffVerified: boolean | undefined;
  let capabilities: string[] | undefined;
  let canPublish = false;
  if (role !== "client") {
    const { data: aal } = await sb.auth.mfa.getAuthenticatorAssuranceLevel();
    staffVerified = profile?.mfa_required === false || aal?.currentLevel === "aal2";
    // Credentials that unlock gated plan types (e.g. nutrition). The database enforces the same (has_capability).
    const { data: practitioner } = role === "admin" ? { data: null } : await sb.from("practitioners").select("capabilities, can_publish").eq("id", user.id).maybeSingle();
    capabilities = practitioner?.capabilities ?? [];
    // Publishing programs: owners, or practitioners with the publishing permission (can_publish_programs() in the database).
    canPublish = role === "owner" || practitioner?.can_publish === true;
  }
  return {
    userId: user.id, role,
    name: client?.preferred_name ?? profile?.preferred_name ?? profile?.full_name ?? client?.full_name ?? "there",
    clientId: client?.id, practitionerId: role === "client" || role === "admin" ? undefined : user.id, staffVerified, capabilities, canPublish,
  };
}

export async function requireClient(): Promise<{ viewer: Viewer; clientId: string; repo: PortalRepository }> {
  if (!(await portalOpen())) redirect("/my-tab");
  const viewer = await getViewer();
  if (!viewer) redirect("/my-tab/login");
  if (!viewer.clientId) redirect(viewer.role === "client" ? "/my-tab/login?e=unlinked" : "/practice");
  return { viewer, clientId: viewer.clientId, repo: await getRepository() };
}

/** Signed-in, two-step-verified staff. Real sign-in sends people to /practice/login and /practice/verify. */
export async function requireStaffViewer(): Promise<Viewer> {
  const real = !isDemoSignIn();
  if (!siteConfig.portal.showPracticeWorkspace || (!real && !siteConfig.portal.enabled)) redirect("/my-tab");
  const viewer = await getViewer();
  if (!viewer) redirect(real ? "/practice/login" : "/my-tab/login");
  // Demo: a client who follows "Practitioner login" lands on the sign-in page, one click from the practitioner view.
  if (viewer.role === "client") redirect(real ? "/practice/login?e=staff" : "/my-tab/login");
  if (viewer.staffVerified === false) redirect("/practice/verify");
  return viewer;
}

/** Staff who work with clients: owner and practitioners. Admins are website-only (proposed D-071) and go to their page. */
export async function requireStaff(): Promise<{ viewer: Viewer; repo: PortalRepository }> {
  const viewer = await requireStaffViewer();
  if (viewer.role === "admin") redirect("/practice/website");
  if (!clientScreensAvailable()) redirect(viewer.role === "owner" ? "/practice/settings" : "/practice/website");
  return { viewer, repo: await getRepository() };
}

/** The owner only, for actions that change owner-level things (settings). Pages show non-owners a notice instead. */
export async function requireOwner(): Promise<Viewer> {
  const viewer = await requireStaffViewer();
  if (viewer.role !== "owner") throw new Error("Only the owner can do this.");
  return viewer;
}
