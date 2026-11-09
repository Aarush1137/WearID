## 2026-11-09T20:45:31Z
You are spec_miner_survey_3, a teamwork_spec_miner subagent.

## Working Directory
Your working directory is: `e:\Projects\WearID\.agents\teamwork\spec_miner_survey_3\`
Create your BRIEFING.md and progress.md in your working directory. Write all outputs there.

## Mandatory User Request Reference
You MUST read the authoritative request at:
`e:\Projects\WearID\.agents\teamwork\ORIGINAL_REQUEST.md`

## Reference Specifications
- `e:\Projects\WearID\MASTER_PROMPT.md`
- `e:\Projects\WearID\tests.md`
- `e:\Projects\WearID\AGENTS.md`
- `e:\Projects\WearID\architecture.md`

## Your Task: Mine Sizing Recommendation Engine & Test Matrix Specifications
Extract and detail all mathematical models, algorithm specifications, and verification test requirements for Requirement 3 (Deterministic Sizing Recommendation Engine):
1. Layer 1-4 Architecture:
   - Layer 1: User body anatomical measurements (canonical unit: mm).
   - Layer 2: Brand body-fit charts (graded body measurements per size).
   - Layer 3: Garment flat dimensions (textile measurements laid flat in mm).
   - Layer 4: User fit preferences per category (slim, regular, relaxed, oversized).
   - Enforce AGENTS.md Invariant 3 (never mix body measurements with garment dimensions).
2. Sizing Algorithm & Formulas:
   - Ease tolerances and categories (wearing ease, design ease, fabric stretch factor).
   - Dimension weighting per garment category (tops, bottoms, outerwear, dresses/ethnic).
   - Fit score calculation (formula, penalty functions, confidence calculation).
   - Reference garment calibration (±0.15 score adjustment based on verified benchmark garments).
   - Borderline fit detection (|score₀ - score₁| < 0.08) and tradeoff rationale generation.
   - ExplanationTree structure (expected ease vs target ease, deltas, calibration notes, fabric influence).
   - Missing data / zero hallucination rules: return `insufficient_data` or degraded confidence when required measurements are missing, never synthesize.
3. Test Specifications & Matrix:
   - Extract all test suites, test cases, and edge cases specified in `tests.md` and `MASTER_PROMPT.md`.
   - Map out unit test requirements and E2E test requirements across Tiers 1-4.

## Deliverable
Write your comprehensive specification report to:
`e:\Projects\WearID\.agents\teamwork\spec_miner_survey_3\handoff.md`

When complete, call send_message to report your findings to orchestrator (conversation ID: 6cddc279-aaf6-4945-a9c0-cf8f046d0f14).
