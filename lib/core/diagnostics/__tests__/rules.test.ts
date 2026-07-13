import { describe, expect, it } from "vitest";

import { calculateRequiredDiagnostics } from "@/lib/core/diagnostics/rules";
import type { QuoteFormData, RequiredDiagnostic } from "@/lib/core/diagnostics/types";

// ── Fixture de base : vente maison pré-1949 à Tours, gaz + élec anciens ──────
const base: QuoteFormData = {
  project_type: "sale",
  property_type: "house",
  postal_code: "37000",
  surface: 100,
  rooms_count: 4,
  is_coownership: false,
  permit_date_range: "before_1949",
  heating_type: "gas",
  gas_installation: "city_gas",
  gas_over_15_years: true,
  electric_over_15_years: true,
};

const make = (over: Partial<QuoteFormData> = {}): QuoteFormData => ({ ...base, ...over });
const ids = (list: RequiredDiagnostic[]): string[] => list.map((d) => d.id).sort();

describe("calculateRequiredDiagnostics — vente", () => {
  it("vente maison pré-1949 en 37 : plomb, amiante, termites, DPE, gaz, élec, ERP", () => {
    const r = calculateRequiredDiagnostics(make());
    expect(ids(r.required)).toEqual([
      "asbestos", "dpe", "electric", "erp", "gas", "lead", "termites",
    ]);
    expect(r.toClarify).toEqual([]);
  });

  it("vente maison 1949-1997 : amiante mais PAS de plomb", () => {
    const r = calculateRequiredDiagnostics(make({ permit_date_range: "1949_to_1997" }));
    expect(ids(r.required)).toContain("asbestos");
    expect(ids(r.required)).not.toContain("lead");
  });

  it("vente post-1997 : ni amiante ni plomb", () => {
    const r = calculateRequiredDiagnostics(make({ permit_date_range: "after_1997" }));
    expect(ids(r.required)).not.toContain("asbestos");
    expect(ids(r.required)).not.toContain("lead");
  });

  it("vente d'un lot en copropriété : Carrez", () => {
    const r = calculateRequiredDiagnostics(
      make({ property_type: "apartment", is_coownership: true })
    );
    expect(ids(r.required)).toContain("carrez");
  });

  it("vente hors copropriété : pas de Carrez", () => {
    const r = calculateRequiredDiagnostics(make());
    expect(ids(r.required)).not.toContain("carrez");
  });

  it("termites : vente en 37 oui, vente hors 37 non, location 37 non", () => {
    expect(ids(calculateRequiredDiagnostics(make()).required)).toContain("termites");
    expect(
      ids(calculateRequiredDiagnostics(make({ postal_code: "41000" })).required)
    ).not.toContain("termites");
    expect(
      ids(
        calculateRequiredDiagnostics(
          make({ project_type: "rental", rental_furnished: "vide" })
        ).required
      )
    ).not.toContain("termites");
  });

  it("terrain nu : ERP seul (pas de DPE, pas de termites)", () => {
    const r = calculateRequiredDiagnostics(
      make({ property_type: "land", gas_installation: "none", gas_over_15_years: false, electric_over_15_years: false })
    );
    expect(ids(r.required)).toEqual(["erp"]);
  });

  it("local commercial pré-1949 : DPE tertiaire + amiante, pas de plomb ni gaz/élec", () => {
    const r = calculateRequiredDiagnostics(make({ property_type: "commercial" }));
    expect(ids(r.required)).toEqual(["asbestos", "dpe_tertiary", "erp", "termites"]);
  });
});

describe("calculateRequiredDiagnostics — location", () => {
  const rental = (over: Partial<QuoteFormData> = {}) =>
    make({
      project_type: "rental",
      permit_date_range: "after_1997",
      gas_installation: "none",
      gas_over_15_years: false,
      electric_over_15_years: false,
      rental_furnished: "meuble",
      ...over,
    });

  it("location logement post-1997 meublé : DPE + ERP seulement", () => {
    const r = calculateRequiredDiagnostics(rental());
    expect(ids(r.required)).toEqual(["dpe", "erp"]);
  });

  it("location vide : + Loi Boutin", () => {
    const r = calculateRequiredDiagnostics(rental({ rental_furnished: "vide" }));
    expect(ids(r.required)).toContain("boutin");
  });

  it("location pré-1997 : DAPP (amiante parties privatives), pas 'asbestos' vente", () => {
    const r = calculateRequiredDiagnostics(rental({ permit_date_range: "1949_to_1997" }));
    expect(ids(r.required)).toContain("dapp");
    expect(ids(r.required)).not.toContain("asbestos");
  });
});

describe("calculateRequiredDiagnostics — Option B (je ne sais pas)", () => {
  it("permis inconnu en vente : plomb + amiante passent en toClarify", () => {
    const r = calculateRequiredDiagnostics(make({ permit_date_range: "unknown" }));
    expect(ids(r.required)).not.toContain("lead");
    expect(ids(r.required)).not.toContain("asbestos");
    expect(ids(r.toClarify)).toEqual(expect.arrayContaining(["asbestos", "lead"]));
  });

  it("âge gaz inconnu (installation présente) : gaz en toClarify", () => {
    const r = calculateRequiredDiagnostics(make({ gas_over_15_years: null }));
    expect(ids(r.required)).not.toContain("gas");
    expect(ids(r.toClarify)).toContain("gas");
  });

  it("âge élec inconnu : élec en toClarify", () => {
    const r = calculateRequiredDiagnostics(make({ electric_over_15_years: null }));
    expect(ids(r.toClarify)).toContain("electric");
  });

  it("pas d'installation gaz : aucun diag gaz nulle part", () => {
    const r = calculateRequiredDiagnostics(
      make({ gas_installation: "none", gas_over_15_years: null })
    );
    expect(ids(r.required)).not.toContain("gas");
    expect(ids(r.toClarify)).not.toContain("gas");
  });
});

describe("calculateRequiredDiagnostics — travaux / copropriété / autre", () => {
  it("travaux pré-1949 : RAT + plomb avant travaux", () => {
    const r = calculateRequiredDiagnostics(make({ project_type: "works", works_type: "renovation" }));
    expect(ids(r.required)).toEqual(["asbestos_works", "lead_works"]);
  });

  it("travaux 1949-1997 : RAT seul", () => {
    const r = calculateRequiredDiagnostics(
      make({ project_type: "works", permit_date_range: "1949_to_1997" })
    );
    expect(ids(r.required)).toEqual(["asbestos_works"]);
  });

  it("travaux permis inconnu : les deux en toClarify, rien en required", () => {
    const r = calculateRequiredDiagnostics(
      make({ project_type: "works", permit_date_range: "unknown" })
    );
    expect(r.required).toEqual([]);
    expect(ids(r.toClarify)).toEqual(["asbestos_works", "lead_works"]);
  });

  it("copropriété pré-1997 : DTA required + DPE collectif toClarify", () => {
    const r = calculateRequiredDiagnostics(make({ project_type: "coownership" }));
    expect(ids(r.required)).toEqual(["dta"]);
    expect(ids(r.toClarify)).toContain("dpe_collective");
  });

  it("branche autre : résultat vide", () => {
    const r = calculateRequiredDiagnostics(make({ project_type: "other" }));
    expect(r.required).toEqual([]);
    expect(r.toClarify).toEqual([]);
  });

  it("copro + chauffage collectif en vente : DPE collectif signalé en toClarify", () => {
    const r = calculateRequiredDiagnostics(
      make({ is_coownership: true, heating_mode: "collective" })
    );
    expect(ids(r.toClarify)).toContain("dpe_collective");
  });
});

describe("calculateRequiredDiagnostics — diagnostics déjà valides", () => {
  it("DPE déclaré valide : retiré des required", () => {
    const r = calculateRequiredDiagnostics(make({ existing_valid_diagnostics: ["dpe"] }));
    expect(ids(r.required)).not.toContain("dpe");
  });

  it("amiante déclaré valide SANS document : rétrogradé en toClarify", () => {
    const r = calculateRequiredDiagnostics(make({ existing_valid_diagnostics: ["asbestos"] }));
    expect(ids(r.required)).not.toContain("asbestos");
    expect(ids(r.toClarify)).toContain("asbestos");
  });

  it("amiante déclaré valide AVEC document : retiré complètement", () => {
    const r = calculateRequiredDiagnostics(
      make({
        existing_valid_diagnostics: ["asbestos"],
        existing_diagnostics_files: ["https://example.com/rapport.pdf"],
      })
    );
    expect(ids(r.required)).not.toContain("asbestos");
    expect(ids(r.toClarify)).not.toContain("asbestos");
  });
});
