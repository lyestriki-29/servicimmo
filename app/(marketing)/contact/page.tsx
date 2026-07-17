import type { Metadata } from "next";
import { Ariane } from "@/components/marketing/pages/Ariane";
import { ContactExperience } from "@/components/marketing/pages/ContactExperience";
import { ContactAgence } from "@/components/marketing/pages/ContactFable";
import { ContactHeroVoileLeger } from "@/components/marketing/pages/ContactHeros";

export const metadata: Metadata = {
  title: "Contact — diagnostic immobilier à Tours",
  description:
    "Contactez Servicimmo : 02 47 47 01 23, 58 rue de la Chevalerie à Tours. Devis de diagnostic immobilier en ligne, réponse sous 2 h ouvrées.",
  alternates: { canonical: "/contact" },
};

/**
 * Direction retenue le 2026-07-17, après comparaison de 4 heros sur le rendu réel :
 * hero « voile allégé » (l'équipe reste visible à droite) + fiche agence + le vrai
 * formulaire. La carte de l'agence étant déjà dans la fiche, `avecCarte={false}`.
 */
export default function ContactPage() {
  return (
    <>
      <ContactHeroVoileLeger />
      <ContactAgence />
      <Ariane segments={[{ label: "Contact", href: "/contact" }]} />
      <ContactExperience avecCarte={false} />
    </>
  );
}
