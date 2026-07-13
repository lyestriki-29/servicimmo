# Refonte questionnaire — flux linéaire (approche C) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remplacer le squelette accordéon 2 niveaux du questionnaire de devis par un flux linéaire robuste (une étape = un écran), dé-bloquer le récap (calcul local instantané + enregistrement en arrière-plan) et créer la route de soumission finale manquante.

**Architecture:** On garde le cerveau (moteurs purs `rules.ts`/`pricing.ts`, store Zustand, `field-mapping`, `AddressAutocomplete`, `EntryScreen`, `ThanksScreen`) et on refait le squelette : une fonction pure `getSteps(branch, data)` remplace les deux moteurs de flux (`computeStepFlow` + `computeNextAccordion`), un `StepScreen` générique rend chaque étape, le récap calcule diagnostics + prix **en local** (moteur pur, grille fallback) puis rafraîchit depuis `/api/calculate` en arrière-plan sans jamais bloquer.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript 5 strict (`noUncheckedIndexedAccess`), Tailwind v4, Zustand 5 + persist, Zod 3.24, Vitest 2 (jsdom), pnpm via `corepack`.

**Spec source:** `docs/superpowers/specs/2026-07-13-questionnaire-refonte-design.md` (statut VALIDÉ, 5 points tranchés le 2026-07-13).

## Global Constraints

- **TypeScript strict, JAMAIS de `any`** — `unknown` + narrowing si besoin.
- **Path aliases `@/...`** obligatoires, aucun import relatif `../../`.
- **Fichiers < 200 lignes** pour tout nouveau fichier de la refonte (limite projet globale : 300).
- **UI en français** ; noms de variables/fonctions en anglais ; commentaires métier en français.
- **`corepack pnpm typecheck` après chaque tâche** — une tâche n'est finie que si typecheck ET tests passent.
- **NE PAS MODIFIER** : `lib/core/diagnostics/rules.ts`, `lib/core/diagnostics/pricing.ts` (moteurs, hors scope — on leur AJOUTE seulement des tests), `components/questionnaire/components/AddressAutocomplete.tsx`, `screens/EntryScreen.tsx`, `screens/ThanksScreen.tsx`, `lib/branch-colors.ts`, `lib/branches.ts`, `lib/field-mapping.ts`, tokens CSS `--color-devis-*`.
- **localStorage `servicimmo-quote` : bump v3 → v4** avec purge (reset) des états < v4 — décision #4.
- **Email capturé à l'étape « Vos coordonnées »** (avant les 2 dernières étapes) — décision #1.
- **Écrans « Le bien » et « Le bâti » séparés** — décision #2.
- **Barre de progression = segments + « Étape 3/6 — Le bâti »** — décision #3.
- **Prix affiché d'emblée au récap, en fourchette**, mention « Estimation indicative — devis définitif sous 2 h ouvrées » — décision #5.
- Commits Conventional (`feat:`, `test:`, `refactor:`, `chore:`), un commit par tâche minimum.
- **Ne jamais committer** `.env*`, clés, tokens. Ne pas committer `.planning/` ni les logs `.next-*`.
- Le questionnaire est 100 % client après hydratation (`"use client"`) — pattern existant conservé.

## Vue d'ensemble des fichiers

| Action | Fichier | Rôle |
|---|---|---|
| Create | `lib/core/diagnostics/__tests__/rules.test.ts` | Tests moteur règles (≥ 15 cas, manquants — obligation CLAUDE.md) |
| Create | `lib/core/diagnostics/__tests__/pricing.test.ts` | Tests moteur pricing (≥ 10 cas, manquants) |
| Create | `lib/questionnaire/steps.ts` + `steps.test.ts` | Moteur de flux pur `getSteps` (remplace 2 moteurs) |
| Modify | `lib/stores/questionnaire.ts` | v4, `currentStepId`, type `QuoteCalculation` exporté |
| Create | `lib/questionnaire/local-calc.ts` + `local-calc.test.ts` | Calcul local diagnostics + prix (récap dé-bloqué) |
| Create | `lib/questionnaire/draft.ts` | Enregistrement draft en arrière-plan (fire-and-forget + retry) |
| Create | `components/questionnaire/components/ProgressBar.tsx` | Segments + « Étape X/Y » |
| Create | `components/questionnaire/screens/StepScreen.tsx` | Rendu générique d'une étape |
| Create | `components/questionnaire/lib/options.ts` | Copie des options (l'ancienne `screens/filling/options.ts` meurt en cleanup) |
| Create | `components/questionnaire/steps/{types.ts, BienStep.tsx, BienStepExtras.tsx, BatiStep.tsx, SpecifiqueStep.tsx, ContactStep.tsx, ExistantsStep.tsx, DelaiStep.tsx, AutreStep.tsx}` | Les 7 écrans d'étape |
| Modify | `app/api/quote-request/route.ts` | Draft élargi (first_name/phone) + variante branche « other » |
| Create | `app/api/quote-request/[id]/submit/route.ts` | **Route de soumission finale (manquante aujourd'hui → 404)** |
| Modify | `components/questionnaire/QuestionnaireApp.tsx` | Orchestration linéaire |
| Modify | `components/questionnaire/screens/RecapScreen.tsx` | Réécrit < 200 l., calcul local instantané |
| Create | `components/questionnaire/components/{DiagnosticsList.tsx, FinalizeForm.tsx}` | Découpe du récap |
| Modify | `components/questionnaire/components/PriceHero.tsx` | Copy « Estimation indicative » (décision #5) |
| Delete (Task 13) | `screens/FillingScreen.tsx`, `screens/filling/**`, `components/Accordion.tsx`, `components/SubBlock.tsx` | Ancien squelette |

**Bugs prod corrigés par ce plan** (constatés à la lecture du code, expliquent l'abandon/conversion) :
1. `POST /api/quote-request` exige `email` (step3Schema) mais l'UI actuelle ne le collecte **jamais** → 400 → l'utilisateur est bloqué sur « Continuer » avant le récap.
2. `RecapScreen` appelle `POST /api/quote-request/[id]/submit` qui **n'existe pas** → 404 → la soumission finale échoue toujours quand Supabase est configuré.

---

### Task 0: Branche de travail

**Files:** aucun (git uniquement)

- [ ] **Step 1: Créer la branche depuis l'état courant**

```bash
cd "c:/Users/lyest/Desktop/Projet Propulseo/ServicImmo/ServicImmo"
git checkout -b feat/questionnaire-refonte-lineaire
```

Note : `SESSION.md` et les logs `.next-*` sont dirty — ne pas les committer dans les tâches suivantes (toujours `git add` par chemins explicites, jamais `git add -A`).

---

### Task 1: Tests manquants du moteur de règles

Le dossier `lib/core/diagnostics/__tests__/` existe mais est **vide** — contrairement à ce que la spec supposait. CLAUDE.md impose ≥ 15 cas (PR bloquante). On les écrit AVANT de toucher l'UI : ils verrouillent le comportement du moteur pendant qu'on re-câble le mapping UI→moteur.

**Files:**
- Create: `lib/core/diagnostics/__tests__/rules.test.ts`
- Test: lui-même

**Interfaces:**
- Consumes: `calculateRequiredDiagnostics(data: QuoteFormData): DiagnosticsResult` de `@/lib/core/diagnostics/rules` ; types `QuoteFormData`, `RequiredDiagnostic` de `@/lib/core/diagnostics/types`.
- Produces: rien (tests seulement). Le moteur n'est PAS modifié : si un test contredit le code, c'est le test qu'on corrige (le comportement actuel fait foi — sa validation métier est un chantier séparé, cf. spec « Hors scope »).

- [ ] **Step 1: Écrire le fichier de tests complet**

```typescript
import { describe, expect, it } from "vitest";

import { calculateRequiredDiagnostics } from "@/lib/core/diagnostics/rules";
import type { QuoteFormData, RequiredDiagnostic } from "@/lib/core/diagnostics/types";

// ── Fixture de base : vente maison pré-1949 à Tours, gaz + élec anciens ──────
const base: QuoteFormData = {
  project_type: "sale",
  property_type: "house",
  postal_code: "37000",
  surface: 100,
  rooms_count: 4,
  is_coownership: false,
  permit_date_range: "before_1949",
  heating_type: "gas",
  gas_installation: "city_gas",
  gas_over_15_years: true,
  electric_over_15_years: true,
};

const make = (over: Partial<QuoteFormData> = {}): QuoteFormData => ({ ...base, ...over });
const ids = (list: RequiredDiagnostic[]): string[] => list.map((d) => d.id).sort();

describe("calculateRequiredDiagnostics — vente", () => {
  it("vente maison pré-1949 en 37 : plomb, amiante, termites, DPE, gaz, élec, ERP", () => {
    const r = calculateRequiredDiagnostics(make());
    expect(ids(r.required)).toEqual([
      "asbestos", "dpe", "electric", "erp", "gas", "lead", "termites",
    ]);
    expect(r.toClarify).toEqual([]);
  });

  it("vente maison 1949-1997 : amiante mais PAS de plomb", () => {
    const r = calculateRequiredDiagnostics(make({ permit_date_range: "1949_to_1997" }));
    expect(ids(r.required)).toContain("asbestos");
    expect(ids(r.required)).not.toContain("lead");
  });

  it("vente post-1997 : ni amiante ni plomb", () => {
    const r = calculateRequiredDiagnostics(make({ permit_date_range: "after_1997" }));
    expect(ids(r.required)).not.toContain("asbestos");
    expect(ids(r.required)).not.toContain("lead");
  });

  it("vente d'un lot en copropriété : Carrez", () => {
    const r = calculateRequiredDiagnostics(
      make({ property_type: "apartment", is_coownership: true })
    );
    expect(ids(r.required)).toContain("carrez");
  });

  it("vente hors copropriété : pas de Carrez", () => {
    const r = calculateRequiredDiagnostics(make());
    expect(ids(r.required)).not.toContain("carrez");
  });

  it("termites : vente en 37 oui, vente hors 37 non, location 37 non", () => {
    expect(ids(calculateRequiredDiagnostics(make()).required)).toContain("termites");
    expect(
      ids(calculateRequiredDiagnostics(make({ postal_code: "41000" })).required)
    ).not.toContain("termites");
    expect(
      ids(
        calculateRequiredDiagnostics(
          make({ project_type: "rental", rental_furnished: "vide" })
        ).required
      )
    ).not.toContain("termites");
  });

  it("terrain nu : ERP seul (pas de DPE, pas de termites)", () => {
    const r = calculateRequiredDiagnostics(
      make({ property_type: "land", gas_installation: "none", gas_over_15_years: false, electric_over_15_years: false })
    );
    expect(ids(r.required)).toEqual(["erp"]);
  });

  it("local commercial pré-1949 : DPE tertiaire + amiante, pas de plomb ni gaz/élec", () => {
    const r = calculateRequiredDiagnostics(make({ property_type: "commercial" }));
    expect(ids(r.required)).toEqual(["asbestos", "dpe_tertiary", "erp", "termites"]);
  });
});

describe("calculateRequiredDiagnostics — location", () => {
  const rental = (over: Partial<QuoteFormData> = {}) =>
    make({
      project_type: "rental",
      permit_date_range: "after_1997",
      gas_installation: "none",
      gas_over_15_years: false,
      electric_over_15_years: false,
      rental_furnished: "meuble",
      ...over,
    });

  it("location logement post-1997 meublé : DPE + ERP seulement", () => {
    const r = calculateRequiredDiagnostics(rental());
    expect(ids(r.required)).toEqual(["dpe", "erp"]);
  });

  it("location vide : + Loi Boutin", () => {
    const r = calculateRequiredDiagnostics(rental({ rental_furnished: "vide" }));
    expect(ids(r.required)).toContain("boutin");
  });

  it("location pré-1997 : DAPP (amiante parties privatives), pas 'asbestos' vente", () => {
    const r = calculateRequiredDiagnostics(rental({ permit_date_range: "1949_to_1997" }));
    expect(ids(r.required)).toContain("dapp");
    expect(ids(r.required)).not.toContain("asbestos");
  });
});

describe("calculateRequiredDiagnostics — Option B (je ne sais pas)", () => {
  it("permis inconnu en vente : plomb + amiante passent en toClarify", () => {
    const r = calculateRequiredDiagnostics(make({ permit_date_range: "unknown" }));
    expect(ids(r.required)).not.toContain("lead");
    expect(ids(r.required)).not.toContain("asbestos");
    expect(ids(r.toClarify)).toEqual(expect.arrayContaining(["asbestos", "lead"]));
  });

  it("âge gaz inconnu (installation présente) : gaz en toClarify", () => {
    const r = calculateRequiredDiagnostics(make({ gas_over_15_years: null }));
    expect(ids(r.required)).not.toContain("gas");
    expect(ids(r.toClarify)).toContain("gas");
  });

  it("âge élec inconnu : élec en toClarify", () => {
    const r = calculateRequiredDiagnostics(make({ electric_over_15_years: null }));
    expect(ids(r.toClarify)).toContain("electric");
  });

  it("pas d'installation gaz : aucun diag gaz nulle part", () => {
    const r = calculateRequiredDiagnostics(
      make({ gas_installation: "none", gas_over_15_years: null })
    );
    expect(ids(r.required)).not.toContain("gas");
    expect(ids(r.toClarify)).not.toContain("gas");
  });
});

describe("calculateRequiredDiagnostics — travaux / copropriété / autre", () => {
  it("travaux pré-1949 : RAT + plomb avant travaux", () => {
    const r = calculateRequiredDiagnostics(make({ project_type: "works", works_type: "renovation" }));
    expect(ids(r.required)).toEqual(["asbestos_works", "lead_works"]);
  });

  it("travaux 1949-1997 : RAT seul", () => {
    const r = calculateRequiredDiagnostics(
      make({ project_type: "works", permit_date_range: "1949_to_1997" })
    );
    expect(ids(r.required)).toEqual(["asbestos_works"]);
  });

  it("travaux permis inconnu : les deux en toClarify, rien en required", () => {
    const r = calculateRequiredDiagnostics(
      make({ project_type: "works", permit_date_range: "unknown" })
    );
    expect(r.required).toEqual([]);
    expect(ids(r.toClarify)).toEqual(["asbestos_works", "lead_works"]);
  });

  it("copropriété pré-1997 : DTA required + DPE collectif toClarify", () => {
    const r = calculateRequiredDiagnostics(make({ project_type: "coownership" }));
    expect(ids(r.required)).toEqual(["dta"]);
    expect(ids(r.toClarify)).toContain("dpe_collective");
  });

  it("branche autre : résultat vide", () => {
    const r = calculateRequiredDiagnostics(make({ project_type: "other" }));
    expect(r.required).toEqual([]);
    expect(r.toClarify).toEqual([]);
  });

  it("copro + chauffage collectif en vente : DPE collectif signalé en toClarify", () => {
    const r = calculateRequiredDiagnostics(
      make({ is_coownership: true, heating_mode: "collective" })
    );
    expect(ids(r.toClarify)).toContain("dpe_collective");
  });
});

describe("calculateRequiredDiagnostics — diagnostics déjà valides", () => {
  it("DPE déclaré valide : retiré des required", () => {
    const r = calculateRequiredDiagnostics(make({ existing_valid_diagnostics: ["dpe"] }));
    expect(ids(r.required)).not.toContain("dpe");
  });

  it("amiante déclaré valide SANS document : rétrogradé en toClarify", () => {
    const r = calculateRequiredDiagnostics(make({ existing_valid_diagnostics: ["asbestos"] }));
    expect(ids(r.required)).not.toContain("asbestos");
    expect(ids(r.toClarify)).toContain("asbestos");
  });

  it("amiante déclaré valide AVEC document : retiré complètement", () => {
    const r = calculateRequiredDiagnostics(
      make({
        existing_valid_diagnostics: ["asbestos"],
        existing_diagnostics_files: ["https://example.com/rapport.pdf"],
      })
    );
    expect(ids(r.required)).not.toContain("asbestos");
    expect(ids(r.toClarify)).not.toContain("asbestos");
  });
});
```

- [ ] **Step 2: Lancer les tests**

Run: `corepack pnpm vitest run lib/core/diagnostics/__tests__/rules.test.ts`
Expected: PASS (~22 tests). Si un cas échoue, relire `rules.ts` et **ajuster le test** à la réalité du moteur (jamais l'inverse) ; noter l'écart en commentaire dans le test.

- [ ] **Step 3: Commit**

```bash
git add lib/core/diagnostics/__tests__/rules.test.ts
git commit -m "test: couvre le moteur de regles diagnostics (22 cas)"
```

---

### Task 2: Tests manquants du moteur de pricing

**Files:**
- Create: `lib/core/diagnostics/__tests__/pricing.test.ts`
- Test: lui-même

**Interfaces:**
- Consumes: `estimatePrice(diagnostics: RequiredDiagnostic[], context: PricingContext): PriceEstimate` de `@/lib/core/diagnostics/pricing` (variante synchrone sur grille fallback — celle que le récap local utilisera en Task 5) ; types `DiagnosticId`, `PricingContext`, `RequiredDiagnostic`.
- Produces: rien (tests seulement).

- [ ] **Step 1: Écrire le fichier de tests complet**

Valeurs attendues dérivées de la grille fallback (`BASE_PRICES`) : erp 20-40, dpe house 110-220 / apartment 90-180, gas 90-130, dpe_collective 600-1500. Arrondi à la dizaine (`Math.round(n/10)*10`).

```typescript
import { describe, expect, it } from "vitest";

import { estimatePrice } from "@/lib/core/diagnostics/pricing";
import type {
  DiagnosticId,
  PricingContext,
  RequiredDiagnostic,
} from "@/lib/core/diagnostics/types";

const diag = (id: DiagnosticId): RequiredDiagnostic => ({
  id,
  name: id,
  reason: "test",
  validityMonths: 6,
});

// Surface 60 = bande "small" (multiplicateur 1) → cas de base sans modulateur.
const ctx = (over: Partial<PricingContext> = {}): PricingContext => ({
  surface: 60,
  postal_code: "37000",
  property_type: "house",
  urgency: null,
  ...over,
});

describe("estimatePrice — base", () => {
  it("aucun diagnostic : 0 € et aucun modulateur", () => {
    expect(estimatePrice([], ctx())).toEqual({ min: 0, max: 0, appliedModulators: [] });
  });

  it("ERP seul, surface small, en 37 : fourchette de base sans modulateur", () => {
    const r = estimatePrice([diag("erp")], ctx());
    expect(r).toEqual({ min: 20, max: 40, appliedModulators: [] });
  });

  it("DPE maison vs appartement : la grille house/apartment diffère", () => {
    const house = estimatePrice([diag("dpe")], ctx());
    const apt = estimatePrice([diag("dpe")], ctx({ property_type: "apartment" }));
    expect(house).toMatchObject({ min: 110, max: 220 });
    expect(apt).toMatchObject({ min: 90, max: 180 });
  });
});

describe("estimatePrice — modulateurs", () => {
  it("surface ≤ 40 m² : −10 %", () => {
    const r = estimatePrice([diag("erp")], ctx({ surface: 30 }));
    expect(r.appliedModulators).toContain("Surface ≤ 40 m² (−10 %)");
    expect(r).toMatchObject({ min: 20, max: 40 }); // 18→20, 36→40 (arrondi dizaine)
  });

  it("surface > 150 m² : +20 %", () => {
    const r = estimatePrice([diag("erp")], ctx({ surface: 200 }));
    expect(r.appliedModulators).toContain("Surface > 150 m² (+20 %)");
    expect(r).toMatchObject({ min: 20, max: 50 }); // 24→20, 48→50
  });

  it("urgence < 48 h : +20 %", () => {
    const r = estimatePrice([diag("erp")], ctx({ urgency: "asap" }));
    expect(r.appliedModulators).toContain("Intervention < 48 h (+20 %)");
    expect(r).toMatchObject({ min: 20, max: 50 });
  });

  it("hors 37 SANS distance connue : +15 %", () => {
    const r = estimatePrice([diag("erp")], ctx({ postal_code: "75001" }));
    expect(r.appliedModulators).toContain("Hors Indre-et-Loire (+15 %)");
    expect(r).toMatchObject({ min: 20, max: 50 }); // 23→20, 46→50
  });

  it("distance connue > 50 km : +30 € flat, PRIME sur le +15 %", () => {
    const r = estimatePrice([diag("erp")], ctx({ postal_code: "41000", distance_km: 80 }));
    expect(r.appliedModulators).toContain("Déplacement > 50 km (+30 €)");
    expect(r.appliedModulators).not.toContain("Hors Indre-et-Loire (+15 %)");
    expect(r).toMatchObject({ min: 50, max: 70 });
  });

  it("distance connue ≤ 50 km hors 37 : aucun modulateur de zone", () => {
    const r = estimatePrice([diag("erp")], ctx({ postal_code: "41000", distance_km: 20 }));
    expect(r.appliedModulators).toEqual([]);
    expect(r).toMatchObject({ min: 20, max: 40 });
  });

  it("pack ≥ 3 diagnostics : −15 %", () => {
    const r = estimatePrice([diag("dpe"), diag("gas"), diag("erp")], ctx());
    expect(r.appliedModulators).toContain("Pack complet ≥ 3 diagnostics (−15 %)");
    // (110+90+20)=220 → 187→190 ; (220+130+40)=390 → 331.5→330
    expect(r).toMatchObject({ min: 190, max: 330 });
  });

  it("chauffage collectif + DPE collectif présent : +10 %", () => {
    const r = estimatePrice(
      [diag("dpe_collective"), diag("erp")],
      ctx({ heating_mode: "collective" })
    );
    expect(r.appliedModulators).toContain("Chauffage collectif (+10 %)");
    expect(r).toMatchObject({ min: 680, max: 1690 }); // 620/1540 ×1.1 → 682/1694
  });

  it("chauffage collectif SANS DPE collectif : pas de majoration", () => {
    const r = estimatePrice([diag("erp")], ctx({ heating_mode: "collective" }));
    expect(r.appliedModulators).toEqual([]);
  });
});
```

- [ ] **Step 2: Lancer les tests**

Run: `corepack pnpm vitest run lib/core/diagnostics/__tests__/pricing.test.ts`
Expected: PASS (11 tests). Même règle qu'en Task 1 : un écart = ajuster le test au moteur, jamais l'inverse.

- [ ] **Step 3: Commit**

```bash
git add lib/core/diagnostics/__tests__/pricing.test.ts
git commit -m "test: couvre le moteur de pricing (11 cas)"
```

---

### Task 3: Moteur de flux pur `getSteps` (TDD)

Remplace `computeStepFlow` + `computeNextAccordion` par UNE source de vérité du parcours. Pur, sans React.

**Files:**
- Create: `lib/questionnaire/steps.ts`
- Create: `lib/questionnaire/steps.test.ts`

**Interfaces:**
- Consumes: `ProjectType` de `@/lib/core/diagnostics/types` ; `QuestionnaireData` de `@/lib/stores/questionnaire` (existe déjà, inchangé à ce stade).
- Produces (utilisé par Tasks 6, 11, 12) :
  - `type StepId = "bien" | "bati" | "specifique" | "contact" | "existants" | "delai" | "autre"`
  - `type Step = { id: StepId; title: string; optional: boolean; isComplete: (data: QuestionnaireData) => boolean }`
  - `getSteps(branch: ProjectType, data: QuestionnaireData): Step[]`
  - `firstIncompleteIndex(steps: readonly Step[], data: QuestionnaireData): number` (retourne `steps.length` si tout est complet)
  - `resolveStepIndex(steps: readonly Step[], currentStepId: string | null, data: QuestionnaireData): number`
  - `isEmailValid(v: string | undefined): boolean`

- [ ] **Step 1: Écrire les tests (rouges d'abord)**

```typescript
// lib/questionnaire/steps.test.ts
import { describe, expect, it } from "vitest";

import type { QuestionnaireData } from "@/lib/stores/questionnaire";

import { firstIncompleteIndex, getSteps, resolveStepIndex } from "./steps";

// ── Fixtures progressives ────────────────────────────────────────────────────
const BIEN: QuestionnaireData = {
  property_type: "house",
  address: "12 rue des Halles",
  postal_code: "37000",
  city: "Tours",
  surface: 95,
  rooms_count: 4,
  is_coownership: false,
};

const BATI: QuestionnaireData = {
  ...BIEN,
  permit_date_range: "before_1949",
  heating_mode: "individual",
  heating_type: "gas",
  ecs_type: "gas",
  gas_installation: "city_gas",
  cooktop_connection: "souple",
  gas_over_15_years: true,
  electric_over_15_years: true,
};

const CONTACT: QuestionnaireData = {
  ...BATI,
  email: "client@example.com",
  first_name: "Marie",
  phone: "06 12 34 56 78",
};

const FULL: QuestionnaireData = { ...CONTACT, urgency: "week" };

const stepIds = (branch: Parameters<typeof getSteps>[0], data: QuestionnaireData = {}) =>
  getSteps(branch, data).map((s) => s.id);

describe("getSteps — composition par branche", () => {
  it("vente : bien → bâti → contact → existants → délai", () => {
    expect(stepIds("sale")).toEqual(["bien", "bati", "contact", "existants", "delai"]);
  });

  it("location : + spécifique (type de bail) après le bâti", () => {
    expect(stepIds("rental")).toEqual([
      "bien", "bati", "specifique", "contact", "existants", "delai",
    ]);
    expect(getSteps("rental", {})[2]?.title).toBe("Votre location");
  });

  it("travaux : + spécifique (nature des travaux)", () => {
    expect(stepIds("works")).toEqual([
      "bien", "bati", "specifique", "contact", "existants", "delai",
    ]);
    expect(getSteps("works", {})[2]?.title).toBe("Vos travaux");
  });

  it("copropriété : même flux que la vente (parties communes = type de bien)", () => {
    expect(stepIds("coownership")).toEqual(["bien", "bati", "contact", "existants", "delai"]);
  });

  it("autre : chemin ultra-court, un seul écran", () => {
    expect(stepIds("other")).toEqual(["autre"]);
  });

  it("seule l'étape existants est facultative", () => {
    const optional = getSteps("sale", {}).filter((s) => s.optional).map((s) => s.id);
    expect(optional).toEqual(["existants"]);
  });
});

describe("Step.isComplete — prédicats", () => {
  const step = (branch: Parameters<typeof getSteps>[0], id: string) => {
    const found = getSteps(branch, {}).find((s) => s.id === id);
    if (!found) throw new Error(`step ${id} absente`);
    return found;
  };

  it("bien : incomplet si appartement sans étage", () => {
    expect(step("sale", "bien").isComplete({ ...BIEN, property_type: "apartment" })).toBe(false);
    expect(
      step("sale", "bien").isComplete({ ...BIEN, property_type: "apartment", floor: 3 })
    ).toBe(true);
  });

  it("bien : incomplet si local commercial sans activité", () => {
    expect(step("sale", "bien").isComplete({ ...BIEN, property_type: "commercial" })).toBe(false);
  });

  it("bâti : le raccordement cuisson n'est requis QUE si gaz présent", () => {
    expect(step("sale", "bati").isComplete({ ...BATI, cooktop_connection: undefined })).toBe(false);
    expect(
      step("sale", "bati").isComplete({
        ...BATI,
        gas_installation: "none",
        cooktop_connection: undefined,
      })
    ).toBe(true);
  });

  it("contact : email invalide ou téléphone court → incomplet", () => {
    expect(step("sale", "contact").isComplete({ ...CONTACT, email: "pas-un-email" })).toBe(false);
    expect(step("sale", "contact").isComplete({ ...CONTACT, phone: "06 12" })).toBe(false);
    expect(step("sale", "contact").isComplete(CONTACT)).toBe(true);
  });

  it("délai : source 'autre' sans précision → incomplet", () => {
    expect(
      step("sale", "delai").isComplete({ ...FULL, referral_source: "autre" })
    ).toBe(false);
    expect(
      step("sale", "delai").isComplete({
        ...FULL,
        referral_source: "autre",
        referral_other: "salon habitat",
      })
    ).toBe(true);
  });

  it("autre : description ≥ 10 caractères + contact + consentement RGPD", () => {
    const autre = getSteps("other", {})[0];
    if (!autre) throw new Error("étape autre absente");
    const data: QuestionnaireData = {
      email: "x@y.fr",
      first_name: "Luc",
      phone: "0612345678",
      notes: "Besoin d'un diagnostic avant division de parcelle.",
    };
    expect(autre.isComplete(data)).toBe(false); // consentement manquant
    expect(autre.isComplete({ ...data, consent_rgpd: true })).toBe(true);
    expect(autre.isComplete({ ...data, consent_rgpd: true, notes: "court" })).toBe(false);
  });
});

describe("firstIncompleteIndex / resolveStepIndex", () => {
  it("données vides → première étape", () => {
    const steps = getSteps("sale", {});
    expect(firstIncompleteIndex(steps, {})).toBe(0);
  });

  it("bien + bâti complets en location → l'étape spécifique (index 2)", () => {
    const steps = getSteps("rental", BATI);
    expect(firstIncompleteIndex(steps, BATI)).toBe(2);
  });

  it("étape facultative jamais bloquante : tout complet sauf délai → index délai", () => {
    const steps = getSteps("sale", CONTACT);
    expect(firstIncompleteIndex(steps, CONTACT)).toBe(4); // delai
  });

  it("tout complet → steps.length", () => {
    const steps = getSteps("sale", FULL);
    expect(firstIncompleteIndex(steps, FULL)).toBe(steps.length);
  });

  it("resolveStepIndex : saut en avant clampé au premier incomplet", () => {
    const steps = getSteps("sale", {});
    expect(resolveStepIndex(steps, "delai", {})).toBe(0);
  });

  it("resolveStepIndex : retour en arrière toujours permis", () => {
    const steps = getSteps("sale", FULL);
    expect(resolveStepIndex(steps, "bien", FULL)).toBe(0);
  });

  it("resolveStepIndex : id inconnu (purge / changement de branche) → premier incomplet", () => {
    const steps = getSteps("sale", BIEN);
    expect(resolveStepIndex(steps, "inexistante", BIEN)).toBe(1); // bati
    expect(resolveStepIndex(steps, null, FULL)).toBe(steps.length - 1);
  });

  it("robuste au changement d'une réponse antérieure : bien invalidé → retour clampé", () => {
    const broken: QuestionnaireData = { ...FULL, surface: undefined };
    const steps = getSteps("sale", broken);
    expect(resolveStepIndex(steps, "delai", broken)).toBe(0);
  });
});
```

- [ ] **Step 2: Vérifier que les tests échouent**

Run: `corepack pnpm vitest run lib/questionnaire/steps.test.ts`
Expected: FAIL — `Cannot find module './steps'` (ou équivalent).

- [ ] **Step 3: Implémenter `lib/questionnaire/steps.ts`**

```typescript
/**
 * Moteur de flux PUR du questionnaire refondu (approche C — flux linéaire).
 *
 * UNE seule source de vérité du parcours : `getSteps(branch, data)` retourne la
 * liste ordonnée des étapes visibles. Tout se déduit de `(branch, data)` — pas
 * d'état dérivé, donc robuste au changement d'une réponse antérieure (le
 * premier incomplet est simplement recalculé).
 *
 * Remplace les deux moteurs de l'ancien accordéon 2 niveaux
 * (`computeStepFlow` + `computeNextAccordion`), source des bugs de navigation.
 */

import type { ProjectType } from "@/lib/core/diagnostics/types";
import type { QuestionnaireData } from "@/lib/stores/questionnaire";

export type StepId =
  | "bien"
  | "bati"
  | "specifique"
  | "contact"
  | "existants"
  | "delai"
  | "autre";

export type Step = {
  id: StepId;
  title: string;
  /** Étape facultative : « Continuer » n'est jamais bloqué, jamais bloquante. */
  optional: boolean;
  isComplete: (data: QuestionnaireData) => boolean;
};

// ── Prédicats purs (portés à l'identique des flags de l'ancien FillingScreen) ─

export const isEmailValid = (v: string | undefined): boolean => /^\S+@\S+\.\S+$/.test(v ?? "");

const phoneDigits = (d: QuestionnaireData): string => (d.phone ?? "").replace(/\D/g, "");

const addressComplete = (d: QuestionnaireData): boolean =>
  !!d.address &&
  d.address.length >= 3 &&
  !!d.postal_code &&
  /^\d{5}$/.test(d.postal_code) &&
  !!d.city;

const surfaceComplete = (d: QuestionnaireData): boolean =>
  typeof d.surface === "number" &&
  d.surface > 0 &&
  typeof d.rooms_count === "number" &&
  d.rooms_count >= 1;

const hasGas = (d: QuestionnaireData): boolean =>
  !!d.gas_installation && d.gas_installation !== "none" && d.gas_installation !== "unknown";

const bienComplete = (d: QuestionnaireData): boolean =>
  !!d.property_type &&
  addressComplete(d) &&
  surfaceComplete(d) &&
  d.is_coownership !== undefined &&
  (d.property_type !== "apartment" || typeof d.floor === "number") &&
  (d.property_type !== "commercial" || !!d.commercial_activity);

// heating_mode et ecs_type étaient de facto requis par la chaîne de sous-blocs
// de l'ancien TechniqueStep (les deux ont une option « Je ne sais pas »).
const batiComplete = (d: QuestionnaireData): boolean =>
  !!d.permit_date_range &&
  !!d.heating_mode &&
  !!d.heating_type &&
  !!d.ecs_type &&
  !!d.gas_installation &&
  (!hasGas(d) || !!d.cooktop_connection) &&
  d.gas_over_15_years !== undefined &&
  d.electric_over_15_years !== undefined;

const contactComplete = (d: QuestionnaireData): boolean =>
  isEmailValid(d.email) && !!d.first_name?.trim() && phoneDigits(d).length >= 8;

const delaiComplete = (d: QuestionnaireData): boolean =>
  !!d.urgency && (d.referral_source !== "autre" || !!d.referral_other);

const autreComplete = (d: QuestionnaireData): boolean =>
  contactComplete(d) && (d.notes?.trim().length ?? 0) >= 10 && d.consent_rgpd === true;

// ── Composition du flux ──────────────────────────────────────────────────────

// `_data` : réservé pour de futures étapes conditionnelles aux réponses ;
// la signature (branch, data) est celle de la spec.
export function getSteps(branch: ProjectType, _data: QuestionnaireData): Step[] {
  if (branch === "other") {
    return [{ id: "autre", title: "Votre demande", optional: false, isComplete: autreComplete }];
  }

  const steps: Step[] = [
    { id: "bien", title: "Le bien", optional: false, isComplete: bienComplete },
    { id: "bati", title: "Le bâti", optional: false, isComplete: batiComplete },
  ];

  if (branch === "rental") {
    steps.push({
      id: "specifique",
      title: "Votre location",
      optional: false,
      isComplete: (d) => !!d.rental_furnished,
    });
  }
  if (branch === "works") {
    steps.push({
      id: "specifique",
      title: "Vos travaux",
      optional: false,
      isComplete: (d) => !!d.works_type,
    });
  }

  steps.push(
    { id: "contact", title: "Vos coordonnées", optional: false, isComplete: contactComplete },
    {
      id: "existants",
      title: "Diagnostics déjà valides",
      optional: true,
      isComplete: () => true,
    },
    { id: "delai", title: "Délai & accès", optional: false, isComplete: delaiComplete }
  );

  return steps;
}

/** Index de la première étape REQUISE incomplète ; `steps.length` si tout est complet. */
export function firstIncompleteIndex(
  steps: readonly Step[],
  data: QuestionnaireData
): number {
  const idx = steps.findIndex((s) => !s.optional && !s.isComplete(data));
  return idx === -1 ? steps.length : idx;
}

/**
 * Résout l'index d'affichage : l'étape demandée si elle est atteignable, sinon
 * clamp au premier incomplet (jamais au-delà — on ne peut pas sauter en avant,
 * le retour en arrière reste libre).
 */
export function resolveStepIndex(
  steps: readonly Step[],
  currentStepId: string | null,
  data: QuestionnaireData
): number {
  const maxReachable = Math.min(firstIncompleteIndex(steps, data), steps.length - 1);
  const wanted = steps.findIndex((s) => s.id === currentStepId);
  if (wanted === -1) return maxReachable;
  return Math.min(wanted, maxReachable);
}
```

- [ ] **Step 4: Vérifier que les tests passent**

Run: `corepack pnpm vitest run lib/questionnaire/steps.test.ts`
Expected: PASS (~19 tests).

- [ ] **Step 5: Typecheck + commit**

```bash
corepack pnpm typecheck
git add lib/questionnaire/steps.ts lib/questionnaire/steps.test.ts
git commit -m "feat: moteur de flux lineaire getSteps (remplace les 2 moteurs accordeon)"
```

---

### Task 4: Store v4 — purge, `currentStepId`, type `QuoteCalculation`

**Files:**
- Modify: `lib/stores/questionnaire.ts` (réécriture complète du fichier, 118 lignes)

**Interfaces:**
- Consumes: `PriceEstimate`, `RequiredDiagnostic` de `@/lib/core/diagnostics/types` ; `FullQuoteInput` de `@/lib/validation/schemas`.
- Produces (utilisé par Tasks 5, 11, 12) :
  - `type QuoteCalculation = { required: RequiredDiagnostic[]; toClarify: RequiredDiagnostic[]; estimate: PriceEstimate; source: "local" | "server" }` (remplace l'ancien `LastCalculation` aux champs `unknown[]`)
  - État ajouté : `currentStepId: string | null` + action `goToStep(id: string | null): void`
  - `version: 4` avec purge de tout état < v4 (décision #4 — les états accordéon v3 ne sont pas migrables vers le flux linéaire)
  - Le reste de l'API du store est **inchangé** (`currentScreen`, `data`, `quoteRequestId`, `submitted`, `lastCalculation`, `goToScreen`, `updateData`, `setQuoteRequestId`, `setLastCalculation`, `markSubmitted`, `reset`).

- [ ] **Step 1: Réécrire le store**

Contenu complet du fichier :

```typescript
/**
 * Store Zustand du questionnaire de devis.
 *
 * Refonte 2026-07 (approche C) : parcours linéaire piloté par
 * `lib/questionnaire/steps.ts`. Le store conserve l'écran courant, l'étape
 * courante, les réponses, l'id du draft serveur et le dernier calcul
 * diagnostics/prix (local ou serveur).
 *
 * Persist localStorage : v4. Les états < v4 (squelette accordéon) sont purgés
 * au chargement — décision « bump v4 » du 2026-07-13.
 */

"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { PriceEstimate, RequiredDiagnostic } from "@/lib/core/diagnostics/types";
import type { FullQuoteInput } from "@/lib/validation/schemas";

export type QuestionnaireScreen = "entry" | "filling" | "recap" | "thanks";

export type QuestionnaireData = Partial<FullQuoteInput>;

/** Résultat d'un calcul diagnostics + prix, local (grille fallback) ou serveur. */
export type QuoteCalculation = {
  required: RequiredDiagnostic[];
  toClarify: RequiredDiagnostic[];
  estimate: PriceEstimate;
  source: "local" | "server";
};

type QuestionnaireState = {
  currentScreen: QuestionnaireScreen;
  /** Id de l'étape courante du flux linéaire (`StepId`), null = première atteignable. */
  currentStepId: string | null;
  data: QuestionnaireData;
  quoteRequestId: string | null;
  /** Indique si la soumission finale a déjà été effectuée avec succès. */
  submitted: boolean;
  lastCalculation: QuoteCalculation | null;

  goToScreen: (screen: QuestionnaireScreen) => void;
  goToStep: (id: string | null) => void;
  updateData: (patch: QuestionnaireData) => void;
  setQuoteRequestId: (id: string) => void;
  setLastCalculation: (calc: QuoteCalculation | null) => void;
  markSubmitted: () => void;
  reset: () => void;
};

const INITIAL = {
  currentScreen: "entry" as QuestionnaireScreen,
  currentStepId: null,
  data: {},
  quoteRequestId: null,
  submitted: false,
  lastCalculation: null,
};

export const useQuestionnaireStore = create<QuestionnaireState>()(
  persist(
    (set) => ({
      ...INITIAL,

      goToScreen: (screen) => set({ currentScreen: screen }),
      goToStep: (id) => set({ currentStepId: id }),
      updateData: (patch) => set((state) => ({ data: { ...state.data, ...patch } })),
      setQuoteRequestId: (id) => set({ quoteRequestId: id }),
      setLastCalculation: (calc) => set({ lastCalculation: calc }),
      markSubmitted: () => set({ submitted: true }),
      reset: () => set({ ...INITIAL }),
    }),
    {
      name: "servicimmo-quote",
      // v4 = refonte flux linéaire (2026-07). Les états v1-v3 (accordéon 2
      // niveaux) sont purgés : structure de navigation incompatible, et un
      // état périmé qui ressurgit était précisément un des bugs à corriger.
      version: 4,
      partialize: (state) => ({
        currentScreen: state.currentScreen,
        currentStepId: state.currentStepId,
        data: state.data,
        quoteRequestId: state.quoteRequestId,
        submitted: state.submitted,
      }),
      migrate: (persistedState, fromVersion) => {
        if (fromVersion < 4) {
          return {
            currentScreen: "entry" as QuestionnaireScreen,
            currentStepId: null,
            data: {},
            quoteRequestId: null,
            submitted: false,
          };
        }
        return persistedState as {
          currentScreen: QuestionnaireScreen;
          currentStepId: string | null;
          data: QuestionnaireData;
          quoteRequestId: string | null;
          submitted: boolean;
        };
      },
    }
  )
);
```

- [ ] **Step 2: Typecheck (des erreurs attendues ailleurs ? non)**

Run: `corepack pnpm typecheck`
Expected: PASS — `RecapScreen.tsx` castait déjà `lastCalculation.required as RequiredDiagnostic[]` (cast devenu inutile mais compatible) et personne ne lisait les champs internes de l'ancien type. Si erreur sur `setLastCalculation` dans `RecapScreen` (l'objet passé n'a pas `source`), ajouter provisoirement `source: "server" as const` à l'objet construit ligne ~162 de `RecapScreen.tsx` — ce fichier est réécrit en Task 12.

- [ ] **Step 3: Tests existants toujours verts**

Run: `corepack pnpm vitest run lib/questionnaire/steps.test.ts`
Expected: PASS (QuestionnaireData inchangé).

- [ ] **Step 4: Commit**

```bash
git add lib/stores/questionnaire.ts components/questionnaire/screens/RecapScreen.tsx
git commit -m "feat: store questionnaire v4 (purge accordeon, etape courante, QuoteCalculation type)"
```

---

### Task 5: Calcul local du récap (TDD) — `local-calc.ts`

Le récap ne doit plus jamais attendre le réseau : diagnostics + prix se calculent en local avec les moteurs purs et la grille fallback. `/api/calculate` (grille Supabase) ne servira plus qu'à un rafraîchissement en arrière-plan (Task 12).

**Files:**
- Create: `lib/questionnaire/local-calc.ts`
- Create: `lib/questionnaire/local-calc.test.ts`

**Interfaces:**
- Consumes: `calculateRequiredDiagnostics` (rules), `estimatePrice` (pricing, variante synchrone grille fallback — client-safe), `distanceFromToursKm` de `@/lib/geo/distance` (pur, table locale + haversine), `QuoteCalculation`/`QuestionnaireData` du store.
- Produces (utilisé par Tasks 10, 12) :
  - `toQuoteFormData(d: QuestionnaireData): QuoteFormData | null` — null si les prérequis moteur manquent
  - `computeLocalCalculation(d: QuestionnaireData): QuoteCalculation | null` — `source: "local"`
  - `toCalculateBody(d: QuestionnaireData): Record<string, unknown> | null` — payload pour `POST /api/calculate` (schéma `calculatePayloadSchema` : exige en plus `address` + `city`)

- [ ] **Step 1: Écrire les tests (rouges d'abord)**

```typescript
// lib/questionnaire/local-calc.test.ts
import { describe, expect, it } from "vitest";

import type { QuestionnaireData } from "@/lib/stores/questionnaire";

import { computeLocalCalculation, toCalculateBody, toQuoteFormData } from "./local-calc";

const COMPLETE: QuestionnaireData = {
  project_type: "sale",
  property_type: "house",
  address: "12 rue des Halles",
  postal_code: "37000",
  city: "Tours",
  surface: 95,
  rooms_count: 4,
  is_coownership: false,
  permit_date_range: "before_1949",
  heating_mode: "individual",
  heating_type: "gas",
  ecs_type: "gas",
  gas_installation: "city_gas",
  cooktop_connection: "souple",
  gas_over_15_years: true,
  electric_over_15_years: true,
  urgency: "week",
};

describe("toQuoteFormData", () => {
  it("retourne null si un prérequis moteur manque", () => {
    expect(toQuoteFormData({})).toBeNull();
    expect(toQuoteFormData({ ...COMPLETE, permit_date_range: undefined })).toBeNull();
    expect(toQuoteFormData({ ...COMPLETE, gas_over_15_years: undefined })).toBeNull();
  });

  it("mappe 1:1 les champs collectés (null explicite conservé)", () => {
    const fd = toQuoteFormData({ ...COMPLETE, gas_over_15_years: null });
    expect(fd).not.toBeNull();
    expect(fd?.gas_over_15_years).toBeNull();
    expect(fd?.postal_code).toBe("37000");
  });
});

describe("computeLocalCalculation", () => {
  it("null si données insuffisantes (le récap affichera l'état d'erreur)", () => {
    expect(computeLocalCalculation({})).toBeNull();
  });

  it("calcule diagnostics + estimation localement, source 'local'", () => {
    const calc = computeLocalCalculation(COMPLETE);
    expect(calc).not.toBeNull();
    expect(calc?.source).toBe("local");
    expect(calc?.required.map((d) => d.id)).toContain("dpe");
    expect(calc?.required.map((d) => d.id)).toContain("termites"); // CP 37
    expect(calc?.estimate.min).toBeGreaterThan(0);
    expect(calc?.estimate.max).toBeGreaterThanOrEqual(calc?.estimate.min ?? 0);
  });

  it("l'urgence asap module le prix (contexte transmis au pricing)", () => {
    const normal = computeLocalCalculation(COMPLETE);
    const urgent = computeLocalCalculation({ ...COMPLETE, urgency: "asap" });
    expect(urgent?.estimate.min).toBeGreaterThanOrEqual(normal?.estimate.min ?? 0);
    expect(urgent?.estimate.appliedModulators).toContain("Intervention < 48 h (+20 %)");
  });
});

describe("toCalculateBody", () => {
  it("null si adresse ou ville manquent (exigés par calculatePayloadSchema)", () => {
    expect(toCalculateBody({ ...COMPLETE, address: undefined })).toBeNull();
    expect(toCalculateBody({ ...COMPLETE, city: undefined })).toBeNull();
  });

  it("payload complet pour /api/calculate", () => {
    const body = toCalculateBody(COMPLETE);
    expect(body).toMatchObject({
      project_type: "sale",
      address: "12 rue des Halles",
      city: "Tours",
      urgency: "week",
    });
  });
});
```

- [ ] **Step 2: Vérifier l'échec**

Run: `corepack pnpm vitest run lib/questionnaire/local-calc.test.ts`
Expected: FAIL — module inexistant.

- [ ] **Step 3: Implémenter `lib/questionnaire/local-calc.ts`**

```typescript
/**
 * Calcul LOCAL du récapitulatif (diagnostics + estimation), sans réseau.
 *
 * Récap « dé-bloqué » : les moteurs purs (`rules.ts`, `estimatePrice` sur
 * grille fallback, `distanceFromToursKm`) tournent côté client → estimation
 * instantanée, plus jamais d'écran figé derrière un appel réseau. La grille
 * Supabase (admin) ne sert qu'au rafraîchissement en arrière-plan via
 * `/api/calculate` — voir RecapScreen.
 */

import { estimatePrice } from "@/lib/core/diagnostics/pricing";
import { calculateRequiredDiagnostics } from "@/lib/core/diagnostics/rules";
import type { QuoteFormData } from "@/lib/core/diagnostics/types";
import { distanceFromToursKm } from "@/lib/geo/distance";
import type { QuestionnaireData, QuoteCalculation } from "@/lib/stores/questionnaire";

/** Reconstruit l'entrée moteur ; null si un prérequis manque (retour en arrière requis). */
export function toQuoteFormData(d: QuestionnaireData): QuoteFormData | null {
  if (
    !d.project_type ||
    !d.property_type ||
    !d.postal_code ||
    typeof d.surface !== "number" ||
    typeof d.rooms_count !== "number" ||
    d.is_coownership === undefined ||
    !d.permit_date_range ||
    !d.heating_type ||
    !d.gas_installation ||
    d.gas_over_15_years === undefined ||
    d.electric_over_15_years === undefined
  ) {
    return null;
  }
  return {
    project_type: d.project_type,
    property_type: d.property_type,
    postal_code: d.postal_code,
    surface: d.surface,
    rooms_count: d.rooms_count,
    is_coownership: d.is_coownership,
    permit_date_range: d.permit_date_range,
    heating_type: d.heating_type,
    gas_installation: d.gas_installation,
    gas_over_15_years: d.gas_over_15_years,
    electric_over_15_years: d.electric_over_15_years,
    rental_furnished: d.rental_furnished,
    works_type: d.works_type,
    heating_mode: d.heating_mode,
    ecs_type: d.ecs_type,
    dependencies: d.dependencies,
    dependencies_converted: d.dependencies_converted,
    existing_valid_diagnostics: d.existing_valid_diagnostics,
    existing_diagnostics_files: d.existing_diagnostics_files,
    tenants_in_place: d.tenants_in_place,
    is_duplex: d.is_duplex,
    is_top_floor: d.is_top_floor,
  };
}

export function computeLocalCalculation(d: QuestionnaireData): QuoteCalculation | null {
  const formData = toQuoteFormData(d);
  if (!formData) return null;

  const diagnostics = calculateRequiredDiagnostics(formData);
  const distance = distanceFromToursKm(formData.postal_code);
  const estimate = estimatePrice(diagnostics.required, {
    surface: formData.surface,
    postal_code: formData.postal_code,
    property_type: formData.property_type,
    urgency: d.urgency ?? null,
    heating_mode: d.heating_mode,
    distance_km: distance ?? undefined,
  });

  return {
    required: diagnostics.required,
    toClarify: diagnostics.toClarify,
    estimate,
    source: "local",
  };
}

/** Payload pour POST /api/calculate (schéma serveur : exige aussi address + city). */
export function toCalculateBody(d: QuestionnaireData): Record<string, unknown> | null {
  const formData = toQuoteFormData(d);
  if (!formData || !d.address || !d.city) return null;
  return {
    ...formData,
    address: d.address,
    city: d.city,
    urgency: d.urgency,
    residence_name: d.residence_name,
    floor: d.floor,
    door_number: d.door_number,
    purchase_date: d.purchase_date,
    cadastral_reference: d.cadastral_reference,
    commercial_activity: d.commercial_activity,
    heated_zones_count: d.heated_zones_count,
    configuration_notes: d.configuration_notes,
    syndic_contact: d.syndic_contact,
    cooktop_connection: d.cooktop_connection,
  };
}
```

- [ ] **Step 4: Vérifier que les tests passent**

Run: `corepack pnpm vitest run lib/questionnaire/local-calc.test.ts`
Expected: PASS (7 tests).

- [ ] **Step 5: Typecheck + commit**

```bash
corepack pnpm typecheck
git add lib/questionnaire/local-calc.ts lib/questionnaire/local-calc.test.ts
git commit -m "feat: calcul local diagnostics + prix pour le recap (plus de blocage reseau)"
```

---

### Task 6: `ProgressBar` + `StepScreen` (coquille générique d'étape)

**Files:**
- Create: `components/questionnaire/components/ProgressBar.tsx`
- Create: `components/questionnaire/screens/StepScreen.tsx`

**Interfaces:**
- Consumes: `getBranchVars` de `../lib/branch-colors`, `BRANCHES` de `../lib/branches`, `ProjectType`.
- Produces (utilisé par Task 11) :
  - `ProgressBar({ current, total, title }: { current: number; total: number; title: string })`
  - `StepScreen(props: StepScreenProps)` avec `type StepScreenProps = { branch: ProjectType; title: string; stepNumber: number; stepCount: number; optional?: boolean; canContinue: boolean; nextLabel?: string; submitting?: boolean; error?: string | null; onBack: () => void; onNext: () => void; onRestart: () => void; children: ReactNode }`

Pas de test unitaire (composants de présentation purs) — vérification visuelle par Lyes en fin de chantier.

- [ ] **Step 1: Créer `ProgressBar.tsx`** (décision #3 : segments + numéro)

```tsx
"use client";

type ProgressBarProps = {
  /** Étape courante, 1-based. */
  current: number;
  total: number;
  title: string;
};

/**
 * Barre de progression du flux linéaire : segments (un par étape) + libellé
 * « Étape 3/6 — Le bâti ». Décision #3 de la spec refonte.
 */
export function ProgressBar({ current, total, title }: ProgressBarProps) {
  return (
    <div className="mb-5">
      <div className="mb-1.5 flex items-baseline justify-between gap-3">
        <span className="font-mono text-[11px] tracking-[0.14em] text-[var(--color-devis-muted)]">
          ÉTAPE {current}/{total}
        </span>
        <span className="truncate text-[12px] font-medium text-[var(--color-devis-ink)]">
          {title}
        </span>
      </div>
      <div
        role="progressbar"
        aria-valuemin={1}
        aria-valuemax={total}
        aria-valuenow={current}
        aria-label={`Étape ${current} sur ${total} — ${title}`}
        className="flex gap-1"
      >
        {Array.from({ length: total }, (_, i) => (
          <span
            key={i}
            className={[
              "h-1.5 flex-1 rounded-full transition-colors duration-300",
              i < current ? "bg-[var(--branch-fg)]" : "bg-[var(--color-devis-line)]",
            ].join(" ")}
          />
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Créer `StepScreen.tsx`**

```tsx
"use client";

import { ArrowLeftIcon, ArrowRightIcon, RotateCcwIcon } from "lucide-react";
import type { ReactNode } from "react";

import type { ProjectType } from "@/lib/core/diagnostics/types";

import { ProgressBar } from "../components/ProgressBar";
import { getBranchVars } from "../lib/branch-colors";
import { BRANCHES } from "../lib/branches";

type StepScreenProps = {
  branch: ProjectType;
  title: string;
  /** 1-based. */
  stepNumber: number;
  stepCount: number;
  optional?: boolean;
  canContinue: boolean;
  nextLabel?: string;
  submitting?: boolean;
  error?: string | null;
  onBack: () => void;
  onNext: () => void;
  onRestart: () => void;
  children: ReactNode;
};

/**
 * Coquille générique d'une étape du flux linéaire : top bar (retour, branche,
 * recommencer), barre de progression, titre, champs (children), CTA.
 * Une étape = un écran — le contenu peut scroller, la navigation reste simple.
 */
export function StepScreen({
  branch,
  title,
  stepNumber,
  stepCount,
  optional = false,
  canContinue,
  nextLabel = "Continuer",
  submitting = false,
  error = null,
  onBack,
  onNext,
  onRestart,
  children,
}: StepScreenProps) {
  const config = BRANCHES[branch];
  const BranchIcon = config.icon;

  return (
    <div
      style={getBranchVars(branch)}
      className="min-h-full bg-[var(--color-devis-cream)] px-4 py-5 sm:px-9 sm:py-8"
    >
      <div className="mx-auto max-w-2xl">
        {/* Top bar */}
        <div className="mb-5 flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-devis-line)] bg-white px-3 py-1.5 text-[12px] text-[var(--color-devis-ink)] hover:border-[var(--branch-fg)]/60"
          >
            <ArrowLeftIcon className="h-3.5 w-3.5" aria-hidden /> Retour
          </button>
          <div className="inline-flex items-center gap-2 rounded-full bg-[var(--branch-bg)] px-3 py-1.5 text-[12px] font-medium text-[var(--branch-dark)]">
            <BranchIcon className="h-3.5 w-3.5" aria-hidden /> {config.short}
          </div>
          <button
            type="button"
            onClick={onRestart}
            className="ml-auto inline-flex items-center gap-1.5 text-[12px] text-[var(--color-devis-muted)] hover:text-[var(--color-devis-ink)]"
          >
            <RotateCcwIcon className="h-3 w-3" aria-hidden /> Recommencer
          </button>
        </div>

        <ProgressBar current={stepNumber} total={stepCount} title={title} />

        <h1 className="mb-5 font-serif text-[26px] font-normal tracking-[-0.02em] text-[var(--color-devis-ink)] sm:text-[32px]">
          {title}
          {optional ? (
            <span className="ml-2 align-middle font-sans text-[13px] text-[var(--color-devis-muted)]">
              (facultatif)
            </span>
          ) : null}
        </h1>

        <div className="devis-reveal flex flex-col gap-4">{children}</div>

        <button
          type="button"
          disabled={!canContinue || submitting}
          onClick={onNext}
          className={[
            "mt-6 inline-flex w-full items-center justify-center gap-2 rounded-[12px] px-5 py-4 text-[16px] font-medium text-white transition-opacity",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--branch-fg)]/50",
            !canContinue || submitting
              ? "cursor-not-allowed bg-[var(--branch-fg)]/50"
              : "bg-[var(--branch-fg)] hover:opacity-90",
          ].join(" ")}
        >
          {submitting ? "Envoi en cours…" : nextLabel}
          {!submitting ? <ArrowRightIcon className="h-4.5 w-4.5" aria-hidden /> : null}
        </button>

        {error ? (
          <p role="alert" className="mt-3 text-center text-[13px] text-amber-700">
            {error}
          </p>
        ) : null}

        <p className="mt-2 text-center font-mono text-[11px] text-[var(--color-devis-muted)]">
          Sauvegardé automatiquement <span className="text-[var(--branch-fg)]">●</span>
        </p>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Typecheck + commit**

```bash
corepack pnpm typecheck
git add components/questionnaire/components/ProgressBar.tsx components/questionnaire/screens/StepScreen.tsx
git commit -m "feat: ProgressBar segments + StepScreen generique du flux lineaire"
```

---

### Task 7: Options partagées + étapes « Le bien » et « Le bâti »

**Files:**
- Create: `components/questionnaire/lib/options.ts` — **copie VERBATIM** de `components/questionnaire/screens/filling/options.ts` (l'original reste en place jusqu'au cleanup Task 13, ses consommateurs actuels ne bougent pas)
- Create: `components/questionnaire/steps/types.ts`
- Create: `components/questionnaire/steps/BienStep.tsx`
- Create: `components/questionnaire/steps/BienStepExtras.tsx`
- Create: `components/questionnaire/steps/BatiStep.tsx`

**Interfaces:**
- Consumes: primitives existantes `Chips` (`{options, value, onChange, ariaLabel}`), `ChipsMulti` (`{options, values, onToggle, ariaLabel}`), `RadioRow` (`{options, value, onChange, ariaLabel, columns?}`), `Field` (props input natives + `suffix?`), `Label` (`{children, help?}`), `AddressAutocomplete` (`{address, postalCode, city, onSelect, onManualChange}`), helpers `field-mapping` (`booleanToTriState`, `triStateToBoolean`, `permitStoreToUI`, `permitUIToStore`, `PERMIT_UI_OPTIONS`, types `TriState`, `PermitUIValue`).
- Produces (utilisé par Task 11) :
  - `type StepProps = { data: QuestionnaireData; updateData: (patch: QuestionnaireData) => void; branch: ProjectType }` (dans `steps/types.ts`)
  - `BienStep(props: StepProps)`, `BatiStep(props: StepProps)` — composants d'étape à layout plat (plus de sous-blocs repliables : tout est visible, pile verticale mobile-first)

- [ ] **Step 1: Créer `components/questionnaire/lib/options.ts`**

Copier le contenu intégral de `components/questionnaire/screens/filling/options.ts` (120 lignes, constantes `PROPERTY_TYPE_OPTIONS`, `HEATING_OPTIONS`, `HEATING_MODE_OPTIONS`, `ECS_OPTIONS`, `GAS_INSTALLATION_OPTIONS`, `COOKTOP_OPTIONS`, `RENTAL_FURNISHED_OPTIONS`, `WORKS_TYPE_OPTIONS`, `URGENCY_OPTIONS`, `REFERRAL_OPTIONS`, `DEPENDENCIES_OPTIONS`, `EXISTING_DIAGS_OPTIONS`, `TRISTATE_OPTIONS`, `TRISTATE_COMPACT_OPTIONS`) sans aucune modification de valeur. Ajouter en fin de fichier la classe partagée des textarea :

```typescript
/** Classe partagée des <textarea> du questionnaire (évite la duplication). */
export const TEXTAREA_CLASS =
  "w-full rounded-[10px] border border-[var(--color-devis-line)] bg-white px-3.5 py-3 text-[14px] text-[var(--color-devis-ink)] outline-none focus:border-[var(--branch-fg)] focus-visible:ring-2 focus-visible:ring-[var(--branch-fg)]/30";
```

- [ ] **Step 2: Créer `components/questionnaire/steps/types.ts`**

```typescript
import type { ProjectType } from "@/lib/core/diagnostics/types";
import type { QuestionnaireData } from "@/lib/stores/questionnaire";

/** Props communes des composants d'étape du flux linéaire. */
export type StepProps = {
  data: QuestionnaireData;
  updateData: (patch: QuestionnaireData) => void;
  branch: ProjectType;
};
```

- [ ] **Step 3: Créer `BienStep.tsx`** (champs cœur ; les sections conditionnelles vivent dans `BienStepExtras`)

```tsx
"use client";

import { AddressAutocomplete } from "@/components/questionnaire/components/AddressAutocomplete";
import { Chips } from "@/components/questionnaire/components/Chips";
import { Field } from "@/components/questionnaire/components/Field";
import { Label } from "@/components/questionnaire/components/Label";
import { RadioRow } from "@/components/questionnaire/components/RadioRow";
import {
  booleanToTriState,
  triStateToBoolean,
  type TriState,
} from "@/components/questionnaire/lib/field-mapping";
import { PROPERTY_TYPE_OPTIONS, TRISTATE_OPTIONS } from "@/components/questionnaire/lib/options";

import { BienStepExtras } from "./BienStepExtras";
import type { StepProps } from "./types";

/** Étape « Le bien » — layout plat, tout visible (fini les sous-blocs repliables). */
export function BienStep({ data, updateData, branch }: StepProps) {
  return (
    <>
      <div>
        <Label>Type de bien</Label>
        <Chips
          ariaLabel="Type de bien"
          options={PROPERTY_TYPE_OPTIONS}
          value={data.property_type}
          onChange={(value) => updateData({ property_type: value })}
        />
      </div>

      <div>
        <Label help="Commencez à taper, nous remplissons le code postal et la ville automatiquement.">
          Adresse du bien
        </Label>
        <AddressAutocomplete
          address={data.address ?? ""}
          postalCode={data.postal_code ?? ""}
          city={data.city ?? ""}
          onSelect={({ address, postalCode, city }) =>
            updateData({ address, postal_code: postalCode, city })
          }
          onManualChange={(v) => updateData({ address: v, postal_code: "", city: "" })}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Surface</Label>
          <Field
            type="number"
            inputMode="numeric"
            min={1}
            max={10000}
            suffix="m²"
            value={data.surface ?? ""}
            onChange={(e) => {
              const v = e.target.value === "" ? undefined : Number(e.target.value);
              updateData({ surface: v });
            }}
            placeholder="92"
            aria-label="Surface en m²"
          />
        </div>
        <div>
          <Label>Nombre de pièces</Label>
          <Field
            type="number"
            inputMode="numeric"
            min={1}
            max={20}
            value={data.rooms_count ?? ""}
            onChange={(e) => {
              const v = e.target.value === "" ? undefined : Number(e.target.value);
              updateData({ rooms_count: v });
            }}
            placeholder="4"
            aria-label="Nombre de pièces"
          />
        </div>
      </div>

      <div>
        <Label>Le bien est-il en copropriété ?</Label>
        <RadioRow
          ariaLabel="Copropriété"
          options={TRISTATE_OPTIONS}
          value={booleanToTriState(data.is_coownership)}
          onChange={(v: TriState) => updateData({ is_coownership: triStateToBoolean(v) })}
        />
      </div>

      <BienStepExtras data={data} updateData={updateData} branch={branch} />
    </>
  );
}
```

- [ ] **Step 4: Créer `BienStepExtras.tsx`** (sections conditionnelles : appartement, local pro, dépendances, cadastre)

```tsx
"use client";

import { ChipsMulti } from "@/components/questionnaire/components/ChipsMulti";
import { Field } from "@/components/questionnaire/components/Field";
import { Label } from "@/components/questionnaire/components/Label";
import { RadioRow } from "@/components/questionnaire/components/RadioRow";
import {
  booleanToTriState,
  triStateToBoolean,
  type TriState,
} from "@/components/questionnaire/lib/field-mapping";
import {
  DEPENDENCIES_OPTIONS,
  TEXTAREA_CLASS,
  TRISTATE_COMPACT_OPTIONS,
} from "@/components/questionnaire/lib/options";

import type { StepProps } from "./types";

/** Sections conditionnelles de l'étape « Le bien » (appartement / local pro / dépendances / cadastre). */
export function BienStepExtras({ data, updateData }: StepProps) {
  const dependencies = data.dependencies ?? [];
  const toggleDependency = (v: (typeof DEPENDENCIES_OPTIONS)[number]["value"]) => {
    const next = dependencies.includes(v)
      ? dependencies.filter((x) => x !== v)
      : [...dependencies, v];
    updateData({ dependencies: next });
  };

  return (
    <>
      {data.property_type === "apartment" ? (
        <div className="flex flex-col gap-3 rounded-[12px] border border-[var(--color-devis-line)] bg-white/60 p-4">
          <div className="font-mono text-[11px] tracking-[0.1em] text-[var(--color-devis-muted)]">
            PRÉCISIONS APPARTEMENT
          </div>
          <div>
            <Label>Nom de la résidence</Label>
            <Field
              value={data.residence_name ?? ""}
              onChange={(e) => updateData({ residence_name: e.target.value })}
              placeholder="Résidence des Tilleuls"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Étage</Label>
              <Field
                type="number"
                inputMode="numeric"
                min={-5}
                max={100}
                value={data.floor ?? ""}
                onChange={(e) => {
                  const v = e.target.value === "" ? undefined : Number(e.target.value);
                  updateData({ floor: v });
                }}
                placeholder="3"
              />
            </div>
            <div>
              <Label>N° de porte</Label>
              <Field
                value={data.door_number ?? ""}
                onChange={(e) => updateData({ door_number: e.target.value })}
                placeholder="12B"
              />
            </div>
          </div>
          <div>
            <Label>Dernier étage ?</Label>
            <RadioRow
              ariaLabel="Dernier étage"
              options={TRISTATE_COMPACT_OPTIONS}
              value={booleanToTriState(data.is_top_floor)}
              onChange={(v: TriState) => updateData({ is_top_floor: triStateToBoolean(v) })}
            />
          </div>
          <div>
            <Label>Duplex ?</Label>
            <RadioRow
              ariaLabel="Duplex"
              options={TRISTATE_COMPACT_OPTIONS}
              value={booleanToTriState(data.is_duplex)}
              onChange={(v: TriState) => updateData({ is_duplex: triStateToBoolean(v) })}
            />
          </div>
        </div>
      ) : null}

      {data.property_type === "commercial" ? (
        <div className="flex flex-col gap-3 rounded-[12px] border border-[var(--color-devis-line)] bg-white/60 p-4">
          <div className="font-mono text-[11px] tracking-[0.1em] text-[var(--color-devis-muted)]">
            LOCAL PROFESSIONNEL
          </div>
          <div>
            <Label>Activité exercée</Label>
            <Field
              value={data.commercial_activity ?? ""}
              onChange={(e) => updateData({ commercial_activity: e.target.value })}
              placeholder="Bureau, commerce, restaurant…"
            />
          </div>
          <div>
            <Label>Nombre de zones chauffées</Label>
            <Field
              type="number"
              inputMode="numeric"
              min={0}
              max={50}
              value={data.heated_zones_count ?? ""}
              onChange={(e) => {
                const v = e.target.value === "" ? undefined : Number(e.target.value);
                updateData({ heated_zones_count: v });
              }}
              placeholder="2"
            />
          </div>
          <div>
            <Label help="Configuration du local, accès spécifiques, horaires d'ouverture…">
              Configuration (optionnel)
            </Label>
            <textarea
              value={data.configuration_notes ?? ""}
              onChange={(e) => updateData({ configuration_notes: e.target.value })}
              rows={2}
              maxLength={2000}
              className={TEXTAREA_CLASS}
            />
          </div>
        </div>
      ) : null}

      <div>
        <Label help="Cave, garage, atelier… Cochez celles qui existent (optionnel).">
          Dépendances
        </Label>
        <ChipsMulti
          ariaLabel="Dépendances"
          options={DEPENDENCIES_OPTIONS}
          values={dependencies}
          onToggle={toggleDependency}
        />
        {dependencies.length > 0 ? (
          <div className="mt-2">
            <Label>Aménagées (pièces à vivre) ?</Label>
            <RadioRow
              ariaLabel="Dépendances aménagées"
              options={TRISTATE_COMPACT_OPTIONS}
              value={booleanToTriState(data.dependencies_converted)}
              onChange={(v: TriState) =>
                updateData({ dependencies_converted: triStateToBoolean(v) })
              }
            />
          </div>
        ) : null}
      </div>

      <div>
        <Label help="Sur votre taxe foncière ou cadastre.gouv.fr (optionnel).">
          Référence cadastrale
        </Label>
        <Field
          value={data.cadastral_reference ?? ""}
          onChange={(e) => updateData({ cadastral_reference: e.target.value })}
          placeholder="Ex : AB 123"
        />
      </div>
    </>
  );
}
```

- [ ] **Step 5: Créer `BatiStep.tsx`**

```tsx
"use client";

import { Chips } from "@/components/questionnaire/components/Chips";
import { Field } from "@/components/questionnaire/components/Field";
import { Label } from "@/components/questionnaire/components/Label";
import { RadioRow } from "@/components/questionnaire/components/RadioRow";
import {
  PERMIT_UI_OPTIONS,
  booleanToTriState,
  permitStoreToUI,
  permitUIToStore,
  triStateToBoolean,
  type PermitUIValue,
  type TriState,
} from "@/components/questionnaire/lib/field-mapping";
import {
  COOKTOP_OPTIONS,
  ECS_OPTIONS,
  GAS_INSTALLATION_OPTIONS,
  HEATING_MODE_OPTIONS,
  HEATING_OPTIONS,
  TRISTATE_COMPACT_OPTIONS,
} from "@/components/questionnaire/lib/options";
import type { QuestionnaireData } from "@/lib/stores/questionnaire";

import type { StepProps } from "./types";

const hasGas = (d: QuestionnaireData) =>
  !!d.gas_installation && d.gas_installation !== "none" && d.gas_installation !== "unknown";

/** Étape « Le bâti » — année de construction + chauffage/gaz/élec. */
export function BatiStep({ data, updateData }: StepProps) {
  return (
    <>
      <div>
        <Label help="Cette date détermine les risques plomb et amiante.">
          Date du permis de construire
        </Label>
        <RadioRow
          ariaLabel="Date du permis de construire"
          options={PERMIT_UI_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
          value={permitStoreToUI(data.permit_date_range)}
          onChange={(v: PermitUIValue) => updateData({ permit_date_range: permitUIToStore(v) })}
          columns={4}
        />
      </div>

      <div>
        <Label help="Le collectif déclenche des diagnostics spécifiques en copropriété.">
          Mode de chauffage
        </Label>
        <Chips
          ariaLabel="Mode de chauffage"
          options={HEATING_MODE_OPTIONS}
          value={data.heating_mode}
          onChange={(v) => updateData({ heating_mode: v })}
        />
      </div>

      <div>
        <Label>Type de chauffage</Label>
        <Chips
          ariaLabel="Type de chauffage"
          options={HEATING_OPTIONS}
          value={data.heating_type}
          onChange={(v) => updateData({ heating_type: v })}
        />
      </div>

      <div>
        <Label>Eau chaude sanitaire</Label>
        <Chips
          ariaLabel="Eau chaude sanitaire"
          options={ECS_OPTIONS}
          value={data.ecs_type}
          onChange={(v) => updateData({ ecs_type: v })}
        />
      </div>

      <div>
        <Label>Installation gaz</Label>
        <Chips
          ariaLabel="Installation gaz"
          options={GAS_INSTALLATION_OPTIONS}
          value={data.gas_installation}
          onChange={(v) => updateData({ gas_installation: v })}
        />
      </div>

      {hasGas(data) ? (
        <div>
          <Label>Raccordement de la table de cuisson</Label>
          <RadioRow
            ariaLabel="Raccordement table de cuisson"
            options={COOKTOP_OPTIONS}
            value={data.cooktop_connection}
            onChange={(v) =>
              updateData({ cooktop_connection: v as "souple" | "rigide" | "unknown" })
            }
          />
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label>Installation gaz de plus de 15 ans ?</Label>
          <RadioRow
            ariaLabel="Installation gaz de plus de 15 ans"
            options={TRISTATE_COMPACT_OPTIONS}
            value={booleanToTriState(data.gas_over_15_years)}
            onChange={(v: TriState) => updateData({ gas_over_15_years: triStateToBoolean(v) })}
          />
        </div>
        <div>
          <Label>Installation élec de plus de 15 ans ?</Label>
          <RadioRow
            ariaLabel="Installation électrique de plus de 15 ans"
            options={TRISTATE_COMPACT_OPTIONS}
            value={booleanToTriState(data.electric_over_15_years)}
            onChange={(v: TriState) =>
              updateData({ electric_over_15_years: triStateToBoolean(v) })
            }
          />
        </div>
      </div>

      <div>
        <Label help="Si différente du permis de construire — optionnel.">
          Date d'achat (optionnel)
        </Label>
        <Field
          type="date"
          value={data.purchase_date ?? ""}
          onChange={(e) => updateData({ purchase_date: e.target.value })}
        />
      </div>
    </>
  );
}
```

Note apostrophes JSX : dans les littéraux de texte JSX, échapper `'` en `&apos;` si ESLint (`react/no-unescaped-entities`) le réclame — « Date d&apos;achat » ci-dessus, même règle pour toutes les tâches suivantes.

- [ ] **Step 6: Typecheck + commit**

```bash
corepack pnpm typecheck
git add components/questionnaire/lib/options.ts components/questionnaire/steps/
git commit -m "feat: etapes Le bien / Le bati en layout plat (flux lineaire)"
```

---

### Task 8: Étapes Spécifique, Contact, Existants, Délai, Autre

**Files:**
- Create: `components/questionnaire/steps/SpecifiqueStep.tsx`
- Create: `components/questionnaire/steps/ContactStep.tsx`
- Create: `components/questionnaire/steps/ExistantsStep.tsx`
- Create: `components/questionnaire/steps/DelaiStep.tsx`
- Create: `components/questionnaire/steps/AutreStep.tsx`

**Interfaces:**
- Consumes: `StepProps` de `./types`, primitives + options comme en Task 7.
- Produces: `SpecifiqueStep`, `ContactStep`, `ExistantsStep`, `DelaiStep`, `AutreStep` — tous `(props: StepProps) => JSX`.

- [ ] **Step 1: Créer `SpecifiqueStep.tsx`**

```tsx
"use client";

import { Chips } from "@/components/questionnaire/components/Chips";
import { Label } from "@/components/questionnaire/components/Label";
import {
  RENTAL_FURNISHED_OPTIONS,
  WORKS_TYPE_OPTIONS,
} from "@/components/questionnaire/lib/options";

import type { StepProps } from "./types";

/** Étape spécifique à la branche : type de bail (location) ou nature des travaux. */
export function SpecifiqueStep({ data, updateData, branch }: StepProps) {
  if (branch === "rental") {
    return (
      <div>
        <Label help="Impacte la Loi Boutin (location vide uniquement).">Type de bail</Label>
        <Chips
          ariaLabel="Type de bail"
          options={RENTAL_FURNISHED_OPTIONS}
          value={data.rental_furnished}
          onChange={(v) => updateData({ rental_furnished: v })}
        />
      </div>
    );
  }
  if (branch === "works") {
    return (
      <div>
        <Label help="Détermine les repérages amiante / plomb avant chantier.">
          Nature des travaux
        </Label>
        <Chips
          ariaLabel="Type de travaux"
          options={WORKS_TYPE_OPTIONS}
          value={data.works_type}
          onChange={(v) => updateData({ works_type: v })}
        />
      </div>
    );
  }
  // Défensif : cette étape n'est générée par getSteps que pour rental/works.
  return null;
}
```

- [ ] **Step 2: Créer `ContactStep.tsx`** (décision #1 — email capturé ici, tôt)

```tsx
"use client";

import { LockIcon } from "lucide-react";

import { Field } from "@/components/questionnaire/components/Field";
import { Label } from "@/components/questionnaire/components/Label";

import type { StepProps } from "./types";

/**
 * Étape « Vos coordonnées » — capture email + prénom + téléphone AVANT les
 * dernières étapes (décision #1) : un abandon tardif laisse un lead
 * exploitable (relance J+1).
 */
export function ContactStep({ data, updateData }: StepProps) {
  return (
    <>
      <div>
        <Label help="Pour vous envoyer le récapitulatif et votre estimation.">Email</Label>
        <Field
          type="email"
          autoComplete="email"
          inputMode="email"
          value={data.email ?? ""}
          onChange={(e) => updateData({ email: e.target.value })}
          placeholder="vous@exemple.fr"
          aria-label="Email"
        />
      </div>

      <div>
        <Label>Prénom</Label>
        <Field
          autoComplete="given-name"
          value={data.first_name ?? ""}
          onChange={(e) => updateData({ first_name: e.target.value })}
          placeholder="Marie"
          aria-label="Prénom"
        />
      </div>

      <div>
        <Label help="Numéro joignable pour caler le rendez-vous.">Téléphone</Label>
        <Field
          type="tel"
          autoComplete="tel"
          value={data.phone ?? ""}
          onChange={(e) => updateData({ phone: e.target.value })}
          placeholder="06 12 34 56 78"
          aria-label="Téléphone"
        />
      </div>

      <p className="font-mono text-[11px] tracking-[0.08em] text-[var(--color-devis-muted)]">
        <LockIcon className="mr-1.5 inline h-2.5 w-2.5 align-middle" aria-hidden />
        données chiffrées · rgpd · pas de spam
      </p>
    </>
  );
}
```

- [ ] **Step 3: Créer `ExistantsStep.tsx`** (contenu porté de l'ancien `DiagnosticsStep`)

```tsx
"use client";

import { ChipsMulti } from "@/components/questionnaire/components/ChipsMulti";
import { EXISTING_DIAGS_OPTIONS } from "@/components/questionnaire/lib/options";

import type { StepProps } from "./types";

/** Étape facultative « Diagnostics déjà valides » — jamais bloquante. */
export function ExistantsStep({ data, updateData }: StepProps) {
  const existingDiags = data.existing_valid_diagnostics ?? [];
  const toggleExisting = (v: (typeof EXISTING_DIAGS_OPTIONS)[number]["value"]) => {
    const next = existingDiags.includes(v)
      ? existingDiags.filter((x) => x !== v)
      : [...existingDiags, v];
    updateData({ existing_valid_diagnostics: next });
  };

  return (
    <>
      <p className="text-[13px] text-[var(--color-devis-muted)]">
        Cochez les diagnostics que vous avez déjà et qui sont encore valides. Nous les
        exclurons du devis (économie réelle). Si vous n&apos;en avez aucun, continuez.
      </p>
      <ChipsMulti
        ariaLabel="Diagnostics déjà valides"
        options={EXISTING_DIAGS_OPTIONS}
        values={existingDiags}
        onToggle={toggleExisting}
      />
      {existingDiags.includes("asbestos") || existingDiags.includes("lead") ? (
        <div className="rounded-[10px] border border-dashed border-[var(--color-devis-line)] bg-white/60 p-3 text-[12px] text-[var(--color-devis-muted)]">
          Amiante et plomb : merci d&apos;envoyer le diagnostic existant par email après
          soumission ; sinon le technicien le refait sur place.
        </div>
      ) : null}
    </>
  );
}
```

- [ ] **Step 4: Créer `DelaiStep.tsx`** (délai + accès + provenance — spec : « Délai + accès »)

```tsx
"use client";

import { Chips } from "@/components/questionnaire/components/Chips";
import { Field } from "@/components/questionnaire/components/Field";
import { Label } from "@/components/questionnaire/components/Label";
import { RadioRow } from "@/components/questionnaire/components/RadioRow";
import {
  booleanToTriState,
  triStateToBoolean,
  type TriState,
} from "@/components/questionnaire/lib/field-mapping";
import {
  REFERRAL_OPTIONS,
  TEXTAREA_CLASS,
  TRISTATE_OPTIONS,
  URGENCY_OPTIONS,
} from "@/components/questionnaire/lib/options";

import type { StepProps } from "./types";

/** Étape « Délai & accès » — urgence (requise) + infos d'accès facultatives. */
export function DelaiStep({ data, updateData }: StepProps) {
  return (
    <>
      <div>
        <Label>Dans quel délai ?</Label>
        <RadioRow
          ariaLabel="Urgence"
          options={URGENCY_OPTIONS}
          value={data.urgency}
          onChange={(v) => updateData({ urgency: v })}
          columns={5}
        />
      </div>

      <div>
        <Label help="Horaires d'accès, contact gardien, digicode, présence animaux… (optionnel)">
          Accès au bien
        </Label>
        <textarea
          value={data.access_notes ?? ""}
          onChange={(e) => updateData({ access_notes: e.target.value })}
          rows={2}
          maxLength={1000}
          placeholder="Accès libre, clés chez le gardien au 2e étage…"
          className={TEXTAREA_CLASS}
        />
      </div>

      <div>
        <Label>Locataire(s) en place ? (optionnel)</Label>
        <RadioRow
          ariaLabel="Locataire en place"
          options={TRISTATE_OPTIONS}
          value={booleanToTriState(data.tenants_in_place)}
          onChange={(v: TriState) => updateData({ tenants_in_place: triStateToBoolean(v) })}
        />
      </div>

      {data.heating_mode === "collective" ? (
        <div>
          <Label help="Nécessaire pour le DPE collectif (optionnel).">
            Coordonnées du syndic
          </Label>
          <textarea
            value={data.syndic_contact ?? ""}
            onChange={(e) => updateData({ syndic_contact: e.target.value })}
            rows={2}
            maxLength={500}
            placeholder="Cabinet Dupont, 02 47 00 00 00"
            className={TEXTAREA_CLASS}
          />
        </div>
      ) : null}

      <div>
        <Label help="Facultatif — précisez un créneau, un contexte particulier…">
          Notes complémentaires
        </Label>
        <textarea
          value={data.notes ?? ""}
          onChange={(e) => updateData({ notes: e.target.value })}
          rows={3}
          maxLength={2000}
          placeholder="Un accès particulier, un créneau précis…"
          className={TEXTAREA_CLASS}
        />
      </div>

      <div>
        <Label>Comment nous avez-vous trouvés ? (optionnel)</Label>
        <Chips
          ariaLabel="Source du contact"
          options={REFERRAL_OPTIONS}
          value={data.referral_source}
          onChange={(v) => updateData({ referral_source: v })}
        />
        {data.referral_source === "autre" ? (
          <div className="mt-2">
            <Field
              value={data.referral_other ?? ""}
              onChange={(e) => updateData({ referral_other: e.target.value })}
              placeholder="Précisez…"
            />
          </div>
        ) : null}
      </div>
    </>
  );
}
```

- [ ] **Step 5: Créer `AutreStep.tsx`** (branche « autre » : chemin ultra-court, un seul écran)

```tsx
"use client";

import { CheckIcon } from "lucide-react";

import { Field } from "@/components/questionnaire/components/Field";
import { Label } from "@/components/questionnaire/components/Label";
import { TEXTAREA_CLASS } from "@/components/questionnaire/lib/options";

import type { StepProps } from "./types";

/**
 * Branche « Autre projet » : description libre + coordonnées + consentement,
 * sur UN écran. Pas de calcul diagnostics/prix — l'équipe recontacte.
 */
export function AutreStep({ data, updateData }: StepProps) {
  return (
    <>
      <div>
        <Label help="Décrivez votre besoin en quelques phrases (10 caractères minimum).">
          Votre besoin
        </Label>
        <textarea
          value={data.notes ?? ""}
          onChange={(e) => updateData({ notes: e.target.value })}
          rows={4}
          maxLength={2000}
          placeholder="Ex : diagnostic avant division de parcelle, mesurage d'un local atypique…"
          className={TEXTAREA_CLASS}
        />
      </div>

      <div>
        <Label>Email</Label>
        <Field
          type="email"
          autoComplete="email"
          inputMode="email"
          value={data.email ?? ""}
          onChange={(e) => updateData({ email: e.target.value })}
          placeholder="vous@exemple.fr"
          aria-label="Email"
        />
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        <div>
          <Label>Prénom</Label>
          <Field
            autoComplete="given-name"
            value={data.first_name ?? ""}
            onChange={(e) => updateData({ first_name: e.target.value })}
            aria-label="Prénom"
          />
        </div>
        <div>
          <Label>Téléphone</Label>
          <Field
            type="tel"
            autoComplete="tel"
            value={data.phone ?? ""}
            onChange={(e) => updateData({ phone: e.target.value })}
            placeholder="06 12 34 56 78"
            aria-label="Téléphone"
          />
        </div>
      </div>

      <label className="flex cursor-pointer items-start gap-2.5 text-[12px] leading-relaxed text-[var(--color-devis-muted)]">
        <input
          type="checkbox"
          checked={data.consent_rgpd ?? false}
          onChange={(e) => updateData({ consent_rgpd: e.target.checked })}
          className="sr-only"
          aria-label="Consentement RGPD"
        />
        <span
          aria-hidden
          className={[
            "mt-0.5 flex h-4 w-4 flex-none items-center justify-center rounded border-[1.5px]",
            data.consent_rgpd
              ? "border-[var(--branch-fg)] bg-[var(--branch-fg)] text-white"
              : "border-[var(--color-devis-line)] bg-white",
          ].join(" ")}
        >
          {data.consent_rgpd ? <CheckIcon className="h-2.5 w-2.5" /> : null}
        </span>
        <span>
          J&apos;accepte que mes données soient utilisées pour ma demande. Pas de spam, vos
          données restent chez nous.
        </span>
      </label>
    </>
  );
}
```

- [ ] **Step 6: Typecheck + commit**

```bash
corepack pnpm typecheck
git add components/questionnaire/steps/
git commit -m "feat: etapes Specifique/Contact/Existants/Delai/Autre du flux lineaire"
```

---

### Task 9: API — draft élargi (`first_name`/`phone`) + variante branche « autre »

Le draft (`POST /api/quote-request`) est désormais déclenché en quittant l'étape Contact : le client dispose alors de `first_name` et `phone` en plus de l'email — on les enregistre (lead plus riche pour la relance J+1). La branche « autre » soumet directement via ce même endpoint (statut `submitted`, pas de calcul).

**Files:**
- Modify: `app/api/quote-request/route.ts`

**Interfaces:**
- Consumes: schémas Zod existants (`step1Schema`, `step2Schema`, `step3Schema`), `getSupabaseServiceClient`, helpers `@/lib/api/responses`.
- Produces: `POST /api/quote-request` accepte désormais :
  - **payload classique** (inchangé + `first_name?: string`, `phone?: string`) → insert `status: "email_captured"`, réponse `ok({ id }, 201)` ;
  - **payload « autre »** `{ project_type: "other", email, first_name, phone, notes, consent_rgpd: true, source?, medium?, campaign?, referer?, user_agent? }` → insert `status: "submitted"` + `consent_at`, réponse `ok({ id }, 201)`.

- [ ] **Step 1: Ajouter le schéma « autre » et élargir le schéma draft**

Dans `app/api/quote-request/route.ts`, remplacer la déclaration `createDraftSchema` par :

```typescript
// Tracking optionnel commun aux deux variantes.
const trackingSchema = z.object({
  source: z.string().optional(),
  medium: z.string().optional(),
  campaign: z.string().optional(),
  referer: z.string().optional(),
  user_agent: z.string().optional(),
});

// Schéma draft classique : 3 premières étapes + contact enrichi + tracking.
const createDraftSchema = step1Schema
  .merge(step2Schema)
  .merge(step3Schema)
  .merge(trackingSchema)
  .extend({
    first_name: z.string().max(100).optional(),
    phone: z.string().max(30).optional(),
  });

// Branche « autre » : chemin ultra-court, soumission directe sans calcul.
const otherRequestSchema = z
  .object({
    project_type: z.literal("other"),
    email: z.string().email("Format email invalide"),
    first_name: z.string().min(1, "Prénom requis").max(100),
    phone: z
      .string()
      .refine((v) => v.replace(/\D/g, "").length >= 8, "Téléphone trop court (≥ 8 chiffres)"),
    notes: z.string().min(10, "Décrivez votre besoin (10 caractères minimum)").max(2000),
    consent_rgpd: z.boolean().refine((v) => v === true, { message: "Consentement RGPD requis" }),
  })
  .merge(trackingSchema);
```

- [ ] **Step 2: Brancher la variante « autre » dans le handler**

Après le parse JSON (`raw`), insérer AVANT le `createDraftSchema.safeParse(raw)` existant :

```typescript
  // Branche « autre » : soumission directe (description libre, pas de calcul).
  const isOther =
    typeof raw === "object" &&
    raw !== null &&
    (raw as Record<string, unknown>).project_type === "other";

  if (isOther) {
    const parsedOther = otherRequestSchema.safeParse(raw);
    if (!parsedOther.success) return fromZodError(parsedOther.error);

    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from("quote_requests")
      .insert({
        status: "submitted" as const,
        project_type: "other" as const,
        email: parsedOther.data.email,
        email_captured_at: now,
        first_name: parsedOther.data.first_name,
        phone: parsedOther.data.phone,
        notes: parsedOther.data.notes,
        consent_rgpd: true,
        consent_at: now,
        source: parsedOther.data.source ?? null,
        medium: parsedOther.data.medium ?? null,
        campaign: parsedOther.data.campaign ?? null,
        referer: parsedOther.data.referer ?? null,
        user_agent: parsedOther.data.user_agent ?? null,
      })
      .select("id")
      .single<Pick<QuoteRequestRow, "id">>();

    if (error) {
      console.error("[/api/quote-request] insert (other) error", error);
      return serverError("Impossible d'enregistrer la demande.");
    }
    return ok({ id: data.id }, { status: 201 });
  }
```

- [ ] **Step 3: Enrichir l'insert du draft classique**

Dans `insertPayload` existant, ajouter après `email_captured_at: now,` :

```typescript
    first_name: parsed.data.first_name ?? null,
    phone: parsed.data.phone ?? null,
```

- [ ] **Step 4: Typecheck + tests + commit**

```bash
corepack pnpm typecheck
corepack pnpm test
git add app/api/quote-request/route.ts
git commit -m "feat: draft enrichi (prenom/tel) + soumission directe branche autre"
```

---

### Task 10: API — route de soumission finale (manquante → 404 aujourd'hui)

**Files:**
- Create: `app/api/quote-request/[id]/submit/route.ts`

**Interfaces:**
- Consumes: `fullQuoteSchema` (validation stricte), `toQuoteFormData` de `@/lib/questionnaire/local-calc` (Task 5 — un `FullQuoteInput` validé satisfait toujours ses gardes), `calculateRequiredDiagnostics`, `loadPricingGrid` + `estimatePriceWithGrid` (grille Supabase côté serveur), `distanceFromToursKm`, `getSupabaseServiceClient`, helpers `@/lib/api/responses`, type `Json` de `@/lib/supabase/types`.
- Produces: `POST /api/quote-request/{id}/submit` → recalcule diagnostics + prix **côté serveur** (on ne fait pas confiance au client), met à jour la ligne (`status: "submitted"`, snapshot calculs, consentement) → `ok({ id })`. Erreurs : 400 (id non-UUID / body invalide), 404 (ligne inconnue), 503 (Supabase absent).

- [ ] **Step 1: Créer la route**

Next 16 : les `params` des routes dynamiques sont un `Promise` (pattern déjà utilisé dans `app/(marketing)/actualites/[slug]/page.tsx`).

```typescript
/**
 * POST /api/quote-request/[id]/submit
 *
 * Soumission finale du questionnaire : valide l'intégralité des réponses
 * (fullQuoteSchema), recalcule diagnostics + estimation CÔTÉ SERVEUR (grille
 * Supabase, jamais les valeurs envoyées par le client) et passe la demande en
 * `submitted`.
 *
 * Cette route manquait : l'ancien RecapScreen l'appelait déjà → 404 → la
 * soumission finale échouait systématiquement quand Supabase était configuré.
 */

import { NextResponse } from "next/server";
import { z } from "zod";

import {
  badRequest,
  fromZodError,
  notConfigured,
  notFound,
  ok,
  serverError,
} from "@/lib/api/responses";
import { estimatePriceWithGrid, loadPricingGrid } from "@/lib/core/diagnostics/pricing";
import { calculateRequiredDiagnostics } from "@/lib/core/diagnostics/rules";
import { distanceFromToursKm } from "@/lib/geo/distance";
import { toQuoteFormData } from "@/lib/questionnaire/local-calc";
import { getSupabaseServiceClient } from "@/lib/supabase/server";
import type { Json, QuoteRequestRow } from "@/lib/supabase/types";
import { fullQuoteSchema } from "@/lib/validation/schemas";

/** Sérialise proprement vers le type Json de Supabase (structures issues des moteurs). */
function toJson(value: unknown): Json {
  return JSON.parse(JSON.stringify(value)) as Json;
}

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const supabase = getSupabaseServiceClient();
  if (!supabase) {
    return notConfigured(
      "Supabase non configuré — la demande ne peut pas être enregistrée en base."
    );
  }

  const { id } = await context.params;
  if (!z.string().uuid().safeParse(id).success) {
    return badRequest("Identifiant de demande invalide.");
  }

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return badRequest("Corps JSON invalide");
  }

  const parsed = fullQuoteSchema.safeParse(raw);
  if (!parsed.success) return fromZodError(parsed.error);
  const d = parsed.data;

  // ── Recalcul serveur (source de vérité) ─────────────────────────────────
  const formData = toQuoteFormData(d);
  if (!formData) return badRequest("Réponses insuffisantes pour calculer les diagnostics.");

  const diagnostics = calculateRequiredDiagnostics(formData);
  const grid = await loadPricingGrid();
  const distance_km = distanceFromToursKm(d.postal_code) ?? undefined;
  const estimate = estimatePriceWithGrid(grid, diagnostics.required, {
    surface: d.surface,
    postal_code: d.postal_code,
    property_type: d.property_type,
    urgency: d.urgency ?? null,
    heating_mode: d.heating_mode,
    distance_km,
  });

  const now = new Date().toISOString();
  const { data: updated, error } = await supabase
    .from("quote_requests")
    .update({
      status: "submitted" as const,
      // Étapes 1-2
      project_type: d.project_type,
      property_type: d.property_type,
      address: d.address,
      postal_code: d.postal_code,
      city: d.city,
      surface: d.surface,
      rooms_count: d.rooms_count,
      is_coownership: d.is_coownership,
      // Contact
      email: d.email,
      civility: d.civility,
      first_name: d.first_name,
      last_name: d.last_name,
      phone: d.phone,
      // Bâti
      permit_date_range: d.permit_date_range,
      heating_type: d.heating_type,
      gas_installation: d.gas_installation,
      gas_over_15_years: d.gas_over_15_years,
      electric_over_15_years: d.electric_over_15_years,
      rental_furnished: d.rental_furnished ?? null,
      works_type: d.works_type ?? null,
      // Délai & accès
      urgency: d.urgency,
      notes: d.notes ?? null,
      access_notes: d.access_notes ?? null,
      tenants_in_place: d.tenants_in_place ?? null,
      referral_source: d.referral_source ?? null,
      referral_other: d.referral_other ?? null,
      // Extensions V2
      heating_mode: d.heating_mode ?? null,
      ecs_type: d.ecs_type ?? null,
      syndic_contact: d.syndic_contact ?? null,
      cooktop_connection: d.cooktop_connection ?? null,
      dependencies: d.dependencies ?? null,
      dependencies_converted: d.dependencies_converted ?? null,
      existing_valid_diagnostics: d.existing_valid_diagnostics ?? null,
      existing_diagnostics_files: toJson(d.existing_diagnostics_files ?? []),
      residence_name: d.residence_name ?? null,
      floor: d.floor ?? null,
      is_top_floor: d.is_top_floor ?? null,
      door_number: d.door_number ?? null,
      is_duplex: d.is_duplex ?? null,
      purchase_date: d.purchase_date ?? null,
      cadastral_reference: d.cadastral_reference ?? null,
      commercial_activity: d.commercial_activity ?? null,
      heated_zones_count: d.heated_zones_count ?? null,
      configuration_notes: d.configuration_notes ?? null,
      preferred_payment_method: d.preferred_payment_method ?? null,
      distance_km: distance_km ?? null,
      // Snapshot calculs (recalculés serveur)
      required_diagnostics: toJson(diagnostics.required),
      diagnostics_to_clarify: toJson(diagnostics.toClarify),
      price_min: estimate.min,
      price_max: estimate.max,
      applied_modulators: toJson(estimate.appliedModulators),
      // Consentement
      consent_rgpd: true,
      consent_at: now,
    })
    .eq("id", id)
    .select("id")
    .maybeSingle<Pick<QuoteRequestRow, "id">>();

  if (error) {
    console.error("[/api/quote-request/submit] update error", error);
    return serverError("Impossible de finaliser la demande.");
  }
  if (!updated) return notFound("Demande introuvable.");

  return ok({ id: updated.id });
}

export const dynamic = "force-dynamic";
```

- [ ] **Step 2: Typecheck + commit**

```bash
corepack pnpm typecheck
git add "app/api/quote-request/[id]/submit/route.ts"
git commit -m "feat: route de soumission finale /api/quote-request/[id]/submit (manquante)"
```

---

### Task 11: Draft en arrière-plan + orchestration `QuestionnaireApp`

Cœur du dé-blocage : plus AUCUN appel réseau bloquant entre les étapes. Le draft part en fire-and-forget en quittant l'étape Contact ; seul « autre » soumet directement (avec états submitting/erreur).

**Files:**
- Create: `lib/questionnaire/draft.ts`
- Modify: `components/questionnaire/QuestionnaireApp.tsx` (réécriture complète)

**Interfaces:**
- Consumes: `getSteps`, `resolveStepIndex`, `StepId`, `Step` (Task 3) ; store v4 (Task 4) ; `StepScreen` (Task 6) ; les 7 composants d'étape (Tasks 7-8) ; `EntryScreen`/`ThanksScreen` (inchangés) ; `RecapScreen` — **provisoirement l'ancienne signature** `{ branch, onSubmitted }` jusqu'à la Task 12 (voir Step 3).
- Produces (utilisé par Task 12) :
  - `saveDraftInBackground(data: QuestionnaireData, onSaved: (id: string) => void): void` — jamais d'exception, jamais bloquant, 1 retry à 2 s
  - `saveDraftNow(data: QuestionnaireData): Promise<string | null>` — tentative unique awaité-able (utilisée par le récap avant submit si l'id manque encore)

- [ ] **Step 1: Créer `lib/questionnaire/draft.ts`**

```typescript
/**
 * Enregistrement du brouillon (`quote_requests`, statut email_captured) en
 * ARRIÈRE-PLAN. Fire-and-forget + un retry : un échec réseau ne bloque JAMAIS
 * la progression de l'utilisateur (c'était un des bugs majeurs de l'ancien
 * parcours — l'API exigeait un email jamais collecté et bloquait le récap).
 */

import type { ApiResponse } from "@/lib/api/responses";
import type { QuestionnaireData } from "@/lib/stores/questionnaire";

type DraftResponse = { id: string };

function buildDraftPayload(d: QuestionnaireData): Record<string, unknown> | null {
  // La branche « autre » a son propre flux de soumission directe.
  if (!d.project_type || d.project_type === "other") return null;
  if (!d.email) return null;
  return {
    project_type: d.project_type,
    property_type: d.property_type,
    address: d.address,
    postal_code: d.postal_code,
    city: d.city,
    surface: d.surface,
    rooms_count: d.rooms_count,
    is_coownership: d.is_coownership,
    email: d.email,
    first_name: d.first_name,
    phone: d.phone,
  };
}

async function postDraft(payload: Record<string, unknown>): Promise<string | null> {
  try {
    const res = await fetch("/api/quote-request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const json = (await res.json()) as ApiResponse<DraftResponse>;
    return json.ok ? json.data.id : null;
  } catch {
    return null;
  }
}

/** Tentative unique, awaité-able (récap : dernier filet avant la soumission finale). */
export async function saveDraftNow(data: QuestionnaireData): Promise<string | null> {
  const payload = buildDraftPayload(data);
  if (!payload) return null;
  return postDraft(payload);
}

/** Fire-and-forget + un retry à 2 s. Échec définitif = silencieux (non bloquant). */
export function saveDraftInBackground(
  data: QuestionnaireData,
  onSaved: (id: string) => void
): void {
  const payload = buildDraftPayload(data);
  if (!payload) return;
  void (async () => {
    const id = await postDraft(payload);
    if (id) {
      onSaved(id);
      return;
    }
    setTimeout(() => {
      void postDraft(payload).then((retryId) => {
        if (retryId) onSaved(retryId);
      });
    }, 2000);
  })();
}
```

- [ ] **Step 2: Réécrire `QuestionnaireApp.tsx`**

```tsx
"use client";

import Link from "next/link";
import { PhoneIcon } from "lucide-react";
import { useMemo, useState, useSyncExternalStore, type ComponentType } from "react";

import { LogoMark } from "@/components/marketing/Logo";
import type { ApiResponse } from "@/lib/api/responses";
import type { ProjectType } from "@/lib/core/diagnostics/types";
import { saveDraftInBackground } from "@/lib/questionnaire/draft";
import { getSteps, resolveStepIndex, type StepId } from "@/lib/questionnaire/steps";
import { useQuestionnaireStore } from "@/lib/stores/questionnaire";

import { EntryScreen } from "./screens/EntryScreen";
import { RecapScreen } from "./screens/RecapScreen";
import { StepScreen } from "./screens/StepScreen";
import { ThanksScreen } from "./screens/ThanksScreen";
import { AutreStep } from "./steps/AutreStep";
import { BatiStep } from "./steps/BatiStep";
import { BienStep } from "./steps/BienStep";
import { ContactStep } from "./steps/ContactStep";
import { DelaiStep } from "./steps/DelaiStep";
import { ExistantsStep } from "./steps/ExistantsStep";
import { SpecifiqueStep } from "./steps/SpecifiqueStep";
import type { StepProps } from "./steps/types";

const STEP_COMPONENTS: Record<StepId, ComponentType<StepProps>> = {
  bien: BienStep,
  bati: BatiStep,
  specifique: SpecifiqueStep,
  contact: ContactStep,
  existants: ExistantsStep,
  delai: DelaiStep,
  autre: AutreStep,
};

/** Header minimal propre au parcours devis (inchangé — pattern « focused flow »). */
function QuestionnaireHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-[var(--color-devis-line)] bg-[var(--color-devis-cream)]/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-10">
        <Link
          href="/"
          aria-label="Retour à l'accueil Servicimmo"
          className="flex items-center gap-2.5 transition-opacity hover:opacity-80"
        >
          <LogoMark size={30} />
          <span className="text-[15px] font-semibold tracking-[-0.02em] text-[var(--color-devis-ink)]">
            Servicimmo
          </span>
        </Link>
        <a
          href="tel:+33247470123"
          className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[var(--color-devis-ink)] hover:opacity-80"
        >
          <PhoneIcon className="h-3.5 w-3.5" aria-hidden />
          <span className="hidden sm:inline">02 47 47 0123</span>
        </a>
      </div>
    </header>
  );
}

/**
 * Root Client Component du parcours devis — flux LINÉAIRE (refonte 2026-07).
 *
 * Orchestration : entry → steps[getSteps(branch, data)] → recap → thanks.
 * Navigation avant/arrière sur la liste d'étapes, données jamais perdues,
 * aucun appel réseau bloquant entre les écrans.
 */
export function QuestionnaireApp({ embedded = false }: { embedded?: boolean } = {}) {
  const mounted = useSyncExternalStore(
    (cb) => useQuestionnaireStore.persist.onFinishHydration(cb),
    () => useQuestionnaireStore.persist.hasHydrated(),
    () => false
  );

  const currentScreen = useQuestionnaireStore((s) => s.currentScreen);
  const currentStepId = useQuestionnaireStore((s) => s.currentStepId);
  const data = useQuestionnaireStore((s) => s.data);
  const quoteRequestId = useQuestionnaireStore((s) => s.quoteRequestId);
  const goToScreen = useQuestionnaireStore((s) => s.goToScreen);
  const goToStep = useQuestionnaireStore((s) => s.goToStep);
  const updateData = useQuestionnaireStore((s) => s.updateData);
  const setQuoteRequestId = useQuestionnaireStore((s) => s.setQuoteRequestId);
  const markSubmitted = useQuestionnaireStore((s) => s.markSubmitted);
  const reset = useQuestionnaireStore((s) => s.reset);

  const [submittingOther, setSubmittingOther] = useState(false);
  const [otherError, setOtherError] = useState<string | null>(null);

  const branch: ProjectType = data.project_type ?? "sale";
  const steps = useMemo(() => getSteps(branch, data), [branch, data]);
  const stepIndex = resolveStepIndex(steps, currentStepId, data);
  const step = steps[stepIndex];

  // ── Branche « autre » : soumission directe, seul appel réseau du flux ────
  async function submitOther() {
    setOtherError(null);
    setSubmittingOther(true);
    try {
      const res = await fetch("/api/quote-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project_type: "other",
          email: data.email,
          first_name: data.first_name,
          phone: data.phone,
          notes: data.notes,
          consent_rgpd: data.consent_rgpd,
        }),
      });
      const json = (await res.json()) as ApiResponse<{ id: string }>;
      if (json.ok) {
        setQuoteRequestId(json.data.id);
      } else if (res.status !== 503) {
        // 503 = Supabase non configuré : on continue en mode local.
        setOtherError(json.error ?? "Impossible d'envoyer votre demande.");
        return;
      }
      markSubmitted();
      goToScreen("thanks");
    } catch {
      setOtherError("Impossible de joindre le serveur. Vérifiez votre connexion.");
    } finally {
      setSubmittingOther(false);
    }
  }

  function handleNext() {
    if (!step) return;
    if (branch === "other") {
      void submitOther();
      return;
    }
    // Quitter l'étape Contact = capture lead → draft en arrière-plan (jamais bloquant).
    if (step.id === "contact" && !quoteRequestId) {
      saveDraftInBackground(data, setQuoteRequestId);
    }
    const next = stepIndex + 1;
    if (next >= steps.length) {
      goToScreen("recap");
      return;
    }
    const target = steps[next];
    if (target) goToStep(target.id);
  }

  function handleBack() {
    if (stepIndex === 0) {
      goToStep(null);
      goToScreen("entry");
      return;
    }
    const prev = steps[stepIndex - 1];
    if (prev) goToStep(prev.id);
  }

  if (!mounted) {
    return (
      <div
        className={
          embedded
            ? "h-full bg-[var(--color-devis-cream)]"
            : "min-h-[80vh] bg-[var(--color-devis-cream)]"
        }
        aria-hidden
      />
    );
  }

  const StepFields = step ? STEP_COMPONENTS[step.id] : null;

  return (
    <div
      className={
        embedded
          ? "h-full bg-[var(--color-devis-cream)] font-sans text-[var(--color-devis-ink)]"
          : "min-h-[100dvh] bg-[var(--color-devis-cream)] font-sans text-[var(--color-devis-ink)]"
      }
    >
      {!embedded && <QuestionnaireHeader />}

      {currentScreen === "entry" ? (
        <EntryScreen
          selected={data.project_type ?? null}
          onSelect={(b) => {
            updateData({ project_type: b });
            goToStep(null);
            goToScreen("filling");
          }}
        />
      ) : null}

      {currentScreen === "filling" && step && StepFields ? (
        <StepScreen
          branch={branch}
          title={step.title}
          stepNumber={stepIndex + 1}
          stepCount={steps.length}
          optional={step.optional}
          canContinue={step.isComplete(data)}
          nextLabel={
            branch === "other"
              ? "Envoyer ma demande"
              : stepIndex === steps.length - 1
                ? "Voir mon estimation"
                : "Continuer"
          }
          submitting={submittingOther}
          error={otherError}
          onBack={handleBack}
          onNext={handleNext}
          onRestart={reset}
        >
          <StepFields data={data} updateData={updateData} branch={branch} />
        </StepScreen>
      ) : null}

      {currentScreen === "recap" ? (
        <RecapScreen
          branch={branch}
          onEdit={(id) => {
            goToStep(id);
            goToScreen("filling");
          }}
          onSubmitted={() => goToScreen("thanks")}
        />
      ) : null}

      {currentScreen === "thanks" ? (
        <ThanksScreen
          branch={branch}
          firstName={data.first_name}
          email={data.email}
          onRestart={reset}
        />
      ) : null}
    </div>
  );
}
```

- [ ] **Step 3: Compatibilité provisoire avec l'ancien `RecapScreen`**

Le JSX ci-dessus passe `onEdit` que l'ancien `RecapScreen` ne connaît pas — la Task 12 le réécrit immédiatement avec cette signature. Pour garder ce commit compilable, ajouter dès maintenant la prop à l'ancien composant :

Dans `components/questionnaire/screens/RecapScreen.tsx`, remplacer :

```typescript
type RecapScreenProps = {
  branch: ProjectType;
  onSubmitted: () => void;
};
```

par :

```typescript
import type { StepId } from "@/lib/questionnaire/steps";

type RecapScreenProps = {
  branch: ProjectType;
  /** Navigation vers une étape du flux pour corriger une réponse. */
  onEdit: (id: StepId) => void;
  onSubmitted: () => void;
};
```

et déstructurer `onEdit` dans la signature de `RecapScreen` (préfixé `_onEdit` si ESLint râle sur la variable inutilisée — supprimé en Task 12).

- [ ] **Step 4: Typecheck + tests + commit**

```bash
corepack pnpm typecheck
corepack pnpm test
git add lib/questionnaire/draft.ts components/questionnaire/QuestionnaireApp.tsx components/questionnaire/screens/RecapScreen.tsx
git commit -m "feat: orchestration lineaire du questionnaire + draft en arriere-plan"
```

Note : à ce stade, `FillingScreen` et ses fichiers ne sont PLUS référencés par l'app (personne ne les importe hors leurs propres tests) mais existent encore — supprimés en Task 13.

---

### Task 12: Récap dé-bloqué — calcul local instantané + découpe

Plus jamais d'écran figé : le récap affiche IMMÉDIATEMENT le calcul local (Task 5), rafraîchit depuis `/api/calculate` en arrière-plan (grille Supabase), et la soumission finale utilise la nouvelle route (Task 10). Prix affiché d'emblée en fourchette (décision #5).

**Files:**
- Create: `components/questionnaire/components/DiagnosticsList.tsx`
- Create: `components/questionnaire/components/FinalizeForm.tsx`
- Modify: `components/questionnaire/screens/RecapScreen.tsx` (réécriture complète, < 200 l.)
- Modify: `components/questionnaire/components/PriceHero.tsx` (copy uniquement)

**Interfaces:**
- Consumes: `computeLocalCalculation`, `toCalculateBody` (Task 5) ; `saveDraftInBackground`, `saveDraftNow` (Task 11) ; `isEmailValid`, `StepId` (Task 3) ; store v4 ; `PriceHero`, `DiagnosticRow`, `Field`, `Label`, `RadioRow` existants.
- Produces: `RecapScreen({ branch, onEdit, onSubmitted })` (signature préparée en Task 11 Step 3) ; `DiagnosticsList({ required, toClarify })` ; `FinalizeForm({ data, updateData, onEdit, submitting, error, onSubmit })`.

- [ ] **Step 1: Copy `PriceHero`** — remplacer le bloc de droite (lignes ~42-45) :

```tsx
        <div className="max-w-[220px] text-[12px] leading-snug text-[var(--color-devis-muted)] sm:text-right">
          Estimation indicative — devis définitif sous{" "}
          <strong className="font-medium text-[var(--color-devis-ink)]">2 h ouvrées</strong>.
        </div>
```

- [ ] **Step 2: Créer `DiagnosticsList.tsx`** (extraction de la section diagnostics de l'ancien récap)

```tsx
import type { RequiredDiagnostic } from "@/lib/core/diagnostics/types";

import { DiagnosticRow } from "./DiagnosticRow";

type DiagnosticsListProps = {
  required: RequiredDiagnostic[];
  toClarify: RequiredDiagnostic[];
};

/** Liste des diagnostics obligatoires + encart « à valider sur place ». */
export function DiagnosticsList({ required, toClarify }: DiagnosticsListProps) {
  return (
    <section
      aria-labelledby="diagnostics-title"
      className="rounded-[18px] border border-[var(--color-devis-line)] bg-white p-5 sm:p-6"
    >
      <div className="mb-3.5 flex items-baseline justify-between">
        <h2
          id="diagnostics-title"
          className="font-serif text-[19px] font-medium text-[var(--color-devis-ink)]"
        >
          Vos diagnostics obligatoires
        </h2>
        <span className="font-mono text-[12px] text-[var(--color-devis-muted)]">
          {required.length} identifiés
        </span>
      </div>
      <div className="flex flex-col">
        {required.map((d, i) => (
          <DiagnosticRow key={d.id} index={i} name={d.name} reason={d.reason} isFirst={i === 0} />
        ))}
      </div>

      {toClarify.length > 0 ? (
        <div className="mt-5 rounded-[12px] border border-dashed border-[var(--color-devis-line)] bg-[var(--color-devis-cream)] p-4">
          <div className="mb-1.5 font-mono text-[11px] tracking-[0.1em] text-[var(--color-devis-muted)]">
            À VALIDER SUR PLACE
          </div>
          <div className="text-[13px] leading-relaxed text-[var(--color-devis-ink)]">
            Vous avez répondu «&nbsp;je ne sais pas&nbsp;» à certaines questions : l&apos;expert
            confirme ces diagnostics lors de la visite.
            <ul className="mt-2 ml-4 list-disc text-[var(--color-devis-muted)]">
              {toClarify.map((d) => (
                <li key={d.id}>{d.name}</li>
              ))}
            </ul>
          </div>
        </div>
      ) : null}
    </section>
  );
}
```

- [ ] **Step 3: Créer `FinalizeForm.tsx`**

```tsx
"use client";

import { ArrowRightIcon, CheckIcon, LockIcon, PencilIcon } from "lucide-react";

import type { StepId } from "@/lib/questionnaire/steps";
import type { QuestionnaireData } from "@/lib/stores/questionnaire";

import { Field } from "./Field";
import { Label } from "./Label";
import { RadioRow } from "./RadioRow";

const CIVILITY_OPTIONS = [
  { value: "mr", label: "M." },
  { value: "mme", label: "Mme" },
  { value: "other", label: "Autre" },
] as const;

const PAYMENT_METHOD_OPTIONS = [
  { value: "cb", label: "Carte bancaire" },
  { value: "chq", label: "Chèque" },
  { value: "esp", label: "Espèces" },
  { value: "virt", label: "Virement" },
] as const;

type FinalizeFormProps = {
  data: QuestionnaireData;
  updateData: (patch: QuestionnaireData) => void;
  onEdit: (id: StepId) => void;
  submitting: boolean;
  error: string | null;
  onSubmit: (e: React.FormEvent) => void;
};

/** Formulaire final du récap : identité restante + consentement + envoi. */
export function FinalizeForm({
  data,
  updateData,
  onEdit,
  submitting,
  error,
  onSubmit,
}: FinalizeFormProps) {
  return (
    <form
      onSubmit={onSubmit}
      aria-labelledby="contact-title"
      className="rounded-[18px] border border-[var(--color-devis-line)] bg-white p-5 sm:p-6"
    >
      <h2
        id="contact-title"
        className="mb-1 font-serif text-[19px] font-medium text-[var(--color-devis-ink)]"
      >
        Vos coordonnées
      </h2>
      <p className="mb-4 text-[13px] text-[var(--color-devis-muted)]">
        On vous rappelle sous 2 h ouvrées.
      </p>

      {/* Résumé du contact déjà capturé à l'étape « Vos coordonnées » */}
      <button
        type="button"
        onClick={() => onEdit("contact")}
        className="mb-4 flex w-full items-center gap-2 rounded-[10px] border border-[var(--color-devis-line)] bg-[var(--color-devis-cream)] px-3 py-2.5 text-left text-[13px] text-[var(--color-devis-ink)] hover:border-[var(--branch-fg)]/50"
      >
        <span className="min-w-0 flex-1 truncate">
          {data.first_name} · {data.email} · {data.phone}
        </span>
        <PencilIcon className="h-3.5 w-3.5 flex-none text-[var(--color-devis-muted)]" aria-hidden />
      </button>

      <div className="flex flex-col gap-3">
        <div>
          <Label>Civilité</Label>
          <RadioRow
            ariaLabel="Civilité"
            options={CIVILITY_OPTIONS}
            value={data.civility}
            onChange={(v) => updateData({ civility: v })}
          />
        </div>
        <div>
          <Label>Nom</Label>
          <Field
            autoComplete="family-name"
            value={data.last_name ?? ""}
            onChange={(e) => updateData({ last_name: e.target.value })}
            aria-label="Nom"
          />
        </div>
        <div>
          <Label help="Pour information — non bloquant.">
            Mode de règlement préféré (optionnel)
          </Label>
          <RadioRow
            ariaLabel="Mode de règlement"
            options={PAYMENT_METHOD_OPTIONS}
            value={data.preferred_payment_method}
            onChange={(v) =>
              updateData({ preferred_payment_method: v as "cb" | "chq" | "esp" | "virt" })
            }
            columns={4}
          />
        </div>

        <label className="mt-1 flex cursor-pointer items-start gap-2.5 text-[12px] leading-relaxed text-[var(--color-devis-muted)]">
          <input
            type="checkbox"
            checked={data.consent_rgpd ?? false}
            onChange={(e) => updateData({ consent_rgpd: e.target.checked })}
            className="sr-only"
            aria-label="Consentement RGPD"
          />
          <span
            aria-hidden
            className={[
              "mt-0.5 flex h-4 w-4 flex-none items-center justify-center rounded border-[1.5px]",
              data.consent_rgpd
                ? "border-[var(--branch-fg)] bg-[var(--branch-fg)] text-white"
                : "border-[var(--color-devis-line)] bg-white",
            ].join(" ")}
          >
            {data.consent_rgpd ? <CheckIcon className="h-2.5 w-2.5" /> : null}
          </span>
          <span>
            J&apos;accepte que mes données soient utilisées pour ma demande de devis. Pas de
            spam, vos données restent chez nous.
          </span>
        </label>

        <button
          type="submit"
          disabled={submitting}
          className={[
            "mt-1.5 inline-flex items-center justify-center gap-2 rounded-[12px] px-4 py-4 text-[15px] font-medium text-white transition-opacity",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--branch-fg)]/50",
            submitting
              ? "cursor-not-allowed bg-[var(--branch-fg)]/60"
              : "bg-[var(--branch-fg)] hover:opacity-90",
          ].join(" ")}
        >
          {submitting ? "Envoi…" : "Envoyer ma demande"}
          {!submitting ? <ArrowRightIcon className="h-4 w-4" aria-hidden /> : null}
        </button>

        {error ? (
          <p role="alert" className="text-center text-[12px] text-amber-700">
            {error}
          </p>
        ) : null}

        <div className="text-center font-mono text-[11px] tracking-[0.08em] text-[var(--color-devis-muted)]">
          <LockIcon className="mr-1.5 inline h-2.5 w-2.5 align-middle" aria-hidden />
          données chiffrées · rgpd
        </div>
      </div>
    </form>
  );
}
```

- [ ] **Step 4: Réécrire `RecapScreen.tsx`**

```tsx
"use client";

import { useEffect, useMemo, useState } from "react";

import type { ApiResponse } from "@/lib/api/responses";
import type { DiagnosticsResult, PriceEstimate, ProjectType } from "@/lib/core/diagnostics/types";
import { saveDraftInBackground, saveDraftNow } from "@/lib/questionnaire/draft";
import { computeLocalCalculation, toCalculateBody } from "@/lib/questionnaire/local-calc";
import { isEmailValid, type StepId } from "@/lib/questionnaire/steps";
import { useQuestionnaireStore } from "@/lib/stores/questionnaire";

import { DiagnosticsList } from "../components/DiagnosticsList";
import { FinalizeForm } from "../components/FinalizeForm";
import { PriceHero } from "../components/PriceHero";
import { getBranchVars } from "../lib/branch-colors";

type CalculateResponse = DiagnosticsResult & { estimate: PriceEstimate };

type RecapScreenProps = {
  branch: ProjectType;
  /** Navigation vers une étape du flux pour corriger une réponse. */
  onEdit: (id: StepId) => void;
  onSubmitted: () => void;
};

/**
 * Récapitulatif DÉ-BLOQUÉ : le calcul local (moteur pur, grille fallback)
 * s'affiche instantanément ; `/api/calculate` (grille Supabase) rafraîchit en
 * arrière-plan ; le draft repart en fire-and-forget si l'id manque encore.
 * Prix affiché d'emblée, en fourchette (décision #5).
 */
export function RecapScreen({ branch, onEdit, onSubmitted }: RecapScreenProps) {
  const data = useQuestionnaireStore((s) => s.data);
  const updateData = useQuestionnaireStore((s) => s.updateData);
  const quoteRequestId = useQuestionnaireStore((s) => s.quoteRequestId);
  const setQuoteRequestId = useQuestionnaireStore((s) => s.setQuoteRequestId);
  const lastCalculation = useQuestionnaireStore((s) => s.lastCalculation);
  const setLastCalculation = useQuestionnaireStore((s) => s.setLastCalculation);
  const markSubmitted = useQuestionnaireStore((s) => s.markSubmitted);

  const localCalc = useMemo(() => computeLocalCalculation(data), [data]);
  // Priorité au calcul serveur (grille à jour) s'il est arrivé, sinon local.
  const calc = lastCalculation?.source === "server" ? lastCalculation : localCalc;

  const [submitState, setSubmitState] = useState<"idle" | "submitting" | "error">("idle");
  const [submitError, setSubmitError] = useState<string | null>(null);

  // ── Arrière-plan (jamais bloquant) : draft de secours + grille serveur ───
  useEffect(() => {
    if (!quoteRequestId) saveDraftInBackground(data, setQuoteRequestId);

    const body = toCalculateBody(data);
    if (!body) return;
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch("/api/calculate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        const json = (await res.json()) as ApiResponse<CalculateResponse>;
        if (cancelled || !json.ok) return;
        setLastCalculation({
          required: json.data.required,
          toClarify: json.data.toClarify,
          estimate: json.data.estimate,
          source: "server",
        });
      } catch {
        // Échec silencieux : le calcul local reste affiché.
      }
    })();
    return () => {
      cancelled = true;
    };
    // Figé au montage : un retour en arrière re-monte l'écran.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Soumission finale ────────────────────────────────────────────────────
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitState === "submitting") return;

    if (!data.civility || !data.first_name || !data.last_name || !data.consent_rgpd) {
      setSubmitError("Complétez votre civilité, prénom, nom et le consentement RGPD.");
      return;
    }
    if (!isEmailValid(data.email)) {
      setSubmitError("Votre email semble invalide — corrigez-le via « Modifier ».");
      return;
    }
    if ((data.phone ?? "").replace(/\D/g, "").length < 8) {
      setSubmitError("Un numéro de téléphone est requis pour la prise de rendez-vous.");
      return;
    }

    setSubmitState("submitting");
    setSubmitError(null);

    // Dernier filet : si le draft en arrière-plan a échoué, on retente une fois.
    const id = quoteRequestId ?? (await saveDraftNow(data));
    if (id && !quoteRequestId) setQuoteRequestId(id);

    if (!id) {
      // Supabase indisponible : mode local (comportement historique conservé).
      markSubmitted();
      onSubmitted();
      return;
    }

    try {
      const res = await fetch(`/api/quote-request/${id}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = (await res.json()) as ApiResponse<unknown>;
      if (!json.ok && res.status !== 503) {
        setSubmitState("error");
        setSubmitError(json.error ?? "Impossible de finaliser la demande.");
        return;
      }
      markSubmitted();
      onSubmitted();
    } catch {
      setSubmitState("error");
      setSubmitError("Impossible de joindre le serveur.");
    }
  }

  return (
    <div
      style={getBranchVars(branch)}
      className="min-h-full bg-[var(--color-devis-cream)] px-4 py-6 sm:px-10 sm:py-11"
    >
      <div className="mx-auto max-w-6xl">
        <div className="font-mono text-[11px] tracking-[0.16em] text-[var(--color-devis-muted)]">
          VOTRE RÉCAPITULATIF
        </div>
        <h1 className="mt-2.5 font-serif text-[30px] leading-[1.08] font-normal tracking-[-0.025em] text-[var(--color-devis-ink)] sm:text-[44px]">
          Voici <em className="font-medium italic">ce qu&apos;il vous faut</em>.
        </h1>
        <p className="mt-3.5 mb-7 max-w-xl text-[15px] leading-relaxed text-[var(--color-devis-muted)] sm:text-[16px]">
          Nos experts ont identifié les diagnostics obligatoires pour votre bien. Validez vos
          coordonnées et nous vous rappelons sous 2 h.
        </p>

        {!calc ? (
          <div
            role="alert"
            className="rounded-[18px] border border-amber-200 bg-amber-50 p-5 text-[14px] text-amber-900"
          >
            Des informations sont manquantes pour calculer votre estimation.{" "}
            <button
              type="button"
              onClick={() => onEdit("bien")}
              className="font-medium underline underline-offset-2"
            >
              Reprendre le questionnaire
            </button>
          </div>
        ) : (
          <>
            <div className="mb-4">
              <PriceHero
                min={calc.estimate.min}
                max={calc.estimate.max}
                appliedModulators={calc.estimate.appliedModulators}
              />
            </div>
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.4fr_1fr]">
              <DiagnosticsList required={calc.required} toClarify={calc.toClarify} />
              <FinalizeForm
                data={data}
                updateData={updateData}
                onEdit={onEdit}
                submitting={submitState === "submitting"}
                error={submitError}
                onSubmit={handleSubmit}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Typecheck + tests + commit**

```bash
corepack pnpm typecheck
corepack pnpm test
git add components/questionnaire/components/DiagnosticsList.tsx components/questionnaire/components/FinalizeForm.tsx components/questionnaire/screens/RecapScreen.tsx components/questionnaire/components/PriceHero.tsx
git commit -m "feat: recap de-bloque (calcul local instantane, refresh serveur en fond)"
```

---

### Task 13: Cleanup de l'ancien squelette + vérifications finales

Règle « finir les migrations » : aucun doublon ne survit. On supprime tout l'ancien pattern accordéon.

**Files:**
- Delete: `components/questionnaire/screens/FillingScreen.tsx`
- Delete: `components/questionnaire/screens/filling/` (répertoire complet : `StepBlocks.tsx`, `computeStepFlow.ts` + `.test.ts`, `computeNextAccordion.ts` + `.test.ts`, `options.ts`, `types.ts`, `steps/LeBienStep.tsx`, `steps/TechniqueStep.tsx`, `steps/ContactStep.tsx`, `steps/DelaiStep.tsx`, `steps/DiagnosticsStep.tsx`)
- Delete: `components/questionnaire/components/Accordion.tsx`
- Delete: `components/questionnaire/components/SubBlock.tsx`

- [ ] **Step 1: Supprimer les fichiers**

```bash
git rm components/questionnaire/screens/FillingScreen.tsx
git rm -r components/questionnaire/screens/filling
git rm components/questionnaire/components/Accordion.tsx components/questionnaire/components/SubBlock.tsx
```

- [ ] **Step 2: Vérifier qu'aucune référence orpheline ne subsiste**

```bash
grep -rn "screens/filling\|FillingScreen\|StepBlocks\|SubBlock\|computeStepFlow\|computeNextAccordion\|components/Accordion" app components lib --include="*.ts" --include="*.tsx"
```

Expected: **aucun résultat**. Si un import résiduel apparaît, le migrer vers l'équivalent de la refonte (`@/components/questionnaire/lib/options` pour les options, etc.).

- [ ] **Step 3: Vérifications complètes**

```bash
corepack pnpm typecheck
corepack pnpm lint
corepack pnpm test
corepack pnpm build
```

Expected: tout vert. `pnpm test` doit afficher ~60 tests (22 rules + 11 pricing + 19 steps + 7 local-calc + suites existantes) — les 2 suites supprimées (`computeStepFlow`, `computeNextAccordion`) ne comptent plus.

- [ ] **Step 4: Commit du cleanup + docs**

```bash
git commit -m "refactor: supprime le squelette accordeon 2 niveaux (remplace par le flux lineaire)"
git add docs/superpowers/specs/2026-07-13-questionnaire-refonte-design.md docs/superpowers/plans/2026-07-13-questionnaire-refonte-lineaire.md
git commit -m "docs: spec questionnaire validee (5 points tranches) + plan d'implementation"
```

- [ ] **Step 5: Checklist de vérification manuelle (Lyes — navigateur)**

Lancer `corepack pnpm dev` puis sur `/devis` :
1. **Vente appartement** : Le bien (étage requis) → Le bâti → Coordonnées (email/prénom/tél) → Existants (passer) → Délai → « Voir mon estimation » → **le prix s'affiche instantanément** → compléter civilité/nom/RGPD → « Envoyer ma demande » → Merci. Vérifier en base : `quote_requests` passe `email_captured` → `submitted` avec `price_min/max` remplis.
2. **Location** : l'étape « Votre location » (bail) apparaît ; bail vide → Boutin dans la liste.
3. **Travaux** : « Vos travaux » apparaît ; pré-1949 → RAT + plomb travaux.
4. **Autre** : un seul écran, envoi direct → Merci ; ligne `submitted` en base sans calculs.
5. **Retour arrière** : modifier la surface depuis le récap (Modifier → navigation), revenir → le prix se recalcule, aucune donnée perdue.
6. **Reprise** : fermer l'onglet en cours de parcours, rouvrir → reprise à la bonne étape ; un vieux localStorage v3 (si présent) est purgé sans erreur console.
7. **Coupure réseau** (DevTools offline) entre deux étapes : la navigation continue ; au récap le prix s'affiche quand même (calcul local).

---

## Hors scope (rappels)

- Moteurs `rules.ts` / `pricing.ts` : INCHANGÉS (tests ajoutés seulement). La validation métier des tarifs = chantier go-live séparé.
- Emails de confirmation (Resend) à la soumission : non branchés aujourd'hui, non branchés par ce plan (chantier séparé, templates `lib/features/emails/send.ts` réutilisables).
- Upload de fichiers `existing_diagnostics_files` : le champ transite mais aucune UI d'upload n'existait — idem après refonte.
- Portail / app Pilote / QuestionnaireModal (consomme `QuestionnaireApp`, aucune modification nécessaire).




