# E2E Test Infra: FIT Universal Clothing Size Profile (WearID)

## Test Philosophy
- Opaque-box, requirement-driven. No dependency on implementation design.
- Methodology: Category-Partition + Boundary Value Analysis (BVA) + Pairwise Combinatorial Testing + Real-World Workload Testing.

## Feature Inventory
| # | Feature | Source (requirement) | Tier 1 | Tier 2 | Tier 3 |
|---|---------|---------------------|:------:|:------:|:------:|
| 1 | Competitor Analysis Doc | ORIGINAL_REQUEST §R1 | 5 | 5 | ✓ |
| 2 | Indian Sizing Research Doc | ORIGINAL_REQUEST §R1 | 5 | 5 | ✓ |
| 3 | Product Opportunities Doc | ORIGINAL_REQUEST §R1 | 5 | 5 | ✓ |
| 4 | Brand Data Access Audit Doc | ORIGINAL_REQUEST §R1 | 5 | 5 | ✓ |
| 5 | Database Schema DDL & RLS | ORIGINAL_REQUEST §R1 | 5 | 5 | ✓ |
| 6 | Architectural Specifications Docs | ORIGINAL_REQUEST §R1 | 5 | 5 | ✓ |
| 7 | Editorial Design Tokens | ORIGINAL_REQUEST §R2 | 5 | 5 | ✓ |
| 8 | Editorial Component Classes | ORIGINAL_REQUEST §R2 | 5 | 5 | ✓ |
| 9 | UI Component Primitives | ORIGINAL_REQUEST §R2 | 5 | 5 | ✓ |
| 10 | Canonical Units & Conversions | ORIGINAL_REQUEST §R3 | 5 | 5 | ✓ |
| 11 | Domain Types & Layer 1-4 Models | ORIGINAL_REQUEST §R3 | 5 | 5 | ✓ |
| 12 | Deterministic Ease Calculator | ORIGINAL_REQUEST §R3 | 5 | 5 | ✓ |
| 13 | Reference Garment Calibration | ORIGINAL_REQUEST §R3 | 5 | 5 | ✓ |
| 14 | Borderline Fit Detection | ORIGINAL_REQUEST §R3 | 5 | 5 | ✓ |
| 15 | Explainable Recommendation Tree | ORIGINAL_REQUEST §R3 | 5 | 5 | ✓ |
| 16 | Zero Hallucination Safeguard | ORIGINAL_REQUEST §R3 | 5 | 5 | ✓ |
| 17 | Core Engine Orchestrator | ORIGINAL_REQUEST §R3 | 5 | 5 | ✓ |
| 18 | Sizing Unit Test Suite | ORIGINAL_REQUEST §R3 | 5 | 5 | ✓ |
| 19 | PWA Web App Manifest | ORIGINAL_REQUEST §R4 | 5 | 5 | ✓ |
| 20 | Service Worker & Caching | ORIGINAL_REQUEST §R4 | 5 | 5 | ✓ |
| 21 | Offline Fallback Experience | ORIGINAL_REQUEST §R4 | 5 | 5 | ✓ |
| 22 | PWA Brand Icon Assets | ORIGINAL_REQUEST §R4 | 5 | 5 | ✓ |
| 23 | Local Zero-Credential Mock Store | ORIGINAL_REQUEST §R4 | 5 | 5 | ✓ |
| 24 | Isomorphic Supabase Client | ORIGINAL_REQUEST §R4 | 5 | 5 | ✓ |
| 25 | PWA UI Pages & Navigation | ORIGINAL_REQUEST §R4 | 5 | 5 | ✓ |

## Test Architecture
- Test runner: Vitest / Playwright test harness running via `npm test` or `npx vitest run tests/e2e/`
- Test case format: TypeScript test suites with assertions on documentation existence/completeness, token variables, sizing calculations, ExplanationTrees, PWA manifest/SW validity, and mock client behavior.
- Directory layout:
  - `tests/unit/`: Component & function level unit tests.
  - `tests/e2e/`: Opaque-box E2E test suites covering Tiers 1-4.

## Real-World Application Scenarios (Tier 4)
| # | Scenario | Features Exercised | Complexity |
|---|----------|--------------------|------------|
| 1 | Men's T-Shirt Recommendation (Uniqlo Airism Crew Neck) with Regular Fit Preference | F10, F11, F12, F15, F17, F23, F24 | Medium |
| 2 | Relaxed Fit Shopping for H&M Relaxed Fit Tee with Borderline Size Tradeoff Flag | F12, F14, F15, F17, F23 | High |
| 3 | Calibrated Fit using Levi's 501 Vintage Tee Benchmark (±0.15 score adjustment) | F12, F13, F15, F17, F23 | High |
| 4 | Offline PWA Session with Local Mock Store & Standalone Installability | F7, F8, F19, F20, F21, F23, F24 | High |
| 5 | Missing Anatomical Data handling gracefully without hallucinating measurements | F10, F15, F16, F17, F23 | Medium |
| 6 | Ethnic Kurta Fitting (FabIndia) with zero fabric stretch and strict chest ease | F11, F12, F15, F17, F23 | High |

## Coverage Thresholds
- Tier 1: ≥5 per feature (Total ≥ 125 tests)
- Tier 2: ≥5 per feature where boundaries exist (Total ≥ 125 tests)
- Tier 3: Pairwise coverage of major feature interactions (Total ≥ 25 tests)
- Tier 4: ≥6 realistic application scenarios
