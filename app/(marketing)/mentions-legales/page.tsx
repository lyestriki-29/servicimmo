{
  /* CONTENU À FAIRE VALIDER PAR SERVICIMMO avant bascule du domaine (v. spec §9 tranche 5). */
}
import type { Metadata } from "next";

import {
  LegalDocument,
  LegalHero,
  type LegalSection,
} from "@/components/marketing/pages/ValidatedPageDesigns";

export const metadata: Metadata = {
  title: "Mentions légales",
  description: "Mentions légales du site Servicimmo — cabinet de diagnostic immobilier à Tours.",
};

export default function MentionsLegalesPage() {
  const sections: LegalSection[] = [
    {
      id: "editeur",
      title: "Éditeur du site",
      content: (
        <p>
          Servicimmo — Diagnostic immobilier &amp; audit énergétique.
          <br />
          58 rue de la Chevalerie, 37100 Tours.
          <br />
          Téléphone : 02 47 47 01 23 — Email :{" "}
          <a href="mailto:info@servicimmo.fr">info@servicimmo.fr</a>.<br />
          Forme juridique : Société par actions simplifiée unipersonnelle — capital social de 52 000
          €.
          <br />
          SIREN : 433 994 563 — SIRET : [à compléter : code établissement absent de la source] — RCS
          433994563.
          <br />
          N° TVA intracommunautaire : FR37 433994563.
          <br />
          Directeur de la publication : Jacques-Alexandre Lhotellier.
        </p>
      ),
    },
    {
      id: "hebergeur",
      title: "Hébergeur",
      content: (
        <p>
          OVH SAS, société par actions simplifiée au capital de 50 000 000 €.
          <br />
          2 rue Kellermann, 59100 Roubaix, France.
          <br />
          RCS Lille Métropole 424 761 419 — N° TVA intracommunautaire : FR 22 424 761 419.
          <br />
          Site web :{" "}
          <a href="https://www.ovhcloud.com" target="_blank" rel="noopener noreferrer">
            www.ovhcloud.com
          </a>
          .
          <br />
          L&apos;infrastructure est administrée pour le compte de Servicimmo par Propul&apos;seo
          (Lyes Triki &amp; Etienne Guimbard), prestataire technique.
        </p>
      ),
    },
    {
      id: "assurance",
      title: "Assurance professionnelle",
      content: (
        <p>
          Servicimmo est couvert par une assurance Responsabilité Civile Professionnelle souscrite
          auprès d&apos;Allianz, conformément à la réglementation encadrant l&apos;activité de
          diagnostiqueur immobilier.
          <br />
          Numéro de police : [à compléter : non communiqué sur la source publique].
        </p>
      ),
    },
    {
      id: "certifications",
      title: "Certifications",
      content: (
        <p>
          Nos diagnostiqueurs sont certifiés LCC Qualixpert et iCert, organismes accrédités COFRAC,
          pour la réalisation des diagnostics immobiliers réglementaires. Servicimmo est également
          référencé auprès de la FNAIM Diagnostic.
        </p>
      ),
    },
    {
      id: "propriete-intellectuelle",
      title: "Propriété intellectuelle",
      content: (
        <p>
          L&apos;ensemble des contenus de ce site — textes, logos et visuels — est la propriété de
          Servicimmo ou de ses partenaires, sauf mention contraire. Toute reproduction sans
          autorisation préalable est interdite.
        </p>
      ),
    },
    {
      id: "donnees-personnelles",
      title: "Données personnelles",
      content: (
        <p>
          Les données collectées via le formulaire de devis sont utilisées exclusivement pour
          traiter votre demande. Conformément au RGPD, vous disposez d&apos;un droit d&apos;accès,
          de rectification et de suppression que vous pouvez exercer à{" "}
          <a href="mailto:info@servicimmo.fr">info@servicimmo.fr</a>.
        </p>
      ),
    },
    {
      id: "demarchage",
      title: "Démarchage téléphonique",
      content: (
        <p>
          Vous pouvez vous inscrire gratuitement sur la liste d&apos;opposition au démarchage
          téléphonique sur{" "}
          <a href="https://www.bloctel.gouv.fr" target="_blank" rel="noopener noreferrer">
            www.bloctel.gouv.fr
          </a>
          .
        </p>
      ),
    },
  ];

  return (
    <>
      <LegalHero
        title={
          <>
            Lisible. Vérifiable.{" "}
            <span className="text-[color:var(--color-home-saf)]">Sans petites lignes.</span>
          </>
        }
        description="Les informations légales, les certifications et le traitement des données sont réunis dans une lecture claire et versionnée."
        sections={sections.map((section) => section.title)}
      />
      <LegalDocument
        intro="Toutes les informations permettant d’identifier l’éditeur, ses responsabilités et l’utilisation de vos données sont regroupées dans ce document."
        sections={sections}
      />
    </>
  );
}
