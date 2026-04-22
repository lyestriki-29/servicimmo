"use client";

import { useActionState, useState } from "react";
import { useRouter } from "next/navigation";

import type { ActionResult } from "@/lib/features/action-result";
import { createContact } from "@/lib/features/contacts/actions";

const INITIAL: ActionResult<{ id: string }> | null = null;

const TYPE_OPTIONS = [
  { value: "particulier", label: "Particulier" },
  { value: "agence", label: "Agence" },
  { value: "notaire", label: "Notaire" },
  { value: "syndic", label: "Syndic" },
  { value: "autre", label: "Autre" },
] as const;

export function ContactForm() {
  const router = useRouter();
  const [state, action, pending] = useActionState(createContact, INITIAL);
  const [type, setType] = useState<string>("particulier");

  const isPrescripteur = type !== "particulier";

  // Navigation après succès (useActionState renvoie `data.id` sur ok).
  if (state?.ok) {
    router.push(`/app/contacts/${state.data.id}`);
  }

  return (
    <form action={action} className="grid gap-6 md:grid-cols-2">
      <section className="md:col-span-2">
        <Label>Type de contact</Label>
        <select
          name="type"
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="w-full max-w-xs rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm"
        >
          {TYPE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </section>

      {isPrescripteur ? (
        <section className="md:col-span-2">
          <Field
            label="Raison sociale"
            name="company_name"
            required
            error={state?.ok === false ? state.fieldErrors?.company_name : undefined}
          />
          <Field label="SIRET" name="siret" placeholder="14 chiffres" />
        </section>
      ) : null}

      <section>
        <Label>Civilité</Label>
        <select
          name="civility"
          className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm"
        >
          <option value="">—</option>
          <option value="mr">M.</option>
          <option value="mme">Mme</option>
          <option value="other">Autre</option>
        </select>
      </section>

      <div />

      <Field
        label="Prénom"
        name="first_name"
        error={state?.ok === false ? state.fieldErrors?.first_name : undefined}
      />
      <Field
        label="Nom"
        name="last_name"
        error={state?.ok === false ? state.fieldErrors?.last_name : undefined}
      />

      <Field
        label="Email"
        name="email"
        type="email"
        error={state?.ok === false ? state.fieldErrors?.email : undefined}
      />
      <Field label="Téléphone" name="phone" />

      <Field label="Téléphone secondaire" name="phone_alt" />
      <div />

      <Field label="Adresse (ligne 1)" name="address_line1" />
      <Field label="Adresse (ligne 2)" name="address_line2" />
      <Field label="Code postal" name="postal_code" />
      <Field label="Ville" name="city" />

      <section className="md:col-span-2">
        <Label>Notes</Label>
        <textarea
          name="notes"
          rows={3}
          className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm"
        />
      </section>

      <section className="md:col-span-2">
        <Label>Tags (séparés par des virgules)</Label>
        <input
          name="tags"
          className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm"
          placeholder="premium, fidèle, agence-XYZ"
        />
      </section>

      {state?.ok === false && state.error ? (
        <p role="alert" className="md:col-span-2 text-sm text-red-600">
          {state.error}
        </p>
      ) : null}

      <div className="md:col-span-2 flex items-center gap-2">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center rounded-lg bg-neutral-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-60"
        >
          {pending ? "Création…" : "Créer le contact"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-lg border border-neutral-200 bg-white px-4 py-2.5 text-sm text-neutral-700 hover:border-neutral-400"
        >
          Annuler
        </button>
      </div>
    </form>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-1.5 text-[12px] font-medium text-neutral-700">{children}</div>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
  placeholder,
  error,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  error?: string;
}) {
  return (
    <label className="flex flex-col">
      <Label>{label}</Label>
      <input
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:border-neutral-900"
      />
      {error ? <span className="mt-1 text-[11px] text-red-600">{error}</span> : null}
    </label>
  );
}
