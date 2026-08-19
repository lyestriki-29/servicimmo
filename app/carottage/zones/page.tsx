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

export default async function ZonesIndexPage() {
  const [departements, villes] = await Promise.all([loadDepartementsFC(), loadVillesFC()]);

  const nbVillesParCode = new Map<string, number>();
  for (const v of villes) {
    const code = v.departement.toLowerCase();
    nbVillesParCode.set(code, (nbVillesParCode.get(code) ?? 0) + 1);
  }

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
      type: d.type,
      villes: nbVillesParCode.get(d.code.toLowerCase()) ?? 0,
    };
  });

  return <AtlasZones zones={zones} />;
}
