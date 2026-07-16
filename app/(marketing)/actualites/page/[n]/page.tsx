import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Ariane } from "@/components/marketing/pages/Ariane";
import { ListeArticles } from "@/components/marketing/pages/ListeArticles";
import { NewsLocalHero } from "@/components/marketing/pages/ValidatedPageDesigns";
import { ARTICLES_PAR_PAGE, loadArticles } from "@/lib/content/load";

type Props = { params: Promise<{ n: string }> };

export async function generateStaticParams() {
  const total = Math.ceil((await loadArticles()).length / ARTICLES_PAR_PAGE);
  return Array.from({ length: Math.max(0, total - 1) }, (_, i) => ({ n: String(i + 2) }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { n } = await params;
  return {
    title: `Actualités du diagnostic immobilier — page ${n}`,
    alternates: { canonical: `/actualites/page/${n}` },
  };
}

export default async function ActualitesPageN({ params }: Props) {
  const { n } = await params;
  const page = Number(n);
  const articles = await loadArticles();
  const total = Math.ceil(articles.length / ARTICLES_PAR_PAGE);
  if (!Number.isInteger(page) || page < 2 || page > total) notFound();
  const featured = articles[(page - 1) * ARTICLES_PAR_PAGE];
  if (!featured) notFound();
  return (
    <>
      <NewsLocalHero featured={featured} />
      <Ariane segments={[{ label: "Actualités", href: "/actualites" }]} />
      <ListeArticles page={page} excludeSlug={featured.slug} />
    </>
  );
}
