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
