import path from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import { getService, loadArticles, loadArticlesPage, loadServices } from "../load";
import { renderMarkdown } from "../markdown";
import {
  CATEGORIES_ARTICLE,
  SLUG_PAR_CATEGORIE,
  categorieDepuisSlug,
  hrefActualites,
} from "../schemas";

const FIXTURES = path.join(path.dirname(fileURLToPath(import.meta.url)), "fixtures");

describe("lib/content", () => {
  it("charge et trie les services par ordre", async () => {
    const services = await loadServices(FIXTURES);
    expect(services.map((s) => s.slug)).toEqual(["amiante", "dpe"]);
    expect(services[0]?.html).toContain("<h2");
  });

  it("retourne null pour un slug inconnu", async () => {
    expect(await getService("inexistant", FIXTURES)).toBeNull();
  });

  it("trie les articles par date décroissante", async () => {
    const articles = await loadArticles(FIXTURES);
    expect(articles[0]?.slug).toBe("a2");
  });

  it("pagine les articles", async () => {
    const { articles, featured, totalPages, total } = await loadArticlesPage(1, null, FIXTURES);
    expect(totalPages).toBe(1);
    expect(articles).toHaveLength(2);
    expect(total).toBe(2);
    // `featured` sort d'ici, sinon chaque route le recalcule à sa façon.
    expect(featured?.slug).toBe("a2");
  });

  it("filtre par catégorie AVANT de paginer", async () => {
    const { articles, featured, total } = await loadArticlesPage(1, "DPE & énergie", FIXTURES);
    expect(articles.map((a) => a.slug)).toEqual(["a2"]);
    expect(featured?.slug).toBe("a2");
    // `total` doit décrire le sous-ensemble filtré, pas le corpus entier :
    // c'est lui qui dit combien de pages existent pour cette rubrique.
    expect(total).toBe(1);
  });

  it("sans catégorie, ne filtre rien", async () => {
    const { total } = await loadArticlesPage(1, null, FIXTURES);
    expect(total).toBe(2);
  });

  it("compose les URLs du fil, avec et sans sujet", () => {
    expect(hrefActualites(1)).toBe("/actualites");
    expect(hrefActualites(3)).toBe("/actualites/page/3");
    expect(hrefActualites(1, "Amiante")).toBe("/actualites?sujet=amiante");
    expect(hrefActualites(2, "Amiante")).toBe("/actualites/page/2?sujet=amiante");
  });

  it("traduit les segments d'URL du filtre, et rejette les inventés", () => {
    expect(categorieDepuisSlug("dpe-energie")).toBe("DPE & énergie");
    expect(categorieDepuisSlug("electricite-gaz")).toBe("Électricité & gaz");
    expect(categorieDepuisSlug("rubrique-fantome")).toBeNull();
    expect(categorieDepuisSlug(undefined)).toBeNull();
  });

  it("donne un slug d'URL à chaque catégorie, sans doublon", () => {
    const slugs = CATEGORIES_ARTICLE.map((c) => SLUG_PAR_CATEGORIE[c]);
    expect(slugs.filter(Boolean)).toHaveLength(CATEGORIES_ARTICLE.length);
    expect(new Set(slugs).size).toBe(CATEGORIES_ARTICLE.length);
    // Un slug accentué ou espacé casserait le lien : on le vérifie ici plutôt
    // que de le découvrir sur une URL partagée.
    for (const s of slugs) expect(s).toMatch(/^[a-z0-9-]+$/);
  });

  it("rend le markdown en HTML", () => {
    expect(renderMarkdown("## Titre")).toContain("<h2");
  });

  it("échoue clairement sur un frontmatter invalide", async () => {
    await expect(loadServices(path.join(path.dirname(fileURLToPath(import.meta.url)), "fixtures-invalides"))).rejects.toThrow(
      /Frontmatter invalide/,
    );
  });
});
