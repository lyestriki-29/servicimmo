import Link from "next/link";
import { PlusIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

import { listRendezVous } from "@/lib/features/agenda/queries";
import {
  buildMonthGrid,
  findOverlappingAppointments,
  groupEventsByDay,
} from "@/lib/features/agenda/calendar";

type PageProps = {
  searchParams: Promise<{ year?: string; month?: string }>;
};

const FR_WEEKDAYS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
const FR_MONTHS = [
  "Janvier",
  "Février",
  "Mars",
  "Avril",
  "Mai",
  "Juin",
  "Juillet",
  "Août",
  "Septembre",
  "Octobre",
  "Novembre",
  "Décembre",
];

export default async function AgendaPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const now = new Date();
  const year = sp.year ? parseInt(sp.year, 10) : now.getFullYear();
  const month0 = sp.month ? parseInt(sp.month, 10) - 1 : now.getMonth();

  const monthStart = new Date(year, month0, 1);
  const monthEnd = new Date(year, month0 + 1, 0, 23, 59, 59);

  const grid = buildMonthGrid(year, month0);
  const { rdv, available } = await listRendezVous(monthStart, monthEnd);
  const byDay = groupEventsByDay(rdv);
  const overlaps = findOverlappingAppointments(rdv);
  const overlapIds = new Set(overlaps.flatMap(([a, b]) => [a.id, b.id]));

  const prev = new Date(year, month0 - 1, 1);
  const next = new Date(year, month0 + 1, 1);

  return (
    <div>
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Agenda</h1>
          <p className="text-sm text-neutral-500">
            Planning des rendez-vous d&apos;intervention.
          </p>
        </div>
        <Link
          href="/app/agenda/new"
          className="inline-flex items-center gap-1.5 rounded-lg bg-neutral-900 px-3.5 py-2 text-sm font-medium text-white hover:bg-neutral-800"
        >
          <PlusIcon className="h-4 w-4" aria-hidden /> Nouveau RDV
        </Link>
      </header>

      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link
            href={`/app/agenda?year=${prev.getFullYear()}&month=${prev.getMonth() + 1}`}
            className="rounded-lg border border-neutral-200 bg-white p-1.5 hover:border-neutral-400"
            aria-label="Mois précédent"
          >
            <ChevronLeftIcon className="h-4 w-4" aria-hidden />
          </Link>
          <div className="min-w-[180px] text-center text-sm font-medium text-neutral-900">
            {FR_MONTHS[month0]} {year}
          </div>
          <Link
            href={`/app/agenda?year=${next.getFullYear()}&month=${next.getMonth() + 1}`}
            className="rounded-lg border border-neutral-200 bg-white p-1.5 hover:border-neutral-400"
            aria-label="Mois suivant"
          >
            <ChevronRightIcon className="h-4 w-4" aria-hidden />
          </Link>
        </div>
        {!available ? (
          <div className="text-[12px] text-amber-700">
            Base non connectée — agenda en lecture seule.
          </div>
        ) : overlaps.length > 0 ? (
          <div className="text-[12px] text-amber-700">
            ⚠ {overlaps.length} chevauchement(s) détecté(s)
          </div>
        ) : null}
      </div>

      <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white">
        <div className="grid grid-cols-7 border-b border-neutral-200 bg-neutral-50 text-[11px] font-medium uppercase tracking-wider text-neutral-500">
          {FR_WEEKDAYS.map((d) => (
            <div key={d} className="px-2 py-2 text-center">
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {grid.map((day) => {
            const events = byDay[day.iso] ?? [];
            return (
              <div
                key={day.iso}
                className={`min-h-[92px] border-b border-r border-neutral-100 p-1.5 last:border-r-0 ${
                  day.inMonth ? "bg-white" : "bg-neutral-50"
                } ${day.isToday ? "ring-1 ring-neutral-900 ring-inset" : ""}`}
              >
                <div
                  className={`mb-1 text-right font-mono text-[11px] ${
                    day.inMonth ? "text-neutral-700" : "text-neutral-400"
                  } ${day.isToday ? "font-bold text-neutral-900" : ""}`}
                >
                  {day.date.getDate()}
                </div>
                <div className="flex flex-col gap-0.5">
                  {events.map((ev) => (
                    <Link
                      key={ev.id}
                      href={`/app/agenda/${ev.id}`}
                      className={`truncate rounded px-1.5 py-0.5 text-[10px] ${
                        overlapIds.has(ev.id)
                          ? "bg-amber-100 text-amber-900"
                          : "bg-neutral-900 text-white"
                      }`}
                      title={ev.title}
                    >
                      {new Date(ev.starts_at).toLocaleTimeString("fr-FR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}{" "}
                      {ev.title}
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
