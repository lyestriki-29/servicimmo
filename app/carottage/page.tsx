import type { Metadata } from "next";

import { CtaDevisFC } from "@/components/carottage/CtaDevisFC";
import { HeroFC } from "@/components/carottage/HeroFC";
import { ChiffresFC } from "@/components/carottage/home/ChiffresFC";
import { MetierFC } from "@/components/carottage/home/MetierFC";
import { ProcessFC } from "@/components/carottage/home/ProcessFC";
import { ReseauNationalFC } from "@/components/carottage/home/ReseauNationalFC";

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
      <ChiffresFC />
      <MetierFC />
      <ProcessFC />
      <ReseauNationalFC />
      <CtaDevisFC />
    </>
  );
}
