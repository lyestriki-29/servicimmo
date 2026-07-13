# Passe de polish — Servicimmo & France Carottage

> **Méthode : `methodo-peaufinage-propulseo`.** Couture par couture / détail par
> détail — jamais un gros diff opaque. Pour toute décision visuelle : 1–3
> variantes en **Artifact** (vrais tokens), Lyes valide sur pièce, on intègre le
> choix retenu. Après chaque unité : `tsc` + `eslint` (+ `build` si dev éteint)
> verts, **Lyes vérifie le rendu dans son navigateur** (on ne pilote pas de
> navigateur nous-mêmes), puis **commit ciblé**.

**Goal :** Finir la finition visuelle des deux vitrines déjà construites — cohérence
de marque France Carottage, jointures de sections « premium », nettoyage des
détails — sans créer de section ni toucher au back. Effort : **`Max`** (séquentiel).

**Base (état réel) :** reveals cohérents (`Reveal` framer partagé, scroll,
`reduced-motion`), identités posées (FC noir/blanc/rouge à bandes signées ; SI
pétrole/crème/safran), build vert, 0 contenu brut. On peaufine, on ne répare pas.

## Contraintes globales

- **Stack réelle** : Next 16 App Router, Tailwind v4, TS strict. Aucune lib
  d'animation ajoutée (réutiliser `@/components/marketing/Reveal`).
- **Tokens dédiés** : FC = `--fc-*` (noir `#111113`, rouge `#B32024`, blanc-cassé
  `#F5F4F2`) ; SI = `--color-si-*` / `--color-home-*`. **Ne jamais croiser** un
  token SI dans `components/carottage/` et inversement.
- **Deux modèles de couture opposés** (ne pas mélanger sur un même site) :
  FC = *bandes signées* (filet rouge, cf. catalogue peaufinage §4) ;
  SI = *fondus doux / canvas continu* (§1, §3).
- `reduced-motion` coupé partout ; contraste **AA** minimum sur les petits textes.
- Commits conventionnels, scope `carottage` / `marketing` / `ui`.

---

## Tranche P1 — Finir la cohérence de marque France Carottage

*Le plus rapide et le plus visible. Boucle l'identité FC de bout en bout.*

### ✅ Fait (cette session)
- **Logo réel repris** header + footer via `LogoFC` partagé (`925482d`, `1c26638`).
- **Signature « Fait avec passion par Propul'SEO »** au footer FC.
- **Footer noir : plaque claire** retenue (pas de version blanche du logo — décision Lyes).

### Task P1.1 : Favicon + image de partage (OG) propres à FC
**Problème :** une seule app ⇒ le favicon et l'image OG de Servicimmo servent aussi
les pages France Carottage. Un partage d'une page FC afficherait l'aperçu SI.

**Files :**
- Create : `app/carottage/icon.tsx` (favicon FC — le « A » rouge / monogramme sur noir).
- Create : `app/carottage/opengraph-image.tsx` (1200×630, noir/rouge, logo + accroche).
- (Vérifier : `app/carottage/layout.tsx` `metadata` — l'OG hérite du segment.)

**Méthode :** favicon en `ImageResponse` (Next metadata) ou PNG statique. Maquette OG
en Artifact avant de figer (composition noir/rouge, wordmark, tagline).

**Validation :** onglet d'une page FC = favicon FC ; `build` génère
`/carottage/icon` + `/carottage/opengraph-image` ; balises `og:image` pointant FC.

---

## Tranche P2 — Souder les jointures de sections

*Le vrai gisement de « premium ». Une couture à la fois, maquette à valider.*

### Task P2.1 : FC — couture CTA final → Footer (noir sur noir)
**Problème :** `CtaDevisFC` (noir, filet rouge) est suivi de `FooterFC` (noir, filet
rouge) → un long bloc noir avec deux filets rouges rapprochés, la couture se perd.

**Files :** `components/carottage/FooterFC.tsx` et/ou `components/carottage/CtaDevisFC.tsx`.

**Pistes (Artifact 2 variantes) :** (a) footer en gris très sombre `#0c0c0e` pour
détacher du CTA noir pur ; (b) fondre CTA + haut de footer en une seule bande
assumée (retirer un des deux filets). **Décision sur pièce.**

**Validation :** la séquence CTA→footer lit comme deux zones distinctes (ou une
bande unique nette), pas comme un aplat noir accidentel. Rendu navigateur Lyes.

### Task P2.2 : FC — couture Hero → Références
**Problème (à valider) :** hero duotone noir/rouge → liseré signalisation → bande
blanche des logos clients. Franc **par design** (bandes signées) ; vérifier que ce
n'est pas trop sec.

**Files :** `components/carottage/HeroFC.tsx`, `components/carottage/home/ReferencesFC.tsx`.

**Méthode :** d'abord constat visuel (Lyes) ; si trop dur, micro-ajustement du bas
de hero (respiration) sans casser le modèle bandes. Sinon : rien, on assume.

### Task P2.3 : SI — passe de fondus sur la home (le polish parké « T21 »)
**Problème :** le polish de la home Servicimmo a été planifié puis mis de côté.
C'est ici que le modèle *fondu doux / canvas continu* s'applique.

**Files :** sections `components/marketing/{Hero,About,ClientsMarquee,Services,Testimonials,Team,Actualites,Contact}.tsx` + `app/globals.css` (tokens/fonds).

**Méthode (sous-tâches, une couture à la fois) :**
- Inventaire des fonds de section (grep tous les CSS + inline) avant tout.
- Cibler d'abord **Hero → About** (la couture la plus vue), puis descendre.
- Pour chaque couture : Artifact 1–2 traitements (fondu des bords §1, halo, léger
  chevauchement) aux tokens SI → validation → intégration.
- Homogénéiser le rythme vertical si un écart saute (paddings de section).

**Validation :** enchaînement sans cassure nette, cohérent clair/desktop/mobile.
Rendu navigateur Lyes couture par couture. Aucune régression FC.

---

## Tranche P3 — Nettoyer les détails

*Petits points concrets, rapides — surtout ceux qui partent en prod.*

### Task P3.1 : SI — liens réseaux sociaux morts
**Problème :** Facebook / Instagram / LinkedIn du footer SI pointent sur `href="#"`.
**Files :** `components/marketing/Footer.tsx`.
**Action :** brancher les vraies URL (à demander à Etienne) ou masquer les icônes
sans compte. **Validation :** plus aucun `href="#"` ; liens ouvrent le bon profil.

### Task P3.2 : SI — placeholder visible dans les CGV
**Problème :** `[plateforme de paiement en ligne à confirmer]` en clair dans le texte.
**Files :** `app/(marketing)/cgv/page.tsx`.
**Action :** remplacer par la vraie mention ou retirer le passage.
**Validation :** aucun crochet `[...]` résiduel dans les pages légales (grep).

### Task P3.3 : Les deux — passe mobile 375 px + contraste AA
**Problème :** grilles serrées en petit écran (bandeau garanties hero FC
`md:grid-cols-3`, `ChiffresFC` `grid-cols-2`) ; petits gris clairs sur noir
(`white/55` footer FC) à vérifier AA.
**Files :** composants concernés (retouches ciblées de classes).
**Action :** vérif visuelle 375 px + ajustement contraste des textes secondaires.
**Validation :** rendu 375 px propre (Lyes) ; contraste AA sur les textes < 16px.

---

## Séquence recommandée & Definition of Done

**Ordre :** P1.1 (favicon/OG, rapide) → P2.1 (CTA→footer FC, décision courte) →
P3 (détails en lot, rapide) → P2.3 (home SI, le plus long, couture par couture) →
P2.2 (hero FC, constat).

**Definition of Done (globale) :**
- Chaque tâche : décision validée (Artifact si visuel) → intégrée → `tsc`+`eslint`(+`build`) verts → **vérif navigateur Lyes** → commit ciblé.
- Zéro régression croisée (une retouche SI ne touche pas FC et inversement).
- Aucun `href="#"` ni placeholder `[...]` résiduel en prod.
- Le polish n'attend PAS les données Etienne (SIRET, tarifs, clés) — check-list « avant bascule DNS » séparée.
