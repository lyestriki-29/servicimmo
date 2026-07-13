"use client";

import { AddressAutocomplete } from "@/components/questionnaire/components/AddressAutocomplete";
import { Chips } from "@/components/questionnaire/components/Chips";
import { Field } from "@/components/questionnaire/components/Field";
import { Label } from "@/components/questionnaire/components/Label";
import { RadioRow } from "@/components/questionnaire/components/RadioRow";
import {
  booleanToTriState,
  triStateToBoolean,
  type TriState,
} from "@/components/questionnaire/lib/field-mapping";
import { PROPERTY_TYPE_OPTIONS, TRISTATE_OPTIONS } from "@/components/questionnaire/lib/options";

import { BienStepExtras } from "./BienStepExtras";
import type { StepProps } from "./types";

/** Étape « Le bien » — layout plat, tout visible (fini les sous-blocs repliables). */
export function BienStep({ data, updateData, branch }: StepProps) {
  return (
    <>
      <div>
        <Label>Type de bien</Label>
        <Chips
          ariaLabel="Type de bien"
          options={PROPERTY_TYPE_OPTIONS}
          value={data.property_type}
          onChange={(value) => updateData({ property_type: value })}
        />
      </div>

      <div>
        <Label help="Commencez à taper, nous remplissons le code postal et la ville automatiquement.">
          Adresse du bien
        </Label>
        <AddressAutocomplete
          address={data.address ?? ""}
          postalCode={data.postal_code ?? ""}
          city={data.city ?? ""}
          onSelect={({ address, postalCode, city }) =>
            updateData({ address, postal_code: postalCode, city })
          }
          onManualChange={(v) => updateData({ address: v, postal_code: "", city: "" })}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Surface</Label>
          <Field
            type="number"
            inputMode="numeric"
            min={1}
            max={10000}
            suffix="m²"
            value={data.surface ?? ""}
            onChange={(e) => {
              const v = e.target.value === "" ? undefined : Number(e.target.value);
              updateData({ surface: v });
            }}
            placeholder="92"
            aria-label="Surface en m²"
          />
        </div>
        <div>
          <Label>Nombre de pièces</Label>
          <Field
            type="number"
            inputMode="numeric"
            min={1}
            max={20}
            value={data.rooms_count ?? ""}
            onChange={(e) => {
              const v = e.target.value === "" ? undefined : Number(e.target.value);
              updateData({ rooms_count: v });
            }}
            placeholder="4"
            aria-label="Nombre de pièces"
          />
        </div>
      </div>

      <div>
        <Label>Le bien est-il en copropriété ?</Label>
        <RadioRow
          ariaLabel="Copropriété"
          options={TRISTATE_OPTIONS}
          value={booleanToTriState(data.is_coownership)}
          onChange={(v: TriState) => updateData({ is_coownership: triStateToBoolean(v) })}
        />
      </div>

      <BienStepExtras data={data} updateData={updateData} branch={branch} />
    </>
  );
}
