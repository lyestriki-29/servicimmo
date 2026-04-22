import { z } from "zod";

export const rendezVousStatusSchema = z.enum([
  "planifie",
  "confirme",
  "en_cours",
  "realise",
  "annule",
  "reporte",
]);

export const rendezVousInputSchema = z
  .object({
    title: z.string().min(2, "Titre requis").max(200),
    description: z.string().max(2000).optional(),
    starts_at: z.string().min(10, "Date/heure début requise"),
    ends_at: z.string().min(10, "Date/heure fin requise"),
    location: z.string().max(200).optional(),
    address: z.string().max(300).optional(),
    city: z.string().max(120).optional(),
    postal_code: z
      .string()
      .refine((v) => !v || /^\d{5}$/.test(v), "CP : 5 chiffres")
      .optional(),
    status: rendezVousStatusSchema.optional(),
    dossier_id: z.string().uuid().nullable().optional(),
    technicien_id: z.string().uuid().nullable().optional(),
    notes: z.string().max(2000).optional(),
  })
  .superRefine((d, ctx) => {
    if (new Date(d.ends_at) <= new Date(d.starts_at)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["ends_at"],
        message: "La fin doit être postérieure au début.",
      });
    }
  });

export type RendezVousInput = z.infer<typeof rendezVousInputSchema>;
