import Image from "next/image";
import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";

import { SurtitreFC } from "@/components/carottage/SurtitreFC";
import { loadDepartementsFC, loadVillesFC } from "@/lib/content/load-carottage";

/**
 * Métropoles repères — positions en % calculées par projection équirectangulaire
 * dans la viewBox 4:5 de france-silhouette.svg (script scratchpad gen-france-svg.mjs,
 * même source geojson que FC1). Purement décoratif.
 */
const REPERES: { ville: string; top: number; left: number }[] = [
  { ville: "Lille", top: 15.1, left: 55.8 },
  { ville: "Paris", top: 29.1, left: 51.0 },
  { ville: "Strasbourg", top: 31.4, left: 87.7 },
  { ville: "Rennes", top: 35.0, left: 23.6 },
  { ville: "Tours", top: 40.7, left: 39.6 },
  { ville: "Lyon", top: 53.5, left: 67.9 },
  { ville: "Bordeaux", top: 60.8, left: 31.0 },
  { ville: "Toulouse", top: 70.6, left: 44.8 },
  { ville: "Marseille", top: 73.0, left: 71.5 },
];

/** Section réseau national FC — silhouette France + points pulsés rouges, compteurs réels. */
export async function ReseauNationalFC() {
  const [villes, departements] = await Promise.all([loadVillesFC(), loadDepartementsFC()]);
  return (
    <section className="mx-auto max-w-[var(--container,1280px)] px-6 py-20 md:px-8">
      <div className="grid items-center gap-12 lg:grid-cols-2">
        <div>
          <SurtitreFC>Réseau national</SurtitreFC>
          <h2 className="mt-4 font-[family-name:var(--font-sora)] text-[30px] font-extrabold leading-tight tracking-[-0.02em] text-[color:var(--fc-noir)] sm:text-[38px]">
            Une équipe qui se déplace partout en France.
          </h2>
          <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-[color:var(--fc-gris)]">
            Basés à Tours, nous intervenons sur l'ensemble du territoire : {villes.length} villes et{" "}
            {departements.length} départements couverts, avec des délais maîtrisés pour ne pas bloquer
            vos chantiers.
          </p>
          <Link
            href="/zones"
            className="mt-7 inline-flex items-center gap-2 font-[family-name:var(--font-sora)] text-[14px] font-bold text-[color:var(--fc-rouge)] hover:gap-3"
          >
            Voir toutes les zones
            <ArrowRightIcon className="h-4 w-4 transition-all" aria-hidden />
          </Link>
        </div>
        <div className="relative mx-auto aspect-[4/5] w-full max-w-[420px]">
          <Image
            src="/img/carottage/france-silhouette.svg"
            alt="Carte de France — zone d'intervention nationale"
            fill
            className="object-contain opacity-90"
          />
          {REPERES.map((r) => (
            <span
              key={r.ville}
              className="absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[color:var(--fc-rouge)] ring-4 ring-[color:var(--fc-rouge)]/20"
              style={{ top: `${r.top}%`, left: `${r.left}%` }}
              title={r.ville}
              aria-hidden
            />
          ))}
        </div>
      </div>
    </section>
  );
}
