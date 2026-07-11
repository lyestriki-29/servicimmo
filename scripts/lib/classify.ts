/** Classement heuristique des anciennes URLs servicimmo.fr (validé au palier inventaire). */

export type UrlType = "ville" | "article" | "service" | "structurelle" | "inconnue";

export type UrlClassee = {
  chemin: string;
  type: UrlType;
  /** Slug proposé pour la nouvelle route — retouché à la main dans le mapping si besoin. */
  slugPropose: string;
};

const CHEMINS_STRUCTURELS = new Set([
  "/",
  "/index.html",
  "/contact.html",
  "/mentions-legales.html",
  "/cgv.html",
  "/demande-devis.php",
]);

export function classifyUrl(url: string): UrlClassee {
  const chemin = new URL(url).pathname.toLowerCase();

  if (CHEMINS_STRUCTURELS.has(chemin)) {
    return { chemin, type: "structurelle", slugPropose: "" };
  }

  const ville = chemin.match(/^\/diagnostic-immobilier-([a-z0-9-]+)-\d{5}\.html$/);
  if (ville?.[1]) {
    return { chemin, type: "ville", slugPropose: ville[1] };
  }

  const article = chemin.match(/^\/([a-z0-9-]+)-i\d+\.html$/);
  if (article?.[1]) {
    return { chemin, type: "article", slugPropose: article[1] };
  }

  const service = chemin.match(/^\/([a-z0-9-]+)\.html$/);
  if (service?.[1]) {
    // retire un éventuel suffixe « -<ville>-<cp> » (ex: amiante-avant-travaux-tours-37000)
    // Limite connue : seul un nom de ville MONO-segment est retiré ; une ville multi-segment
    // (ex: -joue-les-tours-37300) laisse un slugPropose partiel (…-joue-les), corrigé à la main
    // dans scripts/out/mapping-services.json au palier humain.
    const slugPropose = service[1].replace(/-[a-z]+-\d{5}$/, "");
    return { chemin, type: "service", slugPropose };
  }

  return { chemin, type: "inconnue", slugPropose: "" };
}
