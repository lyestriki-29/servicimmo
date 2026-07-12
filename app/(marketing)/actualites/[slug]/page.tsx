import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { ArchiveIcon } from "lucide-react";

import { Ariane } from "@/components/marketing/pages/Ariane";
import { CtaDevis } from "@/components/marketing/pages/CtaDevis";
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
      <Ariane
        segments={[
          { label: "Actualités", href: "/actualites" },
          { label: article.titre, href: `/actualites/${article.slug}` },
        ]}
      />
      <article className="mx-auto max-w-3xl px-6 pb-6 md:px-8">
        <time dateTime={article.date} className="text-[13px] font-semibold tracking-wide text-[color:var(--color-si-petrole)] uppercase">
          {format(new Date(article.date), "d MMMM yyyy", { locale: fr })}
        </time>
        <h1 className="mt-2 font-[family-name:var(--font-sora)] text-[28px] leading-tight font-bold text-[color:var(--color-home-ink)] sm:text-[34px]">
          {article.titre}
        </h1>
        {article.archive && (
          <aside className="mt-6 flex items-start gap-3 rounded-[12px] border-l-4 border-[color:var(--color-home-saf)] bg-[color:var(--color-si-creme)] p-4">
            <ArchiveIcon className="mt-[2px] h-5 w-5 shrink-0 text-[color:var(--color-home-ink)]" aria-hidden />
            <p className="text-[14px] leading-relaxed text-[color:var(--color-home-slate)]">
              <strong>Article d&apos;archive</strong> — la réglementation a évolué depuis sa publication.
              {article.archiveNote ? ` ${article.archiveNote}` : ""}
            </p>
          </aside>
        )}
        <div className="article-prose mt-8" dangerouslySetInnerHTML={{ __html: article.html }} />
      </article>
      <section className="mx-auto max-w-[var(--container,1280px)] px-6 py-10 md:px-8">
        <h2 className="font-[family-name:var(--font-sora)] text-[20px] font-bold text-[color:var(--color-home-ink)]">
          À lire aussi
        </h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          {recents.map((a) => (
            <Link
              key={a.slug}
              href={`/actualites/${a.slug}`}
              className="rounded-[12px] border border-[color:var(--color-home-line)] bg-white p-4 font-[family-name:var(--font-sora)] text-[14.5px] leading-snug font-semibold text-[color:var(--color-home-ink)] transition-shadow hover:shadow-[0_10px_24px_rgba(15,30,58,.07)]"
            >
              {a.titre}
            </Link>
          ))}
        </div>
      </section>
      <CtaDevis />
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
