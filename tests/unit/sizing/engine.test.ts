import { describe, it, expect } from "vitest";
import { evaluateSizing, getTargetChestEaseRange } from "../../../src/sizing/engine";
import { AnatomicalProfile, FitPreference, GarmentDimensions, BrandSizeChart } from "../../../src/core/types";

describe("Deterministic Sizing Engine (src/sizing/engine.ts)", () => {
  const baseProfile: AnatomicalProfile = {
    profileId: "123e4567-e89b-12d3-a456-426614174000",
    chestMm: 960, // 96.0 cm
    shoulderWidthMm: 440, // 44.0 cm
    measurementMethod: { chestMm: "tape" },
    isCurrent: true,
  };

  const regularTshirtPref: FitPreference = {
    profileId: "123e4567-e89b-12d3-a456-426614174000",
    category: "tshirt",
    fitType: "regular",
  };

  const sampleTshirtGarments: GarmentDimensions[] = [
    {
      productId: "prod_001",
      sizeLabel: "S",
      chestFlatMm: 490, // 980 mm circumference (+20mm ease on 960 body)
      shoulderMm: 420,
      lengthMm: 680,
      measurementMethod: "laid_flat",
      measuredBy: "brand",
    },
    {
      productId: "prod_001",
      sizeLabel: "M",
      chestFlatMm: 530, // 1060 mm circumference (+100mm ease on 960 body -> ideal for regular)
      shoulderMm: 450,
      lengthMm: 710,
      measurementMethod: "laid_flat",
      measuredBy: "brand",
    },
    {
      productId: "prod_001",
      sizeLabel: "L",
      chestFlatMm: 570, // 1140 mm circumference (+180mm ease on 960 body -> loose for regular)
      shoulderMm: 470,
      lengthMm: 730,
      measurementMethod: "laid_flat",
      measuredBy: "brand",
    },
  ];

  it("TC-S-001: recommends ideal size for regular fit intent based on ease midpoint", () => {
    const result = evaluateSizing({
      profile: baseProfile,
      fitPreference: regularTshirtPref,
      garmentDimensions: sampleTshirtGarments,
    });

    expect(result.recommendedSize).toBe("M");
    expect(result.fitScore).toBeGreaterThan(80);
    expect(result.confidenceLabel).toBe("high");
    expect(result.summaryText).toContain("size M");
    expect(result.dimensionBreakdown.length).toBeGreaterThan(0);
    expect(result.dimensionBreakdown[0].dimension).toBe("Chest Circumference");
    expect(result.dimensionBreakdown[0].easeDeltaMm).toBe(100); // 1060 - 960 = 100mm
  });

  it("TC-S-002: applies strict zero-score penalty for negative ease on rigid fabrics", () => {
    // Body chest 1000mm, shirt chest flat 480mm (960mm circ -> -40mm ease)
    const athleticProfile: AnatomicalProfile = {
      ...baseProfile,
      chestMm: 1000,
    };

    const rigidGarments: GarmentDimensions[] = [
      {
        productId: "p_rigid",
        sizeLabel: "S",
        chestFlatMm: 480, // 960mm (-40mm negative ease)
        measurementMethod: "laid_flat",
        measuredBy: "brand",
      },
      {
        productId: "p_rigid",
        sizeLabel: "M",
        chestFlatMm: 550, // 1100mm (+100mm positive ease)
        measurementMethod: "laid_flat",
        measuredBy: "brand",
      },
    ];

    const result = evaluateSizing({
      profile: athleticProfile,
      fitPreference: regularTshirtPref,
      garmentDimensions: rigidGarments,
      fabricSpec: {
        materialComposition: "100% cotton",
        elastanePercentage: 0,
        stretchLevel: "none",
        estimatedShrinkagePct: 2,
      },
    });

    expect(result.recommendedSize).toBe("M");
    // Size S must be penalized to 0 score due to negative ease
    expect(result.dimensionBreakdown[0].status).not.toBe("tight");
  });

  it("TC-S-003: adjusts size recommendation when user selects oversized fit intent", () => {
    const oversizedPref: FitPreference = {
      ...regularTshirtPref,
      fitType: "oversized",
    };

    const result = evaluateSizing({
      profile: baseProfile,
      fitPreference: oversizedPref,
      garmentDimensions: sampleTshirtGarments,
    });

    // For oversized, Size L (1140mm = +180mm ease) scores higher than M (+100mm)
    expect(result.recommendedSize).toBe("L");
    expect(result.fitTypeUsed).toBe("oversized");
  });

  it("TC-S-004: detects borderline cases when scores are within 0.08 margin", () => {
    const borderlineGarments: GarmentDimensions[] = [
      {
        productId: "p_borderline",
        sizeLabel: "M",
        chestFlatMm: 525, // 1050mm (+90mm ease)
        measurementMethod: "laid_flat",
        measuredBy: "brand",
      },
      {
        productId: "p_borderline",
        sizeLabel: "L",
        chestFlatMm: 540, // 1080mm (+120mm ease)
        measurementMethod: "laid_flat",
        measuredBy: "brand",
      },
    ];

    const result = evaluateSizing({
      profile: baseProfile,
      fitPreference: regularTshirtPref,
      garmentDimensions: borderlineGarments,
    });

    expect(result.isBorderline).toBe(true);
    expect(result.borderlineTradeoff).toBeDefined();
    expect(result.borderlineTradeoff).toContain("Borderline between M and L");
  });

  it("TC-S-005: incorporates reference garment calibration to boost confidence", () => {
    const resultWithAnchor = evaluateSizing({
      profile: baseProfile,
      fitPreference: regularTshirtPref,
      garmentDimensions: sampleTshirtGarments,
      referenceGarments: [
        {
          category: "tshirt",
          sizeLabel: "M",
          fitQuality: "perfect",
        },
      ],
    });

    expect(resultWithAnchor.recommendedSize).toBe("M");
    expect(resultWithAnchor.confidence).toBeGreaterThanOrEqual(0.95);
  });

  it("TC-S-006: falls back to Layer 2 Brand Charts when Layer 3 is missing", () => {
    const brandCharts: BrandSizeChart[] = [
      {
        brandId: "brand_zara",
        category: "tshirt",
        gender: "male",
        sizeLabel: "S",
        chestMinMm: 880,
        chestMaxMm: 940,
        sortOrder: 1,
      },
      {
        brandId: "brand_zara",
        category: "tshirt",
        gender: "male",
        sizeLabel: "M",
        chestMinMm: 940,
        chestMaxMm: 1020, // 960mm falls right here!
        sortOrder: 2,
      },
      {
        brandId: "brand_zara",
        category: "tshirt",
        gender: "male",
        sizeLabel: "L",
        chestMinMm: 1020,
        chestMaxMm: 1100,
        sortOrder: 3,
      },
    ];

    const result = evaluateSizing({
      profile: baseProfile,
      fitPreference: regularTshirtPref,
      brandSizeCharts: brandCharts,
    });

    expect(result.recommendedSize).toBe("M");
    expect(result.dataSources.layerUsed).toBe("Layer2_BrandChart");
  });

  it("TC-S-007: reports insufficient data honestly when no charts exist", () => {
    const result = evaluateSizing({
      profile: baseProfile,
      fitPreference: regularTshirtPref,
    });

    expect(result.recommendedSize).toBe("");
    expect(result.confidenceLabel).toBe("insufficient");
    expect(result.summaryText).toContain("Insufficient data");
  });
});
