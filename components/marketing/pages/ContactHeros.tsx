import Image from "next/image";
import { ArrowRightIcon, Clock3Icon } from "lucide-react";

import { KickerMono } from "@/components/marketing/pages/ValidatedPageDesigns";

const TEL_AFFICHE = "02 47 47 01 23";
const TEL_LIEN = "tel:+33247470123";
const EMAIL = "info@servicimmo.fr";

/**
 * Hero de /contact retenu le 2026-07-17 (« voile allégé »).
 *
 * Le hero Fable d'origine voilait la photo d'équipe à 92 % : il effaçait la
 * preuve même de la promesse « on vous répond vraiment ». Ici le dégradé meurt
 * vers la droite — le titre garde son fond sombre à gauche, les personnes
 * restent visibles à droite.
 *
 * ⚠️ `equipe.jpg` est un panorama où figurent plusieurs personnes, cadrées
 * partiellement. Aucun texte n'avance d'effectif : il n'est confirmé nulle part.
 * Une vraie photo d'équipe cadrée reste à fournir (cf. reste-à-faire).
 */
export function ContactHeroVoileLeger() {
  return (
    <section className="relative overflow-hidden bg-[color:var(--color-home-ink)]">
      <Image
        src="/img/si/equipe.jpg"
        alt="L’équipe Servicimmo devant ses véhicules, au bord de la Loire"
        fill
        sizes="100vw"
        className="object-cover object-[72%_55%]"
        priority
      />
      {/* Le voile meurt à droite : au-delà du centre, la photo reste lisible. */}
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-r from-[color:var(--color-home-ink)]/95 via-[color:var(--color-home-ink)]/60 to-[color:var(--color-home-ink)]/10"
      />
      <div className="relative mx-auto max-w-[var(--container,1280px)] px-6 pt-16 pb-16 md:px-8 lg:pt-24 lg:pb-24 ecran-court:lg:pt-12 ecran-court:lg:pb-12">
        <div className="max-w-[600px]">
          <KickerMono clair>Parlons de votre projet</KickerMono>
          <h1 className="mt-5 font-[family-name:var(--font-sora)] text-[clamp(38px,5vw,68px)] leading-[.99] font-extrabold tracking-[-0.04em] text-balance text-white ecran-court:mt-3 ecran-court:text-[clamp(30px,3.4vw,46px)]">
            Une question ?{" "}
            <span className="text-[color:var(--color-si-lime)]">On vous répond vraiment</span>
          </h1>
          <p className="mt-6 max-w-[46ch] border-t border-white/25 pt-6 text-[16px] leading-[1.75] text-white/82 ecran-court:mt-4 ecran-court:pt-4">
            Appelez directement l’équipe ou décrivez votre besoin en ligne. Une réponse claire,
            sans transfert inutile.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-5 ecran-court:mt-5">
            <a
              href={TEL_LIEN}
              className="inline-flex min-h-12 items-center gap-2 rounded-full bg-[color:var(--color-si-lime)] px-6 font-[family-name:var(--font-sora)] text-[15px] font-bold text-[color:var(--color-home-ink)] transition-transform hover:-translate-y-0.5"
            >
              {TEL_AFFICHE}
            </a>
            <a
              href={`mailto:${EMAIL}`}
              className="group inline-flex items-center gap-2 text-[13.5px] font-bold text-white/85"
            >
              {EMAIL}
              <ArrowRightIcon
                className="h-4 w-4 text-[color:var(--color-si-lime)] transition-transform group-hover:translate-x-1"
                aria-hidden
              />
            </a>
          </div>
          <p className="mt-7 inline-flex items-center gap-2 text-[12.5px] font-semibold text-white/70 ecran-court:mt-4">
            <Clock3Icon className="h-4 w-4 text-[color:var(--color-si-lime)]" aria-hidden />
            Réponse sous 2 h ouvrées — sans transfert inutile
          </p>
        </div>
      </div>
    </section>
  );
}
