import type { MetadataRoute } from "next";

import { carottageUrl } from "@/lib/clients/francecarottage/urls";
import { loadDepartementsFC, loadExpertises, loadVillesFC } from "@/lib/content/load-carottage";

/**
 * Sitemap France Carottage — servi sur le domaine FC (le middleware réécrit
 * `/sitemap.xml` → `/carottage/sitemap.xml` pour les hosts FC). Toutes les URLs
 * sont absolues sur `NEXT_PUBLIC_CAROTTAGE_URL` via `carottageUrl()`.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [expertises, departements, villes] = await Promise.all([
    loadExpertises(),
    loadDepartementsFC(),
    loadVillesFC(),
  ]);
  // /mentions-legales est volontairement absente : robots.txt la met en Disallow,
  // on ne l'annonce donc pas dans le sitemap (cohérence indexation).
  const statiques = ["", "/expertises", "/zones", "/devis", "/contact"];
  return [
    ...statiques.map((p) => ({ url: carottageUrl(p), changeFrequency: "monthly" as const })),
    ...expertises.map((e) => ({
      url: carottageUrl(`/expertises/${e.slug}`),
      changeFrequency: "yearly" as const,
    })),
    ...departements.map((d) => ({
      url: carottageUrl(`/zones/${d.slug}`),
      changeFrequency: "monthly" as const,
    })),
    ...villes.map((v) => ({
      url: carottageUrl(`/zones/${v.slug}`),
      changeFrequency: "monthly" as const,
    })),
  ];
}
