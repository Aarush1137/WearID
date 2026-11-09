Act as the complete senior product, design, data and engineering team to execute Phase 0 research, design system tokens, database architecture, deterministic sizing engine, and Phase 1 PWA proof of concept as specified in MASTER_PROMPT.md for the FIT Universal Clothing Size Profile.

Working directory: e:\Projects\WearID
Integrity mode: [OPEN: Which restrictions should apply to the team's implementation?]

Reference material: MASTER_PROMPT.md

## Requirements

### R1. Phase 0 Research and Architectural Documentation
Produce comprehensive Phase 0 research and architectural documentation in the `docs/` folder, covering competitor analysis (`docs/competitor-analysis.md`), Indian sizing research (`docs/indian-sizing-research.md`), product opportunities (`docs/product-opportunities.md`), brand data access audit for 8 pilot brands (`docs/brand-data-audit.md`), and complete architectural specifications (database schema, API route map, component hierarchy, data flow, and deterministic recommendation pseudocode).

### R2. Design System and Visual Tokens
Implement the editorial fashion-tech design system tokens in `styles/tokens.css`, including surface colors, text hierarchy, forest green accents, terracotta highlights, confidence indicators, typography scales (DM Sans and DM Serif Display), and component specifications.

### R3. Deterministic Clothing Sizing Recommendation Engine
Implement the deterministic apparel sizing engine enforcing strict separation between Layer 1 (user body measurements), Layer 2 (brand body-fit charts), Layer 3 (garment physical dimensions), and Layer 4 (user fit preferences), supporting ease calculations, category weights, reference garment calibration, borderline detection, and explainable recommendation trees without hallucinating measurements.

### R4. Phase 1 Progressive Web App Proof of Concept
Deliver the Phase 1 responsive Progressive Web App built with Next.js App Router, featuring standalone PWA installation (manifest, service worker with offline fallback), Supabase schema with Row Level Security, onboarding, profile management, and size recommendation exploration.
[OPEN: Scope confirmation: execute Phase 0 and Phase 1 together, or Phase 0 first?]
[OPEN: Environment setup: local/mock services vs live Supabase/external cloud?]

## Acceptance Criteria

### Research and Documentation
- [ ] Research documents exist in `docs/`: `competitor-analysis.md`, `indian-sizing-research.md`, `product-opportunities.md`, and `brand-data-audit.md`.
- [ ] Architectural documentation includes complete database schema with RLS policies, API route map, and recommendation engine logic.

### Design System
- [ ] `styles/tokens.css` defines all color variables, typography scales, shadows, and component classes per `MASTER_PROMPT.md`.
- [ ] Design tokens pass CSS validation and match the editorial fashion-tech palette specifications.

### Sizing Engine & Verification
- [ ] Sizing engine strictly separates Layers 1 to 4 and produces deterministic recommendations with explainable ease calculation trees.
- [ ] Sizing engine flags missing or insufficient data honestly and never synthesizes or estimates missing dimensions.
- [ ] Automated unit test suite verifies calculations, ease tolerances, edge cases, and confidence thresholds.
- [ ] [OPEN: Are there specific external test suites or reference datasets to verify against?]

### PWA Proof of Concept
- [ ] PWA manifest (`public/manifest.json`) and service worker configure standalone display, offline fallback, and asset caching.
- [ ] Mobile UX adheres to minimum 44px tap targets and safe area insets without layout shifts.
