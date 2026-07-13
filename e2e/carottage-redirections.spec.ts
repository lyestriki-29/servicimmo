import { expect, test } from "@playwright/test";

import redirections from "../lib/seo/redirects-carottage.json";

const HOST_FC = "carottage.localhost";
// Échantillon (un par type) pour garder le run rapide ; le build valide l'exhaustivité.
const echantillon = redirections.slice(0, 20);

for (const r of echantillon) {
  test(`redirige ${r.source} (host FC)`, async ({ request }) => {
    const res = await request.get(r.source, { headers: { host: HOST_FC }, maxRedirects: 0 });
    expect([301, 308]).toContain(res.status());
    expect(res.headers()["location"]).toContain(r.destination);
  });
}

test("les .html FC ne redirigent PAS sur le host Servicimmo", async ({ request }) => {
  const first = redirections[0];
  if (!first) return;
  const res = await request.get(first.source, { maxRedirects: 0 });
  // Sur le host SI, cette source FC n'existe pas → 404 (ou 200 si collision improbable),
  // jamais une 30x vers la cible FC.
  expect(res.headers()["location"] ?? "").not.toContain(first.destination);
});
