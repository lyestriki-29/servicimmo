import { describe, expect, it } from "vitest";

import { chercherCommunes } from "@/components/marketing/pages/ZoneSearch";
import { loadVilles } from "@/lib/content/load";

/**
 * Le vérificateur de couverture de /zones répond « nous intervenons à X » à
 * partir d'une saisie libre (nom de commune ou code postal).
 *
 * Une version précédente utilisait `.find()` et ne gardait donc que la première
 * correspondance. Comme Fondettes et Luynes partagent le code postal 37230, un
 * habitant de Luynes tapant son code postal était systématiquement renvoyé vers
 * la page de Fondettes. Ce filet interdit le retour à une recherche mono-résultat.
 */
describe("recherche de commune de la page zones", () => {
  const villes = [
    { slug: "fondettes", ville: "Fondettes", codePostal: "37230" },
    { slug: "luynes", ville: "Luynes", codePostal: "37230" },
    { slug: "amboise", ville: "Amboise", codePostal: "37400" },
  ];

  it("renvoie TOUTES les communes d'un code postal partagé", () => {
    const trouvees = chercherCommunes(villes, "37230");

    expect(trouvees.map((v) => v.slug)).toEqual(["fondettes", "luynes"]);
  });

  it("trouve une commune par son nom même sans accent ni casse", () => {
    expect(chercherCommunes(villes, "AMBOISE").map((v) => v.slug)).toEqual(["amboise"]);
    expect(chercherCommunes(villes, "luynes").map((v) => v.slug)).toEqual(["luynes"]);
  });

  it("ne renvoie rien sur une saisie vide ou une commune inconnue", () => {
    expect(chercherCommunes(villes, "")).toEqual([]);
    expect(chercherCommunes(villes, "   ")).toEqual([]);
    expect(chercherCommunes(villes, "Marseille")).toEqual([]);
  });

  it("garde chaque code postal réellement partagé rattaché à toutes ses communes", async () => {
    const reelles = await loadVilles();
    const parCodePostal = new Map<string, string[]>();
    for (const ville of reelles) {
      parCodePostal.set(ville.codePostal, [
        ...(parCodePostal.get(ville.codePostal) ?? []),
        ville.slug,
      ]);
    }

    // Sur le contenu réel, toute saisie d'un code postal doit remonter autant de
    // communes que le contenu en rattache à ce code — 1 comme 2.
    for (const [codePostal, slugs] of parCodePostal) {
      const trouvees = chercherCommunes(
        reelles.map((v) => ({ slug: v.slug, ville: v.ville, codePostal: v.codePostal })),
        codePostal
      );
      expect(trouvees.map((v) => v.slug).sort()).toEqual([...slugs].sort());
    }
  });
});
