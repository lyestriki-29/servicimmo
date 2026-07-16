export type PreviewKind =
  | "catalog"
  | "detail"
  | "news"
  | "article"
  | "map"
  | "city"
  | "contact"
  | "legal";

export type PreviewPage = {
  id: string;
  label: string;
  kind: PreviewKind;
  kicker: string;
  title: string;
  accent: string;
  description: string;
  image: string;
  imageAlt: string;
  stat: string;
  statLabel: string;
  items: Array<{ title: string; text: string; meta?: string }>;
};

export const PREVIEW_PAGES: PreviewPage[] = [
  {
    id: "services",
    label: "Services",
    kind: "catalog",
    kicker: "Nos expertises",
    title: "Tous vos diagnostics,",
    accent: "un seul interlocuteur",
    description:
      "Vente, location, travaux ou copropriété : identifiez rapidement les contrôles nécessaires à votre projet.",
    image: "/img/si/proj2.jpg",
    imageAlt: "Immeuble résidentiel diagnostiqué par Servicimmo",
    stat: "20",
    statLabel: "expertises réglementaires",
    items: [
      {
        title: "DPE & audit énergétique",
        text: "Performance énergétique, vente et location.",
        meta: "Énergie",
      },
      {
        title: "Amiante & plomb",
        text: "Repérages avant vente, travaux ou démolition.",
        meta: "Santé",
      },
      {
        title: "Gaz & électricité",
        text: "Contrôle des installations de plus de 15 ans.",
        meta: "Sécurité",
      },
      {
        title: "Carrez & Boutin",
        text: "Mesurages précis des surfaces réglementaires.",
        meta: "Surface",
      },
    ],
  },
  {
    id: "service",
    label: "Détail service",
    kind: "detail",
    kicker: "Diagnostic réglementaire",
    title: "Diagnostic de performance",
    accent: "énergétique",
    description:
      "Comprendre la consommation et l’impact climatique d’un logement avant sa vente ou sa mise en location.",
    image: "/img/si/proj3.jpg",
    imageAlt: "Intérieur de logement évalué pour un DPE",
    stat: "10 ans",
    statLabel: "durée de validité habituelle",
    items: [
      {
        title: "Quand est-il obligatoire ?",
        text: "Pour toute vente ou mise en location d’un logement.",
      },
      {
        title: "Ce que nous contrôlons",
        text: "Isolation, chauffage, eau chaude, ventilation et consommations.",
      },
      { title: "Ce que vous recevez", text: "Un rapport lisible, expliqué par votre technicien." },
    ],
  },
  {
    id: "actualites",
    label: "Actualités",
    kind: "news",
    kicker: "Veille réglementaire",
    title: "Ce qui change pour",
    accent: "votre bien immobilier",
    description:
      "Des décryptages concrets pour anticiper les évolutions du DPE, de l’amiante et des obligations propriétaires.",
    image: "/img/si/blog1.jpg",
    imageAlt: "Dossier d’actualité du diagnostic immobilier",
    stat: "125+",
    statLabel: "articles publiés depuis 2017",
    items: [
      {
        title: "DPE 2026 : ce qui évolue pour les petites surfaces",
        text: "Les nouveaux seuils expliqués sans jargon.",
        meta: "12 juillet 2026",
      },
      {
        title: "Amiante avant travaux : les bons réflexes",
        text: "Les étapes à prévoir avant l’ouverture du chantier.",
        meta: "4 juillet 2026",
      },
      {
        title: "Location : êtes-vous concerné par l’audit ?",
        text: "Le calendrier selon la classe énergétique.",
        meta: "26 juin 2026",
      },
    ],
  },
  {
    id: "article",
    label: "Détail article",
    kind: "article",
    kicker: "Décryptage · 12 juillet 2026",
    title: "DPE 2026 : les nouveaux seuils",
    accent: "expliqués simplement",
    description:
      "Ce qui change concrètement pour les propriétaires, les bailleurs et les logements de petite surface.",
    image: "/img/si/blog2.jpg",
    imageAlt: "Technicien consultant un rapport de diagnostic",
    stat: "6 min",
    statLabel: "de lecture utile",
    items: [
      {
        title: "Pourquoi la méthode évolue",
        text: "La réforme corrige plusieurs effets de seuil observés sur les petites surfaces.",
      },
      {
        title: "Quels logements sont concernés",
        text: "Les biens déjà classés et les futurs diagnostics ne sont pas tous traités de la même manière.",
      },
      {
        title: "Ce qu’il faut faire maintenant",
        text: "Vérifier la date du rapport et demander conseil avant une nouvelle mise en location.",
      },
    ],
  },
  {
    id: "zones",
    label: "Zones",
    kind: "map",
    kicker: "Zone d’intervention",
    title: "À Tours et partout en",
    accent: "Indre-et-Loire",
    description:
      "Une équipe locale qui se déplace rapidement dans tout le département et les communes limitrophes.",
    image: "/img/si/proj1.jpg",
    imageAlt: "Maison située dans la zone d’intervention Servicimmo",
    stat: "48 h",
    statLabel: "délai d’intervention possible",
    items: [
      { title: "Tours Métropole", text: "Tours, Joué-lès-Tours, Saint-Cyr, Chambray." },
      { title: "Val de Loire", text: "Amboise, Montlouis, Bléré, Azay-le-Rideau." },
      { title: "Sud Touraine", text: "Loches, Ligueil, Sainte-Maure et alentours." },
    ],
  },
  {
    id: "ville",
    label: "Détail ville",
    kind: "city",
    kicker: "Diagnostic immobilier local",
    title: "Votre diagnostiqueur à",
    accent: "Amboise",
    description:
      "Des techniciens certifiés qui connaissent le bâti local et interviennent à Amboise sous 48 h.",
    image: "/img/si/hero2.jpg",
    imageAlt: "Habitat du Val de Loire près d’Amboise",
    stat: "25 km",
    statLabel: "depuis notre agence de Tours",
    items: [
      {
        title: "Vendre à Amboise",
        text: "DPE, amiante, plomb, termites, gaz et électricité selon votre bien.",
      },
      {
        title: "Mettre en location",
        text: "Le dossier complet pour sécuriser le bail et informer le locataire.",
      },
      {
        title: "Préparer des travaux",
        text: "Les repérages nécessaires avant l’intervention des entreprises.",
      },
    ],
  },
  {
    id: "contact",
    label: "Contact",
    kind: "contact",
    kicker: "Parlons de votre projet",
    title: "Une question ?",
    accent: "On vous répond vraiment",
    description:
      "Appelez directement l’équipe ou décrivez votre besoin en ligne. Une réponse claire, sans transfert inutile.",
    image: "/img/si/equipe.jpg",
    imageAlt: "Équipe Servicimmo à Tours",
    stat: "2 h",
    statLabel: "délai de réponse ouvré",
    items: [
      {
        title: "02 47 47 01 23",
        text: "Du lundi au vendredi, 9 h–12 h et 14 h–19 h.",
        meta: "Téléphone",
      },
      {
        title: "info@servicimmo.fr",
        text: "Pour une question, un document ou un suivi de dossier.",
        meta: "E-mail",
      },
      {
        title: "58 rue de la Chevalerie",
        text: "37100 Tours · accueil sur rendez-vous.",
        meta: "Agence",
      },
    ],
  },
  {
    id: "legal",
    label: "Pages légales",
    kind: "legal",
    kicker: "Informations contractuelles",
    title: "Des conditions",
    accent: "claires et accessibles",
    description:
      "Mentions légales, conditions générales de vente et traitement des données réunis dans une lecture plus confortable.",
    image: "/img/si/about1.jpg",
    imageAlt: "Documents Servicimmo consultés dans l’agence",
    stat: "2026",
    statLabel: "dernière mise à jour",
    items: [
      { title: "Éditeur du site", text: "Identité, coordonnées et responsabilité de publication." },
      { title: "Hébergement", text: "Prestataire technique et localisation du service." },
      { title: "Données personnelles", text: "Finalités, conservation et exercice de vos droits." },
      {
        title: "Conditions de vente",
        text: "Commande, intervention, paiement et responsabilités.",
      },
    ],
  },
];

export const PREVIEW_VARIANTS = [
  {
    id: "continuite",
    label: "A · Continuité accueil",
    description: "Clair, photographique, ample",
  },
  {
    id: "expertise",
    label: "B · Expertise structurée",
    description: "Technique, précis, rassurant",
  },
  { id: "local", label: "C · Ancrage local", description: "Humain, territorial, narratif" },
  {
    id: "atlas",
    label: "D · Atlas tourangeau",
    description: "Cartographique, patrimonial, précis",
  },
  { id: "terrain", label: "E · Signal terrain", description: "Franc, photographique, mémorable" },
  {
    id: "selection",
    label: "F · Sélection client",
    description: "Le meilleur choix pour chaque page",
  },
] as const;

export type PreviewVariant = (typeof PREVIEW_VARIANTS)[number]["id"];
