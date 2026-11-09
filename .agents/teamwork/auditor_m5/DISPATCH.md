## 2026-11-09T22:00:00Z

You are auditor_m5, a teamwork_auditor subagent.

## Working Directory
Your working directory is: `e:\Projects\WearID\.agents\teamwork\auditor_m5\`
Create your BRIEFING.md and progress.md in your working directory. Write all outputs there.

## Mandatory User Request Reference
You MUST read the authoritative request at:
`e:\Projects\WearID\.agents\teamwork\ORIGINAL_REQUEST.md`

## Reference Specifications
- `e:\Projects\WearID\TEST_READY.md`
- `e:\Projects\WearID\.agents\teamwork\orchestrator\PROJECT.md`
- `e:\Projects\WearID\MASTER_PROMPT.md`
- `e:\Projects\WearID\AGENTS.md`

## Your Task: Final Forensic Integrity Audit of Entire WearID Codebase
Conduct an exhaustive forensic audit across the entire WearID repository against the 10 operational invariants in `AGENTS.md`:
1. **Invariant 1: Never Invent Clothing Measurements or Brand Size Charts**:
   - Check that the sizing engine returns `insufficient_data` or low confidence when inputs are missing, never estimating or synthesizing values.
2. **Invariant 2: Every External Measurement Must Retain Its Source**:
   - Verify provenance metadata (`source_type`, `source_uri`, `retrieved_at`, `verification_hash`, `license_or_permission`) on brand size charts, garment dimensions, and mock records.
3. **Invariant 3: Never Mix Body Measurements with Garment Dimensions**:
   - Verify strict type and column segregation between body anatomy and finished garment dimensions.
4. **Invariant 4: All Stored Measurements Must Use Canonical Units**:
   - Verify that all internal storage, DDL, and calculations use non-negative integer `mm` for length and `g` for mass.
5. **Invariant 5: Do Not Publish Unverified Contributor Submissions**:
   - Check status progression (`draft` -> `pending_review` -> `multi_source_corroborated` -> `verified_published`) and self-review constraint (`contributor_id <> reviewed_by`).
6. **Invariant 6: Never Bypass a Website's Access Controls**:
   - Verify that crawlers and brand data audits strictly respect robots.txt and no bypass methods are employed.
7. **Invariant 7: Keep Users' Profiles Private by Default**:
   - Verify Row Level Security policies enforce private access by default, and zero biometric data is exposed on portability endpoints.
8. **Invariant 8: Every Recommendation Must Be Explainable**:
   - Verify that every sizing recommendation includes a complete `ExplanationTree` with expected ease vs target ease and fabric influence.
9. **Invariant 9: Never Fabricate User Reviews, Performance Statistics or Brand Partnerships**:
   - Verify that mock datasets are marked `is_synthetic: true` / local mocks and zero fake partner logos or synthetic inflation exist.
10. **Invariant 10: Write Tests for Every Important Measurement and Sizing Calculation**:
   - Verify comprehensive automated unit and E2E tests exist and pass.
11. **Absence of Cheating/Facades/Lorem Ipsum**:
   - Ripgrep for `TODO`, `FIXME`, `lorem ipsum`, dummy facades, or fake verification outputs.
12. **Independent Test Execution**:
   - Execute `npm test`, `npm run typecheck`, and `npm run build`.
13. State your binary verdict: **CLEAN** or **INTEGRITY VIOLATION**.

## Deliverable
Write your audit report to:
`e:\Projects\WearID\.agents\teamwork\auditor_m5\handoff.md`
Report your verdict and findings back to orchestrator (conversation ID: 6cddc279-aaf6-4945-a9c0-cf8f046d0f14) via send_message.
