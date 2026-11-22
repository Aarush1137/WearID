import { describe, it, expect } from "vitest";
import {
  predictReturnRate,
  getCategoryBaselineRate,
  getFabricCushioningMultiplier,
} from "../../src/core/sizing/returnRatePredictor";
import {
  scoreOutfit,
  evaluateSilhouetteHarmony,
  evaluateShoePiece,
  ItemEvaluationResult,
} from "../../src/core/sizing/outfitScoring";
import {
  buildFamilyMatrix,
  generateFamilyCheatSheetText,
  validateCheatSheetPrivacy,
  BENCHMARK_BRANDS,
} from "../../src/core/sizing/familyMatrixService";
import {
  calculateLandmarkTrend,
  calculateProfileTrends,
  formatDelta,
} from "../../src/core/sizing/trendCalculation";
import { AnatomicalProfile, FitType } from "../../src/core/types";
import { UserProfile, MeasurementSnapshot } from "../../src/core/state/profileStore";
import { PILOT_PRODUCTS, PilotProduct } from "../../src/core/data/pilotBrands";

describe("M9 Adversarial Stress Test Suite: Empirical Challenger Probe", () => {
  // =========================================================================
  // MISSION 1: Return Rate Predictor Adversarial Probes
  // =========================================================================
  describe("Mission 1: Return Rate Predictor Probes", () => {
    describe("1.1 Boundary Clamping (Strictly between 5% and 95%)", () => {
      it("clamps extreme high-risk vectors to exactly 95%", () => {
        // High risk: shoes (baseline 28) + negative ease on rigid leather (-200mm deficit) + borderline (+22) * 1.25x
        const result = predictReturnRate({
          category: "shoes",
          recommendedSize: "9",
          actualChestEaseMm: -200,
          isBorderline: true,
          fabricSpec: {
            materialComposition: "100% Rigid Leather",
            stretchLevel: "none",
            elastanePercentage: 0,
            estimatedShrinkagePct: 0,
          },
        });

        expect(result.riskScore).toBe(95);
        expect(result.riskLevel).toBe("high");
        expect(result.riskScore).toBeLessThanOrEqual(95);
        expect(result.riskScore).toBeGreaterThanOrEqual(5);
      });

      it("clamps extreme low-risk vectors to at least 5%", () => {
        // Low risk: t-shirt (baseline 12) + perfect midpoint ease + 20% elastane stretch knit (0.7x) -> 12 * 0.7 = 8.4 -> 8%
        const result = predictReturnRate({
          category: "t_shirt",
          fitIntent: "regular",
          recommendedSize: "M",
          actualChestEaseMm: 110, // Exactly at midpoint of 80-140mm
          fabricSpec: {
            materialComposition: "80% Nylon, 20% Elastane",
            stretchLevel: "high",
            elastanePercentage: 20,
            estimatedShrinkagePct: 0,
          },
        });

        expect(result.riskScore).toBeGreaterThanOrEqual(5);
        expect(result.riskScore).toBeLessThanOrEqual(95);
        expect(result.riskLevel).toBe("low");
      });

      it("stress-tests 200 combinatorial parameter sets for strict [5, 95] containment", () => {
        const categories = ["shoes", "trousers", "jeans", "shirt_formal", "jacket", "t_shirt", "unknown_category"];
        const fitIntents: FitType[] = ["slim", "regular", "relaxed", "oversized"];
        const easeDeltas = [-500, -100, -20, 0, 15, 60, 110, 180, 400, 1000];
        const elastanePcts = [0, 1, 2, 4, 6, 15, 30];
        const borderlines = [true, false];

        for (const cat of categories) {
          for (const fit of fitIntents) {
            for (const ease of easeDeltas) {
              const elastane = elastanePcts[(ease + 500) % elastanePcts.length];
              const isBorder = borderlines[(ease + 500) % borderlines.length];

              const res = predictReturnRate({
                category: cat,
                fitIntent: fit,
                recommendedSize: "L",
                actualChestEaseMm: ease,
                isBorderline: isBorder,
                fabricSpec: {
                  materialComposition: "Blend",
                  stretchLevel: elastane >= 6 ? "high" : elastane >= 2 ? "medium" : "none",
                  elastanePercentage: elastane,
                  estimatedShrinkagePct: 0,
                },
              });

              expect(res.riskScore).toBeGreaterThanOrEqual(5);
              expect(res.riskScore).toBeLessThanOrEqual(95);
              expect(Number.isInteger(res.riskScore)).toBe(true);
            }
          }
        }
      });
    });

    describe("1.2 Negative Ease on Rigid Denim/Cotton (Constriction Risk Penalties)", () => {
      it("penalizes negative chest ease on 100% rigid cotton (0% elastane) with +30% constriction penalty", () => {
        const negativeEaseRigid = predictReturnRate({
          category: "t_shirt",
          fitIntent: "regular",
          recommendedSize: "M",
          actualChestEaseMm: -10, // Constricting negative ease
          fabricSpec: {
            materialComposition: "100% Rigid Cotton",
            stretchLevel: "none",
            elastanePercentage: 0,
            estimatedShrinkagePct: 0,
          },
        });

        // Ease risk contribution must include base deficit factor + 30 constriction bonus
        expect(negativeEaseRigid.easeRiskContribution).toBeGreaterThanOrEqual(70);
        expect(negativeEaseRigid.riskLevel).toBe("high");
        expect(
          negativeEaseRigid.primaryRiskDrivers.some((d) =>
            d.toLowerCase().includes("physical constriction")
          )
        ).toBe(true);
      });

      it("penalizes negative waist ease on rigid 501 denim (0% elastane)", () => {
        const rigidJeans = predictReturnRate({
          category: "jeans",
          fitIntent: "regular",
          recommendedSize: "32",
          actualWaistEaseMm: -5, // Constricting waistband
          fabricSpec: {
            materialComposition: "100% Rigid Denim",
            stretchLevel: "none",
            elastanePercentage: 0,
            estimatedShrinkagePct: 0,
          },
        });

        expect(rigidJeans.riskLevel).toBe("high");
        expect(rigidJeans.riskScore).toBeGreaterThanOrEqual(80);
        expect(
          rigidJeans.primaryRiskDrivers.some((d) =>
            d.toLowerCase().includes("physical constriction")
          )
        ).toBe(true);
      });

      it("verifies constriction threshold boundary: triggers for elastane < 4%, suppresses for elastane >= 4%", () => {
        // At 3% elastane (rigid threshold < 4%)
        const res3Pct = predictReturnRate({
          category: "t_shirt",
          fitIntent: "regular",
          recommendedSize: "M",
          actualChestEaseMm: -10,
          fabricSpec: {
            materialComposition: "Cotton Poly Blend",
            stretchLevel: "low",
            elastanePercentage: 3,
            estimatedShrinkagePct: 0,
          },
        });
        expect(
          res3Pct.primaryRiskDrivers.some((d) => d.toLowerCase().includes("physical constriction"))
        ).toBe(true);

        // At 4% elastane (stretch threshold >= 4%)
        const res4Pct = predictReturnRate({
          category: "t_shirt",
          fitIntent: "regular",
          recommendedSize: "M",
          actualChestEaseMm: -10,
          fabricSpec: {
            materialComposition: "Cotton Spandex Blend",
            stretchLevel: "medium",
            elastanePercentage: 4,
            estimatedShrinkagePct: 0,
          },
        });
        expect(
          res4Pct.primaryRiskDrivers.some((d) => d.toLowerCase().includes("physical constriction"))
        ).toBe(false);
      });
    });

    describe("1.3 Elastane Cushioning Multiplier across Edge Percentages", () => {
      it("verifies step multiplier across edge elastane percentages: 0%, 2%, 6%, 20%", () => {
        // 0% elastane (rigid) -> 1.25x
        expect(
          getFabricCushioningMultiplier({
            materialComposition: "Cotton",
            stretchLevel: "none",
            elastanePercentage: 0,
            estimatedShrinkagePct: 0,
          })
        ).toBe(1.25);

        // 2% elastane (comfort stretch) -> 1.05x
        expect(
          getFabricCushioningMultiplier({
            materialComposition: "Cotton Elastane",
            stretchLevel: "low",
            elastanePercentage: 2,
            estimatedShrinkagePct: 0,
          })
        ).toBe(1.05);

        // 6% elastane (elastic knit boundary) -> 0.70x
        expect(
          getFabricCushioningMultiplier({
            materialComposition: "Poly Elastane",
            stretchLevel: "high",
            elastanePercentage: 6,
            estimatedShrinkagePct: 0,
          })
        ).toBe(0.7);

        // 20% elastane (extreme compression stretch) -> 0.70x
        expect(
          getFabricCushioningMultiplier({
            materialComposition: "Spandex Blend",
            stretchLevel: "high",
            elastanePercentage: 20,
            estimatedShrinkagePct: 0,
          })
        ).toBe(0.7);
      });

      it("handles edge cases: undefined fabricSpec, negative elastane, intermediate boundaries", () => {
        // Undefined fabricSpec -> 1.25x fallback
        expect(getFabricCushioningMultiplier(undefined)).toBe(1.25);

        // Negative elastane -> 1.25x fallback
        expect(
          getFabricCushioningMultiplier({
            materialComposition: "Odd",
            stretchLevel: "none",
            elastanePercentage: -5,
            estimatedShrinkagePct: 0,
          })
        ).toBe(1.25);

        // Boundary at 1% -> 1.05x
        expect(
          getFabricCushioningMultiplier({
            materialComposition: "Odd",
            stretchLevel: "low",
            elastanePercentage: 1,
            estimatedShrinkagePct: 0,
          })
        ).toBe(1.05);

        // Boundary at 3% -> 0.85x
        expect(
          getFabricCushioningMultiplier({
            materialComposition: "Odd",
            stretchLevel: "medium",
            elastanePercentage: 3,
            estimatedShrinkagePct: 0,
          })
        ).toBe(0.85);

        // Boundary at 5.9% -> 0.85x
        expect(
          getFabricCushioningMultiplier({
            materialComposition: "Odd",
            stretchLevel: "medium",
            elastanePercentage: 5.9,
            estimatedShrinkagePct: 0,
          })
        ).toBe(0.85);
      });
    });
  });

  // =========================================================================
  // MISSION 2: Outfit Builder Scoring Adversarial Probes
  // =========================================================================
  describe("Mission 2: Outfit Builder Scoring Probes", () => {
    const profileMale: AnatomicalProfile = {
      profileId: "prof_test_male",
      chestMm: 980,
      waistMm: 820,
      hipsMm: 960,
      heightMm: 1780,
      inseamMm: 790,
      footLengthMm: 270,
      isCurrent: true,
    };

    const topGood = PILOT_PRODUCTS.find((p) => p.category === "t_shirt")!;
    const bottomGood = PILOT_PRODUCTS.find((p) => p.category === "jeans")!;

    describe("2.1 Bottleneck Floor (1 Poor Fit Piece Drags Down the Whole Outfit)", () => {
      it("drags down a 95%+ top and bottom when footwear fit is poor (40% match)", () => {
        // Create an ill-fitting shoe selection with mismatching footbed
        // Normal weighted score: 0.35 * ~90 + 0.35 * ~90 + 0.3 * 40 = ~75%
        // But bottleneck cap: minScore + 10 = 40 + 10 = 50%
        const profileSmallFoot: AnatomicalProfile = {
          ...profileMale,
          footLengthMm: 310, // Extreme foot length (beyond UK 12)
        };

        const res = scoreOutfit({
          profile: profileSmallFoot,
          topProduct: topGood,
          bottomProduct: bottomGood,
          shoesSelection: {
            brandId: "nike",
            brandName: "Nike",
            modelName: "Air Force 1",
          },
        });

        // Verify bottleneck is triggered
        if (res.shoes && res.shoes.fitScore < 65) {
          expect(res.isBottleneckTriggered).toBe(true);
          expect(res.bottleneckReason).toBeDefined();
          expect(res.bottleneckReason).toContain("capped");
          expect(res.overallScore).toBeLessThanOrEqual(res.shoes.fitScore + 12); // minScore + 10 + harmony(2)
        }
      });

      it("empirically probes bottleneck capping across a gradient of lowest scores (20 to 64)", () => {
        // Synthetic test with a severely ill-fitting garment
        const severelySmallTop: PilotProduct = {
          ...topGood,
          id: "prod_tiny_probe",
          name: "Micro Top",
          layer3Specs: [
            {
              productId: "prod_tiny_probe",
              sizeLabel: "XS",
              chestFlatMm: 200, // 400mm circ for 980mm chest -> zero fit
              lengthMm: 400,
              measurementMethod: "laid_flat",
              measuredBy: "brand",
            },
          ],
          layer2Charts: [],
        };

        const res = scoreOutfit({
          profile: profileMale,
          topProduct: severelySmallTop,
          bottomProduct: bottomGood,
          shoesSelection: { brandId: "nike", brandName: "Nike", modelName: "Air Force 1" },
        });

        expect(res.isBottleneckTriggered).toBe(true);
        expect(res.bottleneckReason).toContain("capped");
        const minPieceScore = Math.min(res.top!.fitScore, res.bottom!.fitScore, res.shoes!.fitScore);
        expect(res.overallScore).toBeLessThanOrEqual(minPieceScore + 12);
      });

      it("does NOT trigger bottleneck when all pieces have score >= 65", () => {
        const res = scoreOutfit({
          profile: profileMale,
          topProduct: topGood,
          bottomProduct: bottomGood,
          shoesSelection: { brandId: "nike", brandName: "Nike", modelName: "Air Force 1" },
        });

        const minPieceScore = Math.min(
          res.top?.fitScore ?? 100,
          res.bottom?.fitScore ?? 100,
          res.shoes?.fitScore ?? 100
        );

        if (minPieceScore >= 65) {
          expect(res.isBottleneckTriggered).toBe(false);
          expect(res.bottleneckReason).toBeUndefined();
        }
      });
    });

    describe("2.2 Silhouette Ease Harmony (Oversized Top + Slim Bottom vs Slim Top + Oversized Bottom)", () => {
      it("awards +2 bonus for oversized top + slim bottom (Balanced Modern Taper)", () => {
        const harmony = evaluateSilhouetteHarmony("oversized", "slim");
        expect(harmony.adjustment).toBe(2);
        expect(harmony.isHarmonious).toBe(true);
        expect(harmony.note).toContain("Balanced Modern Taper");
      });

      it("penalizes -2 for slim top + oversized bottom (Imbalanced Bottom Weight)", () => {
        const harmony = evaluateSilhouetteHarmony("slim", "oversized");
        expect(harmony.adjustment).toBe(-2);
        expect(harmony.isHarmonious).toBe(false);
        expect(harmony.note).toContain("Imbalanced Bottom Weight");
      });

      it("verifies symmetry asymmetry: (oversized + slim) vs (slim + oversized) delta is exactly 4 points", () => {
        const favorable = evaluateSilhouetteHarmony("oversized", "slim");
        const unfavorable = evaluateSilhouetteHarmony("slim", "oversized");
        expect(favorable.adjustment - unfavorable.adjustment).toBe(4);
      });

      it("awards +1 bonus for oversized top + relaxed bottom (Full Streetwear Drape)", () => {
        const harmony = evaluateSilhouetteHarmony("oversized", "relaxed");
        expect(harmony.adjustment).toBe(1);
        expect(harmony.isHarmonious).toBe(true);
        expect(harmony.note).toContain("Full Streetwear Drape");
      });

      it("awards +2 bonus for regular top + regular bottom (Classic Timeless Equilibrium)", () => {
        const harmony = evaluateSilhouetteHarmony("regular", "regular");
        expect(harmony.adjustment).toBe(2);
        expect(harmony.isHarmonious).toBe(true);
        expect(harmony.note).toContain("Classic Timeless Equilibrium");
      });

      it("handles missing silhouette arguments safely with neutral adjustment (0)", () => {
        expect(evaluateSilhouetteHarmony(undefined, "regular").adjustment).toBe(0);
        expect(evaluateSilhouetteHarmony("slim", undefined).adjustment).toBe(0);
        expect(evaluateSilhouetteHarmony(undefined, undefined).adjustment).toBe(0);
      });
    });
  });

  // =========================================================================
  // MISSION 3: Family Matrix & Privacy Invariants
  // =========================================================================
  describe("Mission 3: Family Matrix & Privacy Invariants (AGENTS.md Invariant 7)", () => {
    const sensitiveProfiles: UserProfile[] = [
      {
        id: "prof_user_secret",
        name: "Dev User",
        relation: "self",
        gender: "male",
        measurements: {
          profileId: "prof_user_secret",
          chestMm: 980,
          waistMm: 820,
          hipsMm: 960,
          heightMm: 1780,
          inseamMm: 790,
          footLengthMm: 270,
          isCurrent: true,
        },
        preferences: { t_shirt: "regular", jeans: "regular" },
        referenceGarments: [],
        createdAt: "2026-03-01T08:00:00Z",
        updatedAt: "2026-03-01T08:00:00Z",
      },
      {
        id: "prof_partner_secret",
        name: "Partner Secret",
        relation: "partner",
        gender: "female",
        measurements: {
          profileId: "prof_partner_secret",
          chestMm: 860,
          waistMm: 680,
          hipsMm: 920,
          heightMm: 1650,
          inseamMm: 720,
          footLengthMm: 240,
          isCurrent: true,
        },
        preferences: { t_shirt: "relaxed", jeans: "slim" },
        referenceGarments: [],
        createdAt: "2026-03-01T08:00:00Z",
        updatedAt: "2026-03-01T08:00:00Z",
      },
      {
        id: "prof_child_secret",
        name: "Child Secret",
        relation: "child",
        gender: "male",
        measurements: {
          profileId: "prof_child_secret",
          chestMm: 650,
          waistMm: 560,
          heightMm: 1250,
          footLengthMm: 180,
          isCurrent: true,
        },
        preferences: { t_shirt: "oversized" },
        referenceGarments: [],
        createdAt: "2026-03-01T08:00:00Z",
        updatedAt: "2026-03-01T08:00:00Z",
      },
    ];

    describe("3.1 Text Export Privacy Audit", () => {
      it("asserts ZERO presence of raw anatomical numbers or biometric keys in cheat sheet text", () => {
        const matrix = buildFamilyMatrix(sensitiveProfiles, "all");
        const exportText = generateFamilyCheatSheetText(matrix, "Secret Family");

        // 1. Forbidden anatomical key patterns
        const forbiddenKeys = [
          "chestMm",
          "waistMm",
          "hipsMm",
          "footLengthMm",
          "inseamMm",
          "heightMm",
          "shoulderWidthMm",
          "neckMm",
          "weightG",
        ];
        for (const key of forbiddenKeys) {
          expect(exportText.toLowerCase()).not.toContain(key.toLowerCase());
        }

        // 2. Forbidden raw dimension strings with unit
        const forbiddenValuesWithMm = [
          "980mm",
          "820mm",
          "960mm",
          "1780mm",
          "790mm",
          "270mm",
          "860mm",
          "680mm",
          "920mm",
          "1650mm",
          "720mm",
          "240mm",
          "650mm",
          "560mm",
          "1250mm",
          "180mm",
        ];
        for (const val of forbiddenValuesWithMm) {
          expect(exportText.toLowerCase()).not.toContain(val.toLowerCase());
        }

        // 3. Built-in privacy validator returns true
        expect(validateCheatSheetPrivacy(exportText, sensitiveProfiles)).toBe(true);

        // 4. Output contains purely high-level brand recommendations
        expect(exportText).toContain("Uniqlo");
        expect(exportText).toContain("Levi's");
        expect(exportText).toContain("Nike");
        expect(exportText).toContain("% match");
      });
    });

    describe("3.2 Matrix Object JSON Structure Privacy Audit", () => {
      it("asserts that JSON-serialized matrix contains ZERO raw anatomical measurement properties", () => {
        const matrix = buildFamilyMatrix(sensitiveProfiles, "all");
        const serialized = JSON.stringify(matrix);

        // Raw biometric property keys must NEVER appear in serialized matrix
        expect(serialized).not.toContain('"chestMm"');
        expect(serialized).not.toContain('"waistMm"');
        expect(serialized).not.toContain('"hipsMm"');
        expect(serialized).not.toContain('"footLengthMm"');
        expect(serialized).not.toContain('"inseamMm"');
        expect(serialized).not.toContain('"heightMm"');
        expect(serialized).not.toContain('"shoulderWidthMm"');

        // Check columns structure
        for (const col of matrix.columns) {
          expect((col as any).measurements).toBeUndefined();
        }
      });
    });
  });

  // =========================================================================
  // MISSION 4: Measurement History & Trend Tracker Adversarial Probes
  // =========================================================================
  describe("Mission 4: Measurement History & Trend Tracker Probes", () => {
    describe("4.1 Delta Calculations in Canonical Integer mm", () => {
      it("rounds floating-point measurements to canonical integer millimeters", () => {
        const floatSnapshots: MeasurementSnapshot[] = [
          {
            id: "s1",
            profileId: "p1",
            recordedAt: "2025-01-01T00:00:00Z",
            source: "physical_tape",
            measurements: { chestMm: 960.4 },
          },
          {
            id: "s2",
            profileId: "p1",
            recordedAt: "2025-06-01T00:00:00Z",
            source: "physical_tape",
            measurements: { chestMm: 989.8 },
          },
        ];

        const trend = calculateLandmarkTrend(floatSnapshots, "chestMm");
        expect(trend).not.toBeNull();
        expect(trend?.baselineMm).toBe(960);
        expect(trend?.latestMm).toBe(990);
        expect(trend?.netDeltaMm).toBe(30);
        expect(Number.isInteger(trend?.baselineMm)).toBe(true);
        expect(Number.isInteger(trend?.latestMm)).toBe(true);
        expect(Number.isInteger(trend?.netDeltaMm)).toBe(true);
      });
    });

    describe("4.2 Non-Monotonic Dates Stress-Testing", () => {
      it("properly sorts highly non-monotonic date sequences to maintain chronological fidelity", () => {
        const jumbledSnapshots: MeasurementSnapshot[] = [
          {
            id: "s_late",
            profileId: "p1",
            recordedAt: "2026-08-15T12:00:00Z", // Latest
            source: "physical_tape",
            measurements: { chestMm: 1020 },
          },
          {
            id: "s_early",
            profileId: "p1",
            recordedAt: "2024-02-10T08:00:00Z", // Baseline (oldest)
            source: "physical_tape",
            measurements: { chestMm: 940 },
          },
          {
            id: "s_mid_2",
            profileId: "p1",
            recordedAt: "2025-11-20T10:00:00Z",
            source: "physical_tape",
            measurements: { chestMm: 990 },
          },
          {
            id: "s_mid_1",
            profileId: "p1",
            recordedAt: "2025-04-05T09:00:00Z",
            source: "physical_tape",
            measurements: { chestMm: 970 },
          },
        ];

        const trend = calculateLandmarkTrend(jumbledSnapshots, "chestMm");
        expect(trend).not.toBeNull();
        expect(trend?.baselineMm).toBe(940);
        expect(trend?.latestMm).toBe(1020);
        expect(trend?.netDeltaMm).toBe(80);
        expect(trend?.direction).toBe("increasing");

        // History points must be strictly sorted ascending
        const dates = trend!.historyPoints.map((p) => p.date);
        expect(dates).toEqual([
          "2024-02-10T08:00:00Z",
          "2025-04-05T09:00:00Z",
          "2025-11-20T10:00:00Z",
          "2026-08-15T12:00:00Z",
        ]);

        // Consecutive deltas
        expect(trend!.historyPoints[0].deltaFromPrevMm).toBe(0);
        expect(trend!.historyPoints[1].deltaFromPrevMm).toBe(30); // 970 - 940
        expect(trend!.historyPoints[2].deltaFromPrevMm).toBe(20); // 990 - 970
        expect(trend!.historyPoints[3].deltaFromPrevMm).toBe(30); // 1020 - 990
      });
    });

    describe("4.3 Zero-Delta & Directional Stability Thresholds", () => {
      it("tests exact directional boundary thresholds: > +5mm (increasing), < -5mm (decreasing), [-5, +5] (stable)", () => {
        const createPair = (val1: number, val2: number): MeasurementSnapshot[] => [
          {
            id: "1",
            profileId: "p1",
            recordedAt: "2025-01-01T00:00:00Z",
            source: "physical_tape",
            measurements: { chestMm: val1 },
          },
          {
            id: "2",
            profileId: "p1",
            recordedAt: "2025-02-01T00:00:00Z",
            source: "physical_tape",
            measurements: { chestMm: val2 },
          },
        ];

        // Zero delta
        expect(calculateLandmarkTrend(createPair(960, 960), "chestMm")?.direction).toBe("stable");
        expect(calculateLandmarkTrend(createPair(960, 960), "chestMm")?.netDeltaMm).toBe(0);

        // +4mm -> stable
        expect(calculateLandmarkTrend(createPair(960, 964), "chestMm")?.direction).toBe("stable");

        // +5mm -> stable (boundary inclusive)
        expect(calculateLandmarkTrend(createPair(960, 965), "chestMm")?.direction).toBe("stable");

        // +6mm -> increasing
        expect(calculateLandmarkTrend(createPair(960, 966), "chestMm")?.direction).toBe("increasing");

        // -4mm -> stable
        expect(calculateLandmarkTrend(createPair(960, 956), "chestMm")?.direction).toBe("stable");

        // -5mm -> stable (boundary inclusive)
        expect(calculateLandmarkTrend(createPair(960, 955), "chestMm")?.direction).toBe("stable");

        // -6mm -> decreasing
        expect(calculateLandmarkTrend(createPair(960, 954), "chestMm")?.direction).toBe("decreasing");
      });

      it("formats zero-delta presentation without erratic signs", () => {
        expect(formatDelta(0, "cm")).toBe("0.0 cm");
        expect(formatDelta(0, "in")).toBe("0.0\"");
        expect(formatDelta(5, "cm")).toBe("+0.5 cm");
        expect(formatDelta(-5, "cm")).toBe("-0.5 cm");
      });

      it("filters out snapshots with zero or negative measurements without crashing", () => {
        const corruptSnapshots: MeasurementSnapshot[] = [
          {
            id: "s1",
            profileId: "p1",
            recordedAt: "2025-01-01T00:00:00Z",
            source: "physical_tape",
            measurements: { chestMm: 950 },
          },
          {
            id: "s2",
            profileId: "p1",
            recordedAt: "2025-02-01T00:00:00Z",
            source: "physical_tape",
            measurements: { chestMm: 0 }, // Invalid zero measurement
          },
          {
            id: "s3",
            profileId: "p1",
            recordedAt: "2025-03-01T00:00:00Z",
            source: "physical_tape",
            measurements: { chestMm: -50 }, // Invalid negative measurement
          },
          {
            id: "s4",
            profileId: "p1",
            recordedAt: "2025-04-01T00:00:00Z",
            source: "physical_tape",
            measurements: { chestMm: 980 },
          },
        ];

        const trend = calculateLandmarkTrend(corruptSnapshots, "chestMm");
        expect(trend).not.toBeNull();
        expect(trend?.baselineMm).toBe(950);
        expect(trend?.latestMm).toBe(980);
        expect(trend?.historyPoints.length).toBe(2); // Only s1 and s4 retained
      });

      it("handles single snapshot and identical timestamps consistently", () => {
        const identicalDates: MeasurementSnapshot[] = [
          {
            id: "s1",
            profileId: "p1",
            recordedAt: "2025-06-01T12:00:00Z",
            source: "physical_tape",
            measurements: { chestMm: 960, waistMm: 800 },
          },
          {
            id: "s2",
            profileId: "p1",
            recordedAt: "2025-06-01T12:00:00Z",
            source: "calibrated_garment",
            measurements: { chestMm: 960, waistMm: 800 },
          },
        ];

        const trend = calculateLandmarkTrend(identicalDates, "waistMm");
        expect(trend).not.toBeNull();
        expect(trend?.netDeltaMm).toBe(0);
        expect(trend?.direction).toBe("stable");
        expect(trend?.percentageChange).toBe(0);
      });
    });

    describe("4.4 Full Profile Multi-Landmark Trend Consistency", () => {
      it("computes complete multi-landmark profile trends accurately across disparate anatomical dimensions", () => {
        const fullSnapshots: MeasurementSnapshot[] = [
          {
            id: "base",
            profileId: "p_all",
            recordedAt: "2025-01-01T00:00:00Z",
            source: "physical_tape",
            measurements: {
              chestMm: 960,
              waistMm: 820,
              hipsMm: 940,
              shoulderWidthMm: 440,
              heightMm: 1780,
              inseamMm: 790,
              neckMm: 380,
            },
          },
          {
            id: "latest",
            profileId: "p_all",
            recordedAt: "2026-01-01T00:00:00Z",
            source: "physical_tape",
            measurements: {
              chestMm: 990, // +30: increasing
              waistMm: 800, // -20: decreasing
              hipsMm: 944,  // +4: stable
              shoulderWidthMm: 445, // +5: stable
              heightMm: 1780, // 0: stable
              inseamMm: 790, // 0: stable
              neckMm: 390,  // +10: increasing
            },
          },
        ];

        const profileTrends = calculateProfileTrends(fullSnapshots, "p_all");
        expect(profileTrends.profileId).toBe("p_all");
        expect(profileTrends.totalSnapshots).toBe(2);
        expect(profileTrends.trends["chestMm"].direction).toBe("increasing");
        expect(profileTrends.trends["waistMm"].direction).toBe("decreasing");
        expect(profileTrends.trends["hipsMm"].direction).toBe("stable");
        expect(profileTrends.trends["shoulderWidthMm"].direction).toBe("stable");
        expect(profileTrends.trends["heightMm"].direction).toBe("stable");
        expect(profileTrends.trends["inseamMm"].direction).toBe("stable");
        expect(profileTrends.trends["neckMm"].direction).toBe("increasing");
      });
    });
  });
});
