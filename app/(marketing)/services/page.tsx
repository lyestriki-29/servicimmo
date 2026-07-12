import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";

import { Ariane } from "@/components/marketing/pages/Ariane";
import { CtaDevis } from "@/components/marketing/pages/CtaDevis";
import { PageHero } from "@/components/marketing/pages/PageHero";
import { iconeOuDefaut } from "@/components/marketing/pages/icones";
import { Reveal } from "@/components/marketing/Reveal";
import { loadServices } from "@/lib/content/load";

export const metadata: Metadata = {
  title: "Diagnostics immobiliers : nos services | Servicimmo",
  description:
    "DPE, amiante, plomb, termites, gaz, électricité, Carrez, ERP… tous les diagnostics immobiliers réalisés par Servicimmo à Tours et en Indre-et-Loire.",
  alternates: { canonical: "/services" },
};

export default async function ServicesIndexPage() {
  const services = await loadServices();
  return (
    <>
      <PageHero
        surtitre="Nos services"
        titre="Tous les diagnostics immobiliers"
        description="Cabinet certifié à Tours depuis 1998 — chaque diagnostic est réalisé par un technicien certifié et couvert par notre assurance Allianz."
      />
      <Ariane segments={[{ label: "Services", href: "/services" }]} />
      <section className="mx-auto max-w-[var(--container,1280px)] px-6 pb-6 md:px-8">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service, i) => {
            const Icone = iconeOuDefaut(service.icone);
            return (
              <Reveal key={service.slug} delay={Math.min(i * 0.05, 0.3)}>
                <Link
                  href={`/services/${service.slug}`}
                  className="group flex h-full flex-col rounded-[14px] border border-[color:var(--color-home-line)] bg-white p-6 transition-shadow hover:shadow-[0_14px_34px_rgba(15,30,58,.08)]"
                >
                  <Icone className="h-7 w-7 text-[color:var(--color-si-petrole)]" aria-hidden />
                  <h2 className="mt-4 font-[family-name:var(--font-sora)] text-[17px] font-bold text-[color:var(--color-home-ink)]">
                    {service.titre}
                  </h2>
                  <p className="mt-2 flex-1 text-[14px] leading-relaxed text-[color:var(--color-home-slate)]">
                    {service.extrait}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-1 font-[family-name:var(--font-sora)] text-[13.5px] font-semibold text-[color:var(--color-si-petrole)]">
                    En savoir plus
                    <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden />
                  </span>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </section>
      <CtaDevis />
    </>
  );
}
