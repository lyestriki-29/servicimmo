"use client";

import Link from "next/link";
import { CircleMarker, MapContainer, Popup, TileLayer } from "react-leaflet";

import "leaflet/dist/leaflet.css";

import type { PointDepartement } from "./CarteFrance";

const CENTRE_FRANCE: [number, number] = [46.6, 2.4];
// Valeur littérale du token --fc-rouge (Leaflet ne lit pas les variables CSS dans pathOptions).
const ROUGE = "#b32024";

export default function CarteFranceInterne({
  points,
  hauteur,
}: {
  points: PointDepartement[];
  hauteur: number;
}) {
  return (
    <MapContainer
      center={CENTRE_FRANCE}
      zoom={5}
      scrollWheelZoom={false}
      style={{ height: hauteur }}
      className="z-0 rounded-[6px] border border-[color:var(--fc-gris-clair)]"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {points.map((p) => (
        <CircleMarker
          key={p.slug}
          center={[p.lat, p.lng]}
          radius={7}
          pathOptions={{ color: ROUGE, fillColor: ROUGE, fillOpacity: 0.85, weight: 2 }}
        >
          <Popup>
            <Link href={`/zones/${p.slug}`}>Carottage dans le {p.nom}</Link>
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}
