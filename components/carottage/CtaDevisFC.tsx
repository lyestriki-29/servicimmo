import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";

import { francecarottageConfig } from "@/lib/clients/francecarottage/config";

type Props = { titre?: string; sousTitre?: string };

/** CTA devis FC — bandeau rouge plein pleine largeur, unique tunnel de conversion. */
export function CtaDevisFC({
  titre = "Un chantier à repérer ?",
  sousTitre = "Décrivez votre projet, recevez un devis chiffré sous 24 h ouvrées.",
}: Props) {
  return (
    <section className="bg-[color:var(--fc-rouge)]">
      <div className="mx-auto flex max-w-[var(--container,1280px)] flex-col items-start gap-6 px-6 py-14 md:flex-row md:items-center md:justify-between md:px-8">
        <div>
          <h2 className="font-[family-name:var(--font-sora)] text-[26px] font-extrabold leading-tight text-white sm:text-[32px]">
            {titre}
          </h2>
          <p className="mt-2 text-[15px] text-white/85">{sousTitre}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/devis"
            className="inline-flex items-center gap-2 rounded-[4px] bg-white px-7 py-4 font-[family-name:var(--font-sora)] text-[14px] font-bold uppercase tracking-wide text-[color:var(--fc-rouge)] transition-transform hover:-translate-y-0.5"
          >
            Demander un devis
            <ArrowRightIcon className="h-4 w-4" aria-hidden />
          </Link>
          <a
            href={francecarottageConfig.contact.telephoneHref}
            className="inline-flex items-center rounded-[4px] border border-white/40 px-7 py-4 font-[family-name:var(--font-sora)] text-[14px] font-bold text-white transition-colors hover:border-white"
          >
            {francecarottageConfig.contact.telephone}
          </a>
        </div>
      </div>
    </section>
  );
}
