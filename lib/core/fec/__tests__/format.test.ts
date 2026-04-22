import { describe, expect, it } from "vitest";

import {
  formatFec,
  formatMontant,
  isBalanced,
  toFecDate,
  type FecEntry,
} from "../format";

function makeEntry(overrides: Partial<FecEntry> = {}): FecEntry {
  return {
    journalCode: "VT",
    journalLib: "Ventes",
    ecritureNum: "2026-001",
    ecritureDate: "20260422",
    compteNum: "411000",
    compteLib: "Client",
    pieceRef: "FA-2026-00001",
    pieceDate: "20260422",
    ecritureLib: "Facture diagnostic",
    debit: 240,
    credit: 0,
    validDate: "20260422",
    ...overrides,
  };
}

describe("formatMontant", () => {
  it("formate avec virgule et 2 décimales", () => {
    expect(formatMontant(100)).toBe("100,00");
    expect(formatMontant(10.5)).toBe("10,50");
    expect(formatMontant(10.499)).toBe("10,50");
    expect(formatMontant(0)).toBe("0,00");
  });
});

describe("toFecDate", () => {
  it("convertit ISO en YYYYMMDD", () => {
    expect(toFecDate("2026-04-22")).toBe("20260422");
    expect(toFecDate("2026-04-22T10:00:00Z")).toBe("20260422");
  });
  it("rejette une date invalide", () => {
    expect(() => toFecDate("bad")).toThrow();
  });
});

describe("formatFec", () => {
  it("commence par un header tabulé de 18 colonnes", () => {
    const out = formatFec([makeEntry()]);
    // Le BOM compte comme 1 char
    expect(out.startsWith("\uFEFF")).toBe(true);
    const firstLine = out.slice(1).split("\r\n")[0];
    const cols = firstLine?.split("\t");
    expect(cols?.length).toBe(18);
    expect(cols?.[0]).toBe("JournalCode");
  });

  it("utilise des séparateurs TAB et lignes CRLF", () => {
    const out = formatFec([makeEntry(), makeEntry({ ecritureNum: "2026-002" })]);
    expect(out).toContain("\r\n");
    expect(out).toContain("\t");
  });

  it("formate montants avec virgule", () => {
    const out = formatFec([makeEntry({ debit: 240.55, credit: 0 })]);
    expect(out).toContain("240,55");
  });
});

describe("isBalanced", () => {
  it("détecte un jeu équilibré", () => {
    const entries: FecEntry[] = [
      makeEntry({ debit: 240, credit: 0 }),
      makeEntry({ debit: 0, credit: 200, compteNum: "706000" }),
      makeEntry({ debit: 0, credit: 40, compteNum: "445710" }),
    ];
    expect(isBalanced(entries)).toBe(true);
  });

  it("détecte un déséquilibre", () => {
    const entries: FecEntry[] = [
      makeEntry({ debit: 240, credit: 0 }),
      makeEntry({ debit: 0, credit: 100 }),
    ];
    expect(isBalanced(entries)).toBe(false);
  });
});
