/** Frontmatter des collections `content/` — un frontmatter invalide CASSE le build. */
import { z } from "zod";

export const slug = z.string().regex(/^[a-z0-9-]+$/, "slug kebab-case attendu");
export const meta = {
  metaTitle: z.string().min(1),
  metaDescription: z.string().min(1),
  anciennesUrls: z.array(z.string().startsWith("/")).default([]),
  /** true tant que le contenu scrapé n'a pas été modernisé (doit être false en prod). */
  brut: z.boolean().default(false),
};

/** Les contraintes SEO ne s'appliquent qu'au contenu modernisé — le contenu
 *  scrapé (`brut: true`) passe, et la QA finale vérifie qu'il n'en reste aucun. */
export function contraintesContenuModernise(
  data: { brut: boolean; metaTitle: string; metaDescription: string },
  ctx: z.RefinementCtx,
): void {
  if (data.brut) return;
  if (data.metaTitle.length < 10 || data.metaTitle.length > 70) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["metaTitle"],
      message: "metaTitle 10-70 caractères requis pour un contenu modernisé",
    });
  }
  if (data.metaDescription.length < 80 || data.metaDescription.length > 180) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["metaDescription"],
      message:
        "metaDescription 80-180 caractères requis pour un contenu modernisé",
    });
  }
}

/**
 * Une étape du déroulé d'intervention affiché sur la fiche service.
 * ⚠️ CONTENU MÉTIER NON VALIDÉ : les jalons et durées actuels sont des
 * propositions, pas des engagements de Servicimmo. À faire confirmer avant
 * prod (cf. .planning/BLOCKERS.md) — ce sont des promesses faites au client.
 */
export const EtapeDerouleSchema = z.object({
  /** Jalon relatif : "J0", "J1"… Jamais une date absolue. */
  temps: z.string().min(1).max(6),
  titre: z.string().min(1).max(40),
  detail: z.string().min(1).max(90),
});

export const ServiceFrontmatterSchema = z
  .object({
    slug,
    titre: z.string().min(1),
    /**
     * Fragment du titre mis en couleur d'accent. Doit apparaître TEL QUEL dans
     * `titre` : la vue découpe la chaîne dessus. Un fragment absent laisserait
     * le titre sans accent en silence, d'où le refine ci-dessous.
     */
    titreAccent: z.string().min(1).optional(),
    ...meta,
    ordre: z.number().int().positive(),
    /** Nom d'icône du mapping components/marketing/pages/icones.ts */
    icone: z.string().min(1),
    extrait: z.string().min(10).max(160),
    obligatoirePour: z
      .array(z.enum(["vente", "location", "travaux", "demolition"]))
      .default([]),
    dureeValidite: z.string().optional(),
    /** 3 ou 4 étapes : la grille de la fiche service s'appuie dessus. */
    deroule: z.array(EtapeDerouleSchema).min(3).max(4).optional(),
  })
  .superRefine(contraintesContenuModernise)
  .superRefine((data, ctx) => {
    if (data.titreAccent && !data.titre.includes(data.titreAccent)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["titreAccent"],
        message: `titreAccent "${data.titreAccent}" est absent du titre "${data.titre}"`,
      });
    }
  });

export const VilleFrontmatterSchema = z
  .object({
    slug,
    ville: z.string().min(1),
    codePostal: z.string().regex(/^\d{5}$/),
    ...meta,
    lat: z.number().gte(46).lte(49),
    lng: z.number().gte(-1).lte(2),
  })
  .superRefine(contraintesContenuModernise);

/**
 * Taxonomie des actualités, sur l'axe DIAGNOSTIC (celui des services), et non
 * sur la situation (vente/location) : les deux axes se chevauchaient sur la
 * moitié du corpus. Un article « DPE en location » parle du DPE.
 * Liste FERMÉE : elle alimente le filtre de /actualites, donc une valeur libre
 * y créerait une rubrique fantôme. Ordre = ordre d'affichage du filtre.
 */
export const CATEGORIES_ARTICLE = [
  "DPE & énergie",
  "Amiante",
  "Location & vente",
  "Risques naturels",
  "Électricité & gaz",
  "Profession & marché",
  "Plomb",
  "Termites",
] as const;

export type CategorieArticle = (typeof CATEGORIES_ARTICLE)[number];

/**
 * Correspondance libellé ↔ segment d'URL du filtre (`/actualites?sujet=…`).
 * Écrite à la main plutôt que dérivée par une fonction de slug : les libellés
 * portent accents, esperluettes et espaces, et une URL doit rester stable même
 * si l'on reformule un libellé un jour. Table figée = liens qui ne cassent pas.
 */
export const SLUG_PAR_CATEGORIE: Record<CategorieArticle, string> = {
  "DPE & énergie": "dpe-energie",
  Amiante: "amiante",
  "Location & vente": "location-vente",
  "Risques naturels": "risques-naturels",
  "Électricité & gaz": "electricite-gaz",
  "Profession & marché": "profession-marche",
  Plomb: "plomb",
  Termites: "termites",
};

/** Segment d'URL → catégorie. `null` si le paramètre est absent ou inventé. */
export function categorieDepuisSlug(slug: string | undefined): CategorieArticle | null {
  if (!slug) return null;
  const trouvee = CATEGORIES_ARTICLE.find((c) => SLUG_PAR_CATEGORIE[c] === slug);
  return trouvee ?? null;
}

export const ArticleFrontmatterSchema = z
  .object({
    slug,
    titre: z.string().min(1),
    /** Date de publication ORIGINALE, jamais modifiée à la reformulation. */
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    ...meta,
    extrait: z.string().min(10).max(200),
    categorie: z.enum(CATEGORIES_ARTICLE),
    archive: z.boolean().default(false),
    /** Une phrase affichée dans l'encadré archive, si archive: true. */
    archiveNote: z.string().optional(),
  })
  .superRefine(contraintesContenuModernise);

export type ServiceFrontmatter = z.infer<typeof ServiceFrontmatterSchema>;
export type VilleFrontmatter = z.infer<typeof VilleFrontmatterSchema>;
export type ArticleFrontmatter = z.infer<typeof ArticleFrontmatterSchema>;

export type Service = ServiceFrontmatter & { html: string };
export type Ville = VilleFrontmatter & { html: string };
export type Article = ArticleFrontmatter & { html: string };
