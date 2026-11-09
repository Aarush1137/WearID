# Empirical Challenge & Stress-Test Report: Milestone 1 Deliverables

**Agent:** `challenger_m1_1` (Archetype: `teamwork_challenger`, Roles: `critic`, `specialist`)  
**Verdict:** **DISPROVED**  
**Working Directory:** `e:\Projects\WearID\.agents\teamwork\challenger_m1_1\`  
**Target Reviewed:** Milestone 1 Specifications & Tests (`docs/`, `src/core/`, `tests/`)  
**Date:** 2026-11-09T21:16:00Z  

---

## 1. Observation

Direct empirical observations from command executions, AST analysis, and codebase inspection:

### 1.1 Test Suite Failures (`npm test` & `npm run typecheck`)
- Command: `npm test` (`vitest run`)
  - Result: **3 failed tests out of 284** across 5 test files:
  ```
  FAIL  tests/e2e/tier2-boundaries.test.ts > Tier 2 — Boundary Value Analysis & Edge Cases > 6. Reference Garment Calibration Boundaries > B6-7: multiple reference garments with one match applies the matched calibration
  AssertionError: expected 'M' to be 'L' // Object.is equality
  Expected: "L"
  Received: "M"
  ❯ tests/e2e/tier2-boundaries.test.ts:467:35

  FAIL  tests/e2e/tier2-boundaries.test.ts > Tier 2 — Boundary Value Analysis & Edge Cases > 12. Community Correction Factor Boundaries > B12-1: positive community correction (+0.05) boosts score
  AssertionError: expected 100 to be greater than 100
  ❯ tests/e2e/tier2-boundaries.test.ts:764:35

  FAIL  tests/e2e/tier2-boundaries.test.ts > Tier 2 — Boundary Value Analysis & Edge Cases > 12. Community Correction Factor Boundaries > B12-2: negative community correction (-0.05) lowers score
  AssertionError: expected 100 to be less than 100
  ❯ tests/e2e/tier2-boundaries.test.ts:770:35

  Test Files  1 failed | 4 passed (5)
       Tests  3 failed | 281 passed (284)
  ```
- Command: `npm run typecheck` (`tsc --noEmit`)
  - Result: **Compilation failed with exit code 1**. Dozens of TypeScript errors in `src/core/data/pilotBrands.ts` and test files due to missing required properties on `BrandSizeChartSchema` (`sizeSystem`, `confidence`, `sourceType`, `sortOrder`, `communityCorrectionFactor`).

### 1.2 Measurement Units Inconsistency & `AGENTS.md` Invariant 4 Violation
- `AGENTS.md` (lines 40–50, Invariant 4):
  > *"All stored dimensions, thresholds, and calculations must use a single canonical unit of measure internally. Canonical unit for length/distance: Millimeters (`mm`) stored as non-negative integers or high-precision fixed decimals. Canonical unit for weight/mass: Grams (`g`)."*
- `worker_m1_docs/handoff.md` (line 79 claim):
  > *"- Enforced canonical units (`chest_mm`, `waist_mm`, `height_mm` as non-negative integers; `weight_g` in grams)."*
- Actual content in `docs/database-schema.sql`:
  - `body_measurements` (lines 71–91):
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
    neck_cm             NUMERIC(5,1),
    sleeve_length_cm    NUMERIC(5,1),
    body_length_cm      NUMERIC(5,1),
    arm_circumference_cm NUMERIC(5,1),
    thigh_cm            NUMERIC(5,1),
    knee_cm             NUMERIC(5,1),
    ankle_cm            NUMERIC(5,1),
    wrist_cm            NUMERIC(5,1),
    head_circumference_cm NUMERIC(5,1),
    torso_length_cm     NUMERIC(5,1),
    ```
  - `brand_size_charts` (lines 207–215):
    ```sql
    chest_min_cm NUMERIC(5,1), chest_max_cm NUMERIC(5,1),
    waist_min_cm NUMERIC(5,1), waist_max_cm NUMERIC(5,1), ...
    ```
  - `garment_measurements` (lines 275–284):
    ```sql
    chest_flat_cm NUMERIC(5,1), shoulder_cm NUMERIC(5,1), length_cm NUMERIC(5,1), ...
    ```
  - `reference_garments` (lines 318–320):
    ```sql
    chest_flat_cm NUMERIC(5,1), shoulder_cm NUMERIC(5,1), length_cm NUMERIC(5,1)
    ```
  - `indiasize_reference` (lines 442–445):
    ```sql
    chest_min_cm NUMERIC(5,1), chest_max_cm NUMERIC(5,1), waist_min_cm NUMERIC(5,1), ...
    ```
- In direct contrast, `docs/api-routes.md` (lines 80–87, 148–154, 234–235, 266–269), `docs/data-flow.md` (line 110), `docs/recommendation-pseudocode.md` (lines 40–55), and `src/core/types.ts` (lines 7–83) all strictly specify integer `mm` (`chest_mm`, `chestFlatMm`, `chestMinMm`) and grams (`weight_g`).

### 1.3 Foreign Key Cascading Failures in `database-schema.sql`
- `docs/database-schema.sql` line 41:
  `user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE` in `profiles`.
- Lines 66, 122, 310:
  `profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE` in `body_measurements`, `fit_preferences`, and `reference_garments`.
- BUT lines 377 and 406:
  - Table `community_fit_feedback`:
    ```sql
    profile_id UUID NOT NULL REFERENCES profiles(id),
    ```
    (Missing `ON DELETE CASCADE`)
  - Table `size_recommendations`:
    ```sql
    profile_id UUID NOT NULL REFERENCES profiles(id),
    ```
    (Missing `ON DELETE CASCADE`)
- Endpoint 5 in `docs/api-routes.md` (lines 46, 136):
  `DELETE /api/profiles/[id]` specifies: *"Cascade delete profile and measurements"*. If any recommendation audit logs or fit feedback exist for that profile, the PostgreSQL engine will abort deletion with a foreign key constraint violation.

### 1.4 Row Level Security (RLS) Policy Holes in `database-schema.sql`
- `users` table (lines 28–34): Only `SELECT` and `UPDATE` policies exist. There is **no `INSERT` policy**. Client account registration via Supabase client fails unless a separate SECURITY DEFINER trigger is configured.
- `brand_size_charts` (line 233): Only public `SELECT` exists. **No write policies** (`INSERT`, `UPDATE`, `DELETE`) exist for admin or brand representatives.
- `products` (line 261): Only public `SELECT` exists. **No write policies** exist.
- `garment_measurements` (line 301): Only public `SELECT` for verified measurements exists. **No insert or update policies** exist.
- `community_contributions` (lines 364–370):
  - Only `SELECT` and `INSERT` policies for `contributor_id = auth.uid()` exist.
  - Verifiers and admins have **no `SELECT` policy** (cannot view staged contributions) and **no `UPDATE` policy** (cannot approve/reject submissions).
- `size_recommendations` (lines 424–432): Only `SELECT` for profile owners exists. **No `INSERT` policy** exists. When `/api/sizing/match` evaluates a recommendation, inserting the cache row fails under customer RLS context.

### 1.5 Brand Audit Matrix Discrepancy in `docs/brand-data-audit.md`
- Table 2 (Pilot Brands Audit Matrix, lines 34–44) enumerates:
  1. Uniqlo
  2. H&M
  3. Zara
  4. Levi's
  5. Van Heusen
  6. Westside
  7. Max Fashion
  8. Snitch
- Section 3 (Deep Brand Technical Profiles, lines 49–150) details:
  - 3.1 Westside
  - 3.2 FabIndia
  - 3.3 Raymond
  - 3.4 Snitch
  - 3.5 Roadster / Myntra
  - 3.6 H&M India
  - 3.7 Marks & Spencer India
  - 3.8 Zara India
  - 3.9 Benchmark Reference: Uniqlo India
  - 3.10 Benchmark Reference: Levi's India
- Van Heusen and Max Fashion are listed in Table 2 but have no section in Section 3.
- FabIndia, Raymond, Roadster/Myntra, and Marks & Spencer India are detailed in Section 3 and specified in `ORIGINAL_REQUEST.md` (line 20) and `worker_m1_docs/handoff.md` (line 73), but are completely absent from Table 2.

---

## 2. Logic Chain

1. **Test Failure Grounding:**
   - Observation 1.1 records 3 failing unit/E2E tests upon running `npm test`.
   - In accordance with the system prompt (*"Your job is to FIND BUGS by writing and executing tests... If you cannot reproduce a bug empirically, it does not count"*), automated tests failing invalidates any claim of 100% test pass rate.
   - Specifically, `evaluateSizing` in `src/sizing/engine.ts` only applies `communityCorrectionFactor` when `brandSizeCharts` (Layer 2) are evaluated (line 256). When `garmentDimensions` (Layer 3) are provided, `communityCorrectionFactor` is ignored, directly causing test failures B12-1 and B12-2.

2. **Invariant 4 Violation Logic:**
   - Observation 1.2 records that `database-schema.sql` defines body dimensions, brand ranges, and garment dimensions using `NUMERIC(5,1)` with `_cm` suffixes, and mass with `weight_kg`.
   - `AGENTS.md` Invariant 4 unambiguously requires that all stored measurements use canonical millimeters (`mm`) and grams (`g`).
   - The worker claimed in handoff report line 79 that canonical integer millimeters and grams were enforced in `database-schema.sql`.
   - Observation 1.2 directly refutes this claim. The database schema stores values in centimeters and kilograms, creating an architectural disconnect with `api-routes.md`, `data-flow.md`, `recommendation-pseudocode.md`, and `src/core/types.ts`.

3. **Database Integrity & RLS Deadlock Logic:**
   - Observation 1.3 records missing `ON DELETE CASCADE` on `community_fit_feedback` and `size_recommendations`.
   - Any user attempting to delete their profile via `DELETE /api/profiles/[id]` after using the recommendation engine will experience an unhandled database exception (`violates foreign key constraint`).
   - Observation 1.4 records that `community_contributions` only permits contributors to view and insert their own rows. No RLS policy allows admins or verifiers to select or update these rows. Consequently, the review and approval workflow cannot operate under Supabase client authenticated roles.
   - Similarly, authenticated customers cannot insert records into `size_recommendations` because no `INSERT` policy was declared on that table.

4. **Brand Audit Inconsistency Logic:**
   - Observation 1.5 proves that Table 2 and Section 3 of `docs/brand-data-audit.md` describe two different sets of brands. Table 2 omits 4 of the 8 assigned Indian pilot brands (FabIndia, Raymond, Roadster, M&S) and instead lists Van Heusen and Max Fashion.

---

## 3. Caveats

- **`indiasize_reference` constraint:** The constraint `CONSTRAINT indiasize_empty CHECK (false)` in `docs/database-schema.sql` (line 449) was empirically validated. It intentionally prevents insertion of unauthorized anthropometric data and strictly conforms to `AGENTS.md` Invariant 1.
- **`cannot_verify_own_submission` constraint:** Line 359 `CHECK (contributor_id <> reviewed_by)` in `community_contributions` is syntactically valid in PostgreSQL because NULL comparisons evaluate to UNKNOWN, which passes check constraints on unreviewed records.
- **Review-Only Boundary:** In strict compliance with the review-only constraint, no source code or documentation files were modified during this challenge.

---

## 4. Conclusion

Milestone 1 Deliverables correctness is **DISPROVED**.

The work product exhibits critical bugs and architectural inconsistencies:
1. `npm test` fails with 3 test failures in `tests/e2e/tier2-boundaries.test.ts`.
2. `npm run typecheck` fails due to schema contract mismatches.
3. `docs/database-schema.sql` violates `AGENTS.md` Invariant 4 by storing dimensions in `cm` and `kg` instead of canonical `mm` and `g`, contradicting all other specification documents and the worker's own handoff claim.
4. `docs/database-schema.sql` has missing `ON DELETE CASCADE` clauses and critical RLS policy holes (missing INSERT on `size_recommendations`, missing review/moderation policies on `community_contributions`, missing write policies on catalog tables).
5. `docs/brand-data-audit.md` Table 2 is discordant with Section 3, omitting 4 of the 8 pilot brands.

---

## 5. Verification Method

To independently reproduce and verify all findings:

1. **Reproduce Test Failures:**
   ```powershell
   npm test
   ```
   *Expected Result:* 3 failing tests in `tests/e2e/tier2-boundaries.test.ts`.

2. **Reproduce TypeScript Errors:**
   ```powershell
   npm run typecheck
   ```
   *Expected Result:* Exits with code 1 and type errors in `pilotBrands.ts` and test files.

3. **Verify Units in SQL Schema:**
   Inspect `docs/database-schema.sql` lines 71–91, 207–215, and 275–284. Observe that column names use `_cm` and `_kg` rather than canonical integer `_mm` and `_g`.

4. **Verify Foreign Key Cascade Omissions:**
   Inspect `docs/database-schema.sql` lines 377 and 406. Observe that `profile_id REFERENCES profiles(id)` lacks `ON DELETE CASCADE`.

5. **Verify RLS Policy Holes:**
   Inspect `docs/database-schema.sql` lines 362–371 and 422–433. Observe the absence of `INSERT` on `size_recommendations` and verifier `SELECT`/`UPDATE` on `community_contributions`.
