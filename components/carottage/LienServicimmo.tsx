import Link from "next/link";
import { ArrowUpRightIcon } from "lucide-react";

import { servicimmoUrl } from "@/lib/clients/francecarottage/urls";

/**
 * Bouton pill vers le site de la marque sœur Servicimmo (diagnostic immobilier).
 * Hover : glissement du libellé + flèche, 250 ms — cohérent avec les hovers FC.
 * La pastille lime est un simple rappel de la marque sœur (valeur littérale de
 * secours #e6e900), pas un token de layout FC.
 */
export function LienServicimmo() {
  return (
    <Link
      href={servicimmoUrl("/")}
      aria-label="Découvrir Servicimmo, notre société sœur de diagnostic immobilier (même onglet)"
      className="group inline-flex items-center gap-2 overflow-hidden rounded-full border border-white/15 bg-white/5 px-4 py-2 font-[family-name:var(--font-sora)] text-[12.5px] font-semibold text-white/80 transition-colors duration-[250ms] hover:border-white/30 hover:text-white"
    >
      <span aria-hidden className="h-2 w-2 shrink-0 rounded-full bg-[color:var(--color-si-lime,#e6e900)]" />
      <span className="inline-flex items-center gap-1.5">
        <span className="hidden text-white/50 sm:inline">Société sœur</span>
        <span className="font-bold">Servicimmo</span>
      </span>
      <ArrowUpRightIcon
        className="h-3.5 w-3.5 shrink-0 -translate-x-1 opacity-0 transition-all duration-[250ms] group-hover:translate-x-0 group-hover:opacity-100"
        aria-hidden
      />
    </Link>
  );
}
