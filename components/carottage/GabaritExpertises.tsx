import Image from "next/image";
import Link from "next/link";
import {
  ArrowRightIcon,
  BugIcon,
  ChevronRightIcon,
  FlaskConicalIcon,
  MapIcon,
  MapPinnedIcon,
  MicroscopeIcon,
  PaintRollerIcon,
  ScaleIcon,
  type LucideIcon,
} from "lucide-react";

import { ArianeFC } from "@/components/carottage/ArianeFC";
import { ReferencesFC } from "@/components/carottage/home/ReferencesFC";
import { francecarottageConfig } from "@/lib/clients/francecarottage/config";
import type { ExpertiseFC } from "@/lib/content/schemas-carottage";

/** Icône par fiche — assortie au sujet traité, à compléter si une fiche est ajoutée. */
const ICONES: Record<string, LucideIcon> = {
  "caracteriser-amiante-present-futur-chantier-notre-metier": MicroscopeIcon,
  "cartographie-detaillee-chantier-grace-au-diagnostic-amiante-hap": MapIcon,
  "diagnostic-termites-avant-deconstruction": BugIcon,
  "faites-appel-au-reseau-national-france-carottage-tous-chantiers": MapPinnedIcon,
  "garantie-connaitre-rapidement-teneur-exacte-hap-enrobes-routiers": FlaskConicalIcon,
  "maitres-ouvrage-professionnels-quelles-obligations-lors-chantiers-voirie": ScaleIcon,
  "plomb-avant-travaux-ou-deconstruction": PaintRollerIcon,
};

/**
 * Index des expertises FC — bannière centrée sur halo rouge, grille à icônes
 * rondes, bandeau références, section 50/50 texte + image chantier.
 */
export function GabaritExpertises({ expertises }: { expertises: ExpertiseFC[] }) {
  // Grille 2 colonnes dès `sm`, 3 colonnes dès `lg` : une dernière carte seule
  // dans sa rangée n'existe qu'à `n % 2 === 1` sur l'une et `n % 3 === 1` sur
  // l'autre — les deux tests sont indépendants et doivent rester séparés,
  // sinon on centre une carte à un palier où elle ne l'est pas (7 fiches : les
  // deux coïncident par coïncidence, ce que n'importe quel autre total révèle).
  const total = expertises.length;
  const orphelineSm = total % 2 === 1;
  const orphelineLg = total % 3 === 1;

  return (
    <div
      className="bg-[color:var(--fc-noir)]"
      style={{
        backgroundImage:
          "radial-gradient(1100px 850px at -5% -8%, rgba(140,22,26,0.55), rgba(74,22,20,0.25) 45%, transparent 70%)",
      }}
    >
      <section className="mx-auto max-w-3xl px-6 pb-14 pt-16 text-center md:px-8">
        <h1 className="font-[family-name:var(--font-sora)] text-[clamp(34px,4vw,52px)] font-extrabold leading-tight tracking-[-0.02em] text-white">
          Nos expertises
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-[15px] leading-relaxed text-white/65">
          Repérage amiante et HAP sur enrobés, diagnostics avant travaux ou déconstruction : le
          fond technique derrière chaque intervention, expliqué fiche par fiche.
        </p>
      </section>
      <ArianeFC segments={[{ label: "Expertises", href: "/expertises" }]} ton="clair" centre />

      <section className="mx-auto max-w-[var(--container,1280px)] px-6 pb-16 md:px-8">
        <div className="grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {expertises.map((e, i) => {
            const Icone = ICONES[e.slug] ?? MicroscopeIcon;
            const derniere = i === total - 1;
            const centrerSm = derniere && orphelineSm;
            const centrerLg = derniere && orphelineLg;
            // Chaque palier reçoit ses propres classes de centrage — y compris
            // un reset explicite quand l'autre palier, lui, n'est pas orphelin —
            // pour ne jamais laisser un centrage de `sm` fuiter jusqu'à `lg`.
            const centrage = [
              centrerSm
                ? "sm:col-span-2 sm:mx-auto sm:max-w-md sm:text-center"
                : "sm:col-span-1",
              centrerLg
                ? "lg:col-span-1 lg:col-start-2 lg:mx-auto lg:max-w-md lg:text-center"
                : "lg:col-span-1 lg:col-start-auto lg:mx-0 lg:max-w-none lg:text-left",
            ].join(" ");
            return (
              <article key={e.slug} className={`group ${centrage}`}>
                <div
                  className={`grid h-16 w-16 place-items-center rounded-full bg-[color:var(--fc-rouge)] shadow-[0_10px_26px_rgba(179,32,36,0.35)] transition-transform duration-300 group-hover:scale-105 ${
                    centrerSm || centrerLg ? "sm:mx-auto" : ""
                  }`}
                >
                  <Icone className="h-7 w-7 text-white" aria-hidden />
                </div>
                <h2 className="mt-5 font-[family-name:var(--font-sora)] text-[17px] font-bold leading-snug text-white">
                  {e.titre}
                </h2>
                <p
                  className={`mt-2.5 max-w-[46ch] text-[13.5px] leading-relaxed text-white/55 ${
                    centrerSm || centrerLg ? "sm:mx-auto" : ""
                  }`}
                >
                  {e.metaDescription}
                </p>
                <Link
                  href={`/expertises/${e.slug}`}
                  className="mt-3 inline-flex items-center gap-1 font-[family-name:var(--font-sora)] text-[13px] font-bold text-[#e9a4a6] transition-colors hover:text-white"
                >
                  Lire l’expertise
                  <ChevronRightIcon
                    className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                    aria-hidden
                  />
                </Link>
              </article>
            );
          })}
        </div>
      </section>

      <ReferencesFC />

      <section className="mx-auto max-w-[var(--container,1280px)] px-6 py-16 md:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_1fr]">
          <div>
            <h2 className="max-w-lg font-[family-name:var(--font-sora)] text-[clamp(24px,2.8vw,34px)] font-extrabold leading-[1.12] tracking-[-0.02em] text-white">
              Le repérage, expliqué avant d’être vendu.
            </h2>
            <p className="mt-4 max-w-lg text-[14.5px] leading-relaxed text-white/60">
              Chaque fiche détaille une obligation, une méthode ou un seuil réglementaire — pour
              que votre devis repose sur ce que la norme exige vraiment.
            </p>
            <ul className="mt-7 space-y-3">
              {expertises.slice(0, 5).map((e) => (
                <li key={e.slug}>
                  <Link
                    href={`/expertises/${e.slug}`}
                    className="group inline-flex items-start gap-3 text-[14px] leading-snug text-white/75 transition-colors hover:text-white"
                  >
                    <ArrowRightIcon
                      className="mt-0.5 h-4 w-4 shrink-0 text-[color:var(--fc-rouge)] [filter:brightness(1.5)] transition-transform group-hover:translate-x-0.5"
                      aria-hidden
                    />
                    {e.titre}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                href="/devis"
                className="rounded-[4px] bg-[color:var(--fc-rouge)] px-6 py-3.5 font-[family-name:var(--font-sora)] text-[13px] font-bold uppercase tracking-wide text-white transition-colors hover:bg-[color:var(--fc-rouge-fonce)]"
              >
                Devis chantier
              </Link>
              <a
                href={francecarottageConfig.contact.telephoneHref}
                className="font-[family-name:var(--font-sora)] text-[14.5px] font-bold text-white/80 transition-colors hover:text-white"
              >
                {francecarottageConfig.contact.telephone}
              </a>
            </div>
          </div>
          <figure className="relative m-0 overflow-hidden rounded-[4px] ring-1 ring-white/10">
            <Image
              src="/img/carottage/hero-chantier.jpg"
              alt="Carottage d'enrobés sur un chantier de voirie"
              width={960}
              height={640}
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="h-full w-full object-cover"
            />
            <div
              aria-hidden
              className="absolute inset-0 bg-gradient-to-t from-[color:var(--fc-noir)]/45 to-transparent"
            />
          </figure>
        </div>
      </section>
    </div>
  );
}
