/**
 * Middleware Next.js 16 — routage multi-domaines + sécurité/session Supabase.
 *
 * Responsabilités :
 *   0. (France Carottage) Réécrit les requêtes dont le host ∈
 *      NEXT_PUBLIC_CAROTTAGE_HOSTS vers le segment `/carottage/...` (URLs
 *      propres côté navigateur) et bloque l'accès direct à `/carottage/*`
 *      depuis un host non-FC (anti-duplicate SEO). N'affecte AUCUN host
 *      Servicimmo : ce bloc est un fast-path qui `return`, la logique
 *      Sprint 1 ci-dessous n'est jamais atteinte pour un host FC.
 *   1. Rafraîchit la session Supabase (cookies) sur chaque requête.
 *   2. Protège les routes `/app/**` : redirection vers `/login` si non connecté.
 *   3. Redirige un utilisateur connecté qui visite `/login` vers `/app`.
 *
 * Les routes publiques (marketing, devis, /portail/[token], /api) restent
 * accessibles. Le portail sera sécurisé par vérification JWT en Sprint 4.
 *
 * Si l'environnement Supabase n'est pas provisionné (pas de vars env),
 * le middleware laisse passer silencieusement — aucune session à gérer.
 */

import { NextResponse, type NextRequest } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

import { estHostCarottage } from "@/lib/carottage/hosts";

// Chemins à protéger (route group `(app)` = toute URL /app/...).
const APP_PREFIXES = ["/app"];
// Chemins publics d'authentification (ne pas rediriger si déjà connecté :
// on redirige vers /app à la place).
const AUTH_PATHS = ["/login", "/reset-password"];

function isAppPath(pathname: string): boolean {
  return APP_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

function isAuthPath(pathname: string): boolean {
  return AUTH_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const host = request.headers.get("host");

  // ── Fast-path France Carottage : réécriture host FC → segment /carottage ──
  // N'entre en jeu QUE si le host appartient à NEXT_PUBLIC_CAROTTAGE_HOSTS ;
  // pour tout autre host (Servicimmo, localhost sans override, previews…),
  // ce bloc est ignoré et l'exécution continue exactement comme avant.
  if (estHostCarottage(host)) {
    // Déjà réécrit (évite la boucle de rewrite) : laisser passer tel quel.
    if (pathname.startsWith("/carottage")) return NextResponse.next();
    const urlCarottage = request.nextUrl.clone();
    urlCarottage.pathname = pathname === "/" ? "/carottage" : `/carottage${pathname}`;
    return NextResponse.rewrite(urlCarottage);
  }

  // Anti-duplicate cross-domaine : /carottage/* n'est pas servi depuis un host
  // Servicimmo — on redirige (308) vers l'équivalent sur le domaine FC.
  if (pathname.startsWith("/carottage")) {
    const cibleCarottage = process.env.NEXT_PUBLIC_CAROTTAGE_URL ?? "https://www.france-carottage.fr";
    const chemin = pathname.replace(/^\/carottage/, "") || "/";
    return NextResponse.redirect(new URL(chemin, cibleCarottage), 308);
  }

  // ── Logique Servicimmo existante (inchangée à partir d'ici) ──
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Fast path : pas de Supabase → on laisse tout passer (phase dev / preview).
  if (!url || !anonKey) return NextResponse.next();

  let response = NextResponse.next({ request });

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookies: { name: string; value: string; options: CookieOptions }[]) {
        // Propager sur la request ET la response (SSR session refresh).
        for (const { name, value } of cookies) {
          request.cookies.set(name, value);
        }
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookies) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Route app protégée → redirect /login
  if (isAppPath(pathname) && !user) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Déjà connecté sur /login → redirect /app
  if (isAuthPath(pathname) && user) {
    return NextResponse.redirect(new URL("/app", request.url));
  }

  return response;
}

export const config = {
  // On exclut les assets statiques + routes API (gèrent leur propre auth).
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)|api/).*)",
  ],
};
