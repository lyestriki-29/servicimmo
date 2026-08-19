import type { Metadata } from "next";

import { GabaritExpertises } from "@/components/carottage/GabaritExpertises";
import { loadExpertises } from "@/lib/content/load-carottage";

export const metadata: Metadata = {
  title: "Expertises carottage, amiante/HAP enrobés & diagnostics avant travaux",
  description:
    "Métier, réglementation, HAP, obligations de repérage sur voirie et avant déconstruction : toutes les expertises de France Carottage sur le carottage d'enrobés, l'amiante, les HAP, le plomb et les termites.",
  alternates: { canonical: "/expertises" },
};

export default async function ExpertisesIndexPage() {
  const expertises = await loadExpertises();
  return <GabaritExpertises expertises={expertises} />;
}
