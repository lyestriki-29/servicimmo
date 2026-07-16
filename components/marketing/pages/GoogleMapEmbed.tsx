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
