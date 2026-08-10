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
      {/* Paliers `ecran-court` remplacés par des tailles continues (2026-08-03) :
          le hero changeait brutalement de gabarit à 800px de hauteur d'écran, si
          bien que deux ordinateurs voisins n'affichaient pas le même design. */}
      <div className="relative mx-auto max-w-[var(--container,1280px)] px-6 pt-16 pb-16 md:px-8 lg:py-[clamp(48px,9svh,96px)]">
        <div className="max-w-[600px] lg:max-w-[680px]">
          <KickerMono clair>Parlons de votre projet</KickerMono>
          <h1 className="mt-[clamp(12px,2svh,20px)] font-[family-name:var(--font-sora)] text-[clamp(32px,min(5vw,8svh),68px)] leading-[.99] font-extrabold tracking-[-0.04em] text-balance text-white">
            Une question ?{" "}
            <span className="text-[color:var(--color-si-lime)]">On vous répond vraiment</span>
          </h1>
          <p className="mt-[clamp(16px,2.8svh,24px)] max-w-[46ch] border-t border-white/25 pt-[clamp(16px,2.8svh,24px)] text-[16px] leading-[1.75] text-white/82 lg:text-[17px]">
            Appelez directement l’équipe ou décrivez votre besoin en ligne. Une réponse claire,
            sans transfert inutile.
          </p>
          <div className="mt-[clamp(20px,3.4svh,32px)] flex flex-wrap items-center gap-5">
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
          <p className="mt-[clamp(16px,3svh,28px)] inline-flex items-center gap-2 text-[12.5px] font-semibold text-white/70">
            <Clock3Icon className="h-4 w-4 text-[color:var(--color-si-lime)]" aria-hidden />
            Réponse sous 2 h ouvrées — sans transfert inutile
          </p>
        </div>
      </div>
    </section>
  );
}
