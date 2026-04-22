import { describe, expect, it } from "vitest";

import { dedupeContacts, parseContactsCsv, parseCsvRaw } from "../csv";

describe("parseCsvRaw", () => {
  it("gère le séparateur virgule", () => {
    const out = parseCsvRaw("a,b,c\n1,2,3\n");
    expect(out).toEqual([
      ["a", "b", "c"],
      ["1", "2", "3"],
    ]);
  });

  it("détecte automatiquement le séparateur point-virgule", () => {
    const out = parseCsvRaw("a;b;c\n1;2;3\n");
    expect(out).toEqual([
      ["a", "b", "c"],
      ["1", "2", "3"],
    ]);
  });

  it("gère les valeurs entre guillemets avec virgule interne", () => {
    const out = parseCsvRaw('nom,adresse\nDupont,"12, rue X"\n');
    expect(out).toEqual([
      ["nom", "adresse"],
      ["Dupont", "12, rue X"],
    ]);
  });

  it("gère les guillemets doublés (échappement)", () => {
    const out = parseCsvRaw('nom\n"Il dit ""bonjour"""\n');
    expect(out).toEqual([["nom"], ['Il dit "bonjour"']]);
  });

  it("strip le BOM UTF-8", () => {
    const out = parseCsvRaw("\uFEFFa,b\n1,2");
    expect(out[0]).toEqual(["a", "b"]);
  });

  it("ignore les lignes vides", () => {
    const out = parseCsvRaw("a,b\n\n1,2\n\n");
    expect(out).toHaveLength(2);
  });
});

describe("parseContactsCsv", () => {
  it("valide un CSV bien formé", () => {
    const csv = [
      "type,first_name,last_name,email,phone",
      "particulier,Jean,Dupont,jean@ex.fr,0612345678",
      "agence,,Immo37,contact@immo37.fr,0247000000",
    ].join("\n");
    const res = parseContactsCsv(csv);
    expect(res.errors).toEqual([]);
    expect(res.rows).toHaveLength(2);
    expect(res.rows[0]?.type).toBe("particulier");
  });

  it("renvoie une erreur si la colonne 'type' manque", () => {
    const csv = "first_name,last_name\nJean,Dupont";
    const res = parseContactsCsv(csv);
    expect(res.errors.length).toBeGreaterThan(0);
    expect(res.rows).toHaveLength(0);
  });

  it("rejette une ligne avec email invalide", () => {
    const csv = "type,email\nparticulier,pas-un-email";
    const res = parseContactsCsv(csv);
    expect(res.errors).toHaveLength(1);
    expect(res.rows).toHaveLength(0);
  });

  it("accepte les champs vides optionnels", () => {
    const csv = "type,first_name,last_name,email\nparticulier,,Dupont,";
    const res = parseContactsCsv(csv);
    expect(res.errors).toEqual([]);
    expect(res.rows[0]?.email).toBeUndefined();
  });
});

describe("dedupeContacts", () => {
  it("dédup par email (case-insensitive)", () => {
    const out = dedupeContacts([
      { type: "particulier", email: "JEAN@ex.fr", first_name: "Jean" },
      { type: "particulier", email: "jean@ex.fr", first_name: "Jean bis" },
    ]);
    expect(out).toHaveLength(1);
  });

  it("dédup par téléphone normalisé (ignore espaces et +33)", () => {
    const out = dedupeContacts([
      { type: "particulier", phone: "06 12 34 56 78" },
      { type: "particulier", phone: "0612345678" },
    ]);
    expect(out).toHaveLength(1);
  });

  it("conserve les entrées sans clé de dédup", () => {
    const out = dedupeContacts([
      { type: "particulier", first_name: "Sans contact" },
      { type: "particulier", first_name: "Autre sans contact" },
    ]);
    expect(out).toHaveLength(2);
  });

  it("dédup avec clé email prioritaire sur phone", () => {
    const out = dedupeContacts([
      { type: "particulier", email: "a@ex.fr", phone: "0600000000" },
      { type: "particulier", email: "a@ex.fr", phone: "0611111111" },
    ]);
    expect(out).toHaveLength(1);
  });
});
