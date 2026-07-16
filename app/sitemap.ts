import type { MetadataRoute } from "next";

import { loadArticles, loadServices, loadVilles } from "@/lib/content/load";

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "https://servicimmo.propulseo-site.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [services, villes, articles] = await Promise.all([
    loadServices(), loadVilles(), loadArticles(),
  ]);
  const statiques = ["", "/services", "/zones", "/actualites", "/contact", "/devis", "/mentions-legales", "/cgv", "/cookies"];
  return [
    ...statiques.map((p) => ({ url: `${BASE}${p}`, changeFrequency: "monthly" as const })),
    ...services.map((s) => ({ url: `${BASE}/services/${s.slug}`, changeFrequency: "monthly" as const })),
    ...villes.map((v) => ({ url: `${BASE}/zones/${v.slug}`, changeFrequency: "monthly" as const })),
    ...articles.map((a) => ({
      url: `${BASE}/actualites/${a.slug}`,
      lastModified: a.date,
      changeFrequency: "yearly" as const,
    })),
  ];
}
