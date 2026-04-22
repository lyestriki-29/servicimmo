import { describe, expect, it } from "vitest";

import { contactInputSchema } from "../schema";

describe("contactInputSchema", () => {
  it("accepte un particulier avec nom", () => {
    const r = contactInputSchema.safeParse({
      type: "particulier",
      first_name: "Jean",
      last_name: "Dupont",
    });
    expect(r.success).toBe(true);
  });

  it("refuse un particulier sans nom ni prénom", () => {
    const r = contactInputSchema.safeParse({ type: "particulier" });
    expect(r.success).toBe(false);
  });

  it("refuse un prescripteur sans raison sociale", () => {
    const r = contactInputSchema.safeParse({
      type: "agence",
      first_name: "Pierre",
    });
    expect(r.success).toBe(false);
  });

  it("accepte un prescripteur avec raison sociale", () => {
    const r = contactInputSchema.safeParse({
      type: "agence",
      company_name: "Immo37",
    });
    expect(r.success).toBe(true);
  });

  it("valide le format SIRET (14 chiffres)", () => {
    const ok = contactInputSchema.safeParse({
      type: "agence",
      company_name: "X",
      siret: "12345678901234",
    });
    expect(ok.success).toBe(true);

    const ko = contactInputSchema.safeParse({
      type: "agence",
      company_name: "X",
      siret: "123",
    });
    expect(ko.success).toBe(false);
  });

  it("valide le format code postal (5 chiffres)", () => {
    const ko = contactInputSchema.safeParse({
      type: "particulier",
      last_name: "Dupont",
      postal_code: "37",
    });
    expect(ko.success).toBe(false);
  });

  it("accepte un email vide (champ optionnel)", () => {
    const r = contactInputSchema.safeParse({
      type: "particulier",
      last_name: "Dupont",
      email: "",
    });
    expect(r.success).toBe(true);
  });
});
