"use client";

import { useState, type FormEvent } from "react";
import {
  CalendarDaysIcon,
  CircleHelpIcon,
  Clock3Icon,
  FileTextIcon,
  MapPinIcon,
  PhoneIcon,
  SendIcon,
} from "lucide-react";

import { useQuoteModal } from "@/components/questionnaire/QuoteModalProvider";

import { GoogleMapEmbed } from "./GoogleMapEmbed";

const INTENTS = [
  {
    id: "devis",
    label: "Demander un devis",
    detail: "Je prépare une vente, une location ou des travaux.",
    icon: FileTextIcon,
  },
  {
    id: "rapport",
    label: "Comprendre un rapport",
    detail: "J’ai une question après une intervention.",
    icon: CircleHelpIcon,
  },
  {
    id: "rendez-vous",
    label: "Prendre rendez-vous",
    detail: "Je connais déjà les diagnostics nécessaires.",
    icon: CalendarDaysIcon,
  },
  {
    id: "equipe",
    label: "Parler à l’équipe",
    detail: "Je préfère expliquer ma situation directement.",
    icon: PhoneIcon,
  },
] as const;

export function ContactExperience() {
  const [intent, setIntent] = useState<(typeof INTENTS)[number]["id"]>("devis");
  const { open } = useQuoteModal();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);

    if (intent === "devis" || intent === "rendez-vous") {
      open();
      return;
    }

    const name = String(form.get("name") ?? "").trim();
    const city = String(form.get("city") ?? "").trim();
    const message = String(form.get("message") ?? "").trim();
    const subject =
      intent === "rapport"
        ? "Question concernant un rapport Servicimmo"
        : "Demande de contact Servicimmo";
    const body = [`Nom : ${name}`, city ? `Commune : ${city}` : "", "", message]
      .filter(Boolean)
      .join("\n");
    window.location.href = `mailto:info@servicimmo.fr?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }

  return (
    <section className="bg-[color:var(--color-home-bg)]">
      <div className="mx-auto grid max-w-[var(--container,1280px)] gap-10 px-6 py-12 md:px-8 lg:grid-cols-[.88fr_1.12fr] lg:py-16">
        <div>
          <h2 className="font-[family-name:var(--font-sora)] text-[clamp(27px,3.2vw,40px)] leading-tight font-extrabold tracking-[-0.025em] text-balance text-[color:var(--color-home-ink)]">
            Choisissez le chemin le plus simple.
          </h2>
          <fieldset className="mt-7 divide-y divide-[color:var(--color-home-line)] border-y border-[color:var(--color-home-line)]">
            <legend className="sr-only">Motif de votre demande</legend>
            {INTENTS.map((item) => {
              const Icon = item.icon;
              return (
                <label
                  key={item.id}
                  className="flex min-h-20 cursor-pointer items-center gap-4 py-4"
                >
                  <input
                    type="radio"
                    name="contact-intent"
                    value={item.id}
                    checked={intent === item.id}
                    onChange={() => setIntent(item.id)}
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

        <form className="bg-white p-6 sm:p-8" onSubmit={handleSubmit}>
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
              sous 2 h
            </p>
          </div>
          <div className="mt-7 grid gap-6 sm:grid-cols-2">
            <label className="text-[12.5px] font-semibold text-[color:var(--color-home-ink)]">
              Nom et prénom
              <input
                name="name"
                required
                className="mt-2 min-h-12 w-full border-b border-[color:var(--color-home-line)] bg-transparent text-[14px] font-normal transition-colors outline-none focus:border-[color:var(--color-si-petrole)]"
              />
            </label>
            <label className="text-[12.5px] font-semibold text-[color:var(--color-home-ink)]">
              Téléphone
              <input
                name="phone"
                type="tel"
                required
                className="mt-2 min-h-12 w-full border-b border-[color:var(--color-home-line)] bg-transparent text-[14px] font-normal transition-colors outline-none focus:border-[color:var(--color-si-petrole)]"
              />
            </label>
            <label className="text-[12.5px] font-semibold text-[color:var(--color-home-ink)]">
              E-mail
              <input
                name="email"
                type="email"
                required
                className="mt-2 min-h-12 w-full border-b border-[color:var(--color-home-line)] bg-transparent text-[14px] font-normal transition-colors outline-none focus:border-[color:var(--color-si-petrole)]"
              />
            </label>
            <label className="text-[12.5px] font-semibold text-[color:var(--color-home-ink)]">
              Commune du bien
              <input
                name="city"
                className="mt-2 min-h-12 w-full border-b border-[color:var(--color-home-line)] bg-transparent text-[14px] font-normal transition-colors outline-none focus:border-[color:var(--color-si-petrole)]"
              />
            </label>
          </div>
          <label className="mt-7 block text-[12.5px] font-semibold text-[color:var(--color-home-ink)]">
            Votre message
            <textarea
              name="message"
              rows={4}
              required
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
              {intent === "devis" || intent === "rendez-vous"
                ? "Continuer mon devis"
                : "Préparer mon e-mail"}
              <SendIcon className="h-4 w-4" />
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
