import Image from "next/image";
import Link from "next/link";
import { ArrowRightIcon, PhoneIcon } from "lucide-react";

import { francecarottageConfig } from "@/lib/clients/francecarottage/config";

/**
 * Hero France Carottage — pleine largeur image de chantier + voile sombre,
 * typographie massive Sora, accent rouge sur un mot-clé. Rien à voir avec le
 * hero « panneau » de Servicimmo : ici l'image porte tout, le texte est posé dessus.
 */
export function HeroFC() {
  return (
    <section className="relative isolate overflow-hidden bg-[color:var(--fc-noir)]">
      <Image
        src="/img/carottage/hero-chantier.jpg"
        alt="Carottage d'enrobés routiers sur un chantier de voirie"
        fill
        priority
        sizes="100vw"
        className="object-cover opacity-45"
      />
      {/* Voile dégradé pour la lisibilité du texte */}
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-r from-[color:var(--fc-noir)] via-[color:var(--fc-noir)]/80 to-transparent"
      />
      <div className="relative mx-auto max-w-[var(--container,1280px)] px-6 py-24 md:px-8 md:py-32">
        <p className="inline-flex items-center gap-3 font-[family-name:var(--font-sora)] text-[12.5px] font-bold uppercase tracking-[0.22em] text-white/70">
          <span aria-hidden className="h-[2px] w-8 bg-[color:var(--fc-rouge)]" />
          Carottage routier · Amiante & HAP · {francecarottageConfig.zoneIntervention}
        </p>
        <h1 className="mt-5 max-w-3xl font-[family-name:var(--font-sora)] text-[44px] font-extrabold leading-[1.02] tracking-[-0.02em] text-white sm:text-[62px]">
          Le repérage amiante/HAP sur{" "}
          <span className="relative whitespace-nowrap text-white">
            enrobés
            <span aria-hidden className="absolute -bottom-1 left-0 h-[6px] w-full bg-[color:var(--fc-rouge)]" />
          </span>{" "}
          avant vos travaux.
        </h1>
        <p className="mt-6 max-w-xl text-[16px] leading-relaxed text-white/75">
          Prélèvements par carottage, analyses conformes et rapports exploitables pour vos chantiers
          de voirie, réseaux et bâtiment — partout en France, sous 24 à 48 h.
        </p>
        <div className="mt-9 flex flex-wrap items-center gap-4">
          <Link
            href="/devis"
            className="inline-flex items-center gap-2 rounded-[4px] bg-[color:var(--fc-rouge)] px-7 py-4 font-[family-name:var(--font-sora)] text-[14.5px] font-bold uppercase tracking-wide text-white transition-colors hover:bg-[color:var(--fc-rouge-fonce)]"
          >
            Demander un devis
            <ArrowRightIcon className="h-4 w-4" aria-hidden />
          </Link>
          <a
            href={francecarottageConfig.contact.telephoneHref}
            className="inline-flex items-center gap-2 rounded-[4px] border border-white/25 px-7 py-4 font-[family-name:var(--font-sora)] text-[14.5px] font-bold text-white transition-colors hover:border-white/60"
          >
            <PhoneIcon className="h-4 w-4" aria-hidden />
            {francecarottageConfig.contact.telephone}
          </a>
        </div>
      </div>
    </section>
  );
}
