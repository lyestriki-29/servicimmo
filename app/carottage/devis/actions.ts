"use server";

import { getCarottageEmailInternal, sendTransactionalEmail } from "@/lib/brevo/client";

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
