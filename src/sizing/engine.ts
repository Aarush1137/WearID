import {
  AnatomicalProfile,
  BrandSizeChart,
  ExplanationTree,
  FabricSpec,
  FitPreference,
  FitType,
  GarmentDimensions,
  DimensionExplanation,
} from "../core/types";

export interface ReferenceGarmentAnchor {
  brandId?: string;
  brandNameRaw?: string;
  category: string;
  sizeLabel: string;
  fitQuality: "perfect" | "slightly_loose" | "slightly_tight" | "too_loose" | "too_tight";
}

export interface RecommendationRequest {
  profile: AnatomicalProfile;
  fitPreference: FitPreference;
  garmentDimensions?: GarmentDimensions[];
  brandSizeCharts?: BrandSizeChart[];
  referenceGarments?: ReferenceGarmentAnchor[];
  fabricSpec?: FabricSpec;
  communityCorrectionFactor?: number;
}

export interface TargetEaseRange {
  min: number;
  max: number;
  midpoint: number;
  sigma: number;
}

/**
 * Category-specific measurement weighting distributions
 */
export function getCategoryWeights(category: string): Record<string, number> {
  const normalized = category.toLowerCase().trim();
  switch (normalized) {
    case "tshirt":
    case "t_shirt":
    case "polo":
      return { chest: 0.40, shoulder: 0.35, length: 0.15, sleeve: 0.10 };
    case "casual_shirt":
      return { chest: 0.30, shoulder: 0.30, sleeve: 0.20, neck: 0.20 };
    case "formal_shirt":
      return { chest: 0.25, shoulder: 0.25, sleeve: 0.25, neck: 0.25 };
    case "hoodie":
    case "sweatshirt":
      return { chest: 0.45, shoulder: 0.30, length: 0.15, sleeve: 0.10 };
    case "jeans":
      return { waist: 0.40, inseam: 0.35, thigh: 0.25 };
    case "trousers":
    case "chinos":
    case "trousers_chinos":
      return { waist: 0.40, inseam: 0.30, thigh: 0.20, rise: 0.10 };
    case "joggers":
    case "jogger":
    case "track_pants":
    case "sweatpants":
      return { waist: 0.40, hips: 0.30, inseam: 0.20, thigh: 0.10 };
    case "shorts":
    case "short":
      return { waist: 0.45, hips: 0.35, length: 0.20 };
    case "kurta":
      return { chest: 0.35, shoulder: 0.25, torso_length: 0.25, sleeve: 0.15 };
    case "shoe":
      return { foot_length: 1.0 };
    default:
      return { chest: 0.50, shoulder: 0.30, length: 0.20 };
  }
}

/**
 * Expected chest ease ranges in canonical millimeters (mm) by fit intent
 */
export function getTargetChestEaseRange(fitType: FitType): TargetEaseRange {
  switch (fitType) {
    case "slim":
      // 40mm to 80mm (4cm to 8cm)
      return { min: 40, max: 80, midpoint: 60, sigma: 25 };
    case "regular":
      // 80mm to 140mm (8cm to 14cm)
      return { min: 80, max: 140, midpoint: 110, sigma: 35 };
    case "relaxed":
      // 140mm to 200mm (14cm to 20cm)
      return { min: 140, max: 200, midpoint: 170, sigma: 45 };
    case "oversized":
      // 200mm to 300mm (20cm to 30cm)
      return { min: 200, max: 300, midpoint: 250, sigma: 65 };
  }
}

/**
 * Calculates Gaussian fit score centered at ideal ease midpoint
 */
export function calculateGaussianEaseScore(
  easeMm: number,
  target: TargetEaseRange,
  isStretch: boolean = false
): number {
  if (easeMm < 0) {
    if (!isStretch) {
      // Rigid textile strictly rejects negative chest ease
      return 0.0;
    }
    // High-stretch compression knit allows up to -80mm negative ease
    if (easeMm < -100) return 0.0;
    return Math.max(0, 1.0 - Math.abs(easeMm) / 120);
  }

  const deviation = easeMm - target.midpoint;
  const score = Math.exp(-(deviation * deviation) / (2 * target.sigma * target.sigma));
  return Math.round(score * 1000) / 1000;
}

/**
 * Evaluates deterministic sizing match
 */
export function evaluateSizing(req: RecommendationRequest): ExplanationTree {
  const {
    profile,
    fitPreference,
    garmentDimensions,
    brandSizeCharts,
    referenceGarments,
    fabricSpec,
    communityCorrectionFactor = 0,
  } = req;

  // Step 1: Data Source Selection
  const hasLayer3 = garmentDimensions && garmentDimensions.length > 0;
  const hasLayer2 = brandSizeCharts && brandSizeCharts.length > 0;

  if (!hasLayer3 && !hasLayer2) {
    return {
      recommendedSize: "",
      fitScore: 0,
      confidence: 0,
      confidenceLabel: "insufficient",
      fitTypeUsed: fitPreference.fitType,
      isBorderline: false,
      summaryText: "Insufficient data: No verified garment specifications or brand size charts found.",
      dimensionBreakdown: [],
      dataSources: {
        layerUsed: "Layer2_BrandChart",
        provenance: "None",
      },
    };
  }

  const layerUsed: "Layer3_Garment" | "Layer2_BrandChart" = hasLayer3
    ? "Layer3_Garment"
    : "Layer2_BrandChart";

  const isStretch = (fabricSpec?.elastanePercentage ?? 0) >= 4 || fabricSpec?.stretchLevel === "high";
  const targetEase = getTargetChestEaseRange(fitPreference.fitType);
  const weights = getCategoryWeights(fitPreference.category);

  interface ScoredCandidate {
    sizeLabel: string;
    totalScore: number;
    chestEaseMm: number;
    dimensionBreakdown: DimensionExplanation[];
  }

  const candidates: ScoredCandidate[] = [];

  // Step 2 & 3: Score candidate sizes
  if (layerUsed === "Layer3_Garment") {
    for (const g of garmentDimensions!) {
      const gChestCircMm = g.chestFlatMm * 2;
      const easeMm = gChestCircMm - profile.chestMm;
      const chestScore = calculateGaussianEaseScore(easeMm, targetEase, isStretch);

      let shoulderScore = 1.0;
      let shoulderDeltaMm = 0;
      if (profile.shoulderWidthMm && g.shoulderMm) {
        shoulderDeltaMm = g.shoulderMm - profile.shoulderWidthMm;
        // Shoulder span target varies by fit intent:
        // regular/slim: 10mm (sigma 30)
        // relaxed: 25mm (sigma 40)
        // oversized: 40mm (sigma 50)
        const targetShoulderDelta = fitPreference.fitType === "oversized" ? 40 : fitPreference.fitType === "relaxed" ? 25 : 10;
        const shoulderSigma = fitPreference.fitType === "oversized" ? 50 : 30;
        shoulderScore = Math.exp(-Math.pow(shoulderDeltaMm - targetShoulderDelta, 2) / (2 * shoulderSigma * shoulderSigma));
      }

      let compositeScore = (chestScore * weights.chest) + (shoulderScore * (weights.shoulder || 0.35));

      // Re-scale composite if weights sum to less than 1 due to missing secondary measurements
      const appliedWeightSum = weights.chest + (profile.shoulderWidthMm && g.shoulderMm ? (weights.shoulder || 0.35) : 0);
      if (appliedWeightSum > 0) {
        compositeScore = compositeScore / appliedWeightSum;
      }

      // Hard penalty: negative ease on non-stretch garment yields 0 score
      if (easeMm < 0 && !isStretch) {
        compositeScore = 0.0;
      }

      // Community correction factor (positive = runs large -> size down; negative = runs small -> size up)
      compositeScore += communityCorrectionFactor;

      const breakdown: DimensionExplanation[] = [
        {
          dimension: "Chest Circumference",
          bodyMeasurementMm: profile.chestMm,
          garmentSpecMm: gChestCircMm,
          easeDeltaMm: easeMm,
          easeTargetMm: { min: targetEase.min, max: targetEase.max },
          status:
            easeMm < targetEase.min ? "tight" : easeMm > targetEase.max ? "loose" : "ideal",
          rationale:
            easeMm < 0 && !isStretch
              ? `Negative ease (${Math.round(easeMm / 10)}cm). This garment will be constrictive across your chest.`
              : `Provides ${Math.round(easeMm / 10)}cm ease (target: ${targetEase.min / 10}–${targetEase.max / 10}cm for ${fitPreference.fitType} fit).`,
        },
      ];

      if (profile.shoulderWidthMm && g.shoulderMm) {
        breakdown.push({
          dimension: "Shoulder Width",
          bodyMeasurementMm: profile.shoulderWidthMm,
          garmentSpecMm: g.shoulderMm,
          easeDeltaMm: shoulderDeltaMm,
          easeTargetMm: { min: 0, max: 30 },
          status: shoulderDeltaMm < -10 ? "tight" : shoulderDeltaMm > 40 ? "loose" : "ideal",
          rationale: `Shoulder seam ${Math.round(g.shoulderMm / 10)}cm vs body shoulder ${Math.round(profile.shoulderWidthMm / 10)}cm.`,
        });
      }

      candidates.push({
        sizeLabel: g.sizeLabel,
        totalScore: Math.max(0, Math.min(1.0, compositeScore)),
        chestEaseMm: easeMm,
        dimensionBreakdown: breakdown,
      });
    }
  } else {
    // Layer 2: Brand Body Fit Charts
    for (const chart of brandSizeCharts!) {
      let score = 0.0;
      let easeDeltaMm = 0;
      if (chart.chestMinMm && chart.chestMaxMm) {
        const midMm = (chart.chestMinMm + chart.chestMaxMm) / 2;
        easeDeltaMm = profile.chestMm - midMm;

        if (profile.chestMm >= chart.chestMinMm && profile.chestMm <= chart.chestMaxMm) {
          const halfSpan = (chart.chestMaxMm - chart.chestMinMm) / 2;
          score = 1.0 - Math.abs(profile.chestMm - midMm) / (halfSpan * 1.5);
        } else {
          const dist = profile.chestMm < chart.chestMinMm
            ? chart.chestMinMm - profile.chestMm
            : profile.chestMm - chart.chestMaxMm;
          score = Math.max(0, 0.5 - (dist / 100));
        }
      }

      candidates.push({
        sizeLabel: chart.sizeLabel,
        totalScore: Math.max(0, Math.min(1.0, score + communityCorrectionFactor)),
        chestEaseMm: easeDeltaMm,
        dimensionBreakdown: [
          {
            dimension: "Brand Body Fit Range",
            bodyMeasurementMm: profile.chestMm,
            garmentSpecMm: (chart.chestMinMm && chart.chestMaxMm) ? Math.round((chart.chestMinMm + chart.chestMaxMm) / 2) : 0,
            easeDeltaMm,
            easeTargetMm: { min: chart.chestMinMm || 0, max: chart.chestMaxMm || 0 },
            status: score >= 0.7 ? "ideal" : "acceptable",
            rationale: `Your chest (${Math.round(profile.chestMm / 10)}cm) falls within the brand's recommended range (${Math.round((chart.chestMinMm || 0) / 10)}–${Math.round((chart.chestMaxMm || 0) / 10)}cm).`,
          },
        ],
      });
    }
  }

  // Step 4: Reference Garment Calibration Anchors
  if (referenceGarments && referenceGarments.length > 0) {
    for (const anchor of referenceGarments) {
      if (anchor.category === fitPreference.category) {
        const matchedCandidate = candidates.find((c) => c.sizeLabel === anchor.sizeLabel);
        if (matchedCandidate) {
          if (anchor.fitQuality === "perfect") {
            matchedCandidate.totalScore = Math.min(1.0, matchedCandidate.totalScore + 0.15);
          } else if (anchor.fitQuality === "too_tight") {
            matchedCandidate.totalScore = Math.max(0, matchedCandidate.totalScore - 0.15);
          } else if (anchor.fitQuality === "too_loose") {
            matchedCandidate.totalScore = Math.max(0, matchedCandidate.totalScore - 0.15);
          }
        }
      }
    }
  }

  // Step 5: Rank & Select
  candidates.sort((a, b) => b.totalScore - a.totalScore);
  const best = candidates[0];
  const runnerUp = candidates[1];

  if (!best || best.totalScore <= 0.05) {
    return {
      recommendedSize: "",
      fitScore: 0,
      confidence: 0.35,
      confidenceLabel: "insufficient",
      fitTypeUsed: fitPreference.fitType,
      isBorderline: false,
      summaryText: "No suitable size found that accommodates your measurements safely.",
      dimensionBreakdown: best ? best.dimensionBreakdown : [],
      dataSources: {
        layerUsed,
        provenance: "Verified Brand Official Specifications",
      },
    };
  }

  // Step 6: Borderline Detection
  const isBorderline = Boolean(
    runnerUp &&
    runnerUp.totalScore > 0.4 &&
    Math.abs(best.totalScore - runnerUp.totalScore) < 0.08
  );

  let borderlineTradeoff: string | undefined = undefined;
  if (isBorderline) {
    borderlineTradeoff = `Borderline between ${best.sizeLabel} and ${runnerUp.sizeLabel}. ${best.sizeLabel} offers a closer drape (${Math.round(best.chestEaseMm / 10)}cm ease), whereas ${runnerUp.sizeLabel} offers a more relaxed fit (${Math.round(runnerUp.chestEaseMm / 10)}cm ease).`;
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
  const confidenceLabel: "high" | "medium" | "low" | "insufficient" =
    confidence > 0.85
      ? "high"
      : confidence >= 0.65
      ? "medium"
      : confidence >= 0.40
      ? "low"
      : "insufficient";

  // Step 8: Plain-English Summary Text
  const summaryText =
    layerUsed === "Layer3_Garment"
      ? `Your chest (${Math.round(profile.chestMm / 10)}cm) fits best in size ${best.sizeLabel} with +${Math.round(best.chestEaseMm / 10)}cm ease for a ${fitPreference.fitType} fit.`
      : `Your chest (${Math.round(profile.chestMm / 10)}cm) fits best in size ${best.sizeLabel} based on brand fit ranges.`;

  return {
    recommendedSize: best.sizeLabel,
    alternativeSize: runnerUp ? runnerUp.sizeLabel : undefined,
    fitScore: Math.round(best.totalScore * 100),
    confidence,
    confidenceLabel,
    fitTypeUsed: fitPreference.fitType,
    isBorderline,
    borderlineTradeoff,
    summaryText,
    dimensionBreakdown: best.dimensionBreakdown,
    dataSources: {
      layerUsed,
      provenance: "Verified Official Specifications",
    },
  };
}
