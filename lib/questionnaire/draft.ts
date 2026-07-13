/**
 * Enregistrement du brouillon (`quote_requests`, statut email_captured) en
 * ARRIÈRE-PLAN. Fire-and-forget + un retry : un échec réseau ne bloque JAMAIS
 * la progression de l'utilisateur (c'était un des bugs majeurs de l'ancien
 * parcours — l'API exigeait un email jamais collecté et bloquait le récap).
 */

import type { ApiResponse } from "@/lib/api/responses";
import type { QuestionnaireData } from "@/lib/stores/questionnaire";

type DraftResponse = { id: string };

function buildDraftPayload(d: QuestionnaireData): Record<string, unknown> | null {
  // La branche « autre » a son propre flux de soumission directe.
  if (!d.project_type || d.project_type === "other") return null;
  if (!d.email) return null;
  return {
    project_type: d.project_type,
    property_type: d.property_type,
    address: d.address,
    postal_code: d.postal_code,
    city: d.city,
    surface: d.surface,
    rooms_count: d.rooms_count,
    is_coownership: d.is_coownership,
    email: d.email,
    first_name: d.first_name,
    phone: d.phone,
  };
}

async function postDraft(payload: Record<string, unknown>): Promise<string | null> {
  try {
    const res = await fetch("/api/quote-request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const json = (await res.json()) as ApiResponse<DraftResponse>;
    return json.ok ? json.data.id : null;
  } catch {
    return null;
  }
}

/** Tentative unique, awaité-able (récap : dernier filet avant la soumission finale). */
export async function saveDraftNow(data: QuestionnaireData): Promise<string | null> {
  const payload = buildDraftPayload(data);
  if (!payload) return null;
  return postDraft(payload);
}

/** Fire-and-forget + un retry à 2 s. Échec définitif = silencieux (non bloquant). */
export function saveDraftInBackground(
  data: QuestionnaireData,
  onSaved: (id: string) => void
): void {
  const payload = buildDraftPayload(data);
  if (!payload) return;
  void (async () => {
    const id = await postDraft(payload);
    if (id) {
      onSaved(id);
      return;
    }
    setTimeout(() => {
      void postDraft(payload).then((retryId) => {
        if (retryId) onSaved(retryId);
      });
    }, 2000);
  })();
}
