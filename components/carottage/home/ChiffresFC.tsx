import { Reveal } from "@/components/marketing/Reveal";
import { loadDepartementsFC, loadVillesFC } from "@/lib/content/load-carottage";

/** Bandeau chiffres FC — fond blanc, valeurs massives, compteurs réels depuis content/. */
export async function ChiffresFC() {
  const [villes, departements] = await Promise.all([loadVillesFC(), loadDepartementsFC()]);
  const chiffres = [
    { valeur: String(villes.length), label: "villes couvertes" },
    { valeur: String(departements.length), label: "départements" },
    { valeur: "24-48 h", label: "délai d'intervention" },
    { valeur: "100 %", label: "laboratoire accrédité" },
  ] as const;

  return (
    <section className="border-y border-[color:var(--fc-gris-clair)] bg-white">
      <div className="mx-auto grid max-w-[var(--container,1280px)] grid-cols-2 gap-8 px-6 py-14 md:grid-cols-4 md:px-8">
        {chiffres.map((c, i) => (
          <Reveal key={c.label} delay={Math.min(i * 0.06, 0.18)}>
            <div>
              <p className="font-[family-name:var(--font-sora)] text-[38px] font-extrabold leading-none text-[color:var(--fc-noir)]">
                {c.valeur}
                <span className="text-[color:var(--fc-rouge)]">.</span>
              </p>
              <p className="mt-2 text-[13.5px] font-semibold uppercase tracking-wide text-[color:var(--fc-gris)]">
                {c.label}
              </p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
