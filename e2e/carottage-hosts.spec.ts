import { expect, test } from "@playwright/test";

/**
 * Routage multi-domaines France Carottage (middleware.ts) — Task FC1.5.
 *
 * Simule le host FC via l'en-tête `Host` (Playwright n'a pas de
 * `page.goto({ headers })` : on passe par `request.get(..., { headers })`).
 * Prérequis : `.env.local` contient `NEXT_PUBLIC_CAROTTAGE_HOSTS` incluant
 * `carottage.localhost` (le serveur `pnpm dev` du webServer Playwright lit
 * ce fichier).
 */

const HOST_FC = "carottage.localhost";

test("host FC : la racine sert la home carottage (rewrite)", async ({ request }) => {
  const res = await request.get("/", { headers: { host: HOST_FC } });
  expect(res.status()).toBe(200);
  expect(await res.text()).toContain("France Carottage");
});

test("host FC : les URLs propres ne montrent pas /carottage", async ({ request }) => {
  const res = await request.get("/", { headers: { host: HOST_FC } });
  // Réécriture interne : le contenu carottage est servi sans redirection visible.
  expect(res.url()).not.toContain("/carottage");
});

test("host Servicimmo : la home reste la home Servicimmo (aucune régression)", async ({
  request,
}) => {
  const res = await request.get("/");
  expect(res.status()).toBe(200);
  expect(await res.text()).toContain("Servicimmo");
});

test("host Servicimmo : /carottage/* est bloqué (anti-duplicate, 3xx)", async ({ request }) => {
  const res = await request.get("/carottage", { maxRedirects: 0 });
  expect([301, 307, 308]).toContain(res.status());
});
