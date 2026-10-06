import { NextResponse } from "next/server";
import { LINK_TYPES, readEmailLink, redeemEmailLink } from "@/lib/supabase/email-link";

/** Redeems an emailed sign-in or invitation link (any browser, C5), then sends the client to My TAB. */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const sb = await redeemEmailLink(readEmailLink(url, LINK_TYPES.myTab));
  if (sb) {
    // Records the client's first sign-in, so TAB Practice can show them as active in My TAB (C4). Best effort.
    await sb.rpc("record_my_tab_sign_in").then(() => undefined, () => undefined);
    return NextResponse.redirect(new URL("/my-tab", url.origin));
  }
  return NextResponse.redirect(new URL("/my-tab/login?e=link", url.origin));
}
