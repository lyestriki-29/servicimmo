import type { Metadata } from "next";
import { ClockIcon, MailIcon, MapPinIcon, PhoneIcon } from "lucide-react";

import { ArianeFC } from "@/components/carottage/ArianeFC";
import { CtaDevisFC } from "@/components/carottage/CtaDevisFC";
import { SurtitreFC } from "@/components/carottage/SurtitreFC";
import { francecarottageConfig } from "@/lib/clients/francecarottage/config";

export const metadata: Metadata = {
  title: "Contact — France Carottage",
  description:
    "Contactez France Carottage pour vos chantiers de carottage et repérage amiante/HAP sur enrobés. Interventions partout en France, devis sous 24 h ouvrées.",
  alternates: { canonical: "/contact" },
};

const c = francecarottageConfig;
const COORDONNEES = [
  { icone: PhoneIcon, titre: c.contact.telephone, detail: "Du lundi au vendredi", href: c.contact.telephoneHref },
  { icone: MailIcon, titre: c.contact.email, detail: "Réponse sous 24 h ouvrées", href: `mailto:${c.contact.email}` },
  {
    icone: MapPinIcon,
    titre: `${c.adresse.ligne1}, ${c.adresse.codePostal} ${c.adresse.ville}`,
    detail: "Siège — interventions nationales",
    href: undefined,
  },
  { icone: ClockIcon, titre: "Intervention sous 24-48 h", detail: c.zoneIntervention, href: undefined },
] as const;

export default function ContactPageFC() {
  return (
    <>
      <section className="border-b border-[color:var(--fc-gris-clair)] bg-white">
        <div className="mx-auto max-w-[var(--container,1280px)] px-6 py-12 md:px-8">
          <SurtitreFC>Contact</SurtitreFC>
          <h1 className="mt-4 max-w-2xl font-[family-name:var(--font-sora)] text-[clamp(34px,3.5vw,42px)] font-extrabold leading-tight tracking-[-0.02em] text-balance text-[color:var(--fc-noir)]">
            Parlons de votre chantier.
          </h1>
        </div>
      </section>
      <ArianeFC segments={[{ label: "Contact", href: "/contact" }]} />
      <section className="mx-auto max-w-[var(--container,1280px)] px-6 py-10 md:px-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {COORDONNEES.map(({ icone: Icone, titre, detail, href }) => {
            const inner = (
              <>
                <Icone className="h-5 w-5 shrink-0 text-[color:var(--fc-rouge)]" aria-hidden />
                <div>
                  <p className="font-[family-name:var(--font-sora)] text-[14px] font-bold text-[color:var(--fc-noir)]">
                    {titre}
                  </p>
                  <p className="mt-1 text-[13px] text-[color:var(--fc-gris)]">{detail}</p>
                </div>
              </>
            );
            const cls =
              "flex items-start gap-3 border-t-2 border-[color:var(--fc-gris-clair)] bg-white p-5 transition-colors hover:border-[color:var(--fc-rouge)]";
            return href ? (
              <a key={titre} href={href} className={cls}>
                {inner}
              </a>
            ) : (
              <div key={titre} className={cls}>
                {inner}
              </div>
            );
          })}
        </div>
      </section>
      <CtaDevisFC titre="Le plus simple : décrivez votre chantier" />
    </>
  );
}
