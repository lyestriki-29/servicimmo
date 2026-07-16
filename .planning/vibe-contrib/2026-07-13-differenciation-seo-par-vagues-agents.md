# Pattern — Différencier N pages SEO géo par vagues de sous-agents (anti-duplicate)

> Brouillon de contribution vibe-library (MCP non branché cette session).
> Généralisé depuis un chantier réel : 248 fiches géo (villes + départements) d'un
> site vitrine multi-domaines. Tag stack : Next.js App Router + contenu markdown
> frontmatter validé Zod — indépendant du reste de la stack (npm/pnpm indifférent).

## Problème
N pages SEO locales issues d'un scraping partagent des textes quasi identiques
(duplicate content) + frontmatter sale (noms pollués, coordonnées en échec de
géocodage silencieux, contenus attribués au mauvais territoire).

## Pattern (3 niveaux de différenciation, du moins cher au plus cher)
1. **Structurel (code, pas d'agents)** : gabarit paramétrique — hash déterministe
   du slug → K variantes d'ordre de sections (fonction pure + tests TDD).
2. **Rédactionnel ciblé** : top ~15 % des pages (par enjeu SEO) = vraie rédaction
   originale par sous-agents.
3. **Lissage de masse** : le reste = reformulation courte conforme au schéma.

## Orchestration par vagues (chat-loop, PAS un workflow monolithique)
- Vagues de 5-7 agents parallèles, ~10-25 fichiers PAR agent (gros lots = moins
  d'overhead ; 1 fichier/agent gaspille).
- **Angle rédactionnel IMPOSÉ différent par lot** (réglementaire / terrain / enjeux
  client / types de chantiers / logistique / labo) → réduit les collisions entre
  agents qui ne se voient pas.
- Chaque prompt : schéma Zod à lire d'abord, interdits factuels (« n'invente aucun
  fait local »), consignes frontmatter exactes, « écris EN PLACE, réponds en 3 lignes ».
- Entre les vagues : **scan anti-duplication** (phrases ≥8 mots normalisées,
  sentence-level, script ~20 lignes) + tests + commit par vague. Le scan est le
  filet : les agents s'auto-vérifient mais ne voient pas les lots parallèles.

## Gains inattendus (à provoquer)
Demander aux agents de SIGNALER les anomalies : ils ont détecté des contenus
attribués au mauvais territoire (7+ cas), un géocodage en échec silencieux
(1/3 des fiches sur les coordonnées du siège — corrigé ensuite en une passe via
l'API BAN), des faits douteux à écarter. Le lot de réécriture devient un audit.

## Pièges
- Ne jamais lancer une vague qui écrit dans un dossier où une autre vague écrit encore.
- `cmd | tail -1 && suite` : le pipe masque l'exit code — vérifier les exits hors pipe.
- Les tests qui chargent le VRAI contenu (pas des fixtures) sont ce qui attrape
  les frontmatters cassés des agents.
