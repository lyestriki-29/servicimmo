import Image from "next/image";
import { ArrowRightIcon } from "lucide-react";

import { GoogleMapEmbed } from "@/components/marketing/pages/GoogleMapEmbed";

import { AMBOISE, CONTROLES } from "./claude-directions-data";

const STATS = [
  { valeur: `${AMBOISE.distanceKm} km`, legende: "entre votre bien et notre agence de Tours" },
  { valeur: AMBOISE.delai, legende: "pour obtenir un créneau d’intervention" },
  { valeur: "6", legende: "contrôles possibles selon votre projet" },
] as const;

export function DirectionClairObscur() {
  return (
    <div className="bg-[color:var(--color-si-petrole)]">
      {/* Hero : le nom de la ville comme monument typographique */}
      <section className="relative overflow-hidden">
        <Image
          src="/img/si/claude/amboise-panorama.jpg"
          alt=""
          aria-hidden
          fill
          sizes="100vw"
          className="object-cover opacity-25 grayscale"
          priority
        />
        <div className="relative mx-auto flex min-h-[620px] max-w-[var(--container,1280px)] flex-col justify-end px-6 pt-28 pb-14 md:px-8">
          <p className="text-[12px] font-bold tracking-[.28em] text-[color:var(--color-si-creme)]/60 uppercase">
            Servicimmo — Diagnostic immobilier
          </p>
          <h1 className="mt-4 font-[family-name:var(--font-sora)] text-[clamp(64px,11vw,150px)] leading-[.92] font-extrabold tracking-[-0.045em] text-[color:var(--color-si-creme)]">
            {AMBOISE.nom}.
          </h1>
          <div className="mt-8 flex flex-wrap items-end justify-between gap-8 border-t border-[color:var(--color-si-creme)]/25 pt-7">
            <p className="max-w-[52ch] text-[17px] leading-[1.75] text-[color:var(--color-si-creme)]/80">
              Vendre, louer ou rénover un bien ici demande des certitudes. Nous les établissons :
              diagnostics réglementaires, mesures exactes, rapports expliqués.
            </p>
            <a
              href="/devis"
              className="group inline-flex items-center gap-3 text-[15px] font-bold text-[color:var(--color-si-lime)]"
            >
              Demander un devis
              <ArrowRightIcon
                className="h-5 w-5 transition-transform group-hover:translate-x-1.5"
                aria-hidden
              />
            </a>
          </div>
        </div>
      </section>

      {/* Chiffres : immenses, sans décorum */}
      <section className="bg-[color:var(--color-home-ink)]">
        <div className="mx-auto grid max-w-[var(--container,1280px)] px-6 py-16 md:grid-cols-3 md:px-8 lg:py-20">
          {STATS.map((stat) => (
            <div
              key={stat.valeur}
              className="border-b border-[color:var(--color-si-creme)]/15 py-8 md:border-r md:border-b-0 md:px-10 md:py-2 md:first:pl-0 md:last:border-r-0"
            >
              <p className="font-[family-name:var(--font-sora)] text-[clamp(48px,6vw,88px)] leading-none font-extrabold tracking-[-0.04em] text-[color:var(--color-si-creme)]">
                {stat.valeur}
              </p>
              <p className="mt-4 max-w-[24ch] text-[13.5px] leading-relaxed text-[color:var(--color-si-creme)]/55">
                {stat.legende}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Contrôles : une liste éditoriale, rien d’autre */}
      <section className="bg-[color:var(--color-home-ink)]">
        <div className="mx-auto max-w-[var(--container,1280px)] px-6 pb-20 md:px-8">
          <h2 className="max-w-[700px] font-[family-name:var(--font-sora)] text-[clamp(26px,3.2vw,42px)] leading-[1.08] font-extrabold tracking-[-0.03em] text-balance text-[color:var(--color-si-creme)]">
            Ce que votre projet peut exiger, à {AMBOISE.nom}.
          </h2>
          <ol className="mt-10 border-t border-[color:var(--color-si-creme)]/15">
            {CONTROLES.map((controle, index) => (
              <li
                key={controle.ref}
                className="grid gap-2 border-b border-[color:var(--color-si-creme)]/15 py-6 md:grid-cols-[80px_minmax(0,.9fr)_minmax(0,1.1fr)] md:items-baseline md:gap-8"
              >
                <span className="font-mono text-[13px] text-[color:var(--color-si-creme)]/35">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="font-[family-name:var(--font-sora)] text-[clamp(19px,2vw,26px)] font-bold tracking-[-0.015em] text-[color:var(--color-si-creme)]">
                  {controle.titre}
                </h3>
                <p className="text-[13.5px] leading-[1.7] text-[color:var(--color-si-creme)]/55">
                  {controle.note}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Respiration photographique */}
      <section className="relative h-[300px] overflow-hidden">
        <Image
          src="/img/si/claude/amboise-facade-renaissance.jpg"
          alt={`Façade Renaissance en tuffeau à ${AMBOISE.nom}`}
          fill
          sizes="100vw"
          className="object-cover object-[center_30%] grayscale"
        />
        <div aria-hidden className="absolute inset-0 bg-[color:var(--color-si-petrole)]/55" />
        <p className="absolute bottom-6 left-1/2 w-full max-w-[900px] -translate-x-1/2 px-6 text-center font-[family-name:var(--font-sora)] text-[clamp(18px,2.4vw,28px)] font-bold text-[color:var(--color-si-creme)]">
          « Un diagnostic n’est pas une formalité. C’est la vérité d’un bien. »
        </p>
      </section>

      {/* Carte : la respiration claire */}
      <section className="bg-[color:var(--color-si-creme)]">
        <div className="mx-auto max-w-[1000px] px-6 py-16 md:px-8 lg:py-24">
          <p className="text-center text-[12px] font-bold tracking-[.24em] text-[color:var(--color-si-petrole)] uppercase">
            Notre terrain
          </p>
          <div className="mt-8 h-[440px] overflow-hidden rounded-[4px] border border-[color:var(--color-home-ink)]/15">
            <GoogleMapEmbed
              query={`${AMBOISE.nom} ${AMBOISE.codePostal}, France`}
              zoom={12}
              title={`Carte du secteur d’intervention à ${AMBOISE.nom}`}
            />
          </div>
          <p className="mt-6 text-center text-[13.5px] leading-relaxed text-[color:var(--color-home-muted-2)]">
            {AMBOISE.nom}, {AMBOISE.communesVoisines.join(", ")} — et toute l’Indre-et-Loire depuis
            Tours.
          </p>
        </div>
      </section>

      {/* CTA : une phrase, un geste */}
      <section className="bg-[color:var(--color-si-petrole)]">
        <div className="mx-auto max-w-[var(--container,1280px)] px-6 py-20 text-center md:px-8 lg:py-28">
          <h2 className="mx-auto max-w-[820px] font-[family-name:var(--font-sora)] text-[clamp(32px,4.6vw,60px)] leading-[1.02] font-extrabold tracking-[-0.035em] text-balance text-[color:var(--color-si-creme)]">
            Votre bien mérite un regard exact.
          </h2>
          <a
            href="/devis"
            className="mt-10 inline-flex min-h-[52px] items-center gap-2 rounded-full bg-[color:var(--color-si-lime)] px-9 text-[14.5px] font-bold text-[color:var(--color-home-ink)] transition-transform hover:-translate-y-0.5"
          >
            Commencer mon devis <ArrowRightIcon className="h-4 w-4" aria-hidden />
          </a>
          <p className="mt-5 text-[12.5px] text-[color:var(--color-si-creme)]/55">
            2 minutes — réponse sous 2 h ouvrées
          </p>
        </div>
      </section>
    </div>
  );
}
