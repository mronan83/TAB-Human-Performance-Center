import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { createSupabaseServiceClient } from "@/lib/supabase/server";

/**
 * Stripe webhook: grants and revokes entitlements. Idempotent via stripe_events.
 * Events to enable: checkout.session.completed, customer.subscription.deleted, charge.refunded.
 */
export async function POST(req: Request) {
  const stripe = getStripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !secret) return NextResponse.json({ error: "Stripe not configured" }, { status: 503 });

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(await req.text(), req.headers.get("stripe-signature") ?? "", secret);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const sb = await createSupabaseServiceClient();
  const { error: dup } = await sb.from("stripe_events").insert({ id: event.id, type: event.type });
  if (dup) return NextResponse.json({ received: true, duplicate: true });

  if (event.type === "checkout.session.completed") {
    const s = event.data.object as Stripe.Checkout.Session;
    const clientId = s.metadata?.client_id, productId = s.metadata?.product_id;
    if (clientId && productId) {
      if (s.customer) await sb.from("clients").update({ stripe_customer_id: String(s.customer) }).eq("id", clientId).is("stripe_customer_id", null);
      await sb.from("entitlements").insert({ client_id: clientId, product_id: productId, source: "stripe", stripe_checkout_session_id: s.id, stripe_subscription_id: s.subscription ? String(s.subscription) : null, status: "active" });
      const { data: product } = await sb.from("products").select("program_template_id").eq("id", productId).single();
      if (product?.program_template_id) await sb.from("client_programs").insert({ client_id: clientId, template_id: product.program_template_id, source: "purchased" });
    }
  }
  if (event.type === "customer.subscription.deleted") {
    const sub = event.data.object as Stripe.Subscription;
    await sb.from("entitlements").update({ status: "cancelled", ends_at: new Date().toISOString() }).eq("stripe_subscription_id", sub.id);
  }
  if (event.type === "charge.refunded") {
    const charge = event.data.object as Stripe.Charge;
    if (charge.payment_intent) {
      const sessions = await stripe.checkout.sessions.list({ payment_intent: String(charge.payment_intent), limit: 1 });
      const sid = sessions.data[0]?.id;
      if (sid) await sb.from("entitlements").update({ status: "refunded", ends_at: new Date().toISOString() }).eq("stripe_checkout_session_id", sid);
    }
  }
  return NextResponse.json({ received: true });
}
