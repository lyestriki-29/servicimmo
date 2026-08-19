import type { Metadata } from "next";

import { CtaDevisFC } from "@/components/carottage/CtaDevisFC";
import { HeroFC } from "@/components/carottage/HeroFC";
import { ChiffresFC } from "@/components/carottage/home/ChiffresFC";
import { ExpertisesTeaserFC } from "@/components/carottage/home/ExpertisesTeaserFC";
import { MetierFC } from "@/components/carottage/home/MetierFC";
import { PedagogieFC } from "@/components/carottage/home/PedagogieFC";
import { ProcessFC } from "@/components/carottage/home/ProcessFC";
import { ReferencesFC } from "@/components/carottage/home/ReferencesFC";
import { ReseauNationalFC } from "@/components/carottage/home/ReseauNationalFC";
import { Reveal } from "@/components/marketing/Reveal";

export const metadata: Metadata = {
  title: "France Carottage — Carottage routier & repérage amiante/HAP sur enrobés",
  description:
    "Carottage d'enrobés et repérage amiante/HAP avant travaux de voirie, réseaux et bâtiment. Réseau national, laboratoire accrédité, devis sous 24 h. France Carottage.",
  alternates: { canonical: "/" },
};

export default function CarottageHomePage() {
  return (
    <>
      <HeroFC />
      <ReferencesFC />
      <MetierFC />
      <PedagogieFC />
      <ChiffresFC />
      <ProcessFC />
      <ExpertisesTeaserFC />
      <ReseauNationalFC />
      {/* CtaDevisFC reste sans animation intégrée (composant partagé par ~256
          pages) : l'animation reste locale à la home, qui l'enveloppe ici. */}
      <Reveal>
        <CtaDevisFC />
      </Reveal>
    </>
  );
}
