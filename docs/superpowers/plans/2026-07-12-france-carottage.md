# Site France Carottage — Plan d'implémentation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal :** Refondre france-carottage.fr (carottage routier, repérage amiante/HAP sur enrobés, réseau national) dans la MÊME app Next.js que Servicimmo, en multi-domaines : segment réel `app/carottage/`, routage par host dans `middleware.ts`, identité rouge/noir/blanc distincte, 191 pages villes + 57 départements régénérées par gabarit, ~8 pages expertises modernisées, formulaire devis B2B via Brevo, cross-linking animé entre les deux headers. Un seul déploiement Coolify.

**Architecture :** Contenu en fichiers Markdown (`content/carottage/`) validés par Zod et lus au build (`generateStaticParams`), loaders qui réutilisent la mécanique générique de `lib/content/load.ts`, gabarits FC dans `app/carottage/`, scraping multi-site one-shot de l'ancien site FC, SEO (301 host-based / sitemap par domaine / JSON-LD) généré depuis les mêmes collections. Le middleware réécrit `host FC → /carottage<pathname>` (URLs propres côté navigateur) et bloque l'accès inverse.

**Tech Stack :** Next.js 16 App Router, TypeScript strict, Tailwind v4, gray-matter + marked, Zod, Leaflet/react-leaflet, cheerio + turndown (scripts one-shot), Brevo (REST `api.brevo.com/v3/smtp/email`), Vitest, Playwright.

**Spec :** `docs/superpowers/specs/2026-07-12-france-carottage-design.md`

**Infra Servicimmo déjà en place et consommée (ne pas réinventer) :**
- `lib/content/load.ts` — mécanique de chargement générique (à exporter, cf. Task FC1.2).
- `lib/content/schemas.ts` — pattern `contraintesContenuModernise` (contraintes SEO bypassées si `brut: true`) et briques `slug` / `meta` (à exporter, cf. Task FC1.2).
- `scripts/scrape-ancien-site.ts` + `scripts/lib/{classify,extraction}.ts` — à étendre en multi-site.
- `components/seo/JsonLd.tsx`, `components/marketing/Reveal.tsx` — primitives neutres réutilisées telles quelles.
- `lib/clients/servicimmo/` — modèle symétrique pour `lib/clients/francecarottage/`.
- `middleware.ts` — logique session Supabase existante, à COMPOSER (jamais écraser).
- `next.config.ts` — recevra les `redirects()` Servicimmo (Task 18 SI) ; FC y ajoute ses redirects host-guardés.
- `lib/resend/client.ts` + `lib/features/emails/send.ts` — modèle fail-soft pour `lib/brevo/client.ts` (mais Brevo, pas Resend).

## Global Constraints

- Branche de travail : `feat/vitrine-pages-completes` (chantier FC exécuté **après** les 22 tâches Servicimmo — cross-links en dernier).
- TypeScript strict, **jamais de `any`** ; `noUncheckedIndexedAccess` est actif (accès indexés → `T | undefined`).
- Path aliases `@/…` obligatoires, pas d'imports relatifs `../../`.
- Fichiers < 300 lignes ; découper en composants si un gabarit dépasse.
- UI en **français** ; identifiants de code en anglais sauf vocabulaire métier déjà en français (`ville`, `devis`, `departement`…) ; commentaires métier en français.
- Server Components par défaut ; `"use client"` uniquement si interactivité.
- **`lib/content/` est serveur uniquement** (`node:fs`) : ne jamais l'importer depuis un composant `"use client"`.
- **Design FC — tokens dédiés `--fc-*`** (`--fc-rouge` ≈ `#B32024` à pipeter sur le logo réel, `--fc-noir`, `--fc-blanc-casse`, `--fc-gris`). **INTERDICTION d'utiliser un token `--color-si-*` dans `components/carottage/` ou `app/carottage/`.** Rouge en accent chirurgical (boutons, soulignés, chiffres), noir/blanc dominants, imagerie chantier.
- **Design FC — pas de transposition Servicimmo.** On reprend les standards invisibles (grille 1280 px, rythme vertical, hiérarchie typo, ombres douces, micro-interactions 250 ms, reveals, AA) mais AUCUNE section SI copiée. Typo Sora conservée. Ne PAS réutiliser `PageHero`/`Ariane`/`CtaDevis` SI : FC a ses propres primitives dans `components/carottage/`.
- **Middleware — ne réécrit QUE si `host ∈ NEXT_PUBLIC_CAROTTAGE_HOSTS`.** Aucune régression Servicimmo possible : le fast-path FC est en tête et court-circuite ; le reste du middleware SI est inchangé.
- **Canonicals FC** : la base absolue est `NEXT_PUBLIC_CAROTTAGE_URL` (via `metadataBase` du layout FC), jamais l'URL Servicimmo.
- Contenus : mots-clés SEO conservés ; aucune invention locale ; faits réglementaires intacts. Différenciation anti-duplicate obligatoire sur villes + départements.
- Après chaque tâche : `corepack pnpm typecheck` **et** `corepack pnpm test` verts avant commit.
- Commandes via `corepack pnpm …` (pnpm 10.33). Commits conventionnels ; scope `carottage`/`content`/`seo`/`brevo` (`feat(carottage): …`).
- Ne jamais committer `.env*` ni secrets ; **la clé Brevo ne doit JAMAIS apparaître dans un log**.

---

## Tranche FC1 — Socle multi-domaines + scraping + inventaire

### Task FC1.1 : Config marque France Carottage + env + table des départements

**Files:**
- Create: `lib/clients/francecarottage/config.ts`, `lib/clients/francecarottage/branding.ts`, `lib/clients/francecarottage/urls.ts`
- Create (généré) : `lib/clients/francecarottage/departements.ts`
- Create: `scripts/build-departements-carottage.ts`
- Modify: `.env.local.example`, `package.json` (script `build:departements`)

**Interfaces:**
- Produces : `francecarottageConfig`, `francecarottageBranding`, `carottageUrl(path)`, `servicimmoUrl(path)`, `DEPARTEMENTS: Departement[]` avec `type Departement = { code: string; nom: string; slug: string; lat: number; lng: number }`, `getDepartement(code)`.

- [ ] **Step 1 : Config marque**

```ts
// lib/clients/francecarottage/config.ts
/**
 * Config société France Carottage (société sœur de Servicimmo : mêmes locaux,
 * même téléphone). Carottage routier, repérage amiante/HAP sur enrobés, réseau
 * national. Valeurs à confirmer avec Etienne avant bascule DNS.
 */
export const francecarottageConfig = {
  nom: "France Carottage",
  raisonSociale: "France Carottage",
  siret: "", // TODO — à confirmer avec Etienne
  adresse: {
    ligne1: "58 rue de la Chevalerie",
    ligne2: "",
    codePostal: "37100",
    ville: "Tours",
    pays: "France",
  },
  contact: {
    telephone: "02 47 47 01 23",
    telephoneHref: "tel:+33247470123",
    email: "contact@france-carottage.fr", // TODO — à confirmer
  },
  zoneIntervention: "France entière",
  certifications: ["Repérage amiante avant travaux", "HAP / enrobés routiers"],
} as const;

export type FranceCarottageConfig = typeof francecarottageConfig;
```

- [ ] **Step 2 : Branding**

```ts
// lib/clients/francecarottage/branding.ts
/**
 * Branding France Carottage — identité rouge/noir/blanc modernisée.
 * Le rouge de référence (#B32024) doit être re-pipeté sur le logo réel avant
 * mise en prod ; il vit en token CSS `--fc-rouge` (app/globals.css).
 */
export const francecarottageBranding = {
  displayName: "France Carottage",
  tagline: "Carottage routier & repérage amiante/HAP — réseau national",
  colors: {
    rouge: "#B32024",
    noir: "#111113",
    blancCasse: "#F5F4F2",
    gris: "#6B6E73",
  },
  fonts: {
    titres: "var(--font-sora)",
    corps: "var(--font-inter)",
  },
  logo: {
    src: "/img/carottage/logo-france-carottage.svg",
    alt: "France Carottage",
    width: 190,
    height: 44,
  },
} as const;

export type FranceCarottageBranding = typeof francecarottageBranding;
```

- [ ] **Step 3 : Helpers d'URL absolue (canonicals / cross-links)**

```ts
// lib/clients/francecarottage/urls.ts
/** Bases absolues des deux marques — pilotées par env (préprod → prod sans code). */
const CAROTTAGE_BASE = process.env.NEXT_PUBLIC_CAROTTAGE_URL ?? "https://www.france-carottage.fr";
const SERVICIMMO_BASE = process.env.NEXT_PUBLIC_SERVICIMMO_URL ?? "https://www.servicimmo.fr";

function joindre(base: string, path: string): string {
  if (!path || path === "/") return base;
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

export function carottageUrl(path = "/"): string {
  return joindre(CAROTTAGE_BASE, path);
}

export function servicimmoUrl(path = "/"): string {
  return joindre(SERVICIMMO_BASE, path);
}
```

- [ ] **Step 4 : Générateur de la table des départements**

```ts
// scripts/build-departements-carottage.ts
/**
 * One-shot : génère lib/clients/francecarottage/departements.ts (101 départements
 * métropole + DOM) depuis l'API officielle geo.api.gouv.fr. Le centroïde est
 * approché par la moyenne des points du contour — largement suffisant pour poser
 * un marqueur de carte. Jamais exécuté dans le build Next.
 *   corepack pnpm build:departements
 */
import { writeFile } from "node:fs/promises";
import path from "node:path";

type Contour = { coordinates: number[][][] | number[][][][]; type: string };
type DeptApi = { code: string; nom: string; contour: Contour };

function slugify(nom: string): string {
  return nom
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/['’]/g, "-")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function centroide(contour: Contour): { lat: number; lng: number } {
  // Aplati Polygon (number[][][]) ou MultiPolygon (number[][][][]) en liste de [lng, lat].
  const points: number[][] = [];
  const walk = (node: unknown): void => {
    if (
      Array.isArray(node) &&
      node.length === 2 &&
      typeof node[0] === "number" &&
      typeof node[1] === "number"
    ) {
      points.push(node as number[]);
      return;
    }
    if (Array.isArray(node)) for (const child of node) walk(child);
  };
  walk(contour.coordinates);
  const somme = points.reduce(
    (acc, [lng, lat]) => ({ lng: acc.lng + (lng ?? 0), lat: acc.lat + (lat ?? 0) }),
    { lng: 0, lat: 0 },
  );
  const n = points.length || 1;
  return { lat: +(somme.lat / n).toFixed(4), lng: +(somme.lng / n).toFixed(4) };
}

async function main(): Promise<void> {
  const res = await fetch("https://geo.api.gouv.fr/departements?fields=nom,code,contour");
  if (!res.ok) throw new Error(`geo.api.gouv.fr HTTP ${res.status}`);
  const bruts = (await res.json()) as DeptApi[];
  const lignes = bruts
    .filter((d) => d.contour)
    .sort((a, b) => a.code.localeCompare(b.code, "fr"))
    .map((d) => {
      const { lat, lng } = centroide(d.contour);
      return `  { code: "${d.code}", nom: ${JSON.stringify(d.nom)}, slug: "${slugify(d.nom)}", lat: ${lat}, lng: ${lng} },`;
    });

  const contenu = `/**
 * Table statique des départements français (généré par scripts/build-departements-carottage.ts).
 * Centroïdes approchés (moyenne du contour) — usage : marqueurs carte + lookup parent d'une ville.
 * NE PAS éditer à la main : relancer le générateur.
 */
export type Departement = { code: string; nom: string; slug: string; lat: number; lng: number };

export const DEPARTEMENTS: Departement[] = [
${lignes.join("\n")}
];

const PAR_CODE = new Map(DEPARTEMENTS.map((d) => [d.code, d]));

/** Retourne le département par code INSEE (ex: "45", "2a"), insensible à la casse. */
export function getDepartement(code: string): Departement | undefined {
  return PAR_CODE.get(code.toLowerCase()) ?? PAR_CODE.get(code.toUpperCase()) ?? PAR_CODE.get(code);
}
`;
  await writeFile(
    path.join(process.cwd(), "lib", "clients", "francecarottage", "departements.ts"),
    contenu,
    "utf8",
  );
  console.log(`departements.ts écrit — ${lignes.length} départements`);
}

void main();
```

- [ ] **Step 5 : Script pnpm + exécution**

Ajouter dans `package.json` (`scripts`) :

```json
"build:departements": "tsx scripts/build-departements-carottage.ts",
```

Run : `corepack pnpm build:departements`
Expected : `departements.ts écrit — 101 départements`. Ouvrir le fichier : vérifier que `{ code: "45", nom: "Loiret", slug: "loiret", lat: …, lng: … }` a un centroïde plausible (lat ≈ 47.9, lng ≈ 2.3).

- [ ] **Step 6 : Variables d'environnement**

Ajouter à la fin de `.env.local.example` :

```bash
# === [REQUIS France Carottage] Multi-domaines ===============================
# Bases absolues des deux marques (canonicals, OG, cross-links). Préprod → prod
# sans toucher au code.
NEXT_PUBLIC_CAROTTAGE_URL=http://carottage.localhost:3000
NEXT_PUBLIC_SERVICIMMO_URL=http://localhost:3000

# Hosts (séparés par des virgules, SANS port) reconnus comme France Carottage par
# le middleware. Doit inclure carottage.localhost pour les tests e2e locaux.
NEXT_PUBLIC_CAROTTAGE_HOSTS=carottage.localhost,www.france-carottage.fr,france-carottage.fr

# === [REQUIS FC5] Devis Brevo (email transactionnel) ========================
# Clé API transactionnelle Brevo — SECRÈTE, serveur uniquement, jamais loggée.
# https://app.brevo.com/settings/keys/api
BREVO_API_KEY=

# Expéditeur validé côté Brevo (domaine DKIM france-carottage.fr)
CAROTTAGE_EMAIL_FROM=devis@france-carottage.fr

# Boîte interne qui reçoit les demandes de devis — à CONFIRMER avec Etienne (FC5).
CAROTTAGE_EMAIL_INTERNAL=contact@france-carottage.fr
```

- [ ] **Step 7 : Typecheck + commit**

```bash
corepack pnpm typecheck
git add lib/clients/francecarottage package.json .env.local.example scripts/build-departements-carottage.ts
git commit -m "feat(carottage): config marque, helpers URL, table departements generee, env"
```

---

### Task FC1.2 : Export de `loadCollection` + schémas Zod FC + loaders (TDD)

**Files:**
- Modify: `lib/content/load.ts` (exporter `loadCollection`, élargir `dossier` à `string`)
- Modify: `lib/content/schemas.ts` (exporter `slug`, `meta`, `contraintesContenuModernise`)
- Create: `lib/content/schemas-carottage.ts`, `lib/content/load-carottage.ts`
- Test: `lib/content/__tests__/schemas-carottage.test.ts`, `lib/content/__tests__/load-carottage.test.ts` + fixtures `lib/content/__tests__/fixtures-carottage/{expertises,departements,villes}/*.md`

**Interfaces:**
- Produces :
  - `loadCollection<S extends z.ZodTypeAny>(dossier: string, schema: S, baseDir?): Promise<(z.infer<S> & { html: string })[]>` (exporté)
  - `ExpertiseFrontmatterSchema`, `DepartementFrontmatterSchema`, `VilleCarottageFrontmatterSchema` + types `ExpertiseFC`, `DepartementFC`, `VilleFC`
  - `loadExpertises()/getExpertise(slug)`, `loadDepartementsFC()/getDepartementFC(slug)`, `loadVillesFC()/getVilleFC(slug)`

- [ ] **Step 1 : Exporter la mécanique existante (changement minimal)**

Dans `lib/content/load.ts`, remplacer la signature privée par une signature exportée et générique sur le nom de dossier :

```ts
export async function loadCollection<S extends z.ZodTypeAny>(
  dossier: string,
  schema: S,
  baseDir: string = CONTENT_DIR,
): Promise<(z.infer<S> & { html: string })[]> {
```

(seul le mot-clé `export` et le type `dossier: string` changent ; le corps est identique).

Dans `lib/content/schemas.ts`, ajouter `export` devant les briques partagées pour que les schémas FC les réutilisent (aucun autre changement) :

```ts
export const slug = z.string().regex(/^[a-z0-9-]+$/, "slug kebab-case attendu");
export const meta = {
  metaTitle: z.string().min(1),
  metaDescription: z.string().min(1),
  anciennesUrls: z.array(z.string().startsWith("/")).default([]),
  brut: z.boolean().default(false),
};
export function contraintesContenuModernise(
  data: { brut: boolean; metaTitle: string; metaDescription: string },
  ctx: z.RefinementCtx,
): void {
```

(les définitions restent identiques, on ne fait qu'exposer `slug`, `meta`, `contraintesContenuModernise`).

- [ ] **Step 2 : Tests des schémas FC qui échouent**

```ts
// lib/content/__tests__/schemas-carottage.test.ts
import { describe, expect, it } from "vitest";

import {
  DepartementFrontmatterSchema,
  ExpertiseFrontmatterSchema,
  VilleCarottageFrontmatterSchema,
} from "../schemas-carottage";

const villeValide = {
  slug: "orleans",
  ville: "Orléans",
  codePostal: "45000",
  departement: "45",
  metaTitle: "Carottage & repérage amiante enrobés à Orléans (45000) | France Carottage",
  metaDescription:
    "Carottage routier et repérage amiante/HAP sur enrobés à Orléans : intervention sur voirie, réseaux et bâtiment partout dans le Loiret, devis sous 24 h.",
  anciennesUrls: ["/amiante-hap-enrobes-routiers-orleans-45000.html"],
  lat: 47.9,
  lng: 1.9,
};

describe("schemas France Carottage", () => {
  it("accepte une ville valide", () => {
    expect(VilleCarottageFrontmatterSchema.parse(villeValide).departement).toBe("45");
  });

  it("refuse un code département hors format", () => {
    expect(() =>
      VilleCarottageFrontmatterSchema.parse({ ...villeValide, departement: "Loiret" }),
    ).toThrow();
  });

  it("accepte une latitude France entière (Corse)", () => {
    expect(
      VilleCarottageFrontmatterSchema.parse({
        ...villeValide,
        slug: "ajaccio",
        ville: "Ajaccio",
        codePostal: "20000",
        departement: "2a",
        lat: 41.9,
        lng: 8.7,
      }).lat,
    ).toBe(41.9);
  });

  it("valide un département avec villes principales", () => {
    const d = DepartementFrontmatterSchema.parse({
      slug: "loiret",
      nom: "Loiret",
      code: "45",
      villesPrincipales: ["Orléans", "Montargis", "Pithiviers"],
      metaTitle: "Carottage & amiante enrobés dans le Loiret (45) | France Carottage",
      metaDescription:
        "France Carottage intervient dans tout le Loiret pour le carottage routier et le repérage amiante/HAP sur enrobés : voirie, réseaux, bâtiment. Devis rapide.",
      anciennesUrls: ["/amiante-hap-enrobes-routiers-loiret.html"],
    });
    expect(d.villesPrincipales).toHaveLength(3);
  });

  it("valide une expertise (date facultative) et applique les défauts", () => {
    const e = ExpertiseFrontmatterSchema.parse({
      slug: "hap-enrobes",
      titre: "HAP dans les enrobés routiers",
      metaTitle: "HAP dans les enrobés routiers : obligations | France Carottage",
      metaDescription:
        "Comprendre les hydrocarbures aromatiques polycycliques (HAP) dans les enrobés : risques, seuils, obligations de repérage avant travaux de voirie.",
      anciennesUrls: ["/hap-enrobes-i7.html"],
    });
    expect(e.brut).toBe(false);
    expect(e.date).toBeUndefined();
  });

  it("refuse un contenu modernisé à metaDescription trop courte", () => {
    expect(() =>
      ExpertiseFrontmatterSchema.parse({
        slug: "x",
        titre: "x",
        metaTitle: "Titre correct pour tester",
        metaDescription: "trop court",
        anciennesUrls: [],
      }),
    ).toThrow();
  });
});
```

- [ ] **Step 3 : Vérifier l'échec** — `corepack pnpm vitest run lib/content/__tests__/schemas-carottage.test.ts` → FAIL (module absent).

- [ ] **Step 4 : Implémenter les schémas FC**

```ts
// lib/content/schemas-carottage.ts
/** Frontmatter des collections content/carottage/ — un frontmatter invalide CASSE le build. */
import { z } from "zod";

import { contraintesContenuModernise, meta, slug } from "@/lib/content/schemas";

/** Code département INSEE : 2 chiffres, ou 2A/2B (Corse), ou 3 chiffres (DOM). */
const codeDepartement = z.string().regex(/^(\d{2,3}|2[ab])$/i, "code département INSEE attendu");

export const VilleCarottageFrontmatterSchema = z
  .object({
    slug,
    ville: z.string().min(1),
    codePostal: z.string().regex(/^\d{5}$/),
    departement: codeDepartement,
    ...meta,
    // Bornes France métropolitaine + Corse + marge DOM traités à part si besoin.
    lat: z.number().gte(41).lte(51.5),
    lng: z.number().gte(-5.5).lte(9.6),
  })
  .superRefine(contraintesContenuModernise);

export const DepartementFrontmatterSchema = z
  .object({
    slug,
    nom: z.string().min(1),
    code: codeDepartement,
    villesPrincipales: z.array(z.string().min(1)).default([]),
    ...meta,
  })
  .superRefine(contraintesContenuModernise);

export const ExpertiseFrontmatterSchema = z
  .object({
    slug,
    titre: z.string().min(1),
    /** Date de publication ORIGINALE si la page en portait une, sinon absente. */
    date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .optional(),
    ...meta,
  })
  .superRefine(contraintesContenuModernise);

export type VilleCarottageFrontmatter = z.infer<typeof VilleCarottageFrontmatterSchema>;
export type DepartementFrontmatter = z.infer<typeof DepartementFrontmatterSchema>;
export type ExpertiseFrontmatter = z.infer<typeof ExpertiseFrontmatterSchema>;

export type VilleFC = VilleCarottageFrontmatter & { html: string };
export type DepartementFC = DepartementFrontmatter & { html: string };
export type ExpertiseFC = ExpertiseFrontmatter & { html: string };
```

- [ ] **Step 5 : Vert schémas** — `corepack pnpm vitest run lib/content/__tests__/schemas-carottage.test.ts` → PASS (6 tests).

- [ ] **Step 6 : Fixtures + tests des loaders qui échouent**

Créer `lib/content/__tests__/fixtures-carottage/villes/orleans.md` :

```markdown
---
slug: orleans
ville: Orléans
codePostal: "45000"
departement: "45"
metaTitle: "Carottage & repérage amiante enrobés à Orléans (45000) | France Carottage"
metaDescription: "Carottage routier et repérage amiante/HAP sur enrobés à Orléans : voirie, réseaux et bâtiment partout dans le Loiret, devis sous 24 h ouvrées."
anciennesUrls: ["/amiante-hap-enrobes-routiers-orleans-45000.html"]
lat: 47.9
lng: 1.9
---

## Carottage à Orléans

Contenu de test.
```

Créer de même `fixtures-carottage/villes/tours-fc.md` (slug `tours-fc`, ville `Tours`, cp `37000`, departement `37`, lat 47.39, lng 0.68), `fixtures-carottage/departements/loiret.md` (slug `loiret`, code `45`, nom `Loiret`, villesPrincipales `[Orléans, Montargis]`), `fixtures-carottage/expertises/hap-enrobes.md` (avec `date: "2019-05-10"`) et `fixtures-carottage/expertises/metier.md` (sans date) — chacun avec `metaTitle`/`metaDescription` valides (≥ bornes), corps `## …`.

```ts
// lib/content/__tests__/load-carottage.test.ts
import path from "node:path";

import { describe, expect, it } from "vitest";

import {
  getVilleFC,
  loadDepartementsFC,
  loadExpertises,
  loadVillesFC,
} from "../load-carottage";

const FIXTURES = path.join(__dirname, "fixtures-carottage");

describe("lib/content — collections France Carottage", () => {
  it("charge et trie les villes par ordre alphabétique", async () => {
    const villes = await loadVillesFC(FIXTURES);
    expect(villes.map((v) => v.slug)).toEqual(["orleans", "tours-fc"]);
    expect(villes[0]?.html).toContain("<h2");
  });

  it("retourne null pour un slug ville inconnu", async () => {
    expect(await getVilleFC("inexistant", FIXTURES)).toBeNull();
  });

  it("charge les départements", async () => {
    const depts = await loadDepartementsFC(FIXTURES);
    expect(depts.map((d) => d.code)).toEqual(["45"]);
  });

  it("trie les expertises datées avant les non datées", async () => {
    const exp = await loadExpertises(FIXTURES);
    expect(exp.map((e) => e.slug)).toEqual(["hap-enrobes", "metier"]);
  });
});
```

- [ ] **Step 7 : Vérifier l'échec** — `corepack pnpm vitest run lib/content/__tests__/load-carottage.test.ts` → FAIL.

- [ ] **Step 8 : Implémenter les loaders FC**

```ts
// lib/content/load-carottage.ts
/** Chargement des collections content/carottage/ — SERVEUR UNIQUEMENT (node:fs). */
import path from "node:path";

import { loadCollection } from "@/lib/content/load";
import {
  DepartementFrontmatterSchema,
  ExpertiseFrontmatterSchema,
  VilleCarottageFrontmatterSchema,
  type DepartementFC,
  type ExpertiseFC,
  type VilleFC,
} from "@/lib/content/schemas-carottage";

const CAROTTAGE_DIR = path.join(process.cwd(), "content", "carottage");

export async function loadVillesFC(baseDir: string = CAROTTAGE_DIR): Promise<VilleFC[]> {
  const villes = await loadCollection("villes", VilleCarottageFrontmatterSchema, baseDir);
  return villes.sort((a, b) => a.ville.localeCompare(b.ville, "fr"));
}

export async function getVilleFC(
  slug: string,
  baseDir: string = CAROTTAGE_DIR,
): Promise<VilleFC | null> {
  return (await loadVillesFC(baseDir)).find((v) => v.slug === slug) ?? null;
}

export async function loadDepartementsFC(
  baseDir: string = CAROTTAGE_DIR,
): Promise<DepartementFC[]> {
  const depts = await loadCollection("departements", DepartementFrontmatterSchema, baseDir);
  return depts.sort((a, b) => a.nom.localeCompare(b.nom, "fr"));
}

export async function getDepartementFC(
  slug: string,
  baseDir: string = CAROTTAGE_DIR,
): Promise<DepartementFC | null> {
  return (await loadDepartementsFC(baseDir)).find((d) => d.slug === slug) ?? null;
}

export async function loadExpertises(
  baseDir: string = CAROTTAGE_DIR,
): Promise<ExpertiseFC[]> {
  const exp = await loadCollection("expertises", ExpertiseFrontmatterSchema, baseDir);
  // Datées (plus récentes d'abord) avant non datées, puis alpha sur le slug.
  return exp.sort((a, b) => {
    if (a.date && b.date) return b.date.localeCompare(a.date);
    if (a.date) return -1;
    if (b.date) return 1;
    return a.slug.localeCompare(b.slug, "fr");
  });
}

export async function getExpertise(
  slug: string,
  baseDir: string = CAROTTAGE_DIR,
): Promise<ExpertiseFC | null> {
  return (await loadExpertises(baseDir)).find((e) => e.slug === slug) ?? null;
}
```

- [ ] **Step 9 : Vert + commit**

```bash
corepack pnpm vitest run lib/content
corepack pnpm typecheck && corepack pnpm test
git add lib/content
git commit -m "feat(carottage): export loadCollection + schemas Zod FC + loaders (villes/departements/expertises)"
```

---

### Task FC1.3 : Classifieur d'URLs de l'ancien site FC (TDD)

**Files:**
- Create: `scripts/lib/classify-carottage.ts`
- Test: `scripts/lib/__tests__/classify-carottage.test.ts`

**Interfaces:**
- Produces : `classifyUrlCarottage(url: string): UrlCarotteeClassee` avec `type UrlTypeFC = "ville" | "departement" | "expertise" | "structurelle" | "inconnue"` et `type UrlCarotteeClassee = { chemin: string; type: UrlTypeFC; slugPropose: string; codePostal?: string }`.

- [ ] **Step 1 : Écrire les tests qui échouent**

```ts
// scripts/lib/__tests__/classify-carottage.test.ts
import { describe, expect, it } from "vitest";

import { classifyUrlCarottage } from "../classify-carottage";

describe("classifyUrlCarottage", () => {
  it("détecte une page ville (préfixe + ville + CP)", () => {
    const r = classifyUrlCarottage(
      "https://www.france-carottage.fr/amiante-hap-enrobes-routiers-orleans-45000.html",
    );
    expect(r).toEqual({
      chemin: "/amiante-hap-enrobes-routiers-orleans-45000.html",
      type: "ville",
      slugPropose: "orleans",
      codePostal: "45000",
    });
  });

  it("détecte une ville à nom composé", () => {
    const r = classifyUrlCarottage(
      "https://www.france-carottage.fr/amiante-hap-enrobes-routiers-clermont-ferrand-63000.html",
    );
    expect(r.type).toBe("ville");
    expect(r.slugPropose).toBe("clermont-ferrand");
    expect(r.codePostal).toBe("63000");
  });

  it("détecte un département (même préfixe, SANS code postal)", () => {
    const r = classifyUrlCarottage(
      "https://www.france-carottage.fr/amiante-hap-enrobes-routiers-loiret.html",
    );
    expect(r.type).toBe("departement");
    expect(r.slugPropose).toBe("loiret");
    expect(r.codePostal).toBeUndefined();
  });

  it("détecte un département composé", () => {
    const r = classifyUrlCarottage(
      "https://www.france-carottage.fr/amiante-hap-enrobes-routiers-seine-et-marne.html",
    );
    expect(r.type).toBe("departement");
    expect(r.slugPropose).toBe("seine-et-marne");
  });

  it("détecte une expertise (suffixe -i<N>.html)", () => {
    const r = classifyUrlCarottage("https://www.france-carottage.fr/hap-enrobes-routiers-i7.html");
    expect(r.type).toBe("expertise");
    expect(r.slugPropose).toBe("hap-enrobes-routiers");
  });

  it("classe racine et mentions légales en structurelles", () => {
    expect(classifyUrlCarottage("https://www.france-carottage.fr/").type).toBe("structurelle");
    expect(
      classifyUrlCarottage("https://www.france-carottage.fr/mentions-legales.html").type,
    ).toBe("structurelle");
  });

  it("classe le reste en inconnue", () => {
    expect(classifyUrlCarottage("https://www.france-carottage.fr/espace-client.php").type).toBe(
      "inconnue",
    );
  });
});
```

- [ ] **Step 2 : Vérifier l'échec** — `corepack pnpm vitest run scripts/lib/__tests__/classify-carottage.test.ts` → FAIL (`Cannot find module '../classify-carottage'`).

- [ ] **Step 3 : Implémenter**

```ts
// scripts/lib/classify-carottage.ts
/**
 * Classement heuristique des anciennes URLs france-carottage.fr.
 *   ville       : /amiante-hap-enrobes-routiers-<ville>-<cp>.html
 *   departement : /amiante-hap-enrobes-routiers-<dept>.html   (même préfixe, SANS code postal)
 *   expertise   : /<slug>-i<N>.html                            (pages éditoriales)
 *   structurelle: /, /index.html, /mentions-legales.html
 * L'ordre des tests importe : la ville (avec CP) DOIT être testée avant le département.
 */

export type UrlTypeFC = "ville" | "departement" | "expertise" | "structurelle" | "inconnue";

export type UrlCarotteeClassee = {
  chemin: string;
  type: UrlTypeFC;
  slugPropose: string;
  /** Présent uniquement pour les villes (sert au géocodage + au parent département). */
  codePostal?: string;
};

const PREFIXE = "amiante-hap-enrobes-routiers";

const CHEMINS_STRUCTURELS = new Set(["/", "/index.html", "/mentions-legales.html"]);

export function classifyUrlCarottage(url: string): UrlCarotteeClassee {
  const chemin = new URL(url).pathname.toLowerCase();

  if (CHEMINS_STRUCTURELS.has(chemin)) {
    return { chemin, type: "structurelle", slugPropose: "" };
  }

  // Ville : préfixe + slug + code postal (5 chiffres). Testé AVANT le département.
  const ville = chemin.match(new RegExp(`^/${PREFIXE}-([a-z0-9-]+)-(\\d{5})\\.html$`));
  if (ville?.[1] && ville[2]) {
    return { chemin, type: "ville", slugPropose: ville[1], codePostal: ville[2] };
  }

  // Département : même préfixe, sans code postal.
  const departement = chemin.match(new RegExp(`^/${PREFIXE}-([a-z][a-z0-9-]+)\\.html$`));
  if (departement?.[1]) {
    return { chemin, type: "departement", slugPropose: departement[1] };
  }

  // Expertise : suffixe -i<N>.html.
  const expertise = chemin.match(/^\/([a-z0-9-]+)-i\d+\.html$/);
  if (expertise?.[1]) {
    return { chemin, type: "expertise", slugPropose: expertise[1] };
  }

  return { chemin, type: "inconnue", slugPropose: "" };
}
```

- [ ] **Step 4 : Vérifier le vert** — `corepack pnpm vitest run scripts/lib/__tests__/classify-carottage.test.ts` → PASS (7 tests).

- [ ] **Step 5 : Commit**

```bash
git add scripts/lib/classify-carottage.ts scripts/lib/__tests__/classify-carottage.test.ts
git commit -m "feat(carottage): classifieur des anciennes URLs FC (ville/departement/expertise)"
```

---

### Task FC1.4 : Scraping multi-site (`--site carottage`)

**Files:**
- Modify: `scripts/scrape-ancien-site.ts` (dispatch `--site`)
- Modify: `scripts/lib/extraction.ts` (exporter 3 helpers réutilisés)
- Create: `scripts/lib/scrape-carottage.ts` (inventaire + extraction FC)

**Interfaces:**
- Consumes : `classifyUrlCarottage`, helpers exportés d'`extraction.ts`, `DEPARTEMENTS` (Task FC1.1).
- Produces : `corepack pnpm scrape inventaire --site carottage` → `scripts/out/inventaire-carottage.md` ; `corepack pnpm scrape extraction --site carottage` → `content/carottage/**` bruts + `lib/seo/redirects-carottage.json` + `scripts/out/rapport-extraction-carottage.md`.

- [ ] **Step 1 : Exporter les helpers réutilisables de l'extraction Servicimmo**

L'ancien site FC est de la même génération technique que l'ancien servicimmo.fr (mêmes conteneurs `.section_category13` / `.navbar`) : on réutilise les 3 fonctions déjà éprouvées plutôt que de les dupliquer. Dans `scripts/lib/extraction.ts`, ajouter `export` devant leurs déclarations (aucun autre changement de corps) :

```ts
export function extraireHtmlPrincipal($: cheerio.CheerioAPI): string {
export async function geocoder(ville: string, cp: string): Promise<{ lat: number; lng: number }> {
export function extraireDateFr(texte: string): { date: string; index: number } | null {
```

- [ ] **Step 2 : Dispatch `--site` dans le script principal**

Remplacer la fonction `main()` de `scripts/scrape-ancien-site.ts` par :

```ts
function lireSite(): "servicimmo" | "carottage" {
  const i = process.argv.indexOf("--site");
  const val = i >= 0 ? process.argv[i + 1] : "servicimmo";
  if (val === "carottage" || val === "servicimmo") return val;
  console.error(`Site inconnu : ${val} (attendu : servicimmo | carottage)`);
  process.exit(1);
}

async function main(): Promise<void> {
  const mode = process.argv[2];
  const site = lireSite();

  if (site === "carottage") {
    const { inventaireCarottage, extractionCarottage } = await import("./lib/scrape-carottage");
    if (mode === "inventaire") await inventaireCarottage();
    else if (mode === "extraction") await extractionCarottage();
    else {
      console.error("Usage : pnpm scrape <inventaire|extraction> --site carottage");
      process.exit(1);
    }
    return;
  }

  if (mode === "inventaire") {
    await inventaire();
  } else if (mode === "extraction") {
    const { extraction } = await import("./lib/extraction");
    await extraction();
  } else {
    console.error("Usage : pnpm scrape <inventaire|extraction> [--site servicimmo|carottage]");
    process.exit(1);
  }
}

void main();
```

- [ ] **Step 3 : Implémenter l'inventaire + l'extraction FC**

```ts
// scripts/lib/scrape-carottage.ts
/**
 * Scraping one-shot de l'ancien france-carottage.fr (même CMS que l'ancien servicimmo.fr).
 *   corepack pnpm scrape inventaire --site carottage
 *   corepack pnpm scrape extraction --site carottage
 * Jamais exécuté dans le build Next.
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import * as cheerio from "cheerio";
import matter from "gray-matter";
import TurndownService from "turndown";

import { DEPARTEMENTS } from "@/lib/clients/francecarottage/departements";
import { extraireDateFr, extraireHtmlPrincipal, geocoder } from "./extraction";
import { classifyUrlCarottage, type UrlCarotteeClassee } from "./classify-carottage";

const BASE = "https://www.france-carottage.fr";
const OUT = path.join(process.cwd(), "scripts", "out");
const CONTENT = path.join(process.cwd(), "content", "carottage");
const turndown = new TurndownService({ headingStyle: "atx" });
const attendre = (ms: number) => new Promise((r) => setTimeout(r, ms));

type Redirection = { source: string; destination: string };

async function chargerUrls(): Promise<UrlCarotteeClassee[]> {
  const res = await fetch(`${BASE}/sitemap.xml`);
  if (!res.ok) throw new Error(`sitemap FC HTTP ${res.status}`);
  const xml = await res.text();
  return [...xml.matchAll(/<loc>(.*?)<\/loc>/g)]
    .flatMap((m) => (m[1] ? [m[1]] : []))
    .map(classifyUrlCarottage);
}

export async function inventaireCarottage(): Promise<void> {
  const urls = await chargerUrls();
  const par = (t: UrlCarotteeClassee["type"]) => urls.filter((u) => u.type === t);
  const tableau = (liste: UrlCarotteeClassee[]) =>
    liste.map((u) => `| \`${u.chemin}\` | ${u.slugPropose}${u.codePostal ? ` (${u.codePostal})` : ""} |`).join("\n");

  const md = [
    `# Inventaire France Carottage — ${urls.length} URLs`,
    ...(["ville", "departement", "expertise", "structurelle", "inconnue"] as const).flatMap((t) => [
      `\n## ${t} (${par(t).length})\n`,
      "| Ancienne URL | Slug proposé |",
      "|---|---|",
      tableau(par(t)),
    ]),
    "\n## À valider au palier humain FC",
    "- Comptes plausibles : ~191 villes, ~57 départements, ~8 expertises.",
    "- Trancher la destination 301 de chaque URL `inconnue` (par défaut : accueil).",
  ].join("\n");

  await mkdir(OUT, { recursive: true });
  await writeFile(path.join(OUT, "inventaire-carottage.md"), md, "utf8");
  console.log(`inventaire-carottage.md écrit — ${urls.length} URLs classées`);
}

/** Code département à partir du code postal (2 chiffres ; 2A/2B pour la Corse). */
function departementDepuisCp(cp: string): string {
  if (cp.startsWith("20")) return Number(cp) < 20200 ? "2a" : "2b";
  if (cp.startsWith("97") || cp.startsWith("98")) return cp.slice(0, 3);
  return cp.slice(0, 2);
}

export async function extractionCarottage(): Promise<void> {
  const urls = await chargerUrls();
  const redirections: Redirection[] = [];
  const anomalies: string[] = [];

  for (const dossier of ["villes", "departements", "expertises"]) {
    await mkdir(path.join(CONTENT, dossier), { recursive: true });
  }

  let echecsConsecutifs = 0;

  for (const u of urls) {
    if (u.type === "structurelle" || u.type === "inconnue") continue;
    await attendre(300);
    const res = await fetch(`${BASE}${u.chemin}`, {
      headers: { "user-agent": "PropulseoScraper/1.0 (migration france-carottage.fr)" },
    });
    if (!res.ok) {
      anomalies.push(`HTTP ${res.status} — ${u.chemin}`);
      echecsConsecutifs += 1;
      if (echecsConsecutifs > 10) {
        throw new Error(`BLOCKED : >10 échecs HTTP consécutifs (dernier : ${u.chemin})`);
      }
      continue;
    }
    echecsConsecutifs = 0;
    const $ = cheerio.load(await res.text());
    const titre = $("h1").first().text().trim() || $("title").text().trim();
    const metaTitle = $("title").text().trim();
    const metaDescription = $('meta[name="description"]').attr("content")?.trim() ?? "";
    const corpsMd = turndown.turndown(extraireHtmlPrincipal($));
    if (corpsMd.length < 300) anomalies.push(`Extraction courte (<300 c) — ${u.chemin}`);

    if (u.type === "ville") {
      const cp = u.codePostal ?? "75000";
      const nomVille =
        titre.replace(/amiante|hap|enrob[ée]s?|carottage|routiers?/gi, "").trim() || u.slugPropose;
      const { lat, lng } = await geocoder(nomVille, cp);
      const fm = {
        slug: u.slugPropose,
        ville: nomVille,
        codePostal: cp,
        departement: departementDepuisCp(cp),
        metaTitle,
        metaDescription:
          metaDescription || `Carottage et repérage amiante/HAP sur enrobés à ${nomVille} (${cp}).`,
        anciennesUrls: [u.chemin],
        lat,
        lng,
        brut: true,
      };
      await writeFile(
        path.join(CONTENT, "villes", `${u.slugPropose}.md`),
        matter.stringify(corpsMd, fm),
        "utf8",
      );
      redirections.push({ source: u.chemin, destination: `/zones/${u.slugPropose}` });
    } else if (u.type === "departement") {
      const parSlug = DEPARTEMENTS.find((d) => d.slug === u.slugPropose);
      const fm = {
        slug: u.slugPropose,
        nom: parSlug?.nom ?? titre.trim() || u.slugPropose,
        code: parSlug?.code ?? "00",
        villesPrincipales: [] as string[],
        metaTitle,
        metaDescription:
          metaDescription ||
          `Carottage et repérage amiante/HAP sur enrobés dans le département ${parSlug?.nom ?? u.slugPropose}.`,
        anciennesUrls: [u.chemin],
        brut: true,
      };
      if (!parSlug) anomalies.push(`Département hors table (code=00) — ${u.chemin}`);
      await writeFile(
        path.join(CONTENT, "departements", `${u.slugPropose}.md`),
        matter.stringify(corpsMd, fm),
        "utf8",
      );
      redirections.push({ source: u.chemin, destination: `/zones/${u.slugPropose}` });
    } else {
      const h1Texte = $("h1").first().text().trim();
      const infoDate = extraireDateFr(h1Texte);
      const fm: Record<string, unknown> = {
        slug: u.slugPropose,
        titre: (infoDate ? h1Texte.slice(0, infoDate.index) : h1Texte).replace(/[\s:–—-]+$/, "").trim() || titre,
        metaTitle,
        metaDescription: metaDescription || titre,
        anciennesUrls: [u.chemin],
        brut: true,
      };
      if (infoDate) fm["date"] = infoDate.date;
      await writeFile(
        path.join(CONTENT, "expertises", `${u.slugPropose}.md`),
        matter.stringify(corpsMd, fm),
        "utf8",
      );
      redirections.push({ source: u.chemin, destination: `/expertises/${u.slugPropose}` });
    }
  }

  // Structurelles (décision palier humain FC).
  redirections.push(
    { source: "/index.html", destination: "/" },
    { source: "/mentions-legales.html", destination: "/mentions-legales" },
  );

  await mkdir(path.join(process.cwd(), "lib", "seo"), { recursive: true });
  await writeFile(
    path.join(process.cwd(), "lib", "seo", "redirects-carottage.json"),
    JSON.stringify(redirections, null, 2),
    "utf8",
  );
  await writeFile(
    path.join(OUT, "rapport-extraction-carottage.md"),
    [
      `# Rapport extraction FC — ${redirections.length} redirections`,
      "",
      "## Anomalies",
      ...anomalies.map((a) => `- ${a}`),
    ].join("\n"),
    "utf8",
  );
  console.log(`Extraction FC finie : ${redirections.length} redirections, ${anomalies.length} anomalies`);
}
```

Note : le département parent d'une ville est dérivé du code postal (`departementDepuisCp`), et le `code`/`nom` d'une page département vient de la table statique `DEPARTEMENTS` (lookup par `slug`). Les `villesPrincipales` restent `[]` au scrape : elles sont renseignées à la reformulation (Task FC4.4).

- [ ] **Step 4 : Typecheck + tests puis commit du script (sans exécuter encore l'extraction réseau)**

```bash
corepack pnpm typecheck && corepack pnpm test
git add scripts/scrape-ancien-site.ts scripts/lib/extraction.ts scripts/lib/scrape-carottage.ts
git commit -m "feat(carottage): scraping multi-site (--site carottage) inventaire + extraction"
```

---

### Task FC1.5 : Middleware multi-domaines + layout FC + e2e hosts

**Files:**
- Modify: `middleware.ts` (composer, ne pas écraser)
- Create: `lib/carottage/hosts.ts`, `app/carottage/layout.tsx`, `app/carottage/page.tsx` (placeholder remplacé en FC2)
- Test: `e2e/carottage-hosts.spec.ts`

**Interfaces:**
- Produces : `estHostCarottage(host: string | null): boolean` ; réécriture `host FC + pathname → /carottage<pathname>` (URLs propres) ; blocage `/carottage/*` sur un host non-FC (anti-duplicate) ; layout FC (Sora/Inter, HeaderFC/FooterFC branchés en FC2).

- [ ] **Step 1 : Détection des hosts FC**

```ts
// lib/carottage/hosts.ts
/** Hosts (sans port) reconnus comme France Carottage — pilotés par env. */
function hostsCarottage(): string[] {
  return (process.env.NEXT_PUBLIC_CAROTTAGE_HOSTS ?? "")
    .split(",")
    .map((h) => h.trim().toLowerCase())
    .filter(Boolean);
}

/** Normalise un header Host (retire le port) et teste l'appartenance à FC. */
export function estHostCarottage(host: string | null | undefined): boolean {
  if (!host) return false;
  const sansPort = host.split(":")[0]?.toLowerCase() ?? "";
  return hostsCarottage().includes(sansPort);
}
```

- [ ] **Step 2 : Composer le middleware (fast-path FC EN TÊTE, logique SI inchangée)**

Dans `middleware.ts`, ajouter l'import puis un bloc en **tout début** de `middleware()` — avant la lecture des vars Supabase — pour que la logique Servicimmo existante ne soit jamais touchée sur le host FC :

```ts
import { estHostCarottage } from "@/lib/carottage/hosts";
```

```ts
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const host = request.headers.get("host");

  // ── Fast-path France Carottage : réécriture host FC → segment /carottage ──
  if (estHostCarottage(host)) {
    // Déjà réécrit (évite la boucle) : laisser passer.
    if (pathname.startsWith("/carottage")) return NextResponse.next();
    const url = request.nextUrl.clone();
    url.pathname = pathname === "/" ? "/carottage" : `/carottage${pathname}`;
    return NextResponse.rewrite(url);
  }

  // Anti-duplicate cross-domaine : /carottage/* n'est PAS servi depuis le host Servicimmo.
  if (pathname.startsWith("/carottage")) {
    const cible = process.env.NEXT_PUBLIC_CAROTTAGE_URL ?? "https://www.france-carottage.fr";
    return NextResponse.redirect(new URL(pathname.replace(/^\/carottage/, "") || "/", cible), 308);
  }

  // ── Logique Servicimmo existante (inchangée à partir d'ici) ──
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  // … (reste du middleware Supabase tel quel) …
```

Attention : renommer la variable locale du bloc Supabase si collision (`url` est déjà réutilisé plus bas pour `NEXT_PUBLIC_SUPABASE_URL`). Conserver le nom d'origine du bloc SI ; la variable `url` de la redirection FC est locale au `if` et n'entre pas en conflit. Le `matcher` existant laisse déjà passer `/sitemap.xml`, `/robots.txt` (extensions non exclues) : le fast-path FC les réécrit vers `/carottage/sitemap.xml` et `/carottage/robots.xml` (exposés en FC6).

- [ ] **Step 3 : Layout FC (polices Sora/Inter scopées, chrome FC)**

En FC1 le layout branche des placeholders légers ; HeaderFC/FooterFC réels arrivent en FC2. Pour éviter deux patterns, on crée directement le layout définitif avec des composants qui existeront (créés en FC2) — donc **en FC1 on met un chrome minimal inline**, remplacé par `<HeaderFC/>`/`<FooterFC/>` en FC2 :

```tsx
// app/carottage/layout.tsx
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Sora, Inter } from "next/font/google";

import { carottageUrl } from "@/lib/clients/francecarottage/urls";

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  display: "swap",
});
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

/** metadataBase FC : les canonicals relatifs des pages carottage résolvent sur le domaine FC. */
export const metadata: Metadata = {
  metadataBase: new URL(carottageUrl("/")),
  title: {
    default: "France Carottage — Carottage routier & repérage amiante/HAP enrobés",
    template: "%s | France Carottage",
  },
  robots: { index: true, follow: true },
};

/** Layout des pages France Carottage (segment /carottage, URLs propres via middleware). */
export default function CarottageLayout({ children }: { children: ReactNode }) {
  return (
    <div
      className={`${sora.variable} ${inter.variable} min-h-dvh bg-[color:var(--fc-blanc-casse)] font-[family-name:var(--font-inter)] text-[color:var(--fc-noir)]`}
    >
      {/* HeaderFC / FooterFC branchés en FC2 — chrome minimal en FC1. */}
      <main>{children}</main>
    </div>
  );
}
```

```tsx
// app/carottage/page.tsx
/** Placeholder socle FC1 — remplacé par la home réelle en FC2. */
export default function CarottageHomePlaceholder() {
  return (
    <section className="mx-auto max-w-[var(--container,1280px)] px-6 py-24 md:px-8">
      <p className="font-[family-name:var(--font-sora)] text-[13px] font-semibold uppercase tracking-[0.18em] text-[color:var(--fc-rouge)]">
        France Carottage
      </p>
      <h1 className="mt-3 font-[family-name:var(--font-sora)] text-[40px] font-extrabold leading-[1.05] text-[color:var(--fc-noir)] sm:text-[56px]">
        Socle multi-domaines en place.
      </h1>
      <p className="mt-4 max-w-xl text-[15.5px] leading-relaxed text-[color:var(--fc-gris)]">
        Home, expertises et zones arrivent dans les tranches suivantes.
      </p>
    </section>
  );
}
```

Note : les tokens `--fc-*` sont déclarés en FC2 (Task FC2.1). En FC1, avant leur déclaration, le placeholder s'affichera sans couleur FC (dégradation propre) ; le socle e2e teste le **routage**, pas le style. On peut aussi déclarer les tokens dès maintenant en avançant le Step 1 de FC2.1 — au choix de l'exécutant, noté dans le commit.

- [ ] **Step 4 : e2e — routage par host (critère de passage FC1)**

Le test simule le host via l'en-tête `Host`. Prérequis : `.env.local` contient `NEXT_PUBLIC_CAROTTAGE_HOSTS=carottage.localhost,...` (Task FC1.1). Le serveur e2e (`pnpm dev`) lit ce `.env.local`.

```ts
// e2e/carottage-hosts.spec.ts
import { expect, test } from "@playwright/test";

const HOST_FC = "carottage.localhost";

test("host FC : la racine sert la home carottage (rewrite)", async ({ request }) => {
  const res = await request.get("/", { headers: { host: HOST_FC } });
  expect(res.status()).toBe(200);
  expect(await res.text()).toContain("France Carottage");
});

test("host FC : les URLs propres ne montrent pas /carottage", async ({ request }) => {
  const res = await request.get("/", { headers: { host: HOST_FC } });
  // Réécriture interne : le contenu carottage est servi sans redirection visible.
  expect(res.url()).not.toContain("/carottage");
});

test("host Servicimmo : la home reste la home Servicimmo (aucune régression)", async ({
  request,
}) => {
  const res = await request.get("/");
  expect(res.status()).toBe(200);
  expect(await res.text()).toContain("Servicimmo");
});

test("host Servicimmo : /carottage/* est bloqué (anti-duplicate, 3xx)", async ({ request }) => {
  const res = await request.get("/carottage", { maxRedirects: 0 });
  expect([301, 307, 308]).toContain(res.status());
});
```

- [ ] **Step 5 : Exécuter + commit**

```bash
corepack pnpm typecheck
corepack pnpm test:e2e e2e/carottage-hosts.spec.ts
git add middleware.ts lib/carottage app/carottage/layout.tsx app/carottage/page.tsx e2e/carottage-hosts.spec.ts
git commit -m "feat(carottage): middleware multi-domaines + layout FC + e2e routage par host"
```

Expected : 4 tests PASS. Si le test host Servicimmo échoue, vérifier que le fast-path FC n'intercepte que les hosts listés (aucune régression sur `localhost`).

---

### Task FC1.6 : Inventaire FC réel

**Files:**
- Create (généré, non commité tant que non relu) : `scripts/out/inventaire-carottage.md`

- [ ] **Step 1 : Exécuter l'inventaire**

Run : `corepack pnpm scrape inventaire --site carottage`
Expected : `inventaire-carottage.md écrit — ~260 URLs classées`. Vérifier des comptes plausibles : ~191 villes, ~57 départements, ~8 expertises, 2-3 structurelles, peu/pas d'`inconnue`.

- [ ] **Step 2 : Contrôle de cohérence**

Ouvrir `scripts/out/inventaire-carottage.md`. Repérer : villes sans code postal détecté (ne devraient pas exister), départements dont le slug n'existe pas dans `DEPARTEMENTS`, `inconnue` inattendues (ex: `espace-client`).

---

### 🔶 PALIER HUMAIN FC1 — Inventaire (bloquant)

Présenter à Etienne : comptes par type, liste des expertises avec slugs proposés, URLs `inconnues`. Il tranche :
1. la **destination 301 de chaque URL `inconnue`** (par défaut : accueil FC) ;
2. la confirmation que le **lien ESPACE CLIENT** reste un lien externe inchangé (spec §4) ;
3. tout renommage de slug d'expertise souhaité.

Committer ensuite l'inventaire validé :

```bash
git add scripts/out/inventaire-carottage.md
git commit -m "docs(carottage): inventaire FC valide (palier humain FC1)"
```

---

### Task FC1.7 : Extraction des contenus bruts FC + redirects-carottage.json

**Files:**
- Create (générés) : `content/carottage/{villes,departements,expertises}/*.md`, `lib/seo/redirects-carottage.json`, `scripts/out/rapport-extraction-carottage.md`

**Interfaces:**
- Consumes : décisions du palier FC1.
- Produces : contenus bruts (`brut: true`) + `redirects-carottage.json` de forme `{ source: string; destination: string }[]`.

- [ ] **Step 1 : Exécuter l'extraction** (après le palier uniquement)

Run : `corepack pnpm scrape extraction --site carottage` (durée ~2 min, 300 ms entre requêtes)
Expected : `Extraction FC finie : ~260 redirections, <20 anomalies`. Vérifier : `content/carottage/villes` ≈ 191 fichiers, `departements` ≈ 57, `expertises` ≈ 8.

- [ ] **Step 2 : Traiter les anomalies**

Ouvrir `scripts/out/rapport-extraction-carottage.md`. Pour chaque « extraction courte » : ouvrir la page d'origine, compléter le corps Markdown à la main. Pour chaque « Département hors table (code=00) » : corriger le `code`/`nom` dans le fichier `content/carottage/departements/<slug>.md` (réconcilier le slug FC avec `DEPARTEMENTS` — ex. accent ou tiret différent).

- [ ] **Step 3 : Redirections des `inconnues`** — ajouter à la main dans `lib/seo/redirects-carottage.json` les entrées décidées au palier (destinations des `inconnues`), au format `{ "source": "/…", "destination": "/…" }`.

- [ ] **Step 4 : Vérifier que les collections se chargent** (le schéma casse le build sur du frontmatter invalide, y compris `brut`)

```bash
corepack pnpm tsx -e "import('./lib/content/load-carottage').then(async (m)=>{const v=await m.loadVillesFC();const d=await m.loadDepartementsFC();const e=await m.loadExpertises();console.log('villes',v.length,'departements',d.length,'expertises',e.length);})"
```

Expected : comptes ≈ 191 / 57 / 8. Toute exception `Frontmatter invalide` pointe le fichier à corriger.

- [ ] **Step 5 : Commit**

```bash
corepack pnpm typecheck && corepack pnpm test
git add content/carottage lib/seo/redirects-carottage.json scripts/out/rapport-extraction-carottage.md
git commit -m "feat(carottage): extraction contenus bruts FC + redirections 301"
```

**Critère de passage FC1 :** e2e `carottage-hosts` vert (host FC → pages FC, host Servicimmo inchangé) ; palier humain FC validé ; collections FC chargées sans erreur.

---

## Tranche FC2 — Design system FC + home

### Task FC2.1 : Tokens `--fc-*` + primitives FC (Surtitre, ArianeFC)

**Files:**
- Modify: `app/globals.css` (tokens FC + styles prose FC)
- Create: `components/carottage/SurtitreFC.tsx`, `components/carottage/ArianeFC.tsx`

**Interfaces:**
- Produces : tokens `--fc-rouge`/`--fc-noir`/`--fc-blanc-casse`/`--fc-gris` ; `SurtitreFC({ children })` (surtitre rouge + filet) ; `ArianeFC({ segments })` (fil + BreadcrumbList JSON-LD) ; classe `.fc-prose`.

- [ ] **Step 1 : Tokens FC dans `@theme inline`**

Dans `app/globals.css`, ajouter dans le bloc `@theme inline` (après le bloc `--color-devis-*`) :

```css
  /* ────────────────────────────────────────────────────────────────────
     France Carottage — identité rouge/noir/blanc (segment app/carottage/).
     --fc-rouge à re-pipeter sur le logo réel avant prod. Rouge = accent
     chirurgical ; noir/blanc dominants. INTERDIT dans components/marketing/.
     ──────────────────────────────────────────────────────────────────── */
  --fc-rouge: #b32024;
  --fc-rouge-fonce: #8c161a;
  --fc-noir: #111113;
  --fc-blanc-casse: #f5f4f2;
  --fc-gris: #6b6e73;
  --fc-gris-clair: #e4e3e0;
```

- [ ] **Step 2 : Styles prose FC (corps expertises / zones)**

À la fin de `app/globals.css`, ajouter (distinct de `.article-prose` Servicimmo : intertitres noirs, liens rouges, filet rouge sous les h2) :

```css
/* Corps d'article France Carottage (expertises, zones) — noir/blanc + rouge accent */
.fc-prose {
  font-size: 15.5px;
  line-height: 1.78;
  color: #2b2c2f;
}
.fc-prose h2,
.fc-prose h3 {
  font-family: var(--font-sora);
  color: var(--fc-noir);
  letter-spacing: -0.01em;
}
.fc-prose h2 {
  margin-top: 2.2rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid var(--fc-gris-clair);
}
.fc-prose a {
  color: var(--fc-rouge);
  text-decoration: underline;
  text-underline-offset: 2px;
}
.fc-prose strong {
  color: var(--fc-noir);
}
```

- [ ] **Step 3 : SurtitreFC (accent rouge + filet)**

```tsx
// components/carottage/SurtitreFC.tsx
import type { ReactNode } from "react";

/** Surtitre FC : libellé rouge capitalisé précédé d'un filet rouge court. Signature visuelle FC. */
export function SurtitreFC({ children }: { children: ReactNode }) {
  return (
    <p className="inline-flex items-center gap-3 font-[family-name:var(--font-sora)] text-[12.5px] font-bold uppercase tracking-[0.2em] text-[color:var(--fc-rouge)]">
      <span aria-hidden className="h-[2px] w-8 bg-[color:var(--fc-rouge)]" />
      {children}
    </p>
  );
}
```

- [ ] **Step 4 : ArianeFC (fil + BreadcrumbList)**

Primitive FC distincte de `Ariane` SI : séparateur `/`, couleurs FC. Réutilise la primitive neutre `JsonLd`.

```tsx
// components/carottage/ArianeFC.tsx
import Link from "next/link";

import { JsonLd } from "@/components/seo/JsonLd";
import { carottageUrl } from "@/lib/clients/francecarottage/urls";

type Segment = { label: string; href: string };

export function ArianeFC({ segments }: { segments: Segment[] }) {
  const tous: Segment[] = [{ label: "Accueil", href: "/" }, ...segments];
  return (
    <nav
      aria-label="Fil d'Ariane"
      className="mx-auto max-w-[var(--container,1280px)] px-6 py-4 md:px-8"
    >
      <ol className="flex flex-wrap items-center gap-2 text-[12.5px] text-[color:var(--fc-gris)]">
        {tous.map((s, i) => (
          <li key={s.href} className="flex items-center gap-2">
            {i > 0 && <span aria-hidden className="text-[color:var(--fc-gris-clair)]">/</span>}
            {i === tous.length - 1 ? (
              <span aria-current="page" className="font-semibold text-[color:var(--fc-noir)]">
                {s.label}
              </span>
            ) : (
              <Link href={s.href} className="hover:text-[color:var(--fc-rouge)]">
                {s.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: tous.map((s, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: s.label,
            item: carottageUrl(s.href),
          })),
        }}
      />
    </nav>
  );
}
```

- [ ] **Step 5 : Typecheck + commit**

```bash
corepack pnpm typecheck
git add app/globals.css components/carottage/SurtitreFC.tsx components/carottage/ArianeFC.tsx
git commit -m "feat(carottage): tokens --fc-*, prose FC, surtitre + fil d'ariane FC"
```

---

### Task FC2.2 : HeaderFC + FooterFC + cross-link animé (côté FC)

**Files:**
- Create: `components/carottage/LienServicimmo.tsx`, `components/carottage/HeaderFC.tsx`, `components/carottage/FooterFC.tsx`
- Modify: `app/carottage/layout.tsx` (brancher HeaderFC/FooterFC)

**Interfaces:**
- Consumes : `francecarottageConfig`, `servicimmoUrl`, `loadDepartementsFC`, `loadExpertises`.
- Produces : `LienServicimmo()` (pill animé vers Servicimmo) ; `HeaderFC()` (bandeau noir + barre blanche, CTA rouge `/devis`) ; `FooterFC()` (async, maillage départements majeurs + expertises).

- [ ] **Step 1 : Cross-link animé vers la marque sœur (côté FC → Servicimmo)**

Distinct visuellement du header : pill sombre, logo Servicimmo, glissement du libellé + flèche au hover (250 ms), même onglet, `aria-label` explicite. L'URL vient de l'env (préprod → prod sans code).

```tsx
// components/carottage/LienServicimmo.tsx
import Link from "next/link";
import { ArrowUpRightIcon } from "lucide-react";

import { servicimmoUrl } from "@/lib/clients/francecarottage/urls";

/**
 * Bouton pill vers le site de la marque sœur Servicimmo (diagnostic immobilier).
 * Hover : glissement du libellé + flèche, 250 ms — cohérent avec les hovers FC.
 */
export function LienServicimmo() {
  return (
    <Link
      href={servicimmoUrl("/")}
      aria-label="Découvrir Servicimmo, notre société sœur de diagnostic immobilier (même onglet)"
      className="group inline-flex items-center gap-2 overflow-hidden rounded-full border border-white/15 bg-white/5 px-4 py-2 font-[family-name:var(--font-sora)] text-[12.5px] font-semibold text-white/80 transition-colors duration-[250ms] hover:border-white/30 hover:text-white"
    >
      <span aria-hidden className="h-2 w-2 shrink-0 rounded-full bg-[color:var(--color-si-lime,#e6e900)]" />
      <span className="inline-flex items-center gap-1.5">
        <span className="hidden sm:inline text-white/50">Société sœur</span>
        <span className="font-bold">Servicimmo</span>
      </span>
      <ArrowUpRightIcon
        className="h-3.5 w-3.5 shrink-0 -translate-x-1 opacity-0 transition-all duration-[250ms] group-hover:translate-x-0 group-hover:opacity-100"
        aria-hidden
      />
    </Link>
  );
}
```

Note : `--color-si-lime` est ici une simple pastille de rappel de la marque sœur (valeur littérale de secours `#e6e900`), pas un token de layout FC — usage toléré et sans dépendance au thème SI.

- [ ] **Step 2 : HeaderFC (bandeau noir + barre blanche, CTA rouge)**

Structure volontairement différente du header Servicimmo (pas de bandeau pétrole, pas de barre crème) : bandeau utilitaire **noir** (tél + zone nationale + cross-link), barre blanche épurée (logo texte massif, nav Sora, CTA rouge plein). Sticky, ombre au scroll.

```tsx
// components/carottage/HeaderFC.tsx
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { MapPinnedIcon, MenuIcon, PhoneIcon, XIcon } from "lucide-react";

import { LienServicimmo } from "@/components/carottage/LienServicimmo";
import { francecarottageConfig } from "@/lib/clients/francecarottage/config";

const NAV: { label: string; href: string }[] = [
  { label: "Accueil", href: "/" },
  { label: "Expertises", href: "/expertises" },
  { label: "Zones", href: "/zones" },
  { label: "Contact", href: "/contact" },
];

export function HeaderFC() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 14);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="sticky top-0 z-[900]">
      {/* Bandeau utilitaire noir */}
      <div className="bg-[color:var(--fc-noir)] text-white/70">
        <div className="mx-auto flex max-w-[var(--container,1280px)] items-center justify-between gap-4 px-6 py-2 font-[family-name:var(--font-sora)] text-[12px] md:px-8">
          <span className="inline-flex items-center gap-1.5">
            <MapPinnedIcon className="h-3.5 w-3.5 text-[color:var(--fc-rouge)]" aria-hidden />
            Interventions {francecarottageConfig.zoneIntervention}
          </span>
          <div className="flex items-center gap-4">
            <a
              href={francecarottageConfig.contact.telephoneHref}
              className="inline-flex items-center gap-1.5 font-bold text-white transition-colors hover:text-[color:var(--fc-rouge)]"
            >
              <PhoneIcon className="h-3.5 w-3.5" aria-hidden />
              {francecarottageConfig.contact.telephone}
            </a>
            <LienServicimmo />
          </div>
        </div>
      </div>

      {/* Barre principale blanche */}
      <div
        className={`border-b border-[color:var(--fc-gris-clair)] bg-white transition-shadow ${
          scrolled ? "shadow-[0_10px_30px_rgba(17,17,19,.08)]" : ""
        }`}
      >
        <div className="mx-auto flex max-w-[var(--container,1280px)] items-center justify-between gap-6 px-6 py-[15px] md:px-8">
          <Link href="/" aria-label="Accueil France Carottage" className="inline-flex flex-none items-center gap-2">
            <span aria-hidden className="h-6 w-[6px] rounded-full bg-[color:var(--fc-rouge)]" />
            <span className="font-[family-name:var(--font-sora)] text-[19px] font-extrabold uppercase tracking-[-0.01em] text-[color:var(--fc-noir)]">
              France<span className="text-[color:var(--fc-rouge)]"> Carottage</span>
            </span>
          </Link>

          <nav aria-label="Navigation principale" className="hidden items-center gap-8 lg:flex">
            {NAV.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="group relative font-[family-name:var(--font-sora)] text-[14px] font-semibold text-[color:var(--fc-noir)] transition-colors hover:text-[color:var(--fc-rouge)]"
              >
                {link.label}
                <span
                  aria-hidden
                  className="absolute -bottom-1.5 left-0 h-[2px] w-0 bg-[color:var(--fc-rouge)] transition-[width] duration-[250ms] group-hover:w-full"
                />
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/devis"
              className="inline-flex items-center rounded-[4px] bg-[color:var(--fc-rouge)] px-5 py-3 font-[family-name:var(--font-sora)] text-[13.5px] font-bold uppercase tracking-wide text-white transition-colors hover:bg-[color:var(--fc-rouge-fonce)]"
            >
              Devis chantier
            </Link>
            <button
              type="button"
              className="cursor-pointer border-none bg-transparent p-1 text-[color:var(--fc-noir)] lg:hidden"
              aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
              onClick={() => setOpen((v) => !v)}
            >
              {open ? <XIcon className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {open && (
        <nav
          aria-label="Navigation mobile"
          className="flex flex-col border-b border-[color:var(--fc-gris-clair)] bg-white px-6 pb-4 pt-2 lg:hidden"
        >
          {NAV.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="border-b border-[color:var(--fc-gris-clair)] py-3 font-[family-name:var(--font-sora)] text-[14px] font-semibold text-[color:var(--fc-noir)] last:border-b-0 hover:text-[color:var(--fc-rouge)]"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
```

- [ ] **Step 3 : FooterFC (async, maillage + cross-link)**

```tsx
// components/carottage/FooterFC.tsx
import Link from "next/link";
import { PhoneIcon } from "lucide-react";

import { LienServicimmo } from "@/components/carottage/LienServicimmo";
import { francecarottageConfig } from "@/lib/clients/francecarottage/config";
import { loadDepartementsFC, loadExpertises } from "@/lib/content/load-carottage";

/** Footer FC — fond noir, maillage départements majeurs + expertises, rappel marque sœur. */
export async function FooterFC() {
  const [departements, expertises] = await Promise.all([loadDepartementsFC(), loadExpertises()]);
  const deptsMajeurs = departements.slice(0, 8);
  const expertisesTop = expertises.slice(0, 6);

  return (
    <footer className="bg-[color:var(--fc-noir)] text-white/70">
      <div className="mx-auto grid max-w-[var(--container,1280px)] gap-10 px-6 py-14 md:grid-cols-4 md:px-8">
        <div>
          <p className="font-[family-name:var(--font-sora)] text-[18px] font-extrabold uppercase text-white">
            France<span className="text-[color:var(--fc-rouge)]"> Carottage</span>
          </p>
          <p className="mt-3 text-[13.5px] leading-relaxed">{francecarottageConfig.zoneIntervention} · carottage routier & repérage amiante/HAP sur enrobés.</p>
          <a
            href={francecarottageConfig.contact.telephoneHref}
            className="mt-4 inline-flex items-center gap-2 font-[family-name:var(--font-sora)] text-[15px] font-bold text-white hover:text-[color:var(--fc-rouge)]"
          >
            <PhoneIcon className="h-4 w-4" aria-hidden />
            {francecarottageConfig.contact.telephone}
          </a>
          <div className="mt-5">
            <LienServicimmo />
          </div>
        </div>

        <div>
          <p className="font-[family-name:var(--font-sora)] text-[12.5px] font-bold uppercase tracking-wide text-white">Départements</p>
          <ul className="mt-3 space-y-2">
            {deptsMajeurs.map((d) => (
              <li key={d.slug}>
                <Link href={`/zones/${d.slug}`} className="text-[13.5px] hover:text-[color:var(--fc-rouge)]">
                  {d.nom} ({d.code})
                </Link>
              </li>
            ))}
            <li>
              <Link href="/zones" className="text-[13.5px] font-semibold text-white hover:text-[color:var(--fc-rouge)]">
                Toutes les zones →
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="font-[family-name:var(--font-sora)] text-[12.5px] font-bold uppercase tracking-wide text-white">Expertises</p>
          <ul className="mt-3 space-y-2">
            {expertisesTop.map((e) => (
              <li key={e.slug}>
                <Link href={`/expertises/${e.slug}`} className="text-[13.5px] hover:text-[color:var(--fc-rouge)]">
                  {e.titre}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="font-[family-name:var(--font-sora)] text-[12.5px] font-bold uppercase tracking-wide text-white">Société</p>
          <ul className="mt-3 space-y-2">
            <li><Link href="/contact" className="text-[13.5px] hover:text-[color:var(--fc-rouge)]">Contact</Link></li>
            <li><Link href="/devis" className="text-[13.5px] hover:text-[color:var(--fc-rouge)]">Demander un devis</Link></li>
            <li><Link href="/mentions-legales" className="text-[13.5px] hover:text-[color:var(--fc-rouge)]">Mentions légales</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto max-w-[var(--container,1280px)] px-6 py-5 text-[12px] text-white/45 md:px-8">
          © {new Date().getFullYear()} {francecarottageConfig.raisonSociale}. Tous droits réservés.
        </div>
      </div>
    </footer>
  );
}
```

- [ ] **Step 4 : Brancher dans le layout FC**

Dans `app/carottage/layout.tsx`, importer et remplacer le chrome minimal :

```tsx
import { HeaderFC } from "@/components/carottage/HeaderFC";
import { FooterFC } from "@/components/carottage/FooterFC";
```

```tsx
    <div
      className={`${sora.variable} ${inter.variable} flex min-h-dvh flex-col bg-[color:var(--fc-blanc-casse)] font-[family-name:var(--font-inter)] text-[color:var(--fc-noir)]`}
    >
      <HeaderFC />
      <main className="flex-1">{children}</main>
      <FooterFC />
    </div>
```

- [ ] **Step 5 : Vérifier en local + commit**

```bash
corepack pnpm typecheck
corepack pnpm dev
```

Ouvrir `http://carottage.localhost:3000/` (MCP Playwright, host FC via `/etc/hosts` local ou header) : header noir/blanc, CTA rouge, cross-link animé au hover, footer maillé. Screenshots desktop + 375 px.

```bash
git add components/carottage/LienServicimmo.tsx components/carottage/HeaderFC.tsx components/carottage/FooterFC.tsx app/carottage/layout.tsx
git commit -m "feat(carottage): HeaderFC + FooterFC + cross-link anime vers Servicimmo"
```

---

### Task FC2.3 : HeroFC — pleine largeur, image chantier, typographie massive

**Files:**
- Create: `components/carottage/HeroFC.tsx`
- Asset: `public/img/carottage/hero-chantier.jpg` (photo chantier récupérée au scraping si qualité suffisante, sinon placeholder à remplacer)

**Interfaces:**
- Produces : `HeroFC()` — hero structurellement différent du hero Servicimmo (pas de panneau : image plein cadre, voile noir, titre massif, souligné rouge, double CTA).

- [ ] **Step 1 : Composant**

```tsx
// components/carottage/HeroFC.tsx
import Image from "next/image";
import Link from "next/link";
import { ArrowRightIcon, PhoneIcon } from "lucide-react";

import { francecarottageConfig } from "@/lib/clients/francecarottage/config";

/**
 * Hero France Carottage — pleine largeur image de chantier + voile sombre,
 * typographie massive Sora, accent rouge sur un mot-clé. Rien à voir avec le
 * hero « panneau » de Servicimmo : ici l'image porte tout, le texte est posé dessus.
 */
export function HeroFC() {
  return (
    <section className="relative isolate overflow-hidden bg-[color:var(--fc-noir)]">
      <Image
        src="/img/carottage/hero-chantier.jpg"
        alt="Carottage d'enrobés routiers sur un chantier de voirie"
        fill
        priority
        sizes="100vw"
        className="object-cover opacity-45"
      />
      {/* Voile dégradé pour la lisibilité du texte */}
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-r from-[color:var(--fc-noir)] via-[color:var(--fc-noir)]/80 to-transparent"
      />
      <div className="relative mx-auto max-w-[var(--container,1280px)] px-6 py-24 md:px-8 md:py-32">
        <p className="inline-flex items-center gap-3 font-[family-name:var(--font-sora)] text-[12.5px] font-bold uppercase tracking-[0.22em] text-white/70">
          <span aria-hidden className="h-[2px] w-8 bg-[color:var(--fc-rouge)]" />
          Carottage routier · Amiante & HAP · {francecarottageConfig.zoneIntervention}
        </p>
        <h1 className="mt-5 max-w-3xl font-[family-name:var(--font-sora)] text-[44px] font-extrabold leading-[1.02] tracking-[-0.02em] text-white sm:text-[62px]">
          Le repérage amiante/HAP sur{" "}
          <span className="relative whitespace-nowrap text-white">
            enrobés
            <span aria-hidden className="absolute -bottom-1 left-0 h-[6px] w-full bg-[color:var(--fc-rouge)]" />
          </span>{" "}
          avant vos travaux.
        </h1>
        <p className="mt-6 max-w-xl text-[16px] leading-relaxed text-white/75">
          Prélèvements par carottage, analyses conformes et rapports exploitables pour vos chantiers
          de voirie, réseaux et bâtiment — partout en France, sous 24 à 48 h.
        </p>
        <div className="mt-9 flex flex-wrap items-center gap-4">
          <Link
            href="/devis"
            className="inline-flex items-center gap-2 rounded-[4px] bg-[color:var(--fc-rouge)] px-7 py-4 font-[family-name:var(--font-sora)] text-[14.5px] font-bold uppercase tracking-wide text-white transition-colors hover:bg-[color:var(--fc-rouge-fonce)]"
          >
            Demander un devis
            <ArrowRightIcon className="h-4 w-4" aria-hidden />
          </Link>
          <a
            href={francecarottageConfig.contact.telephoneHref}
            className="inline-flex items-center gap-2 rounded-[4px] border border-white/25 px-7 py-4 font-[family-name:var(--font-sora)] text-[14.5px] font-bold text-white transition-colors hover:border-white/60"
          >
            <PhoneIcon className="h-4 w-4" aria-hidden />
            {francecarottageConfig.contact.telephone}
          </a>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2 : Asset hero**

Récupérer une photo chantier du site actuel (repérée au scraping) et la déposer en `public/img/carottage/hero-chantier.jpg` (paysage, ≥ 1920 px de large, optimisée). Si aucune photo exploitable, déposer un placeholder sombre temporaire de mêmes dimensions et le noter dans le commit (« asset à remplacer »).

- [ ] **Step 3 : Typecheck + commit**

```bash
corepack pnpm typecheck
git add components/carottage/HeroFC.tsx public/img/carottage/hero-chantier.jpg
git commit -m "feat(carottage): hero pleine largeur image chantier + typographie massive"
```

---

### Task FC2.4 : Sections home + CtaDevisFC + assemblage

**Files:**
- Create: `components/carottage/CtaDevisFC.tsx`, `components/carottage/home/MetierFC.tsx`, `components/carottage/home/ProcessFC.tsx`, `components/carottage/home/ReseauNationalFC.tsx`, `components/carottage/home/ChiffresFC.tsx`
- Modify: `app/carottage/page.tsx` (remplace le placeholder), `app/carottage/layout.tsx` (JSON-LD LocalBusiness posé en FC6 — pas ici)

**Interfaces:**
- Consumes : `SurtitreFC`, `Reveal` (primitive neutre), `francecarottageConfig`.
- Produces : `CtaDevisFC({ titre?, sousTitre? })` ; 4 sections home distinctes du langage Servicimmo.

- [ ] **Step 1 : CtaDevisFC (bloc rouge plein, distinct du CTA pétrole SI)**

```tsx
// components/carottage/CtaDevisFC.tsx
import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";

import { francecarottageConfig } from "@/lib/clients/francecarottage/config";

type Props = { titre?: string; sousTitre?: string };

/** CTA devis FC — bandeau rouge plein pleine largeur, unique tunnel de conversion. */
export function CtaDevisFC({
  titre = "Un chantier à repérer ?",
  sousTitre = "Décrivez votre projet, recevez un devis chiffré sous 24 h ouvrées.",
}: Props) {
  return (
    <section className="bg-[color:var(--fc-rouge)]">
      <div className="mx-auto flex max-w-[var(--container,1280px)] flex-col items-start gap-6 px-6 py-14 md:flex-row md:items-center md:justify-between md:px-8">
        <div>
          <h2 className="font-[family-name:var(--font-sora)] text-[26px] font-extrabold leading-tight text-white sm:text-[32px]">
            {titre}
          </h2>
          <p className="mt-2 text-[15px] text-white/85">{sousTitre}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/devis"
            className="inline-flex items-center gap-2 rounded-[4px] bg-white px-7 py-4 font-[family-name:var(--font-sora)] text-[14px] font-bold uppercase tracking-wide text-[color:var(--fc-rouge)] transition-transform hover:-translate-y-0.5"
          >
            Demander un devis
            <ArrowRightIcon className="h-4 w-4" aria-hidden />
          </Link>
          <a
            href={francecarottageConfig.contact.telephoneHref}
            className="inline-flex items-center rounded-[4px] border border-white/40 px-7 py-4 font-[family-name:var(--font-sora)] text-[14px] font-bold text-white transition-colors hover:border-white"
          >
            {francecarottageConfig.contact.telephone}
          </a>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2 : MetierFC (3 domaines : voirie / réseaux / bâtiment)**

```tsx
// components/carottage/home/MetierFC.tsx
import { Building2Icon, RouteIcon, WavesIcon } from "lucide-react";

import { Reveal } from "@/components/marketing/Reveal";
import { SurtitreFC } from "@/components/carottage/SurtitreFC";

const DOMAINES = [
  {
    icone: RouteIcon,
    titre: "Voirie & chaussées",
    texte:
      "Carottage d'enrobés et repérage amiante/HAP avant rabotage, réfection ou élargissement de chaussée.",
  },
  {
    icone: WavesIcon,
    titre: "Réseaux & tranchées",
    texte:
      "Prélèvements ciblés avant terrassement pour la pose ou la reprise de réseaux enterrés.",
  },
  {
    icone: Building2Icon,
    titre: "Bâtiment & parkings",
    texte:
      "Diagnostic des enrobés de dalles, parkings et abords avant démolition ou rénovation lourde.",
  },
] as const;

/** Section métier FC — 3 domaines, cartes noir/blanc à liseré rouge au hover. */
export function MetierFC() {
  return (
    <section className="mx-auto max-w-[var(--container,1280px)] px-6 py-20 md:px-8">
      <SurtitreFC>Notre métier</SurtitreFC>
      <h2 className="mt-4 max-w-2xl font-[family-name:var(--font-sora)] text-[30px] font-extrabold leading-tight tracking-[-0.02em] text-[color:var(--fc-noir)] sm:text-[38px]">
        Le carottage d'enrobés, sur tous vos chantiers.
      </h2>
      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {DOMAINES.map((d, i) => {
          const Icone = d.icone;
          return (
            <Reveal key={d.titre} delay={Math.min(i * 0.08, 0.24)}>
              <article className="group h-full border-t-2 border-[color:var(--fc-gris-clair)] bg-white p-7 transition-colors hover:border-[color:var(--fc-rouge)]">
                <Icone className="h-8 w-8 text-[color:var(--fc-rouge)]" aria-hidden />
                <h3 className="mt-5 font-[family-name:var(--font-sora)] text-[19px] font-bold text-[color:var(--fc-noir)]">
                  {d.titre}
                </h3>
                <p className="mt-3 text-[14.5px] leading-relaxed text-[color:var(--fc-gris)]">{d.texte}</p>
              </article>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
```

- [ ] **Step 3 : ProcessFC (4 étapes numérotées, chiffres rouges)**

```tsx
// components/carottage/home/ProcessFC.tsx
import { Reveal } from "@/components/marketing/Reveal";
import { SurtitreFC } from "@/components/carottage/SurtitreFC";

const ETAPES = [
  { n: "01", titre: "Prise de brief", texte: "Localisation, surface ou linéaire, délai — devis chiffré sous 24 h." },
  { n: "02", titre: "Carottage sur site", texte: "Prélèvements normalisés par nos techniciens, balisage et sécurisation." },
  { n: "03", titre: "Analyse en laboratoire", texte: "Recherche amiante et HAP par laboratoire accrédité." },
  { n: "04", titre: "Rapport exploitable", texte: "Cartographie des points, résultats et préconisations pour votre MOE." },
] as const;

/** Section process FC — bande noire, grands numéros rouges (langage éditorial FC). */
export function ProcessFC() {
  return (
    <section className="bg-[color:var(--fc-noir)]">
      <div className="mx-auto max-w-[var(--container,1280px)] px-6 py-20 md:px-8">
        <SurtitreFC>Comment ça marche</SurtitreFC>
        <h2 className="mt-4 max-w-2xl font-[family-name:var(--font-sora)] text-[30px] font-extrabold leading-tight tracking-[-0.02em] text-white sm:text-[38px]">
          Un process carré, du brief au rapport.
        </h2>
        <div className="mt-12 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {ETAPES.map((e, i) => (
            <Reveal key={e.n} delay={Math.min(i * 0.08, 0.24)}>
              <div className="border-t border-white/15 pt-5">
                <span className="font-[family-name:var(--font-sora)] text-[40px] font-extrabold text-[color:var(--fc-rouge)]">
                  {e.n}
                </span>
                <h3 className="mt-3 font-[family-name:var(--font-sora)] text-[17px] font-bold text-white">{e.titre}</h3>
                <p className="mt-2 text-[14px] leading-relaxed text-white/60">{e.texte}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 4 : ReseauNationalFC (carte France illustrative — légère, perf-safe)**

Carte statique (pas de Leaflet sur la home, pour Lighthouse) : image silhouette France + points rouges pulsés positionnés en pourcentage. La vraie carte interactive vit sur `/zones` (FC4).

```tsx
// components/carottage/home/ReseauNationalFC.tsx
import Image from "next/image";
import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";

import { SurtitreFC } from "@/components/carottage/SurtitreFC";

/** Métropoles repères (position en % sur la silhouette, purement décoratif). */
const REPERES: { ville: string; top: number; left: number }[] = [
  { ville: "Lille", top: 8, left: 55 },
  { ville: "Paris", top: 24, left: 50 },
  { ville: "Strasbourg", top: 26, left: 82 },
  { ville: "Rennes", top: 33, left: 22 },
  { ville: "Tours", top: 40, left: 45 },
  { ville: "Lyon", top: 55, left: 68 },
  { ville: "Bordeaux", top: 66, left: 30 },
  { ville: "Toulouse", top: 78, left: 45 },
  { ville: "Marseille", top: 80, left: 72 },
];

/** Section réseau national FC — silhouette France + points pulsés rouges. */
export function ReseauNationalFC() {
  return (
    <section className="mx-auto max-w-[var(--container,1280px)] px-6 py-20 md:px-8">
      <div className="grid items-center gap-12 lg:grid-cols-2">
        <div>
          <SurtitreFC>Réseau national</SurtitreFC>
          <h2 className="mt-4 font-[family-name:var(--font-sora)] text-[30px] font-extrabold leading-tight tracking-[-0.02em] text-[color:var(--fc-noir)] sm:text-[38px]">
            Une équipe qui se déplace partout en France.
          </h2>
          <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-[color:var(--fc-gris)]">
            Basés à Tours, nous intervenons sur l'ensemble du territoire : 191 villes et 57
            départements couverts, avec des délais maîtrisés pour ne pas bloquer vos chantiers.
          </p>
          <Link
            href="/zones"
            className="mt-7 inline-flex items-center gap-2 font-[family-name:var(--font-sora)] text-[14px] font-bold text-[color:var(--fc-rouge)] hover:gap-3"
          >
            Voir toutes les zones
            <ArrowRightIcon className="h-4 w-4 transition-all" aria-hidden />
          </Link>
        </div>
        <div className="relative mx-auto aspect-[4/5] w-full max-w-[420px]">
          <Image
            src="/img/carottage/france-silhouette.svg"
            alt="Carte de France — zone d'intervention nationale"
            fill
            className="object-contain opacity-90"
          />
          {REPERES.map((r) => (
            <span
              key={r.ville}
              className="absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[color:var(--fc-rouge)] ring-4 ring-[color:var(--fc-rouge)]/20"
              style={{ top: `${r.top}%`, left: `${r.left}%` }}
              title={r.ville}
              aria-hidden
            />
          ))}
        </div>
      </div>
    </section>
  );
}
```

Asset : déposer `public/img/carottage/france-silhouette.svg` (contour France simple, monochrome). Générable depuis un SVG France du domaine public ou tracé à la main.

- [ ] **Step 5 : ChiffresFC (bandeau chiffres, accent rouge)**

```tsx
// components/carottage/home/ChiffresFC.tsx
import { Reveal } from "@/components/marketing/Reveal";

const CHIFFRES = [
  { valeur: "191", label: "villes couvertes" },
  { valeur: "57", label: "départements" },
  { valeur: "24-48 h", label: "délai d'intervention" },
  { valeur: "100 %", label: "laboratoire accrédité" },
] as const;

/** Bandeau chiffres FC — fond blanc cassé, valeurs massives, label gris. */
export function ChiffresFC() {
  return (
    <section className="border-y border-[color:var(--fc-gris-clair)] bg-white">
      <div className="mx-auto grid max-w-[var(--container,1280px)] grid-cols-2 gap-8 px-6 py-14 md:grid-cols-4 md:px-8">
        {CHIFFRES.map((c, i) => (
          <Reveal key={c.label} delay={Math.min(i * 0.06, 0.18)}>
            <div>
              <p className="font-[family-name:var(--font-sora)] text-[38px] font-extrabold leading-none text-[color:var(--fc-noir)]">
                {c.valeur}
                <span className="text-[color:var(--fc-rouge)]">.</span>
              </p>
              <p className="mt-2 text-[13.5px] font-semibold uppercase tracking-wide text-[color:var(--fc-gris)]">
                {c.label}
              </p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 6 : Assembler la home**

```tsx
// app/carottage/page.tsx
import type { Metadata } from "next";

import { CtaDevisFC } from "@/components/carottage/CtaDevisFC";
import { HeroFC } from "@/components/carottage/HeroFC";
import { ChiffresFC } from "@/components/carottage/home/ChiffresFC";
import { MetierFC } from "@/components/carottage/home/MetierFC";
import { ProcessFC } from "@/components/carottage/home/ProcessFC";
import { ReseauNationalFC } from "@/components/carottage/home/ReseauNationalFC";

export const metadata: Metadata = {
  title: "France Carottage — Carottage routier & repérage amiante/HAP sur enrobés",
  description:
    "Carottage d'enrobés et repérage amiante/HAP avant travaux de voirie, réseaux et bâtiment. Réseau national, laboratoire accrédité, devis sous 24 h. France Carottage.",
  alternates: { canonical: "/" },
};

export default function CarottageHomePage() {
  return (
    <>
      <HeroFC />
      <ChiffresFC />
      <MetierFC />
      <ProcessFC />
      <ReseauNationalFC />
      <CtaDevisFC />
    </>
  );
}
```

- [ ] **Step 7 : Vérifier en local + commit**

```bash
corepack pnpm typecheck
corepack pnpm dev
```

Ouvrir la home FC (host `carottage.localhost`) : hero image + titre massif, chiffres, métier, process noir, réseau national, CTA rouge. Reveals au scroll. Screenshots desktop + 375 px.

```bash
git add components/carottage/CtaDevisFC.tsx components/carottage/home "app/carottage/page.tsx" public/img/carottage/france-silhouette.svg
git commit -m "feat(carottage): home FC (hero, chiffres, metier, process, reseau national, CTA)"
```

---

### Task FC2.5 : Peaufinage design system + home FC

**REQUIRED SUB-SKILL : invoquer `methodo-peaufinage-propulseo` au début de cette tâche.**

**Files:**
- Modify (micro-retouches) : `components/carottage/*.tsx`, `components/carottage/home/*.tsx`, `app/globals.css`

**Garde-fous :**
- On peaufine les **jointures entre sections** (transitions blanc ↔ noir), le **rythme vertical**, les **reveals** (délais/directions), les **micro-espacements** — pas de refonte de structure.
- Screenshot avant/après pour chaque retouche notable.

- [ ] **Step 1 :** Screenshots de référence (desktop + mobile) avant retouche.
- [ ] **Step 2 :** Passe guidée par le skill : cohérence des liserés rouges, transitions entre la section noire `ProcessFC` et ses voisines blanches, timing des reveals, contraste AA du texte blanc/70 sur noir, alignements de la grille 1280.
- [ ] **Step 3 :** Comparaison avant/après ; partager les screenshots à Etienne (validation visuelle desktop/mobile = **critère de passage FC2**).
- [ ] **Step 4 : Commit**

```bash
corepack pnpm typecheck && corepack pnpm test
git add components/carottage app/globals.css
git commit -m "fix(ui): peaufinage jointures + rythme home France Carottage"
```

(`polish` n'étant pas un type conventionnel, utiliser `fix(ui):`.)

**Critère de passage FC2 :** screenshots desktop/mobile de la home validés visuellement par Etienne.

---

## Tranche FC3 — Expertises

### Task FC3.1 : Gabarits `/expertises` et `/expertises/[slug]`

**Files:**
- Create: `app/carottage/expertises/page.tsx`, `app/carottage/expertises/[slug]/page.tsx`, `components/carottage/ExpertisesLiees.tsx`

**Interfaces:**
- Consumes : `loadExpertises`, `getExpertise`, `SurtitreFC`, `ArianeFC`, `CtaDevisFC`, `JsonLd`, `Reveal`.
- Produces : `ExpertisesLiees({ slugActuel })` (3 cartes max).

- [ ] **Step 1 : Index `/expertises`**

```tsx
// app/carottage/expertises/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";

import { ArianeFC } from "@/components/carottage/ArianeFC";
import { CtaDevisFC } from "@/components/carottage/CtaDevisFC";
import { SurtitreFC } from "@/components/carottage/SurtitreFC";
import { Reveal } from "@/components/marketing/Reveal";
import { loadExpertises } from "@/lib/content/load-carottage";

export const metadata: Metadata = {
  title: "Expertises carottage & amiante/HAP enrobés",
  description:
    "Métier, réglementation, HAP, obligations de repérage sur voirie : toutes les expertises de France Carottage sur le carottage d'enrobés et l'amiante avant travaux.",
  alternates: { canonical: "/expertises" },
};

export default async function ExpertisesIndexPage() {
  const expertises = await loadExpertises();
  return (
    <>
      <section className="border-b border-[color:var(--fc-gris-clair)] bg-white">
        <div className="mx-auto max-w-[var(--container,1280px)] px-6 py-14 md:px-8">
          <SurtitreFC>Expertises</SurtitreFC>
          <h1 className="mt-4 max-w-2xl font-[family-name:var(--font-sora)] text-[34px] font-extrabold leading-tight tracking-[-0.02em] text-[color:var(--fc-noir)] sm:text-[44px]">
            Tout comprendre au repérage amiante/HAP sur enrobés.
          </h1>
        </div>
      </section>
      <ArianeFC segments={[{ label: "Expertises", href: "/expertises" }]} />
      <section className="mx-auto max-w-[var(--container,1280px)] px-6 pb-8 md:px-8">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {expertises.map((e, i) => (
            <Reveal key={e.slug} delay={Math.min(i * 0.05, 0.3)}>
              <Link
                href={`/expertises/${e.slug}`}
                className="group flex h-full flex-col border-t-2 border-[color:var(--fc-gris-clair)] bg-white p-6 transition-colors hover:border-[color:var(--fc-rouge)]"
              >
                <h2 className="font-[family-name:var(--font-sora)] text-[18px] font-bold leading-snug text-[color:var(--fc-noir)]">
                  {e.titre}
                </h2>
                <p className="mt-3 flex-1 text-[14px] leading-relaxed text-[color:var(--fc-gris)]">
                  {e.metaDescription}
                </p>
                <span className="mt-4 inline-flex items-center gap-1.5 font-[family-name:var(--font-sora)] text-[13px] font-bold text-[color:var(--fc-rouge)]">
                  Lire l'expertise
                  <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden />
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>
      <CtaDevisFC />
    </>
  );
}
```

- [ ] **Step 2 : ExpertisesLiees (maillage)**

```tsx
// components/carottage/ExpertisesLiees.tsx
import Link from "next/link";

import { loadExpertises } from "@/lib/content/load-carottage";

/** Maillage interne : 3 autres expertises. */
export async function ExpertisesLiees({ slugActuel }: { slugActuel: string }) {
  const autres = (await loadExpertises()).filter((e) => e.slug !== slugActuel).slice(0, 3);
  if (autres.length === 0) return null;
  return (
    <section className="mx-auto max-w-[var(--container,1280px)] px-6 py-12 md:px-8">
      <h2 className="font-[family-name:var(--font-sora)] text-[20px] font-bold text-[color:var(--fc-noir)]">
        À lire aussi
      </h2>
      <div className="mt-5 grid gap-4 sm:grid-cols-3">
        {autres.map((e) => (
          <Link
            key={e.slug}
            href={`/expertises/${e.slug}`}
            className="border-t-2 border-[color:var(--fc-gris-clair)] bg-white p-4 font-[family-name:var(--font-sora)] text-[14.5px] font-bold leading-snug text-[color:var(--fc-noir)] transition-colors hover:border-[color:var(--fc-rouge)]"
          >
            {e.titre}
          </Link>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 3 : Gabarit `/expertises/[slug]`**

```tsx
// app/carottage/expertises/[slug]/page.tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ArianeFC } from "@/components/carottage/ArianeFC";
import { CtaDevisFC } from "@/components/carottage/CtaDevisFC";
import { ExpertisesLiees } from "@/components/carottage/ExpertisesLiees";
import { SurtitreFC } from "@/components/carottage/SurtitreFC";
import { JsonLd } from "@/components/seo/JsonLd";
import { getExpertise, loadExpertises } from "@/lib/content/load-carottage";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return (await loadExpertises()).map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const expertise = await getExpertise(slug);
  if (!expertise) return {};
  return {
    title: expertise.metaTitle,
    description: expertise.metaDescription,
    alternates: { canonical: `/expertises/${expertise.slug}` },
    openGraph: { title: expertise.metaTitle, description: expertise.metaDescription, type: "article" },
  };
}

export default async function ExpertisePage({ params }: Props) {
  const { slug } = await params;
  const expertise = await getExpertise(slug);
  if (!expertise) notFound();

  return (
    <>
      <section className="border-b border-[color:var(--fc-gris-clair)] bg-white">
        <div className="mx-auto max-w-3xl px-6 py-12 md:px-8">
          <SurtitreFC>Expertise</SurtitreFC>
          <h1 className="mt-4 font-[family-name:var(--font-sora)] text-[30px] font-extrabold leading-[1.08] tracking-[-0.02em] text-[color:var(--fc-noir)] sm:text-[40px]">
            {expertise.titre}
          </h1>
        </div>
      </section>
      <ArianeFC
        segments={[
          { label: "Expertises", href: "/expertises" },
          { label: expertise.titre, href: `/expertises/${expertise.slug}` },
        ]}
      />
      <article
        className="fc-prose mx-auto max-w-3xl px-6 pb-6 md:px-8"
        dangerouslySetInnerHTML={{ __html: expertise.html }}
      />
      <ExpertisesLiees slugActuel={expertise.slug} />
      <CtaDevisFC titre={`Un chantier concerné par « ${expertise.titre} » ?`} />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: expertise.titre,
          description: expertise.metaDescription,
          ...(expertise.date ? { datePublished: expertise.date } : {}),
          author: { "@type": "Organization", name: "France Carottage" },
        }}
      />
    </>
  );
}
```

- [ ] **Step 4 : Vérifier en local + commit**

`corepack pnpm typecheck` puis ouvrir `/expertises` et 2 pages expertise (host FC). Vérifier prose FC (h2 souligné, liens rouges), maillage, CTA. Screenshots.

```bash
git add "app/carottage/expertises" components/carottage/ExpertisesLiees.tsx
git commit -m "feat(carottage): gabarits expertises (index + page + maillage)"
```

---

### Task FC3.2 : Modernisation des ~8 contenus expertises

**Files:**
- Modify: `content/carottage/expertises/*.md` (tous)

**Process (pas de code applicatif) :**

- [ ] **Step 1 : Moderniser par lots via sous-agents** (un fichier par agent). Prompt type :

```
Modernise le fichier content/carottage/expertises/<slug>.md du site France Carottage
(carottage routier, repérage amiante/HAP sur enrobés, réseau national).
Règles impératives :
1. Structure cible : 2-4 intertitres ## adaptés au sujet réel (ex: ## De quoi parle-t-on ? /
   ## Cadre réglementaire / ## Comment on intervient / ## Ce que vous obtenez). Pas de section vide.
2. Conserve TOUS les mots-clés SEO du texte source (amiante, HAP, enrobés, carottage, voirie,
   termes réglementaires).
3. NE MODIFIE AUCUN fait réglementaire ni seuil. Si la réglementation semble avoir évolué depuis
   la publication, signale-le sobrement sans corriger le fait toi-même.
4. Frontmatter : metaTitle ≤65 c avec mot-clé + « | France Carottage » ; metaDescription 120-160 c
   incitative ; conserver date/anciennesUrls tels quels ; SUPPRIMER la clé `brut`.
5. Ton : technique, professionnel, orienté maîtrise d'ouvrage/MOE voirie — vouvoiement.
6. Le schéma lib/content/schemas-carottage.ts fait foi : le build casse si le frontmatter est invalide.
Rends UNIQUEMENT le fichier complet réécrit.
```

- [ ] **Step 2 : Après chaque lot** — l'orchestrateur relit 2 fichiers en entier, puis :

```bash
corepack pnpm test && corepack pnpm typecheck
git add content/carottage/expertises
git commit -m "feat(content): modernise les expertises FC (lot N)"
```

- [ ] **Step 3 : Fin de tranche**

```bash
grep -rl "brut: true" content/carottage/expertises || echo "OK: plus aucune expertise brute"
```

Expected : `OK`. Relire les 8 pages dans le navigateur (rendu final), screenshots pour Etienne.

**Critère de passage FC3 :** échantillon relu ; `typecheck`/`test` verts ; aucun `brut: true` restant dans les expertises.

---

## Tranche FC4 — Zones (départements + villes, carte France, différenciation)

### Task FC4.1 : Carte de France interactive (Leaflet)

**Files:**
- Create: `components/carottage/CarteFrance.tsx`, `components/carottage/CarteFranceInterne.tsx`

**Interfaces:**
- Produces : `CarteFrance({ points, hauteur? })` avec `export type PointDepartement = { slug: string; nom: string; lat: number; lng: number }`. Server-safe (wrapper client + import dynamique sans SSR).

- [ ] **Step 1 : Wrapper client**

```tsx
// components/carottage/CarteFrance.tsx
"use client";

import dynamic from "next/dynamic";

export type PointDepartement = { slug: string; nom: string; lat: number; lng: number };

const CarteFranceInterne = dynamic(() => import("./CarteFranceInterne"), {
  ssr: false,
  loading: () => (
    <div
      className="animate-pulse rounded-[6px] border border-[color:var(--fc-gris-clair)] bg-white"
      style={{ height: 480 }}
      aria-hidden
    />
  ),
});

/** Carte France entière (départements couverts) — Leaflet chargé côté client uniquement. */
export function CarteFrance({ points, hauteur = 480 }: { points: PointDepartement[]; hauteur?: number }) {
  return <CarteFranceInterne points={points} hauteur={hauteur} />;
}
```

- [ ] **Step 2 : Carte interne**

```tsx
// components/carottage/CarteFranceInterne.tsx
"use client";

import Link from "next/link";
import { CircleMarker, MapContainer, Popup, TileLayer } from "react-leaflet";

import "leaflet/dist/leaflet.css";

import type { PointDepartement } from "./CarteFrance";

const CENTRE_FRANCE: [number, number] = [46.6, 2.4];
// Valeur littérale du token --fc-rouge (Leaflet ne lit pas les variables CSS dans pathOptions).
const ROUGE = "#b32024";

export default function CarteFranceInterne({
  points,
  hauteur,
}: {
  points: PointDepartement[];
  hauteur: number;
}) {
  return (
    <MapContainer
      center={CENTRE_FRANCE}
      zoom={5}
      scrollWheelZoom={false}
      style={{ height: hauteur }}
      className="z-0 rounded-[6px] border border-[color:var(--fc-gris-clair)]"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {points.map((p) => (
        <CircleMarker
          key={p.slug}
          center={[p.lat, p.lng]}
          radius={7}
          pathOptions={{ color: ROUGE, fillColor: ROUGE, fillOpacity: 0.85, weight: 2 }}
        >
          <Popup>
            <Link href={`/zones/${p.slug}`}>Carottage dans le {p.nom}</Link>
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}
```

- [ ] **Step 3 : Typecheck + commit**

```bash
corepack pnpm typecheck
git add components/carottage/CarteFrance.tsx components/carottage/CarteFranceInterne.tsx
git commit -m "feat(carottage): carte France interactive Leaflet (departements)"
```

---

### Task FC4.2 : Index `/zones` + gabarit département

**Files:**
- Create: `app/carottage/zones/page.tsx`, `components/carottage/GabaritDepartement.tsx`

**Interfaces:**
- Consumes : `loadDepartementsFC`, `getDepartement` (table), `CarteFrance`, `ArianeFC`, `CtaDevisFC`, `SurtitreFC`, `JsonLd`.
- Produces : `GabaritDepartement({ departement })` (rendu complet d'une page département, appelé par la route dispatch en FC4.3).

- [ ] **Step 1 : Index `/zones` (carte + liste des départements)**

```tsx
// app/carottage/zones/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { MapPinIcon } from "lucide-react";

import { ArianeFC } from "@/components/carottage/ArianeFC";
import { CarteFrance, type PointDepartement } from "@/components/carottage/CarteFrance";
import { CtaDevisFC } from "@/components/carottage/CtaDevisFC";
import { SurtitreFC } from "@/components/carottage/SurtitreFC";
import { getDepartement } from "@/lib/clients/francecarottage/departements";
import { loadDepartementsFC } from "@/lib/content/load-carottage";

export const metadata: Metadata = {
  title: "Zones d'intervention — carottage partout en France",
  description:
    "France Carottage intervient dans 57 départements et 191 villes : carottage routier et repérage amiante/HAP sur enrobés. Trouvez votre zone et demandez un devis.",
  alternates: { canonical: "/zones" },
};

export default async function ZonesIndexPage() {
  const departements = await loadDepartementsFC();
  const points: PointDepartement[] = departements.flatMap((d) => {
    const centre = getDepartement(d.code);
    return centre ? [{ slug: d.slug, nom: d.nom, lat: centre.lat, lng: centre.lng }] : [];
  });

  return (
    <>
      <section className="border-b border-[color:var(--fc-gris-clair)] bg-white">
        <div className="mx-auto max-w-[var(--container,1280px)] px-6 py-14 md:px-8">
          <SurtitreFC>Zones d'intervention</SurtitreFC>
          <h1 className="mt-4 max-w-2xl font-[family-name:var(--font-sora)] text-[34px] font-extrabold leading-tight tracking-[-0.02em] text-[color:var(--fc-noir)] sm:text-[44px]">
            Un réseau national, au plus près de vos chantiers.
          </h1>
        </div>
      </section>
      <ArianeFC segments={[{ label: "Zones d'intervention", href: "/zones" }]} />
      <section className="mx-auto max-w-[var(--container,1280px)] px-6 pb-4 md:px-8">
        <CarteFrance points={points} />
      </section>
      <section className="mx-auto max-w-[var(--container,1280px)] px-6 py-12 md:px-8">
        <h2 className="font-[family-name:var(--font-sora)] text-[20px] font-bold text-[color:var(--fc-noir)]">
          Tous nos départements
        </h2>
        <ul className="mt-5 grid gap-x-6 gap-y-2 sm:grid-cols-2 lg:grid-cols-3">
          {departements.map((d) => (
            <li key={d.slug}>
              <Link
                href={`/zones/${d.slug}`}
                className="inline-flex items-center gap-2 py-1 text-[14.5px] text-[color:var(--fc-gris)] hover:text-[color:var(--fc-rouge)]"
              >
                <MapPinIcon className="h-4 w-4 text-[color:var(--fc-rouge)]" aria-hidden />
                {d.nom} ({d.code})
              </Link>
            </li>
          ))}
        </ul>
      </section>
      <CtaDevisFC />
    </>
  );
}
```

- [ ] **Step 2 : GabaritDepartement (villes de la collection appartenant au département)**

```tsx
// components/carottage/GabaritDepartement.tsx
import Link from "next/link";

import { ArianeFC } from "@/components/carottage/ArianeFC";
import { CtaDevisFC } from "@/components/carottage/CtaDevisFC";
import { SurtitreFC } from "@/components/carottage/SurtitreFC";
import { JsonLd } from "@/components/seo/JsonLd";
import { carottageUrl } from "@/lib/clients/francecarottage/urls";
import { loadVillesFC } from "@/lib/content/load-carottage";
import type { DepartementFC } from "@/lib/content/schemas-carottage";

/** Gabarit page département — prose + villes couvertes du département + CTA. */
export async function GabaritDepartement({ departement }: { departement: DepartementFC }) {
  const villes = (await loadVillesFC())
    .filter((v) => v.departement.toLowerCase() === departement.code.toLowerCase())
    .slice(0, 24);

  return (
    <>
      <section className="border-b border-[color:var(--fc-gris-clair)] bg-white">
        <div className="mx-auto max-w-[var(--container,1280px)] px-6 py-12 md:px-8">
          <SurtitreFC>Département {departement.code}</SurtitreFC>
          <h1 className="mt-4 font-[family-name:var(--font-sora)] text-[32px] font-extrabold leading-[1.06] tracking-[-0.02em] text-[color:var(--fc-noir)] sm:text-[42px]">
            Carottage & repérage amiante/HAP dans le {departement.nom}
          </h1>
        </div>
      </section>
      <ArianeFC
        segments={[
          { label: "Zones d'intervention", href: "/zones" },
          { label: departement.nom, href: `/zones/${departement.slug}` },
        ]}
      />
      <article
        className="fc-prose mx-auto max-w-3xl px-6 pb-4 md:px-8"
        dangerouslySetInnerHTML={{ __html: departement.html }}
      />
      {villes.length > 0 && (
        <section className="mx-auto max-w-[var(--container,1280px)] px-6 py-12 md:px-8">
          <h2 className="font-[family-name:var(--font-sora)] text-[20px] font-bold text-[color:var(--fc-noir)]">
            Nos villes couvertes dans le {departement.nom}
          </h2>
          <ul className="mt-5 grid gap-x-6 gap-y-2 sm:grid-cols-2 lg:grid-cols-3">
            {villes.map((v) => (
              <li key={v.slug}>
                <Link
                  href={`/zones/${v.slug}`}
                  className="py-1 text-[14.5px] text-[color:var(--fc-gris)] hover:text-[color:var(--fc-rouge)]"
                >
                  {v.ville} ({v.codePostal})
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
      <CtaDevisFC titre={`Un chantier dans le ${departement.nom} ?`} />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Service",
          name: `Carottage et repérage amiante/HAP dans le ${departement.nom}`,
          description: departement.metaDescription,
          provider: { "@type": "LocalBusiness", name: "France Carottage", telephone: "+33247470123" },
          areaServed: { "@type": "AdministrativeArea", name: departement.nom },
          url: carottageUrl(`/zones/${departement.slug}`),
        }}
      />
    </>
  );
}
```

- [ ] **Step 3 : Vérifier en local (index seulement) + commit**

`corepack pnpm typecheck` puis ouvrir `/zones` (host FC) : carte France avec marqueurs rouges, liste des départements. Screenshots. (Le gabarit département sera routé en FC4.3.)

```bash
git add "app/carottage/zones/page.tsx" components/carottage/GabaritDepartement.tsx
git commit -m "feat(carottage): index zones (carte France + liste departements) + gabarit departement"
```

---

### Task FC4.3 : Gabarit ville paramétrique (4 structures) + route dispatch (TDD)

**Files:**
- Create: `lib/carottage/ville-gabarit.ts`, `components/carottage/GabaritVille.tsx`, `app/carottage/zones/[slug]/page.tsx`
- Test: `lib/carottage/__tests__/ville-gabarit.test.ts`

**Interfaces:**
- Produces :
  - `variantePour(slug: string): 0 | 1 | 2 | 3` (déterministe, hash djb2 du slug)
  - `ordreSections(variante): SectionKey[]` avec `type SectionKey = "prestations" | "voisines" | "departement"`
  - `distanceKm(a, b): number` (haversine) ; `villesVoisines(ville, toutes, n): VilleFC[]`
  - route `/zones/[slug]` qui sert **département OU ville** (même route, deux gabarits).

- [ ] **Step 1 : Tests qui échouent**

```ts
// lib/carottage/__tests__/ville-gabarit.test.ts
import { describe, expect, it } from "vitest";

import { distanceKm, ordreSections, variantePour, villesVoisines } from "../ville-gabarit";
import type { VilleFC } from "@/lib/content/schemas-carottage";

function ville(slug: string, lat: number, lng: number): VilleFC {
  return {
    slug,
    ville: slug,
    codePostal: "45000",
    departement: "45",
    metaTitle: "t".repeat(20),
    metaDescription: "d".repeat(120),
    anciennesUrls: [],
    brut: false,
    lat,
    lng,
    html: "",
  };
}

describe("ville-gabarit", () => {
  it("variantePour est déterministe et dans [0,3]", () => {
    for (const s of ["orleans", "montargis", "pithiviers", "gien", "chalette-sur-loing"]) {
      const v = variantePour(s);
      expect(v).toBe(variantePour(s));
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThanOrEqual(3);
    }
  });

  it("répartit les 4 variantes sur un échantillon", () => {
    const slugs = Array.from({ length: 200 }, (_, i) => `ville-test-${i}`);
    const vues = new Set(slugs.map(variantePour));
    expect(vues.size).toBe(4);
  });

  it("ordreSections retourne les 3 sections mobiles sans doublon", () => {
    for (const v of [0, 1, 2, 3] as const) {
      const ordre = ordreSections(v);
      expect(new Set(ordre)).toEqual(new Set(["prestations", "voisines", "departement"]));
      expect(ordre).toHaveLength(3);
    }
  });

  it("villesVoisines renvoie les n plus proches, sans la ville elle-même", () => {
    const centre = ville("orleans", 47.9, 1.9);
    const toutes = [
      centre,
      ville("proche", 47.95, 1.95),
      ville("moyenne", 48.3, 2.3),
      ville("loin", 43.6, 1.4),
    ];
    const voisines = villesVoisines(centre, toutes, 2);
    expect(voisines.map((v) => v.slug)).toEqual(["proche", "moyenne"]);
  });

  it("distanceKm est symétrique et positive", () => {
    const a = ville("a", 47.9, 1.9);
    const b = ville("b", 48.9, 2.9);
    expect(distanceKm(a, b)).toBeGreaterThan(0);
    expect(Math.abs(distanceKm(a, b) - distanceKm(b, a))).toBeLessThan(1e-9);
  });
});
```

- [ ] **Step 2 : Vérifier l'échec** — `corepack pnpm vitest run lib/carottage/__tests__/ville-gabarit.test.ts` → FAIL.

- [ ] **Step 3 : Implémenter la mécanique**

```ts
// lib/carottage/ville-gabarit.ts
/**
 * Différenciation anti-duplicate des 191 pages villes : la structure de page
 * tourne entre 4 variantes, choisie de façon déterministe par le hash du slug —
 * même slug ⇒ même structure (stable au build), slugs différents ⇒ structures variées.
 */
import type { VilleFC } from "@/lib/content/schemas-carottage";

export type Variante = 0 | 1 | 2 | 3;
export type SectionKey = "prestations" | "voisines" | "departement";

/** Hash djb2 (déterministe, cross-plateforme) → variante 0..3. */
export function variantePour(slug: string): Variante {
  let h = 5381;
  for (let i = 0; i < slug.length; i += 1) {
    h = ((h << 5) + h + slug.charCodeAt(i)) & 0xffffffff;
  }
  return (Math.abs(h) % 4) as Variante;
}

/** Ordre des 3 sections mobiles selon la variante (l'intro et le CTA sont fixes). */
export function ordreSections(variante: Variante): SectionKey[] {
  const permutations: Record<Variante, SectionKey[]> = {
    0: ["prestations", "voisines", "departement"],
    1: ["departement", "prestations", "voisines"],
    2: ["voisines", "departement", "prestations"],
    3: ["prestations", "departement", "voisines"],
  };
  return permutations[variante];
}

/** Distance haversine en km entre deux points {lat,lng}. */
export function distanceKm(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
): number {
  const rad = (d: number) => (d * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat);
  const dLng = rad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.sqrt(h));
}

/** Les `n` villes couvertes les plus proches (hors la ville courante). */
export function villesVoisines(ville: VilleFC, toutes: VilleFC[], n: number): VilleFC[] {
  return toutes
    .filter((v) => v.slug !== ville.slug)
    .sort((a, b) => distanceKm(ville, a) - distanceKm(ville, b))
    .slice(0, n);
}
```

- [ ] **Step 4 : Vérifier le vert** — `corepack pnpm vitest run lib/carottage/__tests__/ville-gabarit.test.ts` → PASS (5 tests).

- [ ] **Step 5 : GabaritVille (structure paramétrique, données réelles injectées)**

```tsx
// components/carottage/GabaritVille.tsx
import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowRightIcon, Building2Icon, RouteIcon, WavesIcon } from "lucide-react";

import { ArianeFC } from "@/components/carottage/ArianeFC";
import { CtaDevisFC } from "@/components/carottage/CtaDevisFC";
import { SurtitreFC } from "@/components/carottage/SurtitreFC";
import { JsonLd } from "@/components/seo/JsonLd";
import { carottageUrl } from "@/lib/clients/francecarottage/urls";
import { ordreSections, variantePour, villesVoisines, type SectionKey } from "@/lib/carottage/ville-gabarit";
import { loadDepartementsFC, loadVillesFC } from "@/lib/content/load-carottage";
import type { VilleFC } from "@/lib/content/schemas-carottage";

const PRESTATIONS = [
  { icone: RouteIcon, titre: "Voirie & chaussées" },
  { icone: WavesIcon, titre: "Réseaux & tranchées" },
  { icone: Building2Icon, titre: "Bâtiment & parkings" },
] as const;

/** Gabarit ville — structure tournante (4 variantes), villes voisines réelles, département parent. */
export async function GabaritVille({ ville }: { ville: VilleFC }) {
  const [toutes, departements] = await Promise.all([loadVillesFC(), loadDepartementsFC()]);
  const voisines = villesVoisines(ville, toutes, 4);
  const departement = departements.find(
    (d) => d.code.toLowerCase() === ville.departement.toLowerCase(),
  );
  const ordre = ordreSections(variantePour(ville.slug));

  const blocs: Record<SectionKey, ReactNode> = {
    prestations: (
      <section key="prestations" className="mx-auto max-w-[var(--container,1280px)] px-6 py-10 md:px-8">
        <h2 className="font-[family-name:var(--font-sora)] text-[20px] font-bold text-[color:var(--fc-noir)]">
          Nos prestations à {ville.ville}
        </h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          {PRESTATIONS.map((p) => {
            const Icone = p.icone;
            return (
              <div key={p.titre} className="border-t-2 border-[color:var(--fc-gris-clair)] bg-white p-5">
                <Icone className="h-6 w-6 text-[color:var(--fc-rouge)]" aria-hidden />
                <p className="mt-3 font-[family-name:var(--font-sora)] text-[14.5px] font-bold text-[color:var(--fc-noir)]">
                  {p.titre}
                </p>
              </div>
            );
          })}
        </div>
      </section>
    ),
    voisines:
      voisines.length > 0 ? (
        <section key="voisines" className="mx-auto max-w-[var(--container,1280px)] px-6 py-10 md:px-8">
          <h2 className="font-[family-name:var(--font-sora)] text-[20px] font-bold text-[color:var(--fc-noir)]">
            Nous intervenons aussi à proximité
          </h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {voisines.map((v) => (
              <Link
                key={v.slug}
                href={`/zones/${v.slug}`}
                className="border-t-2 border-[color:var(--fc-gris-clair)] bg-white p-4 font-[family-name:var(--font-sora)] text-[14.5px] font-bold text-[color:var(--fc-noir)] transition-colors hover:border-[color:var(--fc-rouge)]"
              >
                {v.ville} ({v.codePostal})
              </Link>
            ))}
          </div>
        </section>
      ) : null,
    departement: departement ? (
      <section key="departement" className="mx-auto max-w-[var(--container,1280px)] px-6 py-10 md:px-8">
        <Link
          href={`/zones/${departement.slug}`}
          className="group flex items-center justify-between gap-4 border-l-4 border-[color:var(--fc-rouge)] bg-white p-6"
        >
          <span>
            <span className="font-[family-name:var(--font-sora)] text-[12.5px] font-bold uppercase tracking-wide text-[color:var(--fc-rouge)]">
              Département {departement.code}
            </span>
            <span className="mt-1 block font-[family-name:var(--font-sora)] text-[17px] font-bold text-[color:var(--fc-noir)]">
              Voir toute notre couverture du {departement.nom}
            </span>
          </span>
          <ArrowRightIcon className="h-5 w-5 shrink-0 text-[color:var(--fc-rouge)] transition-transform group-hover:translate-x-1" aria-hidden />
        </Link>
      </section>
    ) : null,
  };

  return (
    <>
      <section className="border-b border-[color:var(--fc-gris-clair)] bg-white">
        <div className="mx-auto max-w-[var(--container,1280px)] px-6 py-12 md:px-8">
          <SurtitreFC>{ville.codePostal}</SurtitreFC>
          <h1 className="mt-4 font-[family-name:var(--font-sora)] text-[32px] font-extrabold leading-[1.06] tracking-[-0.02em] text-[color:var(--fc-noir)] sm:text-[42px]">
            Carottage & repérage amiante/HAP à {ville.ville}
          </h1>
        </div>
      </section>
      <ArianeFC
        segments={[
          { label: "Zones d'intervention", href: "/zones" },
          ...(departement ? [{ label: departement.nom, href: `/zones/${departement.slug}` }] : []),
          { label: ville.ville, href: `/zones/${ville.slug}` },
        ]}
      />
      <article
        className="fc-prose mx-auto max-w-3xl px-6 pb-4 md:px-8"
        dangerouslySetInnerHTML={{ __html: ville.html }}
      />
      {ordre.map((key) => blocs[key])}
      <CtaDevisFC titre={`Un chantier à ${ville.ville} ?`} />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Service",
          name: `Carottage et repérage amiante/HAP à ${ville.ville}`,
          description: ville.metaDescription,
          provider: { "@type": "LocalBusiness", name: "France Carottage", telephone: "+33247470123" },
          areaServed: { "@type": "City", name: ville.ville, postalCode: ville.codePostal },
          url: carottageUrl(`/zones/${ville.slug}`),
        }}
      />
    </>
  );
}
```

- [ ] **Step 6 : Route dispatch `/zones/[slug]` (département OU ville)**

```tsx
// app/carottage/zones/[slug]/page.tsx
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
```

- [ ] **Step 7 : Vérifier en local + commit**

`corepack pnpm typecheck && corepack pnpm test` puis ouvrir 1 département + 3 villes de variantes différentes (vérifier que l'ordre des sections change entre elles). Screenshots.

```bash
git add lib/carottage/ville-gabarit.ts lib/carottage/__tests__/ville-gabarit.test.ts components/carottage/GabaritVille.tsx "app/carottage/zones/[slug]/page.tsx"
git commit -m "feat(carottage): gabarit ville parametrique (4 structures) + route zones dispatch"
```

---

### Task FC4.4 : Différenciation anti-duplicate (248 pages géo)

**Files:**
- Create: `lib/clients/francecarottage/top-villes.ts`
- Modify: `content/carottage/departements/*.md` (57), `content/carottage/villes/*.md` (191)

**Interfaces:**
- Produces : `TOP_VILLES: Set<string>` (30 slugs par population) ; `estTopVille(slug): boolean`.

- [ ] **Step 1 : Table des 30 plus grandes villes**

```ts
// lib/clients/francecarottage/top-villes.ts
/**
 * Les 30 villes recevant une VRAIE reformulation rédactionnelle (les autres sont
 * différenciées par la structure paramétrique + lissage du texte source).
 * Réconcilier ces slugs avec l'inventaire réel : un slug absent de la collection
 * est simplement ignoré (Set.has renvoie false). Trié par population décroissante.
 */
export const TOP_VILLES: Set<string> = new Set([
  "paris", "marseille", "lyon", "toulouse", "nice", "nantes", "montpellier",
  "strasbourg", "bordeaux", "lille", "rennes", "reims", "toulon", "saint-etienne",
  "le-havre", "grenoble", "dijon", "angers", "nimes", "villeurbanne", "clermont-ferrand",
  "le-mans", "aix-en-provence", "brest", "tours", "amiens", "limoges", "annecy",
  "perpignan", "metz",
]);

export function estTopVille(slug: string): boolean {
  return TOP_VILLES.has(slug);
}
```

Après extraction (FC1.7), réconcilier : ouvrir `scripts/out/inventaire-carottage.md`, retirer de la liste tout slug absent et compléter jusqu'à 30 avec les plus grandes villes réellement présentes.

- [ ] **Step 2 : Reformulation des 57 départements (lots de ~10, via sous-agents)** — prompt type :

```
Reformule content/carottage/departements/<slug>.md (page SEO département, France Carottage,
carottage routier + repérage amiante/HAP sur enrobés).
Règles impératives :
1. INTERDICTION de partager une phrase de 8+ mots avec un autre département (anti duplicate).
   Varie structure, angles, formulations.
2. N'INVENTE AUCUN fait local. Reste factuel : carottage d'enrobés, voirie/réseaux/bâtiment,
   couverture du département, délais. Mentionne 2-3 villes réelles du département si le texte
   source ou le nom du département le permettent.
3. Renseigne le frontmatter `villesPrincipales` avec 3-5 villes réelles du département.
4. Conserve les mots-clés SEO (carottage, amiante, HAP, enrobés, <nom département>).
5. Corps : 200-350 mots, 2-3 intertitres ##. metaTitle ≤65 c, metaDescription 120-160 c originale.
   Conserver code/nom/anciennesUrls. SUPPRIMER la clé `brut`.
Rends UNIQUEMENT le fichier complet réécrit.
```

- [ ] **Step 3 : Top 30 villes — vraie reformulation (via sous-agents)** — prompt type :

```
Reformule content/carottage/villes/<slug>.md (page SEO ville, France Carottage,
carottage routier + repérage amiante/HAP sur enrobés). Cette ville fait partie des 30 plus
grandes : elle reçoit une VRAIE rédaction originale.
Règles impératives :
1. INTERDICTION de réutiliser une phrase de 8+ mots d'une autre ville (anti duplicate).
   Rédaction 100 % originale : varie structure, angles, formulations.
2. N'INVENTE AUCUN fait local (monument, quartier, chiffre). Reste factuel : carottage d'enrobés,
   voirie/réseaux/bâtiment, délais, département parent.
3. Conserve les mots-clés SEO : « carottage <ville> », « amiante enrobés <ville> », « HAP ».
4. Corps : 250-400 mots, 2-3 intertitres ##.
5. Frontmatter : metaTitle ≤65 c (« Carottage & amiante enrobés <Ville> (<CP>) | France Carottage »),
   metaDescription 120-160 c originale ; conserver lat/lng/codePostal/departement/anciennesUrls
   tels quels ; SUPPRIMER la clé `brut`.
6. Ton : technique, orienté maîtrise d'ouvrage/MOE voirie — vouvoiement.
Rends UNIQUEMENT le fichier complet réécrit.
```

- [ ] **Step 4 : 161 villes restantes — lissage automatisé + validation frontmatter**

Ces villes sont déjà différenciées **structurellement** (4 variantes) ; il reste à : (a) rendre le frontmatter conforme au schéma modernisé (metaTitle 10-70, metaDescription 80-180), (b) lisser le texte source, (c) supprimer `brut`. Par lots de ~25 via sous-agents (prompt : « lisse et rends conforme, NE recopie AUCUNE phrase d'une autre ville, garde les mots-clés, supprime brut »). Le contrôle anti-duplication (Step 5) garde le filet.

- [ ] **Step 5 : Contrôle anti-duplication (étendu aux DEUX collections) — après chaque lot**

```bash
corepack pnpm tsx -e "
import { readFileSync, readdirSync } from 'node:fs';
const dirs = ['content/carottage/villes', 'content/carottage/departements'];
const phrases = new Map();
let doublons = 0;
for (const dir of dirs) {
  for (const f of readdirSync(dir)) {
    const corps = readFileSync(dir + '/' + f, 'utf8').split('---').slice(2).join('---');
    for (const p of corps.split(/[.!?]/)) {
      const clef = p.trim().toLowerCase().replace(/\s+/g, ' ');
      if (clef.split(' ').length >= 8) {
        if (phrases.has(clef)) { doublons++; console.log('DOUBLON:', f, '<->', phrases.get(clef), '::', clef.slice(0,70)); }
        phrases.set(clef, dir + '/' + f);
      }
    }
  }
}
console.log(doublons === 0 ? 'scan OK — aucun doublon' : 'ECHEC — ' + doublons + ' doublons');"
```

Expected : `scan OK — aucun doublon`. Corriger toute collision avant de committer le lot.

- [ ] **Step 6 : Commits par lot + fin de tranche**

```bash
corepack pnpm test && corepack pnpm typecheck
git add content/carottage lib/clients/francecarottage/top-villes.ts
git commit -m "feat(content): differencie departements + top villes FC (lot N)"
```

Fin : `grep -rl "brut: true" content/carottage/villes content/carottage/departements || echo "OK: plus aucun contenu geo brut"`. Spot-check 5 départements + 5 villes dans le navigateur (variantes visiblement différentes).

**Critère de passage FC4 :** scan anti-duplication vide ; spot-check 5 départements + 5 villes OK ; aucun `brut: true` géo restant.

---

## Tranche FC5 — Devis Brevo + contact + légales

### Task FC5.1 : Client Brevo (email transactionnel, fail-soft, sans fuite de clé)

**Files:**
- Create: `lib/brevo/client.ts`
- Test: `lib/brevo/__tests__/client.test.ts`

**Interfaces:**
- Produces : `sendTransactionalEmail({ to, subject, htmlContent, replyTo }): Promise<{ ok: true } | { ok: false; error: string }>` (REST `api.brevo.com/v3/smtp/email`, header `api-key`) ; `hasBrevoEnv()`, `getCarottageEmailFrom()`, `getCarottageEmailInternal()`. **La clé n'apparaît jamais dans un message d'erreur ni un log.**

- [ ] **Step 1 : Tests qui échouent (mock fetch)**

```ts
// lib/brevo/__tests__/client.test.ts
import { afterEach, describe, expect, it, vi } from "vitest";

import { sendTransactionalEmail } from "../client";

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
});

describe("sendTransactionalEmail", () => {
  it("échoue proprement si la clé est absente (sans exposer d'env)", async () => {
    vi.stubEnv("BREVO_API_KEY", "");
    const r = await sendTransactionalEmail({
      to: "pro@exemple.fr",
      subject: "Test",
      htmlContent: "<p>hi</p>",
    });
    expect(r).toEqual({ ok: false, error: "Brevo non configuré." });
  });

  it("poste sur l'API Brevo avec le header api-key et renvoie ok", async () => {
    vi.stubEnv("BREVO_API_KEY", "xkeysib-SECRET");
    vi.stubEnv("CAROTTAGE_EMAIL_FROM", "devis@france-carottage.fr");
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(new Response(JSON.stringify({ messageId: "1" }), { status: 201 }));

    const r = await sendTransactionalEmail({
      to: "pro@exemple.fr",
      subject: "Nouvelle demande",
      htmlContent: "<p>corps</p>",
      replyTo: "client@exemple.fr",
    });

    expect(r).toEqual({ ok: true });
    const [url, init] = fetchMock.mock.calls[0]!;
    expect(url).toBe("https://api.brevo.com/v3/smtp/email");
    expect((init?.headers as Record<string, string>)["api-key"]).toBe("xkeysib-SECRET");
  });

  it("ne place JAMAIS la clé dans le message d'erreur en cas d'échec HTTP", async () => {
    vi.stubEnv("BREVO_API_KEY", "xkeysib-SECRET");
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ message: "bad request" }), { status: 400 }),
    );
    const r = await sendTransactionalEmail({ to: "x@y.fr", subject: "s", htmlContent: "<p/>" });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).not.toContain("xkeysib-SECRET");
  });
});
```

- [ ] **Step 2 : Vérifier l'échec** — `corepack pnpm vitest run lib/brevo/__tests__/client.test.ts` → FAIL.

- [ ] **Step 3 : Implémenter**

```ts
// lib/brevo/client.ts
/**
 * Client Brevo (email transactionnel) — SERVEUR UNIQUEMENT.
 * REST https://api.brevo.com/v3/smtp/email, auth par header `api-key`.
 * Fail-soft : si la clé est absente, renvoie une erreur SANS jamais exposer la clé.
 */
const BREVO_URL = "https://api.brevo.com/v3/smtp/email";

export function hasBrevoEnv(): boolean {
  return Boolean(process.env.BREVO_API_KEY);
}

export function getCarottageEmailFrom(): string {
  return process.env.CAROTTAGE_EMAIL_FROM ?? "devis@france-carottage.fr";
}

export function getCarottageEmailInternal(): string {
  return process.env.CAROTTAGE_EMAIL_INTERNAL ?? "contact@france-carottage.fr";
}

type EnvoiParams = {
  to: string;
  subject: string;
  htmlContent: string;
  replyTo?: string;
};

export async function sendTransactionalEmail(
  params: EnvoiParams,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const key = process.env.BREVO_API_KEY;
  if (!key) return { ok: false, error: "Brevo non configuré." };

  try {
    const res = await fetch(BREVO_URL, {
      method: "POST",
      headers: {
        "api-key": key,
        "content-type": "application/json",
        accept: "application/json",
      },
      body: JSON.stringify({
        sender: { name: "France Carottage", email: getCarottageEmailFrom() },
        to: [{ email: params.to }],
        subject: params.subject,
        htmlContent: params.htmlContent,
        ...(params.replyTo ? { replyTo: { email: params.replyTo } } : {}),
      }),
    });
    if (!res.ok) {
      // On ne loggue et ne renvoie QUE le status — jamais la clé ni les headers.
      return { ok: false, error: `Brevo a répondu ${res.status}.` };
    }
    return { ok: true };
  } catch {
    return { ok: false, error: "Envoi Brevo indisponible (réseau)." };
  }
}
```

- [ ] **Step 4 : Vert + commit**

```bash
corepack pnpm vitest run lib/brevo
corepack pnpm typecheck && corepack pnpm test
git add lib/brevo
git commit -m "feat(brevo): client email transactionnel fail-soft (api-key, sans fuite de cle)"
```

---

### Task FC5.2 : Schéma de validation du devis B2B (TDD)

**Files:**
- Create: `app/carottage/devis/schema.ts`
- Test: `app/carottage/devis/__tests__/schema.test.ts`

Le schéma vit dans un fichier **hors `"use server"`** (un fichier `"use server"` ne peut exporter que des fonctions async) : il est ainsi importable par l'action ET testable.

**Interfaces:**
- Produces : `DevisSchema` (Zod) ; `type DevisInput = z.infer<typeof DevisSchema>` ; `DELAI_MIN_MS = 3000` (délai minimal de soumission anti-bot).

- [ ] **Step 1 : Tests qui échouent**

```ts
// app/carottage/devis/__tests__/schema.test.ts
import { describe, expect, it } from "vitest";

import { DevisSchema } from "../schema";

const valide = {
  typeChantier: "voirie",
  localisation: "Orléans (45000)",
  uniteMesure: "surface",
  quantiteEstimee: 250,
  delai: "sous-1-mois",
  entreprise: "Travaux Publics du Centre",
  nom: "Jean Dupont",
  emailPro: "j.dupont@tpc.fr",
  telephone: "0238000000",
  message: "Réfection de voirie sur 250 m².",
};

describe("DevisSchema", () => {
  it("accepte une demande valide", () => {
    expect(DevisSchema.parse(valide).typeChantier).toBe("voirie");
  });

  it("refuse un type de chantier hors liste", () => {
    expect(() => DevisSchema.parse({ ...valide, typeChantier: "piscine" })).toThrow();
  });

  it("refuse un email non professionnel mal formé", () => {
    expect(() => DevisSchema.parse({ ...valide, emailPro: "pas-un-email" })).toThrow();
  });

  it("refuse une quantité nulle ou négative", () => {
    expect(() => DevisSchema.parse({ ...valide, quantiteEstimee: 0 })).toThrow();
  });

  it("rend le message facultatif", () => {
    const sansMessage = { ...valide };
    delete (sansMessage as { message?: string }).message;
    expect(() => DevisSchema.parse(sansMessage)).not.toThrow();
  });
});
```

- [ ] **Step 2 : Vérifier l'échec** — `corepack pnpm vitest run app/carottage/devis/__tests__/schema.test.ts` → FAIL.

- [ ] **Step 3 : Implémenter**

```ts
// app/carottage/devis/schema.ts
/** Validation de la demande de devis B2B France Carottage (partagée action + tests). */
import { z } from "zod";

/** Délai minimal (ms) entre l'affichage du formulaire et sa soumission (anti-bot). */
export const DELAI_MIN_MS = 3000;

export const DevisSchema = z.object({
  typeChantier: z.enum(["voirie", "reseaux", "batiment"]),
  localisation: z.string().min(2).max(120),
  uniteMesure: z.enum(["surface", "lineaire"]),
  quantiteEstimee: z.number().positive().max(1_000_000),
  delai: z.enum(["urgent", "sous-1-mois", "1-3-mois", "a-planifier"]),
  entreprise: z.string().min(2).max(120),
  nom: z.string().min(2).max(80),
  emailPro: z.string().email().max(160),
  telephone: z.string().regex(/^[+0-9 ().-]{8,20}$/, "téléphone invalide"),
  message: z.string().max(2000).optional(),
});

export type DevisInput = z.infer<typeof DevisSchema>;
```

- [ ] **Step 4 : Vert + commit**

```bash
corepack pnpm vitest run app/carottage/devis
git add "app/carottage/devis/schema.ts" "app/carottage/devis/__tests__"
git commit -m "feat(carottage): schema Zod du devis B2B (TDD)"
```

---

### Task FC5.3 : Server Action devis + emails + formulaire

**Files:**
- Modify: `app/carottage/devis/schema.ts` (ajouter les types d'état)
- Create: `app/carottage/devis/emails.ts`, `app/carottage/devis/actions.ts`, `app/carottage/devis/page.tsx`, `components/carottage/DevisFormFC.tsx`

**Interfaces:**
- Consumes : `DevisSchema`, `DELAI_MIN_MS`, `sendTransactionalEmail`, `getCarottageEmailInternal`.
- Produces : `soumettreDevis(prev, formData): Promise<DevisState>` (Server Action) ; formulaire client avec honeypot + horodatage.

- [ ] **Step 1 : Ajouter l'état + les libellés dans `schema.ts`**

Ajouter en fin de `app/carottage/devis/schema.ts` :

```ts
export type DevisState =
  | { status: "idle" }
  | { status: "success" }
  | { status: "error"; error: string; fieldErrors?: Record<string, string> };

export const LIBELLES_CHANTIER: Record<DevisInput["typeChantier"], string> = {
  voirie: "Voirie & chaussées",
  reseaux: "Réseaux & tranchées",
  batiment: "Bâtiment & parkings",
};

export const LIBELLES_DELAI: Record<DevisInput["delai"], string> = {
  urgent: "Urgent (sous 15 jours)",
  "sous-1-mois": "Sous 1 mois",
  "1-3-mois": "1 à 3 mois",
  "a-planifier": "À planifier",
};
```

- [ ] **Step 2 : Templates email (HTML inline, aucune clé)**

```ts
// app/carottage/devis/emails.ts
import { LIBELLES_CHANTIER, LIBELLES_DELAI, type DevisInput } from "./schema";

const cadre = (inner: string) =>
  `<div style="font-family:system-ui,-apple-system,sans-serif;max-width:600px;margin:0 auto;padding:24px;color:#111113;">${inner}<hr style="border:none;border-top:1px solid #e4e3e0;margin:24px 0;" /><p style="color:#6b6e73;font-size:12px;">France Carottage — carottage routier & repérage amiante/HAP sur enrobés · réseau national</p></div>`;

/** Email de notification interne (nouvelle demande de devis). */
export function emailNotificationInterne(d: DevisInput): { subject: string; html: string } {
  const lignes = [
    ["Type de chantier", LIBELLES_CHANTIER[d.typeChantier]],
    ["Localisation", d.localisation],
    [d.uniteMesure === "surface" ? "Surface estimée" : "Linéaire estimé", `${d.quantiteEstimee} ${d.uniteMesure === "surface" ? "m²" : "ml"}`],
    ["Délai", LIBELLES_DELAI[d.delai]],
    ["Entreprise", d.entreprise],
    ["Contact", `${d.nom} — ${d.emailPro} — ${d.telephone}`],
    ["Message", d.message ?? "—"],
  ]
    .map(([k, v]) => `<tr><td style="padding:6px 12px 6px 0;color:#6b6e73;vertical-align:top;">${k}</td><td style="padding:6px 0;font-weight:600;">${v}</td></tr>`)
    .join("");
  return {
    subject: `Nouvelle demande de devis — ${d.entreprise} (${LIBELLES_CHANTIER[d.typeChantier]})`,
    html: cadre(
      `<h2 style="margin:0 0 16px;font-size:18px;">Nouvelle demande de devis</h2><table style="font-size:14px;border-collapse:collapse;">${lignes}</table>`,
    ),
  };
}

/** Accusé de réception envoyé au demandeur. */
export function emailAccuseReception(d: DevisInput): { subject: string; html: string } {
  return {
    subject: "Votre demande de devis — France Carottage",
    html: cadre(
      `<h2 style="margin:0 0 12px;font-size:18px;">Demande bien reçue</h2><p>Bonjour ${d.nom},</p><p>Nous avons bien reçu votre demande concernant un chantier <strong>${LIBELLES_CHANTIER[d.typeChantier]}</strong> à ${d.localisation}. Notre équipe revient vers vous avec un devis chiffré sous 24 h ouvrées.</p><p style="margin-top:16px;">À très vite,<br/>L'équipe France Carottage</p>`,
    ),
  };
}
```

- [ ] **Step 3 : Server Action**

```ts
// app/carottage/devis/actions.ts
"use server";

import {
  getCarottageEmailInternal,
  sendTransactionalEmail,
} from "@/lib/brevo/client";

import { emailAccuseReception, emailNotificationInterne } from "./emails";
import { DELAI_MIN_MS, DevisSchema, type DevisState } from "./schema";

export async function soumettreDevis(_prev: DevisState, formData: FormData): Promise<DevisState> {
  // Anti-spam 1 : honeypot (champ caché "site" ; un humain le laisse vide).
  if ((formData.get("site") as string)?.trim()) {
    return { status: "success" }; // faux succès : on ne prévient pas le bot.
  }
  // Anti-spam 2 : délai minimal de soumission.
  const rendu = Number(formData.get("renderedAt") ?? 0);
  if (!rendu || Date.now() - rendu < DELAI_MIN_MS) {
    return { status: "success" };
  }

  const parsed = DevisSchema.safeParse({
    typeChantier: formData.get("typeChantier"),
    localisation: (formData.get("localisation") as string)?.trim(),
    uniteMesure: formData.get("uniteMesure"),
    quantiteEstimee: Number(formData.get("quantiteEstimee")),
    delai: formData.get("delai"),
    entreprise: (formData.get("entreprise") as string)?.trim(),
    nom: (formData.get("nom") as string)?.trim(),
    emailPro: (formData.get("emailPro") as string)?.trim(),
    telephone: (formData.get("telephone") as string)?.trim(),
    message: (formData.get("message") as string)?.trim() || undefined,
  });

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const champ = issue.path[0];
      if (typeof champ === "string" && !fieldErrors[champ]) fieldErrors[champ] = issue.message;
    }
    return { status: "error", error: "Vérifiez les champs signalés.", fieldErrors };
  }

  const d = parsed.data;
  const interne = emailNotificationInterne(d);
  const notif = await sendTransactionalEmail({
    to: getCarottageEmailInternal(),
    subject: interne.subject,
    htmlContent: interne.html,
    replyTo: d.emailPro,
  });
  if (!notif.ok) {
    return { status: "error", error: "L'envoi a échoué, réessayez ou appelez-nous." };
  }
  // Accusé de réception (non bloquant : la demande interne est déjà partie).
  const ar = emailAccuseReception(d);
  await sendTransactionalEmail({ to: d.emailPro, subject: ar.subject, htmlContent: ar.html });

  return { status: "success" };
}
```

- [ ] **Step 4 : Formulaire client (honeypot + horodatage)**

```tsx
// components/carottage/DevisFormFC.tsx
"use client";

import { useActionState, useEffect, useRef, useState } from "react";

import { soumettreDevis } from "@/app/carottage/devis/actions";
import { LIBELLES_CHANTIER, LIBELLES_DELAI, type DevisState } from "@/app/carottage/devis/schema";

const CHANTIERS = Object.entries(LIBELLES_CHANTIER) as [keyof typeof LIBELLES_CHANTIER, string][];
const DELAIS = Object.entries(LIBELLES_DELAI) as [keyof typeof LIBELLES_DELAI, string][];

const champClasses =
  "w-full rounded-[4px] border border-[color:var(--fc-gris-clair)] bg-white px-3.5 py-2.5 text-[14.5px] text-[color:var(--fc-noir)] outline-none focus:border-[color:var(--fc-rouge)]";
const labelClasses = "block text-[13px] font-semibold text-[color:var(--fc-noir)]";

export function DevisFormFC() {
  const [state, formAction, pending] = useActionState<DevisState, FormData>(soumettreDevis, {
    status: "idle",
  });
  const renderedAt = useRef<number>(Date.now());
  const [unite, setUnite] = useState<"surface" | "lineaire">("surface");

  useEffect(() => {
    renderedAt.current = Date.now();
  }, []);

  const err = (champ: string) =>
    state.status === "error" ? state.fieldErrors?.[champ] : undefined;

  if (state.status === "success") {
    return (
      <div className="rounded-[6px] border-l-4 border-[color:var(--fc-rouge)] bg-white p-8">
        <h2 className="font-[family-name:var(--font-sora)] text-[22px] font-extrabold text-[color:var(--fc-noir)]">
          Demande envoyée.
        </h2>
        <p className="mt-3 text-[15px] text-[color:var(--fc-gris)]">
          Merci ! Nous revenons vers vous avec un devis chiffré sous 24 h ouvrées.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="grid gap-5">
      {/* Honeypot (masqué visuellement + a11y) */}
      <input
        type="text"
        name="site"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden
        className="absolute left-[-9999px] h-0 w-0 opacity-0"
      />
      <input type="hidden" name="renderedAt" value={renderedAt.current} />

      <div>
        <span className={labelClasses}>Type de chantier</span>
        <div className="mt-2 grid gap-2 sm:grid-cols-3">
          {CHANTIERS.map(([val, lib], i) => (
            <label
              key={val}
              className="flex cursor-pointer items-center gap-2 rounded-[4px] border border-[color:var(--fc-gris-clair)] bg-white px-3 py-2.5 text-[13.5px] font-semibold has-[:checked]:border-[color:var(--fc-rouge)] has-[:checked]:text-[color:var(--fc-rouge)]"
            >
              <input type="radio" name="typeChantier" value={val} defaultChecked={i === 0} className="accent-[color:var(--fc-rouge)]" />
              {lib}
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className={labelClasses} htmlFor="localisation">Localisation (ville + code postal)</label>
        <input id="localisation" name="localisation" className={`mt-1.5 ${champClasses}`} placeholder="Orléans (45000)" />
        {err("localisation") && <p className="mt-1 text-[12.5px] text-[color:var(--fc-rouge)]">{err("localisation")}</p>}
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <span className={labelClasses}>Unité</span>
          <div className="mt-2 flex gap-2">
            {(["surface", "lineaire"] as const).map((u) => (
              <label key={u} className="flex cursor-pointer items-center gap-2 rounded-[4px] border border-[color:var(--fc-gris-clair)] bg-white px-3 py-2.5 text-[13.5px] font-semibold has-[:checked]:border-[color:var(--fc-rouge)]">
                <input
                  type="radio"
                  name="uniteMesure"
                  value={u}
                  checked={unite === u}
                  onChange={() => setUnite(u)}
                  className="accent-[color:var(--fc-rouge)]"
                />
                {u === "surface" ? "Surface (m²)" : "Linéaire (ml)"}
              </label>
            ))}
          </div>
        </div>
        <div>
          <label className={labelClasses} htmlFor="quantiteEstimee">
            {unite === "surface" ? "Surface estimée (m²)" : "Linéaire estimé (ml)"}
          </label>
          <input id="quantiteEstimee" name="quantiteEstimee" type="number" min={1} className={`mt-1.5 ${champClasses}`} placeholder="250" />
          {err("quantiteEstimee") && <p className="mt-1 text-[12.5px] text-[color:var(--fc-rouge)]">{err("quantiteEstimee")}</p>}
        </div>
      </div>

      <div>
        <label className={labelClasses} htmlFor="delai">Délai souhaité</label>
        <select id="delai" name="delai" className={`mt-1.5 ${champClasses}`} defaultValue="sous-1-mois">
          {DELAIS.map(([val, lib]) => (
            <option key={val} value={val}>{lib}</option>
          ))}
        </select>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className={labelClasses} htmlFor="entreprise">Entreprise</label>
          <input id="entreprise" name="entreprise" className={`mt-1.5 ${champClasses}`} />
          {err("entreprise") && <p className="mt-1 text-[12.5px] text-[color:var(--fc-rouge)]">{err("entreprise")}</p>}
        </div>
        <div>
          <label className={labelClasses} htmlFor="nom">Nom du contact</label>
          <input id="nom" name="nom" className={`mt-1.5 ${champClasses}`} />
          {err("nom") && <p className="mt-1 text-[12.5px] text-[color:var(--fc-rouge)]">{err("nom")}</p>}
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className={labelClasses} htmlFor="emailPro">Email professionnel</label>
          <input id="emailPro" name="emailPro" type="email" className={`mt-1.5 ${champClasses}`} />
          {err("emailPro") && <p className="mt-1 text-[12.5px] text-[color:var(--fc-rouge)]">{err("emailPro")}</p>}
        </div>
        <div>
          <label className={labelClasses} htmlFor="telephone">Téléphone</label>
          <input id="telephone" name="telephone" className={`mt-1.5 ${champClasses}`} />
          {err("telephone") && <p className="mt-1 text-[12.5px] text-[color:var(--fc-rouge)]">{err("telephone")}</p>}
        </div>
      </div>

      <div>
        <label className={labelClasses} htmlFor="message">Message (facultatif)</label>
        <textarea id="message" name="message" rows={4} className={`mt-1.5 ${champClasses}`} />
      </div>

      {state.status === "error" && (
        <p className="text-[13.5px] font-semibold text-[color:var(--fc-rouge)]">{state.error}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="inline-flex items-center justify-center rounded-[4px] bg-[color:var(--fc-rouge)] px-7 py-4 font-[family-name:var(--font-sora)] text-[14.5px] font-bold uppercase tracking-wide text-white transition-colors hover:bg-[color:var(--fc-rouge-fonce)] disabled:opacity-60"
      >
        {pending ? "Envoi…" : "Envoyer ma demande"}
      </button>
    </form>
  );
}
```

- [ ] **Step 5 : Page `/devis`**

```tsx
// app/carottage/devis/page.tsx
import type { Metadata } from "next";

import { ArianeFC } from "@/components/carottage/ArianeFC";
import { DevisFormFC } from "@/components/carottage/DevisFormFC";
import { SurtitreFC } from "@/components/carottage/SurtitreFC";
import { francecarottageConfig } from "@/lib/clients/francecarottage/config";

export const metadata: Metadata = {
  title: "Devis chantier — carottage & repérage amiante/HAP",
  description:
    "Décrivez votre chantier (voirie, réseaux, bâtiment) et recevez un devis de carottage et repérage amiante/HAP sur enrobés sous 24 h ouvrées. France Carottage.",
  alternates: { canonical: "/devis" },
};

export default function DevisPage() {
  return (
    <>
      <section className="border-b border-[color:var(--fc-gris-clair)] bg-white">
        <div className="mx-auto max-w-[var(--container,1280px)] px-6 py-12 md:px-8">
          <SurtitreFC>Devis chantier</SurtitreFC>
          <h1 className="mt-4 max-w-2xl font-[family-name:var(--font-sora)] text-[34px] font-extrabold leading-tight tracking-[-0.02em] text-[color:var(--fc-noir)] sm:text-[42px]">
            Recevez votre devis sous 24 h ouvrées.
          </h1>
        </div>
      </section>
      <ArianeFC segments={[{ label: "Devis", href: "/devis" }]} />
      <section className="mx-auto grid max-w-[var(--container,1280px)] gap-10 px-6 py-10 md:grid-cols-[1.4fr_1fr] md:px-8">
        <DevisFormFC />
        <aside className="h-fit border-l-4 border-[color:var(--fc-rouge)] bg-white p-6">
          <p className="font-[family-name:var(--font-sora)] text-[16px] font-bold text-[color:var(--fc-noir)]">
            Besoin d'échanger de vive voix ?
          </p>
          <a
            href={francecarottageConfig.contact.telephoneHref}
            className="mt-3 inline-block font-[family-name:var(--font-sora)] text-[22px] font-extrabold text-[color:var(--fc-rouge)]"
          >
            {francecarottageConfig.contact.telephone}
          </a>
          <p className="mt-4 text-[13.5px] leading-relaxed text-[color:var(--fc-gris)]">
            Interventions {francecarottageConfig.zoneIntervention}. Prélèvements normalisés,
            laboratoire accrédité, rapports exploitables pour votre maîtrise d'œuvre.
          </p>
        </aside>
      </section>
    </>
  );
}
```

- [ ] **Step 6 : Vérifier + commit**

```bash
corepack pnpm typecheck && corepack pnpm test
```

Ouvrir `/devis` (host FC) : formulaire complet, erreurs de validation (soumettre vide), état succès (avec `BREVO_API_KEY` de test en préprod). Screenshots.

```bash
git add "app/carottage/devis" components/carottage/DevisFormFC.tsx
git commit -m "feat(carottage): server action devis + emails Brevo + formulaire (honeypot + delai)"
```

---

### Task FC5.4 : Contact + mentions légales FC

**Files:**
- Create: `app/carottage/contact/page.tsx`, `app/carottage/mentions-legales/page.tsx`

**Interfaces:**
- Consumes : `SurtitreFC`, `ArianeFC`, `CtaDevisFC`, `francecarottageConfig`.

- [ ] **Step 1 : Page contact**

```tsx
// app/carottage/contact/page.tsx
import type { Metadata } from "next";
import { ClockIcon, MailIcon, MapPinIcon, PhoneIcon } from "lucide-react";

import { ArianeFC } from "@/components/carottage/ArianeFC";
import { CtaDevisFC } from "@/components/carottage/CtaDevisFC";
import { SurtitreFC } from "@/components/carottage/SurtitreFC";
import { francecarottageConfig } from "@/lib/clients/francecarottage/config";

export const metadata: Metadata = {
  title: "Contact — France Carottage",
  description:
    "Contactez France Carottage pour vos chantiers de carottage et repérage amiante/HAP sur enrobés. Interventions partout en France, devis sous 24 h ouvrées.",
  alternates: { canonical: "/contact" },
};

const c = francecarottageConfig;
const COORDONNEES = [
  { icone: PhoneIcon, titre: c.contact.telephone, detail: "Du lundi au vendredi", href: c.contact.telephoneHref },
  { icone: MailIcon, titre: c.contact.email, detail: "Réponse sous 24 h ouvrées", href: `mailto:${c.contact.email}` },
  { icone: MapPinIcon, titre: `${c.adresse.ligne1}, ${c.adresse.codePostal} ${c.adresse.ville}`, detail: "Siège — interventions nationales", href: undefined },
  { icone: ClockIcon, titre: "Intervention sous 24-48 h", detail: c.zoneIntervention, href: undefined },
] as const;

export default function ContactPageFC() {
  return (
    <>
      <section className="border-b border-[color:var(--fc-gris-clair)] bg-white">
        <div className="mx-auto max-w-[var(--container,1280px)] px-6 py-12 md:px-8">
          <SurtitreFC>Contact</SurtitreFC>
          <h1 className="mt-4 max-w-2xl font-[family-name:var(--font-sora)] text-[34px] font-extrabold leading-tight tracking-[-0.02em] text-[color:var(--fc-noir)] sm:text-[42px]">
            Parlons de votre chantier.
          </h1>
        </div>
      </section>
      <ArianeFC segments={[{ label: "Contact", href: "/contact" }]} />
      <section className="mx-auto max-w-[var(--container,1280px)] px-6 py-10 md:px-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {COORDONNEES.map(({ icone: Icone, titre, detail, href }) => {
            const inner = (
              <>
                <Icone className="h-5 w-5 shrink-0 text-[color:var(--fc-rouge)]" aria-hidden />
                <div>
                  <p className="font-[family-name:var(--font-sora)] text-[14px] font-bold text-[color:var(--fc-noir)]">{titre}</p>
                  <p className="mt-1 text-[13px] text-[color:var(--fc-gris)]">{detail}</p>
                </div>
              </>
            );
            const cls = "flex items-start gap-3 border-t-2 border-[color:var(--fc-gris-clair)] bg-white p-5 transition-colors hover:border-[color:var(--fc-rouge)]";
            return href ? (
              <a key={titre} href={href} className={cls}>{inner}</a>
            ) : (
              <div key={titre} className={cls}>{inner}</div>
            );
          })}
        </div>
      </section>
      <CtaDevisFC titre="Le plus simple : décrivez votre chantier" />
    </>
  );
}
```

- [ ] **Step 2 : Mentions légales (contenu réel repris, à valider client)**

Récupérer le contenu réel de `https://www.france-carottage.fr/mentions-legales.html` et le porter en JSX simple. Placer en tête un commentaire de validation.

```tsx
// app/carottage/mentions-legales/page.tsx
import type { Metadata } from "next";

import { ArianeFC } from "@/components/carottage/ArianeFC";
import { SurtitreFC } from "@/components/carottage/SurtitreFC";
import { francecarottageConfig } from "@/lib/clients/francecarottage/config";

export const metadata: Metadata = {
  title: "Mentions légales — France Carottage",
  description: "Mentions légales du site France Carottage : éditeur, hébergeur, propriété intellectuelle.",
  alternates: { canonical: "/mentions-legales" },
  robots: { index: false, follow: true },
};

/* CONTENU À FAIRE VALIDER PAR ETIENNE avant bascule DNS (spec §13). */
export default function MentionsLegalesFC() {
  const c = francecarottageConfig;
  return (
    <>
      <section className="border-b border-[color:var(--fc-gris-clair)] bg-white">
        <div className="mx-auto max-w-[var(--container,1280px)] px-6 py-12 md:px-8">
          <SurtitreFC>Légal</SurtitreFC>
          <h1 className="mt-4 font-[family-name:var(--font-sora)] text-[30px] font-extrabold tracking-[-0.02em] text-[color:var(--fc-noir)] sm:text-[38px]">
            Mentions légales
          </h1>
        </div>
      </section>
      <ArianeFC segments={[{ label: "Mentions légales", href: "/mentions-legales" }]} />
      <article className="fc-prose mx-auto max-w-3xl px-6 py-8 md:px-8">
        <h2>Éditeur</h2>
        <p>
          {c.raisonSociale}
          {c.siret ? ` — SIRET ${c.siret}` : " — SIRET à compléter"}. {c.adresse.ligne1}, {c.adresse.codePostal} {c.adresse.ville}. Téléphone : {c.contact.telephone}. Email : {c.contact.email}.
        </p>
        <h2>Hébergeur</h2>
        <p>Site hébergé sur l'infrastructure Coolify de Propul'seo (à préciser avant mise en prod).</p>
        <h2>Propriété intellectuelle</h2>
        <p>
          L'ensemble des contenus (textes, visuels, logos) est la propriété de {c.raisonSociale}, sauf mention contraire. Toute reproduction sans autorisation est interdite.
        </p>
        <h2>Données personnelles</h2>
        <p>
          Les informations transmises via le formulaire de devis servent uniquement au traitement de votre demande. Vous disposez d'un droit d'accès et de suppression en écrivant à {c.contact.email}.
        </p>
      </article>
    </>
  );
}
```

- [ ] **Step 3 : Vérifier + commit**

```bash
corepack pnpm typecheck
git add "app/carottage/contact/page.tsx" "app/carottage/mentions-legales/page.tsx"
git commit -m "feat(carottage): pages contact + mentions legales FC (a valider client)"
```

**Critère de passage FC5 :** envoi réel testé en préprod avec la clé Brevo de test (notification interne + accusé de réception reçus) ; formulaire refuse les soumissions instantanées et le honeypot rempli.

---

## Tranche FC6 — SEO technique + cross-links animés

### Task FC6.1 : Redirections 301 host-based FC + e2e

**Files:**
- Modify: `next.config.ts`
- Test: `e2e/carottage-redirections.spec.ts`

**Interfaces:**
- Consumes : `lib/seo/redirects-carottage.json` (FC1.7), `NEXT_PUBLIC_CAROTTAGE_HOSTS`.
- Produces : ~260 redirects 301/308 déclenchées **uniquement sur les hosts FC** (`has: [{ type: "host", value }]`).

- [ ] **Step 1 : Composer `redirects()` (SI existant + FC host-guardé)**

À ce stade `next.config.ts` contient déjà les redirects Servicimmo (Task 18 SI). On y **ajoute** les redirects FC. Les sources ne se chevauchent pas entre les deux sites (préfixes d'URL distincts), mais on isole les FC par host pour être strict. Forme cible :

```ts
// next.config.ts
import type { NextConfig } from "next";

import anciennesRedirections from "./lib/seo/redirects.json";
import redirectsCarottage from "./lib/seo/redirects-carottage.json";

/** Hosts FC (sans port) — chaque redirect FC est gardé sur ces hosts. */
const HOSTS_CAROTTAGE = (process.env.NEXT_PUBLIC_CAROTTAGE_HOSTS ?? "")
  .split(",")
  .map((h) => h.trim())
  .filter(Boolean);

const nextConfig: NextConfig = {
  async redirects() {
    // Servicimmo : inchangé (sources en /diagnostic-immobilier-*, -iN, services .html).
    const servicimmo = anciennesRedirections.map((r) => ({
      source: r.source,
      destination: r.destination,
      permanent: true,
    }));

    // France Carottage : mêmes redirects répétés par host FC (has host).
    const carottage = HOSTS_CAROTTAGE.flatMap((host) =>
      redirectsCarottage.map((r) => ({
        source: r.source,
        has: [{ type: "host" as const, value: host }],
        destination: r.destination,
        permanent: true,
      })),
    );

    return [...servicimmo, ...carottage];
  },
};

export default nextConfig;
```

Note : si `next.config.ts` porte déjà d'autres clés (images, etc.) au moment FC, les conserver et n'ajouter que la logique `carottage` dans `redirects()`. `resolveJsonModule` est déjà actif (`tsconfig.json`).

- [ ] **Step 2 : e2e (host FC simulé)**

```ts
// e2e/carottage-redirections.spec.ts
import { expect, test } from "@playwright/test";

import redirections from "../lib/seo/redirects-carottage.json";

const HOST_FC = "carottage.localhost";
// Échantillon (un par type) pour garder le run rapide ; le build valide l'exhaustivité.
const echantillon = redirections.slice(0, 20);

for (const r of echantillon) {
  test(`redirige ${r.source} (host FC)`, async ({ request }) => {
    const res = await request.get(r.source, { headers: { host: HOST_FC }, maxRedirects: 0 });
    expect([301, 308]).toContain(res.status());
    expect(res.headers()["location"]).toContain(r.destination);
  });
}

test("les .html FC ne redirigent PAS sur le host Servicimmo", async ({ request }) => {
  const first = redirections[0];
  if (!first) return;
  const res = await request.get(first.source, { maxRedirects: 0 });
  // Sur le host SI, cette source FC n'existe pas → 404 (ou 200 si collision improbable), jamais 30x vers la cible FC.
  expect(res.headers()["location"] ?? "").not.toContain(first.destination);
});
```

- [ ] **Step 3 : Exécuter**

```bash
corepack pnpm build && corepack pnpm start &
corepack pnpm test:e2e e2e/carottage-redirections.spec.ts
```

Expected : échantillon PASS. Chaque échec = un contenu manquant ou un slug incohérent → corriger le contenu, pas le test.

- [ ] **Step 4 : Commit**

```bash
git add next.config.ts e2e/carottage-redirections.spec.ts
git commit -m "feat(seo): redirections 301 host-based France Carottage + e2e"
```

---

### Task FC6.2 : Sitemap + robots FC (par domaine) + JSON-LD LocalBusiness

**Files:**
- Create: `app/carottage/sitemap.ts`, `app/carottage/robots.ts`
- Modify: `app/carottage/layout.tsx` (JSON-LD LocalBusiness + Service)

**Interfaces:**
- Consumes : loaders FC, `carottageUrl`, `francecarottageConfig`. Exposés sur le host FC via le rewrite middleware (`/sitemap.xml` → `/carottage/sitemap.xml`, `/robots.txt` → `/carottage/robots.txt`).

- [ ] **Step 1 : Sitemap FC**

```ts
// app/carottage/sitemap.ts
import type { MetadataRoute } from "next";

import { carottageUrl } from "@/lib/clients/francecarottage/urls";
import { loadDepartementsFC, loadExpertises, loadVillesFC } from "@/lib/content/load-carottage";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [expertises, departements, villes] = await Promise.all([
    loadExpertises(),
    loadDepartementsFC(),
    loadVillesFC(),
  ]);
  const statiques = ["", "/expertises", "/zones", "/devis", "/contact", "/mentions-legales"];
  return [
    ...statiques.map((p) => ({ url: carottageUrl(p), changeFrequency: "monthly" as const })),
    ...expertises.map((e) => ({ url: carottageUrl(`/expertises/${e.slug}`), changeFrequency: "yearly" as const })),
    ...departements.map((d) => ({ url: carottageUrl(`/zones/${d.slug}`), changeFrequency: "monthly" as const })),
    ...villes.map((v) => ({ url: carottageUrl(`/zones/${v.slug}`), changeFrequency: "monthly" as const })),
  ];
}
```

- [ ] **Step 2 : Robots FC**

```ts
// app/carottage/robots.ts
import type { MetadataRoute } from "next";

import { carottageUrl } from "@/lib/clients/francecarottage/urls";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/mentions-legales"] }],
    sitemap: carottageUrl("/sitemap.xml"),
  };
}
```

- [ ] **Step 3 : JSON-LD LocalBusiness + Service dans le layout FC**

Dans `app/carottage/layout.tsx`, importer `JsonLd` + `francecarottageConfig` et l'ajouter dans le JSX (juste sous `<HeaderFC />` ou en fin de wrapper) :

```tsx
import { JsonLd } from "@/components/seo/JsonLd";
import { francecarottageConfig } from "@/lib/clients/francecarottage/config";
import { carottageUrl } from "@/lib/clients/francecarottage/urls";
```

```tsx
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "LocalBusiness",
          name: francecarottageConfig.nom,
          description:
            "Carottage routier et repérage amiante/HAP sur enrobés, réseau national.",
          telephone: "+33247470123",
          url: carottageUrl("/"),
          address: {
            "@type": "PostalAddress",
            streetAddress: francecarottageConfig.adresse.ligne1,
            postalCode: francecarottageConfig.adresse.codePostal,
            addressLocality: francecarottageConfig.adresse.ville,
            addressCountry: "FR",
          },
          areaServed: "France",
          makesOffer: {
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: "Carottage & repérage amiante/HAP sur enrobés",
              areaServed: "France",
            },
          },
        }}
      />
```

- [ ] **Step 4 : Vérifier + commit**

`corepack pnpm dev` puis, host FC, ouvrir `/sitemap.xml` (≈ 260 URLs, toutes en `france-carottage`) et `/robots.txt` (sitemap FC). Vérifier la source d'une page (JSON-LD LocalBusiness présent).

```bash
corepack pnpm typecheck
git add "app/carottage/sitemap.ts" "app/carottage/robots.ts" "app/carottage/layout.tsx"
git commit -m "feat(seo): sitemap + robots FC par domaine + JSON-LD LocalBusiness"
```

---

### Task FC6.3 : Cross-link animé côté Servicimmo + e2e des deux côtés

**Files:**
- Create: `components/marketing/LienMarqueSoeur.tsx`
- Modify: `components/marketing/Header.tsx` (poser le lien vers FC)
- Test: `e2e/cross-links.spec.ts`

**Interfaces:**
- Produces : `LienMarqueSoeur()` — symétrique de `LienServicimmo` (Task FC2.2), côté Servicimmo → France Carottage. URL depuis `NEXT_PUBLIC_CAROTTAGE_URL`, même onglet, hover 250 ms, `aria-label`.

- [ ] **Step 1 : Composant (côté SI → FC)**

Miroir de `components/carottage/LienServicimmo.tsx`, mais aux couleurs Servicimmo (bandeau pétrole) et pointant vers FC. L'URL FC vient de l'env.

```tsx
// components/marketing/LienMarqueSoeur.tsx
import Link from "next/link";
import { ArrowUpRightIcon } from "lucide-react";

const CAROTTAGE_URL = process.env.NEXT_PUBLIC_CAROTTAGE_URL ?? "https://www.france-carottage.fr";

/**
 * Bouton pill vers la marque sœur France Carottage (carottage / amiante enrobés).
 * Posé dans le bandeau utilitaire pétrole du header Servicimmo. Hover : glissement
 * du libellé + flèche (250 ms), même onglet, aria-label explicite.
 */
export function LienMarqueSoeur() {
  return (
    <Link
      href={CAROTTAGE_URL}
      aria-label="Découvrir France Carottage, notre société sœur (carottage et amiante sur enrobés)"
      className="group inline-flex items-center gap-2 rounded-full border border-white/20 px-3 py-1 font-[family-name:var(--font-sora)] text-[12px] font-semibold text-[#bfe0e2] transition-colors duration-[250ms] hover:border-white/50 hover:text-white"
    >
      <span aria-hidden className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#b32024]" />
      <span className="hidden sm:inline">France Carottage</span>
      <ArrowUpRightIcon
        className="h-3.5 w-3.5 shrink-0 -translate-x-1 opacity-0 transition-all duration-[250ms] group-hover:translate-x-0 group-hover:opacity-100"
        aria-hidden
      />
    </Link>
  );
}
```

- [ ] **Step 2 : Poser le lien dans le header Servicimmo**

Dans `components/marketing/Header.tsx`, importer `LienMarqueSoeur` et l'insérer dans le bandeau utilitaire pétrole — entre le bloc certifs et le téléphone (adapter au flux flex existant, sans casser la mise en page à 1280 px) :

```tsx
import { LienMarqueSoeur } from "@/components/marketing/LienMarqueSoeur";
```

Dans le bandeau utilitaire (le `<div className="…flex…justify-between…">`), ajouter `<LienMarqueSoeur />` dans le groupe de droite (à côté du lien `tel:`), par exemple en enveloppant le tél et le lien marque sœur dans un `<span className="inline-flex items-center gap-3">`. Vérifier en local que le bandeau tient sur une ligne à 1280 px et reste lisible en mobile (le libellé se masque en `sm:` via la classe du composant).

- [ ] **Step 3 : e2e — boutons croisés fonctionnels sur les deux hosts**

```ts
// e2e/cross-links.spec.ts
import { expect, test } from "@playwright/test";

const HOST_FC = "carottage.localhost";

// Host Servicimmo (par défaut) : le lien pointe vers France Carottage.
test("header Servicimmo : lien vers France Carottage présent et pointant vers l'URL FC", async ({
  page,
}) => {
  await page.goto("/");
  const lien = page.getByRole("link", { name: /France Carottage, notre société sœur/i });
  await expect(lien).toBeVisible();
  const href = await lien.getAttribute("href");
  expect(href).toContain("carottage");
});

// Host France Carottage : simulé via extraHTTPHeaders (page.goto n'accepte pas de headers par appel).
test.describe("host France Carottage", () => {
  test.use({ extraHTTPHeaders: { host: HOST_FC } });

  test("header France Carottage : lien vers Servicimmo présent", async ({ page }) => {
    await page.goto("/");
    const lien = page.getByRole("link", { name: /Servicimmo, notre société sœur/i });
    await expect(lien).toBeVisible();
  });
});
```

- [ ] **Step 4 : Exécuter + commit**

```bash
corepack pnpm typecheck
corepack pnpm test:e2e e2e/cross-links.spec.ts
git add components/marketing/LienMarqueSoeur.tsx components/marketing/Header.tsx e2e/cross-links.spec.ts
git commit -m "feat(seo): cross-link anime Servicimmo -> France Carottage + e2e deux hosts"
```

**Critère de passage FC6 :** e2e redirections FC vert ; boutons croisés fonctionnels et animés sur les deux hosts ; sitemap/robots FC servis sur le domaine FC.

---

## Tranche FC7 — QA finale + déploiement préprod

### Task FC7.1 : Vérification complète + déploiement Coolify (sous-domaine FC)

**Files:**
- Create (généré) : `scripts/out/rapport-final-carottage.md`

- [ ] **Step 1 : Batterie complète**

```bash
corepack pnpm typecheck
corepack pnpm lint
corepack pnpm test
corepack pnpm build
corepack pnpm test:e2e
```

Expected : tout vert. `build` génère la home FC + expertises + zones (57 + 191) + statiques sans warning de taille. Vérifier qu'aucune page SI ne régresse.

- [ ] **Step 2 : Contenu — aucun `brut: true` restant**

```bash
grep -rl "brut: true" content/carottage && echo "ECHEC: contenu FC brut restant" || echo "OK"
```

- [ ] **Step 3 : Parcours réel (MCP Playwright, host FC)** — home → expertises → une expertise → zones → un département → 3 villes (variantes différentes) → devis (soumission de test) → contact → cross-link vers Servicimmo. Screenshot de chaque type (desktop + 375 px). Console : zéro erreur. Sur le host Servicimmo : vérifier que la home SI et une page SI sont intactes (non-régression), cross-link vers FC visible.

- [ ] **Step 4 : Lighthouse mobile** sur la home FC, une ville, une expertise :

```bash
corepack pnpm dlx lighthouse "http://carottage.localhost:3000/" --preset=perf --form-factor=mobile --output=json --output-path=./scripts/out/lh-carottage-home.json --chrome-flags="--headless"
```

Expected : performance ≥ 90 sur chaque page. Sinon : vérifier l'image hero (poids/`next/image`), Leaflet chargé hors `/zones`, fonts.

- [ ] **Step 5 : Rapport de fin** — écrire `scripts/out/rapport-final-carottage.md` : pages générées par type, redirections FC testées, scores Lighthouse, points à faire valider par Etienne (email interne FC, SIRET/hébergeur mentions légales, asset hero réel, rouge pipeté du logo). Commit :

```bash
git add scripts/out/rapport-final-carottage.md
git commit -m "docs(carottage): rapport QA finale France Carottage"
```

- [ ] **Step 6 : Déploiement préprod Coolify (sous-domaine FC)** — configurer sur Coolify les vars FC (`NEXT_PUBLIC_CAROTTAGE_URL`, `NEXT_PUBLIC_SERVICIMMO_URL`, `NEXT_PUBLIC_CAROTTAGE_HOSTS` avec le vrai sous-domaine préprod, `BREVO_API_KEY` de test, `CAROTTAGE_EMAIL_FROM`, `CAROTTAGE_EMAIL_INTERNAL`) et pointer le sous-domaine FC préprod sur le même déploiement. Redeploy. Vérifier en préprod : home FC via le host FC, 3 pages villes, 3 redirections `.html`, sitemap FC, envoi devis réel. Prévenir Etienne pour la validation client finale.

**Critère de passage FC7 :** batterie complète verte ; Lighthouse ≥ 90 mobile ; parcours réel sans erreur ; validation client sur préprod (avant bascule DNS france-carottage.fr).

---

## Récap des paliers FC

| Palier | Moment | Bloquant ? |
|---|---|---|
| FC1. Inventaire FC | après Task FC1.6 | **Oui — validation Etienne** (destinations `inconnues`, ESPACE CLIENT, slugs expertises) |
| FC2. Screenshots home | fin Task FC2.5 | **Oui — validation visuelle Etienne** |
| FC. Échantillons contenus | fin Tasks FC3.2 / FC4.4 | Non — auto-relecture + screenshots partagés |
| FC5. Envoi Brevo réel | fin Task FC5.3 (préprod) | Oui — clé de test vérifiée avant prod ; email interne à confirmer |
| FC7. Validation client site complet | après Task FC7.1 (déployé) | **Oui — avant bascule DNS** |

## Points à confirmer avec Etienne avant prod (récap)

- Rouge exact `--fc-rouge` re-pipeté sur le logo réel (spec §8).
- Asset hero chantier réel (`public/img/carottage/hero-chantier.jpg`) + silhouette France.
- `CAROTTAGE_EMAIL_INTERNAL` (boîte de réception des devis) — placeholder tant que non confirmé (spec §7, §12).
- SIRET + hébergeur des mentions légales.
- Sous-domaine FC préprod + hosts prod définitifs (`NEXT_PUBLIC_CAROTTAGE_HOSTS`).
- Réconciliation des 30 slugs `TOP_VILLES` avec l'inventaire réel.
