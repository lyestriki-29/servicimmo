"use client";

import { MapPinIcon, ArrowUpRightIcon } from "lucide-react";

import { useMapConsent } from "@/components/rgpd/MapConsentProvider";

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

/** Lien « sortant » vers Google Maps : n'engage rien tant qu'on ne clique pas. */
function buildExternalUrl({ query, center = DEFAULT_CENTER }: Pick<GoogleMapEmbedProps, "query" | "center">) {
  const q = query ?? `${center.lat},${center.lng}`;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;
}

/**
 * Substitut affiché tant que le visiteur n'a pas accepté les cartes Google.
 * Même encombrement que l'iframe (zéro décalage de mise en page au clic).
 */
function MapPlaceholder({
  className,
  label,
  externalUrl,
  onDisplay,
}: {
  className: string;
  label: string;
  externalUrl: string;
  onDisplay: () => void;
}) {
  return (
    <div
      data-testid="google-map-placeholder"
      className={`flex h-full w-full flex-col items-center justify-center gap-4 bg-[color:var(--color-home-bg-2)] px-6 py-8 text-center ${className}`}
    >
      <MapPinIcon
        className="h-7 w-7 shrink-0 text-[color:var(--color-si-petrole)]"
        aria-hidden
      />
      <div className="max-w-[42ch]">
        <p className="font-[family-name:var(--font-sora)] text-[13.5px] font-bold text-[color:var(--color-home-ink)]">
          {label}
        </p>
        <p className="mt-2 text-[12px] leading-relaxed text-[color:var(--color-home-muted-2)]">
          L’afficher enverra votre adresse IP à Google, qui pourra déposer des cookies sur votre
          appareil.
        </p>
      </div>
      <button
        type="button"
        onClick={onDisplay}
        className="inline-flex min-h-11 items-center rounded-[8px] bg-[color:var(--color-si-petrole)] px-5 font-[family-name:var(--font-sora)] text-[12.5px] font-bold text-white transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--color-home-ink)]"
      >
        Afficher la carte
      </button>
      <a
        href={externalUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 text-[11.5px] font-semibold text-[color:var(--color-home-saf-dark)] underline underline-offset-4"
      >
        Ouvrir dans Google Maps <ArrowUpRightIcon className="h-3.5 w-3.5" aria-hidden />
      </a>
    </div>
  );
}

export function GoogleMapEmbed({
  className = "",
  title = "Carte Google Maps de la zone d’intervention Servicimmo",
  query = "Indre-et-Loire, France",
  center = DEFAULT_CENTER,
  zoom = 9,
}: GoogleMapEmbedProps) {
  const { granted, grant } = useMapConsent();

  // `granted === null` (rendu serveur, avant hydratation) compte comme un refus :
  // aucune requête vers Google ne doit partir sans accord explicite.
  if (!granted) {
    return (
      <MapPlaceholder
        className={className}
        label={title}
        externalUrl={buildExternalUrl({ query, center })}
        onDisplay={grant}
      />
    );
  }

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
