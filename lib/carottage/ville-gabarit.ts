/**
 * Différenciation anti-duplicate des 191 pages villes : la structure de page
 * tourne entre 4 variantes, choisie de façon déterministe par le hash du slug —
 * même slug ⇒ même structure (stable au build), slugs différents ⇒ structures variées.
 */
import type { VilleFC } from "@/lib/content/schemas-carottage";

export type Variante = 0 | 1 | 2 | 3;
export type SectionKey = "prestations" | "voisines" | "departement";

/** Hash djb2 (déterministe, cross-plateforme) → variante 0..3. */
export function variantePour(slug: string): Variante {
  let h = 5381;
  for (let i = 0; i < slug.length; i += 1) {
    h = ((h << 5) + h + slug.charCodeAt(i)) & 0xffffffff;
  }
  return (Math.abs(h) % 4) as Variante;
}

/** Ordre des 3 sections mobiles selon la variante (l'intro et le CTA sont fixes). */
export function ordreSections(variante: Variante): SectionKey[] {
  const permutations: Record<Variante, SectionKey[]> = {
    0: ["prestations", "voisines", "departement"],
    1: ["departement", "prestations", "voisines"],
    2: ["voisines", "departement", "prestations"],
    3: ["prestations", "departement", "voisines"],
  };
  return permutations[variante];
}

/** Distance haversine en km entre deux points {lat,lng}. */
export function distanceKm(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
): number {
  const rad = (d: number) => (d * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat);
  const dLng = rad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.sqrt(h));
}

/** Les `n` villes couvertes les plus proches (hors la ville courante). */
export function villesVoisines(ville: VilleFC, toutes: VilleFC[], n: number): VilleFC[] {
  return toutes
    .filter((v) => v.slug !== ville.slug)
    .sort((a, b) => distanceKm(ville, a) - distanceKm(ville, b))
    .slice(0, n);
}
