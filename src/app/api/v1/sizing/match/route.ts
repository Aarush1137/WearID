import { NextResponse } from "next/server";
import { evaluateSizing, SizingEvaluationRequest } from "@/core/engine";
import { mockStore } from "@/lib/mocks/mock-store";
import { AnatomicalProfile, FitPreference } from "@/core/types";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    let profile: AnatomicalProfile | undefined = body.profile;
    if (!profile && body.profileId) {
      profile = mockStore.getMeasurements(body.profileId);
    }
    if (!profile) {
      // Default to active sandbox profile if none specified
      profile = mockStore.getMeasurements();
    }

    // Invariant 1: Never synthesize missing body girths & validate physical bounds
    if (
      !profile ||
      typeof profile.chestMm !== "number" ||
      isNaN(profile.chestMm) ||
      profile.chestMm <= 0 ||
      profile.chestMm > 2500
    ) {
      return NextResponse.json(
        {
          type: "https://wearid.in/errors/insufficient-data",
          title: "Insufficient Measurement Data",
          status: 400,
          detail: "Chest measurement (Layer 1) in valid integer millimeters (1..2500 mm) is strictly required to evaluate apparel sizing.",
          instance: "/api/v1/sizing/match",
          invalid_params: [
            {
              name: "profile.chestMm",
              reason: "chestMm must be a positive integer in canonical millimeters (mm) within valid human anatomical bounds.",
            },
          ],
        },
        { status: 400, headers: { "Content-Type": "application/problem+json" } }
      );
    }

    // Resolve product specs if productId is provided
    let garmentDimensions = body.garmentDimensions;
    let brandSizeCharts = body.brandSizeCharts;
    let fabricSpec = body.fabricSpec;

    if (body.productId) {
      const product = mockStore.getProduct(body.productId);
      if (product) {
        if (!garmentDimensions && product.layer3Specs) {
          garmentDimensions = product.layer3Specs;
        }
        if (!brandSizeCharts && product.layer2Charts) {
          brandSizeCharts = product.layer2Charts;
        }
        if (!fabricSpec && product.fabric) {
          fabricSpec = product.fabric;
        }
      }
    }

    const fitPreference: FitPreference = body.fitPreference || {
      profileId: profile.profileId,
      category: body.category || "t_shirt",
      fitType: body.fitType || "regular",
    };

    const referenceGarments = body.referenceGarments || mockStore.getReferenceGarments(profile.profileId);

    const evaluationReq: SizingEvaluationRequest = {
      profile,
      fitPreference,
      garmentDimensions,
      brandSizeCharts,
      referenceGarments,
      fabricSpec,
      communityCorrectionFactor: body.communityCorrectionFactor ?? 0,
    };

    const explanationTree = evaluateSizing(evaluationReq);

    return NextResponse.json({
      data: explanationTree,
      meta: {
        engine: "WearID Deterministic Ease Engine",
        canonicalUnit: "mm",
        evaluatedAt: new Date().toISOString(),
        invariantsEnforced: ["Rule 1: Zero Hallucination", "Rule 3: Layer Segregation", "Rule 4: Canonical Units (mm)"],
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        type: "https://wearid.in/errors/evaluation-error",
        title: "Sizing Evaluation Failed",
        status: 500,
        detail: err?.message || "An unexpected error occurred during deterministic sizing evaluation.",
      },
      { status: 500, headers: { "Content-Type": "application/problem+json" } }
    );
  }
}
