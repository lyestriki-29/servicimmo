import { SurtitreFC } from "@/components/carottage/SurtitreFC";
import { Reveal } from "@/components/marketing/Reveal";

const ETAPES = [
  { n: "01", titre: "Prise de brief", texte: "Localisation, surface ou linéaire, délai — devis chiffré sous 24 h." },
  { n: "02", titre: "Carottage sur site", texte: "Prélèvements normalisés par nos techniciens, balisage et sécurisation." },
  { n: "03", titre: "Analyse en laboratoire", texte: "Recherche amiante et HAP par laboratoire accrédité." },
  { n: "04", titre: "Rapport exploitable", texte: "Cartographie des points, résultats et préconisations pour votre MOE." },
] as const;

/** Section process FC — bande noire, grands numéros rouges (langage éditorial FC). */
export function ProcessFC() {
  return (
    <section className="border-t-[3px] border-[color:var(--fc-rouge)] bg-[color:var(--fc-noir)]">
      <div className="mx-auto max-w-[var(--container,1280px)] px-6 py-20 md:px-8">
        <SurtitreFC>Comment ça marche</SurtitreFC>
        <h2 className="mt-4 max-w-2xl font-[family-name:var(--font-sora)] text-[30px] font-extrabold leading-tight tracking-[-0.02em] text-white sm:text-[38px]">
          Un process carré, du brief au rapport.
        </h2>
        <div className="mt-12 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {ETAPES.map((e, i) => (
            <Reveal key={e.n} delay={Math.min(i * 0.08, 0.24)}>
              <div className="border-t border-white/15 pt-5">
                <span className="font-[family-name:var(--font-sora)] text-[40px] font-extrabold text-[color:var(--fc-rouge)]">
                  {e.n}
                </span>
                <h3 className="mt-3 font-[family-name:var(--font-sora)] text-[17px] font-bold text-white">{e.titre}</h3>
                <p className="mt-2 text-[14px] leading-relaxed text-white/60">{e.texte}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
