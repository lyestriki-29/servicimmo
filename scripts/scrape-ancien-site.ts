/**
 * Script one-shot — aspiration de l'ancien servicimmo.fr.
 * Usage :
 *   corepack pnpm scrape inventaire   → scripts/out/inventaire.md + mapping-services.json (brouillon)
 *   corepack pnpm scrape extraction   → content/** bruts + lib/seo/redirects.json + rapport
 * Jamais exécuté dans le build Next.
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { classifyUrl, type UrlClassee } from "./lib/classify";

const SITEMAP = "https://www.servicimmo.fr/sitemap.xml";
const OUT_DIR = path.join(process.cwd(), "scripts", "out");

async function chargerUrls(): Promise<string[]> {
  const res = await fetch(SITEMAP);
  if (!res.ok) throw new Error(`sitemap HTTP ${res.status}`);
  const xml = await res.text();
  return [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].flatMap((m) => (m[1] ? [m[1]] : []));
}

function tableau(urls: UrlClassee[]): string {
  return urls.map((u) => `| \`${u.chemin}\` | ${u.slugPropose} |`).join("\n");
}

async function inventaire(): Promise<void> {
  const urls = (await chargerUrls()).map(classifyUrl);
  const par = (t: UrlClassee["type"]) => urls.filter((u) => u.type === t);

  const md = [
    `# Inventaire ancien site — ${urls.length} URLs`,
    ...(["ville", "article", "service", "structurelle", "inconnue"] as const).flatMap((t) => [
      `\n## ${t} (${par(t).length})\n`,
      "| Ancienne URL | Slug proposé |",
      "|---|---|",
      tableau(par(t)),
    ]),
    "\n## À faire au palier humain",
    "- Fusionner les slugs services dupliqués dans `mapping-services.json` (cible : 21 pages).",
    "- Décider une destination 301 pour chaque URL `inconnue`.",
  ].join("\n");

  await mkdir(OUT_DIR, { recursive: true });
  await writeFile(path.join(OUT_DIR, "inventaire.md"), md, "utf8");

  // Brouillon de mapping service : identité, à retoucher à la main.
  const mapping = Object.fromEntries(par("service").map((u) => [u.slugPropose, u.slugPropose]));
  await writeFile(
    path.join(OUT_DIR, "mapping-services.json"),
    JSON.stringify(mapping, null, 2),
    "utf8",
  );
  console.log(`inventaire.md écrit — ${urls.length} URLs classées`);
}

async function main(): Promise<void> {
  const mode = process.argv[2];
  if (mode === "inventaire") {
    await inventaire();
  } else if (mode === "extraction") {
    const { extraction } = await import("./lib/extraction");
    await extraction();
  } else {
    console.error("Usage : pnpm scrape <inventaire|extraction>");
    process.exit(1);
  }
}

void main();
