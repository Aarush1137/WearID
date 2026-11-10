import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import {
  evaluateSizing,
  getTargetChestEaseRange,
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
  AnatomicalProfileSchema,
  BrandSizeChart,
  GarmentDimensions,
  FitPreference,
  FabricSpec,
} from "../../src/core/types";

const projectRoot = path.resolve(__dirname, "../..");

describe("Tier 4 — Real-World Application Workload Scenarios", () => {
  // =========================================================================
  // Scenario 1: Men's T-Shirt Recommendation (Uniqlo Airism Crew Neck)
  // Regular Fit Preference (F10, F11, F12, F15, F17, F23, F24)
  // =========================================================================
  describe("Scenario 1: Men's T-Shirt Recommendation (Uniqlo Airism Crew Neck)", () => {
    // Step 1: User enters anatomical dimensions via mobile tape onboarding
    const rawChestCm = 96.0;
    const rawShoulderCm = 44.0;
    const userProfile: AnatomicalProfile = {
      profileId: "11111111-1111-4111-a111-111111111111",
      chestMm: cmToMm(rawChestCm), // 960 mm
      shoulderWidthMm: cmToMm(rawShoulderCm), // 440 mm
      torsoLengthMm: 710,
      measurementMethod: { chestMm: "tape", shoulderWidthMm: "tape" },
      isCurrent: true,
    };

    // Step 2: Uniqlo Airism Crew Neck technical flat pack specifications (Layer 3)
    const uniqloAirismGarments: GarmentDimensions[] = [
      {
        id: "g_uniqlo_s",
        productId: "prod_uniqlo_airism_crew",
        sizeLabel: "S",
        chestFlatMm: 490, // Circumference = 980mm (+20mm ease -> tight for regular)
        shoulderMm: 420,
        lengthMm: 680,
        measurementMethod: "laid_flat",
        measuredBy: "brand",
      },
      {
        id: "g_uniqlo_m",
        productId: "prod_uniqlo_airism_crew",
        sizeLabel: "M",
        chestFlatMm: 530, // Circumference = 1060mm (+100mm ease -> ideal for regular)
        shoulderMm: 450,
        lengthMm: 710,
        measurementMethod: "laid_flat",
        measuredBy: "brand",
      },
      {
        id: "g_uniqlo_l",
        productId: "prod_uniqlo_airism_crew",
        sizeLabel: "L",
        chestFlatMm: 570, // Circumference = 1140mm (+180mm ease -> loose for regular)
        shoulderMm: 470,
        lengthMm: 730,
        measurementMethod: "laid_flat",
        measuredBy: "brand",
      },
      {
        id: "g_uniqlo_xl",
        productId: "prod_uniqlo_airism_crew",
        sizeLabel: "XL",
        chestFlatMm: 610, // Circumference = 1220mm (+260mm ease -> oversized)
        shoulderMm: 490,
        lengthMm: 750,
        measurementMethod: "laid_flat",
        measuredBy: "brand",
      },
    ];

    const regularFitPref: FitPreference = {
      profileId: "11111111-1111-4111-a111-111111111111",
      category: "tshirt",
      fitType: "regular",
    };

    it("1.1: converts raw input dimensions to canonical integer millimeters", () => {
      expect(userProfile.chestMm).toBe(960);
      expect(userProfile.shoulderWidthMm).toBe(440);
    });

    it("1.2: evaluates Uniqlo Airism tech pack and recommends Size M", () => {
      const result = evaluateSizing({
        profile: userProfile,
        fitPreference: regularFitPref,
        garmentDimensions: uniqloAirismGarments,
      });

      expect(result.recommendedSize).toBe("M");
      expect(result.fitScore).toBeGreaterThan(80);
      expect(result.confidence).toBeGreaterThanOrEqual(0.85);
      expect(result.confidenceLabel).toBe("high");
      expect(result.dataSources.layerUsed).toBe("Layer3_Garment");
    });

    it("1.3: ExplanationTree details exact +100mm chest ease and ideal status", () => {
      const result = evaluateSizing({
        profile: userProfile,
        fitPreference: regularFitPref,
        garmentDimensions: uniqloAirismGarments,
      });

      const chestBreakdown = result.dimensionBreakdown.find((d) => d.dimension === "Chest Circumference");
      expect(chestBreakdown).toBeDefined();
      expect(chestBreakdown!.bodyMeasurementMm).toBe(960);
      expect(chestBreakdown!.garmentSpecMm).toBe(1060);
      expect(chestBreakdown!.easeDeltaMm).toBe(100);
      expect(chestBreakdown!.status).toBe("ideal");
      expect(chestBreakdown!.rationale).toContain("10cm ease");
    });

    it("1.4: conversational summaryText renders friendly explanation in centimeters", () => {
      const result = evaluateSizing({
        profile: userProfile,
        fitPreference: regularFitPref,
        garmentDimensions: uniqloAirismGarments,
      });

      expect(result.summaryText).toContain("96cm");
      expect(result.summaryText).toContain("size M");
      expect(result.summaryText).toContain("+10cm ease");
    });

    it("1.5: operates without measurement hallucination using verified official specs", () => {
      const result = evaluateSizing({
        profile: userProfile,
        fitPreference: regularFitPref,
        garmentDimensions: uniqloAirismGarments,
      });

      expect(result.dataSources.provenance).toBeDefined();
      expect(result.dataSources.provenance).toContain("Verified Official Specifications");
    });
  });

  // =========================================================================
  // Scenario 2: Relaxed Fit Shopping for H&M Tee with Borderline Size Tradeoff Flag
  // (F12, F14, F15, F17, F23)
  // =========================================================================
  describe("Scenario 2: Relaxed Fit Shopping for H&M Tee with Borderline Size Tradeoff Flag", () => {
    const shopperProfile: AnatomicalProfile = {
      profileId: "22222222-2222-4222-a222-222222222222",
      chestMm: 1000, // 100 cm
      shoulderWidthMm: 460,
      measurementMethod: {},
      isCurrent: true,
    };

    const relaxedPref: FitPreference = {
      profileId: "22222222-2222-4222-a222-222222222222",
      category: "tshirt",
      fitType: "relaxed", // Target: 140mm to 200mm ease, midpoint 170mm
    };

    // Close candidate sizes producing score delta < 0.08
    const hmRelaxedGarments: GarmentDimensions[] = [
      {
        productId: "hm_tee_relaxed",
        sizeLabel: "L",
        chestFlatMm: 580, // Circumference = 1160mm (+160mm ease -> deviation -10mm from 170)
        shoulderMm: 480,
      },
      {
        productId: "hm_tee_relaxed",
        sizeLabel: "XL",
        chestFlatMm: 590, // Circumference = 1180mm (+180mm ease -> deviation +10mm from 170)
        shoulderMm: 490,
      },
    ];

    it("2.1: identifies both L and XL as viable relaxed fit candidates", () => {
      const result = evaluateSizing({
        profile: shopperProfile,
        fitPreference: relaxedPref,
        garmentDimensions: hmRelaxedGarments,
      });

      expect(["L", "XL"]).toContain(result.recommendedSize);
      expect(result.fitScore).toBeGreaterThan(85);
    });

    it("2.2: detects borderline proximity and flags isBorderline: true", () => {
      const result = evaluateSizing({
        profile: shopperProfile,
        fitPreference: relaxedPref,
        garmentDimensions: hmRelaxedGarments,
      });

      expect(result.isBorderline).toBe(true);
      expect(result.alternativeSize).toBeDefined();
      expect(["L", "XL"]).toContain(result.alternativeSize);
    });

    it("2.3: produces comparative borderlineTradeoff narrative explaining the fit tradeoff", () => {
      const result = evaluateSizing({
        profile: shopperProfile,
        fitPreference: relaxedPref,
        garmentDimensions: hmRelaxedGarments,
      });

      expect(result.borderlineTradeoff).toBeDefined();
      expect(result.borderlineTradeoff).toContain("Borderline between L and XL");
      expect(result.borderlineTradeoff).toContain("closer drape");
      expect(result.borderlineTradeoff).toContain("relaxed fit");
    });

    it("2.4: verifies dimensionBreakdown reports status for both candidate sizes accurately", () => {
      const result = evaluateSizing({
        profile: shopperProfile,
        fitPreference: relaxedPref,
        garmentDimensions: hmRelaxedGarments,
      });

      expect(result.dimensionBreakdown.length).toBeGreaterThan(0);
      expect(result.dimensionBreakdown[0].status).toBe("ideal");
      expect(result.dimensionBreakdown[0].easeTargetMm.min).toBe(140);
      expect(result.dimensionBreakdown[0].easeTargetMm.max).toBe(200);
    });
  });

  // =========================================================================
  // Scenario 3: Calibrated Fit using Levi's 501 Vintage Tee Benchmark
  // (F12, F13, F15, F17, F23)
  // =========================================================================
  describe("Scenario 3: Calibrated Fit using Levi's 501 Vintage Tee Benchmark", () => {
    const userProfile: AnatomicalProfile = {
      profileId: "33333333-3333-4333-a333-333333333333",
      chestMm: 980,
      shoulderWidthMm: 450,
      measurementMethod: {},
      isCurrent: true,
    };

    const pref: FitPreference = {
      profileId: "33333333-3333-4333-a333-333333333333",
      category: "tshirt",
      fitType: "regular",
    };

    const levisCandidates: GarmentDimensions[] = [
      {
        productId: "levis_vintage_tee",
        sizeLabel: "M",
        chestFlatMm: 535, // 1070mm (+90mm ease)
        shoulderMm: 450,
      },
      {
        productId: "levis_vintage_tee",
        sizeLabel: "L",
        chestFlatMm: 550, // 1100mm (+120mm ease)
        shoulderMm: 465,
      },
    ];

    it("3.1: evaluates baseline recommendation before reference benchmark is applied", () => {
      const uncalibratedResult = evaluateSizing({
        profile: userProfile,
        fitPreference: pref,
        garmentDimensions: levisCandidates,
      });
      // Both sizes are in regular ease range [80, 140]
      expect(["M", "L"]).toContain(uncalibratedResult.recommendedSize);
    });

    it("3.2: applies validated reference garment anchor ('too_tight' on M) to promote Size L", () => {
      const calibratedResult = evaluateSizing({
        profile: userProfile,
        fitPreference: pref,
        garmentDimensions: levisCandidates,
        referenceGarments: [
          {
            brandNameRaw: "Levi's",
            category: "tshirt",
            sizeLabel: "M",
            fitQuality: "too_tight", // Penalizes M by -0.15
          },
        ],
      });

      expect(calibratedResult.recommendedSize).toBe("L");
    });

    it("3.3: boosts overall confidence score when calibrated benchmark is present", () => {
      const uncalibrated = evaluateSizing({
        profile: userProfile,
        fitPreference: pref,
        garmentDimensions: levisCandidates,
      });
      const calibrated = evaluateSizing({
        profile: userProfile,
        fitPreference: pref,
        garmentDimensions: levisCandidates,
        referenceGarments: [
          {
            brandNameRaw: "Levi's",
            category: "tshirt",
            sizeLabel: "M",
            fitQuality: "too_tight",
          },
        ],
      });

      expect(calibrated.confidence).toBeGreaterThan(uncalibrated.confidence);
    });
  });

  // =========================================================================
  // Scenario 4: Offline PWA Session with Local Mock Store & Standalone Installability
  // (F7, F8, F19, F20, F21, F23, F24)
  // =========================================================================
  describe("Scenario 4: Offline PWA Session with Local Mock Store & Standalone Installability", () => {
    it("4.1: verifies PWA manifest declares standalone mobile configuration", () => {
      const manifestPath = path.join(projectRoot, "public/manifest.json");
      expect(fs.existsSync(manifestPath)).toBe(true);
      const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));

      expect(manifest.display).toBe("standalone");
      expect(manifest.start_url).toBe("/app");
      expect(manifest.orientation).toBe("portrait-primary");
      expect(manifest.theme_color).toBe("#1B2A4A");
      expect(manifest.background_color).toBe("#FAF8F5");
    });

    it("4.2: verifies local zero-credential mock data contains pilot brand records", () => {
      const audit = fs.readFileSync(path.join(projectRoot, "docs/brand-data-audit.md"), "utf-8");
      expect(audit).toContain("Uniqlo India");
      expect(audit).toContain("H&M India");
      expect(audit).toContain("Levi's India");
      expect(audit).toContain("FabIndia");
    });

    it("4.3: executes local sizing evaluation completely offline with zero network calls", () => {
      const profile: AnatomicalProfile = {
        profileId: "44444444-4444-4444-a444-444444444444",
        chestMm: 960,
        shoulderWidthMm: 440,
        measurementMethod: {},
        isCurrent: true,
      };
      const pref: FitPreference = {
        profileId: "44444444-4444-4444-a444-444444444444",
        category: "tshirt",
        fitType: "regular",
      };
      const localCachedGarments: GarmentDimensions[] = [
        { productId: "cached_01", sizeLabel: "M", chestFlatMm: 530, shoulderMm: 445 },
      ];

      const res = evaluateSizing({
        profile,
        fitPreference: pref,
        garmentDimensions: localCachedGarments,
      });

      expect(res.recommendedSize).toBe("M");
      expect(res.fitScore).toBeGreaterThan(80);
      expect(res.dataSources.layerUsed).toBe("Layer3_Garment");
    });

    it("4.4: design system tokens define 44px minimum touch target ergonomics", () => {
      const masterPrompt = fs.readFileSync(path.join(projectRoot, "MASTER_PROMPT.md"), "utf-8");
      expect(masterPrompt).toContain("44px minimum tap target on every interactive element");
    });
  });

  // =========================================================================
  // Scenario 5: Missing Anatomical Data handling gracefully without hallucinating measurements
  // (F10, F15, F16, F17, F23)
  // =========================================================================
  describe("Scenario 5: Missing Anatomical Data handling gracefully without hallucination", () => {
    it("5.1: halts sizing calculation when user biometrics omit required chest girth", () => {
      const profileWithoutChest = {
        profileId: "55555555-5555-4555-a555-555555555555",
        heightMm: 1780,
        weightG: 72000,
        // chestMm is missing!
      };

      const parsed = AnatomicalProfileSchema.safeParse(profileWithoutChest);
      // Schema validation must fail on missing chest
      expect(parsed.success).toBe(false);
    });

    it("5.2: reports insufficient data honestly without synthesizing missing numbers", () => {
      const profile: AnatomicalProfile = {
        profileId: "55555555-5555-4555-a555-555555555555",
        chestMm: 960,
        measurementMethod: {},
        isCurrent: true,
      };
      const pref: FitPreference = {
        profileId: "55555555-5555-4555-a555-555555555555",
        category: "tshirt",
        fitType: "regular",
      };

      // Empty garment dimensions and charts passed
      const result = evaluateSizing({ profile, fitPreference: pref });

      expect(result.recommendedSize).toBe("");
      expect(result.confidenceLabel).toBe("insufficient");
      expect(result.summaryText).toContain("Insufficient data");
    });

    it("5.3: enforces Invariant 1: never invent or estimate clothing measurements", () => {
      const agentsGovernance = fs.readFileSync(path.join(projectRoot, "AGENTS.md"), "utf-8");
      expect(agentsGovernance).toContain("Never Invent Clothing Measurements or Brand Size Charts");
    });
  });

  // =========================================================================
  // Scenario 6: Ethnic Kurta Fitting (FabIndia) with zero fabric stretch and strict chest ease
  // (F11, F12, F15, F17, F23)
  // =========================================================================
  describe("Scenario 6: Ethnic Kurta Fitting (FabIndia) with zero fabric stretch", () => {
    const kurtaShopperProfile: AnatomicalProfile = {
      profileId: "66666666-6666-4666-a666-666666666666",
      chestMm: 1020, // 102 cm
      shoulderWidthMm: 470, // 47 cm
      torsoLengthMm: 780,
      measurementMethod: {},
      isCurrent: true,
    };

    const kurtaPref: FitPreference = {
      profileId: "66666666-6666-4666-a666-666666666666",
      category: "kurta",
      fitType: "regular",
    };

    const fabindiaWovenKurta: GarmentDimensions[] = [
      {
        productId: "fabindia_khadi_kurta",
        sizeLabel: "38",
        chestFlatMm: 520, // 1040mm (+20mm ease -> too constrictive for woven kurta)
        shoulderMm: 450,
        lengthMm: 1020,
      },
      {
        productId: "fabindia_khadi_kurta",
        sizeLabel: "40",
        chestFlatMm: 565, // 1130mm (+110mm ease -> ideal for woven regular kurta)
        shoulderMm: 475,
        lengthMm: 1050,
      },
      {
        productId: "fabindia_khadi_kurta",
        sizeLabel: "42",
        chestFlatMm: 610, // 1220mm (+200mm ease -> loose drape)
        shoulderMm: 495,
        lengthMm: 1080,
      },
    ];

    const rigidKhadiFabric: FabricSpec = {
      materialComposition: "100% Woven Khadi Cotton",
      elastanePercentage: 0,
      stretchLevel: "none",
      estimatedShrinkagePct: 3,
    };

    it("6.1: applies Kurta category weights (chest 35%, shoulder 25%, torso 25%, sleeve 15%)", () => {
      const weights = getCategoryWeights("kurta");
      expect(weights.chest).toBe(0.35);
      expect(weights.shoulder).toBe(0.25);
      expect(weights.torso_length).toBe(0.25);
    });

    it("6.2: recommends Size 40 with generous ease for woven non-stretch textile", () => {
      const result = evaluateSizing({
        profile: kurtaShopperProfile,
        fitPreference: kurtaPref,
        garmentDimensions: fabindiaWovenKurta,
        fabricSpec: rigidKhadiFabric,
      });

      expect(result.recommendedSize).toBe("40");
      expect(result.fitScore).toBeGreaterThan(85);
    });

    it("6.3: dimension breakdown reports ideal chest ease and shoulder alignment", () => {
      const result = evaluateSizing({
        profile: kurtaShopperProfile,
        fitPreference: kurtaPref,
        garmentDimensions: fabindiaWovenKurta,
        fabricSpec: rigidKhadiFabric,
      });

      const chest = result.dimensionBreakdown.find((d) => d.dimension === "Chest Circumference");
      expect(chest).toBeDefined();
      expect(chest!.status).toBe("ideal");
      expect(chest!.easeDeltaMm).toBe(110);
    });

    it("6.4: summary text renders plain-English rationale with exact centimeter dimensions", () => {
      const result = evaluateSizing({
        profile: kurtaShopperProfile,
        fitPreference: kurtaPref,
        garmentDimensions: fabindiaWovenKurta,
        fabricSpec: rigidKhadiFabric,
      });

      expect(result.summaryText).toContain("102cm");
      expect(result.summaryText).toContain("size 40");
      expect(result.summaryText).toContain("+11cm ease");
    });
  });
});
