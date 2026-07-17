import { KickerMono } from "@/components/marketing/pages/ValidatedPageDesigns";
import type { Service } from "@/lib/content/schemas";

/**
 * « Le déroulé de l'intervention » — carte détachée sous le hero de la fiche service.
 *
 * ⚠️ Les jalons viennent du frontmatter `deroule:` de chaque fiche et sont des
 * PROPOSITIONS non validées par Servicimmo (cf. .planning/BLOCKERS.md). Ce sont
 * des promesses de délai faites au visiteur : à confirmer avant la mise en prod.
 *
 * Rendu conditionnel : une fiche sans `deroule:` n'affiche simplement pas la
 * section, plutôt qu'un cadre vide.
 */
export function ServiceDeroule({ service }: { service: Service }) {
  const etapes = service.deroule;
  if (!etapes?.length) return null;

  return (
    <section className="bg-white">
      <div className="mx-auto max-w-[var(--container,1280px)] px-6 pb-12 md:px-8">
        <div className="overflow-hidden rounded-[16px] border border-[color:var(--color-home-line)] shadow-[0_18px_44px_rgba(15,30,58,.07)]">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[color:var(--color-home-line)] px-6 py-4">
            <KickerMono>Le déroulé de l’intervention</KickerMono>
            <KickerMono>48 h chrono, en moyenne</KickerMono>
          </div>
          <ol className="grid sm:grid-cols-2 lg:grid-cols-4">
            {etapes.map((etape, i) => (
              <li
                key={etape.titre}
                className="border-b border-[color:var(--color-home-line)] px-6 py-6 last:border-b-0 sm:[&:nth-last-child(-n+2)]:border-b-0 lg:border-r lg:border-b-0 lg:last:border-r-0"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="font-mono text-[11px] font-bold text-[color:var(--color-si-petrole)]">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="rounded-full bg-[color:var(--color-home-saf-bg)] px-2.5 py-1 font-mono text-[10px] font-bold text-[color:var(--color-home-saf-dark)]">
                    {etape.temps}
                  </span>
                </div>
                <h3 className="mt-5 font-[family-name:var(--font-sora)] text-[15px] font-bold text-[color:var(--color-home-ink)]">
                  {etape.titre}
                </h3>
                <p className="mt-2 text-[13px] leading-[1.6] text-[color:var(--color-home-muted-2)]">
                  {etape.detail}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
