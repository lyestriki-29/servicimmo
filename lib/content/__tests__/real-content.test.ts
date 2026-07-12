import { describe, expect, it } from "vitest";

import { loadArticles, loadServices, loadVilles } from "@/lib/content/load";

/**
 * Charge le VRAI contenu de `content/` (pas les fixtures) — filet contre les
 * frontmatters cassés qui ne se voient qu'au build (generateStaticParams).
 * Un `:` non échappé dans un metaTitle avait passé les tests fixtures mais
 * cassait le build : ce test l'aurait attrapé.
 */
describe("contenu réel content/", () => {
  it("charge toutes les fiches services (frontmatter valide + Zod)", async () => {
    const services = await loadServices();
    expect(services.length).toBeGreaterThanOrEqual(20);
    for (const s of services) {
      expect(s.slug).toMatch(/^[a-z0-9-]+$/);
      expect(s.html.length).toBeGreaterThan(0);
    }
  });

  it("charge toutes les pages villes", async () => {
    const villes = await loadVilles();
    expect(villes.length).toBeGreaterThanOrEqual(18);
    for (const v of villes) {
      expect(v.codePostal).toMatch(/^\d{5}$/);
    }
  });

  it("charge tous les articles (YAML + dates ISO)", async () => {
    const articles = await loadArticles();
    expect(articles.length).toBeGreaterThanOrEqual(120);
    for (const a of articles) {
      expect(a.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(a.html.length).toBeGreaterThan(0);
    }
  });
});
