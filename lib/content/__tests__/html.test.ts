import { describe, expect, it } from "vitest";

import { decodeEntitesHtml, stripHtml } from "@/lib/content/html";

describe("lib/content/html", () => {
  /**
   * Le bug d'origine : le sommaire « Dans cet article » affichait
   * « les donneurs d&#39;ordre ». Le rendu Markdown échappe l'apostrophe, le
   * texte extrait gardait l'entité, et React l'affichait littéralement.
   */
  it("décode l'apostrophe échappée par le rendu Markdown", () => {
    expect(stripHtml("<h2>ce que doivent retenir les donneurs d&#39;ordre</h2>")).toBe(
      "ce que doivent retenir les donneurs d'ordre",
    );
  });

  it("retire les balises et normalise les espaces", () => {
    expect(stripHtml("<h2>Un  <em>repérage</em>\n obligatoire</h2>")).toBe(
      "Un repérage obligatoire",
    );
  });

  it("décode les entités nommées et hexadécimales", () => {
    expect(decodeEntitesHtml("Amiante &amp; HAP")).toBe("Amiante & HAP");
    expect(decodeEntitesHtml("l&#x27;essentiel")).toBe("l'essentiel");
    expect(decodeEntitesHtml("&quot;citation&quot;")).toBe('"citation"');
    expect(decodeEntitesHtml("&lt;balise&gt;")).toBe("<balise>");
  });

  /** `&amp;` en dernier : sinon « &amp;#39; » se décoderait deux fois. */
  it("ne décode pas deux fois une esperluette échappée", () => {
    expect(decodeEntitesHtml("A &amp;#39; B")).toBe("A &#39; B");
  });

  it("laisse un texte sans entité intact", () => {
    expect(stripHtml("Des seuils de HAP qui déterminent le devenir des enrobés")).toBe(
      "Des seuils de HAP qui déterminent le devenir des enrobés",
    );
  });
});
