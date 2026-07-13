/**
 * Les 30 villes recevant une VRAIE reformulation rédactionnelle (les autres sont
 * différenciées par la structure paramétrique + lissage du texte source).
 * Réconcilié avec l'inventaire réel (content/carottage/villes/ — les grandes
 * métropoles absentes de la collection, ex. Paris/Marseille/Lyon, n'y figurent pas).
 * Trié par population décroissante.
 */
export const TOP_VILLES: Set<string> = new Set([
  "nantes",
  "bordeaux",
  "lille",
  "rennes",
  "angers",
  "brest",
  "tours",
  "amiens",
  "limoges",
  "boulogne-billancourt",
  "orleans",
  "saint-denis",
  "rouen",
  "argenteuil",
  "montreuil",
  "caen",
  "tourcoing",
  "roubaix",
  "nanterre",
  "vitry-sur-seine",
  "creteil",
  "poitiers",
  "aubervilliers",
  "versailles",
  "pau",
  "colombes",
  "aulnay-sous-bois",
  "asnieres-sur-seine",
  "dunkerque",
  "courbevoie",
]);

export function estTopVille(slug: string): boolean {
  return TOP_VILLES.has(slug);
}
