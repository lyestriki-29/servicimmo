import Link from "next/link";
import { ArrowUpRightIcon } from "lucide-react";

const CAROTTAGE_URL = process.env.NEXT_PUBLIC_CAROTTAGE_URL ?? "https://www.france-carottage.fr";

/**
 * Bouton pill vers la marque sœur France Carottage (carottage / amiante enrobés).
 * Posé dans le bandeau utilitaire pétrole du header Servicimmo. Hover : glissement
 * du libellé + flèche (250 ms), même onglet, aria-label explicite. Miroir de
 * `components/carottage/LienServicimmo.tsx` (sens inverse).
 */
export function LienMarqueSoeur() {
  return (
    <Link
      href={CAROTTAGE_URL}
      aria-label="Découvrir France Carottage, notre société sœur (carottage et amiante sur enrobés)"
      className="group inline-flex items-center gap-2 rounded-full border border-white/20 px-3 py-1 font-[family-name:var(--font-sora)] text-[12px] font-semibold text-[#bfe0e2] transition-colors duration-[250ms] hover:border-white/50 hover:text-white"
    >
      <span aria-hidden className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#b32024]" />
      <span className="hidden sm:inline">France Carottage</span>
      <ArrowUpRightIcon
        className="h-3.5 w-3.5 shrink-0 -translate-x-1 opacity-0 transition-all duration-[250ms] group-hover:translate-x-0 group-hover:opacity-100"
        aria-hidden
      />
    </Link>
  );
}
