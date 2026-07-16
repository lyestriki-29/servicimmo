"use client";

import { useState } from "react";
import Image from "next/image";
import { ArrowRightIcon, CrosshairIcon, ScanSearchIcon } from "lucide-react";

import { GoogleMapEmbed } from "@/components/marketing/pages/GoogleMapEmbed";

import { ARCHETYPES, VILLES_G1, controlesPourVille } from "./claude-directions-data";

/** Coins de viseur — la signature réticule, sans photo à caler. */
function CoinsViseur({ couleur = "border-[color:var(--color-si-lime)]" }: { couleur?: string }) {
  return (
    <>
      {[
        "top-0 left-0 border-t-2 border-l-2",
        "top-0 right-0 border-t-2 border-r-2",
        "bottom-0 left-0 border-b-2 border-l-2",
        "bottom-0 right-0 border-b-2 border-r-2",
      ].map((pos) => (
        <span key={pos} aria-hidden className={`absolute h-7 w-7 ${couleur} ${pos}`} />
      ))}
    </>
  );
}

export function DirectionOeilData() {
  const [villeId, setVilleId] = useState(VILLES_G1[0]?.id ?? "amboise");
  const ville = VILLES_G1.find((item) => item.id === villeId) ?? VILLES_G1[0];
  if (!ville) return null;

  const archetype = ARCHETYPES[ville.archetype];
  if (!archetype) return null;
  const controles = controlesPourVille(ville.nom);

  const releve = [
    {
      id: "01",
      label: "Bâti dominant",
      valeur: archetype.label,
      detail: "L’époque du bien détermine plomb, amiante et lecture DPE.",
    },
    {
      id: "02",
      label: "Zone termites",
      valeur: "Département 37 classé",
      detail: "État termites exigé pour toute vente.",
    },
    {
      id: "03",
      label: "Depuis l’agence de Tours",
      valeur: `${ville.distanceKm} km · créneau sous ${ville.delai}`,
      detail: "Techniciens certifiés, secteur connu.",
    },
    {
      id: "04",
      label: "Contrôles fréquents ici",
      valeur: "DPE · AMI · PLB · ELE",
      detail: "Liste exacte établie avec votre devis.",
    },
  ] as const;

  return (
    <div className="bg-white">
      {/* Barre de démo (chrome du labo, pas du site) */}
      <div className="flex flex-wrap items-center gap-3 border-b border-dashed border-[color:var(--color-home-line)] bg-[color:var(--color-home-bg-2)] px-6 py-3 md:px-8">
        <p className="font-mono text-[10px] font-bold tracking-[.16em] text-[color:var(--color-home-muted)] uppercase">
          Démo industrialisation — zéro photo obligatoire :
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
          {ville.photoConnue
            ? "Photo « carte postale » en fond de hero"
            : "Sans photo — fond encre, même composition"}
        </p>
      </div>

      {/* Hero : la photo connue en fond sous un voile encre, le relevé flotte par-dessus */}
      <section className="relative overflow-hidden bg-[color:var(--color-home-ink)]">
        {ville.photoConnue && (
          <>
            <Image
              src={ville.photoConnue.src}
              alt={ville.photoConnue.alt}
              fill
              sizes="100vw"
              className="object-cover"
              priority
            />
            <div
              aria-hidden
              className="absolute inset-0 bg-gradient-to-r from-[color:var(--color-home-ink)]/90 via-[color:var(--color-home-ink)]/65 to-[color:var(--color-home-ink)]/30"
            />
          </>
        )}
        <div className="relative mx-auto grid max-w-[var(--container,1280px)] items-center gap-10 px-6 py-14 md:px-8 lg:grid-cols-[1.02fr_.98fr] lg:gap-14 lg:py-20">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-[12px] font-bold text-[color:var(--color-si-petrole)]">
              <ScanSearchIcon className="h-4 w-4" aria-hidden /> Diagnostic immobilier à {ville.nom}{" "}
              ({ville.codePostal})
            </p>
            <h1 className="mt-6 font-[family-name:var(--font-sora)] text-[clamp(38px,4.8vw,68px)] leading-[1.0] font-extrabold tracking-[-0.035em] text-balance text-white">
              Nous voyons ce que{" "}
              <span className="text-[color:var(--color-si-lime)]">l’œil ne voit pas.</span>
            </h1>
            <p className="mt-6 max-w-[54ch] text-[16px] leading-[1.7] text-white/80">
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
              <p className="text-[12.5px] font-semibold text-white/70">
                Devis en 2 min · réponse sous 2 h ouvrées
              </p>
            </div>
          </div>

          <div className="relative rounded-[18px] border border-white/15 bg-[color:var(--color-home-ink)]/72 p-7 backdrop-blur-md sm:p-9">
            <CoinsViseur />
            <p className="flex items-center justify-between gap-4 font-mono text-[10.5px] font-bold tracking-[.18em] text-white/60 uppercase">
              Relevé technique{" "}
              <span className="text-[color:var(--color-si-lime)]">{ville.codePostal}</span>
            </p>
            <div className="mt-5 divide-y divide-white/12">
              {releve.map((ligne) => (
                <div key={ligne.id} className="flex gap-4 py-4">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/25">
                    <CrosshairIcon
                      className="h-3.5 w-3.5 text-[color:var(--color-si-lime)]"
                      aria-hidden
                    />
                  </span>
                  <div className="min-w-0">
                    <p className="font-mono text-[10px] font-bold tracking-[.15em] text-white/55 uppercase">
                      {ligne.id} · {ligne.label}
                    </p>
                    <p className="mt-1 font-[family-name:var(--font-sora)] text-[15.5px] leading-snug font-bold text-white">
                      {ligne.valeur}
                    </p>
                    <p className="mt-1 text-[12px] leading-relaxed text-white/60">{ligne.detail}</p>
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-4 border-t border-[color:var(--color-si-lime)]/40 pt-3 font-mono text-[9.5px] tracking-[.14em] text-white/45 uppercase">
              Relevé indicatif — le devis précise vos contrôles
            </p>
          </div>
        </div>
        {ville.photoConnue && (
          <p className="absolute right-4 bottom-4 hidden rounded-full bg-[color:var(--color-home-ink)]/75 px-4 py-2 font-mono text-[9.5px] font-bold tracking-[.14em] text-white/70 uppercase md:block">
            {ville.photoConnue.legende}
          </p>
        )}
      </section>

      {/* Contrôles + carte côte à côte : la vraie carte remplace la photo */}
      <section className="mx-auto max-w-[var(--container,1280px)] px-6 py-14 md:px-8 lg:py-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 className="max-w-[620px] font-[family-name:var(--font-sora)] text-[clamp(28px,3.4vw,44px)] leading-tight font-extrabold tracking-[-0.03em] text-balance text-[color:var(--color-home-ink)]">
            Six points de contrôle, calibrés pour le bâti de {ville.nom}.
          </h2>
          <p className="font-mono text-[10.5px] font-bold tracking-[.2em] text-[color:var(--color-home-muted)] uppercase">
            Grille de lecture — {ville.codePostal}
          </p>
        </div>
        <div className="mt-10 grid gap-10 lg:grid-cols-[.9fr_1.1fr]">
          <div className="relative self-start p-3">
            <CoinsViseur couleur="border-[color:var(--color-si-petrole)]" />
            <div className="h-[430px] overflow-hidden rounded-[10px]">
              <GoogleMapEmbed
                query={`${ville.nom} ${ville.codePostal}, France`}
                zoom={13}
                title={`Carte du secteur d’intervention à ${ville.nom}`}
              />
            </div>
            <p className="mt-4 text-center text-[12.5px] text-[color:var(--color-home-muted-2)]">
              Agence à {ville.distanceKm} km — également suivis :{" "}
              {ville.communesVoisines.join(" · ")}
            </p>
          </div>
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
