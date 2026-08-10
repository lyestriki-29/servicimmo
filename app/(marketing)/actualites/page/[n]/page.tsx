import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Ariane } from "@/components/marketing/pages/Ariane";
import { ListeArticles } from "@/components/marketing/pages/ListeArticles";
import { NewsLocalHero } from "@/components/marketing/pages/ValidatedPageDesigns";
import { loadArticlesPage } from "@/lib/content/load";
import { categorieDepuisSlug } from "@/lib/content/schemas";

type Props = {
  params: Promise<{ n: string }>;
  searchParams: Promise<{ sujet?: string | string[] }>;
};

// Plus de `generateStaticParams` : depuis que la page lit `searchParams` (le
// filtre `?sujet=`), Next la rend à la demande et ne pré-génère plus rien — la
// fonction était devenue du code mort qui laissait croire le contraire.
// À restaurer si l'on passe un jour le filtre en routes dédiées
// (/actualites/sujet/amiante), ce qui rendrait le statique de nouveau possible.

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { n } = await params;
  return {
    title: `Actualités du diagnostic immobilier — page ${n}`,
    alternates: { canonical: `/actualites/page/${n}` },
  };
}

export default async function ActualitesPageN({ params, searchParams }: Props) {
  const { n } = await params;
  const { sujet } = await searchParams;
  const categorie = categorieDepuisSlug(sujet);
  const page = Number(n);
  if (!Number.isInteger(page) || page < 2) notFound();
  // `totalPages` vient du sous-ensemble filtré : « Termites » n'a que 3 articles,
  // sa page 2 doit répondre 404 alors que la page 2 du fil complet existe.
  const { featured, totalPages } = await loadArticlesPage(page, categorie);
  if (page > totalPages || !featured) notFound();
  return (
    <>
      <NewsLocalHero featured={featured} />
      <Ariane segments={[{ label: "Actualités", href: "/actualites" }]} />
      <ListeArticles page={page} excludeSlug={featured.slug} categorie={categorie} />
    </>
  );
}
