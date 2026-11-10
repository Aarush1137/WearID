import { describe, it, expect, beforeEach } from "vitest";
import { GET as getBrands } from "@/app/api/v1/brands/route";
import { GET as getProducts } from "@/app/api/v1/products/route";
import { POST as matchSizing } from "@/app/api/v1/sizing/match/route";
import { POST as sendOtpRoute } from "@/app/api/auth/otp/send/route";
import { POST as verifyOtpRoute } from "@/app/api/auth/otp/verify/route";
import { clearOtpStore } from "@/lib/auth/otpProviders";
import { mockStore } from "@/lib/mocks/mock-store";

describe("API Routes Integration Tests", () => {
  beforeEach(() => {
    mockStore.reset();
  });

  describe("GET /api/v1/brands", () => {
    it("returns all pilot brands with provenance metadata", async () => {
      const req = new Request("http://localhost:3000/api/v1/brands");
      const res = await getBrands(req);

      expect(res.status).toBe(200);
      const json = await res.json();

      expect(json.data).toBeDefined();
      expect(Array.isArray(json.data)).toBe(true);
      expect(json.total).toBeGreaterThanOrEqual(10);
      expect(json.provenance).toBeDefined();

      // Spot-check pilot brands
      const names = json.data.map((b: any) => b.name);
      expect(names).toContain("Westside");
      expect(names).toContain("FabIndia");
      expect(names).toContain("Raymond");
      expect(names).toContain("Snitch");
      expect(names).toContain("Roadster");
      expect(names).toContain("H&M India");
      expect(names).toContain("Marks & Spencer India");
      expect(names).toContain("Zara India");
      expect(names).toContain("Uniqlo India");
      expect(names).toContain("Levi's India");
    });

    it("returns a single brand when querying by ?id=", async () => {
      const req = new Request("http://localhost:3000/api/v1/brands?id=uniqlo");
      const res = await getBrands(req);

      expect(res.status).toBe(200);
      const brand = await res.json();
      expect(brand.id).toBe("uniqlo");
      expect(brand.name).toBe("Uniqlo India");
      expect(brand.provenance.sourceType).toBe("brand_official");
    });

    it("returns 404 RFC 7807 when querying nonexistent brand", async () => {
      const req = new Request("http://localhost:3000/api/v1/brands?id=nonexistent");
      const res = await getBrands(req);

      expect(res.status).toBe(404);
      const err = await res.json();
      expect(err.type).toBe("https://wearid.in/errors/not-found");
      expect(err.status).toBe(404);
    });
  });

  describe("GET /api/v1/products", () => {
    it("returns products catalog with Layer 2 and Layer 3 specifications", async () => {
      const req = new Request("http://localhost:3000/api/v1/products");
      const res = await getProducts(req);

      expect(res.status).toBe(200);
      const json = await res.json();

      expect(json.data).toBeDefined();
      expect(Array.isArray(json.data)).toBe(true);
      expect(json.total).toBeGreaterThanOrEqual(5);

      const airism = json.data.find((p: any) => p.id === "prod_uniqlo_airism_oversized");
      expect(airism).toBeDefined();
      expect(airism.layer3Specs.length).toBe(4);
    });

    it("filters products by ?brand= parameter", async () => {
      const req = new Request("http://localhost:3000/api/v1/products?brand=snitch");
      const res = await getProducts(req);

      expect(res.status).toBe(200);
      const json = await res.json();

      for (const p of json.data) {
        expect(p.brandId).toBe("snitch");
      }
    });
  });

  describe("POST /api/v1/sizing/match", () => {
    it("evaluates deterministic recommendation and returns ExplanationTree", async () => {
      const body = {
        profile: {
          profileId: "test-profile-1",
          chestMm: 980,
          waistMm: 840,
          heightMm: 1780,
        },
        productId: "prod_uniqlo_supima_regular",
        fitPreference: {
          category: "t_shirt",
          fitType: "regular",
        },
      };

      const req = new Request("http://localhost:3000/api/v1/sizing/match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const res = await matchSizing(req);
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.data).toBeDefined();
      expect(json.data.recommendedSize).toBeDefined();
      expect(json.data.fitScore).toBeGreaterThan(0);
      expect(json.data.dimensionBreakdown).toBeDefined();
      expect(Array.isArray(json.data.dimensionBreakdown)).toBe(true);
      expect(json.data.dataSources.layerUsed).toBe("Layer3_Garment");
    });

    it("honors Invariant 1: rejects evaluation when chest measurement is missing", async () => {
      const body = {
        profile: {
          profileId: "test-profile-2",
          // missing chestMm
          waistMm: 840,
        },
        productId: "prod_uniqlo_supima_regular",
      };

      const req = new Request("http://localhost:3000/api/v1/sizing/match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const res = await matchSizing(req);
      expect(res.status).toBe(400);

      const err = await res.json();
      expect(err.type).toBe("https://wearid.in/errors/insufficient-data");
      expect(err.status).toBe(400);
      expect(err.detail).toContain("Chest measurement");
    });
  });

  describe("POST /api/auth/otp/send and /verify", () => {
    beforeEach(() => {
      clearOtpStore();
    });

    it("sends and verifies an OTP through the REST API endpoints", async () => {
      const sendReq = new Request("http://localhost:3000/api/auth/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          target: "+919876543210",
          provider: "mock",
        }),
      });

      const sendRes = await sendOtpRoute(sendReq);
      expect(sendRes.status).toBe(200);
      const sendJson = await sendRes.json();
      expect(sendJson.success).toBe(true);
      expect(sendJson.devOtpCode).toBeDefined();

      const verifyReq = new Request("http://localhost:3000/api/auth/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          target: "+919876543210",
          code: sendJson.devOtpCode,
        }),
      });

      const verifyRes = await verifyOtpRoute(verifyReq);
      expect(verifyRes.status).toBe(200);
      const verifyJson = await verifyRes.json();
      expect(verifyJson.valid).toBe(true);
      expect(verifyJson.verifiedAt).toBeDefined();
    });

    it("returns 400 when target is missing or invalid", async () => {
      const badReq = new Request("http://localhost:3000/api/auth/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target: "" }),
      });

      const res = await sendOtpRoute(badReq);
      expect(res.status).toBe(400);
    });
  });
});
