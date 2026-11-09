import {
  AnatomicalProfile,
  BrandSizeChart,
  ExplanationTree,
  FabricSpec,
  FitPreference,
  GarmentDimensions,
} from "../types";
import { getCategoryWeights } from "./categoryWeights";
import {
  calculateGaussianEaseScore,
  calculateShoulderScore,
  getTargetEaseRange,
} from "./easeEngine";
import {
  buildExplanationTree,
  buildInsufficientDataTree,
} from "./explainabilityGenerator";

export interface ReferenceGarmentCalibration {
  category: string;
  sizeLabel: string;
  fitQuality: "perfect" | "slightly_loose" | "slightly_tight" | "too_loose" | "too_tight";
}

export interface EvaluateSizeRequest {
  profile: AnatomicalProfile;
  fitPreference: FitPreference;
  garmentDimensions?: GarmentDimensions[];
  brandSizeCharts?: BrandSizeChart[];
  referenceGarments?: ReferenceGarmentCalibration[];
  fabricSpec?: FabricSpec;
  communityCorrectionFactor?: number;
}

interface CandidateEvaluation {
  sizeLabel: string;
  totalScore: number;
  chestCircMm?: number;
  chestEaseMm?: number;
  shoulderMm?: number;
  shoulderDeltaMm?: number;
}

/**
 * Deterministic Sizing Recommendation Engine
 * Evaluates best-fitting apparel size adhering to the 4-layer separation principles.
 * Operates strictly on canonical integer millimeters (mm).
 */
export function evaluateSizeRecommendation(req: EvaluateSizeRequest): ExplanationTree {
  const {
    profile,
    fitPreference,
    garmentDimensions,
    brandSizeCharts,
    referenceGarments,
    fabricSpec,
    communityCorrectionFactor = 0,
  } = req;

  // Step 1: Validate Required Anatomical Profile Dimensions
  if (!profile || !profile.chestMm || profile.chestMm <= 0) {
    return buildInsufficientDataTree(
      fitPreference.fitType,
      "Insufficient data: Valid body chest measurement is required."
    );
  }

  // Step 2: Layer Selection (Layer 3 preferred over Layer 2)
  const hasLayer3 = Array.isArray(garmentDimensions) && garmentDimensions.length > 0;
  const hasLayer2 = Array.isArray(brandSizeCharts) && brandSizeCharts.length > 0;

  if (!hasLayer3 && !hasLayer2) {
    return buildInsufficientDataTree(
      fitPreference.fitType,
      "Insufficient data: No garment dimensions (Layer 3) or brand size charts (Layer 2) available."
    );
  }

  const layerUsed: "Layer3_Garment" | "Layer2_BrandChart" = hasLayer3
    ? "Layer3_Garment"
    : "Layer2_BrandChart";

  const isStretch =
    (fabricSpec?.elastanePercentage ?? 0) >= 4 || fabricSpec?.stretchLevel === "high";
  const targetEase = getTargetEaseRange(fitPreference.fitType);
  const weights = getCategoryWeights(fitPreference.category);

  const candidates: CandidateEvaluation[] = [];

  // Step 3: Candidate Evaluation
  if (layerUsed === "Layer3_Garment") {
    for (const g of garmentDimensions!) {
      const gChestCircMm = g.chestFlatMm * 2;
      const easeMm = gChestCircMm - profile.chestMm;

      // Score Chest Ease
      const chestScore = calculateGaussianEaseScore(easeMm, targetEase, isStretch);

      // Score Shoulder Width if available
      let shoulderScore = 1.0;
      let shoulderDeltaMm: number | undefined = undefined;
      if (profile.shoulderWidthMm && g.shoulderMm) {
        shoulderDeltaMm = g.shoulderMm - profile.shoulderWidthMm;
        shoulderScore = calculateShoulderScore(shoulderDeltaMm, fitPreference.fitType);
      }

      // Compute Weighted Score
      const chestWeight = weights.chest ?? 0.40;
      const shoulderWeight = profile.shoulderWidthMm && g.shoulderMm ? (weights.shoulder ?? 0.35) : 0;
      const activeWeightTotal = chestWeight + shoulderWeight;

      let compositeScore =
        activeWeightTotal > 0
          ? (chestScore * chestWeight + shoulderScore * shoulderWeight) / activeWeightTotal
          : chestScore;

      // Rigid fabric invariant: negative chest ease yields strictly 0 score
      if (easeMm < 0 && !isStretch) {
        compositeScore = 0.0;
      }

      // Apply community-calibrated correction
      compositeScore += communityCorrectionFactor;

      candidates.push({
        sizeLabel: g.sizeLabel,
        totalScore: Math.max(0, Math.min(1.0, compositeScore)),
        chestCircMm: gChestCircMm,
        chestEaseMm: easeMm,
        shoulderMm: g.shoulderMm,
        shoulderDeltaMm,
      });
    }
  } else {
    // Layer 2: Brand Body-Fit Charts Fallback
    for (const chart of brandSizeCharts!) {
      let score = 0.0;
      let chestEaseMm = 0;

      if (chart.chestMinMm && chart.chestMaxMm) {
        const midMm = (chart.chestMinMm + chart.chestMaxMm) / 2;
        chestEaseMm = profile.chestMm - midMm;

        if (profile.chestMm >= chart.chestMinMm && profile.chestMm <= chart.chestMaxMm) {
          const halfSpan = (chart.chestMaxMm - chart.chestMinMm) / 2;
          score = 1.0 - Math.abs(profile.chestMm - midMm) / (halfSpan * 1.5);
        } else {
          const dist =
            profile.chestMm < chart.chestMinMm
              ? chart.chestMinMm - profile.chestMm
              : profile.chestMm - chart.chestMaxMm;
          score = Math.max(0, 0.45 - dist / 120);
        }
      }

      candidates.push({
        sizeLabel: chart.sizeLabel,
        totalScore: Math.max(0, Math.min(1.0, score + communityCorrectionFactor)),
        chestEaseMm,
      });
    }
  }

  // Step 4: Reference Garment Calibration Anchors
  if (referenceGarments && referenceGarments.length > 0) {
    for (const ref of referenceGarments) {
      if (ref.category === fitPreference.category) {
        const matched = candidates.find((c) => c.sizeLabel === ref.sizeLabel);
        if (matched) {
          if (ref.fitQuality === "perfect") {
            matched.totalScore = Math.min(1.0, matched.totalScore + 0.15);
          } else if (ref.fitQuality === "too_tight" || ref.fitQuality === "too_loose") {
            matched.totalScore = Math.max(0, matched.totalScore - 0.15);
          }
        }
      }
    }
  }

  // Step 5: Rank Candidate Sizes
  candidates.sort((a, b) => b.totalScore - a.totalScore);
  const best = candidates[0];
  const runnerUp = candidates[1];

  // If no candidate scores above threshold, report safe refusal
  if (!best || best.totalScore <= 0.05) {
    return buildInsufficientDataTree(
      fitPreference.fitType,
      "No suitable size found that safely matches your anatomical dimensions."
    );
  }

  // Step 6: Borderline Determination (|score0 - score1| < 0.08)
  const isBorderline = Boolean(
    runnerUp &&
      runnerUp.totalScore > 0.40 &&
      Math.abs(best.totalScore - runnerUp.totalScore) < 0.08
  );

  let borderlineTradeoff: string | undefined = undefined;
  if (isBorderline && runnerUp) {
    const bestEaseCm = Math.round((best.chestEaseMm ?? 0) / 10);
    const runnerEaseCm = Math.round((runnerUp.chestEaseMm ?? 0) / 10);
    borderlineTradeoff = `Borderline between ${best.sizeLabel} and ${runnerUp.sizeLabel}. ${best.sizeLabel} offers a closer drape (+${bestEaseCm}cm ease), whereas ${runnerUp.sizeLabel} provides more relaxed room (+${runnerEaseCm}cm ease).`;
  }

  // Step 7: Confidence Calculation
  let baseConfidence = 0.35;
  if (layerUsed === "Layer3_Garment") baseConfidence += 0.30;
  else if (layerUsed === "Layer2_BrandChart") baseConfidence += 0.15;
  if (profile.chestMm) baseConfidence += 0.10;
  if (profile.shoulderWidthMm) baseConfidence += 0.08;
  if (fitPreference) baseConfidence += 0.05;
  if (referenceGarments && referenceGarments.length > 0) baseConfidence += 0.08;

  const confidence = Math.min(0.97, Math.round(baseConfidence * 100) / 100);

  // Step 8: Build and Return ExplanationTree
  return buildExplanationTree({
    recommendedSize: best.sizeLabel,
    alternativeSize: runnerUp ? runnerUp.sizeLabel : undefined,
    fitScore: Math.round(best.totalScore * 100),
    confidence,
    fitType: fitPreference.fitType,
    layerUsed,
    provenance:
      layerUsed === "Layer3_Garment"
        ? "Official Physical Garment Dimensions"
        : "Official Brand Body Fit Chart",
    isBorderline,
    borderlineTradeoff,
    bodyChestMm: profile.chestMm,
    garmentChestCircMm: best.chestCircMm,
    chestEaseMm: best.chestEaseMm,
    targetEase,
    bodyShoulderMm: profile.shoulderWidthMm,
    garmentShoulderMm: best.shoulderMm,
    shoulderDeltaMm: best.shoulderDeltaMm,
    isStretch,
  });
}
