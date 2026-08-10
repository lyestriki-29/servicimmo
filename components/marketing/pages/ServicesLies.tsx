import Link from "next/link";

import { iconeOuDefaut } from "@/components/marketing/pages/icones";
import { loadServices } from "@/lib/content/load";

/** Maillage interne : 3 autres services, par ordre du catalogue. */
export async function ServicesLies({ slugActuel }: { slugActuel: string }) {
  const services = (await loadServices()).filter((s) => s.slug !== slugActuel).slice(0, 3);
  if (services.length === 0) return null;
  return (
    <section className="mx-auto max-w-[var(--container,1280px)] px-6 py-10 md:px-8">
      <h2 className="font-[family-name:var(--font-sora)] text-[20px] font-bold text-[color:var(--color-home-ink)]">
        Autres diagnostics
      </h2>
      <div className="mt-5 divide-y divide-[color:var(--color-home-line)] border-y border-[color:var(--color-home-line)] sm:grid sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        {services.map((s) => {
          const Icone = iconeOuDefaut(s.icone);
          return (
            <Link
              key={s.slug}
              href={`/services/${s.slug}`}
              className="flex min-h-20 items-center justify-center gap-3 bg-white p-4 text-center transition-colors hover:bg-[color:var(--color-home-saf-bg)]"
            >
              <Icone className="h-5 w-5 shrink-0 text-[color:var(--color-si-petrole)]" aria-hidden />
              <span className="font-[family-name:var(--font-sora)] text-[14.5px] font-semibold text-[color:var(--color-home-ink)]">
                {s.titre}
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
