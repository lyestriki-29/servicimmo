import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Ariane } from "@/components/marketing/pages/Ariane";
import { CtaDevis } from "@/components/marketing/pages/CtaDevis";
import { ArticleExpertContent, ArticleExpertHero } from "@/components/marketing/pages/ValidatedPageDesigns";
import { JsonLd } from "@/components/seo/JsonLd";
import { getArticle, loadArticles } from "@/lib/content/load";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return (await loadArticles()).map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) return {};
  return {
    title: article.metaTitle,
    description: article.metaDescription,
    alternates: { canonical: `/actualites/${article.slug}` },
    openGraph: {
      title: article.metaTitle,
      description: article.metaDescription,
      type: "article",
      publishedTime: article.date,
    },
  };
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) notFound();

  const recents = (await loadArticles()).filter((a) => a.slug !== article.slug).slice(0, 3);

  return (
    <>
      <ArticleExpertHero article={article} />
      <Ariane
        segments={[
          { label: "Actualités", href: "/actualites" },
          { label: article.titre, href: `/actualites/${article.slug}` },
        ]}
      />
      <ArticleExpertContent article={article} related={recents} />
      <CtaDevis titre="Votre diagnostic est-il encore valable ?" sousTitre="Un expert Servicimmo vérifie votre situation et vous répond clairement." libelleBouton="Vérifier mon dossier" />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: article.titre,
          datePublished: article.date,
          description: article.metaDescription,
          author: { "@type": "Organization", name: "Servicimmo" },
        }}
      />
    </>
  );
}
