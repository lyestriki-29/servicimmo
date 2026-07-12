"use client";

import { useQuoteModal } from "@/components/questionnaire/QuoteModalProvider";

type CtaDevisProps = { titre?: string; sousTitre?: string };

/** Bloc CTA pétrole — unique tunnel de conversion, présent sur chaque page intérieure. */
export function CtaDevis({
  titre = "Quels diagnostics pour votre bien ?",
  sousTitre = "Réponse en 2 minutes — devis gratuit, sans engagement, sous 2 h ouvrées.",
}: CtaDevisProps) {
  const { open } = useQuoteModal();
  return (
    <section className="mx-auto max-w-[var(--container,1280px)] px-6 py-14 md:px-8">
      <div className="rounded-[14px] bg-[color:var(--color-si-petrole)] px-8 py-10 text-center">
        <h2 className="font-[family-name:var(--font-sora)] text-[24px] font-bold text-white sm:text-[27px]">
          {titre}
        </h2>
        <p className="mt-2 text-[15px] text-[#bfe0e2]">{sousTitre}</p>
        <button
          type="button"
          onClick={open}
          className="mt-6 inline-flex items-center rounded-[6px] bg-[color:var(--color-home-saf)] px-[26px] py-[14px] font-[family-name:var(--font-sora)] text-[15px] font-semibold text-[color:var(--color-home-ink)] transition-opacity hover:opacity-90"
        >
          Demander un devis
        </button>
      </div>
    </section>
  );
}
