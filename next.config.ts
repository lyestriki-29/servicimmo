import type { NextConfig } from "next";

import anciennesRedirections from "./lib/seo/redirects.json";
import redirectsCarottage from "./lib/seo/redirects-carottage.json";

/** Hosts France Carottage (sans port) — chaque redirect FC est gardé sur ces hosts. */
const HOSTS_CAROTTAGE = (process.env.NEXT_PUBLIC_CAROTTAGE_HOSTS ?? "")
  .split(",")
  .map((h) => h.trim())
  .filter(Boolean);

const nextConfig: NextConfig = {
  images: {
    // AVIF d'abord : ~20-30 % plus leger que le WebP a qualite egale, sur un
    // site ou les heros sont des photos. Next retombe sur WebP puis sur le
    // format d'origine selon ce que le navigateur accepte.
    formats: ["image/avif", "image/webp"],
  },

  // Redirections 301 des anciennes URLs (ex-sites) vers les nouvelles pages.
  async redirects() {
    // Servicimmo : inchangé (sources en /diagnostic-immobilier-*, -iN, services .html).
    const servicimmo = anciennesRedirections.map((redirection) => ({
      source: redirection.source,
      destination: redirection.destination,
      permanent: true, // 308 côté Next — équivalent SEO d'une 301 pour Google
    }));

    // France Carottage : mêmes redirects répétés et gardés par host FC (has host).
    // Les sources FC (/amiante-hap-enrobes-routiers-*.html) ne chevauchent pas
    // celles de Servicimmo, mais le garde `has host` garantit qu'elles ne se
    // déclenchent JAMAIS depuis le domaine Servicimmo (anti-collision stricte).
    const carottage = HOSTS_CAROTTAGE.flatMap((host) =>
      redirectsCarottage.map((redirection) => ({
        source: redirection.source,
        has: [{ type: "host" as const, value: host }],
        destination: redirection.destination,
        permanent: true,
      })),
    );

    return [...servicimmo, ...carottage];
  },
};

export default nextConfig;
