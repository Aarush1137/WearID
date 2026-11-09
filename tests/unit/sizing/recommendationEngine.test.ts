import { describe, it, expect } from "vitest";
import {
  evaluateSizeRecommendation,
  getTargetEaseRange,
  calculateGaussianEaseScore,
  calculateShoulderScore,
  getCategoryWeights,
} from "../../../src/core/sizing";
import {
  AnatomicalProfile,
  FitPreference,
  GarmentDimensions,
  BrandSizeChart,
} from "../../../src/core/types";

describe("Phase 1.4: Deterministic Sizing Core Engine", () => {
  const profile96: AnatomicalProfile = {
    profileId: "123e4567-e89b-12d3-a456-426614174000",
    chestMm: 960, // 96.0 cm
    shoulderWidthMm: 440, // 44.0 cm
    isCurrent: true,
  };

  const prefRegularTshirt: FitPreference = {
    profileId: "123e4567-e89b-12d3-a456-426614174000",
    category: "tshirt",
    fitType: "regular",
  };

  const sampleGarments: GarmentDimensions[] = [
    {
      productId: "prod_uniqlo_crew",
      sizeLabel: "S",
      chestFlatMm: 490, // 980mm circ (+20mm ease on 960mm chest)
      shoulderMm: 420,
      lengthMm: 680,
      measurementMethod: "laid_flat",
      measuredBy: "brand",
    },
    {
      productId: "prod_uniqlo_crew",
      sizeLabel: "M",
      chestFlatMm: 530, // 1060mm circ (+100mm ease on 960mm chest -> midpoint for regular is 110mm)
      shoulderMm: 450,
      lengthMm: 710,
      measurementMethod: "laid_flat",
      measuredBy: "brand",
    },
    {
      productId: "prod_uniqlo_crew",
      sizeLabel: "L",
      chestFlatMm: 570, // 1140mm circ (+180mm ease on 960mm chest)
      shoulderMm: 470,
      lengthMm: 730,
      measurementMethod: "laid_flat",
      measuredBy: "brand",
    },
    {
      productId: "prod_uniqlo_crew",
      sizeLabel: "XL",
      chestFlatMm: 610, // 1220mm circ (+260mm ease on 960mm chest -> ideal for oversized midpoint 250mm)
      shoulderMm: 490,
      lengthMm: 750,
      measurementMethod: "laid_flat",
      measuredBy: "brand",
    },
  ];

  describe("Ease Engine Utilities", () => {
    it("returns correct target ease ranges across all fit types", () => {
      const slim = getTargetEaseRange("slim");
      expect(slim.min).toBe(40);
      expect(slim.max).toBe(80);
      expect(slim.midpoint).toBe(60);

      const regular = getTargetEaseRange("regular");
      expect(regular.min).toBe(80);
      expect(regular.max).toBe(140);
      expect(regular.midpoint).toBe(110);

      const relaxed = getTargetEaseRange("relaxed");
      expect(relaxed.min).toBe(140);
      expect(relaxed.max).toBe(200);
      expect(relaxed.midpoint).toBe(170);

      const oversized = getTargetEaseRange("oversized");
      expect(oversized.min).toBe(200);
      expect(oversized.max).toBe(300);
      expect(oversized.midpoint).toBe(250);
    });

    it("evaluates Gaussian ease scoring accurately", () => {
      const target = getTargetEaseRange("regular"); // midpoint 110
      // Exact midpoint gives score 1.0
      expect(calculateGaussianEaseScore(110, target)).toBe(1.0);
      // Reasonable deviation gives positive score
      expect(calculateGaussianEaseScore(100, target)).toBeGreaterThan(0.9);
      // Extreme deviation drops score
      expect(calculateGaussianEaseScore(300, target)).toBeLessThan(0.05);
    });

    it("calculates shoulder scores with pattern compensation", () => {
      expect(calculateShoulderScore(10, "regular")).toBe(1.0);
      expect(calculateShoulderScore(25, "relaxed")).toBe(1.0);
      expect(calculateShoulderScore(40, "oversized")).toBe(1.0);
    });

    it("evaluates compression ease and extreme negative ease for stretch fabrics", () => {
      const target = getTargetEaseRange("slim");
      expect(calculateGaussianEaseScore(-50, target, true)).toBeGreaterThan(0);
      expect(calculateGaussianEaseScore(-120, target, true)).toBe(0);
    });
  });

  describe("Category Weights", () => {
    it("returns specific dimension weights for all categories", () => {
      expect(getCategoryWeights("tshirt").chest).toBe(0.40);
      expect(getCategoryWeights("casual_shirt").chest).toBe(0.30);
      expect(getCategoryWeights("formal_shirt").neck).toBe(0.25);
      expect(getCategoryWeights("hoodie").chest).toBe(0.45);
      expect(getCategoryWeights("jeans").waist).toBe(0.40);
      expect(getCategoryWeights("trousers").rise).toBe(0.10);
      expect(getCategoryWeights("kurta").torso_length).toBe(0.25);
      expect(getCategoryWeights("shoe").foot_length).toBe(1.0);
      expect(getCategoryWeights("unknown_category").chest).toBe(0.50);
    });
  });

  describe("Matrix C: Sizing & Fit Calculations", () => {
    it("TC-S-001: Rigid Fabric Negative Ease Penalty", () => {
      const chest1000Profile: AnatomicalProfile = {
        ...profile96,
        chestMm: 1000,
      };

      const rigidGarments: GarmentDimensions[] = [
        {
          productId: "rigid_1",
          sizeLabel: "S",
          chestFlatMm: 480, // 960mm (-40mm negative ease)
          measurementMethod: "laid_flat",
          measuredBy: "brand",
        },
        {
          productId: "rigid_1",
          sizeLabel: "M",
          chestFlatMm: 550, // 1100mm (+100mm positive ease)
          measurementMethod: "laid_flat",
          measuredBy: "brand",
        },
      ];

      const result = evaluateSizeRecommendation({
        profile: chest1000Profile,
        fitPreference: prefRegularTshirt,
        garmentDimensions: rigidGarments,
        fabricSpec: {
          materialComposition: "100% rigid cotton",
          elastanePercentage: 0,
          stretchLevel: "none",
          estimatedShrinkagePct: 2,
        },
      });

      expect(result.recommendedSize).toBe("M");
      expect(result.dimensionBreakdown[0].easeDeltaMm).toBe(100);
    });

    it("TC-S-002: Stretch Knit Negative Ease Allowance", () => {
      const chest1000Profile: AnatomicalProfile = {
        ...profile96,
        chestMm: 1000,
      };

      const compressionKnit: GarmentDimensions[] = [
        {
          productId: "comp_1",
          sizeLabel: "S",
          chestFlatMm: 470, // 940mm circ (-60mm ease)
          measurementMethod: "laid_flat",
          measuredBy: "brand",
        },
      ];

      const result = evaluateSizeRecommendation({
        profile: chest1000Profile,
        fitPreference: { ...prefRegularTshirt, fitType: "slim" },
        garmentDimensions: compressionKnit,
        fabricSpec: {
          materialComposition: "85% polyester 15% elastane",
          elastanePercentage: 15,
          stretchLevel: "high",
          estimatedShrinkagePct: 0,
        },
      });

      // Allowed under compression stretch
      expect(result.recommendedSize).toBe("S");
      expect(result.fitScore).toBeGreaterThan(40);
    });

    it("TC-S-003: Boundary Crossover Determination & Borderline Detection", () => {
      const borderlineGarments: GarmentDimensions[] = [
        {
          productId: "b_1",
          sizeLabel: "M",
          chestFlatMm: 530, // 1060mm circ (+100mm ease, dev 10mm)
          measurementMethod: "laid_flat",
          measuredBy: "brand",
        },
        {
          productId: "b_1",
          sizeLabel: "L",
          chestFlatMm: 540, // 1080mm circ (+120mm ease, dev 10mm)
          measurementMethod: "laid_flat",
          measuredBy: "brand",
        },
      ];

      const result = evaluateSizeRecommendation({
        profile: profile96,
        fitPreference: prefRegularTshirt,
        garmentDimensions: borderlineGarments,
      });

      expect(result.isBorderline).toBe(true);
      expect(result.borderlineTradeoff).toBeDefined();
      expect(result.borderlineTradeoff).toContain("Borderline between M and L");
    });

    it("TC-S-004: Fit Intent Modulation", () => {
      const oversizedResult = evaluateSizeRecommendation({
        profile: profile96,
        fitPreference: { ...prefRegularTshirt, fitType: "oversized" },
        garmentDimensions: sampleGarments,
      });

      // For oversized (+200mm to +300mm ease), XL (+260mm ease) is selected over M
      expect(oversizedResult.recommendedSize).toBe("XL");
      expect(oversizedResult.fitTypeUsed).toBe("oversized");
    });

    it("TC-S-005: Reference Garment Calibration Anchors", () => {
      const calibratedResult = evaluateSizeRecommendation({
        profile: profile96,
        fitPreference: prefRegularTshirt,
        garmentDimensions: sampleGarments,
        referenceGarments: [
          {
            category: "tshirt",
            sizeLabel: "M",
            fitQuality: "perfect",
          },
        ],
      });

      expect(calibratedResult.recommendedSize).toBe("M");
      expect(calibratedResult.confidence).toBeGreaterThanOrEqual(0.95);
      expect(calibratedResult.confidenceLabel).toBe("high");
    });
  });

  describe("Matrix D: Explainability Engine", () => {
    it("TC-E-001: Structured Explanation Generation", () => {
      const result = evaluateSizeRecommendation({
        profile: profile96,
        fitPreference: prefRegularTshirt,
        garmentDimensions: sampleGarments,
      });

      expect(result.recommendedSize).toBe("M");
      expect(result.fitScore).toBeGreaterThan(0);
      expect(result.confidenceLabel).toBe("high");
      expect(result.dimensionBreakdown.length).toBeGreaterThanOrEqual(1);

      const chestBreakdown = result.dimensionBreakdown[0];
      expect(chestBreakdown.dimension).toBe("Chest Circumference");
      expect(chestBreakdown.bodyMeasurementMm).toBe(960);
      expect(chestBreakdown.garmentSpecMm).toBe(1060);
      expect(chestBreakdown.easeDeltaMm).toBe(100);
      expect(chestBreakdown.status).toBe("ideal");
      expect(result.dataSources.layerUsed).toBe("Layer3_Garment");
    });

    it("TC-E-002: Plain-English Readability", () => {
      const result = evaluateSizeRecommendation({
        profile: profile96,
        fitPreference: prefRegularTshirt,
        garmentDimensions: sampleGarments,
      });

      expect(result.summaryText).toContain("96cm");
      expect(result.summaryText).toContain("size M");
      expect(result.summaryText).toContain("+10cm ease");
      expect(result.summaryText).not.toContain("NaN");
      expect(result.summaryText).not.toContain("undefined");
    });

    it("Safely handles missing inputs with insufficient_data result", () => {
      const emptyResult = evaluateSizeRecommendation({
        profile: { profileId: "xyz", chestMm: 0, isCurrent: true },
        fitPreference: prefRegularTshirt,
      });

      expect(emptyResult.recommendedSize).toBe("");
      expect(emptyResult.confidenceLabel).toBe("insufficient");
      expect(emptyResult.summaryText).toContain("Insufficient data");
    });

    it("Correctly falls back to Layer 2 brand body fit charts and handles distance penalty", () => {
      const brandCharts: BrandSizeChart[] = [
        {
          brandId: "b_hm",
          category: "tshirt",
          gender: "male",
          sizeLabel: "S",
          chestMinMm: 800,
          chestMaxMm: 880,
        },
        {
          brandId: "b_hm",
          category: "tshirt",
          gender: "male",
          sizeLabel: "M",
          chestMinMm: 940,
          chestMaxMm: 1020,
        },
      ];

      const result = evaluateSizeRecommendation({
        profile: profile96,
        fitPreference: prefRegularTshirt,
        brandSizeCharts: brandCharts,
      });

      expect(result.recommendedSize).toBe("M");
      expect(result.dataSources.layerUsed).toBe("Layer2_BrandChart");
    });

    it("handles reference garments with too_tight and too_loose penalties", () => {
      const resultTight = evaluateSizeRecommendation({
        profile: profile96,
        fitPreference: prefRegularTshirt,
        garmentDimensions: sampleGarments,
        referenceGarments: [
          {
            category: "tshirt",
            sizeLabel: "M",
            fitQuality: "too_tight",
          },
        ],
      });
      expect(resultTight.recommendedSize).toBeDefined();

      const resultLoose = evaluateSizeRecommendation({
        profile: profile96,
        fitPreference: prefRegularTshirt,
        garmentDimensions: sampleGarments,
        referenceGarments: [
          {
            category: "tshirt",
            sizeLabel: "M",
            fitQuality: "too_loose",
          },
        ],
      });
      expect(resultLoose.recommendedSize).toBeDefined();
    });

    it("handles tight and loose shoulder deltas in explanation generation", () => {
      const narrowShoulderGarments: GarmentDimensions[] = [
        {
          productId: "p_narrow",
          sizeLabel: "M",
          chestFlatMm: 530,
          shoulderMm: 400, // 400 - 440 = -40mm (tight shoulder)
          measurementMethod: "laid_flat",
        },
      ];

      const resNarrow = evaluateSizeRecommendation({
        profile: profile96,
        fitPreference: prefRegularTshirt,
        garmentDimensions: narrowShoulderGarments,
      });
      const shoulderBreakdownNarrow = resNarrow.dimensionBreakdown.find(d => d.dimension === "Shoulder Width");
      expect(shoulderBreakdownNarrow?.status).toBe("tight");

      const wideShoulderGarments: GarmentDimensions[] = [
        {
          productId: "p_wide",
          sizeLabel: "M",
          chestFlatMm: 530,
          shoulderMm: 500, // 500 - 440 = +60mm (loose shoulder for regular)
          measurementMethod: "laid_flat",
        },
      ];

      const resWide = evaluateSizeRecommendation({
        profile: profile96,
        fitPreference: prefRegularTshirt,
        garmentDimensions: wideShoulderGarments,
      });
      const shoulderBreakdownWide = resWide.dimensionBreakdown.find(d => d.dimension === "Shoulder Width");
      expect(shoulderBreakdownWide?.status).toBe("loose");
    });

    it("refuses safely when all candidate scores are below threshold (<= 0.05)", () => {
      const extremeSmallGarments: GarmentDimensions[] = [
        {
          productId: "p_extreme_small",
          sizeLabel: "XXS",
          chestFlatMm: 350, // 700mm circ on 960mm chest -> -260mm ease -> 0 score
          measurementMethod: "laid_flat",
        },
      ];

      const result = evaluateSizeRecommendation({
        profile: profile96,
        fitPreference: prefRegularTshirt,
        garmentDimensions: extremeSmallGarments,
      });

      expect(result.recommendedSize).toBe("");
      expect(result.fitScore).toBe(0);
      expect(result.summaryText).toContain("No suitable size found");
    });
  });
});
