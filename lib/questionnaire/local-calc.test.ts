import { describe, expect, it } from "vitest";

import type { QuestionnaireData } from "@/lib/stores/questionnaire";

import { computeLocalCalculation, toCalculateBody, toQuoteFormData } from "./local-calc";

const COMPLETE: QuestionnaireData = {
  project_type: "sale",
  property_type: "house",
  address: "12 rue des Halles",
  postal_code: "37000",
  city: "Tours",
  surface: 95,
  rooms_count: 4,
  is_coownership: false,
  permit_date_range: "before_1949",
  heating_mode: "individual",
  heating_type: "gas",
  ecs_type: "gas",
  gas_installation: "city_gas",
  cooktop_connection: "souple",
  gas_over_15_years: true,
  electric_over_15_years: true,
  urgency: "week",
};

describe("toQuoteFormData", () => {
  it("retourne null si un prérequis moteur manque", () => {
    expect(toQuoteFormData({})).toBeNull();
    expect(toQuoteFormData({ ...COMPLETE, permit_date_range: undefined })).toBeNull();
    expect(toQuoteFormData({ ...COMPLETE, gas_over_15_years: undefined })).toBeNull();
  });

  it("mappe 1:1 les champs collectés (null explicite conservé)", () => {
    const fd = toQuoteFormData({ ...COMPLETE, gas_over_15_years: null });
    expect(fd).not.toBeNull();
    expect(fd?.gas_over_15_years).toBeNull();
    expect(fd?.postal_code).toBe("37000");
  });
});

describe("computeLocalCalculation", () => {
  it("null si données insuffisantes (le récap affichera l'état d'erreur)", () => {
    expect(computeLocalCalculation({})).toBeNull();
  });

  it("calcule diagnostics + estimation localement, source 'local'", () => {
    const calc = computeLocalCalculation(COMPLETE);
    expect(calc).not.toBeNull();
    expect(calc?.source).toBe("local");
    expect(calc?.required.map((d) => d.id)).toContain("dpe");
    expect(calc?.required.map((d) => d.id)).toContain("termites"); // CP 37
    expect(calc?.estimate.min).toBeGreaterThan(0);
    expect(calc?.estimate.max).toBeGreaterThanOrEqual(calc?.estimate.min ?? 0);
  });

  it("l'urgence asap module le prix (contexte transmis au pricing)", () => {
    const normal = computeLocalCalculation(COMPLETE);
    const urgent = computeLocalCalculation({ ...COMPLETE, urgency: "asap" });
    expect(urgent?.estimate.min).toBeGreaterThanOrEqual(normal?.estimate.min ?? 0);
    expect(urgent?.estimate.appliedModulators).toContain("Intervention < 48 h (+20 %)");
  });
});

describe("toCalculateBody", () => {
  it("null si adresse ou ville manquent (exigés par calculatePayloadSchema)", () => {
    expect(toCalculateBody({ ...COMPLETE, address: undefined })).toBeNull();
    expect(toCalculateBody({ ...COMPLETE, city: undefined })).toBeNull();
  });

  it("payload complet pour /api/calculate", () => {
    const body = toCalculateBody(COMPLETE);
    expect(body).toMatchObject({
      project_type: "sale",
      address: "12 rue des Halles",
      city: "Tours",
      urgency: "week",
    });
  });
});
