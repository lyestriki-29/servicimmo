import Image from "next/image";
import {
  ArrowRightIcon,
  BadgeCheckIcon,
  CheckIcon,
  Clock3Icon,
  LocateFixedIcon,
  MailIcon,
  MapPinIcon,
  NewspaperIcon,
  PhoneIcon,
  RulerIcon,
  ScanLineIcon,
  ZapIcon,
} from "lucide-react";

import type { PreviewPage } from "./servicimmo-preview-data";

export function ServicimmoTerrainHero({ page }: { page: PreviewPage }) {
  switch (page.kind) {
    case "catalog":
      return <TerrainCatalog page={page} />;
    case "detail":
      return <TerrainService page={page} />;
    case "news":
      return <TerrainNews page={page} />;
    case "article":
      return <TerrainArticle page={page} />;
    case "map":
      return <TerrainZones page={page} />;
    case "city":
      return <TerrainCity page={page} />;
    case "contact":
      return <TerrainContact page={page} />;
    case "legal":
      return <TerrainLegal page={page} />;
  }
}

function TerrainCatalog({ page }: { page: PreviewPage }) {
  return (
    <section className="relative overflow-hidden bg-[color:var(--color-home-saf)] text-[color:var(--color-home-ink)]">
      <div className="grid min-h-[560px] lg:grid-cols-[1.05fr_.95fr]">
        <div className="flex flex-col justify-between px-6 py-10 sm:px-8 lg:px-12 lg:py-14">
          <p className="inline-flex items-center gap-2 text-[12px] font-bold">
            <ScanLineIcon className="h-4 w-4" /> Servicimmo · Champ de contrôle complet
          </p>
          <div className="my-12">
            <h1 className="font-[family-name:var(--font-sora)] text-[clamp(48px,7vw,92px)] leading-[.9] font-extrabold tracking-[-0.04em] text-balance">
              {page.title}
              <br />
              <span className="text-[color:var(--color-si-petrole)]">{page.accent}</span>
            </h1>
            <p className="mt-7 max-w-[54ch] text-[16px] leading-[1.65] text-[color:var(--color-home-ink)]/72">
              {page.description}
            </p>
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-3 border-t border-[color:var(--color-home-ink)]/25 pt-5 text-[12px] font-bold">
            {page.items.map((item) => (
              <span key={item.title}>
                {item.meta} · {item.title}
              </span>
            ))}
          </div>
        </div>
        <div className="relative min-h-[420px] overflow-hidden bg-[color:var(--color-home-ink)]">
          <Image src={page.image} alt={page.imageAlt} fill className="object-cover opacity-85" />
          <div className="absolute top-0 right-0 bg-[color:var(--color-home-ink)] px-5 py-4 text-white">
            <p className="text-[11px] font-bold text-[color:var(--color-home-saf)]">CAPACITÉ</p>
            <p className="mt-1 font-[family-name:var(--font-sora)] text-[28px] font-extrabold">
              {page.stat}
            </p>
          </div>
          <div className="absolute right-6 bottom-6 left-6 flex items-center justify-between gap-4 bg-white p-5 text-[color:var(--color-home-ink)]">
            <p className="font-[family-name:var(--font-sora)] text-[16px] font-bold">
              Un seul passage. Un dossier complet.
            </p>
            <ArrowRightIcon className="h-5 w-5 text-[color:var(--color-si-petrole)]" />
          </div>
        </div>
      </div>
    </section>
  );
}

function TerrainService({ page }: { page: PreviewPage }) {
  return (
    <section className="bg-[color:var(--color-home-ink)] text-white">
      <div className="grid lg:grid-cols-[80px_minmax(0,1fr)_390px]">
        <div className="hidden items-end justify-center bg-[color:var(--color-home-saf)] py-8 text-[color:var(--color-home-ink)] lg:flex">
          <p className="origin-center -rotate-90 font-[family-name:var(--font-sora)] text-[13px] font-extrabold whitespace-nowrap">
            DIAGNOSTIC · CONTRÔLE · RAPPORT
          </p>
        </div>
        <div className="flex flex-col justify-between px-6 py-12 sm:px-8 lg:px-12 lg:py-16">
          <p className="inline-flex items-center gap-2 text-[12px] font-bold text-[color:var(--color-home-saf)]">
            <RulerIcon className="h-4 w-4" /> {page.kicker}
          </p>
          <div className="my-10">
            <h1 className="max-w-[760px] font-[family-name:var(--font-sora)] text-[clamp(42px,5.8vw,78px)] leading-[.95] font-extrabold tracking-[-0.04em] text-balance">
              {page.title} <span className="text-[color:var(--color-home-saf)]">{page.accent}</span>
            </h1>
            <p className="mt-7 max-w-[56ch] text-[16px] leading-[1.7] text-white/72">
              {page.description}
            </p>
          </div>
          <div className="grid gap-4 border-t border-white/20 pt-5 sm:grid-cols-3">
            <TerrainFact label="Statut" value="Obligatoire" />
            <TerrainFact label="Validité" value={page.stat} />
            <TerrainFact label="Délai" value="Sous 48 h" />
          </div>
        </div>
        <div className="relative min-h-[360px]">
          <Image
            src={page.image}
            alt={page.imageAlt}
            fill
            sizes="(min-width: 1024px) 390px, 100vw"
            className="object-cover"
          />
          <span className="absolute right-5 bottom-5 inline-flex items-center gap-2 bg-[color:var(--color-home-saf)] px-4 py-3 text-[12px] font-bold text-[color:var(--color-home-ink)]">
            <BadgeCheckIcon className="h-4 w-4" /> Technicien certifié
          </span>
        </div>
      </div>
    </section>
  );
}

function TerrainNews({ page }: { page: PreviewPage }) {
  return (
    <section className="bg-white px-6 py-10 sm:px-8 lg:px-12 lg:py-14">
      <div className="flex flex-wrap items-center justify-between gap-4 bg-[color:var(--color-home-saf)] px-5 py-4 text-[color:var(--color-home-ink)]">
        <p className="inline-flex items-center gap-2 font-[family-name:var(--font-sora)] text-[14px] font-extrabold">
          <NewspaperIcon className="h-5 w-5" /> VEILLE · 37
        </p>
        <p className="text-[12px] font-bold">DPE · AMIANTE · LOCATION · TRAVAUX</p>
      </div>
      <div className="mt-7 grid gap-7 lg:grid-cols-[1.05fr_.95fr] lg:items-end">
        <div>
          <h1 className="font-[family-name:var(--font-sora)] text-[clamp(44px,6vw,82px)] leading-[.93] font-extrabold tracking-[-0.04em] text-balance text-[color:var(--color-home-ink)]">
            Pas de jargon.
            <br />
            <span className="text-[color:var(--color-si-petrole)]">Juste ce qui change.</span>
          </h1>
          <p className="mt-7 max-w-[58ch] text-[16px] leading-[1.7] text-[color:var(--color-home-muted-2)]">
            {page.description}
          </p>
        </div>
        <p className="border-t border-[color:var(--color-home-line)] pt-5 font-[family-name:var(--font-sora)] text-[20px] leading-snug font-bold text-[color:var(--color-home-ink)]">
          {page.items[0]?.title}
        </p>
      </div>
      <div className="relative mt-8 h-[260px] overflow-hidden sm:h-[360px]">
        <Image src={page.image} alt={page.imageAlt} fill className="object-cover" />
        <span className="absolute bottom-0 left-0 bg-[color:var(--color-home-ink)] px-5 py-4 text-[12px] font-bold text-white">
          MISE À JOUR · 12.07.2026
        </span>
      </div>
    </section>
  );
}

function TerrainArticle({ page }: { page: PreviewPage }) {
  return (
    <section className="bg-[color:var(--color-si-creme)]">
      <div className="grid lg:grid-cols-[minmax(0,1fr)_410px]">
        <div className="flex flex-col justify-between px-6 py-10 sm:px-8 lg:px-12 lg:py-14">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[12px] font-bold text-[color:var(--color-si-petrole)]">
            <span>{page.kicker}</span>
            <span className="inline-flex items-center gap-2 text-[color:var(--color-home-muted-2)]">
              <Clock3Icon className="h-4 w-4" /> {page.stat} de lecture
            </span>
          </div>
          <div className="my-10 lg:my-14">
            <p className="mb-5 inline-flex bg-[color:var(--color-home-ink)] px-4 py-2 font-[family-name:var(--font-sora)] text-[11px] font-extrabold tracking-[.08em] text-white">
              NOTE D’EXPERTISE · RÉGLEMENTATION
            </p>
            <h1 className="max-w-[880px] font-[family-name:var(--font-sora)] text-[clamp(38px,5.2vw,70px)] leading-[.98] font-extrabold tracking-[-0.035em] text-balance text-[color:var(--color-home-ink)]">
              {page.title}{" "}
              <span className="text-[color:var(--color-home-saf-dark)]">{page.accent}</span>
            </h1>
            <p className="mt-7 max-w-[62ch] text-[16px] leading-[1.7] text-[color:var(--color-home-muted-2)]">
              {page.description}
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-[color:var(--color-home-line)] pt-5">
            <span className="inline-flex items-center gap-2 text-[12.5px] font-semibold text-[color:var(--color-home-ink)]">
              <BadgeCheckIcon className="h-4 w-4 text-[color:var(--color-home-saf-dark)]" />{" "}
              Information vérifiée par l’équipe Servicimmo
            </span>
            <a
              href="#article-en-bref"
              className="inline-flex items-center gap-2 text-[13px] font-bold text-[color:var(--color-si-petrole)]"
            >
              Lire l’essentiel <ArrowRightIcon className="h-4 w-4" />
            </a>
          </div>
        </div>
        <figure className="relative min-h-[360px] overflow-hidden lg:min-h-[570px]">
          <Image
            src={page.image}
            alt={page.imageAlt}
            fill
            sizes="(min-width: 1024px) 410px, 100vw"
            className="object-cover"
          />
          <figcaption className="absolute right-0 bottom-0 left-0 bg-[color:var(--color-home-ink)]/92 px-5 py-4 text-[11.5px] leading-relaxed text-white/80">
            Lecture et contrôle d’un rapport de diagnostic immobilier.
          </figcaption>
        </figure>
      </div>
    </section>
  );
}

function TerrainZones({ page }: { page: PreviewPage }) {
  return (
    <section className="relative overflow-hidden bg-[color:var(--color-home-saf)] px-6 py-12 text-[color:var(--color-home-ink)] sm:px-8 lg:px-12 lg:py-16">
      <div className="grid gap-8 lg:grid-cols-[.72fr_1.28fr] lg:items-center">
        <div>
          <p className="inline-flex items-center gap-2 text-[12px] font-bold">
            <LocateFixedIcon className="h-4 w-4" /> Couverture immédiate
          </p>
          <p className="mt-5 font-[family-name:var(--font-sora)] text-[clamp(72px,13vw,96px)] leading-[.78] font-extrabold tracking-[-0.04em] text-[color:var(--color-si-petrole)]">
            37
          </p>
          <h1 className="mt-8 font-[family-name:var(--font-sora)] text-[clamp(34px,4vw,54px)] leading-[1.02] font-extrabold tracking-[-0.03em] text-balance">
            Tout le département. Une seule équipe.
          </h1>
          <p className="mt-5 text-[15px] leading-relaxed text-[color:var(--color-home-ink)]/72">
            {page.description}
          </p>
        </div>
        <div className="relative min-h-[430px] bg-[color:var(--color-home-ink)] text-white">
          <TerrainMap />
          <div className="absolute right-5 bottom-5 left-5 flex items-center justify-between gap-5 border-t border-white/25 pt-5">
            <p className="inline-flex items-center gap-2 text-[13px] font-bold">
              <Clock3Icon className="h-4 w-4 text-[color:var(--color-home-saf)]" /> Intervention
              sous {page.stat}
            </p>
            <MapPinIcon className="h-5 w-5 text-[color:var(--color-home-saf)]" />
          </div>
        </div>
      </div>
    </section>
  );
}

function TerrainCity({ page }: { page: PreviewPage }) {
  return (
    <section className="bg-[color:var(--color-si-petrole)] px-6 py-10 text-white sm:px-8 lg:px-12 lg:py-14">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/25 pb-5 text-[12px] font-bold">
        <span className="inline-flex items-center gap-2">
          <MapPinIcon className="h-4 w-4 text-[color:var(--color-home-saf)]" /> {page.kicker}
        </span>
        <span>{page.stat} depuis Tours</span>
      </div>
      <h1 className="mt-8 font-[family-name:var(--font-sora)] text-[clamp(60px,10vw,96px)] leading-[.82] font-extrabold tracking-[-0.04em] text-[color:var(--color-home-saf)]">
        {page.accent}
      </h1>
      <div className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_.8fr] lg:items-end">
        <div className="relative h-[260px] overflow-hidden sm:h-[340px]">
          <Image src={page.image} alt={page.imageAlt} fill className="object-cover" />
        </div>
        <div className="pb-2">
          <h2 className="font-[family-name:var(--font-sora)] text-[clamp(28px,3.5vw,46px)] leading-tight font-extrabold">
            On connaît le terrain.
          </h2>
          <p className="mt-5 text-[15px] leading-relaxed text-white/75">{page.description}</p>
          <span className="mt-7 inline-flex items-center gap-2 text-[13px] font-bold text-[color:var(--color-home-saf)]">
            Voir les interventions locales <ArrowRightIcon className="h-4 w-4" />
          </span>
        </div>
      </div>
    </section>
  );
}

function TerrainContact({ page }: { page: PreviewPage }) {
  return (
    <section className="bg-white px-6 py-12 sm:px-8 lg:px-12 lg:py-16">
      <p className="inline-flex items-center gap-2 text-[12px] font-bold text-[color:var(--color-si-petrole)]">
        <ZapIcon className="h-4 w-4 text-[color:var(--color-home-saf-dark)]" /> Réponse humaine ·
        sans standard
      </p>
      <h1 className="mt-5 max-w-[1050px] font-[family-name:var(--font-sora)] text-[clamp(44px,6.5vw,88px)] leading-[.92] font-extrabold tracking-[-0.04em] text-balance text-[color:var(--color-home-ink)]">
        Le plus court chemin :{" "}
        <span className="text-[color:var(--color-si-petrole)]">02 47 47 01 23</span>
      </h1>
      <div className="mt-9 grid gap-5 lg:grid-cols-[1fr_1fr_1.2fr]">
        <TerrainContactLine icon={PhoneIcon} label="Téléphone" value="Lun–Ven · 9 h–19 h" />
        <TerrainContactLine icon={MailIcon} label="E-mail" value="info@servicimmo.fr" />
        <div className="relative min-h-[180px] overflow-hidden">
          <Image src={page.image} alt={page.imageAlt} fill className="object-cover" />
          <span className="absolute right-4 bottom-4 bg-[color:var(--color-home-saf)] px-4 py-3 text-[12px] font-bold text-[color:var(--color-home-ink)]">
            Réponse sous {page.stat}
          </span>
        </div>
      </div>
    </section>
  );
}

function TerrainLegal({ page }: { page: PreviewPage }) {
  return (
    <section className="bg-[color:var(--color-home-ink)] px-6 py-10 text-white sm:px-8 lg:px-12 lg:py-14">
      <div className="flex flex-wrap items-center justify-between gap-4 text-[12px] font-bold text-white/65">
        <span>DOCUMENT CONTRÔLÉ · SERVICIMMO</span>
        <span>VERSION {page.stat}.07</span>
      </div>
      <div className="mt-9 grid gap-10 lg:grid-cols-[1fr_420px] lg:items-end">
        <div>
          <h1 className="max-w-[850px] font-[family-name:var(--font-sora)] text-[clamp(42px,5.8vw,76px)] leading-[.98] font-extrabold tracking-[-0.04em] text-balance">
            Lisible. Vérifiable.{" "}
            <span className="text-[color:var(--color-home-saf)]">Sans petites lignes.</span>
          </h1>
          <p className="mt-6 max-w-[62ch] text-[16px] leading-[1.7] text-white/72">
            {page.description}
          </p>
        </div>
        <div className="divide-y divide-white/20 border-y border-white/20">
          {page.items.map((item) => (
            <div key={item.title} className="flex items-center justify-between gap-5 py-4">
              <span className="text-[13px] font-bold">{item.title}</span>
              <CheckIcon className="h-4 w-4 text-[color:var(--color-home-saf)]" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function TerrainFact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] font-bold text-white/45">{label}</p>
      <p className="mt-1 text-[13px] font-bold text-white">{value}</p>
    </div>
  );
}

function TerrainContactLine({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof PhoneIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="flex min-h-[180px] flex-col justify-between bg-[color:var(--color-si-creme)] p-6 text-[color:var(--color-home-ink)]">
      <Icon className="h-6 w-6 text-[color:var(--color-home-saf-dark)]" />
      <div>
        <p className="text-[11px] font-bold text-[color:var(--color-home-muted)]">{label}</p>
        <p className="mt-2 font-[family-name:var(--font-sora)] text-[17px] font-bold">{value}</p>
      </div>
    </div>
  );
}

function TerrainMap() {
  const points = [
    [18, 28],
    [33, 52],
    [48, 24],
    [58, 58],
    [72, 35],
    [80, 70],
    [42, 76],
  ];
  return (
    <div className="absolute inset-0">
      <span className="absolute top-[10%] left-[12%] h-[72%] w-[70%] rounded-[48%_52%_43%_57%/57%_43%_57%_43%] border-2 border-[color:var(--color-home-saf)]/65" />
      {points.map(([left, top], index) => (
        <span
          key={index}
          className="absolute flex h-7 w-7 items-center justify-center rounded-full bg-[color:var(--color-home-saf)] text-[10px] font-extrabold text-[color:var(--color-home-ink)]"
          style={{ left: `${left}%`, top: `${top}%` }}
        >
          {index + 1}
        </span>
      ))}
    </div>
  );
}
