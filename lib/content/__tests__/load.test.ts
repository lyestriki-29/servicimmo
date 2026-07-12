import path from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import { getService, loadArticles, loadArticlesPage, loadServices } from "../load";
import { renderMarkdown } from "../markdown";

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
    const { articles, totalPages } = await loadArticlesPage(1, FIXTURES);
    expect(totalPages).toBe(1);
    expect(articles).toHaveLength(2);
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
