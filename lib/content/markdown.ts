import { marked } from "marked";

/** Rendu Markdown → HTML (contenu first-party uniquement, jamais de saisie utilisateur). */
export function renderMarkdown(md: string): string {
  const html = marked.parse(md, { async: false });
  if (typeof html !== "string") throw new Error("rendu markdown asynchrone inattendu");
  return html;
}
