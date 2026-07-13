import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { GabaritDepartement } from "@/components/carottage/GabaritDepartement";
import { GabaritVille } from "@/components/carottage/GabaritVille";
import {
  getDepartementFC,
  getVilleFC,
  loadDepartementsFC,
  loadVillesFC,
} from "@/lib/content/load-carottage";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const [departements, villes] = await Promise.all([loadDepartementsFC(), loadVillesFC()]);
  return [...departements, ...villes].map((x) => ({ slug: x.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const departement = await getDepartementFC(slug);
  const cible = departement ?? (await getVilleFC(slug));
  if (!cible) return {};
  return {
    title: cible.metaTitle,
    description: cible.metaDescription,
    alternates: { canonical: `/zones/${cible.slug}` },
    openGraph: { title: cible.metaTitle, description: cible.metaDescription },
  };
}

export default async function ZonePage({ params }: Props) {
  const { slug } = await params;
  // Département prioritaire (les slugs départements et villes ne se chevauchent pas).
  const departement = await getDepartementFC(slug);
  if (departement) return <GabaritDepartement departement={departement} />;
  const ville = await getVilleFC(slug);
  if (ville) return <GabaritVille ville={ville} />;
  notFound();
}
