import { Building2Icon, RouteIcon, WavesIcon } from "lucide-react";

import { SurtitreFC } from "@/components/carottage/SurtitreFC";
import { Reveal } from "@/components/marketing/Reveal";

const DOMAINES = [
  {
    icone: RouteIcon,
    titre: "Voirie & chaussées",
    texte:
      "Carottage d'enrobés et repérage amiante/HAP avant rabotage, réfection ou élargissement de chaussée.",
  },
  {
    icone: WavesIcon,
    titre: "Réseaux & tranchées",
    texte:
      "Prélèvements ciblés avant terrassement pour la pose ou la reprise de réseaux enterrés.",
  },
  {
    icone: Building2Icon,
    titre: "Bâtiment & parkings",
    texte:
      "Diagnostic des enrobés de dalles, parkings et abords avant démolition ou rénovation lourde.",
  },
] as const;

/** Section métier FC — 3 domaines, cartes noir/blanc à liseré rouge au hover. */
export function MetierFC() {
  return (
    <section className="mx-auto max-w-[var(--container,1280px)] px-6 py-20 md:px-8">
      <SurtitreFC>Notre métier</SurtitreFC>
      <h2 className="mt-4 max-w-2xl font-[family-name:var(--font-sora)] text-[30px] font-extrabold leading-tight tracking-[-0.02em] text-[color:var(--fc-noir)] sm:text-[38px]">
        Le carottage d’enrobés, sur tous vos chantiers.
      </h2>
      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {DOMAINES.map((d, i) => {
          const Icone = d.icone;
          return (
            <Reveal key={d.titre} delay={Math.min(i * 0.08, 0.24)}>
              <article className="group h-full border-t-2 border-[color:var(--fc-gris-clair)] bg-white p-7 transition-colors hover:border-[color:var(--fc-rouge)]">
                <Icone className="h-8 w-8 text-[color:var(--fc-rouge)]" aria-hidden />
                <h3 className="mt-5 font-[family-name:var(--font-sora)] text-[19px] font-bold text-[color:var(--fc-noir)]">
                  {d.titre}
                </h3>
                <p className="mt-3 text-[14.5px] leading-relaxed text-[color:var(--fc-gris)]">{d.texte}</p>
              </article>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
