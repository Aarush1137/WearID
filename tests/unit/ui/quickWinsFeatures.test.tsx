import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { QRCodeSvg } from "@/components/common/QRCodeSvg";
import { useProfileStore } from "@/core/state/profileStore";
import { evaluateSizeRecommendation } from "@/core/sizing/recommendationEngine";
import { PILOT_PRODUCTS } from "@/core/data/pilotBrands";

describe("Quick Wins Features Suite", () => {
  describe("QRCodeSvg Component", () => {
    it("renders valid SVG matrix with proper attributes and dimensions", () => {
      const { container } = render(
        <QRCodeSvg
          value="https://wear-id.vercel.app/app/tailor?id=test1234"
          size={100}
          fgColor="#1B2A4A"
          bgColor="#FFFFFF"
        />
      );

      const svg = container.querySelector("svg");
      expect(svg).toBeDefined();
      expect(svg?.getAttribute("viewBox")).toBe("0 0 25 25");
      expect(svg?.getAttribute("width")).toBe("100");
      expect(svg?.getAttribute("height")).toBe("100");
      expect(svg?.getAttribute("role")).toBe("img");
      expect(svg?.getAttribute("aria-label")).toContain("https://wear-id.vercel.app");

      // Verify finder pattern modules rendered
      const rects = container.querySelectorAll("rect");
      expect(rects.length).toBeGreaterThan(50);
    });
  });

  describe("Wardrobe Closet Reference Garment Actions in profileStore", () => {
    it("adds a reference garment to the active profile", () => {
      const store = useProfileStore.getState();
      const profile = store.getActiveProfile();
      const initialCount = profile.referenceGarments?.length || 0;

      store.addReferenceGarment(profile.id, {
        brandName: "Uniqlo",
        garmentName: "AIRism Oversized T-Shirt",
        category: "t_shirt",
        sizeLabel: "M",
        fitFeel: "perfect",
        fitRating: 5,
        notes: "Ideal comfortable daily fit",
      });

      const updated = useProfileStore.getState().getActiveProfile();
      expect(updated.referenceGarments.length).toBe(initialCount + 1);

      const added = updated.referenceGarments[updated.referenceGarments.length - 1];
      expect(added.brandName).toBe("Uniqlo");
      expect(added.sizeLabel).toBe("M");
      expect(added.fitFeel).toBe("perfect");
      expect(added.id).toBeDefined();
    });

    it("removes a reference garment from the active profile", () => {
      const store = useProfileStore.getState();
      const profile = store.getActiveProfile();
      const lastGarment = profile.referenceGarments[profile.referenceGarments.length - 1];
      expect(lastGarment).toBeDefined();

      const initialCount = profile.referenceGarments.length;
      store.removeReferenceGarment(profile.id, lastGarment.id);

      const updated = useProfileStore.getState().getActiveProfile();
      expect(updated.referenceGarments.length).toBe(initialCount - 1);
      expect(updated.referenceGarments.find((g) => g.id === lastGarment.id)).toBeUndefined();
    });
  });

  describe("What Size Am I Quick Lookup Sizing Logic", () => {
    it("calculates accurate size for representative product", () => {
      const store = useProfileStore.getState();
      const profile = store.getActiveProfile();

      // Test with Uniqlo AIRism Oversized
      const prod = PILOT_PRODUCTS.find((p) => p.id === "prod_uniqlo_airism_oversized");
      expect(prod).toBeDefined();

      if (prod) {
        const res = evaluateSizeRecommendation({
          profile: profile.measurements,
          fitPreference: {
            profileId: profile.id,
            category: prod.category,
            fitType: "regular",
          },
          garmentDimensions: prod.layer3Specs,
          brandSizeCharts: prod.layer2Charts,
          fabricSpec: prod.fabric,
        });

        expect(res.recommendedSize).toBeDefined();
        expect(["S", "M", "L", "XL"]).toContain(res.recommendedSize);
        expect(res.fitScore).toBeGreaterThan(0);
        expect(res.confidence).toBeGreaterThan(0);
        expect(res.summaryText).toBeDefined();
      }
    });
  });
});
