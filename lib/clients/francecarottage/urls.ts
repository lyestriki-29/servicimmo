/** Bases absolues des deux marques — pilotées par env (préprod → prod sans code). */
const CAROTTAGE_BASE = process.env.NEXT_PUBLIC_CAROTTAGE_URL ?? "https://www.france-carottage.fr";
const SERVICIMMO_BASE = process.env.NEXT_PUBLIC_SERVICIMMO_URL ?? "https://www.servicimmo.fr";

function joindre(base: string, path: string): string {
  if (!path || path === "/") return base;
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

export function carottageUrl(path = "/"): string {
  return joindre(CAROTTAGE_BASE, path);
}

export function servicimmoUrl(path = "/"): string {
  return joindre(SERVICIMMO_BASE, path);
}
