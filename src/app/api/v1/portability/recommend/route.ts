import { NextRequest, NextResponse } from "next/server";
import { tokenRegistry } from "@/core/security/tokenRegistry";
import { PILOT_PRODUCTS } from "@/core/data/pilotBrands";
import { FitType } from "@/core/types";

export async function POST(req: NextRequest) {
  const startTime = performance.now();

  try {
    const body = await req.json();
    const { token, retailerId, productId, category, fitIntent, garmentDimensions, brandSizeCharts } = body;

    if (!token || typeof token !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid WearID sizing token." },
        { status: 400 }
      );
    }

    // Resolve demo tokens if shorthand preset used
    let resolvedToken = token;
    if (token.startsWith("wearid_demo_")) {
      const demoKey = token.replace("wearid_demo_", "") as "athletic" | "regular" | "slim";
      const actualToken = tokenRegistry.getDemoToken(demoKey);
      if (actualToken) {
        resolvedToken = actualToken;
      }
    }

    let resolvedCategory: string = category || "t_shirt";
    let resolvedDimensions = garmentDimensions;
    let resolvedCharts = brandSizeCharts;
    let resolvedFabric = body.fabricSpec;

    // If productId is provided, resolve from verified catalog
    if (productId) {
      const catalogProduct = PILOT_PRODUCTS.find((p) => p.id === productId);
      if (catalogProduct) {
        resolvedCategory = catalogProduct.category;
        resolvedDimensions = resolvedDimensions || catalogProduct.layer3Specs;
        resolvedCharts = resolvedCharts || catalogProduct.layer2Charts;
        resolvedFabric = resolvedFabric || catalogProduct.fabric;
      }
    }

    const service = tokenRegistry.getService();
    const recommendation = service.evaluateRetailerMatch(
      resolvedToken,
      {
        productId: productId || "custom_sku",
        category: resolvedCategory,
        fitIntent: (fitIntent as FitType) || "regular",
        garmentDimensions: resolvedDimensions,
        brandSizeCharts: resolvedCharts,
        fabricSpec: resolvedFabric,
      },
      retailerId
    );

    const latencyMs = Math.round((performance.now() - startTime) * 100) / 100;

    return NextResponse.json({
      ...recommendation,
      latencyMs,
      zeroKnowledgeVerified: true,
      protocolVersion: "wearid-connect/1.0",
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown recommendation error";

    if (message.includes("Invalid or expired") || message.includes("has expired")) {
      return NextResponse.json({ error: message, code: "TOKEN_INVALID_OR_EXPIRED" }, { status: 401 });
    }

    if (message.includes("scoped to a different retailer")) {
      return NextResponse.json({ error: message, code: "TOKEN_RETAILER_MISMATCH" }, { status: 403 });
    }

    if (message.includes("CRITICAL BIOMETRIC PRIVACY LEAK")) {
      return NextResponse.json(
        { error: "Security Exception: Biometric privacy invariant failure." },
        { status: 500 }
      );
    }

    return NextResponse.json({ error: message }, { status: 400 });
  }
}
