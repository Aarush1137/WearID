import { NextRequest, NextResponse } from "next/server";
import { tokenRegistry } from "@/core/security/tokenRegistry";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.json({ error: "Token query parameter is required." }, { status: 400 });
  }

  try {
    const demoAthletic = tokenRegistry.getDemoToken("athletic");
    const demoRegular = tokenRegistry.getDemoToken("regular");
    const demoSlim = tokenRegistry.getDemoToken("slim");

    let isDemo = false;
    let demoKey = "";

    if (token === demoAthletic) {
      isDemo = true;
      demoKey = "athletic";
    } else if (token === demoRegular) {
      isDemo = true;
      demoKey = "regular";
    } else if (token === demoSlim) {
      isDemo = true;
      demoKey = "slim";
    }

    return NextResponse.json({
      valid: true,
      tokenId: token,
      isDemo,
      demoKey: demoKey || undefined,
      protocolVersion: "wearid-connect/1.0",
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Verification failed";
    return NextResponse.json({ valid: false, error: message }, { status: 400 });
  }
}
