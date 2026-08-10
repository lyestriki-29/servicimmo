"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRightIcon, Clock3Icon, MapPinIcon, SearchIcon } from "lucide-react";

import { GoogleMapEmbed } from "@/components/marketing/pages/GoogleMapEmbed";
import { SECTEUR_PAR_SLUG, type ZoneCity } from "@/components/marketing/pages/ZonesExperience";

/**
 * Direction Fable de /zones, portée sur les VRAIES communes.
 *
 * Le gabarit du labo listait ses 18 communes en dur (il en manquait donc une
 * depuis l'ajout de Tours) et portait trois liens morts : deux `/devis` — route
 * qui n'existe pas, le devis est une modale — et un `#` sur « Ouvrir la page ».
 * Ici : les communes viennent de `content/villes/`, le regroupement réutilise
 * `SECTEUR_PAR_SLUG` (dont un test vérifie la complétude), et chaque pastille
 * mène à sa vraie page `/zones/[slug]`.
 */

const TITRES: Record<string, string> = {
  metropole: "Tours Métropole",
  "val-de-loire": "Val de Loire",
  "sud-touraine": "Sud Touraine",
};

/** Recherche tolérante : minuscules et sans accents. */
function normalise(valeur: string) {
  return valeur.toLocaleLowerCase("fr").normalize("NFD").replace(/[̀-ͯ]/g, "");
}

export function ZonesFable({ villes }: { villes: ZoneCity[] }) {
  const [recherche, setRecherche] = useState("");
  const [communeActive, setCommuneActive] = useState<ZoneCity | null>(null);

  const filtre = normalise(recherche.trim());
  const retenues = filtre
    ? villes.filter((v) => normalise(v.ville).includes(filtre) || v.codePostal.startsWith(filtre))
    : villes;

  // Regroupement par secteur. Une commune hors mapping va dans « Autres communes »
  // plutôt que d'être annoncée à tort dans le dernier secteur.
  const groupes = [...Object.keys(TITRES), "autres"]
    .map((id) => ({
      id,
      titre: TITRES[id] ?? "Autres communes",
      communes: retenues.filter((v) => (SECTEUR_PAR_SLUG[v.slug] ?? "autres") === id),
    }))
    .filter((g) => g.communes.length > 0);

  return (
    <div className="bg-white">
      {/* La carte EST la page : plein cadre, panneaux flottants par-dessus.
          Hauteur = l'écran moins le header, comme les autres heros vitrine. Elle
          était figée à 760px (2026-08-03) : elle débordait sous la ligne de
          flottaison sur un portable et laissait une bande vide sur un grand
          écran. La carte étant en `absolute inset-0` et le panneau ancré
          top/bottom, les deux suivent la nouvelle hauteur sans autre réglage. */}
      <section className="relative flex flex-col lg:block lg:h-[var(--hero-max-h)]">
        <div className="relative order-2 h-[clamp(320px,52svh,440px)] lg:absolute lg:inset-0 lg:order-none lg:h-auto">
          <GoogleMapEmbed
            query={
              communeActive
                ? `${communeActive.ville} ${communeActive.codePostal}, France`
                : "Indre-et-Loire, France"
            }
            zoom={communeActive ? 13 : 9}
            title="Carte interactive de la zone d’intervention Servicimmo"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-y-0 left-0 hidden w-[520px] bg-gradient-to-r from-[color:var(--color-home-ink)]/25 to-transparent lg:block"
          />
        </div>

        {/* Panneau de pilotage : recherche + secteurs + communes cliquables */}
        <div className="relative order-1 border-b border-[color:var(--color-home-line)] bg-white/94 p-6 backdrop-blur-md sm:p-7 lg:absolute lg:top-6 lg:bottom-6 lg:left-6 lg:order-none lg:w-[420px] lg:overflow-y-auto lg:rounded-[18px] lg:border lg:shadow-[0_18px_44px_rgba(15,30,58,.18)]">
          <p className="font-mono text-[10.5px] font-bold tracking-[.2em] text-[color:var(--color-home-muted)] uppercase">
            Zone d’intervention — Indre-et-Loire
          </p>
          <h1 className="mt-3 font-[family-name:var(--font-sora)] text-[clamp(28px,3.4vw,40px)] leading-[1.02] font-extrabold tracking-[-0.03em] text-[color:var(--color-home-ink)]">
            Notre terrain, <span className="text-[color:var(--color-si-petrole)]">c’est ici.</span>
          </h1>
          <p className="mt-3 text-[13px] leading-[1.7] text-[color:var(--color-home-muted-2)]">
            Basés à Tours, nous couvrons tout le département. Cliquez une commune : la carte se
            recentre, sa page détaille bâti et contrôles.
          </p>

          <label className="mt-5 flex items-center gap-3 rounded-full border border-[color:var(--color-home-line)] bg-white px-4 py-3 transition-colors focus-within:border-[color:var(--color-si-petrole)]">
            <SearchIcon className="h-4 w-4 shrink-0 text-[color:var(--color-home-muted)]" aria-hidden />
            <input
              type="search"
              value={recherche}
              onChange={(event) => setRecherche(event.target.value)}
              placeholder="Votre commune…"
              aria-label="Rechercher une commune"
              className="w-full bg-transparent text-[14px] outline-none placeholder:text-[color:var(--color-home-muted)]"
            />
          </label>

          <div className="mt-6 space-y-6">
            {groupes.length === 0 && (
              <p className="text-[13px] leading-relaxed text-[color:var(--color-home-muted-2)]">
                Commune absente de la liste ? Nous couvrons tout le 37 —{" "}
                <Link href="/contact" className="font-bold text-[color:var(--color-si-petrole)]">
                  décrivez votre bien
                </Link>
                , le délai se confirme avec le devis.
              </p>
            )}
            {groupes.map((secteur) => (
              <div key={secteur.id}>
                <p className="flex items-baseline justify-between border-b border-[color:var(--color-home-line)] pb-2 font-mono text-[10px] font-bold tracking-[.16em] text-[color:var(--color-home-muted)] uppercase">
                  {secteur.titre}
                  <span className="text-[color:var(--color-home-saf-dark)]">
                    {secteur.communes.length}
                  </span>
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {secteur.communes.map((commune) => {
                    const active = communeActive?.slug === commune.slug;
                    return (
                      <button
                        key={commune.slug}
                        type="button"
                        onClick={() => setCommuneActive(active ? null : commune)}
                        aria-pressed={active}
                        className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-[12.5px] font-semibold transition-colors ${
                          active
                            ? "border-[color:var(--color-si-petrole)] bg-[color:var(--color-si-petrole)] text-white"
                            : "border-[color:var(--color-home-line)] bg-white text-[color:var(--color-home-ink)] hover:border-[color:var(--color-si-petrole)]/50"
                        }`}
                      >
                        <MapPinIcon
                          className={`h-3.5 w-3.5 ${active ? "text-[color:var(--color-si-lime)]" : "text-[color:var(--color-home-saf-dark)]"}`}
                          aria-hidden
                        />
                        {commune.ville}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-7 border-t border-[color:var(--color-home-line)] pt-4">
            <Link
              href={communeActive ? `/zones/${communeActive.slug}` : "/contact"}
              className="group inline-flex min-h-11 items-center gap-2 text-[13.5px] font-bold text-[color:var(--color-si-petrole)]"
            >
              {communeActive ? `Ouvrir la page ${communeActive.ville}` : "Décrire mon bien"}
              <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-1.5" aria-hidden />
            </Link>
          </div>
        </div>

        {/* Repères flottants sur la carte */}
        <p className="pointer-events-none absolute top-6 right-6 z-10 hidden rounded-full bg-[color:var(--color-home-ink)] px-4 py-2.5 text-[11.5px] font-semibold text-white shadow-[0_8px_20px_rgba(15,30,58,.3)] lg:block">
          <MapPinIcon className="mr-1.5 inline h-3.5 w-3.5 text-[color:var(--color-home-saf)]" aria-hidden />
          Agence — 58 rue de la Chevalerie, Tours
        </p>
        <div className="pointer-events-none absolute right-6 bottom-6 z-10 hidden items-center gap-5 rounded-full bg-[color:var(--color-home-ink)]/88 px-6 py-3.5 text-white shadow-[0_8px_20px_rgba(15,30,58,.3)] backdrop-blur-sm lg:flex">
          <span className="font-[family-name:var(--font-sora)] text-[14px] font-extrabold">
            {villes.length} <span className="text-[11px] font-semibold text-white/60">communes en page</span>
          </span>
          <span aria-hidden className="h-4 w-px bg-white/25" />
          <span className="inline-flex items-center gap-2 font-[family-name:var(--font-sora)] text-[14px] font-extrabold">
            <Clock3Icon className="h-4 w-4 text-[color:var(--color-si-lime)]" aria-hidden /> 48 h
            <span className="text-[11px] font-semibold text-white/60">de délai habituel</span>
          </span>
        </div>
      </section>
    </div>
  );
}
