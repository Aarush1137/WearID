import { ReferenceGarment } from "./types";

export interface CandidateSizeScore {
  sizeLabel: string;
  totalScore: number;
  [key: string]: any;
}

/**
 * Maps UserFitRating / fitQuality string to a numeric calibration adjustment delta.
 * Bounded by [-0.15, 0.15]
 */
export function getCalibrationDelta(rating?: string): number {
  switch (rating) {
    case "perfect":
      return 0.15;
    case "slightly_tight":
      return -0.08;
    case "too_tight":
      return -0.15;
    case "slightly_loose":
      return -0.08;
    case "too_loose":
      return -0.15;
    default:
      return 0.0;
  }
}

/**
 * Applies reference garment calibration anchors to candidate size scores.
 * Invariants:
 * - Reference garments from differing categories are ignored.
 * - Score adjustment for each candidate is strictly clamped to [-0.15, 0.15].
 * - Resulting scores are bounded to [0.0, 1.0].
 *
 * @param candidates List of scored candidate sizes
 * @param referenceGarments User-validated reference garments
 * @param targetCategory Garment category being evaluated
 */
export function applyReferenceGarmentCalibration<T extends CandidateSizeScore>(
  candidates: T[],
  referenceGarments: ReferenceGarment[] = [],
  targetCategory: string
): { candidates: T[]; totalCalibrationDeltaApplied: number; hasMatchingAnchor: boolean } {
  if (!referenceGarments || referenceGarments.length === 0 || candidates.length === 0) {
    return { candidates, totalCalibrationDeltaApplied: 0, hasMatchingAnchor: false };
  }

  const normalizedCategory = targetCategory.toLowerCase().trim();
  let hasMatchingAnchor = false;
  let maxDeltaApplied = 0;

  for (const anchor of referenceGarments) {
    const anchorCat = (anchor.category || "").toLowerCase().trim();
    // Invariant: Reference garment from different category is strictly ignored
    if (anchorCat !== normalizedCategory) {
      continue;
    }

    const rating = anchor.userFitRating || anchor.fitQuality;
    const delta = getCalibrationDelta(rating);
    if (delta === 0) continue;

    const matchedCandidate = candidates.find(
      (c) => c.sizeLabel.toLowerCase() === anchor.sizeLabel.toLowerCase()
    );

    if (matchedCandidate) {
      hasMatchingAnchor = true;
      // Clamp cumulative adjustment strictly to [-0.15, 0.15]
      const clampedDelta = Math.max(-0.15, Math.min(0.15, delta));
      maxDeltaApplied = clampedDelta;
      matchedCandidate.totalScore = Math.max(0.0, Math.min(1.0, matchedCandidate.totalScore + clampedDelta));
    }
  }

  return {
    candidates,
    totalCalibrationDeltaApplied: maxDeltaApplied,
    hasMatchingAnchor,
  };
}
