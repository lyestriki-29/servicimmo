import type { ReactNode } from "react";
import { ArrowRightIcon } from "lucide-react";

/** Coins de viseur — la signature réticule de la direction G. */
export function CoinsViseur({
  couleur = "border-[color:var(--color-si-lime)]",
}: {
  couleur?: string;
}) {
  return (
    <>
      {[
        "top-0 left-0 border-t-2 border-l-2",
        "top-0 right-0 border-t-2 border-r-2",
        "bottom-0 left-0 border-b-2 border-l-2",
        "bottom-0 right-0 border-b-2 border-r-2",
      ].map((pos) => (
        <span key={pos} aria-hidden className={`absolute h-7 w-7 ${couleur} ${pos}`} />
      ))}
    </>
  );
}

/** Kicker mono en capitales — l'étiquette technique de chaque section. */
export function KickerMono({ children, clair = false }: { children: ReactNode; clair?: boolean }) {
  return (
    <p
      className={`font-mono text-[10.5px] font-bold tracking-[.2em] uppercase ${
        clair ? "text-white/60" : "text-[color:var(--color-home-muted)]"
      }`}
    >
      {children}
    </p>
  );
}

/**
 * La bande de confiance : les références réelles du cabinet, répétées à
 * l'identique sur les pages (une preuve qui se répète devient une signature).
 */
export function BandeConfiance() {
  const preuves = [
    { valeur: "1998", label: "Cabinet fondé à Tours" },
    { valeur: "COFRAC", label: "Certifiés LCC Qualixpert & iCert" },
    { valeur: "Allianz", label: "Assurance RCP professionnelle" },
    { valeur: "10 000+", label: "Interventions en Touraine" },
  ] as const;

  return (
    <section className="border-y border-[color:var(--color-home-line)] bg-white">
      <div className="mx-auto grid max-w-[var(--container,1280px)] grid-cols-2 divide-x divide-[color:var(--color-home-line)] lg:grid-cols-4">
        {preuves.map((preuve) => (
          <div key={preuve.valeur} className="px-6 py-7 md:px-8">
            <p className="font-[family-name:var(--font-sora)] text-[clamp(20px,2.2vw,28px)] font-extrabold tracking-[-0.02em] text-[color:var(--color-si-petrole)]">
              {preuve.valeur}
            </p>
            <p className="mt-1.5 font-mono text-[9.5px] font-bold tracking-[.13em] text-[color:var(--color-home-muted)] uppercase">
              {preuve.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

/** La bande d'appel à l'action commune : un seul moment sombre, un seul geste lime. */
export function BandeCta({
  titre = "Votre bien mérite un regard exercé.",
  sousTitre = "Décrivez-le en 2 minutes — devis précis sous 2 h ouvrées.",
  libelle = "Commencer mon devis",
}: {
  titre?: string;
  sousTitre?: string;
  libelle?: string;
}) {
  return (
    <section className="bg-[color:var(--color-home-ink)]">
      <div className="mx-auto flex max-w-[var(--container,1280px)] flex-wrap items-center justify-between gap-6 px-6 py-12 md:px-8">
        <div>
          <h2 className="font-[family-name:var(--font-sora)] text-[clamp(24px,3vw,36px)] font-extrabold tracking-[-0.02em] text-white">
            {titre}
          </h2>
          <p className="mt-2 text-[14px] text-white/70">{sousTitre}</p>
        </div>
        <a
          href="/devis"
          className="inline-flex min-h-12 items-center gap-2 rounded-full bg-[color:var(--color-si-lime)] px-7 text-[14px] font-bold text-[color:var(--color-home-ink)] transition-transform hover:-translate-y-0.5"
        >
          {libelle} <ArrowRightIcon className="h-4 w-4" aria-hidden />
        </a>
      </div>
    </section>
  );
}
