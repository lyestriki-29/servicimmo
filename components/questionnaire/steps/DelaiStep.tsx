"use client";

import { Chips } from "@/components/questionnaire/components/Chips";
import { Field } from "@/components/questionnaire/components/Field";
import { Label } from "@/components/questionnaire/components/Label";
import { RadioRow } from "@/components/questionnaire/components/RadioRow";
import {
  booleanToTriState,
  triStateToBoolean,
  type TriState,
} from "@/components/questionnaire/lib/field-mapping";
import {
  REFERRAL_OPTIONS,
  TEXTAREA_CLASS,
  TRISTATE_OPTIONS,
  URGENCY_OPTIONS,
} from "@/components/questionnaire/lib/options";

import type { StepProps } from "./types";

/** Étape « Délai & accès » — urgence (requise) + infos d'accès facultatives. */
export function DelaiStep({ data, updateData }: StepProps) {
  return (
    <>
      <div>
        <Label>Dans quel délai ?</Label>
        <RadioRow
          ariaLabel="Urgence"
          options={URGENCY_OPTIONS}
          value={data.urgency}
          onChange={(v) => updateData({ urgency: v })}
          columns={5}
        />
      </div>

      <div>
        <Label help="Horaires d'accès, contact gardien, digicode, présence animaux… (optionnel)">
          Accès au bien
        </Label>
        <textarea
          value={data.access_notes ?? ""}
          onChange={(e) => updateData({ access_notes: e.target.value })}
          rows={2}
          maxLength={1000}
          placeholder="Accès libre, clés chez le gardien au 2e étage…"
          className={TEXTAREA_CLASS}
        />
      </div>

      <div>
        <Label>Locataire(s) en place ? (optionnel)</Label>
        <RadioRow
          ariaLabel="Locataire en place"
          options={TRISTATE_OPTIONS}
          value={booleanToTriState(data.tenants_in_place)}
          onChange={(v: TriState) => updateData({ tenants_in_place: triStateToBoolean(v) })}
        />
      </div>

      {data.heating_mode === "collective" ? (
        <div>
          <Label help="Nécessaire pour le DPE collectif (optionnel).">
            Coordonnées du syndic
          </Label>
          <textarea
            value={data.syndic_contact ?? ""}
            onChange={(e) => updateData({ syndic_contact: e.target.value })}
            rows={2}
            maxLength={500}
            placeholder="Cabinet Dupont, 02 47 00 00 00"
            className={TEXTAREA_CLASS}
          />
        </div>
      ) : null}

      <div>
        <Label help="Facultatif — précisez un créneau, un contexte particulier…">
          Notes complémentaires
        </Label>
        <textarea
          value={data.notes ?? ""}
          onChange={(e) => updateData({ notes: e.target.value })}
          rows={3}
          maxLength={2000}
          placeholder="Un accès particulier, un créneau précis…"
          className={TEXTAREA_CLASS}
        />
      </div>

      <div>
        <Label>Comment nous avez-vous trouvés ? (optionnel)</Label>
        <Chips
          ariaLabel="Source du contact"
          options={REFERRAL_OPTIONS}
          value={data.referral_source}
          onChange={(v) => updateData({ referral_source: v })}
        />
        {data.referral_source === "autre" ? (
          <div className="mt-2">
            <Field
              value={data.referral_other ?? ""}
              onChange={(e) => updateData({ referral_other: e.target.value })}
              placeholder="Précisez…"
            />
          </div>
        ) : null}
      </div>
    </>
  );
}
