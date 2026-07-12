import type { NextConfig } from "next";

import anciennesRedirections from "./lib/seo/redirects.json";

const nextConfig: NextConfig = {
  /* config options here */

  // Redirections 301 des anciennes URLs (ex-site) vers les nouvelles pages.
  async redirects() {
    return anciennesRedirections.map((redirection) => ({
      source: redirection.source,
      destination: redirection.destination,
      permanent: true, // 308 côté Next — équivalent SEO d'une 301 pour Google
    }));
  },
};

export default nextConfig;
