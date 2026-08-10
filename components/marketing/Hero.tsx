"use client";

import Image from "next/image";
import { ArrowRightIcon, PhoneIcon, ZapIcon, ClockIcon, MapPinIcon, ShieldCheckIcon } from "lucide-react";
import type { ReactNode } from "react";

import { Reveal } from "@/components/marketing/Reveal";
import { useCountUp } from "@/hooks/useCountUp";
import { useQuoteModal } from "@/components/questionnaire/QuoteModalProvider";

const BADGES = [
  { Icone: ZapIcon, libelle: "Devis sous 2 h" },
  { Icone: ClockIcon, libelle: "Intervention sous 48 h" },
  { Icone: MapPinIcon, libelle: "Indre-et-Loire (37)" },
] as const;

/* ─── Composant principal Hero (v-hero-3) ─── */
export function Hero() {
  const { ref: yearsRef, value: yearsValue } = useCountUp(28);
  const { open: openModal } = useQuoteModal();

  return (
    // Page vitrine : le hero EST le message, il occupe donc exactement l'écran
    // moins le header (à partir de `lg`). On ne voit que lui en arrivant.
    <section className="relative overflow-hidden bg-[color:var(--color-home-bg)] lg:h-[var(--hero-max-h)]">
      {/* Deco blob */}
      <div
        aria-hidden
        className="pointer-events-none absolute top-[-12%] right-[-6%] z-0 h-[62%] w-[46%] rounded-[48%_52%_60%_40%/55%_48%_52%_45%] bg-[color:var(--color-home-saf-bg)] opacity-70 blur-[2px]"
      />

      <div className="relative z-[1] mx-auto max-w-[var(--container,1280px)] px-6 pt-10 pb-16 md:px-8 lg:flex lg:h-full lg:flex-col lg:justify-center lg:py-[clamp(20px,2.6svh,32px)]">
        {/* `lg:flex-1` : la grille RÉCLAME toute la hauteur restante au lieu de
            se contenter de celle de son contenu. Sans ça, le hero mesurait bien
            un écran mais son contenu flottait au milieu, d'où les grands vides
            en haut et en bas signalés le 2026-08-03.
            `items-stretch` n'étire que la colonne photo ; le texte reprend la
            main avec `self-center` pour rester groupé face à elle. */}
        <div className="grid items-center gap-[clamp(24px,4svh,48px)] md:grid-cols-[1.05fr_.95fr] lg:min-h-0 lg:flex-1 lg:items-stretch">

          {/* ── Colonne gauche : copy ── */}
          <Reveal direction="left" className="lg:self-center">
            <span className="font-[family-name:var(--font-sora)] text-[13px] font-semibold tracking-[0.04em] text-[color:var(--color-home-saf-dark)] lg:text-[14px]">
              Diagnostic immobilier · Tours depuis 1998
            </span>

            {/* Taille pilotée par la plus contraignante des deux dimensions :
                `min(5.4vw, 9svh)`. La largeur seule mentait — ce qui manque sur
                un portable 1280x641, c'est de la HAUTEUR, et le titre restait à
                76px jusqu'à ce qu'un palier `ecran-court` le fasse chuter d'un
                coup à 46px. Ici il décroît en continu : deux machines voisines ne
                voient plus deux designs différents. Plancher 40px = le mobile,
                où les deux unités deviennent minuscules.
                Plus de <br/> forcés : à 76px « obligatoires identifiés » ne tient
                dans AUCUNE colonne, la coupure tombait en plein milieu du mot
                surligné. `text-balance` répartit les lignes quelle que soit la
                taille retenue. */}
            <h1 className="mt-[clamp(8px,1.6svh,16px)] mb-[clamp(12px,2.4svh,24px)] font-[family-name:var(--font-sora)] text-[clamp(40px,min(5.4vw,9svh),92px)] font-extrabold leading-[1.02] tracking-[-0.03em] text-balance text-[color:var(--color-home-ink)]">
              Vos diagnostics obligatoires{" "}
              <em className="relative inline-block not-italic text-[color:var(--color-home-saf-dark)] after:absolute after:bottom-[0.08em] after:left-0 after:right-0 after:z-[-1] after:h-[0.34em] after:rounded-[3px] after:bg-[color:var(--color-home-saf)] after:opacity-30 after:content-['']">
                identifiés
              </em>{" "}
              en 2&nbsp;minutes
            </h1>

            <p className="mb-[clamp(16px,2.8svh,28px)] max-w-[480px] font-[family-name:var(--font-inter)] text-[clamp(16px,2.2svh,20px)] leading-[1.6] text-pretty text-[color:var(--color-home-muted)] lg:max-w-[560px]">
              Vente, location, travaux : on cible précisément les diagnostics réglementaires de votre
              bien, puis on intervient vite. Devis sous 2&nbsp;h, rendez-vous sous 48&nbsp;h.
            </p>

            {/* CTA */}
            <div className="mb-6 flex flex-wrap items-center gap-[18px]">
              <button
                type="button"
                onClick={() => openModal()}
                className="inline-flex items-center gap-2 rounded-[10px] border border-[color:var(--color-home-line)] bg-[color:var(--color-si-creme)] px-6 py-3.5 font-[family-name:var(--font-sora)] text-[15px] font-bold lg:text-[16px] text-[color:var(--color-si-petrole)] shadow-[0_2px_10px_rgba(15,30,58,.06)] transition-colors hover:bg-white"
              >
                Commencer mon devis
                <ArrowRightIcon className="h-4 w-4" aria-hidden />
              </button>
              <a
                href="tel:0247470123"
                className="inline-flex items-center gap-2.5 font-[family-name:var(--font-sora)] text-[17px] font-bold lg:text-[18px] text-[color:var(--color-home-ink)] [&_svg]:text-[color:var(--color-home-saf-dark)]"
              >
                <PhoneIcon className="h-4 w-4" aria-hidden />
                02 47 47 01 23
              </a>
            </div>

            {/* Meta badges — une seule chaîne de classes pour les trois : elle
                était recopiée à l'identique, donc toute retouche demandait trois
                éditions à garder synchrones. */}
            <div className="flex flex-wrap gap-[22px]">
              {BADGES.map(({ Icone, libelle }) => (
                <span
                  key={libelle}
                  className="inline-flex items-center gap-2 font-[family-name:var(--font-sora)] text-[13.5px] font-semibold text-[color:var(--color-home-ink)] lg:text-[14.5px] [&_svg]:text-[color:var(--color-home-saf-dark)]"
                >
                  <Icone className="h-[14px] w-[14px]" aria-hidden /> {libelle}
                </span>
              ))}
            </div>
          </Reveal>

          {/* ── Colonne droite : visuel ── */}
          <Reveal direction="right" className="lg:h-full">
            <div className="relative lg:h-full">
              {/* Hauteur relative à l'écran, plus figée à 560px : le hero mesure
                  `100svh - 118px`, donc sous ~678px de haut l'image était PLUS
                  GRANDE que la boîte qui la contient et se faisait couper en bas
                  (visible sur les captures d'un portable 1280x641). */}
              <Image
                src="/img/si/hero3.jpg"
                alt="Bien immobilier diagnostiqué à Tours"
                width={1600}
                height={1063}
                priority
                className="h-[clamp(300px,54svh,560px)] w-full rounded-[32px] object-cover lg:h-full [clip-path:polygon(14%_0,100%_0,100%_100%,0_100%)] max-[880px]:[clip-path:none] max-[880px]:h-[340px]"
              />
              {/* Encart confiance + count-up */}
              <Reveal direction="zoom" className="absolute bottom-12 -left-6">
                <div className="flex flex-col rounded-[24px] bg-[#003d42] px-6 py-[18px] shadow-[0_10px_34px_rgba(15,30,58,.30)]">
                  <span className="inline-flex items-center gap-1.5 font-[family-name:var(--font-sora)] text-[11px] font-bold uppercase tracking-[0.07em] text-white/85">
                    <ShieldCheckIcon className="h-[13px] w-[13px]" aria-hidden />
                    Certifiés &amp; assurés
                  </span>
                  <div className="mt-2 flex items-baseline gap-1.5">
                    <span
                      ref={yearsRef}
                      className="font-[family-name:var(--font-sora)] text-[40px] font-extrabold leading-none text-[color:var(--color-home-saf)]"
                    >
                      {yearsValue}
                    </span>
                    <em className="not-italic text-[17px] font-bold text-white">ans</em>
                  </div>
                  <p className="mt-1 text-[12.5px] font-medium leading-[1.4] text-white/70">
                    d&apos;expertise locale
                    <br />
                    depuis 1998
                  </p>
                </div>
              </Reveal>
            </div>
          </Reveal>
        </div>

      </div>
    </section>
  );
}

/**
 * Eyebrow partagé — conservé pour compatibilité avec les sections D3 existantes.
 * @deprecated Les nouvelles sections home.html utilisent directement une <span>.
 */
export function Eyebrow({ children, onDark }: { children: ReactNode; onDark?: boolean }) {
  const color = onDark ? "var(--color-home-saf)" : "var(--color-home-saf-dark)";
  return (
    <span
      className="inline-flex items-center gap-2.5 font-mono text-[11px] font-semibold uppercase tracking-[0.1em]"
      style={{ color }}
    >
      <span aria-hidden className="h-[1px] w-[22px]" style={{ backgroundColor: color }} />
      {children}
    </span>
  );
}
