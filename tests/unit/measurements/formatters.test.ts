import { describe, it, expect } from "vitest";
import {
  formatMeasurement,
  formatDualMeasurement,
  calculateProfileCompleteness,
  getConfidenceMeta,
} from "@/core/formatters";

describe("Presentation Formatters & Completeness Matrix", () => {
  describe("formatMeasurement", () => {
    it("formats millimeters to cm with label", () => {
      expect(formatMeasurement(980, "cm")).toBe("98 cm");
      expect(formatMeasurement(985, "cm")).toBe("98.5 cm");
    });

    it("formats millimeters to cm without label", () => {
      expect(formatMeasurement(980, "cm", false)).toBe("98");
    });

    it("formats millimeters to inches with label", () => {
      expect(formatMeasurement(1016, "in")).toBe("40\"");
    });

    it("formats millimeters to inches without label", () => {
      expect(formatMeasurement(1016, "in", false)).toBe("40");
    });

    it("returns dash for invalid or empty measurements", () => {
      expect(formatMeasurement(null)).toBe("—");
      expect(formatMeasurement(undefined)).toBe("—");
      expect(formatMeasurement(0)).toBe("—");
      expect(formatMeasurement(-10)).toBe("—");
    });
  });

  describe("formatDualMeasurement", () => {
    it("returns formatted dual string with both cm and inches", () => {
      const dual = formatDualMeasurement(980);
      expect(dual.cm).toBe("98 cm");
      expect(dual.inches).toBe("38.6\"");
      expect(dual.formatted).toBe("98 cm (38.6\")");
    });

    it("handles null or negative gracefully", () => {
      const dual = formatDualMeasurement(0);
      expect(dual.cm).toBe("—");
      expect(dual.inches).toBe("—");
      expect(dual.formatted).toBe("—");
    });
  });

  describe("calculateProfileCompleteness", () => {
    it("returns empty tier when profile is null", () => {
      const comp = calculateProfileCompleteness(null);
      expect(comp.pct).toBe(0);
      expect(comp.tier).toBe("empty");
      expect(comp.completedCount).toBe(0);
    });

    it("calculates percentage for complete profile", () => {
      const comp = calculateProfileCompleteness({
        profileId: "00000000-0000-0000-0000-000000000001",
        chestMm: 980,
        shoulderWidthMm: 450,
        waistMm: 820,
        hipsMm: 960,
        heightMm: 1780,
        inseamMm: 790,
      });
      expect(comp.pct).toBe(100);
      expect(comp.tier).toBe("complete");
      expect(comp.completedCount).toBe(6);
      expect(comp.missingLabels.length).toBe(0);
    });

    it("calculates percentage for partial profile", () => {
      const comp = calculateProfileCompleteness({
        profileId: "00000000-0000-0000-0000-000000000001",
        chestMm: 980,
        waistMm: 820,
      });
      expect(comp.pct).toBe(50);
      expect(comp.tier).toBe("minimal");
      expect(comp.missingLabels).toContain("Shoulders");
    });
  });

  describe("getConfidenceMeta", () => {
    it("maps high confidence correctly", () => {
      const meta = getConfidenceMeta(0.92);
      expect(meta.label).toBe("High Confidence");
      expect(meta.pct).toBe(92);
      expect(meta.dotColorClass).toContain("confidence-high");
    });

    it("maps medium confidence correctly", () => {
      const meta = getConfidenceMeta(0.72);
      expect(meta.label).toBe("Medium Confidence");
      expect(meta.pct).toBe(72);
      expect(meta.dotColorClass).toContain("confidence-medium");
    });

    it("maps low confidence correctly", () => {
      const meta = getConfidenceMeta(0.52);
      expect(meta.label).toBe("Low Confidence");
      expect(meta.pct).toBe(52);
      expect(meta.dotColorClass).toContain("confidence-low");
    });

    it("maps insufficient confidence correctly", () => {
      const meta = getConfidenceMeta(0.25);
      expect(meta.label).toBe("Insufficient Data");
      expect(meta.dotColorClass).toContain("confidence-none");
    });
  });
});
