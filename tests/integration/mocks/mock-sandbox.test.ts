import { describe, it, expect, beforeEach } from "vitest";
import { mockStore, SEED_BRANDS, SEED_PRODUCTS } from "@/lib/mocks/mock-store";
import { createMockSupabaseClient } from "@/lib/supabase/mock-client";
import { createClient } from "@/lib/supabase/client";

describe("Zero-Credential Local Sandbox & Mock Store Integration", () => {
  beforeEach(() => {
    mockStore.reset();
  });

  it("seeds all 8 pilot brands and benchmark brands with immutable provenance", () => {
    const brands = mockStore.getBrands();
    expect(brands.length).toBeGreaterThanOrEqual(10);

    const requiredBrandSlugs = [
      "westside",
      "fabindia",
      "raymond",
      "snitch",
      "roadster",
      "hm-india",
      "marks-and-spencer",
      "zara-india",
      "uniqlo-india",
      "levis-india",
    ];

    const actualSlugs = brands.map((b) => b.slug);
    for (const slug of requiredBrandSlugs) {
      expect(actualSlugs).toContain(slug);
    }

    // Verify Invariant 2: Every brand must retain end-to-end provenance
    for (const brand of brands) {
      expect(brand.provenance).toBeDefined();
      expect(brand.provenance.sourceType).toMatch(/brand_official|curated_dataset|contributor_verified/);
      expect(brand.provenance.sourceUrl).toMatch(/^https?:\/\//);
      expect(brand.provenance.retrievedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
      expect(brand.provenance.verificationHash).toMatch(/^sha256-/);
    }
  });

  it("stores Layer 2 body fit charts and Layer 3 flat dimensions strictly in canonical mm", () => {
    const products = mockStore.getProducts();
    expect(products.length).toBeGreaterThanOrEqual(5);

    for (const product of products) {
      // Check Layer 3 specs if present
      if (product.layer3Specs && product.layer3Specs.length > 0) {
        for (const spec of product.layer3Specs) {
          expect(spec.chestFlatMm).toBeGreaterThan(300);
          expect(spec.chestFlatMm).toBeLessThan(900);
          expect(Number.isInteger(spec.chestFlatMm)).toBe(true);
          if (spec.lengthMm) {
            expect(Number.isInteger(spec.lengthMm)).toBe(true);
          }
        }
      }

      // Check Layer 2 charts if present
      if (product.layer2Charts && product.layer2Charts.length > 0) {
        for (const chart of product.layer2Charts) {
          if (chart.chestMinMm) {
            expect(Number.isInteger(chart.chestMinMm)).toBe(true);
            expect(chart.chestMinMm).toBeGreaterThan(600);
          }
          if (chart.chestMaxMm) {
            expect(Number.isInteger(chart.chestMaxMm)).toBe(true);
            expect(chart.chestMaxMm).toBeGreaterThan(chart.chestMinMm || 0);
          }
        }
      }
    }
  });

  it("mock-client query builder can select and filter brand and product records", async () => {
    const client = createMockSupabaseClient();

    // Query single brand
    const { data: brand, error: brandErr } = await client
      .from("brands")
      .select("*")
      .eq("id", "uniqlo")
      .single();

    expect(brandErr).toBeNull();
    expect(brand).toBeDefined();
    expect(brand.name).toBe("Uniqlo India");

    // Query products
    const { data: products, error: prodErr } = await client
      .from("products")
      .select("*")
      .eq("brand_id", "snitch");

    expect(prodErr).toBeNull();
    expect(Array.isArray(products)).toBe(true);
    expect(products.length).toBeGreaterThanOrEqual(1);
    expect(products[0].brandName).toBe("Snitch");
  });

  it("mock-client auth simulation returns authenticated mock user and session", async () => {
    const client = createMockSupabaseClient();

    const { data: userData, error: userErr } = await client.auth.getUser();
    expect(userErr).toBeNull();
    expect(userData.user).toBeDefined();
    expect(userData.user?.email).toBe("aarush@example.com");

    const { data: sessionData, error: sessionErr } = await client.auth.getSession();
    expect(sessionErr).toBeNull();
    expect(sessionData.session).toBeDefined();
    expect(sessionData.session?.access_token).toBe("mock-jwt-token-wearid");
  });

  it("isomorphic client factory falls back to mock client when credentials are not configured", () => {
    const client = createClient();
    expect(client).toBeDefined();
    expect(typeof client.from).toBe("function");
    expect(typeof client.auth.getUser).toBe("function");
  });
});
