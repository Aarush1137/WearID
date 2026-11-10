import { describe, it, expect, beforeEach } from "vitest";
import {
  generateSecureOtp,
  sendOtp,
  verifyOtp,
  clearOtpStore,
} from "@/lib/auth/otpProviders";

describe("Free OTP Providers & Authentication Service", () => {
  beforeEach(() => {
    clearOtpStore();
  });

  describe("OTP Code Generator", () => {
    it("generates a 6-digit numeric string between 100000 and 999999", () => {
      for (let i = 0; i < 50; i++) {
        const otp = generateSecureOtp();
        expect(otp).toHaveLength(6);
        expect(/^\d{6}$/.test(otp)).toBe(true);
        const num = parseInt(otp, 10);
        expect(num).toBeGreaterThanOrEqual(100000);
        expect(num).toBeLessThanOrEqual(999999);
      }
    });
  });

  describe("sendOtp()", () => {
    it("dispatches OTP in mock mode with sandbox credentials", async () => {
      const res = await sendOtp("+919876543210", { provider: "mock" });
      expect(res.success).toBe(true);
      expect(res.provider).toBe("mock");
      expect(res.channel).toBe("sms");
      expect(res.expiresInSeconds).toBe(300);
      expect(res.devOtpCode).toBeDefined();
      expect(res.devOtpCode).toHaveLength(6);
    });

    it("enforces a 60-second cooldown rate limit on resends", async () => {
      const first = await sendOtp("+919876543210", { provider: "mock" });
      expect(first.success).toBe(true);

      const second = await sendOtp("+919876543210", { provider: "mock" });
      expect(second.success).toBe(false);
      expect(second.error).toBe("RATE_LIMITED");
      expect(second.message).toContain("Please wait");
    });

    it("handles WhatsApp provider in development mode gracefully", async () => {
      const res = await sendOtp("+919876543210", { provider: "whatsapp", channel: "whatsapp" });
      expect(res.success).toBe(true);
      expect(res.channel).toBe("whatsapp");
      expect(res.devOtpCode).toBeDefined();
    });

    it("handles 2Factor Indian gateway provider in dev mode gracefully", async () => {
      const res = await sendOtp("+919876543210", { provider: "twofactor" });
      expect(res.success).toBe(true);
      expect(res.channel).toBe("sms");
      expect(res.devOtpCode).toBeDefined();
    });
  });

  describe("verifyOtp()", () => {
    it("successfully verifies when the correct code is supplied", async () => {
      const sendRes = await sendOtp("+919876543210", { provider: "mock" });
      const code = sendRes.devOtpCode!;

      const verifyRes = await verifyOtp("+919876543210", code);
      expect(verifyRes.valid).toBe(true);
      expect(verifyRes.message).toBe("Code verified successfully.");

      // Code is consumed: secondary verification must fail
      const replay = await verifyOtp("+919876543210", code);
      expect(replay.valid).toBe(false);
      expect(replay.error).toBe("EXPIRED_OR_NOT_FOUND");
    });

    it("rejects an incorrect code and returns remaining attempts", async () => {
      await sendOtp("+919876543210", { provider: "mock" });

      const wrong = await verifyOtp("+919876543210", "000000");
      expect(wrong.valid).toBe(false);
      expect(wrong.error).toBe("MISMATCH");
      expect(wrong.message).toContain("attempt");
    });

    it("rejects invalid length inputs immediately", async () => {
      const short = await verifyOtp("+919876543210", "123");
      expect(short.valid).toBe(false);
      expect(short.error).toBe("INVALID_LENGTH");
    });

    it("invalidates code after maximum failed attempts", async () => {
      await sendOtp("+919876543210", { provider: "mock" });

      // Fail 6 times
      for (let i = 0; i < 5; i++) {
        await verifyOtp("+919876543210", "111111");
      }

      const lockedOut = await verifyOtp("+919876543210", "111111");
      expect(lockedOut.valid).toBe(false);
      expect(lockedOut.error).toBe("TOO_MANY_ATTEMPTS");
    });
  });
});
