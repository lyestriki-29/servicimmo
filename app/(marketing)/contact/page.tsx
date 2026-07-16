import type { Metadata } from "next";
import { Ariane } from "@/components/marketing/pages/Ariane";
import { ContactExperience } from "@/components/marketing/pages/ContactExperience";
import { ContactLocalHero } from "@/components/marketing/pages/ValidatedPageDesigns";

export const metadata: Metadata = {
  title: "Contact — diagnostic immobilier à Tours",
  description:
    "Contactez Servicimmo : 02 47 47 01 23, 58 rue de la Chevalerie à Tours. Devis de diagnostic immobilier en ligne, réponse sous 2 h ouvrées.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <>
      <ContactLocalHero />
      <Ariane segments={[{ label: "Contact", href: "/contact" }]} />
      <ContactExperience />
    </>
  );
}
