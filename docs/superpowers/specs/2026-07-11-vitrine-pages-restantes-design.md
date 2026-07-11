# Spec — Finalisation des pages du site vitrine (services, villes, actualités, contact, légales, SEO)

**Date** : 2026-07-11
**Statut** : validé sur le principe (périmètre + découpage) par Etienne le 2026-07-11
**Contexte** : la home (`/`) et le questionnaire (`/devis` + modale) sont finis, validés client et déployés sur `servicimmo.propulseo-site.com`. Ce chantier couvre **tout le reste du site vitrine** pour permettre la bascule du domaine `servicimmo.fr`.

---

## 1. Décisions validées

| Décision | Choix |
|---|---|
| Périmètre | **Reprise complète** : 21 pages services + ~40 pages villes + ~100 articles |
| Source contenu | **Scraping de l'ancien site** (toujours en ligne, sitemap 32 Ko disponible) puis modernisation |
| Articles | **Reformulés et améliorés** (pas un simple portage) — voir §6 |
| Stockage | **Fichiers Markdown dans le repo** (`content/`), pas de Supabase pour la vitrine |
| SEO technique | **Inclus** : 301 des ~193 anciennes URLs, sitemap, robots, metadata, JSON-LD |
| Page « à propos » | **Non** — la section home `/#apropos` (validée) fait le travail |
| Formulaire contact | **Non** — le questionnaire reste l'unique tunnel ; tél + adresse + mailto suffisent |
| Home | Validée client, **pas de refonte** — mais une **passe de polish** en fin de chantier (méthodo peaufinage Propulseo) : micro-améliorations (transitions, reveals, rythme, détails), **aucun changement de structure ni de contenu** sans validation |

## 2. Hors périmètre

- App Pilote interne (`app/(app)`), portail, auth — chantier séparé (Phase 1).
- Bascule DNS `servicimmo.fr` → nouveau site (se fait après validation client du site complet).
- Back-office d'édition des contenus (les fichiers Markdown suffisent ; migration Supabase possible plus tard).
- Prise de RDV, paiement en ligne, CRM prescripteurs (V2 du PRD).

## 3. Arborescence cible

```
app/(marketing)/
├── page.tsx                        # home — EXISTANTE, ne pas toucher
├── services/
│   ├── page.tsx                    # catalogue : grille des 21 diagnostics + CTA questionnaire
│   └── [slug]/page.tsx             # gabarit service (DPE, amiante, plomb, termites…)
├── zones/
│   ├── page.tsx                    # carte Leaflet 37 + liste des villes
│   └── [slug]/page.tsx             # gabarit ville (diagnostic-immobilier-tours…)
├── actualites/
│   ├── page.tsx                    # liste paginée (12/page)
│   ├── page/[n]/page.tsx           # pagination statique SEO
│   └── [slug]/page.tsx             # gabarit article
├── contact/page.tsx                # enrichie : infos, horaires, carte, CTA questionnaire
├── mentions-legales/page.tsx       # contenu réel repris de l'ancien site
└── cgv/page.tsx                    # contenu réel repris de l'ancien site
```

La nav header gagne « Zones d'intervention » ; le footer liste les villes principales et les services majeurs pour le maillage interne.

## 4. Modèle de contenu (`content/`)

Trois collections de fichiers Markdown avec frontmatter, lues au build (`generateStaticParams` + fs). Rendu Markdown → HTML via `marked` (déjà présent, à déplacer en `dependencies`) + `gray-matter` (à ajouter) pour le frontmatter.

```
content/
├── services/<slug>.md    # titre, metaTitle, metaDescription, anciennesUrls[],
│                         # ordre, obligatoirePour[], dureeValidite, prixIndicatif?
├── villes/<slug>.md      # ville, codePostal, metaTitle, metaDescription, anciennesUrls[]
└── articles/<slug>.md    # titre, date (originale conservée), metaTitle, metaDescription,
                          # anciennesUrls[], extrait, categorie?
```

Un module `lib/content/` (pur, testé Vitest) charge et valide chaque collection avec un schéma Zod — un frontmatter invalide **casse le build** (pas de page silencieusement vide).

## 5. Pipeline de scraping (one-shot)

Script `scripts/scrape-ancien-site.ts`, lancé manuellement, jamais dans le build :

1. Télécharge `https://www.servicimmo.fr/sitemap.xml` (~193 URLs).
2. Classe chaque URL par heuristique : ville (`diagnostic-immobilier-<ville>-<cp>.html`), article (suffixe `-i<N>.html`), service (le reste), structurelle.
3. Produit un **rapport d'inventaire** (`scripts/out/inventaire.md`) : liste classée + anomalies. **Palier de validation : le rapport est relu avant de générer quoi que ce soit.**
4. Extrait le contenu de chaque page (`cheerio`, à ajouter en devDependencies) → fichiers Markdown bruts dans `content/` + `redirects.json` (ancienne URL → nouvelle route).
5. Les pages orphelines/inclassables sont listées dans le rapport avec une 301 proposée vers la page la plus proche.

## 6. Modernisation des contenus

- **Services + villes** : restructuration dans les nouveaux gabarits, réécriture des tournures datées, conservation des mots-clés et du champ lexical qui rankent. Chaque page ville reste différenciée (pas de texte dupliqué à 90 % entre villes — reformulation vraie ville par ville).
- **Articles — règle de fond** : on améliore la **forme** (style, structure, lisibilité), on ne réécrit **pas les faits réglementaires**. Un article dont la réglementation a évolué depuis (ex. DPE pré-2021) garde ses faits d'époque et reçoit un encadré « Archive — la réglementation a évolué depuis, voir [article/page à jour] ». Les dates de publication originales sont conservées.
- Traitement **par lots de ~10 avec sous-agents**, relecture par échantillon (10 articles, 5 villes, 5 services relus intégralement avant de valider le lot suivant).
- Titres H1 et meta : conservés quand ils sont bons, améliorés quand ils sont génériques — jamais de perte du mot-clé principal.

## 7. Gabarits — design

Continuité **stricte** de la home validée : palette pétrole/crème, typo Sora, mêmes conteneurs 1280 px, liserés et espacements identiques, composant `Reveal` pour les apparitions au scroll.

- **Gabarit service** : hero compact (titre + accroche + badges certif), corps de l'article (qui est concerné, validité, déroulement, tarifs indicatifs), encadré « obligatoire pour vente/location », CTA questionnaire en fin et en sticky mobile, maillage vers services liés + villes.
- **Gabarit ville** : hero avec nom de ville + CP, texte SEO modernisé, rappel des services disponibles, distance/délai d'intervention depuis Tours, CTA questionnaire, maillage villes voisines.
- **Gabarit article** : en-tête (titre, date, catégorie), corps prose lisible, encadré archive si applicable, articles liés, CTA discret.
- **Catalogue services** : grille de cartes (icône Lucide, titre, une ligne, lien).
- **Zones** : carte **Leaflet + OSM** (import dynamique client-only, `leaflet` + `react-leaflet` à ajouter) montrant le 37 + périphérie, liste des villes groupée par zone.
- **Actualités** : liste avec pagination statique (12/page), tri antéchronologique.
- **Contact** : coordonnées, horaires, carte (réutilise le composant zones), CTA questionnaire. Pas de formulaire.

## 8. SEO technique

- **301** : `redirects.json` généré par le script → consommé par `redirects()` dans `next.config.ts`. Les 193 anciennes URLs couvertes, zéro 404.
- **`app/sitemap.ts`** + **`app/robots.ts`** générés depuis `lib/content/`.
- **Metadata** par page via `generateMetadata` (title, description, canonical, OpenGraph) ; `metadataBase` depuis `NEXT_PUBLIC_APP_URL`.
- **JSON-LD** : `LocalBusiness` (layout marketing), `Service` (pages services), `Article` (articles), `BreadcrumbList` (pages profondes).
- **Maillage interne** : footer (villes + services majeurs), blocs « services liés » / « villes voisines » dans les gabarits.

## 9. Tranches de livraison (chacune testée avant la suivante)

| # | Tranche | Critère de passage |
|---|---|---|
| 1 | Socle : scraping + inventaire + `lib/content/` + schémas Zod + tests | Inventaire relu ; `pnpm test` + `typecheck` verts |
| 2 | Services : gabarit + catalogue + 21 pages modernisées | Screenshots Playwright desktop/mobile ; échantillon 5 pages relu |
| 3 | Villes : gabarit + carte Leaflet + ~40 pages | Idem ; textes villes non dupliqués |
| 4 | Actualités : gabarit + pagination + 100 articles reformulés | Échantillon 10 articles relu ; règle « archive » appliquée |
| 5 | Contact enrichi + mentions légales + CGV réelles | Rendu vérifié ; contenu légal flaggé « à valider Servicimmo » |
| 6 | SEO : 301, sitemap, robots, JSON-LD, metadata | Test automatisé : chaque ancienne URL → 301 → 200 ; sitemap valide |
| 7 | Polish transversal : passe de peaufinage sur la home (validée → micro-améliorations seulement) + cohérence inter-pages (transitions, reveals, rythme vertical, liserés/cartes) | Screenshots avant/après ; zéro changement de structure/contenu sur la home |
| 8 | QA finale | `typecheck` + `lint` + `test` + e2e verts ; Lighthouse ≥ 90 mobile sur 1 page de chaque type ; parcours réel vérifié en local |

Travail sur une branche dédiée `feat/vitrine-pages-completes` (depuis `feat/vitrine-home-portage`), commits par tranche, déploiement Coolify en fin de chantier pour validation client.

## 10. Risques

| Risque | Mitigation |
|---|---|
| Scraping incomplet ou mal classé | Palier de validation humaine sur l'inventaire (tranche 1) avant toute génération |
| Reformulation qui dégrade le SEO | Mots-clés conservés, meta gardées quand bonnes, échantillons relus par lot |
| Faits réglementaires altérés dans les articles | Règle « forme oui, fond non » + encadré archive (§6) |
| Textes villes quasi identiques (duplicate content) | Reformulation différenciée par ville, vérif d'échantillon |
| `marked` en devDependencies élagué au build standalone | Déplacé en `dependencies` dès la tranche 1 |
| Contenu légal obsolète | Repris de l'ancien site + flag explicite « à valider par Servicimmo avant bascule » |
