import { describe, it, expect, beforeEach } from "vitest";
import {
  scoreOutfit,
  evaluateSilhouetteHarmony,
  evaluateShoePiece,
} from "../../../src/core/sizing/outfitScoring";
import { AnatomicalProfile } from "../../../src/core/types";
import { PILOT_PRODUCTS, PilotProduct } from "../../../src/core/data/pilotBrands";
import { useOutfitStore } from "../../../src/core/state/outfitStore";

describe("Feature 8: Outfit Builder & Multi-Category Fit Scoring", () => {
  const profileMale: AnatomicalProfile = {
    profileId: "prof_test_male",
    chestMm: 980,
    waistMm: 820,
    hipsMm: 960,
    heightMm: 1780,
    inseamMm: 790,
    footLengthMm: 270, // Nike UK 8 (266-270mm)
    isCurrent: true,
  };

  const topSample = PILOT_PRODUCTS.find(
    (p) => p.category === "t_shirt_oversized" || p.category === "t_shirt"
  )!;
  const bottomSample = PILOT_PRODUCTS.find(
    (p) => p.category === "jeans" || p.category === "trousers_chinos"
  )!;

  beforeEach(() => {
    useOutfitStore.getState().resetDraft();
  });

  describe("Silhouette Ease Harmony", () => {
    it("should award +2 bonus for oversized top with regular or slim bottom (Balanced Modern Taper)", () => {
      const res1 = evaluateSilhouetteHarmony("oversized", "regular");
      expect(res1.adjustment).toBe(2);
      expect(res1.note).toContain("Balanced Modern Taper");

      const res2 = evaluateSilhouetteHarmony("oversized", "slim");
      expect(res2.adjustment).toBe(2);
      expect(res2.note).toContain("Balanced Modern Taper");
    });

    it("should award +1 bonus for full streetwear drape (oversized top + relaxed bottom)", () => {
      const res = evaluateSilhouetteHarmony("oversized", "relaxed");
      expect(res.adjustment).toBe(1);
      expect(res.note).toContain("Full Streetwear Drape");
    });

    it("should penalize -2 for slim top with oversized bottom (imbalanced weight)", () => {
      const res = evaluateSilhouetteHarmony("slim", "oversized");
      expect(res.adjustment).toBe(-2);
      expect(res.isHarmonious).toBe(false);
      expect(res.note).toContain("Imbalanced Bottom Weight");
    });

    it("should award +2 for classic equilibrium (regular top + regular bottom)", () => {
      const res = evaluateSilhouetteHarmony("regular", "regular");
      expect(res.adjustment).toBe(2);
      expect(res.note).toContain("Classic Timeless Equilibrium");
    });
  });

  describe("Footwear Evaluation", () => {
    it("should match exact footbed for 270mm foot in Nike to UK 8 with 98% score", () => {
      const res = evaluateShoePiece("nike", "Nike", "Air Force 1", profileMale, "men");
      expect(res.fitScore).toBe(98);
      expect(res.confidence).toBe(0.95);
      expect(res.recommendedSize).toContain("UK 8");
      expect(res.fitNote).toContain("Exact footbed match");
    });

    it("should handle missing foot length gracefully without crashing", () => {
      const profileNoFoot: AnatomicalProfile = {
        profileId: "prof_no_foot",
        chestMm: 980,
        isCurrent: true,
      };
      const res = evaluateShoePiece("nike", "Nike", "Air Force 1", profileNoFoot, "men");
      expect(res.fitScore).toBe(50);
      expect(res.confidence).toBe(0.3);
      expect(res.confidenceLabel).toBe("low");
      expect(res.fitNote).toContain("unavailable");
    });
  });

  describe("Composite Outfit Scoring & Bottleneck Floor", () => {
    it("should evaluate a complete 3-piece outfit with balanced scores", () => {
      expect(topSample).toBeDefined();
      expect(bottomSample).toBeDefined();

      const res = scoreOutfit({
        profile: profileMale,
        topProduct: topSample,
        bottomProduct: bottomSample,
        shoesSelection: { brandId: "nike", brandName: "Nike", modelName: "Air Force 1" },
      });

      expect(res.overallScore).toBeGreaterThanOrEqual(70);
      expect(res.confidenceLabel).toBeDefined();
      expect(res.top).toBeDefined();
      expect(res.bottom).toBeDefined();
      expect(res.shoes).toBeDefined();
      expect(res.isBottleneckTriggered).toBe(false);
    });

    it("should trigger bottleneck cap if one garment fits terribly", () => {
      // Mock an ill-fitting product with dimensions way too small (e.g. chest 600mm for 980mm chest)
      const tinyTop: PilotProduct = {
        ...topSample,
        id: "prod_tiny_top",
        layer3Specs: [
          {
            productId: "prod_tiny_top",
            sizeLabel: "XS",
            chestFlatMm: 350, // 700mm circ on 980mm chest -> terrible fit
            lengthMm: 500,
            measurementMethod: "laid_flat",
            measuredBy: "brand",
          },
        ],
        layer2Charts: [],
      };

      const res = scoreOutfit({
        profile: profileMale,
        topProduct: tinyTop,
        bottomProduct: bottomSample,
        shoesSelection: { brandId: "nike", brandName: "Nike", modelName: "Air Force 1" },
      });

      expect(res.isBottleneckTriggered).toBe(true);
      expect(res.bottleneckReason).toContain("capped");
      // Capped at minScore + 10 (+ any harmony bonus)
      expect(res.overallScore).toBeLessThanOrEqual(res.top!.fitScore + 12);
    });

    it("should renormalize weights when only Top and Bottom are selected", () => {
      const res = scoreOutfit({
        profile: profileMale,
        topProduct: topSample,
        bottomProduct: bottomSample,
      });

      expect(res.top).toBeDefined();
      expect(res.bottom).toBeDefined();
      expect(res.shoes).toBeUndefined();
      expect(res.overallScore).toBeGreaterThan(0);
    });
  });

  describe("Outfit Store State & Persistence", () => {
    it("should select draft items and save outfit to store", () => {
      const store = useOutfitStore.getState();

      store.selectTop(topSample);
      store.selectBottom(bottomSample);
      store.selectShoes({ brandId: "nike", brandName: "Nike", modelName: "Dunk" });
      store.setOccasion("streetwear");

      expect(useOutfitStore.getState().currentDraft.top?.id).toBe(topSample.id);
      expect(useOutfitStore.getState().currentDraft.occasion).toBe("streetwear");

      const evalRes = scoreOutfit({
        profile: profileMale,
        topProduct: topSample,
        bottomProduct: bottomSample,
        shoesSelection: { brandId: "nike", brandName: "Nike", modelName: "Dunk" },
      });

      const saved = useOutfitStore
        .getState()
        .saveCurrentOutfit("Streetwear Fit 1", profileMale.profileId!, evalRes);

      expect(saved).toBeDefined();
      expect(saved?.combinedFitScore).toBe(evalRes.overallScore);
      expect(useOutfitStore.getState().savedOutfits.length).toBe(1);

      // Delete outfit
      useOutfitStore.getState().deleteSavedOutfit(saved!.id);
      expect(useOutfitStore.getState().savedOutfits.length).toBe(0);
    });
  });
});
