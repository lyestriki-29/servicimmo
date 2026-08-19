"use client";

import { useEffect } from "react";
import { CircleMarker, MapContainer, TileLayer, Tooltip, useMap } from "react-leaflet";

import "leaflet/dist/leaflet.css";

import type { ZoneAtlas } from "./AtlasZones";

const CENTRE_FRANCE: [number, number] = [46.6, 2.4];
// Valeurs littérales des tokens (Leaflet ne lit pas les variables CSS dans pathOptions).
const ROUGE = "#b32024";
const ENCRE = "#111113";

/** Recentre la carte sur la zone sélectionnée depuis la liste. */
function SuivreSelection({ zone }: { zone: ZoneAtlas | null }) {
  const carte = useMap();
  useEffect(() => {
    if (zone) carte.flyTo([zone.lat, zone.lng], 8, { duration: 0.7 });
  }, [carte, zone]);
  return null;
}

/**
 * Recalcule la vue quand le conteneur prend sa taille définitive. Sans ça,
 * Leaflet calcule son centre sur une hauteur encore nulle (flex/grid non résolus,
 * panneau masqué en mobile) et affiche une zone du globe sans rapport.
 */
function AjusterTaille() {
  const carte = useMap();
  useEffect(() => {
    const conteneur = carte.getContainer();
    const recalculer = () => {
      carte.invalidateSize();
      carte.setView(CENTRE_FRANCE, carte.getZoom());
    };
    recalculer();
    const observateur = new ResizeObserver(() => carte.invalidateSize());
    observateur.observe(conteneur);
    return () => observateur.disconnect();
  }, [carte]);
  return null;
}

export default function CarteAtlasInterne({
  zones,
  slugActif,
  onSurvol,
  onChoix,
}: {
  zones: ZoneAtlas[];
  slugActif: string | null;
  onSurvol: (slug: string | null) => void;
  onChoix: (slug: string) => void;
}) {
  const active = zones.find((z) => z.slug === slugActif) ?? null;

  return (
    <MapContainer
      center={CENTRE_FRANCE}
      zoom={6}
      scrollWheelZoom
      style={{ height: "100%", width: "100%" }}
      className="z-0 h-full w-full [&_.leaflet-tile-pane]:brightness-[1.06] [&_.leaflet-tile-pane]:contrast-[0.9] [&_.leaflet-tile-pane]:grayscale"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <AjusterTaille />
      <SuivreSelection zone={active} />
      {zones.map((z) => {
        const actif = z.slug === slugActif;
        return (
          <CircleMarker
            key={z.slug}
            center={[z.lat, z.lng]}
            radius={actif ? 11 : 6}
            pathOptions={{
              color: actif ? ENCRE : ROUGE,
              fillColor: ROUGE,
              fillOpacity: actif ? 1 : 0.8,
              weight: actif ? 3 : 1.5,
            }}
            eventHandlers={{
              mouseover: () => onSurvol(z.slug),
              mouseout: () => onSurvol(null),
              click: () => onChoix(z.slug),
            }}
          >
            <Tooltip direction="top" offset={[0, -8]}>
              <span className="font-[family-name:var(--font-sora)] text-[12px] font-bold">{z.nom}</span>
            </Tooltip>
          </CircleMarker>
        );
      })}
    </MapContainer>
  );
}
