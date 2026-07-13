"use client";

import { ArrowRightIcon, CheckIcon, LockIcon, PencilIcon } from "lucide-react";

import type { StepId } from "@/lib/questionnaire/steps";
import type { QuestionnaireData } from "@/lib/stores/questionnaire";

import { Field } from "./Field";
import { Label } from "./Label";
import { RadioRow } from "./RadioRow";

const CIVILITY_OPTIONS = [
  { value: "mr", label: "M." },
  { value: "mme", label: "Mme" },
  { value: "other", label: "Autre" },
] as const;

const PAYMENT_METHOD_OPTIONS = [
  { value: "cb", label: "Carte bancaire" },
  { value: "chq", label: "Chèque" },
  { value: "esp", label: "Espèces" },
  { value: "virt", label: "Virement" },
] as const;

type FinalizeFormProps = {
  data: QuestionnaireData;
  updateData: (patch: QuestionnaireData) => void;
  onEdit: (id: StepId) => void;
  submitting: boolean;
  error: string | null;
  onSubmit: (e: React.FormEvent) => void;
};

/** Formulaire final du récap : identité restante + consentement + envoi. */
export function FinalizeForm({
  data,
  updateData,
  onEdit,
  submitting,
  error,
  onSubmit,
}: FinalizeFormProps) {
  return (
    <form
      onSubmit={onSubmit}
      aria-labelledby="contact-title"
      className="rounded-[18px] border border-[var(--color-devis-line)] bg-white p-5 sm:p-6"
    >
      <h2
        id="contact-title"
        className="mb-1 font-serif text-[19px] font-medium text-[var(--color-devis-ink)]"
      >
        Vos coordonnées
      </h2>
      <p className="mb-4 text-[13px] text-[var(--color-devis-muted)]">
        On vous rappelle sous 2 h ouvrées.
      </p>

      {/* Résumé du contact déjà capturé à l'étape « Vos coordonnées » */}
      <button
        type="button"
        onClick={() => onEdit("contact")}
        className="mb-4 flex w-full items-center gap-2 rounded-[10px] border border-[var(--color-devis-line)] bg-[var(--color-devis-cream)] px-3 py-2.5 text-left text-[13px] text-[var(--color-devis-ink)] hover:border-[var(--branch-fg)]/50"
      >
        <span className="min-w-0 flex-1 truncate">
          {data.first_name} · {data.email} · {data.phone}
        </span>
        <PencilIcon className="h-3.5 w-3.5 flex-none text-[var(--color-devis-muted)]" aria-hidden />
      </button>

      <div className="flex flex-col gap-3">
        <div>
          <Label>Civilité</Label>
          <RadioRow
            ariaLabel="Civilité"
            options={CIVILITY_OPTIONS}
            value={data.civility}
            onChange={(v) => updateData({ civility: v })}
          />
        </div>
        <div>
          <Label>Nom</Label>
          <Field
            autoComplete="family-name"
            value={data.last_name ?? ""}
            onChange={(e) => updateData({ last_name: e.target.value })}
            aria-label="Nom"
          />
        </div>
        <div>
          <Label help="Pour information — non bloquant.">
            Mode de règlement préféré (optionnel)
          </Label>
          <RadioRow
            ariaLabel="Mode de règlement"
            options={PAYMENT_METHOD_OPTIONS}
            value={data.preferred_payment_method}
            onChange={(v) =>
              updateData({ preferred_payment_method: v as "cb" | "chq" | "esp" | "virt" })
            }
            columns={4}
          />
        </div>

        <label className="mt-1 flex cursor-pointer items-start gap-2.5 text-[12px] leading-relaxed text-[var(--color-devis-muted)]">
          <input
            type="checkbox"
            checked={data.consent_rgpd ?? false}
            onChange={(e) => updateData({ consent_rgpd: e.target.checked })}
            className="sr-only"
            aria-label="Consentement RGPD"
          />
          <span
            aria-hidden
            className={[
              "mt-0.5 flex h-4 w-4 flex-none items-center justify-center rounded border-[1.5px]",
              data.consent_rgpd
                ? "border-[var(--branch-fg)] bg-[var(--branch-fg)] text-white"
                : "border-[var(--color-devis-line)] bg-white",
            ].join(" ")}
          >
            {data.consent_rgpd ? <CheckIcon className="h-2.5 w-2.5" /> : null}
          </span>
          <span>
            J&apos;accepte que mes données soient utilisées pour ma demande de devis. Pas de
            spam, vos données restent chez nous.
          </span>
        </label>

        <button
          type="submit"
          disabled={submitting}
          className={[
            "mt-1.5 inline-flex items-center justify-center gap-2 rounded-[12px] px-4 py-4 text-[15px] font-medium text-white transition-opacity",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--branch-fg)]/50",
            submitting
              ? "cursor-not-allowed bg-[var(--branch-fg)]/60"
              : "bg-[var(--branch-fg)] hover:opacity-90",
          ].join(" ")}
        >
          {submitting ? "Envoi…" : "Envoyer ma demande"}
          {!submitting ? <ArrowRightIcon className="h-4 w-4" aria-hidden /> : null}
        </button>

        {error ? (
          <p role="alert" className="text-center text-[12px] text-amber-700">
            {error}
          </p>
        ) : null}

        <div className="text-center font-mono text-[11px] tracking-[0.08em] text-[var(--color-devis-muted)]">
          <LockIcon className="mr-1.5 inline h-2.5 w-2.5 align-middle" aria-hidden />
          données chiffrées · rgpd
        </div>
      </div>
    </form>
  );
}
