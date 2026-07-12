// scripts/lib/scrape-carottage.ts
/**
 * Scraping one-shot de l'ancien france-carottage.fr (même CMS que l'ancien servicimmo.fr).
 *   corepack pnpm scrape inventaire --site carottage
 *   corepack pnpm scrape extraction --site carottage
 * Jamais exécuté dans le build Next.
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import * as cheerio from "cheerio";
import matter from "gray-matter";
import TurndownService from "turndown";

import { DEPARTEMENTS } from "@/lib/clients/francecarottage/departements";
import { extraireDateFr, extraireHtmlPrincipal, geocoder } from "./extraction";
import { classifyUrlCarottage, type UrlCarotteeClassee } from "./classify-carottage";

const BASE = "https://www.france-carottage.fr";
const OUT = path.join(process.cwd(), "scripts", "out");
const CONTENT = path.join(process.cwd(), "content", "carottage");
const turndown = new TurndownService({ headingStyle: "atx" });
const attendre = (ms: number) => new Promise((r) => setTimeout(r, ms));

type Redirection = { source: string; destination: string };

async function chargerUrls(): Promise<UrlCarotteeClassee[]> {
  const res = await fetch(`${BASE}/sitemap.xml`);
  if (!res.ok) throw new Error(`sitemap FC HTTP ${res.status}`);
  const xml = await res.text();
  return [...xml.matchAll(/<loc>(.*?)<\/loc>/g)]
    .flatMap((m) => (m[1] ? [m[1]] : []))
    .map(classifyUrlCarottage);
}

export async function inventaireCarottage(): Promise<void> {
  const urls = await chargerUrls();
  const par = (t: UrlCarotteeClassee["type"]) => urls.filter((u) => u.type === t);
  const tableau = (liste: UrlCarotteeClassee[]) =>
    liste.map((u) => `| \`${u.chemin}\` | ${u.slugPropose}${u.codePostal ? ` (${u.codePostal})` : ""} |`).join("\n");

  const md = [
    `# Inventaire France Carottage — ${urls.length} URLs`,
    ...(["ville", "departement", "expertise", "structurelle", "inconnue"] as const).flatMap((t) => [
      `\n## ${t} (${par(t).length})\n`,
      "| Ancienne URL | Slug proposé |",
      "|---|---|",
      tableau(par(t)),
    ]),
    "\n## À valider au palier humain FC",
    "- Comptes plausibles : ~191 villes, ~57 départements, ~8 expertises.",
    "- Trancher la destination 301 de chaque URL `inconnue` (par défaut : accueil).",
  ].join("\n");

  await mkdir(OUT, { recursive: true });
  await writeFile(path.join(OUT, "inventaire-carottage.md"), md, "utf8");
  console.log(`inventaire-carottage.md écrit — ${urls.length} URLs classées`);
}

/** Code département à partir du code postal (2 chiffres ; 2A/2B pour la Corse). */
function departementDepuisCp(cp: string): string {
  if (cp.startsWith("20")) return Number(cp) < 20200 ? "2a" : "2b";
  if (cp.startsWith("97") || cp.startsWith("98")) return cp.slice(0, 3);
  return cp.slice(0, 2);
}

export async function extractionCarottage(): Promise<void> {
  const urls = await chargerUrls();
  const redirections: Redirection[] = [];
  const anomalies: string[] = [];

  for (const dossier of ["villes", "departements", "expertises"]) {
    await mkdir(path.join(CONTENT, dossier), { recursive: true });
  }

  let echecsConsecutifs = 0;

  for (const u of urls) {
    if (u.type === "structurelle" || u.type === "inconnue") continue;
    await attendre(300);
    const res = await fetch(`${BASE}${u.chemin}`, {
      headers: { "user-agent": "PropulseoScraper/1.0 (migration france-carottage.fr)" },
    });
    if (!res.ok) {
      anomalies.push(`HTTP ${res.status} — ${u.chemin}`);
      echecsConsecutifs += 1;
      if (echecsConsecutifs > 10) {
        throw new Error(`BLOCKED : >10 échecs HTTP consécutifs (dernier : ${u.chemin})`);
      }
      continue;
    }
    echecsConsecutifs = 0;
    const $ = cheerio.load(await res.text());
    const titre = $("h1").first().text().trim() || $("title").text().trim();
    const metaTitle = $("title").text().trim();
    const metaDescription = $('meta[name="description"]').attr("content")?.trim() ?? "";
    const corpsMd = turndown.turndown(extraireHtmlPrincipal($));
    if (corpsMd.length < 300) anomalies.push(`Extraction courte (<300 c) — ${u.chemin}`);

    if (u.type === "ville") {
      const cp = u.codePostal ?? "75000";
      const nomVille =
        titre.replace(/amiante|hap|enrob[ée]s?|carottage|routiers?/gi, "").trim() || u.slugPropose;
      const { lat, lng } = await geocoder(nomVille, cp);
      const fm = {
        slug: u.slugPropose,
        ville: nomVille,
        codePostal: cp,
        departement: departementDepuisCp(cp),
        metaTitle,
        metaDescription:
          metaDescription || `Carottage et repérage amiante/HAP sur enrobés à ${nomVille} (${cp}).`,
        anciennesUrls: [u.chemin],
        lat,
        lng,
        brut: true,
      };
      await writeFile(
        path.join(CONTENT, "villes", `${u.slugPropose}.md`),
        matter.stringify(corpsMd, fm),
        "utf8",
      );
      redirections.push({ source: u.chemin, destination: `/zones/${u.slugPropose}` });
    } else if (u.type === "departement") {
      const parSlug = DEPARTEMENTS.find((d) => d.slug === u.slugPropose);
      const fm = {
        slug: u.slugPropose,
        nom: parSlug?.nom ?? (titre.trim() || u.slugPropose),
        code: parSlug?.code ?? "00",
        villesPrincipales: [] as string[],
        metaTitle,
        metaDescription:
          metaDescription ||
          `Carottage et repérage amiante/HAP sur enrobés dans le département ${parSlug?.nom ?? u.slugPropose}.`,
        anciennesUrls: [u.chemin],
        brut: true,
      };
      if (!parSlug) anomalies.push(`Département hors table (code=00) — ${u.chemin}`);
      await writeFile(
        path.join(CONTENT, "departements", `${u.slugPropose}.md`),
        matter.stringify(corpsMd, fm),
        "utf8",
      );
      redirections.push({ source: u.chemin, destination: `/zones/${u.slugPropose}` });
    } else {
      const h1Texte = $("h1").first().text().trim();
      const infoDate = extraireDateFr(h1Texte);
      const fm: Record<string, unknown> = {
        slug: u.slugPropose,
        titre: (infoDate ? h1Texte.slice(0, infoDate.index) : h1Texte).replace(/[\s:–—-]+$/, "").trim() || titre,
        metaTitle,
        metaDescription: metaDescription || titre,
        anciennesUrls: [u.chemin],
        brut: true,
      };
      if (infoDate) fm["date"] = infoDate.date;
      await writeFile(
        path.join(CONTENT, "expertises", `${u.slugPropose}.md`),
        matter.stringify(corpsMd, fm),
        "utf8",
      );
      redirections.push({ source: u.chemin, destination: `/expertises/${u.slugPropose}` });
    }
  }

  // Structurelles (décision palier humain FC).
  redirections.push(
    { source: "/index.html", destination: "/" },
    { source: "/mentions-legales.html", destination: "/mentions-legales" },
  );

  await mkdir(path.join(process.cwd(), "lib", "seo"), { recursive: true });
  await writeFile(
    path.join(process.cwd(), "lib", "seo", "redirects-carottage.json"),
    JSON.stringify(redirections, null, 2),
    "utf8",
  );
  await writeFile(
    path.join(OUT, "rapport-extraction-carottage.md"),
    [
      `# Rapport extraction FC — ${redirections.length} redirections`,
      "",
      "## Anomalies",
      ...anomalies.map((a) => `- ${a}`),
    ].join("\n"),
    "utf8",
  );
  console.log(`Extraction FC finie : ${redirections.length} redirections, ${anomalies.length} anomalies`);
}
