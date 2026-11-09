import { SizingTokenService } from "./sizingTokenService";
import { AnatomicalProfile } from "../types";

// Standard JWT signing secret for sandbox/test/dev environment
const DEFAULT_SIGNING_SECRET =
  process.env.JWT_SECRET || "mock_jwt_secret_key_wearid_sandbox_2026_deterministic";

/**
 * Pre-seeded demo anatomical profiles for sandbox testing and verification
 */
export const DEMO_PROFILES: Record<string, AnatomicalProfile> = {
  athletic: {
    profileId: "00000000-0000-0000-0000-000000000001",
    chestMm: 1040, // 41" chest
    waistMm: 810,  // 32" waist
    hipsMm: 960,
    inseamMm: 815, // 32" inseam
    shoulderWidthMm: 470,
    sleeveLengthMm: 630,
    neckMm: 400,
    heightMm: 1800,
    weightG: 78000,
    isCurrent: true,
  },
  regular: {
    profileId: "00000000-0000-0000-0000-000000000002",
    chestMm: 980,  // 38.5" chest
    waistMm: 840,  // 33" waist
    hipsMm: 990,
    inseamMm: 790, // 31" inseam
    shoulderWidthMm: 440,
    sleeveLengthMm: 610,
    neckMm: 380,
    heightMm: 1750,
    weightG: 72000,
    isCurrent: true,
  },
  slim: {
    profileId: "00000000-0000-0000-0000-000000000003",
    chestMm: 900,  // 35.4" chest
    waistMm: 740,  // 29" waist
    hipsMm: 890,
    inseamMm: 770, // 30" inseam
    shoulderWidthMm: 410,
    sleeveLengthMm: 590,
    neckMm: 360,
    heightMm: 1720,
    weightG: 61000,
    isCurrent: true,
  },
};

/**
 * Global token service singleton ensuring state persistence across Next.js API requests
 */
class TokenRegistry {
  private service: SizingTokenService;
  private demoTokenMap: Map<string, string> = new Map();

  constructor() {
    this.service = new SizingTokenService(DEFAULT_SIGNING_SECRET);
    this.seedDemoTokens();
  }

  public getService(): SizingTokenService {
    return this.service;
  }

  public seedDemoTokens(): void {
    // Generate long-lived tokens for the demo profiles (valid 365 days)
    const yearInSeconds = 365 * 24 * 3600;

    const athleticToken = this.service.generateToken(DEMO_PROFILES.athletic, {
      expiresInSeconds: yearInSeconds,
    });
    this.demoTokenMap.set("athletic", athleticToken);

    const regularToken = this.service.generateToken(DEMO_PROFILES.regular, {
      expiresInSeconds: yearInSeconds,
    });
    this.demoTokenMap.set("regular", regularToken);

    const slimToken = this.service.generateToken(DEMO_PROFILES.slim, {
      expiresInSeconds: yearInSeconds,
    });
    this.demoTokenMap.set("slim", slimToken);
  }

  public getDemoToken(key: "athletic" | "regular" | "slim"): string | undefined {
    return this.demoTokenMap.get(key);
  }

  public getAllDemoTokens(): { [key: string]: { token: string; profile: AnatomicalProfile } } {
    return {
      athletic: {
        token: this.demoTokenMap.get("athletic") || "",
        profile: DEMO_PROFILES.athletic,
      },
      regular: {
        token: this.demoTokenMap.get("regular") || "",
        profile: DEMO_PROFILES.regular,
      },
      slim: {
        token: this.demoTokenMap.get("slim") || "",
        profile: DEMO_PROFILES.slim,
      },
    };
  }

  public reset(): void {
    this.service.clear();
    this.demoTokenMap.clear();
    this.seedDemoTokens();
  }
}

// Global singleton pattern compatible with Next.js HMR
const globalForTokens = global as unknown as { tokenRegistry?: TokenRegistry };
export const tokenRegistry = globalForTokens.tokenRegistry || new TokenRegistry();
if (process.env.NODE_ENV !== "production") globalForTokens.tokenRegistry = tokenRegistry;
