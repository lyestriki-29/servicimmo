import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";

import { ImportForm } from "./ImportForm";

export default function ContactsImportPage() {
  return (
    <div className="max-w-2xl">
      <Link
        href="/app/contacts"
        className="mb-4 inline-flex items-center gap-1.5 text-[13px] text-neutral-500 hover:text-neutral-900"
      >
        <ArrowLeftIcon className="h-3.5 w-3.5" aria-hidden /> Retour aux contacts
      </Link>
      <h1 className="mb-2 text-2xl font-semibold">Importer des contacts</h1>
      <p className="mb-6 text-sm text-neutral-500">
        Importez un fichier CSV exporté depuis votre outil actuel. Les
        doublons (même email ou téléphone) sont automatiquement fusionnés.
      </p>
      <ImportForm />
    </div>
  );
}
