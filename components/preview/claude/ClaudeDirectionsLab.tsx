"use client";

import { useState } from "react";
import { CheckIcon, EyeIcon } from "lucide-react";

import { PREVIEW_PAGES } from "@/components/preview/servicimmo-preview-data";
import { ServicimmoPreviewSurface } from "@/components/preview/ServicimmoPreviewSurface";

import { CLAUDE_DIRECTIONS, type ClaudeDirection } from "./claude-directions-data";
import { DirectionClairObscur } from "./DirectionClairObscur";
import { DirectionDossier } from "./DirectionDossier";
import { DirectionOeil } from "./DirectionOeil";
import { DirectionOeilData } from "./DirectionOeilData";
import { GabaritActualites } from "./gabarits/GabaritActualites";
import { GabaritArticle } from "./gabarits/GabaritArticle";
import { GabaritContact } from "./gabarits/GabaritContact";
import { GabaritLegal } from "./gabarits/GabaritLegal";
import { GabaritService } from "./gabarits/GabaritService";
import { GabaritServices } from "./gabarits/GabaritServices";
import { GabaritZones } from "./gabarits/GabaritZones";

const GABARITS = [
  { id: "ville", label: "Détail ville" },
  { id: "services", label: "Services" },
  { id: "service", label: "Détail service" },
  { id: "actualites", label: "Actualités" },
  { id: "article", label: "Détail article" },
  { id: "zones", label: "Zones" },
  { id: "contact", label: "Contact" },
  { id: "legal", label: "Pages légales" },
] as const;

type GabaritId = (typeof GABARITS)[number]["id"];

const RENDU_GABARIT: Record<GabaritId, () => React.ReactNode> = {
  ville: () => <DirectionOeilData />,
  services: () => <GabaritServices />,
  service: () => <GabaritService />,
  actualites: () => <GabaritActualites />,
  article: () => <GabaritArticle />,
  zones: () => <GabaritZones />,
  contact: () => <GabaritContact />,
  legal: () => <GabaritLegal />,
};

type Moteur = "fable" | "codex";

export function ClaudeDirectionsLab() {
  const [direction, setDirection] = useState<ClaudeDirection>("oeil-data");
  const [gabarit, setGabarit] = useState<GabaritId>("ville");
  const [moteur, setMoteur] = useState<Moteur>("fable");

  const pageCodex = PREVIEW_PAGES.find((item) => item.id === gabarit);

  return (
    <div className="min-h-screen bg-[#e9edef] pb-20">
      <header className="border-b border-[color:var(--color-home-line)] bg-white px-6 py-8 md:px-8">
        <div className="mx-auto max-w-[1440px]">
          <p className="flex items-center gap-2 font-[family-name:var(--font-sora)] text-[12px] font-bold text-[color:var(--color-si-petrole)]">
            <EyeIcon className="h-4 w-4" aria-hidden />
            Contre-projet Claude · non publié
          </p>
          <h1 className="mt-3 font-[family-name:var(--font-sora)] text-[clamp(28px,4vw,48px)] leading-tight font-extrabold tracking-[-0.03em] text-balance text-[color:var(--color-home-ink)]">
            La direction retenue, déclinée sur les huit gabarits
          </h1>
          <p className="mt-3 max-w-[820px] text-[15px] leading-relaxed text-[color:var(--color-home-muted-2)]">
            Sur chaque gabarit, l’interrupteur Fable / Codex bascule entre la direction G (passe
            premium) et la sélection F du labo Codex — même contenu, deux traitements. G1, G2 et G3
            restent archivées pour mémoire.
          </p>
        </div>
      </header>

      <div className="sticky top-0 z-40 border-b border-[color:var(--color-home-line)] bg-white px-6 py-4 md:px-8">
        <div className="mx-auto grid max-w-[1440px] gap-4">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {CLAUDE_DIRECTIONS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setDirection(item.id)}
                aria-pressed={direction === item.id}
                className={`shrink-0 rounded-[9px] border px-4 py-2 text-left transition-colors ${
                  direction === item.id
                    ? "border-[color:var(--color-si-petrole)] bg-[color:var(--color-si-petrole)]/8 text-[color:var(--color-home-ink)]"
                    : "border-[color:var(--color-home-line)] bg-white text-[color:var(--color-home-muted-2)] hover:text-[color:var(--color-home-ink)]"
                }`}
              >
                <span className="flex items-center gap-2 text-[12px] font-bold">
                  {direction === item.id && (
                    <CheckIcon
                      className="h-3.5 w-3.5 text-[color:var(--color-si-petrole)]"
                      aria-hidden
                    />
                  )}
                  {item.label}
                </span>
                <span className="mt-0.5 block text-[10.5px] opacity-70">{item.description}</span>
              </button>
            ))}
          </div>

          {direction === "oeil-data" && (
            <div className="flex min-w-0 flex-wrap items-end justify-between gap-4">
              <div className="min-w-0">
                <p className="mb-2 text-[10px] font-bold tracking-[.08em] text-[color:var(--color-home-muted)] uppercase">
                  Gabarit
                </p>
                <div className="flex max-w-full gap-2 overflow-x-auto pb-1">
                  {GABARITS.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setGabarit(item.id)}
                      aria-pressed={gabarit === item.id}
                      className={`shrink-0 rounded-full px-4 py-2 text-[12.5px] font-semibold transition-colors ${
                        gabarit === item.id
                          ? "bg-[color:var(--color-home-ink)] text-white"
                          : "bg-[color:var(--color-home-bg-2)] text-[color:var(--color-home-muted-2)] hover:text-[color:var(--color-home-ink)]"
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="shrink-0">
                <p className="mb-2 text-[10px] font-bold tracking-[.08em] text-[color:var(--color-home-muted)] uppercase">
                  Version affichée
                </p>
                <div className="flex rounded-full border border-[color:var(--color-home-line)] bg-[color:var(--color-home-bg-2)] p-1">
                  {(
                    [
                      { id: "fable", label: "Fable" },
                      { id: "codex", label: "Codex" },
                    ] as const
                  ).map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setMoteur(option.id)}
                      aria-pressed={moteur === option.id}
                      className={`min-w-[86px] rounded-full px-4 py-2 text-[12.5px] font-bold transition-colors ${
                        moteur === option.id
                          ? "bg-[color:var(--color-si-petrole)] text-white shadow-[0_2px_8px_rgba(0,88,95,.35)]"
                          : "text-[color:var(--color-home-muted-2)] hover:text-[color:var(--color-home-ink)]"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <main className="mx-auto max-w-[1440px] px-4 pt-8 sm:px-6 md:px-8 md:pt-12">
        {direction === "oeil-data" && (
          <p className="mb-3 px-1 font-mono text-[10px] font-bold tracking-[.16em] text-[color:var(--color-home-muted)] uppercase">
            {moteur === "fable"
              ? "Version Fable — direction G, passe premium"
              : "Version Codex — sélection F du labo /preview/servicimmo"}
          </p>
        )}
        <div className="overflow-hidden rounded-[16px] border border-[color:var(--color-home-line)] bg-white shadow-[0_8px_24px_rgba(15,30,58,.08)]">
          {direction === "oeil-data" &&
            (moteur === "fable"
              ? RENDU_GABARIT[gabarit]()
              : pageCodex && <ServicimmoPreviewSurface page={pageCodex} variant="selection" />)}
          {direction === "oeil" && <DirectionOeil />}
          {direction === "clair-obscur" && <DirectionClairObscur />}
          {direction === "dossier" && <DirectionDossier />}
        </div>
      </main>
    </div>
  );
}
