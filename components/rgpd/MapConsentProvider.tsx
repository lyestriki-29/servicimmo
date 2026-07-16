"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";

/**
 * Consentement au chargement des cartes Google.
 *
 * Article 82 de la loi Informatique et Libertés : information ET consentement
 * AVANT tout dépôt non strictement nécessaire. L'iframe Google Maps envoie
 * l'IP du visiteur à Google et laisse déposer ses cookies — elle ne peut donc
 * pas être montée tant que ce contexte ne dit pas « oui ».
 *
 * Google Maps est le SEUL tiers non exempté du site (cookies Supabase =
 * strictement nécessaires ; polices next/font/google = servies depuis notre
 * domaine ; aucun analytics). D'où un consentement ciblé plutôt qu'un bandeau
 * global. Cf. docs/superpowers/specs/2026-07-16-consentement-google-maps-design.md
 */

/** Clé localStorage — pas un cookie : rien à déposer pour mémoriser un refus. */
const STORAGE_KEY = "si-consent-maps";

/** Validité du consentement, en mois (usage CNIL). */
const VALIDITY_MONTHS = 6;

type MapConsentValue = {
  /** `null` = pas encore lu (rendu serveur et avant hydratation) → on n'affiche rien de Google. */
  granted: boolean | null;
  grant: () => void;
  revoke: () => void;
};

const MapConsentContext = createContext<MapConsentValue | null>(null);

function readStoredConsent(): boolean {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    const { date } = JSON.parse(raw) as { date?: string };
    if (!date) return false;
    const expiry = new Date(date);
    if (Number.isNaN(expiry.getTime())) return false;
    expiry.setMonth(expiry.getMonth() + VALIDITY_MONTHS);
    return expiry.getTime() > Date.now();
  } catch {
    // Stockage indisponible ou valeur corrompue : on retombe sur « pas de consentement ».
    return false;
  }
}

export function MapConsentProvider({ children }: { children: ReactNode }) {
  // Volontairement `null` au premier rendu : le serveur ne peut pas lire le
  // localStorage, et démarrer à `true` monterait l'iframe avant vérification.
  const [granted, setGranted] = useState<boolean | null>(null);

  useEffect(() => {
    setGranted(readStoredConsent());
  }, []);

  const grant = useCallback(() => {
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ granted: true, date: new Date().toISOString() })
      );
    } catch {
      // Navigation privée : le choix vaut au moins pour la visite en cours.
    }
    setGranted(true);
  }, []);

  const revoke = useCallback(() => {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Idem : l'état React fait foi pour la visite en cours.
    }
    setGranted(false);
  }, []);

  return (
    <MapConsentContext.Provider value={{ granted, grant, revoke }}>
      {children}
    </MapConsentContext.Provider>
  );
}

export function useMapConsent(): MapConsentValue {
  const ctx = useContext(MapConsentContext);
  if (!ctx) {
    throw new Error("useMapConsent doit être utilisé à l'intérieur de <MapConsentProvider>");
  }
  return ctx;
}
