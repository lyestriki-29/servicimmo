import { describe, expect, it } from "vitest";

import {
  ArticleFrontmatterSchema,
  ServiceFrontmatterSchema,
  VilleFrontmatterSchema,
} from "../schemas";

const serviceValide = {
  slug: "dpe",
  titre: "DPE",
  metaTitle: "DPE Tours (37) | Servicimmo",
  metaDescription:
    "Diagnostic de performance énergétique à Tours : obligations, validité, tarifs. Devis en 2 minutes avec Servicimmo, certifié depuis 1998.",
  anciennesUrls: ["/dpe-tours-37000.html"],
  ordre: 1,
  icone: "gauge",
  extrait: "Le diagnostic énergie obligatoire pour vendre ou louer.",
  obligatoirePour: ["vente", "location"],
};

describe("schemas de contenu", () => {
  it("accepte un service valide", () => {
    expect(ServiceFrontmatterSchema.parse(serviceValide).slug).toBe("dpe");
  });

  it("refuse un slug avec majuscules", () => {
    expect(() =>
      ServiceFrontmatterSchema.parse({ ...serviceValide, slug: "DPE" }),
    ).toThrow();
  });

  it("refuse une metaDescription courte sur contenu modernisé (brut absent)", () => {
    expect(() =>
      ServiceFrontmatterSchema.parse({
        ...serviceValide,
        metaDescription: "court",
      }),
    ).toThrow();
  });

  it("accepte une metaDescription courte tant que brut: true", () => {
    const s = ServiceFrontmatterSchema.parse({
      ...serviceValide,
      metaDescription: "court",
      brut: true,
    });
    expect(s.brut).toBe(true);
  });

  it("valide une ville avec coordonnées", () => {
    const ville = VilleFrontmatterSchema.parse({
      slug: "tours",
      ville: "Tours",
      codePostal: "37000",
      metaTitle: "Diagnostic immobilier Tours (37000) | Servicimmo",
      metaDescription:
        "Tous vos diagnostics immobiliers à Tours : DPE, amiante, plomb, termites. Intervention sous 48 h, devis gratuit en ligne.",
      anciennesUrls: [],
      lat: 47.39,
      lng: 0.68,
    });
    expect(ville.codePostal).toBe("37000");
  });

  it("valide un article avec date ISO et défauts", () => {
    const a = ArticleFrontmatterSchema.parse({
      slug: "dpe-2026",
      titre: "DPE 2026",
      date: "2026-01-15",
      metaTitle: "DPE 2026 : ce qui change | Servicimmo",
      metaDescription:
        "Le point complet sur les évolutions du DPE en 2026 : audit énergétique, interdictions de location, calendrier et obligations.",
      anciennesUrls: ["/dpe-2026-i42.html"],
      extrait: "Le point sur le DPE 2026.",
    });
    expect(a.archive).toBe(false);
    expect(a.brut).toBe(false);
  });

  it("refuse une date non ISO", () => {
    expect(() =>
      ArticleFrontmatterSchema.parse({
        slug: "x",
        titre: "x",
        date: "15/01/2026",
        metaTitle: "x",
        metaDescription: "d".repeat(120),
        anciennesUrls: [],
        extrait: "x",
      }),
    ).toThrow();
  });
});
