import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
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
    <section className="bg-[color:var(--color-si-creme)]">
      <div className="mx-auto max-w-[var(--container,1280px)] px-6 py-12 md:px-8 lg:py-16">
        <div className="grid gap-8 lg:grid-cols-[1.15fr_.85fr] lg:items-end">
          <div>
            <p className="inline-flex items-center gap-2 text-[12px] font-bold text-[color:var(--color-si-petrole)]">
              <ClipboardCheckIcon className="h-4 w-4" /> Nos expertises
            </p>
            <h1 className="mt-4 max-w-[820px] font-[family-name:var(--font-sora)] text-[clamp(38px,5.5vw,72px)] leading-[1.02] font-extrabold tracking-[-0.035em] text-balance text-[color:var(--color-home-ink)]">
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
        <div className="relative mt-10 overflow-hidden rounded-[16px] bg-[color:var(--color-home-ink)]">
          <Image
            src="/img/si/proj2.jpg"
            alt="Immeuble résidentiel contemporain"
            width={800}
            height={1067}
            sizes="(min-width:1280px) 1280px, 100vw"
            className="h-[220px] w-full object-cover opacity-75 sm:h-[300px]"
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
      <div className="mx-auto grid max-w-[var(--container,1280px)] gap-8 px-6 py-12 md:px-8 lg:grid-cols-[240px_minmax(0,1fr)_300px] lg:py-16">
        <aside className="order-2 border-t border-[color:var(--color-home-line)] pt-6 lg:order-1 lg:border-t-0 lg:border-r lg:pt-0 lg:pr-8">
          <p className="inline-flex items-center gap-2 text-[12px] font-bold text-[color:var(--color-si-petrole)]">
            <MapPinIcon className="h-4 w-4" /> Fiche pratique
          </p>
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
          <p className="text-[12px] font-bold text-[color:var(--color-home-saf-dark)]">
            Diagnostic réglementaire
          </p>
          <h1 className="mt-4 font-[family-name:var(--font-sora)] text-[clamp(38px,5vw,66px)] leading-[1.01] font-extrabold tracking-[-0.035em] text-balance text-[color:var(--color-home-ink)]">
            {service.titre}
          </h1>
          <p className="mt-6 max-w-[60ch] text-[17px] leading-[1.7] text-[color:var(--color-home-muted-2)]">
            {service.extrait}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <span className="inline-flex items-center gap-2 rounded-full bg-[color:var(--color-home-saf-bg)] px-4 py-2 text-[12px] font-bold text-[color:var(--color-home-saf-dark)]">
              <CheckCircle2Icon className="h-4 w-4" /> Intervention certifiée
            </span>
            <span className="inline-flex items-center gap-2 rounded-full bg-[color:var(--color-home-bg-2)] px-4 py-2 text-[12px] font-bold text-[color:var(--color-si-petrole)]">
              <FileCheck2Icon className="h-4 w-4" /> Rapport expliqué
            </span>
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
            <div
              className="article-prose mt-7 border-y border-[color:var(--color-home-line)] py-2 [&_h2]:mt-9 [&_h2]:text-[23px] [&_h2]:font-extrabold [&_h2]:tracking-[-0.02em] [&_p]:max-w-[70ch]"
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
                  <p className="mt-3 max-w-[68ch] text-[13.5px] leading-relaxed text-[color:var(--color-home-muted-2)]">
                    Les anciens diagnostics, factures de travaux et références des équipements
                    peuvent aider le technicien à préparer un rapport plus précis.
                  </p>
                </details>
                <details className="py-5">
                  <summary className="cursor-pointer list-none font-[family-name:var(--font-sora)] text-[14px] font-bold text-[color:var(--color-home-ink)]">
                    Quand recevrai-je le rapport ?
                  </summary>
                  <p className="mt-3 max-w-[68ch] text-[13.5px] leading-relaxed text-[color:var(--color-home-muted-2)]">
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
      <div className="mx-auto max-w-[var(--container,1280px)] px-6 py-12 md:px-8 lg:py-16">
        <div className="border-y border-[color:var(--color-home-line)] py-5">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <p className="text-[12px] font-bold text-[color:var(--color-si-petrole)]">
              Veille réglementaire
            </p>
            <p className="text-[12px] font-semibold text-[color:var(--color-home-muted-2)]">
              Une veille locale depuis 2017
            </p>
          </div>
          <h1 className="mt-5 max-w-[1000px] font-[family-name:var(--font-sora)] text-[clamp(38px,5.4vw,70px)] leading-[1.02] font-extrabold tracking-[-0.035em] text-balance text-[color:var(--color-home-ink)]">
            Ce qui change pour{" "}
            <span className="text-[color:var(--color-home-saf-dark)]">votre bien immobilier</span>
          </h1>
        </div>
        <article className="mt-8 grid overflow-hidden rounded-[16px] bg-[color:var(--color-home-ink)] text-white lg:grid-cols-[1.2fr_.8fr]">
          <Image
            src="/img/si/blog1.jpg"
            alt="Thermostat programmable d’un logement, réglé sur 19 °C"
            width={800}
            height={600}
            className="h-[280px] w-full object-cover lg:h-[360px]"
            priority
          />
          <div className="flex flex-col justify-between p-6 sm:p-8">
            <div>
              <p className="flex items-center gap-2 text-[12px] font-semibold text-[color:var(--color-home-saf)]">
                <CalendarDaysIcon className="h-4 w-4" />{" "}
                {format(new Date(featured.date), "d MMMM yyyy", { locale: fr })}
              </p>
              <h2 className="mt-5 font-[family-name:var(--font-sora)] text-[clamp(24px,3vw,38px)] leading-[1.12] font-bold text-balance">
                {featured.titre}
              </h2>
              <p className="mt-4 text-[14px] leading-relaxed text-white/74">{featured.extrait}</p>
            </div>
            <Link
              href={`/actualites/${featured.slug}`}
              className="mt-8 inline-flex min-h-11 items-center gap-2 text-[13px] font-bold text-[color:var(--color-home-saf)]"
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
    <section className="bg-[color:var(--color-si-creme)] lg:h-[var(--hero-max-h)]">
      <div className="mx-auto grid max-w-[var(--container,1280px)] lg:h-full lg:grid-cols-[minmax(0,1fr)_410px]">
        {/* `overflow-y-auto` = filet, pas béquille : la hauteur étant fixe, un
            titre d'article exceptionnellement long scrolle ici au lieu d'être
            rogné. En temps normal le contenu tient — d'où le py resserré. */}
        <div className="flex min-w-0 flex-col justify-between overflow-y-auto px-6 py-10 md:px-8 lg:py-14 ecran-court:lg:py-6">
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
            <h1 className="max-w-[880px] font-[family-name:var(--font-sora)] text-[clamp(38px,5.2vw,70px)] leading-[.98] font-extrabold tracking-[-0.035em] text-balance text-[color:var(--color-home-ink)]">
              {article.titre}
            </h1>
            <p className="mt-7 max-w-[62ch] text-[16px] leading-[1.7] text-[color:var(--color-home-muted-2)]">
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
        <div className="grid gap-12 lg:grid-cols-[minmax(0,760px)_280px] lg:justify-between">
          <article>
            <p className="border-y border-[color:var(--color-home-line)] py-6 text-[18px] leading-[1.75] font-medium text-[color:var(--color-home-ink)]">
              {article.extrait}
            </p>
            <div
              className="article-prose mt-8 [&_h2]:scroll-mt-32 [&_h2]:text-[clamp(22px,2.6vw,30px)] [&_h2]:leading-tight [&_h2]:font-extrabold [&_h2]:tracking-[-0.02em] [&_h2]:text-balance [&_h2]:text-[color:var(--color-home-ink)] [&_h3]:mt-7 [&_p]:max-w-[72ch]"
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
      <div className="relative mx-auto flex min-h-[440px] max-w-[var(--container,1280px)] flex-col justify-between px-6 py-10 text-white md:px-8 lg:h-full lg:min-h-0 lg:py-12">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="inline-flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 text-[12px] font-bold text-[color:var(--color-si-petrole)]">
            <MapPinIcon className="h-4 w-4" /> Diagnostic immobilier local
          </p>
          <p className="text-[13px] font-semibold text-white/82">
            {distance === null ? "Notre agence est ici" : `À ${distance} km de notre agence de Tours`}
          </p>
        </div>
        <div className="max-w-[960px]">
          <h1 className="font-[family-name:var(--font-sora)] text-[clamp(42px,6.5vw,84px)] leading-[.98] font-extrabold tracking-[-0.035em] text-balance">
            Votre diagnostiqueur à{" "}
            <span className="text-[color:var(--color-home-saf)]">{ville.ville}</span>
          </h1>
          <div className="mt-6 flex flex-wrap items-end justify-between gap-6 border-t border-white/35 pt-5">
            <p className="max-w-[58ch] text-[16px] leading-relaxed text-white/84">
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
      <div className="mx-auto grid max-w-[var(--container,1280px)] lg:h-full lg:grid-cols-[.8fr_1.2fr]">
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
        <div className="flex flex-col justify-center px-6 py-12 md:px-8 lg:py-16">
          <p className="text-[12px] font-bold text-[color:var(--color-si-petrole)]">
            Parlons de votre projet
          </p>
          <h1 className="mt-4 font-[family-name:var(--font-sora)] text-[clamp(38px,5vw,66px)] leading-[1.02] font-extrabold tracking-[-0.035em] text-balance text-[color:var(--color-home-ink)]">
            Une question ?{" "}
            <span className="text-[color:var(--color-si-petrole)]">On vous répond vraiment</span>
          </h1>
          <p className="mt-5 max-w-[54ch] text-[16px] leading-[1.7] text-[color:var(--color-home-muted-2)]">
            Appelez directement l’équipe ou décrivez votre besoin en ligne. Une réponse claire, sans
            transfert inutile.
          </p>
          <div className="mt-8 divide-y divide-[color:var(--color-home-line)] border-y border-[color:var(--color-home-line)]">
            <a
              href="tel:+33247470123"
              className="flex min-h-16 items-center justify-between gap-4 py-4 font-[family-name:var(--font-sora)] text-[15px] font-bold text-[color:var(--color-home-ink)]"
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
              className="flex min-h-16 items-center justify-between gap-4 py-4 font-[family-name:var(--font-sora)] text-[15px] font-bold text-[color:var(--color-home-ink)]"
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
          <p className="mt-5 inline-flex items-center gap-2 text-[12px] font-semibold text-[color:var(--color-home-saf-dark)]">
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
            <h1 className="max-w-[850px] font-[family-name:var(--font-sora)] text-[clamp(42px,5.8vw,76px)] leading-[.98] font-extrabold tracking-[-0.04em] text-balance">
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

function stripHtml(value: string) {
  return value
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
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
