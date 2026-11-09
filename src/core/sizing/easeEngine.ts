import { FitType } from "../types";

export interface TargetEaseRange {
  min: number;
  max: number;
  midpoint: number;
  sigma: number;
}

/**
 * Returns expected chest ease ranges in canonical millimeters (mm) by fit intent.
 * Based on apparel pattern grading standards:
 * - Slim: 40mm–80mm (4cm–8cm)
 * - Regular: 80mm–140mm (8cm–14cm)
 * - Relaxed: 140mm–200mm (14cm–20cm)
 * - Oversized: 200mm–300mm (20cm–30cm)
 */
export function getTargetEaseRange(fitType: FitType): TargetEaseRange {
  switch (fitType) {
    case "slim":
      return { min: 40, max: 80, midpoint: 60, sigma: 25 };
    case "regular":
      return { min: 80, max: 140, midpoint: 110, sigma: 35 };
    case "relaxed":
      return { min: 140, max: 200, midpoint: 170, sigma: 45 };
    case "oversized":
      return { min: 200, max: 300, midpoint: 250, sigma: 65 };
  }
}

/**
 * Calculates Gaussian fit score centered at ideal ease midpoint.
 * All computations execute on canonical integer millimeters (mm).
 *
 * @param easeMm Total ease in mm (Garment circumference - Body girth)
 * @param target Target ease range for the chosen fit intent
 * @param isStretch Whether the fabric possesses stretch elasticity (e.g. >= 4% elastane)
 */
export function calculateGaussianEaseScore(
  easeMm: number,
  target: TargetEaseRange,
  isStretch: boolean = false
): number {
  if (easeMm < 0) {
    if (!isStretch) {
      // Rigid textiles (100% cotton, linen, wool) strictly reject negative ease
      return 0.0;
    }
    // High-stretch compression knit allows up to -80mm compression
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
 *
 * @param shoulderDeltaMm Difference between garment shoulder seam-to-seam and body biacromial width
 * @param fitType Fit intent (slim, regular, relaxed, oversized)
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
