import type { RequiredDiagnostic } from "@/lib/core/diagnostics/types";

import { DiagnosticRow } from "./DiagnosticRow";

type DiagnosticsListProps = {
  required: RequiredDiagnostic[];
  toClarify: RequiredDiagnostic[];
};

/** Liste des diagnostics obligatoires + encart « à valider sur place ». */
export function DiagnosticsList({ required, toClarify }: DiagnosticsListProps) {
  return (
    <section
      aria-labelledby="diagnostics-title"
      className="rounded-[18px] border border-[var(--color-devis-line)] bg-white p-5 sm:p-6"
    >
      <div className="mb-3.5 flex items-baseline justify-between">
        <h2
          id="diagnostics-title"
          className="font-serif text-[19px] font-medium text-[var(--color-devis-ink)]"
        >
          Vos diagnostics obligatoires
        </h2>
        <span className="font-mono text-[12px] text-[var(--color-devis-muted)]">
          {required.length} identifiés
        </span>
      </div>
      <div className="flex flex-col">
        {required.map((d, i) => (
          <DiagnosticRow key={d.id} index={i} name={d.name} reason={d.reason} isFirst={i === 0} />
        ))}
      </div>

      {toClarify.length > 0 ? (
        <div className="mt-5 rounded-[12px] border border-dashed border-[var(--color-devis-line)] bg-[var(--color-devis-cream)] p-4">
          <div className="mb-1.5 font-mono text-[11px] tracking-[0.1em] text-[var(--color-devis-muted)]">
            À VALIDER SUR PLACE
          </div>
          <div className="text-[13px] leading-relaxed text-[var(--color-devis-ink)]">
            Vous avez répondu «&nbsp;je ne sais pas&nbsp;» à certaines questions : l&apos;expert
            confirme ces diagnostics lors de la visite.
            <ul className="mt-2 ml-4 list-disc text-[var(--color-devis-muted)]">
              {toClarify.map((d) => (
                <li key={d.id}>{d.name}</li>
              ))}
            </ul>
          </div>
        </div>
      ) : null}
    </section>
  );
}
