## 2026-11-09T21:31:14Z
You are worker_m3_engine, a teamwork_worker subagent.

## Working Directory
Your working directory is: `e:\Projects\WearID\.agents\teamwork\worker_m3_engine\`
Create your BRIEFING.md and progress.md in your working directory. Write all metadata and handoff there.

## Mandatory User Request Reference
You MUST read the authoritative request at:
`e:\Projects\WearID\.agents\teamwork\ORIGINAL_REQUEST.md`

## Reference Specifications
- `e:\Projects\WearID\.agents\teamwork\spec_miner_survey_3\handoff.md`
- `e:\Projects\WearID\.agents\teamwork\orchestrator\PROJECT.md`
- `e:\Projects\WearID\docs\recommendation-pseudocode.md`
- `e:\Projects\WearID\tests.md`
- `e:\Projects\WearID\MASTER_PROMPT.md`
- `e:\Projects\WearID\AGENTS.md`

## MANDATORY INTEGRITY WARNING
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

## Write Ownership
You EXCLUSIVELY own:
- Files in `src/core/` (`types.ts`, `units.ts`, `ease.ts`, `calibration.ts`, `borderline.ts`, `explanation.ts`, `engine.ts`, `index.ts`)
- Files in `src/sizing/` if needed for backward compatibility or integration.
- Files in `tests/unit/sizing/` and `tests/unit/measurements/`.

Do NOT modify `styles/`, `src/components/`, or `docs/`.

## Your Task: Implement Deterministic Sizing Recommendation Engine (Requirement 3)
1. **Layer 1-4 Segregation & Types (`src/core/types.ts`)**:
   - Strictly separate:
     * Layer 1: `AnatomicalProfile` (biometric measurements in canonical mm and grams).
     * Layer 2: `BrandSizeChart` (manufacturer body-fit sizing guide).
     * Layer 3: `GarmentDimensions` (finished flat measurements doubled for circumference).
     * Layer 4: `FitPreference` (category-specific fit intentions: slim, regular, relaxed, oversized).
   - Invariant 3: Body anatomy and finished garment dimensions must NEVER share interchangeable database columns, types, or DTO properties.
2. **Canonical Units & Conversions (`src/core/units.ts`)**:
   - Non-negative integer `mm` for length/distance.
   - Grams `g` for weight/mass.
   - Conversions to/from inches, cm, lbs with rounding error prevention.
3. **Deterministic Ease Calculator (`src/core/ease.ts`)**:
   - Total ease: `Garment Circumference - Body Circumference` where garment flat measurements are doubled.
   - Target ease intervals: Slim (40-80mm), Regular (80-140mm), Relaxed (140-200mm), Oversized (200-300mm).
   - Trapezoidal/plateau Gaussian scoring: 1.0 within target ease range, smooth Gaussian decay outside.
   - Category dimension weights:
     * Tops: Chest 0.50, Waist 0.20, Shoulder 0.15, Length 0.15.
     * Bottoms: Waist 0.40, Hips 0.30, Inseam 0.20, Thigh 0.10.
     * Outerwear: Chest 0.40, Shoulder 0.25, Sleeve 0.20, Length 0.15.
     * Ethnic (Kurtas): Chest 0.45, Shoulder 0.25, Length 0.20, Waist 0.10.
   - Fabric stretch factor (0.0 to 0.3): Rigid cotton (0% elastane) rejects negative ease (score 0); stretch knits (>=5% elastane) permit compression ease.
4. **Reference Garment Calibration (`src/core/calibration.ts`)**:
   - Bounded score adjustment of up to ±0.15 based on user-validated benchmark garments.
   - Cumulative adjustment strictly clamped to `[-0.15, 0.15]`.
5. **Borderline Fit Detection (`src/core/borderline.ts`)**:
   - When `|score0 - score1| < 0.08`, set `isBorderline: true` and generate comparative tradeoff rationale (e.g. "Size M gives a tailored fit; Size L gives more relaxed comfort").
6. **Explainable Recommendation Tree (`src/core/explanation.ts`)**:
   - Output structured JSON and conversational markdown `ExplanationTree` detailing expected ease vs target ease, deltas, fabric tension influence, and calibration notes.
7. **Zero Hallucination Safeguard (`src/core/engine.ts`)**:
   - Return `insufficient_data` / low confidence when required inputs are absent. Never invent or synthesize plausible measurements.
8. **Verification**:
   - Run `npm test` to ensure ALL 346+ tests across `tests/unit/` and `tests/e2e/` pass with zero failures.
   - Run `npm run typecheck` to ensure 0 TypeScript compilation errors.
