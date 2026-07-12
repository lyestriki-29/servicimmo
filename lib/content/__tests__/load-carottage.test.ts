import path from "node:path";

import { describe, expect, it } from "vitest";

import {
  getVilleFC,
  loadDepartementsFC,
  loadExpertises,
  loadVillesFC,
} from "../load-carottage";

const FIXTURES = path.join(__dirname, "fixtures-carottage");

describe("lib/content — collections France Carottage", () => {
  it("charge et trie les villes par ordre alphabétique", async () => {
    const villes = await loadVillesFC(FIXTURES);
    expect(villes.map((v) => v.slug)).toEqual(["orleans", "tours-fc"]);
    expect(villes[0]?.html).toContain("<h2");
  });

  it("retourne null pour un slug ville inconnu", async () => {
    expect(await getVilleFC("inexistant", FIXTURES)).toBeNull();
  });

  it("charge les départements", async () => {
    const depts = await loadDepartementsFC(FIXTURES);
    expect(depts.map((d) => d.code)).toEqual(["45"]);
  });

  it("trie les expertises datées avant les non datées", async () => {
    const exp = await loadExpertises(FIXTURES);
    expect(exp.map((e) => e.slug)).toEqual(["hap-enrobes", "metier"]);
  });
});
