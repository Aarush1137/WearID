# docs/recommendation-engine-spec.md — Deterministic Recommendation Algorithm Specification

> **Fit / WearID — Universal Clothing Size Profile**  
> Complete algorithmic pseudocode, category weighting matrices, ease scoring, borderline detection, and confidence calculation.

---

## 1. Algorithmic Overview

The sizing engine operates purely deterministically with zero black-box machine learning in Phase 1.
All calculations execute on canonical integer millimeters (`mm`).

---

## 2. Pseudocode Implementation

```typescript
interface RecommendationInput {
  profile: AnatomicalProfile;          // Layer 1
  fitPreference: FitPreference;        // Layer 4
  garmentDimensions?: GarmentDimensions[]; // Layer 3 (Preferred)
  brandSizeCharts?: BrandSizeChart[];  // Layer 2 (Fallback)
  referenceGarments?: ReferenceGarment[]; // Calibration anchors
  communityFeedbackCorrection?: number; // In percentage (-0.1 to +0.1)
}

function evaluateSizeRecommendation(input: RecommendationInput): ExplanationTree {
  // Step 1: Data Source Selection
  let layerUsed: "Layer3_Garment" | "Layer2_BrandChart";
  if (input.garmentDimensions && input.garmentDimensions.length > 0) {
    layerUsed = "Layer3_Garment";
  } else if (input.brandSizeCharts && input.brandSizeCharts.length > 0) {
    layerUsed = "Layer2_BrandChart";
  } else {
    return generateInsufficientDataResult("No size charts or garment specs available.");
  }

  // Step 2: Category Dimension Weights
  const weights = getCategoryWeights(input.fitPreference.category);
  // Example for tshirt: { chest: 0.40, shoulder: 0.35, length: 0.15, sleeve: 0.10 }

  const candidateScores: Array<{
    sizeLabel: string;
    totalScore: number;
    dimensionBreakdown: DimensionExplanation[];
  }> = [];

  // Step 3 & 4: Evaluate Each Candidate Size
  if (layerUsed === "Layer3_Garment") {
    for (const g of input.garmentDimensions!) {
      const gChestCirc = g.chestFlatMm * 2;
      const chestEase = gChestCirc - input.profile.chestMm;
      const targetRange = getTargetEaseRange(input.fitPreference.fitType);

      // Score Chest Ease
      let chestScore = calculateGaussianEaseScore(chestEase, targetRange);
      if (chestEase < 0) {
        // Severe penalty for negative ease on shirts
        chestScore = 0.0;
      }

      // Score Shoulder Width
      let shoulderScore = 1.0;
      if (input.profile.shoulderWidthMm && g.shoulderMm) {
        const shoulderDelta = g.shoulderMm - input.profile.shoulderWidthMm;
        shoulderScore = calculateShoulderScore(shoulderDelta);
      }

      // Aggregate Weighted Score
      let score = (chestScore * weights.chest) + (shoulderScore * weights.shoulder);

      // Apply community correction factor if brand runs small/large
      if (input.communityFeedbackCorrection) {
        score += input.communityFeedbackCorrection;
      }

      candidateScores.push({
        sizeLabel: g.sizeLabel,
        totalScore: Math.max(0, Math.min(1.0, score)),
        dimensionBreakdown: [
          {
            dimension: "Chest Circumference",
            bodyMeasurementMm: input.profile.chestMm,
            garmentSpecMm: gChestCirc,
            easeDeltaMm: chestEase,
            easeTargetMm: targetRange,
            status: chestEase < targetRange.min ? "tight" : chestEase > targetRange.max ? "loose" : "ideal",
            rationale: `Provides +${Math.round(chestEase / 10)}cm ease (target: ${targetRange.min / 10}–${targetRange.max / 10}cm for ${input.fitPreference.fitType} fit).`
          }
        ]
      });
    }
  } else {
    // Layer 2 Brand Chart Fallback
    for (const chart of input.brandSizeCharts!) {
      let score = 0.0;
      if (chart.chestMinMm && chart.chestMaxMm) {
        if (input.profile.chestMm >= chart.chestMinMm && input.profile.chestMm <= chart.chestMaxMm) {
          const mid = (chart.chestMinMm + chart.chestMaxMm) / 2;
          score = 1.0 - (Math.abs(input.profile.chestMm - mid) / (chart.chestMaxMm - chart.chestMinMm));
        }
      }
      candidateScores.push({
        sizeLabel: chart.sizeLabel,
        totalScore: score,
        dimensionBreakdown: []
      });
    }
  }

  // Step 5: Reference Garment Calibration
  if (input.referenceGarments && input.referenceGarments.length > 0) {
    applyReferenceCalibration(candidateScores, input.referenceGarments);
  }

  // Step 6: Rank & Select
  candidateScores.sort((a, b) => b.totalScore - a.totalScore);
  const best = candidateScores[0];
  const runnerUp = candidateScores[1];

  // Step 7: Borderline Detection
  const isBorderline = runnerUp && Math.abs(best.totalScore - runnerUp.totalScore) < 0.08;

  // Step 8: Confidence Calculation
  let baseConfidence = 0.35;
  if (layerUsed === "Layer3_Garment") baseConfidence += 0.30;
  else if (layerUsed === "Layer2_BrandChart") baseConfidence += 0.15;
  if (input.profile.chestMm) baseConfidence += 0.10;
  if (input.profile.shoulderWidthMm) baseConfidence += 0.08;
  if (input.fitPreference) baseConfidence += 0.05;
  if (input.referenceGarments && input.referenceGarments.length > 0) baseConfidence += 0.08;

  const confidence = Math.min(0.97, baseConfidence);
  const confidenceLabel = confidence > 0.85 ? "high" : confidence >= 0.65 ? "medium" : confidence >= 0.40 ? "low" : "insufficient";

  // Step 9: Assemble ExplanationTree
  return {
    recommendedSize: best.sizeLabel,
    alternativeSize: runnerUp ? runnerUp.sizeLabel : undefined,
    fitScore: Math.round(best.totalScore * 100),
    confidence,
    confidenceLabel,
    fitTypeUsed: input.fitPreference.fitType,
    isBorderline,
    borderlineTradeoff: isBorderline ? `You are borderline between ${best.sizeLabel} and ${runnerUp.sizeLabel}. ${best.sizeLabel} offers a more tailored drape, while ${runnerUp.sizeLabel} provides extra comfort room.` : undefined,
    summaryText: `Your chest (${input.profile.chestMm / 10}cm) fits best in size ${best.sizeLabel}.`,
    dimensionBreakdown: best.dimensionBreakdown,
    dataSources: {
      layerUsed,
      provenance: "Verified Brand Official Specifications"
    }
  };
}
```
