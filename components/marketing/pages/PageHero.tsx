import type { ReactNode } from "react";

type PageHeroProps = {
  surtitre?: string;
  titre: string;
  description?: string;
  children?: ReactNode;
};

/** Bandeau d'en-tête pétrole des pages intérieures — continuité du header 2 niveaux. */
export function PageHero({ surtitre, titre, description, children }: PageHeroProps) {
  return (
    <section className="bg-[color:var(--color-si-petrole)]">
      <div className="mx-auto max-w-[var(--container,1280px)] px-6 py-14 md:px-8 md:py-16">
        {surtitre && (
          <p className="font-[family-name:var(--font-sora)] text-[13px] font-semibold tracking-[0.14em] text-[color:var(--color-si-lime)] uppercase">
            {surtitre}
          </p>
        )}
        <h1 className="mt-2 font-[family-name:var(--font-sora)] text-[30px] leading-tight font-bold text-white sm:text-[38px]">
          {titre}
        </h1>
        {description && <p className="mt-4 max-w-2xl text-[15.5px] leading-relaxed text-[#bfe0e2]">{description}</p>}
        {children}
      </div>
    </section>
  );
}
