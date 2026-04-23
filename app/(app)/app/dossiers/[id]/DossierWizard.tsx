"use client";

import { useEffect, useRef, useState, useTransition } from "react";

import { recalculateDossier, saveDossier } from "@/lib/features/dossiers/actions";
import type { DossierInput } from "@/lib/features/dossiers/schema";
import type { ContactRow, DossierRow } from "@/lib/supabase/types";
import type { TechnicienOption } from "@/lib/features/users/queries";

type Props = {
  dossier: DossierRow;
  contacts: ContactRow[];
  techniciens: TechnicienOption[];
};

const PROJECT_TYPES = [
  { value: "sale", label: "Vente" },
  { value: "rental", label: "Location" },
  { value: "works", label: "Travaux" },
  { value: "coownership", label: "Copropriété" },
  { value: "other", label: "Autre" },
] as const;

const PROPERTY_TYPES = [
  { value: "house", label: "Maison" },
  { value: "apartment", label: "Appartement" },
  { value: "building", label: "Immeuble" },
  { value: "commercial", label: "Local commercial" },
  { value: "common_areas", label: "Parties communes" },
  { value: "land", label: "Terrain" },
  { value: "annex", label: "Annexe" },
  { value: "other", label: "Autre" },
] as const;

const PERMIT_RANGES = [
  { value: "before_1949", label: "Avant 1949" },
  { value: "1949_to_1997", label: "1949 - 1997" },
  { value: "after_1997", label: "Après 1997" },
  { value: "unknown", label: "Inconnu" },
] as const;

const HEATING_TYPES = [
  { value: "gas", label: "Gaz" },
  { value: "electric", label: "Électrique" },
  { value: "wood", label: "Bois" },
  { value: "fuel", label: "Fioul" },
  { value: "heat_pump", label: "Pompe à chaleur" },
  { value: "mixed", label: "Mixte" },
  { value: "unknown", label: "Inconnu" },
] as const;

const HEATING_MODES = [
  { value: "individual", label: "Individuel" },
  { value: "collective", label: "Collectif" },
  { value: "unknown", label: "Inconnu" },
] as const;

const ECS_TYPES = [
  { value: "same_as_heating", label: "Identique au chauffage" },
  { value: "electric", label: "Électrique" },
  { value: "gas", label: "Gaz" },
  { value: "solar", label: "Solaire" },
  { value: "other", label: "Autre" },
  { value: "unknown", label: "Inconnu" },
] as const;

const GAS_INSTALLATIONS = [
  { value: "none", label: "Aucune" },
  { value: "city_gas", label: "Gaz de ville" },
  { value: "tank", label: "Cuve/citerne" },
  { value: "bottles", label: "Bouteilles" },
  { value: "meter_no_contract", label: "Compteur sans contrat" },
  { value: "unknown", label: "Inconnu" },
] as const;

const COOKTOP_CONNECTIONS = [
  { value: "souple", label: "Tuyau souple" },
  { value: "rigide", label: "Tuyau rigide" },
  { value: "unknown", label: "Inconnu" },
] as const;

const RENTAL_FURNISHED = [
  { value: "vide", label: "Vide" },
  { value: "meuble", label: "Meublé" },
  { value: "saisonnier", label: "Saisonnier" },
  { value: "unknown", label: "Inconnu" },
] as const;

const DEPENDENCIES = [
  { value: "cave", label: "Cave" },
  { value: "garage", label: "Garage" },
  { value: "atelier", label: "Atelier" },
  { value: "sous_sol", label: "Sous-sol" },
  { value: "combles", label: "Combles" },
] as const;

const EXISTING_DIAGS = [
  { value: "dpe", label: "DPE" },
  { value: "asbestos", label: "Amiante" },
  { value: "lead", label: "Plomb" },
  { value: "electric", label: "Électricité" },
  { value: "gas", label: "Gaz" },
  { value: "termites", label: "Termites" },
  { value: "erp", label: "ERP" },
  { value: "carrez", label: "Carrez" },
  { value: "boutin", label: "Boutin" },
] as const;

/**
 * Wizard "tout-en-un" (édition du draft en place, auto-save debounce 500ms).
 * Parité avec la fiche papier Servicimmo (IMPRIME DEMANDE DE DEVIS / INTERVENTION).
 */
export function DossierWizard({ dossier, contacts, techniciens }: Props) {
  const [form, setForm] = useState<DossierInput>(() => hydrateForm(dossier));
  const [completion, setCompletion] = useState(dossier.completion_rate);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [, startTransition] = useTransition();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auto-save debounce
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setStatus("saving");
      startTransition(async () => {
        const res = await saveDossier(dossier.id, form);
        if (res.ok) {
          setCompletion(res.data.completionRate);
          setStatus("saved");
          setTimeout(() => setStatus("idle"), 1500);
        } else {
          setStatus("error");
        }
      });
    }, 500);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form]);

  const update = <K extends keyof DossierInput>(key: K, value: DossierInput[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const proprietaires = contacts.filter((c) => c.type === "particulier");
  const prescripteurs = contacts.filter((c) => c.type !== "particulier");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Wizard dossier</h2>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-32 overflow-hidden rounded-full bg-neutral-200">
              <div
                className="h-full bg-neutral-900 transition-all"
                style={{ width: `${completion}%` }}
              />
            </div>
            <span className="font-mono text-[11px] text-neutral-500">{completion}%</span>
          </div>
          <SaveIndicator status={status} />
        </div>
      </div>

      {/* ─── Section 1 : Parties prenantes ─── */}
      <Section title="Parties prenantes">
        <div className="grid gap-4 md:grid-cols-3">
          <Select
            label="Propriétaire"
            value={form.proprietaire_id ?? ""}
            options={proprietaires.map((c) => ({
              value: c.id,
              label: contactLabel(c),
            }))}
            onChange={(v) => update("proprietaire_id", v || null)}
          />
          <Select
            label="Prescripteur (de la part de)"
            value={form.prescripteur_id ?? ""}
            options={prescripteurs.map((c) => ({
              value: c.id,
              label: contactLabel(c),
            }))}
            onChange={(v) => update("prescripteur_id", v || null)}
          />
          <Select
            label="Technicien assigné"
            value={form.technicien_id ?? ""}
            options={techniciens.map((t) => ({
              value: t.id,
              label:
                `${t.first_name ?? ""} ${t.last_name ?? ""}`.trim() ||
                t.id.slice(0, 8),
            }))}
            onChange={(v) => update("technicien_id", v || null)}
          />
        </div>
      </Section>

      {/* ─── Section 2 : Projet & bien ─── */}
      <Section title="Projet & bien">
        <div className="grid gap-4 md:grid-cols-2">
          <Select
            label="Type de projet (vente / location)"
            value={form.project_type ?? ""}
            options={PROJECT_TYPES}
            onChange={(v) => update("project_type", v as DossierInput["project_type"])}
          />
          <Select
            label="Type de bien (maison / appartement / autre)"
            value={form.property_type ?? ""}
            options={PROPERTY_TYPES}
            onChange={(v) => update("property_type", v as DossierInput["property_type"])}
          />
          <Text
            label="Adresse du bien"
            value={form.address ?? ""}
            onChange={(v) => update("address", v)}
            className="md:col-span-2"
          />
          <Text
            label="Complément d'adresse"
            value={form.address_line2 ?? ""}
            onChange={(v) => update("address_line2", v)}
            className="md:col-span-2"
          />
          <Text
            label="Code postal"
            value={form.postal_code ?? ""}
            onChange={(v) => update("postal_code", v)}
          />
          <Text
            label="Ville"
            value={form.city ?? ""}
            onChange={(v) => update("city", v)}
          />
          <Number
            label="Surface (m²)"
            value={form.surface}
            onChange={(v) => update("surface", v)}
          />
          <Number
            label="Nombre de pièces (T2, T3…)"
            value={form.rooms_count}
            onChange={(v) => update("rooms_count", v)}
          />
          <Select
            label="Date du permis de construire"
            value={form.permit_date_range ?? ""}
            options={PERMIT_RANGES}
            onChange={(v) =>
              update("permit_date_range", v as DossierInput["permit_date_range"])
            }
          />
          <Text
            label="Date d'achat (YYYY-MM-DD)"
            value={form.purchase_date ?? ""}
            onChange={(v) => update("purchase_date", v)}
          />
          <Text
            label="Références cadastrales"
            value={form.cadastral_reference ?? ""}
            onChange={(v) => update("cadastral_reference", v)}
            className="md:col-span-2"
          />
          <Tristate
            label="Copropriété ?"
            value={form.is_coownership}
            onChange={(v) => update("is_coownership", v)}
          />
          {form.project_type === "rental" ? (
            <Select
              label="Location : meublé / vide"
              value={form.rental_furnished ?? ""}
              options={RENTAL_FURNISHED}
              onChange={(v) =>
                update("rental_furnished", v as DossierInput["rental_furnished"])
              }
            />
          ) : null}
        </div>
      </Section>

      {/* ─── Section 3 : Appartement (si applicable) ─── */}
      {form.property_type === "apartment" ? (
        <Section title="Appartement — détails">
          <div className="grid gap-4 md:grid-cols-2">
            <Text
              label="Nom de la résidence"
              value={form.residence_name ?? ""}
              onChange={(v) => update("residence_name", v)}
              className="md:col-span-2"
            />
            <Number
              label="Étage"
              value={form.floor}
              onChange={(v) => update("floor", v)}
            />
            <Text
              label="Numéro de porte"
              value={form.door_number ?? ""}
              onChange={(v) => update("door_number", v)}
            />
            <Tristate
              label="Dernier étage ?"
              value={form.is_top_floor}
              onChange={(v) => update("is_top_floor", v)}
            />
            <Tristate
              label="Duplex ?"
              value={form.is_duplex}
              onChange={(v) => update("is_duplex", v)}
            />
          </div>
        </Section>
      ) : null}

      {/* ─── Section 4 : Dépendances ─── */}
      <Section title="Dépendances">
        <div className="space-y-4">
          <MultiCheckbox
            label="Présence (cocher)"
            value={form.dependencies ?? []}
            options={DEPENDENCIES}
            onChange={(v) => update("dependencies", v)}
          />
          <Tristate
            label="Aménagées ?"
            value={form.dependencies_converted}
            onChange={(v) => update("dependencies_converted", v)}
          />
        </div>
      </Section>

      {/* ─── Section 5 : Chauffage / ECS / Gaz ─── */}
      <Section title="Chauffage, ECS & gaz">
        <div className="grid gap-4 md:grid-cols-2">
          <Select
            label="Type de chauffage"
            value={form.heating_type ?? ""}
            options={HEATING_TYPES}
            onChange={(v) => update("heating_type", v as DossierInput["heating_type"])}
          />
          <Select
            label="Mode (individuel / collectif)"
            value={form.heating_mode ?? ""}
            options={HEATING_MODES}
            onChange={(v) => update("heating_mode", v as DossierInput["heating_mode"])}
          />
          <Select
            label="ECS (eau chaude sanitaire)"
            value={form.ecs_type ?? ""}
            options={ECS_TYPES}
            onChange={(v) => update("ecs_type", v as DossierInput["ecs_type"])}
          />
          <Select
            label="Installation gaz"
            value={form.gas_installation ?? ""}
            options={GAS_INSTALLATIONS}
            onChange={(v) =>
              update("gas_installation", v as DossierInput["gas_installation"])
            }
          />
          <Select
            label="Table de cuisson : raccordement"
            value={form.cooktop_connection ?? ""}
            options={COOKTOP_CONNECTIONS}
            onChange={(v) =>
              update("cooktop_connection", v as DossierInput["cooktop_connection"])
            }
          />
          <Tristate
            label="Gaz > 15 ans ?"
            value={form.gas_over_15_years}
            onChange={(v) => update("gas_over_15_years", v)}
          />
          <Tristate
            label="Électricité > 15 ans ?"
            value={form.electric_over_15_years}
            onChange={(v) => update("electric_over_15_years", v)}
          />
          {form.heating_mode === "collective" ? (
            <div className="md:col-span-2">
              <label className="mb-1.5 block text-[12px] font-medium text-neutral-700">
                Coordonnées gestionnaire / syndic
              </label>
              <textarea
                value={form.syndic_contact ?? ""}
                onChange={(e) => update("syndic_contact", e.target.value)}
                rows={3}
                className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:border-neutral-900"
              />
            </div>
          ) : null}
        </div>
      </Section>

      {/* ─── Section 6 : Diagnostics existants valides ─── */}
      <Section title="Diagnostics en cours de validité">
        <MultiCheckbox
          label="Cocher les diagnostics existants encore valides"
          value={form.existing_valid_diagnostics ?? []}
          options={EXISTING_DIAGS}
          onChange={(v) => update("existing_valid_diagnostics", v)}
        />
        <p className="mt-2 text-[12px] text-neutral-500">
          ⚠︎ Pour l&apos;amiante, bien préciser et demander l&apos;envoi du diagnostic précédent.
        </p>
      </Section>

      {/* ─── Section 7 : Accès au bien ─── */}
      <Section title="Accès & locataires">
        <div className="grid gap-4 md:grid-cols-2">
          <Tristate
            label="Locataire(s) en place ?"
            value={form.tenants_in_place}
            onChange={(v) => update("tenants_in_place", v)}
          />
          <div className="md:col-span-2">
            <label className="mb-1.5 block text-[12px] font-medium text-neutral-700">
              Notes d&apos;accès (clés, horaires, contact sur place…)
            </label>
            <textarea
              value={form.access_notes ?? ""}
              onChange={(e) => update("access_notes", e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:border-neutral-900"
            />
          </div>
        </div>
      </Section>

      {/* ─── Section 8 : Locaux professionnels (si applicable) ─── */}
      {form.property_type === "commercial" ? (
        <Section title="Locaux professionnels">
          <div className="grid gap-4 md:grid-cols-2">
            <Text
              label="Activité"
              value={form.commercial_activity ?? ""}
              onChange={(v) => update("commercial_activity", v)}
            />
            <Number
              label="Nombre de zones chauffées"
              value={form.heated_zones_count}
              onChange={(v) => update("heated_zones_count", v)}
            />
            <div className="md:col-span-2">
              <label className="mb-1.5 block text-[12px] font-medium text-neutral-700">
                Configuration (plan, subdivisions, usages…)
              </label>
              <textarea
                value={form.configuration_notes ?? ""}
                onChange={(e) => update("configuration_notes", e.target.value)}
                rows={3}
                className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:border-neutral-900"
              />
            </div>
          </div>
        </Section>
      ) : null}

      {/* ─── Section 9 : Planning & notes ─── */}
      <Section title="Planning & notes">
        <div className="grid gap-4 md:grid-cols-2">
          <Text
            label="Urgence (asap, week, month…)"
            value={form.urgency ?? ""}
            onChange={(v) => update("urgency", v)}
          />
          <Text
            label="Date de RDV souhaitée (YYYY-MM-DD)"
            value={form.requested_date ?? ""}
            onChange={(v) => update("requested_date", v)}
          />
          <div className="md:col-span-2">
            <label className="mb-1.5 block text-[12px] font-medium text-neutral-700">
              Informations complémentaires
            </label>
            <textarea
              value={form.notes ?? ""}
              onChange={(e) => update("notes", e.target.value)}
              rows={4}
              className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:border-neutral-900"
            />
          </div>
        </div>
      </Section>

      <div className="flex items-center justify-end gap-2">
        <form
          action={async () => {
            await recalculateDossier(dossier.id);
            window.location.reload();
          }}
        >
          <button
            type="submit"
            className="inline-flex items-center rounded-lg border border-neutral-200 bg-white px-3.5 py-2 text-sm text-neutral-700 hover:border-neutral-400"
          >
            Recalculer diagnostics + prix
          </button>
        </form>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function hydrateForm(d: DossierRow): DossierInput {
  return {
    project_type: d.project_type ?? undefined,
    property_type: (d.property_type as DossierInput["property_type"]) ?? undefined,
    address: d.address ?? undefined,
    address_line2: d.address_line2 ?? undefined,
    postal_code: d.postal_code ?? undefined,
    city: d.city ?? undefined,
    surface: d.surface ?? undefined,
    rooms_count: d.rooms_count ?? undefined,
    is_coownership: d.is_coownership,
    permit_date_range: d.permit_date_range ?? undefined,
    heating_type: (d.heating_type as DossierInput["heating_type"]) ?? undefined,
    heating_mode: d.heating_mode ?? undefined,
    ecs_type: (d.ecs_type as DossierInput["ecs_type"]) ?? undefined,
    gas_installation:
      (d.gas_installation as DossierInput["gas_installation"]) ?? undefined,
    gas_over_15_years: d.gas_over_15_years,
    electric_over_15_years: d.electric_over_15_years,
    rental_furnished:
      (d.rental_furnished as DossierInput["rental_furnished"]) ?? undefined,
    cooktop_connection:
      (d.cooktop_connection as DossierInput["cooktop_connection"]) ?? undefined,
    residence_name: d.residence_name ?? undefined,
    floor: d.floor ?? undefined,
    is_top_floor: d.is_top_floor,
    door_number: d.door_number ?? undefined,
    is_duplex: d.is_duplex,
    dependencies: (d.dependencies as string[] | null) ?? undefined,
    dependencies_converted: d.dependencies_converted,
    cadastral_reference: d.cadastral_reference ?? undefined,
    purchase_date: d.purchase_date ?? undefined,
    commercial_activity: d.commercial_activity ?? undefined,
    heated_zones_count: d.heated_zones_count ?? undefined,
    configuration_notes: d.configuration_notes ?? undefined,
    tenants_in_place: d.tenants_in_place,
    access_notes: d.access_notes ?? undefined,
    syndic_contact: d.syndic_contact ?? undefined,
    proprietaire_id: d.proprietaire_id,
    prescripteur_id: d.prescripteur_id,
    technicien_id: d.technicien_id,
    existing_valid_diagnostics:
      (d.existing_valid_diagnostics as string[] | null) ?? undefined,
    urgency: d.urgency ?? undefined,
    notes: d.notes ?? undefined,
    requested_date: d.requested_date ?? undefined,
  };
}

function contactLabel(c: ContactRow): string {
  const name = [c.first_name, c.last_name].filter(Boolean).join(" ").trim();
  if (c.company_name && name) return `${c.company_name} — ${name}`;
  return c.company_name || name || c.email || c.id.slice(0, 8);
}

// ---------------------------------------------------------------------------
// Sous-composants
// ---------------------------------------------------------------------------

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-neutral-200 bg-white p-5">
      <div className="mb-4 font-mono text-[11px] tracking-widest text-neutral-500">
        {title.toUpperCase()}
      </div>
      {children}
    </section>
  );
}

function SaveIndicator({ status }: { status: "idle" | "saving" | "saved" | "error" }) {
  const label =
    status === "saving"
      ? "Enregistrement…"
      : status === "saved"
        ? "Enregistré"
        : status === "error"
          ? "Erreur"
          : "";
  if (!label) return <div className="h-4 w-16" />;
  return (
    <span
      className={`font-mono text-[10px] tracking-widest ${
        status === "saved"
          ? "text-emerald-700"
          : status === "error"
            ? "text-red-600"
            : "text-neutral-500"
      }`}
    >
      {label.toUpperCase()}
    </span>
  );
}

function Text({
  label,
  value,
  onChange,
  className,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  className?: string;
}) {
  return (
    <label className={`flex flex-col ${className ?? ""}`}>
      <span className="mb-1.5 text-[12px] font-medium text-neutral-700">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:border-neutral-900"
      />
    </label>
  );
}

function Number({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number | undefined;
  onChange: (v: number | undefined) => void;
}) {
  return (
    <label className="flex flex-col">
      <span className="mb-1.5 text-[12px] font-medium text-neutral-700">{label}</span>
      <input
        type="number"
        value={value ?? ""}
        onChange={(e) =>
          onChange(e.target.value === "" ? undefined : globalThis.Number(e.target.value))
        }
        className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:border-neutral-900"
      />
    </label>
  );
}

function Select({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: ReadonlyArray<{ value: string; label: string }>;
  onChange: (v: string) => void;
}) {
  return (
    <label className="flex flex-col">
      <span className="mb-1.5 text-[12px] font-medium text-neutral-700">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:border-neutral-900"
      >
        <option value="">—</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function Tristate({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean | null | undefined;
  onChange: (v: boolean | null) => void;
}) {
  const options = [
    { label: "Oui", v: true },
    { label: "Non", v: false },
    { label: "?", v: null },
  ];
  return (
    <div>
      <span className="mb-1.5 block text-[12px] font-medium text-neutral-700">{label}</span>
      <div className="flex gap-1.5">
        {options.map((opt) => {
          const active = value === opt.v;
          return (
            <button
              key={opt.label}
              type="button"
              onClick={() => onChange(opt.v)}
              className={`rounded-lg border px-3 py-1.5 text-[13px] ${
                active
                  ? "border-neutral-900 bg-neutral-900 text-white"
                  : "border-neutral-200 bg-white text-neutral-700"
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function MultiCheckbox({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string[];
  options: ReadonlyArray<{ value: string; label: string }>;
  onChange: (v: string[]) => void;
}) {
  const toggle = (v: string) => {
    onChange(value.includes(v) ? value.filter((x) => x !== v) : [...value, v]);
  };
  return (
    <div>
      <span className="mb-1.5 block text-[12px] font-medium text-neutral-700">{label}</span>
      <div className="flex flex-wrap gap-1.5">
        {options.map((opt) => {
          const active = value.includes(opt.value);
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => toggle(opt.value)}
              className={`rounded-lg border px-3 py-1.5 text-[13px] ${
                active
                  ? "border-neutral-900 bg-neutral-900 text-white"
                  : "border-neutral-200 bg-white text-neutral-700"
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
