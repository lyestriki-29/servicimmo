import Link from "next/link";

import { Reveal } from "@/components/marketing/Reveal";
import { francecarottageConfig } from "@/lib/clients/francecarottage/config";
import { REGIONS_CARTE, REGIONS_CARTE_VIEWBOX, SIEGE_TOURS } from "@/lib/clients/francecarottage/regions-carte";
import { loadDepartementsFC, loadVillesFC } from "@/lib/content/load-carottage";

/** Régions couvertes par le réseau (relevé de la carte du site actuel — à valider Etienne). */
const REGIONS_COUVERTES = new Set(["11", "24", "28", "32", "52", "53", "75", "76", "84"]);

function CarteReseau() {
  return (
    <svg
      viewBox={REGIONS_CARTE_VIEWBOX}
      role="img"
      aria-label="Carte des régions couvertes par le réseau France Carottage"
      className="mx-auto block w-full max-w-[430px] drop-shadow-[0_22px_34px_rgba(0,0,0,0.35)]"
    >
      {REGIONS_CARTE.map((r) =>
        REGIONS_COUVERTES.has(r.code) ? (
          <Link key={r.code} href="/zones" aria-label={`${r.nom} — voir nos zones d'intervention`}>
            <path
              d={r.d}
              className="cursor-pointer fill-[#f5eae8] stroke-[#8c161a] stroke-[1.6] transition-[fill] duration-200 hover:fill-white"
            >
              <title>{r.nom}</title>
            </path>
          </Link>
        ) : (
          <path key={r.code} d={r.d} className="fill-[#d49a9c] stroke-[#8c161a] stroke-[1.4]">
            <title>{`${r.nom} — hors réseau`}</title>
          </path>
        ),
      )}
      <circle cx={SIEGE_TOURS.x} cy={SIEGE_TOURS.y} r="9" fill="#8c161a" />
      <circle cx={SIEGE_TOURS.x} cy={SIEGE_TOURS.y} r="19" fill="none" stroke="#8c161a" strokeWidth="3" opacity=".55" />
      <text
        x={SIEGE_TOURS.x + 30}
        y={SIEGE_TOURS.y + 7}
        fontSize="27"
        fontWeight="700"
        fill="#fff"
        stroke="#5d1013"
        strokeWidth="6"
        strokeLinejoin="round"
        paintOrder="stroke"
      >
        Tours — siège
      </text>
    </svg>
  );
}

/**
 * Section réseau national — même composition que le site FC actuel (bande rouge,
 * contacts régionaux à gauche, carte des régions à droite) en exécution premium.
 */
export async function ReseauNationalFC() {
  const [villes, departements] = await Promise.all([loadVillesFC(), loadDepartementsFC()]);
  return (
    <section className="relative overflow-hidden border-t-[3px] border-[color:var(--fc-rouge)] bg-[linear-gradient(118deg,#a01d21_0%,#8c161a_55%,#6e1013_100%)]">
      {/* Halo lumineux côté carte */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(620px_420px_at_74%_42%,rgba(255,255,255,0.10),transparent_66%)]"
      />
      <div className="relative mx-auto grid max-w-[var(--container,1280px)] items-center gap-12 px-6 py-20 md:px-8 lg:grid-cols-[1fr_1.05fr]">
        <Reveal direction="left">
          <p className="inline-flex items-center gap-3 font-[family-name:var(--font-sora)] text-[12.5px] font-bold uppercase tracking-[0.2em] text-white/78">
            <span aria-hidden className="h-[2px] w-8 bg-white" />
            Réseau national
          </p>
          <h2 className="mt-4 font-[family-name:var(--font-sora)] text-[30px] font-extrabold leading-tight tracking-[-0.02em] text-white sm:text-[38px]">
            Le réseau France Carottage.
          </h2>
          <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-white/82">
            Né à Tours, un réseau d’opérateurs certifiés présent partout en France —{" "}
            {villes.length} villes, {departements.length} départements.
          </p>
          <ul className="mt-6 border-t border-white/30">
            {francecarottageConfig.antennes.map((a) => (
              <li key={a.zone} className="grid gap-0.5 border-b border-white/18 py-3">
                <span className="font-[family-name:var(--font-sora)] text-[10.5px] font-bold uppercase tracking-[0.14em] text-white/72">
                  {a.zone}
                </span>
                <a
                  href={a.telephoneHref}
                  className="w-fit font-[family-name:var(--font-sora)] text-[19px] font-extrabold text-white transition-colors hover:text-white/80"
                >
                  {a.telephone}
                </a>
              </li>
            ))}
          </ul>
          <p className="mt-5 font-[family-name:var(--font-sora)] text-[15px] font-bold text-white">
            Trouvez votre expert près de chez vous !
          </p>
          <Link
            href="/contact"
            className="mt-4 inline-block rounded-[4px] border border-white/45 px-5 py-3 font-[family-name:var(--font-sora)] text-[12px] font-extrabold uppercase tracking-[0.08em] text-white transition-colors hover:bg-white hover:text-[#8c161a]"
          >
            Adhérez au réseau
          </Link>
        </Reveal>
        <Reveal direction="right" delay={0.12}>
          <CarteReseau />
          <div className="mt-4 flex flex-wrap justify-center gap-x-6 gap-y-2">
            <span className="inline-flex items-center gap-2 text-[12px] text-white/85">
              <i aria-hidden className="h-3.5 w-3.5 rounded-[3px] border border-[#8c161a] bg-[#f5eae8]" />
              Régions couvertes par le réseau
            </span>
            <span className="inline-flex items-center gap-2 text-[12px] text-white/85">
              <i aria-hidden className="h-3.5 w-3.5 rounded-[3px] border border-[#8c161a] bg-[#d49a9c]" />
              Régions à pourvoir — adhérez au réseau
            </span>
          </div>
          <p className="mt-3 text-center text-[11.5px] text-white/72">
            Survolez ou cliquez une région claire pour trouver votre expert.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
