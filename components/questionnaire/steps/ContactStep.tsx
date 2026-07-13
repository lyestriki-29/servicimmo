"use client";

import { LockIcon } from "lucide-react";

import { Field } from "@/components/questionnaire/components/Field";
import { Label } from "@/components/questionnaire/components/Label";

import type { StepProps } from "./types";

/**
 * Étape « Vos coordonnées » — capture email + prénom + téléphone AVANT les
 * dernières étapes (décision #1) : un abandon tardif laisse un lead
 * exploitable (relance J+1).
 */
export function ContactStep({ data, updateData }: StepProps) {
  return (
    <>
      <div>
        <Label help="Pour vous envoyer le récapitulatif et votre estimation.">Email</Label>
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

      <div>
        <Label>Prénom</Label>
        <Field
          autoComplete="given-name"
          value={data.first_name ?? ""}
          onChange={(e) => updateData({ first_name: e.target.value })}
          placeholder="Marie"
          aria-label="Prénom"
        />
      </div>

      <div>
        <Label help="Numéro joignable pour caler le rendez-vous.">Téléphone</Label>
        <Field
          type="tel"
          autoComplete="tel"
          value={data.phone ?? ""}
          onChange={(e) => updateData({ phone: e.target.value })}
          placeholder="06 12 34 56 78"
          aria-label="Téléphone"
        />
      </div>

      <p className="font-mono text-[11px] tracking-[0.08em] text-[var(--color-devis-muted)]">
        <LockIcon className="mr-1.5 inline h-2.5 w-2.5 align-middle" aria-hidden />
        données chiffrées · rgpd · pas de spam
      </p>
    </>
  );
}
