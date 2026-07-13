import Image from "next/image";
import Link from "next/link";
import { ArrowRightIcon, CheckIcon, PhoneIcon } from "lucide-react";

import { francecarottageConfig } from "@/lib/clients/francecarottage/config";

const GARANTIES = [...francecarottageConfig.certifications, "Laboratoire accrédité"];

/**
 * Hero France Carottage — photo chantier en duotone noir/rouge (le traitement
 * assume le panoramique basse hauteur), bloc titre bordé d'un trait rouge,
 * bandeau garanties intégré au bas, fermé par un liseré « signalisation ».
 */
export function HeroFC() {
  return (
    <section className="relative isolate flex min-h-[560px] flex-col overflow-hidden bg-[color:var(--fc-noir)] md:min-h-[640px]">
      <Image
        src="/img/carottage/hero-chantier.jpg"
        alt="Carottage d'enrobés routiers sur un chantier de voirie"
        fill
        priority
        sizes="100vw"
        className="object-cover object-[center_30%] opacity-50 grayscale contrast-125"
      />
      {/* Voile duotone noir → rouge pour la lisibilité et la signature colorée */}
      <div
        aria-hidden
        className="absolute inset-0 bg-[linear-gradient(100deg,#111113_26%,rgba(17,17,19,0.86)_52%,rgba(140,22,26,0.42)_100%)]"
      />
      <div className="relative mx-auto flex w-full max-w-[var(--container,1280px)] flex-1 flex-col justify-center px-6 py-20 md:px-8">
        <div className="max-w-2xl border-l-[3px] border-[color:var(--fc-rouge)] pl-6 md:pl-8">
          <p className="inline-flex items-center gap-3 font-[family-name:var(--font-sora)] text-[12.5px] font-bold uppercase tracking-[0.22em] text-white/70">
            Carottage routier · Amiante &amp; HAP · {francecarottageConfig.zoneIntervention}
          </p>
          <h1 className="mt-5 font-[family-name:var(--font-sora)] text-[44px] font-extrabold leading-[1.02] tracking-[-0.025em] text-white sm:text-[64px]">
            Le repérage amiante/HAP sur{" "}
            <span className="relative whitespace-nowrap text-white">
              enrobés
              <span aria-hidden className="absolute -bottom-1 left-0 h-[7px] w-full bg-[color:var(--fc-rouge)]" />
            </span>{" "}
            avant vos travaux.
          </h1>
          <p className="mt-6 max-w-xl text-[16px] leading-relaxed text-white/75">
            Prélèvements par carottage, analyses en laboratoire accrédité et rapports exploitables
            pour vos chantiers de voirie, réseaux et bâtiment — partout en France, sous 24 à 48 h.
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
      </div>
      {/* Bandeau garanties intégré au hero */}
      <div className="relative border-t border-white/10 bg-[rgba(12,12,14,0.72)] backdrop-blur-sm">
        <ul className="mx-auto grid max-w-[var(--container,1280px)] px-6 md:grid-cols-3 md:px-8">
          {GARANTIES.map((g) => (
            <li
              key={g}
              className="flex items-center gap-2.5 py-3.5 text-[12.5px] font-semibold text-white/85 md:first:pl-0 md:[&:not(:first-child)]:border-l md:[&:not(:first-child)]:border-white/10 md:[&:not(:first-child)]:pl-6"
            >
              <span
                aria-hidden
                className="grid h-[18px] w-[18px] flex-none place-items-center rounded-full bg-[color:var(--fc-rouge)]"
              >
                <CheckIcon className="h-3 w-3 text-white" />
              </span>
              {g}
            </li>
          ))}
        </ul>
      </div>
      {/* Liseré signalisation chantier */}
      <div
        aria-hidden
        className="relative h-2 bg-[repeating-linear-gradient(-45deg,var(--fc-rouge)_0_14px,#111113_14px_28px)]"
      />
    </section>
  );
}
