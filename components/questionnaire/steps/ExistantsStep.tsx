"use client";

import { ChipsMulti } from "@/components/questionnaire/components/ChipsMulti";
import { EXISTING_DIAGS_OPTIONS } from "@/components/questionnaire/lib/options";

import type { StepProps } from "./types";

/** Étape facultative « Diagnostics déjà valides » — jamais bloquante. */
export function ExistantsStep({ data, updateData }: StepProps) {
  const existingDiags = data.existing_valid_diagnostics ?? [];
  const toggleExisting = (v: (typeof EXISTING_DIAGS_OPTIONS)[number]["value"]) => {
    const next = existingDiags.includes(v)
      ? existingDiags.filter((x) => x !== v)
      : [...existingDiags, v];
    updateData({ existing_valid_diagnostics: next });
  };

  return (
    <>
      <p className="text-[13px] text-[var(--color-devis-muted)]">
        Cochez les diagnostics que vous avez déjà et qui sont encore valides. Nous les
        exclurons du devis (économie réelle). Si vous n&apos;en avez aucun, continuez.
      </p>
      <ChipsMulti
        ariaLabel="Diagnostics déjà valides"
        options={EXISTING_DIAGS_OPTIONS}
        values={existingDiags}
        onToggle={toggleExisting}
      />
      {existingDiags.includes("asbestos") || existingDiags.includes("lead") ? (
        <div className="rounded-[10px] border border-dashed border-[var(--color-devis-line)] bg-white/60 p-3 text-[12px] text-[var(--color-devis-muted)]">
          Amiante et plomb : merci d&apos;envoyer le diagnostic existant par email après
          soumission ; sinon le technicien le refait sur place.
        </div>
      ) : null}
    </>
  );
}
