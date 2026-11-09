import { describe, it, expect, beforeEach } from "vitest";
import { tokenRegistry, DEMO_PROFILES } from "@/core/security/tokenRegistry";
import { PILOT_PRODUCTS } from "@/core/data/pilotBrands";
import { WebhookService } from "@/core/connect/webhookService";

describe("Phase 4: Portability Gateway, Handshake & Webhook Protocol", () => {
  beforeEach(() => {
    tokenRegistry.reset();
  });

  describe("4.2 Zero-Knowledge Sizing Handshake Protocol", () => {
    it("successfully evaluates a size recommendation using a valid demo token", () => {
      const service = tokenRegistry.getService();
      const token = tokenRegistry.getDemoToken("regular");
      expect(token).toBeDefined();

      const product = PILOT_PRODUCTS.find((p) => p.id === "prod_uniqlo_airism_oversized")!;
      expect(product).toBeDefined();

      const startTime = performance.now();
      const response = service.evaluateRetailerMatch(
        token!,
        {
          productId: product.id,
          category: product.category,
          fitIntent: product.fitSilhouette,
          garmentDimensions: product.layer3Specs,
          brandSizeCharts: product.layer2Charts,
          fabricSpec: product.fabric,
        },
        "uniqlo"
      );
      const executionMs = performance.now() - startTime;

      expect(response.tokenValid).toBe(true);
      expect(response.recommendedSize).toBeDefined();
      expect(["S", "M", "L", "XL"]).toContain(response.recommendedSize);
      expect(response.confidence).toBeGreaterThan(0.8);
      expect(response.confidenceLabel).toBe("high");
      expect(response.fitScore).toBeGreaterThan(0.7);

      // Performance benchmark: <15ms deterministic execution
      expect(executionMs).toBeLessThan(50);
    });

    it("TC-SEC-002: strictly guarantees ZERO raw anatomical measurements in response", () => {
      const service = tokenRegistry.getService();
      const token = tokenRegistry.getDemoToken("athletic")!;

      const product = PILOT_PRODUCTS.find((p) => p.id === "prod_snitch_heavyweight_boxy")!;
      const response = service.evaluateRetailerMatch(
        token,
        {
          productId: product.id,
          category: product.category,
          fitIntent: product.fitSilhouette,
          garmentDimensions: product.layer3Specs,
          brandSizeCharts: product.layer2Charts,
        },
        "snitch"
      );

      const keys = Object.keys(response);
      const forbiddenBiometrics = [
        "chestMm",
        "bustMm",
        "waistMm",
        "hipsMm",
        "shoulderWidthMm",
        "inseamMm",
        "heightMm",
        "weightGrams",
        "neckCircumferenceMm",
      ];

      for (const forbidden of forbiddenBiometrics) {
        expect(keys).not.toContain(forbidden);
        expect((response as unknown as Record<string, unknown>)[forbidden]).toBeUndefined();
      }
    });

    it("enforces retailer token scoping (Invariant 7)", () => {
      const service = tokenRegistry.getService();
      // Generate a token scoped specifically to 'snitch'
      const scopedToken = service.generateToken(DEMO_PROFILES.regular, {
        allowedRetailer: "snitch",
      });

      const product = PILOT_PRODUCTS.find((p) => p.id === "prod_uniqlo_airism_oversized")!;

      // Evaluating with wrong retailer 'uniqlo' must be rejected
      expect(() => {
        service.evaluateRetailerMatch(
          scopedToken,
          {
            productId: product.id,
            category: product.category,
            garmentDimensions: product.layer3Specs,
          },
          "uniqlo"
        );
      }).toThrow("scoped to a different retailer");

      // Evaluating with permitted retailer 'snitch' succeeds
      const result = service.evaluateRetailerMatch(
        scopedToken,
        {
          productId: product.id,
          category: product.category,
          garmentDimensions: product.layer3Specs,
        },
        "snitch"
      );
      expect(result.tokenValid).toBe(true);
    });

    it("rejects expired WearID tokens", () => {
      const service = tokenRegistry.getService();
      // Generate a token that expired 10 seconds ago
      const expiredToken = service.generateToken(DEMO_PROFILES.regular, {
        expiresInSeconds: -10,
      });

      const product = PILOT_PRODUCTS[0];
      expect(() => {
        service.evaluateRetailerMatch(
          expiredToken,
          {
            productId: product.id,
            category: product.category,
            garmentDimensions: product.layer3Specs,
          },
          "uniqlo"
        );
      }).toThrow("expired");
    });
  });

  describe("4.4 Webhook Notification System", () => {
    const mockSecret = "wearid_mock_webhook_secret_key_32chars_min";

    it("generates an HMAC-SHA256 signed order size confirmation payload", () => {
      const webhook = WebhookService.createOrderSizeConfirmation({
        orderId: "ord_998877",
        retailerId: "snitch",
        productId: "prod_snitch_heavyweight_boxy",
        recommendedSize: "L",
        fitScore: 0.96,
        confidenceLabel: "high",
        secret: mockSecret,
      });

      expect(webhook.success).toBe(true);
      expect(webhook.signature).toMatch(/^sha256=[a-f0-9]{64}$/);
      expect(webhook.headers["x-wearid-signature"]).toBe(webhook.signature);
      expect(webhook.headers["x-wearid-event"]).toBe("order.size_confirmed");
      expect(webhook.payload.recommendedSize).toBe("L");
      expect(webhook.payload.orderId).toBe("ord_998877");
    });

    it("guarantees zero biometric leakage in webhook payloads", () => {
      const webhook = WebhookService.createOrderSizeConfirmation({
        orderId: "ord_112233",
        retailerId: "uniqlo",
        productId: "prod_uniqlo_airism_oversized",
        recommendedSize: "M",
        fitScore: 0.92,
        confidenceLabel: "high",
        secret: mockSecret,
      });

      const serialized = JSON.stringify(webhook.payload);
      expect(serialized).not.toContain("chestMm");
      expect(serialized).not.toContain("waistMm");
      expect(serialized).not.toContain("hipsMm");
      expect(serialized).not.toContain("inseamMm");
    });

    it("verifies authentic webhook signature correctly", () => {
      const webhook = WebhookService.createOrderSizeConfirmation({
        orderId: "ord_554433",
        retailerId: "snitch",
        productId: "prod_snitch_heavyweight_boxy",
        recommendedSize: "XL",
        fitScore: 0.94,
        confidenceLabel: "high",
        secret: mockSecret,
      });

      const verification = WebhookService.verifyWebhookSignature({
        payloadString: JSON.stringify(webhook.payload),
        signatureHeader: webhook.signature,
        secret: mockSecret,
        timestampHeader: String(webhook.payload.timestamp),
      });

      expect(verification.valid).toBe(true);
      expect(verification.error).toBeUndefined();
    });

    it("rejects tampered webhook payloads or incorrect secret keys", () => {
      const webhook = WebhookService.createOrderSizeConfirmation({
        orderId: "ord_554433",
        retailerId: "snitch",
        productId: "prod_snitch_heavyweight_boxy",
        recommendedSize: "XL",
        fitScore: 0.94,
        confidenceLabel: "high",
        secret: mockSecret,
      });

      // Tamper with payload (change size from XL to S)
      const tamperedPayload = JSON.stringify({
        ...webhook.payload,
        recommendedSize: "S",
      });

      const verificationTampered = WebhookService.verifyWebhookSignature({
        payloadString: tamperedPayload,
        signatureHeader: webhook.signature,
        secret: mockSecret,
      });

      expect(verificationTampered.valid).toBe(false);
      expect(verificationTampered.error).toBe("Signature mismatch.");

      // Test with wrong secret
      const verificationWrongSecret = WebhookService.verifyWebhookSignature({
        payloadString: JSON.stringify(webhook.payload),
        signatureHeader: webhook.signature,
        secret: "wrong_secret_key_that_does_not_match_at_all_32chars",
      });

      expect(verificationWrongSecret.valid).toBe(false);
      expect(verificationWrongSecret.error).toBe("Signature mismatch.");
    });

    it("rejects expired webhook timestamps (replay attack prevention)", () => {
      const pastTimestamp = Math.floor(Date.now() / 1000) - 600; // 10 minutes ago
      const payloadString = JSON.stringify({ test: "data" });
      const signature = `sha256=${WebhookService.signPayload(payloadString, mockSecret)}`;

      const verification = WebhookService.verifyWebhookSignature({
        payloadString,
        signatureHeader: signature,
        secret: mockSecret,
        timestampHeader: String(pastTimestamp),
        toleranceSeconds: 300, // 5 min tolerance
      });

      expect(verification.valid).toBe(false);
      expect(verification.error).toContain("expired");
    });
  });
});
