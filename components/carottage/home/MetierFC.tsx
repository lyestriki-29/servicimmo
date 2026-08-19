import { Reveal } from "@/components/marketing/Reveal";

/**
 * Section métier FC — « Marquage routier » : la chaussée vue du dessus. 3 voies
 * centrées sur un même bitume sombre, séparées par des lignes peintes
 * discontinues ; chaque voie porte SON marquage au sol (flèche = voirie, zone
 * hachurée = tranchée, place = parking). Bande de signalisation rouge/noir en
 * tête.
 */
const DOMAINES = [
  {
    contexte: "Voirie",
    titre: "Voirie & chaussées",
    texte:
      "Carottage d'enrobés et repérage amiante/HAP avant rabotage, réfection ou élargissement de chaussée.",
  },
  {
    contexte: "Tranchée",
    titre: "Réseaux & tranchées",
    texte: "Prélèvements ciblés avant terrassement pour la pose ou la reprise de réseaux enterrés.",
  },
  {
    contexte: "Bâtiment",
    titre: "Bâtiment & parkings",
    texte: "Diagnostic des enrobés de dalles, parkings et abords avant démolition ou rénovation lourde.",
  },
] as const;

const LIGNE_PEINTE: React.CSSProperties = {
  backgroundImage:
    "repeating-linear-gradient(180deg, rgba(245,244,242,0.8) 0 18px, transparent 18px 34px)",
};

const PEINTURE = "rgba(245,244,242,0.85)";

/** Marquage « sens de circulation » — voirie & chaussées. */
function MarquageFleche() {
  return (
    <svg viewBox="0 0 24 34" className="h-8 w-auto" aria-hidden>
      <path d="M12 0 21 12 15 12 15 34 9 34 9 12 3 12 Z" fill={PEINTURE} />
    </svg>
  );
}

/** Marquage « zone de travaux » hachurée — réseaux & tranchées. */
function MarquageHachures() {
  return (
    <svg viewBox="0 0 52 34" className="h-8 w-auto" aria-hidden>
      <g stroke={PEINTURE} strokeWidth="5">
        <line x1="4" y1="34" x2="16" y2="0" />
        <line x1="20" y1="34" x2="32" y2="0" />
        <line x1="36" y1="34" x2="48" y2="0" />
      </g>
    </svg>
  );
}

/** Marquage « place au sol » — bâtiment & parkings. */
function MarquagePlace() {
  return (
    <svg viewBox="0 0 34 34" className="h-8 w-auto" aria-hidden>
      <path d="M2 34 2 2 32 2 32 34" fill="none" stroke={PEINTURE} strokeWidth="4" />
      <text x="17" y="26" textAnchor="middle" fontSize="17" fontWeight="800" fill={PEINTURE} fontFamily="var(--font-sora), sans-serif">
        P
      </text>
    </svg>
  );
}

const MARQUAGES = [MarquageFleche, MarquageHachures, MarquagePlace] as const;

export function MetierFC() {
  return (
    <section
      className="relative"
      style={{
        background: "#1c1b18",
        backgroundImage: "radial-gradient(rgba(255,255,255,0.05) 1px, transparent 1px)",
        backgroundSize: "6px 6px",
      }}
    >
      <div
        aria-hidden
        className="h-1.5"
        style={{
          backgroundImage:
            "repeating-linear-gradient(-45deg, var(--fc-rouge) 0 14px, #111113 14px 28px)",
        }}
      />
      <div className="mx-auto max-w-[var(--container,1280px)] px-6 py-11 md:px-8">
        <Reveal className="text-center">
          <p className="inline-flex items-center gap-3 font-[family-name:var(--font-sora)] text-[12px] font-bold uppercase tracking-[0.2em] text-[#e9a4a6]">
            <span aria-hidden className="h-[2px] w-8 bg-[#e9a4a6]" />
            Notre métier
            <span aria-hidden className="h-[2px] w-8 bg-[#e9a4a6]" />
          </p>
          <h2 className="mx-auto mt-3 max-w-xl font-[family-name:var(--font-sora)] text-[26px] font-extrabold leading-tight tracking-[-0.02em] text-[#f5f4f2] sm:text-[32px]">
            Le carottage d’enrobés, sur tous vos chantiers.
          </h2>
          <p className="mt-3 font-mono text-[10.5px] uppercase tracking-[0.14em] text-[rgba(245,244,242,0.45)]">
            Prélèvements Ø 52 mm — labo accrédité
          </p>
        </Reveal>

        <div className="mt-9 flex flex-col md:flex-row">
          {DOMAINES.map((d, i) => {
            const Marquage = MARQUAGES[i] ?? MarquageFleche;
            return (
              <div key={d.titre} className="flex flex-1 flex-col md:flex-row">
                {i > 0 && (
                  <>
                    <div aria-hidden className="hidden w-[4px] shrink-0 md:block" style={LIGNE_PEINTE} />
                    <div
                      aria-hidden
                      className="my-6 h-[4px] md:hidden"
                      style={{
                        backgroundImage:
                          "repeating-linear-gradient(90deg, rgba(245,244,242,0.8) 0 18px, transparent 18px 34px)",
                      }}
                    />
                  </>
                )}
                <Reveal className="flex-1" delay={Math.min(i * 0.09, 0.18)}>
                  <article className="group text-center md:px-8">
                    <div className="flex justify-center opacity-80 transition-opacity duration-300 group-hover:opacity-100">
                      <Marquage />
                    </div>
                    <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.16em] text-[rgba(245,244,242,0.4)]">
                      {d.contexte}
                    </p>
                    <h3 className="mt-2 font-[family-name:var(--font-sora)] text-[17px] font-extrabold uppercase tracking-[0.05em] text-[#f5f4f2]">
                      {d.titre}
                    </h3>
                    <p className="mx-auto mt-2 max-w-[36ch] text-[13px] leading-relaxed text-[rgba(245,244,242,0.58)]">
                      {d.texte}
                    </p>
                  </article>
                </Reveal>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
