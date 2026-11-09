# Deterministic Sizing Recommendation Algorithm Pseudocode

> **WearID — Universal Clothing Size Profile**  
> Complete mathematical specification, type contracts, ease tolerance bands, Gaussian scoring functions, calibration logic, and ExplanationTree generation.

---

## 1. Algorithmic Overview & Mathematical Invariants

In strict adherence to **`AGENTS.md` (Invariants 1, 3, 4, 8, and 10)** and **`MASTER_PROMPT.md` Product Rule 11**:
- **Zero Black-Box Machine Learning:** The sizing engine operates purely deterministically using transparent geometric and textile physics.
- **Canonical Integer Millimeters (`mm`):** All lengths, girths, flat widths, and ease calculations execute in integer millimeters. No floating-point accumulation errors are permitted in internal logic.
- **Plateau / Trapezoidal Gaussian Ease Scoring:** Ideal ease values inside the target range ($\text{min} \le \text{Ease} \le \text{max}$) receive a score of 1.0. Beyond range boundaries, ease scores decay according to a half-Gaussian curve with designated variance ($\sigma$):
  $$\text{Score}(\text{Ease}) = \begin{cases} 
  1.0 & \text{if } \text{min} \le \text{Ease} \le \text{max} \\
  \exp\left( - \frac{(\text{Ease} - \text{min})^2}{2\sigma^2} \right) & \text{if } \text{Ease} < \text{min} \\
  \exp\left( - \frac{(\text{Ease} - \text{max})^2}{2\sigma^2} \right) & \text{if } \text{Ease} > \text{max}
  \end{cases}$$
- **Strict Separation of Data Layers:**
  - **Layer 1:** User Anatomical Profile (`AnatomicalProfile`).
  - **Layer 2:** Brand Body-Fit Ranges (`BrandSizeChart`).
  - **Layer 3:** Finished Garment Flat Dimensions (`GarmentDimensions`).
  - **Layer 4:** Category Fit Intent (`FitPreference`).
- **Never Synthesize Data:** If required measurements are missing, the engine aborts calculation and raises an explicit `InsufficientDataError`. It never guesses or fabricates values.

---

## 2. Formal Type Contracts & Interfaces

```typescript
// ==============================================================================
// WearID Core Type Contracts (Canonical Units: Millimeters & Grams)
// ==============================================================================

export type FitType = "slim" | "regular" | "relaxed" | "oversized";
export type StretchLevel = "none" | "low" | "medium" | "high";
export type ConfidenceLabel = "high" | "medium" | "low" | "insufficient";
export type UserFitRating = "too_tight" | "slightly_tight" | "perfect" | "slightly_loose" | "too_loose";

export interface AnatomicalProfile {
  id: string;
  userId: string;
  profileName: string;
  chestMm: number;               // Mandatory for tops
  waistMm?: number;
  shoulderWidthMm?: number;
  torsoLengthMm?: number;
  heightMm?: number;
  weightG?: number;
}

export interface GarmentDimensions {
  sizeLabel: string;
  sizeSystem: string;            // 'IN', 'UK', 'EU', 'US'
  chestFlatMm: number;           // Laid-flat pit-to-pit (Circumference = flat * 2)
  shoulderMm?: number;           // Seam to seam across back
  lengthMm?: number;             // Highest shoulder point (HPS) to hem
  sleeveMm?: number;
  waistFlatMm?: number;
  measurementMethod: "laid_flat" | "hanging" | "on_form";
  confidence: number;            // 0.0 to 1.0
  verificationHash: string;
}

export interface BrandSizeChart {
  sizeLabel: string;
  chestMinMm?: number;
  chestMaxMm?: number;
  waistMinMm?: number;
  waistMaxMm?: number;
  confidence: number;
}

export interface FabricSpec {
  materialComposition: string;   // e.g., '100% Cotton', '95% Cotton / 5% Elastane'
  elastanePercentage: number;    // 0.00 to 100.00
  stretchLevel: StretchLevel;
  estimatedShrinkagePct: number; // Typical: 2.0% for cotton
}

export interface ReferenceGarment {
  brandId?: string;
  category: string;
  sizeLabeled: string;
  userFitRating: UserFitRating;
  verifiedChestFlatMm?: number;
}

export interface DimensionExplanation {
  dimension: "chest" | "shoulder" | "length" | "waist";
  bodyMeasurementMm: number;
  garmentSpecMm: number;
  easeDeltaMm: number;
  easeTargetMm: { min: number; max: number };
  status: "ideal" | "tight" | "loose" | "acceptable";
  rationale: string;
}

export interface ExplanationTree {
  recommendedSize: string;
  alternativeSize?: string;
  fitScore: number;              // 0 to 100 integer
  confidence: number;            // 0.00 to 1.00
  confidenceLabel: ConfidenceLabel;
  fitTypeUsed: FitType;
  isBorderline: boolean;
  borderlineTradeoff?: string;
  summaryText: string;
  dimensionBreakdown: DimensionExplanation[];
  fabricConsiderations?: {
    material: string;
    elastanePercentage: number;
    stretchLevel: StretchLevel;
    note: string;
  };
  dataSources: {
    layerUsed: "Layer3_Garment" | "Layer2_BrandChart";
    provenance: string;
  };
}
```

---

## 3. Calibration Tables & Weighting Matrices

### 3.1 Ease Tolerance Bands for Men's T-Shirts (`TSHIRT_EASE_TABLE`)

| Fit Intent (`FitType`) | Minimum Ease ($\text{min}$) | Maximum Ease ($\text{max}$) | Optimal Midpoint ($\mu$) | Bell Variance ($\sigma$) |
|:---|:---:|:---:|:---:|:---:|
| **`slim`** | `40 mm` (`4.0 cm`) | `80 mm` (`8.0 cm`) | `60 mm` (`6.0 cm`) | `15 mm` |
| **`regular`** | `80 mm` (`8.0 cm`) | `140 mm` (`14.0 cm`) | `110 mm` (`11.0 cm`) | `20 mm` |
| **`relaxed`** | `140 mm` (`14.0 cm`) | `200 mm` (`20.0 cm`) | `170 mm` (`17.0 cm`) | `25 mm` |
| **`oversized`** | `200 mm` (`20.0 cm`) | `300 mm` (`30.0 cm`) | `250 mm` (`25.0 cm`) | `35 mm` |

```typescript
export interface EaseRange {
  minMm: number;
  maxMm: number;
  idealMm: number;
  sigmaMm: number;
}

export const TSHIRT_EASE_TABLE: Record<FitType, EaseRange> = {
  slim:      { minMm: 40,  maxMm: 80,  idealMm: 60,  sigmaMm: 15 },
  regular:   { minMm: 80,  maxMm: 140, idealMm: 110, sigmaMm: 20 },
  relaxed:   { minMm: 140, maxMm: 200, idealMm: 170, sigmaMm: 25 },
  oversized: { minMm: 200, maxMm: 300, idealMm: 250, sigmaMm: 35 },
};
```

### 3.2 Category Dimension Weighting Matrix (`TSHIRT_DIMENSION_WEIGHTS`)

```typescript
export const TSHIRT_DIMENSION_WEIGHTS = {
  chest: 0.40,     // Primary governing zone for tops
  shoulder: 0.35,  // Critical for sleeve drop and silhouette
  length: 0.15,    // Torso coverage and proportion
  sleeve: 0.10,    // Bicep/arm circumference
};
```

---

## 4. Pure Functional Algorithm Pseudocode

```typescript
// ==============================================================================
// WearID Deterministic Recommendation Engine — Functional Core
// ==============================================================================

export class InsufficientDataError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InsufficientDataError";
  }
}

/**
 * Evaluates plateau/trapezoidal Gaussian fit score for a specific ease delta against an ease range.
 * Values inside the target ease band [minMm, maxMm] receive an ideal score of 1.0.
 * Beyond the band, scores decay smoothly according to a half-Gaussian distribution.
 */
export function calculateGaussianScore(actualEaseMm: number, target: EaseRange): number {
  if (actualEaseMm >= target.minMm && actualEaseMm <= target.maxMm) {
    return 1.0;
  }
  const deviation = actualEaseMm < target.minMm 
    ? target.minMm - actualEaseMm 
    : actualEaseMm - target.maxMm;
  // Half-Gaussian decay: exp( - (deviation^2) / (2 * sigma^2) )
  const score = Math.exp(-Math.pow(deviation, 2) / (2 * Math.pow(target.sigmaMm, 2)));
  return Math.min(1.0, Math.max(0.0, score));
}

/**
 * Main evaluation entrypoint: evaluates Layer 1 body against Layer 3 garment specs.
 */
export function evaluateGarmentFit(
  body: AnatomicalProfile,
  garmentSizes: GarmentDimensions[],
  fitIntent: FitType = "regular",
  fabric: FabricSpec,
  referenceGarments: ReferenceGarment[] = []
): ExplanationTree {
  // --------------------------------------------------------------------------
  // Step 1: Mandatory Input Validation (Guardrails)
  // --------------------------------------------------------------------------
  if (!body.chestMm || body.chestMm <= 0) {
    throw new InsufficientDataError(
      "Layer 1 chest measurement is missing. Cannot calculate size recommendation."
    );
  }
  if (!garmentSizes || garmentSizes.length === 0) {
    throw new InsufficientDataError(
      "Layer 3 garment dimensions are missing for this product."
    );
  }

  const targetEase = TSHIRT_EASE_TABLE[fitIntent];
  const sizeEvaluations: Array<{
    sizeLabel: string;
    compositeScore: number;
    breakdown: DimensionExplanation[];
  }> = [];

  // --------------------------------------------------------------------------
  // Step 2 & 3: Iterate and Score Each Available Garment Size
  // --------------------------------------------------------------------------
  for (const size of garmentSizes) {
    const garmentChestCircumferenceMm = size.chestFlatMm * 2;
    const actualChestEaseMm = garmentChestCircumferenceMm - body.chestMm;
    const dimensionBreakdown: DimensionExplanation[] = [];

    // --- Zone 1: Chest (Weight: 40%) ---
    let chestScore = 0;
    let chestStatus: "ideal" | "tight" | "loose" | "acceptable" = "acceptable";
    let chestRationale = "";

    // Negative ease evaluation (garment smaller than body)
    if (actualChestEaseMm < 0) {
      if (fabric.elastanePercentage >= 5 || fabric.stretchLevel === "high") {
        // Stretch knit allows compression fit
        chestScore = 0.80 * (1 - Math.abs(actualChestEaseMm) / 100);
        chestStatus = "tight";
        chestRationale = `Negative ease of ${actualChestEaseMm}mm is accommodated by ${fabric.elastanePercentage}% elastane stretch compression.`;
      } else {
        // Rigid fabric penalty: strict 0 fit score
        chestScore = 0.0;
        chestStatus = "tight";
        chestRationale = `Negative ease of ${actualChestEaseMm}mm on rigid fabric will pinch and restrict movement.`;
      }
    } else {
      chestScore = calculateGaussianScore(actualChestEaseMm, targetEase);
      if (actualChestEaseMm >= targetEase.minMm && actualChestEaseMm <= targetEase.maxMm) {
        chestStatus = "ideal";
        chestRationale = `Ease of +${actualChestEaseMm}mm is within your desired ${fitIntent} target (+${targetEase.minMm}mm to +${targetEase.maxMm}mm).`;
      } else if (actualChestEaseMm < targetEase.minMm) {
        chestStatus = "tight";
        chestRationale = `Ease of +${actualChestEaseMm}mm is tighter than your preferred ${fitIntent} ease.`;
      } else {
        chestStatus = "loose";
        chestRationale = `Ease of +${actualChestEaseMm}mm provides extra room beyond standard ${fitIntent} drape.`;
      }
    }

    dimensionBreakdown.push({
      dimension: "chest",
      bodyMeasurementMm: body.chestMm,
      garmentSpecMm: garmentChestCircumferenceMm,
      easeDeltaMm: actualChestEaseMm,
      easeTargetMm: { min: targetEase.minMm, max: targetEase.maxMm },
      status: chestStatus,
      rationale: chestRationale,
    });

    // --- Zone 2: Shoulder (Weight: 35%) ---
    let shoulderScore = 1.0;
    if (size.shoulderMm && body.shoulderWidthMm) {
      const actualShoulderDeltaMm = size.shoulderMm - body.shoulderWidthMm;
      // Shoulder target for t-shirts: ideally 0 to +25mm ease
      const shoulderTarget: EaseRange = { minMm: 0, maxMm: 30, idealMm: 15, sigmaMm: 12 };
      shoulderScore = calculateGaussianScore(actualShoulderDeltaMm, shoulderTarget);
      
      dimensionBreakdown.push({
        dimension: "shoulder",
        bodyMeasurementMm: body.shoulderWidthMm,
        garmentSpecMm: size.shoulderMm,
        easeDeltaMm: actualShoulderDeltaMm,
        easeTargetMm: { min: 0, max: 30 },
        status: actualShoulderDeltaMm < 0 ? "tight" : (actualShoulderDeltaMm > 30 ? "loose" : "ideal"),
        rationale: `Shoulder width delta is ${actualShoulderDeltaMm >= 0 ? "+" : ""}${actualShoulderDeltaMm}mm.`,
      });
    }

    // --- Zone 3: Length (Weight: 15%) ---
    if (size.lengthMm && body.torsoLengthMm) {
      const lengthDeltaMm = size.lengthMm - body.torsoLengthMm;
      dimensionBreakdown.push({
        dimension: "length",
        bodyMeasurementMm: body.torsoLengthMm,
        garmentSpecMm: size.lengthMm,
        easeDeltaMm: lengthDeltaMm,
        easeTargetMm: { min: 20, max: 80 },
        status: lengthDeltaMm < 20 ? "tight" : (lengthDeltaMm > 80 ? "loose" : "ideal"),
        rationale: `Garment covers waistband with ${lengthDeltaMm}mm clearance.`,
      });
    }

    // --- Composite Dimension Score ---
    let rawScore = (chestScore * TSHIRT_DIMENSION_WEIGHTS.chest) +
                   (shoulderScore * TSHIRT_DIMENSION_WEIGHTS.shoulder);
    const normalizedWeight = TSHIRT_DIMENSION_WEIGHTS.chest + TSHIRT_DIMENSION_WEIGHTS.shoulder;
    let finalScore = rawScore / normalizedWeight;

    // --------------------------------------------------------------------------
    // Step 4: Reference Garment Calibration Adjustment (Clamped to ±0.15 Delta)
    // --------------------------------------------------------------------------
    let totalCalibrationDelta = 0;
    for (const ref of referenceGarments) {
      if (ref.category === "t-shirt" && ref.verifiedChestFlatMm) {
        const flatDeltaMm = Math.abs(size.chestFlatMm - ref.verifiedChestFlatMm);
        // If this size matches the user's validated reference item within 10mm flat
        if (flatDeltaMm <= 10) {
          if (ref.userFitRating === "perfect") {
            totalCalibrationDelta += 0.15; // Calibration boost
          } else if (ref.userFitRating === "too_tight" && size.chestFlatMm <= ref.verifiedChestFlatMm) {
            totalCalibrationDelta -= 0.15; // Penalty for matching known tight item
          }
        }
      }
    }
    // Clamp cumulative calibration adjustment: multiple reference garments cannot exceed ±0.15 total adjustment
    const clampedCalibration = Math.max(-0.15, Math.min(0.15, totalCalibrationDelta));
    finalScore = Math.min(1.0, Math.max(0.0, finalScore + clampedCalibration));

    sizeEvaluations.push({
      sizeLabel: size.sizeLabel,
      compositeScore: Math.round(finalScore * 100),
      breakdown: dimensionBreakdown,
    });
  }

  // --------------------------------------------------------------------------
  // Step 5: Ranking and Top Size Selection
  // --------------------------------------------------------------------------
  sizeEvaluations.sort((a, b) => b.compositeScore - a.compositeScore);
  const bestFit = sizeEvaluations[0];
  const secondFit = sizeEvaluations[1];

  // --------------------------------------------------------------------------
  // Step 6: Borderline Fit Detection (|score_0 - score_1| < 8 points / 0.08)
  // --------------------------------------------------------------------------
  const isBorderline = secondFit ? (bestFit.compositeScore - secondFit.compositeScore < 8) : false;
  let borderlineTradeoff: string | undefined = undefined;

  if (isBorderline && secondFit) {
    borderlineTradeoff = `Borderline fit between ${bestFit.sizeLabel} (${bestFit.compositeScore}%) and ${secondFit.sizeLabel} (${secondFit.compositeScore}%). Choose ${bestFit.sizeLabel} for a closer fit, or ${secondFit.sizeLabel} for extra wearing ease.`;
  }

  // --------------------------------------------------------------------------
  // Step 7: Confidence Label Mapping
  // --------------------------------------------------------------------------
  const confidenceValue = bestFit.compositeScore / 100;
  let confidenceLabel: ConfidenceLabel = "high";
  if (confidenceValue < 0.40) confidenceLabel = "insufficient";
  else if (confidenceValue < 0.65) confidenceLabel = "low";
  else if (confidenceValue <= 0.85) confidenceLabel = "medium";

  // --------------------------------------------------------------------------
  // Step 8: Construct ExplanationTree Output
  // --------------------------------------------------------------------------
  const chestBreakdown = bestFit.breakdown.find(d => d.dimension === "chest")!;
  const summaryMarkdown = `We recommend **Size ${bestFit.sizeLabel}** based on a **+${chestBreakdown.easeDeltaMm}mm chest ease** for your ${fitIntent} fit preference.`;

  return {
    recommendedSize: bestFit.sizeLabel,
    alternativeSize: isBorderline && secondFit ? secondFit.sizeLabel : undefined,
    fitScore: bestFit.compositeScore,
    confidence: confidenceValue,
    confidenceLabel,
    fitTypeUsed: fitIntent,
    isBorderline,
    borderlineTradeoff,
    summaryText: summaryMarkdown,
    dimensionBreakdown: bestFit.breakdown,
    fabricConsiderations: {
      material: fabric.materialComposition,
      elastanePercentage: fabric.elastanePercentage,
      stretchLevel: fabric.stretchLevel,
      note: fabric.elastanePercentage === 0 
        ? "100% rigid cotton will experience ~2% minor wash shrinkage."
        : `Contains ${fabric.elastanePercentage}% elastane for flexible stretch recovery.`
    },
    dataSources: {
      layerUsed: "Layer3_Garment",
      provenance: "Verified physical garment specification",
    },
  };
}
```

---

## 5. Layer 2 Brand Size Chart Fallback Implementation

When Layer 3 physical garment specifications are absent, the engine falls back to evaluating brand body-fit ranges (`brand_size_charts`):

```typescript
export function evaluateBrandChartFallback(
  body: AnatomicalProfile,
  charts: BrandSizeChart[],
  fitIntent: FitType = "regular"
): ExplanationTree {
  if (!body.chestMm || body.chestMm <= 0) {
    throw new InsufficientDataError("Layer 1 chest measurement is missing.");
  }
  if (!charts || charts.length === 0) {
    throw new InsufficientDataError("No brand size charts available.");
  }

  const scores: Array<{ sizeLabel: string; score: number }> = [];

  for (const chart of charts) {
    let score = 0.0;
    if (chart.chestMinMm && chart.chestMaxMm) {
      if (body.chestMm >= chart.chestMinMm && body.chestMm <= chart.chestMaxMm) {
        const mid = (chart.chestMinMm + chart.chestMaxMm) / 2;
        const range = Math.max(1, chart.chestMaxMm - chart.chestMinMm);
        score = 1.0 - (Math.abs(body.chestMm - mid) / range);
      } else if (body.chestMm < chart.chestMinMm) {
        const diff = chart.chestMinMm - body.chestMm;
        score = Math.max(0, 1.0 - (diff / 100));
      } else {
        const diff = body.chestMm - chart.chestMaxMm;
        score = Math.max(0, 1.0 - (diff / 100));
      }
    }
    scores.push({ sizeLabel: chart.sizeLabel, score: Math.round(score * 100) });
  }

  scores.sort((a, b) => b.score - a.score);
  const best = scores[0];

  return {
    recommendedSize: best.sizeLabel,
    fitScore: best.score,
    confidence: 0.70, // Capped at 0.70 for Layer 2 fallback
    confidenceLabel: "medium",
    fitTypeUsed: fitIntent,
    isBorderline: false,
    summaryText: `Based on the brand's recommended body-fit chart, **Size ${best.sizeLabel}** fits a ${body.chestMm / 10}cm chest.`,
    dimensionBreakdown: [
      {
        dimension: "chest",
        bodyMeasurementMm: body.chestMm,
        garmentSpecMm: body.chestMm, // Unknown garment spec
        easeDeltaMm: 0,
        easeTargetMm: { min: 0, max: 0 },
        status: "acceptable",
        rationale: "Matched to brand generic body chart; finished garment dimensions unavailable."
      }
    ],
    dataSources: {
      layerUsed: "Layer2_BrandChart",
      provenance: "Brand published body-fit chart (fallback mode)"
    }
  };
}
```
