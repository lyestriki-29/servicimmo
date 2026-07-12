/**
 * Config société France Carottage (société sœur de Servicimmo : mêmes locaux,
 * même téléphone). Carottage routier, repérage amiante/HAP sur enrobés, réseau
 * national. Valeurs à confirmer avec Etienne avant bascule DNS.
 */
export const francecarottageConfig = {
  nom: "France Carottage",
  raisonSociale: "France Carottage",
  siren: "433994563", // trouvé en ligne (SIREN 9 chiffres) — NIC établissement à confirmer pour le SIRET complet
  adresse: {
    ligne1: "14 rue Galpin-Thiou", // adresse siège FC trouvée en ligne (≠ Servicimmo) — à confirmer via mentions-legales.html au scraping FC5
    ligne2: "",
    codePostal: "37000",
    ville: "Tours",
    pays: "France",
  },
  contact: {
    telephone: "02 47 47 01 23",
    telephoneHref: "tel:+33247470123",
    email: "contact@france-carottage.fr", // TODO — à confirmer
  },
  zoneIntervention: "France entière",
  certifications: ["Repérage amiante avant travaux", "HAP / enrobés routiers"],
} as const;

export type FranceCarottageConfig = typeof francecarottageConfig;
