import { siteConfig, siteUrl } from "@/config/site";
import { sendAdminInviteEmail } from "@/lib/email";

/**
 * Website admins (owner ruling 2026-10-07, proposed D-071: "admin account"; "Website only"). The owner invites and
 * removes them in TAB Practice → Settings. An admin is a profile with role 'admin': website requests, website stats and
 * the content editor, no client data (supabase/migrations/20261013000000_website_requests.sql). Role changes go
 * through the owner's own session, so row-level security and guard_profile_update check them again; only creating the
 * sign-in link needs the service role.
 */

export type Admin = { id: string; name: string; email: string; invitedAt?: string };
export type InviteOutcome = { ok: true; message: string } | { ok: false; error: string };

const usesDemo = () => !siteConfig.portal.realStaffSignIn;
const demoAdmins: Admin[] = [{ id: "demo-admin", name: "Website admin", email: "admin@example.com" }];

export const isEmail = (v: string) => v.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

async function ownerDb() {
  const { createSupabaseServerClient } = await import("@/lib/supabase/server");
  return createSupabaseServerClient();
}

export async function listAdmins(): Promise<Admin[]> {
  if (usesDemo()) return demoAdmins;
  const { data, error } = await (await ownerDb()).from("profiles").select("id, full_name, email, created_at").eq("role", "admin").order("full_name");
  if (error) throw new Error(error.message);
  return (data ?? []).map((r) => ({ id: r.id, name: r.full_name ?? r.email ?? "Admin", email: r.email ?? "", invitedAt: r.created_at }));
}

/**
 * Invites an admin: a single-use sign-in link by email, then the admin role on their profile. Refuses an address that
 * belongs to a client record or to existing staff, so the role can never be added to someone's client account.
 */
export async function inviteAdmin(name: string, email: string): Promise<InviteOutcome> {
  if (usesDemo()) {
    if (!demoAdmins.some((a) => a.email === email)) demoAdmins.push({ id: `demo-admin-${demoAdmins.length + 1}`, name, email });
    return { ok: true, message: `Demo: ${name} is listed as an admin. No email is sent from a preview.` };
  }
  const sb = await ownerDb();
  const exact = email.replace(/[%_\\]/g, "\\$&"); // ilike, case-insensitive, with its wildcards escaped
  const { data: existing } = await sb.from("profiles").select("id, role").ilike("email", exact).maybeSingle();
  if (existing && (existing.role === "owner" || existing.role === "practitioner")) return { ok: false, error: "That address already belongs to TAB staff." };
  const { data: client } = await sb.from("clients").select("id").ilike("email", exact).limit(1).maybeSingle();
  if (client) return { ok: false, error: "That address belongs to a client record. Use a separate work address for an admin." };
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return { ok: false, error: "Inviting needs the server key, which isn't set on this deployment." };

  const { createSupabaseServiceClient } = await import("@/lib/supabase/server");
  const admin = await createSupabaseServiceClient();
  const redirectTo = `${siteUrl}/practice/auth/callback`;
  // A new person gets an invitation link; someone who already has a (non-client) login gets a sign-in link.
  let link = await admin.auth.admin.generateLink({ type: "invite", email, options: { redirectTo, data: { full_name: name } } });
  let type: "invite" | "magiclink" = "invite";
  if (link.error && /already|registered|exists/i.test(link.error.message)) {
    link = await admin.auth.admin.generateLink({ type: "magiclink", email, options: { redirectTo } });
    type = "magiclink";
  }
  if (link.error || !link.data.user || !link.data.properties?.hashed_token) {
    console.error("[admins] link failed", link.error?.message);
    return { ok: false, error: "We couldn't create the invitation. Please try again." };
  }
  const { data: updated, error } = await sb.from("profiles").update({ role: "admin", full_name: name, mfa_required: true }).eq("id", link.data.user.id).select("id");
  if (error || !updated?.length) {
    console.error("[admins] role not granted", error?.message);
    return { ok: false, error: "We couldn't give them the admin role. Please try again." };
  }
  const url = `${redirectTo}?token_hash=${encodeURIComponent(link.data.properties.hashed_token)}&type=${type}`;
  const sent = await sendAdminInviteEmail(email, name, url);
  return sent === "sent"
    ? { ok: true, message: `Invitation sent to ${email}. The link works once, for 24 hours.` }
    : { ok: false, error: "They're set up as an admin, but the email didn't send. Invite them again to resend it." };
}

/** Removes the admin role. Their login stays, with no staff access; they can be invited again later. */
export async function removeAdmin(id: string): Promise<void> {
  if (usesDemo()) {
    const i = demoAdmins.findIndex((a) => a.id === id);
    if (i >= 0) demoAdmins.splice(i, 1);
    return;
  }
  const { data, error } = await (await ownerDb()).from("profiles").update({ role: "client" }).eq("id", id).eq("role", "admin").select("id");
  if (error) throw new Error(error.message);
  if (!data?.length) throw new Error("That person isn't an admin.");
}
