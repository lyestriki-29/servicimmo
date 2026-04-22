"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { createRendezVous } from "@/lib/features/agenda/actions";
import type { RendezVousInput } from "@/lib/features/agenda/schema";

export function RdvForm({ dossierId }: { dossierId?: string }) {
  const router = useRouter();
  const [form, setForm] = useState<Partial<RendezVousInput>>({
    title: "",
    starts_at: "",
    ends_at: "",
    dossier_id: dossierId ?? null,
  });
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const submit = () => {
    if (!form.title || !form.starts_at || !form.ends_at) {
      setError("Titre, début et fin sont requis.");
      return;
    }
    setError(null);
    startTransition(async () => {
      const res = await createRendezVous(form as RendezVousInput);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      router.push("/app/agenda");
      router.refresh();
    });
  };

  const upd = <K extends keyof RendezVousInput>(key: K, value: RendezVousInput[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  return (
    <div className="grid max-w-3xl gap-4">
      <Field label="Titre">
        <input
          value={form.title ?? ""}
          onChange={(e) => upd("title", e.target.value)}
          className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:border-neutral-900"
        />
      </Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Début">
          <input
            type="datetime-local"
            value={form.starts_at ?? ""}
            onChange={(e) => upd("starts_at", e.target.value)}
            className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm"
          />
        </Field>
        <Field label="Fin">
          <input
            type="datetime-local"
            value={form.ends_at ?? ""}
            onChange={(e) => upd("ends_at", e.target.value)}
            className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm"
          />
        </Field>
      </div>
      <Field label="Adresse du RDV">
        <input
          value={form.address ?? ""}
          onChange={(e) => upd("address", e.target.value)}
          className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm"
        />
      </Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Code postal">
          <input
            value={form.postal_code ?? ""}
            onChange={(e) => upd("postal_code", e.target.value)}
            className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm"
          />
        </Field>
        <Field label="Ville">
          <input
            value={form.city ?? ""}
            onChange={(e) => upd("city", e.target.value)}
            className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm"
          />
        </Field>
      </div>
      <Field label="Notes">
        <textarea
          value={form.notes ?? ""}
          onChange={(e) => upd("notes", e.target.value)}
          rows={3}
          className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm"
        />
      </Field>
      {error ? (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      ) : null}
      <div>
        <button
          type="button"
          onClick={submit}
          disabled={pending}
          className="inline-flex items-center rounded-lg bg-neutral-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-60"
        >
          {pending ? "Enregistrement…" : "Créer le RDV"}
        </button>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col">
      <span className="mb-1.5 text-[12px] font-medium text-neutral-700">{label}</span>
      {children}
    </label>
  );
}
