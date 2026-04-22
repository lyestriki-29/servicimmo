import Link from "next/link";

import { getCurrentUser } from "@/lib/features/auth/session";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export default async function ParametresPage() {
  const user = await getCurrentUser();
  const supabase = user ? await getSupabaseServerClient() : null;
  const { data: org } = supabase
    ? await supabase
        .from("organizations")
        .select("*")
        .eq("id", user!.profile.organization_id)
        .single()
    : { data: null };

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-2xl font-semibold">Paramètres</h1>
        <p className="text-sm text-neutral-500">
          Configuration du cabinet et export comptable.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-neutral-200 bg-white p-5">
          <div className="mb-3 font-mono text-[11px] tracking-widest text-neutral-500">
            INFOS CABINET
          </div>
          {org ? (
            <dl className="flex flex-col gap-2 text-sm">
              <Row label="Nom" value={org.name} />
              <Row label="SIRET" value={org.siret} />
              <Row label="IBAN" value={org.iban ? "●●●● " + org.iban.slice(-4) : null} />
              <Row label="TVA" value={org.tva_intra} />
              <Row label="Email" value={org.email} />
              <Row label="Téléphone" value={org.phone} />
              <Row label="Ville" value={`${org.postal_code ?? ""} ${org.city ?? ""}`.trim()} />
            </dl>
          ) : (
            <p className="text-sm text-neutral-500">
              Base non connectée. Les infos s&apos;afficheront après provisionnement.
            </p>
          )}
        </section>

        <section className="rounded-xl border border-neutral-200 bg-white p-5">
          <div className="mb-3 font-mono text-[11px] tracking-widest text-neutral-500">
            EXPORTS
          </div>
          <p className="mb-4 text-sm text-neutral-600">
            Générer le FEC (Fichier des Écritures Comptables) sur une période.
          </p>
          <form action="/api/fec/export" method="get" className="flex flex-col gap-3">
            <label className="flex flex-col">
              <span className="mb-1 text-[12px] font-medium text-neutral-700">Du</span>
              <input
                type="date"
                name="from"
                defaultValue={`${new Date().getFullYear()}-01-01`}
                className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm"
              />
            </label>
            <label className="flex flex-col">
              <span className="mb-1 text-[12px] font-medium text-neutral-700">Au</span>
              <input
                type="date"
                name="to"
                defaultValue={new Date().toISOString().slice(0, 10)}
                className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm"
              />
            </label>
            <button
              type="submit"
              className="self-start rounded-lg bg-neutral-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-neutral-800"
            >
              Télécharger le FEC
            </button>
          </form>
        </section>

        <section className="rounded-xl border border-neutral-200 bg-white p-5 lg:col-span-2">
          <div className="mb-3 font-mono text-[11px] tracking-widest text-neutral-500">
            SUITE À IMPLÉMENTER
          </div>
          <p className="text-sm text-neutral-600">
            Les modules suivants sont câblés côté DB/API mais leur UI
            d&apos;administration est prévue en polish Sprint 8+ :
          </p>
          <ul className="mt-3 list-disc pl-5 text-sm text-neutral-700">
            <li>Grille tarifaire (table <code>grille_tarifaire</code>)</li>
            <li>Règles de majoration (table <code>regles_majoration</code>)</li>
            <li>Modèles de demande (table <code>modeles_demande</code>)</li>
            <li>Gestion utilisateurs (admin invite / role switch)</li>
            <li>Catalogue prestations (si évolution du catalogue diagnostic_types)</li>
          </ul>
          <p className="mt-3 text-[12px] text-neutral-500">
            En attendant, ces tables sont éditables via l&apos;éditeur SQL Supabase.
          </p>
        </section>

        <section className="rounded-xl border border-neutral-200 bg-white p-5 lg:col-span-2">
          <div className="mb-3 font-mono text-[11px] tracking-widest text-neutral-500">
            RESSOURCES
          </div>
          <ul className="flex flex-col gap-1.5 text-sm">
            <li>
              <Link
                href="/app/statistiques"
                className="text-neutral-900 hover:underline"
              >
                → Statistiques détaillées
              </Link>
            </li>
            <li>
              <Link
                href="/app/demandes"
                className="text-neutral-900 hover:underline"
              >
                → Demandes de documents
              </Link>
            </li>
            <li>
              <Link
                href="/app/contacts/import"
                className="text-neutral-900 hover:underline"
              >
                → Import CSV contacts
              </Link>
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="text-neutral-500">{label}</dt>
      <dd className="text-right text-neutral-900">{value ?? "—"}</dd>
    </div>
  );
}
