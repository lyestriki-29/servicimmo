/**
 * One-shot : génère lib/clients/francecarottage/departements.ts (101 départements
 * métropole + DOM). Le centroïde est approché par la moyenne des points du
 * contour — largement suffisant pour poser un marqueur de carte. Jamais exécuté
 * dans le build Next.
 *   corepack pnpm build:departements
 *
 * Source des contours : le plan visait `geo.api.gouv.fr/departements?fields=…,contour`,
 * mais l'API officielle a retiré le champ `contour` pour /departements (vérifié le
 * 2026-07-12 : le endpoint ne supporte plus que nom/code/codeRegion/region/zone/chefLieu,
 * cf. définition OpenAPI https://github.com/datagouv/api-geo — la géométrie n'est
 * conservée que pour /communes). Bascule sur le GeoJSON contours communautaire
 * "France GeoJSON" (dérivé IGN/data.gouv.fr, licence libre) qui fournit encore les
 * 101 tracés métropole + DOM avec la même forme Polygon/MultiPolygon.
 */
import { writeFile } from "node:fs/promises";
import path from "node:path";

const SOURCE_URL =
  "https://raw.githubusercontent.com/gregoiredavid/france-geojson/master/departements-avec-outre-mer.geojson";

type Contour = { coordinates: number[][][] | number[][][][]; type: string };
type DeptFeature = { properties: { code: string; nom: string }; geometry: Contour };
type DeptGeoJson = { type: string; features: DeptFeature[] };

function slugify(nom: string): string {
  return nom
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/['’]/g, "-")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function centroide(contour: Contour): { lat: number; lng: number } {
  // Aplati Polygon (number[][][]) ou MultiPolygon (number[][][][]) en liste de [lng, lat].
  const points: number[][] = [];
  const walk = (node: unknown): void => {
    if (
      Array.isArray(node) &&
      node.length === 2 &&
      typeof node[0] === "number" &&
      typeof node[1] === "number"
    ) {
      points.push(node as number[]);
      return;
    }
    if (Array.isArray(node)) for (const child of node) walk(child);
  };
  walk(contour.coordinates);
  const somme = points.reduce(
    (acc, [lng, lat]) => ({ lng: acc.lng + (lng ?? 0), lat: acc.lat + (lat ?? 0) }),
    { lng: 0, lat: 0 },
  );
  const n = points.length || 1;
  return { lat: +(somme.lat / n).toFixed(4), lng: +(somme.lng / n).toFixed(4) };
}

async function main(): Promise<void> {
  const res = await fetch(SOURCE_URL);
  if (!res.ok) throw new Error(`france-geojson HTTP ${res.status}`);
  const geojson = (await res.json()) as DeptGeoJson;
  const lignes = geojson.features
    .map((f) => ({ code: f.properties.code, nom: f.properties.nom, contour: f.geometry }))
    .sort((a, b) => a.code.localeCompare(b.code, "fr"))
    .map((d) => {
      const { lat, lng } = centroide(d.contour);
      return `  { code: "${d.code}", nom: ${JSON.stringify(d.nom)}, slug: "${slugify(d.nom)}", lat: ${lat}, lng: ${lng} },`;
    });

  const contenu = `/**
 * Table statique des départements français (généré par scripts/build-departements-carottage.ts).
 * Centroïdes approchés (moyenne du contour) — usage : marqueurs carte + lookup parent d'une ville.
 * NE PAS éditer à la main : relancer le générateur.
 */
export type Departement = { code: string; nom: string; slug: string; lat: number; lng: number };

export const DEPARTEMENTS: Departement[] = [
${lignes.join("\n")}
];

const PAR_CODE = new Map(DEPARTEMENTS.map((d) => [d.code, d]));

/** Retourne le département par code INSEE (ex: "45", "2a"), insensible à la casse. */
export function getDepartement(code: string): Departement | undefined {
  return PAR_CODE.get(code.toLowerCase()) ?? PAR_CODE.get(code.toUpperCase()) ?? PAR_CODE.get(code);
}
`;
  await writeFile(
    path.join(process.cwd(), "lib", "clients", "francecarottage", "departements.ts"),
    contenu,
    "utf8",
  );
  console.log(`departements.ts écrit — ${lignes.length} départements`);
}

void main();
