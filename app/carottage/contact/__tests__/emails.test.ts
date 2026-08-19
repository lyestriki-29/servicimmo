import { describe, expect, it } from "vitest";

import { emailContactAccuseReception, emailContactInterne } from "../emails";
import type { ContactInput } from "../schema";

const message: ContactInput = {
  nom: "Jean <b>Dupont</b>",
  email: "j.dupont@tpc.fr",
  sujet: '<a href="https://phishing.example">Devis</a>',
  message: "Ligne 1\nLigne 2 <script>alert(1)</script>",
};

describe("emails contact — échappement HTML des saisies", () => {
  it("la notification interne n'injecte aucune balise saisie", () => {
    const { html } = emailContactInterne(message);
    expect(html).not.toContain("<script>");
    expect(html).not.toContain('<a href="https://phishing.example">');
    expect(html).toContain("&lt;script&gt;");
  });

  it("la notification interne conserve les sauts de ligne du message", () => {
    expect(emailContactInterne(message).html).toContain("Ligne 1<br/>Ligne 2");
  });

  it("un saut de ligne dans le sujet ne casse pas l'objet de l'email (repli d'en-tête)", () => {
    const sujetMultiligne: ContactInput = { ...message, sujet: "Devis voirie\nOrléans mars 2027" };
    const { subject } = emailContactInterne(sujetMultiligne);
    expect(subject).not.toContain("\n");
    expect(subject).not.toContain("\r");
    expect(subject).toContain("Devis voirie Orléans mars 2027");
  });

  it("l'accusé de réception échappe le nom et le sujet", () => {
    const { html } = emailContactAccuseReception(message);
    expect(html).not.toContain("<b>Dupont</b>");
    expect(html).toContain("Jean &lt;b&gt;Dupont&lt;/b&gt;");
    expect(html).not.toContain('<a href="https://phishing.example">');
  });
});
