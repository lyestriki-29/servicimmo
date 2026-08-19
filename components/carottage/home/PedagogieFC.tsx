import { PlayIcon } from "lucide-react";

import { Reveal } from "@/components/marketing/Reveal";

/** Vidéo de présentation du réseau, reprise du site FC actuel. */
const VIDEO_URL = "https://www.youtube.com/watch?v=BWNV-klFWzY";

/** Les 3 enjeux, distillés du texte réglementaire (aucun fait ajouté). */
const ENJEUX = [
  {
    titre: "Protéger vos équipes",
    texte: "Les travaux sur enrobés génèrent des poussières : amiante et HAP doivent être repérés avant.",
  },
  {
    titre: "Sécuriser le maître d’ouvrage",
    texte: "Le repérage préalable est une obligation réglementaire — il couvre juridiquement le donneur d’ordre.",
  },
  {
    titre: "Éviter l’arrêt de chantier",
    texte: "Une découverte en cours de travaux stoppe tout ; un repérage mené en amont l’évite.",
  },
] as const;

const DEFINITIONS = [
  {
    titre: "Amiante dans les enrobés",
    texte:
      "Utilisé jusqu’en 1997 dans certaines couches de roulement. Sa recherche est obligatoire avant travaux générant des poussières.",
  },
  {
    titre: "HAP — hydrocarbures aromatiques polycycliques",
    texte:
      "Polluants persistants issus des liants bitumineux anciens. Leur teneur détermine la filière d’évacuation des fraisats.",
  },
] as const;

/**
 * Section pédagogie FC — bande encre centrée dans le langage de la section
 * Métier : la question, les 3 enjeux du repérage, définitions amiante/HAP en
 * réglette mono au pied.
 */
export function PedagogieFC() {
  return (
    <section className="border-t-[3px] border-[color:var(--fc-rouge)] bg-[color:var(--fc-noir)]">
      <div className="mx-auto max-w-[var(--container,1280px)] px-6 py-16 md:px-8 md:py-20">
        <Reveal className="text-center">
          <p className="inline-flex items-center gap-3 font-[family-name:var(--font-sora)] text-[12px] font-bold uppercase tracking-[0.2em] text-[#e9a4a6]">
            <span aria-hidden className="h-[2px] w-8 bg-[#e9a4a6]" />
            Comprendre l’enjeu
            <span aria-hidden className="h-[2px] w-8 bg-[#e9a4a6]" />
          </p>
          <h2 className="mx-auto mt-4 max-w-3xl font-[family-name:var(--font-sora)] text-[clamp(30px,3.8vw,48px)] font-extrabold leading-tight tracking-[-0.02em] text-white">
            Pourquoi carotter avant de raboter ?
          </h2>
        </Reveal>
        <div className="mt-14 grid gap-y-10 sm:grid-cols-3 sm:divide-x sm:divide-white/12">
          {ENJEUX.map((e, i) => (
            <Reveal key={e.titre} delay={Math.min(i * 0.09, 0.18)}>
              <div className="text-center sm:px-10 lg:px-16">
                <span className="font-[family-name:var(--font-sora)] text-[clamp(38px,4vw,52px)] font-extrabold leading-none text-[color:var(--fc-rouge)]">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-4 font-[family-name:var(--font-sora)] text-[18px] font-bold text-white">
                  {e.titre}
                </h3>
                <p className="mx-auto mt-3 max-w-[34ch] text-[14px] leading-relaxed text-white/60">
                  {e.texte}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
        <div className="mt-14 text-center">
          <a
            href={VIDEO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-3 text-[13px] font-semibold text-white/70 transition-colors hover:text-white"
          >
            <span
              aria-hidden
              className="grid h-9 w-9 place-items-center rounded-full bg-[color:var(--fc-rouge)] transition-transform group-hover:scale-110"
            >
              <PlayIcon className="h-4 w-4 fill-white text-white" />
            </span>
            Découvrir France Carottage en vidéo
          </a>
        </div>
      </div>
      <div className="border-t border-white/12">
        <div className="mx-auto flex max-w-[var(--container,1280px)] flex-col gap-x-12 gap-y-2 px-6 py-4 font-mono text-[11px] leading-relaxed tracking-[0.04em] text-white/45 md:flex-row md:px-8">
          {DEFINITIONS.map((d) => (
            <p key={d.titre} className="flex-1">
              <span className="text-[#e9a4a6]">{d.titre} — </span>
              {d.texte}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}
