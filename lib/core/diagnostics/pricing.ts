/**
 * Moteur de pricing — chargement de la grille depuis Supabase (SERVER-ONLY).
 *
 * ⚠️ TARIFS INDICATIFS — À VALIDER ET CALIBRER AVEC SERVICIMMO AVANT PROD.
 *
 * Ce module contient la partie qui touche Supabase (`loadPricingGrid`). Il
 * NE DOIT PAS être importé depuis un Client Component : il déclencherait
 * l'import de `next/headers` dans le bundle client. Pour le calcul pur côté
 * client, importer depuis `./pricing-core` (ré-exporté ci-dessous).
 *
 * V2 "rappel téléphone" :
 *   - Grille chargée depuis la table Supabase `pricing_rules` via
 *     `loadPricingGrid()`. Fallback statique (`buildFallbackGrid`) tant que la
 *     table est absente/vide ou Supabase non provisionné.
 *   - Modulateurs distance > 50 km (+30 €) et chauffage collectif (+10 %) :
 *     voir `pricing-core.ts`.
 */

import { buildFallbackGrid, type PricingGrid } from "./pricing-core";

// Ré-export du cœur pur pour préserver les imports existants
// (`@/lib/core/diagnostics/pricing`).
export {
  buildFallbackGrid,
  estimatePrice,
  estimatePriceWithGrid,
  basePrice,
  __pricingInternals,
  type PricingGrid,
} from "./pricing-core";

// ---------------------------------------------------------------------------
// Chargement grille depuis Supabase (fallback code si indisponible)
// ---------------------------------------------------------------------------

let cachedGrid: PricingGrid | null = null;
let cachedAt = 0;
const CACHE_TTL_MS = 5 * 60 * 1000;

/**
 * Charge la grille active depuis Supabase. Cache mémoire 5 min.
 * Retombe silencieusement sur le fallback code en cas d'erreur / table absente.
 *
 * Server-only — ne pas appeler depuis un Client Component.
 */
export async function loadPricingGrid(): Promise<PricingGrid> {
  const now = Date.now();
  if (cachedGrid && now - cachedAt < CACHE_TTL_MS) return cachedGrid;

  try {
    // Import dynamique pour ne pas forcer la dépendance côté tests unitaires
    // (Vitest n'a pas accès à next/headers).
    const mod = await import("@/lib/supabase/server");
    const client = mod.getSupabaseServiceClient();
    if (!client) {
      cachedGrid = buildFallbackGrid();
      cachedAt = now;
      return cachedGrid;
    }
    const { data, error } = await client
      .from("pricing_rules")
      .select("diagnostic_id, context, price_min, price_max")
      .eq("is_active", true);

    if (error || !data || data.length === 0) {
      cachedGrid = buildFallbackGrid();
      cachedAt = now;
      return cachedGrid;
    }

    const grid: PricingGrid = buildFallbackGrid();
    for (const row of data) {
      grid.set(`${row.diagnostic_id}:${row.context}`, {
        min: Number(row.price_min),
        max: Number(row.price_max),
      });
    }
    cachedGrid = grid;
    cachedAt = now;
    return cachedGrid;
  } catch {
    cachedGrid = buildFallbackGrid();
    cachedAt = now;
    return cachedGrid;
  }
}

/** Invalide le cache (utile pour les tests et l'admin). */
export function resetPricingGridCache(): void {
  cachedGrid = null;
  cachedAt = 0;
}
