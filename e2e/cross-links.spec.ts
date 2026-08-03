import { expect, test } from "@playwright/test";

const HOST_FC = "carottage.localhost";

// Host Servicimmo (par défaut) : le lien pointe vers France Carottage.
// TEMPORAIRE — le lien a été retiré du header Servicimmo le temps que le site
// France Carottage soit terminé (cf. Header.tsx). Réactiver ce test en même
// temps que <LienMarqueSoeur />.
test.skip("header Servicimmo : lien vers France Carottage présent et pointant vers l'URL FC", async ({
  page,
}) => {
  await page.goto("/");
  const lien = page.getByRole("link", { name: /France Carottage, notre société sœur/i });
  await expect(lien).toBeVisible();
  const href = await lien.getAttribute("href");
  expect(href).toContain("carottage");
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
