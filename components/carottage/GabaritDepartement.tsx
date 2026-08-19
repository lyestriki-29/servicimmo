import Link from "next/link";

import { ArianeFC } from "@/components/carottage/ArianeFC";
import { ChevauchementFC } from "@/components/carottage/ChevauchementFC";
import { CtaDevisFC } from "@/components/carottage/CtaDevisFC";
import { HeroInterieurFC } from "@/components/carottage/HeroInterieurFC";
import { JsonLd } from "@/components/seo/JsonLd";
import { carottageUrl } from "@/lib/clients/francecarottage/urls";
import { loadVillesFC } from "@/lib/content/load-carottage";
import type { DepartementFC } from "@/lib/content/schemas-carottage";

/** Gabarit page département — prose + villes couvertes du département + CTA. */
export async function GabaritDepartement({ departement }: { departement: DepartementFC }) {
  const toutesLesVilles = (await loadVillesFC()).filter(
    (v) => v.departement.toLowerCase() === departement.code.toLowerCase(),
  );
  // Le compteur porte sur la couverture réelle, la liste affichée est plafonnée.
  const nbVilles = toutesLesVilles.length;
  const villes = toutesLesVilles.slice(0, 24);

  return (
    <>
      {/* Pas d'article devant le nom : « dans le Gironde », « dans le Île-de-France »
          — aucun article unique ne convient aux 58 zones (masculin, féminin, pluriel,
          élision). Le tiret est correct partout. */}
      <HeroInterieurFC
        surtitre={departement.type === "departement" ? `Département ${departement.code}` : "Zone d'intervention"}
        titre={<>Carottage &amp; repérage amiante/HAP — {departement.nom}</>}
      />
      <ChevauchementFC>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="border-t-2 border-[color:var(--fc-gris-clair)] p-4">
            <span className="font-[family-name:var(--font-sora)] text-[13.5px] font-bold text-[color:var(--fc-noir)]">
              {nbVilles > 0
                ? `${nbVilles} ville${nbVilles > 1 ? "s" : ""} couverte${nbVilles > 1 ? "s" : ""}`
                : "Zone en couverture"}
            </span>
          </div>
          <div className="border-t-2 border-[color:var(--fc-gris-clair)] p-4">
            <span className="font-[family-name:var(--font-sora)] text-[13.5px] font-bold text-[color:var(--fc-noir)]">
              Labo accrédité · devis sous 24 h
            </span>
          </div>
        </div>
      </ChevauchementFC>
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
            Nos villes couvertes — {departement.nom}
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
      <CtaDevisFC titre={`${departement.nom} — un chantier à repérer ?`} />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Service",
          name: `Carottage et repérage amiante/HAP — ${departement.nom}`,
          description: departement.metaDescription,
          provider: { "@type": "LocalBusiness", name: "France Carottage", telephone: "+33247470123" },
          areaServed: { "@type": "AdministrativeArea", name: departement.nom },
          url: carottageUrl(`/zones/${departement.slug}`),
        }}
      />
    </>
  );
}
