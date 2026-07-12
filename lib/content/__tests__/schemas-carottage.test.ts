import { describe, expect, it } from "vitest";

import {
  DepartementFrontmatterSchema,
  ExpertiseFrontmatterSchema,
  VilleCarottageFrontmatterSchema,
} from "../schemas-carottage";

const villeValide = {
  slug: "orleans",
  ville: "Orléans",
  codePostal: "45000",
  departement: "45",
  // Note : ≤70 caractères imposé par contraintesContenuModernise (le plan avait 73).
  metaTitle: "Carottage & amiante enrobés à Orléans (45000) | France Carottage",
  metaDescription:
    "Carottage routier et repérage amiante/HAP sur enrobés à Orléans : intervention sur voirie, réseaux et bâtiment partout dans le Loiret, devis sous 24 h.",
  anciennesUrls: ["/amiante-hap-enrobes-routiers-orleans-45000.html"],
  lat: 47.9,
  lng: 1.9,
};

describe("schemas France Carottage", () => {
  it("accepte une ville valide", () => {
    expect(VilleCarottageFrontmatterSchema.parse(villeValide).departement).toBe("45");
  });

  it("refuse un code département hors format", () => {
    expect(() =>
      VilleCarottageFrontmatterSchema.parse({ ...villeValide, departement: "Loiret" }),
    ).toThrow();
  });

  it("accepte une latitude France entière (Corse)", () => {
    expect(
      VilleCarottageFrontmatterSchema.parse({
        ...villeValide,
        slug: "ajaccio",
        ville: "Ajaccio",
        codePostal: "20000",
        departement: "2a",
        lat: 41.9,
        lng: 8.7,
      }).lat,
    ).toBe(41.9);
  });

  it("valide un département avec villes principales", () => {
    const d = DepartementFrontmatterSchema.parse({
      slug: "loiret",
      nom: "Loiret",
      code: "45",
      villesPrincipales: ["Orléans", "Montargis", "Pithiviers"],
      metaTitle: "Carottage & amiante enrobés dans le Loiret (45) | France Carottage",
      metaDescription:
        "France Carottage intervient dans tout le Loiret pour le carottage routier et le repérage amiante/HAP sur enrobés : voirie, réseaux, bâtiment. Devis rapide.",
      anciennesUrls: ["/amiante-hap-enrobes-routiers-loiret.html"],
    });
    expect(d.villesPrincipales).toHaveLength(3);
  });

  it("valide une expertise (date facultative) et applique les défauts", () => {
    const e = ExpertiseFrontmatterSchema.parse({
      slug: "hap-enrobes",
      titre: "HAP dans les enrobés routiers",
      metaTitle: "HAP dans les enrobés routiers : obligations | France Carottage",
      metaDescription:
        "Comprendre les hydrocarbures aromatiques polycycliques (HAP) dans les enrobés : risques, seuils, obligations de repérage avant travaux de voirie.",
      anciennesUrls: ["/hap-enrobes-i7.html"],
    });
    expect(e.brut).toBe(false);
    expect(e.date).toBeUndefined();
  });

  it("refuse un contenu modernisé à metaDescription trop courte", () => {
    expect(() =>
      ExpertiseFrontmatterSchema.parse({
        slug: "x",
        titre: "x",
        metaTitle: "Titre correct pour tester",
        metaDescription: "trop court",
        anciennesUrls: [],
      }),
    ).toThrow();
  });
});
