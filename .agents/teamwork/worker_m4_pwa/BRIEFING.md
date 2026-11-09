# BRIEFING — 2026-11-09T21:46:00Z

## Mission
Implement Phase 1 Progressive Web App Proof of Concept & Local Sandbox (PWA manifest/assets/sw, PWA components, zero-credential mock store/client, App Router landing/onboarding/dashboard/recommendations/offline pages, and API endpoints).

## 🔒 My Identity
- Archetype: worker_m4_pwa
- Roles: implementer, qa
- Working directory: e:\Projects\WearID\.agents\teamwork\worker_m4_pwa\
- Original parent: 6cddc279-aaf6-4945-a9c0-cf8f046d0f14
- Milestone: Requirement 4 - Progressive Web App Proof of Concept & Local Sandbox

## 🔒 Key Constraints
- Never Invent Clothing Measurements or Brand Size Charts (Rule 1)
- Every External Measurement Must Retain Its Source (Rule 2)
- Never Mix Body Measurements with Garment Dimensions (Rule 3)
- All Stored Measurements Must Use Canonical Units (mm, g) (Rule 4)
- Every Recommendation Must Be Explainable with ExplanationTree (Rule 8)
- Write Tests for Every Important Measurement and Sizing Calculation (Rule 10)
- Zero-credential local development sandbox must support 8 pilot brands + benchmarks
- Do NOT modify `src/core/` (owned by sizing engine) or `docs/`
- Exclusively own `public/`, `src/components/pwa/`, `src/lib/mocks/`, `src/lib/supabase/`, `src/app/`, and `tests/integration/`
- All implementations must be genuine, no dummy facade or hardcoded shortcuts

## Current Parent
- Conversation ID: 6cddc279-aaf6-4945-a9c0-cf8f046d0f14
- Updated: 2026-11-09T21:46:00Z

## Task Summary
- **What to build**: Complete PWA stack, local sandbox store/client, Next.js App Router views, API routes, and integration tests.
- **Success criteria**: `npm test` passes (including 391 existing + new tests), `npm run typecheck` passes, `npm run lint` passes, `npm run build` succeeds.
- **Interface contracts**: docs/component-hierarchy.md, docs/api-routes.md, docs/data-flow.md, MASTER_PROMPT.md
- **Code layout**: `public/`, `src/components/pwa/`, `src/lib/mocks/`, `src/lib/supabase/`, `src/app/`, `tests/integration/`

## Change Tracker
- **Files modified**: None yet
- **Build status**: Untested
- **Pending issues**: None

## Quality Status
- **Build/test result**: Untested
- **Lint status**: Untested
- **Tests added/modified**: None yet

## Loaded Skills
- None

## Key Decisions Made
- Will check existing files in workspace to understand what exists and what is missing or needs updates.
- Will inspect core types and engine exports in `src/core/` to ensure full compatibility.

## Artifact Index
- .agents/teamwork/worker_m4_pwa/DISPATCH.md — Assignment from orchestrator
- .agents/teamwork/worker_m4_pwa/BRIEFING.md — Situational awareness
- .agents/teamwork/worker_m4_pwa/progress.md — Liveness heartbeat
