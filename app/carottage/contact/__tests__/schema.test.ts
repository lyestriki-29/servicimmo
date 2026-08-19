import { describe, expect, it } from "vitest";

import { ContactSchema } from "../schema";

const valide = {
  nom: "Jean Dupont",
  email: "j.dupont@tpc.fr",
  sujet: "Carottage voirie à Orléans",
  message: "Bonjour, nous prévoyons une réfection de chaussée en mars, pouvez-vous nous chiffrer ?",
};

describe("ContactSchema", () => {
  it("accepte un message complet", () => {
    expect(ContactSchema.parse(valide).sujet).toBe("Carottage voirie à Orléans");
  });

  it("refuse un email mal formé", () => {
    expect(() => ContactSchema.parse({ ...valide, email: "pas-un-email" })).toThrow();
  });

  it("refuse un message trop court (moins de 10 caractères)", () => {
    expect(() => ContactSchema.parse({ ...valide, message: "trop court" })).not.toThrow();
    expect(() => ContactSchema.parse({ ...valide, message: "court" })).toThrow();
  });

  it("refuse un nom d'un seul caractère", () => {
    expect(() => ContactSchema.parse({ ...valide, nom: "J" })).toThrow();
  });

  it("refuse un message au-delà de 4000 caractères", () => {
    expect(() => ContactSchema.parse({ ...valide, message: "a".repeat(4001) })).toThrow();
  });
});
