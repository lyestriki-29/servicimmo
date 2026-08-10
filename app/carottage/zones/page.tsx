import type { Metadata } from "next";
import Link from "next/link";
import { MapPinIcon } from "lucide-react";

import { ArianeFC } from "@/components/carottage/ArianeFC";
import { CarteFrance, type PointDepartement } from "@/components/carottage/CarteFrance";
import { CtaDevisFC } from "@/components/carottage/CtaDevisFC";
import { SurtitreFC } from "@/components/carottage/SurtitreFC";
import { getDepartement } from "@/lib/clients/francecarottage/departements";
import { loadDepartementsFC } from "@/lib/content/load-carottage";

export const metadata: Metadata = {
  title: "Zones d'intervention — carottage partout en France",
  description:
    "France Carottage intervient dans 58 départements et 191 villes : carottage routier et repérage amiante/HAP sur enrobés. Trouvez votre zone et demandez un devis.",
  alternates: { canonical: "/zones" },
};

export default async function ZonesIndexPage() {
  const departements = await loadDepartementsFC();
  const points: PointDepartement[] = departements.flatMap((d) => {
    const centre = getDepartement(d.code);
    return centre ? [{ slug: d.slug, nom: d.nom, lat: centre.lat, lng: centre.lng }] : [];
  });

  return (
    <>
      <section className="border-b border-[color:var(--fc-gris-clair)] bg-white">
        <div className="mx-auto max-w-[var(--container,1280px)] px-6 py-14 md:px-8">
          <SurtitreFC>Zones d’intervention</SurtitreFC>
          <h1 className="mt-4 max-w-2xl font-[family-name:var(--font-sora)] text-[clamp(34px,3.7vw,44px)] font-extrabold leading-tight tracking-[-0.02em] text-balance text-[color:var(--fc-noir)]">
            Un réseau national, au plus près de vos chantiers.
          </h1>
        </div>
      </section>
      <ArianeFC segments={[{ label: "Zones d'intervention", href: "/zones" }]} />
      <section className="mx-auto max-w-[var(--container,1280px)] px-6 pb-4 md:px-8">
        <CarteFrance points={points} />
      </section>
      <section className="mx-auto max-w-[var(--container,1280px)] px-6 py-12 md:px-8">
        <h2 className="font-[family-name:var(--font-sora)] text-[20px] font-bold text-[color:var(--fc-noir)]">
          Tous nos départements
        </h2>
        <ul className="mt-5 grid gap-x-6 gap-y-2 sm:grid-cols-2 lg:grid-cols-3">
          {departements.map((d) => (
            <li key={d.slug}>
              <Link
                href={`/zones/${d.slug}`}
                className="inline-flex items-center gap-2 py-1 text-[14.5px] text-[color:var(--fc-gris)] hover:text-[color:var(--fc-rouge)]"
              >
                <MapPinIcon className="h-4 w-4 text-[color:var(--fc-rouge)]" aria-hidden />
                {d.nom} ({d.code})
              </Link>
            </li>
          ))}
        </ul>
      </section>
      <CtaDevisFC />
    </>
  );
}
