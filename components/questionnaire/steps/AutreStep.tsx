"use client";

import { CheckIcon } from "lucide-react";

import { Field } from "@/components/questionnaire/components/Field";
import { Label } from "@/components/questionnaire/components/Label";
import { TEXTAREA_CLASS } from "@/components/questionnaire/lib/options";

import type { StepProps } from "./types";

/**
 * Branche « Autre projet » : description libre + coordonnées + consentement,
 * sur UN écran. Pas de calcul diagnostics/prix — l'équipe recontacte.
 */
export function AutreStep({ data, updateData }: StepProps) {
  return (
    <>
      <div>
        <Label help="Décrivez votre besoin en quelques phrases (10 caractères minimum).">
          Votre besoin
        </Label>
        <textarea
          value={data.notes ?? ""}
          onChange={(e) => updateData({ notes: e.target.value })}
          rows={4}
          maxLength={2000}
          placeholder="Ex : diagnostic avant division de parcelle, mesurage d'un local atypique…"
          className={TEXTAREA_CLASS}
        />
      </div>

      <div>
        <Label>Email</Label>
        <Field
          type="email"
          autoComplete="email"
          inputMode="email"
          value={data.email ?? ""}
          onChange={(e) => updateData({ email: e.target.value })}
          placeholder="vous@exemple.fr"
          aria-label="Email"
        />
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        <div>
          <Label>Prénom</Label>
          <Field
            autoComplete="given-name"
            value={data.first_name ?? ""}
            onChange={(e) => updateData({ first_name: e.target.value })}
            aria-label="Prénom"
          />
        </div>
        <div>
          <Label>Téléphone</Label>
          <Field
            type="tel"
            autoComplete="tel"
            value={data.phone ?? ""}
            onChange={(e) => updateData({ phone: e.target.value })}
            placeholder="06 12 34 56 78"
            aria-label="Téléphone"
          />
        </div>
      </div>

      <label className="flex cursor-pointer items-start gap-2.5 text-[12px] leading-relaxed text-[var(--color-devis-muted)]">
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
          J&apos;accepte que mes données soient utilisées pour ma demande. Pas de spam, vos
          données restent chez nous.
        </span>
      </label>
    </>
  );
}
