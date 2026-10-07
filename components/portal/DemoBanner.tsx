import { setDemoRoleAction } from "@/app/(portal)/actions";

const pill = "whitespace-nowrap rounded-full border border-white/40 px-3 py-0.5 font-semibold hover:bg-white/10";

/** Shown only in mock mode so nobody mistakes demo data for real client records. Switches between the three demo views. */
export function DemoBanner({ role }: { role: string }) {
  const others = (["owner", "client", "admin"] as const).filter((r) => r !== role);
  const label = { owner: "practitioner", client: "client", admin: "admin" } as const;
  return (
    <div className="on-dark flex h-10 items-center justify-center gap-2 bg-graphite px-3 text-[0.8125rem] text-white sm:gap-3">
      <span className="hidden sm:inline">Demo mode · fictional data · changes reset on restart</span>
      <span className="hidden min-[400px]:inline sm:hidden">Demo</span>
      {others.map((r) => (
        <form key={r} action={setDemoRoleAction.bind(null, r)}>
          <button className={pill}><span className="hidden sm:inline">View as </span>{label[r]}</button>
        </form>
      ))}
    </div>
  );
}
