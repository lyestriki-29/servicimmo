import Image from "next/image";
import {
  ArrowRightIcon,
  CalendarDaysIcon,
  CircleHelpIcon,
  Clock3Icon,
  CrosshairIcon,
  FileTextIcon,
  MapPinIcon,
  PhoneIcon,
  SendIcon,
} from "lucide-react";

import { GoogleMapEmbed } from "@/components/marketing/pages/GoogleMapEmbed";
import { PREVIEW_PAGES } from "@/components/preview/servicimmo-preview-data";

import { BandeConfiance, CoinsViseur, KickerMono } from "./primitives";

const page = PREVIEW_PAGES.find((item) => item.id === "contact");

const HORAIRES = [
  { jours: "Lundi – Vendredi", plages: "9 h – 12 h · 14 h – 19 h" },
  { jours: "Samedi & dimanche", plages: "Interventions sur rendez-vous" },
] as const;

/* Le bloc « motif de la demande » — forme Codex validée. */
const INTENTS = [
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
] as const;

const CHAMPS = [
  { nom: "name", label: "Nom et prénom", type: "text" },
  { nom: "phone", label: "Téléphone", type: "tel" },
  { nom: "email", label: "E-mail", type: "email" },
  { nom: "city", label: "Commune du bien", type: "text" },
] as const;

export function GabaritContact() {
  if (!page) return null;

  return (
    <div className="bg-white">
      {/* Hero : la vraie équipe en fond voilé + relevé des canaux */}
      <section className="relative overflow-hidden bg-[color:var(--color-home-ink)]">
        <Image
          src="/img/si/equipe.jpg"
          alt="L’équipe Servicimmo et ses véhicules d’intervention au bord de la Loire"
          fill
          sizes="100vw"
          className="object-cover object-[center_35%]"
          priority
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-r from-[color:var(--color-home-ink)]/92 via-[color:var(--color-home-ink)]/72 to-[color:var(--color-home-ink)]/42"
        />
        <p className="absolute top-6 right-6 hidden font-mono text-[10px] font-bold tracking-[.2em] text-white/55 uppercase lg:block">
          L’équipe Servicimmo · bord de Loire, Tours
        </p>
        <div className="relative mx-auto grid max-w-[var(--container,1280px)] items-center gap-12 px-6 pt-16 pb-24 md:px-8 lg:grid-cols-[1.02fr_.98fr] lg:gap-14 lg:pt-24 lg:pb-32">
          <div>
            <KickerMono clair>{page.kicker}</KickerMono>
            <h1 className="mt-5 font-[family-name:var(--font-sora)] text-[clamp(38px,5vw,68px)] leading-[.99] font-extrabold tracking-[-0.04em] text-balance text-white">
              {page.title} <span className="text-[color:var(--color-si-lime)]">{page.accent}</span>
            </h1>
            <p className="mt-7 max-w-[50ch] border-t border-white/25 pt-6 text-[16.5px] leading-[1.75] text-white/82">
              {page.description}
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-5">
              <a
                href="tel:+33247470123"
                className="inline-flex min-h-12 items-center gap-2 rounded-full bg-[color:var(--color-si-lime)] px-6 font-[family-name:var(--font-sora)] text-[15px] font-bold text-[color:var(--color-home-ink)] transition-transform hover:-translate-y-0.5"
              >
                02 47 47 01 23
              </a>
              <p className="inline-flex items-center gap-2 text-[12.5px] font-semibold text-white/70">
                <Clock3Icon className="h-4 w-4 text-[color:var(--color-si-lime)]" aria-hidden />
                Réponse sous {page.stat} ouvrées — sans transfert inutile
              </p>
            </div>
          </div>
          <div className="relative rounded-[18px] border border-white/15 bg-[color:var(--color-home-ink)]/72 p-7 backdrop-blur-md sm:p-8">
            <CoinsViseur />
            <KickerMono clair>Relevé des canaux</KickerMono>
            <div className="mt-4 divide-y divide-white/12">
              {page.items.map((canal, index) => {
                const href =
                  canal.meta === "Téléphone"
                    ? "tel:+33247470123"
                    : canal.meta === "E-mail"
                      ? "mailto:info@servicimmo.fr"
                      : undefined;
                const contenu = (
                  <div className="flex gap-4 py-4">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/25">
                      <CrosshairIcon
                        className="h-3.5 w-3.5 text-[color:var(--color-si-lime)]"
                        aria-hidden
                      />
                    </span>
                    <div className="min-w-0">
                      <p className="font-mono text-[10px] font-bold tracking-[.15em] text-white/55 uppercase">
                        {String(index + 1).padStart(2, "0")} · {canal.meta}
                      </p>
                      <p className="mt-1 font-[family-name:var(--font-sora)] text-[15.5px] font-bold text-white">
                        {canal.title}
                      </p>
                      <p className="mt-1 text-[12px] leading-relaxed text-white/60">{canal.text}</p>
                    </div>
                    {href && (
                      <ArrowRightIcon
                        className="mt-1 ml-auto h-4 w-4 shrink-0 text-[color:var(--color-si-lime)]"
                        aria-hidden
                      />
                    )}
                  </div>
                );
                return href ? (
                  <a
                    key={canal.title}
                    href={href}
                    className="block transition-opacity hover:opacity-85"
                  >
                    {contenu}
                  </a>
                ) : (
                  <div key={canal.title}>{contenu}</div>
                );
              })}
            </div>
            <p className="mt-4 border-t border-[color:var(--color-si-lime)]/40 pt-3 font-mono text-[9.5px] tracking-[.14em] text-white/45 uppercase">
              Vos coordonnées servent uniquement à vous répondre
            </p>
          </div>
        </div>
      </section>

      {/* Chevauchement : l'agence mord sur le hero — carte + fiche pratique */}
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
              <MapPinIcon
                className="mr-1.5 inline h-3.5 w-3.5 text-[color:var(--color-home-saf)]"
                aria-hidden
              />
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
                <div
                  key={ligne.jours}
                  className="flex flex-wrap items-baseline justify-between gap-2 py-4"
                >
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
              <ArrowRightIcon
                className="h-4 w-4 transition-transform group-hover:translate-x-1.5"
                aria-hidden
              />
            </a>
          </div>
        </div>
      </section>

      {/* Le bas de Codex : motif de la demande + formulaire */}
      <section className="bg-[color:var(--color-home-bg)]">
        <div className="mx-auto grid max-w-[var(--container,1280px)] gap-10 px-6 py-14 md:px-8 lg:grid-cols-[.88fr_1.12fr] lg:py-20">
          <div>
            <h2 className="font-[family-name:var(--font-sora)] text-[clamp(27px,3.2vw,40px)] leading-tight font-extrabold tracking-[-0.025em] text-balance text-[color:var(--color-home-ink)]">
              Choisissez le chemin le plus simple.
            </h2>
            <fieldset className="mt-7 divide-y divide-[color:var(--color-home-line)] border-y border-[color:var(--color-home-line)]">
              <legend className="sr-only">Motif de votre demande</legend>
              {INTENTS.map((item, index) => {
                const Icon = item.icon;
                return (
                  <label
                    key={item.label}
                    className="flex min-h-20 cursor-pointer items-center gap-4 py-4"
                  >
                    <input
                      type="radio"
                      name="contact-intent-maquette"
                      defaultChecked={index === 0}
                      className="h-4 w-4 accent-[color:var(--color-si-petrole)]"
                    />
                    <Icon
                      className="h-5 w-5 shrink-0 text-[color:var(--color-si-petrole)]"
                      aria-hidden
                    />
                    <span>
                      <span className="block font-[family-name:var(--font-sora)] text-[14px] font-bold text-[color:var(--color-home-ink)]">
                        {item.label}
                      </span>
                      <span className="mt-1 block text-[12.5px] leading-relaxed text-[color:var(--color-home-muted-2)]">
                        {item.detail}
                      </span>
                    </span>
                  </label>
                );
              })}
            </fieldset>
          </div>

          <form className="bg-white p-6 sm:p-8">
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
                <Clock3Icon
                  className="h-4 w-4 text-[color:var(--color-home-saf-dark)]"
                  aria-hidden
                />
                Réponse sous 2 h
              </p>
            </div>
            <div className="mt-7 grid gap-6 sm:grid-cols-2">
              {CHAMPS.map((champ) => (
                <label
                  key={champ.nom}
                  className="text-[12.5px] font-semibold text-[color:var(--color-home-ink)]"
                >
                  {champ.label}
                  <input
                    name={champ.nom}
                    type={champ.type}
                    className="mt-2 min-h-12 w-full border-b border-[color:var(--color-home-line)] bg-transparent text-[14px] font-normal transition-colors outline-none focus:border-[color:var(--color-si-petrole)]"
                  />
                </label>
              ))}
            </div>
            <label className="mt-7 block text-[12.5px] font-semibold text-[color:var(--color-home-ink)]">
              Votre message
              <textarea
                name="message"
                rows={4}
                className="mt-3 w-full resize-none border border-[color:var(--color-home-line)] bg-[color:var(--color-home-bg)] p-4 text-[14px] font-normal transition-colors outline-none focus:border-[color:var(--color-si-petrole)]"
              />
            </label>
            <div className="mt-7 flex flex-wrap items-center justify-between gap-4">
              <p className="max-w-[34ch] text-[11.5px] leading-relaxed text-[color:var(--color-home-muted-2)]">
                Vos informations servent uniquement à traiter cette demande.
              </p>
              <button
                type="button"
                className="inline-flex min-h-12 items-center gap-2 bg-[color:var(--color-home-saf)] px-5 text-[13px] font-bold text-[color:var(--color-home-ink)] transition-colors hover:bg-[color:var(--color-home-saf-soft)]"
              >
                Continuer mon devis <SendIcon className="h-4 w-4" aria-hidden />
              </button>
            </div>
          </form>
        </div>
      </section>

      <BandeConfiance />
    </div>
  );
}
