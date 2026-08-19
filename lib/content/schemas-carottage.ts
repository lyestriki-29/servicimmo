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

/**
 * `code: "00"` marque une entrée sans vrai code INSEE (région ou secteur local
 * sans code postal exploitable au scraping). `type` distingue les deux : sans
 * lui, cette distinction ne vivait que dans une liste de slugs recopiée à la
 * main dans chaque composant qui en avait besoin.
 */
export const DepartementFrontmatterSchema = z
  .object({
    slug,
    nom: z.string().min(1),
    code: codeDepartement,
    type: z.enum(["departement", "region", "secteur"]).default("departement"),
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
