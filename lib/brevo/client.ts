/**
 * Client Brevo (email transactionnel) — SERVEUR UNIQUEMENT.
 * REST https://api.brevo.com/v3/smtp/email, auth par header `api-key`.
 * Fail-soft : si la clé est absente, renvoie une erreur SANS jamais exposer la clé.
 */
const BREVO_URL = "https://api.brevo.com/v3/smtp/email";

export function hasBrevoEnv(): boolean {
  return Boolean(process.env.BREVO_API_KEY);
}

export function getCarottageEmailFrom(): string {
  return process.env.CAROTTAGE_EMAIL_FROM ?? "devis@france-carottage.fr";
}

export function getCarottageEmailInternal(): string {
  return process.env.CAROTTAGE_EMAIL_INTERNAL ?? "contact@france-carottage.fr";
}

type EnvoiParams = {
  to: string;
  subject: string;
  htmlContent: string;
  replyTo?: string;
};

export async function sendTransactionalEmail(
  params: EnvoiParams,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const key = process.env.BREVO_API_KEY;
  if (!key) return { ok: false, error: "Brevo non configuré." };

  try {
    const res = await fetch(BREVO_URL, {
      method: "POST",
      headers: {
        "api-key": key,
        "content-type": "application/json",
        accept: "application/json",
      },
      body: JSON.stringify({
        sender: { name: "France Carottage", email: getCarottageEmailFrom() },
        to: [{ email: params.to }],
        subject: params.subject,
        htmlContent: params.htmlContent,
        ...(params.replyTo ? { replyTo: { email: params.replyTo } } : {}),
      }),
    });
    if (!res.ok) {
      // On ne loggue et ne renvoie QUE le status — jamais la clé ni les headers.
      return { ok: false, error: `Brevo a répondu ${res.status}.` };
    }
    return { ok: true };
  } catch {
    return { ok: false, error: "Envoi Brevo indisponible (réseau)." };
  }
}
