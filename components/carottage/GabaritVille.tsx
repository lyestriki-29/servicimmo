import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowRightIcon, Building2Icon, RouteIcon, WavesIcon } from "lucide-react";

import { ArianeFC } from "@/components/carottage/ArianeFC";
import { CtaDevisFC } from "@/components/carottage/CtaDevisFC";
import { SurtitreFC } from "@/components/carottage/SurtitreFC";
import { JsonLd } from "@/components/seo/JsonLd";
import { ordreSections, variantePour, villesVoisines, type SectionKey } from "@/lib/carottage/ville-gabarit";
import { carottageUrl } from "@/lib/clients/francecarottage/urls";
import { loadDepartementsFC, loadVillesFC } from "@/lib/content/load-carottage";
import type { VilleFC } from "@/lib/content/schemas-carottage";

const PRESTATIONS = [
  { icone: RouteIcon, titre: "Voirie & chaussées" },
  { icone: WavesIcon, titre: "Réseaux & tranchées" },
  { icone: Building2Icon, titre: "Bâtiment & parkings" },
] as const;

/** Gabarit ville — structure tournante (4 variantes), villes voisines réelles, département parent. */
export async function GabaritVille({ ville }: { ville: VilleFC }) {
  const [toutes, departements] = await Promise.all([loadVillesFC(), loadDepartementsFC()]);
  const voisines = villesVoisines(ville, toutes, 4);
  const departement = departements.find(
    (d) => d.code.toLowerCase() === ville.departement.toLowerCase(),
  );
  const ordre = ordreSections(variantePour(ville.slug));

  const blocs: Record<SectionKey, ReactNode> = {
    prestations: (
      <section key="prestations" className="mx-auto max-w-[var(--container,1280px)] px-6 py-10 md:px-8">
        <h2 className="font-[family-name:var(--font-sora)] text-[20px] font-bold text-[color:var(--fc-noir)]">
          Nos prestations à {ville.ville}
        </h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          {PRESTATIONS.map((p) => {
            const Icone = p.icone;
            return (
              <div key={p.titre} className="border-t-2 border-[color:var(--fc-gris-clair)] bg-white p-5">
                <Icone className="h-6 w-6 text-[color:var(--fc-rouge)]" aria-hidden />
                <p className="mt-3 font-[family-name:var(--font-sora)] text-[14.5px] font-bold text-[color:var(--fc-noir)]">
                  {p.titre}
                </p>
              </div>
            );
          })}
        </div>
      </section>
    ),
    voisines:
      voisines.length > 0 ? (
        <section key="voisines" className="mx-auto max-w-[var(--container,1280px)] px-6 py-10 md:px-8">
          <h2 className="font-[family-name:var(--font-sora)] text-[20px] font-bold text-[color:var(--fc-noir)]">
            Nous intervenons aussi à proximité
          </h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {voisines.map((v) => (
              <Link
                key={v.slug}
                href={`/zones/${v.slug}`}
                className="border-t-2 border-[color:var(--fc-gris-clair)] bg-white p-4 font-[family-name:var(--font-sora)] text-[14.5px] font-bold text-[color:var(--fc-noir)] transition-colors hover:border-[color:var(--fc-rouge)]"
              >
                {v.ville} ({v.codePostal})
              </Link>
            ))}
          </div>
        </section>
      ) : null,
    departement: departement ? (
      <section key="departement" className="mx-auto max-w-[var(--container,1280px)] px-6 py-10 md:px-8">
        <Link
          href={`/zones/${departement.slug}`}
          className="group flex items-center justify-between gap-4 border-l-4 border-[color:var(--fc-rouge)] bg-white p-6"
        >
          <span>
            <span className="font-[family-name:var(--font-sora)] text-[12.5px] font-bold uppercase tracking-wide text-[color:var(--fc-rouge)]">
              Département {departement.code}
            </span>
            <span className="mt-1 block font-[family-name:var(--font-sora)] text-[17px] font-bold text-[color:var(--fc-noir)]">
              Voir toute notre couverture du {departement.nom}
            </span>
          </span>
          <ArrowRightIcon
            className="h-5 w-5 shrink-0 text-[color:var(--fc-rouge)] transition-transform group-hover:translate-x-1"
            aria-hidden
          />
        </Link>
      </section>
    ) : null,
  };

  return (
    <>
      <section className="border-b border-[color:var(--fc-gris-clair)] bg-white">
        <div className="mx-auto max-w-[var(--container,1280px)] px-6 py-12 md:px-8">
          <SurtitreFC>{ville.codePostal}</SurtitreFC>
          <h1 className="mt-4 font-[family-name:var(--font-sora)] text-[32px] font-extrabold leading-[1.06] tracking-[-0.02em] text-[color:var(--fc-noir)] sm:text-[42px]">
            Carottage & repérage amiante/HAP à {ville.ville}
          </h1>
        </div>
      </section>
      <ArianeFC
        segments={[
          { label: "Zones d'intervention", href: "/zones" },
          ...(departement ? [{ label: departement.nom, href: `/zones/${departement.slug}` }] : []),
          { label: ville.ville, href: `/zones/${ville.slug}` },
        ]}
      />
      <article
        className="fc-prose mx-auto max-w-3xl px-6 pb-4 md:px-8"
        dangerouslySetInnerHTML={{ __html: ville.html }}
      />
      {ordre.map((key) => blocs[key])}
      <CtaDevisFC titre={`Un chantier à ${ville.ville} ?`} />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Service",
          name: `Carottage et repérage amiante/HAP à ${ville.ville}`,
          description: ville.metaDescription,
          provider: { "@type": "LocalBusiness", name: "France Carottage", telephone: "+33247470123" },
          areaServed: { "@type": "City", name: ville.ville, postalCode: ville.codePostal },
          url: carottageUrl(`/zones/${ville.slug}`),
        }}
      />
    </>
  );
}
