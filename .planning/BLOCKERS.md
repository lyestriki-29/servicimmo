# Blockers — livraison finale

Fichier de tracking interne des dépendances externes à lever par Lyes/Servicimmo
avant mise en prod. À lire à la toute fin, après le Sprint 8.

## Catégorisation

- 🔴 **Critique** — bloque la mise en prod
- 🟠 **Important** — bloque une feature mais pas le déploiement
- 🟡 **Nice-to-have** — dégrade l'UX si non résolu

## Liste (remplie au fil des sprints)

### Sprint 6 — Demandes de documents

- 🔴 **Appliquer migration 0009** (modeles_demande, demandes_documents, demande_items + seed 3 modèles Servicimmo).
- 🔴 **Créer bucket Supabase Storage `demande-uploads`** (privé, policies par access_token via signed URLs). Le portail actuel bloque l'upload en attendant.
- 🟠 **Upload portail côté client** : le flow actuel demande au client d'envoyer par email. Implémentation signed-upload (POST `/api/portail/upload`) à livrer Sprint 6.1.
- 🟡 **UI signature électronique** : stub actuel (clic → completed avec texte placeholder). Implémenter signature canvas en Sprint 6.1 ou via un service tiers (DocuSign, Yousign).

### Sprint 5 — Stripe + relances + FEC

- 🔴 **Compte Stripe Servicimmo** : finaliser KYC, récupérer `STRIPE_SECRET_KEY` (test + live), `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET` (depuis dashboard.stripe.com/webhooks — cibler `/api/stripe/webhook`).
- 🔴 **Appliquer migration 0008** (paiements + trigger refresh).
- 🔴 **Domaine Resend** `servicimmo.fr` à valider (DKIM + SPF) et `RESEND_API_KEY` à renseigner. Sans ça les emails restent stub.
- 🟠 **Déployer Edge Function `relances`** : `supabase functions deploy relances` puis `supabase functions schedule ...`. Fichier prêt dans supabase/functions/relances/.
- 🟠 **UI enregistrement paiement manuel** : Server Action `recordManualPayment` prête, UI formulaire à construire (Sprint 8 polish).
- 🟠 **Portail paiement `/portail/pay/[factureId]`** : le webhook attend le retour depuis `success_url`. Cette page UI n'est pas encore créée (redirection Stripe → page de confirmation Servicimmo). Sprint 6 ou 8.
- 🟡 **Bouton "Exporter FEC" dans l'UI admin** : route `/api/fec/export` OK, lien UI à ajouter (paramètres cabinet, Sprint 8).
- 🟡 **Plan comptable FEC** : schéma simplifié (411/706/445710/512/531). Si le comptable de Servicimmo utilise un plan différent, adapter `lib/features/fec/export.ts`.

### Sprint 4 — Devis + factures + tarification

- 🔴 **Appliquer migration 0007** (devis, factures, grille_tarifaire, regles_majoration + fonctions plpgsql).
- 🔴 **Grille tarifaire réelle** à saisir dans `grille_tarifaire` via SQL Editor Supabase (panneau admin livré Sprint 8). Source : questions 1-10 du plan pricing (cf. plan V2).
- 🔴 **Envoi email devis Resend** : Server Action `sendDevis` génère le lien mais ne poste pas encore l'email. Sera livré Sprint 5 en même temps que les relances.
- 🟠 **PDF devis / facture** : tables prêtes (`pdf_storage_path`) et `@react-pdf/renderer` installé, mais la génération réelle est reportée à Sprint 5 (en même temps que Stripe Checkout qui consomme le PDF).
- 🟠 **Catalog prestations dans `devis_lignes`** : pour l'instant, les lignes sont créées depuis `required_diagnostics` du dossier. L'édition manuelle (ajouter/retirer lignes dans l'UI devis) est prévue Sprint 8.
- 🟡 **Éditeur lignes devis** : l'UI montre les lignes mais ne permet pas de les modifier. Sprint 8 polish.

### Sprint 3 — Agenda + RDV + documents

- 🔴 **Appliquer migration 0006** (rendez_vous + documents_dossier).
- 🔴 **Créer bucket Supabase Storage `dossier-documents`** : privé, policies admin only. L'upload client se fait via service_role dans les Server Actions.
- 🟠 **Vue agenda semaine/jour** : seule la vue mois est livrée. Vues semaine + jour à ajouter Sprint 3.1 si Servicimmo les demande.
- 🟠 **Rappels email J-1 RDV** : la colonne `reminder_sent_at` est prête, mais le cron Edge Function n'est pas écrit. Sera livré Sprint 5 (avec les relances factures).
- 🟡 **Prévisualisation PDF/image inline** : upload OK, visualisation = download pour l'instant.

### Sprint 2 — Dossiers + wizard + Kanban

- 🔴 **Appliquer migration 0005** (dossiers + dossier_diagnostics + fonction `generate_dossier_reference`).
- 🟠 **DnD Kanban interactif** : version Sprint 2 est statique (colonnes SSR). Réintégrer `@dnd-kit` en Client Component pour drag & drop des cartes (Sprint 2.1 ou fin Sprint 2 en polish). Backend `updateDossierStatus` déjà prêt.
- 🟡 **Autocompletion adresse BAN** dans le wizard : non câblée (existe sur le questionnaire public, à porter).
- 🟡 **Step-by-step linéaire** (10 étapes PRD) : pour l'instant un formulaire à sections. À arbitrer avec Servicimmo en Sprint 8 selon feedback power-users.

### Sprint 1 — DB + auth + contacts

- 🔴 **Provisionner projets Supabase** `servicimmo-dev` + `servicimmo-prod` sur supabase.com, remplir `.env.local` avec URL + anon_key + service_role.
- 🔴 **Appliquer migrations 0001→0004** sur Supabase (SQL Editor ou CLI).
- 🟠 **Infos cabinet Servicimmo à remplir dans `organizations`** : SIRET, IBAN, TVA intracommunautaire, adresse complète. Stub pour l'instant (cf. seed migration 0004).
- 🟠 **Créer le premier utilisateur admin** dans Supabase Auth (Lyes et/ou Etienne) puis insérer la ligne `users_profiles` avec `role='admin'` et `organization_id` = id de Servicimmo.
- 🟡 **`PAPPERS_API_KEY`** — nécessaire pour l'enrichissement SIRET automatique des prescripteurs (UX nice-to-have, fallback saisie manuelle).

