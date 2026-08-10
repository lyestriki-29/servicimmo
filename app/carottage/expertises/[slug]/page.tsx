import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ArianeFC } from "@/components/carottage/ArianeFC";
import { CtaDevisFC } from "@/components/carottage/CtaDevisFC";
import { ExpertisesLiees } from "@/components/carottage/ExpertisesLiees";
import { SurtitreFC } from "@/components/carottage/SurtitreFC";
import { JsonLd } from "@/components/seo/JsonLd";
import { getExpertise, loadExpertises } from "@/lib/content/load-carottage";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return (await loadExpertises()).map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const expertise = await getExpertise(slug);
  if (!expertise) return {};
  return {
    title: expertise.metaTitle,
    description: expertise.metaDescription,
    alternates: { canonical: `/expertises/${expertise.slug}` },
    openGraph: { title: expertise.metaTitle, description: expertise.metaDescription, type: "article" },
  };
}

export default async function ExpertisePage({ params }: Props) {
  const { slug } = await params;
  const expertise = await getExpertise(slug);
  if (!expertise) notFound();

  return (
    <>
      <section className="border-b border-[color:var(--fc-gris-clair)] bg-white">
        <div className="mx-auto max-w-3xl px-6 py-12 md:px-8">
          <SurtitreFC>Expertise</SurtitreFC>
          <h1 className="mt-4 font-[family-name:var(--font-sora)] text-[clamp(30px,3.4vw,40px)] font-extrabold leading-[1.08] tracking-[-0.02em] text-balance text-[color:var(--fc-noir)]">
            {expertise.titre}
          </h1>
        </div>
      </section>
      <ArianeFC
        segments={[
          { label: "Expertises", href: "/expertises" },
          { label: expertise.titre, href: `/expertises/${expertise.slug}` },
        ]}
      />
      <article
        className="fc-prose mx-auto max-w-3xl px-6 pb-6 md:px-8"
        dangerouslySetInnerHTML={{ __html: expertise.html }}
      />
      <ExpertisesLiees slugActuel={expertise.slug} />
      <CtaDevisFC titre={`Un chantier concerné par « ${expertise.titre} » ?`} />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: expertise.titre,
          description: expertise.metaDescription,
          ...(expertise.date ? { datePublished: expertise.date } : {}),
          author: { "@type": "Organization", name: "France Carottage" },
        }}
      />
    </>
  );
}
