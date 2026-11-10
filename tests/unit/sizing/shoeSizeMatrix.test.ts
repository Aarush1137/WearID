import { describe, it, expect } from "vitest";
import {
  SHOE_BRANDS,
  matchShoeSizeByFootLength,
  convertShoeSizeCrossBrand,
  ShoeDemographic,
} from "../../../src/core/data/shoeSizeMatrix";

describe("Shoe Size Matrix & Cross-Brand Equivalence Suite", () => {
  // 1. Data Integrity & Multi-Demographic Completeness
  describe("1. Database Schema & Completeness (Men, Women, Kids)", () => {
    it("includes major footwear brands: Nike, Adidas, Puma, Bata, Red Tape, Clarks", () => {
      const brandIds = SHOE_BRANDS.map((b) => b.brandId);
      expect(brandIds).toContain("nike");
      expect(brandIds).toContain("adidas");
      expect(brandIds).toContain("puma");
      expect(brandIds).toContain("bata");
      expect(brandIds).toContain("red_tape");
      expect(brandIds).toContain("clarks");
    });

    it("verifies every brand provides size records for Men, Women, and Kids", () => {
      const demographics: ShoeDemographic[] = ["men", "women", "kids"];
      for (const brand of SHOE_BRANDS) {
        for (const demo of demographics) {
          const records = brand.sizes[demo];
          expect(records).toBeDefined();
          expect(records.length).toBeGreaterThan(0);

          for (const rec of records) {
            expect(rec.uk).toBeDefined();
            expect(rec.us).toBeDefined();
            expect(rec.eu).toBeDefined();
            expect(rec.cm).toBeGreaterThan(0);
            expect(rec.inches).toBeGreaterThan(0);
            expect(rec.footMinMm).toBeGreaterThan(0);
            expect(rec.footMaxMm).toBeGreaterThanOrEqual(rec.footMinMm);
            // Invariant: footMaxMm in mm is approximately cm * 10
            expect(Math.abs(rec.footMaxMm - Math.round(rec.cm * 10))).toBeLessThanOrEqual(5);
          }
        }
      }
    });
  });

  // 2. Deterministic Matching by Footbed Length (in mm)
  describe("2. Deterministic Matching by Foot Length (in mm)", () => {
    it("accurately matches 270 mm foot length to Nike Men's UK 8 (US 9 / EU 42.5)", () => {
      const matched = matchShoeSizeByFootLength("nike", "men", 270);
      expect(matched).toBeDefined();
      expect(matched?.uk).toBe("8");
      expect(matched?.us).toBe("9");
      expect(matched?.eu).toBe("42.5");
      expect(matched?.cm).toBe(27.0);
    });

    it("accurately matches 270 mm foot length to Adidas Men's UK 8.5 (US 9 / EU 42 2/3)", () => {
      const matched = matchShoeSizeByFootLength("adidas", "men", 270);
      expect(matched).toBeDefined();
      // Crucial test: Adidas UK 8.5 matches 27.0 cm due to Continental Parisian points
      expect(matched?.uk).toBe("8.5");
      expect(matched?.us).toBe("9");
      expect(matched?.eu).toBe("42 2/3");
      expect(matched?.cm).toBe(27.0);
    });

    it("accurately matches 240 mm foot length to Nike Women's UK 4.5 (US 7 / EU 38)", () => {
      const matched = matchShoeSizeByFootLength("nike", "women", 240);
      expect(matched).toBeDefined();
      expect(matched?.uk).toBe("4.5");
      expect(matched?.us).toBe("7");
      expect(matched?.eu).toBe("38");
      expect(matched?.cm).toBe(24.0);
    });

    it("accurately matches 240 mm foot length to Bata Women's UK 5 (EU 38)", () => {
      const matched = matchShoeSizeByFootLength("bata", "women", 240);
      expect(matched).toBeDefined();
      expect(matched?.uk).toBe("5");
      expect(matched?.eu).toBe("38");
      expect(matched?.cm).toBe(24.0);
    });

    it("accurately matches 150 mm foot length to Kids Nike UK 7K (US 8C / EU 24)", () => {
      const matched = matchShoeSizeByFootLength("nike", "kids", 150);
      expect(matched).toBeDefined();
      expect(matched?.uk).toBe("7K");
      expect(matched?.us).toBe("8C");
      expect(matched?.cm).toBe(15.0);
    });
  });

  // 3. Cross-Brand Divergence & Last Translation
  describe("3. Cross-Brand Size Translation & Explanations", () => {
    it("proves Nike UK 8 translates to Adidas UK 8.5 with explicit variance explanation", () => {
      const res = convertShoeSizeCrossBrand("nike", "adidas", "men", "8");
      expect(res.fromRecord?.uk).toBe("8");
      expect(res.toRecord?.uk).toBe("8.5");
      expect(res.fromRecord?.cm).toBe(27.0);
      expect(res.toRecord?.cm).toBe(27.0);
      expect(res.varianceNote).toContain("In Adidas, order UK 8.5");
    });

    it("proves Bata UK 8 translates to Adidas UK 8 for 26.5 cm footbed", () => {
      const res = convertShoeSizeCrossBrand("bata", "adidas", "men", "8");
      expect(res.fromRecord?.uk).toBe("8");
      expect(res.toRecord?.uk).toBe("8");
      expect(res.fromRecord?.cm).toBe(26.6);
      expect(res.toRecord?.cm).toBe(26.5);
    });

    it("handles boundary condition gracefully when invalid brand or size is supplied", () => {
      const res = convertShoeSizeCrossBrand("unknown_brand", "nike", "men", "9");
      expect(res.fromRecord).toBeNull();
      expect(res.toRecord).toBeNull();
      expect(res.varianceNote).toContain("Brand not found");
    });
  });
});
