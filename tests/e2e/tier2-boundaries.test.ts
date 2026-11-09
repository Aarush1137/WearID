import { describe, it, expect } from "vitest";
import {
  evaluateSizing,
  getTargetChestEaseRange,
  calculateGaussianEaseScore,
  getCategoryWeights,
} from "../../src/sizing/engine";
import {
  cmToMm,
  mmToCm,
  inchesToMm,
  mmToInches,
  kgToGrams,
  lbsToGrams,
} from "../../src/core/units";
import {
  AnatomicalProfile,
  AnatomicalProfileSchema,
  BrandSizeChart,
  BrandSizeChartSchema,
  GarmentDimensions,
  GarmentDimensionsSchema,
  FitPreference,
  FitPreferenceSchema,
  FabricSpec,
  FabricSpecSchema,
} from "../../src/core/types";

describe("Tier 2 — Boundary Value Analysis & Edge Cases", () => {
  const baseProfileId = "123e4567-e89b-12d3-a456-426614174000";

  // =========================================================================
  // 1. Extreme Measurements & Schema Rejections (10 tests)
  // =========================================================================
  describe("1. Extreme Body Measurements & Input Rejections", () => {
    it("B1-1: rejects zero chest circumference (0 mm)", () => {
      const res = AnatomicalProfileSchema.safeParse({ profileId: baseProfileId, chestMm: 0 });
      expect(res.success).toBe(false);
    });

    it("B1-2: rejects negative chest circumference (-50 mm)", () => {
      const res = AnatomicalProfileSchema.safeParse({ profileId: baseProfileId, chestMm: -50 });
      expect(res.success).toBe(false);
    });

    it("B1-3: rejects negative waist circumference (-800 mm)", () => {
      const res = AnatomicalProfileSchema.safeParse({ profileId: baseProfileId, chestMm: 960, waistMm: -800 });
      expect(res.success).toBe(false);
    });

    it("B1-4: rejects negative height (-1750 mm)", () => {
      const res = AnatomicalProfileSchema.safeParse({ profileId: baseProfileId, chestMm: 960, heightMm: -1750 });
      expect(res.success).toBe(false);
    });

    it("B1-5: rejects negative weight (-75000 g)", () => {
      const res = AnatomicalProfileSchema.safeParse({ profileId: baseProfileId, chestMm: 960, weightG: -75000 });
      expect(res.success).toBe(false);
    });

    it("B1-6: rejects non-integer decimal millimeter input (960.5 mm)", () => {
      const res = AnatomicalProfileSchema.safeParse({ profileId: baseProfileId, chestMm: 960.5 });
      expect(res.success).toBe(false);
    });

    it("B1-7: accepts large body measurement (2500 mm / 250 cm chest) and processes cleanly", () => {
      const profile: AnatomicalProfile = { profileId: baseProfileId, chestMm: 2500, measurementMethod: {}, isCurrent: true };
      const pref: FitPreference = { profileId: baseProfileId, category: "tshirt", fitType: "regular" };
      const garments: GarmentDimensions[] = [{ productId: "p", sizeLabel: "5XL", chestFlatMm: 1305 }]; // 2610mm (+110mm ease)
      const res = evaluateSizing({ profile, fitPreference: pref, garmentDimensions: garments });
      expect(res.recommendedSize).toBe("5XL");
      expect(res.fitScore).toBe(100);
    });

    it("B1-8: accepts petite body measurement (500 mm / 50 cm chest) and processes cleanly", () => {
      const profile: AnatomicalProfile = { profileId: baseProfileId, chestMm: 500, measurementMethod: {}, isCurrent: true };
      const pref: FitPreference = { profileId: baseProfileId, category: "tshirt", fitType: "regular" };
      const garments: GarmentDimensions[] = [{ productId: "p", sizeLabel: "XXS", chestFlatMm: 305 }]; // 610mm (+110mm ease)
      const res = evaluateSizing({ profile, fitPreference: pref, garmentDimensions: garments });
      expect(res.recommendedSize).toBe("XXS");
      expect(res.fitScore).toBe(100);
    });

    it("B1-9: rejects garment with zero chest flat (0 mm)", () => {
      const res = GarmentDimensionsSchema.safeParse({ productId: "p", sizeLabel: "M", chestFlatMm: 0 });
      expect(res.success).toBe(false);
    });

    it("B1-10: rejects garment with negative chest flat (-450 mm)", () => {
      const res = GarmentDimensionsSchema.safeParse({ productId: "p", sizeLabel: "M", chestFlatMm: -450 });
      expect(res.success).toBe(false);
    });
  });

  // =========================================================================
  // 2. Athletic Proportions & Morphology Extremes (5 tests)
  // =========================================================================
  describe("2. Athletic Proportions & Morphology Extremes", () => {
    it("B2-1: athletic V-taper (1150mm chest, 750mm waist) prioritizes chest comfort", () => {
      const profile: AnatomicalProfile = {
        profileId: baseProfileId,
        chestMm: 1150,
        waistMm: 750,
        shoulderWidthMm: 490,
        measurementMethod: {},
        isCurrent: true,
      };
      const pref: FitPreference = { profileId: baseProfileId, category: "tshirt", fitType: "regular" };
      const garments: GarmentDimensions[] = [
        { productId: "p", sizeLabel: "M", chestFlatMm: 550, shoulderMm: 460 }, // 1100mm (-50mm tight)
        { productId: "p", sizeLabel: "XL", chestFlatMm: 630, shoulderMm: 500 }, // 1260mm (+110mm ideal chest)
      ];
      const res = evaluateSizing({ profile, fitPreference: pref, garmentDimensions: garments });
      expect(res.recommendedSize).toBe("XL");
    });

    it("B2-2: extreme broad shoulder (520mm on 920mm chest) balances chest vs shoulder score", () => {
      const profile: AnatomicalProfile = {
        profileId: baseProfileId,
        chestMm: 920,
        shoulderWidthMm: 520,
        measurementMethod: {},
        isCurrent: true,
      };
      const pref: FitPreference = { profileId: baseProfileId, category: "tshirt", fitType: "regular" };
      const garments: GarmentDimensions[] = [
        { productId: "p", sizeLabel: "S", chestFlatMm: 515, shoulderMm: 440 }, // ideal chest, tight shoulder (-80mm)
        { productId: "p", sizeLabel: "L", chestFlatMm: 550, shoulderMm: 490 }, // +180mm chest, shoulder delta -30mm
      ];
      const res = evaluateSizing({ profile, fitPreference: pref, garmentDimensions: garments });
      expect(res.dimensionBreakdown.find((d) => d.dimension === "Shoulder Width")).toBeDefined();
    });

    it("B2-3: narrow shoulder (380mm on 1050mm chest) evaluates correctly without error", () => {
      const profile: AnatomicalProfile = {
        profileId: baseProfileId,
        chestMm: 1050,
        shoulderWidthMm: 380,
        measurementMethod: {},
        isCurrent: true,
      };
      const pref: FitPreference = { profileId: baseProfileId, category: "tshirt", fitType: "regular" };
      const garments: GarmentDimensions[] = [
        { productId: "p", sizeLabel: "L", chestFlatMm: 580, shoulderMm: 470 }, // 1160mm (+110mm chest)
      ];
      const res = evaluateSizing({ profile, fitPreference: pref, garmentDimensions: garments });
      expect(res.recommendedSize).toBe("L");
    });

    it("B2-4: long torso proportion (850mm torso, 700mm inseam) processes cleanly", () => {
      const profile: AnatomicalProfile = {
        profileId: baseProfileId,
        chestMm: 960,
        torsoLengthMm: 850,
        inseamMm: 700,
        measurementMethod: {},
        isCurrent: true,
      };
      const parsed = AnatomicalProfileSchema.safeParse(profile);
      expect(parsed.success).toBe(true);
    });

    it("B2-5: inverted proportion (900mm chest, 1100mm waist) validates schema cleanly", () => {
      const profile: AnatomicalProfile = {
        profileId: baseProfileId,
        chestMm: 900,
        waistMm: 1100,
        measurementMethod: {},
        isCurrent: true,
      };
      const parsed = AnatomicalProfileSchema.safeParse(profile);
      expect(parsed.success).toBe(true);
    });
  });

  // =========================================================================
  // 3. Fabric Stretch Extremes & Elasticity (7 tests)
  // =========================================================================
  describe("3. Fabric Stretch Extremes & Elasticity", () => {
    const target = getTargetChestEaseRange("regular");

    it("B3-1: rigid textile (0% elastane) with exact 0mm ease produces non-zero score", () => {
      const score = calculateGaussianEaseScore(0, target, false);
      expect(score).toBeGreaterThan(0.0);
    });

    it("B3-2: rigid textile (0% elastane) with slight negative ease (-1mm) yields hard 0.0", () => {
      const score = calculateGaussianEaseScore(-1, target, false);
      expect(score).toBe(0.0);
    });

    it("B3-3: rigid textile (0% elastane) with -20mm negative ease yields hard 0.0", () => {
      const score = calculateGaussianEaseScore(-20, target, false);
      expect(score).toBe(0.0);
    });

    it("B3-4: high-stretch textile (15% elastane) with -20mm ease yields valid compression score (>0.8)", () => {
      const score = calculateGaussianEaseScore(-20, target, true);
      expect(score).toBeGreaterThan(0.8);
    });

    it("B3-5: high-stretch textile with -60mm ease yields compression score (>0.4)", () => {
      const score = calculateGaussianEaseScore(-60, target, true);
      expect(score).toBeGreaterThan(0.4);
    });

    it("B3-6: extreme negative ease beyond -100mm on stretch textile yields 0.0", () => {
      const score = calculateGaussianEaseScore(-110, target, true);
      expect(score).toBe(0.0);
    });

    it("B3-7: FabricSpecSchema validates elastane percentages between 0 and 100", () => {
      expect(FabricSpecSchema.safeParse({ elastanePercentage: 0 }).success).toBe(true);
      expect(FabricSpecSchema.safeParse({ elastanePercentage: 25 }).success).toBe(true);
      expect(FabricSpecSchema.safeParse({ elastanePercentage: 100 }).success).toBe(true);
      expect(FabricSpecSchema.safeParse({ elastanePercentage: -5 }).success).toBe(false);
      expect(FabricSpecSchema.safeParse({ elastanePercentage: 105 }).success).toBe(false);
    });
  });

  // =========================================================================
  // 4. Missing Data Handling & Zero Hallucination (7 tests)
  // =========================================================================
  describe("4. Missing Data Handling & Zero Hallucination", () => {
    it("B4-1: empty garment dimensions and empty brand size charts returns insufficient data", () => {
      const profile: AnatomicalProfile = { profileId: baseProfileId, chestMm: 960, measurementMethod: {}, isCurrent: true };
      const pref: FitPreference = { profileId: baseProfileId, category: "tshirt", fitType: "regular" };
      const res = evaluateSizing({ profile, fitPreference: pref });
      expect(res.recommendedSize).toBe("");
      expect(res.confidenceLabel).toBe("insufficient");
      expect(res.fitScore).toBe(0);
    });

    it("B4-2: empty garments array [] returns insufficient data", () => {
      const profile: AnatomicalProfile = { profileId: baseProfileId, chestMm: 960, measurementMethod: {}, isCurrent: true };
      const pref: FitPreference = { profileId: baseProfileId, category: "tshirt", fitType: "regular" };
      const res = evaluateSizing({ profile, fitPreference: pref, garmentDimensions: [] });
      expect(res.recommendedSize).toBe("");
      expect(res.confidenceLabel).toBe("insufficient");
    });

    it("B4-3: missing shoulder width on profile evaluates chest only without fabricating shoulder", () => {
      const profile: AnatomicalProfile = { profileId: baseProfileId, chestMm: 960, measurementMethod: {}, isCurrent: true };
      const pref: FitPreference = { profileId: baseProfileId, category: "tshirt", fitType: "regular" };
      const garments: GarmentDimensions[] = [{ productId: "p", sizeLabel: "M", chestFlatMm: 535, shoulderMm: 450 }];
      const res = evaluateSizing({ profile, fitPreference: pref, garmentDimensions: garments });
      expect(res.recommendedSize).toBe("M");
      const shoulderBreakdown = res.dimensionBreakdown.find((d) => d.dimension === "Shoulder Width");
      expect(shoulderBreakdown).toBeUndefined();
    });

    it("B4-4: missing shoulder width on garment evaluates chest only without fabricating shoulder", () => {
      const profile: AnatomicalProfile = { profileId: baseProfileId, chestMm: 960, shoulderWidthMm: 440, measurementMethod: {}, isCurrent: true };
      const pref: FitPreference = { profileId: baseProfileId, category: "tshirt", fitType: "regular" };
      const garments: GarmentDimensions[] = [{ productId: "p", sizeLabel: "M", chestFlatMm: 535 }];
      const res = evaluateSizing({ profile, fitPreference: pref, garmentDimensions: garments });
      expect(res.recommendedSize).toBe("M");
      const shoulderBreakdown = res.dimensionBreakdown.find((d) => d.dimension === "Shoulder Width");
      expect(shoulderBreakdown).toBeUndefined();
    });

    it("B4-5: all candidate sizes are too small (score <= 0.05) reports no suitable size", () => {
      const profile: AnatomicalProfile = { profileId: baseProfileId, chestMm: 1100, measurementMethod: {}, isCurrent: true };
      const pref: FitPreference = { profileId: baseProfileId, category: "tshirt", fitType: "regular" };
      const garments: GarmentDimensions[] = [{ productId: "p", sizeLabel: "XS", chestFlatMm: 450 }]; // 900mm (-200mm rigid)
      const res = evaluateSizing({ profile, fitPreference: pref, garmentDimensions: garments });
      expect(res.recommendedSize).toBe("");
      expect(res.confidenceLabel).toBe("insufficient");
      expect(res.summaryText).toContain("No suitable size found");
    });

    it("B4-6: summaryText contains exact error message when data is missing", () => {
      const profile: AnatomicalProfile = { profileId: baseProfileId, chestMm: 960, measurementMethod: {}, isCurrent: true };
      const pref: FitPreference = { profileId: baseProfileId, category: "tshirt", fitType: "regular" };
      const res = evaluateSizing({ profile, fitPreference: pref });
      expect(res.summaryText).toContain("No verified garment specifications or brand size charts found");
    });

    it("B4-7: dataSources provenance reflects None when no charts provided", () => {
      const profile: AnatomicalProfile = { profileId: baseProfileId, chestMm: 960, measurementMethod: {}, isCurrent: true };
      const pref: FitPreference = { profileId: baseProfileId, category: "tshirt", fitType: "regular" };
      const res = evaluateSizing({ profile, fitPreference: pref });
      expect(res.dataSources.provenance).toBe("None");
    });
  });

  // =========================================================================
  // 5. Borderline Fit Detection Margins (8 tests)
  // =========================================================================
  describe("5. Borderline Fit Detection Margins", () => {
    const profile: AnatomicalProfile = { profileId: baseProfileId, chestMm: 960, measurementMethod: {}, isCurrent: true };
    const pref: FitPreference = { profileId: baseProfileId, category: "tshirt", fitType: "regular" };

    it("B5-1: score delta 0.05 (< 0.08 threshold) triggers borderline flag", () => {
      const garments: GarmentDimensions[] = [
        { productId: "p", sizeLabel: "M", chestFlatMm: 527 },
        { productId: "p", sizeLabel: "L", chestFlatMm: 537 },
      ];
      const res = evaluateSizing({ profile, fitPreference: pref, garmentDimensions: garments });
      expect(res.isBorderline).toBe(true);
      expect(res.borderlineTradeoff).toBeDefined();
    });

    it("B5-2: score delta 0.00 (identical score tie) triggers borderline flag", () => {
      const garments: GarmentDimensions[] = [
        { productId: "p", sizeLabel: "M", chestFlatMm: 530 }, // 1060mm (+100mm, deviation -10mm)
        { productId: "p", sizeLabel: "L", chestFlatMm: 540 }, // 1080mm (+120mm, deviation +10mm)
      ];
      const res = evaluateSizing({ profile, fitPreference: pref, garmentDimensions: garments });
      expect(res.isBorderline).toBe(true);
      expect(res.borderlineTradeoff).toBeDefined();
    });

    it("B5-3: score delta > 0.08 does NOT trigger borderline flag", () => {
      const garments: GarmentDimensions[] = [
        { productId: "p", sizeLabel: "M", chestFlatMm: 535, shoulderMm: 440 }, // ideal (1.00)
        { productId: "p", sizeLabel: "L", chestFlatMm: 580, shoulderMm: 480 }, // wide deviation
      ];
      const profileWithShoulder: AnatomicalProfile = {
        ...profile,
        shoulderWidthMm: 440,
      };
      const res = evaluateSizing({ profile: profileWithShoulder, fitPreference: pref, garmentDimensions: garments });
      expect(res.isBorderline).toBe(false);
      expect(res.borderlineTradeoff).toBeUndefined();
    });

    it("B5-4: borderline alternative size is populated with runner-up size label", () => {
      const garments: GarmentDimensions[] = [
        { productId: "p", sizeLabel: "M", chestFlatMm: 527 },
        { productId: "p", sizeLabel: "L", chestFlatMm: 537 },
      ];
      const res = evaluateSizing({ profile, fitPreference: pref, garmentDimensions: garments });
      expect(res.alternativeSize).toBeDefined();
      expect(["M", "L"]).toContain(res.alternativeSize);
    });

    it("B5-5: runner-up score below 0.40 does not trigger borderline flag", () => {
      const garments: GarmentDimensions[] = [
        { productId: "p", sizeLabel: "M", chestFlatMm: 535 }, // ideal (1.00)
        { productId: "p", sizeLabel: "S", chestFlatMm: 470 }, // 940mm (-20mm rigid -> 0.00)
      ];
      const res = evaluateSizing({ profile, fitPreference: pref, garmentDimensions: garments });
      expect(res.isBorderline).toBe(false);
    });

    it("B5-6: single candidate size produces isBorderline false", () => {
      const garments: GarmentDimensions[] = [
        { productId: "p", sizeLabel: "M", chestFlatMm: 535 },
      ];
      const res = evaluateSizing({ profile, fitPreference: pref, garmentDimensions: garments });
      expect(res.isBorderline).toBe(false);
      expect(res.alternativeSize).toBeUndefined();
    });

    it("B5-7: borderline narrative specifies both size labels clearly", () => {
      const garments: GarmentDimensions[] = [
        { productId: "p", sizeLabel: "M", chestFlatMm: 527 },
        { productId: "p", sizeLabel: "L", chestFlatMm: 537 },
      ];
      const res = evaluateSizing({ profile, fitPreference: pref, garmentDimensions: garments });
      expect(res.borderlineTradeoff).toContain("M");
      expect(res.borderlineTradeoff).toContain("L");
    });

    it("B5-8: non-borderline case sets borderlineTradeoff to undefined", () => {
      const garments: GarmentDimensions[] = [
        { productId: "p", sizeLabel: "M", chestFlatMm: 535 },
        { productId: "p", sizeLabel: "XL", chestFlatMm: 600 },
      ];
      const res = evaluateSizing({ profile, fitPreference: pref, garmentDimensions: garments });
      expect(res.borderlineTradeoff).toBeUndefined();
    });
  });

  // =========================================================================
  // 6. Reference Garment Calibration Boundaries (8 tests)
  // =========================================================================
  describe("6. Reference Garment Calibration Boundaries", () => {
    const profile: AnatomicalProfile = { profileId: baseProfileId, chestMm: 960, measurementMethod: {}, isCurrent: true };
    const pref: FitPreference = { profileId: baseProfileId, category: "tshirt", fitType: "regular" };

    it("B6-1: perfect reference garment boosts score and clamps at 1.00", () => {
      const garments: GarmentDimensions[] = [{ productId: "p", sizeLabel: "M", chestFlatMm: 535 }]; // ideal (score 1.0)
      const res = evaluateSizing({
        profile,
        fitPreference: pref,
        garmentDimensions: garments,
        referenceGarments: [{ category: "tshirt", sizeLabel: "M", fitQuality: "perfect" }],
      });
      expect(res.fitScore).toBe(100);
    });

    it("B6-2: too_tight reference anchor decreases score by 0.15", () => {
      const garments: GarmentDimensions[] = [{ productId: "p", sizeLabel: "M", chestFlatMm: 535 }];
      const resBase = evaluateSizing({ profile, fitPreference: pref, garmentDimensions: garments });
      const resPenalized = evaluateSizing({
        profile,
        fitPreference: pref,
        garmentDimensions: garments,
        referenceGarments: [{ category: "tshirt", sizeLabel: "M", fitQuality: "too_tight" }],
      });
      expect(resPenalized.fitScore).toBe(Math.round((resBase.fitScore / 100 - 0.15) * 100));
    });

    it("B6-3: too_loose reference anchor decreases score by 0.15", () => {
      const garments: GarmentDimensions[] = [{ productId: "p", sizeLabel: "M", chestFlatMm: 535 }];
      const resBase = evaluateSizing({ profile, fitPreference: pref, garmentDimensions: garments });
      const resPenalized = evaluateSizing({
        profile,
        fitPreference: pref,
        garmentDimensions: garments,
        referenceGarments: [{ category: "tshirt", sizeLabel: "M", fitQuality: "too_loose" }],
      });
      expect(resPenalized.fitScore).toBe(Math.round((resBase.fitScore / 100 - 0.15) * 100));
    });

    it("B6-4: score penalty floors at 0.0 (never negative)", () => {
      const garments: GarmentDimensions[] = [{ productId: "p", sizeLabel: "M", chestFlatMm: 485 }]; // 970mm (+10mm ease, score ~0.10)
      const res = evaluateSizing({
        profile,
        fitPreference: pref,
        garmentDimensions: garments,
        referenceGarments: [{ category: "tshirt", sizeLabel: "M", fitQuality: "too_tight" }],
      });
      expect(res.fitScore).toBeGreaterThanOrEqual(0);
    });

    it("B6-5: reference garment from different category is ignored", () => {
      const garments: GarmentDimensions[] = [{ productId: "p", sizeLabel: "M", chestFlatMm: 535 }];
      const resBase = evaluateSizing({ profile, fitPreference: pref, garmentDimensions: garments });
      const resMismatched = evaluateSizing({
        profile,
        fitPreference: pref,
        garmentDimensions: garments,
        referenceGarments: [{ category: "jeans", sizeLabel: "M", fitQuality: "too_tight" }],
      });
      expect(resMismatched.fitScore).toBe(resBase.fitScore);
    });

    it("B6-6: reference garment with unmatched sizeLabel is ignored", () => {
      const garments: GarmentDimensions[] = [{ productId: "p", sizeLabel: "M", chestFlatMm: 535 }];
      const resBase = evaluateSizing({ profile, fitPreference: pref, garmentDimensions: garments });
      const resUnmatched = evaluateSizing({
        profile,
        fitPreference: pref,
        garmentDimensions: garments,
        referenceGarments: [{ category: "tshirt", sizeLabel: "XXL", fitQuality: "perfect" }],
      });
      expect(resUnmatched.fitScore).toBe(resBase.fitScore);
    });

    it("B6-7: multiple reference garments with one match applies the matched calibration", () => {
      const profileWithShoulder: AnatomicalProfile = { ...profile, shoulderWidthMm: 440 };
      const garments: GarmentDimensions[] = [
        { productId: "p", sizeLabel: "M", chestFlatMm: 535, shoulderMm: 440 }, // ideal base (~0.975)
        { productId: "p", sizeLabel: "L", chestFlatMm: 545, shoulderMm: 450 }, // close base (~0.92)
      ];
      const res = evaluateSizing({
        profile: profileWithShoulder,
        fitPreference: pref,
        garmentDimensions: garments,
        referenceGarments: [
          { category: "tshirt", sizeLabel: "M", fitQuality: "too_tight" }, // penalizes M
          { category: "hoodie", sizeLabel: "L", fitQuality: "perfect" },   // ignored category
        ],
      });
      expect(res.recommendedSize).toBe("L");
    });

    it("B6-8: reference garment boosts confidence score by +0.08", () => {
      const garments: GarmentDimensions[] = [{ productId: "p", sizeLabel: "M", chestFlatMm: 535 }];
      const resBase = evaluateSizing({ profile, fitPreference: pref, garmentDimensions: garments });
      const resCalibrated = evaluateSizing({
        profile,
        fitPreference: pref,
        garmentDimensions: garments,
        referenceGarments: [{ category: "tshirt", sizeLabel: "M", fitQuality: "perfect" }],
      });
      expect(resCalibrated.confidence).toBeGreaterThan(resBase.confidence);
    });
  });

  // =========================================================================
  // 7. Fit Intent Ease Interval Boundaries (12 tests)
  // =========================================================================
  describe("7. Fit Intent Ease Interval Boundaries", () => {
    it("B7-1: slim fit lower boundary (40mm ease) produces positive score", () => {
      const slim = getTargetChestEaseRange("slim");
      const score = calculateGaussianEaseScore(40, slim);
      expect(score).toBeGreaterThan(0.5);
    });

    it("B7-2: slim fit midpoint (60mm ease) produces exactly 1.0", () => {
      const slim = getTargetChestEaseRange("slim");
      expect(calculateGaussianEaseScore(60, slim)).toBe(1.0);
    });

    it("B7-3: slim fit upper boundary (80mm ease) produces positive score", () => {
      const slim = getTargetChestEaseRange("slim");
      const score = calculateGaussianEaseScore(80, slim);
      expect(score).toBeGreaterThan(0.5);
    });

    it("B7-4: regular fit lower boundary (80mm ease) produces positive score", () => {
      const regular = getTargetChestEaseRange("regular");
      const score = calculateGaussianEaseScore(80, regular);
      expect(score).toBeGreaterThan(0.5);
    });

    it("B7-5: regular fit midpoint (110mm ease) produces exactly 1.0", () => {
      const regular = getTargetChestEaseRange("regular");
      expect(calculateGaussianEaseScore(110, regular)).toBe(1.0);
    });

    it("B7-6: regular fit upper boundary (140mm ease) produces positive score", () => {
      const regular = getTargetChestEaseRange("regular");
      const score = calculateGaussianEaseScore(140, regular);
      expect(score).toBeGreaterThan(0.5);
    });

    it("B7-7: relaxed fit lower boundary (140mm ease) produces positive score", () => {
      const relaxed = getTargetChestEaseRange("relaxed");
      const score = calculateGaussianEaseScore(140, relaxed);
      expect(score).toBeGreaterThan(0.5);
    });

    it("B7-8: relaxed fit midpoint (170mm ease) produces exactly 1.0", () => {
      const relaxed = getTargetChestEaseRange("relaxed");
      expect(calculateGaussianEaseScore(170, relaxed)).toBe(1.0);
    });

    it("B7-9: relaxed fit upper boundary (200mm ease) produces positive score", () => {
      const relaxed = getTargetChestEaseRange("relaxed");
      const score = calculateGaussianEaseScore(200, relaxed);
      expect(score).toBeGreaterThan(0.5);
    });

    it("B7-10: oversized fit lower boundary (200mm ease) produces positive score", () => {
      const oversized = getTargetChestEaseRange("oversized");
      const score = calculateGaussianEaseScore(200, oversized);
      expect(score).toBeGreaterThan(0.5);
    });

    it("B7-11: oversized fit midpoint (250mm ease) produces exactly 1.0", () => {
      const oversized = getTargetChestEaseRange("oversized");
      expect(calculateGaussianEaseScore(250, oversized)).toBe(1.0);
    });

    it("B7-12: oversized fit upper boundary (300mm ease) produces positive score", () => {
      const oversized = getTargetChestEaseRange("oversized");
      const score = calculateGaussianEaseScore(300, oversized);
      expect(score).toBeGreaterThan(0.5);
    });
  });

  // =========================================================================
  // 8. Excessive Bagging & Large Ease Penalties (5 tests)
  // =========================================================================
  describe("8. Excessive Bagging & Large Ease Penalties", () => {
    it("B8-1: +250mm ease on slim intent yields low score (< 0.10)", () => {
      const slim = getTargetChestEaseRange("slim");
      const score = calculateGaussianEaseScore(250, slim);
      expect(score).toBeLessThan(0.10);
    });

    it("B8-2: +400mm ease on regular intent yields near-zero score (< 0.01)", () => {
      const regular = getTargetChestEaseRange("regular");
      const score = calculateGaussianEaseScore(400, regular);
      expect(score).toBeLessThan(0.01);
    });

    it("B8-3: +500mm ease on relaxed intent yields near-zero score (< 0.01)", () => {
      const relaxed = getTargetChestEaseRange("relaxed");
      const score = calculateGaussianEaseScore(500, relaxed);
      expect(score).toBeLessThan(0.01);
    });

    it("B8-4: +600mm ease on oversized intent yields near-zero score (< 0.01)", () => {
      const oversized = getTargetChestEaseRange("oversized");
      const score = calculateGaussianEaseScore(600, oversized);
      expect(score).toBeLessThan(0.01);
    });

    it("B8-5: excessive positive ease marks dimension status as 'loose'", () => {
      const profile: AnatomicalProfile = { profileId: baseProfileId, chestMm: 900, measurementMethod: {}, isCurrent: true };
      const pref: FitPreference = { profileId: baseProfileId, category: "tshirt", fitType: "slim" };
      const garments: GarmentDimensions[] = [{ productId: "p", sizeLabel: "XXL", chestFlatMm: 600 }]; // 1200mm (+300mm ease on slim)
      const res = evaluateSizing({ profile, fitPreference: pref, garmentDimensions: garments });
      expect(res.dimensionBreakdown[0].status).toBe("loose");
    });
  });

  // =========================================================================
  // 9. Unit Normalization Precision & Floating Point Drift (10 tests)
  // =========================================================================
  describe("9. Unit Normalization Precision & Floating Point Drift", () => {
    it("B9-1: 1000 round-trip conversions mm -> cm -> mm preserves 0 drift", () => {
      let val = 1000;
      for (let i = 0; i < 1000; i++) {
        val = cmToMm(mmToCm(val));
      }
      expect(val).toBe(1000);
    });

    it("B9-2: round-trip mm -> inches -> mm preserves precision within 1mm integer constraint", () => {
      const originalMm = 1016; // exactly 40.0 inches
      const inches = mmToInches(originalMm, 2);
      const roundTrip = inchesToMm(inches);
      expect(roundTrip).toBe(originalMm);
    });

    it("B9-3: converts 0 cm to exact 0 mm", () => {
      expect(cmToMm(0)).toBe(0);
    });

    it("B9-4: converts 0 inches to exact 0 mm", () => {
      expect(inchesToMm(0)).toBe(0);
    });

    it("B9-5: converts 38.5 inches to integer mm (978 mm)", () => {
      expect(inchesToMm(38.5)).toBe(978);
    });

    it("B9-6: converts 42.125 inches to integer mm", () => {
      // 42.125 * 25.4 = 1069.975 -> 1070 mm
      expect(inchesToMm(42.125)).toBe(1070);
    });

    it("B9-7: converts 0 kg to 0 grams", () => {
      expect(kgToGrams(0)).toBe(0);
    });

    it("B9-8: converts 75.25 kg to 75250 grams", () => {
      expect(kgToGrams(75.25)).toBe(75250);
    });

    it("B9-9: converts 165.5 lbs to grams", () => {
      // 165.5 * 453.59237 = 75069.537 -> 75070 g
      expect(lbsToGrams(165.5)).toBe(75070);
    });

    it("B9-10: rejects negative weight with RangeError", () => {
      expect(() => kgToGrams(-10)).toThrow(RangeError);
      expect(() => lbsToGrams(-5)).toThrow(RangeError);
    });
  });

  // =========================================================================
  // 10. Layer Fallback & Precedence Boundaries (6 tests)
  // =========================================================================
  describe("10. Layer Fallback & Precedence Boundaries", () => {
    const profile: AnatomicalProfile = { profileId: baseProfileId, chestMm: 960, measurementMethod: {}, isCurrent: true };
    const pref: FitPreference = { profileId: baseProfileId, category: "tshirt", fitType: "regular" };

    it("B10-1: selects Layer 3 when both Layer 3 and Layer 2 exist", () => {
      const garments: GarmentDimensions[] = [{ productId: "p", sizeLabel: "M", chestFlatMm: 535 }];
      const charts: BrandSizeChart[] = [{ brandId: "b", category: "tshirt", gender: "male", sizeLabel: "L", chestMinMm: 900, chestMaxMm: 1000 }];
      const res = evaluateSizing({ profile, fitPreference: pref, garmentDimensions: garments, brandSizeCharts: charts });
      expect(res.dataSources.layerUsed).toBe("Layer3_Garment");
    });

    it("B10-2: falls back to Layer 2 when Layer 3 is missing", () => {
      const charts: BrandSizeChart[] = [{ brandId: "b", category: "tshirt", gender: "male", sizeLabel: "M", chestMinMm: 920, chestMaxMm: 1000 }];
      const res = evaluateSizing({ profile, fitPreference: pref, brandSizeCharts: charts });
      expect(res.dataSources.layerUsed).toBe("Layer2_BrandChart");
      expect(res.recommendedSize).toBe("M");
    });

    it("B10-3: Layer 2 fallback handles user chest at exact boundary min", () => {
      const charts: BrandSizeChart[] = [{ brandId: "b", category: "tshirt", gender: "male", sizeLabel: "M", chestMinMm: 960, chestMaxMm: 1020 }];
      const res = evaluateSizing({ profile, fitPreference: pref, brandSizeCharts: charts });
      expect(res.recommendedSize).toBe("M");
      expect(res.fitScore).toBeGreaterThan(0);
    });

    it("B10-4: Layer 2 fallback handles user chest at exact boundary max", () => {
      const charts: BrandSizeChart[] = [{ brandId: "b", category: "tshirt", gender: "male", sizeLabel: "S", chestMinMm: 900, chestMaxMm: 960 }];
      const res = evaluateSizing({ profile, fitPreference: pref, brandSizeCharts: charts });
      expect(res.recommendedSize).toBe("S");
      expect(res.fitScore).toBeGreaterThan(0);
    });

    it("B10-5: Layer 2 scores decrease when user is outside brand chart bounds", () => {
      const charts: BrandSizeChart[] = [{ brandId: "b", category: "tshirt", gender: "male", sizeLabel: "S", chestMinMm: 800, chestMaxMm: 860 }];
      const res = evaluateSizing({ profile, fitPreference: pref, brandSizeCharts: charts });
      // 960mm is 100mm larger than max 860mm
      expect(res.fitScore).toBeLessThan(50);
    });

    it("B10-6: Layer 2 base confidence (0.55-0.70) is lower than Layer 3 base confidence (0.85+)", () => {
      const charts: BrandSizeChart[] = [{ brandId: "b", category: "tshirt", gender: "male", sizeLabel: "M", chestMinMm: 920, chestMaxMm: 1000 }];
      const garments: GarmentDimensions[] = [{ productId: "p", sizeLabel: "M", chestFlatMm: 535 }];
      const resLayer2 = evaluateSizing({ profile, fitPreference: pref, brandSizeCharts: charts });
      const resLayer3 = evaluateSizing({ profile, fitPreference: pref, garmentDimensions: garments });
      expect(resLayer2.confidence).toBeLessThan(resLayer3.confidence);
    });
  });

  // =========================================================================
  // 11. Confidence Score Tiers (5 tests)
  // =========================================================================
  describe("11. Confidence Score Tiers", () => {
    const profile: AnatomicalProfile = {
      profileId: baseProfileId,
      chestMm: 960,
      shoulderWidthMm: 440,
      measurementMethod: {},
      isCurrent: true,
    };
    const pref: FitPreference = { profileId: baseProfileId, category: "tshirt", fitType: "regular" };

    it("B11-1: High confidence (>=0.85) assigned for complete Layer 3 profile", () => {
      const garments: GarmentDimensions[] = [{ productId: "p", sizeLabel: "M", chestFlatMm: 535, shoulderMm: 450 }];
      const res = evaluateSizing({ profile, fitPreference: pref, garmentDimensions: garments });
      expect(res.confidence).toBeGreaterThanOrEqual(0.85);
      expect(res.confidenceLabel).toBe("high");
    });

    it("B11-2: Medium confidence (0.65-0.85) assigned for Layer 2 chart with basic chest", () => {
      const basicProfile: AnatomicalProfile = { profileId: baseProfileId, chestMm: 960, measurementMethod: {}, isCurrent: true };
      const charts: BrandSizeChart[] = [{ brandId: "b", category: "tshirt", gender: "male", sizeLabel: "M", chestMinMm: 920, chestMaxMm: 1000 }];
      const res = evaluateSizing({ profile: basicProfile, fitPreference: pref, brandSizeCharts: charts });
      expect(res.confidence).toBeGreaterThanOrEqual(0.65);
      expect(res.confidence).toBeLessThan(0.85);
      expect(res.confidenceLabel).toBe("medium");
    });

    it("B11-3: Insufficient confidence (<0.40) assigned when no charts available", () => {
      const res = evaluateSizing({ profile, fitPreference: pref });
      expect(res.confidence).toBeLessThan(0.40);
      expect(res.confidenceLabel).toBe("insufficient");
    });

    it("B11-4: Insufficient confidence assigned when all sizes fail fit threshold", () => {
      const tinyGarments: GarmentDimensions[] = [{ productId: "p", sizeLabel: "XS", chestFlatMm: 400 }]; // -160mm rigid
      const res = evaluateSizing({ profile, fitPreference: pref, garmentDimensions: tinyGarments });
      expect(res.confidence).toBeLessThan(0.40);
      expect(res.confidenceLabel).toBe("insufficient");
    });

    it("B11-5: Confidence is capped at 0.97 maximum", () => {
      const garments: GarmentDimensions[] = [{ productId: "p", sizeLabel: "M", chestFlatMm: 535, shoulderMm: 450 }];
      const res = evaluateSizing({
        profile,
        fitPreference: pref,
        garmentDimensions: garments,
        referenceGarments: [{ category: "tshirt", sizeLabel: "M", fitQuality: "perfect" }],
      });
      expect(res.confidence).toBeLessThanOrEqual(0.97);
    });
  });

  // =========================================================================
  // 12. Community Correction Factor Boundaries (5 tests)
  // =========================================================================
  describe("12. Community Correction Factor Boundaries", () => {
    const profile: AnatomicalProfile = { profileId: baseProfileId, chestMm: 960, shoulderWidthMm: 440, measurementMethod: {}, isCurrent: true };
    const pref: FitPreference = { profileId: baseProfileId, category: "tshirt", fitType: "regular" };
    const garments: GarmentDimensions[] = [{ productId: "p", sizeLabel: "M", chestFlatMm: 520, shoulderMm: 440 }]; // 1040mm (+80mm ease, score ~0.69)

    it("B12-1: positive community correction (+0.05) boosts score", () => {
      const resBase = evaluateSizing({ profile, fitPreference: pref, garmentDimensions: garments });
      const resBoosted = evaluateSizing({ profile, fitPreference: pref, garmentDimensions: garments, communityCorrectionFactor: 0.05 });
      expect(resBoosted.fitScore).toBeGreaterThan(resBase.fitScore);
    });

    it("B12-2: negative community correction (-0.05) lowers score", () => {
      const resBase = evaluateSizing({ profile, fitPreference: pref, garmentDimensions: garments });
      const resLowered = evaluateSizing({ profile, fitPreference: pref, garmentDimensions: garments, communityCorrectionFactor: -0.05 });
      expect(resLowered.fitScore).toBeLessThan(resBase.fitScore);
    });

    it("B12-3: extreme positive correction (+0.50) clamps score at 100", () => {
      const res = evaluateSizing({ profile, fitPreference: pref, garmentDimensions: garments, communityCorrectionFactor: 0.50 });
      expect(res.fitScore).toBeLessThanOrEqual(100);
    });

    it("B12-4: extreme negative correction (-0.90) clamps score at 0", () => {
      const res = evaluateSizing({ profile, fitPreference: pref, garmentDimensions: garments, communityCorrectionFactor: -0.90 });
      expect(res.fitScore).toBeGreaterThanOrEqual(0);
    });

    it("B12-5: zero correction factor (0.00) matches base score exactly", () => {
      const resBase = evaluateSizing({ profile, fitPreference: pref, garmentDimensions: garments });
      const resZero = evaluateSizing({ profile, fitPreference: pref, garmentDimensions: garments, communityCorrectionFactor: 0 });
      expect(resZero.fitScore).toBe(resBase.fitScore);
    });
  });

  // =========================================================================
  // 13. Category Weighting Distribution Boundaries (8 tests)
  // =========================================================================
  describe("13. Category Weighting Distribution Boundaries", () => {
    it("B13-1: tshirt weights sum to 1.00", () => {
      const w = getCategoryWeights("tshirt");
      const sum = w.chest + w.shoulder + w.length + w.sleeve;
      expect(Math.round(sum * 100) / 100).toBe(1.00);
    });

    it("B13-2: polo weights sum to 1.00", () => {
      const w = getCategoryWeights("polo");
      const sum = w.chest + w.shoulder + w.length + w.sleeve;
      expect(Math.round(sum * 100) / 100).toBe(1.00);
    });

    it("B13-3: casual_shirt weights sum to 1.00", () => {
      const w = getCategoryWeights("casual_shirt");
      const sum = w.chest + w.shoulder + w.sleeve + w.neck;
      expect(Math.round(sum * 100) / 100).toBe(1.00);
    });

    it("B13-4: formal_shirt weights sum to 1.00", () => {
      const w = getCategoryWeights("formal_shirt");
      const sum = w.chest + w.shoulder + w.sleeve + w.neck;
      expect(Math.round(sum * 100) / 100).toBe(1.00);
    });

    it("B13-5: jeans weights sum to 1.00", () => {
      const w = getCategoryWeights("jeans");
      const sum = w.waist + w.inseam + w.thigh;
      expect(Math.round(sum * 100) / 100).toBe(1.00);
    });

    it("B13-6: trousers weights sum to 1.00", () => {
      const w = getCategoryWeights("trousers");
      const sum = w.waist + w.inseam + w.thigh + w.rise;
      expect(Math.round(sum * 100) / 100).toBe(1.00);
    });

    it("B13-7: kurta weights sum to 1.00", () => {
      const w = getCategoryWeights("kurta");
      const sum = w.chest + w.shoulder + w.torso_length + w.sleeve;
      expect(Math.round(sum * 100) / 100).toBe(1.00);
    });

    it("B13-8: unknown category falls back to default weights summing to 1.00", () => {
      const w = getCategoryWeights("kimono");
      const sum = w.chest + w.shoulder + w.length;
      expect(Math.round(sum * 100) / 100).toBe(1.00);
    });
  });

  // =========================================================================
  // 14. Zod Schema Validation Edge Cases (15 tests)
  // =========================================================================
  describe("14. Zod Schema Validation Edge Cases", () => {
    it("B14-1: rejects non-UUID profileId in AnatomicalProfile", () => {
      expect(AnatomicalProfileSchema.safeParse({ profileId: "not-a-uuid", chestMm: 960 }).success).toBe(false);
    });

    it("B14-2: rejects string passed for chestMm in AnatomicalProfile", () => {
      expect(AnatomicalProfileSchema.safeParse({ profileId: baseProfileId, chestMm: "960" }).success).toBe(false);
    });

    it("B14-3: rejects boolean passed for chestMm in AnatomicalProfile", () => {
      expect(AnatomicalProfileSchema.safeParse({ profileId: baseProfileId, chestMm: true }).success).toBe(false);
    });

    it("B14-4: rejects empty object for AnatomicalProfile", () => {
      expect(AnatomicalProfileSchema.safeParse({}).success).toBe(false);
    });

    it("B14-5: rejects empty object for GarmentDimensions", () => {
      expect(GarmentDimensionsSchema.safeParse({}).success).toBe(false);
    });

    it("B14-6: rejects invalid gender enum in BrandSizeChart", () => {
      const chart = { brandId: "b", category: "c", gender: "alien", sizeLabel: "M" };
      expect(BrandSizeChartSchema.safeParse(chart).success).toBe(false);
    });

    it("B14-7: rejects invalid sizeSystem in BrandSizeChart", () => {
      const chart = { brandId: "b", category: "c", gender: "male", sizeLabel: "M", sizeSystem: "MARTIAN" };
      expect(BrandSizeChartSchema.safeParse(chart).success).toBe(false);
    });

    it("B14-8: rejects confidence > 1.0 in BrandSizeChart", () => {
      const chart = { brandId: "b", category: "c", gender: "male", sizeLabel: "M", confidence: 1.5 };
      expect(BrandSizeChartSchema.safeParse(chart).success).toBe(false);
    });

    it("B14-9: rejects confidence < 0.0 in BrandSizeChart", () => {
      const chart = { brandId: "b", category: "c", gender: "male", sizeLabel: "M", confidence: -0.2 };
      expect(BrandSizeChartSchema.safeParse(chart).success).toBe(false);
    });

    it("B14-10: rejects invalid measurementMethod in GarmentDimensions", () => {
      const g = { productId: "p", sizeLabel: "M", chestFlatMm: 500, measurementMethod: "in_air" };
      expect(GarmentDimensionsSchema.safeParse(g).success).toBe(false);
    });

    it("B14-11: rejects invalid measuredBy in GarmentDimensions", () => {
      const g = { productId: "p", sizeLabel: "M", chestFlatMm: 500, measuredBy: "robot" };
      expect(GarmentDimensionsSchema.safeParse(g).success).toBe(false);
    });

    it("B14-12: rejects invalid stretchLevel in FabricSpec", () => {
      expect(FabricSpecSchema.safeParse({ stretchLevel: "infinite" }).success).toBe(false);
    });

    it("B14-13: rejects shrinkage percentage > 20 in FabricSpec", () => {
      expect(FabricSpecSchema.safeParse({ estimatedShrinkagePct: 25 }).success).toBe(false);
    });

    it("B14-14: rejects negative shrinkage percentage in FabricSpec", () => {
      expect(FabricSpecSchema.safeParse({ estimatedShrinkagePct: -2 }).success).toBe(false);
    });

    it("B14-15: rejects non-UUID profileId in FitPreference", () => {
      expect(FitPreferenceSchema.safeParse({ profileId: "abc", category: "tshirt", fitType: "slim" }).success).toBe(false);
    });
  });

  // =========================================================================
  // 15. Gaussian Dispersion Curve Math (10 tests)
  // =========================================================================
  describe("15. Gaussian Dispersion Curve Math", () => {
    it("B15-1: slim fit sigma is 25mm", () => {
      expect(getTargetChestEaseRange("slim").sigma).toBe(25);
    });

    it("B15-2: regular fit sigma is 35mm", () => {
      expect(getTargetChestEaseRange("regular").sigma).toBe(35);
    });

    it("B15-3: relaxed fit sigma is 45mm", () => {
      expect(getTargetChestEaseRange("relaxed").sigma).toBe(45);
    });

    it("B15-4: oversized fit sigma is 65mm", () => {
      expect(getTargetChestEaseRange("oversized").sigma).toBe(65);
    });

    it("B15-5: ease at mu + sigma yields score approx 0.607", () => {
      const reg = getTargetChestEaseRange("regular");
      const score = calculateGaussianEaseScore(reg.midpoint + reg.sigma, reg);
      expect(score).toBeCloseTo(0.607, 2);
    });

    it("B15-6: ease at mu - sigma yields score approx 0.607", () => {
      const reg = getTargetChestEaseRange("regular");
      const score = calculateGaussianEaseScore(reg.midpoint - reg.sigma, reg);
      expect(score).toBeCloseTo(0.607, 2);
    });

    it("B15-7: ease at mu + 2*sigma yields score approx 0.135", () => {
      const reg = getTargetChestEaseRange("regular");
      const score = calculateGaussianEaseScore(reg.midpoint + 2 * reg.sigma, reg);
      expect(score).toBeCloseTo(0.135, 2);
    });

    it("B15-8: ease at mu - 2*sigma yields score approx 0.135", () => {
      const reg = getTargetChestEaseRange("regular");
      const score = calculateGaussianEaseScore(reg.midpoint - 2 * reg.sigma, reg);
      expect(score).toBeCloseTo(0.135, 2);
    });

    it("B15-9: ease at mu + 3*sigma yields score approx 0.011", () => {
      const reg = getTargetChestEaseRange("regular");
      const score = calculateGaussianEaseScore(reg.midpoint + 3 * reg.sigma, reg);
      expect(score).toBeCloseTo(0.011, 2);
    });

    it("B15-10: ease at mu - 3*sigma yields score approx 0.011", () => {
      const reg = getTargetChestEaseRange("regular");
      const score = calculateGaussianEaseScore(reg.midpoint - 3 * reg.sigma, reg);
      expect(score).toBeCloseTo(0.011, 2);
    });
  });

  // =========================================================================
  // 16. Explanation Tree Status Logic (7 tests)
  // =========================================================================
  describe("16. Explanation Tree Dimension Status Logic", () => {
    const profile: AnatomicalProfile = { profileId: baseProfileId, chestMm: 960, measurementMethod: {}, isCurrent: true };
    const pref: FitPreference = { profileId: baseProfileId, category: "tshirt", fitType: "regular" };

    it("B16-1: ease between 80mm and 140mm marks chest status as 'ideal'", () => {
      const garments: GarmentDimensions[] = [{ productId: "p", sizeLabel: "M", chestFlatMm: 535 }]; // +110mm
      const res = evaluateSizing({ profile, fitPreference: pref, garmentDimensions: garments });
      expect(res.dimensionBreakdown[0].status).toBe("ideal");
    });

    it("B16-2: ease below 80mm marks chest status as 'tight'", () => {
      const garments: GarmentDimensions[] = [{ productId: "p", sizeLabel: "S", chestFlatMm: 495 }]; // 990mm (+30mm)
      const res = evaluateSizing({ profile, fitPreference: pref, garmentDimensions: garments });
      expect(res.dimensionBreakdown[0].status).toBe("tight");
    });

    it("B16-3: ease above 140mm marks chest status as 'loose'", () => {
      const garments: GarmentDimensions[] = [{ productId: "p", sizeLabel: "L", chestFlatMm: 560 }]; // 1120mm (+160mm)
      const res = evaluateSizing({ profile, fitPreference: pref, garmentDimensions: garments });
      expect(res.dimensionBreakdown[0].status).toBe("loose");
    });

    it("B16-4: dimension breakdown easeTargetMm matches fit intent interval", () => {
      const garments: GarmentDimensions[] = [{ productId: "p", sizeLabel: "M", chestFlatMm: 535 }];
      const res = evaluateSizing({ profile, fitPreference: pref, garmentDimensions: garments });
      expect(res.dimensionBreakdown[0].easeTargetMm.min).toBe(80);
      expect(res.dimensionBreakdown[0].easeTargetMm.max).toBe(140);
    });

    it("B16-5: negative ease on rigid textile rationale mentions constrictive fit", () => {
      const garments: GarmentDimensions[] = [{ productId: "p", sizeLabel: "XS", chestFlatMm: 460 }]; // 920mm (-40mm)
      const res = evaluateSizing({
        profile,
        fitPreference: pref,
        garmentDimensions: garments,
        fabricSpec: { elastanePercentage: 0, stretchLevel: "none", materialComposition: "100% cotton", estimatedShrinkagePct: 2 },
      });
      // The breakdown for XS should report negative ease
      expect(res.dimensionBreakdown[0].rationale).toContain("Negative ease");
    });

    it("B16-6: summaryText contains exact recommended size label", () => {
      const garments: GarmentDimensions[] = [{ productId: "p", sizeLabel: "M", chestFlatMm: 535 }];
      const res = evaluateSizing({ profile, fitPreference: pref, garmentDimensions: garments });
      expect(res.summaryText).toContain("size M");
    });

    it("B16-7: fitTypeUsed in result matches requested fit preference", () => {
      const garments: GarmentDimensions[] = [{ productId: "p", sizeLabel: "M", chestFlatMm: 535 }];
      const res = evaluateSizing({ profile, fitPreference: pref, garmentDimensions: garments });
      expect(res.fitTypeUsed).toBe("regular");
    });
  });
});
