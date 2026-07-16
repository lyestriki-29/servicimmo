import Image from "next/image";
import {
  ArrowRightIcon,
  BadgeCheckIcon,
  BookOpenTextIcon,
  Clock3Icon,
  CrosshairIcon,
} from "lucide-react";

import { PREVIEW_PAGES } from "@/components/preview/servicimmo-preview-data";

import { BandeCta, CoinsViseur, KickerMono } from "./primitives";

const page = PREVIEW_PAGES.find((item) => item.id === "article");

export function GabaritArticle() {
  if (!page) return null;

  return (
    <div className="bg-white">
      {/* Tête d'article : cartouche éditorial dense */}
      <section className="bg-[color:var(--color-si-creme)]">
        <div className="mx-auto max-w-[1000px] px-6 pt-12 pb-20 md:px-8 lg:pt-16 lg:pb-28">
          <div className="flex flex-wrap items-center justify-between gap-3 border-y-2 border-[color:var(--color-home-ink)] py-3">
            <KickerMono>{page.kicker}</KickerMono>
            <p className="flex items-center gap-2 font-mono text-[10.5px] font-bold tracking-[.14em] text-[color:var(--color-home-muted)] uppercase">
              <Clock3Icon className="h-3.5 w-3.5" aria-hidden /> {page.stat} {page.statLabel}
            </p>
          </div>
          <p className="mt-9 inline-flex bg-[color:var(--color-home-ink)] px-4 py-2 font-mono text-[10px] font-extrabold tracking-[.16em] text-white uppercase">
            Note d’expertise · Réglementation
          </p>
          <h1 className="mt-5 max-w-[840px] font-[family-name:var(--font-sora)] text-[clamp(36px,5vw,66px)] leading-[.99] font-extrabold tracking-[-0.04em] text-balance text-[color:var(--color-home-ink)]">
            {page.title} <span className="text-[color:var(--color-si-petrole)]">{page.accent}</span>
          </h1>
          <div className="mt-8 flex flex-wrap items-end justify-between gap-6 border-t border-[color:var(--color-home-ink)]/15 pt-6">
            <p className="max-w-[58ch] text-[17px] leading-[1.75] font-medium text-[color:var(--color-home-slate)]">
              {page.description}
            </p>
            <p className="inline-flex items-center gap-2 text-[12.5px] font-semibold whitespace-nowrap text-[color:var(--color-home-saf-dark)]">
              <BadgeCheckIcon className="h-4 w-4" aria-hidden /> Vérifié par l’équipe Servicimmo
            </p>
          </div>
        </div>
      </section>

      {/* Chevauchement : la photo mord sur le cartouche */}
      <section className="relative z-10 mx-auto -mt-12 max-w-[1000px] px-6 md:px-8 lg:-mt-16">
        <figure className="relative h-[280px] overflow-hidden rounded-[16px] shadow-[0_18px_44px_rgba(15,30,58,.16)] lg:h-[340px]">
          <Image
            src="/img/si/blog2.jpg"
            alt="Signature d’un compromis de vente — le dossier de diagnostics fait foi"
            fill
            sizes="(min-width:1024px) 1000px, 100vw"
            className="object-cover"
          />
          <div aria-hidden className="absolute inset-0 bg-[color:var(--color-home-ink)]/20" />
          <figcaption className="absolute right-4 bottom-4 rounded-full bg-[color:var(--color-home-ink)]/80 px-4 py-2 font-mono text-[9.5px] font-bold tracking-[.14em] text-white/75 uppercase">
            Le dossier de diagnostics engage la transaction
          </figcaption>
        </figure>
      </section>

      {/* Corps : sommaire collant + relevé + lecture */}
      <section className="mx-auto max-w-[1000px] px-6 py-14 md:px-8 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_260px]">
          <div>
            <div className="relative bg-[color:var(--color-home-ink)] p-7 sm:p-8">
              <CoinsViseur />
              <KickerMono clair>À retenir — le relevé de l’article</KickerMono>
              <div className="mt-4 divide-y divide-white/12">
                {page.items.map((item, index) => (
                  <div key={item.title} className="flex gap-4 py-4">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/25">
                      <CrosshairIcon
                        className="h-3.5 w-3.5 text-[color:var(--color-si-lime)]"
                        aria-hidden
                      />
                    </span>
                    <div>
                      <p className="font-mono text-[10px] font-bold tracking-[.15em] text-white/55 uppercase">
                        {String(index + 1).padStart(2, "0")}
                      </p>
                      <h2 className="mt-1 font-[family-name:var(--font-sora)] text-[16px] font-bold text-white">
                        {item.title}
                      </h2>
                      <p className="mt-1 text-[13px] leading-relaxed text-white/62">{item.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="article-prose mt-10 [&_p]:max-w-[68ch]">
              <p>
                [Corps de l’article — le contenu réel de <code>content/articles/</code> se rend ici
                avec ses intertitres ancrés.]
              </p>
            </div>

            {/* Citation tirée : la respiration éditoriale */}
            <blockquote className="my-10 border-y border-[color:var(--color-home-line)] py-8 text-center">
              <p className="mx-auto max-w-[36ch] font-[family-name:var(--font-sora)] text-[clamp(19px,2.4vw,26px)] leading-[1.35] font-bold text-balance text-[color:var(--color-home-ink)]">
                « Un rapport à jour, c’est une négociation qui ne
                <span className="text-[color:var(--color-si-petrole)]"> déraille pas</span>. »
              </p>
              <footer className="mt-4 font-mono text-[10px] font-bold tracking-[.16em] text-[color:var(--color-home-muted)] uppercase">
                L’équipe Servicimmo
              </footer>
            </blockquote>

            <div className="article-prose [&_p]:max-w-[68ch]">
              <p>[Suite de la lecture — sections ancrées depuis le sommaire.]</p>
            </div>

            <footer className="mt-12 grid gap-5 border-y border-[color:var(--color-home-line)] py-7 sm:grid-cols-[1fr_auto] sm:items-center">
              <div className="flex gap-3">
                <BadgeCheckIcon
                  className="mt-0.5 h-5 w-5 shrink-0 text-[color:var(--color-home-saf-dark)]"
                  aria-hidden
                />
                <div>
                  <p className="font-[family-name:var(--font-sora)] text-[14px] font-bold text-[color:var(--color-home-ink)]">
                    Contenu relu par Servicimmo
                  </p>
                  <p className="mt-1 text-[12.5px] leading-relaxed text-[color:var(--color-home-muted-2)]">
                    Diagnostiqueurs certifiés LCC Qualixpert & iCert, en Indre-et-Loire.
                  </p>
                </div>
              </div>
              <p className="font-mono text-[10px] tracking-[.14em] text-[color:var(--color-home-muted)] uppercase sm:text-right">
                Sources : ADEME · Service-Public.fr
              </p>
            </footer>
          </div>

          {/* Sommaire collant en viseur */}
          <aside className="h-fit lg:sticky lg:top-[122px]">
            <div className="relative border-y border-[color:var(--color-home-line)] py-6">
              <p className="inline-flex items-center gap-2 font-[family-name:var(--font-sora)] text-[14px] font-extrabold text-[color:var(--color-home-ink)]">
                <BookOpenTextIcon
                  className="h-4 w-4 text-[color:var(--color-si-petrole)]"
                  aria-hidden
                />
                Dans cet article
              </p>
              <ol className="mt-5 space-y-4">
                {page.items.map((item, index) => (
                  <li key={item.title}>
                    <a
                      href="#"
                      className="group flex gap-3 text-[13px] leading-snug text-[color:var(--color-home-muted-2)] transition-colors hover:text-[color:var(--color-si-petrole)]"
                    >
                      <span className="font-mono font-bold text-[color:var(--color-home-saf-dark)]">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      {item.title}
                    </a>
                  </li>
                ))}
              </ol>
            </div>
            <a
              href="#"
              className="group mt-6 flex items-center justify-between gap-3 rounded-[12px] bg-[color:var(--color-si-creme)] p-5"
            >
              <span>
                <span className="block font-mono text-[9.5px] font-bold tracking-[.14em] text-[color:var(--color-home-saf-dark)] uppercase">
                  À lire ensuite
                </span>
                <span className="mt-1.5 block font-[family-name:var(--font-sora)] text-[13.5px] leading-snug font-bold text-[color:var(--color-home-ink)]">
                  Amiante avant travaux : les bons réflexes
                </span>
              </span>
              <ArrowRightIcon
                className="h-4 w-4 shrink-0 text-[color:var(--color-si-petrole)] transition-transform group-hover:translate-x-1"
                aria-hidden
              />
            </a>
          </aside>
        </div>
      </section>

      <BandeCta
        titre="Concerné par cette évolution ?"
        sousTitre="Décrivez votre bien : le questionnaire traduit la règle en obligations concrètes."
        libelle="Vérifier mon cas"
      />
    </div>
  );
}
