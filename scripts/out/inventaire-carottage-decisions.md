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

## Décision 1 — Les 2 URLs « inconnues » sont des pages CASSÉES sur le site FC (révisé)

Le sitemap de FC contient un bug CMS : 2 `<loc>` sont littéralement coupés avec `...`.
URLs récupérées depuis la nav du site live :
- `/contexte-reglementaire-reperage-amiante-hap-enrobes-routiers-i8.html`
- `/reperage-amiante-hap-enrobes-routiers-incombe-aussi-aux-collectivites-i7.html`

**Constat** : en les fetchant directement, les DEUX renvoient exactement le même bloc
générique (le hero d'accueil « trouvez rapidement un opérateur… »), pas leur article
propre. Ces 2 pages sont donc **cassées côté FC** (ce qui explique la troncature du sitemap).
Aucun contenu réel exploitable.

**Décision (révisée)** : NE PAS fabriquer de pages (éviter le duplicate content).
Les 2 anciennes URLs sont **301 → `/expertises`** (l'index expertises). Résultat : **7 expertises
réelles** (pas 9). Total contenu : 191 + 58 + 7 = **256 pages**. À signaler à Servicimmo/FC :
2 pages de leur site actuel sont défaillantes.

## Décision 2 — Pas de fusion nécessaire

Contrairement à Servicimmo (DPE décliné sur 18 villes → fusion), FC n'a pas de doublons
de contenu par croisement type×ville. Chaque URL est une page distincte → mapping 1:1,
aucune grille de fusion à arbitrer.

## Décision 3 — Différenciation anti-duplicate (191 villes)

Confirmé selon le plan FC (§6) : gabarit ville à 4 structures tournantes + données réelles
(département parent, villes voisines), top 30 villes (par population) vraiment reformulées.
Les 58 départements : reformulation différenciée par lots.

## Notes de revue socle FC1 (à traiter plus tard — ne pas oublier)

Verdict revue Opus : **socle sain à poursuivre**, zéro régression Servicimmo. Points à câbler :

- **FC6 (SEO) — câblage `redirects-carottage.json`** : il n'est PAS encore branché dans
  `next.config.ts` (normal, routes FC pas construites). Au câblage : (1) **dédupliquer**
  `/index.html` et `/mentions-legales.html` qui existent AUSSI dans `redirects.json` (SI) ;
  (2) **host-scoper** les redirections FC avec `has: [{ type: "host", value: "<host FC>" }]`
  — sinon elles s'appliqueraient aussi sur le domaine Servicimmo.
- **FC2/FC4 — namespace `/zones/<slug>` partagé villes+départements** : 0 collision
  aujourd'hui (191 villes ∩ 58 depts), mais fragile. À trancher : garder `/zones` unifié
  en documentant la contrainte d'unicité, ou router les départements sous `/departements/<slug>`.
- **FC2 — `/carottage/*` indexable sur le host FC** : ajouter un canonical (ou rediriger
  vers l'URL propre) pour éviter le duplicate content `france-carottage.fr/carottage/zones/x`
  vs `france-carottage.fr/zones/x`.
- Durcissements déjà appliqués au socle : middleware match par segment exact (`=== "/carottage"`
  ou `startsWith("/carottage/")`), casse Corse `2A/2B` alignée sur la table DEPARTEMENTS.

## À confirmer par Etienne (non bloquant)

- Départements = 58 (le plan estimait 57) — un de plus, sans incidence.
- SIREN 433 994 563 partagé Servicimmo/FC (même entité légale ?) → impacte les mentions légales FC.
- Email interne FC pour les devis + clé Brevo : placeholders, à fournir avant FC5.
- Cible réelle du lien « Espace client » du site FC actuel.
