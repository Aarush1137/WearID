import { FabricSpec, FitType, TargetEaseRange } from "../types";
import { getTargetEaseRange } from "../ease";

export interface ReturnRiskCalculationInput {
  category: string;
  fitIntent?: FitType;
  recommendedSize: string;
  fitScore?: number;
  isBorderline?: boolean;
  scoreDeltaToRunnerUp?: number;
  actualChestEaseMm?: number;
  targetChestEase?: TargetEaseRange;
  actualWaistEaseMm?: number;
  targetWaistEase?: TargetEaseRange;
  fabricSpec?: FabricSpec;
}

export interface ReturnRatePrediction {
  riskScore: number; // 0 to 100 percentage (integer)
  riskLevel: "low" | "moderate" | "high";
  baselineCategoryRate: number;
  easeRiskContribution: number;
  borderlineRiskContribution: number;
  fabricCushioningMultiplier: number;
  primaryRiskDrivers: string[];
  actionableAdvice: string;
}

/**
 * Category baseline return rates derived from apparel eCommerce statistics.
 */
const CATEGORY_BASELINES: Record<string, number> = {
  shoes: 28,
  footwear: 28,
  trousers_chinos: 24,
  trousers: 24,
  chinos: 24,
  jeans: 22,
  denim: 22,
  dress: 22,
  dresses: 22,
  shirt_formal: 20,
  formal_shirts: 20,
  jacket: 16,
  blazer: 16,
  outerwear: 16,
  t_shirt: 12,
  t_shirt_oversized: 12,
  polo: 12,
  hoodie: 12,
  tshirt: 12,
};

/**
 * Returns baseline eCommerce return rate for a given apparel category.
 */
export function getCategoryBaselineRate(category?: string): number {
  if (!category) return 18;
  const normalized = category.toLowerCase().trim().replace(/[-\s]/g, "_");
  return CATEGORY_BASELINES[normalized] ?? 18;
}

/**
 * Returns fabric cushioning multiplier based on elastane percentage.
 * - 0% elastane (rigid): 1.25x penalty (inflexible textile)
 * - 1-2% elastane: 1.05x
 * - 3-5% elastane: 0.85x (forgiving stretch)
 * - >= 6% elastane: 0.70x (compression / elastic knit)
 */
export function getFabricCushioningMultiplier(fabricSpec?: FabricSpec): number {
  const elastane = fabricSpec?.elastanePercentage ?? 0;
  if (elastane >= 6) return 0.7;
  if (elastane >= 3) return 0.85;
  if (elastane >= 1) return 1.05;
  return 1.25;
}

/**
 * Evaluates ease delta contribution against target ease range.
 */
function evaluateEaseFactor(
  actualEaseMm: number,
  target: TargetEaseRange,
  elastane: number,
  drivers: string[]
): number {
  const { min, max } = target;
  const midpoint = (min + max) / 2;
  const halfSpan = Math.max(1, (max - min) / 2);

  // Case A: Within Target
  if (actualEaseMm >= min && actualEaseMm <= max) {
    const deviation = Math.abs(actualEaseMm - midpoint);
    const easeFactor = (deviation / halfSpan) * 8;
    return easeFactor;
  }

  // Case B: Tight Fit (Ease below target minimum)
  if (actualEaseMm < min) {
    const deficit = min - actualEaseMm;
    let factor = 15 + Math.min(35, (deficit / 30) * 20);

    drivers.push(
      `Ease (${actualEaseMm}mm) is ${deficit}mm below the recommended ${min}mm minimum for target silhouette.`
    );

    // Critical Invariant: Negative ease on rigid textile (< 4% elastane)
    if (actualEaseMm < 0 && elastane < 4) {
      factor += 30;
      drivers.push(
        `Negative ease (${actualEaseMm}mm) on rigid fabric (${elastane}% elastane) causes physical constriction and severe return likelihood.`
      );
    }

    return factor;
  }

  // Case C: Loose Fit (Ease above target maximum)
  const surplus = actualEaseMm - max;
  const factor = 8 + Math.min(20, (surplus / 50) * 12);
  drivers.push(
    `Ease (${actualEaseMm}mm) exceeds the recommended ${max}mm upper bound by +${surplus}mm, creating excess fullness.`
  );
  return factor;
}

/**
 * Predicts statistical return rate for an apparel size recommendation.
 * Grounded in deterministic 4-vector model:
 * Vector 1: Category baseline rate (12% - 28%)
 * Vector 2: Ease delta vs target fit intent bounds (+0% to +65%)
 * Vector 3: Borderline proximity penalty (+12% to +22%)
 * Vector 4: Fabric elasticity cushioning multiplier (0.70x to 1.25x)
 */
export function predictReturnRate(input: ReturnRiskCalculationInput): ReturnRatePrediction {
  const drivers: string[] = [];
  const fitIntent = input.fitIntent || "regular";
  const elastane = input.fabricSpec?.elastanePercentage ?? 0;

  // Vector 1: Category Baseline
  const baselineCategoryRate = getCategoryBaselineRate(input.category);
  if (baselineCategoryRate >= 24) {
    drivers.push(
      `Category baseline return risk for ${input.category} is elevated (${baselineCategoryRate}%) due to structural fit sensitivity.`
    );
  }

  // Vector 2: Ease Delta Factor
  let easeRiskContribution = 0;
  const targetEase = input.targetChestEase || getTargetEaseRange(fitIntent);

  if (typeof input.actualChestEaseMm === "number") {
    easeRiskContribution = evaluateEaseFactor(
      input.actualChestEaseMm,
      targetEase,
      elastane,
      drivers
    );
  } else if (typeof input.actualWaistEaseMm === "number") {
    const waistTarget = input.targetWaistEase || { min: 20, max: 50, midpoint: 35, sigma: 20 };
    easeRiskContribution = evaluateEaseFactor(
      input.actualWaistEaseMm,
      waistTarget,
      elastane,
      drivers
    );
  }

  // Vector 3: Borderline Proximity
  let borderlineRiskContribution = 0;
  const isBorderline =
    Boolean(input.isBorderline) ||
    (typeof input.scoreDeltaToRunnerUp === "number" && input.scoreDeltaToRunnerUp < 0.08);

  if (isBorderline) {
    borderlineRiskContribution = 22;
    drivers.push(
      "Borderline fit match: runner-up size is closely competing, increasing sizing uncertainty and bracketing risk."
    );
  } else if (
    typeof input.scoreDeltaToRunnerUp === "number" &&
    input.scoreDeltaToRunnerUp < 0.15
  ) {
    borderlineRiskContribution = 12;
    drivers.push(
      "Adjacent size provides comparable fit score; slight bracketing return probability detected."
    );
  }

  // Vector 4: Fabric Elastane Cushioning Multiplier
  const fabricCushioningMultiplier = getFabricCushioningMultiplier(input.fabricSpec);
  if (elastane === 0) {
    drivers.push("Rigid textile (0% elastane) has zero stretch tolerance, amplifying ease deviation risk.");
  } else if (elastane >= 6) {
    drivers.push(`Elastic knit (${elastane}% elastane) cushions minor ease deviations.`);
  }

  // Calculate Combined Raw Risk Score
  const rawScore =
    (baselineCategoryRate + easeRiskContribution + borderlineRiskContribution) *
    fabricCushioningMultiplier;

  // Clamped between 5% and 95%
  const riskScore = Math.round(Math.max(5, Math.min(95, rawScore)));

  // Categorize Risk Level
  let riskLevel: "low" | "moderate" | "high";
  if (riskScore <= 20) {
    riskLevel = "low";
  } else if (riskScore <= 45) {
    riskLevel = "moderate";
  } else {
    riskLevel = "high";
  }

  // Synthesize Actionable Advice
  let actionableAdvice: string;
  if (riskLevel === "low") {
    actionableAdvice = `Size ${input.recommendedSize} demonstrates high fit stability with minimal projected return risk (${riskScore}%). Purchase with high confidence.`;
  } else if (riskLevel === "moderate") {
    if (isBorderline) {
      actionableAdvice = `Size ${input.recommendedSize} is borderline with an adjacent size. If you prefer a tailored silhouette, keep Size ${input.recommendedSize}; for a roomier drape, consider sizing up.`;
    } else if (easeRiskContribution > 10) {
      actionableAdvice = `Ease falls outside optimal center for ${fitIntent} fit. Verify shoulder and chest dimensions before placing order.`;
    } else {
      actionableAdvice = `Moderate return likelihood (${riskScore}%). Check garment dimensions against your best-fitting reference item.`;
    }
  } else {
    if (typeof input.actualChestEaseMm === "number" && input.actualChestEaseMm < targetEase.min) {
      actionableAdvice = `High return risk (${riskScore}%): Size ${input.recommendedSize} is substantially tighter than your ${fitIntent} preference. We strongly recommend sizing up.`;
    } else if (isBorderline) {
      actionableAdvice = `High bracketing risk (${riskScore}%). We advise checking the detailed ease breakdown or opting for the larger size if in doubt.`;
    } else {
      actionableAdvice = `High predicted return probability (${riskScore}%). Dimensional tolerance is narrow for this product and fabric composition.`;
    }
  }

  // If drivers is empty (optimal fit), add reassurance driver
  if (drivers.length === 0) {
    drivers.push(`Ease is well centered within the ${targetEase.min}-${targetEase.max}mm target range.`);
  }

  return {
    riskScore,
    riskLevel,
    baselineCategoryRate,
    easeRiskContribution: Math.round(easeRiskContribution * 10) / 10,
    borderlineRiskContribution,
    fabricCushioningMultiplier,
    primaryRiskDrivers: drivers,
    actionableAdvice,
  };
}
