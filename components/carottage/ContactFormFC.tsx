"use client";

import { useActionState, useEffect, useRef } from "react";

import { soumettreContact } from "@/app/carottage/contact/actions";
import type { ContactState } from "@/app/carottage/contact/schema";

const CHAMP =
  "w-full border-0 bg-white/[0.05] px-4 py-3.5 text-[14px] text-white placeholder:text-white/40 outline-none ring-1 ring-white/10 transition-shadow focus:ring-2 focus:ring-[color:var(--fc-rouge)]";

/** Formulaire de contact FC — envoi via Brevo (Server Action), anti-bot honeypot + délai. */
export function ContactFormFC() {
  const [state, formAction, pending] = useActionState<ContactState, FormData>(soumettreContact, {
    status: "idle",
  });
  // Horodatage anti-bot posé à l'hydratation via le DOM : le rendu reste pur.
  const renderedAtRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (renderedAtRef.current) renderedAtRef.current.value = String(Date.now());
  }, []);

  const err = (champ: string) => (state.status === "error" ? state.fieldErrors?.[champ] : undefined);

  if (state.status === "success") {
    return (
      <div className="border-l-[3px] border-[color:var(--fc-rouge)] bg-white/[0.05] p-8">
        <h2 className="font-[family-name:var(--font-sora)] text-[22px] font-extrabold text-white">
          Message envoyé.
        </h2>
        <p className="mt-3 text-[14.5px] leading-relaxed text-white/65">
          Merci ! Notre équipe vous répond sous 24 h ouvrées.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="grid gap-4">
      {/* Honeypot (masqué visuellement + a11y) */}
      <input
        type="text"
        name="site"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden
        className="absolute left-[-9999px] h-0 w-0 opacity-0"
      />
      <input ref={renderedAtRef} type="hidden" name="renderedAt" defaultValue="0" />

      <div>
        <label className="sr-only" htmlFor="contact-nom">
          Votre nom
        </label>
        <input id="contact-nom" name="nom" type="text" placeholder="Votre nom" className={CHAMP} />
        {err("nom") && <p className="mt-1.5 text-[12.5px] text-[#e9a4a6]">{err("nom")}</p>}
      </div>

      <div>
        <label className="sr-only" htmlFor="contact-email">
          Votre email
        </label>
        <input
          id="contact-email"
          name="email"
          type="email"
          placeholder="Votre email"
          className={CHAMP}
        />
        {err("email") && <p className="mt-1.5 text-[12.5px] text-[#e9a4a6]">{err("email")}</p>}
      </div>

      <div>
        <label className="sr-only" htmlFor="contact-sujet">
          Sujet
        </label>
        <input id="contact-sujet" name="sujet" type="text" placeholder="Sujet" className={CHAMP} />
        {err("sujet") && <p className="mt-1.5 text-[12.5px] text-[#e9a4a6]">{err("sujet")}</p>}
      </div>

      <div>
        <label className="sr-only" htmlFor="contact-message">
          Votre message
        </label>
        <textarea
          id="contact-message"
          name="message"
          rows={6}
          placeholder="Votre message"
          className={`${CHAMP} resize-y`}
        />
        {err("message") && <p className="mt-1.5 text-[12.5px] text-[#e9a4a6]">{err("message")}</p>}
      </div>

      {state.status === "error" && (
        <p className="text-[13.5px] font-semibold text-[#e9a4a6]">{state.error}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-1 cursor-pointer rounded-[4px] border-0 bg-[color:var(--fc-rouge)] px-6 py-4 font-[family-name:var(--font-sora)] text-[14px] font-bold text-white transition-colors hover:bg-[color:var(--fc-rouge-fonce)] disabled:opacity-60"
      >
        {pending ? "Envoi…" : "Envoyer le message"}
      </button>
    </form>
  );
}
