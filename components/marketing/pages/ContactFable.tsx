import { ArrowRightIcon, MapPinIcon } from "lucide-react";

import { GoogleMapEmbed } from "@/components/marketing/pages/GoogleMapEmbed";
import { KickerMono } from "@/components/marketing/pages/ValidatedPageDesigns";

const HORAIRES = [
  { jours: "Lundi – Vendredi", plages: "9 h – 12 h · 14 h – 19 h" },
  { jours: "Samedi & dimanche", plages: "Interventions sur rendez-vous" },
] as const;

/**
 * La fiche agence de /contact : carte Google Maps + horaires.
 *
 * `-mt-14` : elle mord sur le hero (d'où le `z-10`). Le formulaire, lui, reste
 * `ContactExperience`, qui porte la vraie logique d'envoi — le motif choisi
 * voyage avec la demande (corrigé en revue). Cette fiche portant déjà la carte,
 * `ContactExperience` est rendu `avecCarte={false}` : deux Google Maps sur une
 * page, ce serait deux chargements et deux transmissions d'IP à Google.
 */
export function ContactAgence() {
  return (
    <div className="bg-white">
      <section className="relative z-10 mx-auto -mt-14 max-w-[var(--container,1280px)] px-6 pb-16 md:px-8 lg:-mt-20 lg:pb-24">
        <div className="grid overflow-hidden rounded-[16px] border border-[color:var(--color-home-line)] bg-white shadow-[0_18px_44px_rgba(15,30,58,.14)] lg:grid-cols-[1.15fr_.85fr]">
          <div className="relative min-h-[360px]">
            <GoogleMapEmbed
              query="58 rue de la Chevalerie, 37100 Tours, France"
              zoom={15}
              title="Carte de l’agence Servicimmo à Tours"
              className="min-h-[360px]"
            />
            <p className="pointer-events-none absolute top-4 left-4 rounded-full bg-[color:var(--color-home-ink)] px-4 py-2.5 text-[11.5px] font-semibold text-white shadow-[0_8px_20px_rgba(15,30,58,.3)]">
              <MapPinIcon className="mr-1.5 inline h-3.5 w-3.5 text-[color:var(--color-home-saf)]" aria-hidden />
              58 rue de la Chevalerie · Tours
            </p>
          </div>
          <div className="p-7 sm:p-9">
            <KickerMono>Venir à l’agence</KickerMono>
            <h2 className="mt-3 font-[family-name:var(--font-sora)] text-[clamp(22px,2.4vw,30px)] font-extrabold tracking-[-0.02em] text-[color:var(--color-home-ink)]">
              Accueil sur rendez-vous.
            </h2>
            <div className="mt-6 divide-y divide-[color:var(--color-home-line)] border-y border-[color:var(--color-home-line)]">
              {HORAIRES.map((ligne) => (
                <div key={ligne.jours} className="flex flex-wrap items-baseline justify-between gap-2 py-4">
                  <p className="font-[family-name:var(--font-sora)] text-[14px] font-bold text-[color:var(--color-home-ink)]">
                    {ligne.jours}
                  </p>
                  <p className="font-mono text-[11.5px] font-bold tracking-[.04em] text-[color:var(--color-home-muted-2)]">
                    {ligne.plages}
                  </p>
                </div>
              ))}
            </div>
            <p className="mt-6 text-[13px] leading-[1.75] text-[color:var(--color-home-muted-2)]">
              Le dépôt de documents et la remise de rapports se font aussi par e-mail — la visite
              n’est jamais obligatoire.
            </p>
            <a
              href="mailto:info@servicimmo.fr"
              className="group mt-6 inline-flex items-center gap-2 text-[13.5px] font-bold text-[color:var(--color-si-petrole)]"
            >
              info@servicimmo.fr
              <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-1.5" aria-hidden />
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
