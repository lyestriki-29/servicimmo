import { describe, expect, it } from "vitest";

import { SECTEUR_PAR_SLUG } from "@/components/marketing/pages/ZonesExperience";
import { loadVilles } from "@/lib/content/load";

/**
 * La page /zones annonce publiquement le secteur de chaque commune.
 * Une version précédente rangeait par défaut toute commune non listée en
 * « Sud Touraine » — y compris Langeais, que le texte du secteur Val de Loire
 * cite pourtant nommément juste à côté. Ce filet interdit le rattachement
 * implicite : ajouter une ville dans content/ sans lui donner de secteur casse ici.
 */
describe("secteurs de la page zones", () => {
  it("rattache explicitement chaque commune de content/ à un secteur", async () => {
    const villes = await loadVilles();
    const sansSecteur = villes.filter((ville) => !SECTEUR_PAR_SLUG[ville.slug]);

    expect(sansSecteur.map((ville) => ville.slug)).toEqual([]);
  });

  it("ne rattache aucune commune absente de content/", async () => {
    const villes = await loadVilles();
    const slugsConnus = new Set(villes.map((ville) => ville.slug));
    const orphelins = Object.keys(SECTEUR_PAR_SLUG).filter((slug) => !slugsConnus.has(slug));

    expect(orphelins).toEqual([]);
  });
});
