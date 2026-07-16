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

  /**
   * 22 articles portent la même date. Un tri sur la seule date laisse leur ordre
   * dépendre de l'ordre de lecture du disque : la pagination differait donc entre
   * la machine de dev (Windows) et le build de prod (Linux), et un article
   * pouvait changer de page d'un build à l'autre. Le départage par slug fige
   * l'ordre — ce filet interdit d'y revenir.
   */
  it("trie les articles de façon totalement déterministe", async () => {
    const articles = await loadArticles();

    for (let i = 1; i < articles.length; i += 1) {
      const precedent = articles[i - 1]!;
      const courant = articles[i]!;
      const memeDate = precedent.date === courant.date;

      if (memeDate) {
        // À date égale, l'ordre est alphabétique par slug : aucune place au hasard.
        expect(precedent.slug.localeCompare(courant.slug, "fr")).toBeLessThan(0);
      } else {
        // Sinon, du plus récent au plus ancien.
        expect(precedent.date.localeCompare(courant.date)).toBeGreaterThan(0);
      }
    }
  });
});
