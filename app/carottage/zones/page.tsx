import type { Metadata } from "next";

import { AtlasZones, type ZoneAtlas } from "@/components/carottage/AtlasZones";
import { getDepartement } from "@/lib/clients/francecarottage/departements";
import { loadDepartementsFC, loadVillesFC } from "@/lib/content/load-carottage";

export const metadata: Metadata = {
  title: "Zones d'intervention — carottage partout en France",
  description:
    "France Carottage intervient dans 58 départements et 191 villes : carottage routier et repérage amiante/HAP sur enrobés. Trouvez votre zone et demandez un devis.",
  alternates: { canonical: "/zones" },
};

/** Slugs des 8 entrées qui sont des régions (le reste des `code: "00"` = secteurs locaux). */
const SLUGS_REGIONS = new Set([
  "auvergne-rhone-alpes",
  "bretagne",
  "centre-val-de-loire",
  "hauts-de-france",
  "ile-de-france",
  "normandie",
  "nouvelle-aquitaine",
  "pays-de-la-loire",
]);

export default async function ZonesIndexPage() {
  const [departements, villes] = await Promise.all([loadDepartementsFC(), loadVillesFC()]);

  const zones: ZoneAtlas[] = departements.map((d) => {
    // Les entrées `code: "00"` (régions, secteurs locaux) n'ont pas de centroïde
    // en base : lat/lng à 0 les garde dans la liste sans les placer sur la carte.
    const centre = getDepartement(d.code);
    return {
      slug: d.slug,
      nom: d.nom,
      code: d.code,
      description: d.metaDescription,
      lat: centre?.lat ?? 0,
      lng: centre?.lng ?? 0,
      type: d.code !== "00" ? "departement" : SLUGS_REGIONS.has(d.slug) ? "region" : "secteur",
      villes: villes.filter((v) => v.departement.toLowerCase() === d.code.toLowerCase()).length,
    };
  });

  return <AtlasZones zones={zones} />;
}
