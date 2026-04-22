/**
 * Webhook Stripe — Sprint 5.
 * Traite `checkout.session.completed` : crée une ligne `paiements` et laisse
 * le trigger SQL mettre à jour `factures.status` et `amount_paid`.
 */

import { NextResponse } from "next/server";
import Stripe from "stripe";

import { getStripe, hasStripeEnv } from "@/lib/stripe/client";
import { getSupabaseServiceClient } from "@/lib/supabase/server";

export async function POST(request: Request): Promise<NextResponse> {
  if (!hasStripeEnv()) {
    return NextResponse.json(
      { ok: false, error: "Stripe non configuré." },
      { status: 503 }
    );
  }
  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json({ ok: false, error: "Stripe indisponible." }, { status: 503 });
  }

  const sig = request.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!sig || !webhookSecret) {
    return NextResponse.json({ ok: false, error: "Signature manquante." }, { status: 400 });
  }

  let event: Stripe.Event;
  const body = await request.text();
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: `Signature invalide : ${(e as Error).message}` },
      { status: 400 }
    );
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const factureId = session.metadata?.facture_id;
    const orgId = session.metadata?.organization_id;
    if (!factureId || !orgId) {
      return NextResponse.json({ ok: true, skipped: true });
    }

    const admin = getSupabaseServiceClient();
    if (!admin) {
      return NextResponse.json({ ok: false }, { status: 500 });
    }

    const amount = (session.amount_total ?? 0) / 100;
    const { error } = await admin.from("paiements").insert({
      organization_id: orgId,
      facture_id: factureId,
      method: "stripe",
      amount,
      paid_at: new Date().toISOString(),
      stripe_session_id: session.id,
      stripe_payment_intent_id:
        typeof session.payment_intent === "string" ? session.payment_intent : null,
    });
    if (error) {
      console.error("[stripe webhook] insert paiement error", error);
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }
  }

  return NextResponse.json({ ok: true });
}

export const dynamic = "force-dynamic";
