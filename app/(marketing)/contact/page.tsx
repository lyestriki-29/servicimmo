import type { Metadata } from "next";
import { ClockIcon, MailIcon, MapPinIcon, PhoneIcon } from "lucide-react";

import { Ariane } from "@/components/marketing/pages/Ariane";
import { CarteZone } from "@/components/marketing/pages/CarteZone";
import { CtaDevis } from "@/components/marketing/pages/CtaDevis";
import { PageHero } from "@/components/marketing/pages/PageHero";
import { loadVilles } from "@/lib/content/load";

export const metadata: Metadata = {
  title: "Contact — diagnostic immobilier à Tours",
  description:
    "Contactez Servicimmo : 02 47 47 01 23, 58 rue de la Chevalerie à Tours. Devis de diagnostic immobilier en ligne, réponse sous 2 h ouvrées.",
  alternates: { canonical: "/contact" },
};

const COORDONNEES = [
  {
    icone: PhoneIcon, titre: "02 47 47 01 23",
    detail: "Lun–Ven 9h–12h / 14h–19h", href: "tel:+33247470123",
  },
  {
    icone: MailIcon, titre: "info@servicimmo.fr",
    detail: "Réponse sous 2 h ouvrées", href: "mailto:info@servicimmo.fr",
  },
  {
    icone: MapPinIcon, titre: "58 rue de la Chevalerie, 37100 Tours",
    detail: "Accueil sur rendez-vous", href: undefined,
  },
  {
    icone: ClockIcon, titre: "Intervention sous 48 h",
    detail: "Dans toute l'Indre-et-Loire", href: undefined,
  },
] as const;

export default async function ContactPage() {
  const villes = await loadVilles();
  return (
    <>
      <PageHero
        surtitre="Contact"
        titre="Parlons de votre projet"
        description="Le plus rapide : notre questionnaire en ligne (devis sous 2 h ouvrées). Pour tout le reste, appelez-nous ou écrivez-nous."
      />
      <Ariane segments={[{ label: "Contact", href: "/contact" }]} />
      <section className="mx-auto max-w-[var(--container,1280px)] px-6 py-8 md:px-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {COORDONNEES.map(({ icone: Icone, titre, detail, href }) => {
            const contenu = (
              <>
                <Icone className="h-5 w-5 shrink-0 text-[color:var(--color-si-petrole)]" aria-hidden />
                <div>
                  <p className="font-[family-name:var(--font-sora)] text-[14.5px] font-semibold text-[color:var(--color-home-ink)]">{titre}</p>
                  <p className="mt-1 text-[13px] text-[color:var(--color-home-slate)]">{detail}</p>
                </div>
              </>
            );
            const classes =
              "flex items-start gap-3 rounded-[12px] border border-[color:var(--color-home-line)] bg-white p-5 transition-shadow hover:shadow-[0_10px_24px_rgba(15,30,58,.07)]";
            return href ? (
              <a key={titre} href={href} className={classes}>{contenu}</a>
            ) : (
              <div key={titre} className={classes}>{contenu}</div>
            );
          })}
        </div>
      </section>
      <section className="mx-auto max-w-[var(--container,1280px)] px-6 py-4 md:px-8">
        <h2 className="mb-5 font-[family-name:var(--font-sora)] text-[20px] font-bold text-[color:var(--color-home-ink)]">
          Notre zone d'intervention
        </h2>
        <CarteZone villes={villes.map(({ slug, ville, lat, lng }) => ({ slug, ville, lat, lng }))} hauteur={360} />
      </section>
      <CtaDevis titre="Le plus simple : décrivez votre bien" />
    </>
  );
}
