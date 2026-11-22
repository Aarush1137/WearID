## 2026-11-22T19:04:06Z
You are worker_m7_cat_b, a teamwork_worker.
Your working directory is e:\Projects\WearID\.agents\teamwork\worker_m7_cat_b
You MUST read e:\Projects\WearID\.agents\teamwork\ORIGINAL_REQUEST.md first before starting work.
You MUST also read e:\Projects\WearID\.agents\teamwork\explorer_cat_b\survey_cat_b.md and e:\Projects\WearID\.agents\teamwork\orchestrator\PROJECT.md.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

MANDATORY INVARIANTS (from AGENTS.md):
- Never invent clothing measurements or brand size charts.
- Strictly separate body measurements from garment dimensions.
- All stored dimensions internally must use canonical mm.
- Keep profiles private by default (ZERO raw biometric leakage in public exports/views).

MISSION: Implement Milestone 7 (Category B: Growth, Social & Localization Features 6-9):
1. Feature 6: Brand Request Voting Board (`src/core/state/brandRequestStore.ts`, `src/components/brands/BrandVotingBoard.tsx`, `src/app/app/brand-requests/page.tsx`).
   - Community voting store with anti-duplicate debounce and local vote tracking.
   - Pre-seeded fast-growing Indian D2C brands (Bonkers Corner, Rare Rabbit, The Souled Store, Beyoung, Bewakoof, Urbanic).
   - Search deduplication preventing duplicate requests for brands already live in PILOT_BRANDS.
2. Feature 7: Multi-Language Support / i18n (`src/core/i18n/translations.ts`, `src/core/i18n/I18nContext.tsx`, `src/components/ui/LanguageSelector.tsx`).
   - Lightweight zero-dependency React context and hook (`useI18n`).
   - Bilingual dictionaries (en, hi) covering clothing anatomy (छाती, कमर, इनसीम), fit intentions (ढीला, सही नाप, तंग), and app navigation.
   - Persistent language selection in localStorage (`wearid_lang`).
3. Feature 8: Outfit Builder (`src/core/sizing/outfitScoring.ts`, `src/core/state/outfitStore.ts`, `src/components/outfit/OutfitBuilderView.tsx`, `src/app/app/outfits/page.tsx`).
   - Composite outfit scoring combining Top (35%), Bottom (35%), and Shoes (30% via `shoeSizeMatrix.ts`).
   - Bottleneck floor preventing overall high score if one piece fits terribly.
   - Silhouette ease harmony check (e.g. relaxed top + relaxed bottom).
   - Saved outfits persistence in Zustand store.
4. Feature 9: Family Multi-Profile Comparison Matrix (`src/core/sizing/familyMatrixService.ts`, `src/components/family/FamilySizeMatrixView.tsx`, `src/app/app/family/page.tsx`).
   - Side-by-side dashboard evaluating all profile members against benchmark pilot brands.
   - Role badges (Self, Partner, Parent, Child), 1-click active profile switching.
   - Private cheat sheet export (strictly size labels, ZERO raw biometric mm leaked).

EXCLUSIVE WRITE BOUNDARIES (You may ONLY edit/create these files):
- `src/core/state/brandRequestStore.ts`
- `src/components/brands/BrandVotingBoard.tsx`
- `src/app/app/brand-requests/page.tsx`
- `src/core/i18n/translations.ts`
- `src/core/i18n/I18nContext.tsx`
- `src/components/ui/LanguageSelector.tsx`
- `src/core/sizing/outfitScoring.ts`
- `src/core/state/outfitStore.ts`
- `src/components/outfit/OutfitBuilderView.tsx`
- `src/app/app/outfits/page.tsx`
- `src/core/sizing/familyMatrixService.ts`
- `src/components/family/FamilySizeMatrixView.tsx`
- `src/app/app/family/page.tsx`
- `tests/unit/brands/brandVoting.test.ts`
- `tests/unit/i18n/i18n.test.ts`
- `tests/unit/outfit/outfitScoring.test.ts`
- `tests/unit/family/familyMatrix.test.ts`

VERIFICATION REQUIREMENTS:
- Run `npm test` using run_command to verify all unit tests pass (both new tests and the existing 508 baseline tests).
- Run `npm run typecheck` to verify zero TypeScript errors.
- Run `npm run lint` to verify zero lint errors.
- Write handoff report in `e:\Projects\WearID\.agents\teamwork\worker_m7_cat_b\handoff.md`.
- Send completion message to orchestrator with test results.
