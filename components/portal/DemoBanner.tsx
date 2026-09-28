import { setDemoRoleAction } from "@/app/(portal)/actions";

/** Shown only in mock mode so nobody mistakes demo data for real client records. */
export function DemoBanner({ role }: { role: string }) {
  return (
    <div className="on-dark flex h-10 items-center justify-center gap-3 bg-charcoal px-4 text-[0.8125rem] text-white">
      <span className="hidden sm:inline">Demo mode · fictional data · changes reset on restart</span>
      <span className="sm:hidden">Demo mode</span>
      <form action={setDemoRoleAction.bind(null, role === "owner" ? "client" : "owner")}>
        <button className="rounded-full border border-white/40 px-3 py-0.5 font-semibold hover:bg-white/10">
          View as {role === "owner" ? "client" : "practitioner"}
        </button>
      </form>
    </div>
  );
}
