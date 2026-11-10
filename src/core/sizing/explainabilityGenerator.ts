import {
  DimensionExplanation,
  ExplanationTree,
  FitType,
} from "../types";
import { TargetEaseRange } from "./easeEngine";

export interface BuildExplanationParams {
  recommendedSize: string;
  alternativeSize?: string;
  fitScore: number;
  confidence: number;
  fitType: FitType;
  layerUsed: "Layer3_Garment" | "Layer2_BrandChart";
  provenance: string;
  isBorderline: boolean;
  borderlineTradeoff?: string;
  bodyChestMm?: number;
  garmentChestCircMm?: number;
  chestEaseMm?: number;
  targetEase?: TargetEaseRange;
  bodyShoulderMm?: number;
  garmentShoulderMm?: number;
  shoulderDeltaMm?: number;
  bodyWaistMm?: number;
  garmentWaistCircMm?: number;
  waistEaseMm?: number;
  targetWaistEase?: TargetEaseRange;
  bodyInseamMm?: number;
  garmentInseamMm?: number;
  isBottom?: boolean;
  isStretch?: boolean;
}

/**
 * Builds a structured ExplanationTree with per-dimension breakdowns and plain-English prose.
 * All internal logic operates strictly on canonical millimeters (mm), converting to cm only for prose.
 */
export function buildExplanationTree(params: BuildExplanationParams): ExplanationTree {
  const {
    recommendedSize,
    alternativeSize,
    fitScore,
    confidence,
    fitType,
    layerUsed,
    provenance,
    isBorderline,
    borderlineTradeoff,
    bodyChestMm = 960,
    garmentChestCircMm,
    chestEaseMm = 0,
    targetEase = { min: 80, max: 140, midpoint: 110, sigma: 35 },
    bodyShoulderMm,
    garmentShoulderMm,
    shoulderDeltaMm,
    bodyWaistMm,
    garmentWaistCircMm,
    waistEaseMm = 0,
    targetWaistEase = { min: 20, max: 50, midpoint: 35, sigma: 20 },
    bodyInseamMm,
    garmentInseamMm,
    isBottom = false,
    isStretch = false,
  } = params;

  const confidenceLabel: "high" | "medium" | "low" | "insufficient" =
    confidence > 0.85
      ? "high"
      : confidence >= 0.65
      ? "medium"
      : confidence >= 0.40
      ? "low"
      : "insufficient";

  const dimensionBreakdown: DimensionExplanation[] = [];

  // Waist Dimension Explanation (Primary for bottoms, secondary for tops)
  if (garmentWaistCircMm !== undefined && bodyWaistMm !== undefined) {
    const easeCm = Math.round(waistEaseMm / 10);
    const targetMinCm = Math.round(targetWaistEase.min / 10);
    const targetMaxCm = Math.round(targetWaistEase.max / 10);

    let status: "ideal" | "tight" | "loose" | "acceptable" = "acceptable";
    let rationale = "";

    if (waistEaseMm < 0) {
      if (!isStretch) {
        status = "tight";
        rationale = `Negative waist ease (${easeCm}cm). Waistband will be constrictive.`;
      } else {
        status = "acceptable";
        rationale = `Comfort stretch (${easeCm}cm waist tension) accommodated by elastic waistband.`;
      }
    } else if (waistEaseMm >= targetWaistEase.min && waistEaseMm <= targetWaistEase.max) {
      status = "ideal";
      rationale = `Provides +${easeCm}cm waistband ease, perfectly in target range (${targetMinCm}–${targetMaxCm}cm) for ${fitType} fit.`;
    } else if (waistEaseMm < targetWaistEase.min) {
      status = "tight";
      rationale = `Provides +${easeCm}cm ease, snugger than standard (${targetMinCm}–${targetMaxCm}cm).`;
    } else {
      status = "loose";
      rationale = `Provides +${easeCm}cm ease, roomier than standard (${targetMinCm}–${targetMaxCm}cm); may need a belt or drawstring.`;
    }

    dimensionBreakdown.push({
      dimension: "Waist Circumference",
      bodyMeasurementMm: bodyWaistMm,
      garmentSpecMm: garmentWaistCircMm,
      easeDeltaMm: waistEaseMm,
      easeTargetMm: { min: targetWaistEase.min, max: targetWaistEase.max },
      status,
      rationale,
    });
  }

  // Inseam Dimension Explanation (for bottoms)
  if (bodyInseamMm !== undefined && garmentInseamMm !== undefined) {
    const deltaMm = garmentInseamMm - bodyInseamMm;
    const deltaCm = Math.round(deltaMm / 10);
    let status: "ideal" | "tight" | "loose" | "acceptable" = "ideal";
    let rationale = "";

    if (Math.abs(deltaMm) <= 25) {
      status = "ideal";
      rationale = `Inseam (${Math.round(garmentInseamMm / 10)}cm) breaks naturally at your ankle with no hem pooling.`;
    } else if (deltaMm > 25) {
      status = "acceptable";
      rationale = `Inseam is +${deltaCm}cm longer than ankle height; may stack slightly over shoes or can be cuffed.`;
    } else {
      status = "acceptable";
      rationale = `Inseam is ${Math.abs(deltaCm)}cm shorter than ankle height; offers a clean modern cropped ankle look.`;
    }

    dimensionBreakdown.push({
      dimension: "Inseam Length",
      bodyMeasurementMm: bodyInseamMm,
      garmentSpecMm: garmentInseamMm,
      easeDeltaMm: deltaMm,
      easeTargetMm: { min: -10, max: 25 },
      status,
      rationale,
    });
  }

  // Chest Dimension Explanation (Primary for tops)
  if (garmentChestCircMm !== undefined && (!isBottom || dimensionBreakdown.length === 0)) {
    const easeCm = Math.round(chestEaseMm / 10);
    const targetMinCm = Math.round(targetEase.min / 10);
    const targetMaxCm = Math.round(targetEase.max / 10);

    let status: "ideal" | "tight" | "loose" | "acceptable" = "acceptable";
    let rationale = "";

    if (chestEaseMm < 0) {
      if (!isStretch) {
        status = "tight";
        rationale = `Negative ease (${easeCm}cm). This garment will be tight and constrictive across your chest.`;
      } else {
        status = "acceptable";
        rationale = `Compression fit (${easeCm}cm ease) supported by elastic fabric stretch.`;
      }
    } else if (chestEaseMm >= targetEase.min && chestEaseMm <= targetEase.max) {
      status = "ideal";
      rationale = `Provides +${easeCm}cm chest ease, perfectly within the target range (${targetMinCm}–${targetMaxCm}cm) for ${fitType} fit.`;
    } else if (chestEaseMm < targetEase.min) {
      status = "tight";
      rationale = `Provides +${easeCm}cm ease, closer than recommended (${targetMinCm}–${targetMaxCm}cm) for ${fitType} fit.`;
    } else {
      status = "loose";
      rationale = `Provides +${easeCm}cm ease, looser than standard (${targetMinCm}–${targetMaxCm}cm) for ${fitType} fit.`;
    }

    dimensionBreakdown.push({
      dimension: "Chest Circumference",
      bodyMeasurementMm: bodyChestMm,
      garmentSpecMm: garmentChestCircMm,
      easeDeltaMm: chestEaseMm,
      easeTargetMm: { min: targetEase.min, max: targetEase.max },
      status,
      rationale,
    });
  }

  // Shoulder Dimension Explanation
  if (bodyShoulderMm !== undefined && garmentShoulderMm !== undefined && shoulderDeltaMm !== undefined && !isBottom) {
    const shoulderDeltaCm = Math.round(shoulderDeltaMm / 10);
    const gShoulderCm = Math.round(garmentShoulderMm / 10);
    const bShoulderCm = Math.round(bodyShoulderMm / 10);

    let status: "ideal" | "tight" | "loose" | "acceptable" = "ideal";
    let rationale = "";

    if (fitType === "oversized") {
      rationale = `Drop-shoulder pattern: garment shoulder (${gShoulderCm}cm) drops +${shoulderDeltaCm}cm beyond natural shoulder (${bShoulderCm}cm).`;
      status = shoulderDeltaMm >= 20 && shoulderDeltaMm <= 70 ? "ideal" : "acceptable";
    } else {
      if (shoulderDeltaMm < -10) {
        status = "tight";
        rationale = `Shoulder seam (${gShoulderCm}cm) is narrower than your body shoulders (${bShoulderCm}cm).`;
      } else if (shoulderDeltaMm > 35) {
        status = "loose";
        rationale = `Shoulder seam (${gShoulderCm}cm) extends noticeably past your shoulder bone (${bShoulderCm}cm).`;
      } else {
        status = "ideal";
        rationale = `Shoulder seam (${gShoulderCm}cm) aligns naturally with your shoulder width (${bShoulderCm}cm).`;
      }
    }

    dimensionBreakdown.push({
      dimension: "Shoulder Width",
      bodyMeasurementMm: bodyShoulderMm,
      garmentSpecMm: garmentShoulderMm,
      easeDeltaMm: shoulderDeltaMm,
      easeTargetMm: { min: 0, max: 30 },
      status,
      rationale,
    });
  }

  // Summary Text Generation
  let summaryText = "";
  if (isBottom && bodyWaistMm !== undefined) {
    const bodyWaistCm = Math.round(bodyWaistMm / 10);
    const easeCm = Math.round(waistEaseMm / 10);
    if (layerUsed === "Layer3_Garment") {
      summaryText = `Your waist (${bodyWaistCm}cm) fits best in size ${recommendedSize} with +${easeCm}cm waistband ease for a ${fitType} fit.`;
    } else {
      summaryText = `Your waist (${bodyWaistCm}cm) fits best in size ${recommendedSize} based on brand fit guidelines.`;
    }
  } else {
    const bodyChestCm = Math.round(bodyChestMm / 10);
    const easeCm = Math.round(chestEaseMm / 10);
    if (layerUsed === "Layer3_Garment") {
      summaryText = `Your chest (${bodyChestCm}cm) fits best in size ${recommendedSize} with +${easeCm}cm ease for a ${fitType} fit.`;
    } else {
      summaryText = `Your chest (${bodyChestCm}cm) fits best in size ${recommendedSize} based on brand fit guidelines.`;
    }
  }

  return {
    recommendedSize,
    alternativeSize,
    fitScore,
    confidence,
    confidenceLabel,
    fitTypeUsed: fitType,
    isBorderline,
    borderlineTradeoff,
    summaryText,
    dimensionBreakdown,
    dataSources: {
      layerUsed,
      provenance,
    },
  };
}

/**
 * Generates honest ExplanationTree for missing or unverified data scenarios.
 */
export function buildInsufficientDataTree(
  fitType: FitType,
  reason: string = "Insufficient data: Required measurements or size charts unavailable."
): ExplanationTree {
  return {
    recommendedSize: "",
    fitScore: 0,
    confidence: 0,
    confidenceLabel: "insufficient",
    fitTypeUsed: fitType,
    isBorderline: false,
    summaryText: reason,
    dimensionBreakdown: [],
    dataSources: {
      layerUsed: "Layer2_BrandChart",
      provenance: "None",
    },
  };
}
