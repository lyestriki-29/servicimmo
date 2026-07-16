"use client";

import { createContext, useCallback, useContext, useState, type ReactNode } from "react";

import { useQuestionnaireStore, type QuestionnaireData } from "@/lib/stores/questionnaire";

import { QuestionnaireModal } from "./QuestionnaireModal";

type QuoteModalContextValue = {
  /** `prefill` reporte les champs déjà saisis ailleurs (ex. formulaire de contact). */
  open: (prefill?: QuestionnaireData) => void;
  close: () => void;
  isOpen: boolean;
};

const QuoteModalContext = createContext<QuoteModalContextValue | null>(null);

/** Fournit l'accès au modal devis à toute l'arborescence marketing. */
export function QuoteModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const updateData = useQuestionnaireStore((s) => s.updateData);

  const open = useCallback(
    (prefill?: QuestionnaireData) => {
      if (prefill) updateData(prefill);
      setIsOpen(true);
    },
    [updateData]
  );
  const close = useCallback(() => setIsOpen(false), []);

  return (
    <QuoteModalContext.Provider value={{ open, close, isOpen }}>
      {children}
      <QuestionnaireModal open={isOpen} onClose={close} />
    </QuoteModalContext.Provider>
  );
}

/**
 * Hook pour ouvrir/fermer le modal devis depuis n'importe quel composant client
 * enfant de `<QuoteModalProvider>`.
 */
export function useQuoteModal(): QuoteModalContextValue {
  const ctx = useContext(QuoteModalContext);
  if (!ctx) {
    throw new Error("useQuoteModal doit être utilisé à l'intérieur de <QuoteModalProvider>");
  }
  return ctx;
}
