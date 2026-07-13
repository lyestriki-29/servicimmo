"use client";

import { useActionState, useEffect, useState } from "react";

import { soumettreDevis } from "@/app/carottage/devis/actions";
import { LIBELLES_CHANTIER, LIBELLES_DELAI, type DevisState } from "@/app/carottage/devis/schema";

const CHANTIERS = Object.entries(LIBELLES_CHANTIER) as [keyof typeof LIBELLES_CHANTIER, string][];
const DELAIS = Object.entries(LIBELLES_DELAI) as [keyof typeof LIBELLES_DELAI, string][];

const champClasses =
  "w-full rounded-[4px] border border-[color:var(--fc-gris-clair)] bg-white px-3.5 py-2.5 text-[14.5px] text-[color:var(--fc-noir)] outline-none focus:border-[color:var(--fc-rouge)]";
const labelClasses = "block text-[13px] font-semibold text-[color:var(--fc-noir)]";

export function DevisFormFC() {
  const [state, formAction, pending] = useActionState<DevisState, FormData>(soumettreDevis, {
    status: "idle",
  });
  // Posé à l'hydratation (le rendu doit rester pur) — sert au délai anti-bot côté action.
  const [renderedAt, setRenderedAt] = useState(0);
  const [unite, setUnite] = useState<"surface" | "lineaire">("surface");

  useEffect(() => {
    setRenderedAt(Date.now());
  }, []);

  const err = (champ: string) =>
    state.status === "error" ? state.fieldErrors?.[champ] : undefined;

  if (state.status === "success") {
    return (
      <div className="rounded-[6px] border-l-4 border-[color:var(--fc-rouge)] bg-white p-8">
        <h2 className="font-[family-name:var(--font-sora)] text-[22px] font-extrabold text-[color:var(--fc-noir)]">
          Demande envoyée.
        </h2>
        <p className="mt-3 text-[15px] text-[color:var(--fc-gris)]">
          Merci ! Nous revenons vers vous avec un devis chiffré sous 24 h ouvrées.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="grid gap-5">
      {/* Honeypot (masqué visuellement + a11y) */}
      <input
        type="text"
        name="site"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden
        className="absolute left-[-9999px] h-0 w-0 opacity-0"
      />
      <input type="hidden" name="renderedAt" value={renderedAt} />

      <div>
        <span className={labelClasses}>Type de chantier</span>
        <div className="mt-2 grid gap-2 sm:grid-cols-3">
          {CHANTIERS.map(([val, lib], i) => (
            <label
              key={val}
              className="flex cursor-pointer items-center gap-2 rounded-[4px] border border-[color:var(--fc-gris-clair)] bg-white px-3 py-2.5 text-[13.5px] font-semibold has-[:checked]:border-[color:var(--fc-rouge)] has-[:checked]:text-[color:var(--fc-rouge)]"
            >
              <input
                type="radio"
                name="typeChantier"
                value={val}
                defaultChecked={i === 0}
                className="accent-[color:var(--fc-rouge)]"
              />
              {lib}
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className={labelClasses} htmlFor="localisation">
          Localisation (ville + code postal)
        </label>
        <input id="localisation" name="localisation" className={`mt-1.5 ${champClasses}`} placeholder="Orléans (45000)" />
        {err("localisation") && (
          <p className="mt-1 text-[12.5px] text-[color:var(--fc-rouge)]">{err("localisation")}</p>
        )}
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <span className={labelClasses}>Unité</span>
          <div className="mt-2 flex gap-2">
            {(["surface", "lineaire"] as const).map((u) => (
              <label
                key={u}
                className="flex cursor-pointer items-center gap-2 rounded-[4px] border border-[color:var(--fc-gris-clair)] bg-white px-3 py-2.5 text-[13.5px] font-semibold has-[:checked]:border-[color:var(--fc-rouge)]"
              >
                <input
                  type="radio"
                  name="uniteMesure"
                  value={u}
                  checked={unite === u}
                  onChange={() => setUnite(u)}
                  className="accent-[color:var(--fc-rouge)]"
                />
                {u === "surface" ? "Surface (m²)" : "Linéaire (ml)"}
              </label>
            ))}
          </div>
        </div>
        <div>
          <label className={labelClasses} htmlFor="quantiteEstimee">
            {unite === "surface" ? "Surface estimée (m²)" : "Linéaire estimé (ml)"}
          </label>
          <input id="quantiteEstimee" name="quantiteEstimee" type="number" min={1} className={`mt-1.5 ${champClasses}`} placeholder="250" />
          {err("quantiteEstimee") && (
            <p className="mt-1 text-[12.5px] text-[color:var(--fc-rouge)]">{err("quantiteEstimee")}</p>
          )}
        </div>
      </div>

      <div>
        <label className={labelClasses} htmlFor="delai">
          Délai souhaité
        </label>
        <select id="delai" name="delai" className={`mt-1.5 ${champClasses}`} defaultValue="sous-1-mois">
          {DELAIS.map(([val, lib]) => (
            <option key={val} value={val}>
              {lib}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className={labelClasses} htmlFor="entreprise">
            Entreprise
          </label>
          <input id="entreprise" name="entreprise" className={`mt-1.5 ${champClasses}`} />
          {err("entreprise") && (
            <p className="mt-1 text-[12.5px] text-[color:var(--fc-rouge)]">{err("entreprise")}</p>
          )}
        </div>
        <div>
          <label className={labelClasses} htmlFor="nom">
            Nom du contact
          </label>
          <input id="nom" name="nom" className={`mt-1.5 ${champClasses}`} />
          {err("nom") && <p className="mt-1 text-[12.5px] text-[color:var(--fc-rouge)]">{err("nom")}</p>}
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className={labelClasses} htmlFor="emailPro">
            Email professionnel
          </label>
          <input id="emailPro" name="emailPro" type="email" className={`mt-1.5 ${champClasses}`} />
          {err("emailPro") && (
            <p className="mt-1 text-[12.5px] text-[color:var(--fc-rouge)]">{err("emailPro")}</p>
          )}
        </div>
        <div>
          <label className={labelClasses} htmlFor="telephone">
            Téléphone
          </label>
          <input id="telephone" name="telephone" className={`mt-1.5 ${champClasses}`} />
          {err("telephone") && (
            <p className="mt-1 text-[12.5px] text-[color:var(--fc-rouge)]">{err("telephone")}</p>
          )}
        </div>
      </div>

      <div>
        <label className={labelClasses} htmlFor="message">
          Message (facultatif)
        </label>
        <textarea id="message" name="message" rows={4} className={`mt-1.5 ${champClasses}`} />
      </div>

      {state.status === "error" && (
        <p className="text-[13.5px] font-semibold text-[color:var(--fc-rouge)]">{state.error}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="inline-flex items-center justify-center rounded-[4px] bg-[color:var(--fc-rouge)] px-7 py-4 font-[family-name:var(--font-sora)] text-[14.5px] font-bold uppercase tracking-wide text-white transition-colors hover:bg-[color:var(--fc-rouge-fonce)] disabled:opacity-60"
      >
        {pending ? "Envoi…" : "Envoyer ma demande"}
      </button>
    </form>
  );
}
