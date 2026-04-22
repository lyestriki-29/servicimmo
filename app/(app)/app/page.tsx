import Link from "next/link";
import {
  FolderOpenIcon,
  UsersIcon,
  CalendarIcon,
  FileTextIcon,
} from "lucide-react";

/**
 * Dashboard `/app` — Sprint 1 minimal.
 * Remplace le stub Sprint 0. Version riche livrée au Sprint 7.
 */
export default function AppDashboardPage() {
  return (
    <div>
      <header className="mb-8">
        <h1 className="text-2xl font-semibold">Tableau de bord</h1>
        <p className="text-sm text-neutral-500">
          Accès rapide aux modules. Version complète avec KPI et stats au Sprint 7.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <QuickCard
          href="/app/contacts"
          icon={UsersIcon}
          title="Contacts"
          description="Particuliers et prescripteurs."
        />
        <QuickCard
          href="/app/dossiers"
          icon={FolderOpenIcon}
          title="Dossiers"
          description="Pilotage des interventions."
        />
        <QuickCard
          href="/app/agenda"
          icon={CalendarIcon}
          title="Agenda"
          description="RDV et planning."
        />
        <QuickCard
          href="/app/facturation"
          icon={FileTextIcon}
          title="Facturation"
          description="Devis, factures, paiements."
        />
      </div>
    </div>
  );
}

function QuickCard({
  href,
  icon: Icon,
  title,
  description,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="group flex flex-col rounded-xl border border-neutral-200 bg-white p-5 transition-colors hover:border-neutral-400"
    >
      <Icon className="mb-3 h-5 w-5 text-neutral-500 transition-colors group-hover:text-neutral-900" />
      <div className="text-sm font-medium text-neutral-900">{title}</div>
      <div className="mt-0.5 text-[12px] text-neutral-500">{description}</div>
    </Link>
  );
}
