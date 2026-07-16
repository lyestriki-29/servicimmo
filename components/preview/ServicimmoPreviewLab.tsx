"use client";

import { useState } from "react";
import { CheckIcon, Layers3Icon } from "lucide-react";

import { ServicimmoPreviewSurface } from "./ServicimmoPreviewSurface";
import { PREVIEW_PAGES, PREVIEW_VARIANTS, type PreviewVariant } from "./servicimmo-preview-data";

export function ServicimmoPreviewLab() {
  const [pageId, setPageId] = useState(PREVIEW_PAGES[0]?.id ?? "services");
  const [variant, setVariant] = useState<PreviewVariant>("selection");
  const page = PREVIEW_PAGES.find((item) => item.id === pageId) ?? PREVIEW_PAGES[0];

  if (!page) return null;

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#e9edef] pb-20">
      <style>{"html, body { overflow-x: clip; }"}</style>
      <header className="border-b border-[color:var(--color-home-line)] bg-white px-6 py-8 md:px-8">
        <div className="mx-auto max-w-[1440px]">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="flex items-center gap-2 font-[family-name:var(--font-sora)] text-[12px] font-bold text-[color:var(--color-si-petrole)]">
                <Layers3Icon className="h-4 w-4" aria-hidden />
                Laboratoire visuel · non publié
              </p>
              <h1 className="mt-3 font-[family-name:var(--font-sora)] text-[clamp(28px,4vw,48px)] leading-tight font-extrabold tracking-[-0.03em] text-balance text-[color:var(--color-home-ink)]">
                Une direction finale, construite page par page
              </h1>
              <p className="mt-3 max-w-[760px] text-[15px] leading-relaxed text-[color:var(--color-home-muted-2)]">
                Parcours la sélection finale sur les huit gabarits. Les anciennes directions restent
                accessibles pour comparer chaque décision.
              </p>
            </div>
            <div className="rounded-[10px] bg-[color:var(--color-home-saf-bg)] px-4 py-3 text-[12px] font-semibold text-[color:var(--color-home-saf-dark)]">
              8 gabarits · sélection consolidée
            </div>
          </div>
        </div>
      </header>

      <div className="relative z-40 border-b border-[color:var(--color-home-line)] bg-white px-6 py-4 md:px-8">
        <div className="mx-auto grid max-w-[1440px] gap-4">
          <div className="min-w-0">
            <p className="mb-2 text-[10px] font-bold tracking-[.08em] text-[color:var(--color-home-muted)] uppercase">
              Gabarit
            </p>
            <div className="flex max-w-full gap-2 overflow-x-auto pb-1">
              {PREVIEW_PAGES.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setPageId(item.id)}
                  aria-pressed={pageId === item.id}
                  className={`shrink-0 rounded-full px-4 py-2 text-[12.5px] font-semibold transition-colors ${
                    pageId === item.id
                      ? "bg-[color:var(--color-home-ink)] text-white"
                      : "bg-[color:var(--color-home-bg-2)] text-[color:var(--color-home-muted-2)] hover:text-[color:var(--color-home-ink)]"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="min-w-0">
            <p className="mb-2 text-[10px] font-bold tracking-[.08em] text-[color:var(--color-home-muted)] uppercase">
              Direction
            </p>
            <div className="flex max-w-full gap-2 overflow-x-auto pb-1">
              {PREVIEW_VARIANTS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setVariant(item.id)}
                  aria-pressed={variant === item.id}
                  className={`shrink-0 rounded-[9px] border px-4 py-2 text-left transition-colors ${
                    variant === item.id
                      ? "border-[color:var(--color-home-saf-dark)] bg-[color:var(--color-home-saf-bg)] text-[color:var(--color-home-ink)]"
                      : "border-[color:var(--color-home-line)] bg-white text-[color:var(--color-home-muted-2)]"
                  }`}
                >
                  <span className="flex items-center gap-2 text-[12px] font-bold">
                    {variant === item.id && (
                      <CheckIcon
                        className="h-3.5 w-3.5 text-[color:var(--color-home-saf-dark)]"
                        aria-hidden
                      />
                    )}
                    {item.label}
                  </span>
                  <span className="mt-0.5 block text-[10.5px] opacity-70">{item.description}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-[1440px] px-4 pt-8 sm:px-6 md:px-8 md:pt-12">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 px-1">
          <div>
            <p className="font-[family-name:var(--font-sora)] text-[17px] font-bold text-[color:var(--color-home-ink)]">
              {page.label}
            </p>
            <p className="mt-0.5 text-[12px] text-[color:var(--color-home-muted-2)]">
              Aperçu desktop responsive · contenu représentatif
            </p>
          </div>
          <p className="rounded-full bg-white px-3 py-1.5 text-[11px] font-semibold text-[color:var(--color-home-muted-2)]">
            {PREVIEW_VARIANTS.find((item) => item.id === variant)?.label}
          </p>
        </div>
        <ServicimmoPreviewSurface page={page} variant={variant} />
      </main>
    </div>
  );
}
