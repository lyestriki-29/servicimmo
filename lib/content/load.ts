/** Chargement des collections `content/` — SERVEUR UNIQUEMENT (node:fs). */
import { promises as fs } from "node:fs";
import path from "node:path";

import matter from "gray-matter";
import type { z } from "zod";

import { renderMarkdown } from "@/lib/content/markdown";
import {
  ArticleFrontmatterSchema,
  ServiceFrontmatterSchema,
  VilleFrontmatterSchema,
  type Article,
  type CategorieArticle,
  type Service,
  type Ville,
} from "@/lib/content/schemas";

const CONTENT_DIR = path.join(process.cwd(), "content");

export async function loadCollection<S extends z.ZodTypeAny>(
  dossier: string,
  schema: S,
  baseDir: string = CONTENT_DIR,
): Promise<(z.infer<S> & { html: string })[]> {
  const dir = path.join(baseDir, dossier);
  const fichiers = (await fs.readdir(dir)).filter((f) => f.endsWith(".md"));
  return Promise.all(
    fichiers.map(async (fichier) => {
      const source = await fs.readFile(path.join(dir, fichier), "utf8");
      const { data, content } = matter(source);
      const parsed = schema.safeParse(data);
      if (!parsed.success) {
        throw new Error(
          `Frontmatter invalide dans ${path.join(dir, fichier)} :\n${parsed.error.message}`,
        );
      }
      return { ...parsed.data, html: renderMarkdown(content) };
    }),
  );
}

export async function loadServices(baseDir?: string): Promise<Service[]> {
  const services = await loadCollection("services", ServiceFrontmatterSchema, baseDir);
  return services.sort((a, b) => a.ordre - b.ordre);
}

export async function getService(slug: string, baseDir?: string): Promise<Service | null> {
  return (await loadServices(baseDir)).find((s) => s.slug === slug) ?? null;
}

export async function loadVilles(baseDir?: string): Promise<Ville[]> {
  const villes = await loadCollection("villes", VilleFrontmatterSchema, baseDir);
  return villes.sort((a, b) => a.ville.localeCompare(b.ville, "fr"));
}

export async function getVille(slug: string, baseDir?: string): Promise<Ville | null> {
  return (await loadVilles(baseDir)).find((v) => v.slug === slug) ?? null;
}

export async function loadArticles(baseDir?: string): Promise<Article[]> {
  const articles = await loadCollection("articles", ArticleFrontmatterSchema, baseDir);
  // Départage par slug : 22 articles portent la même date. Sans second critère,
  // l'ordre retombe sur l'ordre de lecture du disque et diffère donc entre la
  // machine de dev (Windows) et le build de prod (Linux) — pagination instable.
  return articles.sort(
    (a, b) => b.date.localeCompare(a.date) || a.slug.localeCompare(b.slug, "fr")
  );
}

export async function getArticle(slug: string, baseDir?: string): Promise<Article | null> {
  return (await loadArticles(baseDir)).find((a) => a.slug === slug) ?? null;
}

export const ARTICLES_PAR_PAGE = 12;

/**
 * Une page d'articles, éventuellement restreinte à une catégorie.
 *
 * Le filtre s'applique AVANT la pagination : sans quoi il ne trierait que les
 * 12 articles de la page courante et annoncerait « Amiante » sur un corpus de
 * 125 — le piège déjà corrigé sur l'affichage des rubriques le 2026-07-17.
 * `totalPages` suit donc le sous-ensemble filtré.
 */
export async function loadArticlesPage(
  page: number,
  baseDir?: string,
  categorie?: CategorieArticle | null,
): Promise<{ articles: Article[]; totalPages: number; total: number }> {
  const tous = await loadArticles(baseDir);
  const retenus = categorie ? tous.filter((a) => a.categorie === categorie) : tous;
  const totalPages = Math.max(1, Math.ceil(retenus.length / ARTICLES_PAR_PAGE));
  const debut = (page - 1) * ARTICLES_PAR_PAGE;
  return {
    articles: retenus.slice(debut, debut + ARTICLES_PAR_PAGE),
    totalPages,
    total: retenus.length,
  };
}
