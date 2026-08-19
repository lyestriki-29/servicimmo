"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { LayoutGridIcon, MapPinIcon, SearchIcon } from "lucide-react";

import { CarteAtlas } from "@/components/carottage/CarteAtlas";

/** Zone allégée et sérialisable vers le client (le `html` des fiches reste au serveur). */
export type ZoneAtlas = {
  slug: string;
  nom: string;
  code: string;
  description: string;
  lat: number;
  lng: number;
  type: "departement" | "region" | "secteur";
  villes: number;
};

const FILTRES = [
  { cle: "tout", libelle: "Toutes les zones" },
  { cle: "departement", libelle: "Départements" },
  { cle: "region", libelle: "Régions" },
  { cle: "secteur", libelle: "Secteurs" },
] as const;

const ETIQUETTE: Record<ZoneAtlas["type"], string> = {
  departement: "Département",
  region: "Région",
  secteur: "Secteur",
};

function normaliser(texte: string): string {
  return texte
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

/**
 * Atlas des zones d'intervention — liste éditoriale défilante à gauche, carte
 * fixe à droite, barre d'outils (bascule Liste/Carte sur mobile, filtre par
 * granularité, recherche). Survol et sélection sont croisés entre les deux.
 *
 * Les zones sans centroïde en base (régions, secteurs locaux) sont listées mais
 * ne portent pas de point sur la carte — voir `zonesPourAtlas` côté page.
 */
export function AtlasZones({ zones }: { zones: ZoneAtlas[] }) {
  const [recherche, setRecherche] = useState("");
  const [filtre, setFiltre] = useState<(typeof FILTRES)[number]["cle"]>("tout");
  const [vueMobile, setVueMobile] = useState<"liste" | "carte">("liste");
  const [slugActif, setSlugActif] = useState<string | null>(null);

  const visibles = useMemo(() => {
    const q = normaliser(recherche.trim());
    return zones.filter((z) => {
      if (filtre !== "tout" && z.type !== filtre) return false;
      if (!q) return true;
      return normaliser(z.nom).includes(q) || z.code.includes(q);
    });
  }, [zones, recherche, filtre]);

  const plaçables = visibles.filter((z) => z.lat !== 0 || z.lng !== 0);

  return (
    // Hauteur FIXE (et non min-h) : sans plafond, la liste des 58 zones impose sa
    // hauteur naturelle à la rangée, la carte hérite de milliers de pixels et le
    // panneau ne défile plus dans son propre cadre.
    <div className="flex h-[calc(100dvh-var(--header-h,118px))] flex-col overflow-hidden">
      {/* Bandeau titre — porte le H1 de la page (SEO) */}
      <section
        className="shrink-0 bg-[color:var(--fc-noir)] px-6 py-7 text-center md:px-8"
        style={{
          backgroundImage:
            "radial-gradient(900px 600px at 8% -20%, rgba(140,22,26,0.5), transparent 70%)",
        }}
      >
        <h1 className="font-[family-name:var(--font-sora)] text-[clamp(24px,2.6vw,32px)] font-extrabold leading-tight tracking-[-0.02em] text-white">
          Zones d’intervention
        </h1>
        <p className="mx-auto mt-2 max-w-2xl text-[14px] leading-relaxed text-white/60">
          {zones.length} zones couvertes en carottage d’enrobés et repérage amiante/HAP.
          Parcourez la liste ou la carte pour trouver la vôtre.
        </p>
        <nav aria-label="Fil d'Ariane" className="mt-3">
          <ol className="flex flex-wrap items-center justify-center gap-2 text-[13px] text-white/55">
            <li>
              <Link href="/" className="hover:text-white">
                Accueil
              </Link>
            </li>
            <li aria-hidden className="text-white/25">/</li>
            <li aria-current="page" className="font-semibold text-[#e9a4a6]">
              Zones d’intervention
            </li>
          </ol>
        </nav>
      </section>

      {/* Barre d'outils — bascule, filtre, recherche */}
      <div className="flex shrink-0 items-center justify-between gap-4 border-y border-white/10 bg-[color:var(--fc-noir)] px-4 py-2.5 md:px-6">
        <div className="flex items-center gap-1 lg:invisible" role="group" aria-label="Affichage">
          {(
            [
              { cle: "liste", libelle: "Liste", Icone: LayoutGridIcon },
              { cle: "carte", libelle: "Carte", Icone: MapPinIcon },
            ] as const
          ).map(({ cle, libelle, Icone }) => (
            <button
              key={cle}
              type="button"
              onClick={() => setVueMobile(cle)}
              aria-pressed={vueMobile === cle}
              className={`inline-flex cursor-pointer items-center gap-2 rounded-[3px] border-0 bg-transparent px-3 py-1.5 font-[family-name:var(--font-sora)] text-[13px] font-bold transition-colors ${
                vueMobile === cle ? "text-white" : "text-white/45 hover:text-white/80"
              }`}
            >
              <Icone className="h-4 w-4" aria-hidden />
              {libelle}
            </button>
          ))}
        </div>

        <label className="relative">
          <span className="sr-only">Filtrer par type de zone</span>
          <select
            value={filtre}
            onChange={(e) => setFiltre(e.target.value as (typeof FILTRES)[number]["cle"])}
            className="cursor-pointer appearance-none rounded-[3px] border-0 bg-transparent px-3 py-1.5 text-center font-[family-name:var(--font-sora)] text-[14px] font-bold uppercase tracking-[0.08em] text-white outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--fc-rouge)]"
          >
            {FILTRES.map((f) => (
              <option key={f.cle} value={f.cle} className="bg-[color:var(--fc-noir)] normal-case">
                {f.libelle}
              </option>
            ))}
          </select>
        </label>

        <label className="flex items-center gap-2">
          <SearchIcon className="h-4 w-4 shrink-0 text-white/60" aria-hidden />
          <span className="sr-only">Rechercher une zone</span>
          <input
            type="search"
            value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
            placeholder="Rechercher"
            className="w-28 border-0 border-b border-white/20 bg-transparent py-1 text-[13.5px] text-white placeholder:text-white/40 outline-none transition-[width,border-color] focus:w-44 focus:border-[color:var(--fc-rouge)] md:w-36 md:focus:w-56"
          />
        </label>
      </div>

      {/* Corps — liste défilante | carte fixe */}
      <div className="grid min-h-0 flex-1 lg:grid-cols-[minmax(0,520px)_1fr]">
        <div
          className={`min-h-0 overflow-y-auto border-r border-[color:var(--fc-gris-clair)] bg-white ${
            vueMobile === "liste" ? "" : "hidden lg:block"
          }`}
        >
          {visibles.length === 0 ? (
            <p className="px-7 py-12 text-[14px] text-[color:var(--fc-gris)]">
              Aucune zone ne correspond à « {recherche} ». Essayez un nom de département ou son
              numéro.
            </p>
          ) : (
            <ul className="m-0 list-none p-0">
              {visibles.map((z) => (
                <li key={z.slug}>
                  <Link
                    href={`/zones/${z.slug}`}
                    onMouseEnter={() => setSlugActif(z.slug)}
                    onMouseLeave={() => setSlugActif(null)}
                    onFocus={() => setSlugActif(z.slug)}
                    onBlur={() => setSlugActif(null)}
                    className={`block border-b border-[color:var(--fc-gris-clair)] px-7 py-7 transition-colors ${
                      slugActif === z.slug ? "bg-[color:var(--fc-blanc-casse)]" : "bg-white"
                    }`}
                  >
                    <p className="font-[family-name:var(--font-sora)] text-[10.5px] font-bold uppercase tracking-[0.16em] text-[color:var(--fc-gris)]">
                      {ETIQUETTE[z.type]}
                      {z.code !== "00" && ` ${z.code}`}
                    </p>
                    <h2 className="mt-2 font-[family-name:var(--font-sora)] text-[22px] font-extrabold leading-tight tracking-[-0.01em] text-[color:var(--fc-noir)]">
                      {z.nom}
                    </h2>
                    <p className="mt-3 max-w-[46ch] text-[14.5px] leading-[1.6] text-[color:var(--fc-noir)]/75">
                      {z.description}
                    </p>
                    <p className="mt-4 font-[family-name:var(--font-sora)] text-[11px] font-bold uppercase tracking-[0.14em] text-[color:var(--fc-rouge)]">
                      Voir la zone »
                    </p>
                    <p className="mt-3 text-[13px] text-[color:var(--fc-gris)]">
                      {z.villes > 0
                        ? `${z.villes} ville${z.villes > 1 ? "s" : ""} couverte${z.villes > 1 ? "s" : ""}`
                        : "Intervention sur devis"}
                      {" · carottage & repérage amiante/HAP"}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* h-full explicite : Leaflet a besoin d'une hauteur résolue dès l'init. */}
        <div className={`h-full min-h-0 ${vueMobile === "carte" ? "" : "hidden lg:block"}`}>
          <CarteAtlas
            zones={plaçables}
            slugActif={slugActif}
            onSurvol={setSlugActif}
            onChoix={setSlugActif}
          />
        </div>
      </div>
    </div>
  );
}
