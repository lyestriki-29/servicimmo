import Image from "next/image";
import {
  ArrowRightIcon,
  BadgeCheckIcon,
  BookOpenTextIcon,
  Building2Icon,
  CalendarDaysIcon,
  CheckCircle2Icon,
  CircleHelpIcon,
  ClipboardCheckIcon,
  Clock3Icon,
  FileCheck2Icon,
  FileTextIcon,
  HomeIcon,
  ListChecksIcon,
  MailIcon,
  MapPinIcon,
  NewspaperIcon,
  PhoneIcon,
  PrinterIcon,
  SendIcon,
  ShieldCheckIcon,
  WrenchIcon,
} from "lucide-react";

import { GoogleMapEmbed } from "@/components/marketing/pages/GoogleMapEmbed";
import { ZonesExperience } from "@/components/marketing/pages/ZonesExperience";

import { ServicimmoAtlasHero } from "./ServicimmoAtlasHeroes";
import { ServicimmoLocalHero } from "./ServicimmoLocalHeroes";
import { ServicimmoTerrainHero } from "./ServicimmoTerrainHeroes";
import type { PreviewPage, PreviewVariant } from "./servicimmo-preview-data";

type Props = { page: PreviewPage; variant: PreviewVariant };

export function ServicimmoPreviewSurface({ page, variant }: Props) {
  const resolvedVariant = variant === "selection" ? SELECTED_VARIANTS[page.kind] : variant;

  if (variant === "selection" && page.kind === "map") {
    return (
      <div className="overflow-hidden rounded-[16px] border border-[color:var(--color-home-line)] bg-[color:var(--color-home-bg)] shadow-[0_8px_24px_rgba(15,30,58,.08)]">
        <ZonesExperience villes={SELECTED_ZONE_CITIES} />
        <PreviewCta variant="local" page={page} />
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-[16px] border border-[color:var(--color-home-line)] bg-[color:var(--color-home-bg)] shadow-[0_8px_24px_rgba(15,30,58,.08)]">
      {resolvedVariant === "continuite" && <ContinuiteHero page={page} />}
      {resolvedVariant === "expertise" && <ExpertiseHero page={page} />}
      {resolvedVariant === "local" && <ServicimmoLocalHero page={page} />}
      {resolvedVariant === "atlas" && <ServicimmoAtlasHero page={page} />}
      {resolvedVariant === "terrain" && <ServicimmoTerrainHero page={page} />}
      <PreviewBody page={page} variant={resolvedVariant} />
      <PreviewCta variant={resolvedVariant} page={page} />
    </div>
  );
}

const SELECTED_VARIANTS: Record<PreviewPage["kind"], Exclude<PreviewVariant, "selection">> = {
  catalog: "local",
  detail: "atlas",
  news: "local",
  article: "terrain",
  map: "local",
  city: "local",
  contact: "local",
  legal: "terrain",
};

const SELECTED_ZONE_CITIES = [
  { slug: "amboise", ville: "Amboise", codePostal: "37400", lat: 47.397272, lng: 0.987649 },
  {
    slug: "azay-le-rideau",
    ville: "Azay-le-Rideau",
    codePostal: "37190",
    lat: 47.268681,
    lng: 0.462293,
  },
  { slug: "blere", ville: "Bléré", codePostal: "37150", lat: 47.30121, lng: 0.992188 },
  {
    slug: "chambray-les-tours",
    ville: "Chambray-lès-Tours",
    codePostal: "37170",
    lat: 47.332303,
    lng: 0.717976,
  },
  {
    slug: "chateau-renault",
    ville: "Château-Renault",
    codePostal: "37110",
    lat: 47.59467,
    lng: 0.909328,
  },
  { slug: "chinon", ville: "Chinon", codePostal: "37500", lat: 47.174042, lng: 0.249889 },
  { slug: "fondettes", ville: "Fondettes", codePostal: "37230", lat: 47.411185, lng: 0.601597 },
  {
    slug: "joue-les-tours",
    ville: "Joué-lès-Tours",
    codePostal: "37300",
    lat: 47.336276,
    lng: 0.657551,
  },
  { slug: "langeais", ville: "Langeais", codePostal: "37130", lat: 47.341899, lng: 0.378259 },
  { slug: "ligueil", ville: "Ligueil", codePostal: "37240", lat: 47.041379, lng: 0.81054 },
  { slug: "loches", ville: "Loches", codePostal: "37600", lat: 47.122156, lng: 0.981834 },
  { slug: "montbazon", ville: "Montbazon", codePostal: "37250", lat: 47.283957, lng: 0.708724 },
  {
    slug: "montlouis-sur-loire",
    ville: "Montlouis-sur-Loire",
    codePostal: "37270",
    lat: 47.382915,
    lng: 0.841776,
  },
  {
    slug: "saint-cyr-sur-loire",
    ville: "Saint-Cyr-sur-Loire",
    codePostal: "37540",
    lat: 47.416945,
    lng: 0.657995,
  },
  {
    slug: "saint-pierre-des-corps",
    ville: "Saint-Pierre-des-Corps",
    codePostal: "37700",
    lat: 47.390564,
    lng: 0.733571,
  },
  {
    slug: "sainte-maure-de-touraine",
    ville: "Sainte-Maure-de-Touraine",
    codePostal: "37800",
    lat: 47.106256,
    lng: 0.61982,
  },
];

function ContinuiteHero({ page }: { page: PreviewPage }) {
  return (
    <section className="relative overflow-hidden bg-[color:var(--color-home-bg)] px-6 py-12 sm:px-10 lg:px-14 lg:py-16">
      <div
        aria-hidden
        className="absolute -top-20 -right-24 h-[360px] w-[430px] rounded-full bg-[color:var(--color-home-saf-bg)]"
      />
      <div className="relative grid items-center gap-10 lg:grid-cols-[1.04fr_.86fr]">
        <div>
          <p className="flex items-center gap-3 font-[family-name:var(--font-sora)] text-[12px] font-semibold text-[color:var(--color-home-saf-dark)]">
            <span className="h-px w-8 bg-[color:var(--color-home-saf-dark)]" aria-hidden />
            {page.kicker}
          </p>
          <h1 className="mt-4 font-[family-name:var(--font-sora)] text-[clamp(34px,4.7vw,62px)] leading-[1.03] font-extrabold tracking-[-0.035em] text-balance text-[color:var(--color-home-ink)]">
            {page.title}{" "}
            <span className="text-[color:var(--color-home-saf-dark)]">{page.accent}</span>
          </h1>
          <p className="mt-6 max-w-[58ch] text-[16px] leading-[1.65] text-[color:var(--color-home-muted-2)] sm:text-[17px]">
            {page.description}
          </p>
          <TrustLine />
        </div>
        <div className="relative">
          <Image
            src={page.image}
            alt={page.imageAlt}
            width={900}
            height={720}
            className="h-[300px] w-full rounded-[18px] object-cover [clip-path:polygon(11%_0,100%_0,100%_100%,0_100%)] sm:h-[390px]"
          />
          <Metric
            page={page}
            className="-bottom-5 left-4 bg-[color:var(--color-si-petrole)] text-white sm:-left-5"
          />
        </div>
      </div>
    </section>
  );
}

function ExpertiseHero({ page }: { page: PreviewPage }) {
  return (
    <section className="bg-[color:var(--color-home-ink)] text-white">
      <div className="grid lg:grid-cols-[1fr_360px]">
        <div className="px-6 py-12 sm:px-10 lg:px-14 lg:py-16">
          <p className="font-[family-name:var(--font-sora)] text-[12px] font-semibold text-[color:var(--color-home-saf)]">
            {page.kicker}
          </p>
          <h1 className="mt-4 max-w-[760px] font-[family-name:var(--font-sora)] text-[clamp(34px,4.6vw,60px)] leading-[1.05] font-extrabold tracking-[-0.03em] text-balance">
            {page.title} <span className="text-[color:var(--color-home-saf)]">{page.accent}</span>
          </h1>
          <p className="mt-6 max-w-[62ch] text-[16px] leading-[1.7] text-white/72">
            {page.description}
          </p>
        </div>
        <aside className="flex flex-col justify-between border-t border-white/15 bg-[color:var(--color-si-petrole)] p-7 lg:border-t-0 lg:border-l">
          <div>
            <p className="text-[11px] font-semibold text-white/60">REPÈRE UTILE</p>
            <p className="mt-3 font-[family-name:var(--font-sora)] text-[42px] leading-none font-extrabold text-[color:var(--color-home-saf)]">
              {page.stat}
            </p>
            <p className="mt-2 max-w-[24ch] text-[13px] leading-relaxed text-white/75">
              {page.statLabel}
            </p>
          </div>
          <div className="mt-10 space-y-3 border-t border-white/15 pt-5 text-[12.5px] text-white/80">
            <p className="flex items-center gap-2">
              <ShieldCheckIcon className="h-4 w-4 text-[color:var(--color-home-saf)]" /> Certifié
              &amp; assuré
            </p>
            <p className="flex items-center gap-2">
              <Clock3Icon className="h-4 w-4 text-[color:var(--color-home-saf)]" /> Réponse sous 2 h
            </p>
          </div>
        </aside>
      </div>
      <div className="relative h-36 overflow-hidden sm:h-48">
        <Image src={page.image} alt={page.imageAlt} fill className="object-cover opacity-80" />
        <div className="absolute inset-0 bg-gradient-to-r from-[color:var(--color-home-ink)]/80 via-transparent to-transparent" />
      </div>
    </section>
  );
}

function PreviewBody({ page, variant }: Props) {
  if (page.kind === "catalog" && variant === "local") return <ServicesProjectBody page={page} />;
  if (page.kind === "detail" && variant === "atlas") return <ServiceMissionBody page={page} />;
  if (page.kind === "news" && variant === "local") return <NewsroomBody page={page} />;
  if (page.kind === "article" && variant === "terrain")
    return <ProfessionalArticleBody page={page} />;
  if (page.kind === "city" && variant === "local") return <CityLocalBody page={page} />;
  if (page.kind === "contact" && variant === "local") return <ContactRouteBody page={page} />;
  if (page.kind === "legal" && variant === "terrain") return <LegalDocumentBody page={page} />;
  if (page.kind === "contact") return <ContactBody page={page} variant={variant} />;
  if (page.kind === "map" || page.kind === "city") return <MapBody page={page} variant={variant} />;
  if (page.kind === "detail" || page.kind === "article" || page.kind === "legal") {
    return <EditorialBody page={page} variant={variant} />;
  }
  return <ListingBody page={page} variant={variant} />;
}

function ProfessionalArticleBody({ page }: { page: PreviewPage }) {
  const brief = [
    {
      label: "Ce qui change",
      text: "La méthode corrige les effets de seuil pénalisant certaines petites surfaces.",
    },
    {
      label: "Qui est concerné",
      text: "Les propriétaires, bailleurs et vendeurs dont le rapport doit être utilisé en 2026.",
    },
    {
      label: "Le bon réflexe",
      text: "Contrôler la date et la validité du DPE avant toute nouvelle mise sur le marché.",
    },
  ];
  const complements = [
    "Le calcul devient plus cohérent avec les caractéristiques réelles du logement. L’objectif est d’éviter qu’une faible surface soit mécaniquement défavorisée par certains postes de consommation.",
    "La situation dépend de la date du diagnostic, de la surface du bien et de l’usage prévu : vente, location ou renouvellement de bail. Un même changement ne produit donc pas le même effet pour tous.",
    "Commencez par retrouver la date et le numéro de votre rapport. Avant de publier une annonce ou de signer, faites confirmer s’il reste exploitable ou si une nouvelle intervention est préférable.",
  ];

  return (
    <section className="bg-[color:var(--color-home-bg)] px-6 py-12 sm:px-10 lg:px-14 lg:py-16">
      <div
        id="article-en-bref"
        className="scroll-mt-32 bg-[color:var(--color-home-saf)] text-[color:var(--color-home-ink)]"
      >
        <div className="border-b border-[color:var(--color-home-ink)]/20 px-6 py-5 sm:px-7">
          <p className="inline-flex items-center gap-2 font-[family-name:var(--font-sora)] text-[16px] font-extrabold">
            <BookOpenTextIcon className="h-5 w-5" /> L’essentiel en 30 secondes
          </p>
        </div>
        <div className="divide-y divide-[color:var(--color-home-ink)]/20 md:grid md:grid-cols-3 md:divide-x md:divide-y-0">
          {brief.map((item, index) => (
            <div key={item.label} className="px-6 py-6 sm:px-7">
              <p className="text-[11px] font-extrabold tracking-[.08em] text-[color:var(--color-si-petrole)]">
                0{index + 1} · {item.label}
              </p>
              <p className="mt-3 text-[14px] leading-[1.65] font-medium">{item.text}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-12 grid gap-12 lg:grid-cols-[minmax(0,760px)_280px] lg:justify-between">
        <article>
          <p className="border-y border-[color:var(--color-home-line)] py-6 text-[18px] leading-[1.75] font-medium text-[color:var(--color-home-ink)]">
            Une évolution réglementaire n’oblige pas toujours à refaire immédiatement un diagnostic.
            Elle impose en revanche de vérifier si le document présenté correspond encore à votre
            projet.
          </p>

          {page.items.map((item, index) => (
            <section
              id={`article-section-${index}`}
              key={item.title}
              className="scroll-mt-32 border-b border-[color:var(--color-home-line)] py-9 first:pt-11"
            >
              <div className="grid gap-4 sm:grid-cols-[42px_minmax(0,1fr)]">
                <span className="font-[family-name:var(--font-sora)] text-[13px] font-extrabold text-[color:var(--color-home-saf-dark)]">
                  0{index + 1}
                </span>
                <div>
                  <h2 className="font-[family-name:var(--font-sora)] text-[clamp(22px,2.6vw,30px)] leading-tight font-extrabold tracking-[-0.02em] text-balance text-[color:var(--color-home-ink)]">
                    {item.title}
                  </h2>
                  <p className="mt-4 text-[15.5px] leading-[1.85] text-[color:var(--color-home-muted-2)]">
                    {item.text} {complements[index]}
                  </p>
                  {index === 1 && (
                    <aside className="mt-7 bg-[color:var(--color-home-ink)] px-6 py-6 text-white">
                      <p className="text-[11px] font-extrabold tracking-[.08em] text-[color:var(--color-home-saf)]">
                        POINT DE VIGILANCE
                      </p>
                      <p className="mt-3 text-[15px] leading-[1.7] text-white/82">
                        Ne vous fiez pas uniquement à la lettre affichée sur une ancienne annonce.
                        La date, le numéro du DPE et le contexte de la transaction sont
                        déterminants.
                      </p>
                    </aside>
                  )}
                </div>
              </div>
            </section>
          ))}

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
        </article>

        <aside className="h-fit lg:sticky lg:top-[122px]">
          <nav
            aria-label="Sommaire de l’article"
            className="border-y border-[color:var(--color-home-line)] py-6"
          >
            <p className="inline-flex items-center gap-2 font-[family-name:var(--font-sora)] text-[14px] font-extrabold text-[color:var(--color-home-ink)]">
              <BookOpenTextIcon className="h-4 w-4 text-[color:var(--color-si-petrole)]" /> Dans cet
              article
            </p>
            <ol className="mt-5 space-y-4">
              {page.items.map((item, index) => (
                <li key={item.title}>
                  <a
                    href={`#article-section-${index}`}
                    className="group flex gap-3 text-[13px] leading-snug text-[color:var(--color-home-muted-2)] transition-colors hover:text-[color:var(--color-si-petrole)]"
                  >
                    <span className="font-bold text-[color:var(--color-home-saf-dark)]">
                      0{index + 1}
                    </span>
                    <span>{item.title}</span>
                  </a>
                </li>
              ))}
            </ol>
          </nav>
          <div className="mt-7 bg-[color:var(--color-si-creme)] p-5">
            <FileCheck2Icon className="h-6 w-6 text-[color:var(--color-si-petrole)]" />
            <p className="mt-4 font-[family-name:var(--font-sora)] text-[14px] font-extrabold text-[color:var(--color-home-ink)]">
              Document contrôlé
            </p>
            <p className="mt-2 text-[12.5px] leading-relaxed text-[color:var(--color-home-muted-2)]">
              Mis à jour le 12 juillet 2026 et relu par l’équipe technique.
            </p>
          </div>
        </aside>
      </div>
    </section>
  );
}

function ServicesProjectBody({ page }: { page: PreviewPage }) {
  const projects = [
    { label: "Je vends", detail: "Préparer le dossier avant compromis", icon: HomeIcon },
    { label: "Je loue", detail: "Sécuriser le bail et le locataire", icon: FileTextIcon },
    {
      label: "Je fais des travaux",
      detail: "Repérer les risques avant chantier",
      icon: WrenchIcon,
    },
    {
      label: "Je gère une copropriété",
      detail: "Planifier les obligations collectives",
      icon: Building2Icon,
    },
  ];

  return (
    <section className="bg-[color:var(--color-home-bg)] px-6 py-12 sm:px-10 lg:px-14 lg:py-16">
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
              href="#expertises-services"
              className="group min-h-36 border-b border-[color:var(--color-home-line)] bg-white p-5 transition-colors hover:bg-[color:var(--color-home-saf-bg)] focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-[color:var(--color-si-petrole)] sm:border-r lg:border-b-0"
            >
              <Icon className="h-5 w-5 text-[color:var(--color-si-petrole)]" aria-hidden />
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
        id="expertises-services"
        className="mt-12 grid scroll-mt-32 overflow-hidden bg-[color:var(--color-home-ink)] lg:grid-cols-[320px_minmax(0,1fr)]"
      >
        <div className="flex flex-col justify-between px-6 py-8 text-white sm:px-8 lg:py-10">
          <div>
            <ClipboardCheckIcon
              className="h-7 w-7 text-[color:var(--color-home-saf)]"
              aria-hidden
            />
            <h3 className="mt-6 font-[family-name:var(--font-sora)] text-[26px] leading-tight font-extrabold text-balance">
              Le bon diagnostic, au bon moment.
            </h3>
            <p className="mt-4 text-[14px] leading-[1.7] text-white/74">
              Nous regroupons les contrôles compatibles en une seule intervention et expliquons
              chaque résultat.
            </p>
          </div>
          <p className="mt-9 border-t border-white/20 pt-5 text-[12.5px] font-semibold text-white/82">
            Techniciens certifiés · Rapports expliqués · Intervention locale
          </p>
        </div>
        <div className="divide-y divide-[color:var(--color-home-line)] bg-white px-6 sm:px-8">
          {page.items.map((item) => (
            <article
              key={item.title}
              className="group grid gap-3 py-6 sm:grid-cols-[110px_minmax(0,1fr)_auto] sm:items-center"
            >
              <p className="text-[11px] font-bold text-[color:var(--color-home-saf-dark)]">
                {item.meta}
              </p>
              <div>
                <h3 className="font-[family-name:var(--font-sora)] text-[17px] font-bold text-[color:var(--color-home-ink)]">
                  {item.title}
                </h3>
                <p className="mt-1.5 text-[13.5px] leading-relaxed text-[color:var(--color-home-muted-2)]">
                  {item.text}
                </p>
              </div>
              <ArrowRightIcon
                className="h-4 w-4 text-[color:var(--color-si-petrole)] transition-transform group-hover:translate-x-1"
                aria-hidden
              />
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function ServiceMissionBody({ page }: { page: PreviewPage }) {
  const stepDetails = [
    "Nous vérifions le projet, le type de bien et les documents déjà disponibles avant de confirmer le périmètre.",
    "Le technicien relève les caractéristiques du logement et contrôle les équipements sans dégrader le bien.",
    "Vous recevez un document réglementaire accompagné d’une explication claire des résultats et des prochaines étapes.",
  ];

  return (
    <section className="bg-[color:var(--color-home-bg)] px-6 py-12 sm:px-10 lg:px-14 lg:py-16">
      <div className="grid bg-[color:var(--color-home-saf)] text-[color:var(--color-home-ink)] md:grid-cols-3">
        {[
          ["Quand", "Avant toute vente ou nouvelle mise en location"],
          ["Validité", page.stat],
          ["Livrable", "Rapport réglementaire expliqué"],
        ].map(([label, value]) => (
          <div
            key={label}
            className="border-b border-[color:var(--color-home-ink)]/18 px-6 py-6 last:border-b-0 md:border-r md:border-b-0 md:last:border-r-0"
          >
            <p className="text-[11px] font-bold text-[color:var(--color-si-petrole)]">{label}</p>
            <p className="mt-2 font-[family-name:var(--font-sora)] text-[15px] leading-snug font-bold">
              {value}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-12 grid gap-12 lg:grid-cols-[minmax(0,1fr)_310px]">
        <div>
          <div className="flex items-center gap-3">
            <ListChecksIcon className="h-6 w-6 text-[color:var(--color-si-petrole)]" aria-hidden />
            <h2 className="font-[family-name:var(--font-sora)] text-[clamp(26px,3vw,38px)] font-extrabold tracking-[-0.025em] text-balance text-[color:var(--color-home-ink)]">
              De la préparation au rapport
            </h2>
          </div>
          <ol className="mt-7 divide-y divide-[color:var(--color-home-line)] border-y border-[color:var(--color-home-line)]">
            {page.items.map((item, index) => (
              <li key={item.title} className="grid gap-4 py-7 sm:grid-cols-[44px_minmax(0,1fr)]">
                <span className="font-[family-name:var(--font-sora)] text-[13px] font-extrabold text-[color:var(--color-home-saf-dark)]">
                  0{index + 1}
                </span>
                <div>
                  <h3 className="font-[family-name:var(--font-sora)] text-[18px] font-bold text-[color:var(--color-home-ink)]">
                    {item.title}
                  </h3>
                  <p className="mt-3 max-w-[68ch] text-[14.5px] leading-[1.75] text-[color:var(--color-home-muted-2)]">
                    {item.text} {stepDetails[index]}
                  </p>
                </div>
              </li>
            ))}
          </ol>

          <div className="mt-10">
            <h3 className="font-[family-name:var(--font-sora)] text-[20px] font-bold text-[color:var(--color-home-ink)]">
              Questions fréquentes
            </h3>
            <div className="mt-4 divide-y divide-[color:var(--color-home-line)] border-y border-[color:var(--color-home-line)]">
              <details className="group py-5">
                <summary className="cursor-pointer list-none font-[family-name:var(--font-sora)] text-[14px] font-bold text-[color:var(--color-home-ink)]">
                  Dois-je préparer des documents avant la visite ?
                </summary>
                <p className="mt-3 max-w-[68ch] text-[13.5px] leading-relaxed text-[color:var(--color-home-muted-2)]">
                  Les factures de travaux, références des équipements et anciens diagnostics peuvent
                  améliorer la précision du dossier.
                </p>
              </details>
              <details className="group py-5">
                <summary className="cursor-pointer list-none font-[family-name:var(--font-sora)] text-[14px] font-bold text-[color:var(--color-home-ink)]">
                  Quand vais-je recevoir mon rapport ?
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
          <FileCheck2Icon className="h-7 w-7 text-[color:var(--color-home-saf)]" aria-hidden />
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
    </section>
  );
}

function NewsroomBody({ page }: { page: PreviewPage }) {
  return (
    <section className="bg-[color:var(--color-home-bg)] px-6 py-12 sm:px-10 lg:px-14 lg:py-16">
      <nav
        aria-label="Catégories d’actualités"
        className="flex flex-wrap gap-2 border-b border-[color:var(--color-home-line)] pb-6"
      >
        {["Tous les sujets", "DPE", "Location", "Travaux", "Amiante"].map((category, index) => (
          <a
            key={category}
            href="#fil-actualites"
            className={`inline-flex min-h-11 items-center rounded-full px-4 text-[12.5px] font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--color-si-petrole)] ${index === 0 ? "bg-[color:var(--color-home-ink)] text-white" : "bg-white text-[color:var(--color-home-ink)] hover:bg-[color:var(--color-home-saf-bg)]"}`}
          >
            {category}
          </a>
        ))}
      </nav>

      <div
        id="fil-actualites"
        className="mt-10 grid scroll-mt-32 gap-12 lg:grid-cols-[minmax(0,1fr)_320px]"
      >
        <div>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-[13px] font-semibold text-[color:var(--color-home-saf-dark)]">
                Le fil Servicimmo
              </p>
              <h2 className="mt-2 font-[family-name:var(--font-sora)] text-[clamp(26px,3vw,38px)] font-extrabold tracking-[-0.025em] text-[color:var(--color-home-ink)]">
                Les changements à suivre maintenant
              </h2>
            </div>
            <p className="text-[12px] font-semibold text-[color:var(--color-home-muted-2)]">
              {page.stat} articles depuis 2017
            </p>
          </div>
          <div className="mt-7 divide-y divide-[color:var(--color-home-line)] border-y border-[color:var(--color-home-line)]">
            {page.items.slice(1).map((item) => (
              <article
                key={item.title}
                className="group grid gap-5 py-7 sm:grid-cols-[120px_minmax(0,1fr)_auto] sm:items-start"
              >
                <p className="text-[11.5px] font-bold text-[color:var(--color-home-saf-dark)]">
                  {item.meta}
                </p>
                <div>
                  <h3 className="font-[family-name:var(--font-sora)] text-[19px] leading-snug font-bold text-balance text-[color:var(--color-home-ink)]">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-[14px] leading-relaxed text-[color:var(--color-home-muted-2)]">
                    {item.text}
                  </p>
                </div>
                <ArrowRightIcon
                  className="h-4 w-4 text-[color:var(--color-si-petrole)] transition-transform group-hover:translate-x-1"
                  aria-hidden
                />
              </article>
            ))}
          </div>
        </div>

        <aside className="h-fit bg-[color:var(--color-si-petrole)] p-6 text-white">
          <NewspaperIcon className="h-7 w-7 text-[color:var(--color-home-saf)]" aria-hidden />
          <p className="mt-6 text-[12px] font-bold text-[color:var(--color-home-saf)]">
            ALERTE RÉGLEMENTAIRE
          </p>
          <h3 className="mt-3 font-[family-name:var(--font-sora)] text-[24px] leading-tight font-extrabold text-balance">
            DPE 2026 : vérifiez votre situation avant de publier.
          </h3>
          <p className="mt-4 text-[13.5px] leading-[1.7] text-white/76">
            Les petites surfaces et certains anciens rapports demandent une attention particulière.
            Notre équipe vous aide à comprendre ce qui s’applique à votre bien.
          </p>
          <a
            href="#"
            className="mt-7 inline-flex min-h-11 items-center gap-2 bg-[color:var(--color-home-saf)] px-4 text-[12.5px] font-bold text-[color:var(--color-home-ink)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            Lire le dossier complet <ArrowRightIcon className="h-4 w-4" />
          </a>
        </aside>
      </div>
    </section>
  );
}

function CityLocalBody({ page }: { page: PreviewPage }) {
  return (
    <section className="bg-[color:var(--color-home-bg)] px-6 py-12 sm:px-10 lg:px-14 lg:py-16">
      <div className="grid overflow-hidden bg-white lg:grid-cols-[1.08fr_.92fr]">
        <div className="relative min-h-[390px] bg-[color:var(--color-home-line)]">
          <GoogleMapEmbed
            query={`${page.accent}, Indre-et-Loire, France`}
            center={{ lat: 47.397272, lng: 0.987649 }}
            zoom={13}
            title={`Carte Google Maps de ${page.accent}`}
            className="min-h-[390px]"
          />
          <div className="pointer-events-none absolute top-4 left-4 z-10 bg-[color:var(--color-home-ink)] px-4 py-3 text-[12px] font-semibold text-white shadow-[0_6px_8px_rgba(15,30,58,.16)]">
            <p className="inline-flex items-center gap-2">
              <MapPinIcon className="h-4 w-4 text-[color:var(--color-home-saf)]" aria-hidden />{" "}
              {page.accent} · 37400
            </p>
          </div>
        </div>
        <div className="px-6 py-8 sm:px-8 lg:py-10">
          <p className="text-[13px] font-semibold text-[color:var(--color-home-saf-dark)]">
            Votre dossier local
          </p>
          <h2 className="mt-2 font-[family-name:var(--font-sora)] text-[clamp(26px,3vw,38px)] leading-tight font-extrabold tracking-[-0.025em] text-balance text-[color:var(--color-home-ink)]">
            À Amboise, chaque projet appelle les bons contrôles.
          </h2>
          <div className="mt-7 divide-y divide-[color:var(--color-home-line)] border-y border-[color:var(--color-home-line)]">
            {page.items.map((item) => (
              <div key={item.title} className="py-5">
                <h3 className="font-[family-name:var(--font-sora)] text-[15px] font-bold text-[color:var(--color-home-ink)]">
                  {item.title}
                </h3>
                <p className="mt-2 text-[13px] leading-relaxed text-[color:var(--color-home-muted-2)]">
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[.8fr_1.2fr]">
        <div className="bg-[color:var(--color-si-creme)] p-6">
          <Building2Icon className="h-6 w-6 text-[color:var(--color-si-petrole)]" aria-hidden />
          <h3 className="mt-5 font-[family-name:var(--font-sora)] text-[19px] font-bold text-[color:var(--color-home-ink)]">
            Une lecture adaptée au bâti local
          </h3>
          <p className="mt-3 text-[13.5px] leading-[1.7] text-[color:var(--color-home-muted-2)]">
            Centre historique, maisons de ville, pavillons ou logements rénovés : l’âge du bien et
            votre projet déterminent les diagnostics à prévoir.
          </p>
        </div>
        <div className="grid bg-[color:var(--color-home-ink)] text-white sm:grid-cols-3">
          {[
            ["Depuis Tours", page.stat],
            ["Créneau possible", "Sous 48 h"],
            ["Secteur proche", "Bléré · Montlouis · Château-Renault"],
          ].map(([label, value]) => (
            <div
              key={label}
              className="border-b border-white/18 p-6 last:border-b-0 sm:border-r sm:border-b-0 sm:last:border-r-0"
            >
              <p className="text-[11px] font-semibold text-white/58">{label}</p>
              <p className="mt-3 font-[family-name:var(--font-sora)] text-[14px] leading-snug font-bold">
                {value}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ContactRouteBody({ page }: { page: PreviewPage }) {
  const intents = [
    {
      label: "Demander un devis",
      detail: "Je prépare une vente, une location ou des travaux.",
      icon: FileTextIcon,
    },
    {
      label: "Comprendre un rapport",
      detail: "J’ai une question après une intervention.",
      icon: CircleHelpIcon,
    },
    {
      label: "Prendre rendez-vous",
      detail: "Je connais déjà les diagnostics nécessaires.",
      icon: CalendarDaysIcon,
    },
    {
      label: "Parler à l’équipe",
      detail: "Je préfère expliquer ma situation directement.",
      icon: PhoneIcon,
    },
  ];

  return (
    <section className="bg-[color:var(--color-home-bg)] px-6 py-12 sm:px-10 lg:px-14 lg:py-16">
      <div className="grid gap-10 lg:grid-cols-[.88fr_1.12fr]">
        <div>
          <h2 className="font-[family-name:var(--font-sora)] text-[clamp(27px,3.2vw,40px)] leading-tight font-extrabold tracking-[-0.025em] text-balance text-[color:var(--color-home-ink)]">
            Choisissez le chemin le plus simple.
          </h2>
          <fieldset className="mt-7 divide-y divide-[color:var(--color-home-line)] border-y border-[color:var(--color-home-line)]">
            <legend className="sr-only">Motif de votre demande</legend>
            {intents.map((intent, index) => {
              const Icon = intent.icon;
              return (
                <label
                  key={intent.label}
                  className="flex min-h-20 cursor-pointer items-center gap-4 py-4"
                >
                  <input
                    type="radio"
                    name="contact-intent"
                    defaultChecked={index === 0}
                    className="h-4 w-4 accent-[color:var(--color-si-petrole)]"
                  />
                  <Icon
                    className="h-5 w-5 shrink-0 text-[color:var(--color-si-petrole)]"
                    aria-hidden
                  />
                  <span>
                    <span className="block font-[family-name:var(--font-sora)] text-[14px] font-bold text-[color:var(--color-home-ink)]">
                      {intent.label}
                    </span>
                    <span className="mt-1 block text-[12.5px] leading-relaxed text-[color:var(--color-home-muted-2)]">
                      {intent.detail}
                    </span>
                  </span>
                </label>
              );
            })}
          </fieldset>

          <div className="mt-8 overflow-hidden bg-white">
            <div className="h-[250px]">
              <GoogleMapEmbed
                query="58 rue de la Chevalerie, 37100 Tours, France"
                center={{ lat: 47.3941, lng: 0.6848 }}
                zoom={15}
                title="Carte Google Maps de l’agence Servicimmo"
                className="min-h-[250px]"
              />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 text-[12px] text-[color:var(--color-home-muted-2)]">
              <span className="inline-flex items-center gap-2 font-semibold text-[color:var(--color-home-ink)]">
                <MapPinIcon className="h-4 w-4 text-[color:var(--color-home-saf-dark)]" /> 58 rue de
                la Chevalerie · Tours
              </span>
              <span>Accueil sur rendez-vous</span>
            </div>
          </div>
        </div>

        <form className="bg-white p-6 sm:p-8" onSubmit={(event) => event.preventDefault()}>
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[color:var(--color-home-line)] pb-6">
            <div>
              <p className="text-[13px] font-semibold text-[color:var(--color-home-saf-dark)]">
                Demande rapide
              </p>
              <h2 className="mt-1 font-[family-name:var(--font-sora)] text-[24px] font-extrabold text-[color:var(--color-home-ink)]">
                Parlez-nous de votre bien
              </h2>
            </div>
            <p className="inline-flex items-center gap-2 text-[12px] font-semibold text-[color:var(--color-home-muted-2)]">
              <Clock3Icon className="h-4 w-4 text-[color:var(--color-home-saf-dark)]" /> Réponse
              sous {page.stat}
            </p>
          </div>
          <div className="mt-7 grid gap-6 sm:grid-cols-2">
            <label className="text-[12.5px] font-semibold text-[color:var(--color-home-ink)]">
              Nom et prénom
              <input
                required
                className="mt-2 min-h-12 w-full border-b border-[color:var(--color-home-line)] bg-transparent text-[14px] font-normal transition-colors outline-none focus:border-[color:var(--color-si-petrole)]"
              />
            </label>
            <label className="text-[12.5px] font-semibold text-[color:var(--color-home-ink)]">
              Téléphone
              <input
                type="tel"
                required
                className="mt-2 min-h-12 w-full border-b border-[color:var(--color-home-line)] bg-transparent text-[14px] font-normal transition-colors outline-none focus:border-[color:var(--color-si-petrole)]"
              />
            </label>
            <label className="text-[12.5px] font-semibold text-[color:var(--color-home-ink)]">
              E-mail
              <input
                type="email"
                required
                className="mt-2 min-h-12 w-full border-b border-[color:var(--color-home-line)] bg-transparent text-[14px] font-normal transition-colors outline-none focus:border-[color:var(--color-si-petrole)]"
              />
            </label>
            <label className="text-[12.5px] font-semibold text-[color:var(--color-home-ink)]">
              Commune du bien
              <input className="mt-2 min-h-12 w-full border-b border-[color:var(--color-home-line)] bg-transparent text-[14px] font-normal transition-colors outline-none focus:border-[color:var(--color-si-petrole)]" />
            </label>
          </div>
          <label className="mt-7 block text-[12.5px] font-semibold text-[color:var(--color-home-ink)]">
            Votre message
            <textarea
              rows={4}
              className="mt-3 w-full resize-none border border-[color:var(--color-home-line)] bg-[color:var(--color-home-bg)] p-4 text-[14px] font-normal transition-colors outline-none focus:border-[color:var(--color-si-petrole)]"
            />
          </label>
          <div className="mt-7 flex flex-wrap items-center justify-between gap-4">
            <p className="max-w-[34ch] text-[11.5px] leading-relaxed text-[color:var(--color-home-muted-2)]">
              Vos informations servent uniquement à traiter cette demande.
            </p>
            <button
              type="submit"
              className="inline-flex min-h-12 items-center gap-2 bg-[color:var(--color-home-saf)] px-5 text-[13px] font-bold text-[color:var(--color-home-ink)] transition-colors hover:bg-[color:var(--color-home-saf-soft)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--color-si-petrole)]"
            >
              Envoyer à l’équipe <SendIcon className="h-4 w-4" />
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}

function LegalDocumentBody({ page }: { page: PreviewPage }) {
  const complements = [
    "Servicimmo présente ici les informations permettant d’identifier l’entreprise et le responsable de la publication.",
    "Les coordonnées du prestataire et les conditions techniques d’hébergement sont regroupées dans cette section.",
    "Vous pouvez connaître les données utilisées, leur durée de conservation et les moyens d’exercer vos droits.",
    "Les modalités de commande, d’intervention, de paiement et de responsabilité sont accessibles avant toute validation.",
  ];

  return (
    <section className="bg-[color:var(--color-home-bg)] px-6 py-12 sm:px-10 lg:px-14 lg:py-16">
      <div className="flex flex-wrap items-center justify-between gap-4 border-y border-[color:var(--color-home-line)] py-4 text-[12px] font-semibold text-[color:var(--color-home-muted-2)]">
        <span className="inline-flex items-center gap-2">
          <BadgeCheckIcon className="h-4 w-4 text-[color:var(--color-home-saf-dark)]" /> Version
          contrôlée · 2026.07
        </span>
        <button
          type="button"
          className="inline-flex min-h-11 items-center gap-2 px-3 font-bold text-[color:var(--color-si-petrole)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--color-si-petrole)]"
        >
          <PrinterIcon className="h-4 w-4" /> Imprimer le document
        </button>
      </div>

      <div className="mt-10 grid gap-12 lg:grid-cols-[250px_minmax(0,760px)] lg:justify-between">
        <aside className="h-fit lg:sticky lg:top-[122px]">
          <p className="font-[family-name:var(--font-sora)] text-[14px] font-extrabold text-[color:var(--color-home-ink)]">
            Sommaire du document
          </p>
          <nav
            aria-label="Sommaire des informations contractuelles"
            className="mt-5 border-y border-[color:var(--color-home-line)]"
          >
            {page.items.map((item, index) => (
              <a
                key={item.title}
                href={`#legal-section-${index}`}
                className="flex min-h-12 items-center justify-between gap-3 border-b border-[color:var(--color-home-line)] py-3 text-[12.5px] font-semibold text-[color:var(--color-home-muted-2)] transition-colors last:border-b-0 hover:text-[color:var(--color-si-petrole)]"
              >
                <span>{item.title}</span>
                <span className="text-[color:var(--color-home-saf-dark)]">0{index + 1}</span>
              </a>
            ))}
          </nav>
          <p className="mt-6 text-[11.5px] leading-relaxed text-[color:var(--color-home-muted-2)]">
            Dernière mise à jour : 15 juillet 2026. Pour toute question, écrivez à
            info@servicimmo.fr.
          </p>
        </aside>

        <article>
          <p className="max-w-[70ch] text-[18px] leading-[1.75] font-medium text-[color:var(--color-home-ink)]">
            Toutes les informations essentielles sont regroupées dans un document lisible, versionné
            et consultable avant votre engagement.
          </p>
          <div className="mt-8 divide-y divide-[color:var(--color-home-line)] border-y border-[color:var(--color-home-line)]">
            {page.items.map((item, index) => (
              <section id={`legal-section-${index}`} key={item.title} className="scroll-mt-32 py-8">
                <div className="grid gap-4 sm:grid-cols-[42px_minmax(0,1fr)]">
                  <span className="font-[family-name:var(--font-sora)] text-[12px] font-extrabold text-[color:var(--color-home-saf-dark)]">
                    0{index + 1}
                  </span>
                  <div>
                    <h2 className="font-[family-name:var(--font-sora)] text-[23px] font-extrabold tracking-[-0.02em] text-[color:var(--color-home-ink)]">
                      {item.title}
                    </h2>
                    <p className="mt-4 text-[14.5px] leading-[1.8] text-[color:var(--color-home-muted-2)]">
                      {item.text} {complements[index]}
                    </p>
                  </div>
                </div>
              </section>
            ))}
          </div>
          <div className="mt-9 bg-[color:var(--color-si-creme)] p-6">
            <ShieldCheckIcon className="h-6 w-6 text-[color:var(--color-si-petrole)]" />
            <h3 className="mt-4 font-[family-name:var(--font-sora)] text-[18px] font-bold text-[color:var(--color-home-ink)]">
              Exercer vos droits
            </h3>
            <p className="mt-3 max-w-[66ch] text-[13.5px] leading-[1.7] text-[color:var(--color-home-muted-2)]">
              Pour toute demande concernant vos données ou ces informations contractuelles,
              contactez directement Servicimmo. Une réponse vous sera apportée dans les délais
              applicables.
            </p>
          </div>
        </article>
      </div>
    </section>
  );
}

function ListingBody({ page, variant }: Props) {
  const isNews = page.kind === "news";
  return (
    <section className="px-6 py-12 sm:px-10 lg:px-14 lg:py-16">
      <div className="mb-9 flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="text-[13px] font-semibold text-[color:var(--color-home-saf-dark)]">
            {isNews ? "À la une" : "Explorer les expertises"}
          </p>
          <h2 className="mt-2 font-[family-name:var(--font-sora)] text-[clamp(25px,3vw,38px)] font-extrabold tracking-[-0.02em] text-[color:var(--color-home-ink)]">
            {isNews ? "Comprendre avant de décider" : "Trouvez le diagnostic adapté"}
          </h2>
        </div>
        <button className="rounded-full border border-[color:var(--color-home-line)] px-5 py-2.5 text-[13px] font-semibold text-[color:var(--color-home-ink)]">
          Voir tout
        </button>
      </div>
      <div
        className={
          variant === "expertise"
            ? "divide-y divide-[color:var(--color-home-line)] border-y border-[color:var(--color-home-line)]"
            : "grid gap-5 md:grid-cols-2"
        }
      >
        {page.items.map((item, index) => (
          <article
            key={item.title}
            className={
              variant === "expertise"
                ? "group grid gap-4 py-6 sm:grid-cols-[50px_1fr_auto]"
                : "group border-b border-[color:var(--color-home-line)] py-5"
            }
          >
            {variant === "expertise" && (
              <span className="text-[12px] font-bold text-[color:var(--color-home-muted)]">
                0{index + 1}
              </span>
            )}
            <div>
              {item.meta && (
                <p className="mb-2 text-[11px] font-semibold text-[color:var(--color-home-saf-dark)]">
                  {item.meta}
                </p>
              )}
              <h3 className="font-[family-name:var(--font-sora)] text-[17px] font-bold text-[color:var(--color-home-ink)]">
                {item.title}
              </h3>
              <p className="mt-2 text-[14px] leading-relaxed text-[color:var(--color-home-muted-2)]">
                {item.text}
              </p>
            </div>
            <ArrowRightIcon className="mt-1 h-4 w-4 text-[color:var(--color-si-petrole)] transition-transform group-hover:translate-x-1" />
          </article>
        ))}
      </div>
    </section>
  );
}

function EditorialBody({ page, variant }: Props) {
  return (
    <section className="grid gap-10 px-6 py-12 sm:px-10 lg:grid-cols-[minmax(0,1fr)_280px] lg:px-14 lg:py-16">
      <article className="max-w-[70ch]">
        <p className="text-[18px] leading-[1.75] font-medium text-[color:var(--color-home-ink)]">
          {page.description}
        </p>
        {page.items.map((item) => (
          <section
            key={item.title}
            className="mt-9 border-t border-[color:var(--color-home-line)] pt-7"
          >
            <h2 className="font-[family-name:var(--font-sora)] text-[22px] font-bold text-[color:var(--color-home-ink)]">
              {item.title}
            </h2>
            <p className="mt-3 text-[15.5px] leading-[1.8] text-[color:var(--color-home-muted-2)]">
              {item.text} Notre équipe vous aide à interpréter les règles applicables à votre
              situation et à préparer les prochaines étapes sans jargon inutile.
            </p>
          </section>
        ))}
      </article>
      <aside
        className={`h-fit p-6 ${variant === "local" ? "bg-[color:var(--color-home-saf-bg)]" : "bg-white"} rounded-[14px]`}
      >
        <p className="font-[family-name:var(--font-sora)] text-[14px] font-bold text-[color:var(--color-home-ink)]">
          À retenir
        </p>
        <ul className="mt-4 space-y-4 text-[13.5px] leading-relaxed text-[color:var(--color-home-muted-2)]">
          <li className="flex gap-2">
            <CheckCircle2Icon className="mt-0.5 h-4 w-4 shrink-0 text-[color:var(--color-home-saf-dark)]" />{" "}
            Vérifiez la date de vos rapports.
          </li>
          <li className="flex gap-2">
            <CheckCircle2Icon className="mt-0.5 h-4 w-4 shrink-0 text-[color:var(--color-home-saf-dark)]" />{" "}
            Regroupez les diagnostics en une intervention.
          </li>
          <li className="flex gap-2">
            <CheckCircle2Icon className="mt-0.5 h-4 w-4 shrink-0 text-[color:var(--color-home-saf-dark)]" />{" "}
            Demandez conseil avant de publier l’annonce.
          </li>
        </ul>
      </aside>
    </section>
  );
}

function MapBody({ page, variant }: Props) {
  const isCity = page.kind === "city";
  const mapQuery = isCity ? `${page.accent}, Indre-et-Loire, France` : "Indre-et-Loire, France";

  return (
    <section className="grid gap-8 px-6 py-12 sm:px-10 lg:grid-cols-[1.05fr_.95fr] lg:px-14 lg:py-16">
      <div className="relative min-h-[390px] overflow-hidden rounded-[16px] bg-[color:var(--color-home-line)]">
        <GoogleMapEmbed
          query={mapQuery}
          center={isCity ? { lat: 47.397272, lng: 0.987649 } : { lat: 47.31, lng: 0.68 }}
          zoom={isCity ? 13 : 9}
          title={
            isCity ? `Carte Google Maps de ${page.accent}` : "Carte Google Maps de l’Indre-et-Loire"
          }
          className="min-h-[390px]"
        />
        <div className="pointer-events-none absolute top-4 left-4 z-10 bg-[color:var(--color-home-ink)] px-4 py-3 text-[12px] font-semibold text-white shadow-[0_6px_8px_rgba(15,30,58,.16)]">
          <p className="inline-flex items-center gap-2">
            <MapPinIcon className="h-4 w-4 text-[color:var(--color-home-saf)]" aria-hidden />{" "}
            {isCity ? `${page.accent} · 37400` : "Indre-et-Loire · 37"}
          </p>
        </div>
      </div>
      <div>
        <p className="text-[13px] font-semibold text-[color:var(--color-home-saf-dark)]">
          Interventions locales
        </p>
        <h2 className="mt-2 font-[family-name:var(--font-sora)] text-[30px] font-extrabold tracking-[-0.02em] text-[color:var(--color-home-ink)]">
          Une équipe proche de votre bien
        </h2>
        <div className="mt-7 space-y-1">
          {page.items.map((item) => (
            <div
              key={item.title}
              className={`border-b border-[color:var(--color-home-line)] py-5 ${variant === "expertise" ? "grid grid-cols-[1fr_auto]" : ""}`}
            >
              <h3 className="font-[family-name:var(--font-sora)] text-[16px] font-bold text-[color:var(--color-home-ink)]">
                {item.title}
              </h3>
              <p className="mt-1 text-[13.5px] leading-relaxed text-[color:var(--color-home-muted-2)]">
                {item.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ContactBody({ page, variant }: Props) {
  return (
    <section className="grid gap-8 px-6 py-12 sm:px-10 lg:grid-cols-[.85fr_1.15fr] lg:px-14 lg:py-16">
      <div className="space-y-3">
        {page.items.map((item, index) => {
          const Icon = index === 0 ? PhoneIcon : index === 1 ? MailIcon : MapPinIcon;
          return (
            <div
              key={item.title}
              className="flex gap-4 border-b border-[color:var(--color-home-line)] py-5"
            >
              <Icon className="mt-1 h-5 w-5 shrink-0 text-[color:var(--color-si-petrole)]" />
              <div>
                <p className="text-[11px] font-semibold text-[color:var(--color-home-saf-dark)]">
                  {item.meta}
                </p>
                <h2 className="mt-1 font-[family-name:var(--font-sora)] text-[17px] font-bold text-[color:var(--color-home-ink)]">
                  {item.title}
                </h2>
                <p className="mt-1 text-[13.5px] text-[color:var(--color-home-muted-2)]">
                  {item.text}
                </p>
              </div>
            </div>
          );
        })}
      </div>
      <div
        className={`rounded-[16px] p-6 sm:p-8 ${variant === "expertise" ? "bg-[color:var(--color-home-ink)] text-white" : "bg-white text-[color:var(--color-home-ink)]"}`}
      >
        <h2 className="font-[family-name:var(--font-sora)] text-[22px] font-bold">
          Décrivez votre besoin
        </h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {["Votre nom", "Votre téléphone", "Votre e-mail", "Votre commune"].map((label) => (
            <div key={label} className="border-b border-current/20 py-3 text-[13px] opacity-65">
              {label}
            </div>
          ))}
        </div>
        <div className="mt-6 h-20 border-b border-current/20 text-[13px] opacity-65">
          Votre message
        </div>
        <button className="mt-7 inline-flex items-center gap-2 rounded-[9px] bg-[color:var(--color-home-saf)] px-5 py-3 text-[13px] font-bold text-[color:var(--color-home-ink)]">
          Envoyer ma demande <ArrowRightIcon className="h-4 w-4" />
        </button>
      </div>
    </section>
  );
}

function PreviewCta({ variant, page }: { variant: PreviewVariant; page?: PreviewPage }) {
  if (page?.kind === "contact" || page?.kind === "legal") return null;

  const content = (() => {
    switch (page?.kind) {
      case "catalog":
        return [
          "Quel est votre projet immobilier ?",
          "Identifiez seulement les diagnostics utiles à votre situation.",
          "Identifier mes diagnostics",
        ];
      case "detail":
        return [
          "Besoin d’un DPE pour votre bien ?",
          "Un technicien confirme le périmètre et le délai de votre intervention.",
          "Obtenir mon devis DPE",
        ];
      case "news":
        return [
          "Une règle change pour votre bien ?",
          "Recevez les prochains décryptages Servicimmo, sans jargon.",
          "Recevoir les alertes",
        ];
      case "article":
        return [
          "Votre DPE est-il encore valable ?",
          "Un expert Servicimmo vérifie votre situation et vous répond clairement.",
          "Vérifier mon DPE",
        ];
      case "map":
        return [
          "Votre commune est-elle couverte ?",
          "Vérifiez notre secteur et le délai habituel d’intervention.",
          "Vérifier ma commune",
        ];
      case "city":
        return [
          "Un bien à Amboise ?",
          "Obtenez un créneau avec une équipe qui connaît le secteur.",
          "Demander un créneau",
        ];
      default:
        return [
          "Quels diagnostics pour votre bien ?",
          "Réponse personnalisée en 2 minutes, sans engagement.",
          "Commencer mon devis",
        ];
    }
  })();

  return (
    <section className="px-6 pb-12 sm:px-10 lg:px-14 lg:pb-16">
      <div
        className={`flex flex-wrap items-center justify-between gap-6 rounded-[14px] px-7 py-7 ${variant === "local" ? "bg-[color:var(--color-home-saf)] text-[color:var(--color-home-ink)]" : "bg-[color:var(--color-si-petrole)] text-white"}`}
      >
        <div>
          <p className="font-[family-name:var(--font-sora)] text-[20px] font-bold">{content[0]}</p>
          <p className="mt-1 text-[13.5px] opacity-75">{content[1]}</p>
        </div>
        <button
          type="button"
          className={`inline-flex min-h-12 items-center gap-2 rounded-[9px] px-5 text-[13px] font-bold focus-visible:outline-2 focus-visible:outline-offset-2 ${variant === "local" ? "bg-[color:var(--color-home-ink)] text-white focus-visible:outline-[color:var(--color-si-petrole)]" : "bg-[color:var(--color-home-saf)] text-[color:var(--color-home-ink)] focus-visible:outline-white"}`}
        >
          {content[2]} <ArrowRightIcon className="h-4 w-4" />
        </button>
      </div>
    </section>
  );
}

function TrustLine() {
  return (
    <div className="mt-6 flex flex-wrap gap-4 text-[12.5px] font-semibold text-[color:var(--color-home-ink)]">
      <span className="inline-flex items-center gap-1.5">
        <ShieldCheckIcon className="h-4 w-4 text-[color:var(--color-home-saf-dark)]" /> Certifiés
        &amp; assurés
      </span>
      <span className="inline-flex items-center gap-1.5">
        <CalendarDaysIcon className="h-4 w-4 text-[color:var(--color-home-saf-dark)]" />{" "}
        Intervention sous 48 h
      </span>
    </div>
  );
}

function Metric({ page, className }: { page: PreviewPage; className: string }) {
  return (
    <div
      className={`absolute rounded-[12px] px-5 py-4 shadow-[0_8px_20px_rgba(15,30,58,.18)] ${className}`}
    >
      <p className="font-[family-name:var(--font-sora)] text-[26px] leading-none font-extrabold">
        {page.stat}
      </p>
      <p className="mt-1 max-w-[18ch] text-[11.5px] leading-snug opacity-75">{page.statLabel}</p>
    </div>
  );
}
