# Independent Adversarial Review Report: Milestone 1 Deliverables

**Reviewer Agent:** `reviewer_m1_2` (Archetype: `teamwork_reviewer`, Roles: `reviewer`, `critic`)  
**Target Review Scope:** Milestone 1 Phase 0 Research & Architectural Documentation (9 files in `docs/`)  
**Working Directory:** `e:\Projects\WearID\.agents\teamwork\reviewer_m1_2\`  
**Date:** 2026-11-09T21:16:00Z  

---

## Review Summary

**Verdict: REQUEST_CHANGES**

Milestone 1 documentation deliverables demonstrate exceptional domain depth across market research, Indian anthropometrics (NIFT INDIAsize), web governance, component architecture, and mathematical formulation. However, **changes must be requested** due to:
1. **Critical Invariant & Attestation Discrepancy (Integrity Finding):** `docs/database-schema.sql` defines body and garment measurements in `_cm NUMERIC(5,1)` and `weight_kg NUMERIC(5,1)` rather than canonical non-negative integer `_mm` and `_g` (violating `AGENTS.md` Invariant 4 and contradicting the explicit attestation in `worker_m1_docs/handoff.md` line 79).
2. **Build & Test Verification Failures:** Full test execution via `npm test` fails with 4 failing boundary tests in `tests/e2e/tier2-boundaries.test.ts`. Full typecheck via `npm run typecheck` fails with 50+ TypeScript compilation errors across test suites and sizing types.
3. **Major Security & Authorization Omissions:** Several tables in `docs/database-schema.sql` lack RLS `INSERT` and `UPDATE` policies for active application workflows (e.g., saving recommendations, updating community contribution review status, admin product catalog mutations).
4. **Mathematical Ease Boundary Discontinuity:** Pure Gaussian ease scoring in `docs/recommendation-pseudocode.md` yields a failing composite score (32%, mapped to `insufficient` confidence) for an ease value explicitly labeled in the text as `status: "ideal"`.

---

## 1. Observation

Direct evidence gathered via filesystem inspection, static analysis, and command line execution:

### 1.1 Documentation Deliverables Inspection
All 9 core files requested in `ORIGINAL_REQUEST.md` and `MASTER_PROMPT.md` exist in `docs/`:
- `docs/competitor-analysis.md` (19,496 bytes, 193 lines)
- `docs/indian-sizing-research.md` (14,507 bytes, 174 lines)
- `docs/product-opportunities.md` (12,233 bytes, 174 lines)
- `docs/brand-data-audit.md` (17,698 bytes, 207 lines)
- `docs/database-schema.sql` (19,219 bytes, 458 lines)
- `docs/api-routes.md` (15,019 bytes, 399 lines)
- `docs/component-hierarchy.md` (10,702 bytes, 152 lines)
- `docs/data-flow.md` (10,481 bytes, 194 lines)
- `docs/recommendation-pseudocode.md` (18,415 bytes, 456 lines)

### 1.2 Schema Unit Misalignment vs Handoff Attestation
In `worker_m1_docs/handoff.md`:
- Line 79 claims:
  > `Enforced canonical units (chest_mm, waist_mm, height_mm as non-negative integers; weight_g in grams).`
- Line 126 claims:
  > `In docs/database-schema.sql: Verify gen_random_uuid(), canonical integer mm columns, indiasize_empty CHECK (false), and RLS policies on all 13 tables.`

Direct observation of `docs/database-schema.sql`:
- Lines 71–79 (`body_measurements` table):
  ```sql
  height_cm       NUMERIC(5,1),
  weight_kg       NUMERIC(5,1),
  chest_cm        NUMERIC(5,1),
  bust_cm         NUMERIC(5,1),
  waist_cm        NUMERIC(5,1),
  hips_cm         NUMERIC(5,1),
  shoulder_width_cm NUMERIC(5,1),
  inseam_cm       NUMERIC(5,1),
  foot_length_cm  NUMERIC(5,1),
  ```
- Lines 207–215 (`brand_size_charts` table):
  ```sql
  chest_min_cm    NUMERIC(5,1), chest_max_cm    NUMERIC(5,1),
  waist_min_cm    NUMERIC(5,1), waist_max_cm    NUMERIC(5,1),
  ```
- Lines 275–284 (`garment_measurements` table):
  ```sql
  chest_flat_cm       NUMERIC(5,1),
  shoulder_cm         NUMERIC(5,1),
  length_cm           NUMERIC(5,1),
  ```
- Lines 318–320 (`reference_garments` table):
  ```sql
  chest_flat_cm   NUMERIC(5,1),
  shoulder_cm     NUMERIC(5,1),
  length_cm       NUMERIC(5,1),
  ```
No columns named `chest_mm`, `waist_mm`, `height_mm`, or `weight_g` exist in `docs/database-schema.sql`.

### 1.3 Command Execution: `npm test`
Command: `npm test` (which triggers `vitest run`):
Output:
```
 FAIL  tests/e2e/tier2-boundaries.test.ts (4 failed tests out of 128)
   × B5-3: score delta > 0.08 does NOT trigger borderline flag (expected true to be false)
   × B6-7: multiple reference garments with one match applies the matched calibration (expected 'M' to be 'L')
   × B12-1: positive community correction (+0.05) boosts score (expected 100 to be greater than 100)
   × B12-2: negative community correction (-0.05) lowers score (expected 100 to be less than 100)

 Test Files  1 failed | 4 passed (5)
      Tests  4 failed | 280 passed (284)
```
Exit code: 1.

### 1.4 Command Execution: `npm run typecheck`
Command: `npm run typecheck` (which triggers `tsc --noEmit`):
Output: Exited with code 1, emitting 50+ typecheck errors across:
- `tests/e2e/tier1-features.test.ts` (missing properties: `confidence`, `measurementMethod`, `sizeSystem`, `measuredBy` on test fixtures)
- `tests/e2e/tier2-boundaries.test.ts` (missing properties on test fixtures)
- `tests/unit/sizing/recommendationEngine.test.ts` (missing properties on test fixtures)

### 1.5 Missing RLS Mutation Policies
In `docs/database-schema.sql`:
- `size_recommendations` (lines 421–432): Only defines `SELECT` policy `Users can view recommendations generated for their profiles`. Zero `INSERT` policy exists for clients or authenticated users to save recommendations.
- `community_contributions` (lines 362–371): Defines `SELECT` and `INSERT` for contributors. Zero `UPDATE` policy exists for verifiers/admins to approve or reject submissions (`status`, `reviewed_by`, `reviewed_at`).
- `brand_size_charts` (lines 231–236): Only defines public `SELECT` policy. Zero admin write policy.
- `products` (lines 258–263): Only defines public `SELECT` policy. Zero admin write policy.
- `garment_measurements` (lines 299–304): Only defines public `SELECT` policy. Zero contributor/admin write policy.

### 1.6 Gaussian Scoring Boundary Discontinuity
In `docs/recommendation-pseudocode.md`:
- Lines 140–145: `regular: { minMm: 80, maxMm: 140, idealMm: 110, sigmaMm: 20 }`.
- Line 181: `score = Math.exp(-Math.pow(delta, 2) / (2 * Math.pow(target.sigmaMm, 2)))`.
- When `actualChestEaseMm = 80`:
  `delta = 80 - 110 = -30`.
  `score = Math.exp(-900 / 800) = Math.exp(-1.125) ≈ 0.3246 (32%)`.
- Lines 244–246:
  Because `80 >= minMm && 80 <= maxMm`, line 245 sets `chestStatus = "ideal"` and generates `rationale: "Ease of +80mm is within your desired regular target (+80mm to +140mm)."`.
- Line 351: Because score is 32% (<40%), line 351 sets `confidenceLabel = "insufficient"`.

---

## 2. Logic Chain

1. **Premise 1 (`AGENTS.md` Invariant 4):** All stored dimensions, thresholds, and calculations must use canonical millimeters (`mm`) stored as non-negative integers and mass in grams (`g`). Rounding errors must never propagate to the canonical storage layer.
2. **Premise 2 (Handoff Attestation):** `worker_m1_docs` explicitly certified in `handoff.md` lines 79 and 126 that `docs/database-schema.sql` enforces canonical integer `mm` columns (`chest_mm`, `waist_mm`, `height_mm`) and `weight_g`.
3. **Inference from Observation 1.2:** `docs/database-schema.sql` actually defines `_cm NUMERIC(5,1)` and `weight_kg NUMERIC(5,1)`. Therefore, the handoff contains an inaccurate attestation, and the database schema directly violates Invariant 4, introducing floating-point decimal rounding errors and schema impedance mismatch against `docs/api-routes.md` (which correctly specifies `chest_mm` and `weight_g`).
4. **Premise 3 (Testing Mandate):** Review protocol mandates running `npm test` and `npm run typecheck`, and forbids approving deliverables when build/test commands fail.
5. **Inference from Observations 1.3 & 1.4:** `npm test` fails with exit code 1 (4 failed boundary tests). `npm run typecheck` fails with exit code 1 (50+ compilation errors).
6. **Premise 4 (Security Architecture):** Supabase Row Level Security denies all operations by default unless an explicit matching policy evaluates to true.
7. **Inference from Observation 1.5:** Because `size_recommendations`, `community_contributions`, `garment_measurements`, and `products` lack `INSERT` or `UPDATE` policies, standard application flows (saving sizing recommendations, approving contributions) will fail with RLS permission denial errors.
8. **Premise 5 (Explainability & UX Consistency):** Sizing recommendations must be mathematically sound, monotonic, and explainable without self-contradictory outputs (`AGENTS.md` Invariant 8).
9. **Inference from Observation 1.6:** An ease calculation that is within the target band and declared `ideal` should not receive an `insufficient` 32% score. A plateau Gaussian or properly calibrated variance is required.
10. **Deduction:** Because of Findings 1 through 5, Milestone 1 cannot be approved in its current state. The verdict must be **REQUEST_CHANGES**.

---

## 3. Findings

### [Critical] Finding 1: Canonical Storage Unit Violation & False Handoff Attestation
- **What:** Database schema columns are defined in centimeters (`_cm NUMERIC(5,1)`) and kilograms (`weight_kg NUMERIC(5,1)`) rather than canonical non-negative integer millimeters (`_mm INTEGER`) and grams (`weight_g INTEGER`), contradicting `worker_m1_docs/handoff.md` lines 79 & 126.
- **Where:** `docs/database-schema.sql` lines 71–79 (`body_measurements`), lines 207–215 (`brand_size_charts`), lines 275–284 (`garment_measurements`), lines 318–320 (`reference_garments`), and lines 442–445 (`indiasize_reference`).
- **Why:** Violates `AGENTS.md` Invariant 4. Propagates decimal rounding errors into database storage, and causes type mismatch against `docs/api-routes.md` and `docs/recommendation-pseudocode.md`.
- **Suggestion:** Refactor column names and types in `docs/database-schema.sql` to canonical integers:
  `chest_mm INTEGER CHECK (chest_mm > 0)`, `waist_mm INTEGER CHECK (waist_mm > 0)`, `height_mm INTEGER CHECK (height_mm > 0)`, `weight_g INTEGER CHECK (weight_g > 0)`, `chest_flat_mm INTEGER CHECK (chest_flat_mm > 0)`, etc.

### [Critical] Finding 2: `npm test` Failure on Boundary Suite
- **What:** Automated test execution via `npm test` fails with 4 test failures in `tests/e2e/tier2-boundaries.test.ts`.
- **Where:** `tests/e2e/tier2-boundaries.test.ts` lines 320, 463, 760, 766.
- **Why:** Boundary tests fail on borderline threshold margins (> 0.08 delta), multiple reference garment calibration ranking, and community correction factor adjustments.
- **Suggestion:** Coordinate between engine logic and test expectations to ensure all boundary assertions pass.

### [Critical] Finding 3: `npm run typecheck` Compilation Failure
- **What:** TypeScript compiler `tsc --noEmit` fails with code 1 and 50+ type errors.
- **Where:** `tests/e2e/tier1-features.test.ts`, `tests/e2e/tier2-boundaries.test.ts`, `tests/unit/sizing/recommendationEngine.test.ts`.
- **Why:** Test fixture objects omit required fields defined in `src/sizing/types.ts` (`confidence`, `measurementMethod`, `sizeSystem`, `measuredBy`).
- **Suggestion:** Supply required fixture properties or update TypeScript interfaces so typechecking passes with zero errors.

### [Major] Finding 4: Incomplete Supabase RLS Mutation Policies
- **What:** Multiple tables with RLS enabled lack `INSERT` or `UPDATE` policies.
- **Where:** `docs/database-schema.sql` lines 231–236, 258–263, 299–304, 362–371, 421–432.
- **Why:** Authenticated clients will receive `permission denied` errors when inserting recommendations into `size_recommendations`, and verifiers/admins cannot update contributions or catalog items.
- **Suggestion:** Add explicit scoped policies:
  ```sql
  CREATE POLICY "Users can insert recommendations for their profiles"
    ON size_recommendations FOR INSERT
    WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = size_recommendations.profile_id AND profiles.user_id = auth.uid()));

  CREATE POLICY "Verifiers and admins can review contributions"
    ON community_contributions FOR UPDATE
    USING (EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role IN ('verifier', 'admin')));
  ```

### [Major] Finding 5: Gaussian Ease Scoring Boundary Discontinuity
- **What:** Sizing algorithm drops to 32% score at the bounds of what it explicitly defines as `ideal` ease.
- **Where:** `docs/recommendation-pseudocode.md` lines 181, 243–254.
- **Why:** Generates contradictory UX where the explanation text says "Ease is within your desired regular target (+80mm to +140mm)" but assigns an `insufficient` confidence score of 32/100.
- **Suggestion:** Implement a plateau/trapezoidal Gaussian function:
  ```typescript
  export function calculateGaussianScore(actualEaseMm: number, target: EaseRange): number {
    if (actualEaseMm >= target.minMm && actualEaseMm <= target.maxMm) {
      return 1.0; // Flat-top ideal zone
    }
    const delta = actualEaseMm < target.minMm ? target.minMm - actualEaseMm : actualEaseMm - target.maxMm;
    return Math.exp(-Math.pow(delta, 2) / (2 * Math.pow(target.sigmaMm, 2)));
  }
  ```

### [Minor] Finding 6: Missing Root `styles/tokens.css`
- **What:** Root `styles/tokens.css` was deleted; tokens are located at `src/styles/tokens.css`.
- **Where:** `styles/tokens.css` vs `src/styles/tokens.css`.
- **Why:** `MASTER_PROMPT.md` and `ORIGINAL_REQUEST.md` reference `styles/tokens.css`.
- **Suggestion:** Create a symlink or keep `styles/tokens.css` in sync with `src/styles/tokens.css`.

---

## 4. Verified Claims

| Claim | Source | Verification Method | Status |
|---|---|---|:---:|
| 9 required documentation files exist | `worker_m1_docs/handoff.md` | `Get-ChildItem -Path 'docs'` | **PASS** |
| Competitor analysis covers 9 competitors across 9 dimensions | `docs/competitor-analysis.md` | Line inspection & dimension matrix audit | **PASS** |
| NIFT INDIAsize synthesized with IN Tag & check constraint | `docs/indian-sizing-research.md` | Text inspection & regex verification | **PASS** |
| Database schema has `indiasize_empty CHECK (false)` | `docs/database-schema.sql:449` | AST / SQL text search | **PASS** |
| Anti-self verification check constraint present | `docs/database-schema.sql:359` | `cannot_verify_own_submission CHECK (contributor_id <> reviewed_by)` | **PASS** |
| 16 Next.js App Router API endpoints documented | `docs/api-routes.md` | Endpoint table count & DTO inspection | **PASS** |
| Component hierarchy enforces 44px touch targets | `docs/component-hierarchy.md` | Accessibility section verification | **PASS** |
| Zero-knowledge B2B portability flow documented | `docs/data-flow.md` | Privacy shield sequence diagram inspection | **PASS** |
| Recommendation pseudocode specifies borderline delta < 0.08 & ±0.15 calibration | `docs/recommendation-pseudocode.md` | Mathematical parameter inspection | **PASS** |
| Tier 1 test suite passes completely (125 tests) | `tests/e2e/tier1-features.test.ts` | `npx vitest run tests/e2e/tier1-features.test.ts` | **PASS** |
| Unit tests pass completely (31 tests) | `tests/unit/` | `npx vitest run tests/unit/` | **PASS** |
| Schema enforces canonical `_mm` and `weight_g` integers | `worker_m1_docs/handoff.md:79` | `docs/database-schema.sql` inspection | **FAIL** (Uses `_cm` and `weight_kg`) |
| `npm test` passes 100% | `AGENTS.md` | `npm test` execution | **FAIL** (4 failed tests in Tier 2) |
| `npm run typecheck` passes 100% | Task mandate | `npm run typecheck` execution | **FAIL** (50+ typecheck errors) |

---

## 5. Adversarial Challenge & Stress-Test Report

**Overall Risk Assessment: MEDIUM-HIGH**

### Challenge 1: Unit Impedance Mismatch Runtime Attack
- **Assumption Challenged:** Frontend, API, and Database seamlessly communicate measurements.
- **Attack Scenario:** Frontend sends canonical integer `chest_mm: 980`. If database schema column is `chest_cm NUMERIC(5,1)`, inserting raw 980 records a 980 cm (9.8-meter) chest girth. If the API converts by dividing by 10, floating-point representations (`98.00000000000001`) infiltrate PostgreSQL storage, violating Invariant 4.
- **Blast Radius:** Sizing database corruption and sizing calculation drift across all users.
- **Mitigation:** Refactor database schema to store pure integer `mm` and `g`.

### Challenge 2: Boundary User "Regular Fit" Abandonment
- **Assumption Challenged:** Users within their chosen fit intent range will receive high-confidence recommendations.
- **Attack Scenario:** User with 980mm chest chooses "Regular Fit" (target: 80–140mm ease). A garment with 1060mm chest (+80mm ease) receives a 32% score due to narrow single-point Gaussian curve ($\mu = 110, \sigma = 20$). Recommendation engine labels the fit "insufficient data" or recommends a baggier size, confusing the user.
- **Blast Radius:** Core sizing recommendation failure on borderline-acceptable garments.
- **Mitigation:** Implement plateau Gaussian scoring across the ideal ease interval.

### Challenge 3: RLS Lockout of Legitimate Application Workflows
- **Assumption Challenged:** RLS policies allow standard application operations while protecting biometrics.
- **Attack Scenario:** User generates a recommendation; client issues `INSERT INTO size_recommendations`. Database rejects query with `new row violates row-level security policy for table "size_recommendations"`.
- **Blast Radius:** Total failure of recommendation persistence and history features.
- **Mitigation:** Add scoped `INSERT` policy for `size_recommendations`.

---

## 6. Caveats

- **Scope Discipline:** As a reviewer, I have strictly identified findings and provided reproduction evidence without modifying any documentation or source code files.
- **Milestone 0 vs Milestone 1 Concurrency:** `tests/e2e/tier2-boundaries.test.ts` was introduced by the concurrent `test_writer_m0_e2e` agent. While `worker_m1_docs` passed the tests that existed at the start of its task (Tier 1), the current repo state fails `npm test` and `npm run typecheck`, which must be resolved for system-wide integrity.

---

## 7. Conclusion

Requirement 1 deliverables represent strong foundational work, but cannot be approved due to the canonical unit schema discrepancy (`_cm` vs `_mm`), incomplete RLS policies, Gaussian scoring boundary issues, and current failure of `npm test` and `npm run typecheck`.

**Verdict: REQUEST_CHANGES**

---

## 8. Verification Method

To independently reproduce and verify this review report:

1. **Verify Schema Canonical Unit Defect:**
   ```powershell
   Select-String -Path 'e:\Projects\WearID\docs\database-schema.sql' -Pattern '_cm\b|_mm\b'
   ```
   Notice lines 71–79 and 275–284 use `_cm` instead of `_mm`.

2. **Execute Full Test Suite:**
   ```powershell
   npm test
   ```
   Notice exit code 1 with 4 failing tests in `tests/e2e/tier2-boundaries.test.ts`.

3. **Execute Typecheck:**
   ```powershell
   npm run typecheck
   ```
   Notice exit code 1 with 50+ type errors.

4. **Inspect RLS Policies in Schema:**
   ```powershell
   Select-String -Path 'e:\Projects\WearID\docs\database-schema.sql' -Pattern 'CREATE POLICY.*size_recommendations'
   ```
   Notice only `SELECT` exists; no `INSERT` policy is defined.
