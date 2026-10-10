import { requireStaffViewer } from "@/lib/portal";
import { staffNavFor } from "@/components/portal/PortalShell";
import { Icon, NavLink } from "@/components/portal/PortalNav";
import { PageTitle } from "@/components/portal/ui";

export const metadata = { title: "More" };

/** Phones show four tabs and More; this lists the rest of TAB Practice's menu. */
export default async function MorePage() {
  const viewer = await requireStaffViewer();
  const rest = staffNavFor(viewer).slice(4);
  return (
    <>
      <PageTitle eyebrow="TAB Practice" title="More" />
      <ul className="divide-y divide-border overflow-hidden rounded-[20px] border border-border bg-white">
        {rest.map((i) => (
          <li key={i.href}>
            <NavLink item={i} className="flex items-center gap-3 px-5 py-4 font-medium hover:bg-bone"><Icon name={i.icon} className="h-5 w-5 text-text-secondary" />{i.label}</NavLink>
          </li>
        ))}
      </ul>
    </>
  );
}
