import Image from "next/image";
import type { ReactNode } from "react";
import {
  ArrowRightIcon,
  BookOpenIcon,
  CalendarDaysIcon,
  CheckCircle2Icon,
  Clock3Icon,
  FileCheck2Icon,
  MailIcon,
  MapPinIcon,
  PhoneIcon,
  ShieldCheckIcon,
} from "lucide-react";

import type { PreviewPage } from "./servicimmo-preview-data";

export function ServicimmoLocalHero({ page }: { page: PreviewPage }) {
  switch (page.kind) {
    case "catalog":
      return <LocalCatalogHero page={page} />;
    case "detail":
      return <LocalServiceHero page={page} />;
    case "news":
      return <LocalNewsHero page={page} />;
    case "article":
      return <LocalArticleHero page={page} />;
    case "map":
      return <LocalZonesHero page={page} />;
    case "city":
      return <LocalCityHero page={page} />;
    case "contact":
      return <LocalContactHero page={page} />;
    case "legal":
      return <LocalLegalHero page={page} />;
  }
}

function LocalCatalogHero({ page }: { page: PreviewPage }) {
  return (
    <section className="bg-[color:var(--color-si-creme)] px-6 py-12 sm:px-8 lg:px-12 lg:py-16">
      <div className="grid gap-8 lg:grid-cols-[1.15fr_.85fr] lg:items-end">
        <div>
          <LocalKicker>{page.kicker}</LocalKicker>
          <h1 className="mt-4 max-w-[820px] font-[family-name:var(--font-sora)] text-[clamp(38px,5.5vw,72px)] leading-[1.02] font-extrabold tracking-[-0.035em] text-balance text-[color:var(--color-home-ink)]">
            {page.title} <span className="text-[color:var(--color-si-petrole)]">{page.accent}</span>
          </h1>
        </div>
        <div className="pb-1">
          <p className="max-w-[52ch] text-[16px] leading-[1.7] text-[color:var(--color-home-muted-2)]">
            {page.description}
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
          src={page.image}
          alt={page.imageAlt}
          width={1400}
          height={560}
          className="h-[220px] w-full object-cover opacity-75 sm:h-[300px]"
        />
        <div className="absolute inset-y-0 left-0 flex w-full max-w-[390px] items-end bg-[color:var(--color-home-ink)]/88 p-6 text-white sm:p-8">
          <div>
            <p className="font-[family-name:var(--font-sora)] text-[18px] font-bold">
              {page.stat} expertises, une même équipe
            </p>
            <p className="mt-2 text-[13px] leading-relaxed text-white/72">
              Un parcours simple pour identifier uniquement les diagnostics utiles.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function LocalServiceHero({ page }: { page: PreviewPage }) {
  return (
    <section className="bg-[color:var(--color-si-creme)] px-6 py-12 sm:px-8 lg:px-12 lg:py-16">
      <LocalKicker>{page.kicker}</LocalKicker>
      <div className="mt-4 grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
        <div>
          <h1 className="max-w-[850px] font-[family-name:var(--font-sora)] text-[clamp(38px,5.2vw,68px)] leading-[1.02] font-extrabold tracking-[-0.035em] text-balance text-[color:var(--color-home-ink)]">
            {page.title} <span className="text-[color:var(--color-si-petrole)]">{page.accent}</span>
          </h1>
          <p className="mt-6 max-w-[62ch] text-[17px] leading-[1.7] text-[color:var(--color-home-muted-2)]">
            {page.description}
          </p>
        </div>
        <aside className="divide-y divide-[color:var(--color-home-line)] rounded-[14px] bg-white px-6">
          <Fact icon={CheckCircle2Icon} label="Obligatoire" value="Vente & location" />
          <Fact icon={Clock3Icon} label="Validité" value={page.stat} />
          <Fact icon={FileCheck2Icon} label="Livrable" value="Rapport expliqué" />
        </aside>
      </div>
      <div className="mt-10 grid gap-4 sm:grid-cols-[1fr_220px]">
        <Image
          src={page.image}
          alt={page.imageAlt}
          width={1200}
          height={520}
          className="h-[240px] w-full rounded-[16px] object-cover sm:h-[300px]"
        />
        <div className="flex flex-col justify-between rounded-[14px] bg-[color:var(--color-home-saf)] p-6 text-[color:var(--color-home-ink)]">
          <ShieldCheckIcon className="h-7 w-7" aria-hidden />
          <p className="mt-8 font-[family-name:var(--font-sora)] text-[18px] leading-snug font-bold">
            Votre technicien vous explique chaque résultat sur place.
          </p>
        </div>
      </div>
    </section>
  );
}

function LocalNewsHero({ page }: { page: PreviewPage }) {
  const featured = page.items[0];
  return (
    <section className="bg-white px-6 py-12 sm:px-8 lg:px-12 lg:py-16">
      <div className="border-y border-[color:var(--color-home-line)] py-5">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <LocalKicker>{page.kicker}</LocalKicker>
          <p className="text-[12px] font-semibold text-[color:var(--color-home-muted-2)]">
            Une veille locale depuis 2017
          </p>
        </div>
        <h1 className="mt-5 max-w-[1000px] font-[family-name:var(--font-sora)] text-[clamp(38px,5.4vw,70px)] leading-[1.02] font-extrabold tracking-[-0.035em] text-balance text-[color:var(--color-home-ink)]">
          {page.title}{" "}
          <span className="text-[color:var(--color-home-saf-dark)]">{page.accent}</span>
        </h1>
      </div>
      <article className="mt-8 grid overflow-hidden rounded-[16px] bg-[color:var(--color-home-ink)] text-white lg:grid-cols-[1.2fr_.8fr]">
        <Image
          src={page.image}
          alt={page.imageAlt}
          width={1000}
          height={680}
          className="h-[280px] w-full object-cover lg:h-[360px]"
        />
        <div className="flex flex-col justify-between p-6 sm:p-8">
          <div>
            <p className="flex items-center gap-2 text-[12px] font-semibold text-[color:var(--color-home-saf)]">
              <CalendarDaysIcon className="h-4 w-4" /> {featured?.meta}
            </p>
            <h2 className="mt-5 font-[family-name:var(--font-sora)] text-[clamp(24px,3vw,38px)] leading-[1.12] font-bold text-balance">
              {featured?.title}
            </h2>
            <p className="mt-4 text-[14px] leading-relaxed text-white/72">{featured?.text}</p>
          </div>
          <span className="mt-8 inline-flex items-center gap-2 text-[13px] font-bold text-[color:var(--color-home-saf)]">
            Lire le décryptage <ArrowRightIcon className="h-4 w-4" />
          </span>
        </div>
      </article>
    </section>
  );
}

function LocalArticleHero({ page }: { page: PreviewPage }) {
  return (
    <section className="bg-[color:var(--color-si-creme)] px-6 pt-12 pb-8 sm:px-8 lg:px-12 lg:pt-16">
      <div className="mx-auto max-w-[980px]">
        <div className="flex flex-wrap items-center gap-4 text-[12px] font-semibold text-[color:var(--color-si-petrole)]">
          <span>{page.kicker}</span>
          <span
            aria-hidden
            className="h-1 w-1 rounded-full bg-[color:var(--color-home-saf-dark)]"
          />
          <span className="inline-flex items-center gap-1.5">
            <BookOpenIcon className="h-4 w-4" /> {page.stat} de lecture
          </span>
        </div>
        <h1 className="mt-5 font-[family-name:var(--font-sora)] text-[clamp(38px,5.6vw,72px)] leading-[1.02] font-extrabold tracking-[-0.035em] text-balance text-[color:var(--color-home-ink)]">
          {page.title}{" "}
          <span className="text-[color:var(--color-home-saf-dark)]">{page.accent}</span>
        </h1>
        <p className="mt-6 max-w-[68ch] text-[17px] leading-[1.7] text-[color:var(--color-home-muted-2)]">
          {page.description}
        </p>
      </div>
      <Image
        src={page.image}
        alt={page.imageAlt}
        width={1400}
        height={620}
        className="mt-10 h-[230px] w-full rounded-[16px] object-cover sm:h-[340px]"
      />
    </section>
  );
}

function LocalZonesHero({ page }: { page: PreviewPage }) {
  return (
    <section className="relative overflow-hidden bg-[color:var(--color-si-petrole)] px-6 py-12 text-white sm:px-8 lg:px-12 lg:py-16">
      <div className="relative grid min-h-[430px] items-center gap-8 lg:grid-cols-[.82fr_1.18fr]">
        <div className="relative z-10">
          <p className="font-[family-name:var(--font-sora)] text-[12px] font-semibold text-[color:var(--color-home-saf)]">
            {page.kicker}
          </p>
          <h1 className="mt-4 font-[family-name:var(--font-sora)] text-[clamp(38px,5.2vw,68px)] leading-[1.03] font-extrabold tracking-[-0.035em] text-balance">
            {page.title} <span className="text-[color:var(--color-home-saf)]">{page.accent}</span>
          </h1>
          <p className="mt-6 max-w-[54ch] text-[16px] leading-[1.7] text-white/75">
            {page.description}
          </p>
          <p className="mt-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-[13px] font-semibold">
            <Clock3Icon className="h-4 w-4 text-[color:var(--color-home-saf)]" /> Intervention
            possible sous {page.stat}
          </p>
        </div>
        <LocalMapArt />
      </div>
    </section>
  );
}

function LocalCityHero({ page }: { page: PreviewPage }) {
  return (
    <section className="relative min-h-[520px] overflow-hidden bg-[color:var(--color-home-ink)]">
      <Image
        src={page.image}
        alt={page.imageAlt}
        fill
        sizes="100vw"
        loading="eager"
        className="object-cover opacity-55"
      />
      <div className="absolute inset-0 bg-[color:var(--color-home-ink)]/30" aria-hidden />
      <div className="relative flex min-h-[520px] flex-col justify-between px-6 py-10 text-white sm:px-8 lg:px-12 lg:py-12">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="inline-flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 text-[12px] font-bold text-[color:var(--color-si-petrole)]">
            <MapPinIcon className="h-4 w-4" /> {page.kicker}
          </p>
          <p className="text-[13px] font-semibold text-white/80">
            À {page.stat} de notre agence de Tours
          </p>
        </div>
        <div className="max-w-[900px]">
          <h1 className="font-[family-name:var(--font-sora)] text-[clamp(42px,6.5vw,84px)] leading-[.98] font-extrabold tracking-[-0.035em] text-balance">
            {page.title} <span className="text-[color:var(--color-home-saf)]">{page.accent}</span>
          </h1>
          <div className="mt-6 flex flex-wrap items-end justify-between gap-6 border-t border-white/35 pt-5">
            <p className="max-w-[58ch] text-[16px] leading-relaxed text-white/82">
              {page.description}
            </p>
            <span className="inline-flex items-center gap-2 text-[13px] font-bold text-[color:var(--color-home-saf)]">
              Voir les diagnostics à Amboise <ArrowRightIcon className="h-4 w-4" />
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

function LocalContactHero({ page }: { page: PreviewPage }) {
  return (
    <section className="grid bg-[color:var(--color-si-creme)] lg:grid-cols-[.8fr_1.2fr]">
      <div className="relative min-h-[320px] lg:min-h-[520px]">
        <Image
          src={page.image}
          alt={page.imageAlt}
          fill
          sizes="(min-width: 1024px) 40vw, 100vw"
          className="object-cover"
        />
        <p className="absolute bottom-5 left-5 rounded-full bg-white px-4 py-2 text-[12px] font-bold text-[color:var(--color-si-petrole)]">
          L’équipe Servicimmo · Tours
        </p>
      </div>
      <div className="flex flex-col justify-center px-6 py-12 sm:px-8 lg:px-12 lg:py-16">
        <LocalKicker>{page.kicker}</LocalKicker>
        <h1 className="mt-4 font-[family-name:var(--font-sora)] text-[clamp(38px,5vw,66px)] leading-[1.02] font-extrabold tracking-[-0.035em] text-balance text-[color:var(--color-home-ink)]">
          {page.title} <span className="text-[color:var(--color-si-petrole)]">{page.accent}</span>
        </h1>
        <p className="mt-5 max-w-[54ch] text-[16px] leading-[1.7] text-[color:var(--color-home-muted-2)]">
          {page.description}
        </p>
        <div className="mt-8 divide-y divide-[color:var(--color-home-line)] border-y border-[color:var(--color-home-line)]">
          <ContactAction icon={PhoneIcon} label="Appeler maintenant" value="02 47 47 01 23" />
          <ContactAction icon={MailIcon} label="Écrire à l’équipe" value="info@servicimmo.fr" />
        </div>
        <p className="mt-5 inline-flex items-center gap-2 text-[12px] font-semibold text-[color:var(--color-home-saf-dark)]">
          <Clock3Icon className="h-4 w-4" /> Réponse sous {page.stat} ouvrées
        </p>
      </div>
    </section>
  );
}

function LocalLegalHero({ page }: { page: PreviewPage }) {
  return (
    <section className="bg-white px-6 py-10 sm:px-8 lg:px-12 lg:py-14">
      <nav className="text-[12px] font-semibold text-[color:var(--color-home-muted-2)]">
        Accueil / Informations contractuelles
      </nav>
      <div className="mt-8 grid gap-8 border-b border-[color:var(--color-home-line)] pb-10 lg:grid-cols-[1fr_260px] lg:items-end">
        <div>
          <LocalKicker>{page.kicker}</LocalKicker>
          <h1 className="mt-4 max-w-[850px] font-[family-name:var(--font-sora)] text-[clamp(36px,4.8vw,60px)] leading-[1.04] font-extrabold tracking-[-0.03em] text-balance text-[color:var(--color-home-ink)]">
            {page.title} <span className="text-[color:var(--color-si-petrole)]">{page.accent}</span>
          </h1>
        </div>
        <div className="rounded-[12px] bg-[color:var(--color-home-saf-bg)] p-5 text-[color:var(--color-home-ink)]">
          <p className="text-[11px] font-semibold text-[color:var(--color-home-saf-dark)]">
            Dernière mise à jour
          </p>
          <p className="mt-1 font-[family-name:var(--font-sora)] text-[20px] font-bold">
            15 juillet {page.stat}
          </p>
        </div>
      </div>
      <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3 text-[13px] font-semibold text-[color:var(--color-si-petrole)]">
        {page.items.map((item) => (
          <span key={item.title}>{item.title}</span>
        ))}
      </div>
    </section>
  );
}

function LocalKicker({ children }: { children: ReactNode }) {
  return (
    <p className="font-[family-name:var(--font-sora)] text-[12px] font-semibold text-[color:var(--color-si-petrole)]">
      {children}
    </p>
  );
}

function Fact({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof CheckCircle2Icon;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 py-5">
      <Icon className="h-5 w-5 shrink-0 text-[color:var(--color-home-saf-dark)]" />
      <div>
        <p className="text-[11px] font-semibold text-[color:var(--color-home-muted)]">{label}</p>
        <p className="mt-0.5 text-[14px] font-bold text-[color:var(--color-home-ink)]">{value}</p>
      </div>
    </div>
  );
}

function ContactAction({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof PhoneIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="group flex items-center justify-between gap-4 py-5">
      <div className="flex items-center gap-3">
        <Icon className="h-5 w-5 text-[color:var(--color-home-saf-dark)]" />
        <div>
          <p className="text-[11px] font-semibold text-[color:var(--color-home-muted)]">{label}</p>
          <p className="mt-0.5 font-[family-name:var(--font-sora)] text-[16px] font-bold text-[color:var(--color-home-ink)]">
            {value}
          </p>
        </div>
      </div>
      <ArrowRightIcon className="h-4 w-4 text-[color:var(--color-si-petrole)] transition-transform group-hover:translate-x-1" />
    </div>
  );
}

function LocalMapArt() {
  const points = [
    [28, 37],
    [49, 25],
    [65, 43],
    [39, 58],
    [58, 69],
    [75, 62],
  ];
  return (
    <div className="relative min-h-[350px] lg:min-h-[430px]">
      <div className="absolute inset-[3%_8%] rounded-[47%_53%_42%_58%/55%_45%_55%_45%] bg-white/10" />
      <div className="absolute inset-[14%_20%] rounded-[58%_42%_54%_46%/45%_58%_42%_55%] bg-[color:var(--color-home-saf)]/18" />
      {points.map(([left, top], index) => (
        <span
          key={index}
          className="absolute h-4 w-4 rounded-full border-4 border-[color:var(--color-si-petrole)] bg-[color:var(--color-home-saf)] shadow-[0_0_0_1px_rgba(255,255,255,.65)]"
          style={{ left: `${left}%`, top: `${top}%` }}
        />
      ))}
      <div className="absolute right-[16%] bottom-[12%] rounded-[12px] bg-white px-5 py-4 text-[color:var(--color-home-ink)]">
        <p className="flex items-center gap-2 font-[family-name:var(--font-sora)] text-[14px] font-bold">
          <MapPinIcon className="h-4 w-4 text-[color:var(--color-home-saf-dark)]" /> Tours
        </p>
        <p className="mt-1 text-[11px] text-[color:var(--color-home-muted-2)]">
          Agence & point de départ
        </p>
      </div>
    </div>
  );
}
