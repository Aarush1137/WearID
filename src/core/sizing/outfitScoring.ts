import { AnatomicalProfile, FitType } from "../types";
import { PilotProduct } from "../data/pilotBrands";
import { matchShoeSizeByFootLength, ShoeDemographic } from "../data/shoeSizeMatrix";
import { evaluateSizeRecommendation } from "./recommendationEngine";

export interface ItemEvaluationResult {
  category: "top" | "bottom" | "shoes";
  brandId: string;
  brandName: string;
  productName: string;
  recommendedSize: string;
  fitScore: number;
  confidence: number;
  confidenceLabel: "high" | "medium" | "low" | "insufficient";
  fitNote: string;
  silhouette?: FitType;
}

export interface SilhouetteHarmonyResult {
  adjustment: number;
  note: string;
  isHarmonious: boolean;
}

export interface OutfitEvaluationResult {
  overallScore: number;
  confidence: number;
  confidenceLabel: "high" | "medium" | "low";
  harmonyNote: string;
  harmonyAdjustment: number;
  isBottleneckTriggered: boolean;
  bottleneckReason?: string;
  top?: ItemEvaluationResult;
  bottom?: ItemEvaluationResult;
  shoes?: ItemEvaluationResult;
}

/**
 * Evaluates silhouette interaction between Top and Bottom garments
 */
export function evaluateSilhouetteHarmony(
  topSilhouette?: FitType,
  bottomSilhouette?: FitType
): SilhouetteHarmonyResult {
  if (!topSilhouette || !bottomSilhouette) {
    return {
      adjustment: 0,
      note: "Select both top and bottom to evaluate silhouette ease harmony.",
      isHarmonious: true,
    };
  }

  // Oversized top + regular/slim bottom
  if (topSilhouette === "oversized" && (bottomSilhouette === "regular" || bottomSilhouette === "slim")) {
    return {
      adjustment: 2,
      note: "Balanced Modern Taper: Proportional contrast between volume up top and clean lines below.",
      isHarmonious: true,
    };
  }

  // Oversized top + relaxed bottom
  if (topSilhouette === "oversized" && bottomSilhouette === "relaxed") {
    return {
      adjustment: 1,
      note: "Full Streetwear Drape: Intentional loose urban silhouette.",
      isHarmonious: true,
    };
  }

  // Slim top + slim bottom
  if (topSilhouette === "slim" && bottomSilhouette === "slim") {
    return {
      adjustment: 1,
      note: "Tailored Sharp Cut: Clean European proportions.",
      isHarmonious: true,
    };
  }

  // Slim top + oversized bottom (imbalance)
  if (topSilhouette === "slim" && bottomSilhouette === "oversized") {
    return {
      adjustment: -2,
      note: "Imbalanced Bottom Weight: Heavy bottom may overpower snug upper torso.",
      isHarmonious: false,
    };
  }

  // Regular top + regular bottom
  if (topSilhouette === "regular" && bottomSilhouette === "regular") {
    return {
      adjustment: 2,
      note: "Classic Timeless Equilibrium: Universally flattering symmetry.",
      isHarmonious: true,
    };
  }

  // Neutral combinations
  return {
    adjustment: 0,
    note: "Coordinated Ensemble: Balanced fit dimensions across pieces.",
    isHarmonious: true,
  };
}

/**
 * Deterministically evaluates footwear fit using canonical footbed length in mm
 */
export function evaluateShoePiece(
  brandId: string,
  brandName: string,
  modelName: string,
  profile: AnatomicalProfile,
  demographic: ShoeDemographic = "men"
): ItemEvaluationResult {
  const footMm = profile.footLengthMm;

  if (!footMm || footMm <= 0) {
    return {
      category: "shoes",
      brandId,
      brandName,
      productName: modelName,
      recommendedSize: "UK 8 (Default)",
      fitScore: 50,
      confidence: 0.3,
      confidenceLabel: "low",
      fitNote: "Foot length measurement unavailable in active profile.",
    };
  }

  const record = matchShoeSizeByFootLength(brandId, demographic, footMm);

  if (!record) {
    return {
      category: "shoes",
      brandId,
      brandName,
      productName: modelName,
      recommendedSize: "UK 8",
      fitScore: 55,
      confidence: 0.4,
      confidenceLabel: "low",
      fitNote: "Brand not recognized in shoe matrix.",
    };
  }

  // Exact footbed range match
  if (footMm >= record.footMinMm && footMm <= record.footMaxMm) {
    return {
      category: "shoes",
      brandId,
      brandName,
      productName: modelName,
      recommendedSize: `UK ${record.uk} (${record.eu} EU)`,
      fitScore: 98,
      confidence: 0.95,
      confidenceLabel: "high",
      fitNote: `Exact footbed match in UK ${record.uk} (${record.cm} cm) for ${footMm}mm foot.`,
    };
  }

  // Within 3mm tolerance of boundary
  if (footMm >= record.footMinMm - 3 && footMm <= record.footMaxMm + 3) {
    return {
      category: "shoes",
      brandId,
      brandName,
      productName: modelName,
      recommendedSize: `UK ${record.uk} (${record.eu} EU)`,
      fitScore: 90,
      confidence: 0.88,
      confidenceLabel: "high",
      fitNote: `Boundary match in UK ${record.uk} (within 3mm). Consider sock thickness.`,
    };
  }

  // Nearest match
  return {
    category: "shoes",
    brandId,
    brandName,
    productName: modelName,
    recommendedSize: `UK ${record.uk} (${record.eu} EU)`,
    fitScore: 80,
    confidence: 0.75,
    confidenceLabel: "medium",
    fitNote: `Nearest matching size is UK ${record.uk} (${record.cm} cm).`,
  };
}

/**
 * Evaluates apparel piece (Top or Bottom) using deterministic sizing recommendation engine
 */
export function evaluateApparelPiece(
  product: PilotProduct,
  categoryType: "top" | "bottom",
  profile: AnatomicalProfile,
  preferredFit?: FitType
): ItemEvaluationResult {
  const fitType = preferredFit || product.fitSilhouette || "regular";

  const rec = evaluateSizeRecommendation({
    profile,
    fitPreference: {
      profileId: profile.profileId || "default",
      category: product.category,
      fitType,
    },
    garmentDimensions: product.layer3Specs,
    brandSizeCharts: product.layer2Charts,
    fabricSpec: product.fabric,
  });

  return {
    category: categoryType,
    brandId: product.brandId,
    brandName: product.brandName,
    productName: product.name,
    recommendedSize: rec.recommendedSize,
    fitScore: rec.fitScore,
    confidence: rec.confidence,
    confidenceLabel: rec.confidenceLabel,
    fitNote: rec.summaryText,
    silhouette: product.fitSilhouette,
  };
}

export interface ScoreOutfitInput {
  profile: AnatomicalProfile;
  topProduct?: PilotProduct | null;
  bottomProduct?: PilotProduct | null;
  shoesSelection?: {
    brandId: string;
    brandName: string;
    modelName: string;
    demographic?: ShoeDemographic;
  } | null;
  topPreference?: FitType;
  bottomPreference?: FitType;
}

/**
 * Composite Outfit Scoring with Category Weighting, Silhouette Ease Harmony, and Bottleneck Floor
 */
export function scoreOutfit(input: ScoreOutfitInput): OutfitEvaluationResult {
  const {
    profile,
    topProduct,
    bottomProduct,
    shoesSelection,
    topPreference,
    bottomPreference,
  } = input;

  const topEval = topProduct
    ? evaluateApparelPiece(topProduct, "top", profile, topPreference)
    : undefined;

  const bottomEval = bottomProduct
    ? evaluateApparelPiece(bottomProduct, "bottom", profile, bottomPreference)
    : undefined;

  const shoesEval = shoesSelection
    ? evaluateShoePiece(
        shoesSelection.brandId,
        shoesSelection.brandName,
        shoesSelection.modelName,
        profile,
        shoesSelection.demographic || "men"
      )
    : undefined;

  const activePieces = [
    topEval && { eval: topEval, defaultWeight: 0.35 },
    bottomEval && { eval: bottomEval, defaultWeight: 0.35 },
    shoesEval && { eval: shoesEval, defaultWeight: 0.3 },
  ].filter(Boolean) as { eval: ItemEvaluationResult; defaultWeight: number }[];

  if (activePieces.length === 0) {
    return {
      overallScore: 0,
      confidence: 0,
      confidenceLabel: "low",
      harmonyNote: "No items selected in outfit.",
      harmonyAdjustment: 0,
      isBottleneckTriggered: false,
    };
  }

  // Renormalize weights across active items
  const totalWeight = activePieces.reduce((acc, p) => acc + p.defaultWeight, 0);
  const weightedBaseScore = activePieces.reduce((acc, p) => {
    const normalizedWeight = p.defaultWeight / totalWeight;
    return acc + p.eval.fitScore * normalizedWeight;
  }, 0);

  // Bottleneck detection: if any item has score < 65, cap overall score at minScore + 10
  const scores = activePieces.map((p) => p.eval.fitScore);
  const minScore = Math.min(...scores);
  let isBottleneckTriggered = false;
  let bottleneckReason: string | undefined;
  let scoreAfterBottleneck = weightedBaseScore;

  if (minScore < 65) {
    isBottleneckTriggered = true;
    const lowestPiece = activePieces.find((p) => p.eval.fitScore === minScore)!;
    const bottleneckCap = minScore + 10;
    if (weightedBaseScore > bottleneckCap) {
      scoreAfterBottleneck = bottleneckCap;
      bottleneckReason = `Overall score capped: ${lowestPiece.eval.productName} has a low fit score (${minScore}%). An outfit is only as good as its weakest piece.`;
    }
  }

  // Silhouette Ease Harmony
  const harmony = evaluateSilhouetteHarmony(
    topEval?.silhouette,
    bottomEval?.silhouette
  );

  const finalScore = Math.max(
    0,
    Math.min(100, Math.round(scoreAfterBottleneck + harmony.adjustment))
  );

  // Combined confidence: minimum of individual confidences
  const confidences = activePieces.map((p) => p.eval.confidence);
  const minConfidence = Math.min(...confidences);
  const confidenceLabel: "high" | "medium" | "low" =
    minConfidence >= 0.85 ? "high" : minConfidence >= 0.65 ? "medium" : "low";

  return {
    overallScore: finalScore,
    confidence: Number(minConfidence.toFixed(2)),
    confidenceLabel,
    harmonyNote: harmony.note,
    harmonyAdjustment: harmony.adjustment,
    isBottleneckTriggered,
    bottleneckReason,
    top: topEval,
    bottom: bottomEval,
    shoes: shoesEval,
  };
}
