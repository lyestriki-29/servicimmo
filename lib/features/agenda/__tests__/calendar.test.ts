import { describe, expect, it } from "vitest";

import {
  buildMonthGrid,
  findOverlappingAppointments,
  formatIso,
  groupEventsByDay,
} from "../calendar";

describe("buildMonthGrid", () => {
  it("génère 42 cellules", () => {
    const grid = buildMonthGrid(2026, 3); // avril 2026 (month index 3)
    expect(grid).toHaveLength(42);
  });

  it("couvre tous les jours du mois (avril 2026 = 30 jours)", () => {
    const grid = buildMonthGrid(2026, 3);
    const inMonth = grid.filter((d) => d.inMonth);
    expect(inMonth).toHaveLength(30);
  });

  it("marque today correctement", () => {
    const today = new Date(2026, 3, 22);
    const grid = buildMonthGrid(2026, 3, today);
    const todayCell = grid.find((d) => d.isToday);
    expect(todayCell?.iso).toBe("2026-04-22");
  });

  it("commence le lundi", () => {
    // 1er avril 2026 est un mercredi → grille commence le 30 mars (lundi)
    const grid = buildMonthGrid(2026, 3);
    expect(grid[0]?.iso).toBe("2026-03-30");
  });
});

describe("formatIso", () => {
  it("formate correctement avec padding", () => {
    expect(formatIso(new Date(2026, 0, 5))).toBe("2026-01-05");
    expect(formatIso(new Date(2026, 11, 31))).toBe("2026-12-31");
  });
});

describe("groupEventsByDay", () => {
  it("regroupe par date de début", () => {
    const events = [
      { starts_at: "2026-04-22T10:00:00Z", label: "A" },
      { starts_at: "2026-04-22T14:00:00Z", label: "B" },
      { starts_at: "2026-04-23T09:00:00Z", label: "C" },
    ];
    const groups = groupEventsByDay(events);
    expect(groups["2026-04-22"]).toHaveLength(2);
    expect(groups["2026-04-23"]).toHaveLength(1);
  });
});

describe("findOverlappingAppointments", () => {
  it("détecte un chevauchement pour le même technicien", () => {
    const events = [
      { id: "a", starts_at: "2026-04-22T10:00:00Z", ends_at: "2026-04-22T11:30:00Z", technicien_id: "tech1" },
      { id: "b", starts_at: "2026-04-22T11:00:00Z", ends_at: "2026-04-22T12:00:00Z", technicien_id: "tech1" },
    ];
    const overlaps = findOverlappingAppointments(events);
    expect(overlaps).toHaveLength(1);
  });

  it("ne signale pas deux RDV consécutifs sans chevauchement", () => {
    const events = [
      { id: "a", starts_at: "2026-04-22T10:00:00Z", ends_at: "2026-04-22T11:00:00Z", technicien_id: "tech1" },
      { id: "b", starts_at: "2026-04-22T11:00:00Z", ends_at: "2026-04-22T12:00:00Z", technicien_id: "tech1" },
    ];
    expect(findOverlappingAppointments(events)).toEqual([]);
  });

  it("ignore les RDV sans technicien", () => {
    const events = [
      { id: "a", starts_at: "2026-04-22T10:00:00Z", ends_at: "2026-04-22T12:00:00Z", technicien_id: null },
      { id: "b", starts_at: "2026-04-22T11:00:00Z", ends_at: "2026-04-22T13:00:00Z", technicien_id: null },
    ];
    expect(findOverlappingAppointments(events)).toEqual([]);
  });

  it("détecte les chevauchements séparément par technicien", () => {
    const events = [
      { id: "a", starts_at: "2026-04-22T10:00:00Z", ends_at: "2026-04-22T12:00:00Z", technicien_id: "t1" },
      { id: "b", starts_at: "2026-04-22T11:00:00Z", ends_at: "2026-04-22T13:00:00Z", technicien_id: "t2" },
    ];
    expect(findOverlappingAppointments(events)).toEqual([]);
  });
});
