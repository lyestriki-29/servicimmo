"use client";

import { useQuoteModal } from "@/components/questionnaire/QuoteModalProvider";

type CtaDevisProps = { titre?: string; sousTitre?: string; libelleBouton?: string; ton?: "petrole" | "anis" };

/** Bloc CTA pétrole — unique tunnel de conversion, présent sur chaque page intérieure. */
export function CtaDevis({
  titre = "Quels diagnostics pour votre bien ?",
  sousTitre = "Réponse en 2 minutes — devis gratuit, sans engagement, sous 2 h ouvrées.",
  libelleBouton = "Demander un devis",
  ton = "petrole",
}: CtaDevisProps) {
  const { open } = useQuoteModal();
  const isAnis = ton === "anis";
  return (
    <section className="mx-auto max-w-[var(--container,1280px)] px-6 py-14 md:px-8">
      <div className={`flex flex-wrap items-center justify-between gap-6 rounded-[14px] px-7 py-7 ${isAnis ? "bg-[color:var(--color-home-saf)] text-[color:var(--color-home-ink)]" : "bg-[color:var(--color-si-petrole)] text-white"}`}>
        <div>
        <h2 className="font-[family-name:var(--font-sora)] text-[20px] font-bold">
          {titre}
        </h2>
        <p className="mt-1 text-[13.5px] opacity-78">{sousTitre}</p>
        </div>
        <button
          type="button"
          onClick={open}
          className={`inline-flex min-h-12 items-center rounded-[9px] px-5 font-[family-name:var(--font-sora)] text-[13px] font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 ${isAnis ? "bg-[color:var(--color-home-ink)] text-white focus-visible:outline-[color:var(--color-si-petrole)]" : "bg-[color:var(--color-home-saf)] text-[color:var(--color-home-ink)] hover:bg-[color:var(--color-home-saf-soft)] focus-visible:outline-white"}`}
        >
          {libelleBouton}
        </button>
      </div>
    </section>
  );
}
