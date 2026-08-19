import type { ReactNode } from "react";

/**
 * Hero des pages intérieures FC (ville, département, zones, expertises, contact) —
 * bande encre + grille technique (écho plan de voirie/chantier). Remplace l'ancienne
 * bande blanche plate ; prévoit le padding bas mordu par <ChevauchementFC />.
 */
export function HeroInterieurFC({ surtitre, titre }: { surtitre: ReactNode; titre: ReactNode }) {
  return (
    <section
      className="relative overflow-hidden bg-[color:var(--fc-noir)] pb-16 pt-12 md:pb-20 md:pt-14"
      style={{
        backgroundImage:
          "linear-gradient(var(--fc-rouge-fonce) 1px, transparent 1px), linear-gradient(90deg, var(--fc-rouge-fonce) 1px, transparent 1px)",
        backgroundSize: "28px 28px",
      }}
    >
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-b from-[color:var(--fc-noir)]/55 to-[color:var(--fc-noir)]"
      />
      <div className="relative mx-auto max-w-[var(--container,1280px)] px-6 md:px-8">
        <p className="inline-flex items-center gap-3 font-[family-name:var(--font-sora)] text-[12.5px] font-bold uppercase tracking-[0.2em] text-[#e9a4a6]">
          <span aria-hidden className="h-[2px] w-8 bg-[#e9a4a6]" />
          {surtitre}
        </p>
        <h1 className="mt-4 max-w-2xl font-[family-name:var(--font-sora)] text-[clamp(32px,3.5vw,44px)] font-extrabold leading-[1.06] tracking-[-0.02em] text-balance text-white">
          {titre}
        </h1>
      </div>
    </section>
  );
}
