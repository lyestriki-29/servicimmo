import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

import { BoutonDevisPilule } from "@/components/marketing/pages/BoutonDevisPilule";
import { stripHtml } from "@/lib/content/html";
import {
  ArrowRightIcon,
  BadgeCheckIcon,
  BookOpenTextIcon,
  Building2Icon,
  CalendarDaysIcon,
  CheckCircle2Icon,
  ClipboardCheckIcon,
  Clock3Icon,
  FileCheck2Icon,
  FileTextIcon,
  HomeIcon,
  ListChecksIcon,
  MapPinIcon,
  ShieldCheckIcon,
  WrenchIcon,
} from "lucide-react";

import type { Article, Service, Ville } from "@/lib/content/schemas";
import { haversineKm } from "@/lib/geo/distance";

import { GoogleMapEmbed } from "./GoogleMapEmbed";
import { iconeOuDefaut } from "./icones";
import { PrintButton } from "./PrintButton";

export function ServicesCatalogHero({ count }: { count: number }) {
  return (
    // Page CONTENU (un catalogue) : l'en-tête est une porte. Il ne remplit pas
    // l'écran — on doit voir que le catalogue commence.
    <section className="bg-[color:var(--color-si-creme)]">
      <div className="mx-auto max-w-[var(--container,1280px)] px-6 py-12 md:px-8 lg:py-16 ecran-court:lg:py-6">
        <div className="grid gap-8 lg:grid-cols-[1.15fr_.85fr] lg:items-end ecran-court:lg:gap-5">
          <div>
            <p className="inline-flex items-center gap-2 text-[12px] font-bold text-[color:var(--color-si-petrole)]">
              <ClipboardCheckIcon className="h-4 w-4" /> Nos expertises
            </p>
            <h1 className="mt-4 max-w-[820px] font-[family-name:var(--font-sora)] text-[clamp(38px,5.5vw,72px)] leading-[1.02] font-extrabold tracking-[-0.035em] text-balance text-[color:var(--color-home-ink)] ecran-court:mt-3 ecran-court:text-[clamp(30px,3.4vw,44px)]">
              Tous vos diagnostics,{" "}
              <span className="text-[color:var(--color-si-petrole)]">un seul interlocuteur</span>
            </h1>
          </div>
          <div className="pb-1">
            <p className="max-w-[52ch] text-[16px] leading-[1.7] text-[color:var(--color-home-muted-2)]">
              Vente, location, travaux ou copropriété : identifiez rapidement les contrôles
              nécessaires à votre projet.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {["Vente", "Location", "Travaux", "Copropriété"].map((label) => (
                <span
                  key={label}
                  className="rounded-full bg-white px-3 py-2 text-[12px] font-semibold text-[color:var(--color-si-petrole)]"
                >
                  {label}
                </span>
              ))}
            </div>
          </div>
        </div>
        <div className="relative mt-10 overflow-hidden rounded-[16px] bg-[color:var(--color-home-ink)] ecran-court:mt-5">
          <Image
            src="/img/si/proj2.jpg"
            alt="Immeuble résidentiel contemporain"
            width={800}
            height={1067}
            sizes="(min-width:1280px) 1280px, 100vw"
            className="h-[220px] w-full object-cover opacity-75 sm:h-[300px] ecran-court:sm:h-[170px]"
            priority
          />
          <div className="absolute inset-y-0 left-0 flex w-full max-w-[390px] items-end bg-[color:var(--color-home-ink)]/88 p-6 text-white sm:p-8">
            <div>
              <p className="font-[family-name:var(--font-sora)] text-[18px] font-bold">
                {count} expertises, une même équipe
              </p>
              <p className="mt-2 text-[13px] leading-relaxed text-white/74">
                Un parcours simple pour identifier uniquement les diagnostics utiles.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function ServicesProjectExperience({ services }: { services: Service[] }) {
  const projects = [
    {
      label: "Je vends",
      detail: "Préparer le dossier avant compromis",
      href: "#catalogue-services",
      icon: HomeIcon,
    },
    {
      label: "Je loue",
      detail: "Sécuriser le bail et le locataire",
      href: "#catalogue-services",
      icon: FileTextIcon,
    },
    {
      label: "Je fais des travaux",
      detail: "Repérer les risques avant chantier",
      href: "#catalogue-services",
      icon: WrenchIcon,
    },
    {
      label: "Je gère une copropriété",
      detail: "Planifier les obligations collectives",
      href: "#catalogue-services",
      icon: Building2Icon,
    },
  ];

  return (
    <section className="bg-[color:var(--color-home-bg)]">
      <div className="mx-auto max-w-[var(--container,1280px)] px-6 py-12 md:px-8 lg:py-16">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="text-[13px] font-semibold text-[color:var(--color-home-saf-dark)]">
              Votre projet détermine vos obligations
            </p>
            <h2 className="mt-2 max-w-[720px] font-[family-name:var(--font-sora)] text-[clamp(28px,3.5vw,44px)] leading-tight font-extrabold tracking-[-0.03em] text-balance text-[color:var(--color-home-ink)]">
              Commencez par votre situation, pas par une liste de diagnostics.
            </h2>
          </div>
          <p className="max-w-[38ch] text-[14px] leading-relaxed text-[color:var(--color-home-muted-2)]">
            En quelques choix, Servicimmo identifie les contrôles réellement utiles à votre bien.
          </p>
        </div>
        <div className="mt-9 grid overflow-hidden border border-[color:var(--color-home-line)] sm:grid-cols-2 lg:grid-cols-4">
          {projects.map((project) => {
            const Icon = project.icon;
            return (
              <a
                key={project.label}
                href={project.href}
                className="group min-h-36 border-b border-[color:var(--color-home-line)] bg-white p-5 transition-colors hover:bg-[color:var(--color-home-saf-bg)] focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-[color:var(--color-si-petrole)] sm:border-r lg:border-b-0"
              >
                <Icon className="h-5 w-5 text-[color:var(--color-si-petrole)]" />
                <p className="mt-6 font-[family-name:var(--font-sora)] text-[15px] font-bold text-[color:var(--color-home-ink)]">
                  {project.label}
                </p>
                <p className="mt-2 text-[12.5px] leading-relaxed text-[color:var(--color-home-muted-2)]">
                  {project.detail}
                </p>
              </a>
            );
          })}
        </div>
        <div
          id="catalogue-services"
          className="mt-12 grid scroll-mt-32 overflow-hidden bg-[color:var(--color-home-ink)] lg:grid-cols-[320px_minmax(0,1fr)]"
        >
          <div className="flex flex-col justify-between px-6 py-8 text-white sm:px-8 lg:py-10">
            <div>
              <ClipboardCheckIcon className="h-7 w-7 text-[color:var(--color-home-saf)]" />
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
          <div className="grid bg-white md:grid-cols-2">
            {services.map((service) => {
              const Icon = iconeOuDefaut(service.icone);
              return (
                <Link
                  key={service.slug}
                  href={`/services/${service.slug}`}
                  className="group grid min-h-32 grid-cols-[32px_minmax(0,1fr)_auto] gap-3 border-b border-[color:var(--color-home-line)] p-5 transition-colors hover:bg-[color:var(--color-home-saf-bg)] md:border-r"
                >
                  <Icon className="mt-1 h-5 w-5 text-[color:var(--color-si-petrole)]" />
                  <div>
                    <h3 className="font-[family-name:var(--font-sora)] text-[15px] leading-snug font-bold text-[color:var(--color-home-ink)]">
                      {service.titre}
                    </h3>
                    <p className="mt-2 text-[12.5px] leading-relaxed text-[color:var(--color-home-muted-2)]">
                      {service.extrait}
                    </p>
                  </div>
                  <ArrowRightIcon className="mt-1 h-4 w-4 text-[color:var(--color-si-petrole)] transition-transform group-hover:translate-x-1" />
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

export function ServiceAtlasHero({ service }: { service: Service }) {
  // Photos d'illustration : aucune ne montre de technicien Servicimmo ni de
  // diagnostic en cours. L'alternative décrit donc ce qu'on voit réellement.
  const visuel =
    service.slug.includes("amiante") || service.slug.includes("plomb")
      ? { src: "/img/si/proj4.jpg", alt: "Travaux de découpe dans un logement en rénovation" }
      : { src: "/img/si/proj3.jpg", alt: "Séjour meublé d’un logement" };
  return (
    <section className="bg-white">
      {/* Page CONTENU (une fiche pratique) : en-tête compact, on vient lire. */}
      <div className="mx-auto grid max-w-[var(--container,1280px)] gap-8 px-6 py-12 md:px-8 lg:grid-cols-[240px_minmax(0,1fr)_300px] lg:py-[clamp(28px,5svh,64px)]">
        <aside className="order-2 border-t border-[color:var(--color-home-line)] pt-6 lg:order-1 lg:border-t-0 lg:border-r lg:pt-0 lg:pr-8">
          <KickerMono>Fiche pratique</KickerMono>
          <div className="mt-8 space-y-7">
            <AtlasFact
              label="Projet"
              value={
                service.obligatoirePour.length
                  ? service.obligatoirePour.map(capitalize).join(" · ")
                  : "Selon votre situation"
              }
            />
            <AtlasFact label="Validité" value={service.dureeValidite ?? "Selon le diagnostic"} />
            <AtlasFact label="Secteur" value="Indre-et-Loire" />
          </div>
        </aside>
        <div className="order-1 lg:order-2">
          <KickerMono>Diagnostic réglementaire</KickerMono>
          <h1 className="mt-4 font-[family-name:var(--font-sora)] text-[clamp(30px,min(5vw,7svh),66px)] leading-[1.01] font-extrabold tracking-[-0.035em] text-balance text-[color:var(--color-home-ink)]">
            <TitreAccentue titre={service.titre} accent={service.titreAccent} />
          </h1>
          <p className="mt-6 max-w-[60ch] text-[17px] leading-[1.7] text-[color:var(--color-home-muted-2)]">
            {service.extrait}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <span className="inline-flex items-center gap-2 rounded-full bg-[color:var(--color-home-saf-bg)] px-4 py-2 text-[12px] font-bold text-[color:var(--color-home-saf-dark)]">
              <CheckCircle2Icon className="h-4 w-4" /> Obligatoire
            </span>
            <span className="inline-flex items-center gap-2 rounded-full bg-[color:var(--color-home-bg-2)] px-4 py-2 text-[12px] font-bold text-[color:var(--color-si-petrole)]">
              <FileCheck2Icon className="h-4 w-4" /> Rapport expliqué
            </span>
          </div>
          <div className="mt-9 flex flex-wrap items-center gap-5">
            <BoutonDevisPilule />
            <p className="text-[12.5px] font-semibold text-[color:var(--color-home-muted-2)]">
              Estimation immédiate · devis sous 2 h ouvrées
            </p>
          </div>
        </div>
        <div className="relative order-3 min-h-[300px] overflow-hidden rounded-[16px] lg:min-h-[440px]">
          <Image
            src={visuel.src}
            alt={visuel.alt}
            fill
            sizes="(min-width:1024px) 300px, 100vw"
            className="object-cover"
            priority
          />
          <span className="absolute top-5 right-5 rounded-full bg-white px-4 py-2 text-[11px] font-bold text-[color:var(--color-si-petrole)]">
            Tours · 37
          </span>
        </div>
      </div>
    </section>
  );
}

export function ServiceMissionContent({ service }: { service: Service }) {
  return (
    <section className="bg-[color:var(--color-home-bg)]">
      <div className="mx-auto max-w-[var(--container,1280px)] px-6 py-12 md:px-8 lg:py-16">
        <div className="grid bg-[color:var(--color-home-saf)] text-[color:var(--color-home-ink)] md:grid-cols-3">
          <MissionFact
            label="Quand"
            value={
              service.obligatoirePour.length
                ? `Pour ${service.obligatoirePour.map(capitalize).join(", ")}`
                : "Selon votre bien et votre projet"
            }
          />
          <MissionFact
            label="Validité"
            value={service.dureeValidite ?? "Confirmée avant l’intervention"}
          />
          <MissionFact label="Livrable" value="Rapport réglementaire expliqué" />
        </div>
        <div className="mt-12 grid gap-12 lg:grid-cols-[minmax(0,1fr)_310px]">
          <div>
            <div className="flex items-center gap-3">
              <ListChecksIcon className="h-6 w-6 text-[color:var(--color-si-petrole)]" />
              <h2 className="font-[family-name:var(--font-sora)] text-[clamp(26px,3vw,38px)] font-extrabold tracking-[-0.025em] text-balance text-[color:var(--color-home-ink)]">
                Ce qu’il faut savoir avant l’intervention
              </h2>
            </div>
            {/* Bride de 70 caractères retirée le 2026-08-03 à la demande de
                Lyes : depuis l'élargissement du conteneur, elle laissait ~750px
                de vide entre la fin des lignes et l'encart de droite. Les
                paragraphes occupent désormais toute leur colonne, comme les
                intertitres. Contrepartie assumée : la ligne s'allonge bien
                au-delà du confort de lecture usuel (60-75 caractères). */}
            <div
              className="article-prose mt-7 border-y border-[color:var(--color-home-line)] py-2 [&_h2]:mt-9 [&_h2]:text-[23px] [&_h2]:font-extrabold [&_h2]:tracking-[-0.02em]"
              dangerouslySetInnerHTML={{ __html: service.html }}
            />
            <div className="mt-10">
              <h3 className="font-[family-name:var(--font-sora)] text-[20px] font-bold text-[color:var(--color-home-ink)]">
                Questions utiles
              </h3>
              <div className="mt-4 divide-y divide-[color:var(--color-home-line)] border-y border-[color:var(--color-home-line)]">
                <details className="py-5">
                  <summary className="cursor-pointer list-none font-[family-name:var(--font-sora)] text-[14px] font-bold text-[color:var(--color-home-ink)]">
                    Quels documents préparer ?
                  </summary>
                  <p className="mt-3 text-[13.5px] leading-relaxed text-[color:var(--color-home-muted-2)]">
                    Les anciens diagnostics, factures de travaux et références des équipements
                    peuvent aider le technicien à préparer un rapport plus précis.
                  </p>
                </details>
                <details className="py-5">
                  <summary className="cursor-pointer list-none font-[family-name:var(--font-sora)] text-[14px] font-bold text-[color:var(--color-home-ink)]">
                    Quand recevrai-je le rapport ?
                  </summary>
                  <p className="mt-3 text-[13.5px] leading-relaxed text-[color:var(--color-home-muted-2)]">
                    Le délai est confirmé lors de la prise de rendez-vous. L’équipe reste disponible
                    après l’envoi pour répondre à vos questions.
                  </p>
                </details>
              </div>
            </div>
          </div>
          <aside className="h-fit bg-[color:var(--color-home-ink)] p-6 text-white lg:sticky lg:top-[122px]">
            <FileCheck2Icon className="h-7 w-7 text-[color:var(--color-home-saf)]" />
            <h3 className="mt-6 font-[family-name:var(--font-sora)] text-[20px] font-extrabold">
              Votre rapport, sans zone grise.
            </h3>
            <p className="mt-4 text-[13.5px] leading-[1.7] text-white/74">
              Un document exploitable pour votre transaction, avec les informations clés expliquées
              par le technicien.
            </p>
            <ul className="mt-6 space-y-4 border-t border-white/20 pt-6 text-[13px] text-white/86">
              <li className="flex gap-2">
                <CheckCircle2Icon className="mt-0.5 h-4 w-4 shrink-0 text-[color:var(--color-home-saf)]" />{" "}
                Résultats réglementaires
              </li>
              <li className="flex gap-2">
                <CheckCircle2Icon className="mt-0.5 h-4 w-4 shrink-0 text-[color:var(--color-home-saf)]" />{" "}
                Recommandations lisibles
              </li>
              <li className="flex gap-2">
                <CheckCircle2Icon className="mt-0.5 h-4 w-4 shrink-0 text-[color:var(--color-home-saf)]" />{" "}
                Équipe disponible après la visite
              </li>
            </ul>
          </aside>
        </div>
      </div>
    </section>
  );
}

export function NewsLocalHero({ featured }: { featured: Article }) {
  return (
    <section className="bg-white">
      {/* Page CONTENU (une liste d'articles) : l'en-tête est une porte, pas le
          message. Il ne remplit donc PAS l'écran — on doit voir que la liste
          commence, sinon il faudrait scroller pour atteindre le 1er article,
          soit la frustration qu'on corrige, déplacée d'un cran. */}
      <div className="mx-auto max-w-[var(--container,1280px)] px-6 py-12 md:px-8 lg:py-[clamp(28px,5svh,64px)]">
        <div className="border-y border-[color:var(--color-home-line)] py-[clamp(12px,2svh,20px)]">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <p className="text-[12px] font-bold text-[color:var(--color-si-petrole)]">
              Veille réglementaire
            </p>
            <p className="text-[12px] font-semibold text-[color:var(--color-home-muted-2)]">
              Une veille locale depuis 2017
            </p>
          </div>
          <h1 className="mt-5 font-[family-name:var(--font-sora)] text-[clamp(30px,min(5.4vw,7.5svh),70px)] leading-[1.02] font-extrabold tracking-[-0.035em] text-balance text-[color:var(--color-home-ink)]">
            Ce qui change pour{" "}
            <span className="text-[color:var(--color-home-saf-dark)]">votre bien immobilier</span>
          </h1>
        </div>
        <article className="mt-[clamp(20px,3.4svh,32px)] grid overflow-hidden rounded-[16px] bg-[color:var(--color-home-ink)] text-white lg:grid-cols-[1.2fr_.8fr]">
          <Image
            src="/img/si/blog1.jpg"
            alt="Thermostat programmable d’un logement, réglé sur 19 °C"
            width={800}
            height={600}
            className="h-[280px] w-full object-cover lg:h-[clamp(210px,38svh,360px)]"
            priority
          />
          <div className="flex flex-col justify-between p-6 sm:p-[clamp(20px,3.4svh,32px)]">
            <div>
              <p className="flex items-center gap-2 text-[12px] font-semibold text-[color:var(--color-home-saf)]">
                <CalendarDaysIcon className="h-4 w-4" />{" "}
                {format(new Date(featured.date), "d MMMM yyyy", { locale: fr })}
              </p>
              {/* C'est CE titre qui dicte la hauteur de la carte, pas l'image :
                  à 38px dans une colonne étroite il casse en 6 lignes (255px
                  mesurés). D'où la réduction et le `line-clamp` sur écran court. */}
              <h2 className="mt-5 font-[family-name:var(--font-sora)] text-[clamp(20px,min(3vw,4.4svh),38px)] leading-[1.12] font-bold text-balance">
                {featured.titre}
              </h2>
              <p className="mt-4 text-[14px] leading-relaxed text-pretty text-white/74">
                {featured.extrait}
              </p>
            </div>
            <Link
              href={`/actualites/${featured.slug}`}
              className="mt-[clamp(16px,3svh,32px)] inline-flex min-h-11 items-center gap-2 text-[13px] font-bold text-[color:var(--color-home-saf)]"
            >
              Lire le décryptage <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </div>
        </article>
      </div>
    </section>
  );
}

export function ArticleExpertHero({ article }: { article: Article }) {
  const minutes = Math.max(3, Math.ceil(stripHtml(article.html).split(/\s+/).length / 220));
  return (
    // Hauteur = un MINIMUM, plus un maximum (2026-08-03). Elle était figée, si
    // bien qu'un titre de 145 caractères débordait et déclenchait une barre de
    // scroll À L'INTÉRIEUR du hero — le filet `overflow-y-auto` posé pour ça.
    // Le hero fait donc un écran dans la quasi-totalité des cas et s'allonge
    // quand le titre l'exige : on scrolle la page, jamais un bloc.
    <section className="bg-[color:var(--color-si-creme)] lg:min-h-[var(--hero-max-h)]">
      <div className="mx-auto grid max-w-[var(--container,1280px)] lg:grid-cols-[minmax(0,1fr)_410px]">
        <div className="flex min-w-0 flex-col justify-between px-6 py-10 md:px-8 lg:py-[clamp(24px,3.4svh,56px)]">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[12px] font-bold text-[color:var(--color-si-petrole)]">
            <span>
              {article.categorie ?? "Décryptage"} ·{" "}
              {format(new Date(article.date), "d MMMM yyyy", { locale: fr })}
            </span>
            <span className="inline-flex items-center gap-2 text-[color:var(--color-home-muted-2)]">
              <Clock3Icon className="h-4 w-4" /> {minutes} min de lecture
            </span>
          </div>
          <div className="my-10 lg:my-14">
            <p className="mb-5 inline-flex bg-[color:var(--color-home-ink)] px-4 py-2 font-[family-name:var(--font-sora)] text-[11px] font-extrabold tracking-[.08em] text-white">
              NOTE D’EXPERTISE · RÉGLEMENTATION
            </p>
            {/* Plus de `max-w-[880px]` : ce plafond datait du conteneur à 1280px.
                Dans une colonne devenue ~1420px, il cassait le titre en 6 lignes
                en laissant 540px vides à sa droite. */}
            <h1 className="font-[family-name:var(--font-sora)] text-[clamp(34px,min(5.2vw,8svh),70px)] leading-[.98] font-extrabold tracking-[-0.035em] text-balance text-[color:var(--color-home-ink)]">
              {article.titre}
            </h1>
            <p className="mt-7 text-[16px] leading-[1.7] text-pretty text-[color:var(--color-home-muted-2)] lg:text-[17px]">
              {article.extrait}
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-[color:var(--color-home-line)] pt-5">
            <span className="inline-flex items-center gap-2 text-[12.5px] font-semibold text-[color:var(--color-home-ink)]">
              <BadgeCheckIcon className="h-4 w-4 text-[color:var(--color-home-saf-dark)]" />{" "}
              Information vérifiée par l’équipe Servicimmo
            </span>
            <a
              href="#article-contenu"
              className="inline-flex items-center gap-2 text-[13px] font-bold text-[color:var(--color-si-petrole)]"
            >
              Commencer la lecture <ArrowRightIcon className="h-4 w-4" />
            </a>
          </div>
        </div>
        <figure className="relative min-h-[360px] overflow-hidden lg:min-h-0">
          <Image
            src="/img/si/blog2.jpg"
            alt="Signature d’un document immobilier autour d’une table"
            fill
            sizes="(min-width:1024px) 410px, 100vw"
            className="object-cover"
            priority
          />
          <figcaption className="absolute right-0 bottom-0 left-0 bg-[color:var(--color-home-ink)]/92 px-5 py-4 text-[11.5px] leading-relaxed text-white/80">
            Les diagnostics accompagnent chaque signature.
          </figcaption>
        </figure>
      </div>
    </section>
  );
}

export function ArticleExpertContent({
  article,
  related,
}: {
  article: Article;
  related: Article[];
}) {
  const prepared = prepareHeadings(article.html);
  return (
    <section id="article-contenu" className="scroll-mt-32 bg-[color:var(--color-home-bg)]">
      <div className="mx-auto max-w-[var(--container,1280px)] px-6 py-12 md:px-8 lg:py-16">
        {article.archive && (
          <aside className="mb-10 bg-[color:var(--color-si-creme)] p-6 text-[14px] leading-relaxed text-[color:var(--color-home-slate)]">
            <p className="font-[family-name:var(--font-sora)] font-bold text-[color:var(--color-home-ink)]">
              Article d’archive
            </p>
            <p className="mt-2">
              La réglementation a évolué depuis sa publication. {article.archiveNote}
            </p>
          </aside>
        )}
        {/* Colonne de lecture en `1fr` et non plafonnée à 760px : depuis
            l'élargissement du conteneur, ce plafond laissait une bande vide
            entre la fin des lignes et le sommaire. Le corps grandit avec la
            colonne (voir `.article-prose` dans globals.css). */}
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_280px]">
          <article>
            <p className="border-y border-[color:var(--color-home-line)] py-6 text-[18px] leading-[1.75] font-medium text-[color:var(--color-home-ink)]">
              {article.extrait}
            </p>
            <div
              className="article-prose mt-8 [&_h2]:scroll-mt-32 [&_h2]:text-[clamp(22px,2.6vw,30px)] [&_h2]:leading-tight [&_h2]:font-extrabold [&_h2]:tracking-[-0.02em] [&_h2]:text-balance [&_h2]:text-[color:var(--color-home-ink)] [&_h3]:mt-7"
              dangerouslySetInnerHTML={{ __html: prepared.html }}
            />
            <footer className="mt-9 grid gap-5 border-y border-[color:var(--color-home-line)] py-7 sm:grid-cols-[1fr_auto] sm:items-center">
              <div className="flex gap-3">
                <BadgeCheckIcon className="mt-0.5 h-5 w-5 shrink-0 text-[color:var(--color-home-saf-dark)]" />
                <div>
                  <p className="font-[family-name:var(--font-sora)] text-[14px] font-bold text-[color:var(--color-home-ink)]">
                    Contenu relu par Servicimmo
                  </p>
                  <p className="mt-1 text-[12.5px] leading-relaxed text-[color:var(--color-home-muted-2)]">
                    Équipe de diagnostiqueurs certifiés en Indre-et-Loire.
                  </p>
                </div>
              </div>
              <div className="text-[11.5px] leading-relaxed text-[color:var(--color-home-muted-2)] sm:text-right">
                <p className="font-bold text-[color:var(--color-home-ink)]">Sources de référence</p>
                <p>ADEME · Service-Public.fr · textes réglementaires</p>
              </div>
            </footer>
            {related.length > 0 && (
              <section className="mt-10">
                <h2 className="font-[family-name:var(--font-sora)] text-[22px] font-extrabold text-[color:var(--color-home-ink)]">
                  À lire ensuite
                </h2>
                <div className="mt-5 divide-y divide-[color:var(--color-home-line)] border-y border-[color:var(--color-home-line)]">
                  {related.map((item) => (
                    <Link
                      key={item.slug}
                      href={`/actualites/${item.slug}`}
                      className="group flex min-h-16 items-center justify-between gap-4 py-4 font-[family-name:var(--font-sora)] text-[14px] font-bold text-[color:var(--color-home-ink)]"
                    >
                      <span>{item.titre}</span>
                      <ArrowRightIcon className="h-4 w-4 text-[color:var(--color-si-petrole)] transition-transform group-hover:translate-x-1" />
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </article>
          <aside className="h-fit lg:sticky lg:top-[122px]">
            <nav
              aria-label="Sommaire de l’article"
              className="border-y border-[color:var(--color-home-line)] py-6"
            >
              <p className="inline-flex items-center gap-2 font-[family-name:var(--font-sora)] text-[14px] font-extrabold text-[color:var(--color-home-ink)]">
                <BookOpenTextIcon className="h-4 w-4 text-[color:var(--color-si-petrole)]" /> Dans
                cet article
              </p>
              <ol className="mt-5 space-y-4">
                {prepared.headings.length ? (
                  prepared.headings.map((heading, index) => (
                    <li key={heading.id}>
                      <a
                        href={`#${heading.id}`}
                        className="group flex gap-3 text-[13px] leading-snug text-[color:var(--color-home-muted-2)] transition-colors hover:text-[color:var(--color-si-petrole)]"
                      >
                        <span className="font-bold text-[color:var(--color-home-saf-dark)]">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <span>{heading.label}</span>
                      </a>
                    </li>
                  ))
                ) : (
                  <li className="text-[13px] text-[color:var(--color-home-muted-2)]">
                    Lecture complète
                  </li>
                )}
              </ol>
            </nav>
            <div className="mt-7 bg-[color:var(--color-si-creme)] p-5">
              <FileCheck2Icon className="h-6 w-6 text-[color:var(--color-si-petrole)]" />
              <p className="mt-4 font-[family-name:var(--font-sora)] text-[14px] font-extrabold text-[color:var(--color-home-ink)]">
                Document contrôlé
              </p>
              <p className="mt-2 text-[12.5px] leading-relaxed text-[color:var(--color-home-muted-2)]">
                Publié le {format(new Date(article.date), "d MMMM yyyy", { locale: fr })} et relu
                par l’équipe technique.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}

export function CityLocalHero({ ville }: { ville: Ville }) {
  const distance = distanceDepuisAgence(ville);
  return (
    // Hauteur = exactement l'écran moins le header (à partir de `lg`) : on ne
    // voit que le hero en arrivant, rien de la section suivante. En dessous de
    // `lg`, hauteur naturelle avec un plancher.
    <section className="relative min-h-[440px] overflow-hidden bg-[color:var(--color-home-ink)] lg:h-[var(--hero-max-h)]">
      <Image
        src="/img/si/hero2.jpg"
        alt="Remise des clés d’un logement"
        fill
        sizes="100vw"
        className="object-cover opacity-55"
        priority
      />
      {/* Voile à 50 % (et non 30 %) : hero2 est une photo très claire, et sous
          l'ancien voile le titre anis tombait à 2,33:1 — sous le seuil AA de 3:1
          même pour du grand texte. À 50 %, le titre remonte à 3,38:1. */}
      <div className="absolute inset-0 bg-[color:var(--color-home-ink)]/50" />
      <div className="relative mx-auto flex min-h-[440px] max-w-[var(--container,1280px)] flex-col justify-between px-6 py-10 text-white md:px-8 lg:h-full lg:min-h-0 lg:py-[clamp(20px,2.8svh,48px)]">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="inline-flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 text-[12px] font-bold text-[color:var(--color-si-petrole)]">
            <MapPinIcon className="h-4 w-4" /> Diagnostic immobilier local
          </p>
          <p className="text-[13px] font-semibold text-white/82">
            {distance === null ? "Notre agence est ici" : `À ${distance} km de notre agence de Tours`}
          </p>
        </div>
        <div>
          {/* `min(vw, svh)` : ce hero n'avait AUCUN garde-fou en hauteur — sur un
              portable court, 84px de titre poussaient le bloc sous la ligne de
              flottaison. La hauteur peut désormais commander, en continu. */}
          <h1 className="font-[family-name:var(--font-sora)] text-[clamp(38px,min(6.5vw,9.5svh),84px)] leading-[.98] font-extrabold tracking-[-0.035em] text-balance">
            Votre diagnostiqueur à{" "}
            <span className="text-[color:var(--color-home-saf)]">{ville.ville}</span>
          </h1>
          <div className="mt-6 flex flex-wrap items-end justify-between gap-6 border-t border-white/35 pt-5">
            <p className="max-w-[58ch] text-[16px] leading-relaxed text-white/84 lg:text-[17px]">
              Des techniciens certifiés qui connaissent le secteur et interviennent sous 48 h pour
              vos ventes, locations et travaux.
            </p>
            {/* Blanc souligné, pas anis : à 13 px il faut 4,5:1, que l'anis
                n'atteint pas sur cette photo même voilée à 50 % (3,38:1). */}
            <a
              href="#ville-diagnostics"
              className="inline-flex min-h-11 items-center gap-2 text-[13px] font-bold text-white underline underline-offset-4"
            >
              Voir les diagnostics à {ville.ville} <ArrowRightIcon className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

export function CityLocalContent({ ville, services }: { ville: Ville; services: Service[] }) {
  const distance = distanceDepuisAgence(ville);
  return (
    <section id="ville-diagnostics" className="scroll-mt-32 bg-[color:var(--color-home-bg)]">
      <div className="mx-auto max-w-[var(--container,1280px)] px-6 py-12 md:px-8 lg:py-16">
        <div className="grid overflow-hidden bg-white lg:grid-cols-[1.08fr_.92fr]">
          <div className="relative min-h-[390px] bg-[color:var(--color-home-line)]">
            <GoogleMapEmbed
              query={`${ville.ville} ${ville.codePostal}, France`}
              center={{ lat: ville.lat, lng: ville.lng }}
              zoom={13}
              title={`Carte Google Maps de ${ville.ville}`}
              className="min-h-[390px]"
            />
            <div className="pointer-events-none absolute top-4 left-4 z-10 bg-[color:var(--color-home-ink)] px-4 py-3 text-[12px] font-semibold text-white shadow-[0_6px_8px_rgba(15,30,58,.16)]">
              <p className="inline-flex items-center gap-2">
                <MapPinIcon className="h-4 w-4 text-[color:var(--color-home-saf)]" /> {ville.ville}{" "}
                · {ville.codePostal}
              </p>
            </div>
          </div>
          <div className="px-6 py-8 sm:px-8 lg:py-10">
            <p className="text-[13px] font-semibold text-[color:var(--color-home-saf-dark)]">
              Votre dossier local
            </p>
            <h2 className="mt-2 font-[family-name:var(--font-sora)] text-[clamp(26px,3vw,38px)] leading-tight font-extrabold tracking-[-0.025em] text-balance text-[color:var(--color-home-ink)]">
              À {ville.ville}, chaque projet appelle les bons contrôles.
            </h2>
            <div className="mt-7 divide-y divide-[color:var(--color-home-line)] border-y border-[color:var(--color-home-line)]">
              {services.slice(0, 6).map((service) => (
                <Link
                  key={service.slug}
                  href={`/services/${service.slug}`}
                  className="group flex min-h-16 items-center justify-between gap-4 py-4"
                >
                  <span>
                    <span className="block font-[family-name:var(--font-sora)] text-[14px] font-bold text-[color:var(--color-home-ink)]">
                      {service.titre}
                    </span>
                    <span className="mt-1 block text-[12.5px] text-[color:var(--color-home-muted-2)]">
                      {service.extrait}
                    </span>
                  </span>
                  <ArrowRightIcon className="h-4 w-4 shrink-0 text-[color:var(--color-si-petrole)] transition-transform group-hover:translate-x-1" />
                </Link>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-8 grid gap-6 lg:grid-cols-[.8fr_1.2fr]">
          <div className="bg-[color:var(--color-si-creme)] p-6">
            <Building2Icon className="h-6 w-6 text-[color:var(--color-si-petrole)]" />
            <h3 className="mt-5 font-[family-name:var(--font-sora)] text-[19px] font-bold text-[color:var(--color-home-ink)]">
              Une lecture adaptée au bâti local
            </h3>
            <p className="mt-3 text-[13.5px] leading-[1.7] text-[color:var(--color-home-muted-2)]">
              Centre ancien, maisons de ville, pavillons ou logements rénovés : l’âge du bien et
              votre projet déterminent les diagnostics à prévoir.
            </p>
          </div>
          <div className="grid bg-[color:var(--color-home-ink)] text-white sm:grid-cols-3">
            <LocalFact label="Depuis Tours" value={distance === null ? "Sur place" : `${distance} km`} />
            <LocalFact label="Créneau possible" value="Sous 48 h" />
            <LocalFact label="Couverture" value={`${ville.ville} et communes voisines`} />
          </div>
        </div>
        <article
          className="article-prose mx-auto mt-12 max-w-3xl [&_h2]:text-[24px] [&_h2]:font-extrabold [&_h2]:text-[color:var(--color-home-ink)]"
          dangerouslySetInnerHTML={{ __html: ville.html }}
        />
      </div>
    </section>
  );
}

export function ContactLocalHero() {
  return (
    <section className="bg-[color:var(--color-si-creme)] lg:h-[var(--hero-max-h)]">
      {/* `grid-rows-[minmax(0,1fr)]` borne la ligne a la hauteur de la section :
          sans lui, le contenu de la colonne droite (texte + padding) etire la
          ligne au-dela de --hero-max-h, la photo suit, mais le creme — porte par
          la section — s'arrete au plafond. D'ou une bande blanche sous le creme. */}
      <div className="mx-auto grid max-w-[var(--container,1280px)] lg:h-full lg:grid-cols-[.8fr_1.2fr] lg:grid-rows-[minmax(0,1fr)]">
        <div className="relative min-h-[320px] lg:min-h-0">
          {/* equipe.jpg est un panorama 2000x508 (ratio 3,94) affiche dans un
              cadre presque carre. `object-cover` le met donc a l'echelle par la
              HAUTEUR, pas par la largeur : a 520 px de haut il lui faut ~2050 px
              de large. L'ancien `sizes` annoncait 40vw (512 px), Next servait une
              variante 640 px et le navigateur l'agrandissait 3,2x — d'ou le flou.
              NB : le cadre ne laisse voir que ~25 % du panorama (2 personnes sur
              5, vehicules coupes) — recadrage a arbitrer, cf. rapport de session. */}
          <Image
            src="/img/si/equipe.jpg"
            alt="Équipe Servicimmo à Tours"
            fill
            sizes="(min-width:1024px) 2050px, 1300px"
            className="object-cover"
            priority
          />
          <p className="absolute bottom-5 left-5 rounded-full bg-white px-4 py-2 text-[12px] font-bold text-[color:var(--color-si-petrole)]">
            L’équipe Servicimmo · Tours
          </p>
        </div>
        <div className="flex flex-col justify-center px-6 py-12 md:px-8 lg:min-h-0 lg:py-10 ecran-court:lg:py-6">
          <p className="text-[12px] font-bold text-[color:var(--color-si-petrole)]">
            Parlons de votre projet
          </p>
          <h1 className="mt-4 font-[family-name:var(--font-sora)] text-[clamp(38px,5vw,66px)] leading-[1.02] font-extrabold tracking-[-0.035em] text-balance text-[color:var(--color-home-ink)] ecran-court:mt-3 ecran-court:text-[clamp(30px,3.4vw,46px)]">
            Une question ?{" "}
            <span className="text-[color:var(--color-si-petrole)]">On vous répond vraiment</span>
          </h1>
          <p className="mt-5 max-w-[54ch] text-[16px] leading-[1.7] text-[color:var(--color-home-muted-2)] ecran-court:mt-3 ecran-court:text-[15px]">
            Appelez directement l’équipe ou décrivez votre besoin en ligne. Une réponse claire, sans
            transfert inutile.
          </p>
          <div className="mt-8 divide-y divide-[color:var(--color-home-line)] border-y border-[color:var(--color-home-line)] ecran-court:mt-5">
            <a
              href="tel:+33247470123"
              className="flex min-h-16 items-center justify-between gap-4 py-4 font-[family-name:var(--font-sora)] text-[15px] font-bold text-[color:var(--color-home-ink)] ecran-court:py-3"
            >
              <span>
                <span className="block text-[11px] font-semibold text-[color:var(--color-home-saf-dark)]">
                  Appeler maintenant
                </span>
                02 47 47 01 23
              </span>
              <ArrowRightIcon className="h-4 w-4 text-[color:var(--color-si-petrole)]" />
            </a>
            <a
              href="mailto:info@servicimmo.fr"
              className="flex min-h-16 items-center justify-between gap-4 py-4 font-[family-name:var(--font-sora)] text-[15px] font-bold text-[color:var(--color-home-ink)] ecran-court:py-3"
            >
              <span>
                <span className="block text-[11px] font-semibold text-[color:var(--color-home-saf-dark)]">
                  Écrire à l’équipe
                </span>
                info@servicimmo.fr
              </span>
              <ArrowRightIcon className="h-4 w-4 text-[color:var(--color-si-petrole)]" />
            </a>
          </div>
          <p className="mt-5 inline-flex items-center gap-2 text-[12px] font-semibold text-[color:var(--color-home-saf-dark)] ecran-court:mt-3">
            <Clock3Icon className="h-4 w-4" /> Réponse sous 2 h ouvrées
          </p>
        </div>
      </div>
    </section>
  );
}

export function LegalHero({
  title,
  description,
  sections,
  version = "2026.07",
}: {
  title: ReactNode;
  description: string;
  sections: string[];
  version?: string;
}) {
  return (
    <section className="bg-[color:var(--color-home-ink)] text-white">
      <div className="mx-auto max-w-[var(--container,1280px)] px-6 py-10 md:px-8 lg:py-14">
        <div className="flex flex-wrap items-center justify-between gap-4 text-[12px] font-bold text-white/68">
          <span>DOCUMENT CONTRÔLÉ · SERVICIMMO</span>
          <span>VERSION {version}</span>
        </div>
        <div className="mt-9 grid gap-10 lg:grid-cols-[1fr_420px] lg:items-end">
          <div>
            <h1 className="font-[family-name:var(--font-sora)] text-[clamp(38px,min(5.8vw,8.5svh),76px)] leading-[.98] font-extrabold tracking-[-0.04em] text-balance">
              {title}
            </h1>
            <p className="mt-6 max-w-[62ch] text-[16px] leading-[1.7] text-white/74">
              {description}
            </p>
          </div>
          <div className="divide-y divide-white/20 border-y border-white/20">
            {sections.slice(0, 4).map((section) => (
              <div key={section} className="flex items-center justify-between gap-5 py-4">
                <span className="text-[13px] font-bold">{section}</span>
                <CheckCircle2Icon className="h-4 w-4 text-[color:var(--color-home-saf)]" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export type LegalSection = { id: string; title: string; content: ReactNode };

export function LegalDocument({
  intro,
  sections,
  version = "2026.07",
}: {
  intro: string;
  sections: LegalSection[];
  version?: string;
}) {
  return (
    <section className="bg-[color:var(--color-home-bg)]">
      <div className="mx-auto max-w-[var(--container,1280px)] px-6 py-12 md:px-8 lg:py-16">
        <div className="flex flex-wrap items-center justify-between gap-4 border-y border-[color:var(--color-home-line)] py-4 text-[12px] font-semibold text-[color:var(--color-home-muted-2)]">
          <span className="inline-flex items-center gap-2">
            <BadgeCheckIcon className="h-4 w-4 text-[color:var(--color-home-saf-dark)]" /> Version
            contrôlée · {version}
          </span>
          <PrintButton />
        </div>
        <div className="mt-10 grid gap-12 lg:grid-cols-[250px_minmax(0,760px)] lg:justify-between">
          <aside className="h-fit lg:sticky lg:top-[122px]">
            <p className="font-[family-name:var(--font-sora)] text-[14px] font-extrabold text-[color:var(--color-home-ink)]">
              Sommaire du document
            </p>
            <nav className="mt-5 border-y border-[color:var(--color-home-line)]">
              {sections.map((section, index) => (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  className="flex min-h-12 items-center justify-between gap-3 border-b border-[color:var(--color-home-line)] py-3 text-[12.5px] font-semibold text-[color:var(--color-home-muted-2)] last:border-b-0 hover:text-[color:var(--color-si-petrole)]"
                >
                  <span>{section.title}</span>
                  <span className="text-[color:var(--color-home-saf-dark)]">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </a>
              ))}
            </nav>
            <p className="mt-6 text-[11.5px] leading-relaxed text-[color:var(--color-home-muted-2)]">
              Dernière mise à jour : juillet 2026. Pour toute question, écrivez à
              info@servicimmo.fr.
            </p>
          </aside>
          <article>
            <p className="max-w-[70ch] text-[18px] leading-[1.75] font-medium text-[color:var(--color-home-ink)]">
              {intro}
            </p>
            <div className="mt-8 divide-y divide-[color:var(--color-home-line)] border-y border-[color:var(--color-home-line)]">
              {sections.map((section, index) => (
                <section id={section.id} key={section.id} className="scroll-mt-32 py-8">
                  <div className="grid gap-4 sm:grid-cols-[42px_minmax(0,1fr)]">
                    <span className="font-[family-name:var(--font-sora)] text-[12px] font-extrabold text-[color:var(--color-home-saf-dark)]">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <div>
                      <h2 className="font-[family-name:var(--font-sora)] text-[23px] font-extrabold tracking-[-0.02em] text-[color:var(--color-home-ink)]">
                        {section.title}
                      </h2>
                      <div className="mt-4 space-y-3 text-[14.5px] leading-[1.8] text-[color:var(--color-home-muted-2)] [&_a]:font-semibold [&_a]:text-[color:var(--color-si-petrole)] [&_a]:underline">
                        {section.content}
                      </div>
                    </div>
                  </div>
                </section>
              ))}
            </div>
            <div className="mt-9 bg-[color:var(--color-si-creme)] p-6">
              <ShieldCheckIcon className="h-6 w-6 text-[color:var(--color-si-petrole)]" />
              <h3 className="mt-4 font-[family-name:var(--font-sora)] text-[18px] font-bold text-[color:var(--color-home-ink)]">
                Une question sur ce document ?
              </h3>
              <p className="mt-3 max-w-[66ch] text-[13.5px] leading-[1.7] text-[color:var(--color-home-muted-2)]">
                Contactez directement Servicimmo à info@servicimmo.fr. Une réponse vous sera
                apportée dans les délais applicables.
              </p>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}

function AtlasFact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] font-bold text-[color:var(--color-home-saf-dark)]">{label}</p>
      <p className="mt-2 font-[family-name:var(--font-sora)] text-[14px] leading-snug font-bold text-[color:var(--color-home-ink)]">
        {value}
      </p>
    </div>
  );
}

/** Sur-titre mono des fiches services. Repris de la direction G du labo.
 *  `clair` = posé sur fond encre. */
export function KickerMono({ children, clair = false }: { children: ReactNode; clair?: boolean }) {
  return (
    <p
      className={`font-mono text-[10.5px] font-bold tracking-[.2em] uppercase ${
        clair ? "text-white/60" : "text-[color:var(--color-home-muted)]"
      }`}
    >
      {children}
    </p>
  );
}

/**
 * Colore `accent` là où il apparaît dans `titre` (1re occurrence).
 * Le schéma garantit déjà que le fragment est présent — sans accent, ou si le
 * fragment a disparu du titre, on rend le titre entier plutôt que rien.
 */
function TitreAccentue({ titre, accent }: { titre: string; accent?: string }) {
  const i = accent ? titre.indexOf(accent) : -1;
  if (!accent || i === -1) return <>{titre}</>;
  return (
    <>
      {titre.slice(0, i)}
      <span className="text-[color:var(--color-home-saf-dark)]">{accent}</span>
      {titre.slice(i + accent.length)}
    </>
  );
}

function MissionFact({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-b border-[color:var(--color-home-ink)]/18 px-6 py-6 last:border-b-0 md:border-r md:border-b-0 md:last:border-r-0">
      <p className="text-[11px] font-bold text-[color:var(--color-si-petrole)]">{label}</p>
      <p className="mt-2 font-[family-name:var(--font-sora)] text-[15px] leading-snug font-bold">
        {value}
      </p>
    </div>
  );
}

function LocalFact({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-b border-white/18 p-6 last:border-b-0 sm:border-r sm:border-b-0 sm:last:border-r-0">
      <p className="text-[11px] font-semibold text-white/58">{label}</p>
      <p className="mt-3 font-[family-name:var(--font-sora)] text-[14px] leading-snug font-bold">
        {value}
      </p>
    </div>
  );
}

function capitalize(value: string) {
  return value.charAt(0).toLocaleUpperCase("fr") + value.slice(1);
}

function prepareHeadings(html: string) {
  const headings: Array<{ id: string; label: string }> = [];
  const withIds = html.replace(/<h2>([\s\S]*?)<\/h2>/gi, (full, raw: string) => {
    const label = stripHtml(raw);
    const id = `article-section-${headings.length + 1}`;
    headings.push({ id, label });
    return `<h2 id="${id}">${raw}</h2>`;
  });
  return { html: withIds, headings };
}

/** Agence Servicimmo — 58 rue de la Chevalerie, Tours. */
const AGENCE_TOURS = { lat: 47.3941, lng: 0.6848 };

/**
 * Distance d'une commune à l'agence, en km arrondis.
 * `null` quand la commune EST celle de l'agence (Tours) : afficher « 0 km de
 * notre agence de Tours » sur la page Tours n'aurait aucun sens.
 */
function distanceDepuisAgence(ville: { lat: number; lng: number }): number | null {
  const km = Math.round(haversineKm(AGENCE_TOURS.lat, AGENCE_TOURS.lng, ville.lat, ville.lng));
  return km === 0 ? null : km;
}
