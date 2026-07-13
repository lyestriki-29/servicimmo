"use client";

import { ChipsMulti } from "@/components/questionnaire/components/ChipsMulti";
import { Field } from "@/components/questionnaire/components/Field";
import { Label } from "@/components/questionnaire/components/Label";
import { RadioRow } from "@/components/questionnaire/components/RadioRow";
import {
  booleanToTriState,
  triStateToBoolean,
  type TriState,
} from "@/components/questionnaire/lib/field-mapping";
import {
  DEPENDENCIES_OPTIONS,
  TEXTAREA_CLASS,
  TRISTATE_COMPACT_OPTIONS,
} from "@/components/questionnaire/lib/options";

import type { StepProps } from "./types";

/** Sections conditionnelles de l'étape « Le bien » (appartement / local pro / dépendances / cadastre). */
export function BienStepExtras({ data, updateData }: StepProps) {
  const dependencies = data.dependencies ?? [];
  const toggleDependency = (v: (typeof DEPENDENCIES_OPTIONS)[number]["value"]) => {
    const next = dependencies.includes(v)
      ? dependencies.filter((x) => x !== v)
      : [...dependencies, v];
    updateData({ dependencies: next });
  };

  return (
    <>
      {data.property_type === "apartment" ? (
        <div className="flex flex-col gap-3 rounded-[12px] border border-[var(--color-devis-line)] bg-white/60 p-4">
          <div className="font-mono text-[11px] tracking-[0.1em] text-[var(--color-devis-muted)]">
            PRÉCISIONS APPARTEMENT
          </div>
          <div>
            <Label>Nom de la résidence</Label>
            <Field
              value={data.residence_name ?? ""}
              onChange={(e) => updateData({ residence_name: e.target.value })}
              placeholder="Résidence des Tilleuls"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Étage</Label>
              <Field
                type="number"
                inputMode="numeric"
                min={-5}
                max={100}
                value={data.floor ?? ""}
                onChange={(e) => {
                  const v = e.target.value === "" ? undefined : Number(e.target.value);
                  updateData({ floor: v });
                }}
                placeholder="3"
              />
            </div>
            <div>
              <Label>N° de porte</Label>
              <Field
                value={data.door_number ?? ""}
                onChange={(e) => updateData({ door_number: e.target.value })}
                placeholder="12B"
              />
            </div>
          </div>
          <div>
            <Label>Dernier étage ?</Label>
            <RadioRow
              ariaLabel="Dernier étage"
              options={TRISTATE_COMPACT_OPTIONS}
              value={booleanToTriState(data.is_top_floor)}
              onChange={(v: TriState) => updateData({ is_top_floor: triStateToBoolean(v) })}
            />
          </div>
          <div>
            <Label>Duplex ?</Label>
            <RadioRow
              ariaLabel="Duplex"
              options={TRISTATE_COMPACT_OPTIONS}
              value={booleanToTriState(data.is_duplex)}
              onChange={(v: TriState) => updateData({ is_duplex: triStateToBoolean(v) })}
            />
          </div>
        </div>
      ) : null}

      {data.property_type === "commercial" ? (
        <div className="flex flex-col gap-3 rounded-[12px] border border-[var(--color-devis-line)] bg-white/60 p-4">
          <div className="font-mono text-[11px] tracking-[0.1em] text-[var(--color-devis-muted)]">
            LOCAL PROFESSIONNEL
          </div>
          <div>
            <Label>Activité exercée</Label>
            <Field
              value={data.commercial_activity ?? ""}
              onChange={(e) => updateData({ commercial_activity: e.target.value })}
              placeholder="Bureau, commerce, restaurant…"
            />
          </div>
          <div>
            <Label>Nombre de zones chauffées</Label>
            <Field
              type="number"
              inputMode="numeric"
              min={0}
              max={50}
              value={data.heated_zones_count ?? ""}
              onChange={(e) => {
                const v = e.target.value === "" ? undefined : Number(e.target.value);
                updateData({ heated_zones_count: v });
              }}
              placeholder="2"
            />
          </div>
          <div>
            <Label help="Configuration du local, accès spécifiques, horaires d'ouverture…">
              Configuration (optionnel)
            </Label>
            <textarea
              value={data.configuration_notes ?? ""}
              onChange={(e) => updateData({ configuration_notes: e.target.value })}
              rows={2}
              maxLength={2000}
              className={TEXTAREA_CLASS}
            />
          </div>
        </div>
      ) : null}

      <div>
        <Label help="Cave, garage, atelier… Cochez celles qui existent (optionnel).">
          Dépendances
        </Label>
        <ChipsMulti
          ariaLabel="Dépendances"
          options={DEPENDENCIES_OPTIONS}
          values={dependencies}
          onToggle={toggleDependency}
        />
        {dependencies.length > 0 ? (
          <div className="mt-2">
            <Label>Aménagées (pièces à vivre) ?</Label>
            <RadioRow
              ariaLabel="Dépendances aménagées"
              options={TRISTATE_COMPACT_OPTIONS}
              value={booleanToTriState(data.dependencies_converted)}
              onChange={(v: TriState) =>
                updateData({ dependencies_converted: triStateToBoolean(v) })
              }
            />
          </div>
        ) : null}
      </div>

      <div>
        <Label help="Sur votre taxe foncière ou cadastre.gouv.fr (optionnel).">
          Référence cadastrale
        </Label>
        <Field
          value={data.cadastral_reference ?? ""}
          onChange={(e) => updateData({ cadastral_reference: e.target.value })}
          placeholder="Ex : AB 123"
        />
      </div>
    </>
  );
}
