import Link from "next/link";

import { JsonLd } from "@/components/seo/JsonLd";

type Segment = { label: string; href: string };

/** Origine absolue du site, utilisée pour les URLs du JSON-LD (le protocole exige des URLs absolues). */
const ORIGINE = process.env.NEXT_PUBLIC_APP_URL ?? "https://servicimmo.propulseo-site.com";

export function Ariane({ segments }: { segments: Segment[] }) {
  const tous: Segment[] = [{ label: "Accueil", href: "/" }, ...segments];
  return (
    <nav aria-label="Fil d'Ariane" className="mx-auto max-w-[var(--container,1280px)] px-6 py-4 md:px-8">
      <ol className="flex flex-wrap items-center gap-1 text-[13px] text-[color:var(--color-home-slate)]">
        {tous.map((s, i) => (
          <li key={s.href} className="flex items-center gap-1">
            {i > 0 && <span aria-hidden>›</span>}
            {i === tous.length - 1 ? (
              <span aria-current="page" className="font-semibold">{s.label}</span>
            ) : (
              <Link href={s.href} className="hover:text-[color:var(--color-si-petrole)]">{s.label}</Link>
            )}
          </li>
        ))}
      </ol>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: tous.map((s, i) => ({
            "@type": "ListItem", position: i + 1, name: s.label, item: `${ORIGINE}${s.href}`,
          })),
        }}
      />
    </nav>
  );
}
