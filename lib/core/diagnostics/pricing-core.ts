/**
 * Moteur de pricing — cœur PUR (client-safe).
 *
 * ⚠️ TARIFS INDICATIFS — À VALIDER ET CALIBRER AVEC SERVICIMMO AVANT PROD.
 *
 * Ce fichier ne contient QUE des fonctions pures (grille fallback + modulateurs
 * + estimation). Aucune dépendance Supabase / `next/headers` → il peut être
 * importé côté client (calcul instantané du récap, cf. `lib/questionnaire/local-calc.ts`).
 * Le chargement de la grille depuis Supabase vit dans `pricing.ts` (server-only).
 *
 * Ordre de calcul :
 *   1. Base price par diagnostic (grille ± contexte house/apartment).
 *   2. Somme des fourchettes.
 *   3. Modulateur surface (−10%, base, +10%, +20%).
 *   4. Modulateur urgence (+20% si <48h).
 *   5. Modulateur zone géographique (+15% hors 37) OU distance 50km (+30€ flat)
 *      si la distance est connue. Distance prime si renseignée.
 *   6. Modulateur chauffage collectif (+10% sur DPE collectif).
 *   7. Remise pack (−15% si ≥3 diagnostics).
 *   8. Arrondi à la dizaine.
 */

import type {
  DiagnosticId,
  PriceEstimate,
  PricingContext,
  PropertyType,
  RequiredDiagnostic,
} from "./types";

// ---------------------------------------------------------------------------
// Types grille
// ---------------------------------------------------------------------------

type PriceRange = { min: number; max: number };

/**
 * Clé = `${diagnostic_id}:${context}` avec `context` ∈ {'house' | 'apartment' | 'default'}.
 * Pour DPE/amiante/dapp, on cherche d'abord la clé spécifique (house/apartment)
 * puis on retombe sur 'default' si absente.
 */
export type PricingGrid = Map<string, PriceRange>;

// ---------------------------------------------------------------------------
// Grille fallback (utilisée si Supabase n'est pas dispo ou table vide)
// ---------------------------------------------------------------------------

type PriceResolver = (ctx: PricingContext) => PriceRange;

function housingPrice(
  ctx: PricingContext,
  houseMin: number,
  houseMax: number,
  apartmentMin: number,
  apartmentMax: number
): PriceRange {
  return ctx.property_type === "house"
    ? { min: houseMin, max: houseMax }
    : { min: apartmentMin, max: apartmentMax };
}

const BASE_PRICES: Record<DiagnosticId, PriceResolver> = {
  dpe: (ctx) => housingPrice(ctx, 110, 220, 90, 180),
  dpe_tertiary: () => ({ min: 200, max: 800 }),
  dpe_collective: () => ({ min: 600, max: 1500 }),
  dta: () => ({ min: 400, max: 900 }),

  lead: () => ({ min: 110, max: 220 }),
  asbestos: (ctx) => housingPrice(ctx, 80, 150, 70, 130),
  dapp: (ctx) => housingPrice(ctx, 80, 150, 70, 130),
  asbestos_works: () => ({ min: 250, max: 600 }),
  lead_works: () => ({ min: 150, max: 400 }),

  termites: () => ({ min: 90, max: 170 }),
  gas: () => ({ min: 90, max: 130 }),
  electric: () => ({ min: 90, max: 130 }),
  carrez: () => ({ min: 60, max: 110 }),
  boutin: () => ({ min: 60, max: 110 }),
  erp: () => ({ min: 20, max: 40 }),
};

/** Construit la grille fallback depuis `BASE_PRICES` (sans dépendance DB). */
export function buildFallbackGrid(): PricingGrid {
  const grid: PricingGrid = new Map();
  (Object.keys(BASE_PRICES) as DiagnosticId[]).forEach((id) => {
    const resolver = BASE_PRICES[id];
    // On échantillonne house et apartment + default.
    const house = resolver({
      surface: 100,
      postal_code: "37000",
      property_type: "house",
      urgency: null,
    });
    const apartment = resolver({
      surface: 100,
      postal_code: "37000",
      property_type: "apartment",
      urgency: null,
    });
    grid.set(`${id}:house`, house);
    grid.set(`${id}:apartment`, apartment);
    // 'default' = valeur house (arbitraire, utilisée pour commercial/land/etc.)
    grid.set(`${id}:default`, house);
  });
  return grid;
}

// ---------------------------------------------------------------------------
// Modulateurs (fonctions pures, testables indépendamment)
// ---------------------------------------------------------------------------

type SurfaceBand = "tiny" | "small" | "medium" | "large";

function surfaceBand(surface: number): SurfaceBand {
  if (surface <= 40) return "tiny";
  if (surface <= 80) return "small";
  if (surface <= 150) return "medium";
  return "large";
}

function surfaceMultiplier(surface: number): number {
  switch (surfaceBand(surface)) {
    case "tiny":
      return 0.9;
    case "small":
      return 1;
    case "medium":
      return 1.1;
    case "large":
      return 1.2;
  }
}

function surfaceLabel(surface: number): string | null {
  switch (surfaceBand(surface)) {
    case "tiny":
      return "Surface ≤ 40 m² (−10 %)";
    case "medium":
      return "Surface 80-150 m² (+10 %)";
    case "large":
      return "Surface > 150 m² (+20 %)";
    default:
      return null;
  }
}

function isOutOfRange(postalCode: string): boolean {
  return !postalCode.trim().startsWith("37");
}

function roundToTen(n: number): number {
  return Math.round(n / 10) * 10;
}

// ---------------------------------------------------------------------------
// Résolution prix unitaire (grille + contexte)
// ---------------------------------------------------------------------------

function resolveUnitPrice(
  grid: PricingGrid,
  id: DiagnosticId,
  propertyType: PropertyType
): PriceRange | null {
  // Clé spécifique (house / apartment) si pertinent, sinon 'default'.
  const specific = propertyType === "house" || propertyType === "apartment" ? propertyType : null;
  if (specific) {
    const hit = grid.get(`${id}:${specific}`);
    if (hit) return hit;
  }
  const fallback = grid.get(`${id}:default`);
  return fallback ?? null;
}

// ---------------------------------------------------------------------------
// Fonction principale (variante avec grille explicite — utilisée par l'API)
// ---------------------------------------------------------------------------

export function estimatePriceWithGrid(
  grid: PricingGrid,
  diagnostics: RequiredDiagnostic[],
  context: PricingContext
): PriceEstimate {
  const appliedModulators: string[] = [];

  if (diagnostics.length === 0) {
    return { min: 0, max: 0, appliedModulators };
  }

  // 1) Somme des fourchettes de base
  let min = 0;
  let max = 0;
  let hasCollectiveDPE = false;
  for (const diag of diagnostics) {
    const range = resolveUnitPrice(grid, diag.id, context.property_type);
    if (!range) continue;
    min += range.min;
    max += range.max;
    if (diag.id === "dpe_collective") hasCollectiveDPE = true;
  }

  // 2) Surface
  const sm = surfaceMultiplier(context.surface);
  if (sm !== 1) {
    min *= sm;
    max *= sm;
    const label = surfaceLabel(context.surface);
    if (label) appliedModulators.push(label);
  }

  // 3) Urgence
  if (context.urgency === "asap") {
    min *= 1.2;
    max *= 1.2;
    appliedModulators.push("Intervention < 48 h (+20 %)");
  }

  // 4) Distance 50 km OU zone hors 37 (distance prime si connue)
  const distance = context.distance_km;
  if (typeof distance === "number" && distance > 50) {
    // Forfait +30 € TTC, appliqué au min et au max (pas de %)
    min += 30;
    max += 30;
    appliedModulators.push(`Déplacement > 50 km (+30 €)`);
  } else if (typeof distance !== "number" && isOutOfRange(context.postal_code)) {
    // Fallback historique si distance inconnue : hors 37 → +15 %
    min *= 1.15;
    max *= 1.15;
    appliedModulators.push("Hors Indre-et-Loire (+15 %)");
  }

  // 5) Chauffage collectif + DPE collectif présent
  if (context.heating_mode === "collective" && hasCollectiveDPE) {
    min *= 1.1;
    max *= 1.1;
    appliedModulators.push("Chauffage collectif (+10 %)");
  }

  // 6) Pack (≥ 3 diagnostics)
  if (diagnostics.length >= 3) {
    min *= 0.85;
    max *= 0.85;
    appliedModulators.push("Pack complet ≥ 3 diagnostics (−15 %)");
  }

  // 7) Arrondi dizaine
  return {
    min: roundToTen(min),
    max: roundToTen(max),
    appliedModulators,
  };
}

// ---------------------------------------------------------------------------
// API legacy synchrone (fallback grille code) — conserve la signature existante
// ---------------------------------------------------------------------------

export function estimatePrice(
  diagnostics: RequiredDiagnostic[],
  context: PricingContext
): PriceEstimate {
  return estimatePriceWithGrid(buildFallbackGrid(), diagnostics, context);
}

// ---------------------------------------------------------------------------
// Helpers exportés (utiles pour tests et UI)
// ---------------------------------------------------------------------------

export const __pricingInternals = {
  BASE_PRICES,
  surfaceBand,
  surfaceMultiplier,
  isOutOfRange,
  roundToTen,
  resolveUnitPrice,
};

export function basePrice(id: DiagnosticId, propertyType: PropertyType): PriceRange {
  const resolver = BASE_PRICES[id];
  return resolver({
    surface: 100,
    postal_code: "37000",
    property_type: propertyType,
    urgency: null,
  });
}
