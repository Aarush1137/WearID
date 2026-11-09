import { z } from "zod";

/**
 * Layer 1 — Anatomical Body Profile
 * Biometric human dimensions strictly in integer millimeters (mm).
 */
export const AnatomicalProfileSchema = z.object({
  id: z.string().uuid().optional(),
  profileId: z.string().uuid(),
  heightMm: z.number().int().positive().optional(),
  weightG: z.number().int().positive().optional(),
  chestMm: z.number().int().positive(),
  bustMm: z.number().int().positive().optional(),
  waistMm: z.number().int().positive().optional(),
  hipsMm: z.number().int().positive().optional(),
  shoulderWidthMm: z.number().int().positive().optional(),
  inseamMm: z.number().int().positive().optional(),
  footLengthMm: z.number().int().positive().optional(),
  neckMm: z.number().int().positive().optional(),
  sleeveLengthMm: z.number().int().positive().optional(),
  torsoLengthMm: z.number().int().positive().optional(),
  measurementMethod: z.record(z.string()).optional().default({}),
  notes: z.string().optional(),
  isCurrent: z.boolean().optional().default(true),
  recordedAt: z.string().datetime().optional(),
});

export type AnatomicalProfile = z.input<typeof AnatomicalProfileSchema>;

/**
 * Layer 2 — Brand Body Fit Chart
 * What body dimensions a brand says a size label fits (in mm).
 */
export const BrandSizeChartSchema = z.object({
  id: z.string().uuid().optional(),
  brandId: z.string(),
  category: z.string(),
  subcategory: z.string().optional(),
  gender: z.enum(["male", "female", "unisex"]),
  fitType: z.enum(["slim", "regular", "relaxed", "oversized"]).optional(),
  sizeLabel: z.string(),
  sizeSystem: z.enum(["IN", "UK", "EU", "US", "numeric"]).optional().default("IN"),
  sortOrder: z.number().int().optional().default(0),
  chestMinMm: z.number().int().positive().optional(),
  chestMaxMm: z.number().int().positive().optional(),
  waistMinMm: z.number().int().positive().optional(),
  waistMaxMm: z.number().int().positive().optional(),
  hipsMinMm: z.number().int().positive().optional(),
  hipsMaxMm: z.number().int().positive().optional(),
  shoulderMinMm: z.number().int().positive().optional(),
  shoulderMaxMm: z.number().int().positive().optional(),
  sourceUrl: z.string().url().optional(),
  sourceType: z.string().optional().default("official_chart"),
  confidence: z.number().min(0).max(1).optional().default(0.85),
  communityCorrectionFactor: z.number().optional().default(0),
});

export type BrandSizeChart = z.input<typeof BrandSizeChartSchema>;

/**
 * Layer 3 — Physical Garment Dimensions
 * Finished textile dimensions laid flat in integer millimeters (mm).
 */
export const GarmentDimensionsSchema = z.object({
  id: z.string().uuid().optional(),
  productId: z.string(),
  sizeLabel: z.string(),
  sizeSystem: z.string().optional().default("IN"),
  // Flat half-measurements (double for circumference)
  chestFlatMm: z.number().int().positive(),
  shoulderMm: z.number().int().positive().optional(),
  lengthMm: z.number().int().positive().optional(),
  sleeveMm: z.number().int().positive().optional(),
  waistFlatMm: z.number().int().positive().optional(),
  hipFlatMm: z.number().int().positive().optional(),
  inseamMm: z.number().int().positive().optional(),
  measurementMethod: z.enum(["laid_flat", "hanging", "on_form"]).optional().default("laid_flat"),
  measuredBy: z.enum(["brand", "admin", "contributor"]).optional().default("brand"),
  sourceUrl: z.string().optional(),
  confidence: z.number().min(0).max(1).optional().default(0.9),
});

export type GarmentDimensions = z.input<typeof GarmentDimensionsSchema>;

/**
 * Layer 4 — Personal Fit Preference
 */
export const FitTypeEnum = z.enum(["slim", "regular", "relaxed", "oversized"]);
export type FitType = z.infer<typeof FitTypeEnum>;

export const FitPreferenceSchema = z.object({
  profileId: z.string().uuid(),
  category: z.string(),
  fitType: FitTypeEnum,
  notes: z.string().optional(),
});

export type FitPreference = z.infer<typeof FitPreferenceSchema>;

/**
 * Fabric Specification
 */
export const FabricSpecSchema = z.object({
  materialComposition: z.string().default("100% cotton"),
  elastanePercentage: z.number().min(0).max(100).default(0),
  stretchLevel: z.enum(["none", "low", "medium", "high"]).default("none"),
  estimatedShrinkagePct: z.number().min(0).max(20).default(2),
});

export type FabricSpec = z.infer<typeof FabricSpecSchema>;

export type UserFitRating = "too_tight" | "slightly_tight" | "perfect" | "slightly_loose" | "too_loose";

/**
 * Reference Garment Anchor / Calibration
 */
export const ReferenceGarmentSchema = z.object({
  id: z.string().uuid().optional(),
  brandId: z.string().optional(),
  brandNameRaw: z.string().optional(),
  category: z.string(),
  sizeLabel: z.string(),
  userFitRating: z.enum(["too_tight", "slightly_tight", "perfect", "slightly_loose", "too_loose"]).optional(),
  fitQuality: z.enum(["too_tight", "slightly_tight", "perfect", "slightly_loose", "too_loose"]).optional(),
  verifiedChestFlatMm: z.number().int().positive().optional(),
});

export type ReferenceGarment = z.infer<typeof ReferenceGarmentSchema>;
export type ReferenceGarmentAnchor = ReferenceGarment;
export type ReferenceGarmentCalibration = ReferenceGarment;

export interface TargetEaseRange {
  min: number;
  max: number;
  midpoint: number;
  sigma: number;
}
export type EaseRange = TargetEaseRange;

export class InsufficientDataError extends Error {
  constructor(message: string = "Insufficient data: Required measurements or size charts unavailable.") {
    super(message);
    this.name = "InsufficientDataError";
  }
}

/**
 * Recommendation Result & Explanation Tree
 */
export interface DimensionExplanation {
  dimension: string;
  bodyMeasurementMm: number;
  garmentSpecMm: number;
  easeDeltaMm: number;
  easeTargetMm: { min: number; max: number };
  status: "ideal" | "tight" | "loose" | "acceptable";
  rationale: string;
}

export interface ExplanationTree {
  recommendedSize: string;
  alternativeSize?: string;
  fitScore: number;
  confidence: number;
  confidenceLabel: "high" | "medium" | "low" | "insufficient";
  fitTypeUsed: FitType;
  isBorderline: boolean;
  borderlineTradeoff?: string;
  summaryText: string;
  dimensionBreakdown: DimensionExplanation[];
  fabricConsiderations?: {
    material: string;
    elastanePercentage: number;
    stretchLevel: "none" | "low" | "medium" | "high";
    note: string;
  };
  dataSources: {
    layerUsed: "Layer3_Garment" | "Layer2_BrandChart";
    provenance: string;
  };
}
