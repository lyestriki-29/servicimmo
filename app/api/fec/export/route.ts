/**
 * GET /api/fec/export?from=YYYY-MM-DD&to=YYYY-MM-DD
 *
 * Export FEC (Fichier des Écritures Comptables) pour la période demandée.
 * Auth admin requise.
 */

import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/features/auth/session";
import { buildFecFromOperations } from "@/lib/features/fec/export";
import { formatFec } from "@/lib/core/fec/format";
import {
  getSupabaseServerClient,
  hasServerSupabaseEnv,
} from "@/lib/supabase/server";

export async function GET(request: Request): Promise<Response> {
  if (!hasServerSupabaseEnv()) {
    return NextResponse.json({ ok: false, error: "Service non configuré." }, { status: 503 });
  }
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ ok: false }, { status: 401 });
  if (user.profile.role !== "admin") {
    return NextResponse.json({ ok: false, error: "Admin uniquement." }, { status: 403 });
  }

  const url = new URL(request.url);
  const from = url.searchParams.get("from") ?? `${new Date().getFullYear()}-01-01`;
  const to = url.searchParams.get("to") ?? new Date().toISOString().slice(0, 10);

  const supabase = await getSupabaseServerClient();
  const [{ data: factures }, { data: paiements }, { data: contacts }] =
    await Promise.all([
      supabase
        .from("factures")
        .select("*")
        .eq("organization_id", user.profile.organization_id)
        .gte("issued_at", `${from}T00:00:00Z`)
        .lte("issued_at", `${to}T23:59:59Z`),
      supabase
        .from("paiements")
        .select("*")
        .eq("organization_id", user.profile.organization_id)
        .gte("paid_at", `${from}T00:00:00Z`)
        .lte("paid_at", `${to}T23:59:59Z`),
      supabase.from("contacts").select("id, company_name, first_name, last_name"),
    ]);

  const nameById = new Map<string, string>();
  for (const c of contacts ?? []) {
    const name =
      c.company_name ??
      [c.first_name, c.last_name].filter(Boolean).join(" ") ??
      c.id;
    nameById.set(c.id, name);
  }

  const entries = buildFecFromOperations({
    factures: factures ?? [],
    paiements: paiements ?? [],
    resolveClientName: (id) => (id ? (nameById.get(id) ?? "") : ""),
  });
  const fecContent = formatFec(entries);

  return new Response(fecContent, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Content-Disposition": `attachment; filename="FEC_${user.profile.organization_id}_${from}_${to}.txt"`,
    },
  });
}

export const dynamic = "force-dynamic";
