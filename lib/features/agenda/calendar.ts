/**
 * Helpers purs pour la vue calendrier (Sprint 3 — F-10).
 * Fonctions testables sans DOM (month grid, week days, overlap detection).
 */

export type CalendarDay = {
  date: Date;
  iso: string; // YYYY-MM-DD
  inMonth: boolean;
  isToday: boolean;
};

/** Retourne une grille de 42 jours (6 semaines) pour un mois donné. */
export function buildMonthGrid(year: number, month0: number, today = new Date()): CalendarDay[] {
  const first = new Date(year, month0, 1);
  const dayOfWeek = (first.getDay() + 6) % 7; // Monday-first
  const start = new Date(year, month0, 1 - dayOfWeek);
  const days: CalendarDay[] = [];
  const todayIso = formatIso(today);
  for (let i = 0; i < 42; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const iso = formatIso(d);
    days.push({
      date: d,
      iso,
      inMonth: d.getMonth() === month0,
      isToday: iso === todayIso,
    });
  }
  return days;
}

export function formatIso(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Regroupe une liste d'événements par ISO date de début. */
export function groupEventsByDay<T extends { starts_at: string }>(
  events: T[]
): Record<string, T[]> {
  const out: Record<string, T[]> = {};
  for (const e of events) {
    const iso = e.starts_at.slice(0, 10);
    if (!out[iso]) out[iso] = [];
    out[iso]!.push(e);
  }
  return out;
}

/** Détecte les chevauchements de RDV pour un même technicien. */
export function findOverlappingAppointments<
  T extends { id: string; starts_at: string; ends_at: string; technicien_id: string | null },
>(events: T[]): Array<[T, T]> {
  const overlaps: Array<[T, T]> = [];
  const byTech = new Map<string, T[]>();
  for (const e of events) {
    if (!e.technicien_id) continue;
    const list = byTech.get(e.technicien_id) ?? [];
    list.push(e);
    byTech.set(e.technicien_id, list);
  }
  for (const list of byTech.values()) {
    list.sort((a, b) => a.starts_at.localeCompare(b.starts_at));
    for (let i = 0; i < list.length - 1; i++) {
      const a = list[i]!;
      const b = list[i + 1]!;
      if (a.ends_at > b.starts_at) overlaps.push([a, b]);
    }
  }
  return overlaps;
}
