import { expect, test } from "@playwright/test";

import redirections from "../lib/seo/redirects.json";

// Vérifie que chaque ancienne URL redirige bien (301/308) vers sa destination.
for (const redirection of redirections) {
  test(`redirige ${redirection.source}`, async ({ request }) => {
    const res = await request.get(redirection.source, { maxRedirects: 0 });
    expect([301, 308]).toContain(res.status());
    expect(res.headers()["location"]).toContain(redirection.destination);
  });
}

// Vérifie qu'aucune destination de redirection ne mène à une page 404.
test("aucune redirection ne mène à un 404", async ({ request }) => {
  for (const redirection of redirections) {
    const res = await request.get(redirection.destination);
    expect(res.status(), `${redirection.destination} doit répondre 200`).toBe(200);
  }
});
