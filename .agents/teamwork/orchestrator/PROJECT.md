# Project: FIT Universal Clothing Size Profile (WearID)

## Architecture
- **Layer 1: User Anatomical Profile**: Biometric body measurements in canonical integer millimeters (`mm`) and mass in grams (`g`). Strictly separated from finished garment measurements.
- **Layer 2: Brand Body-Fit Size Charts**: Manufacturer body-measurement sizing guides (what body size a brand garment is intended to fit).
- **Layer 3: Garment Physical Finished Dimensions**: Finished textile flat measurements in mm (pit-to-pit flat, waist flat, center back length, sleeve span, etc.) multiplied by 2 for circumference.
- **Layer 4: User Fit Preferences**: Category-specific fit intentions (slim, regular, relaxed, oversized) with ease intervals in mm and fabric elasticity modifiers.
- **Deterministic Sizing Engine**: Pure mathematical functions with Gaussian ease scoring, category weighting, reference garment calibration ($\pm 0.15$), borderline detection ($|\Delta| < 0.08$), and structured `ExplanationTree` generation. Zero measurement hallucination.
- **Next.js App Router PWA**: Editorial fashion-tech design tokens, standalone installability, service worker caching, offline fallback, and local zero-credential mock services.

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | Competitor Analysis Doc | Comprehensive evaluation of 9 size tech competitors across 9 dimensions in `docs/competitor-analysis.md` | M1 | MASTER_PROMPT / R1 |
| 2 | Indian Sizing Research Doc | Anthropometric data (NIFT INDIAsize study), regional variations, morphology archetypes, return economics in `docs/indian-sizing-research.md` | M1 | MASTER_PROMPT / R1 |
| 3 | Product Opportunities Doc | Value proposition, universal sizing passport, consumer/brand/marketplace models, wedge strategy (Men's T-Shirts) in `docs/product-opportunities.md` | M1 | MASTER_PROMPT / R1 |
| 4 | Brand Data Access Audit Doc | Audit of 8 pilot brands, size chart accessibility, Layer 2 vs Layer 3 availability, compliance with AGENTS.md in `docs/brand-data-audit.md` | M1 | MASTER_PROMPT / R1 |
| 5 | Database Schema DDL & RLS | Complete 13 tables DDL with Row Level Security policies matching Layers 1-4 in `docs/database-schema.sql` | M1 | MASTER_PROMPT / R1 |
| 6 | Architectural Specifications Docs | API route map (`docs/api-routes.md`), component hierarchy (`docs/component-hierarchy.md`), data flow (`docs/data-flow.md`), recommendation pseudocode (`docs/recommendation-pseudocode.md`) | M1 | MASTER_PROMPT / R1 |
| 7 | Editorial Design Tokens | CSS custom properties for surfaces, text, forest green accent, terracotta highlights, confidence dots, DM Sans / Serif Display scales in `styles/tokens.css` | M2 | MASTER_PROMPT / R2 |
| 8 | Editorial Component Token Classes | CSS classes for `.card-editorial`, `.btn-primary`, `.btn-secondary`, `.input-editorial`, `.confidence-dot`, `.badge-pill`, and safe-area utilities | M2 | MASTER_PROMPT / R2 |
| 9 | UI Component Primitives | Accessible React/Tailwind primitives in `src/components/ui/` (Button, Card, Input, Select, Badge, ConfidenceDot) meeting 44px min touch target | M2 | MASTER_PROMPT / R2 |
| 10 | Canonical Units & Conversions | Conversion utilities between mm, cm, inches, grams with integer precision and rounding error prevention in `src/core/units.ts` | M3 | AGENTS.md / R3 |
| 11 | Domain Types & Layer 1-4 Models | TypeScript interfaces strictly segregating `AnatomicalProfile`, `BrandSizeChart`, `GarmentDimensions`, `FitPreference` in `src/core/types.ts` | M3 | AGENTS.md / R3 |
| 12 | Deterministic Ease Calculator | Ease calculation ($\text{Garment} - \text{Body}$), fit intent classification, fabric stretch factor, category dimension weighting in `src/core/ease.ts` | M3 | MASTER_PROMPT / R3 |
| 13 | Reference Garment Calibration | Dynamic score adjustment vector of up to $\pm 0.15$ based on user-validated benchmark garments in `src/core/calibration.ts` | M3 | MASTER_PROMPT / R3 |
| 14 | Borderline Fit Detection | Explicit identification of adjacent sizes with score delta $< 0.08$ with comparative tradeoff rationale in `src/core/borderline.ts` | M3 | MASTER_PROMPT / R3 |
| 15 | Explainable Recommendation Tree | Structured JSON & markdown `ExplanationTree` detailing expected ease vs target ease, deltas, fabric influence, calibration notes in `src/core/explanation.ts` | M3 | MASTER_PROMPT / R3 |
| 16 | Zero Hallucination Safeguard | Honest missing data handling returning `insufficient_data` / low confidence when required inputs are absent without fabrication | M3 | AGENTS.md / R3 |
| 17 | Core Engine Orchestrator | Pure recommendation pipeline tying together scoring, weighting, calibration, borderline, and explanation in `src/core/engine.ts` | M3 | MASTER_PROMPT / R3 |
| 18 | Sizing Unit Test Suite | Automated Vitest test suite executing and passing across ease, fit intent, fabric, calibration, borderline, and zero hallucination | M3 | tests.md / R3 |
| 19 | PWA Web App Manifest | Valid standalone web app manifest in `public/manifest.json` with theme color, background color, portrait orientation, icons | M4 | MASTER_PROMPT / R4 |
| 20 | Service Worker & Caching | Service worker script in `public/sw.js` with static cache-first, API network-first, and registration hook in `src/components/pwa/` | M4 | MASTER_PROMPT / R4 |
| 21 | Offline Fallback Experience | Offline fallback route (`src/app/offline/page.tsx` and `public/offline.html`) gracefully communicating cached profile status | M4 | MASTER_PROMPT / R4 |
| 22 | PWA Brand Icon Assets | Brand icons (192px, 512px, maskable, apple-touch-icon) in `public/icons/` | M4 | MASTER_PROMPT / R4 |
| 23 | Local Zero-Credential Mock Store | In-memory seeded store with 8 pilot brands, Layer 2 size charts, Layer 3 T-shirt dimensions, and mock profiles in `src/lib/mocks/mock-store.ts` | M4 | MASTER_PROMPT / R4 |
| 24 | Isomorphic Supabase Client | Supabase mock adapter and isomorphic factory supporting offline development without cloud credentials in `src/lib/supabase/` | M4 | MASTER_PROMPT / R4 |
| 25 | PWA UI Pages & Navigation | App Router pages: Landing page (`/`), 3-path onboarding (`/onboarding`), Dashboard (`/app`), Recommendation Explorer (`/app/recommendations`) | M4 | MASTER_PROMPT / R4 |
| 26 | E2E Testing Suite (Tiers 1-4) | Comprehensive opaque-box test runner and test cases covering feature, boundary, combinatorial, and real-world application tiers | M0 / M5 | tests.md |
| 27 | Adversarial Hardening (Tier 5) | White-box adversarial testing, stress testing, edge-case coverage audit, bug hunting, and verification hardening | M5 | Project Pattern |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M0 | E2E Testing Track | Design E2E test infra, runner, and test cases (Tiers 1-4) deriving from requirements; publish TEST_READY.md | none | DONE |
| M1 | Phase 0 Research & Architecture Docs | Produce `docs/competitor-analysis.md`, `docs/indian-sizing-research.md`, `docs/product-opportunities.md`, `docs/brand-data-audit.md`, DDL & spec docs | none | IN_REMEDIATION |
| M2 | Design System Tokens & Primitives | Implement token classes in `styles/tokens.css` and UI primitives in `src/components/ui/` | none | PLANNED |
| M3 | Deterministic Sizing Recommendation Engine | Implement `src/core/` (types, units, ease, calibration, borderline, explanation, engine) + unit tests | none | PLANNED |
| M4 | Phase 1 PWA Proof of Concept & Local Dev | Implement PWA manifest, service worker, icons, offline fallback, mock Supabase store, and App Router pages | M2, M3 | PLANNED |
| M5 | E2E Test Pass & Adversarial Hardening | Pass 100% of E2E tests (Tiers 1-4) followed by Phase 2 adversarial coverage hardening (Tier 5) | M0, M1, M2, M3, M4 | PLANNED |

## Interface Contracts
### Layer 1 AnatomicalProfile ↔ Layer 3 GarmentDimensions (Bridge via Ease)
```typescript
interface AnatomicalProfile {
  chestCircumference: number;      // mm
  naturalWaistCircumference: number; // mm
  highHipCircumference?: number;   // mm
  sleeveSpan?: number;             // mm
  inseam?: number;                 // mm
  sourceProvenance: SourceProvenance;
}

interface GarmentDimensions {
  pitToPitFlat: number;            // mm (circumference = 2 * pitToPitFlat)
  waistFlat?: number;              // mm
  centerBackLength: number;        // mm
  sleeveLengthCrownToCuff?: number;// mm
  fabricStretchFactor: number;     // 0.0 to 0.3 (0% to 30% elastane expansion)
  sourceProvenance: SourceProvenance;
}

interface FitPreference {
  category: 'tops' | 'bottoms' | 'outerwear' | 'ethnic';
  intent: 'slim' | 'regular' | 'relaxed' | 'oversized';
  customEaseOffsetMm?: number;
}

interface RecommendationResult {
  recommendedSize: string;
  fitScore: number;                // 0.0 to 1.0
  confidenceScore: number;         // 0.0 to 1.0
  isBorderline: boolean;
  borderlineAlternative?: {
    size: string;
    scoreDelta: number;
    tradeoffRationale: string;
  };
  explanationTree: ExplanationTree;
  status: 'recommended' | 'insufficient_data' | 'unsupported_category';
}
```

### Recommendation Engine ↔ UI / Client
```typescript
function recommendSize(
  profile: AnatomicalProfile,
  brandChartOrGarment: {
    sizeChart?: BrandSizeChart;
    garmentDimensions?: Record<string, GarmentDimensions>;
  },
  preference: FitPreference,
  referenceGarments?: ReferenceGarmentCalibration[]
): RecommendationResult;
```

## Code Layout
- `docs/`: All Phase 0 research and architectural specification documents.
- `styles/tokens.css`: Editorial design system tokens and component classes.
- `src/core/`: Deterministic sizing recommendation engine pure logic and mathematical formulas.
- `src/components/ui/`: Accessible UI primitive components adhering to tokens.css and 44px touch targets.
- `src/components/pwa/`: Service worker registration, install prompts, offline indicators.
- `src/components/sizing/`: Explanation tree viewers, fit radar, comparison cards.
- `src/lib/mocks/`: In-memory mock store and seed data for the 8 pilot brands.
- `src/lib/supabase/`: Isomorphic Supabase client and local mock adapter.
- `src/app/`: Next.js App Router pages (`/`, `/onboarding`, `/app`, `/offline`).
- `public/`: Web App manifest, service worker (`sw.js`), icons (`icons/`), offline HTML fallback.
- `tests/unit/`: Vitest unit tests for measurements, ease, sizing engine, and calibration.
- `tests/e2e/`: Opaque-box E2E test suite (Tiers 1-4).
