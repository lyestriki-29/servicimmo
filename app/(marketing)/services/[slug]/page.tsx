import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BadgeCheckIcon, CalendarClockIcon } from "lucide-react";

import { Ariane } from "@/components/marketing/pages/Ariane";
import { CtaDevis } from "@/components/marketing/pages/CtaDevis";
import { PageHero } from "@/components/marketing/pages/PageHero";
import { ServicesLies } from "@/components/marketing/pages/ServicesLies";
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

const LIBELLES: Record<string, string> = {
  vente: "Vente", location: "Location", travaux: "Avant travaux", demolition: "Avant démolition",
};

export default async function ServicePage({ params }: Props) {
  const { slug } = await params;
  const service = await getService(slug);
  if (!service) notFound();

  return (
    <>
      <PageHero surtitre="Diagnostic" titre={service.titre} description={service.extrait}>
        <div className="mt-5 flex flex-wrap gap-2">
          {service.obligatoirePour.map((cas) => (
            <span
              key={cas}
              className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[12.5px] font-semibold text-white"
            >
              <BadgeCheckIcon className="h-3.5 w-3.5 text-[color:var(--color-si-lime)]" aria-hidden />
              Obligatoire · {LIBELLES[cas] ?? cas}
            </span>
          ))}
          {service.dureeValidite && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[12.5px] font-semibold text-white">
              <CalendarClockIcon className="h-3.5 w-3.5 text-[color:var(--color-si-lime)]" aria-hidden />
              Validité : {service.dureeValidite}
            </span>
          )}
        </div>
      </PageHero>
      <Ariane
        segments={[
          { label: "Services", href: "/services" },
          { label: service.titre, href: `/services/${service.slug}` },
        ]}
      />
      <article
        className="article-prose mx-auto max-w-3xl px-6 pb-4 md:px-8"
        dangerouslySetInnerHTML={{ __html: service.html }}
      />
      <ServicesLies slugActuel={service.slug} />
      <CtaDevis
        titre={`Besoin d'un ${service.titre} ?`}
        sousTitre="Notre questionnaire vérifie en 2 minutes les diagnostics obligatoires pour votre projet."
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
