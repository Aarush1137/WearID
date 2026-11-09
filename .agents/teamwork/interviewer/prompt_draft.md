Act as the complete senior product, design, data and engineering team to execute Phase 0 research, design system tokens, database architecture, deterministic sizing engine, and Phase 1 PWA proof of concept as specified in MASTER_PROMPT.md for the FIT Universal Clothing Size Profile.

Working directory: e:\Projects\WearID
Integrity mode: development

## Reference Material
- Master build brief: `MASTER_PROMPT.md`
- Governance and core invariants: `AGENTS.md`
- Verification matrix: `tests.md`
- Architecture and system specs: `architecture.md`, `system.md`, `roadmap.md`
- Repository: `https://github.com/Aarush1137/WearID.git` (branch `main`)

## Requirements

### R1. Phase 0 Research and Architectural Documentation
Produce comprehensive Phase 0 research and architectural documentation in the `docs/` folder per `MASTER_PROMPT.md`, covering competitor analysis (`docs/competitor-analysis.md`), Indian sizing research (`docs/indian-sizing-research.md`), product opportunities (`docs/product-opportunities.md`), brand data access audit for 8 pilot brands (`docs/brand-data-audit.md`), and full architectural specifications (database schema, API route map, component hierarchy, Layer 1-4 data flow, and recommendation engine pseudocode).

### R2. Design System Tokens
Implement the editorial fashion-tech design system tokens in `styles/tokens.css` per `MASTER_PROMPT.md`, covering warm surfaces, ink and muted text, forest green accent, terracotta highlights, confidence indicators, typography scales (DM Sans and DM Serif Display), and component styling definitions for cards, buttons, inputs, tags, and confidence dots.

### R3. Deterministic Sizing Recommendation Engine
Implement the deterministic apparel sizing engine maintaining strict separation across Layer 1 (user body measurements), Layer 2 (brand body-fit charts), Layer 3 (garment physical dimensions laid flat), and Layer 4 (user fit preferences per category). The engine must calculate category-weighted dimensions and ease tolerances, incorporate reference garment calibrations, detect borderline fits, output explainable recommendation trees with rationale, and report insufficient or missing data honestly without estimating or fabricating measurements.

### R4. Phase 1 Progressive Web App Proof of Concept
Build the responsive Progressive Web App with Next.js App Router, configured for standalone installation on mobile (web app manifest, service worker caching, and offline fallback). Implement Supabase database schema with Row Level Security, user authentication, profile management, and size recommendation exploration. Backend services and database persistence must run using local development and mock configurations (local PostgreSQL / Supabase CLI / mocks) without requiring external cloud accounts.

## Verification Resources
- Test specifications and verification matrix in `tests.md`
- Product rules, layer definitions, and recommendation engine rules in `MASTER_PROMPT.md`
- Operational invariants and testing mandates in `AGENTS.md`

## Acceptance Criteria

### Documentation & Architecture
- [ ] `docs/competitor-analysis.md`, `docs/indian-sizing-research.md`, `docs/product-opportunities.md`, and `docs/brand-data-audit.md` exist and cover all sections specified in `MASTER_PROMPT.md`.
- [ ] Database schema DDL is written with table definitions, foreign keys, and Row Level Security policies matching all layers in `MASTER_PROMPT.md`.
- [ ] Architectural route map, component hierarchy, and recommendation engine pseudocode are fully documented.

### Design System
- [ ] `styles/tokens.css` defines all surface, text, accent, semantic, confidence, typography, and border CSS custom properties specified in `MASTER_PROMPT.md`.
- [ ] Component styles for cards, buttons, inputs, badges, and confidence dots adhere to the token specifications.

### Deterministic Sizing Engine
- [ ] Automated unit test suite executes and passes, verifying ease calculations across slim, regular, relaxed, and oversized fits.
- [ ] Sizing engine produces an `ExplanationTree` for every recommendation showing expected ease vs. target ease and dimension deltas.
- [ ] Sizing engine returns `insufficient_data` or low confidence when required measurements are absent, never synthesizing values.
- [ ] Reference garment calibration adjusts sizing scores by up to ±0.15 based on user-validated benchmark garments.
- [ ] Borderline fits (|score₀ - score₁| < 0.08) are explicitly flagged with tradeoff rationales.

### PWA Proof of Concept & Local Environment
- [ ] PWA manifest (`public/manifest.json`) and service worker register successfully and provide standalone mobile display and offline fallback.
- [ ] Application runs locally without requiring active external cloud account credentials, using local/mock services.
- [ ] Interactive UI elements meet the 44px minimum touch target requirement and handle mobile safe-area insets.
