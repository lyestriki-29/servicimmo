import { PlayIcon } from "lucide-react";

import { SurtitreFC } from "@/components/carottage/SurtitreFC";
import { Reveal } from "@/components/marketing/Reveal";

/** Vidéo de présentation du réseau, reprise du site FC actuel. */
const VIDEO_URL = "https://www.youtube.com/watch?v=BWNV-klFWzY";

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

/** Section pédagogie FC — bande noire : pourquoi carotter, définitions amiante/HAP, vidéo. */
export function PedagogieFC() {
  return (
    <section className="border-t-[3px] border-[color:var(--fc-rouge)] bg-[color:var(--fc-noir)]">
      <div className="mx-auto max-w-[var(--container,1280px)] px-6 py-16 md:px-8">
        <SurtitreFC>Comprendre l’enjeu</SurtitreFC>
        <h2 className="mt-4 max-w-2xl font-[family-name:var(--font-sora)] text-[30px] font-extrabold leading-tight tracking-[-0.02em] text-white sm:text-[38px]">
          Pourquoi carotter avant de raboter ?
        </h2>
        <div className="mt-8 grid items-start gap-10 lg:grid-cols-[1.1fr_1fr]">
          <Reveal direction="left">
            <p className="max-w-xl text-[15px] leading-relaxed text-white/70">
              Avant toute intervention sur un ouvrage de voirie — maintenance, réfection,
              démolition — la réglementation impose de vérifier la présence d’amiante et de HAP
              dans les couches d’enrobés. Un repérage bien mené protège vos équipes, sécurise
              juridiquement le maître d’ouvrage et évite l’arrêt de chantier.
            </p>
            <a
              href={VIDEO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="group mt-6 inline-flex items-center gap-3 text-[13px] font-semibold text-white/70 transition-colors hover:text-white"
            >
              <span
                aria-hidden
                className="grid h-9 w-9 place-items-center rounded-full bg-[color:var(--fc-rouge)] transition-transform group-hover:scale-110"
              >
                <PlayIcon className="h-4 w-4 fill-white text-white" />
              </span>
              Découvrir France Carottage en vidéo
            </a>
          </Reveal>
          <Reveal direction="right" delay={0.12}>
            <div className="grid gap-4">
              {DEFINITIONS.map((d) => (
                <div
                  key={d.titre}
                  className="border border-white/15 border-l-[3px] border-l-[color:var(--fc-rouge)] p-5"
                >
                  <h3 className="font-[family-name:var(--font-sora)] text-[15px] font-bold text-white">
                    {d.titre}
                  </h3>
                  <p className="mt-1.5 text-[13.5px] leading-relaxed text-white/62">{d.texte}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
