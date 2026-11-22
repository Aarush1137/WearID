import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { VisualEaseGuide, SILHOUETTES } from "@/components/visual/VisualEaseGuide";

describe("Visual Ease Guide Suite (Milestone 6 Feature 5)", () => {
  describe("Silhouette Ease Matrix Specifications", () => {
    it("defines the 4 primary silhouettes adhering to Savile Row easing guidelines", () => {
      const ids = SILHOUETTES.map((s) => s.id);
      expect(ids).toEqual(["slim", "regular", "relaxed", "oversized"]);
    });

    it("verifies canonical ease ranges in mm for each silhouette", () => {
      const slim = SILHOUETTES.find((s) => s.id === "slim");
      expect(slim?.chestEaseRangeMm).toEqual({ min: 40, max: 60 });
      expect(slim?.dropShoulderMm).toBe(0);

      const regular = SILHOUETTES.find((s) => s.id === "regular");
      expect(regular?.chestEaseRangeMm).toEqual({ min: 60, max: 100 });
      expect(regular?.dropShoulderMm).toBe(10);

      const relaxed = SILHOUETTES.find((s) => s.id === "relaxed");
      expect(relaxed?.chestEaseRangeMm).toEqual({ min: 100, max: 140 });
      expect(relaxed?.dropShoulderMm).toBe(25);

      const oversized = SILHOUETTES.find((s) => s.id === "oversized");
      expect(oversized?.chestEaseRangeMm).toEqual({ min: 140, max: 220 });
      expect(oversized?.dropShoulderMm).toBe(45);
    });

    it("includes fabric engineering recommendations for all silhouettes", () => {
      for (const s of SILHOUETTES) {
        expect(s.fabricRecommendation.length).toBeGreaterThan(10);
        expect(s.fitFeelDescription.length).toBeGreaterThan(10);
      }
    });
  });

  describe("VisualEaseGuide Component Rendering & Interaction", () => {
    it("renders component with default regular fit silhouette", () => {
      render(
        React.createElement(VisualEaseGuide, {
          currentFitIntent: "regular",
          userChestMm: 980,
          displayUnit: "cm",
        })
      );

      expect(screen.getByTestId("visual-ease-guide")).toBeDefined();
      expect(screen.getByText("Visual Ease & Silhouette Guide")).toBeDefined();
      expect(screen.getByText("Regular Fit")).toBeDefined();
    });

    it("allows switching silhouettes interactively and fires onSelectSilhouette callback", () => {
      const selectSpy = vi.fn();

      render(
        React.createElement(VisualEaseGuide, {
          currentFitIntent: "regular",
          userChestMm: 980,
          displayUnit: "cm",
          onSelectSilhouette: selectSpy,
          interactive: true,
        })
      );

      const oversizedBtn = screen.getByText("Oversized Fit");
      fireEvent.click(oversizedBtn);

      expect(selectSpy).toHaveBeenCalledWith("oversized");
      expect(screen.getByText(/Boxy Streetwear Architecture/i)).toBeDefined();
    });

    it("displays dynamic user chest calculation correctly", () => {
      render(
        React.createElement(VisualEaseGuide, {
          currentFitIntent: "slim",
          userChestMm: 980, // 98 cm
          displayUnit: "cm",
        })
      );

      // In slim fit (+40mm to +60mm): 980 + 40 = 1020mm (102 cm), 980 + 60 = 1040mm (104 cm)
      expect(screen.getByText(/Calibrated against your chest:/i)).toBeDefined();
      expect(screen.getByText(/102 cm – 104 cm/i)).toBeDefined();
    });
  });
});
