import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Ariane } from "@/components/marketing/pages/Ariane";
import { CtaDevis } from "@/components/marketing/pages/CtaDevis";
import { ServiceDeroule } from "@/components/marketing/pages/ServiceDeroule";
import { ServicesLies } from "@/components/marketing/pages/ServicesLies";
import { ServiceAtlasHero, ServiceMissionContent } from "@/components/marketing/pages/ValidatedPageDesigns";
import { JsonLd } from "@/components/seo/JsonLd";
import { getService, loadServices } from "@/lib/content/load";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return (await loadServices()).map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const service = await getService(slug);
  if (!service) return {};
  return {
    title: service.metaTitle,
    description: service.metaDescription,
    alternates: { canonical: `/services/${service.slug}` },
    openGraph: { title: service.metaTitle, description: service.metaDescription },
  };
}

export default async function ServicePage({ params }: Props) {
  const { slug } = await params;
  const service = await getService(slug);
  if (!service) notFound();

  return (
    <>
      <ServiceAtlasHero service={service} />
      <ServiceDeroule service={service} />
      <Ariane
        segments={[
          { label: "Services", href: "/services" },
          { label: service.titre, href: `/services/${service.slug}` },
        ]}
      />
      <ServiceMissionContent service={service} />
      <ServicesLies slugActuel={service.slug} />
      <CtaDevis
        titre={`Besoin d'un ${service.titre} ?`}
        sousTitre="Un technicien confirme le périmètre et le délai de votre intervention."
        libelleBouton={`Obtenir mon devis`}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Service",
          name: service.titre,
          description: service.metaDescription,
          provider: { "@type": "LocalBusiness", name: "Servicimmo", telephone: "+33247470123" },
          areaServed: "Indre-et-Loire",
        }}
      />
    </>
  );
}
