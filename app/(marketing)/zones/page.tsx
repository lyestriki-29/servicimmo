import type { Metadata } from "next";

import { CtaDevis } from "@/components/marketing/pages/CtaDevis";
import { ZonesFable } from "@/components/marketing/pages/ZonesFable";
import { loadVilles } from "@/lib/content/load";

export const metadata: Metadata = {
  title: "Zones d'intervention en Indre-et-Loire (37)",
  description:
    "Servicimmo intervient à Tours et dans toute l'Indre-et-Loire : Amboise, Joué-lès-Tours, Chambray, Fondettes… Trouvez votre ville et obtenez un devis en 2 minutes.",
  alternates: { canonical: "/zones" },
};

/** Direction Fable retenue par le client le 2026-07-17, après comparaison sur le rendu réel. */
export default async function ZonesIndexPage() {
  const villes = await loadVilles();
  const zones = villes.map(({ slug, ville, codePostal, lat, lng }) => ({
    slug,
    ville,
    codePostal,
    lat,
    lng,
  }));

  return (
    <>
      <ZonesFable villes={zones} />
      <CtaDevis titre="Votre commune est-elle couverte ?" sousTitre="Vérifiez notre secteur et le délai habituel d’intervention." libelleBouton="Décrire mon bien" ton="anis" />
    </>
  );
}
