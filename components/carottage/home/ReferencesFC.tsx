import Image from "next/image";

/** Logos récupérés du site FC actuel (210×91). Ordre : grands comptes d'abord. */
const REFERENCES = [
  { fichier: "eiffage", nom: "Eiffage" },
  { fichier: "engie", nom: "Engie" },
  { fichier: "suez", nom: "Suez" },
  { fichier: "foncia", nom: "Foncia" },
  { fichier: "laforet", nom: "Laforêt" },
  { fichier: "sturno", nom: "Sturno" },
  { fichier: "exeo", nom: "Exeo" },
  { fichier: "hades", nom: "Hadès" },
  { fichier: "mageo", nom: "Mageo" },
  { fichier: "comp-geo", nom: "Compagnie de Géotechnique" },
  { fichier: "phi3", nom: "Phi 3" },
  { fichier: "art", nom: "ART" },
  { fichier: "cdc", nom: "Communauté de communes" },
  { fichier: "cdc-chinon", nom: "CC Chinon Vienne et Loire" },
  { fichier: "touraine", nom: "Touraine" },
  { fichier: "joue", nom: "Joué-lès-Tours" },
  { fichier: "montlouis", nom: "Montlouis-sur-Loire" },
  { fichier: "chisseaux", nom: "Chisseaux" },
  { fichier: "vigneux", nom: "Vigneux" },
  { fichier: "villbarou", nom: "Villebarou" },
] as const;

function GroupeLogos({ masque = false }: { masque?: boolean }) {
  return (
    <div aria-hidden={masque || undefined} className="flex shrink-0 items-center gap-11 pr-11">
      {REFERENCES.map((r) => (
        <Image
          key={r.fichier}
          src={`/img/carottage/refs/${r.fichier}.jpg`}
          alt={masque ? "" : r.nom}
          title={r.nom}
          width={210}
          height={91}
          className="h-11 w-auto opacity-70 grayscale transition-all duration-[250ms] hover:opacity-100 hover:grayscale-0"
        />
      ))}
    </div>
  );
}

/** Bandeau défilant des références clients (marquee, pause au survol et en reduced-motion). */
export function ReferencesFC() {
  return (
    <section aria-label="Ils nous font confiance" className="border-b border-[color:var(--fc-gris-clair)] bg-white py-8">
      <p className="mb-5 text-center font-[family-name:var(--font-sora)] text-[11.5px] font-bold uppercase tracking-[0.14em] text-[color:var(--fc-gris)]">
        Ils font analyser leurs chantiers par nos équipes
      </p>
      <div className="fc-marquee overflow-hidden">
        <div className="fc-marquee-track">
          <GroupeLogos />
          <GroupeLogos masque />
        </div>
      </div>
    </section>
  );
}
