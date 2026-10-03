import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/** Exchanges the emailed sign-in or invitation code for a session, then sends the user to My TAB. */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  if (code) {
    const sb = await createSupabaseServerClient();
    const { error } = await sb.auth.exchangeCodeForSession(code);
    if (!error) {
      // Records the client's first sign-in, so TAB Practice can show them as active in My TAB (C4). Best effort.
      await sb.rpc("record_my_tab_sign_in").then(() => undefined, () => undefined);
      return NextResponse.redirect(new URL("/my-tab", url.origin));
    }
  }
  return NextResponse.redirect(new URL("/my-tab/login?e=link", url.origin));
}
