/** Validation du message de contact France Carottage (partagée action + tests). */
import { z } from "zod";

/** Délai minimal (ms) entre l'affichage du formulaire et sa soumission (anti-bot). */
export const DELAI_MIN_MS = 3000;

// Messages en français : Zod parle anglais par défaut et ses libellés sont
// affichés tels quels sous les champs.
export const ContactSchema = z.object({
  nom: z.string().min(2, "Indiquez votre nom.").max(80, "80 caractères maximum."),
  email: z.string().email("Adresse email invalide.").max(160, "160 caractères maximum."),
  sujet: z.string().min(2, "Indiquez un sujet.").max(140, "140 caractères maximum."),
  message: z
    .string()
    .min(10, "Décrivez votre demande en quelques mots (10 caractères minimum).")
    .max(4000, "4000 caractères maximum."),
});

export type ContactInput = z.infer<typeof ContactSchema>;

export type ContactState =
  | { status: "idle" }
  | { status: "success" }
  | {
      status: "error";
      error: string;
      fieldErrors?: Record<string, string>;
      /** Valeurs ressaisies : React 19 vide le formulaire après chaque action. */
      valeurs?: Record<string, string>;
    };
