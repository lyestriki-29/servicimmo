import Link from "next/link";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { ArrowRightIcon, NewspaperIcon } from "lucide-react";

import { Pagination } from "@/components/marketing/pages/Pagination";
import { loadArticlesPage } from "@/lib/content/load";
import {
  CATEGORIES_ARTICLE,
  SLUG_PAR_CATEGORIE,
  type CategorieArticle,
} from "@/lib/content/schemas";

export async function ListeArticles({
  page,
  excludeSlug,
  categorie,
}: {
  page: number;
  excludeSlug?: string;
  categorie?: CategorieArticle | null;
}) {
  const { articles, totalPages, total } = await loadArticlesPage(page, undefined, categorie);
  const visibles = articles.filter((article) => article.slug !== excludeSlug);
  // La taxonomie est fixe : elle ne doit pas dependre des 12 articles de la page
  // courante, sinon les rubriques changent en paginant.
  const sujetActif = categorie ? SLUG_PAR_CATEGORIE[categorie] : undefined;
  return (
    <section className="bg-[color:var(--color-home-bg)]">
      <div className="mx-auto max-w-[var(--container,1280px)] px-6 py-12 md:px-8 lg:py-16">
        {/* Vrais liens et non des <span> : ces pastilles étaient purement
            décoratives — elles promettaient un tri qu'aucun clic ne déclenchait.
            Le filtre passe par l'URL (`?sujet=`), donc il est partageable,
            survit au rechargement et s'applique aux 125 articles, pas aux 12
            de la page affichée. */}
        <nav aria-label="Catégories d’actualités" className="flex flex-wrap gap-2 border-b border-[color:var(--color-home-line)] pb-6">
          {[null, ...CATEGORIES_ARTICLE].map((c) => {
            const actif = c === (categorie ?? null);
            return (
              <Link
                key={c ?? "tous"}
                href={c ? `/actualites?sujet=${SLUG_PAR_CATEGORIE[c]}` : "/actualites"}
                aria-current={actif ? "page" : undefined}
                className={`inline-flex min-h-11 items-center rounded-full px-4 text-[12.5px] font-semibold transition-colors ${actif ? "bg-[color:var(--color-home-ink)] text-white" : "bg-white text-[color:var(--color-home-ink)] hover:bg-[color:var(--color-home-saf-bg)]"}`}
              >
                {c ?? "Tous les sujets"}
              </Link>
            );
          })}
        </nav>
        <div className="mt-10 grid gap-12 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div>
            <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-[13px] font-semibold text-[color:var(--color-home-saf-dark)]">Le fil Servicimmo</p><h2 className="mt-2 font-[family-name:var(--font-sora)] text-[clamp(26px,3vw,38px)] font-extrabold tracking-[-0.025em] text-[color:var(--color-home-ink)]">{categorie ?? "Les changements à suivre maintenant"}</h2></div><p className="text-[12px] font-semibold text-[color:var(--color-home-muted-2)]">{categorie ? `${total} article${total > 1 ? "s" : ""} · page ${page}` : `Page ${page}`}</p></div>
            <div className="mt-7 divide-y divide-[color:var(--color-home-line)] border-y border-[color:var(--color-home-line)]">
              {visibles.map((article) => (
                <Link key={article.slug} href={`/actualites/${article.slug}`} className="group grid gap-5 py-7 sm:grid-cols-[120px_minmax(0,1fr)_auto] sm:items-start">
                  <time dateTime={article.date} className="text-[11.5px] font-bold text-[color:var(--color-home-saf-dark)]">{format(new Date(article.date), "d MMMM yyyy", { locale: fr })}</time>
                  <div><p className="mb-2 text-[11px] font-semibold text-[color:var(--color-si-petrole)]">{article.categorie ?? "Décryptage"}</p><h3 className="text-balance font-[family-name:var(--font-sora)] text-[19px] leading-snug font-bold text-[color:var(--color-home-ink)]">{article.titre}</h3><p className="mt-3 text-[14px] leading-relaxed text-[color:var(--color-home-muted-2)]">{article.extrait}</p></div>
                  <ArrowRightIcon className="h-4 w-4 text-[color:var(--color-si-petrole)] transition-transform group-hover:translate-x-1" />
                </Link>
              ))}
            </div>
            <Pagination actuelle={page} total={totalPages} sujet={sujetActif} />
          </div>
          <aside className="h-fit bg-[color:var(--color-si-petrole)] p-6 text-white lg:sticky lg:top-[122px]"><NewspaperIcon className="h-7 w-7 text-[color:var(--color-home-saf)]" /><p className="mt-6 text-[12px] font-bold text-[color:var(--color-home-saf)]">ALERTE RÉGLEMENTAIRE</p><h3 className="mt-3 text-balance font-[family-name:var(--font-sora)] text-[24px] leading-tight font-extrabold">Une règle change ? Vérifiez votre situation avant de publier.</h3><p className="mt-4 text-[13.5px] leading-[1.7] text-white/76">DPE, amiante, location ou travaux : notre équipe vous aide à comprendre ce qui s’applique réellement à votre bien.</p><Link href="/contact" className="mt-7 inline-flex min-h-11 items-center gap-2 bg-[color:var(--color-home-saf)] px-4 text-[12.5px] font-bold text-[color:var(--color-home-ink)]">Poser une question <ArrowRightIcon className="h-4 w-4" /></Link></aside>
        </div>
      </div>
    </section>
  );
}
