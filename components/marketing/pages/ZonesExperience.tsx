import Link from "next/link";
import {
  ArrowUpRightIcon,
  Clock3Icon,
  LocateFixedIcon,
  MapPinIcon,
  NavigationIcon,
} from "lucide-react";

import { GoogleMapEmbed } from "./GoogleMapEmbed";
import { ZoneSearch } from "./ZoneSearch";

export type ZoneCity = {
  slug: string;
  ville: string;
  codePostal: string;
  lat: number;
  lng: number;
};

const SECTORS = [
  {
    id: "metropole",
    title: "Tours Métropole",
    detail: "Le cœur de notre activité, autour de l’agence.",
    mapQuery: "Tours Métropole Val de Loire, France",
  },
  {
    id: "val-de-loire",
    title: "Val de Loire",
    detail: "D’Amboise à Langeais, au fil des biens et des projets.",
    mapQuery: "Val de Loire, Indre-et-Loire, France",
  },
  {
    id: "sud-touraine",
    title: "Sud Touraine",
    detail: "Loches, Chinon, Sainte-Maure et les communes alentour.",
    mapQuery: "Sud Touraine, Indre-et-Loire, France",
  },
] as const;

export type SectorId = (typeof SECTORS)[number]["id"];

/**
 * Rattachement explicite de chaque commune à son secteur.
 * Volontairement sans secteur par défaut : une commune absente d'ici s'affiche à part
 * plutôt que d'être annoncée — à tort — dans le dernier secteur de la liste.
 * Complétude vérifiée par `__tests__/zones-secteurs.test.ts`.
 */
export const SECTEUR_PAR_SLUG: Record<string, SectorId> = {
  // Tours Métropole Val de Loire
  "chambray-les-tours": "metropole",
  fondettes: "metropole",
  "joue-les-tours": "metropole",
  "la-membrolle-sur-choisille": "metropole",
  luynes: "metropole",
  montbazon: "metropole",
  "saint-cyr-sur-loire": "metropole",
  "saint-pierre-des-corps": "metropole",
  // Val de Loire, d'Amboise à Langeais
  amboise: "val-de-loire",
  blere: "val-de-loire",
  "chateau-renault": "val-de-loire",
  langeais: "val-de-loire",
  "montlouis-sur-loire": "val-de-loire",
  // Sud Touraine
  "azay-le-rideau": "sud-touraine",
  chinon: "sud-touraine",
  ligueil: "sud-touraine",
  loches: "sud-touraine",
  "sainte-maure-de-touraine": "sud-touraine",
};

function LienVille({ ville }: { ville: ZoneCity }) {
  return (
    <Link
      href={`/zones/${ville.slug}`}
      className="inline-flex items-center gap-1.5 py-1 text-[13.5px] font-semibold text-[color:var(--color-home-ink)] transition-colors hover:text-[color:var(--color-si-petrole)]"
    >
      <MapPinIcon className="h-3.5 w-3.5 text-[color:var(--color-home-saf-dark)]" aria-hidden />
      {ville.ville}
    </Link>
  );
}

export function ZonesExperience({ villes }: { villes: ZoneCity[] }) {
  const villesSansSecteur = villes.filter((ville) => !SECTEUR_PAR_SLUG[ville.slug]);

  return (
    <>
      <section className="overflow-hidden bg-[color:var(--color-si-petrole)] text-white">
        <div className="grid lg:grid-cols-[.78fr_1.22fr]">
          <div className="flex flex-col justify-between px-6 py-12 sm:px-8 lg:min-h-[570px] lg:px-12 lg:py-14 xl:px-16">
            <div>
              <p className="inline-flex items-center gap-2 font-[family-name:var(--font-sora)] text-[12px] font-bold text-[color:var(--color-home-saf)]">
                <LocateFixedIcon className="h-4 w-4" aria-hidden /> Servicimmo · Tours
              </p>
              <h1 className="mt-6 max-w-[680px] font-[family-name:var(--font-sora)] text-[clamp(44px,6vw,82px)] leading-[.94] font-extrabold tracking-[-0.04em] text-balance">
                Notre terrain, c’est{" "}
                <span className="text-[color:var(--color-home-saf)]">ici.</span>
              </h1>
              <p className="mt-7 max-w-[56ch] text-[16px] leading-[1.75] text-white/78">
                Depuis notre agence de Tours, nos techniciens parcourent toute l’Indre-et-Loire pour
                sécuriser ventes, locations et travaux.
              </p>
              <ZoneSearch villes={villes} />
            </div>

            <div className="mt-12 grid gap-5 border-t border-white/25 pt-6 sm:grid-cols-2">
              <div>
                <p className="text-[11px] font-semibold text-white/58">POINT DE DÉPART</p>
                <p className="mt-2 font-[family-name:var(--font-sora)] text-[15px] font-bold">
                  58 rue de la Chevalerie · Tours
                </p>
              </div>
              <div>
                <p className="text-[11px] font-semibold text-white/58">DÉLAI HABITUEL</p>
                <p className="mt-2 inline-flex items-center gap-2 font-[family-name:var(--font-sora)] text-[15px] font-bold">
                  <Clock3Icon className="h-4 w-4 text-[color:var(--color-home-saf)]" aria-hidden />{" "}
                  Intervention sous 48 h
                </p>
              </div>
            </div>
          </div>

          <div className="relative min-h-[430px] bg-white lg:min-h-[570px]">
            <GoogleMapEmbed className="min-h-[430px] lg:min-h-[570px]" />
            <div className="pointer-events-none absolute top-5 left-5 z-10 max-w-[250px] bg-[color:var(--color-home-ink)] px-5 py-4 text-white shadow-[0_6px_8px_rgba(15,30,58,.16)]">
              <p className="inline-flex items-center gap-2 font-[family-name:var(--font-sora)] text-[13px] font-bold">
                <MapPinIcon className="h-4 w-4 text-[color:var(--color-home-saf)]" aria-hidden />{" "}
                Indre-et-Loire · 37
              </p>
              <p className="mt-1 text-[11px] leading-relaxed text-white/68">
                Notre zone réelle d’intervention — retrouvez votre commune juste en dessous.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 bg-[color:var(--color-home-saf)] px-6 py-4 font-[family-name:var(--font-sora)] text-[12px] font-bold text-[color:var(--color-home-ink)] sm:px-8 lg:px-12 xl:px-16">
          <NavigationIcon className="h-4 w-4" aria-hidden />
          <span>Tours</span>
          <span aria-hidden>→</span>
          <span>Amboise</span>
          <span aria-hidden>→</span>
          <span>Loches</span>
          <span aria-hidden>→</span>
          <span>Chinon</span>
          <span className="ml-auto hidden text-[11px] opacity-65 md:inline">
            et toutes les communes entre les deux
          </span>
        </div>
      </section>

      <section
        id="secteurs"
        className="scroll-mt-32 bg-[color:var(--color-si-creme)] px-6 py-14 sm:px-8 lg:px-12 lg:py-18 xl:px-16"
      >
        <div className="grid gap-12 lg:grid-cols-[360px_minmax(0,1fr)]">
          <div>
            <h2 className="font-[family-name:var(--font-sora)] text-[clamp(28px,3.5vw,44px)] leading-tight font-extrabold tracking-[-0.03em] text-balance text-[color:var(--color-home-ink)]">
              Trois secteurs.
              <br />
              La même équipe.
            </h2>
            <p className="mt-5 max-w-[42ch] text-[14.5px] leading-[1.7] text-[color:var(--color-home-muted-2)]">
              Choisissez votre secteur pour retrouver les communes desservies et ouvrir directement
              la zone dans Google Maps.
            </p>
          </div>

          <div className="divide-y divide-[color:var(--color-home-line)] border-y border-[color:var(--color-home-line)]">
            {SECTORS.map((sector) => {
              const sectorCities = villes.filter(
                (ville) => SECTEUR_PAR_SLUG[ville.slug] === sector.id
              );
              return (
                <article
                  key={sector.id}
                  className="grid gap-5 py-7 md:grid-cols-[210px_minmax(0,1fr)_auto] md:items-start"
                >
                  <div>
                    <h3 className="font-[family-name:var(--font-sora)] text-[17px] font-bold text-[color:var(--color-si-petrole)]">
                      {sector.title}
                    </h3>
                    <p className="mt-2 text-[12.5px] leading-relaxed text-[color:var(--color-home-muted-2)]">
                      {sector.detail}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-x-5 gap-y-2">
                    {sectorCities.map((ville) => (
                      <LienVille key={ville.slug} ville={ville} />
                    ))}
                  </div>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(sector.mapQuery)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 text-[12px] font-bold text-[color:var(--color-si-petrole)] transition-colors hover:text-[color:var(--color-home-ink)]"
                  >
                    Voir la carte <ArrowUpRightIcon className="h-4 w-4" aria-hidden />
                  </a>
                </article>
              );
            })}

            {villesSansSecteur.length > 0 && (
              <article className="grid gap-5 py-7 md:grid-cols-[210px_minmax(0,1fr)_auto] md:items-start">
                <div>
                  <h3 className="font-[family-name:var(--font-sora)] text-[17px] font-bold text-[color:var(--color-si-petrole)]">
                    Autres communes
                  </h3>
                  <p className="mt-2 text-[12.5px] leading-relaxed text-[color:var(--color-home-muted-2)]">
                    Également desservies depuis notre agence de Tours.
                  </p>
                </div>
                <div className="flex flex-wrap gap-x-5 gap-y-2">
                  {villesSansSecteur.map((ville) => (
                    <LienVille key={ville.slug} ville={ville} />
                  ))}
                </div>
              </article>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
