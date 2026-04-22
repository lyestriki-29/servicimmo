import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeftIcon } from "lucide-react";

import { getContact } from "@/lib/features/contacts/queries";

type PageProps = { params: Promise<{ id: string }> };

export default async function ContactDetailPage({ params }: PageProps) {
  const { id } = await params;
  const contact = await getContact(id);
  if (!contact) notFound();

  const title =
    contact.company_name ??
    [contact.first_name, contact.last_name].filter(Boolean).join(" ") ??
    "Contact";

  return (
    <div className="max-w-3xl">
      <Link
        href="/app/contacts"
        className="mb-4 inline-flex items-center gap-1.5 text-[13px] text-neutral-500 hover:text-neutral-900"
      >
        <ArrowLeftIcon className="h-3.5 w-3.5" aria-hidden /> Retour aux contacts
      </Link>
      <div className="mb-6 flex items-end justify-between">
        <div>
          <div className="mb-1 font-mono text-[11px] tracking-widest text-neutral-500">
            {contact.type.toUpperCase()}
          </div>
          <h1 className="text-2xl font-semibold">{title}</h1>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card title="Contact">
          <Row label="Email" value={contact.email} />
          <Row label="Téléphone" value={contact.phone} />
          <Row label="Téléphone 2" value={contact.phone_alt} />
        </Card>

        <Card title="Adresse">
          <Row label="Ligne 1" value={contact.address_line1} />
          <Row label="Ligne 2" value={contact.address_line2} />
          <Row label="Code postal" value={contact.postal_code} />
          <Row label="Ville" value={contact.city} />
          <Row label="Pays" value={contact.country} />
        </Card>

        {contact.siret ? (
          <Card title="Entreprise">
            <Row label="SIRET" value={contact.siret} />
            <Row
              label="Enrichi Pappers"
              value={
                contact.pappers_enriched_at
                  ? new Date(contact.pappers_enriched_at).toLocaleDateString("fr-FR")
                  : null
              }
            />
          </Card>
        ) : null}

        {contact.notes ? (
          <Card title="Notes">
            <p className="whitespace-pre-wrap text-sm text-neutral-700">{contact.notes}</p>
          </Card>
        ) : null}

        {contact.tags && contact.tags.length > 0 ? (
          <Card title="Tags">
            <div className="flex flex-wrap gap-1.5">
              {contact.tags.map((t) => (
                <span
                  key={t}
                  className="rounded-full bg-neutral-100 px-2 py-0.5 text-[11px] text-neutral-700"
                >
                  {t}
                </span>
              ))}
            </div>
          </Card>
        ) : null}
      </div>

      <div className="mt-6 text-[11px] text-neutral-400">
        Créé le {new Date(contact.created_at).toLocaleString("fr-FR")}
      </div>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-neutral-200 bg-white p-5">
      <div className="mb-3 font-mono text-[11px] tracking-widest text-neutral-500">
        {title.toUpperCase()}
      </div>
      <div className="flex flex-col gap-1.5">{children}</div>
    </section>
  );
}

function Row({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="flex justify-between gap-4 text-sm">
      <span className="text-neutral-500">{label}</span>
      <span className="text-right text-neutral-900">{value ?? "—"}</span>
    </div>
  );
}
