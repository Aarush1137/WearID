export interface CandidateForBorderline {
  sizeLabel: string;
  totalScore: number;
  chestEaseMm?: number;
}

export interface BorderlineDetectionResult {
  isBorderline: boolean;
  alternativeSize?: string;
  borderlineTradeoff?: string;
}

/**
 * Detects borderline fits between candidate sizes.
 * Invariant: If |score0 - score1| < 0.08 (8 percentage points) and runner-up is viable (> 0.40),
 * flags isBorderline = true and synthesizes a plain-English comparative tradeoff narrative.
 */
export function detectBorderlineFit(
  best?: CandidateForBorderline,
  runnerUp?: CandidateForBorderline,
  threshold: number = 0.08
): BorderlineDetectionResult {
  if (!best || !runnerUp) {
    return { isBorderline: false };
  }

  // Runner-up must be a viable size candidate (> 0.40 / 40%) to warrant a genuine tradeoff
  if (runnerUp.totalScore <= 0.40) {
    return { isBorderline: false };
  }

  const scoreDelta = Math.abs(best.totalScore - runnerUp.totalScore);
  const isBorderline = scoreDelta < threshold;

  if (!isBorderline) {
    return { isBorderline: false };
  }

  const bestEaseCm = Math.round((best.chestEaseMm ?? 0) / 10);
  const runnerEaseCm = Math.round((runnerUp.chestEaseMm ?? 0) / 10);

  // Determine which size is closer / tailored and which is more relaxed
  let closerSize = best;
  let relaxedSize = runnerUp;
  if ((runnerUp.chestEaseMm ?? 0) < (best.chestEaseMm ?? 0)) {
    closerSize = runnerUp;
    relaxedSize = best;
  }

  const closerEaseCm = Math.round((closerSize.chestEaseMm ?? 0) / 10);
  const relaxedEaseCm = Math.round((relaxedSize.chestEaseMm ?? 0) / 10);

  const borderlineTradeoff = `Borderline between ${best.sizeLabel} and ${runnerUp.sizeLabel}. ${closerSize.sizeLabel} offers a closer drape (+${closerEaseCm}cm ease), whereas ${relaxedSize.sizeLabel} provides more relaxed room (+${relaxedEaseCm}cm ease).`;

  return {
    isBorderline: true,
    alternativeSize: runnerUp.sizeLabel,
    borderlineTradeoff,
  };
}
