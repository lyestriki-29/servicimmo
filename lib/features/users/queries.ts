import { getCurrentUser } from "@/lib/features/auth/session";
import {
  getSupabaseServerClient,
  hasServerSupabaseEnv,
} from "@/lib/supabase/server";

export type TechnicienOption = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  role: string;
};

export async function listTechniciens(): Promise<TechnicienOption[]> {
  if (!hasServerSupabaseEnv()) return [];
  const user = await getCurrentUser();
  if (!user) return [];

  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase
    .from("users_profiles")
    .select("id, first_name, last_name, role")
    .eq("organization_id", user.profile.organization_id)
    .eq("is_active", true)
    .in("role", ["admin", "diagnostiqueur"])
    .order("last_name", { ascending: true });

  if (error) return [];
  return data ?? [];
}
