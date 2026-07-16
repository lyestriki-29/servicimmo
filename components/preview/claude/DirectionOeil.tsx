"use client";

import { useState } from "react";
import Image from "next/image";
import { ArrowRightIcon, CrosshairIcon, ScanSearchIcon } from "lucide-react";

import { GoogleMapEmbed } from "@/components/marketing/pages/GoogleMapEmbed";

import {
  ARCHETYPES,
  PHOTOS_ANNOTEES,
  VILLES_G1,
  controlesPourVille,
  type Observation,
  type PhotoAnnotee,
} from "./claude-directions-data";

/** Épingle de repérage : réticule + filin + étiquette, posée sur une photo. */
function Repere({ obs }: { obs: Observation }) {
  return (
    <div className="absolute hidden sm:block" style={{ top: obs.top, left: obs.left }}>
      <div className="flex items-center gap-2">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/75 bg-[color:var(--color-home-ink)]/60 backdrop-blur-[2px]">
          <CrosshairIcon className="h-4 w-4 text-[color:var(--color-si-lime)]" aria-hidden />
        </span>
        <span aria-hidden className="h-px w-5 bg-white/75" />
        <span className="max-w-[240px] rounded-[8px] bg-white/95 px-3 py-2 shadow-[0_4px_14px_rgba(15,30,58,.25)]">
          <span className="block font-mono text-[10px] font-bold tracking-[.13em] whitespace-nowrap text-[color:var(--color-si-petrole)] uppercase">
            {obs.id} · {obs.label}
          </span>
          <span className="mt-0.5 block text-[11.5px] leading-snug text-[color:var(--color-home-muted-2)]">
            {obs.detail}
          </span>
        </span>
      </div>
    </div>
  );
}

/** Panneau photo annoté à ratio verrouillé : le cadrage ne dérive pas, les épingles non plus. */
function PanneauAnnote({
  photo,
  legende,
  priorite = false,
}: {
  photo: PhotoAnnotee;
  legende: string;
  priorite?: boolean;
}) {
  return (
    <figure className="relative self-start overflow-hidden rounded-[18px]">
      <div className="relative aspect-[4/3] w-full">
        <Image
          src={photo.src}
          alt={photo.alt}
          fill
          sizes="(min-width:1024px) 55vw, 100vw"
          className="object-cover"
          priority={priorite}
        />
        {photo.pins.map((obs) => (
          <Repere key={obs.id} obs={obs} />
        ))}
        <figcaption className="absolute right-4 bottom-4 rounded-full bg-[color:var(--color-home-ink)]/85 px-4 py-2 font-mono text-[10px] font-bold tracking-[.16em] text-white/85 uppercase">
          {legende}
        </figcaption>
      </div>
    </figure>
  );
}

export function DirectionOeil() {
  const [villeId, setVilleId] = useState(VILLES_G1[0]?.id ?? "amboise");
  const ville = VILLES_G1.find((item) => item.id === villeId) ?? VILLES_G1[0];
  if (!ville) return null;

  const archetype = ARCHETYPES[ville.archetype];
  if (!archetype) return null;
  const heroPhoto = PHOTOS_ANNOTEES[archetype.hero];
  const matierePhoto = PHOTOS_ANNOTEES[archetype.matiere];
  if (!heroPhoto || !matierePhoto) return null;
  const controles = controlesPourVille(ville.nom);

  return (
    <div className="bg-white">
      {/* Barre de démo (chrome du labo, pas du site) : une donnée change, tout suit */}
      <div className="flex flex-wrap items-center gap-3 border-b border-dashed border-[color:var(--color-home-line)] bg-[color:var(--color-home-bg-2)] px-6 py-3 md:px-8">
        <p className="font-mono text-[10px] font-bold tracking-[.16em] text-[color:var(--color-home-muted)] uppercase">
          Démo industrialisation — même gabarit, 3 profils :
        </p>
        <div className="flex gap-2">
          {VILLES_G1.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setVilleId(item.id)}
              aria-pressed={villeId === item.id}
              className={`rounded-full px-3.5 py-1.5 text-[12px] font-semibold transition-colors ${
                villeId === item.id
                  ? "bg-[color:var(--color-si-petrole)] text-white"
                  : "bg-white text-[color:var(--color-home-muted-2)] hover:text-[color:var(--color-home-ink)]"
              }`}
            >
              {item.nom}
            </button>
          ))}
        </div>
        <p className="ml-auto hidden font-mono text-[10px] tracking-[.14em] text-[color:var(--color-home-muted)] uppercase lg:block">
          Archétype : {archetype.label}
        </p>
      </div>

      {/* Hero scindé : le discours à gauche, le relevé annoté à droite */}
      <section className="bg-[color:var(--color-si-creme)]">
        <div className="mx-auto grid max-w-[var(--container,1280px)] items-center gap-10 px-6 py-12 md:px-8 lg:grid-cols-[.92fr_1.08fr] lg:gap-12 lg:py-16">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-[12px] font-bold text-[color:var(--color-si-petrole)]">
              <ScanSearchIcon className="h-4 w-4" aria-hidden /> Diagnostic immobilier à {ville.nom}{" "}
              ({ville.codePostal})
            </p>
            <h1 className="mt-6 font-[family-name:var(--font-sora)] text-[clamp(38px,4.8vw,68px)] leading-[1.0] font-extrabold tracking-[-0.035em] text-balance text-[color:var(--color-home-ink)]">
              Nous voyons ce que{" "}
              <span className="text-[color:var(--color-si-petrole)]">l’œil ne voit pas.</span>
            </h1>
            <p className="mt-6 max-w-[54ch] text-[16px] leading-[1.7] text-[color:var(--color-home-muted-2)]">
              Toiture, menuiseries, structures, matériaux : à {ville.nom}, chaque bien raconte une
              histoire technique. Nos techniciens certifiés la lisent pour vous, sous {ville.delai}.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-5">
              <a
                href="/devis"
                className="inline-flex min-h-12 items-center gap-2 rounded-full bg-[color:var(--color-si-lime)] px-6 text-[13.5px] font-bold text-[color:var(--color-home-ink)] transition-transform hover:-translate-y-0.5"
              >
                Faire examiner mon bien <ArrowRightIcon className="h-4 w-4" aria-hidden />
              </a>
              <p className="text-[12.5px] font-semibold text-[color:var(--color-home-muted-2)]">
                Devis en 2 min · réponse sous 2 h ouvrées
              </p>
            </div>
          </div>
          <PanneauAnnote
            photo={heroPhoto}
            legende={
              ville.photoLocale
                ? "Relevé visuel · cœur historique"
                : `Bâti type du secteur · ${archetype.label}`
            }
            priorite
          />
        </div>
      </section>

      {/* Points de contrôle : la grille de lecture du bâti local */}
      <section className="mx-auto max-w-[var(--container,1280px)] px-6 py-14 md:px-8 lg:py-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 className="max-w-[620px] font-[family-name:var(--font-sora)] text-[clamp(28px,3.4vw,44px)] leading-tight font-extrabold tracking-[-0.03em] text-balance text-[color:var(--color-home-ink)]">
            Six points de contrôle, calibrés pour le bâti de {ville.nom}.
          </h2>
          <p className="font-mono text-[10.5px] font-bold tracking-[.2em] text-[color:var(--color-home-muted)] uppercase">
            Grille de lecture — {ville.codePostal}
          </p>
        </div>
        <div className="mt-10 grid gap-8 lg:grid-cols-[.95fr_1.05fr]">
          <PanneauAnnote
            photo={matierePhoto}
            legende="La matière dit l’époque — l’époque dit les contrôles"
          />
          <div className="divide-y divide-[color:var(--color-home-line)] border-y border-[color:var(--color-home-line)]">
            {controles.map((controle) => (
              <article key={controle.ref} className="flex gap-5 py-5">
                <span className="mt-0.5 flex h-9 w-12 shrink-0 items-center justify-center rounded-[7px] border border-[color:var(--color-si-petrole)]/35 font-mono text-[11px] font-bold text-[color:var(--color-si-petrole)]">
                  {controle.ref}
                </span>
                <div>
                  <h3 className="font-[family-name:var(--font-sora)] text-[15.5px] font-bold text-[color:var(--color-home-ink)]">
                    {controle.titre}
                  </h3>
                  <p className="mt-1.5 max-w-[62ch] text-[13px] leading-relaxed text-[color:var(--color-home-muted-2)]">
                    {controle.note}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Carte : le secteur, cadré comme un viseur */}
      <section className="bg-[color:var(--color-home-bg)]">
        <div className="mx-auto max-w-[var(--container,1280px)] px-6 py-14 md:px-8 lg:py-20">
          <div className="relative p-4">
            {[
              "top-0 left-0 border-t-2 border-l-2",
              "top-0 right-0 border-t-2 border-r-2",
              "bottom-0 left-0 border-b-2 border-l-2",
              "bottom-0 right-0 border-b-2 border-r-2",
            ].map((pos) => (
              <span
                key={pos}
                aria-hidden
                className={`absolute h-8 w-8 border-[color:var(--color-si-petrole)] ${pos}`}
              />
            ))}
            <div className="h-[420px] overflow-hidden rounded-[10px]">
              <GoogleMapEmbed
                query={`${ville.nom} ${ville.codePostal}, France`}
                zoom={13}
                title={`Carte du secteur d’intervention à ${ville.nom}`}
              />
            </div>
            <p className="absolute -bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-[color:var(--color-home-ink)] px-5 py-2.5 text-center text-[12px] font-semibold whitespace-nowrap text-white shadow-[0_8px_20px_rgba(15,30,58,.25)]">
              Secteur couvert — agence à {ville.distanceKm} km · intervention sous {ville.delai}
            </p>
          </div>
          <p className="mt-12 text-center text-[13px] text-[color:var(--color-home-muted-2)]">
            Également suivis depuis {ville.nom} : {ville.communesVoisines.join(" · ")}
          </p>
        </div>
      </section>

      {/* CTA : un seul moment sombre, une seule couleur d’action */}
      <section className="bg-[color:var(--color-home-ink)]">
        <div className="mx-auto flex max-w-[var(--container,1280px)] flex-wrap items-center justify-between gap-6 px-6 py-12 md:px-8">
          <div>
            <h2 className="font-[family-name:var(--font-sora)] text-[clamp(24px,3vw,36px)] font-extrabold tracking-[-0.02em] text-white">
              Votre bien mérite un regard exercé.
            </h2>
            <p className="mt-2 text-[14px] text-white/70">
              Décrivez-le en 2 minutes — devis précis sous 2 h ouvrées.
            </p>
          </div>
          <a
            href="/devis"
            className="inline-flex min-h-12 items-center gap-2 rounded-full bg-[color:var(--color-si-lime)] px-7 text-[14px] font-bold text-[color:var(--color-home-ink)] transition-transform hover:-translate-y-0.5"
          >
            Commencer mon devis <ArrowRightIcon className="h-4 w-4" aria-hidden />
          </a>
        </div>
      </section>
    </div>
  );
}
