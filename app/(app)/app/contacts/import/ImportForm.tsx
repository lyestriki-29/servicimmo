"use client";

import { useActionState } from "react";

import type { ActionResult } from "@/lib/features/action-result";
import { importContactsCsv } from "@/lib/features/contacts/actions";

const INITIAL: ActionResult<{ imported: number; skipped: number; errors: number }> | null = null;

export function ImportForm() {
  const [state, action, pending] = useActionState(importContactsCsv, INITIAL);

  return (
    <form action={action} className="flex flex-col gap-4">
      <div>
        <label className="mb-1.5 block text-[12px] font-medium text-neutral-700">
          Fichier CSV
        </label>
        <input
          type="file"
          name="file"
          accept=".csv,text/csv"
          required
          className="block w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-neutral-900 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-white"
        />
      </div>

      <p className="text-[12px] text-neutral-500">
        Colonnes attendues : <code>type, first_name, last_name, company_name, email, phone, postal_code, city</code>.
        La colonne <code>type</code> doit prendre l&apos;une des valeurs : particulier,
        agence, notaire, syndic, autre.
      </p>

      {state?.ok ? (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">
          <strong>{state.data.imported}</strong> contact(s) importé(s).
          {state.data.skipped > 0 ? ` ${state.data.skipped} doublon(s) ignoré(s).` : ""}
          {state.data.errors > 0 ? ` ${state.data.errors} ligne(s) en erreur.` : ""}
        </div>
      ) : null}

      {state?.ok === false && state.error ? (
        <p role="alert" className="text-sm text-red-600">
          {state.error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="inline-flex items-center self-start rounded-lg bg-neutral-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-60"
      >
        {pending ? "Import en cours…" : "Importer"}
      </button>
    </form>
  );
}
