# Pattern — Prototyper des variantes d'UI sur la vraie route, pas dans un bac à sable

> Brouillon de contribution vibe-library. Généralisé et anonymisé.
> **Tag stack** : Next.js App Router + Tailwind. Le pattern lui-même est agnostique
> (il tient dans n'importe quel framework avec routage et query params).

## Le problème

Faire valider une direction visuelle par un client ou un décideur non technique.
Les approches habituelles échouent chacune à leur façon :

- **Décrire en texte** : il valide, puis découvre le rendu et change d'avis.
- **Maquette externe (image, page isolée)** : tout paraît bon dans le vide. Les vrais
  problèmes n'apparaissent qu'au contact du header réel, des vraies données, de la
  vraie densité, des sections voisines.
- **Implémenter puis itérer** : coûteux, et le décideur s'attache à la première version
  vue, ce qui bride les propositions vraiment différentes.

## Le pattern

Monter **N variantes structurellement différentes sur la route réelle**, sélectionnables
par un paramètre d'URL, avec une barre flottante de bascule. Le décideur flippe entre
elles dans le vrai site.

```
/ma-page                  → version actuelle (base de comparaison)
/ma-page?variant=a        → variante A
/ma-page?variant=b        → variante B
```

Points de conception qui font que ça marche :

1. **Garder l'existant comme première option.** On compare toujours à quelque chose.
2. **La barre de bascule est visuellement étrangère au design** (pilule noire fixe en
   bas) pour qu'on ne la confonde pas avec l'interface évaluée. Flèches + clavier.
3. **Ne jamais exposer en production.** Le paramètre n'est lu que hors production, et la
   barre n'est rendue que hors production — un merge accidentel ne peut rien exposer.
   ```
   const dev = process.env.NODE_ENV !== "production";
   const cle = dev && VARIANTES.some(v => v.cle === param) ? param : "actuel";
   ```
4. **Les variantes doivent diverger sur la STRUCTURE**, pas sur la couleur. Trois grilles
   de cartes légèrement retouchées ne sont pas des variantes, c'est du papier peint.
5. **Code jetable, marqué comme tel** : un dossier `prototype/` à côté du vrai composant,
   commentaire d'en-tête explicite. Aucun test, aucune abstraction.
6. **À la validation : consolider le gagnant en vrai composant, supprimer tout le reste**
   (variantes perdantes + barre + lecture du paramètre). Ne pas laisser deux patterns
   coexister, sinon le prochain composant écrit par copie repart du mauvais.

## Ce que ça a donné en pratique

Sur une refonte de site vitrine (4 pages), après deux propositions refusées comme
« trop classiques » :

- Le décideur a choisi par lettre en 2 minutes par page, sans réunion.
- Les retours utiles sont arrivés **après** avoir vu (« j'aime bien la B mais elle est trop
  grande et trop répétitive ») — impossible à obtenir sur une description.
- Un des retours a été un mix (« la structure de A avec le badge de B »), ce qui est
  précisément le signal qu'on cherche.

## Piège principal

**Ne pas confondre variantes et itérations.** Si les N propositions sortent du même moule,
le décideur n'a pas de vrai choix et validera par défaut la moins pire. Quand deux brouillons
se ressemblent, en refaire un avec une contrainte explicite (« interdiction d'utiliser une
grille de cartes »).

## Piège secondaire

Les composants d'un prototype peuvent contenir des données **inventées** pour illustrer
(chiffres, coordonnées, témoignages). À la consolidation, les repasser un par un : ce qui
était une illustration devient une promesse publiée.
