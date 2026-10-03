import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { createSupabaseServiceClient } from "@/lib/supabase/server";

/**
 * Stripe webhook (SEC-020, INT-004). The signature is checked here; everything else happens in one database
 * transaction, apply_stripe_event(), which marks the event handled only if every change succeeds. Any failure answers
 * 500, so Stripe retries the event instead of the purchase being half-applied.
 *
 * Events to enable: checkout.session.completed, checkout.session.async_payment_succeeded,
 * checkout.session.async_payment_failed, customer.subscription.updated, customer.subscription.deleted, charge.refunded.
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

  try {
    // A refunded charge doesn't name its checkout session; look it up so the database can find the purchase.
    let sessionId: string | null = null;
    if (event.type === "charge.refunded") {
      const charge = event.data.object as Stripe.Charge;
      if (charge.payment_intent) {
        const sessions = await stripe.checkout.sessions.list({ payment_intent: String(charge.payment_intent), limit: 1 });
        sessionId = sessions.data[0]?.id ?? null;
      }
    }
    const sb = await createSupabaseServiceClient();
    const { data, error } = await sb.rpc("apply_stripe_event", { p_id: event.id, p_type: event.type, p_object: event.data.object, p_session_id: sessionId });
    if (error) throw new Error(error.message);
    return NextResponse.json({ received: true, result: data });
  } catch (err) {
    console.error(`[stripe] ${event.type} ${event.id} not applied; Stripe will retry:`, err);
    return NextResponse.json({ error: "Not applied" }, { status: 500 });
  }
}
