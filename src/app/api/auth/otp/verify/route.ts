import { NextResponse } from "next/server";
import { verifyOtp } from "@/lib/auth/otpProviders";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { target, code } = body;

    if (!target || !code) {
      return NextResponse.json(
        {
          valid: false,
          error: "MISSING_FIELDS",
          message: "Both 'target' and 'code' are required.",
        },
        { status: 400 }
      );
    }

    const result = await verifyOtp(String(target), String(code));

    if (!result.valid) {
      const status =
        result.error === "TOO_MANY_ATTEMPTS"
          ? 429
          : result.error === "CODE_EXPIRED" || result.error === "EXPIRED_OR_NOT_FOUND"
          ? 410
          : 400;

      return NextResponse.json(result, { status });
    }

    return NextResponse.json(
      {
        valid: true,
        message: result.message,
        verifiedAt: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        valid: false,
        error: "INTERNAL_SERVER_ERROR",
        message: error?.message || "An unexpected error occurred.",
      },
      { status: 500 }
    );
  }
}
