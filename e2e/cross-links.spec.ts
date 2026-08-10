import { expect, test } from "@playwright/test";

const HOST_FC = "carottage.localhost";

// TEMPORAIRE — le lien vers France Carottage a été retiré du header Servicimmo
// le temps que le site sœur soit terminé (cf. Header.tsx). Le test est INVERSÉ
// plutôt que mis en `skip` : un `skip` ne garantit rien, une réintroduction
// accidentelle du lien passerait au vert sans que personne ne le voie.
// À réactiver dans l'autre sens en même temps que <LienMarqueSoeur />.
test("header Servicimmo : aucun lien vers France Carottage tant que le site sœur n'est pas fini", async ({
  page,
}) => {
  await page.goto("/");
  const lien = page.getByRole("link", { name: /France Carottage, notre société sœur/i });
  await expect(lien).toHaveCount(0);
});

// Host France Carottage : simulé via extraHTTPHeaders (page.goto n'accepte pas de headers par appel).
test.describe("host France Carottage", () => {
  test.use({ extraHTTPHeaders: { host: HOST_FC } });

  test("header France Carottage : lien vers Servicimmo présent", async ({ page }) => {
    await page.goto("/");
    const lien = page.getByRole("link", { name: /Servicimmo, notre société sœur/i });
    await expect(lien).toBeVisible();
  });
});
