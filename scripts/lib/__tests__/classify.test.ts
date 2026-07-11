import { describe, expect, it } from "vitest";

import { classifyUrl } from "../classify";

describe("classifyUrl", () => {
  it("détecte une page ville", () => {
    const r = classifyUrl("https://www.servicimmo.fr/diagnostic-immobilier-amboise-37400.html");
    expect(r).toEqual({
      chemin: "/diagnostic-immobilier-amboise-37400.html",
      type: "ville",
      slugPropose: "amboise",
    });
  });

  it("détecte une ville à nom composé", () => {
    const r = classifyUrl("https://www.servicimmo.fr/diagnostic-immobilier-joue-les-tours-37300.html");
    expect(r.type).toBe("ville");
    expect(r.slugPropose).toBe("joue-les-tours");
  });

  it("détecte un article (suffixe -i<N>.html)", () => {
    const r = classifyUrl(
      "https://www.servicimmo.fr/amiante-enrobes-bitumineux-protegez-convenablement-chantiers-i18.html",
    );
    expect(r.type).toBe("article");
    expect(r.slugPropose).toBe("amiante-enrobes-bitumineux-protegez-convenablement-chantiers");
  });

  it("détecte un article de la série -aN.html", () => {
    const r = classifyUrl("https://www.servicimmo.fr/le-dpe-va-t-il-etre-opposable-a13.html");
    expect(r.type).toBe("article");
    expect(r.slugPropose).toBe("le-dpe-va-t-il-etre-opposable");
  });

  it("détecte un service et retire le suffixe ville-cp", () => {
    const r = classifyUrl("https://www.servicimmo.fr/amiante-avant-travaux-tours-37000.html");
    expect(r.type).toBe("service");
    expect(r.slugPropose).toBe("amiante-avant-travaux");
  });

  it("limite connue : ville multi-segment dans une URL service → slug partiel (corrigé au mapping)", () => {
    const r = classifyUrl("https://www.servicimmo.fr/amiante-avant-travaux-joue-les-tours-37300.html");
    expect(r.type).toBe("service");
    expect(r.slugPropose).toBe("amiante-avant-travaux-joue-les");
  });

  it("classe la racine en structurelle", () => {
    expect(classifyUrl("https://www.servicimmo.fr/").type).toBe("structurelle");
  });

  it("classe le reste en inconnue", () => {
    expect(classifyUrl("https://www.servicimmo.fr/wp-admin/foo").type).toBe("inconnue");
  });
});
