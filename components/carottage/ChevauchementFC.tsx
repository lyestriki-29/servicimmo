import type { ReactNode } from "react";

/** Panneau blanc qui mord la couture entre <HeroInterieurFC /> et le contenu clair qui suit. */
export function ChevauchementFC({ children }: { children: ReactNode }) {
  return (
    <div className="relative z-10 mx-auto -mt-10 max-w-[var(--container,1280px)] px-6 md:-mt-14 md:px-8">
      <div className="rounded-[3px] bg-white p-4 shadow-[0_18px_40px_rgba(17,17,19,0.22)] md:p-6">
        {children}
      </div>
    </div>
  );
}
