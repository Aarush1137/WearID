# Category B: Growth, Social & Localization — Technical Survey & Architecture Report

**Agent**: `explorer_cat_b` (Teamwork Explorer)  
**Date**: 2026-11-22  
**Working Directory**: `e:\Projects\WearID\.agents\teamwork\explorer_cat_b`  
**Target Milestone**: Category B (Features 6, 7, 8, 9)  

---

## Executive Summary

This report establishes the complete technical survey, architectural blueprint, TypeScript interfaces, and testing matrix for **Category B: Growth, Social & Localization** of the WearID platform.

The four features surveyed are:
1. **Feature 6: Brand Request Voting Board** — Community upvoting board for unmapped / emerging brands with anti-duplicate debounce and catalog deduplication.
2. **Feature 7: Multi-Language Support / i18n (English & Hindi)** — Lightweight zero-bloat dictionary & context provider supporting apparel and sizing terminology in English and Hindi (हिन्दी).
3. **Feature 8: Outfit Builder** — Multi-category ensemble generator combining Top + Bottom + Shoes with deterministic ease harmonization and unified fit scoring.
4. **Feature 9: Family Multi-Profile Comparison Matrix** — High-utility side-by-side family sizing dashboard with role badges, 1-click active profile switching, and privacy-preserving size cheat sheet exports.

---

## 1. Existing Codebase Baseline & Integration Analysis

### 1.1 Tech Stack & Capabilities
- **Framework**: Next.js 14.2.23 (App Router), React 18.3.1, TypeScript 5.7.3.
- **Styling**: TailwindCSS 3.4.17 with CSS custom design tokens (`tokens.css`) and dark mode class strategy.
- **State Management**: Zustand 5.0.3 with `persist` middleware configured for `localStorage`.
- **Validation**: Zod 3.24.1 for strict data contracts.
- **Icons**: Lucide React 0.473.0.
- **Current Quality Baseline**:
  - Test suite: 25 test files, 508 passing tests (`vitest run`).
  - TypeScript: 0 errors (`tsc --noEmit`).
  - Lint: 0 warnings, 0 errors (`next lint`).

### 1.2 Existing Core Modules & Touchpoints
| Core Module | File Location | Relevance to Category B |
|---|---|---|
| **Sizing Core Types** | `src/core/types.ts` | Base contracts: `AnatomicalProfile`, `GarmentDimensions`, `BrandSizeChart`, `ExplanationTree`, `FitType`. |
| **Profile State** | `src/core/state/profileStore.ts` | Multi-profile state (`profiles: UserProfile[]`, `activeProfileId`, `relation: "self" \| "partner" \| "parent" \| "child" \| "other"`). Crucial foundation for Feature 9. |
| **Pilot Brands & Products** | `src/core/data/pilotBrands.ts` | 28 curated brands (Uniqlo, H&M, Snitch, Levi's, Zara, Westside, Van Heusen, Nike, Adidas, etc.) with verified Layer 2/3 charts. |
| **Footwear Matrix** | `src/core/data/shoeSizeMatrix.ts` | Canonical footbed mm mappings (`footMinMm`, `footMaxMm`), `matchShoeSizeByFootLength`, and `convertShoeSizeCrossBrand`. Essential for Feature 8 shoe scoring. |
| **Recommendation Engine** | `src/core/sizing/recommendationEngine.ts` | Pure deterministic sizing calculation: `evaluateSizeRecommendation`. Used by Feature 8 (Top/Bottom) and Feature 9 (Multi-Profile evaluation). |
| **Layout & Shell** | `src/components/layout/TopNavigation.tsx` | Header navigation with tools dropdown, unit toggle, theme toggle, and profile switcher. Hosts Language Selector (Feature 7) and new feature navigation links. |
| **Brand Exploration** | `src/components/explore/ProductCatalogView.tsx` | Brand and product browsing view. Touchpoint for Brand Request CTA when search yields no results. |
| **Profile Management** | `src/app/app/profile/page.tsx` | Family member list and modal. Direct integration anchor for Feature 9 (Family Matrix). |

---

## 2. Feature 6: Brand Request Voting Board

### 2.1 Problem & Objective
Users frequently seek sizing guidance for trendy D2C streetwear, ethnic, or regional brands not yet ingested into WearID (e.g., Bonkers Corner, Rare Rabbit, The Souled Store, Beyoung, Bewakoof, Bluorng, Urbanic). The Brand Request Voting Board provides a community feedback loop to prioritize brand ingestion based on verifiable consumer demand.

### 2.2 Functional Requirements
1. **Catalog Deduplication**: When a user searches for or enters a brand name, the system checks whether the brand is already live in `PILOT_BRANDS` (e.g., "Snitch", "Westside", "Uniqlo"). If so, it renders a friendly notification with a direct link to explore the existing verified size charts.
2. **Request Deduplication**: If another user has already requested the brand, entering the name prompts the user to upvote the existing entry rather than creating a fragmented clone.
3. **Anti-Duplicate Voting Debounce**:
   - Each browser/user profile can vote once per brand request.
   - Local state records `userVotes: Record<string, boolean>`.
   - Rapid clicking is throttled via a 300ms debounce guard to prevent race conditions.
   - Users can toggle their vote off (retract vote), cleanly decrementing the counter.
4. **Search & Filters**:
   - Filter by status: `All`, `Under Review`, `Open for Votes`, `In Catalog`.
   - Filter by category: `All`, `Streetwear & Oversized`, `Ethnic & Fusion`, `Formal & Smart Casual`, `Footwear & Athleisure`.
   - Sort by: `Most Upvoted`, `Newest`, `Alphabetical`.
5. **Submission Form**:
   - Validated fields: Brand Name (required, min 2 chars), Website URL (optional, validated URL), Primary Category (required select), Optional Note / Why you want this brand.

### 2.3 Data Contracts & Schemas
```typescript
// src/core/state/brandRequestStore.ts
import { z } from "zod";

export const BrandRequestStatusEnum = z.enum([
  "open",
  "under_review",
  "sizing_chart_pending",
  "in_catalog",
]);
export type BrandRequestStatus = z.infer<typeof BrandRequestStatusEnum>;

export const BrandRequestItemSchema = z.object({
  id: z.string(),
  brandName: z.string().min(2, "Brand name must be at least 2 characters"),
  slug: z.string(),
  websiteUrl: z.string().url().optional().or(z.literal("")),
  primaryCategory: z.enum([
    "streetwear",
    "oversized",
    "casual",
    "formal",
    "ethnic",
    "athleisure",
    "footwear",
    "innerwear",
  ]),
  description: z.string().optional(),
  voteCount: z.number().int().nonnegative(),
  status: BrandRequestStatusEnum,
  submittedAt: z.string().datetime(),
  submittedByProfileId: z.string().optional(),
});
export type BrandRequestItem = z.infer<typeof BrandRequestItemSchema>;

export interface BrandRequestState {
  requests: BrandRequestItem[];
  userVotes: Record<string, boolean>; // brandRequestId -> boolean
  searchQuery: string;
  categoryFilter: string;
  statusFilter: "all" | BrandRequestStatus;
  sortBy: "votes" | "recent" | "alphabetical";

  // Actions
  setSearchQuery: (query: string) => void;
  setCategoryFilter: (category: string) => void;
  setStatusFilter: (status: "all" | BrandRequestStatus) => void;
  setSortBy: (sort: "votes" | "recent" | "alphabetical") => void;
  toggleVote: (requestId: string) => { success: boolean; newCount: number; hasVoted: boolean };
  submitRequest: (payload: {
    brandName: string;
    websiteUrl?: string;
    primaryCategory: BrandRequestItem["primaryCategory"];
    description?: string;
    profileId?: string;
  }) => { success: boolean; message: string; id?: string; existingBrandId?: string };
  resetToDefault: () => void;
}
```

### 2.4 Pre-Seeded Indian Brand Requests
```typescript
export const INITIAL_BRAND_REQUESTS: BrandRequestItem[] = [
  {
    id: "req_bonkers_corner",
    brandName: "Bonkers Corner",
    slug: "bonkers-corner",
    websiteUrl: "https://www.bonkerscorner.com",
    primaryCategory: "streetwear",
    description: "Indian pop culture, anime, and oversized streetwear fits with drop shoulders.",
    voteCount: 142,
    status: "under_review",
    submittedAt: "2026-03-01T10:00:00Z",
  },
  {
    id: "req_rare_rabbit",
    brandName: "Rare Rabbit",
    slug: "rare-rabbit",
    websiteUrl: "https://thehouseofrare.com",
    primaryCategory: "formal",
    description: "Premium contemporary menswear, tailored shirting and structured blazers.",
    voteCount: 118,
    status: "under_review",
    submittedAt: "2026-03-02T11:00:00Z",
  },
  {
    id: "req_souled_store",
    brandName: "The Souled Store",
    slug: "the-souled-store",
    websiteUrl: "https://www.thesouledstore.com",
    primaryCategory: "casual",
    description: "Official merchandise, supima tees, and relaxed everyday oversized fits.",
    voteCount: 97,
    status: "open",
    submittedAt: "2026-03-03T09:30:00Z",
  },
  {
    id: "req_beyoung",
    brandName: "Beyoung",
    slug: "beyoung",
    websiteUrl: "https://www.beyoung.in",
    primaryCategory: "casual",
    description: "Affordable everyday shirts, polo tees, and chino trousers.",
    voteCount: 84,
    status: "open",
    submittedAt: "2026-03-04T14:15:00Z",
  },
  {
    id: "req_bewakoof",
    brandName: "Bewakoof",
    slug: "bewakoof",
    websiteUrl: "https://www.bewakoof.com",
    primaryCategory: "streetwear",
    description: "Graphic casualwear, fleece cargo joggers, and boxy fits.",
    voteCount: 76,
    status: "open",
    submittedAt: "2026-03-05T08:00:00Z",
  },
  {
    id: "req_urbanic",
    brandName: "Urbanic",
    slug: "urbanic",
    websiteUrl: "https://www.urbanic.com",
    primaryCategory: "casual",
    description: "Contemporary women's dresses, knitwear, and European cut tops.",
    voteCount: 65,
    status: "open",
    submittedAt: "2026-03-06T12:00:00Z",
  },
];
```

---

## 3. Feature 7: Multi-Language Support / i18n (English & Hindi)

### 3.1 Problem & Objective
WearID's core market is India, where millions of shoppers navigate apparel in Hindi (हिन्दी) or Hinglish. Garment anatomy (छाती, कमर, इनसीम) and fit descriptors (ढीला, सही नाप, तंग) are culturally significant. The objective is to design a high-performance, lightweight React Context + Hook without bulky npm dependencies (such as `next-intl` or `i18next`).

### 3.2 Design Principles
1. **Zero Runtime Bloat**: Implemented with pure React Context and a strongly typed TypeScript dictionary.
2. **SSR & Hydration Safety**: Default locale is `"en"`. The provider restores persisted locale from `localStorage` in an effect after mount to prevent SSR hydration mismatches.
3. **Comprehensive Apparel Dictionary**: Complete coverage of body dimensions, fit ratings, ease concepts, and navigation keys.
4. **Context API**: `useTranslation()` provides `{ locale, setLocale, t, isHindi }`.

### 3.3 Translation Dictionary Specification
```typescript
// src/core/i18n/translations.ts
export type SupportedLocale = "en" | "hi";

export interface TranslationDictionary {
  // Navigation & Shell
  passport: string;
  sizeMatcher: string;
  compare: string;
  brands: string;
  tools: string;
  whatSizeAmI: string;
  wardrobeCloset: string;
  tailorCard: string;
  outfitBuilder: string;
  familyMatrix: string;
  brandRequests: string;
  switchProfile: string;

  // Biometrics & Dimensions
  chest: string;
  bust: string;
  waist: string;
  hips: string;
  shoulderWidth: string;
  height: string;
  weight: string;
  inseam: string;
  footLength: string;
  neck: string;
  sleeveLength: string;

  // Fit Types
  fit_slim: string;
  fit_regular: string;
  fit_relaxed: string;
  fit_oversized: string;

  // Fit Quality / Feelings
  fit_perfect: string;
  fit_too_tight: string;
  fit_slightly_tight: string;
  fit_slightly_loose: string;
  fit_too_loose: string;

  // Sizing Engine Terms
  recommendedSize: string;
  alternativeSize: string;
  fitConfidence: string;
  confidence_high: string;
  confidence_medium: string;
  confidence_low: string;
  wearingEase: string;
  garmentDimensions: string;
  bodyMeasurements: string;
  provenanceAudited: string;

  // Garment Categories
  cat_all: string;
  cat_tshirt: string;
  cat_shirt: string;
  cat_jeans: string;
  cat_trousers: string;
  cat_shoes: string;
  cat_jacket: string;
  cat_kurta: string;
  cat_bra: string;

  // Common Actions
  matchMyFit: string;
  saveOutfit: string;
  upvote: string;
  upvoted: string;
  requestBrand: string;
  searchPlaceholder: string;
  copySummary: string;
  copied: string;
  active: string;
  addMember: string;
}

export const TRANSLATIONS: Record<SupportedLocale, TranslationDictionary> = {
  en: {
    passport: "Passport",
    sizeMatcher: "Size Matcher",
    compare: "Compare",
    brands: "Brands",
    tools: "Tools",
    whatSizeAmI: "What Size Am I?",
    wardrobeCloset: "Wardrobe Closet",
    tailorCard: "Tailor Card & PDF",
    outfitBuilder: "Outfit Builder",
    familyMatrix: "Family Size Matrix",
    brandRequests: "Request Brands",
    switchProfile: "Switch Profile",

    chest: "Chest",
    bust: "Bust",
    waist: "Waist",
    hips: "Hips",
    shoulderWidth: "Shoulder Width",
    height: "Height",
    weight: "Weight",
    inseam: "Inseam",
    footLength: "Foot Length",
    neck: "Neck / Collar",
    sleeveLength: "Sleeve Length",

    fit_slim: "Slim Fit",
    fit_regular: "Regular Fit",
    fit_relaxed: "Relaxed Fit",
    fit_oversized: "Oversized Fit",

    fit_perfect: "Best Fit (Perfect)",
    fit_too_tight: "Too Tight",
    fit_slightly_tight: "Slightly Tight",
    fit_slightly_loose: "Slightly Loose",
    fit_too_loose: "Too Loose",

    recommendedSize: "Recommended Size",
    alternativeSize: "Alternative Size",
    fitConfidence: "Fit Confidence",
    confidence_high: "High Confidence",
    confidence_medium: "Medium Confidence",
    confidence_low: "Low Confidence",
    wearingEase: "Wearing Ease",
    garmentDimensions: "Garment Dimensions (Laid Flat)",
    bodyMeasurements: "Body Measurements",
    provenanceAudited: "Provenance Audited",

    cat_all: "All Items",
    cat_tshirt: "T-Shirt",
    cat_shirt: "Shirt",
    cat_jeans: "Jeans",
    cat_trousers: "Trousers / Chinos",
    cat_shoes: "Shoes / Footwear",
    cat_jacket: "Jacket / Outerwear",
    cat_kurta: "Kurta",
    cat_bra: "Bra",

    matchMyFit: "Match My Fit",
    saveOutfit: "Save Outfit",
    upvote: "Upvote",
    upvoted: "Upvoted",
    requestBrand: "Request a Brand",
    searchPlaceholder: "Search brands or styles...",
    copySummary: "Copy Summary",
    copied: "Copied!",
    active: "Active",
    addMember: "Add Member",
  },
  hi: {
    passport: "साइज़ पासपोर्ट",
    sizeMatcher: "साइज़ जांचें",
    compare: "ब्रांड तुलना",
    brands: "ब्रांड्स",
    tools: "उपकरण",
    whatSizeAmI: "मेरा क्या साइज़ है?",
    wardrobeCloset: "मेरी अलमारी",
    tailorCard: "दर्ज़ी कार्ड",
    outfitBuilder: "आउटफ़िट बिल्डर",
    familyMatrix: "परिवार नाप तालिका",
    brandRequests: "ब्रांड अनुरोध",
    switchProfile: "प्रोफ़ाइल बदलें",

    chest: "छाती (Chest)",
    bust: "वक्ष (Bust)",
    waist: "कमर (Waist)",
    hips: "कूल्हे (Hips)",
    shoulderWidth: "कंधे की चौड़ाई",
    height: "कद / लंबाई",
    weight: "वज़न",
    inseam: "इनसीम (पैंट की लंबाई)",
    footLength: "पैर की लंबाई",
    neck: "गला / कॉलर",
    sleeveLength: "आस्तीन की लंबाई",

    fit_slim: "स्लिम फिट",
    fit_regular: "रेगुलर फिट",
    fit_relaxed: "ढीला (रिलैक्स्ड)",
    fit_oversized: "ओवरसाइज़्ड",

    fit_perfect: "सही नाप (परफेक्ट)",
    fit_too_tight: "बहुत तंग",
    fit_slightly_tight: "हल्का तंग",
    fit_slightly_loose: "हल्का ढीला",
    fit_too_loose: "बहुत ढीला",

    recommendedSize: "अनुशंसित साइज़",
    alternativeSize: "वैकल्पिक साइज़",
    fitConfidence: "सटीकता स्तर",
    confidence_high: "उच्च सटीकता",
    confidence_medium: "मध्यम सटीकता",
    confidence_low: "कम सटीकता",
    wearingEase: "ईज़ (पहनने का ढीलापन)",
    garmentDimensions: "कपड़े की माप (सपाट)",
    bodyMeasurements: "शरीर की माप",
    provenanceAudited: "प्रमाणित स्रोत",

    cat_all: "सभी कपड़े",
    cat_tshirt: "टी-शर्ट",
    cat_shirt: "शर्ट",
    cat_jeans: "जींस",
    cat_trousers: "पतलून / चीनो",
    cat_shoes: "जूते / फुटवियर",
    cat_jacket: "जैकेट",
    cat_kurta: "कुर्ता",
    cat_bra: "ब्रा",

    matchMyFit: "मेरा नाप मिलाएं",
    saveOutfit: "आउटफ़िट सहेजें",
    upvote: "वोट दें",
    upvoted: "वोट दिया",
    requestBrand: "ब्रांड का अनुरोध करें",
    searchPlaceholder: "ब्रांड या कपड़े खोजें...",
    copySummary: "कॉपी करें",
    copied: "कॉपी हो गया!",
    active: "सक्रिय",
    addMember: "सदस्य जोड़ें",
  },
};
```

### 3.4 Language Selector Component
The selector renders a compact toggle button `[EN | हिन्दी]` in `TopNavigation.tsx` adjacent to the `displayUnit` toggle. On click, it immediately switches the active locale and writes to `localStorage.setItem("wearid_lang", nextLocale)`.

---

## 4. Feature 8: Outfit Builder (Multi-Category Fit Scoring)

### 4.1 Problem & Objective
When shopping for an ensemble, consumers don't buy isolated garments; they coordinate a **Top** (tee, shirt, hoodie), a **Bottom** (jeans, chinos, trousers), and **Shoes**. However, sizing across these categories is notoriously disconnected. The Outfit Builder lets users pick an ensemble and calculates a deterministic **Combined Fit Score & Confidence** with **Silhouette Harmony Analysis**.

### 4.2 Mathematical Fit Scoring & Silhouette Harmony
#### 1. Category Individual Evaluations
- **Top**: Evaluated via `evaluateSizeRecommendation({ profile, fitPreference, garmentDimensions, brandSizeCharts })` $\rightarrow S_{\text{top}} \in [0, 100], C_{\text{top}} \in [0, 1]$.
- **Bottom**: Evaluated via `evaluateSizeRecommendation({ profile, fitPreference, garmentDimensions, brandSizeCharts })` $\rightarrow S_{\text{bottom}} \in [0, 100], C_{\text{bottom}} \in [0, 1]$.
- **Shoes**: Evaluated via `matchShoeSizeByFootLength(brandId, demographic, profile.footLengthMm)`:
  - If `profile.footLengthMm` falls directly within $[footMinMm, footMaxMm]$, $S_{\text{shoes}} = 98, C_{\text{shoes}} = 0.95$.
  - If within 3mm of boundary, $S_{\text{shoes}} = 90, C_{\text{shoes}} = 0.88$.
  - Otherwise nearest match, $S_{\text{shoes}} = 80, C_{\text{shoes}} = 0.75$.

#### 2. Weighted Overall Score
$$\text{Base Score} = 0.35 \cdot S_{\text{top}} + 0.35 \cdot S_{\text{bottom}} + 0.30 \cdot S_{\text{shoes}}$$

#### 3. Bottleneck Floor
If any single item fits poorly ($S_i < 65$), the overall outfit score cannot exceed $\min(S_i) + 10$. This prevents an outfit with a 98% top and 40% ill-fitting shoe from reporting a misleading high average.

#### 4. Silhouette Harmony Analysis
The engine evaluates the interaction of fit types:
| Top Silhouette | Bottom Silhouette | Harmony Assessment | Score Adjustment |
|---|---|---|---|
| `oversized` | `regular` or `slim` | **Balanced Modern Taper**: Proportional contrast between volume up top and clean lines below. | $+2$ pts |
| `oversized` | `relaxed` | **Full Streetwear Drape**: Intentional loose urban silhouette. | $+1$ pt |
| `slim` | `slim` | **Tailored Sharp Cut**: Clean European proportions. | $+1$ pt |
| `slim` | `oversized` | **Imbalanced Bottom Weight**: Heavy bottom may overpower snug upper torso. | $-2$ pts (flagged with styling tip) |
| `regular` | `regular` | **Classic Timeless Equilibrium**: Universally flattering symmetry. | $+2$ pts |

#### 5. Combined Confidence
$$C_{\text{outfit}} = \min(C_{\text{top}}, C_{\text{bottom}}, C_{\text{shoes}})$$
- High: $C_{\text{outfit}} \geq 0.85$
- Medium: $0.65 \leq C_{\text{outfit}} < 0.85$
- Low / Insufficient: $C_{\text{outfit}} < 0.65$

### 4.3 Data Structures & Persistence Store
```typescript
// src/core/state/outfitStore.ts
export interface OutfitItemSelection<T = any> {
  productId?: string;
  brandId: string;
  brandName: string;
  name: string;
  category: string;
  recommendedSize: string;
  fitScore: number;
  fitSilhouette?: FitType;
  metadata?: T;
}

export interface SavedOutfit {
  id: string;
  profileId: string;
  name: string;
  occasion: "casual" | "smart_casual" | "streetwear" | "formal" | "athleisure";
  top: OutfitItemSelection;
  bottom: OutfitItemSelection;
  shoes: OutfitItemSelection;
  combinedFitScore: number;
  combinedConfidence: "high" | "medium" | "low";
  harmonyNote: string;
  createdAt: string;
}

export interface OutfitStoreState {
  currentDraft: {
    top: PilotProduct | null;
    bottom: PilotProduct | null;
    shoes: { brandId: string; brandName: string; modelName: string } | null;
    occasion: SavedOutfit["occasion"];
  };
  savedOutfits: SavedOutfit[];

  // Actions
  selectTop: (product: PilotProduct | null) => void;
  selectBottom: (product: PilotProduct | null) => void;
  selectShoes: (shoes: { brandId: string; brandName: string; modelName: string } | null) => void;
  setOccasion: (occasion: SavedOutfit["occasion"]) => void;
  saveCurrentOutfit: (name: string, profileId: string) => SavedOutfit | null;
  deleteSavedOutfit: (outfitId: string) => void;
  resetDraft: () => void;
}
```

### 4.4 Visual Summary Card
Component: `src/components/outfit/OutfitSummaryCard.tsx`
- Renders Top, Bottom, and Shoes in a vertical stack with brand pill, product name, recommended size badge, and individual fit dot.
- Prominent combined score gauge (e.g., `96% Match · Harmonized Drape`).
- "Harmony Insights" card explaining why these garments work together.
- Actions: "Save to My Outfits", "Copy Sizing Cheat Sheet", "Recalibrate".

---

## 5. Feature 9: Family Multi-Profile Comparison Matrix

### 5.1 Problem & Objective
Families and partners often shop together. Today, finding sizes for multiple people requires tedious repeated profile switching and memorizing numbers. The Family Multi-Profile Comparison Matrix is a unified side-by-side dashboard displaying sizes for yourself, your partner, and family members across all pilot brands in one scannable matrix.

### 5.2 Functional Requirements
1. **Side-by-Side Multi-Profile Table**:
   - Columns: Family members from `useProfileStore` (e.g., "Aarush (Self)", "Ananya (Partner)", "Rohan (Child)").
   - Rows: Major benchmark apparel brands (Uniqlo, Zara, H&M, Levi's, Westside, Snitch, Nike, Bata).
   - Cells: Recommended size for each member in that brand + fit score dot + ease description.
2. **Distinct Role Badges**:
   - `self`: "Self" (Indigo badge, User icon)
   - `partner`: "Partner" (Rose badge, Heart icon)
   - `parent`: "Parent" (Amber badge, Shield icon)
   - `child`: "Child" (Emerald badge, Sparkle icon)
   - `other`: "Family / Friend" (Slate badge)
3. **1-Click Profile Switching**: Clicking any profile column header sets that member as the active profile across the entire application.
4. **Category Filter Tabs**: "All Items", "Tops & T-Shirts", "Jeans & Trousers", "Footwear".
5. **Copyable Family Sizing Cheat Sheet**:
   - Generates a clean text summary formatted for WhatsApp or printing.
   - Example:
     ```text
     WearID Family Size Cheat Sheet:
     • Aarush (Self):
       - Uniqlo: Size M (95% fit)
       - Levi's: 32x32 (96% fit)
       - Nike: UK 9 (98% fit)
     • Ananya (Partner):
       - Uniqlo: Size S (94% fit)
       - Zara: Size S (91% fit)
       - Nike: UK 5.5 (95% fit)
     ```
6. **Hard Privacy Invariant**: Adheres strictly to AGENTS.md Invariant #7: **ZERO raw anatomical measurements** (such as chestMm, waistMm, weightG) appear in the export card or table cells. Only brand sizing recommendations and fit confidence are exposed.

### 5.3 Service & Evaluation Architecture
```typescript
// src/core/sizing/familyMatrixService.ts
export interface MemberBrandRecommendation {
  brandId: string;
  brandName: string;
  category: string;
  recommendedSize: string;
  alternativeSize?: string;
  fitScore: number;
  confidenceLabel: "high" | "medium" | "low" | "insufficient";
  fitNote: string;
}

export interface MemberMatrixColumn {
  profileId: string;
  profileName: string;
  relation: "self" | "partner" | "parent" | "child" | "other";
  gender: "male" | "female" | "unisex";
  recommendations: Record<string, MemberBrandRecommendation>; // brandId -> recommendation
}

export interface FamilyMatrixResult {
  brands: { id: string; name: string; category: string }[];
  columns: MemberMatrixColumn[];
  generatedAt: string;
}

export function buildFamilyMatrix(
  profiles: UserProfile[],
  filterCategory: "all" | "top" | "bottom" | "shoes" = "all"
): FamilyMatrixResult;
```

---

## 6. Proposed Files to Create & Modify (Write Boundaries)

### 6.1 Files to Create (Greenfield)
| File Path | Purpose |
|---|---|
| `src/core/state/brandRequestStore.ts` | Zustand store for brand requests, community voting, debounce, and deduplication. |
| `src/components/brands/BrandVotingBoard.tsx` | Voting board UI with search, filter chips, upvote toggle, and submission modal. |
| `src/app/app/brand-requests/page.tsx` | App Router page hosting the Brand Request Voting Board (`/app/brand-requests`). |
| `src/core/i18n/translations.ts` | Complete English and Hindi dictionaries for sizing, apparel, biometrics, and navigation. |
| `src/core/i18n/I18nContext.tsx` | Pure React context provider and `useTranslation()` hook. |
| `src/components/ui/LanguageSelector.tsx` | Compact `[EN \| हिन्दी]` language switcher component. |
| `src/core/sizing/outfitScoring.ts` | Multi-category scoring algorithm, ease harmony analyzer, and bottleneck detection. |
| `src/core/state/outfitStore.ts` | Zustand store for current outfit draft, saved outfits, and persistence. |
| `src/components/outfit/OutfitBuilderView.tsx` | Interactive outfit builder UI with slot pickers, live score gauge, and harmony card. |
| `src/app/app/outfits/page.tsx` | App Router page for Outfit Builder (`/app/outfits`). |
| `src/core/sizing/familyMatrixService.ts` | Multi-profile matrix evaluator across pilot brands. |
| `src/components/family/FamilySizeMatrixView.tsx` | Side-by-side family comparison matrix table with role badges and clipboard export. |
| `src/app/app/family/page.tsx` | App Router page for Family Matrix Dashboard (`/app/family`). |

### 6.2 Files to Modify (Integration Touchpoints)
| File Path | Targeted Modification |
|---|---|
| `src/components/layout/TopNavigation.tsx` | 1. Insert `LanguageSelector` in the header control group.<br>2. Add navigation links for `Outfit Builder`, `Brand Requests`, and `Family Matrix` in Tools dropdown and desktop menu. |
| `src/components/explore/ProductCatalogView.tsx` | Add CTA banner linking to `/app/brand-requests` when search has 0 results or in catalog header. |
| `src/app/app/profile/page.tsx` | Add direct link & preview card for Family Matrix in the "Family & Member Profiles" section. |

---

## 7. Testing Strategy & Verification Plan

### 7.1 Automated Unit Tests (`tests/unit/`)
1. **`tests/unit/brands/brandRequestStore.test.ts`**:
   - Initial pre-seeded requests load properly.
   - Upvoting increments vote count and marks `userVotes[id] = true`.
   - Repeated upvoting is debounced / toggles vote cleanly.
   - Catalog deduplication detects existing pilot brands (e.g., "Snitch", "Zara") and returns existing brand reference.
   - Duplicate request submission increments existing request instead of creating duplicates.
2. **`tests/unit/i18n/translations.test.ts`**:
   - Validates key parity: every key in English dictionary has a corresponding non-empty translation in Hindi.
   - Verifies critical apparel terms: छाती (Chest), कमर (Waist), ढीला (Relaxed), सही नाप (Best Fit).
   - Verifies `I18nContext` locale switching and `localStorage` persistence.
3. **`tests/unit/sizing/outfitScoring.test.ts`**:
   - Validates combined fit score calculation across Top (35%), Bottom (35%), and Shoes (30%).
   - Validates silhouette harmony bonus for balanced pairings (e.g., oversized top + regular bottom).
   - Validates bottleneck rule: an ill-fitting item caps the overall outfit score.
   - Validates confidence calculation ($\min(C_{\text{top}}, C_{\text{bottom}}, C_{\text{shoes}})$).
4. **`tests/unit/sizing/familyMatrixService.test.ts`**:
   - Computes recommendations across multiple profiles with varying body dimensions.
   - Invariant verification: asserts zero raw biometrics (`chestMm`, `waistMm`, `heightMm`) are leaked in matrix output or cheat sheet export.
   - Correct role badge mapping (`self`, `partner`, `child`, `parent`).
5. **`tests/unit/ui/categoryBFeatures.test.tsx`**:
   - Renders `BrandVotingBoard` and tests search filter.
   - Renders `LanguageSelector` and tests switching to Hindi.
   - Renders `OutfitBuilderView` and verifies live score updates.
   - Renders `FamilySizeMatrixView` and tests copy cheat sheet button.

### 7.2 Verification Commands
```bash
# 1. Typecheck
npm run typecheck

# 2. Lint check
npm run lint

# 3. Unit test suite
npm test
```

---

## 8. Invariant Compliance Checklist (AGENTS.md)

| Invariant | Requirement | Category B Architecture Adherence |
|---|---|---|
| **#1: Never Invent Measurements** | No hallucinated size tables | Brand voting does not synthesize fake charts. Missing brand charts stay in `open` / `under_review` status. |
| **#2: Retain Provenance** | End-to-end data provenance | All recommendations in Outfit Builder & Family Matrix are derived strictly from audited `PILOT_BRANDS` and `SHOE_BRANDS`. |
| **#3: Separate Body vs Garment** | Distinct anatomical vs textile domains | Outfit scoring cleanly separates `AnatomicalProfile` from `GarmentDimensions` and `BrandSizeChart`. |
| **#4: Canonical Millimeters** | All internal storage in mm | Footwear calculations use canonical `footMinMm`/`footMaxMm`; body dimensions use canonical `mm`. |
| **#5: Do Not Publish Unverified Submissions** | Staging quarantine | Community-submitted brand requests stay in request store; never injected into production size recommendation engine. |
| **#7: Private Profiles by Default** | Zero raw biometric leakage | Family matrix exports and share cards expose only recommended size labels and fit confidence, never raw biometric numbers. |
| **#8: Explainable Recommendations** | Every recommendation explainable | Outfit builder provides explicit Silhouette Harmony and ease breakdown. |
| **#10: Automated Tests** | Mandatory test suite | Comprehensive unit test suite designed for all 4 features. |

---

*Report concluded. Ready for worker implementation.*
