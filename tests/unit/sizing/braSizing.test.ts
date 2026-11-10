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
});
