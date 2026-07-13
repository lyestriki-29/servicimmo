/**
 * POST /api/quote-request
 *
 * Crée un brouillon de demande de devis après l'étape 3 (capture email).
 * Body attendu : merge de step1 + step2 + step3 + tracking optionnel.
 *
 * Fail-fast 503 si Supabase n'est pas configuré (Session 2 mode offline).
 */

import { NextResponse } from "next/server";

import { badRequest, fromZodError, notConfigured, ok, serverError } from "@/lib/api/responses";
import { getSupabaseServiceClient } from "@/lib/supabase/server";
import type { QuoteRequestRow } from "@/lib/supabase/types";
import { step1Schema, step2Schema, step3Schema } from "@/lib/validation/schemas";
import { z } from "zod";

// Tracking optionnel commun aux deux variantes.
const trackingSchema = z.object({
  source: z.string().optional(),
  medium: z.string().optional(),
  campaign: z.string().optional(),
  referer: z.string().optional(),
  user_agent: z.string().optional(),
});

// Schéma draft classique : 3 premières étapes + contact enrichi + tracking.
const createDraftSchema = step1Schema
  .merge(step2Schema)
  .merge(step3Schema)
  .merge(trackingSchema)
  .extend({
    first_name: z.string().max(100).optional(),
    phone: z.string().max(30).optional(),
  });

// Branche « autre » : chemin ultra-court, soumission directe sans calcul.
const otherRequestSchema = z
  .object({
    project_type: z.literal("other"),
    email: z.string().email("Format email invalide"),
    first_name: z.string().min(1, "Prénom requis").max(100),
    phone: z
      .string()
      .refine((v) => v.replace(/\D/g, "").length >= 8, "Téléphone trop court (≥ 8 chiffres)"),
    notes: z.string().min(10, "Décrivez votre besoin (10 caractères minimum)").max(2000),
    consent_rgpd: z.boolean().refine((v) => v === true, { message: "Consentement RGPD requis" }),
  })
  .merge(trackingSchema);

export async function POST(request: Request): Promise<NextResponse> {
  const supabase = getSupabaseServiceClient();
  if (!supabase) {
    return notConfigured(
      "Supabase non configuré — la demande ne peut pas être enregistrée en base. " +
        "Vous pouvez continuer le questionnaire, vos données restent conservées localement."
    );
  }

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return badRequest("Corps JSON invalide");
  }

  // Branche « autre » : soumission directe (description libre, pas de calcul).
  const isOther =
    typeof raw === "object" &&
    raw !== null &&
    (raw as Record<string, unknown>).project_type === "other";

  if (isOther) {
    const parsedOther = otherRequestSchema.safeParse(raw);
    if (!parsedOther.success) return fromZodError(parsedOther.error);

    const nowOther = new Date().toISOString();
    const { data: otherData, error: otherError } = await supabase
      .from("quote_requests")
      .insert({
        status: "submitted" as const,
        project_type: "other" as const,
        email: parsedOther.data.email,
        email_captured_at: nowOther,
        first_name: parsedOther.data.first_name,
        phone: parsedOther.data.phone,
        notes: parsedOther.data.notes,
        consent_rgpd: true,
        consent_at: nowOther,
        source: parsedOther.data.source ?? null,
        medium: parsedOther.data.medium ?? null,
        campaign: parsedOther.data.campaign ?? null,
        referer: parsedOther.data.referer ?? null,
        user_agent: parsedOther.data.user_agent ?? null,
      })
      .select("id")
      .single<Pick<QuoteRequestRow, "id">>();

    if (otherError) {
      console.error("[/api/quote-request] insert (other) error", otherError);
      return serverError("Impossible d'enregistrer la demande.");
    }
    return ok({ id: otherData.id }, { status: 201 });
  }

  const parsed = createDraftSchema.safeParse(raw);
  if (!parsed.success) return fromZodError(parsed.error);

  const now = new Date().toISOString();
  const insertPayload = {
    status: "email_captured" as const,
    project_type: parsed.data.project_type,
    property_type: parsed.data.property_type,
    address: parsed.data.address,
    postal_code: parsed.data.postal_code,
    city: parsed.data.city,
    surface: parsed.data.surface,
    rooms_count: parsed.data.rooms_count,
    is_coownership: parsed.data.is_coownership,
    email: parsed.data.email,
    email_captured_at: now,
    first_name: parsed.data.first_name ?? null,
    phone: parsed.data.phone ?? null,
    source: parsed.data.source ?? null,
    medium: parsed.data.medium ?? null,
    campaign: parsed.data.campaign ?? null,
    referer: parsed.data.referer ?? null,
    user_agent: parsed.data.user_agent ?? null,
  };

  const { data, error } = await supabase
    .from("quote_requests")
    .insert(insertPayload)
    .select("id")
    .single<Pick<QuoteRequestRow, "id">>();

  if (error) {
    console.error("[/api/quote-request] insert error", error);
    return serverError("Impossible d'enregistrer la demande.");
  }

  return ok({ id: data.id }, { status: 201 });
}

export const dynamic = "force-dynamic";
