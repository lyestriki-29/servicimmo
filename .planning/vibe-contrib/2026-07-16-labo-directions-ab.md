# Pattern — Labo de directions in-app avec duel A/B par gabarit

**Statut** : brouillon à pousser vers la vibe-library (MCP non branché ce jour).
**Tag stack** : pattern indépendant de la stack. Démo réalisée en Next.js App Router +
Tailwind v4 (≠ library pnpm/Biome). Aucune dépendance ajoutée.

## Le problème
Deux agents (ou deux directions artistiques) produisent chacun une refonte des mêmes
pages. Le client doit trancher **sur pièce**, page par page, sans naviguer entre deux
environnements ni comparer des captures.

## Le pattern
1. **Route labo privée** dans l'app elle-même (`/preview/<projet>`, `robots: noindex`) :
   les maquettes héritent des vrais tokens, polices, header/footer — le jugement se fait
   dans le contexte réel, pas dans Figma.
2. **Un composant par direction/gabarit**, alimenté par des **données de démo partagées**
   (même contenu → seul le traitement varie ; le duel est honnête).
3. **Sélecteurs empilés** : direction → gabarit → **toggle « moteur A / moteur B »** qui
   monte le composant de l'autre agent *tel quel* (on importe son rendu, on ne le recopie
   pas). Barre collante : on bascule en plein milieu d'une section.
4. **Verdicts hybrides** : le client dit « page X : A, mais le hero de B ». On fusionne
   dans la version A du labo, le toggle permet de re-vérifier contre B pur.
5. La grille de verdicts devient le **cahier des charges** de l'implémentation réelle.

## Pièges vécus
- Vérifier chaque photo **visuellement** avant usage (les noms de fichiers mentent).
- Épingles/annotations posées en % : uniquement dans des panneaux à ratio verrouillé
  (`aspect-[4/3]`), jamais sur un hero plein écran (le cadrage dérive → collisions).
- Sortir la route `/preview/*` avant la bascule prod.
- Les maquettes « une seule couche » paraissent cheap à côté des vraies pages : stratifier
  (fond voilé + panneau + micro-légendes) dès la première version.
