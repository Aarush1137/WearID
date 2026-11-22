## 2026-11-22T19:04:16Z
Sender: 6c40b8d6-36e0-48b2-a7b3-e42da4bc734e
Priority: MESSAGE_PRIORITY_HIGH

You are worker_m8_cat_cd, a teamwork_worker.
Your working directory is e:\Projects\WearID\.agents\teamwork\worker_m8_cat_cd
You MUST read e:\Projects\WearID\.agents\teamwork\ORIGINAL_REQUEST.md first before starting work.
You MUST also read e:\Projects\WearID\.agents\teamwork\spec_miner_cat_cd\survey_cat_cd.md and e:\Projects\WearID\.agents\teamwork\orchestrator\PROJECT.md.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

MANDATORY INVARIANTS (from AGENTS.md):
- Never invent clothing measurements or brand size charts.
- Strictly separate body measurements from garment dimensions.
- All stored dimensions internally must use canonical mm.
- Keep profiles private by default (ZERO raw biometric leakage in public API responses or extension DOM).

MISSION: Implement Milestone 8 (Categories C & D: Advanced AI & Platform Features 10-13):
1. Feature 10: AI Fit Assistant (`src/core/assistant/fitAssistantEngine.ts`, `src/components/assistant/FitAssistantChat.tsx`, `src/app/app/assistant/page.tsx`).
   - NLP assistant grounded strictly in `src/core/engine.ts` (`evaluateSizing`) with zero hallucination.
   - Structured tool execution (`recommend_size`, `compare_sizes`, `explain_ease_delta`).
   - Refuses to invent missing measurements; prompts user to measure.
   - Conversational chat interface using editorial design tokens.
2. Feature 11: Chrome / Shopping Extension Scaffold (`extension/` directory).
   - Manifest V3 bundle (`extension/manifest.json`, `background.js`, `content.js`, `popup.html`, `popup.js`, `styles.css`).
   - Content script DOM scrapers for Zara, H&M, Uniqlo, and Myntra.
   - Extension popup and shadow-DOM injected sizing pill linking to WearID.
3. Feature 12: Return Rate Predictor (`src/core/sizing/returnRatePredictor.ts`, `src/components/sizing/ReturnRiskBadge.tsx`).
   - Deterministic 4-vector model: category baseline, ease delta vs fit intent, borderline proximity (|delta| < 0.08), and fabric elastane content.
   - Outputs predicted return rate (0-100%), risk level ('low' | 'moderate' | 'high'), and primary return risk drivers.
4. Feature 13: Public REST Sizing API (`src/app/api/v1/sizing/recommend/route.ts`).
   - Next.js App Router route handler supporting `POST /api/v1/sizing/recommend`.
   - Bearer/API token authorization via `tokenRegistry`.
   - Input validation (Zod schema) converting all dimensions to canonical mm.
   - Strict zero-knowledge privacy: response contains recommended size, fit score, confidence, and explanation tree. ZERO raw biometrics leaked.

EXCLUSIVE WRITE BOUNDARIES (You may ONLY edit/create these files):
- `src/core/assistant/fitAssistantEngine.ts`
- `src/components/assistant/FitAssistantChat.tsx`
- `src/app/app/assistant/page.tsx`
- `src/core/sizing/returnRatePredictor.ts`
- `src/components/sizing/ReturnRiskBadge.tsx`
- `src/app/api/v1/sizing/recommend/route.ts`
- `extension/manifest.json`
- `extension/background.js`
- `extension/content.js`
- `extension/popup.html`
- `extension/popup.js`
- `extension/styles.css`
- `tests/unit/assistant/fitAssistant.test.ts`
- `tests/unit/sizing/returnRate.test.ts`
- `tests/unit/extension/extensionScaffold.test.ts`
- `tests/integration/api/publicSizingApi.test.ts`

VERIFICATION REQUIREMENTS:
- Run `npm test` using run_command to verify all unit tests pass (both new tests and the existing 508 baseline tests).
- Run `npm run typecheck` to verify zero TypeScript errors.
- Run `npm run lint` to verify zero lint errors.
- Write handoff report in `e:\Projects\WearID\.agents\teamwork\worker_m8_cat_cd\handoff.md`.
- Send completion message to orchestrator with test results.
