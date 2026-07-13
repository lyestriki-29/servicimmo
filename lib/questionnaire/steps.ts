/**
 * Moteur de flux PUR du questionnaire refondu (approche C — flux linéaire).
 *
 * UNE seule source de vérité du parcours : `getSteps(branch, data)` retourne la
 * liste ordonnée des étapes visibles. Tout se déduit de `(branch, data)` — pas
 * d'état dérivé, donc robuste au changement d'une réponse antérieure (le
 * premier incomplet est simplement recalculé).
 *
 * Remplace les deux moteurs de l'ancien accordéon 2 niveaux
 * (`computeStepFlow` + `computeNextAccordion`), source des bugs de navigation.
 */

import type { ProjectType } from "@/lib/core/diagnostics/types";
import type { QuestionnaireData } from "@/lib/stores/questionnaire";

export type StepId =
  | "bien"
  | "bati"
  | "specifique"
  | "contact"
  | "existants"
  | "delai"
  | "autre";

export type Step = {
  id: StepId;
  title: string;
  /** Étape facultative : « Continuer » n'est jamais bloqué, jamais bloquante. */
  optional: boolean;
  isComplete: (data: QuestionnaireData) => boolean;
};

// ── Prédicats purs (portés à l'identique des flags de l'ancien FillingScreen) ─

export const isEmailValid = (v: string | undefined): boolean => /^\S+@\S+\.\S+$/.test(v ?? "");

const phoneDigits = (d: QuestionnaireData): string => (d.phone ?? "").replace(/\D/g, "");

const addressComplete = (d: QuestionnaireData): boolean =>
  !!d.address &&
  d.address.length >= 3 &&
  !!d.postal_code &&
  /^\d{5}$/.test(d.postal_code) &&
  !!d.city;

const surfaceComplete = (d: QuestionnaireData): boolean =>
  typeof d.surface === "number" &&
  d.surface > 0 &&
  typeof d.rooms_count === "number" &&
  d.rooms_count >= 1;

const hasGas = (d: QuestionnaireData): boolean =>
  !!d.gas_installation && d.gas_installation !== "none" && d.gas_installation !== "unknown";

const bienComplete = (d: QuestionnaireData): boolean =>
  !!d.property_type &&
  addressComplete(d) &&
  surfaceComplete(d) &&
  d.is_coownership !== undefined &&
  (d.property_type !== "apartment" || typeof d.floor === "number") &&
  (d.property_type !== "commercial" || !!d.commercial_activity);

// heating_mode et ecs_type étaient de facto requis par la chaîne de sous-blocs
// de l'ancien TechniqueStep (les deux ont une option « Je ne sais pas »).
const batiComplete = (d: QuestionnaireData): boolean =>
  !!d.permit_date_range &&
  !!d.heating_mode &&
  !!d.heating_type &&
  !!d.ecs_type &&
  !!d.gas_installation &&
  (!hasGas(d) || !!d.cooktop_connection) &&
  d.gas_over_15_years !== undefined &&
  d.electric_over_15_years !== undefined;

const contactComplete = (d: QuestionnaireData): boolean =>
  isEmailValid(d.email) && !!d.first_name?.trim() && phoneDigits(d).length >= 8;

const delaiComplete = (d: QuestionnaireData): boolean =>
  !!d.urgency && (d.referral_source !== "autre" || !!d.referral_other);

const autreComplete = (d: QuestionnaireData): boolean =>
  contactComplete(d) && (d.notes?.trim().length ?? 0) >= 10 && d.consent_rgpd === true;

// ── Composition du flux ──────────────────────────────────────────────────────

// `_data` : réservé pour de futures étapes conditionnelles aux réponses ;
// la signature (branch, data) est celle de la spec.
export function getSteps(branch: ProjectType, _data: QuestionnaireData): Step[] {
  if (branch === "other") {
    return [{ id: "autre", title: "Votre demande", optional: false, isComplete: autreComplete }];
  }

  const steps: Step[] = [
    { id: "bien", title: "Le bien", optional: false, isComplete: bienComplete },
    { id: "bati", title: "Le bâti", optional: false, isComplete: batiComplete },
  ];

  if (branch === "rental") {
    steps.push({
      id: "specifique",
      title: "Votre location",
      optional: false,
      isComplete: (d) => !!d.rental_furnished,
    });
  }
  if (branch === "works") {
    steps.push({
      id: "specifique",
      title: "Vos travaux",
      optional: false,
      isComplete: (d) => !!d.works_type,
    });
  }

  steps.push(
    { id: "contact", title: "Vos coordonnées", optional: false, isComplete: contactComplete },
    {
      id: "existants",
      title: "Diagnostics déjà valides",
      optional: true,
      isComplete: () => true,
    },
    { id: "delai", title: "Délai & accès", optional: false, isComplete: delaiComplete }
  );

  return steps;
}

/** Index de la première étape REQUISE incomplète ; `steps.length` si tout est complet. */
export function firstIncompleteIndex(
  steps: readonly Step[],
  data: QuestionnaireData
): number {
  const idx = steps.findIndex((s) => !s.optional && !s.isComplete(data));
  return idx === -1 ? steps.length : idx;
}

/**
 * Résout l'index d'affichage : l'étape demandée si elle est atteignable, sinon
 * clamp au premier incomplet (jamais au-delà — on ne peut pas sauter en avant,
 * le retour en arrière reste libre).
 */
export function resolveStepIndex(
  steps: readonly Step[],
  currentStepId: string | null,
  data: QuestionnaireData
): number {
  const maxReachable = Math.min(firstIncompleteIndex(steps, data), steps.length - 1);
  const wanted = steps.findIndex((s) => s.id === currentStepId);
  if (wanted === -1) return maxReachable;
  return Math.min(wanted, maxReachable);
}
