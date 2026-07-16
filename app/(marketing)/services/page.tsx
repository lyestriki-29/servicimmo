import type { Metadata } from "next";

import { Ariane } from "@/components/marketing/pages/Ariane";
import { CtaDevis } from "@/components/marketing/pages/CtaDevis";
import { ServicesCatalogHero, ServicesProjectExperience } from "@/components/marketing/pages/ValidatedPageDesigns";
import { loadServices } from "@/lib/content/load";

export const metadata: Metadata = {
  title: "Diagnostics immobiliers : nos services",
  description:
    "DPE, amiante, plomb, termites, gaz, électricité, Carrez, ERP… tous les diagnostics immobiliers réalisés par Servicimmo à Tours et en Indre-et-Loire.",
  alternates: { canonical: "/services" },
};

export default async function ServicesIndexPage() {
  const services = await loadServices();
  return (
    <>
      <ServicesCatalogHero count={services.length} />
      <Ariane segments={[{ label: "Services", href: "/services" }]} />
      <ServicesProjectExperience services={services} />
      <CtaDevis titre="Quel est votre projet immobilier ?" sousTitre="Identifiez seulement les diagnostics utiles à votre situation." libelleBouton="Identifier mes diagnostics" ton="anis" />
    </>
  );
}
