import Link from "next/link";

function hrefPage(n: number): string {
  return n === 1 ? "/actualites" : `/actualites/page/${n}`;
}

export function Pagination({ actuelle, total }: { actuelle: number; total: number }) {
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
            href={hrefPage(n)}
            className="rounded-[6px] border border-[color:var(--color-home-line)] bg-white px-3.5 py-2 text-[14px] font-semibold text-[color:var(--color-home-slate)] hover:text-[color:var(--color-si-petrole)]"
          >
            {n}
          </Link>
        ),
      )}
    </nav>
  );
}
