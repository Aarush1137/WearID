import crypto from "crypto";
import { AnatomicalProfile, BrandSizeChart, FabricSpec, GarmentDimensions } from "../types";
import { evaluateSizeRecommendation } from "../sizing/recommendationEngine";

export interface SizingTokenPayload {
  tokenId: string;
  profileId: string;
  issuedAt: number;
  expiresAt: number;
  allowedRetailer?: string;
}

export interface RetailerMatchResponse {
  tokenValid: boolean;
  recommendedSize: string;
  confidence: number;
  confidenceLabel: "high" | "medium" | "low" | "insufficient";
  fitScore: number;
  isBorderline: boolean;
  borderlineTradeoff?: string;
  summaryText: string;
  // Zero raw anatomical dimensions: chestMm, waistMm, hipsMm, shoulderWidthMm, etc. MUST be omitted
}

export class SizingTokenService {
  private activeTokens = new Map<string, { payload: SizingTokenPayload; profile: AnatomicalProfile }>();
  private signingSecret: string;

  constructor(signingSecret: string) {
    if (!signingSecret || signingSecret.trim().length < 32) {
      throw new Error(
        "Security Error: SizingTokenService requires a secure signing secret of at least 32 characters."
      );
    }
    this.signingSecret = signingSecret;
  }

  /**
   * Generates a time-bound, scoped cryptographic sizing token.
   * Invariant 7: Sizing tokens allow third-party matching without sharing raw biometrics.
   */
  public generateToken(
    profile: AnatomicalProfile,
    options: { expiresInSeconds?: number; allowedRetailer?: string } = {}
  ): string {
    const tokenId = `wearid_tok_${crypto.randomBytes(16).toString("hex")}`;
    const now = Math.floor(Date.now() / 1000);
    const expiresIn = options.expiresInSeconds || 3600; // 1 hour default

    const payload: SizingTokenPayload = {
      tokenId,
      profileId: profile.profileId,
      issuedAt: now,
      expiresAt: now + expiresIn,
      allowedRetailer: options.allowedRetailer,
    };

    this.activeTokens.set(tokenId, { payload, profile });
    return tokenId;
  }

  /**
   * Evaluates size match for a retailer without exposing raw anatomical measurements.
   * Invariant 7 & TC-SEC-002: Zero raw biometric values in response.
   */
  public evaluateRetailerMatch(
    tokenId: string,
    garment: {
      productId: string;
      category: string;
      fitIntent?: "slim" | "regular" | "relaxed" | "oversized";
      garmentDimensions?: GarmentDimensions[];
      brandSizeCharts?: BrandSizeChart[];
      fabricSpec?: FabricSpec;
    },
    requestingRetailer?: string
  ): RetailerMatchResponse {
    const entry = this.activeTokens.get(tokenId);
    if (!entry) {
      throw new Error("Invalid or expired WearID sizing token.");
    }

    const { payload, profile } = entry;
    const now = Math.floor(Date.now() / 1000);

    if (now > payload.expiresAt) {
      this.activeTokens.delete(tokenId);
      throw new Error("WearID sizing token has expired.");
    }

    if (payload.allowedRetailer && requestingRetailer && payload.allowedRetailer !== requestingRetailer) {
      throw new Error("WearID sizing token is scoped to a different retailer.");
    }

    // Run deterministic sizing engine in secure memory
    const recommendation = evaluateSizeRecommendation({
      profile,
      fitPreference: {
        profileId: profile.profileId,
        category: garment.category,
        fitType: garment.fitIntent || "regular",
      },
      garmentDimensions: garment.garmentDimensions,
      brandSizeCharts: garment.brandSizeCharts,
      fabricSpec: garment.fabricSpec,
    });

    // PRIVACY INVARIANT (AGENTS.md Invariant 7 & TC-SEC-002):
    // Construct zero-knowledge response.
    // Explicitly exclude any raw biometric measurements (chest, waist, hips, shoulders, inseam).
    const sanitizedResponse: RetailerMatchResponse = {
      tokenValid: true,
      recommendedSize: recommendation.recommendedSize,
      confidence: recommendation.confidence,
      confidenceLabel: recommendation.confidenceLabel,
      fitScore: recommendation.fitScore,
      isBorderline: recommendation.isBorderline,
      borderlineTradeoff: recommendation.borderlineTradeoff,
      summaryText: recommendation.summaryText,
    };

    // Assert zero leakage
    const responseKeys = Object.keys(sanitizedResponse);
    const forbiddenBiometricKeys = [
      "chestMm",
      "bustMm",
      "waistMm",
      "hipsMm",
      "shoulderWidthMm",
      "inseamMm",
      "heightMm",
      "neckMm",
      "footLengthMm",
    ];

    for (const key of forbiddenBiometricKeys) {
      if (key in sanitizedResponse || responseKeys.includes(key)) {
        throw new Error(`CRITICAL BIOMETRIC PRIVACY LEAK: ${key} found in retailer response.`);
      }
    }

    return sanitizedResponse;
  }

  public revokeToken(tokenId: string): void {
    this.activeTokens.delete(tokenId);
  }

  public clear(): void {
    this.activeTokens.clear();
  }
}
