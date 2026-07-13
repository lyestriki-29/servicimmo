import { describe, expect, it } from "vitest";

import { distanceKm, ordreSections, variantePour, villesVoisines } from "../ville-gabarit";
import type { VilleFC } from "@/lib/content/schemas-carottage";

function ville(slug: string, lat: number, lng: number): VilleFC {
  return {
    slug,
    ville: slug,
    codePostal: "45000",
    departement: "45",
    metaTitle: "t".repeat(20),
    metaDescription: "d".repeat(120),
    anciennesUrls: [],
    brut: false,
    lat,
    lng,
    html: "",
  };
}

describe("ville-gabarit", () => {
  it("variantePour est déterministe et dans [0,3]", () => {
    for (const s of ["orleans", "montargis", "pithiviers", "gien", "chalette-sur-loing"]) {
      const v = variantePour(s);
      expect(v).toBe(variantePour(s));
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThanOrEqual(3);
    }
  });

  it("répartit les 4 variantes sur un échantillon", () => {
    const slugs = Array.from({ length: 200 }, (_, i) => `ville-test-${i}`);
    const vues = new Set(slugs.map(variantePour));
    expect(vues.size).toBe(4);
  });

  it("ordreSections retourne les 3 sections mobiles sans doublon", () => {
    for (const v of [0, 1, 2, 3] as const) {
      const ordre = ordreSections(v);
      expect(new Set(ordre)).toEqual(new Set(["prestations", "voisines", "departement"]));
      expect(ordre).toHaveLength(3);
    }
  });

  it("villesVoisines renvoie les n plus proches, sans la ville elle-même", () => {
    const centre = ville("orleans", 47.9, 1.9);
    const toutes = [
      centre,
      ville("proche", 47.95, 1.95),
      ville("moyenne", 48.3, 2.3),
      ville("loin", 43.6, 1.4),
    ];
    const voisines = villesVoisines(centre, toutes, 2);
    expect(voisines.map((v) => v.slug)).toEqual(["proche", "moyenne"]);
  });

  it("distanceKm est symétrique et positive", () => {
    const a = ville("a", 47.9, 1.9);
    const b = ville("b", 48.9, 2.9);
    expect(distanceKm(a, b)).toBeGreaterThan(0);
    expect(Math.abs(distanceKm(a, b) - distanceKm(b, a))).toBeLessThan(1e-9);
  });
});
