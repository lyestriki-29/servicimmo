# Pattern : migrer un wizard fragile (accordéon multi-moteurs) → flux linéaire pur

> **Statut** : brouillon local à pousser vers vibe-library plus tard (MCP non branché au 2026-07-14).
> **Tag stack** : Next.js App Router + Zustand(persist) + Zod + Vitest. **Divergence** : projet en
> **pnpm / ESLint** (pas Biome). Prendre les PRINCIPES, pas le tooling.

## Problème type
Un formulaire « intelligent » multi-étapes devient buggé quand la navigation est pilotée par
**plusieurs moteurs d'état** simultanés (ex. accordéon externe + sous-blocs repliables internes,
2 fonctions de séquencement). Symptômes : étapes optionnelles qui figent la progression, gros
fichiers (> 300 l.), et un récap **bloqué derrière un appel réseau** (une erreur réseau empêche
de voir le résultat calculable en local).

## Direction (approche « garder le cerveau, refaire le squelette »)
1. **Une seule source de vérité du flux** : fonction PURE `getSteps(branch): Step[]` où
   `Step = { id, title, optional, isComplete(data) }`. La composition ne dépend que de la branche ;
   `data` pilote la complétion via `isComplete` + des helpers `firstIncompleteIndex(steps, data)` /
   `resolveStepIndex(steps, currentId, data)` (clamp au premier incomplet, retour arrière libre).
   → robuste au changement d'une réponse antérieure (recalcul, pas d'état dérivé).
2. **Un composant écran générique** `StepScreen` + un composant de champs par étape (layout plat,
   fini les sous-blocs repliables). Map `Record<StepId, Component>`.
3. **Récap dé-bloqué** : calculer le résultat **en local, instantanément** (moteur pur + données de
   secours), afficher tout de suite, et lancer l'enregistrement/refresh serveur en **fire-and-forget
   + 1 retry** (échec silencieux, non bloquant). L'id serveur ne sert qu'à relier la soumission finale.
4. **Frontière client/serveur** : extraire le calcul PUR dans un module sans dépendance serveur
   (`*-core.ts`) pour qu'un Client Component puisse l'importer sans tirer `next/headers` dans le
   bundle. Le module « chargement de config depuis la DB » reste server-only et **ré-exporte** le core.
   → *le `next build` attrape cette erreur, pas le typecheck.*
5. **Persistance locale** : bumper la version du store persant (`vN → vN+1`) au déploiement pour
   **purger** les états à l'ancienne structure (sinon un état périmé ressurgit).

## Tells de qualité (leçons de cette session)
- **Écrire les tests du moteur PUR d'abord** s'ils manquent (ils verrouillent le comportement
  pendant qu'on recâble l'UI ; ne jamais « adapter le moteur au test », adapter le test au moteur).
- **Le vrai garde-fou = `build` end-to-end**, pas seulement typecheck/tests : il révèle les fuites
  client/serveur et le prerender.
- Capturer l'email **tôt mais pas trop** (après quelques écrans d'engagement) = meilleur ratio
  friction ↔ lead récupérable sur abandon.
- Chercher les **bugs latents pré-existants** en cartographiant : ici, une API exigeait un champ
  jamais collecté (blocage) et une route appelée par le front n'existait pas (404).
