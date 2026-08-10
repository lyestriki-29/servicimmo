import Link from "next/link";

/** Le sujet filtré voyage avec la pagination : sans lui, la page 2 repartirait
 *  sur les 125 articles alors qu'on lisait une rubrique. */
function hrefPage(n: number, sujet?: string): string {
  const base = n === 1 ? "/actualites" : `/actualites/page/${n}`;
  return sujet ? `${base}?sujet=${sujet}` : base;
}

export function Pagination({
  actuelle,
  total,
  sujet,
}: {
  actuelle: number;
  total: number;
  sujet?: string;
}) {
  if (total <= 1) return null;
  const pages = Array.from({ length: total }, (_, i) => i + 1);
  return (
    <nav aria-label="Pagination des actualités" className="mt-10 flex justify-center gap-2">
      {pages.map((n) =>
        n === actuelle ? (
          <span
            key={n}
            aria-current="page"
            className="rounded-[6px] bg-[color:var(--color-si-petrole)] px-3.5 py-2 text-[14px] font-semibold text-white"
          >
            {n}
          </span>
        ) : (
          <Link
            key={n}
            href={hrefPage(n, sujet)}
            className="rounded-[6px] border border-[color:var(--color-home-line)] bg-white px-3.5 py-2 text-[14px] font-semibold text-[color:var(--color-home-slate)] hover:text-[color:var(--color-si-petrole)]"
          >
            {n}
          </Link>
        ),
      )}
    </nav>
  );
}
