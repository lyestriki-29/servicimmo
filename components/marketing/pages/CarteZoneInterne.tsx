"use client";

import Link from "next/link";
import { CircleMarker, MapContainer, Popup, TileLayer } from "react-leaflet";

import "leaflet/dist/leaflet.css";

import type { PointVille } from "./CarteZone";

const CENTRE_37: [number, number] = [47.3, 0.68];

export default function CarteZoneInterne({
  villes,
  hauteur,
}: {
  villes: PointVille[];
  hauteur: number;
}) {
  return (
    <MapContainer
      center={CENTRE_37}
      zoom={9}
      scrollWheelZoom={false}
      style={{ height: hauteur }}
      className="z-0 rounded-[14px]"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {villes.map((v) => (
        <CircleMarker
          key={v.slug}
          center={[v.lat, v.lng]}
          radius={7}
          pathOptions={{ color: "#00585f", fillColor: "#00585f", fillOpacity: 0.85 }}
        >
          <Popup>
            <Link href={`/zones/${v.slug}`}>Diagnostic immobilier à {v.ville}</Link>
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}
