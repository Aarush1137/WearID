import { describe, it, expect, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { GET, POST } from "@/app/api/v1/sizing/recommend/route";
import { tokenRegistry, DEMO_PROFILES } from "@/core/security/tokenRegistry";
import { PILOT_PRODUCTS } from "@/core/data/pilotBrands";

describe("Feature 13: Public REST Sizing API (/api/v1/sizing/recommend)", () => {
  beforeEach(() => {
    tokenRegistry.reset();
  });

  describe("GET /api/v1/sizing/recommend", () => {
    it("returns API status, capabilities, and canonical unit specifications", async () => {
      const res = await GET();
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.service).toContain("WearID Public REST Sizing Recommendation API");
      expect(json.status).toBe("operational");
      expect(json.canonicalUnit).toBe("mm");
      expect(json.protocolVersion).toBe("wearid-connect/1.0");
      expect(Array.isArray(json.privacyInvariants)).toBe(true);
    });
  });

  describe("POST /api/v1/sizing/recommend — Authentication & Scoping", () => {
    it("successfully recommends size using Authorization Bearer token header", async () => {
      const validToken = tokenRegistry.getDemoToken("regular");
      expect(validToken).toBeDefined();

      const product = PILOT_PRODUCTS.find((p) => p.id === "prod_uniqlo_airism_oversized")!;
      expect(product).toBeDefined();

      const req = new NextRequest("http://localhost:3000/api/v1/sizing/recommend", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${validToken}`,
        },
        body: JSON.stringify({
          productId: product.id,
          fitIntent: "regular",
        }),
      });

      const res = await POST(req);
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.status).toBe("success");
      expect(json.data.recommendedSize).toBeDefined();
      expect(["S", "M", "L", "XL"]).toContain(json.data.recommendedSize);
      expect(json.data.fitScore).toBeGreaterThan(0.7);
      expect(json.data.confidence).toBeGreaterThan(0.8);
      expect(json.data.confidenceLabel).toBe("high");

      // Return risk prediction included
      expect(json.data.returnRisk).toBeDefined();
      expect(typeof json.data.returnRisk.riskScore).toBe("number");
      expect(["low", "moderate", "high"]).toContain(json.data.returnRisk.riskLevel);
      expect(Array.isArray(json.data.returnRisk.primaryRiskDrivers)).toBe(true);
    });

    it("accepts token in request body as alternative to Authorization header", async () => {
      const validToken = tokenRegistry.getDemoToken("athletic");
      const product = PILOT_PRODUCTS.find((p) => p.id === "prod_snitch_heavyweight_boxy")!;

      const req = new NextRequest("http://localhost:3000/api/v1/sizing/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: validToken,
          productId: product.id,
        }),
      });

      const res = await POST(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.status).toBe("success");
      expect(json.data.recommendedSize).toBeDefined();
    });

    it("resolves demo token shorthands (e.g. wearid_demo_slim)", async () => {
      const product = PILOT_PRODUCTS[0];
      const req = new NextRequest("http://localhost:3000/api/v1/sizing/recommend", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer wearid_demo_slim",
        },
        body: JSON.stringify({
          productId: product.id,
        }),
      });

      const res = await POST(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.status).toBe("success");
    });

    it("returns 401 when token is missing entirely", async () => {
      const req = new NextRequest("http://localhost:3000/api/v1/sizing/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: "prod_uniqlo_airism_oversized",
        }),
      });

      const res = await POST(req);
      expect(res.status).toBe(401);
      const json = await res.json();
      expect(json.type).toContain("token-missing");
      expect(json.status).toBe(401);
    });

    it("returns 401 with RFC 7807 when token is expired", async () => {
      const service = tokenRegistry.getService();
      const expiredToken = service.generateToken(DEMO_PROFILES.regular, {
        expiresInSeconds: -10,
      });

      const req = new NextRequest("http://localhost:3000/api/v1/sizing/recommend", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${expiredToken}`,
        },
        body: JSON.stringify({
          productId: "prod_uniqlo_airism_oversized",
        }),
      });

      const res = await POST(req);
      expect(res.status).toBe(401);
      const json = await res.json();
      expect(json.type).toContain("token-invalid-or-expired");
      expect(json.status).toBe(401);
    });

    it("returns 403 when token is scoped to a different retailer", async () => {
      const service = tokenRegistry.getService();
      const scopedToken = service.generateToken(DEMO_PROFILES.athletic, {
        allowedRetailer: "zara",
      });

      const req = new NextRequest("http://localhost:3000/api/v1/sizing/recommend", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${scopedToken}`,
        },
        body: JSON.stringify({
          retailerId: "hm",
          productId: "prod_hm_regular_tee",
        }),
      });

      const res = await POST(req);
      expect(res.status).toBe(403);
      const json = await res.json();
      expect(json.type).toContain("token-retailer-mismatch");
      expect(json.status).toBe(403);
    });
  });

  describe("POST /api/v1/sizing/recommend — Canonical Unit Invariant & Custom Specs", () => {
    it("converts imperial inch input measurements to canonical integer mm (Invariant 4)", async () => {
      const validToken = tokenRegistry.getDemoToken("regular");

      // Custom garment dimensions in inches (unit: "in")
      const req = new NextRequest("http://localhost:3000/api/v1/sizing/recommend", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${validToken}`,
        },
        body: JSON.stringify({
          unit: "in",
          category: "t_shirt",
          fitIntent: "regular",
          garmentDimensions: [
            {
              productId: "custom_inch_tee",
              sizeLabel: "S",
              chestFlatMm: 20.0, // 20.0 inches = 508 mm (doubled = 1016mm circ)
              lengthMm: 27.5,    // 27.5 inches = 699 mm
            },
            {
              productId: "custom_inch_tee",
              sizeLabel: "M",
              chestFlatMm: 21.5, // 21.5 inches = 546 mm (doubled = 1092mm circ)
              lengthMm: 28.5,
            },
            {
              productId: "custom_inch_tee",
              sizeLabel: "L",
              chestFlatMm: 23.0, // 23.0 inches = 584 mm (doubled = 1168mm circ)
              lengthMm: 29.5,
            },
          ],
        }),
      });

      const res = await POST(req);
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.status).toBe("success");
      // Regular profile chest is 980mm.
      // S flat 508mm * 2 = 1016mm (ease +36mm)
      // M flat 546mm * 2 = 1092mm (ease +112mm -> exact regular target midpoint)
      expect(json.data.recommendedSize).toBe("M");
      expect(json.meta.canonicalUnit).toBe("mm");
    });

    it("returns 422 when neither productId nor verified dimensions/charts are provided", async () => {
      const validToken = tokenRegistry.getDemoToken("regular");
      const req = new NextRequest("http://localhost:3000/api/v1/sizing/recommend", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${validToken}`,
        },
        body: JSON.stringify({
          category: "t_shirt",
        }),
      });

      const res = await POST(req);
      expect(res.status).toBe(422);
      const json = await res.json();
      expect(json.type).toContain("missing-sizing-data");
    });

    it("returns 400 when body is not valid JSON", async () => {
      const req = new NextRequest("http://localhost:3000/api/v1/sizing/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "invalid-json-string{",
      });

      const res = await POST(req);
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.type).toContain("invalid-json");
    });
  });

  describe("MANDATORY INVARIANT 7: Zero Biometric Leakage Verification", () => {
    it("TC-SEC-002: strictly asserts ZERO raw biometric keys in API response", async () => {
      const validToken = tokenRegistry.getDemoToken("athletic");
      const product = PILOT_PRODUCTS.find((p) => p.id === "prod_snitch_heavyweight_boxy")!;

      const req = new NextRequest("http://localhost:3000/api/v1/sizing/recommend", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${validToken}`,
        },
        body: JSON.stringify({
          productId: product.id,
        }),
      });

      const res = await POST(req);
      expect(res.status).toBe(200);
      const json = await res.json();

      const rawJsonString = JSON.stringify(json);

      const forbiddenBiometricFields = [
        "chestMm",
        "bustMm",
        "waistMm",
        "hipsMm",
        "shoulderWidthMm",
        "inseamMm",
        "heightMm",
        "weightG",
        "neckMm",
        "footLengthMm",
        "underbustMm",
        "torsoLengthMm",
      ];

      for (const field of forbiddenBiometricFields) {
        expect(rawJsonString).not.toContain(`"${field}"`);
      }

      expect(json.meta.zeroKnowledgeVerified).toBe(true);
    });
  });
});
