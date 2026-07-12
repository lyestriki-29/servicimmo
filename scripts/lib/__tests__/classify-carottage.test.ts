import { describe, expect, it } from "vitest";

import { classifyUrlCarottage } from "../classify-carottage";

describe("classifyUrlCarottage", () => {
  it("détecte une page ville (préfixe + ville + CP)", () => {
    const r = classifyUrlCarottage(
      "https://www.france-carottage.fr/amiante-hap-enrobes-routiers-orleans-45000.html",
    );
    expect(r).toEqual({
      chemin: "/amiante-hap-enrobes-routiers-orleans-45000.html",
      type: "ville",
      slugPropose: "orleans",
      codePostal: "45000",
    });
  });

  it("détecte une ville à nom composé", () => {
    const r = classifyUrlCarottage(
      "https://www.france-carottage.fr/amiante-hap-enrobes-routiers-clermont-ferrand-63000.html",
    );
    expect(r.type).toBe("ville");
    expect(r.slugPropose).toBe("clermont-ferrand");
    expect(r.codePostal).toBe("63000");
  });

  it("détecte un département (même préfixe, SANS code postal)", () => {
    const r = classifyUrlCarottage(
      "https://www.france-carottage.fr/amiante-hap-enrobes-routiers-loiret.html",
    );
    expect(r.type).toBe("departement");
    expect(r.slugPropose).toBe("loiret");
    expect(r.codePostal).toBeUndefined();
  });

  it("détecte un département composé", () => {
    const r = classifyUrlCarottage(
      "https://www.france-carottage.fr/amiante-hap-enrobes-routiers-seine-et-marne.html",
    );
    expect(r.type).toBe("departement");
    expect(r.slugPropose).toBe("seine-et-marne");
  });

  it("détecte une expertise (suffixe -i<N>.html)", () => {
    const r = classifyUrlCarottage("https://www.france-carottage.fr/hap-enrobes-routiers-i7.html");
    expect(r.type).toBe("expertise");
    expect(r.slugPropose).toBe("hap-enrobes-routiers");
  });

  it("classe racine et mentions légales en structurelles", () => {
    expect(classifyUrlCarottage("https://www.france-carottage.fr/").type).toBe("structurelle");
    expect(
      classifyUrlCarottage("https://www.france-carottage.fr/mentions-legales.html").type,
    ).toBe("structurelle");
  });

  it("classe le reste en inconnue", () => {
    expect(classifyUrlCarottage("https://www.france-carottage.fr/espace-client.php").type).toBe(
      "inconnue",
    );
  });
});
