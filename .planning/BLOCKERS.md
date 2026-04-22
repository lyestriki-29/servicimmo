# Blockers — livraison finale

Fichier de tracking interne des dépendances externes à lever par Lyes/Servicimmo
avant mise en prod. À lire à la toute fin, après le Sprint 8.

## Catégorisation

- 🔴 **Critique** — bloque la mise en prod
- 🟠 **Important** — bloque une feature mais pas le déploiement
- 🟡 **Nice-to-have** — dégrade l'UX si non résolu

## Liste (remplie au fil des sprints)

### Sprint 1 — DB + auth + contacts

- 🔴 **Provisionner projets Supabase** `servicimmo-dev` + `servicimmo-prod` sur supabase.com, remplir `.env.local` avec URL + anon_key + service_role.
- 🔴 **Appliquer migrations 0001→0004** sur Supabase (SQL Editor ou CLI).
- 🟠 **Infos cabinet Servicimmo à remplir dans `organizations`** : SIRET, IBAN, TVA intracommunautaire, adresse complète. Stub pour l'instant (cf. seed migration 0004).
- 🟠 **Créer le premier utilisateur admin** dans Supabase Auth (Lyes et/ou Etienne) puis insérer la ligne `users_profiles` avec `role='admin'` et `organization_id` = id de Servicimmo.
- 🟡 **`PAPPERS_API_KEY`** — nécessaire pour l'enrichissement SIRET automatique des prescripteurs (UX nice-to-have, fallback saisie manuelle).

