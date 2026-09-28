import { NextResponse } from "next/server";
import { getViewer, isMock } from "@/lib/portal";
import { getStripe } from "@/lib/stripe";
import { siteUrl } from "@/config/site";

/** Opens the Stripe customer portal for receipts and payment methods (digital products only; D-052). */
export async function POST() {
  const viewer = await getViewer();
  if (!viewer?.clientId) return NextResponse.redirect(new URL("/my-tab/login", siteUrl), 303);
  const stripe = getStripe();
  if (isMock() || !stripe) return NextResponse.redirect(new URL("/my-tab/billing?portal=unavailable", siteUrl), 303);
  const { createSupabaseServerClient } = await import("@/lib/supabase/server");
  const { data } = await (await createSupabaseServerClient()).from("clients").select("stripe_customer_id").eq("id", viewer.clientId).single();
  if (!data?.stripe_customer_id) return NextResponse.redirect(new URL("/my-tab/billing?portal=none", siteUrl), 303);
  const session = await stripe.billingPortal.sessions.create({ customer: data.stripe_customer_id, return_url: `${siteUrl}/my-tab/billing` });
  return NextResponse.redirect(session.url, 303);
}
