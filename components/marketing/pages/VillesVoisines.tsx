import Link from "next/link";

import { loadVilles } from "@/lib/content/load";
import type { Ville } from "@/lib/content/schemas";

function distanceKm(a: Ville, b: Ville): number {
  const rad = (d: number) => (d * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat);
  const dLng = rad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.sqrt(h));
}

/** Maillage interne : les 4 villes couvertes les plus proches. */
export async function VillesVoisines({ villeActuelle }: { villeActuelle: Ville }) {
  const voisines = (await loadVilles())
    .filter((v) => v.slug !== villeActuelle.slug)
    .sort((a, b) => distanceKm(villeActuelle, a) - distanceKm(villeActuelle, b))
    .slice(0, 4);
  if (voisines.length === 0) return null;
  return (
    <section className="mx-auto max-w-[var(--container,1280px)] px-6 py-10 md:px-8">
      <h2 className="font-[family-name:var(--font-sora)] text-[20px] font-bold text-[color:var(--color-home-ink)]">
        Nous intervenons aussi à proximité
      </h2>
      <div className="mt-5 divide-y divide-[color:var(--color-home-line)] border-y border-[color:var(--color-home-line)] sm:grid sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-4">
        {voisines.map((v) => (
          <Link
            key={v.slug}
            href={`/zones/${v.slug}`}
            className="flex min-h-16 items-center bg-white p-4 font-[family-name:var(--font-sora)] text-[14.5px] font-semibold text-[color:var(--color-home-ink)] transition-colors hover:bg-[color:var(--color-home-saf-bg)]"
          >
            {v.ville} ({v.codePostal})
          </Link>
        ))}
      </div>
    </section>
  );
}
