import Link from "next/link";
import { PlusIcon, UploadIcon } from "lucide-react";

import { listContacts } from "@/lib/features/contacts/queries";
import type { ContactRow } from "@/lib/supabase/types";

const VALID_TYPES: ContactRow["type"][] = [
  "particulier",
  "agence",
  "notaire",
  "syndic",
  "autre",
];

const TYPE_LABELS: Record<string, string> = {
  particulier: "Particulier",
  agence: "Agence",
  notaire: "Notaire",
  syndic: "Syndic",
  autre: "Autre",
};

type ContactsPageProps = {
  searchParams: Promise<{ search?: string; type?: string }>;
};

export default async function ContactsPage({ searchParams }: ContactsPageProps) {
  const { search, type } = await searchParams;
  const typedFilter = VALID_TYPES.find((v) => v === type);
  const { contacts, available } = await listContacts({
    search,
    type: typedFilter,
  });

  return (
    <div>
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Contacts</h1>
          <p className="text-sm text-neutral-500">
            Particuliers et prescripteurs (agences, notaires, syndics).
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/app/contacts/import"
            className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-3.5 py-2 text-sm text-neutral-700 hover:border-neutral-400"
          >
            <UploadIcon className="h-4 w-4" aria-hidden /> Importer CSV
          </Link>
          <Link
            href="/app/contacts/new"
            className="inline-flex items-center gap-1.5 rounded-lg bg-neutral-900 px-3.5 py-2 text-sm font-medium text-white hover:bg-neutral-800"
          >
            <PlusIcon className="h-4 w-4" aria-hidden /> Nouveau contact
          </Link>
        </div>
      </header>

      <form className="mb-4 flex items-center gap-2">
        <input
          name="search"
          defaultValue={search ?? ""}
          placeholder="Rechercher par nom, email, raison sociale…"
          className="w-64 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:border-neutral-900"
        />
        <select
          name="type"
          defaultValue={type ?? ""}
          className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm"
        >
          <option value="">Tous les types</option>
          {Object.entries(TYPE_LABELS).map(([v, l]) => (
            <option key={v} value={v}>
              {l}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-700 hover:border-neutral-400"
        >
          Filtrer
        </button>
      </form>

      {!available ? (
        <EmptyState
          title="Base non connectée"
          message="Le projet Supabase n'est pas encore provisionné ou vous n'êtes pas connecté. Les contacts apparaîtront ici une fois l'environnement configuré."
        />
      ) : contacts.length === 0 ? (
        <EmptyState
          title="Aucun contact"
          message="Créez un premier contact ou importez un CSV pour démarrer."
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white">
          <table className="w-full text-sm">
            <thead className="border-b border-neutral-200 bg-neutral-50 text-left text-[12px] font-medium text-neutral-600">
              <tr>
                <th className="px-4 py-2.5">Type</th>
                <th className="px-4 py-2.5">Nom / Raison sociale</th>
                <th className="px-4 py-2.5">Email</th>
                <th className="px-4 py-2.5">Téléphone</th>
                <th className="px-4 py-2.5">Ville</th>
              </tr>
            </thead>
            <tbody>
              {contacts.map((c) => (
                <tr key={c.id} className="border-b border-neutral-100 last:border-b-0">
                  <td className="px-4 py-2.5">
                    <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[11px] uppercase tracking-wide text-neutral-600">
                      {TYPE_LABELS[c.type] ?? c.type}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 font-medium text-neutral-900">
                    <Link href={`/app/contacts/${c.id}`} className="hover:underline">
                      {c.company_name ??
                        [c.first_name, c.last_name].filter(Boolean).join(" ") ??
                        "—"}
                    </Link>
                  </td>
                  <td className="px-4 py-2.5 text-neutral-600">{c.email ?? "—"}</td>
                  <td className="px-4 py-2.5 text-neutral-600">{c.phone ?? "—"}</td>
                  <td className="px-4 py-2.5 text-neutral-600">{c.city ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function EmptyState({ title, message }: { title: string; message: string }) {
  return (
    <div className="rounded-xl border border-dashed border-neutral-300 bg-white/60 p-8 text-center">
      <div className="text-sm font-medium text-neutral-900">{title}</div>
      <p className="mx-auto mt-1 max-w-md text-sm text-neutral-500">{message}</p>
    </div>
  );
}
