"use client";

import Link from "next/link";
import { PhoneIcon } from "lucide-react";
import { useMemo, useState, useSyncExternalStore, type ComponentType } from "react";

import { LogoMark } from "@/components/marketing/Logo";
import type { ApiResponse } from "@/lib/api/responses";
import type { ProjectType } from "@/lib/core/diagnostics/types";
import { saveDraftInBackground } from "@/lib/questionnaire/draft";
import { getSteps, resolveStepIndex, type StepId } from "@/lib/questionnaire/steps";
import { useQuestionnaireStore } from "@/lib/stores/questionnaire";

import { EntryScreen } from "./screens/EntryScreen";
import { RecapScreen } from "./screens/RecapScreen";
import { StepScreen } from "./screens/StepScreen";
import { ThanksScreen } from "./screens/ThanksScreen";
import { AutreStep } from "./steps/AutreStep";
import { BatiStep } from "./steps/BatiStep";
import { BienStep } from "./steps/BienStep";
import { ContactStep } from "./steps/ContactStep";
import { DelaiStep } from "./steps/DelaiStep";
import { ExistantsStep } from "./steps/ExistantsStep";
import { SpecifiqueStep } from "./steps/SpecifiqueStep";
import type { StepProps } from "./steps/types";

const STEP_COMPONENTS: Record<StepId, ComponentType<StepProps>> = {
  bien: BienStep,
  bati: BatiStep,
  specifique: SpecifiqueStep,
  contact: ContactStep,
  existants: ExistantsStep,
  delai: DelaiStep,
  autre: AutreStep,
};

/** Header minimal propre au parcours devis (inchangé — pattern « focused flow »). */
function QuestionnaireHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-[var(--color-devis-line)] bg-[var(--color-devis-cream)]/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-10">
        <Link
          href="/"
          aria-label="Retour à l'accueil Servicimmo"
          className="flex items-center gap-2.5 transition-opacity hover:opacity-80"
        >
          <LogoMark size={30} />
          <span className="text-[15px] font-semibold tracking-[-0.02em] text-[var(--color-devis-ink)]">
            Servicimmo
          </span>
        </Link>
        <a
          href="tel:+33247470123"
          className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[var(--color-devis-ink)] hover:opacity-80"
        >
          <PhoneIcon className="h-3.5 w-3.5" aria-hidden />
          <span className="hidden sm:inline">02 47 47 0123</span>
        </a>
      </div>
    </header>
  );
}

/**
 * Root Client Component du parcours devis — flux LINÉAIRE (refonte 2026-07).
 *
 * Orchestration : entry → steps[getSteps(branch, data)] → recap → thanks.
 * Navigation avant/arrière sur la liste d'étapes, données jamais perdues,
 * aucun appel réseau bloquant entre les écrans.
 */
export function QuestionnaireApp({ embedded = false }: { embedded?: boolean } = {}) {
  const mounted = useSyncExternalStore(
    (cb) => useQuestionnaireStore.persist.onFinishHydration(cb),
    () => useQuestionnaireStore.persist.hasHydrated(),
    () => false
  );

  const currentScreen = useQuestionnaireStore((s) => s.currentScreen);
  const currentStepId = useQuestionnaireStore((s) => s.currentStepId);
  const data = useQuestionnaireStore((s) => s.data);
  const quoteRequestId = useQuestionnaireStore((s) => s.quoteRequestId);
  const goToScreen = useQuestionnaireStore((s) => s.goToScreen);
  const goToStep = useQuestionnaireStore((s) => s.goToStep);
  const updateData = useQuestionnaireStore((s) => s.updateData);
  const setQuoteRequestId = useQuestionnaireStore((s) => s.setQuoteRequestId);
  const markSubmitted = useQuestionnaireStore((s) => s.markSubmitted);
  const reset = useQuestionnaireStore((s) => s.reset);

  const [submittingOther, setSubmittingOther] = useState(false);
  const [otherError, setOtherError] = useState<string | null>(null);

  const branch: ProjectType = data.project_type ?? "sale";
  const steps = useMemo(() => getSteps(branch, data), [branch, data]);
  const stepIndex = resolveStepIndex(steps, currentStepId, data);
  const step = steps[stepIndex];

  // ── Branche « autre » : soumission directe, seul appel réseau du flux ────
  async function submitOther() {
    setOtherError(null);
    setSubmittingOther(true);
    try {
      const res = await fetch("/api/quote-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project_type: "other",
          email: data.email,
          first_name: data.first_name,
          phone: data.phone,
          notes: data.notes,
          consent_rgpd: data.consent_rgpd,
        }),
      });
      const json = (await res.json()) as ApiResponse<{ id: string }>;
      if (json.ok) {
        setQuoteRequestId(json.data.id);
      } else if (res.status !== 503) {
        // 503 = Supabase non configuré : on continue en mode local.
        setOtherError(json.error ?? "Impossible d'envoyer votre demande.");
        return;
      }
      markSubmitted();
      goToScreen("thanks");
    } catch {
      setOtherError("Impossible de joindre le serveur. Vérifiez votre connexion.");
    } finally {
      setSubmittingOther(false);
    }
  }

  function handleNext() {
    if (!step) return;
    if (branch === "other") {
      void submitOther();
      return;
    }
    // Quitter l'étape Contact = capture lead → draft en arrière-plan (jamais bloquant).
    if (step.id === "contact" && !quoteRequestId) {
      saveDraftInBackground(data, setQuoteRequestId);
    }
    const next = stepIndex + 1;
    if (next >= steps.length) {
      goToScreen("recap");
      return;
    }
    const target = steps[next];
    if (target) goToStep(target.id);
  }

  function handleBack() {
    if (stepIndex === 0) {
      goToStep(null);
      goToScreen("entry");
      return;
    }
    const prev = steps[stepIndex - 1];
    if (prev) goToStep(prev.id);
  }

  if (!mounted) {
    return (
      <div
        className={
          embedded
            ? "h-full bg-[var(--color-devis-cream)]"
            : "min-h-[80vh] bg-[var(--color-devis-cream)]"
        }
        aria-hidden
      />
    );
  }

  const StepFields = step ? STEP_COMPONENTS[step.id] : null;

  return (
    <div
      className={
        embedded
          ? "h-full bg-[var(--color-devis-cream)] font-sans text-[var(--color-devis-ink)]"
          : "min-h-[100dvh] bg-[var(--color-devis-cream)] font-sans text-[var(--color-devis-ink)]"
      }
    >
      {!embedded && <QuestionnaireHeader />}

      {currentScreen === "entry" ? (
        <EntryScreen
          selected={data.project_type ?? null}
          onSelect={(b) => {
            updateData({ project_type: b });
            goToStep(null);
            goToScreen("filling");
          }}
        />
      ) : null}

      {currentScreen === "filling" && step && StepFields ? (
        <StepScreen
          branch={branch}
          title={step.title}
          stepNumber={stepIndex + 1}
          stepCount={steps.length}
          optional={step.optional}
          canContinue={step.isComplete(data)}
          nextLabel={
            branch === "other"
              ? "Envoyer ma demande"
              : stepIndex === steps.length - 1
                ? "Voir mon estimation"
                : "Continuer"
          }
          submitting={submittingOther}
          error={otherError}
          onBack={handleBack}
          onNext={handleNext}
          onRestart={reset}
        >
          <StepFields data={data} updateData={updateData} branch={branch} />
        </StepScreen>
      ) : null}

      {currentScreen === "recap" ? (
        <RecapScreen
          branch={branch}
          onEdit={(id) => {
            goToStep(id);
            goToScreen("filling");
          }}
          onSubmitted={() => goToScreen("thanks")}
        />
      ) : null}

      {currentScreen === "thanks" ? (
        <ThanksScreen
          branch={branch}
          firstName={data.first_name}
          email={data.email}
          onRestart={reset}
        />
      ) : null}
    </div>
  );
}
