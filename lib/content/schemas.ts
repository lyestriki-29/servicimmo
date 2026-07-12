/** Frontmatter des collections `content/` — un frontmatter invalide CASSE le build. */
import { z } from "zod";

const slug = z.string().regex(/^[a-z0-9-]+$/, "slug kebab-case attendu");
const meta = {
  metaTitle: z.string().min(1),
  metaDescription: z.string().min(1),
  anciennesUrls: z.array(z.string().startsWith("/")).default([]),
  /** true tant que le contenu scrapé n'a pas été modernisé (doit être false en prod). */
  brut: z.boolean().default(false),
};

/** Les contraintes SEO ne s'appliquent qu'au contenu modernisé — le contenu
 *  scrapé (`brut: true`) passe, et la QA finale vérifie qu'il n'en reste aucun. */
function contraintesContenuModernise(
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

export const ServiceFrontmatterSchema = z
  .object({
    slug,
    titre: z.string().min(1),
    ...meta,
    ordre: z.number().int().positive(),
    /** Nom d'icône du mapping components/marketing/pages/icones.ts */
    icone: z.string().min(1),
    extrait: z.string().min(10).max(160),
    obligatoirePour: z
      .array(z.enum(["vente", "location", "travaux", "demolition"]))
      .default([]),
    dureeValidite: z.string().optional(),
  })
  .superRefine(contraintesContenuModernise);

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

export const ArticleFrontmatterSchema = z
  .object({
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
  })
  .superRefine(contraintesContenuModernise);

export type ServiceFrontmatter = z.infer<typeof ServiceFrontmatterSchema>;
export type VilleFrontmatter = z.infer<typeof VilleFrontmatterSchema>;
export type ArticleFrontmatter = z.infer<typeof ArticleFrontmatterSchema>;

export type Service = ServiceFrontmatter & { html: string };
export type Ville = VilleFrontmatter & { html: string };
export type Article = ArticleFrontmatter & { html: string };
