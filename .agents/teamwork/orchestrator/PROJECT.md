# Project: FIT Universal Clothing Size Profile (WearID)

## Architecture
- **Layer 1: User Anatomical Profile**: Biometric body measurements in canonical integer millimeters (`mm`) and mass in grams (`g`). Strictly separated from finished garment measurements.
- **Layer 2: Brand Body-Fit Size Charts**: Manufacturer body-measurement sizing guides (what body size a brand garment is intended to fit).
- **Layer 3: Garment Physical Finished Dimensions**: Finished textile flat measurements in mm (pit-to-pit flat, waist flat, center back length, sleeve span, etc.) multiplied by 2 for circumference.
- **Layer 4: User Fit Preferences**: Category-specific fit intentions (slim, regular, relaxed, oversized) with ease intervals in mm and fabric elasticity modifiers.
- **Deterministic Sizing Engine**: Pure mathematical functions with Gaussian ease scoring, category weighting, reference garment calibration ($\pm 0.15$), borderline detection ($|\Delta| < 0.08$), and structured `ExplanationTree` generation. Zero measurement hallucination.
- **Cross-Device Cloud Sync & Sovereign Privacy**: Bidirectional sync between localStorage and Supabase with offline buffering, and cryptographic zero-biometric sharing tokens (`wearid_tok_...`).
- **Growth & Social Tools**: Brand request voting, bilingual i18n (EN/HI), multi-garment outfit builder, and family size comparison matrix.
- **Advanced AI & Platform Integrations**: Grounded AI fit assistant, Chrome extension scaffold (/extension), return rate predictor, and public REST sizing API.

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
| 28 | Supabase Cloud Sync | Cross-device profile sync between localStorage and Supabase with offline queue and LWW conflict resolution | M6 | ORIGINAL_REQUEST / Cat A |
| 29 | Share Fit Report Link | Read-only share link (/fit/[token] or /app/fit/[token]) with zero raw biometric leakage per Invariant 7 | M6 | ORIGINAL_REQUEST / Cat A |
| 30 | Wishlist & Save for Later | Bookmark catalog products with instant deterministic sizing tags saved to profile | M6 | ORIGINAL_REQUEST / Cat A |
| 31 | Measurement History & Trend Tracker | Date-stamped measurement snapshots over time with landmark delta trends in canonical mm | M6 | ORIGINAL_REQUEST / Cat A |
| 32 | Visual Ease Guide & Fit Photos | Visual silhouette ease representations across slim, regular, relaxed, and oversized fits | M6 | ORIGINAL_REQUEST / Cat A |
| 33 | Brand Request Voting Board | Community upvoting UI for requesting new Indian/international brands with anti-duplicate debounce | M7 | ORIGINAL_REQUEST / Cat B |
| 34 | Multi-Language Support / i18n | Lightweight bilingual dictionary & context provider supporting English and Hindi (हिन्दी) | M7 | ORIGINAL_REQUEST / Cat B |
| 35 | Outfit Builder | Multi-garment builder combining Top + Bottom + Shoes with composite fit scoring and ease harmony | M7 | ORIGINAL_REQUEST / Cat B |
| 36 | Family Comparison Matrix | Side-by-side dashboard comparing sizes across all family profiles with role badges & private export | M7 | ORIGINAL_REQUEST / Cat B |
| 37 | AI Fit Assistant | Conversational fit assistant grounded in deterministic sizing engine with zero hallucination | M8 | ORIGINAL_REQUEST / Cat CD |
| 38 | Chrome Extension Scaffold | Manifest V3 extension bundle under `/extension` with DOM scrapers for Zara, H&M, Uniqlo, Myntra | M8 | ORIGINAL_REQUEST / Cat CD |
| 39 | Return Rate Predictor | Statistical 4-vector return-risk prediction model based on ease delta, borderline status, and fabric | M8 | ORIGINAL_REQUEST / Cat CD |
| 40 | Public REST Sizing API | `/api/v1/sizing/recommend` REST route handler with scoped token auth and strict privacy guarantee | M8 | ORIGINAL_REQUEST / Cat CD |
| 41 | Full Verification & Forensic Audit | Verification across all 13 features: 100% vitest pass, typecheck, lint, Next.js build, and Forensic Audit | M9 | Project Pattern |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M0 | E2E Testing Track | Design E2E test infra, runner, and test cases (Tiers 1-4) deriving from requirements; publish TEST_READY.md | none | DONE |
| M1 | Phase 0 Research & Architecture Docs | Produce `docs/competitor-analysis.md`, `docs/indian-sizing-research.md`, `docs/product-opportunities.md`, `docs/brand-data-audit.md`, DDL & spec docs | none | DONE |
| M2 | Design System Tokens & Primitives | Implement token classes in `styles/tokens.css` and UI primitives in `src/components/ui/` | none | DONE |
| M3 | Deterministic Sizing Recommendation Engine | Implement `src/core/` (types, units, ease, calibration, borderline, explanation, engine) + unit tests | none | DONE |
| M4 | Phase 1 PWA Proof of Concept & Local Dev | Implement PWA manifest, service worker, icons, offline fallback, mock Supabase store, and App Router pages | M2, M3 | DONE |
| M5 | E2E Test Pass & Adversarial Hardening | Pass 100% of E2E tests (Tiers 1-4) followed by Phase 2 adversarial coverage hardening (Tier 5) | M0, M1, M2, M3, M4 | DONE |
| M6 | Category A: High-Impact User Features | Features 28-32: Cloud Sync, Share Link, Wishlist, Measurement History, Visual Ease Guide | M3, M4 | DONE |
| M7 | Category B: Growth, Social & Localization | Features 33-36: Brand Voting, i18n (EN/HI), Outfit Builder, Family Comparison Matrix | M3, M4 | DONE |
| M8 | Category C & D: Advanced AI & Platform | Features 37-40: AI Fit Assistant, Extension Scaffold, Return Rate Predictor, Public REST API | M3, M4 | DONE |
| M9 | Full Suite Integration & Forensic Gate | Feature 41: Full E2E & unit test verification (100% pass), Next.js build, Forensic Integrity Audit | M6, M7, M8 | DONE |

## Interface Contracts
### Category A Contracts (M6)
- `ProfileSyncService`: Bidirectional sync with `syncProfile(profileId, token)`, `getOfflineQueue()`, `drainQueue()`, LWW conflict resolution.
- `ShareFitToken`: Cryptographic zero-knowledge share token (`wearid_tok_...`) embedding recommendation IDs and category results, never biometric measurements (`chestMm`, `waistMm`, etc.).
- `WishlistItem`: `id`, `productId`, `brandId`, `category`, `savedSize`, `fitScore`, `confidenceLabel`, `addedAt`.
- `MeasurementSnapshot`: `id`, `date`, `measurements: AnatomicalProfile`, `note`.
- `SilhouetteEaseGuide`: 4-way visual representation (`slim`: 40-60mm, `regular`: 60-100mm, `relaxed`: 100-140mm, `oversized`: 140-220mm+).

### Category B Contracts (M7)
- `BrandRequestStore`: `requests: BrandRequest[]`, `upvoteBrand(id)`, `requestBrand(name, category, url)`, anti-duplicate debounce.
- `I18nContext`: `locale: 'en' | 'hi'`, `setLocale(locale)`, `t(key, params)`, bilingual dictionary covering sizing & biometrics.
- `OutfitScore`: Top (35%) + Bottom (35%) + Shoes (30%), composite score, bottleneck floor, silhouette ease harmony.
- `FamilyMatrixService`: `generateFamilyMatrix(profiles, benchmarkBrands)`, side-by-side comparison, zero biometric export.

### Category C & D Contracts (M8)
- `FitAssistantEngine`: Natural language intent classifier, zero measurement hallucination grounding, tool-calling to `recommendSize()`.
- `ExtensionScaffold`: MV3 manifest, DOM scraper interfaces for Zara, H&M, Uniqlo, Myntra, overlay sizing pill.
- `ReturnRatePredictor`: 4-vector model: `predictedReturnRate: number` (0-100%), `riskLevel: 'low' | 'moderate' | 'high'`, `drivers: string[]`.
- `PublicSizingAPI`: `POST /api/v1/sizing/recommend`, Bearer/Token auth, canonical mm input validation, zero biometric leakage in response.

## Code Layout
- `src/core/sync/`: Cloud synchronization and offline mutation queue.
- `src/core/assistant/`: Grounded AI Fit Assistant engine and tool dispatchers.
- `src/core/i18n/`: Bilingual translation dictionary and context provider.
- `src/core/sizing/`: Sizing engine, calibration, borderline, return rate predictor, outfit scoring, family matrix.
- `src/core/state/`: Zustand stores for profiles, brand requests, outfits.
- `src/components/brands/`: Brand request voting UI.
- `src/components/outfit/`: Outfit builder and composite score card.
- `src/components/family/`: Family size comparison matrix.
- `src/components/assistant/`: AI Fit Assistant chat UI.
- `src/components/visual/`: Visual ease guide and silhouette overlays.
- `src/app/api/v1/`: Public REST Sizing API, share token API, portability API.
- `extension/`: Chrome Manifest V3 extension bundle.
- `tests/unit/`: Vitest unit tests for all features.
