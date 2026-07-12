/** Chargement des collections content/carottage/ — SERVEUR UNIQUEMENT (node:fs). */
import path from "node:path";

import { loadCollection } from "@/lib/content/load";
import {
  DepartementFrontmatterSchema,
  ExpertiseFrontmatterSchema,
  VilleCarottageFrontmatterSchema,
  type DepartementFC,
  type ExpertiseFC,
  type VilleFC,
} from "@/lib/content/schemas-carottage";

const CAROTTAGE_DIR = path.join(process.cwd(), "content", "carottage");

export async function loadVillesFC(baseDir: string = CAROTTAGE_DIR): Promise<VilleFC[]> {
  const villes = await loadCollection("villes", VilleCarottageFrontmatterSchema, baseDir);
  return villes.sort((a, b) => a.ville.localeCompare(b.ville, "fr"));
}

export async function getVilleFC(
  slug: string,
  baseDir: string = CAROTTAGE_DIR,
): Promise<VilleFC | null> {
  return (await loadVillesFC(baseDir)).find((v) => v.slug === slug) ?? null;
}

export async function loadDepartementsFC(
  baseDir: string = CAROTTAGE_DIR,
): Promise<DepartementFC[]> {
  const depts = await loadCollection("departements", DepartementFrontmatterSchema, baseDir);
  return depts.sort((a, b) => a.nom.localeCompare(b.nom, "fr"));
}

export async function getDepartementFC(
  slug: string,
  baseDir: string = CAROTTAGE_DIR,
): Promise<DepartementFC | null> {
  return (await loadDepartementsFC(baseDir)).find((d) => d.slug === slug) ?? null;
}

export async function loadExpertises(
  baseDir: string = CAROTTAGE_DIR,
): Promise<ExpertiseFC[]> {
  const exp = await loadCollection("expertises", ExpertiseFrontmatterSchema, baseDir);
  // Datées (plus récentes d'abord) avant non datées, puis alpha sur le slug.
  return exp.sort((a, b) => {
    if (a.date && b.date) return b.date.localeCompare(a.date);
    if (a.date) return -1;
    if (b.date) return 1;
    return a.slug.localeCompare(b.slug, "fr");
  });
}

export async function getExpertise(
  slug: string,
  baseDir: string = CAROTTAGE_DIR,
): Promise<ExpertiseFC | null> {
  return (await loadExpertises(baseDir)).find((e) => e.slug === slug) ?? null;
}
