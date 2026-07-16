import type { ReactNode } from "react";
import { Sora, Inter, Fredoka } from "next/font/google";

import { Header } from "@/components/marketing/Header";
import { Footer } from "@/components/marketing/Footer";
import { SplashIntro } from "@/components/marketing/SplashIntro";
import { QuoteModalProvider } from "@/components/questionnaire/QuoteModalProvider";
import { MapConsentProvider } from "@/components/rgpd/MapConsentProvider";
import { JsonLd } from "@/components/seo/JsonLd";

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
const fredoka = Fredoka({
  variable: "--font-fredoka",
  subsets: ["latin"],
  weight: ["600"],
  display: "swap",
});

/**
 * Layout des pages marketing : accueil, services, actualités, zones,
 * mentions légales, CGV, contact.
 * Injecte les polices Sora / Inter / Fredoka scopées à ce layout.
 * Header sticky + Footer en encadrement de {children}.
 */
export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <div
      className={`${sora.variable} ${inter.variable} ${fredoka.variable} font-[family-name:var(--font-inter)] text-[color:var(--color-home-ink)] [background:var(--color-home-bg)]`}
    >
      <SplashIntro />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "LocalBusiness",
          name: "Servicimmo",
          description: "Cabinet de diagnostic immobilier à Tours depuis 1998.",
          telephone: "+33247470123",
          address: {
            "@type": "PostalAddress",
            streetAddress: "58 rue de la Chevalerie",
            postalCode: "37100",
            addressLocality: "Tours",
            addressCountry: "FR",
          },
          areaServed: "Indre-et-Loire",
          openingHours: ["Mo-Fr 09:00-12:00", "Mo-Fr 14:00-19:00"],
        }}
      />
      <MapConsentProvider>
        <QuoteModalProvider>
          <Header />
          <main className="min-h-[calc(100dvh-3.5rem)] flex-1">{children}</main>
          <Footer />
        </QuoteModalProvider>
      </MapConsentProvider>
    </div>
  );
}
