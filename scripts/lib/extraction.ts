/** Extraction one-shot : HTML ancien site → Markdown bruts + redirections. */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import * as cheerio from "cheerio";
import matter from "gray-matter";
import TurndownService from "turndown";

import { classifyUrl, type UrlClassee } from "./classify";

const BASE = "https://www.servicimmo.fr";
const OUT = path.join(process.cwd(), "scripts", "out");
const CONTENT = path.join(process.cwd(), "content");
const turndown = new TurndownService({ headingStyle: "atx" });
const attendre = (ms: number) => new Promise((r) => setTimeout(r, ms));

type Redirection = { source: string; destination: string };

function extraireHtmlPrincipal($: cheerio.CheerioAPI): string {
  // L'ancien site n'utilise aucune balise sémantique <header>/<nav>/<footer> : tout est
  // imbriqué dans un seul <div class="site_wrapper">, et la vraie nav est un
  // <div class="navbar navbar-default yamm">. Sans ce sélecteur, le fallback "plus gros
  // bloc textuel" récupérait la page entière (nav comprise) au lieu de l'article — d'où
  // le ".navbar" ajouté ici (vérifié sur un exemple ville / article / service).
  $("header, nav, footer, script, style, iframe, .navbar").remove();
  // ".section_category13" est le conteneur de contenu réel sur ce CMS (constaté sur les
  // 3 types de page) : on lui fait confiance sans seuil de longueur — contrairement aux
  // sélecteurs génériques ci-dessous (qui, eux, peuvent capter un fragment décoratif sans
  // rapport), il ne contient jamais la nav/le footer. Sans ce traitement à part, une page
  // à contenu court (ex: page presque uniquement composée d'images) retombait sur le
  // fallback "plus gros bloc" et récupérait la barre de contact + le footer du site.
  const principal = $(".section_category13").first();
  if (principal.length) return principal.html() ?? "";
  for (const sel of ["#contenu", "#content", ".contenu", ".content", "main"]) {
    const el = $(sel).first();
    if (el.length && el.text().trim().length > 400) return el.html() ?? "";
  }
  // fallback : plus gros bloc textuel de la page (site en tableaux)
  let meilleur = "";
  let taille = 0;
  $("td, div, article").each((_, el) => {
    const t = $(el).text().trim();
    if (t.length > taille) {
      taille = t.length;
      meilleur = $(el).html() ?? "";
    }
  });
  return meilleur;
}

async function geocoder(ville: string, cp: string): Promise<{ lat: number; lng: number }> {
  const url = `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(ville)}&postcode=${cp}&type=municipality&limit=1`;
  const json = (await (await fetch(url)).json()) as {
    features?: { geometry: { coordinates: [number, number] } }[];
  };
  const c = json.features?.[0]?.geometry.coordinates;
  return c ? { lat: c[1], lng: c[0] } : { lat: 47.394, lng: 0.687 }; // fallback : Tours
}

// Sur l'ancien site, la date d'un article (série "-aN") est accolée en fin de <h1>
// (« Titre … - 25/09/2018 »), jamais ailleurs dans le corps de la page. Chercher la
// date sur le texte entier de la page (body) accroche à tort des numéros de téléphone
// ("02 47 47 01 23" → faux match "47/47/0123") : on ne cherche donc QUE dans le <h1>.
// Les articles de la série historique "-iN" n'ont aucune date affichée sur le site
// (ni sur la page, ni sur la page listing /actualites.php) : `null` y est légitime.
function extraireDateFr(texte: string): { date: string; index: number } | null {
  const m = texte.match(/(\d{1,2})[/. ](\d{1,2}|[a-zûé]+)[/. ](\d{4})/i);
  if (!m?.[1] || !m[3] || m.index === undefined) return null;
  const mois = [
    "janvier", "février", "mars", "avril", "mai", "juin",
    "juillet", "août", "septembre", "octobre", "novembre", "décembre",
  ];
  const num = /^\d+$/.test(m[2] ?? "") ? Number(m[2]) : mois.indexOf((m[2] ?? "").toLowerCase()) + 1;
  if (num < 1 || num > 12) return null;
  return {
    date: `${m[3]}-${String(num).padStart(2, "0")}-${String(Number(m[1])).padStart(2, "0")}`,
    index: m.index,
  };
}

export async function extraction(): Promise<void> {
  const mapping = JSON.parse(
    await readFile(path.join(OUT, "mapping-services.json"), "utf8"),
  ) as Record<string, string>;

  const xml = await (await fetch(`${BASE}/sitemap.xml`)).text();
  const urls = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)]
    .flatMap((m) => (m[1] ? [m[1]] : []))
    .map(classifyUrl);

  const redirections: Redirection[] = [];
  const anomalies: string[] = [];
  const dejaVus = new Map<string, UrlClassee[]>(); // slug final → anciennes URLs (services fusionnés)

  for (const dossier of ["services", "villes", "articles"]) {
    await mkdir(path.join(CONTENT, dossier), { recursive: true });
  }

  let echecsConsecutifs = 0;

  for (const u of urls) {
    if (u.type === "structurelle" || u.type === "inconnue") continue;
    await attendre(300);
    const res = await fetch(`${BASE}${u.chemin}`, {
      headers: { "user-agent": "PropulseoScraper/1.0 (migration servicimmo.fr)" },
    });
    if (!res.ok) {
      anomalies.push(`HTTP ${res.status} — ${u.chemin}`);
      echecsConsecutifs += 1;
      if (echecsConsecutifs > 10) {
        throw new Error(
          `BLOCKED : plus de 10 échecs HTTP consécutifs (dernier : ${u.chemin}, HTTP ${res.status})`,
        );
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
      const cp = u.chemin.match(/-(\d{5})\.html$/)?.[1] ?? "37000";
      const nomVille = titre.replace(/diagnostic immobilier/i, "").trim() || u.slugPropose;
      const { lat, lng } = await geocoder(nomVille, cp);
      const fm = {
        slug: u.slugPropose, ville: nomVille, codePostal: cp,
        metaTitle, metaDescription: metaDescription || `Diagnostic immobilier à ${nomVille} (${cp}).`,
        anciennesUrls: [u.chemin], lat, lng, brut: true,
      };
      await writeFile(path.join(CONTENT, "villes", `${u.slugPropose}.md`), matter.stringify(corpsMd, fm), "utf8");
      redirections.push({ source: u.chemin, destination: `/zones/${u.slugPropose}` });
    } else if (u.type === "article") {
      const h1Texte = $("h1").first().text().trim();
      const infoDate = extraireDateFr(h1Texte);
      const date = infoDate?.date ?? "2017-01-01";
      if (!infoDate) anomalies.push(`Date introuvable (défaut 2017-01-01) — ${u.chemin}`);
      // Titre nettoyé : on retire le suffixe date du <h1> (« Titre - DD/MM/YYYY »)
      // pour ne pas polluer le frontmatter avec la date en toutes lettres.
      const titreArticle =
        (infoDate ? h1Texte.slice(0, infoDate.index) : h1Texte).replace(/[\s:–—-]+$/, "").trim() || titre;
      const fm = {
        slug: u.slugPropose, titre: titreArticle, date,
        metaTitle, metaDescription: metaDescription || titreArticle,
        anciennesUrls: [u.chemin], extrait: metaDescription || titreArticle, archive: false, brut: true,
      };
      await writeFile(path.join(CONTENT, "articles", `${u.slugPropose}.md`), matter.stringify(corpsMd, fm), "utf8");
      redirections.push({ source: u.chemin, destination: `/actualites/${u.slugPropose}` });
    } else {
      const slugFinal = mapping[u.slugPropose] ?? u.slugPropose;
      redirections.push({ source: u.chemin, destination: `/services/${slugFinal}` });
      const existants = dejaVus.get(slugFinal) ?? [];
      dejaVus.set(slugFinal, [...existants, u]);
      if (existants.length > 0) continue; // fusion : on garde le contenu de la 1re URL
      const fm = {
        slug: slugFinal, titre, metaTitle,
        metaDescription: metaDescription || titre,
        anciennesUrls: [u.chemin], ordre: 99, icone: "file-text",
        extrait: (metaDescription || titre).slice(0, 140), obligatoirePour: [], brut: true,
      };
      await writeFile(path.join(CONTENT, "services", `${slugFinal}.md`), matter.stringify(corpsMd, fm), "utf8");
    }
  }

  // Fusion services : reporter toutes les anciennes URLs dans le frontmatter
  for (const [slugFinal, sources] of dejaVus) {
    if (sources.length < 2) continue;
    const fichier = path.join(CONTENT, "services", `${slugFinal}.md`);
    const { data, content } = matter(await readFile(fichier, "utf8"));
    data["anciennesUrls"] = sources.map((s) => s.chemin);
    await writeFile(fichier, matter.stringify(content, data), "utf8");
  }

  // Overrides de redirection (palier humain 1) : certaines anciennes pages "dpe-<ville>"
  // doivent pointer vers la fiche zone /zones/<ville> plutôt que vers /services/dpe,
  // car elles correspondaient en réalité à une page de zone de chalandise et non au
  // service DPE générique. Voir scripts/out/redirects-overrides.json.
  const overrides = JSON.parse(
    await readFile(path.join(OUT, "redirects-overrides.json"), "utf8"),
  ) as Record<string, string>;
  for (const r of redirections) {
    const destinationOverride = overrides[r.source];
    if (destinationOverride) r.destination = destinationOverride;
  }

  // Redirections structurelles : décidées au palier humain 1, aucune URL "inconnue" à traiter.
  redirections.push(
    { source: "/index.html", destination: "/" },
    { source: "/contact.html", destination: "/contact" },
    { source: "/mentions-legales.html", destination: "/mentions-legales" },
    { source: "/cgv.html", destination: "/cgv" },
    { source: "/demande-devis.php", destination: "/devis" },
  );

  await mkdir(path.join(process.cwd(), "lib", "seo"), { recursive: true });
  await writeFile(
    path.join(process.cwd(), "lib", "seo", "redirects.json"),
    JSON.stringify(redirections, null, 2),
    "utf8",
  );
  await writeFile(
    path.join(OUT, "rapport-extraction.md"),
    [`# Rapport extraction — ${redirections.length} redirections`, "", "## Anomalies", ...anomalies.map((a) => `- ${a}`)].join("\n"),
    "utf8",
  );
  console.log(`Extraction finie : ${redirections.length} redirections, ${anomalies.length} anomalies`);
}
