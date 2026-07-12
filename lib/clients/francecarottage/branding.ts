/**
 * Branding France Carottage — identité rouge/noir/blanc modernisée.
 * Le rouge de référence (#B32024) doit être re-pipeté sur le logo réel avant
 * mise en prod ; il vit en token CSS `--fc-rouge` (app/globals.css).
 */
export const francecarottageBranding = {
  displayName: "France Carottage",
  tagline: "Carottage routier & repérage amiante/HAP — réseau national",
  colors: {
    rouge: "#B32024",
    noir: "#111113",
    blancCasse: "#F5F4F2",
    gris: "#6B6E73",
  },
  fonts: {
    titres: "var(--font-sora)",
    corps: "var(--font-inter)",
  },
  logo: {
    src: "/img/carottage/logo-france-carottage.svg",
    alt: "France Carottage",
    width: 190,
    height: 44,
  },
} as const;

export type FranceCarottageBranding = typeof francecarottageBranding;
