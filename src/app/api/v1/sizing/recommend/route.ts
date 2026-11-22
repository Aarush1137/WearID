import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { tokenRegistry } from "@/core/security/tokenRegistry";
import { PILOT_PRODUCTS } from "@/core/data/pilotBrands";
import {
  BrandSizeChart,
  BrandSizeChartSchema,
  FabricSpec,
  FabricSpecSchema,
  FitType,
  FitTypeEnum,
  GarmentDimensions,
  GarmentDimensionsSchema,
} from "@/core/types";
import { cmToMm, inchesToMm } from "@/core/units";
import { predictReturnRate, ReturnRatePrediction } from "@/core/sizing/returnRatePredictor";

export const dynamic = "force-dynamic";

/**
 * Flexible input schemas accepting decimal numbers before canonical conversion to integer mm
 */
const InputGarmentDimensionsSchema = z.object({
  id: z.string().optional(),
  productId: z.string().optional(),
  sizeLabel: z.string(),
  sizeSystem: z.string().optional().default("IN"),
  chestFlatMm: z.number().positive().optional(),
  shoulderMm: z.number().positive().optional(),
  lengthMm: z.number().positive().optional(),
  sleeveMm: z.number().positive().optional(),
  waistFlatMm: z.number().positive().optional(),
  hipFlatMm: z.number().positive().optional(),
  inseamMm: z.number().positive().optional(),
  insoleLengthMm: z.number().positive().optional(),
  innerDiameterMm: z.number().positive().optional(),
  innerCircumferenceMm: z.number().positive().optional(),
  underbustBandFlatMm: z.number().positive().optional(),
  measurementMethod: z.enum(["laid_flat", "hanging", "on_form"]).optional().default("laid_flat"),
  measuredBy: z.enum(["brand", "admin", "contributor"]).optional().default("brand"),
  sourceUrl: z.string().optional(),
  confidence: z.number().min(0).max(1).optional().default(0.9),
});

const InputBrandSizeChartSchema = z.object({
  id: z.string().optional(),
  brandId: z.string().optional().default("unknown"),
  category: z.string().optional().default("apparel"),
  gender: z.enum(["male", "female", "unisex"]).optional().default("unisex"),
  fitType: z.enum(["slim", "regular", "relaxed", "oversized"]).optional(),
  sizeLabel: z.string(),
  sizeSystem: z.enum(["IN", "UK", "EU", "US", "numeric"]).optional().default("IN"),
  sortOrder: z.number().int().optional().default(0),
  chestMinMm: z.number().positive().optional(),
  chestMaxMm: z.number().positive().optional(),
  waistMinMm: z.number().positive().optional(),
  waistMaxMm: z.number().positive().optional(),
  hipsMinMm: z.number().positive().optional(),
  hipsMaxMm: z.number().positive().optional(),
  shoulderMinMm: z.number().positive().optional(),
  shoulderMaxMm: z.number().positive().optional(),
  footMinMm: z.number().positive().optional(),
  footMaxMm: z.number().positive().optional(),
  sourceType: z.string().optional().default("official_chart"),
  confidence: z.number().min(0).max(1).optional().default(0.85),
});

/**
 * Zod validation schema for incoming Sizing Recommendation API requests
 */
const PublicSizingRecommendRequestSchema = z.object({
  token: z.string().optional(),
  retailerId: z.string().optional(),
  productId: z.string().optional(),
  category: z.string().optional().default("t_shirt"),
  fitIntent: FitTypeEnum.optional().default("regular"),
  unit: z.enum(["mm", "cm", "in"]).optional().default("mm"),
  garmentDimensions: z.array(InputGarmentDimensionsSchema).optional(),
  brandSizeCharts: z.array(InputBrandSizeChartSchema).optional(),
  fabricSpec: FabricSpecSchema.optional(),
  includeReturnRisk: z.boolean().optional().default(true),
});

/**
 * Forbidden biometric field keys for automated zero-knowledge assertions
 */
const FORBIDDEN_BIOMETRIC_KEYS = new Set([
  "chestMm",
  "waistMm",
  "hipsMm",
  "inseamMm",
  "heightMm",
  "weightG",
  "neckMm",
  "shoulderWidthMm",
  "bustMm",
  "footLengthMm",
  "underbustMm",
  "torsoLengthMm",
  "wristMm",
  "ringFingerMm",
]);

/**
 * Recursively asserts that a response payload contains ZERO raw biometric data
 */
function assertZeroBiometricLeakage(obj: unknown, path: string = ""): void {
  if (!obj || typeof obj !== "object") return;

  if (Array.isArray(obj)) {
    obj.forEach((item, idx) => assertZeroBiometricLeakage(item, `${path}[${idx}]`));
    return;
  }

  const record = obj as Record<string, unknown>;
  for (const key of Object.keys(record)) {
    if (FORBIDDEN_BIOMETRIC_KEYS.has(key)) {
      throw new Error(`CRITICAL BIOMETRIC PRIVACY LEAK: Key '${key}' detected at '${path}.${key}'`);
    }
    assertZeroBiometricLeakage(record[key], path ? `${path}.${key}` : key);
  }
}

/**
 * Normalizes dimension numbers from presentation units (cm or in) to canonical integer mm
 */
function normalizeToMm(value: number | undefined, unit: "mm" | "cm" | "in"): number | undefined {
  if (value === undefined || value === null) return undefined;
  if (unit === "mm") return Math.round(value);
  if (unit === "cm") return cmToMm(value);
  if (unit === "in") return inchesToMm(value);
  return Math.round(value);
}

/**
 * Converts GarmentDimensions inputs to canonical integer mm and guarantees required fields
 */
function normalizeGarmentDimensions(
  specs: z.infer<typeof InputGarmentDimensionsSchema>[] | undefined,
  unit: "mm" | "cm" | "in",
  fallbackProductId: string = "custom_product"
): GarmentDimensions[] | undefined {
  if (!specs) return undefined;

  return specs.map((spec) => ({
    ...spec,
    productId: spec.productId || fallbackProductId,
    chestFlatMm: normalizeToMm(spec.chestFlatMm, unit),
    shoulderMm: normalizeToMm(spec.shoulderMm, unit),
    lengthMm: normalizeToMm(spec.lengthMm, unit),
    sleeveMm: normalizeToMm(spec.sleeveMm, unit),
    waistFlatMm: normalizeToMm(spec.waistFlatMm, unit),
    hipFlatMm: normalizeToMm(spec.hipFlatMm, unit),
    inseamMm: normalizeToMm(spec.inseamMm, unit),
    insoleLengthMm: normalizeToMm(spec.insoleLengthMm, unit),
  }));
}

/**
 * Converts BrandSizeChart inputs to canonical integer mm and guarantees required fields
 */
function normalizeBrandSizeCharts(
  charts: z.infer<typeof InputBrandSizeChartSchema>[] | undefined,
  unit: "mm" | "cm" | "in",
  fallbackBrandId: string = "unknown"
): BrandSizeChart[] | undefined {
  if (!charts) return undefined;

  return charts.map((chart) => ({
    ...chart,
    brandId: chart.brandId || fallbackBrandId,
    category: chart.category || "apparel",
    gender: chart.gender || "unisex",
    chestMinMm: normalizeToMm(chart.chestMinMm, unit),
    chestMaxMm: normalizeToMm(chart.chestMaxMm, unit),
    waistMinMm: normalizeToMm(chart.waistMinMm, unit),
    waistMaxMm: normalizeToMm(chart.waistMaxMm, unit),
    hipsMinMm: normalizeToMm(chart.hipsMinMm, unit),
    hipsMaxMm: normalizeToMm(chart.hipsMaxMm, unit),
    shoulderMinMm: normalizeToMm(chart.shoulderMinMm, unit),
    shoulderMaxMm: normalizeToMm(chart.shoulderMaxMm, unit),
    footMinMm: normalizeToMm(chart.footMinMm, unit),
    footMaxMm: normalizeToMm(chart.footMaxMm, unit),
  }));
}

/**
 * RFC 7807 Problem Details response builder
 */
function problemResponse(status: number, typeSlug: string, title: string, detail: string) {
  return NextResponse.json(
    {
      type: `https://wearid.in/errors/${typeSlug}`,
      title,
      status,
      detail,
      instance: "/api/v1/sizing/recommend",
    },
    {
      status,
      headers: { "Content-Type": "application/problem+json" },
    }
  );
}

/**
 * GET /api/v1/sizing/recommend
 * API capabilities, documentation, and operational health check
 */
export async function GET() {
  return NextResponse.json({
    service: "WearID Public REST Sizing Recommendation API",
    version: "v1.0.0",
    protocolVersion: "wearid-connect/1.0",
    canonicalUnit: "mm",
    status: "operational",
    endpoints: {
      recommend: "POST /api/v1/sizing/recommend",
    },
    privacyInvariants: [
      "Zero biometric profile exposure: biometric dimensions are evaluated strictly in secure memory and never returned in API payloads.",
      "Deterministic ease modeling: sizing is computed via Gaussian ease scoring, not arbitrary heuristics.",
      "Canonical storage: all calculations are executed strictly in integer millimeters (mm).",
    ],
  });
}

/**
 * POST /api/v1/sizing/recommend
 * Evaluates sizing recommendation with scoped token auth, canonical conversion, and zero biometrics
 */
export async function POST(req: NextRequest) {
  const startTime = performance.now();

  try {
    // 1. Authorization Extraction
    let token: string | undefined;
    const authHeader = req.headers.get("authorization");
    if (authHeader && authHeader.toLowerCase().startsWith("bearer ")) {
      token = authHeader.substring(7).trim();
    } else if (req.headers.get("x-wearid-token")) {
      token = req.headers.get("x-wearid-token")?.trim();
    }

    // 2. Parse and Validate Request Body
    let rawBody: unknown;
    try {
      rawBody = await req.json();
    } catch {
      return problemResponse(
        400,
        "invalid-json",
        "Invalid JSON Body",
        "The request body must be a valid JSON object."
      );
    }

    const parseResult = PublicSizingRecommendRequestSchema.safeParse(rawBody);
    if (!parseResult.success) {
      const issueMessage = parseResult.error.issues
        .map((iss) => `${iss.path.join(".")}: ${iss.message}`)
        .join("; ");
      return problemResponse(
        400,
        "validation-error",
        "Request Validation Failed",
        `Input parameters failed validation: ${issueMessage}`
      );
    }

    const {
      token: bodyToken,
      retailerId,
      productId,
      category,
      fitIntent,
      unit,
      garmentDimensions,
      brandSizeCharts,
      fabricSpec,
      includeReturnRisk,
    } = parseResult.data;

    // Use token from body if not in header
    token = token || bodyToken;

    if (!token) {
      return problemResponse(
        401,
        "token-missing",
        "Missing Authorization Token",
        "A valid WearID sizing token must be provided in the Authorization header or request body."
      );
    }

    // Resolve demo token shorthands (e.g., wearid_demo_athletic, wearid_demo_regular)
    let resolvedToken = token;
    if (token.startsWith("wearid_demo_")) {
      const demoKey = token.replace("wearid_demo_", "") as "athletic" | "regular" | "slim";
      const actualToken = tokenRegistry.getDemoToken(demoKey);
      if (actualToken) {
        resolvedToken = actualToken;
      }
    }

    // 3. Resolve Product & Garment Specifications
    let resolvedCategory: string = category;
    let resolvedDimensions: GarmentDimensions[] | undefined = normalizeGarmentDimensions(
      garmentDimensions,
      unit,
      productId || "custom_product"
    );
    let resolvedCharts: BrandSizeChart[] | undefined = normalizeBrandSizeCharts(
      brandSizeCharts,
      unit,
      retailerId || "unknown"
    );
    let resolvedFabric: FabricSpec | undefined = fabricSpec;

    if (productId) {
      const catalogProduct = PILOT_PRODUCTS.find((p) => p.id === productId);
      if (catalogProduct) {
        resolvedCategory = catalogProduct.category;
        resolvedDimensions = resolvedDimensions || catalogProduct.layer3Specs;
        resolvedCharts = resolvedCharts || catalogProduct.layer2Charts;
        resolvedFabric = resolvedFabric || catalogProduct.fabric;
      }
    }

    const hasDimensions = Array.isArray(resolvedDimensions) && resolvedDimensions.length > 0;
    const hasCharts = Array.isArray(resolvedCharts) && resolvedCharts.length > 0;

    if (!hasDimensions && !hasCharts) {
      return problemResponse(
        422,
        "missing-sizing-data",
        "Missing Garment Specifications",
        "Either a valid catalog productId or verified garmentDimensions / brandSizeCharts must be provided."
      );
    }

    // 4. Execute Deterministic Evaluation via Token Service
    const service = tokenRegistry.getService();
    const matchResponse = service.evaluateRetailerMatch(
      resolvedToken,
      {
        productId: productId || "api_custom_product",
        category: resolvedCategory,
        fitIntent: fitIntent as FitType,
        garmentDimensions: resolvedDimensions,
        brandSizeCharts: resolvedCharts,
        fabricSpec: resolvedFabric,
      },
      retailerId
    );

    // 5. Predict Return Rate (Feature 12 Integration)
    let returnRiskPrediction: ReturnRatePrediction | undefined;
    if (includeReturnRisk) {
      returnRiskPrediction = predictReturnRate({
        category: resolvedCategory,
        fitIntent: fitIntent as FitType,
        recommendedSize: matchResponse.recommendedSize,
        fitScore: matchResponse.fitScore,
        isBorderline: matchResponse.isBorderline,
        fabricSpec: resolvedFabric,
      });
    }

    const latencyMs = Math.round((performance.now() - startTime) * 100) / 100;

    // 6. Build Zero-Knowledge Response Payload
    const responsePayload = {
      status: "success" as const,
      data: {
        recommendedSize: matchResponse.recommendedSize,
        fitScore: matchResponse.fitScore,
        confidence: matchResponse.confidence,
        confidenceLabel: matchResponse.confidenceLabel,
        isBorderline: matchResponse.isBorderline,
        borderlineTradeoff: matchResponse.borderlineTradeoff,
        summaryText: matchResponse.summaryText,
        returnRisk: returnRiskPrediction
          ? {
              riskScore: returnRiskPrediction.riskScore,
              riskLevel: returnRiskPrediction.riskLevel,
              primaryRiskDrivers: returnRiskPrediction.primaryRiskDrivers,
              actionableAdvice: returnRiskPrediction.actionableAdvice,
            }
          : undefined,
      },
      meta: {
        engine: "WearID Deterministic Ease Engine v1.0",
        protocolVersion: "wearid-connect/1.0",
        canonicalUnit: "mm",
        zeroKnowledgeVerified: true,
        evaluatedAt: new Date().toISOString(),
        latencyMs,
      },
    };

    // 7. Critical Invariant 7 Check: Zero Biometric Leakage Assertion
    assertZeroBiometricLeakage(responsePayload);

    return NextResponse.json(responsePayload, {
      status: 200,
      headers: {
        "Cache-Control": "no-store, private",
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal recommendation error";

    if (
      message.includes("Invalid or expired") ||
      message.includes("has expired") ||
      message.includes("not found")
    ) {
      return problemResponse(
        401,
        "token-invalid-or-expired",
        "Token Invalid or Expired",
        message
      );
    }

    if (message.includes("scoped to a different retailer")) {
      return problemResponse(
        403,
        "token-retailer-mismatch",
        "Retailer Mismatch",
        message
      );
    }

    if (message.includes("CRITICAL BIOMETRIC PRIVACY LEAK")) {
      return problemResponse(
        500,
        "biometric-leak-detected",
        "Security Invariant Violation",
        "Critical biometric privacy invariant failure. Response halted."
      );
    }

    return problemResponse(400, "sizing-recommend-error", "Recommendation Failed", message);
  }
}
