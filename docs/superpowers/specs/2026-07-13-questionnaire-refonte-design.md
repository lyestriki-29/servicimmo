# Refonte du questionnaire de devis — Design (approche C, hybride)

> **Statut : VALIDÉ** — direction validée par Lyes (approche C) le 2026-07-13,
> les 5 points ouverts tranchés le 2026-07-13 (session suivante, voir bas de page).
> Prêt pour le plan d'implémentation (`writing-plans`).
> Issu d'un brainstorming (superpowers) le 2026-07-13.

## Contexte & problème

Le questionnaire public Servicimmo (`components/questionnaire/`, 36 fichiers) remplace
le formulaire de devis classique par un parcours « intelligent » qui calcule les
diagnostics obligatoires + une estimation de prix. Lyes signale que **les 4 dimensions**
posent problème : navigation/étapes, logique diagnostics/prix, ergonomie, et abandon/conversion.

Diagnostic du code réel (lecture du cœur) :

- **Accordéon à deux niveaux** : étapes externes (`prop/tech/existing/time/contact`) **+**
  sous-blocs repliables internes, pilotés par **deux moteurs** (`computeStepFlow` pour les
  sous-blocs, `computeNextAccordion` pour les étapes). Cette complexité est la source des
  bugs de navigation (le code documente déjà un bug passé : l'étape optionnelle `existing`
  figeait la progression vers Délai/Contact).
- **Fichiers qui font trop** : `RecapScreen` 470 l., `LeBienStep` 344 l., `FillingScreen`
  276 l. — au-delà de la limite projet (300), donc fragiles.
- **Récap bloqué derrière un appel réseau** : `handleContinueToRecap` appelle
  `/api/quote-request` AVANT d'afficher le récap ; une erreur réseau (hors 503) **bloque
  l'utilisateur juste avant de voir son estimation**.
- **État persisté localStorage** (`servicimmo-quote` v3) : bon pour l'abandon, mais risque
  d'état périmé qui ressurgit.
- **Logique « faux »** : le moteur pur (`computeRequiredDiagnostics`, `computeQuote`) est
  **testé** (≥15/≥10 cas) → les mauvais résultats viennent quasi sûrement du **mapping
  UI→moteur** (`field-mapping`) ou de **champs requis non collectés**, pas du moteur.

## Décision — Approche C (hybride)

**On garde le cerveau, on refait le squelette.** Le moteur de règles + pricing et le modèle
de données `FullQuoteInput` restent **intacts** ; on remplace uniquement le squelette d'UI
fragile (accordéon 2 niveaux) par un **flux linéaire robuste** (une chose par écran).

Alternatives écartées : **A** (wizard ultra-simplifié — perd la densité/intelligence) ;
**B** (garder le sans-scroll en le fiabilisant — la complexité structurelle, donc le terrain
à bugs, resterait).

## Architecture

**On garde (ne pas toucher) :**
- Store Zustand `useQuestionnaireStore` (données `FullQuoteInput` + reprise localStorage).
- Moteurs purs `lib/core/diagnostics/rules.ts` + `pricing.ts` (validés, testés).
- `components/questionnaire/lib/field-mapping.ts` (à **re-vérifier**, pas réécrire).
- `AddressAutocomplete` (API BAN), tokens `--color-devis-*`, `EntryScreen`, `ThanksScreen`.

**On remplace :**
- `FillingScreen` + `StepBlocks` + `computeStepFlow` + `computeNextAccordion` + `SubBlock`
  → **une seule fonction pure** `getSteps(branch, data): Step[]` (source unique du flux) +
  un composant `StepScreen` générique. **Une étape = un écran**, barre de progression,
  navigation avant/arrière sur la liste (données jamais perdues). Un seul moteur de flux.

## Le flux (linéaire, par branche)

Branches Vente / Location / Travaux / Copropriété :

1. **Projet** (choix de branche) — `EntryScreen` conservé.
2. **Le bien** : type (maison/appart/local) + adresse (BAN) + surface + pièces + copropriété ?
3. **Le bâti** : année de construction (avant 1949 / 1949–1997 / après 1997) *(→ amiante/plomb)*
   + chauffage gaz/élec, individuel/collectif *(→ diags gaz/élec)*.
4. **Spécifique branche** : nature des travaux *(Travaux)* / parties communes *(Copropriété)*.
5. **Contact** — **email capturé ICI, tôt** : email + prénom + téléphone.
6. **Diagnostics déjà valides ?** — écran **optionnel, court, jamais bloquant**.
7. **Délai + accès**.
→ **Récap**.

Branche *Autre* : chemin ultra-court → Contact + description libre → « on vous recontacte »
(pas de calcul diagnostics/prix).

`getSteps` calcule la visibilité/l'ordre à partir de `(branch, data)` — pur, testable,
robuste aux changements de réponses antérieures (recalcul du premier incomplet).

## Récap — dé-bloqué

- Diagnostics + prix calculés **en local, instantanément** (moteur pur) → plus jamais d'écran figé.
- L'enregistrement `/api/quote-request` part **en arrière-plan** (fire-and-forget + retry ;
  échec silencieux non bloquant, l'id sert juste à relier la soumission finale).
- Prix = **fourchette « Estimation TTC — devis définitif sous 2 h ouvrées »** (cohérent avec le
  fait que la grille tarifaire n'est pas encore validée par le client — cf. check-list go-live).
- `RecapScreen` (470 l.) découpé : `PriceHero` (existe) / `DiagnosticsList` / `ContactSummary` / `SubmitCta`.

## Leviers de conversion (les 4 douleurs)

- **Barre de progression** (« étape 3/7 ») → on sait toujours où on en est.
- **Email capturé tôt** (étape 5) → un abandon laisse un lead exploitable (relance J+1 déjà prévue
  dans les templates email).
- **Une chose à la fois**, mobile-first → moins de charge cognitive, moins d'abandon.
- **Retour arrière sans perte** de données (navigation sur la liste d'étapes).

## Fichiers & tests

- Nouveau `lib/questionnaire/steps.ts` = `getSteps` (remplace 4 fichiers de séquencement).
- Nouveau `components/questionnaire/screens/StepScreen.tsx` (rendu générique d'une étape).
- Découpe : tous les fichiers < 200 lignes (recap + steps).
- Tests Vitest : `getSteps` (visibilité/ordre par branche, cas « changer une réponse antérieure »)
  + conservation des tests moteur `rules`/`pricing`. Vérif visuelle/e2e = Lyes.

## Hors scope

- Le moteur `rules.ts`/`pricing.ts` (règles diagnostics + tarifs) — **inchangé**. Sa **validation
  métier** (tarifs « indicatifs » à caler avec Servicimmo) est un chantier séparé (idée #2 go-live).
- Le portail / l'app Pilote.

## Points tranchés (validés par Lyes le 2026-07-13)

1. **Capture email → étape 5/7** : après « Le bien / Le bâti / Spécifique ». L'utilisateur a
   investi 4 écrans (effet d'engagement), et les abandons sur les 2 derniers écrans laissent
   quand même un lead exploitable (relance J+1).
2. **Écrans séparés** : « Le bien » et « Le bâti » restent deux écrans distincts. « Le bien »
   compte déjà 5 champs ; fusionner recréerait un écran long qui scrolle sur mobile.
3. **Barre de progression = segments + numéro** : segments (un par étape) qui se remplissent
   + libellé « Étape 3/7 — Le bâti ».
4. **localStorage : bump v3 → v4 au déploiement** (purge propre des anciens états accordéon).
   Reprise conservée pour les nouveaux parcours + bouton « Recommencer » visible.
   Pas de migration v3 → v4 (coût disproportionné).
5. **Prix affiché d'emblée au récap, en fourchette** avec mention « Estimation indicative TTC —
   devis définitif sous 2 h ouvrées » (couvre la grille tarifaire pas encore validée client).
