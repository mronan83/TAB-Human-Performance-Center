import Link from "next/link";
import { requireStaffViewer } from "@/lib/portal";
import { PageTitle, Panel } from "@/components/portal/ui";
import { WebsiteRequestForm } from "@/components/portal/WebsiteForms";

export const metadata = { title: "New website request" };

export default async function NewWebsiteRequestPage({ searchParams }: { searchParams: Promise<{ lane?: string }> }) {
  await requireStaffViewer();
  const { lane } = await searchParams;
  return (
    <>
      <p className="mb-4 text-sm"><Link href="/practice/website" className="text-primary underline">Website changes</Link></p>
      <PageTitle eyebrow="TAB Practice" title="New website request" lead="Not sure which kind it is? Choose either: Claude will move it if it fits the other." />
      <Panel><WebsiteRequestForm initialLane={lane === "design" ? "design" : "content"} /></Panel>
    </>
  );
}
