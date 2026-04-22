"use server";

import { revalidatePath } from "next/cache";

import type { ActionResult } from "@/lib/features/action-result";
import { getCurrentUser } from "@/lib/features/auth/session";
import { getStripe, hasStripeEnv } from "@/lib/stripe/client";
import {
  getSupabaseServerClient,
  getSupabaseServiceClient,
  hasServerSupabaseEnv,
} from "@/lib/supabase/server";

function err<T = undefined>(msg: string): ActionResult<T> {
  return { ok: false, error: msg };
}

/**
 * Crée une session Stripe Checkout pour payer une facture.
 * Retourne l'URL de redirection.
 */
export async function createStripeCheckoutSession(
  factureId: string
): Promise<ActionResult<{ url: string }>> {
  if (!hasServerSupabaseEnv()) return err("Service non configuré.");
  if (!hasStripeEnv()) return err("Stripe non configuré.");
  const stripe = getStripe();
  if (!stripe) return err("Stripe indisponible.");

  const admin = getSupabaseServiceClient();
  if (!admin) return err("Service indisponible.");

  const { data: facture } = await admin
    .from("factures")
    .select("*")
    .eq("id", factureId)
    .single();
  if (!facture) return err("Facture introuvable.");
  if (facture.status === "payee") return err("Facture déjà réglée.");

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency: "eur",
          product_data: {
            name: `Facture ${facture.reference ?? facture.id.slice(0, 8)}`,
          },
          unit_amount: Math.round(Number(facture.total_ttc) * 100),
        },
        quantity: 1,
      },
    ],
    metadata: {
      facture_id: facture.id,
      organization_id: facture.organization_id,
    },
    success_url: `${appUrl}/app/facturation/factures/${facture.id}?payment=success`,
    cancel_url: `${appUrl}/app/facturation/factures/${facture.id}?payment=cancel`,
  });

  return { ok: true, data: { url: session.url ?? "" } };
}

/**
 * Enregistre un paiement manuel (virement / chèque / espèces).
 */
export async function recordManualPayment(
  factureId: string,
  method: "virement" | "cheque" | "especes",
  amount: number,
  reference?: string,
  paidAt?: string
): Promise<ActionResult> {
  try {
    if (!hasServerSupabaseEnv()) return err("Service non configuré.");
    const user = await getCurrentUser();
    if (!user) return err("Non authentifié.");
    if (amount <= 0) return err("Montant invalide.");

    const supabase = await getSupabaseServerClient();
    const { error } = await supabase.from("paiements").insert({
      organization_id: user.profile.organization_id,
      facture_id: factureId,
      method,
      amount,
      paid_at: paidAt ?? new Date().toISOString(),
      reference_manual: reference ?? null,
    });
    if (error) return err(error.message);

    revalidatePath("/app/facturation");
    revalidatePath(`/app/facturation/factures/${factureId}`);
    return { ok: true, data: undefined };
  } catch (e) {
    return err((e as Error).message);
  }
}
