/**
 * Calcul LOCAL du récapitulatif (diagnostics + estimation), sans réseau.
 *
 * Récap « dé-bloqué » : les moteurs purs (`rules.ts`, `estimatePrice` sur
 * grille fallback, `distanceFromToursKm`) tournent côté client → estimation
 * instantanée, plus jamais d'écran figé derrière un appel réseau. La grille
 * Supabase (admin) ne sert qu'au rafraîchissement en arrière-plan via
 * `/api/calculate` — voir RecapScreen.
 */

// Import du cœur PUR (pas `pricing.ts`) : ce module tourne côté client, il ne
// doit pas tirer le chargement de grille Supabase (`next/headers`) dans le bundle.
import { estimatePrice } from "@/lib/core/diagnostics/pricing-core";
import { calculateRequiredDiagnostics } from "@/lib/core/diagnostics/rules";
import type { QuoteFormData } from "@/lib/core/diagnostics/types";
import { distanceFromToursKm } from "@/lib/geo/distance";
import type { QuestionnaireData, QuoteCalculation } from "@/lib/stores/questionnaire";

/** Reconstruit l'entrée moteur ; null si un prérequis manque (retour en arrière requis). */
export function toQuoteFormData(d: QuestionnaireData): QuoteFormData | null {
  if (
    !d.project_type ||
    !d.property_type ||
    !d.postal_code ||
    typeof d.surface !== "number" ||
    typeof d.rooms_count !== "number" ||
    d.is_coownership === undefined ||
    !d.permit_date_range ||
    !d.heating_type ||
    !d.gas_installation ||
    d.gas_over_15_years === undefined ||
    d.electric_over_15_years === undefined
  ) {
    return null;
  }
  return {
    project_type: d.project_type,
    property_type: d.property_type,
    postal_code: d.postal_code,
    surface: d.surface,
    rooms_count: d.rooms_count,
    is_coownership: d.is_coownership,
    permit_date_range: d.permit_date_range,
    heating_type: d.heating_type,
    gas_installation: d.gas_installation,
    gas_over_15_years: d.gas_over_15_years,
    electric_over_15_years: d.electric_over_15_years,
    rental_furnished: d.rental_furnished,
    works_type: d.works_type,
    heating_mode: d.heating_mode,
    ecs_type: d.ecs_type,
    dependencies: d.dependencies,
    dependencies_converted: d.dependencies_converted,
    existing_valid_diagnostics: d.existing_valid_diagnostics,
    existing_diagnostics_files: d.existing_diagnostics_files,
    tenants_in_place: d.tenants_in_place,
    is_duplex: d.is_duplex,
    is_top_floor: d.is_top_floor,
  };
}

export function computeLocalCalculation(d: QuestionnaireData): QuoteCalculation | null {
  const formData = toQuoteFormData(d);
  if (!formData) return null;

  const diagnostics = calculateRequiredDiagnostics(formData);
  const distance = distanceFromToursKm(formData.postal_code);
  const estimate = estimatePrice(diagnostics.required, {
    surface: formData.surface,
    postal_code: formData.postal_code,
    property_type: formData.property_type,
    urgency: d.urgency ?? null,
    heating_mode: d.heating_mode,
    distance_km: distance ?? undefined,
  });

  return {
    required: diagnostics.required,
    toClarify: diagnostics.toClarify,
    estimate,
    source: "local",
  };
}

/** Payload pour POST /api/calculate (schéma serveur : exige aussi address + city). */
export function toCalculateBody(d: QuestionnaireData): Record<string, unknown> | null {
  const formData = toQuoteFormData(d);
  if (!formData || !d.address || !d.city) return null;
  return {
    ...formData,
    address: d.address,
    city: d.city,
    urgency: d.urgency,
    residence_name: d.residence_name,
    floor: d.floor,
    door_number: d.door_number,
    purchase_date: d.purchase_date,
    cadastral_reference: d.cadastral_reference,
    commercial_activity: d.commercial_activity,
    heated_zones_count: d.heated_zones_count,
    configuration_notes: d.configuration_notes,
    syndic_contact: d.syndic_contact,
    cooktop_connection: d.cooktop_connection,
  };
}
