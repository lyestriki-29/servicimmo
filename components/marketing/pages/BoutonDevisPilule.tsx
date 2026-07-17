"use client";

import { ArrowRightIcon } from "lucide-react";

import { useQuoteModal } from "@/components/questionnaire/QuoteModalProvider";

/**
 * CTA pilule lime du hero des fiches services.
 * C'est un BOUTON, pas un lien : le devis est une modale (`useQuoteModal`), il
 * n'existe aucune route `/devis`. La maquette du labo pointait vers `/devis` —
 * la copier telle quelle aurait ajouté un lien mort de plus.
 */
export function BoutonDevisPilule({ libelle = "Obtenir mon prix" }: { libelle?: string }) {
  const { open } = useQuoteModal();
  return (
    <button
      type="button"
      onClick={() => open()}
      className="inline-flex min-h-12 items-center gap-2 rounded-full bg-[color:var(--color-si-lime)] px-6 font-[family-name:var(--font-sora)] text-[13.5px] font-bold text-[color:var(--color-home-ink)] transition-transform hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--color-si-petrole)]"
    >
      {libelle}
      <ArrowRightIcon className="h-4 w-4" aria-hidden />
    </button>
  );
}
