import { requireStaffViewer, isDemoSignIn, isMock } from "@/lib/portal";
import { getSettings } from "@/lib/settings";
import { privacyPolicy } from "@/content/legal";
import { services } from "@/content/services";
import { PageTitle, Panel } from "@/components/portal/ui";
import { SettingsForm } from "@/components/portal/SettingsForm";
import { listAdmins } from "@/lib/admins";
import { InviteAdminForm, RemoveAdminButton } from "@/components/portal/WebsiteForms";

export const metadata = { title: "Settings" };

/** Website admins (proposed D-071): website requests, website stats and the content editor; never client data. */
async function Admins() {
  const admins = await listAdmins();
  return (
    <Panel title="Website admins" className="mt-8">
      <p className="max-w-2xl text-text-secondary">
        An admin can ask for website changes and follow them, see the website stats and, once it arrives, edit content in the
        content editor. Admins never see client records, Settings or the Team page. They sign in with a password and the
        6-digit code, like you.
      </p>
      {admins.length > 0 && (
        <ul className="mt-5 divide-y divide-border rounded-xl border border-border">
          {admins.map((a) => (
            <li key={a.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
              <span><span className="font-semibold">{a.name}</span> <span className="text-text-secondary">· {a.email}</span></span>
              <RemoveAdminButton id={a.id} name={a.name} />
            </li>
          ))}
        </ul>
      )}
      <div className="mt-6"><InviteAdminForm /></div>
    </Panel>
  );
}

/**
 * Owner settings (C23, proposed D-067). The client portal switch shows the go-live gate (guardrail 4) next to it:
 * Live can be chosen only in a build whose client data is real, which is itself a reviewed change behind that gate.
 */
export default async function SettingsPage() {
  const viewer = await requireStaffViewer();
  if (viewer.role !== "owner") {
    return (
      <>
        <PageTitle eyebrow="TAB Practice" title="Settings" />
        <Panel><p>Only the owner can change TAB’s settings. To ask for a website change, use <a href="/practice/website" className="text-primary underline">Website changes</a>.</p></Panel>
      </>
    );
  }
  const settings = await getSettings();
  const gate = [
    { label: "Client data runs on the secure database, not demo data", done: !isMock() },
    { label: "Two-step verification required for every staff account", done: true },
    { label: "Security checks pass with no known gaps (checked on every change)", done: !isMock() },
    { label: "Paid database plan with daily backups and a tested restore", done: !isMock() },
    { label: "Privacy policy approved and covering My TAB", done: !privacyPolicy.draft },
  ];
  return (
    <>
      <PageTitle eyebrow="TAB Practice" title="Settings" lead="Changes take effect on the website within a few seconds. Every change is recorded with who made it and when." />
      {isDemoSignIn() && (
        <p className="mb-6 rounded-xl bg-note-soft p-4 text-sm">
          Demo: changes here affect only this preview and reset when it restarts. The live site’s settings change at {""}
          <span className="font-semibold">tabhumanperformance.com/practice/settings</span>.
        </p>
      )}
      <SettingsForm settings={settings} gate={gate} canGoLive={!isMock()} services={services.map((s) => ({ slug: s.slug, name: s.name }))} />
      <Admins />
    </>
  );
}
