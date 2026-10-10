import { notFound } from "next/navigation";
import { requireClient } from "@/lib/portal";
import { PageTitle, Panel } from "@/components/portal/ui";
import { DynamicForm } from "@/components/portal/interactive";

export default async function FormPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { clientId, repo } = await requireClient();
  const f = await repo.getForm(clientId, slug);
  if (!f) notFound();
  const done = f.status === "submitted" || f.status === "reviewed";
  return (
    <>
      <PageTitle eyebrow="Forms" title={f.template.title} lead={f.template.description} />
      <Panel className="max-w-3xl"><DynamicForm template={f.template} initial={f.answers} readOnly={done} /></Panel>
    </>
  );
}
