import type { Metadata } from "next";
import Link from "next/link";
import { MapPinIcon } from "lucide-react";

import { Ariane } from "@/components/marketing/pages/Ariane";
import { CarteZone } from "@/components/marketing/pages/CarteZone";
import { CtaDevis } from "@/components/marketing/pages/CtaDevis";
import { PageHero } from "@/components/marketing/pages/PageHero";
import { loadVilles } from "@/lib/content/load";

export const metadata: Metadata = {
  title: "Zones d'intervention en Indre-et-Loire (37) | Servicimmo",
  description:
    "Servicimmo intervient à Tours et dans toute l'Indre-et-Loire : Amboise, Joué-lès-Tours, Chambray, Fondettes… Trouvez votre ville et obtenez un devis en 2 minutes.",
  alternates: { canonical: "/zones" },
};

export default async function ZonesIndexPage() {
  const villes = await loadVilles();
  return (
    <>
      <PageHero
        surtitre="Zones d'intervention"
        titre="Vos diagnostics partout en Indre-et-Loire"
        description="Basés à Tours, nous intervenons sous 48 h dans tout le département et les communes limitrophes."
      />
      <Ariane segments={[{ label: "Zones d'intervention", href: "/zones" }]} />
      <section className="mx-auto max-w-[var(--container,1280px)] px-6 pb-4 md:px-8">
        <CarteZone villes={villes.map(({ slug, ville, lat, lng }) => ({ slug, ville, lat, lng }))} />
      </section>
      <section className="mx-auto max-w-[var(--container,1280px)] px-6 py-10 md:px-8">
        <h2 className="font-[family-name:var(--font-sora)] text-[20px] font-bold text-[color:var(--color-home-ink)]">
          Toutes nos villes d’intervention
        </h2>
        <ul className="mt-5 grid gap-x-6 gap-y-2 sm:grid-cols-2 lg:grid-cols-4">
          {villes.map((v) => (
            <li key={v.slug}>
              <Link
                href={`/zones/${v.slug}`}
                className="inline-flex items-center gap-2 py-1 text-[14.5px] text-[color:var(--color-home-slate)] hover:text-[color:var(--color-si-petrole)]"
              >
                <MapPinIcon className="h-4 w-4 text-[color:var(--color-si-petrole)]" aria-hidden />
                {v.ville} ({v.codePostal})
              </Link>
            </li>
          ))}
        </ul>
      </section>
      <CtaDevis />
    </>
  );
}
