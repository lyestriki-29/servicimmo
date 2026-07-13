import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";

import { SurtitreFC } from "@/components/carottage/SurtitreFC";
import { Reveal } from "@/components/marketing/Reveal";
import { loadExpertises } from "@/lib/content/load-carottage";

/** Expertises mises en avant sur la home (maillage vers /expertises). */
const SLUGS_VEDETTES = [
  "maitres-ouvrage-professionnels-quelles-obligations-lors-chantiers-voirie",
  "cartographie-detaillee-chantier-grace-au-diagnostic-amiante-hap",
  "garantie-connaitre-rapidement-teneur-exacte-hap-enrobes-routiers",
];

/** Teaser des expertises réelles — 3 cartes + lien vers l'index. */
export async function ExpertisesTeaserFC() {
  const toutes = await loadExpertises();
  const vedettes = SLUGS_VEDETTES.map((s) => toutes.find((e) => e.slug === s)).filter(
    (e) => e !== undefined,
  );
  const expertises = vedettes.length === SLUGS_VEDETTES.length ? vedettes : toutes.slice(0, 3);

  return (
    <section className="mx-auto max-w-[var(--container,1280px)] px-6 py-14 md:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <SurtitreFC>Aller plus loin</SurtitreFC>
          <h2 className="mt-4 font-[family-name:var(--font-sora)] text-[30px] font-extrabold leading-tight tracking-[-0.02em] text-[color:var(--fc-noir)] sm:text-[38px]">
            Nos expertises, expliquées.
          </h2>
        </div>
        <Link
          href="/expertises"
          className="group inline-flex items-center gap-2 font-[family-name:var(--font-sora)] text-[14px] font-bold text-[color:var(--fc-rouge)]"
        >
          Toutes les expertises
          <ArrowRightIcon
            className="h-4 w-4 transition-transform duration-[250ms] group-hover:translate-x-1"
            aria-hidden
          />
        </Link>
      </div>
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {expertises.map((e, i) => (
          <Reveal key={e.slug} delay={Math.min(i * 0.08, 0.16)}>
            <Link
              href={`/expertises/${e.slug}`}
              className="group flex h-full flex-col border-t-2 border-[color:var(--fc-gris-clair)] bg-white p-6 transition-colors hover:border-[color:var(--fc-rouge)]"
            >
              <h3 className="font-[family-name:var(--font-sora)] text-[16px] font-bold leading-snug text-[color:var(--fc-noir)]">
                {e.titre}
              </h3>
              <p className="mt-3 flex-1 text-[13.5px] leading-relaxed text-[color:var(--fc-gris)]">
                {e.metaDescription}
              </p>
              <span className="mt-4 inline-flex items-center gap-1.5 font-[family-name:var(--font-sora)] text-[13px] font-bold text-[color:var(--fc-rouge)]">
                Lire l’expertise
                <ArrowRightIcon
                  className="h-4 w-4 transition-transform duration-[250ms] group-hover:translate-x-1"
                  aria-hidden
                />
              </span>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
