/**
 * Store Zustand du questionnaire de devis.
 *
 * Refonte 2026-07 (approche C) : parcours linéaire piloté par
 * `lib/questionnaire/steps.ts`. Le store conserve l'écran courant, l'étape
 * courante, les réponses, l'id du draft serveur et le dernier calcul
 * diagnostics/prix (local ou serveur).
 *
 * Persist localStorage : v4. Les états < v4 (squelette accordéon) sont purgés
 * au chargement — décision « bump v4 » du 2026-07-13.
 */

"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { PriceEstimate, RequiredDiagnostic } from "@/lib/core/diagnostics/types";
import type { FullQuoteInput } from "@/lib/validation/schemas";

export type QuestionnaireScreen = "entry" | "filling" | "recap" | "thanks";

export type QuestionnaireData = Partial<FullQuoteInput>;

/** Résultat d'un calcul diagnostics + prix, local (grille fallback) ou serveur. */
export type QuoteCalculation = {
  required: RequiredDiagnostic[];
  toClarify: RequiredDiagnostic[];
  estimate: PriceEstimate;
  source: "local" | "server";
};

type QuestionnaireState = {
  currentScreen: QuestionnaireScreen;
  /** Id de l'étape courante du flux linéaire (`StepId`), null = première atteignable. */
  currentStepId: string | null;
  data: QuestionnaireData;
  quoteRequestId: string | null;
  /** Indique si la soumission finale a déjà été effectuée avec succès. */
  submitted: boolean;
  lastCalculation: QuoteCalculation | null;

  goToScreen: (screen: QuestionnaireScreen) => void;
  goToStep: (id: string | null) => void;
  updateData: (patch: QuestionnaireData) => void;
  setQuoteRequestId: (id: string) => void;
  setLastCalculation: (calc: QuoteCalculation | null) => void;
  markSubmitted: () => void;
  reset: () => void;
};

const INITIAL = {
  currentScreen: "entry" as QuestionnaireScreen,
  currentStepId: null,
  data: {},
  quoteRequestId: null,
  submitted: false,
  lastCalculation: null,
};

export const useQuestionnaireStore = create<QuestionnaireState>()(
  persist(
    (set) => ({
      ...INITIAL,

      goToScreen: (screen) => set({ currentScreen: screen }),
      goToStep: (id) => set({ currentStepId: id }),
      updateData: (patch) => set((state) => ({ data: { ...state.data, ...patch } })),
      setQuoteRequestId: (id) => set({ quoteRequestId: id }),
      setLastCalculation: (calc) => set({ lastCalculation: calc }),
      markSubmitted: () => set({ submitted: true }),
      reset: () => set({ ...INITIAL }),
    }),
    {
      name: "servicimmo-quote",
      // v4 = refonte flux linéaire (2026-07). Les états v1-v3 (accordéon 2
      // niveaux) sont purgés : structure de navigation incompatible, et un
      // état périmé qui ressurgit était précisément un des bugs à corriger.
      version: 4,
      partialize: (state) => ({
        currentScreen: state.currentScreen,
        currentStepId: state.currentStepId,
        data: state.data,
        quoteRequestId: state.quoteRequestId,
        submitted: state.submitted,
      }),
      migrate: (persistedState, fromVersion) => {
        if (fromVersion < 4) {
          return {
            currentScreen: "entry" as QuestionnaireScreen,
            currentStepId: null,
            data: {},
            quoteRequestId: null,
            submitted: false,
          };
        }
        return persistedState as {
          currentScreen: QuestionnaireScreen;
          currentStepId: string | null;
          data: QuestionnaireData;
          quoteRequestId: string | null;
          submitted: boolean;
        };
      },
    }
  )
);
