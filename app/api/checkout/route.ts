import { NextResponse } from "next/server";
import { getRepository, getViewer, isMock } from "@/lib/portal";
import { getStripe } from "@/lib/stripe";
import { siteUrl } from "@/config/site";

/** Starts Stripe Checkout for a digital program, cohort, or membership (D-052). */
export async function POST(req: Request) {
  const back = (q: string) => NextResponse.redirect(new URL(`/my-tab/programs?${q}`, siteUrl), 303);
  const viewer = await getViewer();
  if (!viewer?.clientId) return NextResponse.redirect(new URL("/my-tab/login", siteUrl), 303);
  const slug = String((await req.formData()).get("product") ?? "");
  const stripe = getStripe();
  if (isMock() || !stripe) return back("checkout=unavailable");

  const { createSupabaseServerClient } = await import("@/lib/supabase/server");
  const sb = await createSupabaseServerClient();
  const { data: product } = await sb.from("products").select("id, stripe_price_id, kind").eq("slug", slug).eq("active", true).maybeSingle();
  if (!product?.stripe_price_id) return back("checkout=unavailable");
  const client = await (await getRepository()).getClient(viewer.clientId);
  const { data: row } = await sb.from("clients").select("stripe_customer_id").eq("id", viewer.clientId).single();

  const session = await stripe.checkout.sessions.create({
    mode: product.kind === "membership" ? "subscription" : "payment",
    line_items: [{ price: product.stripe_price_id, quantity: 1 }],
    ...(row?.stripe_customer_id ? { customer: row.stripe_customer_id } : { customer_email: client?.email, customer_creation: product.kind === "membership" ? undefined : "always" }),
    client_reference_id: viewer.clientId,
    metadata: { client_id: viewer.clientId, product_id: product.id },
    success_url: `${siteUrl}/my-tab/programs?checkout=success`,
    cancel_url: `${siteUrl}/my-tab/programs?checkout=cancelled`,
  });
  return NextResponse.redirect(session.url!, 303);
}
