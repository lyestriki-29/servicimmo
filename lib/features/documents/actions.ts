"use server";

import { revalidatePath } from "next/cache";

import type { ActionResult } from "@/lib/features/action-result";
import { getCurrentUser } from "@/lib/features/auth/session";
import {
  getSupabaseServerClient,
  getSupabaseServiceClient,
  hasServerSupabaseEnv,
} from "@/lib/supabase/server";
import type { DocumentCategory } from "@/lib/supabase/types";

const BUCKET = "dossier-documents";
const MAX_SIZE = 20 * 1024 * 1024; // 20 Mo

function err<T = undefined>(msg: string): ActionResult<T> {
  return { ok: false, error: msg };
}

/**
 * Upload un fichier vers Supabase Storage puis enregistre une ligne
 * `documents_dossier`. Fail-soft si env absente.
 */
export async function uploadDossierDocument(
  dossierId: string,
  category: DocumentCategory,
  file: File,
  notes?: string
): Promise<ActionResult<{ id: string }>> {
  if (!hasServerSupabaseEnv()) return err("Service non configuré.");
  const user = await getCurrentUser();
  if (!user) return err("Non authentifié.");
  if (file.size > MAX_SIZE) return err("Fichier trop volumineux (> 20 Mo).");

  const admin = getSupabaseServiceClient();
  if (!admin) return err("Service storage indisponible.");

  const cleanName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const storagePath = `${user.profile.organization_id}/${dossierId}/${Date.now()}_${cleanName}`;

  const bytes = new Uint8Array(await file.arrayBuffer());
  const { error: upErr } = await admin.storage.from(BUCKET).upload(storagePath, bytes, {
    contentType: file.type || "application/octet-stream",
    cacheControl: "3600",
    upsert: false,
  });
  if (upErr) return err(`Upload échoué : ${upErr.message}`);

  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase
    .from("documents_dossier")
    .insert({
      dossier_id: dossierId,
      uploaded_by: user.id,
      category,
      name: file.name,
      storage_path: storagePath,
      mime_type: file.type || null,
      size_bytes: file.size,
      source: "admin",
      notes: notes ?? null,
    })
    .select("id")
    .single();
  if (error) return err(error.message);

  revalidatePath(`/app/dossiers/${dossierId}`);
  return { ok: true, data: { id: data.id } };
}

export async function deleteDossierDocument(id: string): Promise<ActionResult> {
  if (!hasServerSupabaseEnv()) return err("Service non configuré.");
  const admin = getSupabaseServiceClient();
  if (!admin) return err("Service indisponible.");
  const supabase = await getSupabaseServerClient();

  const { data: doc } = await supabase
    .from("documents_dossier")
    .select("storage_path, dossier_id")
    .eq("id", id)
    .single();
  if (!doc) return err("Document introuvable.");

  await admin.storage.from(BUCKET).remove([doc.storage_path]);
  const { error } = await supabase.from("documents_dossier").delete().eq("id", id);
  if (error) return err(error.message);

  revalidatePath(`/app/dossiers/${doc.dossier_id}`);
  return { ok: true, data: undefined };
}
