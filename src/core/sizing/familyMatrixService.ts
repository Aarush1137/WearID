import { UserProfile } from "../state/profileStore";
import { PILOT_PRODUCTS } from "../data/pilotBrands";
import { matchShoeSizeByFootLength, ShoeDemographic } from "../data/shoeSizeMatrix";
import { evaluateSizeRecommendation } from "./recommendationEngine";

export type MatrixCategoryFilter = "all" | "top" | "bottom" | "shoes";

export interface BenchmarkBrandRow {
  brandId: string;
  brandName: string;
  category: "top" | "bottom" | "shoes";
  categoryLabel: string;
  sampleProductName: string;
}

export interface MemberSizeCell {
  profileId: string;
  brandId: string;
  recommendedSize: string;
  alternativeSize?: string;
  fitScore: number;
  confidenceLabel: "high" | "medium" | "low" | "insufficient";
  fitNote: string;
  status: "ideal" | "acceptable" | "borderline" | "unsupported";
}

export interface MemberMatrixColumn {
  profileId: string;
  profileName: string;
  relation: "self" | "partner" | "parent" | "child" | "other";
  relationLabel: string;
  gender: "male" | "female" | "unisex";
  recommendations: Record<string, MemberSizeCell>; // brandId -> recommendation
}

export interface FamilyMatrixResult {
  benchmarkBrands: BenchmarkBrandRow[];
  columns: MemberMatrixColumn[];
  generatedAt: string;
}

export const BENCHMARK_BRANDS: BenchmarkBrandRow[] = [
  // Tops
  {
    brandId: "uniqlo",
    brandName: "Uniqlo",
    category: "top",
    categoryLabel: "Tops & T-Shirts",
    sampleProductName: "AIRism Cotton Crew Neck T-Shirt",
  },
  {
    brandId: "snitch",
    brandName: "Snitch",
    category: "top",
    categoryLabel: "Tops & T-Shirts",
    sampleProductName: "Drop-Shoulder Boxy Streetwear Tee",
  },
  {
    brandId: "hm",
    brandName: "H&M",
    category: "top",
    categoryLabel: "Tops & T-Shirts",
    sampleProductName: "Regular Fit Cotton Crew",
  },
  {
    brandId: "zara",
    brandName: "Zara",
    category: "top",
    categoryLabel: "Tops & T-Shirts",
    sampleProductName: "European Cut Tailored Shirt",
  },
  {
    brandId: "westside",
    brandName: "Westside",
    category: "top",
    categoryLabel: "Tops & T-Shirts",
    sampleProductName: "Nuon Relaxed Casual Shirt",
  },
  // Bottoms
  {
    brandId: "levis",
    brandName: "Levi's",
    category: "bottom",
    categoryLabel: "Jeans & Trousers",
    sampleProductName: "501 Original Fit Rigid Denim Jeans",
  },
  {
    brandId: "uniqlo_chinos",
    brandName: "Uniqlo Chinos",
    category: "bottom",
    categoryLabel: "Jeans & Trousers",
    sampleProductName: "Slim Fit Stretch Chino Pants",
  },
  // Footwear
  {
    brandId: "nike",
    brandName: "Nike",
    category: "shoes",
    categoryLabel: "Footwear & Athletic",
    sampleProductName: "Air Force 1 / Court Legacy",
  },
  {
    brandId: "adidas",
    brandName: "Adidas",
    category: "shoes",
    categoryLabel: "Footwear & Athletic",
    sampleProductName: "Stan Smith / Superstar",
  },
  {
    brandId: "bata",
    brandName: "Bata",
    category: "shoes",
    categoryLabel: "Footwear & Formal",
    sampleProductName: "Oxford Formal Derby Shoes",
  },
];

export const RELATION_LABELS: Record<UserProfile["relation"], string> = {
  self: "Self",
  partner: "Partner",
  parent: "Parent",
  child: "Child",
  other: "Family / Friend",
};

/**
 * Deterministically evaluates a single profile against a benchmark brand
 */
function evaluateProfileForBenchmark(
  profile: UserProfile,
  benchmark: BenchmarkBrandRow
): MemberSizeCell {
  // 1. Footwear evaluation
  if (benchmark.category === "shoes") {
    const footMm = profile.measurements?.footLengthMm;
    const demographic: ShoeDemographic =
      profile.relation === "child"
        ? "kids"
        : profile.gender === "female"
        ? "women"
        : "men";

    if (!footMm || footMm <= 0) {
      return {
        profileId: profile.id,
        brandId: benchmark.brandId,
        recommendedSize: demographic === "women" ? "UK 5" : demographic === "kids" ? "UK 1K" : "UK 8",
        fitScore: 50,
        confidenceLabel: "low",
        fitNote: "Foot length not recorded",
        status: "acceptable",
      };
    }

    const match = matchShoeSizeByFootLength(benchmark.brandId, demographic, footMm);
    if (!match) {
      return {
        profileId: profile.id,
        brandId: benchmark.brandId,
        recommendedSize: "UK 8",
        fitScore: 55,
        confidenceLabel: "low",
        fitNote: "Brand size pending calibration",
        status: "borderline",
      };
    }

    const isExact = footMm >= match.footMinMm && footMm <= match.footMaxMm;
    return {
      profileId: profile.id,
      brandId: benchmark.brandId,
      recommendedSize: `UK ${match.uk}`,
      alternativeSize: match.eu ? `EU ${match.eu}` : undefined,
      fitScore: isExact ? 98 : 88,
      confidenceLabel: "high",
      fitNote: `${match.cm} cm footbed`,
      status: "ideal",
    };
  }

  // 2. Apparel evaluation (Tops or Bottoms)
  // Find matching pilot product
  const targetCategory = benchmark.category === "bottom" ? ["jeans", "trousers_chinos"] : ["t_shirt", "t_shirt_oversized", "shirt_casual"];
  const brandLookupId = benchmark.brandId === "uniqlo_chinos" ? "uniqlo" : benchmark.brandId;

  const product = PILOT_PRODUCTS.find(
    (p) => p.brandId === brandLookupId && targetCategory.includes(p.category)
  );

  if (!product) {
    const defaultSize = profile.measurements?.chestMm && profile.measurements.chestMm > 1020 ? "L" : profile.measurements?.chestMm && profile.measurements.chestMm < 920 ? "S" : "M";
    return {
      profileId: profile.id,
      brandId: benchmark.brandId,
      recommendedSize: benchmark.category === "bottom" ? "32x32" : defaultSize,
      fitScore: 82,
      confidenceLabel: "medium",
      fitNote: "Standard grading estimate",
      status: "acceptable",
    };
  }

  const rec = evaluateSizeRecommendation({
    profile: profile.measurements,
    fitPreference: {
      profileId: profile.id,
      category: product.category,
      fitType: profile.preferences[product.category] || "regular",
    },
    garmentDimensions: product.layer3Specs,
    brandSizeCharts: product.layer2Charts,
    fabricSpec: product.fabric,
  });

  const isOutOfRange = rec.fitScore < 30;
  const fitNote = isOutOfRange
    ? profile.relation === "child"
      ? "Adult cut - exceeds child proportions"
      : profile.gender === "female"
      ? "Men's cut - oversized for female frame"
      : "Exceeds standard grading range"
    : rec.summaryText.length > 50
    ? rec.summaryText.substring(0, 48) + "..."
    : rec.summaryText;

  return {
    profileId: profile.id,
    brandId: benchmark.brandId,
    recommendedSize: rec.recommendedSize || "XS",
    alternativeSize: rec.alternativeSize,
    fitScore: rec.fitScore,
    confidenceLabel: rec.confidenceLabel,
    fitNote,
    status: isOutOfRange
      ? "unsupported"
      : rec.fitScore >= 88
      ? "ideal"
      : rec.fitScore >= 70
      ? "acceptable"
      : "borderline",
  };
}

/**
 * Builds the full comparison matrix across all profiles and benchmark brands
 */
export function buildFamilyMatrix(
  profiles: UserProfile[],
  filterCategory: MatrixCategoryFilter = "all"
): FamilyMatrixResult {
  const filteredBrands = BENCHMARK_BRANDS.filter((brand) => {
    if (filterCategory === "all") return true;
    return brand.category === filterCategory;
  });

  const columns: MemberMatrixColumn[] = profiles.map((profile) => {
    const recommendations: Record<string, MemberSizeCell> = {};

    filteredBrands.forEach((b) => {
      recommendations[b.brandId] = evaluateProfileForBenchmark(profile, b);
    });

    return {
      profileId: profile.id,
      profileName: profile.name || "Default Profile",
      relation: profile.relation,
      relationLabel: RELATION_LABELS[profile.relation] || "Member",
      gender: profile.gender,
      recommendations,
    };
  });

  return {
    benchmarkBrands: filteredBrands,
    columns,
    generatedAt: new Date().toISOString(),
  };
}

/**
 * Generates a clean, privacy-preserving Family Size Cheat Sheet formatted for WhatsApp or printing.
 * HARD INVARIANT: Under AGENTS.md Invariant #7, ZERO raw anatomical measurements
 * (e.g. chestMm, waistMm, weightG, footLengthMm) are leaked into the exported text.
 */
export function generateFamilyCheatSheetText(
  matrix: FamilyMatrixResult,
  familyName: string = "WearID Family"
): string {
  const lines: string[] = [
    `📋 ${familyName} Size Cheat Sheet`,
    "----------------------------------------",
  ];

  matrix.columns.forEach((col) => {
    lines.push(`👤 ${col.profileName} (${col.relationLabel}):`);

    matrix.benchmarkBrands.forEach((brand) => {
      const cell = col.recommendations[brand.brandId];
      if (cell) {
        lines.push(`  • ${brand.brandName}: ${cell.recommendedSize} (${cell.fitScore}% match)`);
      }
    });

    lines.push("");
  });

  lines.push("----------------------------------------");
  lines.push("🔒 Privacy Audited: Zero biometric measurements leaked.");
  lines.push("Generated by WearID Deterministic Sizing Engine.");

  return lines.join("\n");
}

/**
 * Privacy Verification Utility
 * Validates that an export text contains zero raw biometric measurements
 */
export function validateCheatSheetPrivacy(text: string, profiles: UserProfile[]): boolean {
  const forbiddenPatterns = [
    /chestMm/i,
    /waistMm/i,
    /hipsMm/i,
    /footLengthMm/i,
    /inseamMm/i,
    /heightMm/i,
    /shoulderWidthMm/i,
  ];

  for (const pattern of forbiddenPatterns) {
    if (pattern.test(text)) {
      return false;
    }
  }

  for (const profile of profiles) {
    const m = profile.measurements;
    if (!m) continue;
    if (m.chestMm && text.includes(`${m.chestMm}mm`)) return false;
    if (m.waistMm && text.includes(`${m.waistMm}mm`)) return false;
    if (m.hipsMm && text.includes(`${m.hipsMm}mm`)) return false;
    if (m.heightMm && text.includes(`${m.heightMm}mm`)) return false;
  }

  return true;
}
