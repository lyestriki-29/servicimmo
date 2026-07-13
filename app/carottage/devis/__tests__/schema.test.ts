import { describe, expect, it } from "vitest";

import { DevisSchema } from "../schema";

const valide = {
  typeChantier: "voirie",
  localisation: "Orléans (45000)",
  uniteMesure: "surface",
  quantiteEstimee: 250,
  delai: "sous-1-mois",
  entreprise: "Travaux Publics du Centre",
  nom: "Jean Dupont",
  emailPro: "j.dupont@tpc.fr",
  telephone: "0238000000",
  message: "Réfection de voirie sur 250 m².",
};

describe("DevisSchema", () => {
  it("accepte une demande valide", () => {
    expect(DevisSchema.parse(valide).typeChantier).toBe("voirie");
  });

  it("refuse un type de chantier hors liste", () => {
    expect(() => DevisSchema.parse({ ...valide, typeChantier: "piscine" })).toThrow();
  });

  it("refuse un email non professionnel mal formé", () => {
    expect(() => DevisSchema.parse({ ...valide, emailPro: "pas-un-email" })).toThrow();
  });

  it("refuse une quantité nulle ou négative", () => {
    expect(() => DevisSchema.parse({ ...valide, quantiteEstimee: 0 })).toThrow();
  });

  it("rend le message facultatif", () => {
    const sansMessage = { ...valide };
    delete (sansMessage as { message?: string }).message;
    expect(() => DevisSchema.parse(sansMessage)).not.toThrow();
  });
});
