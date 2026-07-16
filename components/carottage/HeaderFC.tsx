"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { MapPinnedIcon, MenuIcon, PhoneIcon, XIcon } from "lucide-react";

import { LienServicimmo } from "@/components/carottage/LienServicimmo";
import { LogoFC } from "@/components/carottage/LogoFC";
import { francecarottageConfig } from "@/lib/clients/francecarottage/config";

const NAV: { label: string; href: string }[] = [
  { label: "Accueil", href: "/" },
  { label: "Expertises", href: "/expertises" },
  { label: "Zones", href: "/zones" },
  { label: "Contact", href: "/contact" },
];

/**
 * Header FC — gabarit ALIGNÉ au pixel sur le header Servicimmo (mêmes dimensions
 * exactes : bandeau `py-[7px]`/`12.5px`, barre `py-[14px]`, nav `gap-[26px]`/`14.5px`,
 * CTA `px-[22px] py-[13px]`/`14px`, mêmes breakpoints `xl`). Seule l'identité FC
 * change : bandeau noir, barre blanche, CTA rouge, logo image. Sticky, ombre au scroll.
 */
export function HeaderFC() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 14);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="sticky top-0 z-[900]">
      {/* Bandeau utilitaire noir */}
      <div className="bg-[color:var(--fc-noir)] text-white/70">
        <div className="mx-auto flex max-w-[var(--container,1280px)] items-center justify-between gap-4 px-6 py-[7px] font-[family-name:var(--font-sora)] text-[12.5px] md:px-8">
          <span className="inline-flex items-center gap-[7px]">
            <MapPinnedIcon
              className="h-[14px] w-[14px] text-[color:var(--fc-rouge)]"
              aria-hidden
            />
            Interventions {francecarottageConfig.zoneIntervention}
          </span>
          <span className="inline-flex items-center gap-3">
            <LienServicimmo />
            <a
              href={francecarottageConfig.contact.telephoneHref}
              className="inline-flex items-center gap-[7px] font-bold text-white transition-colors hover:text-[color:var(--fc-rouge)]"
            >
              <PhoneIcon className="h-[14px] w-[14px]" aria-hidden />
              {francecarottageConfig.contact.telephone}
            </a>
          </span>
        </div>
      </div>

      {/* Barre principale blanche */}
      <div
        className={`border-b border-[color:var(--fc-gris-clair)] bg-white backdrop-blur-[10px] transition-shadow ${
          scrolled ? "shadow-[0_8px_26px_rgba(17,17,19,.08)]" : ""
        }`}
      >
        <div className="mx-auto flex max-w-[var(--container,1280px)] items-center justify-between gap-6 px-6 py-[14px] md:px-8">
          <Link
            href="/"
            aria-label="Accueil France Carottage"
            className="inline-flex flex-none items-center"
          >
            <LogoFC tone="dark" priority className="h-9" />
          </Link>

          {/* Nav desktop */}
          <nav
            aria-label="Navigation principale"
            className="hidden items-center gap-[26px] xl:flex"
          >
            {NAV.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="group relative whitespace-nowrap font-[family-name:var(--font-sora)] text-[14.5px] font-semibold text-[color:var(--fc-noir)] transition-colors hover:text-[color:var(--fc-rouge)]"
              >
                {link.label}
                <span
                  aria-hidden
                  className="absolute bottom-[-6px] left-0 h-[2px] w-0 bg-[color:var(--fc-rouge)] transition-[width] duration-[250ms] group-hover:w-full"
                />
              </Link>
            ))}
          </nav>

          {/* Droite : CTA + burger (le tél vit dans le bandeau) */}
          <div className="flex items-center gap-[18px]">
            <Link
              href="/devis"
              className="inline-flex items-center gap-2 whitespace-nowrap rounded-[6px] bg-[color:var(--fc-rouge)] px-[22px] py-[13px] font-[family-name:var(--font-sora)] text-[14px] font-bold uppercase tracking-wide text-white transition-colors hover:bg-[color:var(--fc-rouge-fonce)]"
            >
              Devis chantier
            </Link>

            <button
              type="button"
              className="cursor-pointer border-none bg-transparent p-1 text-[color:var(--fc-noir)] xl:hidden"
              aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
              onClick={() => setOpen((v) => !v)}
            >
              {open ? (
                <XIcon className="h-6 w-6" />
              ) : (
                <MenuIcon className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Nav mobile */}
      {open && (
        <nav
          aria-label="Navigation mobile"
          className="flex flex-col gap-0 border-b border-[color:var(--fc-gris-clair)] bg-white px-6 pb-[18px] pt-[10px] text-[color:var(--fc-noir)] shadow-[0_18px_40px_rgba(17,17,19,.12)] xl:hidden"
        >
          {NAV.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="border-b border-[color:var(--fc-gris-clair)] py-3 font-[family-name:var(--font-sora)] text-[14.5px] font-semibold last:border-b-0 hover:text-[color:var(--fc-rouge)]"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
