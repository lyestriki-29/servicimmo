/**
 * One-shot : génère lib/clients/francecarottage/regions-carte.ts — contours SVG
 * des 13 régions métropole projetés dans une viewBox 4:5 (800×1000), pour la
 * carte de la section « Réseau national » de la home FC. Jamais exécuté au build.
 *   corepack pnpm build:regions
 *
 * Source des contours : GeoJSON communautaire "France GeoJSON" (dérivé
 * IGN/data.gouv.fr, licence libre) — même source que build-departements.
 * Projection : équirectangulaire corrigée en latitude moyenne, bbox métropole,
 * padding à un ratio 4:5 exact (identique à la silhouette FC1/FC2).
 */
import { writeFile } from "node:fs/promises";
import path from "node:path";

const BASE = "https://raw.githubusercontent.com/gregoiredavid/france-geojson/master";
const METRO_CODES = new Set(["11", "24", "27", "28", "32", "44", "52", "53", "75", "76", "84", "93", "94"]);
const TOURS_LATLNG: [number, number] = [47.3936, 0.6848];

type Ring = number[][];
type Geometry = { type: string; coordinates: Ring[][] | Ring[][][] };
type Feature = { properties: { code: string; nom: string }; geometry: Geometry };

function polysDe(geometry: Geometry): Ring[][] {
  return geometry.type === "MultiPolygon"
    ? (geometry.coordinates as Ring[][][]).map((p) => p)
    : [geometry.coordinates as Ring[][]];
}

/** metropole.geojson est une Feature seule ; regions.geojson une FeatureCollection. */
async function chargerFeatures(fichier: string): Promise<Feature[]> {
  const res = await fetch(`${BASE}/${fichier}`);
  if (!res.ok) throw new Error(`fetch ${fichier} : ${res.status}`);
  const geo = (await res.json()) as { features?: Feature[] } & Feature;
  return geo.features ?? [geo];
}

async function main(): Promise<void> {
  const metro = await chargerFeatures("metropole.geojson");
  const regionsFeatures = await chargerFeatures("regions.geojson");

  // bbox et projection IDENTIQUES à la silhouette (public/img/carottage/france-silhouette.svg)
  const metroRings = polysDe(metro[0]!.geometry).map((p) => p[0]!);
  const lats = metroRings.flat().map(([, la]) => la!);
  const meanLat = lats.reduce((a, b) => a + b, 0) / lats.length;
  const k = Math.cos((meanLat * Math.PI) / 180);
  const proj = ([lon, lat]: number[]): [number, number] => [lon! * k, -lat!];

  let minX = 1e9;
  let maxX = -1e9;
  let minY = 1e9;
  let maxY = -1e9;
  for (const ring of metroRings) {
    for (const pt of ring) {
      const [x, y] = proj(pt);
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }
  let w = maxX - minX;
  let h = maxY - minY;
  const TARGET = 4 / 5;
  if (w / h > TARGET) {
    const nh = w / TARGET;
    minY -= (nh - h) / 2;
    h = nh;
  } else {
    const nw = h * TARGET;
    minX -= (nw - w) / 2;
    w = nw;
  }
  const S = 800 / w;
  const sx = (x: number) => (x - minX) * S;
  const sy = (y: number) => (y - minY) * S;
  const EPS = 2.2; // px — décimation (silhouette, pas de précision géodésique)

  function cheminSvg(polys: Ring[][]): string {
    let d = "";
    for (const poly of polys) {
      let last: [number, number] | null = null;
      let seg = "";
      let count = 0;
      for (const pt of poly[0]!) {
        const [px, py] = proj(pt);
        const x = sx(px);
        const y = sy(py);
        if (last && Math.hypot(x - last[0], y - last[1]) < EPS) continue;
        seg += `${last ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`;
        last = [x, y];
        count++;
      }
      if (count > 8) d += `${seg}Z`;
    }
    return d;
  }

  const retenues = regionsFeatures.filter((f) => METRO_CODES.has(f.properties.code));
  const lignes = retenues.map((f) => {
    const d = cheminSvg(polysDe(f.geometry));
    return `  { code: "${f.properties.code}", nom: ${JSON.stringify(f.properties.nom)}, d: "${d}" },`;
  });

  const [tx, ty] = proj([TOURS_LATLNG[1], TOURS_LATLNG[0]]);
  const tours = { x: +sx(tx).toFixed(1), y: +sy(ty).toFixed(1) };

  const contenu = `/**
 * Contours SVG des 13 régions métropole (généré par scripts/build-regions-carottage.ts).
 * ViewBox 800×1000 (ratio 4:5), projection identique à la silhouette FC.
 * NE PAS éditer à la main : relancer \`corepack pnpm build:regions\`.
 */
export type RegionCarte = { code: string; nom: string; d: string };

export const REGIONS_CARTE_VIEWBOX = "0 0 800 1000";

/** Position projetée du siège (Tours) dans la viewBox. */
export const SIEGE_TOURS = { x: ${tours.x}, y: ${tours.y} };

export const REGIONS_CARTE: RegionCarte[] = [
${lignes.join("\n")}
];
`;

  const cible = path.join(process.cwd(), "lib/clients/francecarottage/regions-carte.ts");
  await writeFile(cible, contenu);
  console.log(`Écrit ${cible} (${retenues.length} régions, Tours ${tours.x},${tours.y})`);
}

void main();
