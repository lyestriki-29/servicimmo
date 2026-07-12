import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Ariane } from "@/components/marketing/pages/Ariane";
import { ListeArticles } from "@/components/marketing/pages/ListeArticles";
import { PageHero } from "@/components/marketing/pages/PageHero";
import { ARTICLES_PAR_PAGE, loadArticles } from "@/lib/content/load";

type Props = { params: Promise<{ n: string }> };

export async function generateStaticParams() {
  const total = Math.ceil((await loadArticles()).length / ARTICLES_PAR_PAGE);
  return Array.from({ length: Math.max(0, total - 1) }, (_, i) => ({ n: String(i + 2) }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { n } = await params;
  return {
    title: `Actualités du diagnostic immobilier — page ${n} | Servicimmo`,
    alternates: { canonical: `/actualites/page/${n}` },
  };
}

export default async function ActualitesPageN({ params }: Props) {
  const { n } = await params;
  const page = Number(n);
  const total = Math.ceil((await loadArticles()).length / ARTICLES_PAR_PAGE);
  if (!Number.isInteger(page) || page < 2 || page > total) notFound();
  return (
    <>
      <PageHero surtitre="Actualités" titre={`Veille réglementaire — page ${page}`} />
      <Ariane segments={[{ label: "Actualités", href: "/actualites" }]} />
      <ListeArticles page={page} />
    </>
  );
}
