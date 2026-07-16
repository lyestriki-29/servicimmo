import { ArrowRightIcon, BadgeCheckIcon, CheckCircle2Icon, ShieldCheckIcon } from "lucide-react";

import { PREVIEW_PAGES } from "@/components/preview/servicimmo-preview-data";

import { CoinsViseur, KickerMono } from "./primitives";

const page = PREVIEW_PAGES.find((item) => item.id === "legal");

const CARTOUCHE = [
  { label: "Éditeur", valeur: "Servicimmo — Tours (37)" },
  { label: "Version", valeur: "2026.07" },
  { label: "Mise à jour", valeur: "Juillet 2026" },
  { label: "Contact", valeur: "info@servicimmo.fr" },
] as const;

export function GabaritLegal() {
  if (!page) return null;

  return (
    <div className="bg-[color:var(--color-si-creme)]">
      {/* Ouverture sombre : le document s'annonce comme une pièce contrôlée */}
      <section className="bg-[color:var(--color-home-ink)]">
        <div className="mx-auto max-w-[var(--container,1280px)] px-6 pt-12 pb-24 md:px-8 lg:pt-16 lg:pb-32">
          <div className="flex flex-wrap items-center justify-between gap-3 border-y border-white/20 py-3">
            <KickerMono clair>Document contrôlé · Servicimmo</KickerMono>
            <KickerMono clair>Version {page.stat}</KickerMono>
          </div>
          <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_400px] lg:items-end">
            <div>
              <h1 className="max-w-[760px] font-[family-name:var(--font-sora)] text-[clamp(40px,5.4vw,74px)] leading-[.97] font-extrabold tracking-[-0.04em] text-balance text-white">
                {page.title}{" "}
                <span className="text-[color:var(--color-si-lime)]">{page.accent}</span>
              </h1>
              <p className="mt-7 max-w-[58ch] text-[16px] leading-[1.75] text-white/75">
                {page.description}
              </p>
            </div>
            <div className="divide-y divide-white/15 border-y border-white/15">
              {page.items.map((section) => (
                <div key={section.title} className="flex items-center justify-between gap-5 py-3.5">
                  <span className="text-[13px] font-bold text-white/85">{section.title}</span>
                  <CheckCircle2Icon
                    className="h-4 w-4 shrink-0 text-[color:var(--color-si-lime)]"
                    aria-hidden
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Chevauchement : le cartouche technique mord sur l'ouverture */}
      <section className="relative z-10 mx-auto -mt-14 max-w-[1000px] px-6 md:px-8 lg:-mt-20">
        <div className="relative overflow-hidden rounded-[16px] border border-[color:var(--color-home-ink)]/20 bg-white shadow-[0_18px_44px_rgba(15,30,58,.14)]">
          <div className="grid grid-cols-2 divide-x divide-[color:var(--color-home-line)] lg:grid-cols-4">
            {CARTOUCHE.map((cellule) => (
              <div key={cellule.label} className="px-5 py-5 md:px-6">
                <p className="font-mono text-[9px] font-bold tracking-[.16em] text-[color:var(--color-home-muted)] uppercase">
                  {cellule.label}
                </p>
                <p className="mt-1.5 font-[family-name:var(--font-sora)] text-[13.5px] font-bold text-[color:var(--color-home-ink)]">
                  {cellule.valeur}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sommaire : chaque pièce du document, vérifiée et paginée */}
      <section className="mx-auto max-w-[1000px] px-6 py-14 md:px-8 lg:py-20">
        <div className="relative bg-white p-7 sm:p-10">
          <CoinsViseur couleur="border-[color:var(--color-si-petrole)]" />
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <h2 className="font-[family-name:var(--font-sora)] text-[clamp(20px,2.4vw,28px)] font-extrabold tracking-[-0.02em] text-[color:var(--color-home-ink)]">
              Sommaire du document.
            </h2>
            <KickerMono>4 pièces · lecture ~6 min</KickerMono>
          </div>
          <nav className="mt-6 divide-y divide-[color:var(--color-home-line)] border-y border-[color:var(--color-home-line)]">
            {page.items.map((section, index) => (
              <a key={section.title} href="#" className="group flex items-baseline gap-6 py-5">
                <span className="font-mono text-[13px] font-bold text-[color:var(--color-si-petrole)]">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-[family-name:var(--font-sora)] text-[clamp(16px,1.8vw,20px)] font-extrabold tracking-[-0.01em] text-[color:var(--color-home-ink)] transition-colors group-hover:text-[color:var(--color-si-petrole)]">
                    {section.title}
                  </span>
                  <span className="mt-1.5 block max-w-[60ch] text-[13px] leading-relaxed text-[color:var(--color-home-muted-2)]">
                    {section.text}
                  </span>
                </span>
                <span className="hidden items-center gap-3 self-center sm:flex">
                  <span className="font-mono text-[9.5px] tracking-[.12em] text-[color:var(--color-home-muted)] uppercase">
                    p. {String(index + 1).padStart(2, "0")}
                  </span>
                  <ArrowRightIcon
                    className="h-4 w-4 text-[color:var(--color-si-petrole)] transition-transform group-hover:translate-x-1.5"
                    aria-hidden
                  />
                </span>
              </a>
            ))}
          </nav>
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
            <p className="inline-flex items-center gap-2 text-[12px] font-semibold text-[color:var(--color-home-saf-dark)]">
              <BadgeCheckIcon className="h-4 w-4" aria-hidden /> Contenus complets rendus depuis les
              pages CGV et mentions légales
            </p>
            <p className="font-mono text-[9.5px] tracking-[.14em] text-[color:var(--color-home-muted)] uppercase">
              Imprimable · versionné
            </p>
          </div>
        </div>

        {/* Question sur le document */}
        <div className="mt-10 flex flex-wrap items-center justify-between gap-5 rounded-[16px] bg-[color:var(--color-home-ink)] p-7 sm:p-9">
          <div className="flex items-start gap-4">
            <ShieldCheckIcon
              className="mt-1 h-6 w-6 shrink-0 text-[color:var(--color-si-lime)]"
              aria-hidden
            />
            <div>
              <h2 className="font-[family-name:var(--font-sora)] text-[20px] font-extrabold text-white">
                Une question sur ces documents ?
              </h2>
              <p className="mt-2 max-w-[52ch] text-[13.5px] leading-relaxed text-white/70">
                Écrivez directement à l’équipe — une réponse claire, dans les délais applicables.
              </p>
            </div>
          </div>
          <a
            href="mailto:info@servicimmo.fr"
            className="inline-flex min-h-12 items-center gap-2 rounded-full bg-[color:var(--color-si-lime)] px-6 text-[13.5px] font-bold text-[color:var(--color-home-ink)] transition-transform hover:-translate-y-0.5"
          >
            Écrire à l’équipe <ArrowRightIcon className="h-4 w-4" aria-hidden />
          </a>
        </div>
      </section>
    </div>
  );
}
