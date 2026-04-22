"use server";

import { revalidatePath } from "next/cache";

import type { ActionResult } from "@/lib/features/action-result";
import { getCurrentUser } from "@/lib/features/auth/session";
import {
  getSupabaseServerClient,
  hasServerSupabaseEnv,
} from "@/lib/supabase/server";

import { rendezVousInputSchema, type RendezVousInput } from "./schema";

function err<T = undefined>(msg: string, fieldErrors?: Record<string, string>): ActionResult<T> {
  return { ok: false, error: msg, fieldErrors };
}

async function requireAuth() {
  if (!hasServerSupabaseEnv()) throw new Error("Service non configuré.");
  const user = await getCurrentUser();
  if (!user) throw new Error("Non authentifié.");
  return user;
}

export async function createRendezVous(
  input: RendezVousInput
): Promise<ActionResult<{ id: string }>> {
  try {
    const user = await requireAuth();
    const parsed = rendezVousInputSchema.safeParse(input);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        fieldErrors[issue.path.join(".") || "_form"] = issue.message;
      }
      return err("Données invalides.", fieldErrors);
    }
    const supabase = await getSupabaseServerClient();
    const { data, error } = await supabase
      .from("rendez_vous")
      .insert({
        organization_id: user.profile.organization_id,
        title: parsed.data.title,
        description: parsed.data.description ?? null,
        starts_at: parsed.data.starts_at,
        ends_at: parsed.data.ends_at,
        location: parsed.data.location ?? null,
        address: parsed.data.address ?? null,
        city: parsed.data.city ?? null,
        postal_code: parsed.data.postal_code ?? null,
        status: parsed.data.status ?? "planifie",
        dossier_id: parsed.data.dossier_id ?? null,
        technicien_id: parsed.data.technicien_id ?? null,
        notes: parsed.data.notes ?? null,
      })
      .select("id")
      .single();
    if (error) return err(error.message);
    revalidatePath("/app/agenda");
    return { ok: true, data: { id: data.id } };
  } catch (e) {
    return err((e as Error).message);
  }
}

export async function updateRendezVous(
  id: string,
  input: RendezVousInput
): Promise<ActionResult> {
  try {
    await requireAuth();
    const parsed = rendezVousInputSchema.safeParse(input);
    if (!parsed.success) return err("Données invalides.");
    const supabase = await getSupabaseServerClient();
    const { error } = await supabase
      .from("rendez_vous")
      .update({
        title: parsed.data.title,
        description: parsed.data.description ?? null,
        starts_at: parsed.data.starts_at,
        ends_at: parsed.data.ends_at,
        location: parsed.data.location ?? null,
        address: parsed.data.address ?? null,
        city: parsed.data.city ?? null,
        postal_code: parsed.data.postal_code ?? null,
        status: parsed.data.status ?? "planifie",
        dossier_id: parsed.data.dossier_id ?? null,
        technicien_id: parsed.data.technicien_id ?? null,
        notes: parsed.data.notes ?? null,
      })
      .eq("id", id);
    if (error) return err(error.message);
    revalidatePath("/app/agenda");
    return { ok: true, data: undefined };
  } catch (e) {
    return err((e as Error).message);
  }
}

export async function deleteRendezVous(id: string): Promise<ActionResult> {
  try {
    await requireAuth();
    const supabase = await getSupabaseServerClient();
    const { error } = await supabase.from("rendez_vous").delete().eq("id", id);
    if (error) return err(error.message);
    revalidatePath("/app/agenda");
    return { ok: true, data: undefined };
  } catch (e) {
    return err((e as Error).message);
  }
}
