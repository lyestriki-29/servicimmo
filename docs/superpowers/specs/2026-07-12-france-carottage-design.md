# Spec — Site France Carottage (multi-domaines, refonte complète)

**Date** : 2026-07-12
**Statut** : design validé par Etienne le 2026-07-12 (4 décisions ci-dessous)
**Contexte** : France Carottage (france-carottage.fr) est la société sœur de Servicimmo (mêmes locaux, même téléphone) — carottage routier, repérage amiante/HAP sur enrobés, réseau national. Son site actuel (même génération technique que l'ancien servicimmo.fr) doit être refondu **et** relié au nouveau site Servicimmo par un cross-linking animé dans les deux headers.

---

## 1. Décisions validées

| Décision | Choix |
|---|---|
| Architecture | **Même app Next.js, multi-domaines** : segment `app/carottage/`, routage par domaine dans `middleware.ts`, un seul déploiement Coolify |
| Périmètre géo-SEO | **Reprise complète** : 191 pages villes + 57 pages départements régénérées par gabarit |
| Identité visuelle | **ADN rouge/noir/blanc FC modernisé** au niveau de qualité de la home Servicimmo ; typo Sora conservée (identité portée par couleur, imagerie chantier, composition) |
| Conversion | **Formulaire devis B2B** (chantier, localisation, surface/linéaire, délai, coordonnées pro) → envoi via **Brevo** (API transactionnelle) |
| Séquencement | Chantier exécuté **après** les 22 tâches Servicimmo ; les cross-links se posent en fin (après le polish Servicimmo) |

## 2. Inventaire du site actuel (sitemap, vérifié)

260 URLs : **191 villes** (`amiante-hap-enrobes-routiers-<ville>-<cp>.html`), **57 départements** (`amiante-hap-enrobes-routiers-<dept>.html`, sans CP), **~8 pages éditoriales** (suffixe `-i<N>.html` : métier, cartographie chantier, réglementaire, réseau national, HAP, obligations MOA voirie, plomb, termites avant déconstruction), home, mentions légales.

## 3. Architecture multi-domaines

- Pages FC sous `app/carottage/` (segment réel). `middleware.ts` : si `host` ∈ {domaine FC prod, domaine FC préprod} → `NextResponse.rewrite` vers `/carottage<pathname>`. L'inverse est bloqué (accès direct `/carottage/...` depuis le domaine Servicimmo → redirect vers le domaine FC) pour éviter le duplicate cross-domaine.
- **URLs propres côté FC** : `france-carottage.fr/zones/loiret` (le préfixe `/carottage` n'apparaît jamais dans le navigateur).
- Canonicals/OG : `generateMetadata` des pages FC utilise `NEXT_PUBLIC_CAROTTAGE_URL` comme base absolue (jamais `metadataBase` Servicimmo).
- Sitemap/robots par domaine : `app/carottage/sitemap.ts` + `app/carottage/robots.ts`, exposés via rewrite (`/sitemap.xml` sur le host FC → `/carottage/sitemap.xml`).
- Config marque : `lib/clients/francecarottage/` (branding, coordonnées, certifications, URLs croisées) — symétrique de `lib/clients/servicimmo/`.
- Env : `NEXT_PUBLIC_CAROTTAGE_URL`, `NEXT_PUBLIC_SERVICIMMO_URL`, `NEXT_PUBLIC_CAROTTAGE_HOSTS` (liste des hosts FC), `BREVO_API_KEY`.

## 4. Arborescence cible (host FC)

```
/                      home FC (hero rouge/noir, métier, process, réseau national carte France,
                       références, chiffres, CTA devis)
/expertises            index des ~8 pages éditoriales modernisées
/expertises/[slug]     gabarit expertise (prose + CTA + maillage)
/zones                 carte de France interactive + liste des 57 départements
/zones/[slug]          gabarit département (57) ET ville (191) — même route, deux gabarits
/devis                 formulaire devis B2B → Brevo
/contact               coordonnées, zone d'intervention nationale
/mentions-legales      contenu réel repris
```

Toutes les anciennes URLs `.html` → 301 (host-based). Le lien « ESPACE CLIENT » du site actuel est conservé tel quel (lien externe existant, cible inchangée — à confirmer avec Servicimmo au moment du header FC).

## 5. Contenus

- Collections : `content/carottage/expertises/`, `content/carottage/departements/`, `content/carottage/villes/` — schémas Zod dédiés dans `lib/content/schemas-carottage.ts` (ville : slug, ville, codePostal, departement, lat/lng ; departement : slug, nom, code, villesPrincipales ; expertise : slug, titre, date facultative). Loaders réutilisent la mécanique `lib/content/load.ts` (générique `loadCollection` exporté).
- Scraping : le script existant gagne un mode `--site carottage` (sitemap FC + classifieur FC dédié `scripts/lib/classify-carottage.ts` : ville avec CP / département sans CP / éditorial `-iN`) → mêmes sorties (inventaire, mapping, redirects, contenus bruts). **Palier humain FC** sur l'inventaire avant extraction.
- Géocodage villes : API BAN (comme Servicimmo) ; départements : centroïde depuis une table statique des 96 départements (`lib/clients/francecarottage/departements.ts`).

## 6. Différenciation anti-duplicate (248 pages géo)

- **57 départements** : vraie reformulation différenciée par lots de ~10 (règles identiques aux villes Servicimmo : aucune phrase ≥8 mots partagée, pas d'inventions locales).
- **191 villes** : gabarit paramétrique riche — 4 structures de page tournantes (ordre des sections varié par hash du slug), données réelles injectées (département parent, 4 villes voisines par distance, CP), texte source lissé automatiquement. Les **30 plus grandes villes** (par population, table statique) reçoivent en plus une vraie passe de reformulation par agents.
- Contrôle anti-duplication automatisé étendu aux deux collections avant chaque commit de lot.

## 7. Formulaire devis B2B → Brevo

- `lib/brevo/client.ts` : appel REST `https://api.brevo.com/v3/smtp/email` (clé `BREVO_API_KEY`, header `api-key`), fonction `sendTransactionalEmail({ to, subject, htmlContent, replyTo })`, erreurs remontées sans fuite de clé dans les logs.
- Server Action `app/carottage/devis/actions.ts` : validation Zod (type de chantier : voirie/réseaux/bâtiment ; localisation ; surface ou linéaire estimé ; délai ; entreprise, nom, email pro, téléphone ; message libre ; honeypot anti-spam + délai minimal de soumission).
- Deux emails par soumission : notification interne (adresse FC à confirmer avec Etienne avant mise en prod — placeholder env `CAROTTAGE_EMAIL_INTERNAL`) + accusé de réception au demandeur.
- Pas de stockage DB en V1 (YAGNI) — évolution possible vers `quote_requests` plus tard.

## 8. Design FC

- Tokens dédiés dans `app/globals.css` : `--fc-rouge` (rouge FC ≈ #B32024, à pipeter sur le logo réel), `--fc-noir`, `--fc-blanc-casse`, `--fc-gris`. Interdiction d'utiliser les tokens `--color-si-*` dans `components/carottage/`.
- Composants dédiés `components/carottage/` : HeaderFC (bandeau utilitaire noir + barre blanche, bouton Servicimmo animé), FooterFC, HeroFC, sections home, gabarits. Réutilisation des primitives neutres (`Reveal`, `JsonLd`, carte Leaflet paramétrée France entière).
- Qualité cible = home Servicimmo validée : espacements généreux, hiérarchie typo stricte, imagerie chantier réelle (photos du site actuel récupérées au scraping, si qualité suffisante).

## 9. Cross-linking animé Servicimmo ↔ FC

- Composant `components/marketing/LienMarqueSoeur.tsx` (header Servicimmo) et symétrique FC : bouton pill avec logo de la marque sœur, animation hover (glissement du libellé + flèche, transition 250 ms cohérente avec les hovers existants), `aria-label` explicite, ouverture même onglet.
- URLs depuis env (`NEXT_PUBLIC_CAROTTAGE_URL` / `NEXT_PUBLIC_SERVICIMMO_URL`) → bascule préprod → prod sans toucher au code.

## 10. SEO technique FC

- 301 host-based : `next.config.ts` `redirects()` avec `has: [{ type: "host", value: "<host FC>" }]` depuis `lib/seo/redirects-carottage.json` (~260 entrées). Test e2e dédié (host simulé via header).
- JSON-LD : `LocalBusiness` (siège Tours) + `Service` avec `areaServed: "France"` ; `BreadcrumbList` sur les pages profondes.
- Metadata par page, OG, maillage : footer FC (départements majeurs + expertises), gabarit ville → département parent + villes voisines.

## 11. Tranches de livraison (après le chantier Servicimmo)

| # | Tranche | Critère de passage |
|---|---|---|
| FC1 | Socle : middleware multi-domaines + layout FC + classifieur/scraping FC + inventaire | e2e : host FC → pages FC, host Servicimmo inchangé ; **palier humain FC** sur l'inventaire |
| FC2 | Design system FC + home | Screenshots desktop/mobile validés visuellement |
| FC3 | Expertises (~8 pages modernisées) | Échantillon relu ; typecheck/tests verts |
| FC4 | Zones : gabarits département + ville, carte France, 248 pages, anti-duplication | Scan anti-duplication vide ; spot-check 5 départements + 5 villes |
| FC5 | Devis Brevo + contact + légales | Envoi réel testé en préprod (clé Brevo de test) |
| FC6 | SEO : 301 host-based + sitemaps + JSON-LD + **cross-links animés des deux côtés** | e2e 301 vert ; boutons croisés fonctionnels sur les deux hosts |
| FC7 | QA + déploiement préprod Coolify (sous-domaine FC) | Batterie complète verte ; Lighthouse ≥ 90 mobile ; validation client |

## 12. Risques

| Risque | Mitigation |
|---|---|
| Duplicate content massif (191 villes) | Gabarit à 4 structures tournantes + données locales réelles + scan anti-duplication + top 30 reformulées |
| Régression Servicimmo via middleware | Middleware ne réécrit QUE si host ∈ hosts FC ; e2e sur les deux hosts dans la CI de la tranche FC1 |
| Rouge FC vulgaire à l'écran | Pipeter le rouge du logo réel, l'utiliser en accent (pas en aplat géant), noir/blanc dominants |
| Brevo mal configuré | Clé de test en préprod, envoi réel vérifié en FC5 avant bascule |
| Adresse email interne FC inconnue | Env `CAROTTAGE_EMAIL_INTERNAL`, à confirmer avec Etienne avant FC5 |

## 13. Hors périmètre

- Espace client FC (lien externe conservé tel quel).
- Bascule DNS france-carottage.fr (après validation client sur préprod).
- Back-office d'édition des contenus FC.
