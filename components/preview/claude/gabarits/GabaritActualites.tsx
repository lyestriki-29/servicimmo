import Image from "next/image";
import { ArrowRightIcon, BadgeCheckIcon, CalendarDaysIcon } from "lucide-react";

import { PREVIEW_PAGES } from "@/components/preview/servicimmo-preview-data";

import { BandeCta, KickerMono } from "./primitives";

const page = PREVIEW_PAGES.find((item) => item.id === "actualites");

export function GabaritActualites() {
  if (!page) return null;

  const [aLaUne, ...suivants] = page.items;
  if (!aLaUne) return null;

  return (
    <div className="bg-white">
      {/* Masthead : fond crème + barre mono (éléments Fable validés) */}
      <section className="bg-[color:var(--color-si-creme)]">
        <div className="mx-auto max-w-[var(--container,1280px)] px-6 pt-12 pb-24 md:px-8 lg:pt-16 lg:pb-32">
          <div className="flex flex-wrap items-baseline justify-between gap-3 border-y-2 border-[color:var(--color-home-ink)] py-3">
            <KickerMono>{page.kicker} · Servicimmo</KickerMono>
            <KickerMono>
              {page.stat} {page.statLabel}
            </KickerMono>
          </div>
          <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-end">
            <h1 className="max-w-[820px] font-[family-name:var(--font-sora)] text-[clamp(42px,5.8vw,84px)] leading-[.96] font-extrabold tracking-[-0.04em] text-balance text-[color:var(--color-home-ink)]">
              {page.title}{" "}
              <span className="text-[color:var(--color-si-petrole)]">{page.accent}</span>
            </h1>
            <div className="border-l-2 border-[color:var(--color-si-petrole)] pl-5">
              <p className="text-[14.5px] leading-[1.75] text-[color:var(--color-home-muted-2)]">
                {page.description}
              </p>
              <p className="mt-4 inline-flex items-center gap-2 text-[12px] font-semibold text-[color:var(--color-home-saf-dark)]">
                <BadgeCheckIcon className="h-4 w-4" aria-hidden /> Relu par des diagnostiqueurs
                certifiés
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Coupure crème → blanc : l'article à la une fait le pont (forme Codex) */}
      <section className="relative z-10 mx-auto -mt-16 max-w-[var(--container,1280px)] px-6 md:px-8 lg:-mt-20">
        <article className="grid overflow-hidden rounded-[16px] bg-[color:var(--color-home-ink)] text-white shadow-[0_18px_44px_rgba(15,30,58,.18)] lg:grid-cols-[1.2fr_.8fr]">
          <div className="relative min-h-[280px] lg:min-h-[360px]">
            <Image
              src="/img/si/blog1.jpg"
              alt="Réglage d’un thermostat — les évolutions du DPE"
              fill
              sizes="(min-width:1024px) 60vw, 100vw"
              className="object-cover"
            />
          </div>
          <div className="flex flex-col justify-between p-6 sm:p-8">
            <div>
              <p className="flex items-center gap-2 text-[12px] font-semibold text-[color:var(--color-home-saf)]">
                <CalendarDaysIcon className="h-4 w-4" aria-hidden /> {aLaUne.meta}
              </p>
              <h2 className="mt-5 font-[family-name:var(--font-sora)] text-[clamp(24px,3vw,38px)] leading-[1.12] font-bold text-balance">
                {aLaUne.title}
              </h2>
              <p className="mt-4 text-[14px] leading-relaxed text-white/74">{aLaUne.text}</p>
            </div>
            <a
              href="#liste-articles"
              className="group mt-8 inline-flex min-h-11 items-center gap-2 text-[13px] font-bold text-[color:var(--color-home-saf)]"
            >
              Lire le décryptage{" "}
              <ArrowRightIcon
                className="h-4 w-4 transition-transform group-hover:translate-x-1"
                aria-hidden
              />
            </a>
          </div>
        </article>
      </section>

      {/* Liste : lignes datées (forme Codex) */}
      <section
        id="liste-articles"
        className="mx-auto max-w-[var(--container,1280px)] scroll-mt-32 px-6 py-16 md:px-8 lg:py-20"
      >
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 className="font-[family-name:var(--font-sora)] text-[clamp(24px,2.8vw,36px)] font-extrabold tracking-[-0.025em] text-[color:var(--color-home-ink)]">
            Les derniers décryptages.
          </h2>
          <KickerMono>Classés du plus récent</KickerMono>
        </div>
        <div className="mt-8 divide-y divide-[color:var(--color-home-line)] border-y border-[color:var(--color-home-line)]">
          {suivants.map((item) => (
            <a
              key={item.title}
              href="#liste-articles"
              className="group grid gap-2 py-7 md:grid-cols-[160px_minmax(0,1fr)_auto] md:items-baseline md:gap-8"
            >
              <span className="font-mono text-[10.5px] font-bold tracking-[.08em] text-[color:var(--color-home-muted)] uppercase">
                {item.meta}
              </span>
              <span>
                <h3 className="font-[family-name:var(--font-sora)] text-[clamp(17px,2vw,22px)] leading-snug font-extrabold tracking-[-0.01em] text-[color:var(--color-home-ink)] transition-colors group-hover:text-[color:var(--color-si-petrole)]">
                  {item.title}
                </h3>
                <p className="mt-2 max-w-[64ch] text-[13.5px] leading-relaxed text-[color:var(--color-home-muted-2)]">
                  {item.text}
                </p>
              </span>
              <ArrowRightIcon
                className="hidden h-5 w-5 self-center text-[color:var(--color-si-petrole)] transition-transform group-hover:translate-x-1.5 md:block"
                aria-hidden
              />
            </a>
          ))}
        </div>
      </section>

      <BandeCta
        titre="Une échéance vous concerne ?"
        sousTitre="Vérifiez vos obligations réelles en 2 minutes, sans lire toute la réglementation."
        libelle="Vérifier mes obligations"
      />
    </div>
  );
}
