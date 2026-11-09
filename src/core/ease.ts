import { FabricSpec, FitType, TargetEaseRange } from "./types";

/**
 * Converts flat half-measurements laid flat to full circumference in millimeters.
 * Physical garment dimension laid flat: Circumference = flat * 2
 */
export function flatMeasureToCircumference(flatMm: number): number {
  if (flatMm < 0) {
    throw new RangeError("Dimension cannot be negative.");
  }
  return Math.round(flatMm * 2);
}

/**
 * Calculates total ease in canonical millimeters:
 * Total Ease = Garment Circumference - Body Circumference
 */
export function calculateTotalEase(garmentCircumferenceMm: number, bodyCircumferenceMm: number): number {
  return garmentCircumferenceMm - bodyCircumferenceMm;
}

/**
 * Standard apparel target ease bands in canonical millimeters (mm) by fit intent.
 * - Slim: 40mm–80mm (4cm–8cm), midpoint 60mm
 * - Regular: 80mm–140mm (8cm–14cm), midpoint 110mm
 * - Relaxed: 140mm–200mm (14cm–20cm), midpoint 170mm
 * - Oversized: 200mm–300mm (20cm–30cm), midpoint 250mm
 */
export const TARGET_EASE_TABLE: Record<FitType, TargetEaseRange> = {
  slim: { min: 40, max: 80, midpoint: 60, sigma: 25 },
  regular: { min: 80, max: 140, midpoint: 110, sigma: 35 },
  relaxed: { min: 140, max: 200, midpoint: 170, sigma: 45 },
  oversized: { min: 200, max: 300, midpoint: 250, sigma: 65 },
};

/**
 * Returns expected chest ease range in canonical millimeters (mm) by fit intent.
 */
export function getTargetEaseRange(fitType: FitType): TargetEaseRange {
  return TARGET_EASE_TABLE[fitType] || TARGET_EASE_TABLE.regular;
}

export const getTargetChestEaseRange = getTargetEaseRange;

/**
 * Evaluates trapezoidal/plateau Gaussian scoring:
 * - Within target ease range [min, max], fit score is an ideal 1.0 (100%).
 * - Outside the target range, fit score decays smoothly according to a half-Gaussian curve.
 *
 * @param actualEaseMm Garment ease delta in mm
 * @param target Target ease range with min, max, sigma
 */
export function calculatePlateauGaussianScore(actualEaseMm: number, target: TargetEaseRange): number {
  if (actualEaseMm >= target.min && actualEaseMm <= target.max) {
    return 1.0;
  }
  const deviation = actualEaseMm < target.min ? target.min - actualEaseMm : actualEaseMm - target.max;
  const score = Math.exp(-(deviation * deviation) / (2 * target.sigma * target.sigma));
  return Math.min(1.0, Math.max(0.0, Math.round(score * 1000) / 1000));
}

/**
 * Evaluates Gaussian fit score centered at target ease midpoint:
 * - Score = exp( - (actualEase - midpoint)^2 / (2 * sigma^2) )
 * - Exact midpoint yields 1.0.
 * - Negative ease on rigid fabric (0% elastane) returns strictly 0.0.
 * - Negative ease on stretch knit allows compression ease.
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
    // High-stretch compression knit allows up to -100mm compression
    if (easeMm < -100) return 0.0;
    return Math.max(0, Math.round((1.0 - Math.abs(easeMm) / 120) * 1000) / 1000);
  }

  const deviation = easeMm - target.midpoint;
  const score = Math.exp(-(deviation * deviation) / (2 * target.sigma * target.sigma));
  return Math.round(score * 1000) / 1000;
}

/**
 * Calculates shoulder fit score based on shoulder delta (garment shoulder - body shoulder).
 * Accounts for drop-shoulder patterns in relaxed and oversized cuts.
 */
export function calculateShoulderScore(
  shoulderDeltaMm: number,
  fitType: FitType = "regular"
): number {
  const targetDelta = fitType === "oversized" ? 40 : fitType === "relaxed" ? 25 : 10;
  const sigma = fitType === "oversized" ? 50 : 30;

  const deviation = shoulderDeltaMm - targetDelta;
  const score = Math.exp(-(deviation * deviation) / (2 * sigma * sigma));
  return Math.round(score * 1000) / 1000;
}

/**
 * Category-Specific Measurement Weighting Distributions
 * Reflects how critical each anatomical dimension is to the fit of that garment type.
 *
 * Requirements:
 * - Tops: Chest 0.50, Waist 0.20, Shoulder 0.15, Length 0.15 (tshirt/polo: 0.40/0.35/0.15/0.10)
 * - Bottoms: Waist 0.40, Hips 0.30, Inseam 0.20, Thigh 0.10 (jeans: 0.40/0.35/0.25)
 * - Outerwear: Chest 0.40, Shoulder 0.25, Sleeve 0.20, Length 0.15
 * - Ethnic (Kurtas): Chest 0.45, Shoulder 0.25, Length 0.20, Waist 0.10 (kurta: 0.35/0.25/0.25/0.15)
 */
export function getCategoryWeights(category: string): Record<string, number> {
  const normalized = category.toLowerCase().trim();
  switch (normalized) {
    // Specific Top Subcategories
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

    // General Tops
    case "tops":
    case "top":
      return { chest: 0.50, waist: 0.20, shoulder: 0.15, length: 0.15 };

    // Specific Bottom Subcategories
    case "jeans":
      return { waist: 0.40, inseam: 0.35, thigh: 0.25 };

    case "trousers":
    case "chinos":
      return { waist: 0.40, inseam: 0.30, thigh: 0.20, rise: 0.10 };

    // General Bottoms
    case "bottoms":
    case "bottom":
    case "pants":
      return { waist: 0.40, hips: 0.30, inseam: 0.20, thigh: 0.10 };

    // Outerwear
    case "outerwear":
    case "jacket":
    case "coat":
    case "blazer":
      return { chest: 0.40, shoulder: 0.25, sleeve: 0.20, length: 0.15 };

    // Ethnic Wear (Kurtas, Sherwanis)
    case "kurta":
      return { chest: 0.35, shoulder: 0.25, torso_length: 0.25, sleeve: 0.15 };

    case "ethnic":
    case "ethnic_wear":
    case "sherwani":
      return { chest: 0.45, shoulder: 0.25, length: 0.20, waist: 0.10 };

    case "shoe":
    case "shoes":
    case "footwear":
      return { foot_length: 1.0 };

    default:
      return { chest: 0.50, shoulder: 0.30, length: 0.20 };
  }
}

/**
 * Evaluates fabric stretch tolerance and tension impact.
 * - Rigid fabrics (0% elastane): strictly rejects negative ease (score 0.0)
 * - Stretch knits (>=5% elastane or high stretch): allows compression ease up to allowable limit
 */
export function evaluateFabricStretch(
  easeMm: number,
  fabricSpec?: FabricSpec,
  bodyCircumferenceMm?: number
): {
  isRigid: boolean;
  isStretch: boolean;
  allowable: boolean;
  score: number;
  status: "ideal" | "tight" | "loose" | "acceptable";
  rationale: string;
} {
  const elastane = fabricSpec?.elastanePercentage ?? 0;
  const isStretch = elastane >= 4 || fabricSpec?.stretchLevel === "high";
  const isRigid = !isStretch;

  if (easeMm < 0) {
    if (isRigid) {
      return {
        isRigid: true,
        isStretch: false,
        allowable: false,
        score: 0.0,
        status: "tight",
        rationale: `Negative ease (${Math.round(easeMm / 10)}cm) on rigid fabric (0% elastane) will restrict movement and pinch.`,
      };
    }

    // Stretch fabric permits compression ease
    const maxCompression = bodyCircumferenceMm
      ? Math.min(100, Math.round(bodyCircumferenceMm * Math.min(0.3, elastane / 100)))
      : 80;

    const absEase = Math.abs(easeMm);
    if (absEase <= maxCompression) {
      const compressionScore = Math.max(0.4, 1.0 - absEase / (maxCompression * 1.5));
      return {
        isRigid: false,
        isStretch: true,
        allowable: true,
        score: Math.round(compressionScore * 1000) / 1000,
        status: "acceptable",
        rationale: `Compression fit (${Math.round(easeMm / 10)}cm ease) accommodated by ${elastane}% elastane stretch elasticity.`,
      };
    } else {
      return {
        isRigid: false,
        isStretch: true,
        allowable: false,
        score: 0.0,
        status: "tight",
        rationale: `Negative ease (${Math.round(easeMm / 10)}cm) exceeds fabric stretch compression capacity (${Math.round(maxCompression / 10)}cm).`,
      };
    }
  }

  return {
    isRigid,
    isStretch,
    allowable: true,
    score: 1.0,
    status: "ideal",
    rationale: `Positive ease (+${Math.round(easeMm / 10)}cm) provides sufficient drape.`,
  };
}
