import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { GoogleMapEmbed } from "@/components/marketing/pages/GoogleMapEmbed";
import { MapConsentProvider } from "@/components/rgpd/MapConsentProvider";

/**
 * Article 82 de la loi Informatique et Libertés : rien ne part chez Google
 * avant un consentement explicite. Une version précédente montait l'iframe
 * directement, sur 20 pages, dont /zones où la carte est dans le hero.
 *
 * Ce filet interdit le retour en arrière : il vérifie qu'AUCUNE URL Google
 * n'est rendue dans le DOM tant que le visiteur n'a pas cliqué.
 */

function renderCarte() {
  return render(
    <MapConsentProvider>
      <GoogleMapEmbed query="Tours 37000, France" title="Carte Google Maps de Tours" />
    </MapConsentProvider>
  );
}

/** Toute mention d'un domaine Google dans le HTML rendu, attribut `href` exclu. */
function urlsGoogleMontees(container: HTMLElement): string[] {
  const trouvees: string[] = [];
  for (const el of Array.from(container.querySelectorAll("*"))) {
    for (const attr of Array.from(el.attributes)) {
      // Un lien <a href> ne declenche aucune requete tant qu'on ne clique pas :
      // c'est justement l'alternative offerte au visiteur qui refuse.
      if (attr.name === "href") continue;
      if (attr.value.includes("google.com")) trouvees.push(`${el.tagName}[${attr.name}]`);
    }
  }
  return trouvees;
}

describe("consentement aux cartes Google", () => {
  beforeEach(() => window.localStorage.clear());
  afterEach(cleanup);

  it("ne monte AUCUNE URL Google avant consentement", () => {
    const { container } = renderCarte();

    expect(urlsGoogleMontees(container)).toEqual([]);
    expect(container.querySelector("iframe")).toBeNull();
    expect(screen.getByTestId("google-map-placeholder")).toBeTruthy();
  });

  it("affiche la carte après le clic, et pas avant", () => {
    const { container } = renderCarte();
    expect(container.querySelector("iframe")).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: /afficher la carte/i }));

    const iframe = container.querySelector("iframe");
    expect(iframe).not.toBeNull();
    expect(iframe!.getAttribute("src")).toContain("google.com");
  });

  it("offre une alternative sans dépôt : un lien sortant vers Google Maps", () => {
    renderCarte();

    const lien = screen.getByRole("link", { name: /ouvrir dans google maps/i });
    expect(lien.getAttribute("href")).toContain("google.com/maps");
    expect(lien.getAttribute("rel")).toContain("noopener");
  });

  it("mémorise l'accord : la carte suivante s'affiche sans re-cliquer", () => {
    const premier = renderCarte();
    fireEvent.click(screen.getByRole("button", { name: /afficher la carte/i }));
    expect(premier.container.querySelector("iframe")).not.toBeNull();
    cleanup();

    // Nouvelle page, même appareil : le localStorage a garde le choix.
    const suivant = renderCarte();
    expect(suivant.container.querySelector("iframe")).not.toBeNull();
  });

  it("respecte un consentement expiré comme un refus", () => {
    const vieux = new Date();
    vieux.setMonth(vieux.getMonth() - 7); // validite = 6 mois
    window.localStorage.setItem(
      "si-consent-maps",
      JSON.stringify({ granted: true, date: vieux.toISOString() })
    );

    const { container } = renderCarte();

    expect(container.querySelector("iframe")).toBeNull();
    expect(urlsGoogleMontees(container)).toEqual([]);
  });

  it("traite une valeur de stockage corrompue comme un refus", () => {
    window.localStorage.setItem("si-consent-maps", "{pas du json");

    const { container } = renderCarte();

    expect(container.querySelector("iframe")).toBeNull();
  });
});
