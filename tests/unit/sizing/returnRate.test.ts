import { describe, it, expect } from "vitest";
import React from "react";
import { render, screen } from "@testing-library/react";
import {
  predictReturnRate,
  getCategoryBaselineRate,
  getFabricCushioningMultiplier,
} from "@/core/sizing/returnRatePredictor";
import { ReturnRiskBadge } from "@/components/sizing/ReturnRiskBadge";

describe("Feature 12: Return Rate Predictor (Deterministic 4-Vector Model)", () => {
  describe("Vector 1: Category Baseline Return Rates", () => {
    it("assigns 28% baseline to shoes/footwear", () => {
      expect(getCategoryBaselineRate("shoes")).toBe(28);
      expect(getCategoryBaselineRate("footwear")).toBe(28);
    });

    it("assigns 24% baseline to trousers and chinos", () => {
      expect(getCategoryBaselineRate("trousers_chinos")).toBe(24);
      expect(getCategoryBaselineRate("chinos")).toBe(24);
    });

    it("assigns 22% baseline to jeans and dresses", () => {
      expect(getCategoryBaselineRate("jeans")).toBe(22);
      expect(getCategoryBaselineRate("dress")).toBe(22);
    });

    it("assigns 20% baseline to formal shirts", () => {
      expect(getCategoryBaselineRate("shirt_formal")).toBe(20);
    });

    it("assigns 16% baseline to jackets and blazers", () => {
      expect(getCategoryBaselineRate("jacket")).toBe(16);
      expect(getCategoryBaselineRate("blazer")).toBe(16);
    });

    it("assigns 12% baseline to t-shirts, polos, and hoodies", () => {
      expect(getCategoryBaselineRate("t_shirt")).toBe(12);
      expect(getCategoryBaselineRate("polo")).toBe(12);
      expect(getCategoryBaselineRate("hoodie")).toBe(12);
    });

    it("falls back to 18% baseline for unspecified categories", () => {
      expect(getCategoryBaselineRate("other_apparel")).toBe(18);
      expect(getCategoryBaselineRate(undefined)).toBe(18);
    });
  });

  describe("Vector 2: Ease Delta and Rigid Constriction Penalty", () => {
    it("produces low risk when chest ease is centered in regular target range (80-140mm)", () => {
      const result = predictReturnRate({
        category: "t_shirt",
        fitIntent: "regular",
        recommendedSize: "M",
        actualChestEaseMm: 110, // Exactly at midpoint (110mm)
        fabricSpec: {
          materialComposition: "100% Cotton",
          stretchLevel: "low",
          elastanePercentage: 2,
          estimatedShrinkagePct: 0,
        },
      });

      expect(result.easeRiskContribution).toBe(0);
      expect(result.riskScore).toBeLessThanOrEqual(20);
      expect(result.riskLevel).toBe("low");
      expect(result.actionableAdvice).toContain("minimal projected return risk");
    });

    it("triggers severe constriction penalty (+30%) for negative ease on rigid fabric (0% elastane)", () => {
      const result = predictReturnRate({
        category: "t_shirt",
        fitIntent: "regular",
        recommendedSize: "S",
        actualChestEaseMm: -15, // Negative ease on rigid cotton
        fabricSpec: {
          materialComposition: "100% Rigid Cotton",
          stretchLevel: "none",
          elastanePercentage: 0,
          estimatedShrinkagePct: 0,
        },
      });

      // Deficit = 80 - (-15) = 95mm. Factor = 15 + min(35, (95/30)*20) = 50. + 30 constriction = 80.
      // (12 baseline + 80 ease) * 1.25 = 115 clamped to 95.
      expect(result.riskScore).toBeGreaterThanOrEqual(75);
      expect(result.riskLevel).toBe("high");
      expect(result.primaryRiskDrivers.some((d) => d.includes("constriction"))).toBe(true);
      expect(result.actionableAdvice).toContain("We strongly recommend sizing up");
    });

    it("penalizes excess ease surplus beyond maximum range", () => {
      const result = predictReturnRate({
        category: "t_shirt",
        fitIntent: "regular",
        recommendedSize: "XL",
        actualChestEaseMm: 220, // +80mm over 140mm max
        fabricSpec: {
          materialComposition: "100% Cotton",
          stretchLevel: "none",
          elastanePercentage: 0,
          estimatedShrinkagePct: 0,
        },
      });

      expect(result.easeRiskContribution).toBeGreaterThan(15);
      expect(result.primaryRiskDrivers.some((d) => d.includes("exceeds the recommended"))).toBe(true);
    });
  });

  describe("Vector 3: Borderline Proximity Penalty", () => {
    it("adds +22% bracketing penalty when isBorderline is true", () => {
      const baselineResult = predictReturnRate({
        category: "shirt_casual",
        fitIntent: "regular",
        recommendedSize: "M",
        actualChestEaseMm: 110,
        isBorderline: false,
      });

      const borderlineResult = predictReturnRate({
        category: "shirt_casual",
        fitIntent: "regular",
        recommendedSize: "M",
        actualChestEaseMm: 110,
        isBorderline: true,
      });

      expect(borderlineResult.borderlineRiskContribution).toBe(22);
      expect(borderlineResult.riskScore).toBeGreaterThan(baselineResult.riskScore);
      expect(borderlineResult.primaryRiskDrivers.some((d) => d.includes("Borderline fit match"))).toBe(true);
    });

    it("detects borderline when scoreDeltaToRunnerUp < 0.08", () => {
      const result = predictReturnRate({
        category: "jeans",
        fitIntent: "regular",
        recommendedSize: "32",
        actualWaistEaseMm: 35,
        scoreDeltaToRunnerUp: 0.04,
      });

      expect(result.borderlineRiskContribution).toBe(22);
    });

    it("adds +12% when adjacent candidate is closely competing (0.08 <= delta < 0.15)", () => {
      const result = predictReturnRate({
        category: "jeans",
        fitIntent: "regular",
        recommendedSize: "32",
        actualWaistEaseMm: 35,
        scoreDeltaToRunnerUp: 0.11,
      });

      expect(result.borderlineRiskContribution).toBe(12);
    });
  });

  describe("Vector 4: Fabric Elastane Multiplier & Clamping", () => {
    it("applies 1.25x penalty multiplier for 0% elastane rigid fabric", () => {
      expect(
        getFabricCushioningMultiplier({
          materialComposition: "100% Cotton",
          stretchLevel: "none",
          elastanePercentage: 0,
          estimatedShrinkagePct: 0,
        })
      ).toBe(1.25);
    });

    it("applies 0.70x cushioning multiplier for high elastane stretch knit (>= 6%)", () => {
      expect(
        getFabricCushioningMultiplier({
          materialComposition: "85% Poly / 15% Spandex",
          stretchLevel: "high",
          elastanePercentage: 15,
          estimatedShrinkagePct: 0,
        })
      ).toBe(0.7);
    });

    it("mitigates negative ease risk when fabric has high elastane", () => {
      const rigid = predictReturnRate({
        category: "t_shirt",
        recommendedSize: "S",
        actualChestEaseMm: -10,
        fabricSpec: {
          materialComposition: "100% Cotton",
          stretchLevel: "none",
          elastanePercentage: 0,
          estimatedShrinkagePct: 0,
        },
      });

      const elastic = predictReturnRate({
        category: "t_shirt",
        recommendedSize: "S",
        actualChestEaseMm: -10,
        fabricSpec: {
          materialComposition: "Poly Spandex",
          stretchLevel: "high",
          elastanePercentage: 12,
          estimatedShrinkagePct: 0,
        },
      });

      expect(elastic.riskScore).toBeLessThan(rigid.riskScore);
    });

    it("strictly clamps output score between 5% and 95%", () => {
      // Theoretical extreme high: shoes + deficit + rigid + borderline
      const extremeHigh = predictReturnRate({
        category: "shoes",
        recommendedSize: "9",
        actualChestEaseMm: -50,
        isBorderline: true,
        fabricSpec: {
          materialComposition: "Leather",
          stretchLevel: "none",
          elastanePercentage: 0,
          estimatedShrinkagePct: 0,
        },
      });
      expect(extremeHigh.riskScore).toBeLessThanOrEqual(95);

      // Theoretical extreme low
      const extremeLow = predictReturnRate({
        category: "t_shirt",
        fitIntent: "regular",
        recommendedSize: "M",
        actualChestEaseMm: 110,
        fabricSpec: {
          materialComposition: "Span",
          stretchLevel: "high",
          elastanePercentage: 20,
          estimatedShrinkagePct: 0,
        },
      });
      expect(extremeLow.riskScore).toBeGreaterThanOrEqual(5);
    });
  });

  describe("UI Component: ReturnRiskBadge", () => {
    it("renders compact badge correctly", () => {
      const prediction = predictReturnRate({
        category: "t_shirt",
        recommendedSize: "M",
        actualChestEaseMm: 110,
      });

      render(React.createElement(ReturnRiskBadge, { prediction, compact: true }));
      expect(screen.getByTestId("return-risk-badge-compact")).toBeDefined();
      expect(screen.getByText(`${prediction.riskScore}%`)).toBeDefined();
    });

    it("renders full badge with drivers and advice when requested", () => {
      const prediction = predictReturnRate({
        category: "shoes",
        recommendedSize: "10",
        isBorderline: true,
      });

      render(
        React.createElement(ReturnRiskBadge, {
          prediction,
          showDrivers: true,
          showAdvice: true,
        })
      );
      expect(screen.getByTestId("return-risk-badge")).toBeDefined();
      expect(screen.getByText("Key Risk Drivers:")).toBeDefined();
      expect(screen.getByText(prediction.actionableAdvice)).toBeDefined();
    });
  });
});
