import Image from "next/image";
import type { ReactNode } from "react";
import {
  ArrowRightIcon,
  BookOpenIcon,
  CheckCircle2Icon,
  Clock3Icon,
  CompassIcon,
  FileCheck2Icon,
  MailIcon,
  MapIcon,
  MapPinIcon,
  NavigationIcon,
  PhoneIcon,
  RouteIcon,
} from "lucide-react";

import type { PreviewPage } from "./servicimmo-preview-data";

export function ServicimmoAtlasHero({ page }: { page: PreviewPage }) {
  switch (page.kind) {
    case "catalog":
      return <AtlasCatalog page={page} />;
    case "detail":
      return <AtlasService page={page} />;
    case "news":
      return <AtlasNews page={page} />;
    case "article":
      return <AtlasArticle page={page} />;
    case "map":
      return <AtlasZones page={page} />;
    case "city":
      return <AtlasCity page={page} />;
    case "contact":
      return <AtlasContact page={page} />;
    case "legal":
      return <AtlasLegal page={page} />;
  }
}

function AtlasCatalog({ page }: { page: PreviewPage }) {
  return (
    <section className="relative overflow-hidden bg-[color:var(--color-si-creme)] px-6 py-12 sm:px-8 lg:px-12 lg:py-16">
      <div className="grid gap-10 lg:grid-cols-[1.08fr_.92fr] lg:items-center">
        <div>
          <AtlasLabel icon={CompassIcon}>Répertoire des expertises</AtlasLabel>
          <h1 className="mt-5 font-[family-name:var(--font-sora)] text-[clamp(40px,5.8vw,76px)] leading-[.99] font-extrabold tracking-[-0.035em] text-balance text-[color:var(--color-home-ink)]">
            Le bon diagnostic,{" "}
            <span className="text-[color:var(--color-si-petrole)]">au bon endroit.</span>
          </h1>
          <p className="mt-6 max-w-[58ch] text-[16px] leading-[1.7] text-[color:var(--color-home-muted-2)]">
            {page.description}
          </p>
          <div className="mt-8 grid gap-x-8 gap-y-4 sm:grid-cols-2">
            {page.items.map((item) => (
              <AtlasLink key={item.title} label={item.title} meta={item.meta} />
            ))}
          </div>
        </div>
        <div className="relative min-h-[430px] rounded-[16px] bg-[color:var(--color-si-petrole)] text-white">
          <AtlasMap />
          <div className="absolute right-5 bottom-5 left-5 flex items-end justify-between gap-5 border-t border-white/30 pt-5">
            <p className="max-w-[20ch] font-[family-name:var(--font-sora)] text-[20px] leading-tight font-bold">
              {page.stat} expertises dans un rayon local.
            </p>
            <MapIcon className="h-8 w-8 text-[color:var(--color-home-saf)]" />
          </div>
        </div>
      </div>
    </section>
  );
}

function AtlasService({ page }: { page: PreviewPage }) {
  return (
    <section className="bg-white px-6 py-12 sm:px-8 lg:px-12 lg:py-16">
      <div className="grid gap-8 lg:grid-cols-[240px_minmax(0,1fr)_300px]">
        <aside className="order-2 border-t border-[color:var(--color-home-line)] pt-6 lg:order-1 lg:border-t-0 lg:border-r lg:pt-0 lg:pr-8">
          <AtlasLabel icon={NavigationIcon}>Fiche pratique</AtlasLabel>
          <div className="mt-8 space-y-7">
            <AtlasFact label="Projet" value="Vente · Location" />
            <AtlasFact label="Validité" value={page.stat} />
            <AtlasFact label="Secteur" value="Indre-et-Loire" />
          </div>
        </aside>
        <div className="order-1 lg:order-2">
          <h1 className="font-[family-name:var(--font-sora)] text-[clamp(38px,5vw,66px)] leading-[1.01] font-extrabold tracking-[-0.035em] text-balance text-[color:var(--color-home-ink)]">
            {page.title}{" "}
            <span className="text-[color:var(--color-home-saf-dark)]">{page.accent}</span>
          </h1>
          <p className="mt-6 max-w-[60ch] text-[17px] leading-[1.7] text-[color:var(--color-home-muted-2)]">
            {page.description}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <span className="inline-flex items-center gap-2 rounded-full bg-[color:var(--color-home-saf-bg)] px-4 py-2 text-[12px] font-bold text-[color:var(--color-home-saf-dark)]">
              <CheckCircle2Icon className="h-4 w-4" /> Obligatoire
            </span>
            <span className="inline-flex items-center gap-2 rounded-full bg-[color:var(--color-home-bg-2)] px-4 py-2 text-[12px] font-bold text-[color:var(--color-si-petrole)]">
              <FileCheck2Icon className="h-4 w-4" /> Rapport expliqué
            </span>
          </div>
        </div>
        <div className="relative order-3 min-h-[300px] overflow-hidden rounded-[16px] lg:min-h-[440px]">
          <Image
            src={page.image}
            alt={page.imageAlt}
            fill
            sizes="(min-width: 1024px) 300px, 100vw"
            className="object-cover"
          />
          <span className="absolute top-5 right-5 rounded-full bg-white px-4 py-2 text-[11px] font-bold text-[color:var(--color-si-petrole)]">
            Tours · 37
          </span>
        </div>
      </div>
    </section>
  );
}

function AtlasNews({ page }: { page: PreviewPage }) {
  return (
    <section className="bg-[color:var(--color-home-bg)] px-6 py-12 sm:px-8 lg:px-12 lg:py-16">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[color:var(--color-home-line)] pb-5">
        <AtlasLabel icon={RouteIcon}>Chronique du territoire</AtlasLabel>
        <p className="text-[12px] font-semibold text-[color:var(--color-home-muted-2)]">
          Tours · Indre-et-Loire · {page.stat} publications
        </p>
      </div>
      <div className="mt-8 grid gap-8 lg:grid-cols-[.82fr_1.18fr] lg:items-stretch">
        <div className="flex flex-col justify-between bg-[color:var(--color-si-creme)] p-7 sm:p-9">
          <div>
            <p className="text-[12px] font-bold text-[color:var(--color-home-saf-dark)]">
              ITINÉRAIRE À LA UNE
            </p>
            <h1 className="mt-5 font-[family-name:var(--font-sora)] text-[clamp(36px,4.7vw,62px)] leading-[1.02] font-extrabold tracking-[-0.035em] text-balance text-[color:var(--color-home-ink)]">
              {page.title}{" "}
              <span className="text-[color:var(--color-si-petrole)]">{page.accent}</span>
            </h1>
          </div>
          <p className="mt-10 max-w-[48ch] text-[15px] leading-relaxed text-[color:var(--color-home-muted-2)]">
            {page.description}
          </p>
        </div>
        <div className="relative min-h-[380px] overflow-hidden rounded-[16px]">
          <Image src={page.image} alt={page.imageAlt} fill className="object-cover" />
          <div className="absolute right-5 bottom-5 left-5 rounded-[12px] bg-white p-5 text-[color:var(--color-home-ink)]">
            <p className="text-[11px] font-bold text-[color:var(--color-home-saf-dark)]">
              12 JUILLET 2026 · POINT DE REPÈRE
            </p>
            <h2 className="mt-2 font-[family-name:var(--font-sora)] text-[20px] font-bold">
              {page.items[0]?.title}
            </h2>
          </div>
        </div>
      </div>
    </section>
  );
}

function AtlasArticle({ page }: { page: PreviewPage }) {
  return (
    <section className="bg-white px-6 py-10 sm:px-8 lg:px-12 lg:py-14">
      <div className="grid gap-8 lg:grid-cols-[200px_minmax(0,1fr)]">
        <aside className="border-b border-[color:var(--color-home-line)] pb-6 lg:border-r lg:border-b-0 lg:pr-8 lg:pb-0">
          <AtlasLabel icon={BookOpenIcon}>Carnet de lecture</AtlasLabel>
          <p className="mt-8 text-[12px] font-semibold text-[color:var(--color-home-muted-2)]">
            {page.kicker}
          </p>
          <p className="mt-2 font-[family-name:var(--font-sora)] text-[24px] font-extrabold text-[color:var(--color-si-petrole)]">
            {page.stat}
          </p>
        </aside>
        <div>
          <h1 className="max-w-[980px] font-[family-name:var(--font-sora)] text-[clamp(38px,5.4vw,70px)] leading-[1.01] font-extrabold tracking-[-0.035em] text-balance text-[color:var(--color-home-ink)]">
            {page.title}{" "}
            <span className="text-[color:var(--color-home-saf-dark)]">{page.accent}</span>
          </h1>
          <p className="mt-6 max-w-[68ch] text-[17px] leading-[1.7] text-[color:var(--color-home-muted-2)]">
            {page.description}
          </p>
        </div>
      </div>
      <div className="relative mt-10 overflow-hidden rounded-[16px]">
        <Image
          src={page.image}
          alt={page.imageAlt}
          width={1400}
          height={560}
          className="h-[240px] w-full object-cover sm:h-[340px]"
        />
        <span className="absolute right-5 bottom-5 rounded-full bg-[color:var(--color-home-saf)] px-4 py-2 text-[11px] font-bold text-[color:var(--color-home-ink)]">
          À conserver
        </span>
      </div>
    </section>
  );
}

function AtlasZones({ page }: { page: PreviewPage }) {
  return (
    <section className="relative overflow-hidden bg-[color:var(--color-home-ink)] px-6 py-12 text-white sm:px-8 lg:px-12 lg:py-16">
      <div className="grid min-h-[500px] gap-8 lg:grid-cols-[.72fr_1.28fr] lg:items-center">
        <div className="relative z-10">
          <AtlasLabel icon={MapIcon} light>
            Carte d’intervention
          </AtlasLabel>
          <h1 className="mt-5 font-[family-name:var(--font-sora)] text-[clamp(40px,5.8vw,76px)] leading-[.99] font-extrabold tracking-[-0.035em] text-balance">
            Le 37, <span className="text-[color:var(--color-home-saf)]">sans zone grise.</span>
          </h1>
          <p className="mt-6 max-w-[52ch] text-[16px] leading-[1.7] text-white/72">
            {page.description}
          </p>
          <p className="mt-7 inline-flex items-center gap-2 text-[13px] font-bold text-[color:var(--color-home-saf)]">
            <Clock3Icon className="h-4 w-4" /> Intervention sous {page.stat}
          </p>
        </div>
        <div className="relative min-h-[420px] rounded-[16px] bg-[color:var(--color-si-petrole)]">
          <AtlasMap dense />
        </div>
      </div>
    </section>
  );
}

function AtlasCity({ page }: { page: PreviewPage }) {
  return (
    <section className="bg-[color:var(--color-si-creme)] px-6 py-12 sm:px-8 lg:px-12 lg:py-16">
      <div className="grid gap-6 lg:grid-cols-[1.1fr_.9fr]">
        <div className="relative min-h-[460px] overflow-hidden rounded-[16px]">
          <Image src={page.image} alt={page.imageAlt} fill className="object-cover" />
          <div className="absolute top-5 left-5 rounded-full bg-white px-4 py-2 text-[12px] font-bold text-[color:var(--color-si-petrole)]">
            <MapPinIcon className="mr-1.5 inline h-4 w-4" /> Val de Loire
          </div>
        </div>
        <div className="flex flex-col justify-between bg-[color:var(--color-home-saf)] p-7 sm:p-9">
          <AtlasLabel icon={NavigationIcon}>Étape locale · {page.stat}</AtlasLabel>
          <div className="mt-12">
            <p className="font-[family-name:var(--font-sora)] text-[clamp(24px,3vw,40px)] font-bold text-[color:var(--color-home-ink)]">
              Votre diagnostiqueur à
            </p>
            <h1 className="font-[family-name:var(--font-sora)] text-[clamp(58px,8vw,96px)] leading-[.88] font-extrabold tracking-[-0.04em] text-[color:var(--color-si-petrole)]">
              {page.accent}
            </h1>
            <p className="mt-8 max-w-[45ch] text-[15px] leading-relaxed text-[color:var(--color-home-ink)]/75">
              {page.description}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function AtlasContact({ page }: { page: PreviewPage }) {
  return (
    <section className="relative overflow-hidden bg-[color:var(--color-si-petrole)] px-6 py-12 text-white sm:px-8 lg:px-12 lg:py-16">
      <div className="grid gap-10 lg:grid-cols-[1fr_380px] lg:items-center">
        <div>
          <AtlasLabel icon={RouteIcon} light>
            Point de contact · Tours
          </AtlasLabel>
          <h1 className="mt-5 max-w-[850px] font-[family-name:var(--font-sora)] text-[clamp(42px,6vw,80px)] leading-[.98] font-extrabold tracking-[-0.035em] text-balance">
            Une ligne directe,{" "}
            <span className="text-[color:var(--color-home-saf)]">pas un labyrinthe.</span>
          </h1>
          <p className="mt-6 max-w-[58ch] text-[16px] leading-[1.7] text-white/75">
            {page.description}
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <ContactPill icon={PhoneIcon} label="02 47 47 01 23" />
            <ContactPill icon={MailIcon} label="info@servicimmo.fr" />
          </div>
        </div>
        <div className="relative min-h-[420px] overflow-hidden rounded-[16px]">
          <Image src={page.image} alt={page.imageAlt} fill className="object-cover" />
          <div className="absolute right-5 bottom-5 left-5 bg-[color:var(--color-home-saf)] p-5 text-[color:var(--color-home-ink)]">
            <p className="font-[family-name:var(--font-sora)] text-[18px] font-bold">
              Réponse sous {page.stat}
            </p>
            <p className="mt-1 text-[12px] opacity-70">par une personne de l’équipe</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function AtlasLegal({ page }: { page: PreviewPage }) {
  return (
    <section className="bg-[color:var(--color-si-creme)] px-6 py-10 sm:px-8 lg:px-12 lg:py-14">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[color:var(--color-home-line)] pb-5">
        <AtlasLabel icon={FileCheck2Icon}>Légende contractuelle</AtlasLabel>
        <p className="text-[12px] font-semibold text-[color:var(--color-home-muted-2)]">
          Mise à jour · 15 juillet {page.stat}
        </p>
      </div>
      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_360px] lg:items-end">
        <div>
          <h1 className="max-w-[850px] font-[family-name:var(--font-sora)] text-[clamp(38px,5vw,66px)] leading-[1.02] font-extrabold tracking-[-0.035em] text-balance text-[color:var(--color-home-ink)]">
            Chaque règle,{" "}
            <span className="text-[color:var(--color-si-petrole)]">au bon endroit.</span>
          </h1>
          <p className="mt-6 max-w-[62ch] text-[16px] leading-[1.7] text-[color:var(--color-home-muted-2)]">
            {page.description}
          </p>
        </div>
        <nav className="divide-y divide-[color:var(--color-home-line)] border-y border-[color:var(--color-home-line)]">
          {page.items.map((item) => (
            <div
              key={item.title}
              className="flex items-center justify-between gap-4 py-4 text-[13px] font-bold text-[color:var(--color-si-petrole)]"
            >
              <span>{item.title}</span>
              <ArrowRightIcon className="h-4 w-4" />
            </div>
          ))}
        </nav>
      </div>
    </section>
  );
}

function AtlasLabel({
  icon: Icon,
  children,
  light = false,
}: {
  icon: typeof CompassIcon;
  children: ReactNode;
  light?: boolean;
}) {
  return (
    <p
      className={`inline-flex items-center gap-2 font-[family-name:var(--font-sora)] text-[12px] font-bold ${light ? "text-[color:var(--color-home-saf)]" : "text-[color:var(--color-si-petrole)]"}`}
    >
      <Icon className="h-4 w-4" />
      {children}
    </p>
  );
}

function AtlasFact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] font-semibold text-[color:var(--color-home-muted)]">{label}</p>
      <p className="mt-1 font-[family-name:var(--font-sora)] text-[15px] font-bold text-[color:var(--color-home-ink)]">
        {value}
      </p>
    </div>
  );
}

function AtlasLink({ label, meta }: { label: string; meta?: string }) {
  return (
    <div className="group flex items-center justify-between gap-4 border-b border-[color:var(--color-home-line)] pb-4">
      <div>
        <p className="text-[11px] font-semibold text-[color:var(--color-home-saf-dark)]">{meta}</p>
        <p className="mt-1 font-[family-name:var(--font-sora)] text-[14px] font-bold text-[color:var(--color-home-ink)]">
          {label}
        </p>
      </div>
      <ArrowRightIcon className="h-4 w-4 text-[color:var(--color-si-petrole)] transition-transform group-hover:translate-x-1" />
    </div>
  );
}

function ContactPill({ icon: Icon, label }: { icon: typeof PhoneIcon; label: string }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-3 text-[13px] font-bold text-[color:var(--color-si-petrole)]">
      <Icon className="h-4 w-4 text-[color:var(--color-home-saf-dark)]" />
      {label}
    </span>
  );
}

function AtlasMap({ dense = false }: { dense?: boolean }) {
  const points = dense
    ? [
        [20, 24],
        [33, 44],
        [49, 28],
        [60, 54],
        [72, 34],
        [78, 70],
        [43, 73],
      ]
    : [
        [27, 29],
        [48, 22],
        [63, 42],
        [39, 58],
        [69, 67],
      ];
  return (
    <div className="absolute inset-0 overflow-hidden">
      <span className="absolute top-[12%] left-[8%] h-[72%] w-[78%] rounded-[46%_54%_41%_59%/57%_43%_57%_43%] border border-white/25" />
      <span className="absolute top-[22%] left-[20%] h-[48%] w-[57%] rounded-[58%_42%_54%_46%/45%_58%_42%_55%] border border-[color:var(--color-home-saf)]/45" />
      {points.map(([left, top], index) => (
        <span
          key={index}
          className="absolute h-4 w-4 rounded-full border-4 border-[color:var(--color-si-petrole)] bg-[color:var(--color-home-saf)]"
          style={{ left: `${left}%`, top: `${top}%` }}
        />
      ))}
      <span className="absolute top-[45%] left-[48%] h-px w-[28%] origin-left rotate-[28deg] bg-white/35" />
      <span className="absolute top-[58%] left-[32%] h-px w-[34%] origin-left -rotate-[18deg] bg-white/35" />
    </div>
  );
}
