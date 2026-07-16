type GoogleMapEmbedProps = {
  className?: string;
  title?: string;
  query?: string;
  center?: { lat: number; lng: number };
  zoom?: number;
};

const DEFAULT_CENTER = { lat: 47.31, lng: 0.68 };

function buildMapUrl({
  query,
  center = DEFAULT_CENTER,
  zoom = 9,
}: Pick<GoogleMapEmbedProps, "query" | "center" | "zoom">) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_EMBED_KEY?.trim();

  if (apiKey) {
    const parameters = new URLSearchParams({ key: apiKey, language: "fr", region: "FR" });

    if (query) {
      parameters.set("q", query);
      parameters.set("zoom", String(zoom));
      return `https://www.google.com/maps/embed/v1/place?${parameters.toString()}`;
    }

    parameters.set("center", `${center.lat},${center.lng}`);
    parameters.set("zoom", String(zoom));
    parameters.set("maptype", "roadmap");
    return `https://www.google.com/maps/embed/v1/view?${parameters.toString()}`;
  }

  const parameters = new URLSearchParams({
    output: "embed",
    hl: "fr",
    q: query ?? `${center.lat},${center.lng}`,
    z: String(zoom),
  });

  return `https://www.google.com/maps?${parameters.toString()}`;
}

/**
 * Carte Google Maps, chargée avec la page.
 *
 * ⚠️ Décision produit du 2026-07-16 : la carte se charge SANS consentement
 * préalable. L'iframe transmet donc l'adresse IP du visiteur à Google, qui peut
 * déposer ses cookies, avant tout accord — ce que l'article 82 de la loi
 * Informatique et Libertés n'autorise pas.
 *
 * Le mécanisme de consentement (clic-pour-charger) a été implémenté puis retiré
 * à la demande du client, qui a jugé l'encart préjudiciable à l'image du site et
 * assume le risque. Historique : la spec
 * `docs/superpowers/specs/2026-07-16-consentement-google-maps-design.md` et le
 * commit retiré décrivent la solution conforme, réactivable telle quelle.
 *
 * L'alternative sans dette — une carte statique servie depuis notre domaine,
 * sans clic ni tiers — a été proposée et écartée.
 */
export function GoogleMapEmbed({
  className = "",
  title = "Carte Google Maps de la zone d’intervention Servicimmo",
  query = "Indre-et-Loire, France",
  center = DEFAULT_CENTER,
  zoom = 9,
}: GoogleMapEmbedProps) {
  return (
    <iframe
      data-testid="google-coverage-map"
      title={title}
      src={buildMapUrl({ query, center, zoom })}
      className={`h-full w-full border-0 ${className}`}
      loading="lazy"
      allowFullScreen
      referrerPolicy="strict-origin-when-cross-origin"
    />
  );
}
