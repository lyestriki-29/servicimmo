import Link from "next/link";
import { PhoneIcon, MailIcon, MapPinIcon, ClockIcon, AwardIcon, ShieldIcon, BuildingIcon, BadgeIcon, FlaskConicalIcon, FacebookIcon } from "lucide-react";

import { LogoServicimmo } from "@/components/marketing/LogoServicimmo";
import { loadServices, loadVilles } from "@/lib/content/load";

const NAV_LINKS = [
  { label: "Accueil", href: "/" },
  { label: "Nos diagnostics", href: "/services" },
  { label: "Zones d'intervention", href: "/zones" },
  { label: "Actualités", href: "/actualites" },
  { label: "Contact", href: "/contact" },
];

const DIAGNOSTICS = [
  { label: "DPE", href: "/services" },
  { label: "Amiante", href: "/services" },
  { label: "Plomb (CREP)", href: "/services" },
  { label: "Termites", href: "/services" },
  { label: "Gaz & Électricité", href: "/services" },
  { label: "ERP & mesurages", href: "/services" },
];

const CERTIFICATIONS = [
  { icon: AwardIcon, label: "LCC Qualixpert" },
  { icon: ShieldIcon, label: "Assuré Allianz" },
  { icon: BuildingIcon, label: "FNAIM Diagnostic" },
  { icon: BadgeIcon, label: "iCert" },
  { icon: FlaskConicalIcon, label: "COFRAC" },
];

/**
 * Footer fidèle à la maquette home.html (.si-footer).
 * 6 colonnes : brand/contact, navigation, diagnostics (statique), diagnostics
 * (maillage interne vers les fiches services), zones d'intervention (maillage
 * interne vers les fiches villes), certifications.
 * Async : charge les fiches services/villes pour le maillage SEO.
 */
export async function Footer() {
  const [services, villes] = await Promise.all([loadServices(), loadVilles()]);

  return (
    <footer className="bg-[color:var(--color-si-petrole)] text-[#c7d2e0]">
      {/* Top */}
      <div className="grid grid-cols-1 gap-10 px-6 pb-14 pt-[84px] sm:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr_1fr_1fr_1.1fr] md:px-10 lg:px-16">
        {/* Colonne 1 : brand */}
        <div>
          <div className="mb-4">
            <LogoServicimmo tone="light" withTagline className="text-[26px]" />
          </div>
          <p className="mb-[22px] max-w-[330px] text-[14.5px] leading-[1.7] text-[#9fb0c4]">
            Cabinet de diagnostic immobilier indépendant à Tours depuis 1998.
            Particuliers, bailleurs, notaires, syndics et collectivités : nous
            sécurisons vos transactions partout en Indre-et-Loire.
          </p>
          <ul className="flex flex-col gap-[11px]">
            <FooterContactItem icon={PhoneIcon} text="02 47 47 01 23" href="tel:0247470123" />
            <FooterContactItem icon={MailIcon} text="info@servicimmo.fr" href="mailto:info@servicimmo.fr" />
            <FooterContactItem icon={MapPinIcon} text="58 Rue de la Chevalerie, 37100 Tours" />
            <FooterContactItem icon={ClockIcon} text="Lun–Ven 9h–12h / 14h–19h (18h le vendredi)" />
          </ul>
        </div>

        {/* Colonne 2 : navigation */}
        <FooterLinkCol title="Navigation" links={NAV_LINKS} />

        {/* Colonne 3 : diagnostics */}
        <FooterLinkCol title="Nos diagnostics" links={DIAGNOSTICS} />

        {/* Colonne 4 : maillage diagnostics (fiches services réelles) */}
        <div>
          <h4 className="mb-5 font-[family-name:var(--font-sora)] text-[16px] font-semibold tracking-[0.01em] text-white">
            Diagnostics
          </h4>
          <ul className="flex flex-col gap-[11px]">
            {services.slice(0, 6).map((s) => (
              <li key={s.slug}>
                <Link
                  href={`/services/${s.slug}`}
                  className="text-[14.5px] text-[#c7d2e0] transition-colors hover:text-[color:var(--color-home-saf)]"
                >
                  {s.titre}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Colonne 5 : maillage zones (fiches villes réelles) */}
        <div>
          <h4 className="mb-5 font-[family-name:var(--font-sora)] text-[16px] font-semibold tracking-[0.01em] text-white">
            Zones d&apos;intervention
          </h4>
          <ul className="flex flex-col gap-[11px]">
            {villes.slice(0, 7).map((v) => (
              <li key={v.slug}>
                <Link
                  href={`/zones/${v.slug}`}
                  className="text-[14.5px] text-[#c7d2e0] transition-colors hover:text-[color:var(--color-home-saf)]"
                >
                  Diagnostic {v.ville}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/zones"
                className="text-[14.5px] font-semibold text-[#c7d2e0] transition-colors hover:text-[color:var(--color-home-saf)]"
              >
                Toutes les villes →
              </Link>
            </li>
          </ul>
        </div>

        {/* Colonne 6 : certifications */}
        <div>
          <h4 className="mb-5 font-[family-name:var(--font-sora)] text-[16px] font-semibold tracking-[0.01em] text-white">
            Certifications
          </h4>
          <ul className="flex flex-col gap-[11px]">
            {CERTIFICATIONS.map(({ icon: Icon, label }) => (
              <li key={label} className="flex items-center gap-[11px] text-[14.5px]">
                <Icon
                  className="mt-[1px] h-4 w-4 flex-none text-[color:var(--color-home-saf)]"
                  aria-hidden
                />
                {label}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Bottom */}
      <div className="border-t border-white/10">
        <div className="grid grid-cols-1 items-center gap-3 px-6 py-[22px] text-center md:grid-cols-[1fr_auto_1fr] md:px-10 lg:px-16">
          {/* Les liens legaux vivent ici : la LCEN (art. 6-III) impose un acces
              « facile, direct et permanent ». Le portage React de v2.html les
              avait perdus, rendant /mentions-legales et /cgv injoignables a la
              navigation — seule l'URL directe y menait. */}
          <p className="m-0 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[13.5px] text-[#8295ab] md:justify-start md:justify-self-start md:text-left">
            <span>© 2026 Servicimmo</span>
            <Link
              href="/mentions-legales"
              className="text-[#a9bccf] no-underline transition-colors hover:text-[color:var(--color-home-saf)]"
            >
              Mentions légales
            </Link>
            <Link
              href="/cgv"
              className="text-[#a9bccf] no-underline transition-colors hover:text-[color:var(--color-home-saf)]"
            >
              CGV
            </Link>
            <Link
              href="/cookies"
              className="text-[#a9bccf] no-underline transition-colors hover:text-[color:var(--color-home-saf)]"
            >
              Cookies et cartes
            </Link>
          </p>
          <p className="m-0 text-[13.5px] text-[#8295ab] md:justify-self-center">
            Fait avec passion par{" "}
            <a
              href="https://propulseo-site.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-[#a9bccf] no-underline transition-colors hover:text-[color:var(--color-home-saf)]"
            >
              Propul&apos;SEO
            </a>
          </p>
          <div className="flex justify-center gap-[10px] md:justify-self-end">
            <SocialLink
              href="https://www.facebook.com/servicimmotours/"
              icon={FacebookIcon}
              label="Facebook"
            />
          </div>
        </div>
      </div>
    </footer>
  );
}

// ---------------------------------------------------------------------------
// Sous-composants
// ---------------------------------------------------------------------------

function FooterLinkCol({
  title,
  links,
}: {
  title: string;
  links: { label: string; href: string }[];
}) {
  return (
    <div>
      <h4 className="mb-5 font-[family-name:var(--font-sora)] text-[16px] font-semibold tracking-[0.01em] text-white">
        {title}
      </h4>
      <ul className="flex flex-col gap-[11px]">
        {links.map((link) => (
          <li key={link.label}>
            <Link
              href={link.href}
              className="text-[14.5px] text-[#c7d2e0] transition-colors hover:text-[color:var(--color-home-saf)]"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function FooterContactItem({
  icon: Icon,
  text,
  href,
}: {
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  text: string;
  href?: string;
}) {
  const inner = (
    <span className="flex items-start gap-[11px] text-[14.5px] text-[#c7d2e0]">
      <Icon
        className="mt-[3px] h-4 w-4 flex-none text-[color:var(--color-home-saf)]"
        aria-hidden
      />
      {text}
    </span>
  );
  return (
    <li>
      {href ? (
        <a href={href} className="transition-colors hover:text-[color:var(--color-home-saf)]">
          {inner}
        </a>
      ) : (
        inner
      )}
    </li>
  );
}

function SocialLink({
  href,
  icon: Icon,
  label,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="flex h-[38px] w-[38px] items-center justify-center rounded-full bg-white/[0.08] text-white transition-all hover:bg-[color:var(--color-home-saf)] hover:text-[color:var(--color-home-ink)]"
    >
      <Icon className="h-4 w-4" />
    </a>
  );
}
