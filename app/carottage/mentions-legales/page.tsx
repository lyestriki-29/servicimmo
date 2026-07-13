import type { Metadata } from "next";

import { ArianeFC } from "@/components/carottage/ArianeFC";
import { SurtitreFC } from "@/components/carottage/SurtitreFC";
import { francecarottageConfig } from "@/lib/clients/francecarottage/config";

export const metadata: Metadata = {
  title: "Mentions légales — France Carottage",
  description: "Mentions légales du site France Carottage : éditeur, hébergeur, propriété intellectuelle.",
  alternates: { canonical: "/mentions-legales" },
  robots: { index: false, follow: true },
};

/* CONTENU À FAIRE VALIDER PAR ETIENNE avant bascule DNS (spec §13).
   Données reprises des mentions légales du site actuel : responsable de
   publication Jacques-Alexandre Lhotellier, SIREN, adresse, email. */
export default function MentionsLegalesFC() {
  const c = francecarottageConfig;
  return (
    <>
      <section className="border-b border-[color:var(--fc-gris-clair)] bg-white">
        <div className="mx-auto max-w-[var(--container,1280px)] px-6 py-12 md:px-8">
          <SurtitreFC>Légal</SurtitreFC>
          <h1 className="mt-4 font-[family-name:var(--font-sora)] text-[30px] font-extrabold tracking-[-0.02em] text-[color:var(--fc-noir)] sm:text-[38px]">
            Mentions légales
          </h1>
        </div>
      </section>
      <ArianeFC segments={[{ label: "Mentions légales", href: "/mentions-legales" }]} />
      <article className="fc-prose mx-auto max-w-3xl px-6 py-8 md:px-8">
        <h2>Éditeur</h2>
        <p>
          {c.raisonSociale} — SIREN 433 994 563. {c.adresse.ligne1}, {c.adresse.codePostal}{" "}
          {c.adresse.ville}. Téléphone : {c.contact.telephone}. Email : {c.contact.email}.
          Responsable de publication : Jacques-Alexandre Lhotellier.
        </p>
        <h2>Hébergeur</h2>
        <p>Site hébergé sur l’infrastructure Coolify de Propul’seo (à préciser avant mise en prod).</p>
        <h2>Propriété intellectuelle</h2>
        <p>
          L’ensemble des contenus (textes, visuels, logos) est la propriété de {c.raisonSociale},
          sauf mention contraire. Toute reproduction sans autorisation est interdite.
        </p>
        <h2>Données personnelles</h2>
        <p>
          Les informations transmises via le formulaire de devis servent uniquement au traitement
          de votre demande. Vous disposez d’un droit d’accès et de suppression en écrivant à{" "}
          {c.contact.email}.
        </p>
      </article>
    </>
  );
}
