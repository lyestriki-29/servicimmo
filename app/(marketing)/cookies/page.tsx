import type { Metadata } from "next";
import Link from "next/link";

import {
  LegalDocument,
  LegalHero,
  type LegalSection,
} from "@/components/marketing/pages/ValidatedPageDesigns";
import { MapConsentToggle } from "@/components/rgpd/MapConsentToggle";

export const metadata: Metadata = {
  title: "Cookies et cartes",
  description:
    "Ce que ce site dépose sur votre appareil, par qui, pourquoi — et comment retirer votre accord aux cartes Google.",
  alternates: { canonical: "/cookies" },
};

export default function CookiesPage() {
  const sections: LegalSection[] = [
    {
      id: "resume",
      title: "En résumé",
      content: (
        <p>
          Ce site ne vous piste pas. Il n&apos;utilise ni Google Analytics, ni régie publicitaire, ni
          bouton de réseau social traçant. Les polices d&apos;écriture sont servies depuis notre
          propre serveur, et non depuis Google. Un seul élément fait appel à un tiers : les cartes
          Google Maps — et elles ne se chargent que si vous le demandez.
        </p>
      ),
    },
    {
      id: "cartes-google",
      title: "Cartes Google Maps",
      content: (
        <>
          <p>
            Nos pages Zones, Contact et nos pages communes peuvent afficher une carte fournie par
            Google. Tant que vous ne cliquez pas sur « Afficher la carte », rien n&apos;est envoyé à
            Google : à la place, un encart inerte occupe l&apos;emplacement.
          </p>
          <p>
            Si vous l&apos;affichez, Google reçoit votre adresse IP et les informations techniques de
            votre navigateur, et peut déposer des cookies sur votre appareil selon ses propres
            règles. Votre accord est alors mémorisé <strong>six mois</strong> dans le stockage local
            de votre navigateur (et non dans un cookie), sous la clé{" "}
            <code>si-consent-maps</code>, pour ne pas avoir à vous le redemander à chaque page.
          </p>
          <p>
            Vous pouvez consulter une carte sans rien accepter ici : le lien « Ouvrir dans Google
            Maps » de chaque encart vous emmène directement sur le site de Google.
          </p>
          <MapConsentToggle />
        </>
      ),
    },
    {
      id: "strictement-necessaires",
      title: "Cookies strictement nécessaires",
      content: (
        <p>
          Un cookie de session peut être déposé par notre hébergeur de base de données (Supabase)
          pour maintenir votre parcours de demande de devis d&apos;une étape à l&apos;autre. Il est
          déposé par notre propre domaine, ne sert à aucun suivi publicitaire, et disparaît à la fin
          de votre session. La réglementation dispense ce type de cookie de consentement préalable :
          sans lui, le service que vous demandez ne fonctionnerait pas.
        </p>
      ),
    },
    {
      id: "brouillon-devis",
      title: "Votre demande de devis en cours",
      content: (
        <p>
          Pendant que vous remplissez le questionnaire de devis, vos réponses sont conservées dans le
          stockage local de votre navigateur afin que vous puissiez fermer la page et reprendre où
          vous en étiez. Ces données restent sur votre appareil tant que vous n&apos;avez pas envoyé
          la demande. Vider les données de navigation les efface.
        </p>
      ),
    },
    {
      id: "vos-droits",
      title: "Vos droits",
      content: (
        <p>
          Vous pouvez retirer votre accord aux cartes à tout moment depuis cette page, aussi
          simplement que vous l&apos;avez donné. Pour toute question sur vos données, écrivez-nous à{" "}
          <a href="mailto:info@servicimmo.fr">info@servicimmo.fr</a>. Le détail du traitement de vos
          données figure dans nos{" "}
          <Link href="/mentions-legales">mentions légales</Link>.
        </p>
      ),
    },
  ];

  return (
    <>
      <LegalHero
        title={
          <>
            Ce qu&apos;on dépose.{" "}
            <span className="text-[color:var(--color-home-saf)]">Et ce qu&apos;on ne dépose pas.</span>
          </>
        }
        description="Un seul tiers sur ce site : les cartes Google, et seulement si vous les demandez. Le reste est chez nous."
        sections={sections.map((section) => section.title)}
      />
      <LegalDocument
        intro="Cette page liste ce qui est enregistré sur votre appareil quand vous naviguez ici, qui le dépose, pourquoi, et comment revenir sur votre choix."
        sections={sections}
      />
    </>
  );
}
