import { NextResponse } from "next/server";
import { sendOtp, OtpProviderType } from "@/lib/auth/otpProviders";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { target, provider, channel } = body;

    if (!target || typeof target !== "string") {
      return NextResponse.json(
        {
          error: "INVALID_REQUEST",
          message: "Please provide a valid 'target' (phone number or email).",
        },
        { status: 400 }
      );
    }

    const cleanTarget = target.trim();
    if (cleanTarget.length < 5) {
      return NextResponse.json(
        {
          error: "INVALID_FORMAT",
          message: "Target format is invalid.",
        },
        { status: 400 }
      );
    }

    const result = await sendOtp(cleanTarget, {
      provider: provider as OtpProviderType,
      channel,
    });

    if (!result.success) {
      const status = result.error === "RATE_LIMITED" ? 429 : 500;
      return NextResponse.json(result, { status });
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: "INTERNAL_SERVER_ERROR",
        message: error?.message || "An unexpected error occurred.",
      },
      { status: 500 }
    );
  }
}
