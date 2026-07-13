import { describe, expect, it } from "vitest";

import { echapperHtml, emailAccuseReception, emailNotificationInterne } from "../emails";
import type { DevisInput } from "../schema";

const demande: DevisInput = {
  typeChantier: "voirie",
  localisation: 'Orléans <img src="x">',
  uniteMesure: "surface",
  quantiteEstimee: 250,
  delai: "sous-1-mois",
  entreprise: '<a href="https://phishing.example">TPC</a>',
  nom: "Jean <b>Dupont</b>",
  emailPro: "j.dupont@tpc.fr",
  telephone: "0238000000",
  message: "<script>alert(1)</script>",
};

describe("emails devis — échappement HTML des saisies", () => {
  it("echapperHtml neutralise les 5 caractères sensibles", () => {
    expect(echapperHtml(`<a href="x" onclick='y'>&`)).toBe(
      "&lt;a href=&quot;x&quot; onclick=&#39;y&#39;&gt;&amp;",
    );
  });

  it("la notification interne n'injecte aucune balise saisie", () => {
    const { html } = emailNotificationInterne(demande);
    expect(html).not.toContain("<script>");
    expect(html).not.toContain('<a href="https://phishing.example">');
    expect(html).toContain("&lt;script&gt;");
  });

  it("l'accusé de réception échappe le nom et la localisation", () => {
    const { html } = emailAccuseReception(demande);
    expect(html).not.toContain("<b>Dupont</b>");
    expect(html).toContain("Jean &lt;b&gt;Dupont&lt;/b&gt;");
  });
});
