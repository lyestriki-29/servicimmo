import { getCurrentUser } from "@/lib/features/auth/session";
import {
  getSupabaseServerClient,
  hasServerSupabaseEnv,
} from "@/lib/supabase/server";
import type { RendezVousRow } from "@/lib/supabase/types";

export async function listRendezVous(
  from: Date,
  to: Date
): Promise<{ rdv: RendezVousRow[]; available: boolean }> {
  if (!hasServerSupabaseEnv()) return { rdv: [], available: false };
  const user = await getCurrentUser();
  if (!user) return { rdv: [], available: false };
  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase
    .from("rendez_vous")
    .select("*")
    .eq("organization_id", user.profile.organization_id)
    .gte("starts_at", from.toISOString())
    .lte("starts_at", to.toISOString())
    .order("starts_at", { ascending: true });
  if (error) {
    console.error("[listRendezVous]", error);
    return { rdv: [], available: true };
  }
  return { rdv: data ?? [], available: true };
}

export async function listRendezVousForDossier(
  dossierId: string
): Promise<RendezVousRow[]> {
  if (!hasServerSupabaseEnv()) return [];
  const user = await getCurrentUser();
  if (!user) return [];
  const supabase = await getSupabaseServerClient();
  const { data } = await supabase
    .from("rendez_vous")
    .select("*")
    .eq("organization_id", user.profile.organization_id)
    .eq("dossier_id", dossierId)
    .order("starts_at", { ascending: true });
  return data ?? [];
}
