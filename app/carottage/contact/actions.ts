"use server";

import { getCarottageEmailInternal, sendTransactionalEmail } from "@/lib/brevo/client";

import { emailContactAccuseReception, emailContactInterne } from "./emails";
import { ContactSchema, DELAI_MIN_MS, type ContactState } from "./schema";

export async function soumettreContact(
  _prev: ContactState,
  formData: FormData,
): Promise<ContactState> {
  // Anti-spam 1 : honeypot (champ caché "site" ; un humain le laisse vide).
  if ((formData.get("site") as string)?.trim()) {
    return { status: "success" }; // faux succès : on ne prévient pas le bot.
  }
  // Anti-spam 2 : délai minimal de soumission.
  const rendu = Number(formData.get("renderedAt") ?? 0);
  if (!rendu || Date.now() - rendu < DELAI_MIN_MS) {
    return { status: "success" };
  }

  const parsed = ContactSchema.safeParse({
    nom: (formData.get("nom") as string)?.trim(),
    email: (formData.get("email") as string)?.trim(),
    sujet: (formData.get("sujet") as string)?.trim(),
    message: (formData.get("message") as string)?.trim(),
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
  const interne = emailContactInterne(d);
  const notif = await sendTransactionalEmail({
    to: getCarottageEmailInternal(),
    subject: interne.subject,
    htmlContent: interne.html,
    replyTo: d.email,
  });
  if (!notif.ok) {
    return { status: "error", error: "L'envoi a échoué, réessayez ou appelez-nous." };
  }
  // Accusé de réception (non bloquant : le message interne est déjà parti).
  const ar = emailContactAccuseReception(d);
  await sendTransactionalEmail({ to: d.email, subject: ar.subject, htmlContent: ar.html });

  return { status: "success" };
}
