"use client";

import { useEffect, useMemo, useState } from "react";

import type { ApiResponse } from "@/lib/api/responses";
import type { DiagnosticsResult, PriceEstimate, ProjectType } from "@/lib/core/diagnostics/types";
import { saveDraftInBackground, saveDraftNow } from "@/lib/questionnaire/draft";
import { computeLocalCalculation, toCalculateBody } from "@/lib/questionnaire/local-calc";
import { isEmailValid, type StepId } from "@/lib/questionnaire/steps";
import { useQuestionnaireStore } from "@/lib/stores/questionnaire";

import { DiagnosticsList } from "../components/DiagnosticsList";
import { FinalizeForm } from "../components/FinalizeForm";
import { PriceHero } from "../components/PriceHero";
import { getBranchVars } from "../lib/branch-colors";

type CalculateResponse = DiagnosticsResult & { estimate: PriceEstimate };

type RecapScreenProps = {
  branch: ProjectType;
  /** Navigation vers une étape du flux pour corriger une réponse. */
  onEdit: (id: StepId) => void;
  onSubmitted: () => void;
};

/**
 * Récapitulatif DÉ-BLOQUÉ : le calcul local (moteur pur, grille fallback)
 * s'affiche instantanément ; `/api/calculate` (grille Supabase) rafraîchit en
 * arrière-plan ; le draft repart en fire-and-forget si l'id manque encore.
 * Prix affiché d'emblée, en fourchette (décision #5).
 */
export function RecapScreen({ branch, onEdit, onSubmitted }: RecapScreenProps) {
  const data = useQuestionnaireStore((s) => s.data);
  const updateData = useQuestionnaireStore((s) => s.updateData);
  const quoteRequestId = useQuestionnaireStore((s) => s.quoteRequestId);
  const setQuoteRequestId = useQuestionnaireStore((s) => s.setQuoteRequestId);
  const lastCalculation = useQuestionnaireStore((s) => s.lastCalculation);
  const setLastCalculation = useQuestionnaireStore((s) => s.setLastCalculation);
  const markSubmitted = useQuestionnaireStore((s) => s.markSubmitted);

  const localCalc = useMemo(() => computeLocalCalculation(data), [data]);
  // Priorité au calcul serveur (grille à jour) s'il est arrivé, sinon local.
  const calc = lastCalculation?.source === "server" ? lastCalculation : localCalc;

  const [submitState, setSubmitState] = useState<"idle" | "submitting" | "error">("idle");
  const [submitError, setSubmitError] = useState<string | null>(null);

  // ── Arrière-plan (jamais bloquant) : draft de secours + grille serveur ───
  useEffect(() => {
    if (!quoteRequestId) saveDraftInBackground(data, setQuoteRequestId);

    const body = toCalculateBody(data);
    if (!body) return;
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch("/api/calculate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        const json = (await res.json()) as ApiResponse<CalculateResponse>;
        if (cancelled || !json.ok) return;
        setLastCalculation({
          required: json.data.required,
          toClarify: json.data.toClarify,
          estimate: json.data.estimate,
          source: "server",
        });
      } catch {
        // Échec silencieux : le calcul local reste affiché.
      }
    })();
    return () => {
      cancelled = true;
    };
    // Figé au montage : un retour en arrière re-monte l'écran.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Soumission finale ────────────────────────────────────────────────────
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitState === "submitting") return;

    if (!data.civility || !data.first_name || !data.last_name || !data.consent_rgpd) {
      setSubmitError("Complétez votre civilité, prénom, nom et le consentement RGPD.");
      return;
    }
    if (!isEmailValid(data.email)) {
      setSubmitError("Votre email semble invalide — corrigez-le via « Modifier ».");
      return;
    }
    if ((data.phone ?? "").replace(/\D/g, "").length < 8) {
      setSubmitError("Un numéro de téléphone est requis pour la prise de rendez-vous.");
      return;
    }

    setSubmitState("submitting");
    setSubmitError(null);

    // Dernier filet : si le draft en arrière-plan a échoué, on retente une fois.
    const id = quoteRequestId ?? (await saveDraftNow(data));
    if (id && !quoteRequestId) setQuoteRequestId(id);

    if (!id) {
      // Supabase indisponible : mode local (comportement historique conservé).
      markSubmitted();
      onSubmitted();
      return;
    }

    try {
      const res = await fetch(`/api/quote-request/${id}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = (await res.json()) as ApiResponse<unknown>;
      if (!json.ok && res.status !== 503) {
        setSubmitState("error");
        setSubmitError(json.error ?? "Impossible de finaliser la demande.");
        return;
      }
      markSubmitted();
      onSubmitted();
    } catch {
      setSubmitState("error");
      setSubmitError("Impossible de joindre le serveur.");
    }
  }

  return (
    <div
      style={getBranchVars(branch)}
      className="min-h-full bg-[var(--color-devis-cream)] px-4 py-6 sm:px-10 sm:py-11"
    >
      <div className="mx-auto max-w-6xl">
        <div className="font-mono text-[11px] tracking-[0.16em] text-[var(--color-devis-muted)]">
          VOTRE RÉCAPITULATIF
        </div>
        <h1 className="mt-2.5 font-serif text-[30px] leading-[1.08] font-normal tracking-[-0.025em] text-[var(--color-devis-ink)] sm:text-[44px]">
          Voici <em className="font-medium italic">ce qu&apos;il vous faut</em>.
        </h1>
        <p className="mt-3.5 mb-7 max-w-xl text-[15px] leading-relaxed text-[var(--color-devis-muted)] sm:text-[16px]">
          Nos experts ont identifié les diagnostics obligatoires pour votre bien. Validez vos
          coordonnées et nous vous rappelons sous 2 h.
        </p>

        {!calc ? (
          <div
            role="alert"
            className="rounded-[18px] border border-amber-200 bg-amber-50 p-5 text-[14px] text-amber-900"
          >
            Des informations sont manquantes pour calculer votre estimation.{" "}
            <button
              type="button"
              onClick={() => onEdit("bien")}
              className="font-medium underline underline-offset-2"
            >
              Reprendre le questionnaire
            </button>
          </div>
        ) : (
          <>
            <div className="mb-4">
              <PriceHero
                min={calc.estimate.min}
                max={calc.estimate.max}
                appliedModulators={calc.estimate.appliedModulators}
              />
            </div>
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.4fr_1fr]">
              <DiagnosticsList required={calc.required} toClarify={calc.toClarify} />
              <FinalizeForm
                data={data}
                updateData={updateData}
                onEdit={onEdit}
                submitting={submitState === "submitting"}
                error={submitError}
                onSubmit={handleSubmit}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
