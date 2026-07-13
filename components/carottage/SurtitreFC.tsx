import type { ReactNode } from "react";

/** Surtitre FC : libellé rouge capitalisé précédé d'un filet rouge court. Signature visuelle FC. */
export function SurtitreFC({ children }: { children: ReactNode }) {
  return (
    <p className="inline-flex items-center gap-3 font-[family-name:var(--font-sora)] text-[12.5px] font-bold uppercase tracking-[0.2em] text-[color:var(--fc-rouge)]">
      <span aria-hidden className="h-[2px] w-8 bg-[color:var(--fc-rouge)]" />
      {children}
    </p>
  );
}
