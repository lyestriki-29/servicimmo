import Image from "next/image";
import Link from "next/link";
import {
  ArrowRightIcon, Building2Icon, ClipboardCheckIcon, CrosshairIcon,
  FileTextIcon, HomeIcon, WrenchIcon,
} from "lucide-react";

import { KickerMono } from "@/components/marketing/pages/ValidatedPageDesigns";
import type { Service } from "@/lib/content/schemas";

/**
 * Direction Fable de /services, portée sur le VRAI contenu (les 20 fiches).
 * Le gabarit du labo (`GabaritServices`) travaille sur 4 items de démo : il ne
 * pouvait pas être réutilisé tel quel. Écarts assumés du portage :
 *  - le « relevé du catalogue » du hero montre les 6 premiers services (par
 *    `ordre`) + le reste en compteur : 20 lignes dans un panneau de verre
 *    dépoli seraient illisibles ;
 *  - `item.meta` du labo (une famille Énergie/Santé/Sécurité) n'existe pas au
 *    schéma. On affiche `obligatoirePour`, qui dit au visiteur QUAND le
 *    diagnostic s'impose — l'info la plus utile à cet endroit.
 */

const PROJETS = [
  { label: "Je vends", detail: "Le dossier complet avant compromis : rien ne bloque chez le notaire.", icon: HomeIcon },
  { label: "Je loue", detail: "Bail sécurisé, locataire informé, obligations à jour.", icon: FileTextIcon },
  { label: "Je fais des travaux", detail: "Amiante et plomb repérés avant l’ouverture du chantier.", icon: WrenchIcon },
  { label: "Je gère une copropriété", detail: "Parties communes et obligations collectives planifiées.", icon: Building2Icon },
] as const;

const METHODE = [
  { etape: "Décrire", detail: "Votre bien en 2 minutes, en ligne ou au téléphone. Devis sous 2 h ouvrées." },
  { etape: "Intervenir", detail: "Un technicien certifié, un seul passage pour tous les contrôles compatibles." },
  { etape: "Expliquer", detail: "Le rapport commenté, et une équipe joignable après la remise." },
] as const;

const capitalize = (v: string) => v.charAt(0).toUpperCase() + v.slice(1);
const quand = (s: Service) =>
  s.obligatoirePour.length ? s.obligatoirePour.map(capitalize).join(" · ") : "Selon le projet";

export function ServicesFable({ services }: { services: Service[] }) {
  const apercu = services.slice(0, 6);
  const reste = services.length - apercu.length;

  return (
    <div className="bg-white">
      {/* Hero stratifié : photo voilée + relevé du catalogue en verre dépoli */}
      <section className="relative overflow-hidden bg-[color:var(--color-home-ink)]">
        <Image
          src="/img/si/proj2.jpg"
          alt="Immeuble résidentiel contemporain"
          fill
          sizes="100vw"
          className="object-cover"
          priority
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-r from-[color:var(--color-home-ink)]/92 via-[color:var(--color-home-ink)]/70 to-[color:var(--color-home-ink)]/35"
        />
        <p className="absolute top-6 right-6 hidden font-mono text-[10px] font-bold tracking-[.2em] text-white/55 uppercase lg:block">
          Catalogue {services.length} expertises · Indre-et-Loire
        </p>
        <div className="relative mx-auto grid max-w-[var(--container,1280px)] items-center gap-12 px-6 pt-16 pb-24 md:px-8 lg:grid-cols-[1.05fr_.95fr] lg:gap-14 lg:pt-24 lg:pb-32">
          <div>
            <KickerMono clair>Nos expertises</KickerMono>
            <h1 className="mt-5 font-[family-name:var(--font-sora)] text-[clamp(42px,5.6vw,80px)] leading-[.98] font-extrabold tracking-[-0.04em] text-balance text-white">
              Tous vos diagnostics,{" "}
              <span className="text-[color:var(--color-si-lime)]">un seul interlocuteur</span>
            </h1>
            <p className="mt-7 max-w-[54ch] border-t border-white/25 pt-6 text-[16.5px] leading-[1.75] text-white/82">
              Vente, location, travaux ou copropriété : identifiez rapidement les contrôles
              nécessaires à votre projet.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-5">
              <a
                href="#catalogue"
                className="inline-flex min-h-12 items-center gap-2 rounded-full bg-[color:var(--color-si-lime)] px-6 text-[13.5px] font-bold text-[color:var(--color-home-ink)] transition-transform hover:-translate-y-0.5"
              >
                Explorer le catalogue <ArrowRightIcon className="h-4 w-4" aria-hidden />
              </a>
              <p className="text-[12.5px] font-semibold text-white/70">
                {services.length} expertises · une seule intervention
              </p>
            </div>
          </div>
          <div className="relative hidden rounded-[18px] border border-white/15 bg-[color:var(--color-home-ink)]/72 p-8 backdrop-blur-md lg:block">
            <KickerMono clair>Relevé du catalogue</KickerMono>
            <div className="mt-4 divide-y divide-white/12">
              {apercu.map((service, index) => (
                <Link
                  key={service.slug}
                  href={`/services/${service.slug}`}
                  className="flex items-center gap-4 py-4 transition-opacity hover:opacity-80"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/25">
                    <CrosshairIcon className="h-3.5 w-3.5 text-[color:var(--color-si-lime)]" aria-hidden />
                  </span>
                  <div className="min-w-0">
                    <p className="font-mono text-[9.5px] font-bold tracking-[.15em] text-white/50 uppercase">
                      {String(index + 1).padStart(2, "0")} · {quand(service)}
                    </p>
                    <p className="mt-0.5 truncate font-[family-name:var(--font-sora)] text-[15px] font-bold text-white">
                      {service.titre}
                    </p>
                  </div>
                  <ArrowRightIcon className="ml-auto h-4 w-4 shrink-0 text-white/30" aria-hidden />
                </Link>
              ))}
            </div>
            <p className="mt-4 border-t border-[color:var(--color-si-lime)]/40 pt-3 font-mono text-[9.5px] tracking-[.14em] text-white/45 uppercase">
              {reste > 0 ? `Et ${reste} autres · regroupables en un passage` : "Regroupables en un seul passage"}
            </p>
          </div>
        </div>
      </section>

      {/* Chevauchement : les 4 projets mordent sur le hero */}
      <section className="relative z-10 mx-auto -mt-14 max-w-[var(--container,1280px)] px-6 md:px-8 lg:-mt-20">
        <div className="grid overflow-hidden rounded-[16px] border border-[color:var(--color-home-line)] bg-white shadow-[0_18px_44px_rgba(15,30,58,.14)] sm:grid-cols-2 lg:grid-cols-4">
          {PROJETS.map((projet, index) => {
            const Icon = projet.icon;
            return (
              <a
                key={projet.label}
                href="#catalogue"
                className="group border-b border-[color:var(--color-home-line)] p-6 transition-colors last:border-b-0 hover:bg-[color:var(--color-si-creme)] sm:border-r sm:nth-[2n]:border-r-0 lg:border-b-0 lg:last:border-r-0 lg:nth-[2n]:border-r"
              >
                <div className="flex items-center justify-between">
                  <Icon className="h-5 w-5 text-[color:var(--color-si-petrole)]" aria-hidden />
                  <span className="font-mono text-[10px] font-bold text-[color:var(--color-home-muted)]">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </div>
                <p className="mt-7 font-[family-name:var(--font-sora)] text-[16px] font-bold text-[color:var(--color-home-ink)]">
                  {projet.label}
                </p>
                <p className="mt-2 text-[12.5px] leading-relaxed text-[color:var(--color-home-muted-2)]">
                  {projet.detail}
                </p>
                <ArrowRightIcon
                  className="mt-5 h-4 w-4 text-[color:var(--color-si-petrole)] transition-transform group-hover:translate-x-1.5"
                  aria-hidden
                />
              </a>
            );
          })}
        </div>
      </section>

      {/* Catalogue : panneau encre + lignes blanches — les 20 fiches réelles */}
      <section
        id="catalogue"
        className="mx-auto max-w-[var(--container,1280px)] scroll-mt-32 px-6 py-16 md:px-8 lg:py-24"
      >
        <div className="grid overflow-hidden rounded-[16px] bg-[color:var(--color-home-ink)] lg:grid-cols-[340px_minmax(0,1fr)]">
          <div className="flex flex-col justify-between px-7 py-9 text-white sm:px-9 lg:py-11">
            <div>
              <ClipboardCheckIcon className="h-7 w-7 text-[color:var(--color-si-lime)]" aria-hidden />
              <h2 className="mt-6 font-[family-name:var(--font-sora)] text-[26px] leading-tight font-extrabold text-balance">
                Le bon diagnostic, au bon moment.
              </h2>
              <p className="mt-4 text-[14px] leading-[1.7] text-white/74">
                Nous regroupons les contrôles compatibles en une seule intervention et expliquons
                chaque résultat.
              </p>
            </div>
            <p className="mt-9 border-t border-white/20 pt-5 text-[12.5px] font-semibold text-white/82">
              Techniciens certifiés · Rapports expliqués · Intervention locale
            </p>
          </div>
          <div className="divide-y divide-[color:var(--color-home-line)] bg-white">
            {services.map((service) => (
              <Link
                key={service.slug}
                href={`/services/${service.slug}`}
                className="group grid min-h-28 items-center gap-x-8 gap-y-1 px-6 py-6 transition-colors hover:bg-[color:var(--color-home-saf-bg)] sm:px-8 md:grid-cols-[130px_minmax(0,1fr)_auto]"
              >
                <span className="font-mono text-[10.5px] font-bold tracking-[.14em] text-[color:var(--color-home-saf-dark)] uppercase">
                  {quand(service)}
                </span>
                <span>
                  <h3 className="font-[family-name:var(--font-sora)] text-[17px] leading-snug font-extrabold text-[color:var(--color-home-ink)]">
                    {service.titre}
                  </h3>
                  <p className="mt-1.5 text-[13.5px] leading-relaxed text-[color:var(--color-home-muted-2)]">
                    {service.extrait}
                  </p>
                </span>
                <ArrowRightIcon
                  className="hidden h-4 w-4 text-[color:var(--color-si-petrole)] transition-transform group-hover:translate-x-1.5 md:block"
                  aria-hidden
                />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* La méthode : photo terrain voilée + trois temps */}
      <section className="relative overflow-hidden bg-[color:var(--color-home-ink)]">
        <Image
          src="/img/si/about1.jpg"
          alt=""
          fill
          sizes="100vw"
          className="object-cover object-[center_30%] opacity-30 grayscale"
        />
        <div className="relative mx-auto max-w-[var(--container,1280px)] px-6 py-16 md:px-8 lg:py-20">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 className="max-w-[520px] font-[family-name:var(--font-sora)] text-[clamp(26px,3.2vw,40px)] leading-[1.05] font-extrabold tracking-[-0.03em] text-balance text-white">
              Une méthode en trois temps.
            </h2>
            <KickerMono clair>Du premier appel au rapport</KickerMono>
          </div>
          <div className="mt-12 grid gap-px overflow-hidden rounded-[14px] bg-white/12 md:grid-cols-3">
            {METHODE.map((temps, index) => (
              <div key={temps.etape} className="bg-[color:var(--color-home-ink)]/85 p-7 backdrop-blur-sm lg:p-8">
                <p className="font-mono text-[11px] font-bold tracking-[.15em] text-[color:var(--color-si-lime)]">
                  {String(index + 1).padStart(2, "0")}
                </p>
                <h3 className="mt-4 font-[family-name:var(--font-sora)] text-[20px] font-extrabold text-white">
                  {temps.etape}
                </h3>
                <p className="mt-3 text-[13.5px] leading-[1.7] text-white/68">{temps.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
