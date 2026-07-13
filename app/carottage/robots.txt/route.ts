import { carottageUrl } from "@/lib/clients/francecarottage/urls";

/**
 * robots.txt France Carottage — servi sur le domaine FC via le rewrite middleware
 * (`/robots.txt` → `/carottage/robots.txt`).
 *
 * Pourquoi un Route Handler et pas un `robots.ts` de métadonnées : le fichier
 * spécial `robots.(js|ts)` de Next n'est reconnu qu'à la RACINE de `app/` (il
 * produit `/robots.txt`). Un `app/carottage/robots.ts` imbriqué n'émet aucune
 * route — d'où ce handler qui génère explicitement `/carottage/robots.txt`.
 */
export const dynamic = "force-static";

export function GET(): Response {
  const corps = [
    "User-Agent: *",
    "Allow: /",
    "Disallow: /mentions-legales",
    "",
    `Sitemap: ${carottageUrl("/sitemap.xml")}`,
    "",
  ].join("\n");

  return new Response(corps, {
    headers: { "content-type": "text/plain; charset=utf-8" },
  });
}
