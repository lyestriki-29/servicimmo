import Image from "next/image";
import { ArrowRightIcon, BadgeCheckIcon } from "lucide-react";

import { GoogleMapEmbed } from "@/components/marketing/pages/GoogleMapEmbed";

import { AMBOISE, CONTROLES } from "./claude-directions-data";

const SOMMAIRE = [
  "Objet du dossier",
  "Contrôles requis",
  "Annexe A — secteur",
  "Ouvrir votre dossier",
] as const;

export function DirectionDossier() {
  return (
    <div className="bg-[color:var(--color-si-creme)] py-10 lg:py-16">
      <div className="mx-auto max-w-[1100px] px-6 md:px-8">
        {/* Bordereau d’en-tête */}
        <header className="border-y-2 border-[color:var(--color-home-ink)]">
          <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-1 border-b border-[color:var(--color-home-ink)]/25 py-2.5 font-mono text-[10.5px] font-bold tracking-[.14em] text-[color:var(--color-home-ink)] uppercase">
            <span>
              Dossier nº VI-{AMBOISE.codePostal} — Commune d’{AMBOISE.nom}
            </span>
            <span>Servicimmo · Tours</span>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-1 py-2.5 font-mono text-[10.5px] tracking-[.14em] text-[color:var(--color-home-muted-2)] uppercase">
            <span>Diagnostic immobilier réglementaire</span>
            <span>Établi en juillet 2026</span>
          </div>
        </header>

        {/* Pièce nº 1 : titre + pièce jointe photographique + tampon */}
        <section className="relative mt-12 grid gap-10 lg:grid-cols-[210px_minmax(0,1fr)]">
          <aside className="hidden lg:block">
            <p className="font-mono text-[10.5px] font-bold tracking-[.18em] text-[color:var(--color-home-ink)] uppercase">
              Sommaire
            </p>
            <ol className="mt-4 space-y-3 border-t border-[color:var(--color-home-ink)]/20 pt-4">
              {SOMMAIRE.map((entree, index) => (
                <li
                  key={entree}
                  className="flex gap-3 font-mono text-[11px] leading-snug text-[color:var(--color-home-muted-2)]"
                >
                  <span className="font-bold text-[color:var(--color-si-petrole)]">
                    {index + 1}.
                  </span>
                  {entree}
                </li>
              ))}
            </ol>
          </aside>
          <div>
            <span className="absolute top-0 right-0 hidden rotate-[-7deg] rounded-full border-2 border-[color:var(--color-si-petrole)]/70 px-5 py-3 font-mono text-[10px] font-bold tracking-[.18em] text-[color:var(--color-si-petrole)]/80 uppercase md:inline-flex md:items-center md:gap-2">
              <BadgeCheckIcon className="h-4 w-4" aria-hidden /> Techniciens certifiés
            </span>
            <p className="font-mono text-[11px] font-bold tracking-[.18em] text-[color:var(--color-si-petrole)] uppercase">
              Pièce nº 1 — Objet du dossier
            </p>
            <h1 className="mt-4 max-w-[640px] font-[family-name:var(--font-sora)] text-[clamp(36px,4.6vw,62px)] leading-[1.03] font-extrabold tracking-[-0.035em] text-balance text-[color:var(--color-home-ink)]">
              Diagnostic immobilier à {AMBOISE.nom}
            </h1>
            <p className="mt-6 max-w-[64ch] text-[15.5px] leading-[1.75] text-[color:var(--color-home-muted-2)]">
              Le présent dossier détaille les contrôles réglementaires applicables aux biens de la
              commune d’{AMBOISE.nom} ({AMBOISE.codePostal}) en cas de vente, de mise en location ou
              de travaux. Les interventions sont conduites depuis notre agence de Tours, située à{" "}
              {AMBOISE.distanceKm} km, sous un délai habituel de {AMBOISE.delai}.
            </p>
            <figure className="mt-9 inline-block border border-[color:var(--color-home-ink)]/20 bg-white p-3 shadow-[0_3px_10px_rgba(15,30,58,.08)]">
              <Image
                src="/img/si/claude/amboise-panorama.jpg"
                alt={`Vue générale d’${AMBOISE.nom} : château royal, ville basse et pont sur la Loire`}
                width={640}
                height={380}
                className="h-[300px] w-full max-w-[640px] object-cover"
              />
              <figcaption className="pt-3 font-mono text-[10px] tracking-[.14em] text-[color:var(--color-home-muted-2)] uppercase">
                Fig. 1 — Vue générale : château royal, ville basse, pont sur la Loire.
              </figcaption>
            </figure>
          </div>
        </section>

        {/* Pièce nº 2 : bordereau des contrôles */}
        <section className="mt-16">
          <p className="font-mono text-[11px] font-bold tracking-[.18em] text-[color:var(--color-si-petrole)] uppercase">
            Pièce nº 2 — Contrôles requis selon votre projet
          </p>
          <div className="mt-5 border-y-2 border-[color:var(--color-home-ink)]">
            <div className="hidden grid-cols-[90px_240px_minmax(0,1fr)] gap-6 border-b border-[color:var(--color-home-ink)]/25 py-2.5 font-mono text-[10px] font-bold tracking-[.16em] text-[color:var(--color-home-muted-2)] uppercase md:grid">
              <span>Réf.</span>
              <span>Contrôle</span>
              <span>Observation locale</span>
            </div>
            {CONTROLES.map((controle) => (
              <div
                key={controle.ref}
                className="grid gap-x-6 gap-y-1 border-b border-[color:var(--color-home-ink)]/15 py-4 transition-colors last:border-b-0 hover:bg-white/70 md:grid-cols-[90px_240px_minmax(0,1fr)]"
              >
                <span className="font-mono text-[12px] font-bold text-[color:var(--color-si-petrole)]">
                  {controle.ref}-37
                </span>
                <h3 className="font-[family-name:var(--font-sora)] text-[14.5px] font-bold text-[color:var(--color-home-ink)]">
                  {controle.titre}
                </h3>
                <p className="text-[13px] leading-relaxed text-[color:var(--color-home-muted-2)]">
                  {controle.note}
                </p>
              </div>
            ))}
          </div>
          <p className="mt-3 text-right font-mono text-[10px] tracking-[.14em] text-[color:var(--color-home-muted)] uppercase">
            Liste indicative — le devis précise les contrôles réellement requis
          </p>
        </section>

        {/* Annexe A : carte */}
        <section className="mt-16">
          <p className="font-mono text-[11px] font-bold tracking-[.18em] text-[color:var(--color-si-petrole)] uppercase">
            Annexe A — Secteur d’intervention
          </p>
          <div className="mt-5 border border-[color:var(--color-home-ink)]/25 bg-white p-2">
            <div className="h-[400px] overflow-hidden">
              <GoogleMapEmbed
                query={`${AMBOISE.nom} ${AMBOISE.codePostal}, France`}
                zoom={12}
                title={`Carte du secteur d’intervention à ${AMBOISE.nom}`}
              />
            </div>
          </div>
          <p className="mt-3 font-mono text-[10.5px] leading-relaxed tracking-[.06em] text-[color:var(--color-home-muted-2)] uppercase">
            Communes rattachées : {AMBOISE.communesVoisines.join(" — ")}
          </p>
        </section>

        {/* Signature + ouverture de dossier */}
        <section className="mt-16 grid gap-8 md:grid-cols-[1fr_minmax(0,420px)]">
          <div className="flex flex-col justify-end pb-2">
            <p className="text-[13.5px] text-[color:var(--color-home-muted-2)]">
              Fait à Tours, pour la commune d’{AMBOISE.nom}.
            </p>
            <div className="mt-8 h-px w-64 bg-[color:var(--color-home-ink)]/40" />
            <p className="mt-2 font-mono text-[10px] tracking-[.16em] text-[color:var(--color-home-muted)] uppercase">
              L’équipe Servicimmo — cabinet fondé en 1998
            </p>
          </div>
          <div className="bg-[color:var(--color-home-ink)] p-8 text-white">
            <p className="font-mono text-[10.5px] font-bold tracking-[.18em] text-[color:var(--color-si-lime)] uppercase">
              Pièce nº 4
            </p>
            <h2 className="mt-3 font-[family-name:var(--font-sora)] text-[24px] leading-tight font-extrabold">
              Ouvrir votre dossier
            </h2>
            <p className="mt-3 text-[13.5px] leading-relaxed text-white/70">
              Décrivez votre bien en 2 minutes : nous établissons la liste exacte des contrôles et
              votre devis sous 2 h ouvrées.
            </p>
            <a
              href="/devis"
              className="mt-6 inline-flex min-h-12 items-center gap-2 rounded-full bg-[color:var(--color-si-lime)] px-6 text-[13.5px] font-bold text-[color:var(--color-home-ink)] transition-transform hover:-translate-y-0.5"
            >
              Constituer mon dossier <ArrowRightIcon className="h-4 w-4" aria-hidden />
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}
