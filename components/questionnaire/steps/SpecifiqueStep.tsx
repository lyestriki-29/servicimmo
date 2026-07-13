"use client";

import { Chips } from "@/components/questionnaire/components/Chips";
import { Label } from "@/components/questionnaire/components/Label";
import {
  RENTAL_FURNISHED_OPTIONS,
  WORKS_TYPE_OPTIONS,
} from "@/components/questionnaire/lib/options";

import type { StepProps } from "./types";

/** Étape spécifique à la branche : type de bail (location) ou nature des travaux. */
export function SpecifiqueStep({ data, updateData, branch }: StepProps) {
  if (branch === "rental") {
    return (
      <div>
        <Label help="Impacte la Loi Boutin (location vide uniquement).">Type de bail</Label>
        <Chips
          ariaLabel="Type de bail"
          options={RENTAL_FURNISHED_OPTIONS}
          value={data.rental_furnished}
          onChange={(v) => updateData({ rental_furnished: v })}
        />
      </div>
    );
  }
  if (branch === "works") {
    return (
      <div>
        <Label help="Détermine les repérages amiante / plomb avant chantier.">
          Nature des travaux
        </Label>
        <Chips
          ariaLabel="Type de travaux"
          options={WORKS_TYPE_OPTIONS}
          value={data.works_type}
          onChange={(v) => updateData({ works_type: v })}
        />
      </div>
    );
  }
  // Défensif : cette étape n'est générée par getSteps que pour rental/works.
  return null;
}
