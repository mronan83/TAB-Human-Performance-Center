import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { isProductionDeployment, siteConfig } from "@/config/site";
import type { PortalRepository, Viewer } from "./types";
import { DEMO_CLIENT_ID, DEMO_PRACTITIONER_ID, mockRepository } from "./mock-repository";

export const isMock = () => siteConfig.portal.dataSource === "mock";

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

/** The signed-in viewer. In mock mode the demo sign-in sets a cookie: demo client, demo practitioner, or signed out. */
export async function getViewer(): Promise<Viewer | null> {
  if (isMock()) {
    assertDemoAllowed();
    const role = (await cookies()).get("tab_demo_role")?.value;
    if (role !== "owner" && role !== "client") return null;
    return role === "owner"
      ? { userId: "demo-owner", role: "owner", name: "Your TAB practitioner", practitionerId: DEMO_PRACTITIONER_ID }
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
  if (role !== "client") {
    const { data: aal } = await sb.auth.mfa.getAuthenticatorAssuranceLevel();
    staffVerified = profile?.mfa_required === false || aal?.currentLevel === "aal2";
  }
  return {
    userId: user.id, role,
    name: client?.preferred_name ?? profile?.preferred_name ?? profile?.full_name ?? client?.full_name ?? "there",
    clientId: client?.id, practitionerId: role === "client" ? undefined : user.id, staffVerified,
  };
}

export async function requireClient(): Promise<{ viewer: Viewer; clientId: string; repo: PortalRepository }> {
  if (!siteConfig.portal.enabled) redirect("/my-tab");
  const viewer = await getViewer();
  if (!viewer) redirect("/my-tab/login");
  if (!viewer.clientId) redirect(viewer.role === "client" ? "/my-tab/login?e=unlinked" : "/practice");
  return { viewer, clientId: viewer.clientId, repo: await getRepository() };
}

export async function requireStaff(): Promise<{ viewer: Viewer; repo: PortalRepository }> {
  if (!siteConfig.portal.enabled || !siteConfig.portal.showPracticeWorkspace) redirect("/my-tab");
  const viewer = await getViewer();
  if (!viewer) redirect("/my-tab/login");
  // Demo: a client who follows "Practitioner login" lands on the sign-in page, one click from the practitioner view.
  if (viewer.role === "client") redirect(isMock() ? "/my-tab/login" : "/my-tab");
  if (viewer.staffVerified === false) redirect("/my-tab/login?e=mfa");
  return { viewer, repo: await getRepository() };
}
