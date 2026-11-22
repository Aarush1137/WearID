import { describe, it, expect } from "vitest";
import {
  buildFamilyMatrix,
  generateFamilyCheatSheetText,
  validateCheatSheetPrivacy,
  BENCHMARK_BRANDS,
  RELATION_LABELS,
} from "../../../src/core/sizing/familyMatrixService";
import { UserProfile } from "../../../src/core/state/profileStore";

describe("Feature 9: Family Multi-Profile Comparison Matrix", () => {
  const profileSelf: UserProfile = {
    id: "prof_self_1",
    name: "Aarush",
    relation: "self",
    gender: "male",
    measurements: {
      profileId: "prof_self_1",
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
  };

  const profilePartner: UserProfile = {
    id: "prof_partner_1",
    name: "Ananya",
    relation: "partner",
    gender: "female",
    measurements: {
      profileId: "prof_partner_1",
      chestMm: 860,
      waistMm: 680,
      hipsMm: 920,
      heightMm: 1650,
      inseamMm: 720,
      footLengthMm: 240, // Nike Women UK 4.5 (236-240mm)
      isCurrent: true,
    },
    preferences: { t_shirt: "relaxed", jeans: "slim" },
    referenceGarments: [],
    createdAt: "2026-03-01T08:00:00Z",
    updatedAt: "2026-03-01T08:00:00Z",
  };

  const profileChild: UserProfile = {
    id: "prof_child_1",
    name: "Rohan",
    relation: "child",
    gender: "male",
    measurements: {
      profileId: "prof_child_1",
      chestMm: 650,
      waistMm: 560,
      heightMm: 1250,
      footLengthMm: 180, // Nike Kids UK 12K (179-187mm)
      isCurrent: true,
    },
    preferences: { t_shirt: "oversized" },
    referenceGarments: [],
    createdAt: "2026-03-01T08:00:00Z",
    updatedAt: "2026-03-01T08:00:00Z",
  };

  const testProfiles: UserProfile[] = [profileSelf, profilePartner, profileChild];

  it("should build a side-by-side matrix across all family members", () => {
    const matrix = buildFamilyMatrix(testProfiles, "all");

    expect(matrix.columns.length).toBe(3);
    expect(matrix.benchmarkBrands.length).toBe(BENCHMARK_BRANDS.length);

    // Each column maps to a profile
    expect(matrix.columns[0].profileName).toBe("Aarush");
    expect(matrix.columns[0].relationLabel).toBe("Self");

    expect(matrix.columns[1].profileName).toBe("Ananya");
    expect(matrix.columns[1].relationLabel).toBe("Partner");

    expect(matrix.columns[2].profileName).toBe("Rohan");
    expect(matrix.columns[2].relationLabel).toBe("Child");

    // All benchmark brands should have size evaluations for each member
    matrix.columns.forEach((col) => {
      matrix.benchmarkBrands.forEach((b) => {
        const cell = col.recommendations[b.brandId];
        expect(cell).toBeDefined();
        expect(cell.recommendedSize).toBeDefined();
        expect(cell.fitScore).toBeGreaterThanOrEqual(0);
        if (col.relation === "self") {
          // Primary self profile is male matching adult pilot products
          expect(cell.fitScore).toBeGreaterThanOrEqual(60);
        }
      });
    });
  });

  it("should filter benchmark brands by category", () => {
    const topsMatrix = buildFamilyMatrix(testProfiles, "top");
    expect(topsMatrix.benchmarkBrands.every((b) => b.category === "top")).toBe(true);

    const bottomsMatrix = buildFamilyMatrix(testProfiles, "bottom");
    expect(bottomsMatrix.benchmarkBrands.every((b) => b.category === "bottom")).toBe(true);

    const shoesMatrix = buildFamilyMatrix(testProfiles, "shoes");
    expect(shoesMatrix.benchmarkBrands.every((b) => b.category === "shoes")).toBe(true);
  });

  it("should route shoe demographics correctly based on gender and child relation", () => {
    const matrix = buildFamilyMatrix(testProfiles, "shoes");

    const maleShoe = matrix.columns[0].recommendations["nike"];
    expect(maleShoe.recommendedSize).toContain("UK 8"); // 270mm men's UK 8

    const femaleShoe = matrix.columns[1].recommendations["nike"];
    expect(femaleShoe.recommendedSize).toContain("UK 4.5"); // 240mm women's UK 4.5

    const childShoe = matrix.columns[2].recommendations["nike"];
    expect(childShoe.recommendedSize).toContain("UK 12K"); // 180mm kids UK 12K
  });

  it("should correctly map all family relation labels", () => {
    expect(RELATION_LABELS.self).toBe("Self");
    expect(RELATION_LABELS.partner).toBe("Partner");
    expect(RELATION_LABELS.parent).toBe("Parent");
    expect(RELATION_LABELS.child).toBe("Child");
    expect(RELATION_LABELS.other).toBe("Family / Friend");
  });

  describe("Hard Privacy Invariant Adherence (AGENTS.md Invariant #7)", () => {
    it("should generate a clean size cheat sheet without leaking raw biometric measurements", () => {
      const matrix = buildFamilyMatrix(testProfiles, "all");
      const cheatSheet = generateFamilyCheatSheetText(matrix, "Aarush's Family");

      // Verify content is present
      expect(cheatSheet).toContain("Aarush (Self)");
      expect(cheatSheet).toContain("Ananya (Partner)");
      expect(cheatSheet).toContain("Rohan (Child)");
      expect(cheatSheet).toContain("Uniqlo");
      expect(cheatSheet).toContain("Levi's");
      expect(cheatSheet).toContain("Nike");

      // Strict Privacy Validation
      const isPrivacyCompliant = validateCheatSheetPrivacy(cheatSheet, testProfiles);
      expect(isPrivacyCompliant).toBe(true);

      // Explicitly assert zero raw anatomical biometrics in output
      expect(cheatSheet).not.toContain("980mm");
      expect(cheatSheet).not.toContain("820mm");
      expect(cheatSheet).not.toContain("860mm");
      expect(cheatSheet).not.toContain("680mm");
      expect(cheatSheet).not.toContain("650mm");
      expect(cheatSheet).not.toContain("chestMm");
      expect(cheatSheet).not.toContain("waistMm");
      expect(cheatSheet).not.toContain("footLengthMm");
    });
  });
});
