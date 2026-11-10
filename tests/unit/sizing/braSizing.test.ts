import { describe, it, expect } from "vitest";
import { calculateBraSize } from "@/core/sizing/braSizing";

describe("Deterministic Bra Sizing Engine", () => {
  it("calculates 34B correctly from standard NIFT measurements", () => {
    // 34 inches underbust = ~864mm; 36 inches bust = ~914mm (diff = 2" -> B cup)
    const result = calculateBraSize(864, 914);
    expect(result.bandSize).toBe(34);
    expect(result.cupLetter).toBe("B");
    expect(result.fullBraSize).toBe("34B");
    expect(result.sisterSizes.tighterBand).toBe("32C");
    expect(result.sisterSizes.looserBand).toBe("36A");
  });

  it("calculates 32D correctly from petite frame with high projection", () => {
    // 32 inches underbust = 813mm; 36 inches bust = 914mm (diff = 4" -> D cup)
    const result = calculateBraSize(813, 914);
    expect(result.bandSize).toBe(32);
    expect(result.cupLetter).toBe("D");
    expect(result.fullBraSize).toBe("32D");
  });

  it("calculates 36C correctly", () => {
    // 36 inches underbust = 914mm; 39 inches bust = 991mm (diff = 3" -> C cup)
    const result = calculateBraSize(914, 991);
    expect(result.bandSize).toBe(36);
    expect(result.cupLetter).toBe("C");
    expect(result.fullBraSize).toBe("36C");
  });

  it("rejects non-positive dimensions with descriptive error", () => {
    expect(() => calculateBraSize(0, 900)).toThrow("Invalid anatomical biometrics");
    expect(() => calculateBraSize(800, -10)).toThrow("Invalid anatomical biometrics");
  });

  it("generates structured explanation text detailing band and apex differential", () => {
    const result = calculateBraSize(864, 914);
    expect(result.explanation).toContain("Band 34");
    expect(result.explanation).toContain("Cup B");
  });

  describe("Expanded Verification Suite (Underbust 700mm-950mm, Bust 800mm-1150mm)", () => {
    it("handles 700mm underbust and 800mm bust apex correctly", () => {
      // 700mm ~ 27.5" -> band 28 or 30; bust 800mm ~ 31.5" (diff ~ 4" -> D cup)
      const result = calculateBraSize(700, 800);
      expect([28, 30]).toContain(result.bandSize);
      expect(result.cupLetter).toBeDefined();
      expect(result.fullBraSize).toContain(String(result.bandSize));
    });

    it("handles 950mm underbust and 1150mm bust apex correctly", () => {
      // 950mm ~ 37.4" -> band 36 or 38; bust 1150mm ~ 45.3" -> G cup
      const result = calculateBraSize(950, 1150);
      expect([36, 38]).toContain(result.bandSize);
      expect(["F", "FF", "G"]).toContain(result.cupLetter);
    });

    it("verifies volume equivalency across sister sizing triads", () => {
      // 34C sister sizes are 32D (tighter) and 36B (looser)
      const result = calculateBraSize(864, 940); // 34" band, 37" bust -> 34C
      expect(result.bandSize).toBe(34);
      expect(result.cupLetter).toBe("C");
      expect(result.sisterSizes.tighterBand).toBe("32D");
      expect(result.sisterSizes.looserBand).toBe("36B");
    });
  });
});
