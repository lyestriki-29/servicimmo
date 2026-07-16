# Consentement Google Maps — design

> Statut : **à valider**. Rédigé le 2026-07-16 à la suite de la revue adversariale
> du lot « pages intérieures » (1 constat bloquant + 2 majeurs sur ce sujet).
> Concerne la mise en production de la vitrine Servicimmo et de France Carottage.

## 1. Le problème, établi sur pièces

`components/marketing/pages/GoogleMapEmbed.tsx` rend un `<iframe>` nu, sans
aucune barrière. La carte se charge donc **dès l'ouverture de la page**, envoie
l'adresse IP et l'en-tête navigateur du visiteur à Google, et laisse Google
déposer ses cookies — sans information ni consentement préalable.

Portée réelle : **20 pages**, dont `/zones`, `/contact` et les 19 pages villes.
Sur `/zones`, la carte est dans le hero (`ZonesExperience.tsx`), donc son
`loading="lazy"` ne diffère rien : elle part au premier affichage.

Aggravant : `NEXT_PUBLIC_GOOGLE_MAPS_EMBED_KEY` est vide dans
`.env.local.example`. Le chemin par défaut en production est donc le repli sans
clé `google.com/maps?output=embed` (`GoogleMapEmbed.tsx` l.33-40).

Ce que dit le droit : l'**article 82 de la loi Informatique et Libertés** impose
l'information ET le consentement **avant** tout dépôt ou lecture non strictement
nécessaire. La CNIL sanctionne précisément ce cas — la carte tierce chargée
d'office. Le RGPD (art. 13) impose par ailleurs d'informer sur la finalité, la
base légale, les destinataires et la durée.

Deux contradictions internes s'ajoutent :

- `app/(marketing)/mentions-legales/page.tsx` affirme que la collecte se limite
  au formulaire de devis — faux dès la première page vue.
- `CLAUDE.md` promet « Cookies : minimal, pas de tracking tiers ».

## 2. Contrainte non négociable

**Google Maps est un choix client explicite** (cf. `PROGRESS_maquettes-pages-si.md`).
Revenir à Leaflet/OpenStreetMap n'est pas une option ici, même si ce serait la
solution la plus simple juridiquement. La spec fait donc avec Google Maps.

## 3. Ce que l'audit change dans la réponse

Google Maps est **le seul tiers non exempté du site**. Vérifié :

| Élément | Statut art. 82 |
|---|---|
| Cookies de session Supabase (`lib/supabase/server.ts`) | Strictement nécessaires → **exemptés** |
| Polices via `next/font/google` | Téléchargées **au build**, servies depuis notre domaine → **aucune requête à Google** |
| Plausible / Google Analytics / GTM | **Absents du codebase** |
| Iframe Google Maps | **Non exempté** → consentement requis |

**Conséquence : un bandeau de consentement global (CMP) serait disproportionné.**
Il n'y a rien d'autre à arbitrer. Un seul traitement → un seul point de
consentement, au plus près de l'usage.

## 4. Design retenu — le clic-pour-charger

À la place de l'iframe, `GoogleMapEmbed` rend par défaut un **substitut inerte** :
même encombrement (zéro décalage de mise en page), fond neutre aux tokens du
site, icône de localisation, la mention de ce qui va se passer, et un bouton.

```
┌─────────────────────────────────────────┐
│                                         │
│              [ 📍 ]                     │
│                                         │
│     Carte fournie par Google Maps       │
│  L'afficher enverra votre adresse IP    │
│  à Google, qui pourra déposer des       │
│  cookies sur votre appareil.            │
│                                         │
│      [ Afficher la carte ]              │
│                                         │
│  Voir sur Google Maps ↗ (lien direct)   │
└─────────────────────────────────────────┘
```

Au clic : le choix est mémorisé, l'iframe se monte, et toutes les autres cartes
du site s'affichent directement pour la suite de la visite.

Pourquoi ce design tient juridiquement : le consentement est **spécifique**
(une finalité), **éclairé** (le texte dit ce qui part et où), **libre** (le lien
« Voir sur Google Maps » offre une alternative sans rien déposer) et
**préalable** (rien ne part avant le clic).

## 5. Décisions à trancher (client)

1. **Portée de la mémorisation** — reco : `localStorage`, clé `si-consent-maps`,
   valeur `{ accepte: true, date }`. Pas de cookie : rien à déclarer, et
   `localStorage` n'est lu que côté client. *À valider : durée de validité —
   reco 6 mois, l'usage CNIL pour un consentement.*
2. **Retrait du consentement** — obligatoire, doit être aussi simple que l'octroi.
   Reco : une entrée « Cookies et cartes » dans le footer, à côté des liens
   légaux, ouvrant une page `/cookies` avec un interrupteur.
3. **Clé API** — décider si on renseigne `NEXT_PUBLIC_GOOGLE_MAPS_EMBED_KEY` ou
   si on assume le repli sans clé. Sans incidence sur le consentement, mais le
   repli est le plus bavard.

## 6. Chantiers de la tranche

- [ ] `GoogleMapEmbed` : substitut inerte + bouton, iframe montée seulement après accord.
- [ ] Contexte de consentement partagé (une acceptation vaut pour les 20 pages).
- [ ] Page `/cookies` : ce qui est déposé, par qui, pourquoi, + retrait.
- [ ] Mentions légales : **section « Cookies et traceurs »** (absente aujourd'hui) et
      correction de la phrase « collecte limitée au formulaire de devis ».
- [ ] Mentions légales, section Données personnelles : ajouter les 4 mentions
      manquantes de l'art. 13 (durée de conservation, base légale,
      destinataires/sous-traitants, réclamation CNIL). *Valeurs à faire valider.*
- [ ] Lien « Cookies et cartes » au footer, à côté de Mentions légales / CGV.
- [ ] Filet de test : aucune requête `google.com` avant consentement.
- [ ] Même traitement côté France Carottage (mêmes composants, même
      `app/carottage/mentions-legales`).

## 7. Critère de sortie

Sur une session neuve, l'onglet Réseau d'un navigateur ne montre **aucune**
requête vers un domaine Google avant le clic sur « Afficher la carte ». Après le
clic, la carte s'affiche, et la page suivante l'affiche directement.

## 8. Hors périmètre

- Le remplacement des photos d'illustration (chantier contenu séparé).
- Le recadrage du panorama d'équipe sur `/contact`.
- Les mentions légales encore introuvables (SIRET, médiateur, greffe, RCP,
  code APE) — attendues d'Etienne, indépendantes de cette tranche.
