import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/** Exchanges a staff sign-in link for a session, then asks for two-step verification (C23, SEC-015). */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  if (code) {
    const sb = await createSupabaseServerClient();
    const { error } = await sb.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(new URL("/practice/verify", url.origin));
  }
  return NextResponse.redirect(new URL("/practice/login?e=link", url.origin));
}
