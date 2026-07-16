import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Ariane } from "@/components/marketing/pages/Ariane";
import { CtaDevis } from "@/components/marketing/pages/CtaDevis";
import { ListeArticles } from "@/components/marketing/pages/ListeArticles";
import { NewsLocalHero } from "@/components/marketing/pages/ValidatedPageDesigns";
import { loadArticles } from "@/lib/content/load";

export const metadata: Metadata = {
  title: "Actualités du diagnostic immobilier",
  description:
    "Veille réglementaire depuis 2017 : DPE, amiante, plomb, termites, copropriété… Suivez les évolutions du diagnostic immobilier avec Servicimmo.",
  alternates: { canonical: "/actualites" },
};

export default async function ActualitesIndexPage() {
  const [featured] = await loadArticles();
  if (!featured) notFound();
  return (
    <>
      <NewsLocalHero featured={featured} />
      <Ariane segments={[{ label: "Actualités", href: "/actualites" }]} />
      <ListeArticles page={1} excludeSlug={featured.slug} />
      <CtaDevis titre="Une règle change pour votre bien ?" sousTitre="Décrivez votre situation : un diagnostiqueur vous répond clairement." libelleBouton="Vérifier ma situation" />
    </>
  );
}
