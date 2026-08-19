import { expect, test } from "@playwright/test";

const HOST_FC = "carottage.localhost";

test("header Servicimmo : lien vers France Carottage présent", async ({ page }) => {
  await page.goto("/");
  const lien = page.getByRole("link", { name: /France Carottage, notre société sœur/i });
  await expect(lien).toBeVisible();
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
