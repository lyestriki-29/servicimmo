"use client";

import { Chips } from "@/components/questionnaire/components/Chips";
import { Field } from "@/components/questionnaire/components/Field";
import { Label } from "@/components/questionnaire/components/Label";
import { RadioRow } from "@/components/questionnaire/components/RadioRow";
import {
  PERMIT_UI_OPTIONS,
  booleanToTriState,
  permitStoreToUI,
  permitUIToStore,
  triStateToBoolean,
  type PermitUIValue,
  type TriState,
} from "@/components/questionnaire/lib/field-mapping";
import {
  COOKTOP_OPTIONS,
  ECS_OPTIONS,
  GAS_INSTALLATION_OPTIONS,
  HEATING_MODE_OPTIONS,
  HEATING_OPTIONS,
  TRISTATE_COMPACT_OPTIONS,
} from "@/components/questionnaire/lib/options";
import type { QuestionnaireData } from "@/lib/stores/questionnaire";

import type { StepProps } from "./types";

const hasGas = (d: QuestionnaireData) =>
  !!d.gas_installation && d.gas_installation !== "none" && d.gas_installation !== "unknown";

/** Étape « Le bâti » — année de construction + chauffage/gaz/élec. */
export function BatiStep({ data, updateData }: StepProps) {
  return (
    <>
      <div>
        <Label help="Cette date détermine les risques plomb et amiante.">
          Date du permis de construire
        </Label>
        <RadioRow
          ariaLabel="Date du permis de construire"
          options={PERMIT_UI_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
          value={permitStoreToUI(data.permit_date_range)}
          onChange={(v: PermitUIValue) => updateData({ permit_date_range: permitUIToStore(v) })}
          columns={4}
        />
      </div>

      <div>
        <Label help="Le collectif déclenche des diagnostics spécifiques en copropriété.">
          Mode de chauffage
        </Label>
        <Chips
          ariaLabel="Mode de chauffage"
          options={HEATING_MODE_OPTIONS}
          value={data.heating_mode}
          onChange={(v) => updateData({ heating_mode: v })}
        />
      </div>

      <div>
        <Label>Type de chauffage</Label>
        <Chips
          ariaLabel="Type de chauffage"
          options={HEATING_OPTIONS}
          value={data.heating_type}
          onChange={(v) => updateData({ heating_type: v })}
        />
      </div>

      <div>
        <Label>Eau chaude sanitaire</Label>
        <Chips
          ariaLabel="Eau chaude sanitaire"
          options={ECS_OPTIONS}
          value={data.ecs_type}
          onChange={(v) => updateData({ ecs_type: v })}
        />
      </div>

      <div>
        <Label>Installation gaz</Label>
        <Chips
          ariaLabel="Installation gaz"
          options={GAS_INSTALLATION_OPTIONS}
          value={data.gas_installation}
          onChange={(v) => updateData({ gas_installation: v })}
        />
      </div>

      {hasGas(data) ? (
        <div>
          <Label>Raccordement de la table de cuisson</Label>
          <RadioRow
            ariaLabel="Raccordement table de cuisson"
            options={COOKTOP_OPTIONS}
            value={data.cooktop_connection}
            onChange={(v) =>
              updateData({ cooktop_connection: v as "souple" | "rigide" | "unknown" })
            }
          />
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label>Installation gaz de plus de 15 ans ?</Label>
          <RadioRow
            ariaLabel="Installation gaz de plus de 15 ans"
            options={TRISTATE_COMPACT_OPTIONS}
            value={booleanToTriState(data.gas_over_15_years)}
            onChange={(v: TriState) => updateData({ gas_over_15_years: triStateToBoolean(v) })}
          />
        </div>
        <div>
          <Label>Installation élec de plus de 15 ans ?</Label>
          <RadioRow
            ariaLabel="Installation électrique de plus de 15 ans"
            options={TRISTATE_COMPACT_OPTIONS}
            value={booleanToTriState(data.electric_over_15_years)}
            onChange={(v: TriState) =>
              updateData({ electric_over_15_years: triStateToBoolean(v) })
            }
          />
        </div>
      </div>

      <div>
        <Label help="Si différente du permis de construire — optionnel.">
          Date d&apos;achat (optionnel)
        </Label>
        <Field
          type="date"
          value={data.purchase_date ?? ""}
          onChange={(e) => updateData({ purchase_date: e.target.value })}
        />
      </div>
    </>
  );
}
