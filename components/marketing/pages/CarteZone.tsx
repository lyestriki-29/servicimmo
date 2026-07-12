"use client";

import dynamic from "next/dynamic";

export type PointVille = { slug: string; ville: string; lat: number; lng: number };

const CarteZoneInterne = dynamic(() => import("./CarteZoneInterne"), {
  ssr: false,
  loading: () => (
    <div className="h-[420px] animate-pulse rounded-[14px] bg-[color:var(--color-home-line)]" aria-hidden />
  ),
});

/** Carte de la zone d'intervention (37 + limitrophes) — Leaflet chargé côté client uniquement. */
export function CarteZone({ villes, hauteur = 420 }: { villes: PointVille[]; hauteur?: number }) {
  return <CarteZoneInterne villes={villes} hauteur={hauteur} />;
}
