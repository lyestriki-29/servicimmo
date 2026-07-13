import { describe, expect, it } from "vitest";

import type { QuestionnaireData } from "@/lib/stores/questionnaire";

import { firstIncompleteIndex, getSteps, resolveStepIndex } from "./steps";

// ── Fixtures progressives ────────────────────────────────────────────────────
const BIEN: QuestionnaireData = {
  property_type: "house",
  address: "12 rue des Halles",
  postal_code: "37000",
  city: "Tours",
  surface: 95,
  rooms_count: 4,
  is_coownership: false,
};

const BATI: QuestionnaireData = {
  ...BIEN,
  permit_date_range: "before_1949",
  heating_mode: "individual",
  heating_type: "gas",
  ecs_type: "gas",
  gas_installation: "city_gas",
  cooktop_connection: "souple",
  gas_over_15_years: true,
  electric_over_15_years: true,
};

const CONTACT: QuestionnaireData = {
  ...BATI,
  email: "client@example.com",
  first_name: "Marie",
  phone: "06 12 34 56 78",
};

const FULL: QuestionnaireData = { ...CONTACT, urgency: "week" };

const stepIds = (branch: Parameters<typeof getSteps>[0], data: QuestionnaireData = {}) =>
  getSteps(branch, data).map((s) => s.id);

describe("getSteps — composition par branche", () => {
  it("vente : bien → bâti → contact → existants → délai", () => {
    expect(stepIds("sale")).toEqual(["bien", "bati", "contact", "existants", "delai"]);
  });

  it("location : + spécifique (type de bail) après le bâti", () => {
    expect(stepIds("rental")).toEqual([
      "bien", "bati", "specifique", "contact", "existants", "delai",
    ]);
    expect(getSteps("rental", {})[2]?.title).toBe("Votre location");
  });

  it("travaux : + spécifique (nature des travaux)", () => {
    expect(stepIds("works")).toEqual([
      "bien", "bati", "specifique", "contact", "existants", "delai",
    ]);
    expect(getSteps("works", {})[2]?.title).toBe("Vos travaux");
  });

  it("copropriété : même flux que la vente (parties communes = type de bien)", () => {
    expect(stepIds("coownership")).toEqual(["bien", "bati", "contact", "existants", "delai"]);
  });

  it("autre : chemin ultra-court, un seul écran", () => {
    expect(stepIds("other")).toEqual(["autre"]);
  });

  it("seule l'étape existants est facultative", () => {
    const optional = getSteps("sale", {}).filter((s) => s.optional).map((s) => s.id);
    expect(optional).toEqual(["existants"]);
  });
});

describe("Step.isComplete — prédicats", () => {
  const step = (branch: Parameters<typeof getSteps>[0], id: string) => {
    const found = getSteps(branch, {}).find((s) => s.id === id);
    if (!found) throw new Error(`step ${id} absente`);
    return found;
  };

  it("bien : incomplet si appartement sans étage", () => {
    expect(step("sale", "bien").isComplete({ ...BIEN, property_type: "apartment" })).toBe(false);
    expect(
      step("sale", "bien").isComplete({ ...BIEN, property_type: "apartment", floor: 3 })
    ).toBe(true);
  });

  it("bien : incomplet si local commercial sans activité", () => {
    expect(step("sale", "bien").isComplete({ ...BIEN, property_type: "commercial" })).toBe(false);
  });

  it("bâti : le raccordement cuisson n'est requis QUE si gaz présent", () => {
    expect(step("sale", "bati").isComplete({ ...BATI, cooktop_connection: undefined })).toBe(false);
    expect(
      step("sale", "bati").isComplete({
        ...BATI,
        gas_installation: "none",
        cooktop_connection: undefined,
      })
    ).toBe(true);
  });

  it("contact : email invalide ou téléphone court → incomplet", () => {
    expect(step("sale", "contact").isComplete({ ...CONTACT, email: "pas-un-email" })).toBe(false);
    expect(step("sale", "contact").isComplete({ ...CONTACT, phone: "06 12" })).toBe(false);
    expect(step("sale", "contact").isComplete(CONTACT)).toBe(true);
  });

  it("délai : source 'autre' sans précision → incomplet", () => {
    expect(
      step("sale", "delai").isComplete({ ...FULL, referral_source: "autre" })
    ).toBe(false);
    expect(
      step("sale", "delai").isComplete({
        ...FULL,
        referral_source: "autre",
        referral_other: "salon habitat",
      })
    ).toBe(true);
  });

  it("autre : description ≥ 10 caractères + contact + consentement RGPD", () => {
    const autre = getSteps("other", {})[0];
    if (!autre) throw new Error("étape autre absente");
    const data: QuestionnaireData = {
      email: "x@y.fr",
      first_name: "Luc",
      phone: "0612345678",
      notes: "Besoin d'un diagnostic avant division de parcelle.",
    };
    expect(autre.isComplete(data)).toBe(false); // consentement manquant
    expect(autre.isComplete({ ...data, consent_rgpd: true })).toBe(true);
    expect(autre.isComplete({ ...data, consent_rgpd: true, notes: "court" })).toBe(false);
  });
});

describe("firstIncompleteIndex / resolveStepIndex", () => {
  it("données vides → première étape", () => {
    const steps = getSteps("sale", {});
    expect(firstIncompleteIndex(steps, {})).toBe(0);
  });

  it("bien + bâti complets en location → l'étape spécifique (index 2)", () => {
    const steps = getSteps("rental", BATI);
    expect(firstIncompleteIndex(steps, BATI)).toBe(2);
  });

  it("étape facultative jamais bloquante : tout complet sauf délai → index délai", () => {
    const steps = getSteps("sale", CONTACT);
    expect(firstIncompleteIndex(steps, CONTACT)).toBe(4); // delai
  });

  it("tout complet → steps.length", () => {
    const steps = getSteps("sale", FULL);
    expect(firstIncompleteIndex(steps, FULL)).toBe(steps.length);
  });

  it("resolveStepIndex : saut en avant clampé au premier incomplet", () => {
    const steps = getSteps("sale", {});
    expect(resolveStepIndex(steps, "delai", {})).toBe(0);
  });

  it("resolveStepIndex : retour en arrière toujours permis", () => {
    const steps = getSteps("sale", FULL);
    expect(resolveStepIndex(steps, "bien", FULL)).toBe(0);
  });

  it("resolveStepIndex : id inconnu (purge / changement de branche) → premier incomplet", () => {
    const steps = getSteps("sale", BIEN);
    expect(resolveStepIndex(steps, "inexistante", BIEN)).toBe(1); // bati
    expect(resolveStepIndex(steps, null, FULL)).toBe(steps.length - 1);
  });

  it("robuste au changement d'une réponse antérieure : bien invalidé → retour clampé", () => {
    const broken: QuestionnaireData = { ...FULL, surface: undefined };
    const steps = getSteps("sale", broken);
    expect(resolveStepIndex(steps, "delai", broken)).toBe(0);
  });
});
