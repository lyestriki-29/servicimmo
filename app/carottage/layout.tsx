import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Sora, Inter } from "next/font/google";

import { FooterFC } from "@/components/carottage/FooterFC";
import { HeaderFC } from "@/components/carottage/HeaderFC";
import { JsonLd } from "@/components/seo/JsonLd";
import { francecarottageConfig } from "@/lib/clients/francecarottage/config";
import { carottageUrl } from "@/lib/clients/francecarottage/urls";

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  display: "swap",
});
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

/** metadataBase FC : les canonicals relatifs des pages carottage résolvent sur le domaine FC. */
export const metadata: Metadata = {
  metadataBase: new URL(carottageUrl("/")),
  title: {
    default: "France Carottage — Carottage routier & repérage amiante/HAP enrobés",
    template: "%s | France Carottage",
  },
  robots: { index: true, follow: true },
};

/** Layout des pages France Carottage (segment /carottage, URLs propres via middleware). */
export default function CarottageLayout({ children }: { children: ReactNode }) {
  return (
    <div
      className={`${sora.variable} ${inter.variable} flex min-h-dvh flex-col bg-[color:var(--fc-blanc-casse)] font-[family-name:var(--font-inter)] text-[color:var(--fc-noir)]`}
    >
      <HeaderFC />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "LocalBusiness",
          name: francecarottageConfig.nom,
          description:
            "Carottage routier et repérage amiante/HAP sur enrobés, réseau national.",
          telephone: francecarottageConfig.contact.telephoneHref.replace(/^tel:/, ""),
          url: carottageUrl("/"),
          address: {
            "@type": "PostalAddress",
            streetAddress: francecarottageConfig.adresse.ligne1,
            postalCode: francecarottageConfig.adresse.codePostal,
            addressLocality: francecarottageConfig.adresse.ville,
            addressCountry: "FR",
          },
          areaServed: "France",
          makesOffer: {
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: "Carottage & repérage amiante/HAP sur enrobés",
              areaServed: "France",
            },
          },
        }}
      />
      <main className="flex-1">{children}</main>
      <FooterFC />
    </div>
  );
}
