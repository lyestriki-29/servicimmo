# PROGRESS — Refonte pages intérieures Servicimmo (direction G)

> Feature multi-sessions. Labo : `/preview/claude` (composants `components/preview/claude/`).
> Toggle Fable/Codex par gabarit. Codex pur reste visible via le toggle et `/preview/servicimmo`.

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
- **Cartes = Google Maps** (choix client explicite). ⚠️ Consentement RGPD à traiter avant prod (aucun bandeau dans le codebase) + contradiction avec mentions légales à résoudre.
- **Archétypes de bâti** (ville) : panneaux annotés une fois, villes rattachées par champ frontmatter `archetype`. Zéro photo obligatoire par ville ; photo « carte postale » optionnelle, jamais annotée.
- **Architecture articles validée** : frontmatter `resume:` (encadré À retenir), `image:`+`imageLegende:`, sommaire auto depuis `##`, 1re citation `>` promue en citation tirée, « à lire ensuite » auto par catégorie + override `lireEnsuite:`.
- **Bande de confiance** partagée (1998 / COFRAC LCC Qualixpert & iCert / RCP Allianz / 10 000+) répétée sur les pages.
- Photos : TOUJOURS vérifiées visuellement avant usage (cf. mémoire). Amboise réelles via Wikimedia Commons — CC BY-SA, crédits dans `public/img/si/claude/CREDITS.md`, attribution ou remplacement avant prod.

## Reste à faire
1. Commits en lots logiques (fix légal / carte-secteurs / labo maquettes) + `/code-review`.
2. Spec d'implémentation réelle : porter les 8 gabarits validés sur `app/(marketing)/` (remplacer/étendre `ValidatedPageDesigns.tsx`), champ `archetype` sur les 18 fiches villes (valeurs à proposer), pipeline articles (5 conventions), consentement Google Maps.
3. Contenu : citation d'article placeholder à remplacer ; jalons J0-J2 du déroulé DPE à confirmer client ; libellé « 18 communes en page » à revalider.
4. Nettoyage : `VilleMapSection.tsx` orphelin (à supprimer sur accord) ; sortie du `/preview/*` avant bascule prod.
5. Vieux rappel : code-review des 16 commits questionnaire (pré-existant).
