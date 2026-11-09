import {
  AnatomicalProfile,
  BrandSizeChart,
  ExplanationTree,
  FabricSpec,
  FitPreference,
  GarmentDimensions,
  ReferenceGarment,
} from "./types";
import {
  calculateGaussianEaseScore,
  calculateShoulderScore,
  flatMeasureToCircumference,
  getCategoryWeights,
  getTargetChestEaseRange,
  getTargetEaseRange,
} from "./ease";
import { applyReferenceGarmentCalibration } from "./calibration";
import { detectBorderlineFit } from "./borderline";
import { buildExplanationTree, buildInsufficientDataTree } from "./explanation";

export interface SizingEvaluationRequest {
  profile: AnatomicalProfile;
  fitPreference: FitPreference;
  garmentDimensions?: GarmentDimensions[];
  brandSizeCharts?: BrandSizeChart[];
  referenceGarments?: ReferenceGarment[];
  fabricSpec?: FabricSpec;
  communityCorrectionFactor?: number;
}

export type RecommendationRequest = SizingEvaluationRequest;
export type EvaluateSizeRequest = SizingEvaluationRequest;

interface InternalCandidate {
  sizeLabel: string;
  totalScore: number;
  chestCircMm?: number;
  chestEaseMm?: number;
  shoulderMm?: number;
  shoulderDeltaMm?: number;
  waistCircMm?: number;
  waistEaseMm?: number;
  hipsCircMm?: number;
  hipsEaseMm?: number;
  inseamMm?: number;
  inseamDeltaMm?: number;
}

/**
 * Deterministic Sizing Recommendation Engine
 * Strictly maintains 4-layer separation:
 * - Layer 1: AnatomicalProfile (canonical mm and g)
 * - Layer 2: BrandSizeChart (brand graded body bounds)
 * - Layer 3: GarmentDimensions (finished flat dimensions doubled for circumference)
 * - Layer 4: FitPreference (category-specific fit intentions)
 *
 * Invariant 1: Zero hallucination on missing data.
 * Invariant 3: Body anatomy and finished garment dimensions never share interchangeable properties.
 * Invariant 4: Canonical units in mm and g.
 * Invariant 8: Explainable recommendation tree.
 */
export function evaluateSizing(req: SizingEvaluationRequest): ExplanationTree {
  const {
    profile,
    fitPreference,
    garmentDimensions,
    brandSizeCharts,
    referenceGarments,
    fabricSpec,
    communityCorrectionFactor = 0,
  } = req;

  const fitType = fitPreference?.fitType || "regular";
  const category = fitPreference?.category || "tshirt";

  // Step 1: Validate Anatomical Body Measurements (Layer 1)
  if (!profile || !profile.chestMm || profile.chestMm <= 0) {
    return buildInsufficientDataTree(
      fitType,
      "Insufficient data: Valid body chest measurement is required."
    );
  }

  // Step 2: Layer Cascade (Layer 3 Preferred over Layer 2)
  const hasLayer3 = Array.isArray(garmentDimensions) && garmentDimensions.length > 0;
  const hasLayer2 = Array.isArray(brandSizeCharts) && brandSizeCharts.length > 0;

  if (!hasLayer3 && !hasLayer2) {
    return buildInsufficientDataTree(
      fitType,
      "Insufficient data: No verified garment specifications or brand size charts found."
    );
  }

  const layerUsed: "Layer3_Garment" | "Layer2_BrandChart" = hasLayer3
    ? "Layer3_Garment"
    : "Layer2_BrandChart";

  const elastane = fabricSpec?.elastanePercentage ?? 0;
  const isStretch = elastane >= 4 || fabricSpec?.stretchLevel === "high";
  const targetEase = getTargetEaseRange(fitType);
  const weights = getCategoryWeights(category);

  const candidates: InternalCandidate[] = [];

  // Step 3: Candidate Evaluation
  if (layerUsed === "Layer3_Garment") {
    for (const g of garmentDimensions!) {
      // Circumference = flat * 2
      const gChestCircMm = flatMeasureToCircumference(g.chestFlatMm);
      const easeMm = gChestCircMm - profile.chestMm;

      // Score Chest Ease
      const chestScore = calculateGaussianEaseScore(easeMm, targetEase, isStretch);

      // Score Shoulder Width if available
      let shoulderScore = 1.0;
      let shoulderDeltaMm: number | undefined = undefined;
      if (profile.shoulderWidthMm && g.shoulderMm) {
        shoulderDeltaMm = g.shoulderMm - profile.shoulderWidthMm;
        shoulderScore = calculateShoulderScore(shoulderDeltaMm, fitType);
      }

      // Compute Dimension Weights
      const chestWeight = weights.chest ?? 0.40;
      const shoulderWeight =
        profile.shoulderWidthMm && g.shoulderMm ? (weights.shoulder ?? 0.35) : 0;
      const activeWeightTotal = chestWeight + shoulderWeight;

      let compositeScore =
        activeWeightTotal > 0
          ? (chestScore * chestWeight + shoulderScore * shoulderWeight) / activeWeightTotal
          : chestScore;

      // Rigid fabric invariant: negative chest ease yields strictly 0 score
      if (easeMm < 0 && !isStretch) {
        compositeScore = 0.0;
      }

      // Community-calibrated correction
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

  // Step 4: Reference Garment Calibration Anchors (clamped to [-0.15, 0.15])
  const calibrationResult = applyReferenceGarmentCalibration(
    candidates,
    referenceGarments,
    category
  );

  // Step 5: Rank Candidates
  candidates.sort((a, b) => b.totalScore - a.totalScore);
  const best = candidates[0];
  const runnerUp = candidates[1];

  // Zero-score / safe refusal check
  if (!best || best.totalScore <= 0.05) {
    return {
      recommendedSize: "",
      fitScore: 0,
      confidence: 0.35,
      confidenceLabel: "insufficient",
      fitTypeUsed: fitType,
      isBorderline: false,
      summaryText: "No suitable size found that accommodates your measurements safely.",
      dimensionBreakdown: [],
      dataSources: {
        layerUsed,
        provenance:
          layerUsed === "Layer3_Garment"
            ? "Verified Brand Official Specifications"
            : "Official Brand Body Fit Chart",
      },
    };
  }

  // Step 6: Borderline Fit Detection (|score0 - score1| < 0.08)
  const borderlineCheck = detectBorderlineFit(best, runnerUp, 0.08);

  // Step 7: Confidence Calculation
  let baseConfidence = 0.35;
  if (layerUsed === "Layer3_Garment") baseConfidence += 0.30;
  else if (layerUsed === "Layer2_BrandChart") baseConfidence += 0.15;
  if (profile.chestMm) baseConfidence += 0.10;
  if (profile.shoulderWidthMm) baseConfidence += 0.08;
  if (fitPreference) baseConfidence += 0.05;
  if (calibrationResult.hasMatchingAnchor) baseConfidence += 0.08;

  const confidence = Math.min(0.97, Math.round(baseConfidence * 100) / 100);

  // Step 8: Build ExplanationTree Output
  return buildExplanationTree({
    recommendedSize: best.sizeLabel,
    alternativeSize: borderlineCheck.alternativeSize || (runnerUp ? runnerUp.sizeLabel : undefined),
    fitScore: Math.round(best.totalScore * 100),
    confidence,
    fitType,
    layerUsed,
    provenance:
      layerUsed === "Layer3_Garment"
        ? "Official Physical Garment Dimensions"
        : "Official Brand Body Fit Chart",
    isBorderline: borderlineCheck.isBorderline,
    borderlineTradeoff: borderlineCheck.borderlineTradeoff,
    bodyChestMm: profile.chestMm,
    garmentChestCircMm: best.chestCircMm,
    chestEaseMm: best.chestEaseMm,
    targetEase,
    bodyShoulderMm: profile.shoulderWidthMm,
    garmentShoulderMm: best.shoulderMm,
    shoulderDeltaMm: best.shoulderDeltaMm,
    fabricSpec,
    isStretch,
  });
}

export const evaluateSizeRecommendation = evaluateSizing;
export const evaluateGarmentFit = evaluateSizing;
export { getTargetChestEaseRange, getTargetEaseRange };
