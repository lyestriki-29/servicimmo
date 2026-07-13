"use client";

type ProgressBarProps = {
  /** Étape courante, 1-based. */
  current: number;
  total: number;
  title: string;
};

/**
 * Barre de progression du flux linéaire : segments (un par étape) + libellé
 * « Étape 3/6 — Le bâti ». Décision #3 de la spec refonte.
 */
export function ProgressBar({ current, total, title }: ProgressBarProps) {
  return (
    <div className="mb-5">
      <div className="mb-1.5 flex items-baseline justify-between gap-3">
        <span className="font-mono text-[11px] tracking-[0.14em] text-[var(--color-devis-muted)]">
          ÉTAPE {current}/{total}
        </span>
        <span className="truncate text-[12px] font-medium text-[var(--color-devis-ink)]">
          {title}
        </span>
      </div>
      <div
        role="progressbar"
        aria-valuemin={1}
        aria-valuemax={total}
        aria-valuenow={current}
        aria-label={`Étape ${current} sur ${total} — ${title}`}
        className="flex gap-1"
      >
        {Array.from({ length: total }, (_, i) => (
          <span
            key={i}
            className={[
              "h-1.5 flex-1 rounded-full transition-colors duration-300",
              i < current ? "bg-[var(--branch-fg)]" : "bg-[var(--color-devis-line)]",
            ].join(" ")}
          />
        ))}
      </div>
    </div>
  );
}
