## 2026-11-09T21:16:42Z
You are worker_m1_remediate_2, a fresh teamwork_worker subagent.

## Working Directory
Your working directory is: `e:\Projects\WearID\.agents\teamwork\worker_m1_remediate_2\`
Create your BRIEFING.md and progress.md in your working directory. Write all metadata and handoff there.

## Mandatory User Request Reference
You MUST read the authoritative request at:
`e:\Projects\WearID\.agents\teamwork\ORIGINAL_REQUEST.md`

## Reviewer & Challenger Feedback to Remediate
Reviewers and Challengers for Milestone 1 identified the following specific items that MUST be fixed:

1. **`docs/database-schema.sql` (CRITICAL - AGENTS.md Invariant 4 & Invariant 2)**:
   - Convert ALL measurement columns from `_cm NUMERIC(5,1)` and `weight_kg NUMERIC(5,1)` to canonical integers: `_mm INTEGER` and `weight_g INTEGER`:
     * `body_measurements`: `height_mm INTEGER CHECK (height_mm > 0)`, `weight_g INTEGER CHECK (weight_g > 0)`, `chest_mm INTEGER CHECK (chest_mm > 0)`, `bust_mm INTEGER`, `waist_mm INTEGER`, `hips_mm INTEGER`, `shoulder_width_mm INTEGER`, `inseam_mm INTEGER`, `foot_length_mm INTEGER`, `neck_mm INTEGER`, `sleeve_length_mm INTEGER`, `body_length_mm INTEGER`, `arm_circumference_mm INTEGER`, `thigh_mm INTEGER`, `knee_mm INTEGER`, `ankle_mm INTEGER`, `wrist_mm INTEGER`, `head_circumference_mm INTEGER`, `torso_length_mm INTEGER`.
     * `brand_size_charts`: `chest_min_mm INTEGER, chest_max_mm INTEGER`, `waist_min_mm INTEGER, waist_max_mm INTEGER`, `hips_min_mm INTEGER, hips_max_mm INTEGER`, `neck_min_mm INTEGER, neck_max_mm INTEGER`, `sleeve_min_mm INTEGER, sleeve_max_mm INTEGER`, `inseam_min_mm INTEGER, inseam_max_mm INTEGER`.
     * `garment_measurements`: `chest_flat_mm INTEGER CHECK (chest_flat_mm > 0)`, `shoulder_mm INTEGER`, `length_mm INTEGER`, `waist_flat_mm INTEGER`, `hips_flat_mm INTEGER`, `sleeve_length_mm INTEGER`, `bicep_flat_mm INTEGER`, `cuff_flat_mm INTEGER`, `collar_circumference_mm INTEGER`, `inseam_mm INTEGER`, `outseam_mm INTEGER`, `rise_mm INTEGER`, `thigh_flat_mm INTEGER`, `leg_opening_flat_mm INTEGER`.
     * `reference_garments`: `chest_flat_mm INTEGER`, `shoulder_mm INTEGER`, `length_mm INTEGER`.
     * `indiasize_reference`: `chest_min_mm INTEGER, chest_max_mm INTEGER`, `waist_min_mm INTEGER, waist_max_mm INTEGER`, etc.
   - Add missing provenance columns in `brand_size_charts` and `garment_measurements`:
     `source_type TEXT CHECK (source_type IN ('brand_official', 'retailer_api', 'curated_dataset', 'user_measured_physical', 'contributor_verified'))`,
     `source_uri TEXT`,
     `retrieved_at TIMESTAMPTZ DEFAULT now()`,
     `verification_hash TEXT`,
     `license_or_permission TEXT`.
   - Add `ON DELETE CASCADE` on `profile_id` references in `community_fit_feedback` and `size_recommendations`.
   - Add missing RLS policies:
     * `INSERT` policy on `size_recommendations` for profile owners.
     * `INSERT` policy on `users` table for authenticated users (`auth.uid() = id`).
     * Reviewer/admin `SELECT` and `UPDATE` policies on `community_contributions`.
     * Admin write policies on catalog tables (`brands`, `brand_size_charts`, `products`, `garment_measurements`).

2. **`docs/recommendation-pseudocode.md`**:
   - Clamp cumulative calibration adjustment: `Math.max(-0.15, Math.min(0.15, totalCalibrationDelta))` so multiple reference garments cannot exceed ±0.15 total adjustment.
   - Guard against division by zero in Layer 2 fallback: `Math.max(1, chart.chestMaxMm - chart.chestMinMm)`.
   - Use plateau/trapezoidal Gaussian ease scoring so that ideal ease values inside the target range receive score 1.0.

3. **`docs/brand-data-audit.md`**:
   - Synchronize Table 2 (Pilot Brands Matrix) with Section 3, explicitly listing Westside, FabIndia, Raymond, Snitch, Roadster/Myntra, H&M India, Marks & Spencer India, Zara India, plus Uniqlo and Levi's benchmarks.

## MANDATORY INTEGRITY WARNING
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

## Write Ownership
You EXCLUSIVELY own files under `docs/`:
- `docs/database-schema.sql`
- `docs/recommendation-pseudocode.md`
- `docs/brand-data-audit.md`
- other `docs/` files if needed for consistency.

Do NOT modify files outside `docs/` or your working directory.

## Verification
- Run `npx vitest run tests/e2e/tier1-features.test.ts` to ensure features tests pass.
- Verify that `Select-String -Path docs/database-schema.sql -Pattern "_cm|_kg"` returns NO measurement columns.
- Verify that RLS `FOR INSERT` policy is present on `size_recommendations`.

## Deliverable
Write your completion handoff report to:
`e:\Projects\WearID\.agents\teamwork\worker_m1_remediate_2\handoff.md`
Report your status and file paths back to orchestrator (conversation ID: 6cddc279-aaf6-4945-a9c0-cf8f046d0f14) via send_message.
