# Category A: High-Impact User Features — Technical Survey & Architectural Reconnaissance

**Target Milestone**: Category A (Features 1 to 5)  
**Author**: `explorer_cat_a` (Teamwork Explorer)  
**Date**: 2026-11-22  
**Status**: Comprehensive Technical Survey Complete  

---

## 1. Executive Summary & Governance Compliance

This survey provides the architectural blueprint, data contracts, and integration plan for implementing Category A (Features 1 through 5) of the WearID roadmap.

### Scope of Category A Features:
1. **Supabase Cloud Sync (Cross-Device Profiles)**: Seamless bidirectional synchronization of `useProfileStore` (localStorage) with Supabase database tables (`users`, `profiles`, `body_measurements`, `fit_preferences`, `reference_garments`) with offline fallback and conflict resolution.
2. **Share a Fit Report Link**: Secure, time-bound, read-only shareable links (`/fit/[token]` or `/app/fit/[token]`) providing deterministic sizing recommendations across clothing categories without exposing raw biometrics.
3. **Wishlist & Save for Later**: Bookmark products from the verified brand catalog with instant deterministic sizing tags saved to the active user profile.
4. **Measurement History & Trend Tracker**: Date-stamped append-only measurement snapshots over time, computing trend deltas while strictly preserving canonical millimeters (`mm`).
5. **Visual Ease Guide & Fit Photos**: An interactive visual guide illustrating what ease deltas look like across the 4 primary silhouettes (*slim*, *regular*, *relaxed*, *oversized*), grounded in Savile Row design tokens and SVG drape visuals.

### Invariants Adherence Matrix (AGENTS.md):
| Invariant | Application in Category A | Compliance Mechanism |
|---|---|---|
| **Invariant 1: Never Invent Clothing Measurements** | Features 3 & 5 | Recommendations use only verified catalog specs (`PILOT_PRODUCTS`) and brand charts. If data is absent, flag `size_chart_unavailable`. |
| **Invariant 2: Retain Measurement Provenance** | Features 1 & 4 | Measurement history snapshots must record `source` (`physical_tape`, `calibrated_garment`, `tailor`) and `recordedAt` timestamps. |
| **Invariant 3: Never Mix Body vs Garment** | Features 4 & 5 | Body snapshots store `chestMm`, `waistMm`, etc. Garment flat specs store `chestFlatMm`, `waistFlatMm`. Bridges specify explicit `easeDeltaMm`. |
| **Invariant 4: Canonical Units (mm / g)** | Features 1, 3, 4, 5 | All stored dimensions in state and database are non-negative integer millimeters (`mm`). Imperial/metric conversions occur only in presentation formatters. |
| **Invariant 7: Keep Profiles Private by Default** | Feature 2 | Public share tokens (`/fit/[token]`) share ONLY deterministic sizes and ease summaries. ZERO raw biometric dimensions (`chestMm`, `waistMm`, etc.) are transmitted. |
| **Invariant 8: Explainable Recommendations** | Features 2, 3, 5 | Every recommendation tag includes target ease, fabric tension notes, and silhouette rationale. |
| **Invariant 10: Automated Test Coverage** | All Features | Vitest unit tests in `tests/unit/` covering state, calculations, offline queues, and privacy assertions. |

---

## 2. Feature 1: Supabase Cloud Sync (Cross-Device Profiles)

### 2.1 Existing Codebase Baseline & Integration Points
- **Supabase Client Factory** (`src/lib/supabase/client.ts`):
  - Uses `createClient()` which automatically falls back to `createMockSupabaseClient()` when `NEXT_PUBLIC_USE_LOCAL_MOCKS === "true"` or Supabase credentials are missing.
  - Ensures 100% offline and zero-credential testability.
- **Mock Client** (`src/lib/supabase/mock-client.ts`):
  - `MockQueryBuilder` supports `.select()`, `.insert()`, `.update()`, `.delete()`, `.eq()`, `.neq()`, `.in()`, `.order()`, `.limit()`, `.single()`, `.maybeSingle()`.
  - Currently handles `profiles`, `measurements`, `preferences`, `reference_garments`.
  - Needs slight enhancement to handle table names defined in `docs/database-schema.sql` (`body_measurements`, `fit_preferences`, `users`, `upsert` semantics).
- **Zustand Local Storage** (`src/core/state/profileStore.ts`):
  - Uses `persist` middleware storing `wearid-profile-storage-v2` in browser `localStorage`.
  - Holds `profiles: UserProfile[]`, `activeProfileId`, `displayUnit`.
  - Currently disconnected from network; profile modifications only update local memory and localStorage.
- **Authentication Store** (`src/lib/auth/authStore.ts`):
  - Manages session lifecycle (`user: AuthUser | null`, `isAuthenticated: boolean`).
  - Listens to Supabase `onAuthStateChange` and supports Firebase Phone OTP, Google OAuth, Email OTP, and `signInWithTestAccount`.
  - Currently does not trigger profile sync on login.
- **Master Database Schema** (`docs/database-schema.sql`):
  - Defines `users`, `profiles`, `body_measurements`, `fit_preferences`, `reference_garments` with full Row-Level Security (RLS) policies requiring `auth.uid() = user_id`.

### 2.2 Synchronization Architecture & Conflict Resolution
```
   [ User Action / Auth Event ]
                │
                ▼
      ┌──────────────────┐
      │ useProfileSync   │
      └─────────┬────────┘
                │
        Online? ├─────────────── No ──────────────┐
                │ Yes                             ▼
                ▼                       ┌───────────────────┐
     ┌──────────────────────┐           │ OfflineSyncQueue  │
     │ Fetch Remote Profile │           │ (Local Storage)   │
     └──────────┬───────────┘           └─────────┬─────────┘
                │                                 │
     Conflict Resolution                          │ (On 'online' event)
     (Timestamp LWW / Merge)                      │
                │                                 ▼
                ├─ Remote is newer ──> Update useProfileStore
                │
                └─ Local is newer ───> Push upsert to Supabase
```

1. **Trigger Points**:
   - **On Sign-In**: When `isAuthenticated` flips to `true`, initiate automatic initial sync.
   - **On Local Profile Mutation**: Debounced (1500ms) sync of dirty profile state to Supabase.
   - **On Network Reconnect**: `window.addEventListener('online')` triggers queue drainage.
   - **Manual Sync**: User clicks "Sync Now" in `/app/profile`.

2. **Conflict Resolution Strategy**:
   - **Initial Account Link**: If remote Supabase user has 0 profiles and local has customized profiles, bulk upsert local profiles with `user_id = auth.uid()`.
   - **Cloud First**: If remote has profiles and local is pristine (`DEFAULT_PROFILE_ID` with default name), replace local with remote profiles.
   - **Bi-directional Merge (Last-Write-Wins)**:
     - Compare `updatedAt` (local ISO timestamp) vs `updated_at` (remote TIMESTAMPTZ).
     - Newer timestamp wins per profile entity.
     - Sub-entities (`fit_preferences`, `reference_garments`) merge by key/ID.

3. **Graceful Offline Fallback & Sync Queue**:
   - When offline (`navigator.onLine === false`) or when network request fails, enqueue a `SyncQueueItem` in localStorage (`wearid_sync_queue`).
   - UI reflects: `SyncState: "synced" | "syncing" | "offline_pending" | "error"`.
   - Draining: On reconnect, dequeue items in FIFO order and commit to Supabase.

### 2.3 Exact TypeScript Interfaces & DTOs
```typescript
// src/core/sync/syncTypes.ts

export type SyncStatus = "idle" | "syncing" | "synced" | "offline" | "error";

export interface SyncQueueItem {
  id: string;
  profileId: string;
  entityType: "profile" | "measurements" | "preference" | "reference_garment";
  action: "upsert" | "delete";
  payload: any;
  timestamp: string; // ISO 8601
  retryCount: number;
}

export interface ProfileSyncResult {
  success: boolean;
  syncedProfileCount: number;
  conflictsResolved: number;
  queuedOfflineCount: number;
  lastSyncedAt: string;
  error?: string;
}

export interface RemoteProfileDTO {
  id: string;
  user_id: string;
  name: string;
  gender: "male" | "female" | "unisex";
  relationship: string;
  is_primary: boolean;
  updated_at: string;
  created_at: string;
  body_measurements?: Array<{
    id: string;
    recorded_at: string;
    is_current: boolean;
    chest_mm: number;
    waist_mm?: number;
    hips_mm?: number;
    shoulder_width_mm?: number;
    height_mm?: number;
    inseam_mm?: number;
    neck_mm?: number;
    foot_length_mm?: number;
    measurement_method?: Record<string, string>;
  }>;
  fit_preferences?: Array<{
    category: string;
    fit_type: "slim" | "regular" | "relaxed" | "oversized";
  }>;
  reference_garments?: Array<{
    id: string;
    brand_name_raw: string;
    category: string;
    size_label: string;
    fit_quality: string;
    chest_flat_mm?: number;
    notes?: string;
  }>;
}
```

---

## 3. Feature 2: Share a Fit Report Link

### 3.1 Existing Codebase Baseline
- `src/core/security/sizingTokenService.ts`:
  - Contains `SizingTokenService` which generates cryptographic tokens (`wearid_tok_...`).
  - Contains `evaluateRetailerMatch()` with strict runtime assertion (`CRITICAL BIOMETRIC PRIVACY LEAK`) preventing `chestMm`, `waistMm`, `hipsMm`, etc. from appearing in the output payload.
- `src/connect/clientSdk.ts`:
  - Demonstrates client-side zero-knowledge sizing recommendation presentation.
- `src/app/api/v1/portability/recommend/route.ts`:
  - Validates sizing tokens and responds with zero-knowledge fit data.

### 3.2 Invariant 7 Enforcement & Architecture
- **Zero Raw Biometric Leakage**:
  - The shared fit report MUST NEVER contain biometric human dimensions (`chestMm`, `waistMm`, `hipsMm`, `heightMm`, `weightG`, `shoulderWidthMm`, `inseamMm`, etc.).
  - The public report shares ONLY:
    1. Member display name (e.g., "Aarush's Size Passport").
    2. Gender/Morphology (e.g., "Men's / Unisex").
    3. Fit silhouette preference (e.g., "Relaxed Fit").
    4. Deterministic recommended sizes across standard apparel categories (T-Shirts: M, Casual Shirts: L, Chinos: 32x32, Formal: 40).
    5. Ease and sensation description (e.g., "Prefers +80mm breathing ease over chest; clean shoulder alignment").
    6. Expiration timestamp.
- **Route Architecture**:
  - Generator action: In `/app/tailor` or `/app/profile`, user clicks "Share Fit Report".
  - Link format: `/fit/[token]` or `/app/fit/[token]`.
  - Public route handler: `src/app/fit/[token]/page.tsx` (accessible without authentication).
  - Backend validation endpoint: `src/app/api/fit/share/[token]/route.ts`.

### 3.3 Exact TypeScript Interfaces & DTOs
```typescript
// src/core/security/fitShareTypes.ts

export interface CategoryFitSummary {
  category: string;
  categoryLabel: string;
  recommendedSize: string;
  alternativeSize?: string;
  fitConfidence: "high" | "medium" | "low";
  fitScorePct: number;
  targetEaseMm: number;
  easeDescription: string; // e.g. "+80mm breathing room (2 fingers ease)"
  testedGarments: Array<{
    brandName: string;
    garmentName: string;
    size: string;
  }>;
}

export interface PublicFitReportDTO {
  token: string;
  title: string;
  profileName: string;
  gender: "male" | "female" | "unisex";
  preferredSilhouette: "slim" | "regular" | "relaxed" | "oversized";
  createdAt: string;
  expiresAt: string;
  categories: CategoryFitSummary[];
  privacyVerified: true;
  // STRICT INVARIANT ASSERTION: No raw biometric fields allowed
}
```

---

## 4. Feature 3: Wishlist & Save for Later

### 4.1 Existing Codebase Baseline
- **Verified Product Catalog** (`src/core/data/pilotBrands.ts` & `src/lib/mocks/mock-store.ts`):
  - 14+ verified garments with Layer 3 flat measurements and Layer 2 body charts.
- **Product Catalog View** (`src/components/explore/ProductCatalogView.tsx`):
  - Renders product cards with brand, name, price, fabric, and "Match My Fit" action.
  - Currently lacks a bookmark/wishlist button.
- **Profile Store** (`src/core/state/profileStore.ts`):
  - Holds `UserProfile` records.
  - Adding `wishlist: WishlistItem[]` to `UserProfile` ensures each family member has an isolated wishlist that automatically synchronizes to cloud storage.

### 4.2 Architecture & Instant Sizing Tag Engine
1. **Instant Sizing Evaluation**:
   - When a user clicks the bookmark icon on any product in `ProductCatalogView.tsx`:
   - System invokes `evaluateSizeRecommendation` passing the active profile's anatomical profile and preferences.
   - Computes:
     - `recommendedSize`: e.g. `"M"` or `"32x32"`.
     - `fitScore`: e.g. `0.95` (95% fit).
     - `confidenceLabel`: `"high" | "medium" | "low"`.
   - Stores the product metadata along with the computed sizing tag in `profile.wishlist`.
2. **Dynamic Recalibration**:
   - If user updates measurements, wishlist items dynamically re-evaluate or display calibrated size.
3. **UI / Presentation**:
   - **Product Card Heart / Bookmark Icon**: Instant toggle state with active bookmark indicator.
   - **Sizing Tag Badge**: `<Badge variant="accent">Your Size: M (95% Fit)</Badge>`.
   - **Dedicated Wishlist View**: `/app/wishlist` (or tab in `/app/wardrobe`), showing saved items, active size badges, direct brand store link, and one-click remove.

### 4.3 Exact TypeScript Interfaces & DTOs
```typescript
// src/core/types.ts (or src/core/state/profileStore.ts)

export interface WishlistItem {
  id: string; // bookmark UUID
  productId: string;
  brandId: string;
  brandName: string;
  productName: string;
  category: string;
  priceInr: number;
  imageUrl?: string;
  savedSize: string; // e.g. "M"
  fitScore: number;  // 0.0 - 1.0
  confidenceLabel: "high" | "medium" | "low" | "insufficient";
  fitSilhouette: "slim" | "regular" | "relaxed" | "oversized";
  notes?: string;
  savedAt: string; // ISO 8601
}
```

---

## 5. Feature 4: Measurement History & Trend Tracker

### 5.1 Existing Codebase Baseline
- **Database Schema** (`docs/database-schema.sql`):
  - `body_measurements` table is already architected as an append-only time-series ledger:
    `id`, `profile_id`, `recorded_at`, `is_current`, `chest_mm`, `waist_mm`, `hips_mm`, `shoulder_width_mm`, `height_mm`, `inseam_mm`, `weight_g`, `measurement_method`.
- **Profile Store** (`src/core/state/profileStore.ts`):
  - Currently stores only the single latest `measurements: AnatomicalProfile`.
  - Adding `measurementHistory: MeasurementSnapshot[]` allows full retrospective tracking.

### 5.2 Canonical Units & Trend Delta Calculation Engine
- **Invariant 4 Enforcement**:
  - All snapshots store dimensions strictly in non-negative integer millimeters (`mm`) and weight in grams (`g`).
  - Presentation formatting uses `formatMeasurement(valMm, displayUnit)` to display `+1.0 cm` or `+0.4 in`.
- **Trend Delta Algorithm**:
  - Given an array of date-sorted snapshots:
  - Calculate `deltaMm = latestMm - previousMm` and `totalDeltaMm = latestMm - baselineMm`.
  - Classify direction:
    - `deltaMm > 5`: `"increasing"`
    - `deltaMm < -5`: `"decreasing"`
    - `Math.abs(deltaMm) <= 5`: `"stable"`
  - Support multi-landmark comparison (Chest, Waist, Hips, Shoulders, Inseam).

### 5.3 Exact TypeScript Interfaces & DTOs
```typescript
// src/core/measurements/trendTypes.ts

export interface MeasurementSnapshot {
  id: string;
  profileId: string;
  recordedAt: string; // ISO 8601
  source: "physical_tape" | "calibrated_garment" | "tailor" | "manual";
  notes?: string;
  measurements: {
    chestMm: number;
    waistMm?: number;
    hipsMm?: number;
    shoulderWidthMm?: number;
    heightMm?: number;
    inseamMm?: number;
    neckMm?: number;
    weightG?: number;
  };
}

export interface LandmarkTrend {
  landmark: "chestMm" | "waistMm" | "hipsMm" | "shoulderWidthMm" | "heightMm" | "inseamMm";
  landmarkLabel: string;
  baselineMm: number;
  latestMm: number;
  netDeltaMm: number; // e.g. +10 or -5
  percentageChange: number;
  direction: "increasing" | "decreasing" | "stable";
  historyPoints: Array<{
    date: string;
    valueMm: number;
    deltaFromPrevMm: number;
  }>;
}

export interface ProfileMeasurementTrends {
  profileId: string;
  totalSnapshots: number;
  dateRange: { start: string; end: string };
  trends: Record<string, LandmarkTrend>;
}
```

### 5.4 UI Specifications
- Component: `src/components/measure/MeasurementTrendTracker.tsx`.
- Visual Features:
  - Interactive landmark selector tabs (Chest, Waist, Hips, Shoulders).
  - SVG sparkline and delta visualization showing change over time.
  - Net change chip (e.g. `+10mm / +1.0cm` in Savile Row green or camel).
  - History log table with date, measurement method badge, values, and note.

---

## 6. Feature 5: Visual Ease Guide & Fit Photos

### 6.1 Existing Codebase Baseline
- **Design Tokens** (`src/styles/tokens.css`):
  - Savile Row Sartorial palette: `--bg-base (#FAF8F5)`, `--bg-surface (#FFFFFF)`, `--accent (#1B2A4A)`, `--terracotta (#A47834)`, `--success (#1D5D42)`.
  - Micro-animations: `animate-pulse-subtle`, `animate-halo-glow`.
- **Existing Visual Components**:
  - `src/components/visual/BodySilhouetteCanvas.tsx`: SVG mannequin scaling with proportional chest, waist, and hip width factors.
  - `src/components/visual/GarmentDrapeOverlay.tsx`: Superimposes user body contour with garment outline, showing ease halo.
  - `src/core/sizing/easeEngine.ts`: Category weights and ease targets.

### 6.2 Silhouette Ease Matrix
| Silhouette | Target Chest Ease Range | Sensation / Visual Drape | Fabric Interaction |
|---|---|---|---|
| **Slim Fit** | `+40mm` to `+60mm` | Close contact with chest/torso; zero excess fabric billowing; sleek modern profile. | Requires 2-4% elastane or flexible knit to prevent tightness. |
| **Regular Fit** | `+60mm` to `+100mm` | Classic tailored comfort; ~2 fingers breathing room on each side; moves naturally. | Standard for 100% rigid cotton or linen. |
| **Relaxed Fit** | `+100mm` to `+140mm` | Draped casual silhouette; subtle drop shoulder; fabric floats freely over midsection. | Drapes cleanly in medium-to-heavy cotton jersey. |
| **Oversized Fit** | `+140mm` to `+220mm+` | Boxy streetwear silhouette; exaggerated drop shoulder; wide sleeve opening. | Heavyweight 240+ GSM combed cotton prevents collapse. |

### 6.3 Exact TypeScript Interfaces & Component Architecture
```typescript
// src/components/visual/VisualEaseGuide.tsx

export interface SilhouetteGuideItem {
  id: "slim" | "regular" | "relaxed" | "oversized";
  name: string;
  tagline: string;
  chestEaseRangeMm: { min: number; max: number };
  waistEaseRangeMm: { min: number; max: number };
  dropShoulderMm: number;
  fitFeelDescription: string;
  fabricRecommendation: string;
  svgSilhouettePath: string;
}

export interface VisualEaseGuideProps {
  currentFitIntent?: "slim" | "regular" | "relaxed" | "oversized";
  userChestMm?: number;
  displayUnit: "cm" | "in";
  onSelectSilhouette?: (silhouette: "slim" | "regular" | "relaxed" | "oversized") => void;
  interactive?: boolean;
}
```

---

## 7. Proposed Files to Create & Modify (Write Boundaries)

### 7.1 New Files to Create:
| File Path | Purpose |
|---|---|
| `src/core/sync/profileSyncService.ts` | Bidirectional sync engine, conflict resolution, offline queue. |
| `src/core/sync/syncTypes.ts` | Type definitions for sync, DTOs, and sync queue. |
| `src/core/security/fitShareTypes.ts` | Data models and token payload types for read-only shareable fit reports. |
| `src/core/security/fitShareService.ts` | Secure token generation, zero-biometric validation, and report resolution. |
| `src/app/api/fit/share/generate/route.ts` | API route to create time-bound share tokens. |
| `src/app/api/fit/share/[token]/route.ts` | Public API route returning zero-knowledge fit report. |
| `src/app/fit/[token]/page.tsx` | Clean, public, responsive read-only fit report view with QR code. |
| `src/components/catalog/WishlistButton.tsx` | Reusable bookmark button for product cards with instant state toggle. |
| `src/app/app/wishlist/page.tsx` | Dedicated user wishlist page with sizing tags, filters, and actions. |
| `src/components/measure/MeasurementTrendTracker.tsx` | Date-stamped timeline, trend calculation, and SVG delta graph. |
| `src/core/measurements/trendCalculation.ts` | Canonical mm trend calculation engine (deltas, rates, directions). |
| `src/components/visual/VisualEaseGuide.tsx` | Interactive 4-silhouette ease delta comparator with SVG drape visuals. |

### 7.2 Existing Files to Modify (Surgical Edits):
| File Path | Modifications Needed |
|---|---|
| `src/core/state/profileStore.ts` | Add `wishlist: WishlistItem[]` and `measurementHistory: MeasurementSnapshot[]` to `UserProfile`. Add actions: `addToWishlist`, `removeFromWishlist`, `addMeasurementSnapshot`, `applyRemoteSync`. |
| `src/components/explore/ProductCatalogView.tsx` | Mount `WishlistButton` on product cards and display instantaneous "Your Size: X" tag badges. |
| `src/app/app/profile/page.tsx` | Add Cloud Sync Status indicator & "Sync Now" button; mount Measurement History link. |
| `src/lib/supabase/mock-client.ts` | Add support for `body_measurements`, `fit_preferences`, and `fit_share_tokens` in `MockQueryBuilder`. |
| `src/components/recommend/RecommendationView.tsx` | Mount `VisualEaseGuide` component in fit breakdown for contextual silhouette education. |

---

## 8. Automated Testing Strategy & Verification Matrix

### 8.1 Unit Tests (`tests/unit/`)
1. **`tests/unit/sync/profileSync.test.ts`**:
   - Tests initial local-to-cloud migration.
   - Tests cloud-to-local pull when local is pristine.
   - Tests conflict resolution: Last-Write-Wins based on ISO timestamps.
   - Tests offline sync queue: items are enqueued when offline and replayed when online.
   - Tests mock Supabase client compatibility.
2. **`tests/unit/share/fitShareToken.test.ts`**:
   - Tests generation of cryptographic share tokens.
   - **MANDATORY INVARIANT 7 ASSERTION (TC-SEC-002)**: Verify that resolving a share report NEVER returns raw biometric keys (`chestMm`, `waistMm`, `hipsMm`, `inseamMm`, `shoulderWidthMm`, `heightMm`, `weightG`).
   - Tests token expiration logic (expired tokens return 401/error).
3. **`tests/unit/wishlist/wishlistStore.test.ts`**:
   - Tests adding products to wishlist with deterministic size tag calculation.
   - Tests removing items from wishlist.
   - Tests multi-profile wishlist isolation (Partner vs Self wishlist).
4. **`tests/unit/measurements/trendTracker.test.ts`**:
   - Tests chronological sorting of measurement snapshots.
   - Tests net delta calculations (e.g. 980mm -> 990mm yields `+10mm`).
   - Tests canonical unit preservation (all calculations strictly in integer mm).
   - Tests direction categorization (`increasing`, `decreasing`, `stable`).
5. **`tests/unit/visual/visualEaseGuide.test.tsx`**:
   - Tests rendering of 4 silhouettes (Slim, Regular, Relaxed, Oversized).
   - Tests ease delta target ranges and unit format display.
   - Tests user interaction and silhouette selection callback.

### 8.2 Build & Baseline Verification Commands
- Unit Tests: `npm test` (`vitest run`)
- Type Checking: `npm run type-check` or `npx tsc --noEmit`
- Linting: `npm run lint`
- Production Build: `npm run build`
