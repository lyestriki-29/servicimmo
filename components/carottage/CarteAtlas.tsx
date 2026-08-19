"use client";

import dynamic from "next/dynamic";

import type { ZoneAtlas } from "./AtlasZones";

const CarteAtlasInterne = dynamic(() => import("./CarteAtlasInterne"), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse bg-[color:var(--fc-gris-clair)]" aria-hidden />,
});

/** Carte plein cadre de l'atlas des zones — Leaflet chargé côté client uniquement. */
export function CarteAtlas(props: {
  zones: ZoneAtlas[];
  slugActif: string | null;
  onSurvol: (slug: string | null) => void;
  onChoix: (slug: string) => void;
}) {
  return <CarteAtlasInterne {...props} />;
}
