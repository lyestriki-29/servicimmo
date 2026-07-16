/**
 * Données partagées des trois maquettes du contre-projet « direction G ».
 * G2/G3 restent des démos mono-ville (Amboise). G1 démontre le passage à
 * l'échelle : archétypes de bâti annotés UNE FOIS, villes rattachées par donnée.
 */

export const AMBOISE = {
  nom: "Amboise",
  codePostal: "37400",
  distanceKm: 25,
  delai: "48 h",
  communesVoisines: ["Montlouis-sur-Loire", "Nazelles-Négron", "Pocé-sur-Cisse", "Chargé", "Bléré"],
} as const;

export type Observation = {
  id: string;
  label: string;
  detail: string;
  top: string;
  left: string;
};

export type PhotoAnnotee = {
  src: string;
  alt: string;
  /** Épingles calées une fois pour toutes sur cette photo, en panneau 4/3. */
  pins: Observation[];
};

/**
 * Les panneaux annotés réutilisables. C'est ici que vit le coût éditorial :
 * 3 photos, 8 épingles — écrits une fois, servis à toutes les villes.
 */
export const PHOTOS_ANNOTEES: Record<string, PhotoAnnotee> = {
  colombage: {
    src: "/img/si/claude/amboise-colombage.jpg",
    alt: "Maisons à pans de bois d’un cœur historique tourangeau",
    pins: [
      {
        id: "01",
        label: "Ardoise moussue",
        detail: "Vieillissement de toiture — à lire avant vente",
        top: "8%",
        left: "48%",
      },
      {
        id: "02",
        label: "Lucarne d’origine",
        detail: "Menuiseries anciennes — déperditions DPE",
        top: "20%",
        left: "28%",
      },
      {
        id: "03",
        label: "Pans de bois",
        detail: "Structure colombage — lecture avant travaux",
        top: "48%",
        left: "16%",
      },
    ],
  },
  tuffeau: {
    src: "/img/si/claude/amboise-tuffeau.jpg",
    alt: "Façade en tuffeau sculpté, pierre érodée et volets récents",
    pins: [
      {
        id: "01",
        label: "Tuffeau sculpté",
        detail: "Érosion, humidité — la pierre dit son âge",
        top: "38%",
        left: "46%",
      },
      {
        id: "02",
        label: "Volets récents, bâti ancien",
        detail: "Rénovations mixtes — contrôles ciblés",
        top: "62%",
        left: "52%",
      },
    ],
  },
  pavillon: {
    src: "/img/si/proj1.jpg",
    alt: "Pavillon à toiture d’ardoise caractéristique des communes résidentielles",
    pins: [
      {
        id: "01",
        label: "Toiture ardoise",
        detail: "Charpente et couverture — état avant vente",
        top: "12%",
        left: "50%",
      },
      {
        id: "02",
        label: "Lucarnes et combles",
        detail: "Isolation — poste clé de la classe DPE",
        top: "28%",
        left: "30%",
      },
      {
        id: "03",
        label: "Menuiseries",
        detail: "Simple vitrage fréquent — déperditions",
        top: "62%",
        left: "28%",
      },
    ],
  },
};

export type ArchetypeBati = {
  /** Libellé affiché (« archétype : cœur historique »). */
  label: string;
  hero: keyof typeof PHOTOS_ANNOTEES;
  matiere: keyof typeof PHOTOS_ANNOTEES;
};

/** En prod : champ `archetype` dans le frontmatter de chaque fiche ville. */
export const ARCHETYPES: Record<string, ArchetypeBati> = {
  "coeur-historique": { label: "Cœur historique", hero: "colombage", matiere: "tuffeau" },
  "bourg-pierre": { label: "Bourg en pierre", hero: "tuffeau", matiere: "colombage" },
  pavillonnaire: { label: "Communes résidentielles", hero: "pavillon", matiere: "tuffeau" },
};

export type VilleG1 = {
  id: string;
  nom: string;
  codePostal: string;
  distanceKm: number;
  delai: string;
  archetype: keyof typeof ARCHETYPES;
  /** La photo du hero montre-t-elle réellement cette ville ? (honnêteté de légende) */
  photoLocale: boolean;
  communesVoisines: string[];
  /**
   * G1b : photo « carte postale » optionnelle (monument connu, jamais annotée).
   * Absente → la bande image se replie en bande typographique.
   */
  photoConnue?: { src: string; alt: string; legende: string };
};

/** Trois villes de démo aux profils volontairement opposés. */
export const VILLES_G1: VilleG1[] = [
  {
    id: "amboise",
    nom: "Amboise",
    codePostal: "37400",
    distanceKm: 25,
    delai: "48 h",
    archetype: "coeur-historique",
    photoLocale: true,
    communesVoisines: ["Montlouis-sur-Loire", "Nazelles-Négron", "Pocé-sur-Cisse", "Chargé"],
    photoConnue: {
      src: "/img/si/claude/amboise-panorama.jpg",
      alt: "Le château royal d’Amboise et la ville basse, vus depuis la Loire",
      legende: "Amboise — le château royal et la ville basse",
    },
  },
  {
    id: "joue-les-tours",
    nom: "Joué-lès-Tours",
    codePostal: "37300",
    distanceKm: 6,
    delai: "48 h",
    archetype: "pavillonnaire",
    photoLocale: false,
    communesVoisines: ["Tours", "Chambray-lès-Tours", "Ballan-Miré", "Saint-Avertin"],
  },
  {
    id: "ligueil",
    nom: "Ligueil",
    codePostal: "37240",
    distanceKm: 45,
    delai: "48 h",
    archetype: "bourg-pierre",
    photoLocale: false,
    communesVoisines: ["Loches", "Descartes", "Sainte-Maure-de-Touraine"],
  },
];

/** Les six contrôles types — notes génériques, personnalisées par le nom de la ville. */
export function controlesPourVille(nom: string) {
  return [
    {
      ref: "DPE",
      titre: "Performance énergétique",
      note: `Obligatoire à la vente comme à la location — le bâti ancien de ${nom} pénalise souvent la classe sans travaux ciblés.`,
    },
    {
      ref: "AMI",
      titre: "Repérage amiante",
      note: "Permis de construire antérieur à juillet 1997 — fréquent sur les toitures, conduits et dalles.",
    },
    {
      ref: "PLB",
      titre: "Constat plomb (CREP)",
      note: "Bâti antérieur à 1949 — la règle dans les centres anciens et les faubourgs.",
    },
    {
      ref: "TER",
      titre: "État termites",
      note: "L’Indre-et-Loire est classée zone termites : le contrôle est exigé pour toute vente.",
    },
    {
      ref: "ELE",
      titre: "Installation électrique",
      note: "Installations de plus de 15 ans — tableaux et réseaux d’origine encore courants.",
    },
    {
      ref: "SUR",
      titre: "Mesurage Carrez / Boutin",
      note: "Copropriétés et mises en location : la surface opposable, mesurée au laser.",
    },
  ] as const;
}

/** Compat G2/G3 : les six contrôles avec la lecture amboisienne d'origine. */
export const CONTROLES = controlesPourVille(AMBOISE.nom);

export const CLAUDE_DIRECTIONS = [
  {
    id: "oeil",
    label: "G1 · L’œil du technicien",
    description: "Photos annotées par archétype de bâti — testez les 3 villes de démo",
  },
  {
    id: "oeil-data",
    label: "G1b · Direction retenue",
    description: "Le relevé + photo « carte postale » voilée — déclinée sur les 8 gabarits",
  },
  {
    id: "clair-obscur",
    label: "G2 · Clair-obscur pétrole",
    description: "Bandes sombres, typographie massive, air — autorité calme",
  },
  {
    id: "dossier",
    label: "G3 · Le dossier tourangeau",
    description: "Codes documentaires assumés — bordereau, annexes, signature",
  },
] as const;

export type ClaudeDirection = (typeof CLAUDE_DIRECTIONS)[number]["id"];
