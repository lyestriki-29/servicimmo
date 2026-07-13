import { afterEach, describe, expect, it, vi } from "vitest";

import { sendTransactionalEmail } from "../client";

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
});

describe("sendTransactionalEmail", () => {
  it("échoue proprement si la clé est absente (sans exposer d'env)", async () => {
    vi.stubEnv("BREVO_API_KEY", "");
    const r = await sendTransactionalEmail({
      to: "pro@exemple.fr",
      subject: "Test",
      htmlContent: "<p>hi</p>",
    });
    expect(r).toEqual({ ok: false, error: "Brevo non configuré." });
  });

  it("poste sur l'API Brevo avec le header api-key et renvoie ok", async () => {
    vi.stubEnv("BREVO_API_KEY", "xkeysib-SECRET");
    vi.stubEnv("CAROTTAGE_EMAIL_FROM", "devis@france-carottage.fr");
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(new Response(JSON.stringify({ messageId: "1" }), { status: 201 }));

    const r = await sendTransactionalEmail({
      to: "pro@exemple.fr",
      subject: "Nouvelle demande",
      htmlContent: "<p>corps</p>",
      replyTo: "client@exemple.fr",
    });

    expect(r).toEqual({ ok: true });
    const [url, init] = fetchMock.mock.calls[0]!;
    expect(url).toBe("https://api.brevo.com/v3/smtp/email");
    expect((init?.headers as Record<string, string>)["api-key"]).toBe("xkeysib-SECRET");
  });

  it("ne place JAMAIS la clé dans le message d'erreur en cas d'échec HTTP", async () => {
    vi.stubEnv("BREVO_API_KEY", "xkeysib-SECRET");
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ message: "bad request" }), { status: 400 }),
    );
    const r = await sendTransactionalEmail({ to: "x@y.fr", subject: "s", htmlContent: "<p/>" });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).not.toContain("xkeysib-SECRET");
  });
});
