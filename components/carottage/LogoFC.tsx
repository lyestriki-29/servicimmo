import Image from "next/image";

/**
 * Logo France Carottage — vrai logo de marque (« FRANCE CAROTTAGE · ROUTIER »).
 * Source unique partagée par le header (fond clair) et le footer (fond noir),
 * pour ne pas laisser deux versions du logo diverger.
 *
 * Le PNG est RGBA transparent (285×80), texte noir + bande rouge :
 * - `tone="dark"`  : fond CLAIR (header) → logo tel quel.
 * - `tone="light"` : fond SOMBRE (footer) → posé sur une plaque claire, sinon le
 *   texte noir du logo disparaîtrait sur le noir.
 *
 * L'échelle se règle par la hauteur passée en `className` (ex. `h-9`) ; le ratio
 * est préservé (`w-auto`). `priority` réservé au header (au-dessus de la ligne
 * de flottaison) — pas au footer.
 */

type LogoTone = "dark" | "light";

export function LogoFC({
  tone = "dark",
  priority = false,
  className = "h-9",
}: {
  tone?: LogoTone;
  priority?: boolean;
  className?: string;
}) {
  const img = (
    <Image
      src="/img/carottage/logo.png"
      alt="France Carottage — carottage routier"
      width={285}
      height={80}
      priority={priority}
      className={`w-auto ${className}`}
    />
  );

  if (tone === "light") {
    return (
      <span className="inline-flex items-center rounded-[6px] bg-[color:var(--fc-blanc-casse)] px-3 py-2 shadow-[0_1px_0_rgba(255,255,255,0.08)]">
        {img}
      </span>
    );
  }
  return img;
}
