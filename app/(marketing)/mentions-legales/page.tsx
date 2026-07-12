{/* CONTENU À FAIRE VALIDER PAR SERVICIMMO avant bascule du domaine (v. spec §9 tranche 5). */}
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mentions légales",
  description: "Mentions légales du site Servicimmo — cabinet de diagnostic immobilier à Tours.",
};

export default function MentionsLegalesPage() {
  return (
    <article className="prose prose-neutral mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Mentions légales</h1>
      <p className="text-muted-foreground mt-3 text-sm">
        Dernière mise à jour : juillet 2026. Contenu repris des mentions légales publiées sur
        servicimmo.fr, complété pour la nouvelle plateforme.
      </p>

      <section className="mt-8 space-y-3">
        <h2 className="text-xl font-semibold">Éditeur du site</h2>
        <p className="text-muted-foreground text-sm leading-relaxed">
          Servicimmo — Diagnostic immobilier &amp; audit énergétique.
          <br />
          58 rue de la Chevalerie, 37100 Tours.
          <br />
          Téléphone : 02 47 47 01 23 — Email :{" "}
          <a href="mailto:info@servicimmo.fr" className="underline">
            info@servicimmo.fr
          </a>
          .
          <br />
          Forme juridique : Société Anonyme Simplifiée Unipersonnelle, unipersonnelle — capital
          social de 52 000 €.
          <br />
          SIREN : 433 994 563 — SIRET : [à compléter : code établissement (NIC) absent de la
          source, seul le SIREN y figure] — RCS 433994563.
          <br />
          N° TVA intracommunautaire : FR37 433994563.
          <br />
          Directeur de la publication : Jacques-Alexandre Lhotellier.
        </p>
      </section>

      <section className="mt-6 space-y-3">
        <h2 className="text-xl font-semibold">Hébergeur</h2>
        <p className="text-muted-foreground text-sm leading-relaxed">
          Site hébergé sur une infrastructure Coolify opérée par Propul&apos;seo (Lyes Triki
          &amp; Etienne Guimbard), prestataire technique de Servicimmo.
          <br />
          [à compléter : raison sociale, SIRET et adresse légale du fournisseur serveur
          sous-jacent, à préciser avant mise en production]
        </p>
      </section>

      <section className="mt-6 space-y-3">
        <h2 className="text-xl font-semibold">Assurance professionnelle</h2>
        <p className="text-muted-foreground text-sm leading-relaxed">
          Servicimmo est couvert par une assurance Responsabilité Civile Professionnelle (RCP)
          souscrite auprès d&apos;Allianz, conformément à la réglementation encadrant
          l&apos;activité de diagnostiqueur immobilier.
          <br />
          Numéro de police d&apos;assurance : [à compléter : non communiqué sur la source
          publique].
        </p>
      </section>

      <section className="mt-6 space-y-3">
        <h2 className="text-xl font-semibold">Certifications</h2>
        <p className="text-muted-foreground text-sm leading-relaxed">
          Nos diagnostiqueurs sont certifiés LCC Qualixpert et iCert, organismes de certification
          accrédités COFRAC (Comité français d&apos;accréditation), pour la réalisation des
          diagnostics immobiliers réglementaires (amiante, plomb, DPE, termites, gaz,
          électricité). Servicimmo est également référencé auprès de la FNAIM Diagnostic.
        </p>
      </section>

      <section className="mt-6 space-y-3">
        <h2 className="text-xl font-semibold">Propriété intellectuelle</h2>
        <p className="text-muted-foreground text-sm leading-relaxed">
          L&apos;ensemble des contenus de ce site (textes, logos, visuels) est la propriété de
          Servicimmo ou de ses partenaires, sauf mention contraire. Toute reproduction sans
          autorisation préalable est interdite.
        </p>
      </section>

      <section className="mt-6 space-y-3">
        <h2 className="text-xl font-semibold">Données personnelles</h2>
        <p className="text-muted-foreground text-sm leading-relaxed">
          Les données collectées via le formulaire de devis sont utilisées exclusivement pour
          traiter votre demande. Conformément au RGPD, vous disposez d&apos;un droit d&apos;accès,
          de rectification et de suppression que vous pouvez exercer par email à{" "}
          <a href="mailto:info@servicimmo.fr" className="underline">
            info@servicimmo.fr
          </a>
          .
        </p>
      </section>

      <section className="mt-6 space-y-3">
        <h2 className="text-xl font-semibold">Démarchage téléphonique</h2>
        <p className="text-muted-foreground text-sm leading-relaxed">
          Vous pouvez vous inscrire gratuitement sur la liste d&apos;opposition au démarchage
          téléphonique sur{" "}
          <a
            href="https://www.bloctel.gouv.fr"
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            www.bloctel.gouv.fr
          </a>
          .
        </p>
      </section>
    </article>
  );
}
