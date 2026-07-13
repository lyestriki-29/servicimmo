import { describe, expect, it } from "vitest";

import { estimatePrice } from "@/lib/core/diagnostics/pricing";
import type {
  DiagnosticId,
  PricingContext,
  RequiredDiagnostic,
} from "@/lib/core/diagnostics/types";

const diag = (id: DiagnosticId): RequiredDiagnostic => ({
  id,
  name: id,
  reason: "test",
  validityMonths: 6,
});

// Surface 60 = bande "small" (multiplicateur 1) → cas de base sans modulateur.
const ctx = (over: Partial<PricingContext> = {}): PricingContext => ({
  surface: 60,
  postal_code: "37000",
  property_type: "house",
  urgency: null,
  ...over,
});

describe("estimatePrice — base", () => {
  it("aucun diagnostic : 0 € et aucun modulateur", () => {
    expect(estimatePrice([], ctx())).toEqual({ min: 0, max: 0, appliedModulators: [] });
  });

  it("ERP seul, surface small, en 37 : fourchette de base sans modulateur", () => {
    const r = estimatePrice([diag("erp")], ctx());
    expect(r).toEqual({ min: 20, max: 40, appliedModulators: [] });
  });

  it("DPE maison vs appartement : la grille house/apartment diffère", () => {
    const house = estimatePrice([diag("dpe")], ctx());
    const apt = estimatePrice([diag("dpe")], ctx({ property_type: "apartment" }));
    expect(house).toMatchObject({ min: 110, max: 220 });
    expect(apt).toMatchObject({ min: 90, max: 180 });
  });
});

describe("estimatePrice — modulateurs", () => {
  it("surface ≤ 40 m² : −10 %", () => {
    const r = estimatePrice([diag("erp")], ctx({ surface: 30 }));
    expect(r.appliedModulators).toContain("Surface ≤ 40 m² (−10 %)");
    expect(r).toMatchObject({ min: 20, max: 40 }); // 18→20, 36→40 (arrondi dizaine)
  });

  it("surface > 150 m² : +20 %", () => {
    const r = estimatePrice([diag("erp")], ctx({ surface: 200 }));
    expect(r.appliedModulators).toContain("Surface > 150 m² (+20 %)");
    expect(r).toMatchObject({ min: 20, max: 50 }); // 24→20, 48→50
  });

  it("urgence < 48 h : +20 %", () => {
    const r = estimatePrice([diag("erp")], ctx({ urgency: "asap" }));
    expect(r.appliedModulators).toContain("Intervention < 48 h (+20 %)");
    expect(r).toMatchObject({ min: 20, max: 50 });
  });

  it("hors 37 SANS distance connue : +15 %", () => {
    const r = estimatePrice([diag("erp")], ctx({ postal_code: "75001" }));
    expect(r.appliedModulators).toContain("Hors Indre-et-Loire (+15 %)");
    expect(r).toMatchObject({ min: 20, max: 50 }); // 23→20, 46→50
  });

  it("distance connue > 50 km : +30 € flat, PRIME sur le +15 %", () => {
    const r = estimatePrice([diag("erp")], ctx({ postal_code: "41000", distance_km: 80 }));
    expect(r.appliedModulators).toContain("Déplacement > 50 km (+30 €)");
    expect(r.appliedModulators).not.toContain("Hors Indre-et-Loire (+15 %)");
    expect(r).toMatchObject({ min: 50, max: 70 });
  });

  it("distance connue ≤ 50 km hors 37 : aucun modulateur de zone", () => {
    const r = estimatePrice([diag("erp")], ctx({ postal_code: "41000", distance_km: 20 }));
    expect(r.appliedModulators).toEqual([]);
    expect(r).toMatchObject({ min: 20, max: 40 });
  });

  it("pack ≥ 3 diagnostics : −15 %", () => {
    const r = estimatePrice([diag("dpe"), diag("gas"), diag("erp")], ctx());
    expect(r.appliedModulators).toContain("Pack complet ≥ 3 diagnostics (−15 %)");
    // (110+90+20)=220 → 187→190 ; (220+130+40)=390 → 331.5→330
    expect(r).toMatchObject({ min: 190, max: 330 });
  });

  it("chauffage collectif + DPE collectif présent : +10 %", () => {
    const r = estimatePrice(
      [diag("dpe_collective"), diag("erp")],
      ctx({ heating_mode: "collective" })
    );
    expect(r.appliedModulators).toContain("Chauffage collectif (+10 %)");
    expect(r).toMatchObject({ min: 680, max: 1690 }); // 620/1540 ×1.1 → 682/1694
  });

  it("chauffage collectif SANS DPE collectif : pas de majoration", () => {
    const r = estimatePrice([diag("erp")], ctx({ heating_mode: "collective" }));
    expect(r.appliedModulators).toEqual([]);
  });
});
