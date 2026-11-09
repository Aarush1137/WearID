# BRIEFING — 2026-11-10T03:04:00Z

## Mission
Implement the Deterministic Apparel Sizing Recommendation Engine (Requirement 3) adhering strictly to Layer 1-4 segregation, canonical units (mm/g), plateau Gaussian ease scoring, reference garment calibration, borderline fit detection, explainable recommendation trees, and zero-hallucination policies.

## 🔒 My Identity
- Archetype: worker
- Roles: implementer, qa, specialist
- Working directory: e:\Projects\WearID\.agents\teamwork\worker_m3_engine\
- Original parent: 6cddc279-aaf6-4945-a9c0-cf8f046d0f14
- Milestone: Requirement 3 (Deterministic Sizing Engine)

## 🔒 Key Constraints
- Layer 1-4 Segregation: AnatomicalProfile (body mm/g), BrandSizeChart (brand ranges mm), GarmentDimensions (finished flat doubled mm), FitPreference (fit intent).
- Invariant 3: Body anatomy and finished garment dimensions must never share interchangeable database columns, types, or DTO properties.
- Invariant 4: Canonical units: Non-negative integer mm for length, g for mass.
- Invariant 8: Every recommendation must produce a structured and conversational ExplanationTree.
- Invariant 1: Zero hallucination on missing or unverified data (return insufficient_data / safe refusal).
- Target ease intervals: Slim (40-80mm), Regular (80-140mm), Relaxed (140-200mm), Oversized (200-300mm).
- Plateau Gaussian scoring: 1.0 within target ease range, smooth Gaussian decay outside.
- Rigid fabric (0% elastane): strict 0 score on negative ease. Stretch knits (>=5% elastane): compression ease allowed.
- Calibration: clamped bounded adjustment [-0.15, 0.15].
- Borderline detection: |score0 - score1| < 0.08 triggers isBorderline = true with tradeoff rationale.
- All 365+ existing tests must pass with 0 regressions, and `npm run typecheck` must pass with 0 errors.

## Current Parent
- Conversation ID: 6cddc279-aaf6-4945-a9c0-cf8f046d0f14
- Updated: 2026-11-10T03:04:00Z

## Task Summary
- **What to build**: Modular deterministic sizing engine in `src/core/` (`types.ts`, `units.ts`, `ease.ts`, `calibration.ts`, `borderline.ts`, `explanation.ts`, `engine.ts`, `index.ts`), with backward-compatible integration into `src/sizing/` and comprehensive unit tests.
- **Success criteria**: 100% test pass (all unit & e2e), 0 TypeScript errors, coverage of all Requirement 3 specs.
- **Interface contracts**: `docs/recommendation-pseudocode.md`, `tests.md`, `AGENTS.md`.
- **Code layout**: `src/core/` and `tests/unit/sizing/`.

## Key Decisions Made
- Architecture: Build cleanly structured modules in `src/core/`:
  - `src/core/types.ts`: Refined Layer 1-4 contracts + domain interfaces.
  - `src/core/units.ts`: Precision canonical conversions with RangeError for negatives.
  - `src/core/ease.ts`: Circumference doubling, plateau Gaussian scoring, category dimension weights, fabric stretch factor handling.
  - `src/core/calibration.ts`: Reference garment adjustments with [-0.15, 0.15] clamp.
  - `src/core/borderline.ts`: Borderline detection (< 0.08 delta) & tradeoff rationale generation.
  - `src/core/explanation.ts`: Structured JSON and plain-English ExplanationTree generator.
  - `src/core/engine.ts`: Core orchestrator `evaluateGarmentFit` / `evaluateSizing` with Layer 3 preferred, Layer 2 fallback, and zero-hallucination safe refusal.
  - `src/core/index.ts`: Unified export of all core functions and types.
- Backward compatibility: Ensure `src/sizing/engine.ts` and `src/core/sizing/` seamlessly re-export or delegate to `src/core/` so that all existing tests and pages continue to function without any breaking changes.

## Artifact Index
- `src/core/types.ts` — Domain models and Layer 1-4 schemas
- `src/core/units.ts` — Canonical unit conversions
- `src/core/ease.ts` — Deterministic ease scoring & category weights
- `src/core/calibration.ts` — Reference garment benchmark calibration
- `src/core/borderline.ts` — Borderline fit detection & tradeoff narrative
- `src/core/explanation.ts` — ExplanationTree generator
- `src/core/engine.ts` — Deterministic sizing engine
- `src/core/index.ts` — Public core API
- `tests/unit/sizing/engine.test.ts` — Unit tests for sizing engine
- `tests/unit/sizing/recommendationEngine.test.ts` — Core engine tests

## Change Tracker
- **Files modified**: None yet
- **Build status**: 365 passing tests, 0 typecheck errors
- **Pending issues**: None

## Quality Status
- **Build/test result**: 365 passed (10 files)
- **Lint status**: Clean
- **Tests added/modified**: Pending new unit tests for modular engine

## Loaded Skills
- **Source**: `e:\Projects\WearID\.agents\skills\gravitas\SKILL.md`
- **Local copy**: `e:\Projects\WearID\.agents\teamwork\worker_m3_engine\gravitas_SKILL.md`
- **Core methodology**: Scoped reconnaissance, adaptive planning, evidence-backed verification, requirement tracking, failure recovery.
