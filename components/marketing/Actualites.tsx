import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  BugIcon, CalendarIcon, ArrowRightIcon, FileTextIcon, GaugeIcon, HardHatIcon,
  HouseIcon, MapPinnedIcon, ShieldAlertIcon, ZapIcon, type LucideIcon,
} from "lucide-react";

import { Reveal } from "@/components/marketing/Reveal";
import { loadArticles } from "@/lib/content/load";
import type { CategorieArticle } from "@/lib/content/schemas";

/**
 * Habillage par catégorie. Les 3 photos disponibles sont des images d'AMBIANCE
 * (un thermostat, une signature, un chantier) : aucune ne montre un diagnostic.
 * On les rattache donc au thème le plus proche — jamais l'inverse. L'ancienne
 * version collait le thermostat sur « Amiante » avec un alt qui le prétendait.
 * `alt=""` car la vignette est décorative : le titre, juste dessous, porte
 * l'information. Un alt qui décrit une photo hors sujet ne fait que du bruit
 * dans un lecteur d'écran.
 * À remplacer par un `image:` propre au frontmatter quand la banque photo existera.
 */
const HABILLAGE: Record<CategorieArticle, { img: string; icone: LucideIcon }> = {
  "DPE & énergie": { img: "/img/si/blog1.jpg", icone: GaugeIcon },
  "Location & vente": { img: "/img/si/blog2.jpg", icone: FileTextIcon },
  "Profession & marché": { img: "/img/si/blog2.jpg", icone: HardHatIcon },
  "Risques naturels": { img: "/img/si/blog2.jpg", icone: MapPinnedIcon },
  Amiante: { img: "/img/si/blog3.jpg", icone: ShieldAlertIcon },
  Plomb: { img: "/img/si/blog3.jpg", icone: HouseIcon },
  Termites: { img: "/img/si/blog3.jpg", icone: BugIcon },
  "Électricité & gaz": { img: "/img/si/blog3.jpg", icone: ZapIcon },
};

/** Section Actualités & conseils (v-actualites-1) — home.html:306-359 */
export async function Actualites() {
  // Les 3 dernières publications réelles : `loadArticles` trie par date puis slug.
  const recents = (await loadArticles()).slice(0, 3);
  return (
    <section
      id="actualites"
      className="py-[72px] [background:linear-gradient(180deg,var(--color-home-bg)_0%,var(--color-home-saf-bg)_18%,var(--color-home-saf-bg)_82%,var(--color-home-bg)_100%)]"
    >
      <div className="mx-auto max-w-[var(--container,1280px)] px-6 md:px-8">

        {/* En-tête */}
        <Reveal direction="up" className="mx-auto mb-14 max-w-[660px] text-center">
          <span className="font-[family-name:var(--font-sora)] text-[13px] font-semibold tracking-[0.04em] text-[color:var(--color-home-saf-dark)]">
            Veille réglementaire
          </span>
          <h2 className="mt-4 mb-[14px] font-[family-name:var(--font-sora)] text-[clamp(30px,3.4vw,44px)] font-extrabold leading-[1.12] tracking-[-0.02em] text-[color:var(--color-home-ink)]">
            Actualités &amp; conseils diagnostic
          </h2>
          <p className="m-0 font-[family-name:var(--font-inter)] text-[17px] leading-[1.7] text-[color:var(--color-home-muted)]">
            On suit la réglementation de près pour vous. Chaque mois, nos experts décryptent les
            nouvelles obligations et leurs conséquences concrètes pour les propriétaires.
          </p>
        </Reveal>

        {/* Grille articles */}
        <div className="grid grid-cols-1 gap-[30px] md:grid-cols-3">
          {recents.map((a, i) => {
            const habillage = HABILLAGE[a.categorie];
            const Icone = habillage.icone;
            const href = `/actualites/${a.slug}`;
            return (
            <Reveal key={a.slug} direction="up" delay={i * 0.07}>
              <article className="group flex flex-col overflow-hidden rounded-[14px] border border-[color:var(--color-home-line)] bg-[color:var(--color-home-bg)] shadow-[0_2px_12px_rgba(15,30,58,.06)] transition-all duration-[350ms] hover:-translate-y-2 hover:border-transparent hover:shadow-[0_20px_60px_rgba(15,30,58,.14)]">

                {/* Vignette — `aria-hidden` + `tabIndex={-1}` : lien redondant avec
                    celui du titre, on evite de le servir 2x au clavier et au lecteur. */}
                <Link
                  href={href}
                  aria-hidden
                  tabIndex={-1}
                  className="relative block aspect-[16/10] overflow-hidden"
                >
                  <Image
                    src={habillage.img}
                    alt=""
                    fill
                    sizes="(min-width:768px) 33vw, 100vw"
                    loading="lazy"
                    className="object-cover transition-transform duration-[600ms] ease-[cubic-bezier(.22,.61,.36,1)] group-hover:scale-[1.07]"
                  />
                  <span className="absolute left-[14px] top-[14px] inline-flex items-center gap-[7px] rounded-full bg-white/90 px-[13px] py-[7px] font-[family-name:var(--font-sora)] text-[12px] font-bold tracking-[0.04em] text-[color:var(--color-home-saf-dark)] shadow-[0_2px_8px_rgba(15,30,58,.1)] backdrop-blur-[4px] [&_svg]:text-[color:var(--color-home-saf-dark)]">
                    <Icone className="h-3 w-3" aria-hidden />
                    {a.categorie}
                  </span>
                </Link>

                {/* Corps */}
                <div className="flex flex-1 flex-col px-6 py-6">
                  <time
                    dateTime={a.date}
                    className="mb-[13px] inline-flex items-center gap-2 font-[family-name:var(--font-sora)] text-[12.5px] font-semibold uppercase tracking-[0.04em] text-[color:var(--color-home-muted)] [&_svg]:text-[color:var(--color-home-saf-dark)]"
                  >
                    <CalendarIcon className="h-3 w-3" aria-hidden />
                    {format(new Date(a.date), "MMMM yyyy", { locale: fr })}
                  </time>
                  <h3 className="mb-3 font-[family-name:var(--font-sora)] text-[18.5px] font-bold leading-[1.32] text-[color:var(--color-home-ink)]">
                    <Link
                      href={href}
                      className="transition-colors hover:text-[color:var(--color-home-saf-dark)]"
                    >
                      {a.titre}
                    </Link>
                  </h3>
                  <p className="mb-5 font-[family-name:var(--font-inter)] text-[14.5px] leading-[1.65] text-[color:var(--color-home-muted)]">
                    {a.extrait}
                  </p>
                  <Link
                    href={href}
                    aria-label={`Lire l’article : ${a.titre}`}
                    className="mt-auto inline-flex items-center gap-[9px] font-[family-name:var(--font-sora)] text-[14px] font-bold text-[color:var(--color-home-saf-dark)] transition-[gap] hover:gap-[14px]"
                  >
                    Lire l&apos;article
                    <ArrowRightIcon className="h-[14px] w-[14px]" aria-hidden />
                  </Link>
                </div>
              </article>
            </Reveal>
            );
          })}
        </div>

        {/* Pied */}
        <Reveal direction="up" className="mt-[50px] text-center">
          <Link
            href="/actualites"
            className="inline-flex items-center gap-2 rounded-[10px] border border-[color:var(--color-home-line)] bg-transparent px-6 py-3.5 font-[family-name:var(--font-sora)] text-[15px] font-bold text-[color:var(--color-home-ink)] transition-all hover:border-[color:var(--color-home-saf)] hover:bg-[color:var(--color-home-saf-bg)]"
          >
            Toutes les actualités
            <ArrowRightIcon className="h-4 w-4" aria-hidden />
          </Link>
        </Reveal>

      </div>
    </section>
  );
}
