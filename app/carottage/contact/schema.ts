/** Validation du message de contact France Carottage (partagée action + tests). */
import { z } from "zod";

/** Délai minimal (ms) entre l'affichage du formulaire et sa soumission (anti-bot). */
export const DELAI_MIN_MS = 3000;

export const ContactSchema = z.object({
  nom: z.string().min(2).max(80),
  email: z.string().email().max(160),
  sujet: z.string().min(2).max(140),
  message: z.string().min(10).max(4000),
});

export type ContactInput = z.infer<typeof ContactSchema>;

export type ContactState =
  | { status: "idle" }
  | { status: "success" }
  | { status: "error"; error: string; fieldErrors?: Record<string, string> };
