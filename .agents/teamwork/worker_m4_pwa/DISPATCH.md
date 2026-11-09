## 2026-11-09T21:45:32Z

You are worker_m4_pwa, a teamwork_worker subagent.

## Working Directory
Your working directory is: `e:\Projects\WearID\.agents\teamwork\worker_m4_pwa\`
Create your BRIEFING.md and progress.md in your working directory. Write all metadata and handoff there.

## Mandatory User Request Reference
You MUST read the authoritative request at:
`e:\Projects\WearID\.agents\teamwork\ORIGINAL_REQUEST.md`

## Reference Specifications
- `e:\Projects\WearID\.agents\teamwork\explorer_survey_2\handoff.md`
- `e:\Projects\WearID\.agents\teamwork\orchestrator\PROJECT.md`
- `e:\Projects\WearID\docs\component-hierarchy.md`
- `e:\Projects\WearID\docs\api-routes.md`
- `e:\Projects\WearID\docs\data-flow.md`
- `e:\Projects\WearID\MASTER_PROMPT.md`
- `e:\Projects\WearID\AGENTS.md`
- `e:\Projects\WearID\TEST_READY.md`

## MANDATORY INTEGRITY WARNING
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

## Write Ownership
You EXCLUSIVELY own:
- Files in `public/` (`public/manifest.json`, `public/sw.js`, `public/offline.html`, `public/icons/`)
- Files in `src/components/pwa/` (`ServiceWorkerRegister.tsx`, `OfflineBanner.tsx`, `InstallPrompt.tsx`)
- Files in `src/lib/mocks/` (`mock-store.ts`)
- Files in `src/lib/supabase/` (`mock-client.ts`, `client.ts`)
- Files in `src/app/` (`layout.tsx`, `page.tsx`, `offline/page.tsx`, `onboarding/page.tsx`, `app/page.tsx`, `app/recommendations/page.tsx`, `api/`)
- Associated integration tests in `tests/integration/`.

Do NOT modify `src/core/` (owned by sizing engine) or `docs/`.

## Your Task: Implement Phase 1 Progressive Web App Proof of Concept & Local Sandbox (Requirement 4)
1. **PWA Manifest & Assets (`public/`)**:
   - `public/manifest.json`: Web App Manifest with `display: "standalone"`, `orientation: "portrait-primary"`, `theme_color: "#425B48"`, `background_color: "#F5F3ED"`, referencing `/icons/icon-192.png`, `/icons/icon-512.png`, `/icons/icon-512-maskable.png`, `/icons/apple-touch-icon.png`.
   - `public/icons/`: Generate valid PNG brand icons (192x192, 512x512, 512x512 maskable, apple-touch-icon 180x180).
   - `public/sw.js`: Service worker implementing:
     * Cache-first strategy for static assets (`/_next/static/`, `/icons/`, `/fonts/`).
     * Network-first strategy for `/api/` with offline cache fallback.
     * Offline fallback response returning `public/offline.html` when network navigation fails.
   - `public/offline.html`: Clean, standalone HTML fallback page styled with WearID design tokens.
2. **PWA Registration & Client Components (`src/components/pwa/`)**:
   - `ServiceWorkerRegister.tsx`: Client component that registers `/sw.js` on mount and handles update lifecycle.
   - Include `ServiceWorkerRegister` in `src/app/layout.tsx`.
   - Ensure viewport meta includes `viewportFit: "cover"` and safe-area insets (`.pt-safe`, `.pb-safe`).
3. **Zero-Credential Local Development Sandbox (`src/lib/`)**:
   - `src/lib/mocks/mock-store.ts`: In-memory store pre-seeded with:
     * 8 pilot brands (Westside, FabIndia, Raymond, Snitch, Roadster/Myntra, H&M India, Marks & Spencer India, Zara India, plus Uniqlo and Levi's benchmarks).
     * Layer 2 brand body-fit size charts.
     * Layer 3 Men's T-Shirt finished flat dimensions (pit-to-pit flat, center back length, shoulder span, etc.) in canonical mm.
     * Verified reference garments for calibration.
     * Mock user and anatomical profile.
   - `src/lib/supabase/mock-client.ts`: Isomorphic Supabase client mock implementing query builders (`.from(...).select(...).eq(...)`), auth methods (`auth.getUser()`, `auth.signInWithPassword()`, `auth.signUp()`), and RLS simulation.
   - `src/lib/supabase/client.ts`: Isomorphic factory returning either real Supabase or local mock client based on environment (`NEXT_PUBLIC_USE_LOCAL_MOCKS=true` or missing credentials).
4. **App Router Pages & Views (`src/app/`)**:
   - `src/app/page.tsx`: Landing page showcasing "Universal Clothing Size Profile" value proposition, editorial design tokens, and quick CTA buttons (>= 44px).
   - `src/app/onboarding/page.tsx`: 3-path onboarding wizard:
     * Path A: Quick (<2 min, height, weight, standard size).
     * Path B: From Garment (laid-flat benchmark anchor).
     * Path C: Full Measurement (tape guide for chest, waist, shoulder, inseam in canonical mm).
   - `src/app/app/page.tsx`: Authenticated PWA Dashboard displaying user's AnatomicalProfile, active fit preferences, and saved profiles.
   - `src/app/app/recommendations/page.tsx`: Recommendation Explorer: allows selecting any of the 8 pilot brands and SKUs, calculates deterministic sizing recommendation via `src/core/engine.ts`, displays fit score, confidence dot, borderline tradeoff tags, and interactive `ExplanationTree` viewer.
   - `src/app/offline/page.tsx`: App Router offline fallback view.
5. **API Endpoints (`src/app/api/`)**:
   - Next.js App Router route handlers implementing key endpoints from `docs/api-routes.md`:
     * `GET /api/v1/brands`: Returns 8 pilot brands with provenance metadata.
     * `GET /api/v1/products`: Returns pilot brand products with Layer 2 and Layer 3 specs.
     * `POST /api/v1/sizing/match`: Evaluates body profile vs garment dimensions or brand charts using `src/core/engine.ts`, returns `RecommendationResult` with `ExplanationTree`.
6. **Verification**:
   - Run `npm test` to ensure all tests pass (including existing 391 tests).
   - Run `npm run typecheck` to verify 0 TypeScript errors.
   - Run `npm run lint` to verify 0 ESLint warnings.
   - Run `npm run build` to verify `next build` builds all App Router pages successfully.

## Deliverable
Write your completion handoff report to:
`e:\Projects\WearID\.agents\teamwork\worker_m4_pwa\handoff.md`
Report your status and file paths back to orchestrator (conversation ID: 6cddc279-aaf6-4945-a9c0-cf8f046d0f14) via send_message.
