import Link from "next/link";

import { ArianeFC } from "@/components/carottage/ArianeFC";
import { CtaDevisFC } from "@/components/carottage/CtaDevisFC";
import { SurtitreFC } from "@/components/carottage/SurtitreFC";
import { JsonLd } from "@/components/seo/JsonLd";
import { carottageUrl } from "@/lib/clients/francecarottage/urls";
import { loadVillesFC } from "@/lib/content/load-carottage";
import type { DepartementFC } from "@/lib/content/schemas-carottage";

/** Gabarit page département — prose + villes couvertes du département + CTA. */
export async function GabaritDepartement({ departement }: { departement: DepartementFC }) {
  const villes = (await loadVillesFC())
    .filter((v) => v.departement.toLowerCase() === departement.code.toLowerCase())
    .slice(0, 24);

  return (
    <>
      <section className="border-b border-[color:var(--fc-gris-clair)] bg-white">
        <div className="mx-auto max-w-[var(--container,1280px)] px-6 py-12 md:px-8">
          <SurtitreFC>Département {departement.code}</SurtitreFC>
          <h1 className="mt-4 font-[family-name:var(--font-sora)] text-[32px] font-extrabold leading-[1.06] tracking-[-0.02em] text-[color:var(--fc-noir)] sm:text-[42px]">
            Carottage & repérage amiante/HAP dans le {departement.nom}
          </h1>
        </div>
      </section>
      <ArianeFC
        segments={[
          { label: "Zones d'intervention", href: "/zones" },
          { label: departement.nom, href: `/zones/${departement.slug}` },
        ]}
      />
      <article
        className="fc-prose mx-auto max-w-3xl px-6 pb-4 md:px-8"
        dangerouslySetInnerHTML={{ __html: departement.html }}
      />
      {villes.length > 0 && (
        <section className="mx-auto max-w-[var(--container,1280px)] px-6 py-12 md:px-8">
          <h2 className="font-[family-name:var(--font-sora)] text-[20px] font-bold text-[color:var(--fc-noir)]">
            Nos villes couvertes dans le {departement.nom}
          </h2>
          <ul className="mt-5 grid gap-x-6 gap-y-2 sm:grid-cols-2 lg:grid-cols-3">
            {villes.map((v) => (
              <li key={v.slug}>
                <Link
                  href={`/zones/${v.slug}`}
                  className="py-1 text-[14.5px] text-[color:var(--fc-gris)] hover:text-[color:var(--fc-rouge)]"
                >
                  {v.ville} ({v.codePostal})
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
      <CtaDevisFC titre={`Un chantier dans le ${departement.nom} ?`} />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Service",
          name: `Carottage et repérage amiante/HAP dans le ${departement.nom}`,
          description: departement.metaDescription,
          provider: { "@type": "LocalBusiness", name: "France Carottage", telephone: "+33247470123" },
          areaServed: { "@type": "AdministrativeArea", name: departement.nom },
          url: carottageUrl(`/zones/${departement.slug}`),
        }}
      />
    </>
  );
}
