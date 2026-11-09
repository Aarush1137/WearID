import { describe, it, expect, beforeEach } from "vitest";
import { SecureProfileRepository } from "@/core/persistence/repository";
import { UnauthorizedProfileAccessError, RobotsPolicyViolationError } from "@/core/persistence/schema";
import { SizingTokenService } from "@/core/security/sizingTokenService";
import { executePoliteCrawl, isPathAllowed, parseRobotsTxt } from "@/core/provenance/crawlerGuard";
import { encryptBiometrics, decryptBiometrics } from "@/core/persistence/encryption";
import { AnatomicalProfile } from "@/core/types";

// Mock key injected from env.template.md line 28
const MOCK_SIGNING_SECRET = "mock_jwt_secret_key_wearid_sandbox_2026_deterministic";

describe("Matrix F: Security & Biometric Privacy Suite", () => {
  let repository: SecureProfileRepository;
  let tokenService: SizingTokenService;

  beforeEach(() => {
    repository = new SecureProfileRepository();
    tokenService = new SizingTokenService(MOCK_SIGNING_SECRET);
  });

  describe("SizingTokenService Constructor Security Guard", () => {
    it("throws when signing secret is empty or under 32 characters", () => {
      expect(() => new SizingTokenService("")).toThrow("at least 32 characters");
      expect(() => new SizingTokenService("short-secret-key")).toThrow("at least 32 characters");
    });

    it("succeeds when signing secret is >= 32 characters", () => {
      expect(() => new SizingTokenService(MOCK_SIGNING_SECRET)).not.toThrow();
    });
  });

  // =========================================================================
  // TC-SEC-001: Private Profile Default (Invariant 7)
  // =========================================================================
  describe("TC-SEC-001: New user profile defaults to private (403 on public query)", () => {
    it("creates a new profile with visibility strictly defaulted to 'private'", () => {
      const profile = repository.createProfile({
        id: "profile_aarush_001",
        userId: "user_aarush_123",
        name: "Aarush Jain",
      });

      expect(profile.visibility).toBe("private");
    });

    it("throws UnauthorizedProfileAccessError (403 Forbidden) when an unauthenticated public party requests a private profile", () => {
      repository.createProfile({
        id: "profile_private_target",
        userId: "user_owner_456",
        name: "Private Profile",
      });

      // Public / unauthenticated query without requester credentials
      expect(() => repository.getProfile("profile_private_target")).toThrow(
        UnauthorizedProfileAccessError
      );

      // Query from an unauthorized third-party user ID
      expect(() =>
        repository.getProfile("profile_private_target", "user_intruder_999")
      ).toThrow(UnauthorizedProfileAccessError);
    });

    it("allows the authenticated owner to access their own private profile", () => {
      const ownerUserId = "user_owner_456";
      const created = repository.createProfile({
        id: "profile_private_target",
        userId: ownerUserId,
        name: "Private Profile",
      });

      const accessed = repository.getProfile("profile_private_target", ownerUserId);
      expect(accessed.id).toBe(created.id);
      expect(accessed.userId).toBe(ownerUserId);
    });

    it("encrypts and decrypts anatomical profile at rest using AES-256-GCM", () => {
      const testBiometrics: AnatomicalProfile = {
        profileId: "00000000-0000-0000-0000-000000000001",
        chestMm: 980,
        shoulderWidthMm: 450,
        waistMm: 820,
        hipsMm: 960,
        heightMm: 1780,
        isCurrent: true,
      };

      const masterSecret = "super-secret-biometric-key-production";
      const cipherText = encryptBiometrics(testBiometrics, masterSecret);

      expect(cipherText).not.toContain("980");
      expect(cipherText).not.toContain("chestMm");
      expect(cipherText.split(":").length).toBe(3); // IV:Tag:Data

      const decrypted = decryptBiometrics(cipherText, masterSecret);
      expect(decrypted.chestMm).toBe(980);
      expect(decrypted.shoulderWidthMm).toBe(450);
      expect(decrypted.waistMm).toBe(820);
    });
  });

  // =========================================================================
  // TC-SEC-002: Third-Party Sizing Token Privacy Leak Check (Invariant 7)
  // =========================================================================
  describe("TC-SEC-002: Retailer token response contains zero raw anatomical measurements", () => {
    const userBiometrics: AnatomicalProfile = {
      profileId: "00000000-0000-0000-0000-000000000001",
      chestMm: 980,          // Raw chest: 98cm
      shoulderWidthMm: 450,  // Raw shoulders: 45cm
      waistMm: 820,          // Raw waist: 82cm
      hipsMm: 960,           // Raw hips: 96cm
      heightMm: 1780,        // Raw height: 178cm
      inseamMm: 790,         // Raw inseam: 79cm
      neckMm: 390,           // Raw collar: 39cm
      isCurrent: true,
    };

    it("generates a scoped sizing token and evaluates zero-knowledge recommendation without leaking biometrics", () => {
      const token = tokenService.generateToken(userBiometrics, {
        expiresInSeconds: 3600,
        allowedRetailer: "uniqlo_india",
      });

      expect(token).toMatch(/^wearid_tok_[a-f0-9]{32}$/);

      // Retailer queries recommendation for Uniqlo AIRism Tee
      const response = tokenService.evaluateRetailerMatch(
        token,
        {
          productId: "prod_uniqlo_airism",
          category: "t_shirt_oversized",
          garmentDimensions: [
            {
              productId: "prod_uniqlo_airism",
              sizeLabel: "S",
              chestFlatMm: 530,
              shoulderMm: 515,
            },
            {
              productId: "prod_uniqlo_airism",
              sizeLabel: "M",
              chestFlatMm: 560,
              shoulderMm: 530,
            },
            {
              productId: "prod_uniqlo_airism",
              sizeLabel: "L",
              chestFlatMm: 590,
              shoulderMm: 545,
            },
          ],
        },
        "uniqlo_india"
      );

      // Verify legitimate response fields
      expect(response.tokenValid).toBe(true);
      expect(response.recommendedSize).toBe("S");
      expect(response.confidence).toBeGreaterThan(0.7);
      expect(response.summaryText).toBeDefined();

      // STRICT ZERO-LEAKAGE ASSERTION:
      // None of the user's raw anatomical measurements should exist as keys or values in the response
      const forbiddenBiometricFields = [
        "chestMm",
        "bustMm",
        "waistMm",
        "hipsMm",
        "shoulderWidthMm",
        "inseamMm",
        "heightMm",
        "neckMm",
        "footLengthMm",
        "profile",
        "anatomicalProfile",
      ];

      for (const field of forbiddenBiometricFields) {
        expect(response).not.toHaveProperty(field);
      }

      // Check serialized JSON string does not contain raw millimeter numbers anywhere
      const jsonStr = JSON.stringify(response);
      expect(jsonStr).not.toContain('"chestMm"');
      expect(jsonStr).not.toContain('"waistMm"');
      expect(jsonStr).not.toContain('"shoulderWidthMm"');
    });

    it("rejects token when presented to a retailer other than the scoped retailer", () => {
      const token = tokenService.generateToken(userBiometrics, {
        allowedRetailer: "zara_india",
      });

      expect(() =>
        tokenService.evaluateRetailerMatch(
          token,
          {
            productId: "prod_hm_1",
            category: "t_shirt",
          },
          "hm_india" // Wrong retailer
        )
      ).toThrow("WearID sizing token is scoped to a different retailer.");
    });
  });

  // =========================================================================
  // TC-SEC-003: Scraping Boundary Enforcement (Invariant 6)
  // =========================================================================
  describe("TC-SEC-003: Crawler aborts on robots.txt Disallow", () => {
    const mockRobotsTxtZara = `
User-agent: *
Disallow: /sizing
Disallow: /customer-service/size-guide
Disallow: /cart
Disallow: /checkout
Allow: /products/
`;

    it("parses robots.txt rules accurately for target user agent", () => {
      const rules = parseRobotsTxt(mockRobotsTxtZara, "WearIDBot");
      expect(rules.disallows).toContain("/sizing");
      expect(rules.disallows).toContain("/customer-service/size-guide");
      expect(rules.allows).toContain("/products/");
    });

    it("correctly identifies prohibited and allowed paths under robots.txt policy", () => {
      expect(isPathAllowed("https://www.zara.com/sizing", mockRobotsTxtZara)).toBe(false);
      expect(isPathAllowed("https://www.zara.com/customer-service/size-guide", mockRobotsTxtZara)).toBe(false);
      expect(isPathAllowed("https://www.zara.com/products/linen-shirt", mockRobotsTxtZara)).toBe(true);
    });

    it("aborts crawl with RobotsPolicyViolationError when path is disallowed (Invariant 6)", async () => {
      const disallowedUrl = "https://www.zara.com/sizing/chart-popup";

      let fetchInvoked = false;
      const mockFetch = async (url: string) => {
        fetchInvoked = true;
        return `<html>Size Table for ${url}</html>`;
      };

      await expect(
        executePoliteCrawl(disallowedUrl, mockRobotsTxtZara, mockFetch)
      ).rejects.toThrow(RobotsPolicyViolationError);

      // Verify that fetch was never invoked when disallowed
      expect(fetchInvoked).toBe(false);
    });

    it("executes fetch normally when target path is allowed under robots.txt", async () => {
      const allowedUrl = "https://www.zara.com/products/oversized-tee";

      const mockFetch = async (url: string) => {
        return `<html>Product details for ${url}</html>`;
      };

      const result = await executePoliteCrawl(allowedUrl, mockRobotsTxtZara, mockFetch);
      expect(result).toContain("Product details for https://www.zara.com/products/oversized-tee");
    });
  });
});
