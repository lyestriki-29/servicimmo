import { echapperHtml } from "@/app/carottage/devis/emails";

import type { ContactInput } from "./schema";

const cadre = (inner: string) =>
  `<div style="font-family:system-ui,-apple-system,sans-serif;max-width:600px;margin:0 auto;padding:24px;color:#111113;">${inner}<hr style="border:none;border-top:1px solid #e4e3e0;margin:24px 0;" /><p style="color:#6b6e73;font-size:12px;">France Carottage — carottage routier & repérage amiante/HAP sur enrobés · réseau national</p></div>`;

/** Email de notification interne (nouveau message de contact). */
export function emailContactInterne(d: ContactInput): { subject: string; html: string } {
  const lignes = [
    ["Nom", echapperHtml(d.nom)],
    ["Email", echapperHtml(d.email)],
    ["Sujet", echapperHtml(d.sujet)],
    ["Message", echapperHtml(d.message).replaceAll("\n", "<br/>")],
  ]
    .map(
      ([k, v]) =>
        `<tr><td style="padding:6px 12px 6px 0;color:#6b6e73;vertical-align:top;">${k}</td><td style="padding:6px 0;font-weight:600;">${v}</td></tr>`,
    )
    .join("");
  return {
    // Sauts de ligne retirés : un objet multiligne est tronqué ou rejeté par le relais.
    subject: `Nouveau message — ${d.sujet.replace(/[\r\n]+/g, " ")}`,
    html: cadre(
      `<h2 style="margin:0 0 16px;font-size:18px;">Nouveau message de contact</h2><table style="font-size:14px;border-collapse:collapse;">${lignes}</table>`,
    ),
  };
}

/** Accusé de réception envoyé à l'expéditeur. */
export function emailContactAccuseReception(d: ContactInput): { subject: string; html: string } {
  return {
    subject: "Votre message — France Carottage",
    html: cadre(
      `<h2 style="margin:0 0 12px;font-size:18px;">Message bien reçu</h2><p>Bonjour ${echapperHtml(d.nom)},</p><p>Nous avons bien reçu votre message concernant « ${echapperHtml(d.sujet)} ». Notre équipe vous répond sous 24 h ouvrées.</p><p style="margin-top:16px;">À très vite,<br/>L'équipe France Carottage</p>`,
    ),
  };
}
