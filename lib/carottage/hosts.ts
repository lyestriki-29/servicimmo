/**
 * Détection des hosts France Carottage — pilotée par env, consommée par le
 * middleware pour router (jamais) et par le reste du code pour les liens.
 */

/** Liste des hosts (sans port) reconnus comme France Carottage. */
function hostsCarottage(): string[] {
  return (process.env.NEXT_PUBLIC_CAROTTAGE_HOSTS ?? "")
    .split(",")
    .map((h) => h.trim().toLowerCase())
    .filter(Boolean);
}

/** Normalise un header Host (retire le port) et teste l'appartenance à FC. */
export function estHostCarottage(host: string | null | undefined): boolean {
  if (!host) return false;
  const sansPort = host.split(":")[0]?.toLowerCase() ?? "";
  return hostsCarottage().includes(sansPort);
}
