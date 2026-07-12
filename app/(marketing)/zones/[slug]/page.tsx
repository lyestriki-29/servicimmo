import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Ariane } from "@/components/marketing/pages/Ariane";
import { CtaDevis } from "@/components/marketing/pages/CtaDevis";
import { PageHero } from "@/components/marketing/pages/PageHero";
import { VillesVoisines } from "@/components/marketing/pages/VillesVoisines";
import { iconeOuDefaut } from "@/components/marketing/pages/icones";
import { JsonLd } from "@/components/seo/JsonLd";
import { getVille, loadServices, loadVilles } from "@/lib/content/load";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return (await loadVilles()).map((v) => ({ slug: v.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const ville = await getVille(slug);
  if (!ville) return {};
  return {
    title: ville.metaTitle,
    description: ville.metaDescription,
    alternates: { canonical: `/zones/${ville.slug}` },
    openGraph: { title: ville.metaTitle, description: ville.metaDescription },
  };
}

export default async function VillePage({ params }: Props) {
  const { slug } = await params;
  const ville = await getVille(slug);
  if (!ville) notFound();
  const services = (await loadServices()).slice(0, 6);

  return (
    <>
      <PageHero
        surtitre="Zone d'intervention"
        titre={`Diagnostic immobilier à ${ville.ville} (${ville.codePostal})`}
        description={`Vente, location, travaux : nos techniciens certifiés interviennent à ${ville.ville} sous 48 h.`}
      />
      <Ariane
        segments={[
          { label: "Zones d'intervention", href: "/zones" },
          { label: ville.ville, href: `/zones/${ville.slug}` },
        ]}
      />
      <article
        className="article-prose mx-auto max-w-3xl px-6 pb-4 md:px-8"
        dangerouslySetInnerHTML={{ __html: ville.html }}
      />
      <section className="mx-auto max-w-[var(--container,1280px)] px-6 py-10 md:px-8">
        <h2 className="font-[family-name:var(--font-sora)] text-[20px] font-bold text-[color:var(--color-home-ink)]">
          Nos diagnostics à {ville.ville}
        </h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s) => {
            const Icone = iconeOuDefaut(s.icone);
            return (
              <Link
                key={s.slug}
                href={`/services/${s.slug}`}
                className="flex items-start gap-3 rounded-[12px] border border-[color:var(--color-home-line)] bg-white p-4 transition-shadow hover:shadow-[0_10px_24px_rgba(15,30,58,.07)]"
              >
                <Icone className="mt-[2px] h-5 w-5 shrink-0 text-[color:var(--color-si-petrole)]" aria-hidden />
                <span className="font-[family-name:var(--font-sora)] text-[14.5px] font-semibold text-[color:var(--color-home-ink)]">
                  {s.titre}
                </span>
              </Link>
            );
          })}
        </div>
      </section>
      <VillesVoisines villeActuelle={ville} />
      <CtaDevis
        titre={`Un diagnostic à ${ville.ville} ?`}
        sousTitre="Décrivez votre bien en 2 minutes, recevez votre devis sous 2 h ouvrées."
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Service",
          name: `Diagnostic immobilier à ${ville.ville}`,
          description: ville.metaDescription,
          provider: { "@type": "LocalBusiness", name: "Servicimmo", telephone: "+33247470123" },
          areaServed: { "@type": "City", name: ville.ville, postalCode: ville.codePostal },
        }}
      />
    </>
  );
}
