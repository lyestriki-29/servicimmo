# PROGRESS — Refonte pages intérieures Servicimmo (direction G)

> Feature multi-sessions. Labo : `/preview/claude` (composants `components/preview/claude/`).
> Toggle Fable/Codex par gabarit. Codex pur reste visible via le toggle et `/preview/servicimmo`.

## ✅ Verdicts TRANCHÉS le 2026-07-17 (priment sur le tableau du 16/07)

- **`/services` → Fable** (`ServicesFable.tsx`) — validé sur le rendu réel.
- **`/zones` → Fable** (`ZonesFable.tsx`) — validé sur le rendu réel.
- **`/contact` → Fable pour le bas** (fiche agence `ContactAgence` + vrai formulaire),
  **hero = « voile allégé »** (`ContactHeros.tsx` → `ContactHeroVoileLeger`), choisi parmi
  4 heros comparés en direct. Le voile Fable d'origine (92 %) cachait l'équipe ; le retenu
  laisse la photo lisible à droite.
- **Toggle RETIRÉ** une fois les verdicts pris : `ToggleVariante.tsx` supprimé, variantes
  concurrentes (`ContactHeroClair`, `ContactHeroReleve`, `ContactHeroFable`) supprimées,
  les 3 pages figées sur leur direction. Les anciens composants prod
  (`ServicesCatalogHero`, `ServicesProjectExperience`, `ZonesExperience` **le composant**,
  `ContactLocalHero`) ne sont plus rendus — **dead code à retirer** de `ValidatedPageDesigns.tsx`
  et `ZonesExperience.tsx` (⚠️ ce dernier exporte `SECTEUR_PAR_SLUG`/`ZoneCity`, réutilisés
  par `ZonesFable` : déplacer ces exports avant de supprimer le composant).
- ⚠️ **`equipe.jpg` = panorama à 5 personnes, mal cadré** (2 visibles, véhicules coupés).
  Aucun texte n'avance d'effectif. **Une vraie photo d'équipe cadrée reste à fournir.**
- **TOGGLE LIVRÉ le 17/07** (le client l'a redemandé malgré le coût) : `?v=fable` sur
  `/services`, `/zones`, `/contact` + sélecteur flottant « Comparer ». Composant
  `ToggleVariante.tsx` (query param, pas de state : URL partageable, survit au refresh,
  contrairement au `useState` du labo). Masqué en prod sauf `NEXT_PUBLIC_VARIANTES=1`.
  **Code temporaire à retirer une fois les verdicts tranchés** : `ToggleVariante.tsx`,
  `ServicesFable.tsx`, `ZonesFable.tsx`, `ContactFable.tsx` + les branches dans les 3 pages.
- **Constat qui a rendu le portage nécessaire** : les gabarits du labo `/preview/claude` sont
  **autonomes** — données de démo en dur (`PREVIEW_PAGES`), aucun ne prend `Service`/
  `Ville`/`Article` en props. Le mapping n'est pas 1:1 : le labo itère sur `items[]` (4 blocs),
  la prod injecte `service.html` (Markdown compilé). Chaque variante a donc été réécrite.
- **Écarts assumés du portage** (le labo mentait sur ces points) :
  - `/services` : le « relevé du catalogue » montre les **6 premiers** services + un compteur
    (20 lignes dans le panneau de verre seraient illisibles) ; `item.meta` du labo (famille
    Énergie/Santé/…) n'existe pas au schéma → remplacé par `obligatoirePour`.
  - `/zones` : le labo listait **18 communes en dur** (il en manque une depuis Tours) et
    portait **3 liens morts** (2 × `/devis`, 1 × `#`). Porté sur `content/villes/` (19),
    regroupement via `SECTEUR_PAR_SLUG`, pastilles → `/zones/[slug]`.
  - `/contact` : le `<form>` du labo est **décoratif**. La variante Fable ne reprend que le
    hero + la fiche agence et garde le VRAI `ContactExperience` (le motif voyage avec la
    demande), avec `avecCarte={false}` pour ne pas charger deux Google Maps.
  - **`/devis` n'existe pas** : le devis est une modale (`useQuoteModal`). Toute maquette
    qui pointe vers `/devis` produit un lien mort — vérifier à chaque portage.
- **Duplication divergente labo ↔ prod** : 3 copies du bloc « Je vends / Je loue / … »
  (`ServicimmoPreviewSurface`, `GabaritServices`, `ValidatedPageDesigns`) avec des
  libellés DIFFÉRENTS. Dette à traiter au moment de sortir le labo.
- **Le PROGRESS était périmé** : les 8 gabarits SONT déjà implémentés sur les vraies
  pages (`ValidatedPageDesigns.tsx`) — ce n'est plus un reste-à-faire.
- **Contrainte produit nouvelle** : « à terme tout devra être éditable via un admin ».
  Le contenu vit aujourd'hui en Markdown versionné (`content/`) ; le CLAUDE.md prévoit
  des tables Supabase `services`/`articles`/`cities`. Tension à trancher au moment de
  l'app Pilote — noté, rien changé.

## Verdicts client (2026-07-16) — le cahier des charges

| Gabarit | Verdict validé |
|---|---|
| Détail ville | Fable (G1b : relevé données + photo « carte postale » voilée en hero ; archétypes de bâti pour l'échelle) |
| Services | Fable + section catalogue forme Codex (panneau encre + lignes Énergie/Santé/Sécurité/Surface) |
| Détail service | Fable + hero atlas Codex (fiche pratique / titre accent vert / photo badgée) |
| Actualités | Codex (carte à la une, liste datée) + masthead crème & barre mono Fable |
| Détail article | Fable (cartouche, relevé « à retenir », sommaire collant, citation tirée) |
| Zones | Carte immersive plein cadre : panneau pilotage flottant, pastilles communes → recentrage carte |
| Contact | Fable (hero équipe + fiche agence) + bas Codex (motifs + formulaire) |
| Pages légales | Fable (ouverture sombre + cartouche technique + sommaire paginé) |

## Décisions structurantes
- **Cartes = Google Maps** (choix client explicite). **RGPD tranché le 2026-07-17 : PAS de consentement.** Le clic-pour-charger a été construit (commit `15b1f7a`, spec `2026-07-16-consentement-google-maps-design.md`) puis **retiré à la demande du client**, qui juge l'encart préjudiciable à l'image et assume le risque. La carte se charge donc avec la page sur 20 pages, sans accord préalable — non conforme art. 82, en connaissance de cause. La section « Cookies et traceurs » des mentions légales est CONSERVÉE et dit la vérité (l'IA transmet à Google, on peut bloquer via le navigateur). Chemin de retour intact : réactiver `15b1f7a`.
- **Heros : deux familles** (2026-07-17). *Vitrine* (accueil, /zones, ville, contact) = le hero remplit exactement l'écran, on ne voit que lui. *Contenu* (services, fiche service, actualités, légales) = en-tête compact qui laisse voir le début du contenu. Détail → mémoire `[[heros-plein-ecran-si]]`.
- **Archétypes de bâti** (ville) : panneaux annotés une fois, villes rattachées par champ frontmatter `archetype`. Zéro photo obligatoire par ville ; photo « carte postale » optionnelle, jamais annotée.
- **Architecture articles validée** : frontmatter `resume:` (encadré À retenir), `image:`+`imageLegende:`, sommaire auto depuis `##`, 1re citation `>` promue en citation tirée, « à lire ensuite » auto par catégorie + override `lireEnsuite:`.
- **Bande de confiance** partagée (1998 / COFRAC LCC Qualixpert & iCert / RCP Allianz / 10 000+) répétée sur les pages.
- Photos : TOUJOURS vérifiées visuellement avant usage (cf. mémoire). Amboise réelles via Wikimedia Commons — CC BY-SA, crédits dans `public/img/si/claude/CREDITS.md`, attribution ou remplacement avant prod.

## Fait le 2026-07-17 (17 commits, `7d50800..a824e25`)
- ✅ **Revue adversariale** (53 agents) : 45 constats → 34 confirmés, 11 réfutés. 15 commits de correction.
  Bugs réels (champs du formulaire contact jetés, 37230 → Luynes/Fondettes, tri d'articles instable),
  a11y (5 alts qui décrivaient d'autres photos, contrastes sous AA), légal (éditeur FC, hébergeur OVH,
  liens légaux au footer), perf (images, AVIF, titres dédoublés), page Tours créée.
- ✅ **Heros** : les 9 pages traitées, mesurées au navigateur à 673 et 1100 px.

## Fait le 2026-07-17 (2e session)
- ✅ **Taxonomie articles** : 8 catégories sur l'axe diagnostic (DPE & énergie 54, Amiante 32,
  Location & vente 15, Risques naturels 8, Profession & marché 7, Plomb 3, Termites 3, Élec & gaz 3),
  écrites dans les 125 frontmatters. `CATEGORIES_ARTICLE` = enum Zod fermé → un article sans
  catégorie casse le build. 4 tests ajoutés.
- ✅ **Cartes actualités de l'accueil** : elles étaient **en dur avec 4 liens morts** (`href="#"`)
  et des **dates fausses** (« Avril 2026 » sur un article de février). Branchées sur `loadArticles()` :
  vrais titres/dates/liens, vérifié 200. Vignettes = `alt=""` (décoratives) — `blog1.jpg` est un
  thermostat qui était étiqueté « Amiante ». 2 cartes/3 partagent la même photo (2 articles Amiante).
- ✅ **Filtre /actualites** : se calculait sur les 12 articles de la page courante (rubriques
  changeantes en paginant) + `slice(0,6)`. Désormais assis sur la taxonomie fixe.
- ✅ **Détail service** : hero conforme à la capture Fable (kicker mono, `titreAccent:` coloré,
  badge « Obligatoire », CTA pilule lime) + section « Le déroulé de l'intervention ». Bas inchangé.
  ⚠️ Le CTA est un **bouton** (modale `useQuoteModal`) : **la route `/devis` n'existe pas**, la
  maquette pointait dessus — copier le lien aurait ajouté un lien mort.
- ✅ **Espacement des corps d'article** (cause racine) : `.article-prose` ne définissait AUCUNE
  marge, le reset Tailwind les met à 0 et le corps est du HTML injecté → tout se touchait. Chaque
  page bricolait `[&_h2]:mt-9` en oubliant les `<p>`. Corrigé dans `globals.css` pour les 3 familles
  (services, villes, actualités) : 41,6 px avant un intertitre, 11,2 px après, 18,4 px entre paragraphes.

## Reste à faire
1. **Spec du questionnaire allégé** — brainstorming EN COURS, 3 arbitrages pris (coupe stricte / deux temps /
   e-mail seul tôt), maquette validée sur `/preview/dossier`, **spec pas écrite**. 5 fichiers de maquette non commités.
2. **Verdicts Fable services / zones / contact** (cf. révisions ci-dessus) ; champ `archetype` sur les 19 fiches villes ;
   `image:`+`imageLegende:` articles **quand la banque photo existera** (on n'a que 3 photos d'articles pour 125).
3. **Sortir « Nos références clients » des actualités** (`content/articles/references-clients.md`) : page
   commerciale, pas de la veille. 3 autres contenus datés 2017-01-01 sont des pages piliers, pas des actus.
3. Contenu : citation d'article placeholder ; jalons J0-J2 du DPE à confirmer ; libellé « 18 communes » (→ 19 avec Tours).
4. Nettoyage : `VilleMapSection.tsx` orphelin (jamais tranché) ; `.design-sync/` à gitignorer ; sortie du `/preview/*` avant prod.
5. **Pour Etienne** : SIRET complet (14 chiffres — les sites publient le SIREN mal étiqueté), médiateur de la
   consommation, ville du greffe, n° RCP + couverture géo, code APE. Et **valider les durées de conservation**
   que j'ai proposées sans pouvoir les vérifier (3 ans prospect / 10 ans comptable ; le délai des rapports
   relève du Code de la construction).
6. Vieux rappel : code-review des 16 commits questionnaire (pré-existant).
