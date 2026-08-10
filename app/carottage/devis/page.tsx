import type { Metadata } from "next";

import { ArianeFC } from "@/components/carottage/ArianeFC";
import { DevisFormFC } from "@/components/carottage/DevisFormFC";
import { SurtitreFC } from "@/components/carottage/SurtitreFC";
import { francecarottageConfig } from "@/lib/clients/francecarottage/config";

export const metadata: Metadata = {
  title: "Devis chantier — carottage & repérage amiante/HAP",
  description:
    "Décrivez votre chantier (voirie, réseaux, bâtiment) et recevez un devis de carottage et repérage amiante/HAP sur enrobés sous 24 h ouvrées. France Carottage.",
  alternates: { canonical: "/devis" },
};

export default function DevisPage() {
  return (
    <>
      <section className="border-b border-[color:var(--fc-gris-clair)] bg-white">
        <div className="mx-auto max-w-[var(--container,1280px)] px-6 py-12 md:px-8">
          <SurtitreFC>Devis chantier</SurtitreFC>
          <h1 className="mt-4 max-w-2xl font-[family-name:var(--font-sora)] text-[clamp(34px,3.5vw,42px)] font-extrabold leading-tight tracking-[-0.02em] text-balance text-[color:var(--fc-noir)]">
            Recevez votre devis sous 24 h ouvrées.
          </h1>
        </div>
      </section>
      <ArianeFC segments={[{ label: "Devis", href: "/devis" }]} />
      <section className="mx-auto grid max-w-[var(--container,1280px)] gap-10 px-6 py-10 md:grid-cols-[1.4fr_1fr] md:px-8">
        <DevisFormFC />
        <aside className="h-fit border-l-4 border-[color:var(--fc-rouge)] bg-white p-6">
          <p className="font-[family-name:var(--font-sora)] text-[16px] font-bold text-[color:var(--fc-noir)]">
            Besoin d’échanger de vive voix ?
          </p>
          <a
            href={francecarottageConfig.contact.telephoneHref}
            className="mt-3 inline-block font-[family-name:var(--font-sora)] text-[22px] font-extrabold text-[color:var(--fc-rouge)]"
          >
            {francecarottageConfig.contact.telephone}
          </a>
          <p className="mt-4 text-[13.5px] leading-relaxed text-[color:var(--fc-gris)]">
            Interventions {francecarottageConfig.zoneIntervention}. Prélèvements normalisés,
            laboratoire accrédité, rapports exploitables pour votre maîtrise d’œuvre.
          </p>
        </aside>
      </section>
    </>
  );
}
