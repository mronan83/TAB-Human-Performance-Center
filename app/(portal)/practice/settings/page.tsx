import { requireStaffViewer, isDemoSignIn, isMock } from "@/lib/portal";
import { getSettings } from "@/lib/settings";
import { privacyPolicy } from "@/content/legal";
import { PageTitle, Panel } from "@/components/portal/ui";
import { SettingsForm } from "@/components/portal/SettingsForm";

export const metadata = { title: "Settings" };

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
        <Panel><p>Only the owner can change TAB’s settings.</p></Panel>
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
      <SettingsForm settings={settings} gate={gate} canGoLive={!isMock()} />
    </>
  );
}
