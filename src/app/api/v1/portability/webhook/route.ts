import { NextRequest, NextResponse } from "next/server";
import { WebhookService } from "@/core/connect/webhookService";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-wearid-signature") || "";
    const timestamp = req.headers.get("x-wearid-timestamp") || "";
    const secret = process.env.WEARID_WEBHOOK_SECRET || "wearid_mock_webhook_secret_key_32chars_min";

    const verification = WebhookService.verifyWebhookSignature({
      payloadString: rawBody,
      signatureHeader: signature,
      secret,
      timestampHeader: timestamp,
    });

    if (!verification.valid) {
      return NextResponse.json(
        { success: false, error: verification.error || "Invalid webhook signature." },
        { status: 401 }
      );
    }

    const payload = JSON.parse(rawBody);

    return NextResponse.json({
      success: true,
      receivedEvent: payload.event,
      orderId: payload.orderId,
      acknowledgedAt: Math.floor(Date.now() / 1000),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Webhook processing failed";
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
