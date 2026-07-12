import Link from "next/link";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

import { Pagination } from "@/components/marketing/pages/Pagination";
import { loadArticlesPage } from "@/lib/content/load";

export async function ListeArticles({ page }: { page: number }) {
  const { articles, totalPages } = await loadArticlesPage(page);
  return (
    <section className="mx-auto max-w-[var(--container,1280px)] px-6 pb-6 md:px-8">
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {articles.map((a) => (
          <Link
            key={a.slug}
            href={`/actualites/${a.slug}`}
            className="flex h-full flex-col rounded-[14px] border border-[color:var(--color-home-line)] bg-white p-6 transition-shadow hover:shadow-[0_14px_34px_rgba(15,30,58,.08)]"
          >
            <time dateTime={a.date} className="text-[12.5px] font-semibold tracking-wide text-[color:var(--color-si-petrole)] uppercase">
              {format(new Date(a.date), "d MMMM yyyy", { locale: fr })}
            </time>
            <h2 className="mt-2 font-[family-name:var(--font-sora)] text-[16.5px] leading-snug font-bold text-[color:var(--color-home-ink)]">
              {a.titre}
            </h2>
            <p className="mt-2 flex-1 text-[14px] leading-relaxed text-[color:var(--color-home-slate)]">
              {a.extrait}
            </p>
          </Link>
        ))}
      </div>
      <Pagination actuelle={page} total={totalPages} />
    </section>
  );
}
