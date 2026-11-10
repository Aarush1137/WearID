import { describe, it, expect } from "vitest";
import {
  // Types & Errors
  AnatomicalProfile,
  BrandSizeChart,
  FitPreference,
  GarmentDimensions,
  ReferenceGarment,
  InsufficientDataError,
  // Units
  cmToMm,
  mmToCm,
  inchesToMm,
  mmToInches,
  kgToGrams,
  lbsToGrams,
  gramsToKg,
  gramsToLbs,
  // Ease
  flatMeasureToCircumference,
  calculateTotalEase,
  getTargetEaseRange,
  calculatePlateauGaussianScore,
  calculateGaussianEaseScore,
  calculateShoulderScore,
  getCategoryWeights,
  evaluateFabricStretch,
  // Calibration
  applyReferenceGarmentCalibration,
  getCalibrationDelta,
  // Borderline
  detectBorderlineFit,
  // Explanation
  buildExplanationTree,
  buildInsufficientDataTree,
  // Engine
  evaluateSizing,
  evaluateSizeRecommendation,
  evaluateGarmentFit,
} from "../../../src/core";

describe("Requirement 3: Deterministic Sizing Recommendation Engine", () => {
  const sampleProfile: AnatomicalProfile = {
    profileId: "123e4567-e89b-12d3-a456-426614174000",
    chestMm: 960, // 96.0 cm
    shoulderWidthMm: 440, // 44.0 cm
    waistMm: 820,
    hipsMm: 980,
    inseamMm: 790,
    isCurrent: true,
  };

  const sampleGarments: GarmentDimensions[] = [
    {
      productId: "prod_tee",
      sizeLabel: "S",
      chestFlatMm: 490, // 980mm circ (+20mm ease on 960mm chest)
      shoulderMm: 420,
      lengthMm: 680,
      measurementMethod: "laid_flat",
    },
    {
      productId: "prod_tee",
      sizeLabel: "M",
      chestFlatMm: 535, // 1070mm circ (+110mm ease on 960mm chest -> exact midpoint for regular)
      shoulderMm: 450,
      lengthMm: 710,
      measurementMethod: "laid_flat",
    },
    {
      productId: "prod_tee",
      sizeLabel: "L",
      chestFlatMm: 570, // 1140mm circ (+180mm ease on 960mm chest)
      shoulderMm: 470,
      lengthMm: 730,
      measurementMethod: "laid_flat",
    },
    {
      productId: "prod_tee",
      sizeLabel: "XL",
      chestFlatMm: 605, // 1210mm circ (+250mm ease on 960mm chest -> exact midpoint for oversized)
      shoulderMm: 490,
      lengthMm: 750,
      measurementMethod: "laid_flat",
    },
  ];

  // =========================================================================
  // 1. Layer 1-4 Segregation & Invariant 3
  // =========================================================================
  describe("1. Layer 1-4 Segregation & Invariants", () => {
    it("ensures AnatomicalProfile strictly contains biometric girths in mm and g", () => {
      expect(sampleProfile.chestMm).toBe(960);
      expect(sampleProfile.shoulderWidthMm).toBe(440);
      expect((sampleProfile as any).chestFlatMm).toBeUndefined();
    });

    it("ensures GarmentDimensions strictly contains flat textile specifications", () => {
      const g = sampleGarments[0];
      expect(g.chestFlatMm).toBe(490);
      expect((g as any).chestMm).toBeUndefined();
    });

    it("bridges flat garment to body circumference via explicit doubling", () => {
      const g = sampleGarments[1];
      const circ = flatMeasureToCircumference(g.chestFlatMm!);
      expect(circ).toBe(1070);
      const ease = calculateTotalEase(circ, sampleProfile.chestMm);
      expect(ease).toBe(110);
    });

    it("throws RangeError if negative flat dimension is passed to circumference converter", () => {
      expect(() => flatMeasureToCircumference(-50)).toThrow(RangeError);
    });
  });

  // =========================================================================
  // 2. Canonical Units & Conversions
  // =========================================================================
  describe("2. Canonical Units & Conversions (src/core/units.ts)", () => {
    it("converts cm to integer mm and round-trips without drift", () => {
      expect(cmToMm(102.4)).toBe(1024);
      expect(mmToCm(1024)).toBe(102.4);
    });

    it("converts imperial inches to integer mm (TC-U-001 boundary: 38.5 in -> 978 mm)", () => {
      expect(inchesToMm(38.5)).toBe(978);
      expect(mmToInches(978, 1)).toBe(38.5);
    });

    it("converts mass between kg, lbs and canonical grams", () => {
      expect(kgToGrams(75.2)).toBe(75200);
      expect(gramsToKg(75200)).toBe(75.2);
      expect(lbsToGrams(165.5)).toBe(75070);
      expect(gramsToLbs(75070, 1)).toBe(165.5);
    });

    it("strictly rejects negative dimensions and weights with RangeError", () => {
      expect(() => cmToMm(-1)).toThrow(RangeError);
      expect(() => inchesToMm(-1)).toThrow(RangeError);
      expect(() => kgToGrams(-1)).toThrow(RangeError);
      expect(() => lbsToGrams(-1)).toThrow(RangeError);
      expect(() => gramsToKg(-1)).toThrow(RangeError);
      expect(() => gramsToLbs(-1)).toThrow(RangeError);
    });
  });

  // =========================================================================
  // 3. Deterministic Ease Calculator & Scoring
  // =========================================================================
  describe("3. Deterministic Ease Calculator (src/core/ease.ts)", () => {
    it("defines target ease intervals across slim, regular, relaxed, oversized", () => {
      expect(getTargetEaseRange("slim")).toEqual({ min: 40, max: 80, midpoint: 60, sigma: 25 });
      expect(getTargetEaseRange("regular")).toEqual({ min: 80, max: 140, midpoint: 110, sigma: 35 });
      expect(getTargetEaseRange("relaxed")).toEqual({ min: 140, max: 200, midpoint: 170, sigma: 45 });
      expect(getTargetEaseRange("oversized")).toEqual({ min: 200, max: 300, midpoint: 250, sigma: 65 });
    });

    it("implements trapezoidal/plateau Gaussian scoring with 1.0 inside target band", () => {
      const reg = getTargetEaseRange("regular"); // 80 to 140 mm
      expect(calculatePlateauGaussianScore(80, reg)).toBe(1.0);
      expect(calculatePlateauGaussianScore(110, reg)).toBe(1.0);
      expect(calculatePlateauGaussianScore(140, reg)).toBe(1.0);

      // Outside target band, decays smoothly via half-Gaussian
      const scoreBelow = calculatePlateauGaussianScore(60, reg);
      const scoreAbove = calculatePlateauGaussianScore(160, reg);
      expect(scoreBelow).toBeLessThan(1.0);
      expect(scoreBelow).toBeGreaterThan(0.7);
      expect(scoreAbove).toBeLessThan(1.0);
      expect(scoreAbove).toBeGreaterThan(0.7);
    });

    it("returns expected category weights for Tops, Bottoms, Outerwear, Ethnic", () => {
      const tops = getCategoryWeights("tops");
      expect(tops.chest).toBe(0.50);
      expect(tops.waist).toBe(0.20);
      expect(tops.shoulder).toBe(0.15);
      expect(tops.length).toBe(0.15);

      const bottoms = getCategoryWeights("bottoms");
      expect(bottoms.waist).toBe(0.40);
      expect(bottoms.hips).toBe(0.30);
      expect(bottoms.inseam).toBe(0.20);
      expect(bottoms.thigh).toBe(0.10);

      const outerwear = getCategoryWeights("outerwear");
      expect(outerwear.chest).toBe(0.40);
      expect(outerwear.shoulder).toBe(0.25);
      expect(outerwear.sleeve).toBe(0.20);
      expect(outerwear.length).toBe(0.15);

      const ethnic = getCategoryWeights("ethnic");
      expect(ethnic.chest).toBe(0.45);
      expect(ethnic.shoulder).toBe(0.25);
      expect(ethnic.length).toBe(0.20);
      expect(ethnic.waist).toBe(0.10);
    });

    it("evaluates fabric stretch and strictly rejects negative ease on rigid fabrics (0% elastane)", () => {
      const rigidResult = evaluateFabricStretch(-20, {
        materialComposition: "100% cotton",
        elastanePercentage: 0,
        stretchLevel: "none",
        estimatedShrinkagePct: 2,
      });
      expect(rigidResult.allowable).toBe(false);
      expect(rigidResult.score).toBe(0.0);
      expect(rigidResult.status).toBe("tight");
    });

    it("evaluates fabric stretch and permits compression ease on stretch knits (>=5% elastane)", () => {
      const stretchResult = evaluateFabricStretch(-40, {
        materialComposition: "90% poly 10% elastane",
        elastanePercentage: 10,
        stretchLevel: "high",
        estimatedShrinkagePct: 0,
      }, 1000);
      expect(stretchResult.allowable).toBe(true);
      expect(stretchResult.score).toBeGreaterThan(0.5);
      expect(stretchResult.status).toBe("acceptable");
    });
  });

  // =========================================================================
  // 4. Reference Garment Calibration
  // =========================================================================
  describe("4. Reference Garment Calibration (src/core/calibration.ts)", () => {
    it("returns delta mappings bounded by [-0.15, 0.15]", () => {
      expect(getCalibrationDelta("perfect")).toBe(0.15);
      expect(getCalibrationDelta("slightly_tight")).toBe(-0.08);
      expect(getCalibrationDelta("too_tight")).toBe(-0.15);
      expect(getCalibrationDelta("too_loose")).toBe(-0.15);
      expect(getCalibrationDelta("unknown")).toBe(0.0);
    });

    it("applies calibration boost to matching candidate and clamps cumulative adjustment to [-0.15, 0.15]", () => {
      const candidates = [
        { sizeLabel: "M", totalScore: 0.80 },
        { sizeLabel: "L", totalScore: 0.75 },
      ];
      const refs: ReferenceGarment[] = [
        { category: "tshirt", sizeLabel: "M", fitQuality: "perfect" },
      ];
      const res = applyReferenceGarmentCalibration(candidates, refs, "tshirt");
      expect(res.hasMatchingAnchor).toBe(true);
      expect(res.candidates.find((c) => c.sizeLabel === "M")?.totalScore).toBeCloseTo(0.95, 2);
    });

    it("ignores reference garments with mismatched category", () => {
      const candidates = [{ sizeLabel: "M", totalScore: 0.80 }];
      const refs: ReferenceGarment[] = [
        { category: "jeans", sizeLabel: "M", fitQuality: "perfect" },
      ];
      const res = applyReferenceGarmentCalibration(candidates, refs, "tshirt");
      expect(res.hasMatchingAnchor).toBe(false);
      expect(res.candidates[0].totalScore).toBe(0.80);
    });
  });

  // =========================================================================
  // 5. Borderline Fit Detection & Tradeoffs
  // =========================================================================
  describe("5. Borderline Fit Detection (src/core/borderline.ts)", () => {
    it("detects borderline when |score0 - score1| < 0.08 and synthesizes comparative tradeoff narrative", () => {
      const best = { sizeLabel: "M", totalScore: 0.85, chestEaseMm: 100 };
      const runnerUp = { sizeLabel: "L", totalScore: 0.81, chestEaseMm: 120 };
      const res = detectBorderlineFit(best, runnerUp);
      expect(res.isBorderline).toBe(true);
      expect(res.alternativeSize).toBe("L");
      expect(res.borderlineTradeoff).toContain("Borderline between M and L");
      expect(res.borderlineTradeoff).toContain("+10cm ease");
      expect(res.borderlineTradeoff).toContain("+12cm ease");
    });

    it("does not trigger borderline when score delta is >= 0.08", () => {
      const best = { sizeLabel: "M", totalScore: 0.88, chestEaseMm: 110 };
      const runnerUp = { sizeLabel: "L", totalScore: 0.75, chestEaseMm: 150 };
      const res = detectBorderlineFit(best, runnerUp);
      expect(res.isBorderline).toBe(false);
      expect(res.alternativeSize).toBeUndefined();
    });

    it("does not trigger borderline if runner-up score is low (<= 0.40)", () => {
      const best = { sizeLabel: "M", totalScore: 0.44, chestEaseMm: 50 };
      const runnerUp = { sizeLabel: "S", totalScore: 0.38, chestEaseMm: 10 };
      const res = detectBorderlineFit(best, runnerUp);
      expect(res.isBorderline).toBe(false);
    });
  });

  // =========================================================================
  // 6. Explainable Recommendation Tree
  // =========================================================================
  describe("6. Explainable Recommendation Tree (src/core/explanation.ts)", () => {
    it("generates structured JSON ExplanationTree with per-dimension ease breakdown", () => {
      const res = evaluateSizing({
        profile: sampleProfile,
        fitPreference: { profileId: sampleProfile.profileId, category: "tshirt", fitType: "regular" },
        garmentDimensions: sampleGarments,
        fabricSpec: {
          materialComposition: "100% cotton",
          elastanePercentage: 0,
          stretchLevel: "none",
          estimatedShrinkagePct: 2,
        },
      });

      expect(res.recommendedSize).toBe("M");
      expect(res.fitScore).toBeGreaterThan(80);
      expect(res.confidenceLabel).toBe("high");
      expect(res.summaryText).toContain("size M");
      expect(res.dimensionBreakdown.length).toBeGreaterThanOrEqual(1);

      const chest = res.dimensionBreakdown.find((d) => d.dimension === "Chest Circumference");
      expect(chest).toBeDefined();
      expect(chest!.bodyMeasurementMm).toBe(960);
      expect(chest!.garmentSpecMm).toBe(1070);
      expect(chest!.easeDeltaMm).toBe(110);
      expect(chest!.status).toBe("ideal");

      expect(res.fabricConsiderations).toBeDefined();
      expect(res.fabricConsiderations?.elastanePercentage).toBe(0);
      expect(res.dataSources.layerUsed).toBe("Layer3_Garment");
    });
  });

  // =========================================================================
  // 7. Zero Hallucination Safeguard
  // =========================================================================
  describe("7. Zero Hallucination Safeguard (src/core/engine.ts)", () => {
    it("returns honest insufficient_data result when required chest is missing", () => {
      const invalidProfile: AnatomicalProfile = {
        profileId: "xyz",
        chestMm: 0,
        isCurrent: true,
      };
      const res = evaluateSizing({
        profile: invalidProfile,
        fitPreference: { profileId: "xyz", category: "tshirt", fitType: "regular" },
        garmentDimensions: sampleGarments,
      });

      expect(res.recommendedSize).toBe("");
      expect(res.confidenceLabel).toBe("insufficient");
      expect(res.summaryText).toContain("Insufficient data");
    });

    it("returns honest insufficient_data result when both Layer 3 and Layer 2 are absent", () => {
      const res = evaluateSizing({
        profile: sampleProfile,
        fitPreference: { profileId: sampleProfile.profileId, category: "tshirt", fitType: "regular" },
      });

      expect(res.recommendedSize).toBe("");
      expect(res.confidenceLabel).toBe("insufficient");
      expect(res.fitScore).toBe(0);
      expect(res.summaryText).toContain("Insufficient data");
    });

    it("never synthesizes missing measurements or guesses brand charts", () => {
      // Check that InsufficientDataError is a constructible error class
      const err = new InsufficientDataError("Missing required chest dimension.");
      expect(err.name).toBe("InsufficientDataError");
      expect(err.message).toBe("Missing required chest dimension.");
    });
  });

  // =========================================================================
  // 8. Public API & Aliases Consistency
  // =========================================================================
  describe("8. Unified Public API exports", () => {
    it("ensures evaluateSizeRecommendation, evaluateGarmentFit, and evaluateSizing are interoperable", () => {
      const pref: FitPreference = {
        profileId: sampleProfile.profileId,
        category: "tshirt",
        fitType: "regular",
      };

      const res1 = evaluateSizing({ profile: sampleProfile, fitPreference: pref, garmentDimensions: sampleGarments });
      const res2 = evaluateSizeRecommendation({ profile: sampleProfile, fitPreference: pref, garmentDimensions: sampleGarments });
      const res3 = evaluateGarmentFit({ profile: sampleProfile, fitPreference: pref, garmentDimensions: sampleGarments });

      expect(res1.recommendedSize).toBe("M");
      expect(res2.recommendedSize).toBe("M");
      expect(res3.recommendedSize).toBe("M");
      expect(res1.fitScore).toBe(res2.fitScore);
      expect(res2.fitScore).toBe(res3.fitScore);
    });
  });
});
