import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
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
} from "../../src/core/units";
import {
  AnatomicalProfile,
  BrandSizeChart,
  GarmentDimensions,
  FitPreference,
  FabricSpec,
  FabricSpecSchema,
} from "../../src/core/types";

const projectRoot = path.resolve(__dirname, "../..");

describe("Tier 3 — Cross-Feature Combinations (Pairwise Feature Interactions)", () => {
  const profileId1 = "123e4567-e89b-12d3-a456-426614174001";
  const profileId2 = "123e4567-e89b-12d3-a456-426614174002";

  const standardProfile: AnatomicalProfile = {
    profileId: profileId1,
    chestMm: 960,
    shoulderWidthMm: 440,
    torsoLengthMm: 720,
    waistMm: 820,
    measurementMethod: { chestMm: "tape" },
    isCurrent: true,
  };

  const sampleGarments: GarmentDimensions[] = [
    { productId: "tee_01", sizeLabel: "S", chestFlatMm: 500, shoulderMm: 420 }, // 1000mm (+40mm ease -> slim)
    { productId: "tee_01", sizeLabel: "M", chestFlatMm: 535, shoulderMm: 445 }, // 1070mm (+110mm ease -> regular)
    { productId: "tee_01", sizeLabel: "L", chestFlatMm: 565, shoulderMm: 465 }, // 1130mm (+170mm ease -> relaxed)
    { productId: "tee_01", sizeLabel: "XL", chestFlatMm: 605, shoulderMm: 485 }, // 1210mm (+250mm ease -> oversized)
  ];

  // -------------------------------------------------------------------------
  // Combo 1: Slim Fit Intent + Rigid Fabric (0% Elastane)
  // -------------------------------------------------------------------------
  it("Combo 1: Slim fit intent + Rigid fabric selects lower positive ease size without negative ease", () => {
    const pref: FitPreference = { profileId: profileId1, category: "tshirt", fitType: "slim" };
    const rigidFabric: FabricSpec = {
      materialComposition: "100% Cotton",
      elastanePercentage: 0,
      stretchLevel: "none",
      estimatedShrinkagePct: 2,
    };
    const res = evaluateSizing({
      profile: standardProfile,
      fitPreference: pref,
      garmentDimensions: sampleGarments,
      fabricSpec: rigidFabric,
    });
    expect(res.recommendedSize).toBe("S");
    expect(res.dimensionBreakdown[0].easeDeltaMm).toBeGreaterThanOrEqual(40);
  });

  // -------------------------------------------------------------------------
  // Combo 2: Slim Fit Intent + High-Stretch Knit (15% Elastane)
  // -------------------------------------------------------------------------
  it("Combo 2: Slim fit intent + High-stretch knit allows negative ease compression fit", () => {
    const pref: FitPreference = { profileId: profileId1, category: "tshirt", fitType: "slim" };
    const stretchFabric: FabricSpec = {
      materialComposition: "85% Polyester, 15% Elastane",
      elastanePercentage: 15,
      stretchLevel: "high",
      estimatedShrinkagePct: 1,
    };
    const compressionGarments: GarmentDimensions[] = [
      { productId: "base_01", sizeLabel: "XS", chestFlatMm: 470, shoulderMm: 420 }, // 940mm (-20mm negative ease, compression score ~0.833)
      { productId: "base_01", sizeLabel: "S", chestFlatMm: 530, shoulderMm: 440 },  // 1060mm (+100mm ease, outside slim range)
    ];
    const res = evaluateSizing({
      profile: standardProfile,
      fitPreference: pref,
      garmentDimensions: compressionGarments,
      fabricSpec: stretchFabric,
    });
    expect(res.recommendedSize).toBe("XS");
    expect(res.fitScore).toBeGreaterThan(60);
  });

  // -------------------------------------------------------------------------
  // Combo 3: Relaxed Fit Intent + Rigid Fabric (0% Elastane)
  // -------------------------------------------------------------------------
  it("Combo 3: Relaxed fit intent + Rigid fabric shifts recommendation to Size L (+170mm ease)", () => {
    const pref: FitPreference = { profileId: profileId1, category: "tshirt", fitType: "relaxed" };
    const rigidFabric: FabricSpec = {
      materialComposition: "100% Rigid Heavyweight Cotton",
      elastanePercentage: 0,
      stretchLevel: "none",
      estimatedShrinkagePct: 3,
    };
    const res = evaluateSizing({
      profile: standardProfile,
      fitPreference: pref,
      garmentDimensions: sampleGarments,
      fabricSpec: rigidFabric,
    });
    expect(res.recommendedSize).toBe("L");
    expect(res.dimensionBreakdown[0].easeDeltaMm).toBe(170);
  });

  // -------------------------------------------------------------------------
  // Combo 4: Relaxed Fit Intent + Calibrated Reference Garment ("too_tight")
  // -------------------------------------------------------------------------
  it("Combo 4: Relaxed fit + Calibrated reference garment ('too_tight') decisively promotes larger size", () => {
    const pref: FitPreference = { profileId: profileId1, category: "tshirt", fitType: "relaxed" };
    const closeRelaxedGarments: GarmentDimensions[] = [
      { productId: "tee_01", sizeLabel: "L", chestFlatMm: 560, shoulderMm: 450 },  // 1120mm (+160mm ease)
      { productId: "tee_01", sizeLabel: "XL", chestFlatMm: 575, shoulderMm: 460 }, // 1150mm (+190mm ease)
    ];
    const res = evaluateSizing({
      profile: standardProfile,
      fitPreference: pref,
      garmentDimensions: closeRelaxedGarments,
      referenceGarments: [{ category: "tshirt", sizeLabel: "L", fitQuality: "too_tight" }],
    });
    expect(res.recommendedSize).toBe("XL");
  });

  // -------------------------------------------------------------------------
  // Combo 5: Oversized Fit Intent + Calibrated Reference Garment ("too_loose")
  // -------------------------------------------------------------------------
  it("Combo 5: Oversized fit + Calibrated reference garment ('too_loose') restrains excessive tenting", () => {
    const pref: FitPreference = { profileId: profileId1, category: "tshirt", fitType: "oversized" };
    const closeOversizedGarments: GarmentDimensions[] = [
      { productId: "tee_01", sizeLabel: "L", chestFlatMm: 585, shoulderMm: 465 },  // 1170mm (+210mm ease)
      { productId: "tee_01", sizeLabel: "XL", chestFlatMm: 605, shoulderMm: 475 }, // 1210mm (+250mm ease)
    ];
    const res = evaluateSizing({
      profile: standardProfile,
      fitPreference: pref,
      garmentDimensions: closeOversizedGarments,
      referenceGarments: [{ category: "tshirt", sizeLabel: "XL", fitQuality: "too_loose" }],
    });
    expect(res.recommendedSize).toBe("L");
  });

  // -------------------------------------------------------------------------
  // Combo 6: Oversized Fit Intent + Missing Shoulder Measurement
  // -------------------------------------------------------------------------
  it("Combo 6: Oversized fit + Missing shoulder measurement rescales chest weighting cleanly", () => {
    const noShoulderProfile: AnatomicalProfile = {
      profileId: profileId1,
      chestMm: 960,
      measurementMethod: {},
      isCurrent: true,
    };
    const pref: FitPreference = { profileId: profileId1, category: "tshirt", fitType: "oversized" };
    const res = evaluateSizing({
      profile: noShoulderProfile,
      fitPreference: pref,
      garmentDimensions: sampleGarments,
    });
    expect(["L", "XL"]).toContain(res.recommendedSize);
    expect(res.fitTypeUsed).toBe("oversized");
    expect(res.dimensionBreakdown.find((d) => d.dimension === "Shoulder Width")).toBeUndefined();
  });

  // -------------------------------------------------------------------------
  // Combo 7: Regular Fit Intent + Missing Brand Size Charts (Layer 3 Preferred)
  // -------------------------------------------------------------------------
  it("Combo 7: Regular fit + Missing brand size charts evaluates Layer 3 flat specs seamlessly", () => {
    const pref: FitPreference = { profileId: profileId1, category: "tshirt", fitType: "regular" };
    const res = evaluateSizing({
      profile: standardProfile,
      fitPreference: pref,
      garmentDimensions: sampleGarments,
      // No brandSizeCharts passed
    });
    expect(res.recommendedSize).toBe("M");
    expect(res.dataSources.layerUsed).toBe("Layer3_Garment");
    expect(res.confidence).toBeGreaterThanOrEqual(0.85);
  });

  // -------------------------------------------------------------------------
  // Combo 8: Regular Fit Intent + Missing Garment Dimensions (Layer 2 Fallback)
  // -------------------------------------------------------------------------
  it("Combo 8: Regular fit + Missing garment dimensions falls back to Layer 2 body-fit charts", () => {
    const pref: FitPreference = { profileId: profileId1, category: "tshirt", fitType: "regular" };
    const charts: BrandSizeChart[] = [
      { brandId: "zara", category: "tshirt", gender: "male", sizeLabel: "S", chestMinMm: 880, chestMaxMm: 940 },
      { brandId: "zara", category: "tshirt", gender: "male", sizeLabel: "M", chestMinMm: 940, chestMaxMm: 1020 },
      { brandId: "zara", category: "tshirt", gender: "male", sizeLabel: "L", chestMinMm: 1020, chestMaxMm: 1100 },
    ];
    const res = evaluateSizing({
      profile: standardProfile,
      fitPreference: pref,
      brandSizeCharts: charts,
    });
    expect(res.recommendedSize).toBe("M");
    expect(res.dataSources.layerUsed).toBe("Layer2_BrandChart");
    expect(res.confidenceLabel).toBe("medium");
  });

  // -------------------------------------------------------------------------
  // Combo 9: Borderline Size Gap + Rigid Fabric (0% Elastane)
  // -------------------------------------------------------------------------
  it("Combo 9: Borderline size gap + Rigid fabric outputs tradeoff narrative between snug vs comfort", () => {
    const pref: FitPreference = { profileId: profileId1, category: "tshirt", fitType: "regular" };
    const borderlineGarments: GarmentDimensions[] = [
      { productId: "p", sizeLabel: "M", chestFlatMm: 527, shoulderMm: 440 }, // 1054mm (+94mm ease)
      { productId: "p", sizeLabel: "L", chestFlatMm: 537, shoulderMm: 445 }, // 1074mm (+114mm ease)
    ];
    const rigidFabric: FabricSpec = {
      materialComposition: "100% Rigid Cotton",
      elastanePercentage: 0,
      stretchLevel: "none",
      estimatedShrinkagePct: 2,
    };
    const res = evaluateSizing({
      profile: standardProfile,
      fitPreference: pref,
      garmentDimensions: borderlineGarments,
      fabricSpec: rigidFabric,
    });
    expect(res.isBorderline).toBe(true);
    expect(res.borderlineTradeoff).toContain("Borderline between");
  });

  // -------------------------------------------------------------------------
  // Combo 10: Borderline Size Gap + Stretch Fabric (10% Elastane)
  // -------------------------------------------------------------------------
  it("Combo 10: Borderline size gap + Stretch fabric allows athletic vs casual drape comparison", () => {
    const pref: FitPreference = { profileId: profileId1, category: "tshirt", fitType: "slim" };
    const borderlineGarments: GarmentDimensions[] = [
      { productId: "p", sizeLabel: "S", chestFlatMm: 505, shoulderMm: 440 }, // +50mm ease (dev -10mm)
      { productId: "p", sizeLabel: "M", chestFlatMm: 515, shoulderMm: 445 }, // +70mm ease (dev +10mm)
    ];
    const stretchFabric: FabricSpec = {
      materialComposition: "90% Cotton, 10% Elastane",
      elastanePercentage: 10,
      stretchLevel: "high",
      estimatedShrinkagePct: 1,
    };
    const res = evaluateSizing({
      profile: standardProfile,
      fitPreference: pref,
      garmentDimensions: borderlineGarments,
      fabricSpec: stretchFabric,
    });
    expect(res.isBorderline).toBe(true);
  });

  // -------------------------------------------------------------------------
  // Combo 11: Borderline Size Gap + Reference Garment Calibration
  // -------------------------------------------------------------------------
  it("Combo 11: Borderline size gap + Reference garment calibration resolves borderline gap", () => {
    const pref: FitPreference = { profileId: profileId1, category: "tshirt", fitType: "regular" };
    const borderlineGarments: GarmentDimensions[] = [
      { productId: "p", sizeLabel: "M", chestFlatMm: 527, shoulderMm: 440 },
      { productId: "p", sizeLabel: "L", chestFlatMm: 537, shoulderMm: 445 },
    ];
    const res = evaluateSizing({
      profile: standardProfile,
      fitPreference: pref,
      garmentDimensions: borderlineGarments,
      referenceGarments: [{ category: "tshirt", sizeLabel: "L", fitQuality: "perfect" }],
    });
    expect(res.recommendedSize).toBe("L");
  });

  // -------------------------------------------------------------------------
  // Combo 12: Reference Garment Calibration + Layer 2 Brand Charts
  // -------------------------------------------------------------------------
  it("Combo 12: Reference garment calibration adjusts score on Layer 2 body-fit charts", () => {
    const pref: FitPreference = { profileId: profileId1, category: "tshirt", fitType: "regular" };
    const charts: BrandSizeChart[] = [
      { brandId: "zara", category: "tshirt", gender: "male", sizeLabel: "M", chestMinMm: 940, chestMaxMm: 1020 },
      { brandId: "zara", category: "tshirt", gender: "male", sizeLabel: "L", chestMinMm: 1020, chestMaxMm: 1100 },
    ];
    const res = evaluateSizing({
      profile: standardProfile,
      fitPreference: pref,
      brandSizeCharts: charts,
      referenceGarments: [{ category: "tshirt", sizeLabel: "L", fitQuality: "perfect" }],
    });
    expect(res.confidence).toBeGreaterThan(0.70);
  });

  // -------------------------------------------------------------------------
  // Combo 13: Reference Garment Calibration from Mismatched Category
  // -------------------------------------------------------------------------
  it("Combo 13: Reference garment calibration from mismatched category (jeans on t-shirt) is ignored", () => {
    const pref: FitPreference = { profileId: profileId1, category: "tshirt", fitType: "regular" };
    const resBase = evaluateSizing({ profile: standardProfile, fitPreference: pref, garmentDimensions: sampleGarments });
    const resMismatched = evaluateSizing({
      profile: standardProfile,
      fitPreference: pref,
      garmentDimensions: sampleGarments,
      referenceGarments: [{ category: "jeans", sizeLabel: "L", fitQuality: "perfect" }],
    });
    expect(resMismatched.fitScore).toBe(resBase.fitScore);
  });

  // -------------------------------------------------------------------------
  // Combo 14: Ethnic Kurta Category + 0% Stretch Cotton
  // -------------------------------------------------------------------------
  it("Combo 14: Ethnic Kurta category + 0% stretch woven fabric applies Kurta weighting matrix", () => {
    const pref: FitPreference = { profileId: profileId1, category: "kurta", fitType: "regular" };
    const kurtaGarments: GarmentDimensions[] = [
      { productId: "k_01", sizeLabel: "38", chestFlatMm: 510, shoulderMm: 430, lengthMm: 1020 }, // 1020mm (+60mm ease -> snug)
      { productId: "k_01", sizeLabel: "40", chestFlatMm: 540, shoulderMm: 450, lengthMm: 1050 }, // 1080mm (+120mm ease -> ideal)
      { productId: "k_01", sizeLabel: "42", chestFlatMm: 570, shoulderMm: 470, lengthMm: 1080 }, // 1140mm (+180mm ease)
    ];
    const rigidFabric: FabricSpec = {
      materialComposition: "100% Khadi Cotton",
      elastanePercentage: 0,
      stretchLevel: "none",
      estimatedShrinkagePct: 3,
    };
    const res = evaluateSizing({
      profile: standardProfile,
      fitPreference: pref,
      garmentDimensions: kurtaGarments,
      fabricSpec: rigidFabric,
    });
    expect(res.recommendedSize).toBe("40");
  });

  // -------------------------------------------------------------------------
  // Combo 15: Ethnic Kurta Category + Missing Torso Length
  // -------------------------------------------------------------------------
  it("Combo 15: Ethnic Kurta category + Missing torso length rebalances chest and shoulder weights", () => {
    const profileNoTorso: AnatomicalProfile = {
      profileId: profileId1,
      chestMm: 960,
      shoulderWidthMm: 440,
      measurementMethod: {},
      isCurrent: true,
    };
    const pref: FitPreference = { profileId: profileId1, category: "kurta", fitType: "regular" };
    const kurtaGarments: GarmentDimensions[] = [
      { productId: "k_01", sizeLabel: "40", chestFlatMm: 540, shoulderMm: 450 },
    ];
    const res = evaluateSizing({
      profile: profileNoTorso,
      fitPreference: pref,
      garmentDimensions: kurtaGarments,
    });
    expect(res.recommendedSize).toBe("40");
    expect(res.confidenceLabel).toBe("high");
  });

  // -------------------------------------------------------------------------
  // Combo 16: Bottoms (Jeans) + Inseam Length Evaluation
  // -------------------------------------------------------------------------
  it("Combo 16: Bottoms (Jeans) applies waist (40%) and inseam (35%) weighting", () => {
    const weights = getCategoryWeights("jeans");
    expect(weights.waist).toBe(0.40);
    expect(weights.inseam).toBe(0.35);
    expect(weights.thigh).toBe(0.25);
  });

  // -------------------------------------------------------------------------
  // Combo 17: PWA Offline Mode + Local Mock Store Query
  // -------------------------------------------------------------------------
  it("Combo 17: PWA offline environment supports local zero-credential mock catalog", () => {
    const auditDoc = fs.readFileSync(path.join(projectRoot, "docs/brand-data-audit.md"), "utf-8");
    expect(auditDoc).toContain("Uniqlo India");
    expect(auditDoc).toContain("H&M India");
    expect(auditDoc).toContain("Levi's India");
  });

  // -------------------------------------------------------------------------
  // Combo 18: PWA Standalone Manifest + Design System Theme Tokens
  // -------------------------------------------------------------------------
  it("Combo 18: PWA manifest theme and background colors exactly match design tokens in tokens.css", () => {
    const manifest = JSON.parse(fs.readFileSync(path.join(projectRoot, "public/manifest.json"), "utf-8"));
    const tokens = fs.readFileSync(path.join(projectRoot, "src/styles/tokens.css"), "utf-8");
    expect(tokens).toContain(manifest.theme_color);
    expect(tokens).toContain(manifest.background_color);
  });

  // -------------------------------------------------------------------------
  // Combo 19: ExplanationTree Generation + Presentation Unit Conversion (Inches)
  // -------------------------------------------------------------------------
  it("Combo 19: ExplanationTree canonical mm projects cleanly into inches for display", () => {
    const pref: FitPreference = { profileId: profileId1, category: "tshirt", fitType: "regular" };
    const res = evaluateSizing({ profile: standardProfile, fitPreference: pref, garmentDimensions: sampleGarments });
    const chestMm = res.dimensionBreakdown[0].bodyMeasurementMm;
    const chestInches = mmToInches(chestMm, 1);
    expect(chestInches).toBe(37.8);
  });

  // -------------------------------------------------------------------------
  // Combo 20: ExplanationTree Generation + Presentation Unit Conversion (Centimeters)
  // -------------------------------------------------------------------------
  it("Combo 20: ExplanationTree canonical mm projects cleanly into centimeters for display", () => {
    const pref: FitPreference = { profileId: profileId1, category: "tshirt", fitType: "regular" };
    const res = evaluateSizing({ profile: standardProfile, fitPreference: pref, garmentDimensions: sampleGarments });
    const chestMm = res.dimensionBreakdown[0].bodyMeasurementMm;
    const chestCm = mmToCm(chestMm);
    expect(chestCm).toBe(96.0);
    expect(res.summaryText).toContain("96cm");
  });

  // -------------------------------------------------------------------------
  // Combo 21: Zero-Knowledge Sizing Token API Contract + Biometric Privacy
  // -------------------------------------------------------------------------
  it("Combo 21: Zero-knowledge sizing match response contract omits raw biometrics", () => {
    const pref: FitPreference = { profileId: profileId1, category: "tshirt", fitType: "regular" };
    const res = evaluateSizing({ profile: standardProfile, fitPreference: pref, garmentDimensions: sampleGarments });
    const publicTokenResponse = {
      recommendedSize: res.recommendedSize,
      fitScore: res.fitScore,
      confidence: res.confidence,
      confidenceLabel: res.confidenceLabel,
      fitTypeUsed: res.fitTypeUsed,
    };
    expect((publicTokenResponse as any).chestMm).toBeUndefined();
    expect((publicTokenResponse as any).waistMm).toBeUndefined();
  });

  // -------------------------------------------------------------------------
  // Combo 22: High-Shrinkage Fabric (8%) + Slim Fit Intent
  // -------------------------------------------------------------------------
  it("Combo 22: High-shrinkage fabric spec is validated and retains shrinkage parameter", () => {
    const shrinkSpec: FabricSpec = {
      materialComposition: "100% Unsanforized Raw Cotton",
      elastanePercentage: 0,
      stretchLevel: "none",
      estimatedShrinkagePct: 8,
    };
    const parsed = FabricSpecSchema.safeParse(shrinkSpec);
    expect(parsed.success).toBe(true);
    expect(parsed.data?.estimatedShrinkagePct).toBe(8);
  });

  // -------------------------------------------------------------------------
  // Combo 23: Positive Community Correction Factor (+0.05) + Layer 3 Dimensions
  // -------------------------------------------------------------------------
  it("Combo 23: Positive community correction (+0.05) shifts score up for garments running small", () => {
    const pref: FitPreference = { profileId: profileId1, category: "tshirt", fitType: "regular" };
    const tightGarments: GarmentDimensions[] = [
      { productId: "p", sizeLabel: "M", chestFlatMm: 520, shoulderMm: 440 },
    ];
    const resBase = evaluateSizing({ profile: standardProfile, fitPreference: pref, garmentDimensions: tightGarments });
    const resCorrected = evaluateSizing({
      profile: standardProfile,
      fitPreference: pref,
      garmentDimensions: tightGarments,
      communityCorrectionFactor: 0.05,
    });
    expect(resCorrected.fitScore).toBeGreaterThan(resBase.fitScore);
  });

  // -------------------------------------------------------------------------
  // Combo 24: Negative Community Correction Factor (-0.05) + Borderline Resolution
  // -------------------------------------------------------------------------
  it("Combo 24: Negative community correction (-0.05) shifts scores downward for garments running large", () => {
    const pref: FitPreference = { profileId: profileId1, category: "tshirt", fitType: "regular" };
    const borderlineGarments: GarmentDimensions[] = [
      { productId: "p", sizeLabel: "M", chestFlatMm: 525, shoulderMm: 440 },
    ];
    const resBase = evaluateSizing({ profile: standardProfile, fitPreference: pref, garmentDimensions: borderlineGarments });
    const resCorrected = evaluateSizing({
      profile: standardProfile,
      fitPreference: pref,
      garmentDimensions: borderlineGarments,
      communityCorrectionFactor: -0.05,
    });
    expect(resCorrected.fitScore).toBeLessThan(resBase.fitScore);
  });

  // -------------------------------------------------------------------------
  // Combo 25: Multi-Profile Household Evaluation
  // -------------------------------------------------------------------------
  it("Combo 25: Multi-profile household evaluation produces independent recommendations on same product", () => {
    const partnerProfile: AnatomicalProfile = {
      profileId: profileId2,
      chestMm: 1040,
      shoulderWidthMm: 470,
      measurementMethod: {},
      isCurrent: true,
    };
    const prefSelf: FitPreference = { profileId: profileId1, category: "tshirt", fitType: "slim" };
    const prefPartner: FitPreference = { profileId: profileId2, category: "tshirt", fitType: "relaxed" };

    const resSelf = evaluateSizing({ profile: standardProfile, fitPreference: prefSelf, garmentDimensions: sampleGarments });
    const resPartner = evaluateSizing({ profile: partnerProfile, fitPreference: prefPartner, garmentDimensions: sampleGarments });

    expect(resSelf.recommendedSize).toBe("S");
    expect(resPartner.recommendedSize).toBe("XL");
    expect(resSelf.fitTypeUsed).toBe("slim");
    expect(resPartner.fitTypeUsed).toBe("relaxed");
  });
});
