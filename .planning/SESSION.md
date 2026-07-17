# Session State — 2026-07-17 (soir) — Actualités réelles + verdicts Fable

## Branch / Commit
`feat/vitrine-pages-completes` — voir dernier commit (dirty avant commit : ~137 fichiers)

## Completed This Session
- **Actualités** : 125 articles catégorisés (taxonomie fermée, enum Zod), cartes d'accueil
  branchées sur les vrais articles (fini les liens morts + dates fausses), filtre /actualites figé.
- **Détail service** : hero conforme à la capture (kicker mono, titreAccent vert, badge Obligatoire,
  CTA modale) + section « déroulé de l'intervention » (`deroule:` par fiche, 20 services).
- **Corps d'article** : espacement corrigé à la source (`.article-prose`) + décodage des entités
  du sommaire (`d&#39;ordre` → `d'ordre`), util `lib/content/html.ts` testé.
- **Verdicts tranchés** : /services → Fable, /zones → Fable, /contact → hero « voile allégé » (B).
  Toggle d'arbitrage `?v=` construit puis RETIRÉ une fois choisi.

## Next Task
- **Spec du questionnaire allégé** (toujours en attente — brainstorming à l'étape spec).
- Puis : retirer le dead code (`ServicesCatalogHero`, `ZonesExperience` composant, `ContactLocalHero`),
  sortir « références-clients » des actualités, champ `archetype` sur les villes.
- Effort conseillé : `Max`.

## Blockers
- **Déroulés des 20 services = propositions de l'IA**, à valider par Etienne (cf. BLOCKERS.md).
- **Photo équipe** (`equipe.jpg`) mal cadrée (5 personnes, 2 visibles) : vraie photo à fournir.

## Key Context
- Détail complet → `.planning/PROGRESS_maquettes-pages-si.md`. Serveur dev en fond (:3000).
- `/devis` N'EXISTE PAS : le devis est une modale (`useQuoteModal`). Toute maquette qui pointe
  vers `/devis` fabrique un lien mort.
