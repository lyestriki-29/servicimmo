"use client";

import { useState } from "react";
import { ArrowRightIcon, Clock3Icon, MapPinIcon, SearchIcon } from "lucide-react";

import { GoogleMapEmbed } from "@/components/marketing/pages/GoogleMapEmbed";

import { BandeCta, CoinsViseur, KickerMono } from "./primitives";

type Commune = { nom: string; codePostal: string };
type Secteur = { titre: string; communes: Commune[] };

const SECTEURS: Secteur[] = [
  {
    titre: "Tours Métropole",
    communes: [
      { nom: "Chambray-lès-Tours", codePostal: "37170" },
      { nom: "Fondettes", codePostal: "37230" },
      { nom: "Joué-lès-Tours", codePostal: "37300" },
      { nom: "La Membrolle-sur-Choisille", codePostal: "37390" },
      { nom: "Luynes", codePostal: "37230" },
      { nom: "Montbazon", codePostal: "37250" },
      { nom: "Saint-Cyr-sur-Loire", codePostal: "37540" },
      { nom: "Saint-Pierre-des-Corps", codePostal: "37700" },
    ],
  },
  {
    titre: "Val de Loire",
    communes: [
      { nom: "Amboise", codePostal: "37400" },
      { nom: "Bléré", codePostal: "37150" },
      { nom: "Château-Renault", codePostal: "37110" },
      { nom: "Langeais", codePostal: "37130" },
      { nom: "Montlouis-sur-Loire", codePostal: "37270" },
    ],
  },
  {
    titre: "Sud Touraine",
    communes: [
      { nom: "Azay-le-Rideau", codePostal: "37190" },
      { nom: "Chinon", codePostal: "37500" },
      { nom: "Ligueil", codePostal: "37240" },
      { nom: "Loches", codePostal: "37600" },
      { nom: "Sainte-Maure-de-Touraine", codePostal: "37800" },
    ],
  },
];

/** Recherche tolérante : minuscules et sans accents. */
function normalise(valeur: string) {
  return valeur.toLocaleLowerCase("fr").normalize("NFD").replace(/[̀-ͯ]/g, "");
}

export function GabaritZones() {
  const [recherche, setRecherche] = useState("");
  const [communeActive, setCommuneActive] = useState<Commune | null>(null);

  const filtre = normalise(recherche.trim());
  const secteursVisibles = SECTEURS.map((secteur) => ({
    ...secteur,
    communes: filtre
      ? secteur.communes.filter((commune) => normalise(commune.nom).includes(filtre))
      : secteur.communes,
  })).filter((secteur) => secteur.communes.length > 0);

  return (
    <div className="bg-white">
      {/* La carte EST la page : plein cadre, panneaux flottants par-dessus */}
      <section className="relative flex flex-col lg:block lg:h-[760px]">
        <div className="relative order-2 h-[440px] lg:absolute lg:inset-0 lg:order-none lg:h-auto">
          <GoogleMapEmbed
            query={
              communeActive
                ? `${communeActive.nom} ${communeActive.codePostal}, France`
                : "Indre-et-Loire, France"
            }
            zoom={communeActive ? 13 : 9}
            title="Carte interactive de la zone d’intervention Servicimmo"
          />
          {/* Voile de lisibilité sur le bord gauche, sous les panneaux */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-y-0 left-0 hidden w-[520px] bg-gradient-to-r from-[color:var(--color-home-ink)]/25 to-transparent lg:block"
          />
        </div>

        {/* Panneau de pilotage : recherche + secteurs + communes cliquables */}
        <div className="relative order-1 border-b border-[color:var(--color-home-line)] bg-white/94 p-6 backdrop-blur-md sm:p-7 lg:absolute lg:top-6 lg:bottom-6 lg:left-6 lg:order-none lg:w-[420px] lg:overflow-y-auto lg:rounded-[18px] lg:border lg:shadow-[0_18px_44px_rgba(15,30,58,.18)]">
          <CoinsViseur couleur="border-[color:var(--color-si-petrole)]" />
          <KickerMono>Zone d’intervention — Indre-et-Loire</KickerMono>
          <h1 className="mt-3 font-[family-name:var(--font-sora)] text-[clamp(28px,3.4vw,40px)] leading-[1.02] font-extrabold tracking-[-0.03em] text-[color:var(--color-home-ink)]">
            Notre terrain, <span className="text-[color:var(--color-si-petrole)]">c’est ici.</span>
          </h1>
          <p className="mt-3 text-[13px] leading-[1.7] text-[color:var(--color-home-muted-2)]">
            Basés à Tours, nous couvrons tout le département. Cliquez une commune : la carte se
            recentre, sa page détaille bâti et contrôles.
          </p>

          <label className="mt-5 flex items-center gap-3 rounded-full border border-[color:var(--color-home-line)] bg-white px-4 py-3 transition-colors focus-within:border-[color:var(--color-si-petrole)]">
            <SearchIcon
              className="h-4 w-4 shrink-0 text-[color:var(--color-home-muted)]"
              aria-hidden
            />
            <input
              type="search"
              value={recherche}
              onChange={(event) => setRecherche(event.target.value)}
              placeholder="Votre commune…"
              className="w-full bg-transparent text-[14px] outline-none placeholder:text-[color:var(--color-home-muted)]"
            />
          </label>

          <div className="mt-6 space-y-6">
            {secteursVisibles.length === 0 && (
              <p className="text-[13px] leading-relaxed text-[color:var(--color-home-muted-2)]">
                Commune absente de la liste ? Nous couvrons tout le 37 —{" "}
                <a href="/devis" className="font-bold text-[color:var(--color-si-petrole)]">
                  décrivez votre bien
                </a>
                , le délai se confirme avec le devis.
              </p>
            )}
            {secteursVisibles.map((secteur) => (
              <div key={secteur.titre}>
                <p className="flex items-baseline justify-between border-b border-[color:var(--color-home-line)] pb-2 font-mono text-[10px] font-bold tracking-[.16em] text-[color:var(--color-home-muted)] uppercase">
                  {secteur.titre}
                  <span className="text-[color:var(--color-home-saf-dark)]">
                    {secteur.communes.length}
                  </span>
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {secteur.communes.map((commune) => {
                    const active = communeActive?.nom === commune.nom;
                    return (
                      <button
                        key={commune.nom}
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
                        {commune.nom}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-7 border-t border-[color:var(--color-home-line)] pt-4">
            <a
              href={communeActive ? "#" : "/devis"}
              className="group inline-flex min-h-11 items-center gap-2 text-[13.5px] font-bold text-[color:var(--color-si-petrole)]"
            >
              {communeActive
                ? `Ouvrir la page ${communeActive.nom}`
                : "Décrire mon bien — devis en 2 min"}
              <ArrowRightIcon
                className="h-4 w-4 transition-transform group-hover:translate-x-1.5"
                aria-hidden
              />
            </a>
          </div>
        </div>

        {/* Repères flottants sur la carte */}
        <p className="pointer-events-none absolute top-6 right-6 z-10 hidden rounded-full bg-[color:var(--color-home-ink)] px-4 py-2.5 text-[11.5px] font-semibold text-white shadow-[0_8px_20px_rgba(15,30,58,.3)] lg:block">
          <MapPinIcon
            className="mr-1.5 inline h-3.5 w-3.5 text-[color:var(--color-home-saf)]"
            aria-hidden
          />
          Agence — 58 rue de la Chevalerie, Tours
        </p>
        <div className="pointer-events-none absolute right-6 bottom-6 z-10 hidden items-center gap-5 rounded-full bg-[color:var(--color-home-ink)]/88 px-6 py-3.5 text-white shadow-[0_8px_20px_rgba(15,30,58,.3)] backdrop-blur-sm lg:flex">
          <span className="font-[family-name:var(--font-sora)] text-[14px] font-extrabold">
            18 <span className="text-[11px] font-semibold text-white/60">communes en page</span>
          </span>
          <span aria-hidden className="h-4 w-px bg-white/25" />
          <span className="inline-flex items-center gap-2 font-[family-name:var(--font-sora)] text-[14px] font-extrabold">
            <Clock3Icon className="h-4 w-4 text-[color:var(--color-si-lime)]" aria-hidden /> 48 h
            <span className="text-[11px] font-semibold text-white/60">de délai habituel</span>
          </span>
        </div>
      </section>

      <BandeCta
        titre="Votre commune est-elle couverte ?"
        sousTitre="Décrivez votre bien : le secteur et le délai se confirment avec votre devis."
        libelle="Décrire mon bien"
      />
    </div>
  );
}
