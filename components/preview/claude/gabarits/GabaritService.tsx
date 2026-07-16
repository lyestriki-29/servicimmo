import Image from "next/image";
import { ArrowRightIcon, BadgeCheckIcon, CheckCircle2Icon, FileCheck2Icon } from "lucide-react";

import { PREVIEW_PAGES } from "@/components/preview/servicimmo-preview-data";

import { BandeConfiance, BandeCta, CoinsViseur, KickerMono } from "./primitives";

const page = PREVIEW_PAGES.find((item) => item.id === "service");

const DEROULE = [
  {
    temps: "J0",
    etape: "Prise de rendez-vous",
    detail: "Créneau confirmé sous 48 h, souvent moins.",
  },
  {
    temps: "J1",
    etape: "Visite du bien",
    detail: "45 min à 2 h selon la surface. Accès complet nécessaire.",
  },
  {
    temps: "J1",
    etape: "Mesures et relevés",
    detail: "Isolation, chauffage, ventilation, consommations.",
  },
  {
    temps: "J2",
    etape: "Rapport expliqué",
    detail: "Envoyé au format PDF, commenté par le technicien.",
  },
] as const;

const FAQ = [
  {
    question: "Quels documents préparer ?",
    reponse:
      "Les anciens diagnostics, les factures de travaux d’isolation ou de chauffage et les références des équipements aident le technicien à établir un rapport plus précis.",
  },
  {
    question: "Le rapport peut-il changer mon prix de vente ?",
    reponse:
      "La classe énergétique pèse sur la négociation et sur les obligations du bailleur. Mieux vaut la connaître tôt — et documentée correctement.",
  },
] as const;

export function GabaritService() {
  if (!page) return null;

  const fiche = [
    { label: "Projet", valeur: "Vente · Location" },
    { label: "Validité", valeur: page.stat },
    { label: "Secteur", valeur: "Indre-et-Loire" },
  ] as const;

  return (
    <div className="bg-white">
      {/* Hero — forme atlas de Codex validée : fiche pratique / titre / photo */}
      <section className="bg-white">
        <div className="mx-auto grid max-w-[var(--container,1280px)] gap-8 px-6 pt-12 pb-16 md:px-8 lg:grid-cols-[230px_minmax(0,1fr)_300px] lg:pt-16 lg:pb-20">
          <aside className="order-2 border-t border-[color:var(--color-home-line)] pt-6 lg:order-1 lg:border-t-0 lg:border-r lg:pt-0 lg:pr-8">
            <p className="inline-flex items-center gap-2 font-mono text-[10.5px] font-bold tracking-[.16em] text-[color:var(--color-si-petrole)] uppercase">
              Fiche pratique
            </p>
            <div className="mt-8 space-y-7">
              {fiche.map((fait) => (
                <div key={fait.label}>
                  <p className="text-[11px] font-bold text-[color:var(--color-home-saf-dark)]">
                    {fait.label}
                  </p>
                  <p className="mt-2 font-[family-name:var(--font-sora)] text-[14.5px] leading-snug font-bold text-[color:var(--color-home-ink)]">
                    {fait.valeur}
                  </p>
                </div>
              ))}
            </div>
          </aside>
          <div className="order-1 lg:order-2">
            <KickerMono>{page.kicker}</KickerMono>
            <h1 className="mt-4 font-[family-name:var(--font-sora)] text-[clamp(38px,5vw,66px)] leading-[1.01] font-extrabold tracking-[-0.035em] text-balance text-[color:var(--color-home-ink)]">
              {page.title}{" "}
              <span className="text-[color:var(--color-home-saf-dark)]">{page.accent}</span>
            </h1>
            <p className="mt-6 max-w-[60ch] text-[17px] leading-[1.7] text-[color:var(--color-home-muted-2)]">
              {page.description}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <span className="inline-flex items-center gap-2 rounded-full bg-[color:var(--color-home-saf-bg)] px-4 py-2 text-[12px] font-bold text-[color:var(--color-home-saf-dark)]">
                <CheckCircle2Icon className="h-4 w-4" aria-hidden /> Obligatoire
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-[color:var(--color-home-bg-2)] px-4 py-2 text-[12px] font-bold text-[color:var(--color-si-petrole)]">
                <FileCheck2Icon className="h-4 w-4" aria-hidden /> Rapport expliqué
              </span>
            </div>
            <div className="mt-9 flex flex-wrap items-center gap-5">
              <a
                href="/devis"
                className="inline-flex min-h-12 items-center gap-2 rounded-full bg-[color:var(--color-si-lime)] px-6 text-[13.5px] font-bold text-[color:var(--color-home-ink)] transition-transform hover:-translate-y-0.5"
              >
                Obtenir mon prix <ArrowRightIcon className="h-4 w-4" aria-hidden />
              </a>
              <p className="text-[12.5px] font-semibold text-[color:var(--color-home-muted-2)]">
                Estimation immédiate · devis sous 2 h ouvrées
              </p>
            </div>
          </div>
          <div className="relative order-3 min-h-[300px] overflow-hidden rounded-[16px] lg:min-h-[440px]">
            <Image
              src="/img/si/proj3.jpg"
              alt="Intérieur de logement évalué lors d’un diagnostic de performance énergétique"
              fill
              sizes="(min-width:1024px) 300px, 100vw"
              className="object-cover"
              priority
            />
            <span className="absolute top-5 right-5 rounded-full bg-white px-4 py-2 text-[11px] font-bold text-[color:var(--color-si-petrole)]">
              Tours · 37
            </span>
          </div>
        </div>
      </section>

      {/* Le déroulé de l'intervention : le film complet en carte */}
      <section className="mx-auto max-w-[var(--container,1280px)] px-6 md:px-8">
        <div className="overflow-hidden rounded-[16px] border border-[color:var(--color-home-line)] bg-white shadow-[0_18px_44px_rgba(15,30,58,.14)]">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[color:var(--color-home-line)] px-6 py-4 md:px-8">
            <KickerMono>Le déroulé de l’intervention</KickerMono>
            <KickerMono>48 h chrono, en moyenne</KickerMono>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4">
            {DEROULE.map((temps, index) => (
              <div
                key={temps.etape}
                className="relative border-b border-[color:var(--color-home-line)] p-6 last:border-b-0 sm:border-r sm:nth-[2n]:border-r-0 lg:border-b-0 lg:last:border-r-0 lg:nth-[2n]:border-r"
              >
                <div className="flex items-baseline justify-between">
                  <span className="font-mono text-[11px] font-bold tracking-[.1em] text-[color:var(--color-si-petrole)]">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="rounded-full bg-[color:var(--color-home-saf-bg)] px-2.5 py-1 font-mono text-[9.5px] font-bold text-[color:var(--color-home-saf-dark)]">
                    {temps.temps}
                  </span>
                </div>
                <h3 className="mt-5 font-[family-name:var(--font-sora)] text-[15.5px] font-bold text-[color:var(--color-home-ink)]">
                  {temps.etape}
                </h3>
                <p className="mt-2 text-[12.5px] leading-relaxed text-[color:var(--color-home-muted-2)]">
                  {temps.detail}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Ce qu'il faut savoir + aperçu tangible du rapport */}
      <section className="mx-auto max-w-[var(--container,1280px)] px-6 py-16 md:px-8 lg:py-24">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div>
            <KickerMono>Fiche pratique</KickerMono>
            <h2 className="mt-4 max-w-[560px] font-[family-name:var(--font-sora)] text-[clamp(26px,3.2vw,40px)] leading-[1.05] font-extrabold tracking-[-0.03em] text-balance text-[color:var(--color-home-ink)]">
              Ce qu’il faut savoir avant l’intervention.
            </h2>
            <div className="mt-8 divide-y divide-[color:var(--color-home-line)] border-y border-[color:var(--color-home-line)]">
              {page.items.map((item, index) => (
                <article
                  key={item.title}
                  className="grid gap-2 py-7 md:grid-cols-[60px_250px_minmax(0,1fr)] md:gap-6"
                >
                  <span className="font-mono text-[12px] font-bold text-[color:var(--color-si-petrole)]">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <h3 className="font-[family-name:var(--font-sora)] text-[16.5px] leading-snug font-bold text-[color:var(--color-home-ink)]">
                    {item.title}
                  </h3>
                  <p className="text-[14px] leading-[1.75] text-[color:var(--color-home-muted-2)]">
                    {item.text}
                  </p>
                </article>
              ))}
            </div>
            <div className="mt-10">
              <KickerMono>Questions utiles</KickerMono>
              <div className="mt-3 divide-y divide-[color:var(--color-home-line)] border-y border-[color:var(--color-home-line)]">
                {FAQ.map((entree) => (
                  <details key={entree.question} className="group py-5">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-[family-name:var(--font-sora)] text-[14.5px] font-bold text-[color:var(--color-home-ink)]">
                      {entree.question}
                      <span
                        aria-hidden
                        className="font-mono text-[16px] text-[color:var(--color-si-petrole)] transition-transform group-open:rotate-45"
                      >
                        +
                      </span>
                    </summary>
                    <p className="mt-3 max-w-[68ch] text-[13.5px] leading-[1.75] text-[color:var(--color-home-muted-2)]">
                      {entree.reponse}
                    </p>
                  </details>
                ))}
              </div>
            </div>
          </div>

          {/* L'aperçu du livrable : le rapport comme objet */}
          <aside className="h-fit lg:sticky lg:top-[122px]">
            <div className="relative bg-[color:var(--color-home-ink)] p-6 sm:p-7">
              <CoinsViseur />
              <FileCheck2Icon className="h-6 w-6 text-[color:var(--color-si-lime)]" aria-hidden />
              <h3 className="mt-4 font-[family-name:var(--font-sora)] text-[19px] font-extrabold text-white">
                Le livrable, concrètement.
              </h3>
              <div className="mt-5 border border-white/20 bg-[color:var(--color-si-creme)] p-4 shadow-[0_10px_24px_rgba(0,0,0,.3)]">
                <div className="flex items-center justify-between border-b-2 border-[color:var(--color-home-ink)] pb-2">
                  <p className="font-mono text-[8.5px] font-bold tracking-[.14em] text-[color:var(--color-home-ink)] uppercase">
                    Rapport DPE · Servicimmo
                  </p>
                  <p className="font-mono text-[8.5px] text-[color:var(--color-home-muted)]">
                    N° 2026-XXXX
                  </p>
                </div>
                {[
                  "Classe énergie et climat",
                  "Détail des consommations",
                  "Recommandations chiffrées",
                ].map((ligne) => (
                  <div
                    key={ligne}
                    className="flex items-center gap-2 border-b border-[color:var(--color-home-ink)]/12 py-2.5"
                  >
                    <BadgeCheckIcon
                      className="h-3.5 w-3.5 shrink-0 text-[color:var(--color-home-saf-dark)]"
                      aria-hidden
                    />
                    <p className="text-[11.5px] font-semibold text-[color:var(--color-home-ink)]">
                      {ligne}
                    </p>
                  </div>
                ))}
                <p className="pt-2.5 font-mono text-[8.5px] tracking-[.1em] text-[color:var(--color-home-muted)] uppercase">
                  PDF · opposable · expliqué
                </p>
              </div>
              <p className="mt-5 text-[12.5px] leading-relaxed text-white/65">
                Un document exploitable pour votre transaction — pas une liasse de jargon.
              </p>
            </div>
          </aside>
        </div>
      </section>

      <BandeConfiance />
      <BandeCta
        titre="Besoin de ce diagnostic ?"
        sousTitre="Vérifiez en 2 minutes s’il s’applique à votre bien — et combien il coûte."
      />
    </div>
  );
}
