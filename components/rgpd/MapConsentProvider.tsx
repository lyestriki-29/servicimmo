"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";

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
 *
 * Le choix vit dans le localStorage, lu via `useSyncExternalStore` : c'est le
 * contrat React pour s'abonner à une source extérieure au rendu serveur, sans
 * écrire d'état dans un effet.
 */

/** Clé localStorage — pas un cookie : rien à déposer pour mémoriser un refus. */
const STORAGE_KEY = "si-consent-maps";

/** Validité du consentement, en mois (usage CNIL). */
const VALIDITY_MONTHS = 6;

type MapConsentValue = {
  /** `null` = pas encore lu (rendu serveur et hydratation) → on n'affiche rien de Google. */
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

const listeners = new Set<() => void>();

/** Réveille les abonnés : ils reliront le stockage au rendu suivant. */
function publish() {
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  // `storage` ne notifie que les AUTRES onglets : garde le choix cohérent partout.
  const onStorage = (event: StorageEvent) => {
    if (event.key === null || event.key === STORAGE_KEY) listener();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

/**
 * Relit le stockage à chaque rendu, sans mémoriser : la valeur est un booléen,
 * donc React la compare par valeur et ne re-rend que si le choix a changé.
 * (Un cache au niveau du module survivrait à tout démontage et rendrait un
 * consentement révoqué ou expiré indétectable.)
 */
function getSnapshot(): boolean {
  return readStoredConsent();
}

/** Le serveur ne peut pas lire le localStorage : `null` = « pas encore su ». */
function getServerSnapshot(): null {
  return null;
}

export function MapConsentProvider({ children }: { children: ReactNode }) {
  const stored = useSyncExternalStore<boolean | null>(subscribe, getSnapshot, getServerSnapshot);

  /**
   * Navigation privée : l'écriture dans le stockage échoue, mais le choix
   * exprimé doit valoir au moins pour la visite en cours — il prime alors sur
   * ce que dit (ou ne dit pas) le stockage.
   */
  const [choixDeSession, setChoixDeSession] = useState<boolean | null>(null);
  const granted = stored === null ? null : (choixDeSession ?? stored);

  const grant = useCallback(() => {
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ granted: true, date: new Date().toISOString() })
      );
    } catch {
      // Le choix de session ci-dessous prend le relais.
    }
    setChoixDeSession(true);
    publish();
  }, []);

  const revoke = useCallback(() => {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Idem : le choix de session fait foi pour la visite.
    }
    setChoixDeSession(false);
    publish();
  }, []);

  const value = useMemo(() => ({ granted, grant, revoke }), [granted, grant, revoke]);

  return <MapConsentContext.Provider value={value}>{children}</MapConsentContext.Provider>;
}

export function useMapConsent(): MapConsentValue {
  const ctx = useContext(MapConsentContext);
  if (!ctx) {
    throw new Error("useMapConsent doit être utilisé à l'intérieur de <MapConsentProvider>");
  }
  return ctx;
}
