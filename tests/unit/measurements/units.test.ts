import { describe, it, expect } from "vitest";
import {
  cmToMm,
  mmToCm,
  inchesToMm,
  mmToInches,
  kgToGrams,
  lbsToGrams,
} from "../../../src/core/units";

describe("Canonical Unit Conversions", () => {
  it("converts cm to canonical integer mm accurately", () => {
    expect(cmToMm(96.5)).toBe(965);
    expect(cmToMm(102.4)).toBe(1024);
    expect(cmToMm(0)).toBe(0);
  });

  it("converts canonical mm back to cm with target precision", () => {
    expect(mmToCm(965)).toBe(96.5);
    expect(mmToCm(1024)).toBe(102.4);
  });

  it("converts imperial inches to canonical integer mm accurately (TC-U-001)", () => {
    // 38.5 inches * 25.4 = 977.9 -> 978 mm (TC-U-001 required boundary)
    expect(inchesToMm(38.5)).toBe(978);
    // 38.0 inches * 25.4 = 965.2 -> 965 mm
    expect(inchesToMm(38.0)).toBe(965);
    // 40.0 inches * 25.4 = 1016 mm
    expect(inchesToMm(40.0)).toBe(1016);
  });

  it("converts mm to inches with target precision", () => {
    expect(mmToInches(1016, 2)).toBe(40.0);
  });

  it("converts mass units to canonical grams", () => {
    expect(kgToGrams(75.5)).toBe(75500);
    expect(lbsToGrams(165.0)).toBe(74843);
  });

  it("rejects negative dimensions by throwing RangeError", () => {
    expect(() => cmToMm(-10)).toThrow(RangeError);
    expect(() => inchesToMm(-5)).toThrow(RangeError);
    expect(() => mmToCm(-100)).toThrow(RangeError);
    expect(() => mmToInches(-100)).toThrow(RangeError);
    expect(() => kgToGrams(-10)).toThrow(RangeError);
    expect(() => lbsToGrams(-10)).toThrow(RangeError);
  });

  it("maintains round-trip stability without floating-point drift", () => {
    const originalMm = 980;
    const cm = mmToCm(originalMm);
    const roundTripMm = cmToMm(cm);
    expect(roundTripMm).toBe(originalMm);
  });
});
