import Link from "next/link";
import { PhoneIcon } from "lucide-react";

import { LienServicimmo } from "@/components/carottage/LienServicimmo";
import { LogoFC } from "@/components/carottage/LogoFC";
import { francecarottageConfig } from "@/lib/clients/francecarottage/config";
import { loadDepartementsFC, loadExpertises } from "@/lib/content/load-carottage";

/** Footer FC — fond noir, maillage départements majeurs + expertises, rappel marque sœur. */
export async function FooterFC() {
  const [departements, expertises] = await Promise.all([loadDepartementsFC(), loadExpertises()]);
  const deptsMajeurs = departements.slice(0, 8);
  const expertisesTop = expertises.slice(0, 6);

  return (
    <footer className="border-t-[3px] border-[color:var(--fc-rouge)] bg-[color:var(--fc-noir)] text-white/70">
      <div className="mx-auto grid max-w-[var(--container,1280px)] gap-10 px-6 py-12 md:grid-cols-4 md:px-8">
        <div>
          <LogoFC tone="light" className="h-8" />
          <p className="mt-3 text-[13.5px] leading-relaxed">
            {francecarottageConfig.zoneIntervention} · carottage routier & repérage amiante/HAP sur enrobés.
          </p>
          <a
            href={francecarottageConfig.contact.telephoneHref}
            className="mt-4 inline-flex items-center gap-2 font-[family-name:var(--font-sora)] text-[15px] font-bold text-white hover:text-[color:var(--fc-rouge)]"
          >
            <PhoneIcon className="h-4 w-4" aria-hidden />
            {francecarottageConfig.contact.telephone}
          </a>
          <div className="mt-5">
            <LienServicimmo />
          </div>
        </div>

        <div>
          <p className="font-[family-name:var(--font-sora)] text-[12.5px] font-bold uppercase tracking-wide text-white">
            Départements
          </p>
          <ul className="mt-3 space-y-2">
            {deptsMajeurs.map((d) => (
              <li key={d.slug}>
                <Link href={`/zones/${d.slug}`} className="text-[13.5px] hover:text-[color:var(--fc-rouge)]">
                  {d.nom} ({d.code})
                </Link>
              </li>
            ))}
            <li>
              <Link href="/zones" className="text-[13.5px] font-semibold text-white hover:text-[color:var(--fc-rouge)]">
                Toutes les zones →
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="font-[family-name:var(--font-sora)] text-[12.5px] font-bold uppercase tracking-wide text-white">
            Expertises
          </p>
          <ul className="mt-3 space-y-2">
            {expertisesTop.map((e) => (
              <li key={e.slug}>
                <Link href={`/expertises/${e.slug}`} className="text-[13.5px] hover:text-[color:var(--fc-rouge)]">
                  {e.titre}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="font-[family-name:var(--font-sora)] text-[12.5px] font-bold uppercase tracking-wide text-white">
            Société
          </p>
          <ul className="mt-3 space-y-2">
            <li>
              <Link href="/contact" className="text-[13.5px] hover:text-[color:var(--fc-rouge)]">
                Contact
              </Link>
            </li>
            <li>
              <Link href="/devis" className="text-[13.5px] hover:text-[color:var(--fc-rouge)]">
                Demander un devis
              </Link>
            </li>
            <li>
              <Link href="/mentions-legales" className="text-[13.5px] hover:text-[color:var(--fc-rouge)]">
                Mentions légales
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-[var(--container,1280px)] flex-col items-center justify-between gap-2 px-6 py-5 text-[12px] text-white/55 md:flex-row md:px-8">
          <p className="m-0">
            © {new Date().getFullYear()} {francecarottageConfig.raisonSociale}. Tous droits réservés.
          </p>
          <p className="m-0">
            Fait avec passion par{" "}
            <a
              href="https://propulseo-site.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-white/80 no-underline transition-colors hover:text-[color:var(--fc-rouge)]"
            >
              Propul&apos;SEO
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
