"use client";

import { CheckCircle2Icon, CircleSlashIcon } from "lucide-react";

import { useMapConsent } from "./MapConsentProvider";

/**
 * Interrupteur de la page /cookies.
 *
 * Le RGPD impose que retirer son consentement soit aussi simple que le donner :
 * un seul clic ici, sans formulaire ni e-mail à écrire.
 */
export function MapConsentToggle() {
  const { granted, grant, revoke } = useMapConsent();

  // `null` = localStorage pas encore lu. On réserve la place pour éviter que le
  // bloc saute au moment de l'hydratation.
  if (granted === null) {
    return <div className="min-h-[92px]" aria-hidden />;
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 border border-[color:var(--color-home-line)] bg-[color:var(--color-home-bg)] p-5">
      <p className="inline-flex items-center gap-2.5 text-[13px] font-semibold text-[color:var(--color-home-ink)]">
        {granted ? (
          <>
            <CheckCircle2Icon
              className="h-4 w-4 shrink-0 text-[color:var(--color-home-saf-dark)]"
              aria-hidden
            />
            Les cartes Google sont autorisées sur cet appareil.
          </>
        ) : (
          <>
            <CircleSlashIcon
              className="h-4 w-4 shrink-0 text-[color:var(--color-home-muted)]"
              aria-hidden
            />
            Les cartes Google sont bloquées sur cet appareil.
          </>
        )}
      </p>
      <button
        type="button"
        onClick={granted ? revoke : grant}
        className="inline-flex min-h-11 items-center rounded-[8px] bg-[color:var(--color-si-petrole)] px-5 font-[family-name:var(--font-sora)] text-[12.5px] font-bold text-white transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--color-home-ink)]"
      >
        {granted ? "Retirer mon accord" : "Autoriser les cartes"}
      </button>
    </div>
  );
}
