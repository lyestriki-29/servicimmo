import Link from "next/link";

import { loadExpertises } from "@/lib/content/load-carottage";

/** Maillage interne : 3 autres expertises. */
export async function ExpertisesLiees({ slugActuel }: { slugActuel: string }) {
  const autres = (await loadExpertises()).filter((e) => e.slug !== slugActuel).slice(0, 3);
  if (autres.length === 0) return null;
  return (
    <section className="mx-auto max-w-[var(--container,1280px)] px-6 py-12 md:px-8">
      <h2 className="font-[family-name:var(--font-sora)] text-[20px] font-bold text-[color:var(--fc-noir)]">
        À lire aussi
      </h2>
      <div className="mt-5 grid gap-4 sm:grid-cols-3">
        {autres.map((e) => (
          <Link
            key={e.slug}
            href={`/expertises/${e.slug}`}
            className="border-t-2 border-[color:var(--fc-gris-clair)] bg-white p-4 font-[family-name:var(--font-sora)] text-[14.5px] font-bold leading-snug text-[color:var(--fc-noir)] transition-colors hover:border-[color:var(--fc-rouge)]"
          >
            {e.titre}
          </Link>
        ))}
      </div>
    </section>
  );
}
