import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";

import { ArianeFC } from "@/components/carottage/ArianeFC";
import { CtaDevisFC } from "@/components/carottage/CtaDevisFC";
import { SurtitreFC } from "@/components/carottage/SurtitreFC";
import { Reveal } from "@/components/marketing/Reveal";
import { loadExpertises } from "@/lib/content/load-carottage";

export const metadata: Metadata = {
  title: "Expertises carottage & amiante/HAP enrobés",
  description:
    "Métier, réglementation, HAP, obligations de repérage sur voirie : toutes les expertises de France Carottage sur le carottage d'enrobés et l'amiante avant travaux.",
  alternates: { canonical: "/expertises" },
};

export default async function ExpertisesIndexPage() {
  const expertises = await loadExpertises();
  return (
    <>
      <section className="border-b border-[color:var(--fc-gris-clair)] bg-white">
        <div className="mx-auto max-w-[var(--container,1280px)] px-6 py-14 md:px-8">
          <SurtitreFC>Expertises</SurtitreFC>
          <h1 className="mt-4 max-w-2xl font-[family-name:var(--font-sora)] text-[clamp(34px,3.7vw,44px)] font-extrabold leading-tight tracking-[-0.02em] text-balance text-[color:var(--fc-noir)]">
            Tout comprendre au repérage amiante/HAP sur enrobés.
          </h1>
        </div>
      </section>
      <ArianeFC segments={[{ label: "Expertises", href: "/expertises" }]} />
      <section className="mx-auto max-w-[var(--container,1280px)] px-6 pb-8 md:px-8">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {expertises.map((e, i) => (
            <Reveal key={e.slug} delay={Math.min(i * 0.05, 0.3)}>
              <Link
                href={`/expertises/${e.slug}`}
                className="group flex h-full flex-col border-t-2 border-[color:var(--fc-gris-clair)] bg-white p-6 transition-colors hover:border-[color:var(--fc-rouge)]"
              >
                <h2 className="font-[family-name:var(--font-sora)] text-[18px] font-bold leading-snug text-[color:var(--fc-noir)]">
                  {e.titre}
                </h2>
                <p className="mt-3 flex-1 text-[14px] leading-relaxed text-[color:var(--fc-gris)]">
                  {e.metaDescription}
                </p>
                <span className="mt-4 inline-flex items-center gap-1.5 font-[family-name:var(--font-sora)] text-[13px] font-bold text-[color:var(--fc-rouge)]">
                  Lire l’expertise
                  <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden />
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>
      <CtaDevisFC />
    </>
  );
}
