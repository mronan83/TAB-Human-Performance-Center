import Link from "next/link";
import { requireStaff } from "@/lib/portal";
import { PageTitle, Panel } from "@/components/portal/ui";
import { ProgramEditor } from "@/components/portal/ProgramEditor";

/** A new program starts as a draft, version 1 (C7, design §3.1). */
export default async function NewProgramPage() {
  await requireStaff();
  return (
    <>
      <PageTitle eyebrow="Program library" title="New program" lead="Build it as a draft. Nothing reaches clients until a version is published and assigned."
        action={<Link href="/practice/programs" className="btn btn-outline btn-sm">Back to library</Link>} />
      <Panel><ProgramEditor /></Panel>
    </>
  );
}
