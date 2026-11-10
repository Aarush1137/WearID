/**
 * Deterministic Bra Sizing & Intimates Engine
 * Conforms to AGENTS.md Invariant 4 (canonical mm inputs) & Invariant 8 (explainability).
 * Follows modern ISO / UK / Indian NIFT underbust-to-bust apex differential standard.
 */

export interface BraSizingResult {
  bandSize: number;         // e.g. 34 (inches)
  cupLetter: string;        // e.g. "C"
  fullBraSize: string;      // e.g. "34C"
  underbustMm: number;
  bustApexMm: number;
  diffInches: number;
  sisterSizes: {
    tighterBand: string;    // e.g. "32D"
    looserBand: string;     // e.g. "36B"
  };
  explanation: string;
}

const CUP_TABLE: Array<{ minDiff: number; maxDiff: number; cup: string }> = [
  { minDiff: -99, maxDiff: 0.5, cup: "AA" },
  { minDiff: 0.5, maxDiff: 1.5, cup: "A" },
  { minDiff: 1.5, maxDiff: 2.5, cup: "B" },
  { minDiff: 2.5, maxDiff: 3.5, cup: "C" },
  { minDiff: 3.5, maxDiff: 4.5, cup: "D" },
  { minDiff: 4.5, maxDiff: 5.5, cup: "DD" },
  { minDiff: 5.5, maxDiff: 6.5, cup: "E" },
  { minDiff: 6.5, maxDiff: 7.5, cup: "F" },
  { minDiff: 7.5, maxDiff: 8.5, cup: "FF" },
  { minDiff: 8.5, maxDiff: 99, cup: "G" },
];

const CUP_ORDER = ["AA", "A", "B", "C", "D", "DD", "E", "F", "FF", "G"];

/**
 * Calculates deterministic bra size from canonical millimeter measurements.
 * @param underbustMm Ribcage circumference directly beneath bust (in mm)
 * @param bustApexMm Fullest horizontal circumference across bust apex (in mm)
 */
export function calculateBraSize(underbustMm: number, bustApexMm: number): BraSizingResult {
  if (!underbustMm || underbustMm <= 0 || !bustApexMm || bustApexMm <= 0) {
    throw new Error("Invalid anatomical biometrics for bra sizing: underbust and bust must be > 0.");
  }

  // Convert to inches with high precision
  const underbustInches = underbustMm / 25.4;
  const bustApexInches = bustApexMm / 25.4;

  // Snug Band Size: Round to nearest standard even band (28, 30, 32, 34, 36, 38, 40, 42, 44, 46)
  let roundedBand = Math.round(underbustInches);
  if (roundedBand % 2 !== 0) {
    // If odd, round to nearest even based on decimal
    roundedBand = (underbustInches - Math.floor(underbustInches) >= 0.5)
      ? roundedBand + 1
      : roundedBand - 1;
  }
  // Enforce standard band bounds [28..48]
  const bandSize = Math.max(28, Math.min(48, roundedBand));

  // Cup difference: Bust apex minus exact underbust
  const diffInches = Math.max(0, bustApexInches - (bandSize * 25.4 < underbustMm ? bandSize : underbustInches));
  const roundedDiff = Math.round(diffInches * 10) / 10;

  // Find cup letter
  const cupEntry = CUP_TABLE.find(
    (entry) => roundedDiff >= entry.minDiff && roundedDiff < entry.maxDiff
  ) || CUP_TABLE[CUP_TABLE.length - 1];

  const cupLetter = cupEntry.cup;
  const fullBraSize = `${bandSize}${cupLetter}`;

  // Sister sizing:
  // Sister size tighter band: Band - 2, Cup + 1
  // Sister size looser band: Band + 2, Cup - 1
  const currentCupIdx = CUP_ORDER.indexOf(cupLetter);
  const tighterCup = currentCupIdx < CUP_ORDER.length - 1 ? CUP_ORDER[currentCupIdx + 1] : cupLetter;
  const looserCup = currentCupIdx > 0 ? CUP_ORDER[currentCupIdx - 1] : cupLetter;

  const sisterSizes = {
    tighterBand: `${bandSize - 2}${tighterCup}`,
    looserBand: `${bandSize + 2}${looserCup}`,
  };

  const explanation = `Underbust of ${Math.round(underbustMm / 10)}cm aligns with Band ${bandSize}. Bust apex differential of +${roundedDiff}" corresponds to Cup ${cupLetter}. Cross-band equivalent fits offer alternative band firmness while preserving the exact same cup volume.`;

  return {
    bandSize,
    cupLetter,
    fullBraSize,
    underbustMm,
    bustApexMm,
    diffInches: roundedDiff,
    sisterSizes,
    explanation,
  };
}
