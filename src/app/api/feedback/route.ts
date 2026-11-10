import { NextResponse } from "next/server";
import crypto from "crypto";

interface FeedbackPayload {
  category: "sizing_accuracy" | "missing_brand" | "shoe_sizing" | "bug_report" | "general_ux";
  rating?: number;
  message: string;
  emailOrPhone?: string;
  brandName?: string;
  profileId?: string;
}

// In-memory feedback store for dev/testing
const feedbackLog: Array<FeedbackPayload & { id: string; submittedAt: string }> = [];

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as Partial<FeedbackPayload>;
    const { category, message, emailOrPhone, rating, brandName, profileId } = body;

    if (!message || message.trim().length < 5) {
      return NextResponse.json(
        {
          error: "INVALID_FEEDBACK",
          message: "Please provide a feedback description with at least 5 characters.",
        },
        { status: 400 }
      );
    }

    const ticketId = `FB-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;

    const record = {
      id: ticketId,
      category: category || "general_ux",
      message: message.trim(),
      rating: rating ? Math.min(5, Math.max(1, rating)) : undefined,
      emailOrPhone: emailOrPhone ? emailOrPhone.trim() : undefined,
      brandName: brandName ? brandName.trim() : undefined,
      profileId: profileId ? profileId.trim() : undefined,
      submittedAt: new Date().toISOString(),
    };

    feedbackLog.push(record);

    return NextResponse.json(
      {
        success: true,
        ticketId,
        message: "Thank you for helping us calibrate WearID! Your feedback has been recorded.",
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        error: "INTERNAL_SERVER_ERROR",
        message: error?.message || "Failed to submit feedback.",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  // Return sanitized stats
  return NextResponse.json({
    totalFeedbacks: feedbackLog.length,
    status: "active",
  });
}
