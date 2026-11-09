import { describe, it, expect } from "vitest";
import {
  evaluateSizing,
  evaluateSizeRecommendation,
  calculateGaussianEaseScore,
  getTargetEaseRange,
  applyReferenceGarmentCalibration,
  detectBorderlineFit,
  evaluateFabricStretch,
  buildExplanationTree,
  flatMeasureToCircumference,
  AnatomicalProfile,
  GarmentDimensions,
  BrandSizeChart,
  FitPreference,
  FabricSpec,
  ReferenceGarment,
} from "../../src/core";

describe("Tier 5: Adversarial Hardening & Stress Harness", () => {
  // Common baseline profile
  const athleticProfile: AnatomicalProfile = {
    profileId: "00000000-0000-0000-0000-000000000099",
    chestMm: 1120, // 112 cm (44 inches) - Broad athletic chest
    waistMm: 760,  // 76 cm (30 inches) - Narrow waist (Drop = 360mm / ~14 inches)
    shoulderWidthMm: 480,
    hipsMm: 940,
    inseamMm: 820,
    isCurrent: true,
  };

  // =========================================================================
  // Challenge 1: Athletic Drop (Large Chest vs Narrow Waist)
  // =========================================================================
  describe("Adversarial Case 1: Athletic Drop Profile (Chest 1120mm, Waist 760mm)", () => {
    const boxyTee: GarmentDimensions = {
      productId: "tee_boxy",
      sizeLabel: "L",
      chestFlatMm: 600, // 1200mm circ -> +80mm chest ease (ideal regular)
      waistFlatMm: 590, // 1180mm circ -> +420mm waist ease (massive ballooning)
      shoulderMm: 490,
      lengthMm: 720,
    };

    const taperedTee: GarmentDimensions = {
      productId: "tee_tapered",
      sizeLabel: "L",
      chestFlatMm: 600, // 1200mm circ -> +80mm chest ease (ideal regular)
      waistFlatMm: 440, // 880mm circ -> +120mm waist ease (athletic taper)
      shoulderMm: 490,
      lengthMm: 720,
    };

    it("evaluates athletic drop: engine scores boxy and tapered cuts identically because waist is unweighted in Layer 3 tops", () => {
      const boxyResult = evaluateSizing({
        profile: athleticProfile,
        fitPreference: {
          profileId: athleticProfile.profileId,
          category: "tops",
          fitType: "regular",
        },
        garmentDimensions: [boxyTee],
      });

      const taperedResult = evaluateSizing({
        profile: athleticProfile,
        fitPreference: {
          profileId: athleticProfile.profileId,
          category: "tops",
          fitType: "regular",
        },
        garmentDimensions: [taperedTee],
      });

      // Both receive identical fit scores because Layer 3 candidate evaluation only weighs chest and shoulder
      expect(boxyResult.fitScore).toBe(taperedResult.fitScore);
      // ExplanationTree dimensionBreakdown does not report waist circumference for tops
      const boxyDims = boxyResult.dimensionBreakdown.map((d) => d.dimension);
      expect(boxyDims).not.toContain("Waist Circumference");
    });

    it("evaluates bottoms category with missing chest: fails validation because chestMm is hardcoded as mandatory across all categories", () => {
      const bottomsOnlyProfile: AnatomicalProfile = {
        profileId: "00000000-0000-0000-0000-000000000098",
        chestMm: 0, // No chest measured (user only buying jeans)
        waistMm: 800,
        inseamMm: 800,
        isCurrent: true,
      };

      const jeansDimensions: GarmentDimensions = {
        productId: "jeans_501",
        sizeLabel: "32",
        chestFlatMm: 0,
        waistFlatMm: 420,
        inseamMm: 810,
      };

      const result = evaluateSizing({
        profile: bottomsOnlyProfile,
        fitPreference: {
          profileId: bottomsOnlyProfile.profileId,
          category: "jeans",
          fitType: "regular",
        },
        garmentDimensions: [jeansDimensions],
      });

      // Refuses due to missing chest measurement even for pants
      expect(result.confidenceLabel).toBe("insufficient");
      expect(result.recommendedSize).toBe("");
    });
  });

  // =========================================================================
  // Challenge 2: Compression Stretch Knits
  // =========================================================================
  describe("Adversarial Case 2: Compression Stretch Knits (High Elastane vs Boundary Discontinuity)", () => {
    it("permits compression ease up to -100mm for stretch fabric (elastane >= 4%)", () => {
      const target = getTargetEaseRange("slim");
      const scoreNeg50 = calculateGaussianEaseScore(-50, target, true);
      const scoreNeg100 = calculateGaussianEaseScore(-100, target, true);
      const scoreNeg101 = calculateGaussianEaseScore(-101, target, true);

      expect(scoreNeg50).toBeGreaterThan(0.5); // 1 - 50/120 = 0.583
      expect(scoreNeg100).toBeGreaterThan(0.1); // 1 - 100/120 = 0.167
      expect(scoreNeg101).toBe(0.0); // Hard cutoff at -100mm
    });

    it("identifies boundary jump near zero ease for stretch knits between +1mm and -1mm", () => {
      const target = getTargetEaseRange("slim"); // midpoint: 60mm, sigma: 25mm
      const scorePlus1 = calculateGaussianEaseScore(1, target, true); // Gaussian: (1-60)^2 / (2*25^2) -> low score
      const scoreMinus1 = calculateGaussianEaseScore(-1, target, true); // Linear: 1 - 1/120 -> high score

      // Micro-delta of 2mm causes score divergence due to distinct piecewise formulas
      expect(scoreMinus1).toBeGreaterThan(scorePlus1);
    });

    it("correctly models fabric compression with evaluateFabricStretch helper", () => {
      const stretchSpec: FabricSpec = {
        materialComposition: "85% Polyester, 15% Elastane",
        elastanePercentage: 15,
        stretchLevel: "high",
        estimatedShrinkagePct: 1,
      };

      const stretchEval = evaluateFabricStretch(-40, stretchSpec, 1000);
      expect(stretchEval.allowable).toBe(true);
      expect(stretchEval.isStretch).toBe(true);
      expect(stretchEval.status).toBe("acceptable");
      expect(stretchEval.rationale).toContain("Compression fit");
    });
  });

  // =========================================================================
  // Challenge 3: Negative Ease Rejection on Rigid Denim & Cotton
  // =========================================================================
  describe("Adversarial Case 3: Negative Ease Rejection on Rigid Denim/Cotton (AGENTS.md Invariant 1 & 8)", () => {
    const rigidSpec: FabricSpec = {
      materialComposition: "100% Rigid Raw Denim Cotton",
      elastanePercentage: 0,
      stretchLevel: "none",
      estimatedShrinkagePct: 3,
    };

    it("strictly returns 0.0 score for negative chest ease on rigid fabric", () => {
      const target = getTargetEaseRange("regular");
      const score = calculateGaussianEaseScore(-10, target, false);
      expect(score).toBe(0.0);
    });

    it("evaluates fabric stretch helper to reject negative ease with pinch/constriction warning", () => {
      const evalResult = evaluateFabricStretch(-15, rigidSpec);
      expect(evalResult.allowable).toBe(false);
      expect(evalResult.score).toBe(0.0);
      expect(evalResult.status).toBe("tight");
      expect(evalResult.rationale).toContain("will restrict movement and pinch");
    });

    it("safely halts recommendation when all available sizes produce negative ease on rigid garment", () => {
      const userLarge: AnatomicalProfile = {
        profileId: "00000000-0000-0000-0000-000000000077",
        chestMm: 1200,
        isCurrent: true,
      };

      const smallGarments: GarmentDimensions[] = [
        { productId: "rigid_1", sizeLabel: "XS", chestFlatMm: 460 }, // 920mm circ (-280mm ease)
        { productId: "rigid_1", sizeLabel: "S", chestFlatMm: 490 },  // 980mm circ (-220mm ease)
        { productId: "rigid_1", sizeLabel: "M", chestFlatMm: 520 },  // 1040mm circ (-160mm ease)
      ];

      const result = evaluateSizing({
        profile: userLarge,
        fitPreference: {
          profileId: userLarge.profileId,
          category: "tshirt",
          fitType: "regular",
        },
        garmentDimensions: smallGarments,
        fabricSpec: rigidSpec,
      });

      // Zero hallucination safeguard: refuses to recommend constricting size
      expect(result.recommendedSize).toBe("");
      expect(result.confidenceLabel).toBe("insufficient");
      expect(result.summaryText).toContain("No suitable size found");
    });
  });

  // =========================================================================
  // Challenge 4: Multi-Benchmark Calibration Clamping
  // =========================================================================
  describe("Adversarial Case 4: Multi-Benchmark Calibration Clamping", () => {
    it("adjusts a single matching benchmark candidate by up to +/-0.15", () => {
      const candidates = [
        { sizeLabel: "M", totalScore: 0.50 },
        { sizeLabel: "L", totalScore: 0.50 },
      ];

      const singleRef: ReferenceGarment[] = [
        { category: "tshirt", sizeLabel: "M", fitQuality: "perfect" },
      ];

      const result = applyReferenceGarmentCalibration(candidates, singleRef, "tshirt");
      const matched = result.candidates.find((c) => c.sizeLabel === "M")!;
      expect(matched.totalScore).toBe(0.65); // 0.50 + 0.15
    });

    it("verifies behavior when multiple benchmark anchors exist for the same candidate size", () => {
      const candidates = [
        { sizeLabel: "M", totalScore: 0.50 },
      ];

      // Two separate validated garments both rated 'perfect'
      const multipleRefs: ReferenceGarment[] = [
        { category: "tshirt", sizeLabel: "M", fitQuality: "perfect" },
        { category: "tshirt", sizeLabel: "M", fitQuality: "perfect" },
      ];

      const result = applyReferenceGarmentCalibration(candidates, multipleRefs, "tshirt");
      const matched = result.candidates.find((c) => c.sizeLabel === "M")!;

      // Documents whether individual anchors accumulate (+0.30) or clamp cumulatively (+0.15)
      // Note: Current implementation clamps each delta to 0.15 individually:
      expect(matched.totalScore).toBe(0.80);
    });

    it("strictly ignores benchmarks from disparate apparel categories", () => {
      const candidates = [{ sizeLabel: "M", totalScore: 0.50 }];
      const wrongCatRef: ReferenceGarment[] = [
        { category: "jeans", sizeLabel: "M", fitQuality: "perfect" },
      ];

      const result = applyReferenceGarmentCalibration(candidates, wrongCatRef, "tshirt");
      expect(result.candidates[0].totalScore).toBe(0.50);
      expect(result.hasMatchingAnchor).toBe(false);
    });
  });

  // =========================================================================
  // Challenge 5: Borderline Score Deltas (|score0 - score1| = 0.079 vs 0.081)
  // =========================================================================
  describe("Adversarial Case 5: Borderline Score Threshold Boundary (0.079 vs 0.080 vs 0.081)", () => {
    it("flags isBorderline = true when score delta is strictly below 0.080 (delta = 0.079)", () => {
      const best = { sizeLabel: "M", totalScore: 0.850, chestEaseMm: 80 };
      const runnerUp = { sizeLabel: "L", totalScore: 0.771, chestEaseMm: 130 }; // delta = 0.079

      const detection = detectBorderlineFit(best, runnerUp, 0.08);
      expect(detection.isBorderline).toBe(true);
      expect(detection.alternativeSize).toBe("L");
      expect(detection.borderlineTradeoff).toBeDefined();
      expect(detection.borderlineTradeoff).toContain("Borderline between M and L");
    });

    it("identifies IEEE-754 floating-point cancellation anomaly when delta is mathematically 0.080 (0.850 - 0.770 vs 0.800 - 0.720)", () => {
      // Pair 1: mathematically 0.080, but float subtraction yields 0.07999999999999996
      const best1 = { sizeLabel: "M", totalScore: 0.850, chestEaseMm: 80 };
      const runnerUp1 = { sizeLabel: "L", totalScore: 0.770, chestEaseMm: 130 };
      const rawDelta1 = best1.totalScore - runnerUp1.totalScore;
      expect(rawDelta1).toBeLessThan(0.08);

      const detection1 = detectBorderlineFit(best1, runnerUp1, 0.08);
      expect(detection1.isBorderline).toBe(true); // Falsely treated as borderline (< 0.08)

      // Pair 2: mathematically 0.080, but float subtraction yields 0.08000000000000007
      const best2 = { sizeLabel: "M", totalScore: 0.800, chestEaseMm: 80 };
      const runnerUp2 = { sizeLabel: "L", totalScore: 0.720, chestEaseMm: 130 };
      const rawDelta2 = best2.totalScore - runnerUp2.totalScore;
      expect(rawDelta2).toBeGreaterThan(0.08);

      const detection2 = detectBorderlineFit(best2, runnerUp2, 0.08);
      expect(detection2.isBorderline).toBe(false); // Inconsistent outcome for identical 0.080 decimal deltas!
    });

    it("flags isBorderline = false when score delta exceeds 0.080 (delta = 0.081)", () => {
      const best = { sizeLabel: "M", totalScore: 0.850, chestEaseMm: 80 };
      const runnerUp = { sizeLabel: "L", totalScore: 0.769, chestEaseMm: 130 }; // delta = 0.081

      const detection = detectBorderlineFit(best, runnerUp, 0.08);
      expect(detection.isBorderline).toBe(false);
      expect(detection.alternativeSize).toBeUndefined();
    });

    it("suppresses borderline flag when runner-up is not a viable fit (score <= 0.40)", () => {
      const best = { sizeLabel: "M", totalScore: 0.440, chestEaseMm: 80 };
      const runnerUp = { sizeLabel: "L", totalScore: 0.390, chestEaseMm: 130 }; // delta = 0.050 (< 0.08)

      const detection = detectBorderlineFit(best, runnerUp, 0.08);
      // Suppressed because runner-up is below the 0.40 viable fit threshold
      expect(detection.isBorderline).toBe(false);
    });
  });
});
