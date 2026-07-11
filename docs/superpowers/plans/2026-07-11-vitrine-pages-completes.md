# Finalisation du site vitrine — Plan d'implémentation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal :** Construire toutes les pages restantes du site vitrine Servicimmo (21 services, ~40 villes, ~100 articles reformulés, contact, légales, SEO technique complet) + une passe de polish sur la home validée.

**Architecture :** Contenu en fichiers Markdown (`content/`) validés par Zod et lus au build (`generateStaticParams`), 3 gabarits de page dans `app/(marketing)/`, scraping one-shot de l'ancien site pour récupérer les contenus, SEO (301/sitemap/JSON-LD) généré depuis les mêmes collections.

**Tech Stack :** Next.js 16 App Router, TypeScript strict, Tailwind v4, gray-matter + marked, Zod, Leaflet/react-leaflet, cheerio + turndown (script one-shot), Vitest, Playwright.

**Spec :** `docs/superpowers/specs/2026-07-11-vitrine-pages-restantes-design.md`

## Global Constraints

- Branche de travail : `feat/vitrine-pages-completes` (créée depuis `feat/vitrine-home-portage`).
- TypeScript strict, **jamais de `any`** ; `noUncheckedIndexedAccess` est actif (les accès indexés renvoient `T | undefined`).
- Path aliases `@/…` obligatoires, pas d'imports relatifs `../../`.
- Fichiers < 300 lignes ; découper en composants si un gabarit dépasse.
- UI en **français** ; identifiants de code en anglais sauf vocabulaire métier déjà en français dans le repo (`ville`, `devis`…) ; commentaires métier en français.
- Server Components par défaut ; `"use client"` uniquement si interactivité.
- **`lib/content/` est serveur uniquement** (utilise `node:fs`) : ne jamais l'importer depuis un composant `"use client"`.
- Design : continuité stricte de la home — tokens `--color-si-petrole`, `--color-si-creme`, `--color-si-lime`, `--color-home-ink`, `--color-home-slate`, `--color-home-line`, `--color-home-saf`, police `var(--font-sora)` pour les titres, conteneur `max-w-[var(--container,1280px)] px-6 md:px-8`.
- La home (`app/(marketing)/page.tsx` et ses 8 sections) **ne change pas** hors Task 21 (polish micro).
- Contenus : mots-clés SEO conservés ; articles = forme améliorée mais **faits réglementaires et dates de publication intacts**.
- Après chaque tâche : `corepack pnpm typecheck` **et** `corepack pnpm test` verts avant commit.
- Commandes via `corepack pnpm …` (pnpm 10.33). Commits conventionnels (`feat:`, `fix:`, `chore:`, `test:`, `content:` interdit → utiliser `feat(content):`).
- Ne jamais committer `.env*` ni secrets.

---

## Tranche 1 — Socle : scraping, inventaire, lib de contenu

### Task 1 : Branche + dépendances

**Files:**
- Modify: `package.json`

**Interfaces:**
- Produces : deps `gray-matter`, `marked`, `leaflet`, `react-leaflet` (runtime) ; devDeps `cheerio`, `turndown`, `@types/turndown`, `tsx`, `@types/leaflet`, `@tailwindcss/typography` ; script pnpm `scrape`.

- [ ] **Step 1 : Créer la branche**

```bash
git checkout feat/vitrine-home-portage
git checkout -b feat/vitrine-pages-completes
```

- [ ] **Step 2 : Installer les dépendances**

```bash
corepack pnpm add gray-matter marked leaflet react-leaflet
corepack pnpm add -D cheerio turndown @types/turndown tsx @types/leaflet @tailwindcss/typography
```

Note : `pnpm add marked` déplace `marked` de devDependencies vers dependencies (requis : il sert au build des pages).

- [ ] **Step 3 : Ajouter le script `scrape` dans `package.json`**

```json
"scrape": "tsx scripts/scrape-ancien-site.ts",
```

- [ ] **Step 4 : Vérifier**

Run : `corepack pnpm typecheck` — Expected : PASS (aucun code nouveau).

- [ ] **Step 5 : Commit**

```bash
git add package.json pnpm-lock.yaml
git commit -m "chore: deps contenu vitrine (gray-matter, leaflet, cheerio, turndown, typography)"
```

---

### Task 2 : Classifieur d'URLs de l'ancien site (TDD)

**Files:**
- Create: `scripts/lib/classify.ts`
- Test: `scripts/lib/__tests__/classify.test.ts`

**Interfaces:**
- Produces : `classifyUrl(url: string): UrlClassee` avec `type UrlClassee = { chemin: string; type: "ville" | "article" | "service" | "structurelle" | "inconnue"; slugPropose: string }`.

- [ ] **Step 1 : Écrire les tests qui échouent**

```ts
// scripts/lib/__tests__/classify.test.ts
import { describe, expect, it } from "vitest";

import { classifyUrl } from "../classify";

describe("classifyUrl", () => {
  it("détecte une page ville", () => {
    const r = classifyUrl("https://www.servicimmo.fr/diagnostic-immobilier-amboise-37400.html");
    expect(r).toEqual({
      chemin: "/diagnostic-immobilier-amboise-37400.html",
      type: "ville",
      slugPropose: "amboise",
    });
  });

  it("détecte une ville à nom composé", () => {
    const r = classifyUrl("https://www.servicimmo.fr/diagnostic-immobilier-joue-les-tours-37300.html");
    expect(r.type).toBe("ville");
    expect(r.slugPropose).toBe("joue-les-tours");
  });

  it("détecte un article (suffixe -i<N>.html)", () => {
    const r = classifyUrl(
      "https://www.servicimmo.fr/amiante-enrobes-bitumineux-protegez-convenablement-chantiers-i18.html",
    );
    expect(r.type).toBe("article");
    expect(r.slugPropose).toBe("amiante-enrobes-bitumineux-protegez-convenablement-chantiers");
  });

  it("détecte un service et retire le suffixe ville-cp", () => {
    const r = classifyUrl("https://www.servicimmo.fr/amiante-avant-travaux-tours-37000.html");
    expect(r.type).toBe("service");
    expect(r.slugPropose).toBe("amiante-avant-travaux");
  });

  it("classe la racine en structurelle", () => {
    expect(classifyUrl("https://www.servicimmo.fr/").type).toBe("structurelle");
  });

  it("classe le reste en inconnue", () => {
    expect(classifyUrl("https://www.servicimmo.fr/wp-admin/foo").type).toBe("inconnue");
  });
});
```

- [ ] **Step 2 : Vérifier l'échec**

Run : `corepack pnpm vitest run scripts/lib/__tests__/classify.test.ts`
Expected : FAIL — `Cannot find module '../classify'`.

- [ ] **Step 3 : Implémenter**

```ts
// scripts/lib/classify.ts
/** Classement heuristique des anciennes URLs servicimmo.fr (validé au palier inventaire). */

export type UrlType = "ville" | "article" | "service" | "structurelle" | "inconnue";

export type UrlClassee = {
  chemin: string;
  type: UrlType;
  /** Slug proposé pour la nouvelle route — retouché à la main dans le mapping si besoin. */
  slugPropose: string;
};

const CHEMINS_STRUCTURELS = new Set([
  "/",
  "/index.html",
  "/contact.html",
  "/mentions-legales.html",
  "/cgv.html",
  "/demande-devis.php",
]);

export function classifyUrl(url: string): UrlClassee {
  const chemin = new URL(url).pathname.toLowerCase();

  if (CHEMINS_STRUCTURELS.has(chemin)) {
    return { chemin, type: "structurelle", slugPropose: "" };
  }

  const ville = chemin.match(/^\/diagnostic-immobilier-([a-z0-9-]+)-\d{5}\.html$/);
  if (ville?.[1]) {
    return { chemin, type: "ville", slugPropose: ville[1] };
  }

  const article = chemin.match(/^\/([a-z0-9-]+)-i\d+\.html$/);
  if (article?.[1]) {
    return { chemin, type: "article", slugPropose: article[1] };
  }

  const service = chemin.match(/^\/([a-z0-9-]+)\.html$/);
  if (service?.[1]) {
    // retire un éventuel suffixe « -<ville>-<cp> » (ex: amiante-avant-travaux-tours-37000)
    const slugPropose = service[1].replace(/-[a-z]+(?:-[a-z]+)*-\d{5}$/, "");
    return { chemin, type: "service", slugPropose };
  }

  return { chemin, type: "inconnue", slugPropose: "" };
}
```

- [ ] **Step 4 : Vérifier le vert**

Run : `corepack pnpm vitest run scripts/lib/__tests__/classify.test.ts`
Expected : PASS (6 tests).

- [ ] **Step 5 : Commit**

```bash
git add scripts/lib/classify.ts scripts/lib/__tests__/classify.test.ts
git commit -m "feat(scrape): classifieur des anciennes URLs (ville/article/service)"
```

---

### Task 3 : Script d'inventaire de l'ancien site

**Files:**
- Create: `scripts/scrape-ancien-site.ts`
- Create (généré, non commité tant que non relu) : `scripts/out/inventaire.md`, `scripts/out/mapping-services.json`

**Interfaces:**
- Consumes : `classifyUrl` (Task 2).
- Produces : commande `corepack pnpm scrape inventaire` ; fichier `scripts/out/mapping-services.json` de forme `Record<string /* slugPropose */, string /* slug final */>`.

- [ ] **Step 1 : Implémenter le mode `inventaire`**

```ts
// scripts/scrape-ancien-site.ts
/**
 * Script one-shot — aspiration de l'ancien servicimmo.fr.
 * Usage :
 *   corepack pnpm scrape inventaire   → scripts/out/inventaire.md + mapping-services.json (brouillon)
 *   corepack pnpm scrape extraction   → content/** bruts + lib/seo/redirects.json + rapport
 * Jamais exécuté dans le build Next.
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { classifyUrl, type UrlClassee } from "./lib/classify";

const SITEMAP = "https://www.servicimmo.fr/sitemap.xml";
const OUT_DIR = path.join(process.cwd(), "scripts", "out");

async function chargerUrls(): Promise<string[]> {
  const res = await fetch(SITEMAP);
  if (!res.ok) throw new Error(`sitemap HTTP ${res.status}`);
  const xml = await res.text();
  return [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].flatMap((m) => (m[1] ? [m[1]] : []));
}

function tableau(urls: UrlClassee[]): string {
  return urls.map((u) => `| \`${u.chemin}\` | ${u.slugPropose} |`).join("\n");
}

async function inventaire(): Promise<void> {
  const urls = (await chargerUrls()).map(classifyUrl);
  const par = (t: UrlClassee["type"]) => urls.filter((u) => u.type === t);

  const md = [
    `# Inventaire ancien site — ${urls.length} URLs`,
    ...(["ville", "article", "service", "structurelle", "inconnue"] as const).flatMap((t) => [
      `\n## ${t} (${par(t).length})\n`,
      "| Ancienne URL | Slug proposé |",
      "|---|---|",
      tableau(par(t)),
    ]),
    "\n## À faire au palier humain",
    "- Fusionner les slugs services dupliqués dans `mapping-services.json` (cible : 21 pages).",
    "- Décider une destination 301 pour chaque URL `inconnue`.",
  ].join("\n");

  await mkdir(OUT_DIR, { recursive: true });
  await writeFile(path.join(OUT_DIR, "inventaire.md"), md, "utf8");

  // Brouillon de mapping service : identité, à retoucher à la main.
  const mapping = Object.fromEntries(par("service").map((u) => [u.slugPropose, u.slugPropose]));
  await writeFile(
    path.join(OUT_DIR, "mapping-services.json"),
    JSON.stringify(mapping, null, 2),
    "utf8",
  );
  console.log(`inventaire.md écrit — ${urls.length} URLs classées`);
}

const mode = process.argv[2];
if (mode === "inventaire") {
  await inventaire();
} else if (mode === "extraction") {
  const { extraction } = await import("./lib/extraction");
  await extraction();
} else {
  console.error("Usage : pnpm scrape <inventaire|extraction>");
  process.exit(1);
}
```

- [ ] **Step 2 : Exécuter**

Run : `corepack pnpm scrape inventaire`
Expected : `inventaire.md écrit — ~193 URLs classées` ; `scripts/out/inventaire.md` liste les 5 groupes avec des comptes plausibles (~40 villes, ~100 articles, ~20 services, peu d'inconnues).

- [ ] **Step 3 : Typecheck + tests puis commit du script**

```bash
corepack pnpm typecheck && corepack pnpm test
git add scripts/scrape-ancien-site.ts
git commit -m "feat(scrape): inventaire classé de l'ancien site depuis son sitemap"
```

---

### 🔶 PALIER HUMAIN 1 — Inventaire (bloquant)

Présenter à Etienne : les comptes par type, la liste des services avec slugs proposés, les URLs `inconnues`. Il tranche :
1. le **mapping final des services** (fusion des doublons → 21 slugs cibles) → éditer `scripts/out/mapping-services.json` ;
2. la destination 301 des `inconnues` (par défaut : la page de rubrique la plus proche).

Committer ensuite l'inventaire validé :

```bash
git add scripts/out/inventaire.md scripts/out/mapping-services.json
git commit -m "docs(scrape): inventaire valide + mapping services (palier 1)"
```

---

### Task 4 : Extraction du contenu → Markdown bruts + redirects.json

**Files:**
- Create: `scripts/lib/extraction.ts`
- Create (générés) : `content/services/*.md`, `content/villes/*.md`, `content/articles/*.md`, `lib/seo/redirects.json`, `scripts/out/rapport-extraction.md`

**Interfaces:**
- Consumes : `classifyUrl`, `scripts/out/mapping-services.json` (palier 1).
- Produces : fichiers Markdown avec frontmatter **complet par défauts** (le build passe même en contenu brut) + flag `brut: true` ; `lib/seo/redirects.json` de forme `{ source: string; destination: string }[]`.

- [ ] **Step 1 : Implémenter l'extraction**

```ts
// scripts/lib/extraction.ts
/** Extraction one-shot : HTML ancien site → Markdown bruts + redirections. */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import * as cheerio from "cheerio";
import matter from "gray-matter";
import TurndownService from "turndown";

import { classifyUrl, type UrlClassee } from "./classify";

const BASE = "https://www.servicimmo.fr";
const OUT = path.join(process.cwd(), "scripts", "out");
const CONTENT = path.join(process.cwd(), "content");
const turndown = new TurndownService({ headingStyle: "atx" });
const attendre = (ms: number) => new Promise((r) => setTimeout(r, ms));

type Redirection = { source: string; destination: string };

function extraireHtmlPrincipal($: cheerio.CheerioAPI): string {
  $("header, nav, footer, script, style, iframe").remove();
  for (const sel of ["#contenu", "#content", ".contenu", ".content", "main"]) {
    const el = $(sel).first();
    if (el.length && el.text().trim().length > 400) return el.html() ?? "";
  }
  // fallback : plus gros bloc textuel de la page (site en tableaux)
  let meilleur = "";
  let taille = 0;
  $("td, div, article").each((_, el) => {
    const t = $(el).text().trim();
    if (t.length > taille) {
      taille = t.length;
      meilleur = $(el).html() ?? "";
    }
  });
  return meilleur;
}

async function geocoder(ville: string, cp: string): Promise<{ lat: number; lng: number }> {
  const url = `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(ville)}&postcode=${cp}&type=municipality&limit=1`;
  const json = (await (await fetch(url)).json()) as {
    features?: { geometry: { coordinates: [number, number] } }[];
  };
  const c = json.features?.[0]?.geometry.coordinates;
  return c ? { lat: c[1], lng: c[0] } : { lat: 47.394, lng: 0.687 }; // fallback : Tours
}

function extraireDateFr(texte: string): string | null {
  const m = texte.match(/(\d{1,2})[/. ](\d{1,2}|[a-zûé]+)[/. ](\d{4})/i);
  if (!m?.[1] || !m[3]) return null;
  const mois = [
    "janvier", "février", "mars", "avril", "mai", "juin",
    "juillet", "août", "septembre", "octobre", "novembre", "décembre",
  ];
  const num = /^\d+$/.test(m[2] ?? "") ? Number(m[2]) : mois.indexOf((m[2] ?? "").toLowerCase()) + 1;
  if (num < 1 || num > 12) return null;
  return `${m[3]}-${String(num).padStart(2, "0")}-${String(Number(m[1])).padStart(2, "0")}`;
}

export async function extraction(): Promise<void> {
  const mapping = JSON.parse(
    await readFile(path.join(OUT, "mapping-services.json"), "utf8"),
  ) as Record<string, string>;

  const xml = await (await fetch(`${BASE}/sitemap.xml`)).text();
  const urls = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)]
    .flatMap((m) => (m[1] ? [m[1]] : []))
    .map(classifyUrl);

  const redirections: Redirection[] = [];
  const anomalies: string[] = [];
  const dejaVus = new Map<string, UrlClassee[]>(); // slug final → anciennes URLs (services fusionnés)

  for (const dossier of ["services", "villes", "articles"]) {
    await mkdir(path.join(CONTENT, dossier), { recursive: true });
  }

  for (const u of urls) {
    if (u.type === "structurelle" || u.type === "inconnue") continue;
    await attendre(300);
    const res = await fetch(`${BASE}${u.chemin}`, {
      headers: { "user-agent": "PropulseoScraper/1.0 (migration servicimmo.fr)" },
    });
    if (!res.ok) {
      anomalies.push(`HTTP ${res.status} — ${u.chemin}`);
      continue;
    }
    const $ = cheerio.load(await res.text());
    const titre = $("h1").first().text().trim() || $("title").text().trim();
    const metaTitle = $("title").text().trim();
    const metaDescription = $('meta[name="description"]').attr("content")?.trim() ?? "";
    const corpsMd = turndown.turndown(extraireHtmlPrincipal($));
    if (corpsMd.length < 300) anomalies.push(`Extraction courte (<300 c) — ${u.chemin}`);

    if (u.type === "ville") {
      const cp = u.chemin.match(/-(\d{5})\.html$/)?.[1] ?? "37000";
      const nomVille = titre.replace(/diagnostic immobilier/i, "").trim() || u.slugPropose;
      const { lat, lng } = await geocoder(nomVille, cp);
      const fm = {
        slug: u.slugPropose, ville: nomVille, codePostal: cp,
        metaTitle, metaDescription: metaDescription || `Diagnostic immobilier à ${nomVille} (${cp}).`,
        anciennesUrls: [u.chemin], lat, lng, brut: true,
      };
      await writeFile(path.join(CONTENT, "villes", `${u.slugPropose}.md`), matter.stringify(corpsMd, fm), "utf8");
      redirections.push({ source: u.chemin, destination: `/zones/${u.slugPropose}` });
    } else if (u.type === "article") {
      const date = extraireDateFr($("body").text()) ?? "2017-01-01";
      if (date === "2017-01-01") anomalies.push(`Date introuvable (défaut 2017-01-01) — ${u.chemin}`);
      const fm = {
        slug: u.slugPropose, titre, date,
        metaTitle, metaDescription: metaDescription || titre,
        anciennesUrls: [u.chemin], extrait: metaDescription || titre, archive: false, brut: true,
      };
      await writeFile(path.join(CONTENT, "articles", `${u.slugPropose}.md`), matter.stringify(corpsMd, fm), "utf8");
      redirections.push({ source: u.chemin, destination: `/actualites/${u.slugPropose}` });
    } else {
      const slugFinal = mapping[u.slugPropose] ?? u.slugPropose;
      redirections.push({ source: u.chemin, destination: `/services/${slugFinal}` });
      const existants = dejaVus.get(slugFinal) ?? [];
      dejaVus.set(slugFinal, [...existants, u]);
      if (existants.length > 0) continue; // fusion : on garde le contenu de la 1re URL
      const fm = {
        slug: slugFinal, titre, metaTitle,
        metaDescription: metaDescription || titre,
        anciennesUrls: [u.chemin], ordre: 99, icone: "file-text",
        extrait: (metaDescription || titre).slice(0, 140), obligatoirePour: [], brut: true,
      };
      await writeFile(path.join(CONTENT, "services", `${slugFinal}.md`), matter.stringify(corpsMd, fm), "utf8");
    }
  }

  // Fusion services : reporter toutes les anciennes URLs dans le frontmatter
  for (const [slugFinal, sources] of dejaVus) {
    if (sources.length < 2) continue;
    const fichier = path.join(CONTENT, "services", `${slugFinal}.md`);
    const { data, content } = matter(await readFile(fichier, "utf8"));
    data["anciennesUrls"] = sources.map((s) => s.chemin);
    await writeFile(fichier, matter.stringify(content, data), "utf8");
  }

  await mkdir(path.join(process.cwd(), "lib", "seo"), { recursive: true });
  await writeFile(
    path.join(process.cwd(), "lib", "seo", "redirects.json"),
    JSON.stringify(redirections, null, 2),
    "utf8",
  );
  await writeFile(
    path.join(OUT, "rapport-extraction.md"),
    [`# Rapport extraction — ${redirections.length} redirections`, "", "## Anomalies", ...anomalies.map((a) => `- ${a}`)].join("\n"),
    "utf8",
  );
  console.log(`Extraction finie : ${redirections.length} redirections, ${anomalies.length} anomalies`);
}
```

- [ ] **Step 2 : Exécuter**

Run : `corepack pnpm scrape extraction` (durée ~2 min, 300 ms entre requêtes)
Expected : `Extraction finie : ~190 redirections, <15 anomalies`. Vérifier : `content/villes` ≈ 40 fichiers, `content/articles` ≈ 100, `content/services` = nombre de slugs cibles du mapping.

- [ ] **Step 3 : Traiter les anomalies**

Ouvrir `scripts/out/rapport-extraction.md`. Pour chaque « extraction courte » : ouvrir la page d'origine dans le navigateur, copier le contenu manquant à la main dans le fichier Markdown. Pour chaque « date introuvable » : retrouver la date sur la page listing actualités de l'ancien site, corriger le frontmatter.

- [ ] **Step 4 : Ajouter les redirections structurelles et inconnues à la main**

Dans `lib/seo/redirects.json`, ajouter (destinations des `inconnues` = décision du palier 1) :

```json
{ "source": "/index.html", "destination": "/" },
{ "source": "/contact.html", "destination": "/contact" },
{ "source": "/mentions-legales.html", "destination": "/mentions-legales" },
{ "source": "/cgv.html", "destination": "/cgv" },
{ "source": "/demande-devis.php", "destination": "/devis" }
```

- [ ] **Step 5 : Commit**

```bash
corepack pnpm typecheck && corepack pnpm test
git add scripts/lib/extraction.ts content/ lib/seo/redirects.json scripts/out/rapport-extraction.md
git commit -m "feat(scrape): extraction des contenus bruts + redirections 301"
```

---

### Task 5 : Schémas Zod des collections (TDD)

**Files:**
- Create: `lib/content/schemas.ts`
- Test: `lib/content/__tests__/schemas.test.ts`

**Interfaces:**
- Produces : `ServiceFrontmatterSchema`, `VilleFrontmatterSchema`, `ArticleFrontmatterSchema` (Zod) ; types `Service`, `Ville`, `Article` = frontmatter + `{ html: string }`.

- [ ] **Step 1 : Tests qui échouent**

```ts
// lib/content/__tests__/schemas.test.ts
import { describe, expect, it } from "vitest";

import {
  ArticleFrontmatterSchema,
  ServiceFrontmatterSchema,
  VilleFrontmatterSchema,
} from "../schemas";

const serviceValide = {
  slug: "dpe", titre: "DPE", metaTitle: "DPE Tours (37) | Servicimmo",
  metaDescription: "Diagnostic de performance énergétique à Tours : obligations, validité, tarifs. Devis en 2 minutes avec Servicimmo, certifié depuis 1998.",
  anciennesUrls: ["/dpe-tours-37000.html"], ordre: 1, icone: "gauge",
  extrait: "Le diagnostic énergie obligatoire pour vendre ou louer.",
  obligatoirePour: ["vente", "location"],
};

describe("schemas de contenu", () => {
  it("accepte un service valide", () => {
    expect(ServiceFrontmatterSchema.parse(serviceValide).slug).toBe("dpe");
  });

  it("refuse un slug avec majuscules", () => {
    expect(() => ServiceFrontmatterSchema.parse({ ...serviceValide, slug: "DPE" })).toThrow();
  });

  it("refuse une metaDescription trop courte", () => {
    expect(() =>
      ServiceFrontmatterSchema.parse({ ...serviceValide, metaDescription: "court" }),
    ).toThrow();
  });

  it("valide une ville avec coordonnées", () => {
    const ville = VilleFrontmatterSchema.parse({
      slug: "tours", ville: "Tours", codePostal: "37000",
      metaTitle: "Diagnostic immobilier Tours (37000) | Servicimmo",
      metaDescription: "Tous vos diagnostics immobiliers à Tours : DPE, amiante, plomb, termites. Intervention sous 48 h, devis gratuit en ligne.",
      anciennesUrls: [], lat: 47.39, lng: 0.68,
    });
    expect(ville.codePostal).toBe("37000");
  });

  it("valide un article avec date ISO et défauts", () => {
    const a = ArticleFrontmatterSchema.parse({
      slug: "dpe-2026", titre: "DPE 2026", date: "2026-01-15",
      metaTitle: "DPE 2026 : ce qui change | Servicimmo",
      metaDescription: "Le point complet sur les évolutions du DPE en 2026 : audit énergétique, interdictions de location, calendrier et obligations.",
      anciennesUrls: ["/dpe-2026-i42.html"], extrait: "Le point sur le DPE 2026.",
    });
    expect(a.archive).toBe(false);
    expect(a.brut).toBe(false);
  });

  it("refuse une date non ISO", () => {
    expect(() =>
      ArticleFrontmatterSchema.parse({
        slug: "x", titre: "x", date: "15/01/2026",
        metaTitle: "x", metaDescription: "d".repeat(120), anciennesUrls: [], extrait: "x",
      }),
    ).toThrow();
  });
});
```

- [ ] **Step 2 : Vérifier l'échec**

Run : `corepack pnpm vitest run lib/content/__tests__/schemas.test.ts` — Expected : FAIL (module absent).

- [ ] **Step 3 : Implémenter**

```ts
// lib/content/schemas.ts
/** Frontmatter des collections `content/` — un frontmatter invalide CASSE le build. */
import { z } from "zod";

const slug = z.string().regex(/^[a-z0-9-]+$/, "slug kebab-case attendu");
const meta = {
  metaTitle: z.string().min(10).max(70),
  metaDescription: z.string().min(80).max(180),
  anciennesUrls: z.array(z.string().startsWith("/")).default([]),
  /** true tant que le contenu scrapé n'a pas été modernisé (doit être false en prod). */
  brut: z.boolean().default(false),
};

export const ServiceFrontmatterSchema = z.object({
  slug,
  titre: z.string().min(1),
  ...meta,
  ordre: z.number().int().positive(),
  /** Nom d'icône du mapping components/marketing/pages/icones.ts */
  icone: z.string().min(1),
  extrait: z.string().min(10).max(160),
  obligatoirePour: z.array(z.enum(["vente", "location", "travaux", "demolition"])).default([]),
  dureeValidite: z.string().optional(),
});

export const VilleFrontmatterSchema = z.object({
  slug,
  ville: z.string().min(1),
  codePostal: z.string().regex(/^\d{5}$/),
  ...meta,
  lat: z.number().gte(46).lte(49),
  lng: z.number().gte(-1).lte(2),
});

export const ArticleFrontmatterSchema = z.object({
  slug,
  titre: z.string().min(1),
  /** Date de publication ORIGINALE, jamais modifiée à la reformulation. */
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  ...meta,
  extrait: z.string().min(10).max(200),
  categorie: z.string().optional(),
  archive: z.boolean().default(false),
  /** Une phrase affichée dans l'encadré archive, si archive: true. */
  archiveNote: z.string().optional(),
});

export type ServiceFrontmatter = z.infer<typeof ServiceFrontmatterSchema>;
export type VilleFrontmatter = z.infer<typeof VilleFrontmatterSchema>;
export type ArticleFrontmatter = z.infer<typeof ArticleFrontmatterSchema>;

export type Service = ServiceFrontmatter & { html: string };
export type Ville = VilleFrontmatter & { html: string };
export type Article = ArticleFrontmatter & { html: string };
```

Note : les fichiers bruts issus de Task 4 portent `brut: true`, `ordre: 99`, `metaDescription` parfois courte → si le parse échoue sur du brut, allonger la description dans le fichier concerné (c'est le but : le build force la qualité).

- [ ] **Step 4 : Vérifier le vert puis commit**

```bash
corepack pnpm vitest run lib/content/__tests__/schemas.test.ts
git add lib/content/schemas.ts lib/content/__tests__/schemas.test.ts
git commit -m "feat(content): schemas Zod des collections services/villes/articles"
```

---

### Task 6 : Loaders de contenu + rendu Markdown (TDD)

**Files:**
- Create: `lib/content/markdown.ts`, `lib/content/load.ts`
- Test: `lib/content/__tests__/load.test.ts` + fixtures `lib/content/__tests__/fixtures/{services,villes,articles}/*.md`

**Interfaces:**
- Consumes : schémas Task 5.
- Produces (contrat pour tous les gabarits) :
  - `loadServices(baseDir?): Promise<Service[]>` (tri `ordre` croissant)
  - `getService(slug: string): Promise<Service | null>`
  - `loadVilles(baseDir?): Promise<Ville[]>` (tri alphabétique `ville`)
  - `getVille(slug: string): Promise<Ville | null>`
  - `loadArticles(baseDir?): Promise<Article[]>` (tri `date` décroissante)
  - `getArticle(slug: string): Promise<Article | null>`
  - `ARTICLES_PAR_PAGE = 12` ; `loadArticlesPage(page: number): Promise<{ articles: Article[]; totalPages: number }>`
  - `renderMarkdown(md: string): string`

- [ ] **Step 1 : Fixtures + tests qui échouent**

Créer `lib/content/__tests__/fixtures/services/dpe.md` :

```markdown
---
slug: dpe
titre: DPE
metaTitle: "DPE Tours (37) | Servicimmo"
metaDescription: "Diagnostic de performance énergétique à Tours : obligations, validité, tarifs. Devis en 2 minutes avec Servicimmo, certifié depuis 1998."
anciennesUrls: ["/dpe-tours-37000.html"]
ordre: 2
icone: gauge
extrait: "Le diagnostic énergie obligatoire pour vendre ou louer."
obligatoirePour: [vente, location]
---

## Pourquoi un DPE ?

Contenu de test.
```

Créer de même `fixtures/services/amiante.md` (`ordre: 1`), `fixtures/villes/tours.md`, `fixtures/articles/a1.md` (`date: 2020-01-01`), `fixtures/articles/a2.md` (`date: 2024-06-01`) — mêmes gabarits, valeurs distinctes valides.

```ts
// lib/content/__tests__/load.test.ts
import path from "node:path";

import { describe, expect, it } from "vitest";

import { getService, loadArticles, loadArticlesPage, loadServices } from "../load";
import { renderMarkdown } from "../markdown";

const FIXTURES = path.join(__dirname, "fixtures");

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
    await expect(loadServices(path.join(__dirname, "fixtures-invalides"))).rejects.toThrow(
      /Frontmatter invalide/,
    );
  });
});
```

Créer aussi `lib/content/__tests__/fixtures-invalides/services/casse.md` avec `slug: "MAJUSCULE"`.

- [ ] **Step 2 : Vérifier l'échec** — `corepack pnpm vitest run lib/content/__tests__/load.test.ts` → FAIL.

- [ ] **Step 3 : Implémenter**

```ts
// lib/content/markdown.ts
import { marked } from "marked";

/** Rendu Markdown → HTML (contenu first-party uniquement, jamais de saisie utilisateur). */
export function renderMarkdown(md: string): string {
  return marked.parse(md, { async: false });
}
```

```ts
// lib/content/load.ts
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
  type Service,
  type Ville,
} from "@/lib/content/schemas";

const CONTENT_DIR = path.join(process.cwd(), "content");

async function loadCollection<S extends z.ZodTypeAny>(
  dossier: "services" | "villes" | "articles",
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
          `Frontmatter invalide dans content/${dossier}/${fichier} :\n${parsed.error.message}`,
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
  return articles.sort((a, b) => b.date.localeCompare(a.date));
}

export async function getArticle(slug: string, baseDir?: string): Promise<Article | null> {
  return (await loadArticles(baseDir)).find((a) => a.slug === slug) ?? null;
}

export const ARTICLES_PAR_PAGE = 12;

export async function loadArticlesPage(
  page: number,
  baseDir?: string,
): Promise<{ articles: Article[]; totalPages: number }> {
  const tous = await loadArticles(baseDir);
  const totalPages = Math.max(1, Math.ceil(tous.length / ARTICLES_PAR_PAGE));
  const debut = (page - 1) * ARTICLES_PAR_PAGE;
  return { articles: tous.slice(debut, debut + ARTICLES_PAR_PAGE), totalPages };
}
```

- [ ] **Step 4 : Vert + build complet**

```bash
corepack pnpm vitest run lib/content
corepack pnpm typecheck && corepack pnpm test
```

Expected : PASS. Si `loadServices()` sans argument casse sur les contenus bruts (metaDescription trop courte…), corriger les fichiers `content/` concernés maintenant.

- [ ] **Step 5 : Commit**

```bash
git add lib/content
git commit -m "feat(content): loaders valides Zod + rendu markdown + pagination"
```

---

## Tranche 2 — Pages Services

### Task 7 : Composants transverses des pages intérieures

**Files:**
- Create: `components/seo/JsonLd.tsx`, `components/marketing/pages/PageHero.tsx`, `components/marketing/pages/Ariane.tsx`, `components/marketing/pages/CtaDevis.tsx`, `components/marketing/pages/icones.ts`
- Modify: `app/globals.css` (plugin typography + styles prose)

**Interfaces:**
- Produces :
  - `JsonLd({ data }: { data: Record<string, unknown> })`
  - `PageHero({ surtitre?, titre, description?, children? })`
  - `Ariane({ segments }: { segments: { label: string; href: string }[] })` (rend aussi le JSON-LD BreadcrumbList)
  - `CtaDevis({ titre?, sousTitre? })` (client, ouvre la modale questionnaire)
  - `ICONES: Record<string, LucideIcon>` + `iconeOuDefaut(nom: string): LucideIcon`
  - classe CSS `.article-prose` pour les corps Markdown

- [ ] **Step 1 : JsonLd**

```tsx
// components/seo/JsonLd.tsx
/** Injecte un bloc de données structurées schema.org. */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
```

- [ ] **Step 2 : PageHero**

```tsx
// components/marketing/pages/PageHero.tsx
import type { ReactNode } from "react";

type PageHeroProps = {
  surtitre?: string;
  titre: string;
  description?: string;
  children?: ReactNode;
};

/** Bandeau d'en-tête pétrole des pages intérieures — continuité du header 2 niveaux. */
export function PageHero({ surtitre, titre, description, children }: PageHeroProps) {
  return (
    <section className="bg-[color:var(--color-si-petrole)]">
      <div className="mx-auto max-w-[var(--container,1280px)] px-6 py-14 md:px-8 md:py-16">
        {surtitre && (
          <p className="font-[family-name:var(--font-sora)] text-[13px] font-semibold tracking-[0.14em] text-[color:var(--color-si-lime)] uppercase">
            {surtitre}
          </p>
        )}
        <h1 className="mt-2 font-[family-name:var(--font-sora)] text-[30px] leading-tight font-bold text-white sm:text-[38px]">
          {titre}
        </h1>
        {description && <p className="mt-4 max-w-2xl text-[15.5px] leading-relaxed text-[#bfe0e2]">{description}</p>}
        {children}
      </div>
    </section>
  );
}
```

- [ ] **Step 3 : Ariane (fil + BreadcrumbList)**

```tsx
// components/marketing/pages/Ariane.tsx
import Link from "next/link";

import { JsonLd } from "@/components/seo/JsonLd";

type Segment = { label: string; href: string };

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
            "@type": "ListItem", position: i + 1, name: s.label, item: s.href,
          })),
        }}
      />
    </nav>
  );
}
```

- [ ] **Step 4 : CtaDevis (client)**

```tsx
// components/marketing/pages/CtaDevis.tsx
"use client";

import { useQuoteModal } from "@/components/questionnaire/QuoteModalProvider";

type CtaDevisProps = { titre?: string; sousTitre?: string };

/** Bloc CTA pétrole — unique tunnel de conversion, présent sur chaque page intérieure. */
export function CtaDevis({
  titre = "Quels diagnostics pour votre bien ?",
  sousTitre = "Réponse en 2 minutes — devis gratuit, sans engagement, sous 2 h ouvrées.",
}: CtaDevisProps) {
  const { open } = useQuoteModal();
  return (
    <section className="mx-auto max-w-[var(--container,1280px)] px-6 py-14 md:px-8">
      <div className="rounded-[14px] bg-[color:var(--color-si-petrole)] px-8 py-10 text-center">
        <h2 className="font-[family-name:var(--font-sora)] text-[24px] font-bold text-white sm:text-[27px]">
          {titre}
        </h2>
        <p className="mt-2 text-[15px] text-[#bfe0e2]">{sousTitre}</p>
        <button
          type="button"
          onClick={open}
          className="mt-6 inline-flex items-center rounded-[6px] bg-[color:var(--color-home-saf)] px-[26px] py-[14px] font-[family-name:var(--font-sora)] text-[15px] font-semibold text-[color:var(--color-home-ink)] transition-opacity hover:opacity-90"
        >
          Demander un devis
        </button>
      </div>
    </section>
  );
}
```

Vérifier la signature réelle de `useQuoteModal` dans `components/questionnaire/QuoteModalProvider.tsx` (le Header appelle `const { open } = useQuoteModal()`).

- [ ] **Step 5 : Mapping d'icônes**

```ts
// components/marketing/pages/icones.ts
import {
  BugIcon, FileTextIcon, FlameIcon, GaugeIcon, HardHatIcon, HouseIcon,
  MapPinnedIcon, RulerIcon, ShieldAlertIcon, ZapIcon, type LucideIcon,
} from "lucide-react";

/** Icônes autorisées dans le frontmatter `icone:` des services. */
export const ICONES: Record<string, LucideIcon> = {
  gauge: GaugeIcon,          // DPE
  "shield-alert": ShieldAlertIcon, // amiante
  bug: BugIcon,              // termites / parasites
  flame: FlameIcon,          // gaz
  zap: ZapIcon,              // électricité
  ruler: RulerIcon,          // Carrez / Boutin
  "hard-hat": HardHatIcon,   // avant travaux / démolition
  "map-pinned": MapPinnedIcon, // ERP
  house: HouseIcon,          // plomb / habitat
  "file-text": FileTextIcon, // défaut
};

export function iconeOuDefaut(nom: string): LucideIcon {
  return ICONES[nom] ?? FileTextIcon;
}
```

- [ ] **Step 6 : Typography plugin + styles prose dans `app/globals.css`**

Ajouter en tête de fichier (après les imports existants) :

```css
@plugin "@tailwindcss/typography";
```

Et en fin de fichier :

```css
/* Corps d'article des pages intérieures (services, villes, actualités) */
.article-prose {
  font-size: 15.5px;
  line-height: 1.75;
  color: var(--color-home-slate);
}
.article-prose h2,
.article-prose h3 {
  font-family: var(--font-sora);
  color: var(--color-si-petrole);
}
.article-prose a {
  color: var(--color-si-petrole);
  text-decoration: underline;
}
.article-prose strong {
  color: var(--color-home-ink);
}
```

- [ ] **Step 7 : Typecheck + commit**

```bash
corepack pnpm typecheck && corepack pnpm test
git add components/seo components/marketing/pages app/globals.css
git commit -m "feat(marketing): composants transverses pages interieures (hero, ariane, cta, jsonld)"
```

---

### Task 8 : Catalogue `/services`

**Files:**
- Modify: `app/(marketing)/services/page.tsx` (remplace le stub)

**Interfaces:**
- Consumes : `loadServices`, `PageHero`, `CtaDevis`, `Ariane`, `iconeOuDefaut`, `Reveal`.

- [ ] **Step 1 : Implémenter la page**

```tsx
// app/(marketing)/services/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";

import { Ariane } from "@/components/marketing/pages/Ariane";
import { CtaDevis } from "@/components/marketing/pages/CtaDevis";
import { PageHero } from "@/components/marketing/pages/PageHero";
import { iconeOuDefaut } from "@/components/marketing/pages/icones";
import { Reveal } from "@/components/marketing/Reveal";
import { loadServices } from "@/lib/content/load";

export const metadata: Metadata = {
  title: "Diagnostics immobiliers : nos services | Servicimmo",
  description:
    "DPE, amiante, plomb, termites, gaz, électricité, Carrez, ERP… tous les diagnostics immobiliers réalisés par Servicimmo à Tours et en Indre-et-Loire.",
  alternates: { canonical: "/services" },
};

export default async function ServicesIndexPage() {
  const services = await loadServices();
  return (
    <>
      <PageHero
        surtitre="Nos services"
        titre="Tous les diagnostics immobiliers"
        description="Cabinet certifié à Tours depuis 1998 — chaque diagnostic est réalisé par un technicien certifié et couvert par notre assurance Allianz."
      />
      <Ariane segments={[{ label: "Services", href: "/services" }]} />
      <section className="mx-auto max-w-[var(--container,1280px)] px-6 pb-6 md:px-8">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service, i) => {
            const Icone = iconeOuDefaut(service.icone);
            return (
              <Reveal key={service.slug} delay={Math.min(i * 0.05, 0.3)}>
                <Link
                  href={`/services/${service.slug}`}
                  className="group flex h-full flex-col rounded-[14px] border border-[color:var(--color-home-line)] bg-white p-6 transition-shadow hover:shadow-[0_14px_34px_rgba(15,30,58,.08)]"
                >
                  <Icone className="h-7 w-7 text-[color:var(--color-si-petrole)]" aria-hidden />
                  <h2 className="mt-4 font-[family-name:var(--font-sora)] text-[17px] font-bold text-[color:var(--color-home-ink)]">
                    {service.titre}
                  </h2>
                  <p className="mt-2 flex-1 text-[14px] leading-relaxed text-[color:var(--color-home-slate)]">
                    {service.extrait}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-1 font-[family-name:var(--font-sora)] text-[13.5px] font-semibold text-[color:var(--color-si-petrole)]">
                    En savoir plus
                    <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden />
                  </span>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </section>
      <CtaDevis />
    </>
  );
}
```

- [ ] **Step 2 : Vérifier en local**

```bash
corepack pnpm typecheck
corepack pnpm dev
```

Ouvrir `http://localhost:3000/services` (MCP Playwright) : grille complète, icônes, hover, mobile 375 px. Screenshot avant/après.

- [ ] **Step 3 : Commit**

```bash
git add "app/(marketing)/services/page.tsx"
git commit -m "feat(services): catalogue des diagnostics depuis content/"
```

---

### Task 9 : Gabarit `/services/[slug]`

**Files:**
- Create: `app/(marketing)/services/[slug]/page.tsx`, `components/marketing/pages/ServicesLies.tsx`

**Interfaces:**
- Consumes : `getService`, `loadServices`, composants Task 7.
- Produces : `ServicesLies({ slugActuel }: { slugActuel: string })` (3 cartes max).

- [ ] **Step 1 : ServicesLies**

```tsx
// components/marketing/pages/ServicesLies.tsx
import Link from "next/link";

import { iconeOuDefaut } from "@/components/marketing/pages/icones";
import { loadServices } from "@/lib/content/load";

/** Maillage interne : 3 autres services, par ordre du catalogue. */
export async function ServicesLies({ slugActuel }: { slugActuel: string }) {
  const services = (await loadServices()).filter((s) => s.slug !== slugActuel).slice(0, 3);
  if (services.length === 0) return null;
  return (
    <section className="mx-auto max-w-[var(--container,1280px)] px-6 py-10 md:px-8">
      <h2 className="font-[family-name:var(--font-sora)] text-[20px] font-bold text-[color:var(--color-home-ink)]">
        Autres diagnostics
      </h2>
      <div className="mt-5 grid gap-4 sm:grid-cols-3">
        {services.map((s) => {
          const Icone = iconeOuDefaut(s.icone);
          return (
            <Link
              key={s.slug}
              href={`/services/${s.slug}`}
              className="flex items-start gap-3 rounded-[12px] border border-[color:var(--color-home-line)] bg-white p-4 transition-shadow hover:shadow-[0_10px_24px_rgba(15,30,58,.07)]"
            >
              <Icone className="mt-[2px] h-5 w-5 shrink-0 text-[color:var(--color-si-petrole)]" aria-hidden />
              <span className="font-[family-name:var(--font-sora)] text-[14.5px] font-semibold text-[color:var(--color-home-ink)]">
                {s.titre}
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
```

- [ ] **Step 2 : Page service**

```tsx
// app/(marketing)/services/[slug]/page.tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BadgeCheckIcon, CalendarClockIcon } from "lucide-react";

import { Ariane } from "@/components/marketing/pages/Ariane";
import { CtaDevis } from "@/components/marketing/pages/CtaDevis";
import { PageHero } from "@/components/marketing/pages/PageHero";
import { ServicesLies } from "@/components/marketing/pages/ServicesLies";
import { JsonLd } from "@/components/seo/JsonLd";
import { getService, loadServices } from "@/lib/content/load";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return (await loadServices()).map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const service = await getService(slug);
  if (!service) return {};
  return {
    title: service.metaTitle,
    description: service.metaDescription,
    alternates: { canonical: `/services/${service.slug}` },
    openGraph: { title: service.metaTitle, description: service.metaDescription },
  };
}

const LIBELLES: Record<string, string> = {
  vente: "Vente", location: "Location", travaux: "Avant travaux", demolition: "Avant démolition",
};

export default async function ServicePage({ params }: Props) {
  const { slug } = await params;
  const service = await getService(slug);
  if (!service) notFound();

  return (
    <>
      <PageHero surtitre="Diagnostic" titre={service.titre} description={service.extrait}>
        <div className="mt-5 flex flex-wrap gap-2">
          {service.obligatoirePour.map((cas) => (
            <span
              key={cas}
              className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[12.5px] font-semibold text-white"
            >
              <BadgeCheckIcon className="h-3.5 w-3.5 text-[color:var(--color-si-lime)]" aria-hidden />
              Obligatoire · {LIBELLES[cas] ?? cas}
            </span>
          ))}
          {service.dureeValidite && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[12.5px] font-semibold text-white">
              <CalendarClockIcon className="h-3.5 w-3.5 text-[color:var(--color-si-lime)]" aria-hidden />
              Validité : {service.dureeValidite}
            </span>
          )}
        </div>
      </PageHero>
      <Ariane
        segments={[
          { label: "Services", href: "/services" },
          { label: service.titre, href: `/services/${service.slug}` },
        ]}
      />
      <article
        className="article-prose mx-auto max-w-3xl px-6 pb-4 md:px-8"
        dangerouslySetInnerHTML={{ __html: service.html }}
      />
      <ServicesLies slugActuel={service.slug} />
      <CtaDevis
        titre={`Besoin d'un ${service.titre} ?`}
        sousTitre="Notre questionnaire vérifie en 2 minutes les diagnostics obligatoires pour votre projet."
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Service",
          name: service.titre,
          description: service.metaDescription,
          provider: { "@type": "LocalBusiness", name: "Servicimmo", telephone: "+33247470123" },
          areaServed: "Indre-et-Loire",
        }}
      />
    </>
  );
}
```

- [ ] **Step 3 : Vérifier en local**

`corepack pnpm typecheck` puis ouvrir 3 pages services (dont une fusionnée multi-URLs). Vérifier : hero, badges, prose stylée, services liés, CTA ouvre la modale. Screenshots desktop + 375 px.

- [ ] **Step 4 : Commit**

```bash
git add "app/(marketing)/services/[slug]" components/marketing/pages/ServicesLies.tsx
git commit -m "feat(services): gabarit page service (hero, prose, maillage, jsonld)"
```

---

### Task 10 : Modernisation des 21 contenus services

**Files:**
- Modify: `content/services/*.md` (tous)

**Process (pas de code applicatif) :**

- [ ] **Step 1 : Établir la table de référence des champs**

Lire `lib/core/diagnostics/rules.ts` et `QUESTIONNAIRE_FLOW.md` §4-5 : ce sont les **sources de vérité internes** pour `obligatoirePour`, `dureeValidite` et l'ordre logique du catalogue (DPE en 1, amiante 2, plomb 3, termites 4, gaz 5, électricité 6, Carrez/Boutin 7-8, ERP 9, puis spécifiques travaux/démolition). Ne jamais inventer une durée de validité : si elle n'est pas dans ces fichiers, la chercher sur service-public.fr et la citer en commentaire de commit.

- [ ] **Step 2 : Moderniser par lots de 7 (3 lots), via sous-agents**

Prompt type à donner à chaque sous-agent (un fichier par agent) :

```
Modernise le fichier content/services/<slug>.md du site Servicimmo (diagnostiqueur immobilier, Tours).
Règles impératives :
1. Structure cible du corps : ## Qu'est-ce que le <diagnostic> ? / ## Qui est concerné ? /
   ## Comment se déroule l'intervention ? / ## Validité et obligations — adapte les intertitres
   au contenu réel, ne crée pas de section vide.
2. Conserve TOUS les mots-clés SEO du texte source (noms de diagnostics, villes, termes réglementaires).
3. Ne modifie aucun fait réglementaire ; les durées de validité viennent de la table de référence fournie.
4. Frontmatter : renseigne ordre, icone (choisir dans components/marketing/pages/icones.ts),
   extrait (≤160 c), obligatoirePour, dureeValidite ; metaTitle ≤65 c avec mot-clé + « | Servicimmo » ;
   metaDescription 120-160 c, incitative. Supprime la clé `brut`.
5. Ton : professionnel, rassurant, pédagogique — vouvoiement, phrases courtes.
6. Le schéma lib/content/schemas.ts fait foi : le build casse si le frontmatter est invalide.
Rends UNIQUEMENT le fichier complet réécrit.
```

- [ ] **Step 3 : Après chaque lot** — relire intégralement 2 fichiers du lot (orchestrateur), puis :

```bash
corepack pnpm test && corepack pnpm typecheck
git add content/services
git commit -m "feat(content): modernise les services (lot N/3)"
```

- [ ] **Step 4 : Vérification finale de tranche**

```bash
grep -rl "brut: true" content/services || echo "OK: plus aucun service brut"
```

Expected : `OK`. Puis relire 5 pages dans le navigateur (rendu final), screenshots pour Etienne (non bloquant).

---

## Tranche 3 — Pages Villes

### Task 11 : Carte Leaflet de la zone d'intervention

**Files:**
- Create: `components/marketing/pages/CarteZone.tsx`, `components/marketing/pages/CarteZoneInterne.tsx`

**Interfaces:**
- Produces : `CarteZone({ villes, hauteur? }: { villes: PointVille[]; hauteur?: number })` avec `export type PointVille = { slug: string; ville: string; lat: number; lng: number }`. Server-safe (wrapper client + import dynamique sans SSR).

- [ ] **Step 1 : Wrapper client**

```tsx
// components/marketing/pages/CarteZone.tsx
"use client";

import dynamic from "next/dynamic";

export type PointVille = { slug: string; ville: string; lat: number; lng: number };

const CarteZoneInterne = dynamic(() => import("./CarteZoneInterne"), {
  ssr: false,
  loading: () => (
    <div className="h-[420px] animate-pulse rounded-[14px] bg-[color:var(--color-home-line)]" aria-hidden />
  ),
});

/** Carte de la zone d'intervention (37 + limitrophes) — Leaflet chargé côté client uniquement. */
export function CarteZone({ villes, hauteur = 420 }: { villes: PointVille[]; hauteur?: number }) {
  return <CarteZoneInterne villes={villes} hauteur={hauteur} />;
}
```

- [ ] **Step 2 : Carte interne**

```tsx
// components/marketing/pages/CarteZoneInterne.tsx
"use client";

import Link from "next/link";
import { CircleMarker, MapContainer, Popup, TileLayer } from "react-leaflet";

import "leaflet/dist/leaflet.css";

import type { PointVille } from "./CarteZone";

const CENTRE_37: [number, number] = [47.3, 0.68];

export default function CarteZoneInterne({
  villes,
  hauteur,
}: {
  villes: PointVille[];
  hauteur: number;
}) {
  return (
    <MapContainer
      center={CENTRE_37}
      zoom={9}
      scrollWheelZoom={false}
      style={{ height: hauteur }}
      className="z-0 rounded-[14px]"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {villes.map((v) => (
        <CircleMarker
          key={v.slug}
          center={[v.lat, v.lng]}
          radius={7}
          pathOptions={{ color: "#0e5a5e", fillColor: "#0e5a5e", fillOpacity: 0.85 }}
        >
          <Popup>
            <Link href={`/zones/${v.slug}`}>Diagnostic immobilier à {v.ville}</Link>
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}
```

Note : remplacer `#0e5a5e` par la valeur réelle de `--color-si-petrole` lue dans `app/globals.css` (Leaflet ne lit pas les variables CSS dans `pathOptions`).

- [ ] **Step 3 : Typecheck + commit**

```bash
corepack pnpm typecheck
git add components/marketing/pages/CarteZone.tsx components/marketing/pages/CarteZoneInterne.tsx
git commit -m "feat(zones): carte Leaflet de la zone d'intervention"
```

---

### Task 12 : Pages `/zones` et `/zones/[slug]`

**Files:**
- Modify: `app/(marketing)/zones/page.tsx` (remplace le stub)
- Create: `app/(marketing)/zones/[slug]/page.tsx`, `components/marketing/pages/VillesVoisines.tsx`

**Interfaces:**
- Consumes : `loadVilles`, `getVille`, `loadServices`, `CarteZone`, composants Task 7.
- Produces : `VillesVoisines({ villeActuelle }: { villeActuelle: Ville })` (4 villes les plus proches, distance haversine).

- [ ] **Step 1 : Index `/zones`**

```tsx
// app/(marketing)/zones/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { MapPinIcon } from "lucide-react";

import { Ariane } from "@/components/marketing/pages/Ariane";
import { CarteZone } from "@/components/marketing/pages/CarteZone";
import { CtaDevis } from "@/components/marketing/pages/CtaDevis";
import { PageHero } from "@/components/marketing/pages/PageHero";
import { loadVilles } from "@/lib/content/load";

export const metadata: Metadata = {
  title: "Zones d'intervention en Indre-et-Loire (37) | Servicimmo",
  description:
    "Servicimmo intervient à Tours et dans toute l'Indre-et-Loire : Amboise, Joué-lès-Tours, Chambray, Fondettes… Trouvez votre ville et obtenez un devis en 2 minutes.",
  alternates: { canonical: "/zones" },
};

export default async function ZonesIndexPage() {
  const villes = await loadVilles();
  return (
    <>
      <PageHero
        surtitre="Zones d'intervention"
        titre="Vos diagnostics partout en Indre-et-Loire"
        description="Basés à Tours, nous intervenons sous 48 h dans tout le département et les communes limitrophes."
      />
      <Ariane segments={[{ label: "Zones d'intervention", href: "/zones" }]} />
      <section className="mx-auto max-w-[var(--container,1280px)] px-6 pb-4 md:px-8">
        <CarteZone villes={villes.map(({ slug, ville, lat, lng }) => ({ slug, ville, lat, lng }))} />
      </section>
      <section className="mx-auto max-w-[var(--container,1280px)] px-6 py-10 md:px-8">
        <h2 className="font-[family-name:var(--font-sora)] text-[20px] font-bold text-[color:var(--color-home-ink)]">
          Toutes nos villes d'intervention
        </h2>
        <ul className="mt-5 grid gap-x-6 gap-y-2 sm:grid-cols-2 lg:grid-cols-4">
          {villes.map((v) => (
            <li key={v.slug}>
              <Link
                href={`/zones/${v.slug}`}
                className="inline-flex items-center gap-2 py-1 text-[14.5px] text-[color:var(--color-home-slate)] hover:text-[color:var(--color-si-petrole)]"
              >
                <MapPinIcon className="h-4 w-4 text-[color:var(--color-si-petrole)]" aria-hidden />
                {v.ville} ({v.codePostal})
              </Link>
            </li>
          ))}
        </ul>
      </section>
      <CtaDevis />
    </>
  );
}
```

- [ ] **Step 2 : VillesVoisines (haversine)**

```tsx
// components/marketing/pages/VillesVoisines.tsx
import Link from "next/link";

import { loadVilles } from "@/lib/content/load";
import type { Ville } from "@/lib/content/schemas";

function distanceKm(a: Ville, b: Ville): number {
  const rad = (d: number) => (d * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat);
  const dLng = rad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.sqrt(h));
}

/** Maillage interne : les 4 villes couvertes les plus proches. */
export async function VillesVoisines({ villeActuelle }: { villeActuelle: Ville }) {
  const voisines = (await loadVilles())
    .filter((v) => v.slug !== villeActuelle.slug)
    .sort((a, b) => distanceKm(villeActuelle, a) - distanceKm(villeActuelle, b))
    .slice(0, 4);
  if (voisines.length === 0) return null;
  return (
    <section className="mx-auto max-w-[var(--container,1280px)] px-6 py-10 md:px-8">
      <h2 className="font-[family-name:var(--font-sora)] text-[20px] font-bold text-[color:var(--color-home-ink)]">
        Nous intervenons aussi à proximité
      </h2>
      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {voisines.map((v) => (
          <Link
            key={v.slug}
            href={`/zones/${v.slug}`}
            className="rounded-[12px] border border-[color:var(--color-home-line)] bg-white p-4 font-[family-name:var(--font-sora)] text-[14.5px] font-semibold text-[color:var(--color-home-ink)] transition-shadow hover:shadow-[0_10px_24px_rgba(15,30,58,.07)]"
          >
            {v.ville} ({v.codePostal})
          </Link>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 3 : Gabarit `/zones/[slug]`**

```tsx
// app/(marketing)/zones/[slug]/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Ariane } from "@/components/marketing/pages/Ariane";
import { CtaDevis } from "@/components/marketing/pages/CtaDevis";
import { PageHero } from "@/components/marketing/pages/PageHero";
import { VillesVoisines } from "@/components/marketing/pages/VillesVoisines";
import { iconeOuDefaut } from "@/components/marketing/pages/icones";
import { JsonLd } from "@/components/seo/JsonLd";
import { getVille, loadServices, loadVilles } from "@/lib/content/load";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return (await loadVilles()).map((v) => ({ slug: v.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const ville = await getVille(slug);
  if (!ville) return {};
  return {
    title: ville.metaTitle,
    description: ville.metaDescription,
    alternates: { canonical: `/zones/${ville.slug}` },
    openGraph: { title: ville.metaTitle, description: ville.metaDescription },
  };
}

export default async function VillePage({ params }: Props) {
  const { slug } = await params;
  const ville = await getVille(slug);
  if (!ville) notFound();
  const services = (await loadServices()).slice(0, 6);

  return (
    <>
      <PageHero
        surtitre="Zone d'intervention"
        titre={`Diagnostic immobilier à ${ville.ville} (${ville.codePostal})`}
        description={`Vente, location, travaux : nos techniciens certifiés interviennent à ${ville.ville} sous 48 h.`}
      />
      <Ariane
        segments={[
          { label: "Zones d'intervention", href: "/zones" },
          { label: ville.ville, href: `/zones/${ville.slug}` },
        ]}
      />
      <article
        className="article-prose mx-auto max-w-3xl px-6 pb-4 md:px-8"
        dangerouslySetInnerHTML={{ __html: ville.html }}
      />
      <section className="mx-auto max-w-[var(--container,1280px)] px-6 py-10 md:px-8">
        <h2 className="font-[family-name:var(--font-sora)] text-[20px] font-bold text-[color:var(--color-home-ink)]">
          Nos diagnostics à {ville.ville}
        </h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s) => {
            const Icone = iconeOuDefaut(s.icone);
            return (
              <Link
                key={s.slug}
                href={`/services/${s.slug}`}
                className="flex items-start gap-3 rounded-[12px] border border-[color:var(--color-home-line)] bg-white p-4 transition-shadow hover:shadow-[0_10px_24px_rgba(15,30,58,.07)]"
              >
                <Icone className="mt-[2px] h-5 w-5 shrink-0 text-[color:var(--color-si-petrole)]" aria-hidden />
                <span className="font-[family-name:var(--font-sora)] text-[14.5px] font-semibold text-[color:var(--color-home-ink)]">
                  {s.titre}
                </span>
              </Link>
            );
          })}
        </div>
      </section>
      <VillesVoisines villeActuelle={ville} />
      <CtaDevis
        titre={`Un diagnostic à ${ville.ville} ?`}
        sousTitre="Décrivez votre bien en 2 minutes, recevez votre devis sous 2 h ouvrées."
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Service",
          name: `Diagnostic immobilier à ${ville.ville}`,
          description: ville.metaDescription,
          provider: { "@type": "LocalBusiness", name: "Servicimmo", telephone: "+33247470123" },
          areaServed: { "@type": "City", name: ville.ville, postalCode: ville.codePostal },
        }}
      />
    </>
  );
}
```

- [ ] **Step 4 : Vérifier en local** — `/zones` (carte + liste), 3 pages villes. Screenshots desktop + mobile.

- [ ] **Step 5 : Commit**

```bash
git add "app/(marketing)/zones" components/marketing/pages/VillesVoisines.tsx
git commit -m "feat(zones): index carte + gabarit page ville avec maillage"
```

---

### Task 13 : Modernisation différenciée des ~40 contenus villes

**Files:**
- Modify: `content/villes/*.md` (tous)

- [ ] **Step 1 : Lots de 10 via sous-agents (4 lots)** — prompt type :

```
Modernise le fichier content/villes/<slug>.md (page SEO locale Servicimmo, diagnostiqueur à Tours).
Règles impératives :
1. INTERDICTION de réutiliser des phrases d'une autre ville : chaque page doit être une rédaction
   originale (anti duplicate content). Varie structure, angles et formulations.
2. N'INVENTE AUCUN fait local (monument, quartier, chiffre) : utilise uniquement ce que dit le texte
   source. Si le texte source est pauvre, reste factuel (distance de Tours, délais, diagnostics
   courants pour ce type de commune) en variant la formulation.
3. Conserve les mots-clés SEO : « diagnostic immobilier <ville> », noms de diagnostics.
4. Corps : 250-400 mots, 2-3 intertitres ##.
5. Frontmatter : metaTitle ≤65 c (« Diagnostic immobilier <Ville> (<CP>) | Servicimmo »),
   metaDescription 120-160 c originale, conserver lat/lng/codePostal/anciennesUrls tels quels.
   Supprime la clé `brut`.
Rends UNIQUEMENT le fichier complet réécrit.
```

- [ ] **Step 2 : Contrôle anti-duplication après chaque lot**

```bash
# aucune phrase de 8+ mots ne doit apparaître dans 2 fichiers villes
corepack pnpm tsx -e "
import { readFileSync, readdirSync } from 'node:fs';
const dir = 'content/villes';
const phrases = new Map();
for (const f of readdirSync(dir)) {
  const corps = readFileSync(\`\${dir}/\${f}\`, 'utf8').split('---').slice(2).join('---');
  for (const p of corps.split(/[.!?]/)) {
    const clef = p.trim().toLowerCase();
    if (clef.split(/\s+/).length >= 8) {
      if (phrases.has(clef)) console.log('DOUBLON:', f, '<->', phrases.get(clef), '::', clef.slice(0, 80));
      phrases.set(clef, f);
    }
  }
}
console.log('scan fini');"
```

Expected : `scan fini` sans ligne `DOUBLON`. Corriger toute collision avant de committer le lot.

- [ ] **Step 3 : Commit par lot**

```bash
corepack pnpm test && corepack pnpm typecheck
git add content/villes
git commit -m "feat(content): modernise les pages villes (lot N/4)"
```

- [ ] **Step 4 : Fin de tranche** — `grep -rl "brut: true" content/villes` vide ; relire 5 pages en navigateur.

---

## Tranche 4 — Actualités

### Task 14 : Gabarits liste, pagination et article

**Files:**
- Modify: `app/(marketing)/actualites/page.tsx` (remplace le stub)
- Create: `app/(marketing)/actualites/page/[n]/page.tsx`, `app/(marketing)/actualites/[slug]/page.tsx`, `components/marketing/pages/ListeArticles.tsx`, `components/marketing/pages/Pagination.tsx`

**Interfaces:**
- Consumes : `loadArticlesPage`, `getArticle`, `loadArticles`, `ARTICLES_PAR_PAGE`, composants Task 7 ; `date-fns` (`format`, locale `fr`).
- Produces : `ListeArticles({ page }: { page: number })` (liste + pagination rendues), `Pagination({ actuelle, total }: { actuelle: number; total: number })`.

- [ ] **Step 1 : Pagination**

```tsx
// components/marketing/pages/Pagination.tsx
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
```

- [ ] **Step 2 : ListeArticles**

```tsx
// components/marketing/pages/ListeArticles.tsx
import Link from "next/link";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

import { Pagination } from "@/components/marketing/pages/Pagination";
import { loadArticlesPage } from "@/lib/content/load";

export async function ListeArticles({ page }: { page: number }) {
  const { articles, totalPages } = await loadArticlesPage(page);
  return (
    <section className="mx-auto max-w-[var(--container,1280px)] px-6 pb-6 md:px-8">
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {articles.map((a) => (
          <Link
            key={a.slug}
            href={`/actualites/${a.slug}`}
            className="flex h-full flex-col rounded-[14px] border border-[color:var(--color-home-line)] bg-white p-6 transition-shadow hover:shadow-[0_14px_34px_rgba(15,30,58,.08)]"
          >
            <time dateTime={a.date} className="text-[12.5px] font-semibold tracking-wide text-[color:var(--color-si-petrole)] uppercase">
              {format(new Date(a.date), "d MMMM yyyy", { locale: fr })}
            </time>
            <h2 className="mt-2 font-[family-name:var(--font-sora)] text-[16.5px] leading-snug font-bold text-[color:var(--color-home-ink)]">
              {a.titre}
            </h2>
            <p className="mt-2 flex-1 text-[14px] leading-relaxed text-[color:var(--color-home-slate)]">
              {a.extrait}
            </p>
          </Link>
        ))}
      </div>
      <Pagination actuelle={page} total={totalPages} />
    </section>
  );
}
```

- [ ] **Step 3 : Index + pages paginées**

```tsx
// app/(marketing)/actualites/page.tsx
import type { Metadata } from "next";

import { Ariane } from "@/components/marketing/pages/Ariane";
import { CtaDevis } from "@/components/marketing/pages/CtaDevis";
import { ListeArticles } from "@/components/marketing/pages/ListeArticles";
import { PageHero } from "@/components/marketing/pages/PageHero";

export const metadata: Metadata = {
  title: "Actualités du diagnostic immobilier | Servicimmo",
  description:
    "Veille réglementaire depuis 2017 : DPE, amiante, plomb, termites, copropriété… Suivez les évolutions du diagnostic immobilier avec Servicimmo.",
  alternates: { canonical: "/actualites" },
};

export default function ActualitesIndexPage() {
  return (
    <>
      <PageHero
        surtitre="Actualités"
        titre="La veille réglementaire du diagnostic"
        description="Depuis 2017, nous décryptons les évolutions réglementaires pour les propriétaires, bailleurs et professionnels de l'immobilier."
      />
      <Ariane segments={[{ label: "Actualités", href: "/actualites" }]} />
      <ListeArticles page={1} />
      <CtaDevis />
    </>
  );
}
```

```tsx
// app/(marketing)/actualites/page/[n]/page.tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Ariane } from "@/components/marketing/pages/Ariane";
import { ListeArticles } from "@/components/marketing/pages/ListeArticles";
import { PageHero } from "@/components/marketing/pages/PageHero";
import { ARTICLES_PAR_PAGE, loadArticles } from "@/lib/content/load";

type Props = { params: Promise<{ n: string }> };

export async function generateStaticParams() {
  const total = Math.ceil((await loadArticles()).length / ARTICLES_PAR_PAGE);
  return Array.from({ length: Math.max(0, total - 1) }, (_, i) => ({ n: String(i + 2) }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { n } = await params;
  return {
    title: `Actualités du diagnostic immobilier — page ${n} | Servicimmo`,
    alternates: { canonical: `/actualites/page/${n}` },
  };
}

export default async function ActualitesPageN({ params }: Props) {
  const { n } = await params;
  const page = Number(n);
  const total = Math.ceil((await loadArticles()).length / ARTICLES_PAR_PAGE);
  if (!Number.isInteger(page) || page < 2 || page > total) notFound();
  return (
    <>
      <PageHero surtitre="Actualités" titre={`Veille réglementaire — page ${page}`} />
      <Ariane segments={[{ label: "Actualités", href: "/actualites" }]} />
      <ListeArticles page={page} />
    </>
  );
}
```

- [ ] **Step 4 : Gabarit article (avec encadré archive)**

```tsx
// app/(marketing)/actualites/[slug]/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { ArchiveIcon } from "lucide-react";

import { Ariane } from "@/components/marketing/pages/Ariane";
import { CtaDevis } from "@/components/marketing/pages/CtaDevis";
import { JsonLd } from "@/components/seo/JsonLd";
import { getArticle, loadArticles } from "@/lib/content/load";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return (await loadArticles()).map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) return {};
  return {
    title: article.metaTitle,
    description: article.metaDescription,
    alternates: { canonical: `/actualites/${article.slug}` },
    openGraph: {
      title: article.metaTitle,
      description: article.metaDescription,
      type: "article",
      publishedTime: article.date,
    },
  };
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) notFound();

  const recents = (await loadArticles()).filter((a) => a.slug !== article.slug).slice(0, 3);

  return (
    <>
      <Ariane
        segments={[
          { label: "Actualités", href: "/actualites" },
          { label: article.titre, href: `/actualites/${article.slug}` },
        ]}
      />
      <article className="mx-auto max-w-3xl px-6 pb-6 md:px-8">
        <time dateTime={article.date} className="text-[13px] font-semibold tracking-wide text-[color:var(--color-si-petrole)] uppercase">
          {format(new Date(article.date), "d MMMM yyyy", { locale: fr })}
        </time>
        <h1 className="mt-2 font-[family-name:var(--font-sora)] text-[28px] leading-tight font-bold text-[color:var(--color-home-ink)] sm:text-[34px]">
          {article.titre}
        </h1>
        {article.archive && (
          <aside className="mt-6 flex items-start gap-3 rounded-[12px] border-l-4 border-[color:var(--color-home-saf)] bg-[color:var(--color-si-creme)] p-4">
            <ArchiveIcon className="mt-[2px] h-5 w-5 shrink-0 text-[color:var(--color-home-ink)]" aria-hidden />
            <p className="text-[14px] leading-relaxed text-[color:var(--color-home-slate)]">
              <strong>Article d'archive</strong> — la réglementation a évolué depuis sa publication.
              {article.archiveNote ? ` ${article.archiveNote}` : ""}
            </p>
          </aside>
        )}
        <div className="article-prose mt-8" dangerouslySetInnerHTML={{ __html: article.html }} />
      </article>
      <section className="mx-auto max-w-[var(--container,1280px)] px-6 py-10 md:px-8">
        <h2 className="font-[family-name:var(--font-sora)] text-[20px] font-bold text-[color:var(--color-home-ink)]">
          À lire aussi
        </h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          {recents.map((a) => (
            <Link
              key={a.slug}
              href={`/actualites/${a.slug}`}
              className="rounded-[12px] border border-[color:var(--color-home-line)] bg-white p-4 font-[family-name:var(--font-sora)] text-[14.5px] leading-snug font-semibold text-[color:var(--color-home-ink)] transition-shadow hover:shadow-[0_10px_24px_rgba(15,30,58,.07)]"
            >
              {a.titre}
            </Link>
          ))}
        </div>
      </section>
      <CtaDevis />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: article.titre,
          datePublished: article.date,
          description: article.metaDescription,
          author: { "@type": "Organization", name: "Servicimmo" },
        }}
      />
    </>
  );
}
```

- [ ] **Step 5 : Vérifier en local** — liste, page 2, un article normal, un article `archive: true` (en créer un temporairement si aucun). Screenshots.

- [ ] **Step 6 : Commit**

```bash
git add "app/(marketing)/actualites" components/marketing/pages/ListeArticles.tsx components/marketing/pages/Pagination.tsx
git commit -m "feat(actualites): liste paginee + gabarit article avec encadre archive"
```

---

### Task 15 : Reformulation des ~100 articles

**Files:**
- Modify: `content/articles/*.md` (tous)

- [ ] **Step 1 : Lots de 10 via sous-agents (10 lots)** — prompt type :

```
Reformule l'article content/articles/<slug>.md du blog Servicimmo (veille réglementaire diagnostic immobilier).
Règles impératives :
1. Améliore UNIQUEMENT la forme : structure (intertitres ##), clarté, orthographe, fluidité, ton
   professionnel-pédagogique. Vise une vraie amélioration rédactionnelle, pas un simple lissage.
2. NE MODIFIE AUCUN fait réglementaire, chiffre, seuil, date légale. Si la réglementation semble
   avoir évolué depuis la date de publication, ajoute au frontmatter `archive: true` et
   `archiveNote: "<une phrase neutre indiquant quoi vérifier>"` — ne corrige JAMAIS les faits toi-même.
3. `date` = date de publication originale, INTERDICTION de la changer.
4. Conserve les mots-clés SEO du titre et du corps. `titre` amélioré seulement s'il est illisible.
5. metaTitle ≤65 c, metaDescription 120-160 c, extrait ≤200 c accrocheur.
6. Supprime la clé `brut`. Le schéma lib/content/schemas.ts fait foi.
Rends UNIQUEMENT le fichier complet réécrit.
```

- [ ] **Step 2 : Après chaque lot** — l'orchestrateur relit 1 article du lot en entier + vérifie sur 2 autres que les chiffres/dates du corps sont identiques au source (`git diff` sur le fichier : seuls forme/structure doivent bouger, pas les nombres). Puis :

```bash
corepack pnpm test && corepack pnpm typecheck
git add content/articles
git commit -m "feat(content): reformule les articles (lot N/10)"
```

- [ ] **Step 3 : Fin de tranche**

```bash
grep -rl "brut: true" content/articles || echo "OK: plus aucun article brut"
grep -c "archive: true" -r content/articles
```

Relire intégralement 10 articles (dont 3 `archive: true`) ; vérifier le rendu de 3 dans le navigateur.

---

## Tranche 5 — Contact + pages légales

### Task 16 : Page contact enrichie

**Files:**
- Modify: `app/(marketing)/contact/page.tsx`

**Interfaces:**
- Consumes : `PageHero`, `Ariane`, `CarteZone`, `CtaDevis`, `loadVilles`.

- [ ] **Step 1 : Implémenter**

```tsx
// app/(marketing)/contact/page.tsx
import type { Metadata } from "next";
import { ClockIcon, MailIcon, MapPinIcon, PhoneIcon } from "lucide-react";

import { Ariane } from "@/components/marketing/pages/Ariane";
import { CarteZone } from "@/components/marketing/pages/CarteZone";
import { CtaDevis } from "@/components/marketing/pages/CtaDevis";
import { PageHero } from "@/components/marketing/pages/PageHero";
import { loadVilles } from "@/lib/content/load";

export const metadata: Metadata = {
  title: "Contact — Servicimmo, diagnostic immobilier à Tours | Servicimmo",
  description:
    "Contactez Servicimmo : 02 47 47 01 23, 58 rue de la Chevalerie à Tours. Devis de diagnostic immobilier en ligne, réponse sous 2 h ouvrées.",
  alternates: { canonical: "/contact" },
};

const COORDONNEES = [
  {
    icone: PhoneIcon, titre: "02 47 47 01 23",
    detail: "Lun–Ven 9h–12h / 14h–19h", href: "tel:+33247470123",
  },
  {
    icone: MailIcon, titre: "contact@servicimmo.fr",
    detail: "Réponse sous 2 h ouvrées", href: "mailto:contact@servicimmo.fr",
  },
  {
    icone: MapPinIcon, titre: "58 rue de la Chevalerie, 37100 Tours",
    detail: "Accueil sur rendez-vous", href: undefined,
  },
  {
    icone: ClockIcon, titre: "Intervention sous 48 h",
    detail: "Dans toute l'Indre-et-Loire", href: undefined,
  },
] as const;

export default async function ContactPage() {
  const villes = await loadVilles();
  return (
    <>
      <PageHero
        surtitre="Contact"
        titre="Parlons de votre projet"
        description="Le plus rapide : notre questionnaire en ligne (devis sous 2 h ouvrées). Pour tout le reste, appelez-nous ou écrivez-nous."
      />
      <Ariane segments={[{ label: "Contact", href: "/contact" }]} />
      <section className="mx-auto max-w-[var(--container,1280px)] px-6 py-8 md:px-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {COORDONNEES.map(({ icone: Icone, titre, detail, href }) => {
            const contenu = (
              <>
                <Icone className="h-5 w-5 shrink-0 text-[color:var(--color-si-petrole)]" aria-hidden />
                <div>
                  <p className="font-[family-name:var(--font-sora)] text-[14.5px] font-semibold text-[color:var(--color-home-ink)]">{titre}</p>
                  <p className="mt-1 text-[13px] text-[color:var(--color-home-slate)]">{detail}</p>
                </div>
              </>
            );
            const classes =
              "flex items-start gap-3 rounded-[12px] border border-[color:var(--color-home-line)] bg-white p-5 transition-shadow hover:shadow-[0_10px_24px_rgba(15,30,58,.07)]";
            return href ? (
              <a key={titre} href={href} className={classes}>{contenu}</a>
            ) : (
              <div key={titre} className={classes}>{contenu}</div>
            );
          })}
        </div>
      </section>
      <section className="mx-auto max-w-[var(--container,1280px)] px-6 py-4 md:px-8">
        <h2 className="mb-5 font-[family-name:var(--font-sora)] text-[20px] font-bold text-[color:var(--color-home-ink)]">
          Notre zone d'intervention
        </h2>
        <CarteZone villes={villes.map(({ slug, ville, lat, lng }) => ({ slug, ville, lat, lng }))} hauteur={360} />
      </section>
      <CtaDevis titre="Le plus simple : décrivez votre bien" />
    </>
  );
}
```

Harmoniser les horaires avec le bandeau header (`Lun–Ven 9h–12h / 14h–19h`) — l'ancienne page contact disait « 9h - 19h », c'était incohérent.

- [ ] **Step 2 : Vérifier en local + commit**

```bash
corepack pnpm typecheck
git add "app/(marketing)/contact/page.tsx"
git commit -m "feat(contact): page enrichie (coordonnees, horaires, carte zone)"
```

---

### Task 17 : Mentions légales + CGV réelles

**Files:**
- Modify: `app/(marketing)/mentions-legales/page.tsx`, `app/(marketing)/cgv/page.tsx`

- [ ] **Step 1 : Récupérer les contenus réels** — ouvrir `https://www.servicimmo.fr/mentions-legales.html` (et la page CGV si elle existe, sinon garder la structure actuelle enrichie des infos légales réelles : SIRET, assureur Allianz + n° de police, certifications, hébergeur actuel = Coolify/serveur Propul'seo, directeur de publication). Porter le texte en JSX simple (mêmes classes que les pages actuelles : `article` + sections `h2`).

- [ ] **Step 2 : Flag de validation** — en tête de chaque fichier, commentaire :

```tsx
{/* CONTENU À FAIRE VALIDER PAR SERVICIMMO avant bascule du domaine (v. spec §9 tranche 5). */}
```

Retirer les paragraphes « Page temporaire — … » des deux pages.

- [ ] **Step 3 : Vérifier + commit**

```bash
corepack pnpm typecheck
git add "app/(marketing)/mentions-legales/page.tsx" "app/(marketing)/cgv/page.tsx"
git commit -m "feat(legal): mentions legales et CGV reelles (a valider client)"
```

---

## Tranche 6 — SEO technique + maillage global

### Task 18 : Redirections 301 + test e2e

**Files:**
- Modify: `next.config.ts`
- Test: `e2e/redirections.spec.ts`

- [ ] **Step 1 : Brancher `redirects.json`**

Dans `next.config.ts`, ajouter (en conservant la config existante) :

```ts
import anciennesRedirections from "./lib/seo/redirects.json";

// … dans l'objet de config :
async redirects() {
  return anciennesRedirections.map((r) => ({
    source: r.source,
    destination: r.destination,
    permanent: true, // 308 — équivalent SEO d'une 301 pour Google
  }));
},
```

Si `resolveJsonModule` n'est pas actif dans `tsconfig.json`, l'activer.

- [ ] **Step 2 : Test e2e**

```ts
// e2e/redirections.spec.ts
import { expect, test } from "@playwright/test";

import redirections from "../lib/seo/redirects.json";

for (const r of redirections) {
  test(`redirige ${r.source}`, async ({ request }) => {
    const res = await request.get(r.source, { maxRedirects: 0 });
    expect([301, 308]).toContain(res.status());
    expect(res.headers()["location"]).toContain(r.destination);
  });
}

test("aucune redirection ne mène à un 404", async ({ request }) => {
  for (const r of redirections) {
    const res = await request.get(r.destination);
    expect(res.status(), `${r.destination} doit répondre 200`).toBe(200);
  }
});
```

- [ ] **Step 3 : Exécuter**

```bash
corepack pnpm build && corepack pnpm start &
corepack pnpm test:e2e e2e/redirections.spec.ts
```

Expected : ~194 tests PASS. Chaque échec = un contenu manquant ou un slug incohérent → corriger le contenu ou le mapping, pas le test.

- [ ] **Step 4 : Commit**

```bash
git add next.config.ts e2e/redirections.spec.ts tsconfig.json
git commit -m "feat(seo): redirections 301 des anciennes URLs + test e2e exhaustif"
```

---

### Task 19 : sitemap.ts + robots.ts

**Files:**
- Create: `app/sitemap.ts`, `app/robots.ts`

- [ ] **Step 1 : Sitemap**

```ts
// app/sitemap.ts
import type { MetadataRoute } from "next";

import { loadArticles, loadServices, loadVilles } from "@/lib/content/load";

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "https://servicimmo.propulseo-site.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [services, villes, articles] = await Promise.all([
    loadServices(), loadVilles(), loadArticles(),
  ]);
  const statiques = ["", "/services", "/zones", "/actualites", "/contact", "/devis", "/mentions-legales", "/cgv"];
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
```

- [ ] **Step 2 : Robots**

```ts
// app/robots.ts
import type { MetadataRoute } from "next";

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "https://servicimmo.propulseo-site.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/app", "/api", "/login", "/portail", "/reset-password"] }],
    sitemap: `${BASE}/sitemap.xml`,
  };
}
```

- [ ] **Step 3 : Vérifier** — `corepack pnpm dev`, ouvrir `/sitemap.xml` (≈170 URLs) et `/robots.txt`.

- [ ] **Step 4 : Commit**

```bash
git add app/sitemap.ts app/robots.ts
git commit -m "feat(seo): sitemap et robots generes depuis les collections"
```

---

### Task 20 : metadataBase, JSON-LD LocalBusiness, maillage header/footer

**Files:**
- Modify: `app/layout.tsx` (metadataBase), `app/(marketing)/layout.tsx` (LocalBusiness), `components/marketing/Header.tsx` (lien Zones), `components/marketing/Footer.tsx` (colonnes maillage)

- [ ] **Step 1 : metadataBase** — dans `app/layout.tsx`, étendre l'export `metadata` existant :

```ts
metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "https://servicimmo.propulseo-site.com"),
```

- [ ] **Step 2 : LocalBusiness** — dans `app/(marketing)/layout.tsx`, ajouter dans le JSX (à côté de `<SplashIntro />`) :

```tsx
<JsonLd
  data={{
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: "Servicimmo",
    description: "Cabinet de diagnostic immobilier à Tours depuis 1998.",
    telephone: "+33247470123",
    address: {
      "@type": "PostalAddress",
      streetAddress: "58 rue de la Chevalerie",
      postalCode: "37100",
      addressLocality: "Tours",
      addressCountry: "FR",
    },
    areaServed: "Indre-et-Loire",
    openingHours: ["Mo-Fr 09:00-12:00", "Mo-Fr 14:00-19:00"],
  }}
/>
```

avec `import { JsonLd } from "@/components/seo/JsonLd";`.

- [ ] **Step 3 : Header** — dans `NAV_LINKS` de `components/marketing/Header.tsx`, après `Diagnostics` :

```ts
{ label: "Zones", href: "/zones" },
```

Vérifier en local que la nav desktop tient sur une ligne à 1280 px (8 liens) ; sinon retirer « Références » (ancre home secondaire) — décision à noter dans le commit.

- [ ] **Step 4 : Footer** — lire `components/marketing/Footer.tsx`, le passer en `async function`, charger `const [services, villes] = await Promise.all([loadServices(), loadVilles()])`, et ajouter dans la grille existante deux colonnes (mêmes classes typo que les colonnes actuelles) :

```tsx
<div>
  <p className="font-[family-name:var(--font-sora)] text-[13.5px] font-bold text-white uppercase tracking-wide">Diagnostics</p>
  <ul className="mt-3 space-y-2">
    {services.slice(0, 6).map((s) => (
      <li key={s.slug}>
        <Link href={`/services/${s.slug}`} className="text-[13.5px] hover:underline">{s.titre}</Link>
      </li>
    ))}
  </ul>
</div>
<div>
  <p className="font-[family-name:var(--font-sora)] text-[13.5px] font-bold text-white uppercase tracking-wide">Zones d'intervention</p>
  <ul className="mt-3 space-y-2">
    {villes.slice(0, 7).map((v) => (
      <li key={v.slug}>
        <Link href={`/zones/${v.slug}`} className="text-[13.5px] hover:underline">Diagnostic {v.ville}</Link>
      </li>
    ))}
    <li><Link href="/zones" className="text-[13.5px] font-semibold hover:underline">Toutes les villes →</Link></li>
  </ul>
</div>
```

Adapter les classes aux couleurs réelles du footer existant (le lire d'abord).

- [ ] **Step 5 : Vérifier + commit**

```bash
corepack pnpm typecheck && corepack pnpm test
git add app/layout.tsx "app/(marketing)/layout.tsx" components/marketing/Header.tsx components/marketing/Footer.tsx
git commit -m "feat(seo): metadataBase, LocalBusiness, maillage header/footer"
```

---

## Tranche 7 — Polish

### Task 21 : Polish home + cohérence inter-pages

**REQUIRED SUB-SKILL : invoquer `methodo-peaufinage-propulseo` au début de cette tâche.**

**Files:**
- Modify (micro-retouches uniquement) : composants `components/marketing/*.tsx` de la home, composants pages intérieures

**Garde-fous :**
- Home : **aucun changement de structure, d'ordre de sections ni de contenu texte** — uniquement transitions, jointures visuelles entre sections, timing des reveals, micro-espacements.
- Screenshot avant/après pour CHAQUE modification de la home.

- [ ] **Step 1 :** Screenshots de référence de la home (desktop + mobile) avant toute retouche.
- [ ] **Step 2 :** Passe de peaufinage guidée par le skill : jointures entre sections home, cohérence des reveals sur les pages intérieures (délais, directions), rythme vertical des gabarits (espacements entre PageHero / Ariane / contenu / CTA), cohérence cartes/liserés/ombres entre catalogue, zones et actualités.
- [ ] **Step 3 :** Comparaison avant/après ; tout écart non voulu sur la home est annulé.
- [ ] **Step 4 : Commit**

```bash
git add components app
git commit -m "polish(vitrine): jointures sections home + coherence visuelle inter-pages"
```

(`polish` n'est pas un type conventionnel : utiliser `fix(ui):` si le hook de commit refuse.)

---

## Tranche 8 — QA finale

### Task 22 : Vérification complète + rapport

- [ ] **Step 1 : Batterie complète**

```bash
corepack pnpm typecheck
corepack pnpm lint
corepack pnpm test
corepack pnpm build
corepack pnpm test:e2e
```

Expected : tout vert. `build` doit générer ~170 pages statiques sans warning de taille.

- [ ] **Step 2 : Contenu** — vérifier qu'il ne reste **aucun** `brut: true` dans `content/` :

```bash
grep -rl "brut: true" content && echo "ECHEC: contenu brut restant" || echo "OK"
```

- [ ] **Step 3 : Parcours réel (MCP Playwright)** — home → services → un service → CTA modale questionnaire → zones → une ville → actualités → un article → contact. Screenshot de chaque type de page (desktop + 375 px). Console navigateur : zéro erreur.

- [ ] **Step 4 : Lighthouse mobile** sur `/`, un service, une ville, un article :

```bash
corepack pnpm dlx lighthouse http://localhost:3000/services/dpe --preset=perf --form-factor=mobile --output=json --output-path=./scripts/out/lh-service.json --chrome-flags="--headless"
```

Expected : performance ≥ 90 sur chaque page testée. Sinon : vérifier images sans `next/image`, JS Leaflet chargé hors pages carte, fonts.

- [ ] **Step 5 : Rapport de fin** — écrire `scripts/out/rapport-final.md` : pages générées par type, redirections testées, scores Lighthouse, contenus flaggés `archive`, points à faire valider par Servicimmo (légales, échantillons contenus). Commit :

```bash
git add scripts/out/rapport-final.md
git commit -m "docs: rapport QA finale vitrine complete"
```

- [ ] **Step 6 : Déploiement de validation** — pousser la branche sur le remote `client` et déployer sur Coolify (voir mémoire de session `deploy-coolify-servicimmo` : redeploy via API). Vérifier en prod : 3 pages au hasard + 3 redirections + sitemap. Prévenir Etienne pour la validation client finale.

---

## Récap des paliers

| Palier | Moment | Bloquant ? |
|---|---|---|
| 1. Inventaire + mapping services | après Task 3 | **Oui — validation Etienne** |
| 2. Échantillons services/villes/articles | fin des Tasks 10/13/15 | Non — auto-relecture + screenshots partagés |
| 3. Validation client du site complet | après Task 22 (déployé) | **Oui — avant bascule DNS** |
