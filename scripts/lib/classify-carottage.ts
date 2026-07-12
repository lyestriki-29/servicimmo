/**
 * Classement heuristique des anciennes URLs france-carottage.fr.
 *   ville       : /amiante-hap-enrobes-routiers-<ville>-<cp>.html
 *   departement : /amiante-hap-enrobes-routiers-<dept>.html   (même préfixe, SANS code postal)
 *   expertise   : /<slug>-i<N>.html                            (pages éditoriales)
 *   structurelle: /, /index.html, /mentions-legales.html
 * L'ordre des tests importe : la ville (avec CP) DOIT être testée avant le département.
 */

export type UrlTypeFC = "ville" | "departement" | "expertise" | "structurelle" | "inconnue";

export type UrlCarotteeClassee = {
  chemin: string;
  type: UrlTypeFC;
  slugPropose: string;
  /** Présent uniquement pour les villes (sert au géocodage + au parent département). */
  codePostal?: string;
};

const PREFIXE = "amiante-hap-enrobes-routiers";

const CHEMINS_STRUCTURELS = new Set(["/", "/index.html", "/mentions-legales.html"]);

export function classifyUrlCarottage(url: string): UrlCarotteeClassee {
  const chemin = new URL(url).pathname.toLowerCase();

  if (CHEMINS_STRUCTURELS.has(chemin)) {
    return { chemin, type: "structurelle", slugPropose: "" };
  }

  // Ville : préfixe + slug + code postal (5 chiffres). Testé AVANT le département.
  const ville = chemin.match(new RegExp(`^/${PREFIXE}-([a-z0-9-]+)-(\\d{5})\\.html$`));
  if (ville?.[1] && ville[2]) {
    return { chemin, type: "ville", slugPropose: ville[1], codePostal: ville[2] };
  }

  // Département : même préfixe, sans code postal.
  const departement = chemin.match(new RegExp(`^/${PREFIXE}-([a-z][a-z0-9-]+)\\.html$`));
  if (departement?.[1]) {
    return { chemin, type: "departement", slugPropose: departement[1] };
  }

  // Expertise : suffixe -i<N>.html.
  const expertise = chemin.match(/^\/([a-z0-9-]+)-i\d+\.html$/);
  if (expertise?.[1]) {
    return { chemin, type: "expertise", slugPropose: expertise[1] };
  }

  return { chemin, type: "inconnue", slugPropose: "" };
}
