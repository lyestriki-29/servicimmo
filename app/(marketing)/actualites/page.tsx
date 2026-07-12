import type { Metadata } from "next";

import { Ariane } from "@/components/marketing/pages/Ariane";
import { CtaDevis } from "@/components/marketing/pages/CtaDevis";
import { ListeArticles } from "@/components/marketing/pages/ListeArticles";
import { PageHero } from "@/components/marketing/pages/PageHero";

export const metadata: Metadata = {
  title: "Actualités du diagnostic immobilier | Servicimmo",
  description:
    "Veille réglementaire depuis 2017 : DPE, amiante, plomb, termites, copropriété… Suivez les évolutions du diagnostic immobilier avec Servicimmo.",
  alternates: { canonical: "/actualites" },
};

export default function ActualitesIndexPage() {
  return (
    <>
      <PageHero
        surtitre="Actualités"
        titre="La veille réglementaire du diagnostic"
        description="Depuis 2017, nous décryptons les évolutions réglementaires pour les propriétaires, bailleurs et professionnels de l'immobilier."
      />
      <Ariane segments={[{ label: "Actualités", href: "/actualites" }]} />
      <ListeArticles page={1} />
      <CtaDevis />
    </>
  );
}
