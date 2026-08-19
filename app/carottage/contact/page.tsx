import type { Metadata } from "next";

import { GabaritContact } from "@/components/carottage/GabaritContact";

export const metadata: Metadata = {
  title: "Contact — France Carottage",
  description:
    "Contactez France Carottage pour vos chantiers de carottage et repérage amiante/HAP sur enrobés. Interventions partout en France, devis sous 24 h ouvrées.",
  alternates: { canonical: "/contact" },
};

export default function ContactPageFC() {
  return <GabaritContact />;
}
