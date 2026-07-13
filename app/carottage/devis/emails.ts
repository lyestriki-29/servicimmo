import { LIBELLES_CHANTIER, LIBELLES_DELAI, type DevisInput } from "./schema";

const cadre = (inner: string) =>
  `<div style="font-family:system-ui,-apple-system,sans-serif;max-width:600px;margin:0 auto;padding:24px;color:#111113;">${inner}<hr style="border:none;border-top:1px solid #e4e3e0;margin:24px 0;" /><p style="color:#6b6e73;font-size:12px;">France Carottage — carottage routier & repérage amiante/HAP sur enrobés · réseau national</p></div>`;

/** Email de notification interne (nouvelle demande de devis). */
export function emailNotificationInterne(d: DevisInput): { subject: string; html: string } {
  const lignes = [
    ["Type de chantier", LIBELLES_CHANTIER[d.typeChantier]],
    ["Localisation", d.localisation],
    [
      d.uniteMesure === "surface" ? "Surface estimée" : "Linéaire estimé",
      `${d.quantiteEstimee} ${d.uniteMesure === "surface" ? "m²" : "ml"}`,
    ],
    ["Délai", LIBELLES_DELAI[d.delai]],
    ["Entreprise", d.entreprise],
    ["Contact", `${d.nom} — ${d.emailPro} — ${d.telephone}`],
    ["Message", d.message ?? "—"],
  ]
    .map(
      ([k, v]) =>
        `<tr><td style="padding:6px 12px 6px 0;color:#6b6e73;vertical-align:top;">${k}</td><td style="padding:6px 0;font-weight:600;">${v}</td></tr>`,
    )
    .join("");
  return {
    subject: `Nouvelle demande de devis — ${d.entreprise} (${LIBELLES_CHANTIER[d.typeChantier]})`,
    html: cadre(
      `<h2 style="margin:0 0 16px;font-size:18px;">Nouvelle demande de devis</h2><table style="font-size:14px;border-collapse:collapse;">${lignes}</table>`,
    ),
  };
}

/** Accusé de réception envoyé au demandeur. */
export function emailAccuseReception(d: DevisInput): { subject: string; html: string } {
  return {
    subject: "Votre demande de devis — France Carottage",
    html: cadre(
      `<h2 style="margin:0 0 12px;font-size:18px;">Demande bien reçue</h2><p>Bonjour ${d.nom},</p><p>Nous avons bien reçu votre demande concernant un chantier <strong>${LIBELLES_CHANTIER[d.typeChantier]}</strong> à ${d.localisation}. Notre équipe revient vers vous avec un devis chiffré sous 24 h ouvrées.</p><p style="margin-top:16px;">À très vite,<br/>L'équipe France Carottage</p>`,
    ),
  };
}
