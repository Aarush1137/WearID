import { describe, it, expect, beforeEach } from "vitest";
import { GET, POST, PublicFitReportDTO } from "@/app/api/fit/share/[token]/route";
import { tokenRegistry, DEMO_PROFILES } from "@/core/security/tokenRegistry";
import { NextRequest } from "next/server";

describe("Share a Fit Report Link Suite (Milestone 6 Feature 2 & Invariant 7)", () => {
  beforeEach(() => {
    tokenRegistry.reset();
  });

  describe("Token Generation via POST", () => {
    it("generates a time-bound shareable sizing token", async () => {
      const req = new NextRequest("http://localhost:3000/api/fit/share/generate", {
        method: "POST",
        body: JSON.stringify({
          profile: DEMO_PROFILES.regular,
          expiresInSeconds: 3600,
        }),
      });

      const res = await POST(req);
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.token).toMatch(/^wearid_tok_[a-f0-9]{32}$/);
      expect(json.shareUrl).toBe(`/fit/${json.token}`);
    });
  });

  describe("Public Fit Report Resolution via GET", () => {
    it("resolves demo token shortcut (wearid_demo_regular) successfully", async () => {
      const req = new NextRequest("http://localhost:3000/api/fit/share/wearid_demo_regular");
      const res = await GET(req, { params: Promise.resolve({ token: "wearid_demo_regular" }) });

      expect(res.status).toBe(200);
      const report: PublicFitReportDTO = await res.json();

      expect(report.title).toBe("WearID Sovereign Fit Passport");
      expect(report.privacyVerified).toBe(true);
      expect(report.categories.length).toBeGreaterThan(0);

      const tShirtCat = report.categories.find((c) => c.category === "t_shirt");
      expect(tShirtCat).toBeDefined();
      expect(tShirtCat?.recommendedSize).toBeDefined();
      expect(["high", "medium", "low"]).toContain(tShirtCat?.fitConfidence);
      expect(tShirtCat?.fitScorePct).toBeGreaterThan(0);
    });

    it("resolves freshly generated token and provides multi-category size recommendations", async () => {
      const service = tokenRegistry.getService();
      const token = service.generateToken(DEMO_PROFILES.athletic, { expiresInSeconds: 7200 });

      const req = new NextRequest(`http://localhost:3000/api/fit/share/${token}`);
      const res = await GET(req, { params: Promise.resolve({ token }) });

      expect(res.status).toBe(200);
      const report: PublicFitReportDTO = await res.json();

      expect(report.token).toBe(token);
      expect(report.categories.length).toBeGreaterThanOrEqual(3);

      for (const cat of report.categories) {
        expect(cat.recommendedSize).toBeTruthy();
        expect(cat.easeDescription).toBeTruthy();
        expect(cat.testedGarments.length).toBeGreaterThan(0);
      }
    });

    it("returns 404 for invalid or non-existent token", async () => {
      const req = new NextRequest("http://localhost:3000/api/fit/share/wearid_tok_invalid12345");
      const res = await GET(req, { params: Promise.resolve({ token: "wearid_tok_invalid12345" }) });

      expect(res.status).toBe(404);
      const json = await res.json();
      expect(json.error).toContain("invalid or has expired");
    });
  });

  describe("MANDATORY PRIVACY INVARIANT (Invariant 7 & TC-SEC-002)", () => {
    it("guarantees ZERO raw biometric measurements exist in the public report payload", async () => {
      const req = new NextRequest("http://localhost:3000/api/fit/share/wearid_demo_athletic");
      const res = await GET(req, { params: Promise.resolve({ token: "wearid_demo_athletic" }) });

      const report = await res.json();
      const serialized = JSON.stringify(report);

      const forbiddenBiometricKeys = [
        "chestMm",
        "bustMm",
        "waistMm",
        "hipsMm",
        "shoulderWidthMm",
        "inseamMm",
        "heightMm",
        "neckMm",
        "footLengthMm",
        "weightG",
        "sleeveLengthMm",
      ];

      for (const key of forbiddenBiometricKeys) {
        expect(serialized).not.toContain(`"${key}"`);
      }
    });
  });
});
