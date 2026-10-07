import { requireStaffViewer, isDemoSignIn, isMock } from "@/lib/portal";
import { getSettings } from "@/lib/settings";
import { privacyPolicy } from "@/content/legal";
import { services } from "@/content/services";
import { PageTitle, Panel } from "@/components/portal/ui";
import { SettingsForm } from "@/components/portal/SettingsForm";
import { siteConfig } from "@/config/site";

export const metadata = { title: "Settings" };

/**
 * Where website changes are asked for (owner request 2026-10-07; proposed D-069, D-070). Shown to all staff: anyone may
 * ask; only the owner approves design changes and releases (docs/CONTENT-GUIDE.md).
 */
function WebsiteChanges() {
  const w = siteConfig.websiteChanges;
  const ext = { target: "_blank", rel: "noopener noreferrer" } as const;
  return (
    <Panel title="Website changes" className="mt-8">
      <p className="max-w-2xl text-text-secondary">
        Ask for a change to the public website. Content help covers words, FAQs, cards, photos and section order on an existing
        page; a design change covers anything that changes how the site looks or works. The guide explains both, what you can
        edit yourself, and the names of every part of a page.
      </p>
      <div className="mt-5 flex flex-wrap gap-3">
        <a href={w.contentRequest} className="btn btn-primary" {...ext}>Content help<span className="sr-only"> (opens GitHub in a new tab)</span></a>
        <a href={w.designRequest} className="btn btn-outline" {...ext}>Design change<span className="sr-only"> (opens GitHub in a new tab)</span></a>
        <a href={w.openRequests} className="btn btn-outline" {...ext}>Open requests<span className="sr-only"> (opens GitHub in a new tab)</span></a>
        <a href={w.guide} className="btn btn-outline" {...ext}>Website content guide<span className="sr-only"> (opens in a new tab)</span></a>
      </div>
      <p className="mt-4 text-sm text-text-secondary">The forms need a GitHub account with access to the website’s repository. Never include a client’s name or health details in a request.</p>
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
        <Panel><p>Only the owner can change TAB’s settings.</p></Panel>
        <WebsiteChanges />
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
      <WebsiteChanges />
    </>
  );
}
