"use client";

import dynamic from "next/dynamic";

export type PointDepartement = { slug: string; nom: string; lat: number; lng: number };

const CarteFranceInterne = dynamic(() => import("./CarteFranceInterne"), {
  ssr: false,
  loading: () => (
    <div
      className="animate-pulse rounded-[6px] border border-[color:var(--fc-gris-clair)] bg-white"
      style={{ height: 480 }}
      aria-hidden
    />
  ),
});

/** Carte France entière (départements couverts) — Leaflet chargé côté client uniquement. */
export function CarteFrance({ points, hauteur = 480 }: { points: PointDepartement[]; hauteur?: number }) {
  return <CarteFranceInterne points={points} hauteur={hauteur} />;
}
