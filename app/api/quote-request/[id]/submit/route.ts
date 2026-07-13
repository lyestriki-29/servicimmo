/**
 * POST /api/quote-request/[id]/submit
 *
 * Soumission finale du questionnaire : valide l'intégralité des réponses
 * (fullQuoteSchema), recalcule diagnostics + estimation CÔTÉ SERVEUR (grille
 * Supabase, jamais les valeurs envoyées par le client) et passe la demande en
 * `submitted`.
 *
 * Cette route manquait : l'ancien RecapScreen l'appelait déjà → 404 → la
 * soumission finale échouait systématiquement quand Supabase était configuré.
 */

import { NextResponse } from "next/server";
import { z } from "zod";

import {
  badRequest,
  fromZodError,
  notConfigured,
  notFound,
  ok,
  serverError,
} from "@/lib/api/responses";
import { estimatePriceWithGrid, loadPricingGrid } from "@/lib/core/diagnostics/pricing";
import { calculateRequiredDiagnostics } from "@/lib/core/diagnostics/rules";
import { distanceFromToursKm } from "@/lib/geo/distance";
import { toQuoteFormData } from "@/lib/questionnaire/local-calc";
import { getSupabaseServiceClient } from "@/lib/supabase/server";
import type { Json, QuoteRequestRow } from "@/lib/supabase/types";
import { fullQuoteSchema } from "@/lib/validation/schemas";

/** Sérialise proprement vers le type Json de Supabase (structures issues des moteurs). */
function toJson(value: unknown): Json {
  return JSON.parse(JSON.stringify(value)) as Json;
}

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const supabase = getSupabaseServiceClient();
  if (!supabase) {
    return notConfigured(
      "Supabase non configuré — la demande ne peut pas être enregistrée en base."
    );
  }

  const { id } = await context.params;
  if (!z.string().uuid().safeParse(id).success) {
    return badRequest("Identifiant de demande invalide.");
  }

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return badRequest("Corps JSON invalide");
  }

  const parsed = fullQuoteSchema.safeParse(raw);
  if (!parsed.success) return fromZodError(parsed.error);
  const d = parsed.data;

  // ── Recalcul serveur (source de vérité) ─────────────────────────────────
  const formData = toQuoteFormData(d);
  if (!formData) return badRequest("Réponses insuffisantes pour calculer les diagnostics.");

  const diagnostics = calculateRequiredDiagnostics(formData);
  const grid = await loadPricingGrid();
  const distance_km = distanceFromToursKm(d.postal_code) ?? undefined;
  const estimate = estimatePriceWithGrid(grid, diagnostics.required, {
    surface: d.surface,
    postal_code: d.postal_code,
    property_type: d.property_type,
    urgency: d.urgency ?? null,
    heating_mode: d.heating_mode,
    distance_km,
  });

  const now = new Date().toISOString();
  const { data: updated, error } = await supabase
    .from("quote_requests")
    .update({
      status: "submitted" as const,
      // Étapes 1-2
      project_type: d.project_type,
      property_type: d.property_type,
      address: d.address,
      postal_code: d.postal_code,
      city: d.city,
      surface: d.surface,
      rooms_count: d.rooms_count,
      is_coownership: d.is_coownership,
      // Contact
      email: d.email,
      civility: d.civility,
      first_name: d.first_name,
      last_name: d.last_name,
      phone: d.phone,
      // Bâti
      permit_date_range: d.permit_date_range,
      heating_type: d.heating_type,
      gas_installation: d.gas_installation,
      gas_over_15_years: d.gas_over_15_years,
      electric_over_15_years: d.electric_over_15_years,
      rental_furnished: d.rental_furnished ?? null,
      works_type: d.works_type ?? null,
      // Délai & accès
      urgency: d.urgency,
      notes: d.notes ?? null,
      access_notes: d.access_notes ?? null,
      tenants_in_place: d.tenants_in_place ?? null,
      referral_source: d.referral_source ?? null,
      referral_other: d.referral_other ?? null,
      // Extensions V2
      heating_mode: d.heating_mode ?? null,
      ecs_type: d.ecs_type ?? null,
      syndic_contact: d.syndic_contact ?? null,
      cooktop_connection: d.cooktop_connection ?? null,
      dependencies: d.dependencies ?? null,
      dependencies_converted: d.dependencies_converted ?? null,
      existing_valid_diagnostics: d.existing_valid_diagnostics ?? null,
      existing_diagnostics_files: toJson(d.existing_diagnostics_files ?? []),
      residence_name: d.residence_name ?? null,
      floor: d.floor ?? null,
      is_top_floor: d.is_top_floor ?? null,
      door_number: d.door_number ?? null,
      is_duplex: d.is_duplex ?? null,
      purchase_date: d.purchase_date ?? null,
      cadastral_reference: d.cadastral_reference ?? null,
      commercial_activity: d.commercial_activity ?? null,
      heated_zones_count: d.heated_zones_count ?? null,
      configuration_notes: d.configuration_notes ?? null,
      preferred_payment_method: d.preferred_payment_method ?? null,
      distance_km: distance_km ?? null,
      // Snapshot calculs (recalculés serveur)
      required_diagnostics: toJson(diagnostics.required),
      diagnostics_to_clarify: toJson(diagnostics.toClarify),
      price_min: estimate.min,
      price_max: estimate.max,
      applied_modulators: toJson(estimate.appliedModulators),
      // Consentement
      consent_rgpd: true,
      consent_at: now,
    })
    .eq("id", id)
    .select("id")
    .maybeSingle<Pick<QuoteRequestRow, "id">>();

  if (error) {
    console.error("[/api/quote-request/submit] update error", error);
    return serverError("Impossible de finaliser la demande.");
  }
  if (!updated) return notFound("Demande introuvable.");

  return ok({ id: updated.id });
}

export const dynamic = "force-dynamic";
