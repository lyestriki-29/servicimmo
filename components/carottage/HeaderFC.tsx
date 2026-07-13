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
 * Header FC — structure volontairement différente du header Servicimmo :
 * bandeau utilitaire NOIR (tél + zone nationale + cross-link marque sœur),
 * barre blanche épurée (logo texte massif, nav Sora, CTA rouge plein).
 * Sticky, ombre au scroll.
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
        <div className="mx-auto flex max-w-[var(--container,1280px)] items-center justify-between gap-4 px-6 py-2 font-[family-name:var(--font-sora)] text-[12px] md:px-8">
          <span className="inline-flex items-center gap-1.5">
            <MapPinnedIcon className="h-3.5 w-3.5 text-[color:var(--fc-rouge)]" aria-hidden />
            Interventions {francecarottageConfig.zoneIntervention}
          </span>
          <div className="flex items-center gap-4">
            <a
              href={francecarottageConfig.contact.telephoneHref}
              className="inline-flex items-center gap-1.5 font-bold text-white transition-colors hover:text-[color:var(--fc-rouge)]"
            >
              <PhoneIcon className="h-3.5 w-3.5" aria-hidden />
              {francecarottageConfig.contact.telephone}
            </a>
            <LienServicimmo />
          </div>
        </div>
      </div>

      {/* Barre principale blanche */}
      <div
        className={`border-b border-[color:var(--fc-gris-clair)] bg-white transition-shadow ${
          scrolled ? "shadow-[0_10px_30px_rgba(17,17,19,.08)]" : ""
        }`}
      >
        <div className="mx-auto flex max-w-[var(--container,1280px)] items-center justify-between gap-6 px-6 py-[15px] md:px-8">
          <Link href="/" aria-label="Accueil France Carottage" className="inline-flex flex-none items-center">
            <LogoFC tone="dark" priority className="h-9" />
          </Link>

          <nav aria-label="Navigation principale" className="hidden items-center gap-8 lg:flex">
            {NAV.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="group relative font-[family-name:var(--font-sora)] text-[14px] font-semibold text-[color:var(--fc-noir)] transition-colors hover:text-[color:var(--fc-rouge)]"
              >
                {link.label}
                <span
                  aria-hidden
                  className="absolute -bottom-1.5 left-0 h-[2px] w-0 bg-[color:var(--fc-rouge)] transition-[width] duration-[250ms] group-hover:w-full"
                />
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/devis"
              className="inline-flex items-center rounded-[4px] bg-[color:var(--fc-rouge)] px-5 py-3 font-[family-name:var(--font-sora)] text-[13.5px] font-bold uppercase tracking-wide text-white transition-colors hover:bg-[color:var(--fc-rouge-fonce)]"
            >
              Devis chantier
            </Link>
            <button
              type="button"
              className="cursor-pointer border-none bg-transparent p-1 text-[color:var(--fc-noir)] lg:hidden"
              aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
              onClick={() => setOpen((v) => !v)}
            >
              {open ? <XIcon className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {open && (
        <nav
          aria-label="Navigation mobile"
          className="flex flex-col border-b border-[color:var(--fc-gris-clair)] bg-white px-6 pb-4 pt-2 lg:hidden"
        >
          {NAV.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="border-b border-[color:var(--fc-gris-clair)] py-3 font-[family-name:var(--font-sora)] text-[14px] font-semibold text-[color:var(--fc-noir)] last:border-b-0 hover:text-[color:var(--fc-rouge)]"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
