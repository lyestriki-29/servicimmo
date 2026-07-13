import Link from "next/link";

import { JsonLd } from "@/components/seo/JsonLd";
import { carottageUrl } from "@/lib/clients/francecarottage/urls";

type Segment = { label: string; href: string };

/** Fil d'Ariane FC (séparateur `/`, couleurs FC) + BreadcrumbList JSON-LD en URLs absolues FC. */
export function ArianeFC({ segments }: { segments: Segment[] }) {
  const tous: Segment[] = [{ label: "Accueil", href: "/" }, ...segments];
  return (
    <nav
      aria-label="Fil d'Ariane"
      className="mx-auto max-w-[var(--container,1280px)] px-6 py-4 md:px-8"
    >
      <ol className="flex flex-wrap items-center gap-2 text-[12.5px] text-[color:var(--fc-gris)]">
        {tous.map((s, i) => (
          <li key={s.href} className="flex items-center gap-2">
            {i > 0 && <span aria-hidden className="text-[color:var(--fc-gris-clair)]">/</span>}
            {i === tous.length - 1 ? (
              <span aria-current="page" className="font-semibold text-[color:var(--fc-noir)]">
                {s.label}
              </span>
            ) : (
              <Link href={s.href} className="hover:text-[color:var(--fc-rouge)]">
                {s.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: tous.map((s, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: s.label,
            item: carottageUrl(s.href),
          })),
        }}
      />
    </nav>
  );
}
