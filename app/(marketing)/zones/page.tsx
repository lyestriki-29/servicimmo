import type { Metadata } from "next";

import { CtaDevis } from "@/components/marketing/pages/CtaDevis";
import { ZonesExperience } from "@/components/marketing/pages/ZonesExperience";
import { loadVilles } from "@/lib/content/load";

export const metadata: Metadata = {
  title: "Zones d'intervention en Indre-et-Loire (37)",
  description:
    "Servicimmo intervient à Tours et dans toute l'Indre-et-Loire : Amboise, Joué-lès-Tours, Chambray, Fondettes… Trouvez votre ville et obtenez un devis en 2 minutes.",
  alternates: { canonical: "/zones" },
};

export default async function ZonesIndexPage() {
  const villes = await loadVilles();

  return (
    <>
      <ZonesExperience
        villes={villes.map(({ slug, ville, codePostal, lat, lng }) => ({
          slug,
          ville,
          codePostal,
          lat,
          lng,
        }))}
      />
      <CtaDevis titre="Votre commune est-elle couverte ?" sousTitre="Vérifiez notre secteur et le délai habituel d’intervention." libelleBouton="Décrire mon bien" ton="anis" />
    </>
  );
}
