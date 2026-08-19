"use server";

import { getCarottageEmailInternal, sendTransactionalEmail } from "@/lib/brevo/client";

import { emailContactAccuseReception, emailContactInterne } from "./emails";
import { ContactSchema, DELAI_MIN_MS, type ContactState } from "./schema";

/** `FormData.get` rend `File | string | null` : un champ non textuel ne doit pas jeter. */
function texte(formData: FormData, champ: string): string {
  const valeur = formData.get(champ);
  return typeof valeur === "string" ? valeur.trim() : "";
}

/**
 * Le délai n'est un signal de bot que s'il est mesurable ET plausible. Un
 * horodatage absent (JS désactivé, soumission avant hydratation) ou négatif
 * (horloge du visiteur en avance sur le serveur) ne prouve rien : refuser dans
 * ces cas ferait perdre des messages légitimes sans que personne ne le sache.
 */
function soumissionTropRapide(formData: FormData): boolean {
  const rendu = Number(formData.get("renderedAt") ?? 0);
  if (!Number.isFinite(rendu) || rendu <= 0) return false;
  const ecoule = Date.now() - rendu;
  return ecoule >= 0 && ecoule < DELAI_MIN_MS;
}

export async function soumettreContact(
  _prev: ContactState,
  formData: FormData,
): Promise<ContactState> {
  // Honeypot : champ caché "site" qu'un humain laisse vide. Faux succès pour ne
  // pas renseigner le bot sur ce qui l'a bloqué.
  if (texte(formData, "site")) return { status: "success" };
  if (soumissionTropRapide(formData)) return { status: "success" };

  const valeurs = {
    nom: texte(formData, "nom"),
    email: texte(formData, "email"),
    sujet: texte(formData, "sujet"),
    message: texte(formData, "message"),
  };

  const parsed = ContactSchema.safeParse(valeurs);

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const champ = issue.path[0];
      if (typeof champ === "string" && !fieldErrors[champ]) fieldErrors[champ] = issue.message;
    }
    return { status: "error", error: "Vérifiez les champs signalés.", fieldErrors, valeurs };
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
    // Sans trace, une panne Brevo fait disparaître les demandes en silence.
    console.error("[contact FC] notification interne non envoyée :", notif.error);
    return {
      status: "error",
      error: "L'envoi a échoué, réessayez ou appelez-nous.",
      valeurs,
    };
  }
  // Accusé de réception (non bloquant : le message interne est déjà parti).
  const ar = emailContactAccuseReception(d);
  const accuse = await sendTransactionalEmail({
    to: d.email,
    subject: ar.subject,
    htmlContent: ar.html,
  });
  if (!accuse.ok) console.error("[contact FC] accusé de réception non envoyé :", accuse.error);

  return { status: "success" };
}
