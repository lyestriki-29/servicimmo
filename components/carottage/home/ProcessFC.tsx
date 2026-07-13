import { SurtitreFC } from "@/components/carottage/SurtitreFC";
import { Reveal } from "@/components/marketing/Reveal";

const PHASES = [
  {
    code: "P1",
    action: "Prise de brief",
    detail: "Localisation, surface ou linéaire, contraintes.",
    delai: "Sous 24 h",
    livrable: "Devis chiffré",
  },
  {
    code: "P2",
    action: "Carottage sur site",
    detail: "Prélèvements normalisés, balisage, sécurisation.",
    delai: "Sur RDV",
    livrable: "Échantillons référencés",
  },
  {
    code: "P3",
    action: "Analyse laboratoire",
    detail: "Recherche amiante & HAP couche par couche.",
    delai: "Labo accrédité",
    livrable: "Résultats d’analyse",
  },
  {
    code: "P4",
    action: "Restitution",
    detail: "Cartographie des points, préconisations MOE.",
    delai: "—",
    livrable: "Rapport exploitable",
  },
] as const;

/**
 * Section process FC — le déroulé présenté comme le bordereau d'intervention
 * que le client recevra (tableau phase/action/délai/livrable, tampon rouge).
 */
export function ProcessFC() {
  return (
    <section className="border-t-[3px] border-[color:var(--fc-rouge)] bg-[color:var(--fc-noir)]">
      <div className="mx-auto max-w-[var(--container,1280px)] px-6 py-20 md:px-8">
        <SurtitreFC>Comment ça marche</SurtitreFC>
        <h2 className="mt-4 max-w-2xl font-[family-name:var(--font-sora)] text-[30px] font-extrabold leading-tight tracking-[-0.02em] text-white sm:text-[38px]">
          Un process carré, du brief au rapport.
        </h2>
        <Reveal>
          <div className="relative mt-10 overflow-hidden rounded-[4px] bg-[#fdfdfc] px-7 pb-8 pt-6 text-[color:var(--fc-noir)] sm:px-9">
            <div className="flex flex-wrap items-baseline justify-between gap-2 border-b-2 border-[color:var(--fc-noir)] pb-3">
              <span className="font-[family-name:var(--font-sora)] text-[13px] font-bold uppercase tracking-[0.12em]">
                Bordereau d’intervention
              </span>
              <span className="text-[11px] text-[color:var(--fc-gris)]">
                France Carottage — réseau national
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] border-collapse">
                <thead>
                  <tr>
                    {["Phase", "Action", "Délai", "Livrable"].map((th) => (
                      <th
                        key={th}
                        className="pb-1.5 pr-3 pt-3 text-left text-[10.5px] font-bold uppercase tracking-[0.14em] text-[color:var(--fc-gris)]"
                      >
                        {th}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {PHASES.map((p) => (
                    <tr key={p.code}>
                      <td className="whitespace-nowrap border-t border-[color:var(--fc-gris-clair)] py-3 pr-3 font-[family-name:var(--font-sora)] text-[14px] font-extrabold text-[color:var(--fc-rouge)]">
                        {p.code}
                      </td>
                      <td className="border-t border-[color:var(--fc-gris-clair)] py-3 pr-3 text-[13.5px]">
                        <span className="block font-bold">{p.action}</span>
                        <span className="text-[12px] text-[color:var(--fc-gris)]">{p.detail}</span>
                      </td>
                      <td className="border-t border-[color:var(--fc-gris-clair)] py-3 pr-3 align-top text-[13.5px]">
                        {p.delai}
                      </td>
                      <td className="border-t border-[color:var(--fc-gris-clair)] py-3 align-top text-[13.5px]">
                        {p.livrable}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Tampon décoratif */}
            <div
              aria-hidden
              className="pointer-events-none absolute bottom-4 right-5 hidden h-[118px] w-[118px] -rotate-[14deg] place-items-center rounded-full border-[2.5px] border-[color:var(--fc-rouge)]/55 text-center font-[family-name:var(--font-sora)] text-[10px] font-extrabold uppercase leading-[1.5] tracking-[0.14em] text-[color:var(--fc-rouge)]/65 sm:grid"
            >
              France
              <br />
              Carottage
              <br />★ rapport remis ★
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
