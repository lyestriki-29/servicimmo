import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";

import { RdvForm } from "./RdvForm";

type PageProps = { searchParams: Promise<{ dossier?: string }> };

export default async function NewRdvPage({ searchParams }: PageProps) {
  const { dossier } = await searchParams;
  return (
    <div>
      <Link
        href="/app/agenda"
        className="mb-4 inline-flex items-center gap-1.5 text-[13px] text-neutral-500 hover:text-neutral-900"
      >
        <ArrowLeftIcon className="h-3.5 w-3.5" aria-hidden /> Retour à l&apos;agenda
      </Link>
      <h1 className="mb-6 text-2xl font-semibold">Nouveau rendez-vous</h1>
      <RdvForm dossierId={dossier} />
    </div>
  );
}
