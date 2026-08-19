"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { CircleMarker, MapContainer, TileLayer, Tooltip, useMap } from "react-leaflet";

import "leaflet/dist/leaflet.css";

import type { ZoneAtlas } from "./AtlasZones";

const CENTRE_FRANCE: [number, number] = [46.6, 2.4];
// Valeurs littérales des tokens (Leaflet ne lit pas les variables CSS dans pathOptions).
const ROUGE = "#b32024";
const ENCRE = "#111113";

const STYLE_ACTIF = { color: ENCRE, fillColor: ROUGE, fillOpacity: 1, weight: 3 };
const STYLE_INACTIF = { color: ROUGE, fillColor: ROUGE, fillOpacity: 0.8, weight: 1.5 };

/**
 * Recalcule la vue quand le conteneur prend sa taille définitive. Sans ça,
 * Leaflet calcule son centre sur une hauteur encore nulle (flex/grid non résolus,
 * panneau masqué en mobile) et affiche une zone du globe sans rapport.
 */
function AjusterTaille() {
  const carte = useMap();
  useEffect(() => {
    const conteneur = carte.getContainer();
    carte.invalidateSize();
    carte.setView(CENTRE_FRANCE, carte.getZoom());
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
}: {
  zones: ZoneAtlas[];
  slugActif: string | null;
  onSurvol: (slug: string | null) => void;
}) {
  const router = useRouter();

  return (
    <MapContainer
      center={CENTRE_FRANCE}
      zoom={6}
      // Molette désactivée : la carte occupe toute la hauteur de l'écran, elle
      // capterait le défilement de la page et le footer deviendrait inatteignable.
      scrollWheelZoom={false}
      style={{ height: "100%", width: "100%" }}
      className="z-0 h-full w-full [&_.leaflet-tile-pane]:brightness-[1.06] [&_.leaflet-tile-pane]:contrast-[0.9] [&_.leaflet-tile-pane]:grayscale"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <AjusterTaille />
      {zones.map((z) => (
        <CircleMarker
          key={z.slug}
          center={[z.lat, z.lng]}
          radius={z.slug === slugActif ? 11 : 6}
          pathOptions={z.slug === slugActif ? STYLE_ACTIF : STYLE_INACTIF}
          // Le survol ne fait que surligner : déplacer la carte sous le curseur
          // ferait fuir le marqueur et enchaînerait les animations.
          eventHandlers={{
            mouseover: () => onSurvol(z.slug),
            mouseout: () => onSurvol(null),
            click: () => router.push(`/zones/${z.slug}`),
          }}
        >
          <Tooltip direction="top" offset={[0, -8]}>
            <span className="font-[family-name:var(--font-sora)] text-[12px] font-bold">{z.nom}</span>
          </Tooltip>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}
