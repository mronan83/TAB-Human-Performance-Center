import { NextResponse } from "next/server";
import { LINK_TYPES, readEmailLink, redeemEmailLink } from "@/lib/supabase/email-link";

/** Redeems a staff sign-in link (any browser, C5), then asks for two-step verification (C23, SEC-015). */
export async function GET(req: Request) {
  const url = new URL(req.url);
  if (await redeemEmailLink(readEmailLink(url, LINK_TYPES.practice))) return NextResponse.redirect(new URL("/practice/verify", url.origin));
  return NextResponse.redirect(new URL("/practice/login?e=link", url.origin));
}
