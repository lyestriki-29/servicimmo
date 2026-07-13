# Palier inventaire France Carottage — décisions (2026-07-13)

Tranché en autonomie (Etienne absent, démarrage FC autorisé sans go). À relire à son retour.

## Inventaire réel (sitemap FC, 260 URLs)

| Type | Nb | Mapping cible |
|---|---|---|
| Villes | 191 | `/zones/<slug>` (gabarit ville) |
| Départements | 58 | `/zones/<slug>` (gabarit département) |
| Expertises | 7 + **2 récupérées** = **9** | `/expertises/<slug>` |
| Structurelles | 2 | `/` → home, `/mentions-legales.html` → `/mentions-legales` |
| Inconnues | 0 (résolues) | — |

Total contenu : 191 + 58 + 9 = **258 pages** + home + mentions.

## Décision 1 — Les 2 URLs « inconnues » étaient des expertises tronquées

Le sitemap de FC contient un bug CMS : 2 `<loc>` sont littéralement coupés avec `...`.
Récupérés depuis la nav du site live :
- `/contexte-reglementaire-reperage-amiante-hap-enrobes-routiers-i8.html` → expertise
  `contexte-reglementaire-reperage-amiante-hap-enrobes-routiers`
- `/reperage-amiante-hap-enrobes-routiers-incombe-aussi-aux-collectivites-i7.html` → expertise
  `reperage-amiante-hap-enrobes-routiers-incombe-aussi-aux-collectivites`

**Décision** : traités comme expertises normales à l'extraction (FC1.7), 301 vers `/expertises/<slug>`.

## Décision 2 — Pas de fusion nécessaire

Contrairement à Servicimmo (DPE décliné sur 18 villes → fusion), FC n'a pas de doublons
de contenu par croisement type×ville. Chaque URL est une page distincte → mapping 1:1,
aucune grille de fusion à arbitrer.

## Décision 3 — Différenciation anti-duplicate (191 villes)

Confirmé selon le plan FC (§6) : gabarit ville à 4 structures tournantes + données réelles
(département parent, villes voisines), top 30 villes (par population) vraiment reformulées.
Les 58 départements : reformulation différenciée par lots.

## À confirmer par Etienne (non bloquant)

- Départements = 58 (le plan estimait 57) — un de plus, sans incidence.
- SIREN 433 994 563 partagé Servicimmo/FC (même entité légale ?) → impacte les mentions légales FC.
- Email interne FC pour les devis + clé Brevo : placeholders, à fournir avant FC5.
- Cible réelle du lien « Espace client » du site FC actuel.
