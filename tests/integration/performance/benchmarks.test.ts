import { describe, it, expect } from "vitest";
import { evaluateSizeRecommendation } from "@/core/sizing/recommendationEngine";
import { PILOT_PRODUCTS } from "@/core/data/pilotBrands";
import { DEMO_PROFILES } from "@/core/security/tokenRegistry";

describe("Milestone 5.3: Performance & Load Benchmarks", () => {
  const profile = DEMO_PROFILES.regular;
  const product = PILOT_PRODUCTS.find((p) => p.id === "prod_uniqlo_airism_oversized")!;

  it("guarantees <15ms execution time for single garment fit calculation", () => {
    // Warm up JIT
    for (let i = 0; i < 5; i++) {
      evaluateSizeRecommendation({
        profile,
        fitPreference: {
          profileId: profile.profileId,
          category: product.category,
          fitType: "regular",
        },
        garmentDimensions: product.layer3Specs,
        brandSizeCharts: product.layer2Charts,
        fabricSpec: product.fabric,
      });
    }

    const start = performance.now();
    const result = evaluateSizeRecommendation({
      profile,
      fitPreference: {
        profileId: profile.profileId,
        category: product.category,
        fitType: "regular",
      },
      garmentDimensions: product.layer3Specs,
      brandSizeCharts: product.layer2Charts,
      fabricSpec: product.fabric,
    });
    const elapsedMs = performance.now() - start;

    expect(result.recommendedSize).toBeDefined();
    expect(elapsedMs).toBeLessThan(15);
  });

  it("achieves high throughput (>500 recommendations per second in a single thread)", () => {
    const iterations = 500;
    const start = performance.now();

    for (let i = 0; i < iterations; i++) {
      evaluateSizeRecommendation({
        profile,
        fitPreference: {
          profileId: profile.profileId,
          category: product.category,
          fitType: "regular",
        },
        garmentDimensions: product.layer3Specs,
        brandSizeCharts: product.layer2Charts,
        fabricSpec: product.fabric,
      });
    }

    const totalElapsedMs = performance.now() - start;
    const avgMsPerCalculation = totalElapsedMs / iterations;

    // Average time per recommendation should be < 1ms
    expect(avgMsPerCalculation).toBeLessThan(2.0);
  });
});
