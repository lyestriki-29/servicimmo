# Session State — 2026-04-20 21:50

## Branch
main (pas de remote — projet local uniquement pour l'instant)

## Completed This Session
- Session 1 (scaffolding Next 16 + TS strict + TW v4 + shadcn) — commit ab20af7
- Session 2 complète (backend + questionnaire 6 étapes + home fallback) — commit 1531977 : 32 tests verts, build prod OK sur 12 routes
- Écrit 2 briefs Claude Design : CLAUDE_DESIGN_BRIEF.md (home) + CLAUDE_DESIGN_BRIEF_QUESTIONNAIRE.md (questionnaire redesign 1-2 pages, 3 variantes visuelles demandées)

## Next Task
1. Lyes colle CLAUDE_DESIGN_BRIEF_QUESTIONNAIRE.md dans claude.ai → Design → itère → "Transférer à Claude Code"
2. Intégrer l'export dans `app/(public)/devis/` + `components/questionnaire/blocks/`
3. Fixes mineurs en attente : ajouter `state_of_premises` (EDL) dans rules.ts+pricing.ts+tests (oublié en S2), ajouter "Autre" dans gas_installation select, décision "Pompe à chaleur" garder ou retirer

## Blockers
- Supabase non provisionné → routes API retournent 503 (comportement attendu en S2, à brancher en S3)
- Pas de remote git → commits locaux only (créer un repo GitHub quand prêt)

## Key Context
- Décisions S1/S2 figées : Option B pour `permit_date_range='unknown'` (toClarify séparé, pas "pire cas"), règles métier complètes (DAPP location, Boutin vide-only), pas de seuil "sur devis" auto
- Tout fonctionne offline (Zustand persist), `/api/calculate` stateless toujours OK
- Cible Session 3 : Emails Resend + Admin back-office + Supabase live + migration 100 articles + redirects 301 + deploy Vercel
- User veut pivoter l'UX questionnaire : 6 étapes → 1-2 pages, surprise récap à la fin (pas de live obligations), 3 variantes visuelles (sobre / illustré / éditorial)
