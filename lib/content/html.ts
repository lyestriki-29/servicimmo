/** Helpers de conversion HTML -> texte brut, pour les sommaires et le temps de lecture. */

/**
 * Décode les entités HTML courantes.
 *
 * Pourquoi : le rendu Markdown échappe les apostrophes en `&#39;`. Un texte
 * extrait de ce HTML et réinjecté dans du JSX est ré-échappé par React, qui
 * affiche alors « d&#39;ordre » au lieu de « d'ordre » — exactement le bug vu
 * dans le sommaire « Dans cet article ».
 *
 * `&amp;` est traité EN DERNIER, sans quoi « &amp;#39; » (une esperluette
 * littérale suivie de texte) se décoderait deux fois en apostrophe.
 */
export function decodeEntitesHtml(value: string): string {
  return value
    .replace(/&#(\d+);/g, (_, code: string) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code: string) => String.fromCodePoint(parseInt(code, 16)))
    .replace(/&nbsp;/g, " ")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}

/** HTML -> texte lisible : balises retirées, entités décodées, espaces normalisés. */
export function stripHtml(value: string): string {
  return decodeEntitesHtml(value.replace(/<[^>]*>/g, " "))
    .replace(/\s+/g, " ")
    .trim();
}
