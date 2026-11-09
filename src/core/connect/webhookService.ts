import crypto from "crypto";

export interface OrderSizeConfirmationPayload {
  event: "order.size_confirmed";
  orderId: string;
  retailerId: string;
  productId: string;
  recommendedSize: string;
  fitScore: number;
  confidenceLabel: "high" | "medium" | "low" | "insufficient";
  timestamp: number;
}

export interface WebhookDispatchResult {
  success: boolean;
  signature: string;
  payload: OrderSizeConfirmationPayload;
  headers: Record<string, string>;
}

export class WebhookService {
  /**
   * Computes HMAC-SHA256 signature for a webhook payload string
   */
  public static signPayload(payloadString: string, secret: string): string {
    return crypto.createHmac("sha256", secret).update(payloadString, "utf8").digest("hex");
  }

  /**
   * Constructs an order size confirmation webhook payload with strict biometric exclusion
   */
  public static createOrderSizeConfirmation(params: {
    orderId: string;
    retailerId: string;
    productId: string;
    recommendedSize: string;
    fitScore: number;
    confidenceLabel: "high" | "medium" | "low" | "insufficient";
    secret: string;
  }): WebhookDispatchResult {
    const timestamp = Math.floor(Date.now() / 1000);

    const payload: OrderSizeConfirmationPayload = {
      event: "order.size_confirmed",
      orderId: params.orderId,
      retailerId: params.retailerId,
      productId: params.productId,
      recommendedSize: params.recommendedSize,
      fitScore: params.fitScore,
      confidenceLabel: params.confidenceLabel,
      timestamp,
    };

    // INVARIANT 7 & TC-SEC-002: Ensure zero raw biometric measurements in webhook payload
    const serialized = JSON.stringify(payload);
    const forbiddenBiometricKeys = [
      "chestMm",
      "bustMm",
      "waistMm",
      "hipsMm",
      "shoulderWidthMm",
      "inseamMm",
      "heightMm",
      "neckMm",
    ];

    for (const key of forbiddenBiometricKeys) {
      if (serialized.includes(key)) {
        throw new Error(`CRITICAL INVARIANT VIOLATION: Biometric measurement ${key} detected in webhook payload.`);
      }
    }

    const signature = this.signPayload(serialized, params.secret);

    return {
      success: true,
      signature: `sha256=${signature}`,
      payload,
      headers: {
        "Content-Type": "application/json",
        "x-wearid-signature": `sha256=${signature}`,
        "x-wearid-timestamp": String(timestamp),
        "x-wearid-event": payload.event,
      },
    };
  }

  /**
   * Verifies an incoming webhook signature and timestamp (replay protection)
   */
  public static verifyWebhookSignature(params: {
    payloadString: string;
    signatureHeader: string;
    secret: string;
    timestampHeader?: string;
    toleranceSeconds?: number;
  }): { valid: boolean; error?: string } {
    const { payloadString, signatureHeader, secret, timestampHeader, toleranceSeconds = 300 } = params;

    if (!signatureHeader || !secret) {
      return { valid: false, error: "Missing signature or secret key." };
    }

    // Check timestamp replay protection if provided
    if (timestampHeader) {
      const parsedTime = parseInt(timestampHeader, 10);
      const now = Math.floor(Date.now() / 1000);
      if (isNaN(parsedTime) || Math.abs(now - parsedTime) > toleranceSeconds) {
        return { valid: false, error: "Webhook timestamp expired or out of acceptable window." };
      }
    }

    // Extract signature hex
    const cleanSignature = signatureHeader.startsWith("sha256=")
      ? signatureHeader.slice(7)
      : signatureHeader;

    const expectedSignature = this.signPayload(payloadString, secret);

    try {
      const match = crypto.timingSafeEqual(
        Buffer.from(cleanSignature, "hex"),
        Buffer.from(expectedSignature, "hex")
      );
      return { valid: match, error: match ? undefined : "Signature mismatch." };
    } catch {
      return { valid: false, error: "Malformed signature format." };
    }
  }
}
