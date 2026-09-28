import { requireClient } from "@/lib/portal";
import { siteConfig } from "@/config/site";
import { PageTitle, Panel } from "@/components/portal/ui";
import { ConsentToggle, ContactForm } from "@/components/portal/interactive";

export default async function ProfilePage() {
  const { clientId, repo } = await requireClient();
  const [client, consents] = await Promise.all([repo.getClient(clientId), repo.listConsents(clientId)]);
  return (
    <>
      <PageTitle eyebrow="Profile" title="Your details and privacy" />
      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Contact details">
          <p className="mb-5 text-sm text-text-secondary">{client?.fullName} · {client?.email}</p>
          <ContactForm preferredName={client?.preferredName} phone={client?.phone} />
        </Panel>
        <Panel title="Privacy and permissions">
          <div className="divide-y divide-border">{consents.map((c) => <ConsentToggle key={c.type} consent={c} />)}</div>
          <p className="mt-4 text-sm text-text-secondary">To request a copy of your information or ask us to delete it, email <a className="text-primary underline" href={`mailto:${siteConfig.contact.email}`}>{siteConfig.contact.email}</a>.</p>
        </Panel>
      </div>
    </>
  );
}
