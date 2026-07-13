/** Placeholder socle FC1 — remplacé par la home réelle en FC2. */
export default function CarottageHomePlaceholder() {
  return (
    <section className="mx-auto max-w-[var(--container,1280px)] px-6 py-24 md:px-8">
      <p className="font-[family-name:var(--font-sora)] text-[13px] font-semibold uppercase tracking-[0.18em] text-[color:var(--fc-rouge)]">
        France Carottage
      </p>
      <h1 className="mt-3 font-[family-name:var(--font-sora)] text-[40px] font-extrabold leading-[1.05] text-[color:var(--fc-noir)] sm:text-[56px]">
        Socle multi-domaines en place.
      </h1>
      <p className="mt-4 max-w-xl text-[15.5px] leading-relaxed text-[color:var(--fc-gris)]">
        Home, expertises et zones arrivent dans les tranches suivantes.
      </p>
    </section>
  );
}
