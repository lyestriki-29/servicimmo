import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Ariane } from "@/components/marketing/pages/Ariane";
import { CtaDevis } from "@/components/marketing/pages/CtaDevis";
import { VillesVoisines } from "@/components/marketing/pages/VillesVoisines";
import { CityLocalContent, CityLocalHero } from "@/components/marketing/pages/ValidatedPageDesigns";
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
      <CityLocalHero ville={ville} />
      <Ariane
        segments={[
          { label: "Zones d'intervention", href: "/zones" },
          { label: ville.ville, href: `/zones/${ville.slug}` },
        ]}
      />
      <CityLocalContent ville={ville} services={services} />
      <VillesVoisines villeActuelle={ville} />
      <CtaDevis
        titre={`Un bien à ${ville.ville} ?`}
        sousTitre="Obtenez un créneau avec une équipe qui connaît le secteur."
        libelleBouton="Demander un créneau"
        ton="anis"
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
