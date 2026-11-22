import { NextRequest, NextResponse } from "next/server";
import { tokenRegistry, DEMO_PROFILES } from "@/core/security/tokenRegistry";
import { PILOT_PRODUCTS } from "@/core/data/pilotBrands";
import { AnatomicalProfile } from "@/core/types";

export interface CategoryFitSummary {
  category: string;
  categoryLabel: string;
  recommendedSize: string;
  fitConfidence: "high" | "medium" | "low" | "insufficient";
  fitScorePct: number;
  isBorderline: boolean;
  borderlineTradeoff?: string;
  easeDescription: string;
  testedGarments: Array<{
    brandName: string;
    productName: string;
    size: string;
  }>;
}

export interface PublicFitReportDTO {
  token: string;
  title: string;
  profileName: string;
  gender: "male" | "female" | "unisex";
  preferredSilhouette: "slim" | "regular" | "relaxed" | "oversized";
  createdAt: string;
  expiresAt: string;
  categories: CategoryFitSummary[];
  privacyVerified: true;
}

const CATEGORY_META: Record<string, string> = {
  t_shirt: "T-Shirts & Tops",
  t_shirt_oversized: "Oversized Tees",
  shirt_casual: "Casual Shirts",
  shirt_formal: "Dress & Formal Shirts",
  jeans: "Denim & Jeans",
  trousers_chinos: "Chinos & Trousers",
  kurta: "Festive & Ethnic Kurtas",
};

// Forbidden biometric keys that MUST NEVER appear in public share payloads (AGENTS.md Invariant 7)
const FORBIDDEN_BIOMETRIC_KEYS = [
  "chestMm",
  "bustMm",
  "waistMm",
  "hipsMm",
  "shoulderWidthMm",
  "inseamMm",
  "heightMm",
  "neckMm",
  "footLengthMm",
  "weightG",
  "sleeveLengthMm",
];

function assertNoBiometrics(obj: any): void {
  const jsonStr = JSON.stringify(obj);
  for (const key of FORBIDDEN_BIOMETRIC_KEYS) {
    if (jsonStr.includes(`"${key}"`)) {
      throw new Error(`CRITICAL BIOMETRIC PRIVACY LEAK: ${key} found in public share report payload.`);
    }
  }
}

export async function GET(
  req: NextRequest,
  context: { params: { token: string } | Promise<{ token: string }> }
) {
  try {
    const params = await Promise.resolve(context.params);
    const token = params?.token;

    if (!token || typeof token !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid WearID share token." },
        { status: 400 }
      );
    }

    // Resolve demo token shortcuts
    let resolvedToken = token;
    let fallbackProfileName = "Verified Member";
    let fallbackGender: "male" | "female" | "unisex" = "unisex";

    if (token.startsWith("wearid_demo_")) {
      const demoKey = token.replace("wearid_demo_", "") as "athletic" | "regular" | "slim";
      const actualToken = tokenRegistry.getDemoToken(demoKey);
      if (actualToken) {
        resolvedToken = actualToken;
        fallbackProfileName = `${demoKey.charAt(0).toUpperCase() + demoKey.slice(1)} Morph Profile`;
        fallbackGender = "male";
      }
    }

    const service = tokenRegistry.getService();

    // Core categories to evaluate for the universal sizing passport
    const categoriesToEvaluate = [
      "t_shirt",
      "shirt_casual",
      "jeans",
      "trousers_chinos",
      "kurta",
    ];

    const categorySummaries: CategoryFitSummary[] = [];

    for (const category of categoriesToEvaluate) {
      const pilotProduct =
        PILOT_PRODUCTS.find((p) => p.category === category) || PILOT_PRODUCTS[0];

      try {
        const match = service.evaluateRetailerMatch(
          resolvedToken,
          {
            productId: pilotProduct.id,
            category: pilotProduct.category,
            fitIntent: pilotProduct.fitSilhouette,
            garmentDimensions: pilotProduct.layer3Specs,
            brandSizeCharts: pilotProduct.layer2Charts,
            fabricSpec: pilotProduct.fabric,
          },
          undefined
        );

        categorySummaries.push({
          category,
          categoryLabel: CATEGORY_META[category] || category,
          recommendedSize: match.recommendedSize,
          fitConfidence: match.confidenceLabel,
          fitScorePct: Math.round(match.fitScore * 100),
          isBorderline: match.isBorderline,
          borderlineTradeoff: match.borderlineTradeoff,
          easeDescription: match.summaryText,
          testedGarments: [
            {
              brandName: pilotProduct.brandName,
              productName: pilotProduct.name,
              size: match.recommendedSize,
            },
          ],
        });
      } catch (matchErr: any) {
        if (
          matchErr?.message?.includes("Invalid or expired") ||
          matchErr?.message?.includes("has expired")
        ) {
          return NextResponse.json(
            { error: "WearID sizing share token is invalid or has expired." },
            { status: 404 }
          );
        }
        // If single category calculation fails, continue with others
      }
    }

    if (categorySummaries.length === 0) {
      return NextResponse.json(
        { error: "WearID sizing share token is invalid or has expired." },
        { status: 404 }
      );
    }

    const now = new Date();
    const expires = new Date(now.getTime() + 30 * 24 * 3600 * 1000); // 30 days

    const report: PublicFitReportDTO = {
      token: resolvedToken,
      title: "WearID Sovereign Fit Passport",
      profileName: fallbackProfileName,
      gender: fallbackGender,
      preferredSilhouette: "regular",
      createdAt: now.toISOString(),
      expiresAt: expires.toISOString(),
      categories: categorySummaries,
      privacyVerified: true,
    };

    // STRICT INVARIANT 7 ASSERTION
    assertNoBiometrics(report);

    return NextResponse.json(report);
  } catch (err: any) {
    if (err?.message?.includes("CRITICAL BIOMETRIC PRIVACY LEAK")) {
      return NextResponse.json(
        { error: "Security Exception: Biometric privacy invariant violation." },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { error: err?.message || "Internal error generating public fit report." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { profile, expiresInSeconds = 30 * 24 * 3600 } = body;

    const targetProfile: AnatomicalProfile = profile || DEMO_PROFILES.regular;
    const service = tokenRegistry.getService();
    const token = service.generateToken(targetProfile, { expiresInSeconds });

    return NextResponse.json({
      success: true,
      token,
      shareUrl: `/fit/${token}`,
      expiresInSeconds,
      privacyPolicy: "Invariant 7 Sovereign Privacy Guarantee: Zero Biometrics Exchanged",
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Failed to create share token." },
      { status: 400 }
    );
  }
}
