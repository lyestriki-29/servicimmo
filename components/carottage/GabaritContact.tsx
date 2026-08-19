import { ClockIcon, MailIcon, MapPinIcon, PhoneIcon } from "lucide-react";

import { ArianeFC } from "@/components/carottage/ArianeFC";
import { ContactFormFC } from "@/components/carottage/ContactFormFC";
import { GoogleMapEmbed } from "@/components/marketing/pages/GoogleMapEmbed";
import { francecarottageConfig as c } from "@/lib/clients/francecarottage/config";

const INFOS = [
  {
    icone: MapPinIcon,
    libelle: "Où nous trouver :",
    valeur: `${c.adresse.ligne1}, ${c.adresse.codePostal} ${c.adresse.ville}`,
    href: undefined,
  },
  {
    icone: PhoneIcon,
    libelle: "Téléphone :",
    valeur: c.contact.telephone,
    href: c.contact.telephoneHref,
  },
  {
    icone: ClockIcon,
    libelle: "Horaires :",
    valeur: "Du lundi au vendredi",
    href: undefined,
  },
  {
    icone: MailIcon,
    libelle: "Email :",
    valeur: c.contact.email,
    href: `mailto:${c.contact.email}`,
  },
  {
    icone: ClockIcon,
    libelle: "Intervention :",
    valeur: "Sous 24-48 h",
    href: undefined,
  },
] as const;

/**
 * Page contact FC — halo rouge sur fond encre, panneau noir profond (infos +
 * formulaire Brevo), carte Google du siège en pied.
 */
export function GabaritContact() {
  return (
    <div
      className="bg-[color:var(--fc-noir)]"
      style={{
        // Halo rouge sombre émanant du coin haut-gauche, éteint vers le noir.
        backgroundImage:
          "radial-gradient(1100px 850px at -5% -8%, rgba(140,22,26,0.55), rgba(74,22,20,0.25) 45%, transparent 70%)",
      }}
    >
      <section className="mx-auto max-w-3xl px-6 pt-14 text-center md:px-8">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#e9a4a6]">Contact</p>
        <h1 className="mt-3 font-[family-name:var(--font-sora)] text-[clamp(30px,3.4vw,42px)] font-extrabold leading-tight tracking-[-0.02em] text-white">
          Parlons de votre chantier.
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-[14.5px] leading-relaxed text-white/60">
          Décrivez votre besoin — repérage amiante/HAP, carottage d’enrobés, voirie ou bâtiment —
          et l’équipe vous répond sous 24 h ouvrées.
        </p>
      </section>
      <ArianeFC segments={[{ label: "Contact", href: "/contact" }]} ton="clair" centre />

      <section className="mx-auto max-w-[var(--container,1280px)] px-6 pb-12 pt-10 md:px-8">
        <div className="rounded-[4px] bg-[color:var(--fc-noir-profond)] px-7 py-10 shadow-[0_28px_60px_rgba(0,0,0,0.5)] ring-1 ring-white/10 md:px-12 md:py-14">
          <div className="grid gap-12 lg:grid-cols-[1fr_1.1fr]">
            <div>
              <h2 className="max-w-md font-[family-name:var(--font-sora)] text-[clamp(24px,2.6vw,32px)] font-extrabold leading-[1.15] tracking-[-0.02em] text-white">
                Une question, un chantier à chiffrer ?
              </h2>
              <p className="mt-4 max-w-md text-[14px] leading-relaxed text-white/60">
                Localisation, type de travaux, emprise concernée : plus votre message est précis,
                plus le devis arrive vite.
              </p>
              <ul className="mt-9 space-y-6">
                {INFOS.map(({ icone: Icone, libelle, valeur, href }) => (
                  <li key={libelle} className="flex items-start gap-4">
                    <span className="grid h-11 w-11 shrink-0 place-items-center bg-white/[0.06] ring-1 ring-white/10">
                      <Icone className="h-5 w-5 text-white/80" aria-hidden />
                    </span>
                    <span>
                      <span className="block font-[family-name:var(--font-sora)] text-[13.5px] font-bold text-[color:var(--fc-rouge)] [filter:brightness(1.6)]">
                        {libelle}
                      </span>
                      {href ? (
                        <a href={href} className="mt-0.5 block text-[14px] text-white/80 hover:text-white">
                          {valeur}
                        </a>
                      ) : (
                        <span className="mt-0.5 block text-[14px] text-white/80">{valeur}</span>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <ContactFormFC />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[var(--container,1280px)] px-6 pb-16 md:px-8">
        <div className="h-[420px] overflow-hidden rounded-[4px] ring-1 ring-white/10">
          <GoogleMapEmbed
            title="Carte Google Maps du siège France Carottage à Tours"
            query={`France Carottage, ${c.adresse.ligne1}, ${c.adresse.codePostal} ${c.adresse.ville}`}
            zoom={15}
          />
        </div>
      </section>
    </div>
  );
}
