import Link from "next/link";

import { JsonLd } from "@/components/seo/JsonLd";
import { carottageUrl } from "@/lib/clients/francecarottage/urls";

type Segment = { label: string; href: string };

/**
 * Fil d'Ariane FC (séparateur `/`, couleurs FC) + BreadcrumbList JSON-LD en URLs
 * absolues FC. `ton="clair"` pour les pages à fond encre, `centre` pour les
 * bannières centrées : le JSON-LD doit suivre partout, d'où les variantes ici
 * plutôt qu'un `<nav>` réécrit à la main dans chaque gabarit.
 */
export function ArianeFC({
  segments,
  ton = "sombre",
  centre = false,
}: {
  segments: Segment[];
  ton?: "sombre" | "clair";
  centre?: boolean;
}) {
  const tous: Segment[] = [{ label: "Accueil", href: "/" }, ...segments];
  const clair = ton === "clair";
  return (
    <nav
      aria-label="Fil d'Ariane"
      className="mx-auto max-w-[var(--container,1280px)] px-6 py-4 md:px-8"
    >
      <ol
        className={`flex flex-wrap items-center gap-2 text-[12.5px] ${centre ? "justify-center" : ""} ${
          clair ? "text-white/55" : "text-[color:var(--fc-gris)]"
        }`}
      >
        {tous.map((s, i) => (
          <li key={s.href} className="flex items-center gap-2">
            {i > 0 && (
              <span aria-hidden className={clair ? "text-white/25" : "text-[color:var(--fc-gris-clair)]"}>
                /
              </span>
            )}
            {i === tous.length - 1 ? (
              <span
                aria-current="page"
                className={`font-semibold ${clair ? "text-[#e9a4a6]" : "text-[color:var(--fc-noir)]"}`}
              >
                {s.label}
              </span>
            ) : (
              <Link href={s.href} className={clair ? "hover:text-white" : "hover:text-[color:var(--fc-rouge)]"}>
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
