"use client";

import { ArrowLeftIcon, ArrowRightIcon, RotateCcwIcon } from "lucide-react";
import type { ReactNode } from "react";

import type { ProjectType } from "@/lib/core/diagnostics/types";

import { ProgressBar } from "../components/ProgressBar";
import { getBranchVars } from "../lib/branch-colors";
import { BRANCHES } from "../lib/branches";

type StepScreenProps = {
  branch: ProjectType;
  title: string;
  /** 1-based. */
  stepNumber: number;
  stepCount: number;
  optional?: boolean;
  canContinue: boolean;
  nextLabel?: string;
  submitting?: boolean;
  error?: string | null;
  onBack: () => void;
  onNext: () => void;
  onRestart: () => void;
  children: ReactNode;
};

/**
 * Coquille générique d'une étape du flux linéaire : top bar (retour, branche,
 * recommencer), barre de progression, titre, champs (children), CTA.
 * Une étape = un écran — le contenu peut scroller, la navigation reste simple.
 */
export function StepScreen({
  branch,
  title,
  stepNumber,
  stepCount,
  optional = false,
  canContinue,
  nextLabel = "Continuer",
  submitting = false,
  error = null,
  onBack,
  onNext,
  onRestart,
  children,
}: StepScreenProps) {
  const config = BRANCHES[branch];
  const BranchIcon = config.icon;

  return (
    <div
      style={getBranchVars(branch)}
      className="min-h-full bg-[var(--color-devis-cream)] px-4 py-5 sm:px-9 sm:py-8"
    >
      <div className="mx-auto max-w-2xl">
        {/* Top bar */}
        <div className="mb-5 flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-devis-line)] bg-white px-3 py-1.5 text-[12px] text-[var(--color-devis-ink)] hover:border-[var(--branch-fg)]/60"
          >
            <ArrowLeftIcon className="h-3.5 w-3.5" aria-hidden /> Retour
          </button>
          <div className="inline-flex items-center gap-2 rounded-full bg-[var(--branch-bg)] px-3 py-1.5 text-[12px] font-medium text-[var(--branch-dark)]">
            <BranchIcon className="h-3.5 w-3.5" aria-hidden /> {config.short}
          </div>
          <button
            type="button"
            onClick={onRestart}
            className="ml-auto inline-flex items-center gap-1.5 text-[12px] text-[var(--color-devis-muted)] hover:text-[var(--color-devis-ink)]"
          >
            <RotateCcwIcon className="h-3 w-3" aria-hidden /> Recommencer
          </button>
        </div>

        <ProgressBar current={stepNumber} total={stepCount} title={title} />

        <h1 className="mb-5 font-serif text-[26px] font-normal tracking-[-0.02em] text-[var(--color-devis-ink)] sm:text-[32px]">
          {title}
          {optional ? (
            <span className="ml-2 align-middle font-sans text-[13px] text-[var(--color-devis-muted)]">
              (facultatif)
            </span>
          ) : null}
        </h1>

        <div className="devis-reveal flex flex-col gap-4">{children}</div>

        <button
          type="button"
          disabled={!canContinue || submitting}
          onClick={onNext}
          className={[
            "mt-6 inline-flex w-full items-center justify-center gap-2 rounded-[12px] px-5 py-4 text-[16px] font-medium text-white transition-opacity",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--branch-fg)]/50",
            !canContinue || submitting
              ? "cursor-not-allowed bg-[var(--branch-fg)]/50"
              : "bg-[var(--branch-fg)] hover:opacity-90",
          ].join(" ")}
        >
          {submitting ? "Envoi en cours…" : nextLabel}
          {!submitting ? <ArrowRightIcon className="h-4.5 w-4.5" aria-hidden /> : null}
        </button>

        {error ? (
          <p role="alert" className="mt-3 text-center text-[13px] text-amber-700">
            {error}
          </p>
        ) : null}

        <p className="mt-2 text-center font-mono text-[11px] text-[var(--color-devis-muted)]">
          Sauvegardé automatiquement <span className="text-[var(--branch-fg)]">●</span>
        </p>
      </div>
    </div>
  );
}
