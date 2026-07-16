{
  /* CONTENU À FAIRE VALIDER PAR SERVICIMMO avant bascule du domaine (v. spec §9 tranche 5). */
}
import type { Metadata } from "next";
import Link from "next/link";

import {
  LegalDocument,
  LegalHero,
  type LegalSection,
} from "@/components/marketing/pages/ValidatedPageDesigns";

export const metadata: Metadata = {
  title: "Conditions Générales de Vente",
  description:
    "CGV Servicimmo — conditions contractuelles applicables aux prestations de diagnostic immobilier.",
};

export default function CGVPage() {
  const sections: LegalSection[] = [
    {
      id: "objet",
      title: "Article 1 — Objet",
      content: (
        <p>
          Les présentes Conditions Générales de Vente régissent les rapports entre Servicimmo et ses
          clients, particuliers ou professionnels, dans le cadre de la réalisation de diagnostics
          immobiliers réglementaires (DPE, amiante, plomb, termites, gaz, électricité, mesurages
          Carrez/Boutin, ERP, état des lieux) et de prestations d&apos;audit énergétique. Toute
          commande implique l&apos;acceptation sans réserve des présentes CGV.
        </p>
      ),
    },
    {
      id: "devis",
      title: "Article 2 — Devis et commande",
      content: (
        <p>
          Le questionnaire en ligne fournit une estimation indicative de prix, calculée à partir des
          caractéristiques du bien déclarées par le client. Cette estimation ne constitue pas un
          engagement contractuel. Un devis définitif, tenant compte des diagnostics effectivement
          requis, est transmis par Servicimmo sous 2 heures ouvrées après validation de la demande.
          La commande est considérée comme ferme à réception, par Servicimmo, de l&apos;acceptation
          du devis par le client (signature électronique, retour écrit ou validation orale confirmée
          par email).
        </p>
      ),
    },
    {
      id: "tarifs",
      title: "Article 3 — Tarifs",
      content: (
        <p>
          Les tarifs affichés sur le site (simulateur de devis) sont indicatifs et exprimés en euros
          TTC. Le prix définitif, qui peut varier selon la surface du bien, le nombre de diagnostics
          combinés et les contraintes d&apos;accès, figure exclusivement sur le devis signé par le
          client. Sauf mention contraire, les prix n&apos;incluent pas de frais de déplacement
          supplémentaires en dehors de la zone d&apos;intervention habituelle (Indre-et-Loire).
        </p>
      ),
    },
    {
      id: "paiement",
      title: "Article 4 — Modalités de paiement",
      content: (
        <p>
          Le règlement s&apos;effectue selon les modalités précisées sur la facture (virement,
          chèque ou carte bancaire). Sauf accord contraire écrit, tout retard de paiement entraîne
          de plein droit l&apos;application de pénalités au taux d&apos;intérêt légal en vigueur
          majoré de 10 points, ainsi qu&apos;une indemnité forfaitaire de recouvrement de 40 €,
          conformément à l&apos;article L441-10 du Code de commerce.
        </p>
      ),
    },
    {
      id: "execution",
      title: "Article 5 — Exécution des prestations",
      content: (
        <p>
          Servicimmo s&apos;engage à intervenir sous 48 heures à compter de la validation du
          rendez-vous, sous réserve de disponibilité et d&apos;accès au bien. Les rapports de
          diagnostic sont établis par des diagnostiqueurs certifiés et transmis au client au format
          électronique (PDF). Le client s&apos;engage à fournir un accès complet au bien à
          diagnostiquer et à signaler toute information utile (présence de matériaux dangereux
          connus, restrictions d&apos;accès, etc.).
        </p>
      ),
    },
    {
      id: "retractation",
      title: "Article 6 — Droit de rétractation",
      content: (
        <p>
          Conformément aux articles L221-18 et suivants du Code de la consommation, tout client
          particulier ayant conclu la commande à distance (site internet, téléphone) dispose
          d&apos;un délai de 14 jours pour exercer son droit de rétractation, sans avoir à justifier
          de motif. Ce droit ne peut toutefois plus être exercé, conformément à l&apos;article
          L221-28, dès lors que la prestation a été pleinement exécutée avant la fin de ce délai, à
          la demande expresse et préalable du client — situation fréquente pour les diagnostics liés
          à une échéance de vente ou de location.
        </p>
      ),
    },
    {
      id: "responsabilite",
      title: "Article 7 — Responsabilité et assurance",
      content: (
        <p>
          Servicimmo est couvert par une assurance Responsabilité Civile Professionnelle souscrite
          auprès d&apos;Allianz (voir <Link href="/mentions-legales">mentions légales</Link>). Les
          diagnostics sont réalisés dans le respect des normes en vigueur au jour de la visite, dans
          la limite des éléments visibles et accessibles sans destruction ni sondage destructif,
          sauf mission spécifique contraire prévue au devis.
        </p>
      ),
    },
    {
      id: "litiges",
      title: "Article 8 — Litiges et médiation",
      content: (
        <p>
          Les présentes CGV sont soumises au droit français. En cas de litige, le client est invité
          à contacter en priorité Servicimmo pour une résolution amiable. Conformément à
          l&apos;article L616-1 du Code de la consommation, tout client particulier peut également
          recourir gratuitement à un médiateur de la consommation. [à compléter : nom et coordonnées
          du médiateur de la consommation compétent, obligatoire avant mise en production]. À défaut
          de résolution amiable, les tribunaux compétents seront ceux déterminés par les règles de
          droit commun applicables.
        </p>
      ),
    },
  ];

  return (
    <>
      <LegalHero
        title={
          <>
            Des engagements clairs.{" "}
            <span className="text-[color:var(--color-home-saf)]">Avant chaque intervention.</span>
          </>
        }
        description="Commande, intervention, paiement et responsabilités : les conditions applicables sont accessibles avant votre validation."
        sections={sections.map((section) => section.title)}
      />
      <LegalDocument
        intro="Les présentes CGV s'appliquent aux prestations de diagnostic immobilier commandées auprès de Servicimmo (58 rue de la Chevalerie, 37100 Tours — SIREN 433 994 563), quel que soit le canal de commande : site internet, téléphone ou e-mail."
        sections={sections}
      />
    </>
  );
}
